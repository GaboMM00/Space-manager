const Database = require('better-sqlite3');
const path = require('path');
const { app } = require('electron');

// Mock app if not in Electron context
if (!app || !app.getPath) {
  const userDataPath = 'c:\\Users\\gaalm\\AppData\\Roaming\\space-manager';
  const dbPath = path.join(userDataPath, 'analytics.db');

  console.log('Database path:', dbPath);

  try {
    const db = new Database(dbPath);

    // Check if tables exist
    const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
    console.log('\nTables:', tables.map(t => t.name));

    // Check execution_logs count
    const count = db.prepare('SELECT COUNT(*) as count FROM execution_logs').get();
    console.log('\nExecution logs count:', count.count);

    // Get last 5 logs
    const logs = db.prepare('SELECT * FROM execution_logs ORDER BY started_at DESC LIMIT 5').all();
    console.log('\nLast 5 execution logs:');
    logs.forEach((log, i) => {
      console.log(`\n${i + 1}.`, {
        id: log.id,
        space_name: log.space_name,
        started_at: new Date(log.started_at).toISOString(),
        success: log.success,
        resources_total: log.resources_total
      });
    });

    db.close();
  } catch (error) {
    console.error('Error:', error.message);
  }
}
