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
  return spawnSync('docker', ['exec', '-i', container, 'psql', '-U', 'signoz', '-d', 'signoz', '-f', '-'], {
    input: sql,
    encoding: 'utf8',
  });
}

// Fetch the real org_id and user_id from THIS install instead of hardcoding
// values from the developer's own machine (every fresh SigNoz install
// generates new ones on first signup).
function getOrgAndUser(container) {
  const res = runSql(
    container,
    `SELECT id FROM organizations LIMIT 1; SELECT id FROM users LIMIT 1;`
  );
  if (res.status !== 0) {
    throw new Error(`Could not read org/user from SigNoz's database:\n${res.stderr}`);
  }
  // NOTE: table/column names (organizations vs org, users vs user) vary by
  // SigNoz version -- verify against `\dt` in psql on your own instance and
  // adjust the query above if this errors out.
  const lines = res.stdout.split('\n').map((l) => l.trim()).filter(Boolean);
  console.log('Raw org/user query output (verify manually if parsing looks off):');
  console.log(res.stdout);
  return lines; // left as raw output -- see README note on adapting this per SigNoz version
}

async function main() {
  console.log('=== AXRAY SigNoz Local Attachment Script ===\n');

  const container = findPostgresContainer();
  console.log(`Using postgres container: ${container}`);

  getOrgAndUser(container); // prints what's actually in this instance; adapt IDs below manually if needed

  console.warn(
    '\n[ACTION NEEDED] This script prints your local org_id/user_id above.\n' +
    'Hardcoding IDs from one machine will not work on another -- copy the\n' +
    'printed IDs into the orgId/userId constants below before relying on\n' +
    'the INSERT statements, or better, wire the parsed values in directly.\n'
  );

  const orgId = process.env.SIGNOZ_ORG_ID || '<paste-from-output-above>';
  const userId = process.env.SIGNOZ_USER_ID || '<paste-from-output-above>';

  // 1. Dashboard Import
  const dashPath = path.join(__dirname, 'dashboards', 'axray-groq-dashboard.json');
  if (fs.existsSync(dashPath)) {
    const dashRaw = fs.readFileSync(dashPath, 'utf8');
    const dashObj = JSON.parse(dashRaw);
    const dashId = dashObj.uuid || '019f8c7f-8a3e-7da3-b699-5f73064d5825';
    const dashName = dashObj.title || 'Groq';

    const dashSql = `
INSERT INTO dashboard (id, created_at, updated_at, created_by, updated_by, data, locked, org_id, source, name)
VALUES ('${dashId}', NOW(), NOW(), '${userId}', '${userId}', '${dashRaw.replace(/'/g, "''")}', false, '${orgId}', 'json', '${dashName.replace(/'/g, "''")}')
ON CONFLICT (id) DO UPDATE SET data = EXCLUDED.data, updated_at = NOW(), name = EXCLUDED.name;
`;

    const dashRes = runSql(container, dashSql);
    if (dashRes.status === 0) {
      console.log(`[SUCCESS] Imported dashboard: "${dashName}" (ID: ${dashId})`);
    } else {
      console.error(`[ERROR] Failed to import dashboard:`, dashRes.stderr);
    }
  } else {
    console.error(`[WARN] Dashboard file not found at ${dashPath}`);
  }

  // 2. Alerts Import
  const alertsPath = path.join(__dirname, 'alerts', 'axray-alert-rules.json');
  if (fs.existsSync(alertsPath)) {
    const rules = JSON.parse(fs.readFileSync(alertsPath, 'utf8'));
    console.log(`\nImporting ${rules.length} alert rules...`);

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

      const ruleRes = runSql(container, ruleSql);
      if (ruleRes.status === 0) {
        importedCount++;
        console.log(`  [ok] Imported alert: "${ruleName}" (ID: ${ruleId})`);
      } else {
        console.error(`  [fail] Failed to import alert "${ruleName}":`, ruleRes.stderr);
      }
    }

    console.log(`\n[SUCCESS] Attached ${importedCount}/${rules.length} alert rules to local SigNoz instance.`);
  } else {
    console.error(`[WARN] Alerts file not found at ${alertsPath}`);
  }

  // Verification Query
  console.log('\n--- Verifying database entries ---');
  const verifyRes = runSql(
    container,
    `SELECT COUNT(*) as total_dashboards FROM dashboard;\nSELECT COUNT(*) as total_rules FROM rule WHERE deleted = false;`
  );
  console.log(verifyRes.stdout);
}

main().catch((err) => {
  console.error('Error attaching to SigNoz:', err.message || err);
  process.exit(1);
});