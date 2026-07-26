const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

// Auto-detect the SigNoz postgres container name instead of hardcoding it.
function findPostgresContainer() {
  const res = spawnSync('docker', ['ps', '--format', '{{.Names}}'], { encoding: 'utf8' });
  const names = (res.stdout || '').split('\n').filter(Boolean);
  const match = names.find((n) => n.includes('postgres'));
  if (!match) {
    throw new Error(
      `Could not find a running postgres container. Containers seen: ${names.join(', ') || '(none)'}. ` +
      `Make sure SigNoz is up (foundryctl cast) before running this script.`
    );
  }
  return match;
}

function runSql(container, sql) {
  // -t (tuples-only), -A (unaligned) to get clean raw output without headers
  return spawnSync('docker', ['exec', '-i', container, 'psql', '-t', '-A', '-U', 'signoz', '-d', 'signoz', '-c', sql], {
    encoding: 'utf8',
  });
}

function runSqlInput(container, sql) {
  return spawnSync('docker', ['exec', '-i', container, 'psql', '-U', 'signoz', '-d', 'signoz', '-f', '-'], {
    input: sql,
    encoding: 'utf8',
  });
}

// Fetch the real org_id and user_id dynamically from SigNoz metastore
function getOrgAndUser(container) {
  const orgRes = runSql(container, 'SELECT id FROM organizations LIMIT 1;');
  const userRes = runSql(container, 'SELECT id FROM users LIMIT 1;');

  if (orgRes.status !== 0 || userRes.status !== 0) {
    throw new Error(`Could not read org/user from SigNoz's database:\nOrg Error: ${orgRes.stderr}\nUser Error: ${userRes.stderr}`);
  }

  const orgId = orgRes.stdout.trim();
  const userId = userRes.stdout.trim();

  if (!orgId || !userId) {
    throw new Error(
      `No organization or user found in SigNoz database. ` +
      `Please complete SigNoz initial account setup at http://localhost:8080 BEFORE running this import script.`
    );
  }

  return { orgId, userId };
}

async function main() {
  console.log('=== AXRAY SigNoz Local Attachment Script ===\n');

  const container = findPostgresContainer();
  console.log(`✅ Using postgres container: ${container}`);

  console.log('🔄 Fetching Organization and User UUIDs dynamically...');
  const { orgId, userId } = getOrgAndUser(container);
  console.log(`✅ Found organization: ${orgId}`);
  console.log(`✅ Found user:         ${userId}`);

  // 1. Dashboard Import
  const dashPath = path.join(__dirname, 'dashboards', 'axray-groq-dashboard.json');
  if (fs.existsSync(dashPath)) {
    console.log('\n📊 Importing dashboard...');
    const dashRaw = fs.readFileSync(dashPath, 'utf8');
    const dashObj = JSON.parse(dashRaw);
    const dashId = dashObj.uuid || '019f8c7f-8a3e-7da3-b699-5f73064d5825';
    const dashName = dashObj.title || 'Groq';

    const dashSql = `
INSERT INTO dashboard (id, created_at, updated_at, created_by, updated_by, data, locked, org_id, source, name)
VALUES ('${dashId}', NOW(), NOW(), '${userId}', '${userId}', '${dashRaw.replace(/'/g, "''")}', false, '${orgId}', 'json', '${dashName.replace(/'/g, "''")}')
ON CONFLICT (id) DO UPDATE SET data = EXCLUDED.data, updated_at = NOW(), name = EXCLUDED.name;
`;

    const dashRes = runSqlInput(container, dashSql);
    if (dashRes.status === 0) {
      console.log(`  ✅ Imported dashboard: "${dashName}" (ID: ${dashId})`);
    } else {
      console.error(`  ❌ Failed to import dashboard:`, dashRes.stderr);
    }
  } else {
    console.error(`\n⚠️ Dashboard file not found at ${dashPath}`);
  }

  // 2. Alerts Import
  const alertsPath = path.join(__dirname, 'alerts', 'axray-alert-rules.json');
  if (fs.existsSync(alertsPath)) {
    const rules = JSON.parse(fs.readFileSync(alertsPath, 'utf8'));
    console.log(`\n🚨 Importing ${rules.length} alert rules...`);

    let importedCount = 0;
    for (const rule of rules) {
      const ruleId = rule.id;
      const ruleName = rule.alert || 'Unnamed Alert';
      const ruleRaw = JSON.stringify(rule);

      const ruleSql = `
INSERT INTO rule (id, created_at, updated_at, created_by, updated_by, deleted, data, org_id)
VALUES ('${ruleId}', NOW(), NOW(), '${userId}', '${userId}', 0, '${ruleRaw.replace(/'/g, "''")}', '${orgId}')
ON CONFLICT (id) DO UPDATE SET data = EXCLUDED.data, updated_at = NOW(), deleted = 0;
`;

      const ruleRes = runSqlInput(container, ruleSql);
      if (ruleRes.status === 0) {
        importedCount++;
        console.log(`  ✅ Imported alert: "${ruleName}" (ID: ${ruleId})`);
      } else {
        console.error(`  ❌ Failed to import alert "${ruleName}":`, ruleRes.stderr);
      }
    }

    console.log(`\n✅ Attached ${importedCount}/${rules.length} alert rules to local SigNoz instance.`);
  } else {
    console.error(`\n⚠️ Alerts file not found at ${alertsPath}`);
  }

  // Verification Query
  console.log('\n--- Verifying database entries ---');
  const verifyRes = runSqlInput(
    container,
    `SELECT COUNT(*) as total_dashboards FROM dashboard;\nSELECT COUNT(*) as total_rules FROM rule WHERE deleted = 0;`
  );
  console.log(verifyRes.stdout);

  console.log('✅ Import complete');
}

main().catch((err) => {
  console.error('\n❌ Error attaching to SigNoz:', err.message || err);
  process.exit(1);
});
