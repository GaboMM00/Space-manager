const Database = require('better-sqlite3');
const path = require('path');

const userDataPath = 'c:\\Users\\gaalm\\AppData\\Roaming\\space-manager';
const dbPath = path.join(userDataPath, 'analytics.db');

console.log('Database path:', dbPath);

try {
  const db = new Database(dbPath, { readonly: true });

  // Check triggers
  const triggers = db.prepare(`
    SELECT name, sql FROM sqlite_master
    WHERE type='trigger'
    ORDER BY name
  `).all();

  console.log('\n=== TRIGGERS ===');
  console.log('Total triggers:', triggers.length);
  triggers.forEach((trigger, i) => {
    console.log(`\n${i + 1}. ${trigger.name}`);
    console.log(trigger.sql);
  });

  // Check daily_metrics count
  const dailyCount = db.prepare('SELECT COUNT(*) as count FROM daily_metrics').get();
  console.log('\n=== DAILY METRICS ===');
  console.log('Total rows:', dailyCount.count);

  // Check execution_logs with completed_at
  const completedLogs = db.prepare(`
    SELECT COUNT(*) as count
    FROM execution_logs
    WHERE completed_at IS NOT NULL
  `).get();
  console.log('\n=== EXECUTION LOGS ===');
  console.log('Total completed executions:', completedLogs.count);

  // Test trigger manually
  console.log('\n=== MANUAL TRIGGER TEST ===');
  const testLog = db.prepare(`
    SELECT id, space_id, started_at, completed_at, duration_ms, success
    FROM execution_logs
    WHERE completed_at IS NOT NULL
    ORDER BY id DESC
    LIMIT 1
  `).get();

  if (testLog) {
    console.log('Last completed execution:');
    console.log({
      id: testLog.id,
      space_id: testLog.space_id,
      started_at: new Date(testLog.started_at).toISOString(),
      completed_at: new Date(testLog.completed_at).toISOString(),
      duration_ms: testLog.duration_ms,
      success: testLog.success
    });

    // Check if this execution created a daily_metric
    const dateInt = parseInt(
      new Date(testLog.started_at).toISOString().substring(0, 10).replace(/-/g, '')
    );
    console.log('\nExpected date in daily_metrics:', dateInt);

    const dailyMetric = db.prepare(`
      SELECT * FROM daily_metrics
      WHERE space_id = ? AND date = ?
    `).get(testLog.space_id, dateInt);

    console.log('Daily metric exists:', dailyMetric ? 'YES' : 'NO');
    if (dailyMetric) {
      console.log(dailyMetric);
    }
  }

  db.close();
} catch (error) {
  console.error('Error:', error.message);
  console.error(error.stack);
}
