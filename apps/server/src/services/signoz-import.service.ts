import fs from 'fs';
import path from 'path';
import { spawnSync } from 'child_process';

/**
 * Auto-imports SigNoz dashboard and alert rules into the local SigNoz PostgreSQL metastore container.
 * This step runs on server startup, is idempotent (skips if already present),
 * and fails gracefully if SigNoz is not running or reachable.
 */
export async function autoImportSigNozAssets(): Promise<void> {
  let container = '';
  try {
    const res = spawnSync('docker', ['ps', '--format', '{{.Names}}'], { encoding: 'utf8' });
    if (res.error || res.status !== 0) {
      console.log('[SigNoz Auto-Import] Docker CLI not available. Skipping dashboard/alert auto-import.');
      return;
    }
    const names = (res.stdout || '').split('\n').filter(Boolean);
    const match = names.find((n) => n.includes('postgres'));
    if (!match) {
      console.log(
        '[SigNoz Auto-Import] SigNoz postgres container not detected. ' +
          'Skipping dashboard/alert auto-import (this is expected if SigNoz has not been started via Foundry yet).'
      );
      return;
    }
    container = match;
  } catch (err: any) {
    console.log(`[SigNoz Auto-Import] Container check skipped: ${err?.message || err}`);
    return;
  }

  const runSql = (sql: string) => {
    return spawnSync('docker', ['exec', '-i', container, 'psql', '-t', '-A', '-U', 'signoz', '-d', 'signoz', '-c', sql], {
      encoding: 'utf8',
    });
  };

  const runSqlInput = (sql: string) => {
    return spawnSync('docker', ['exec', '-i', container, 'psql', '-U', 'signoz', '-d', 'signoz', '-f', '-'], {
      input: sql,
      encoding: 'utf8',
    });
  };

  // Dynamic UUID fetch
  let orgId = '';
  let userId = '';
  try {
    const orgRes = runSql('SELECT id FROM organizations LIMIT 1;');
    const userRes = runSql('SELECT id FROM users LIMIT 1;');
    orgId = (orgRes.stdout || '').trim();
    userId = (userRes.stdout || '').trim();

    if (!orgId || !userId) {
      console.log(
        '[SigNoz Auto-Import] No organization or user found in SigNoz database. ' +
          'Complete initial account setup at http://localhost:8080 first.'
      );
      return;
    }
  } catch (err: any) {
    console.warn('[SigNoz Auto-Import] Failed to query SigNoz org/user:', err?.message || err);
    return;
  }

  // Resolve deploy directory (handles both src/ inside container and repo root)
  const candidateDirs = [
    path.resolve(__dirname, '../../../../deploy'),
    path.resolve(__dirname, '../../../deploy'),
    path.resolve(process.cwd(), 'deploy'),
    path.resolve(process.cwd(), '../deploy'),
  ];
  const deployDir = candidateDirs.find((d) => fs.existsSync(d));

  if (!deployDir) {
    console.log('[SigNoz Auto-Import] Deploy directory not found. Skipping auto-import.');
    return;
  }

  const dashPath = path.join(deployDir, 'dashboards', 'axray-groq-dashboard.json');
  const alertsPath = path.join(deployDir, 'alerts', 'axray-alert-rules.json');

  // Check if dashboard already exists
  const dashCheck = runSql(`SELECT COUNT(*) FROM dashboard WHERE name = 'Groq';`);
  const dashCount = parseInt((dashCheck.stdout || '0').trim(), 10);

  // Check if alerts already exist
  const ruleCheck = runSql(`SELECT COUNT(*) FROM rule WHERE deleted = 0;`);
  const ruleCount = parseInt((ruleCheck.stdout || '0').trim(), 10);

  if (dashCount > 0 && ruleCount >= 14) {
    console.log('[SigNoz Auto-Import] SigNoz dashboard and alert rules already attached, skipping.');
    return;
  }

  // Import Dashboard if missing
  if (dashCount === 0 && fs.existsSync(dashPath)) {
    const dashRaw = fs.readFileSync(dashPath, 'utf8');
    const dashObj = JSON.parse(dashRaw);
    const dashId = dashObj.uuid || '019f8c7f-8a3e-7da3-b699-5f73064d5825';
    const dashName = dashObj.title || 'Groq';

    const dashSql = `
INSERT INTO dashboard (id, created_at, updated_at, created_by, updated_by, data, locked, org_id, source, name)
VALUES ('${dashId}', NOW(), NOW(), '${userId}', '${userId}', '${dashRaw.replace(/'/g, "''")}', false, '${orgId}', 'json', '${dashName.replace(/'/g, "''")}')
ON CONFLICT (id) DO UPDATE SET data = EXCLUDED.data, updated_at = NOW(), name = EXCLUDED.name;
`;
    const dashRes = runSqlInput(dashSql);
    if (dashRes.status === 0) {
      console.log(`[SigNoz Auto-Import] ✅ Imported dashboard "${dashName}".`);
    }
  }

  // Import Alerts if missing
  if (ruleCount < 14 && fs.existsSync(alertsPath)) {
    const rules = JSON.parse(fs.readFileSync(alertsPath, 'utf8'));
    let imported = 0;

    for (const rule of rules) {
      const ruleId = rule.id;
      const ruleName = rule.alert || 'Unnamed Alert';
      const ruleRaw = JSON.stringify(rule);

      const ruleSql = `
INSERT INTO rule (id, created_at, updated_at, created_by, updated_by, deleted, data, org_id)
VALUES ('${ruleId}', NOW(), NOW(), '${userId}', '${userId}', 0, '${ruleRaw.replace(/'/g, "''")}', '${orgId}')
ON CONFLICT (id) DO UPDATE SET data = EXCLUDED.data, updated_at = NOW(), deleted = 0;
`;
      const ruleRes = runSqlInput(ruleSql);
      if (ruleRes.status === 0) imported++;
    }
    console.log(`[SigNoz Auto-Import] ✅ Attached ${imported}/${rules.length} alert rules to SigNoz.`);
  }
}
