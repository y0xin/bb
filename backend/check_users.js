const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '.tmp', 'data.db');
const db = new Database(dbPath);

try {
  const users = db.prepare('SELECT username, email FROM up_users').all();
  console.log('Users found in up_users table:');
  console.log(JSON.stringify(users, null, 2));
} catch (err) {
  console.error('Error querying up_users:', err.message);
}

try {
  const adminUsers = db.prepare('SELECT username, email FROM admin_users').all();
  console.log('Users found in admin_users table:');
  console.log(JSON.stringify(adminUsers, null, 2));
} catch (err) {
  console.error('Error querying admin_users:', err.message);
}

db.close();
