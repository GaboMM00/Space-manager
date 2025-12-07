const Database = require('better-sqlite3');
const path = require('path');

const userDataPath = 'c:\\Users\\gaalm\\AppData\\Roaming\\space-manager';
const dbPath = path.join(userDataPath, 'analytics.db');

console.log('Database path:', dbPath);

try {
  const db = new Database(dbPath, { readonly: true });

  // Check execution_logs
  const execLogs = db.prepare('SELECT COUNT(*) as count FROM execution_logs').get();
  console.log('\nExecution logs total:', execLogs.count);

  if (execLogs.count > 0) {
    const recentLogs = db.prepare(`
      SELECT id, space_id, space_name, started_at, completed_at, success
      FROM execution_logs
      ORDER BY started_at DESC
      LIMIT 5
    `).all();
    console.log('\nRecent execution logs:');
    recentLogs.forEach((log, i) => {
      console.log(`${i + 1}.`, {
        id: log.id,
        space_id: log.space_id,
        space_name: log.space_name,
        started_at: new Date(log.started_at).toISOString(),
        completed_at: log.completed_at ? new Date(log.completed_at).toISOString() : null,
        success: log.success
      });
    });
  }

  // Check daily_metrics
  const dailyMetrics = db.prepare('SELECT COUNT(*) as count FROM daily_metrics').get();
  console.log('\nDaily metrics total:', dailyMetrics.count);

  if (dailyMetrics.count > 0) {
    const metrics = db.prepare(`
      SELECT *
      FROM daily_metrics
      ORDER BY date DESC
      LIMIT 10
    `).all();
    console.log('\nRecent daily metrics:');
    metrics.forEach((metric, i) => {
      console.log(`${i + 1}.`, {
        date: metric.date,
        space_id: metric.space_id,
        execution_count: metric.execution_count,
        success_count: metric.success_count,
        failure_count: metric.failure_count
      });
    });
  }

  db.close();
} catch (error) {
  console.error('Error:', error.message);
}
