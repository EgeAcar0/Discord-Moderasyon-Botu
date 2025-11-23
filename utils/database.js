const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '..', 'moderation.db');
const db = new sqlite3.Database(dbPath);

// Database initialization
function initDatabase() {
    return new Promise((resolve, reject) => {
        db.serialize(() => {
            // Warns table
            db.run(`CREATE TABLE IF NOT EXISTS warns (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                guild_id TEXT NOT NULL,
                user_id TEXT NOT NULL,
                moderator_id TEXT NOT NULL,
                moderator_name TEXT NOT NULL,
                reason TEXT NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(guild_id, user_id, moderator_id, created_at)
            )`, (err) => {
                if (err) return reject(err);
            });

            // Kayit table
            db.run(`CREATE TABLE IF NOT EXISTS kayit (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                guild_id TEXT NOT NULL,
                giris_rol_id TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )`, (err) => {
                if (err) return reject(err);
            });

            // Notes table
            db.run(`CREATE TABLE IF NOT EXISTS notes (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                guild_id TEXT NOT NULL,
                user_id TEXT NOT NULL,
                moderator_id TEXT NOT NULL,
                moderator_name TEXT NOT NULL,
                note TEXT NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )`, (err) => {
                if (err) return reject(err);
            });

            // Kayit log table
            db.run(`CREATE TABLE IF NOT EXISTS kayitlog (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                guild_id TEXT NOT NULL,
                user_id TEXT NOT NULL,
                user_name TEXT NOT NULL,
                moderator_id TEXT NOT NULL,
                moderator_name TEXT NOT NULL,
                action TEXT NOT NULL,
                old_name TEXT,
                new_name TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )`, (err) => {
                if (err) return reject(err);
                resolve();
            });
        });
    });
}

// Warn functions
async function addWarn(guildId, userId, moderatorId, moderatorName, reason) {
    return new Promise((resolve, reject) => {
        const stmt = db.prepare('INSERT INTO warns (guild_id, user_id, moderator_id, moderator_name, reason) VALUES (?, ?, ?, ?, ?)');
        stmt.run([guildId, userId, moderatorId, moderatorName, reason], function(err) {
            if (err) reject(err);
            else resolve(this.lastID);
        });
        stmt.finalize();
    });
}

async function getWarns(guildId, userId) {
    return new Promise((resolve, reject) => {
        db.all('SELECT * FROM warns WHERE guild_id = ? AND user_id = ? ORDER BY created_at DESC', [guildId, userId], (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
        });
    });
}

async function removeWarn(guildId, userId, warnId) {
    return new Promise((resolve, reject) => {
        db.run('DELETE FROM warns WHERE guild_id = ? AND user_id = ? AND id = ?', [guildId, userId, warnId], function(err) {
            if (err) reject(err);
            else resolve(this.changes);
        });
    });
}

async function getWarnCount(guildId, userId) {
    return new Promise((resolve, reject) => {
        db.get('SELECT COUNT(*) as count FROM warns WHERE guild_id = ? AND user_id = ?', [guildId, userId], (err, row) => {
            if (err) reject(err);
            else resolve(row.count);
        });
    });
}

// Kayit functions
async function setKayit(guildId, girisRolId) {
    return new Promise((resolve, reject) => {
        db.run('INSERT OR REPLACE INTO kayit (guild_id, giris_rol_id) VALUES (?, ?)', [guildId, girisRolId], function(err) {
            if (err) reject(err);
            else resolve(this.lastID);
        });
    });
}

async function getKayit(guildId) {
    return new Promise((resolve, reject) => {
        db.get('SELECT * FROM kayit WHERE guild_id = ?', [guildId], (err, row) => {
            if (err) reject(err);
            else resolve(row || {});
        });
    });
}

// Notes functions
async function addNote(guildId, userId, moderatorId, moderatorName, note) {
    return new Promise((resolve, reject) => {
        const stmt = db.prepare('INSERT INTO notes (guild_id, user_id, moderator_id, moderator_name, note) VALUES (?, ?, ?, ?, ?)');
        stmt.run([guildId, userId, moderatorId, moderatorName, note], function(err) {
            if (err) reject(err);
            else resolve(this.lastID);
        });
        stmt.finalize();
    });
}

async function getNotes(guildId, userId) {
    return new Promise((resolve, reject) => {
        db.all('SELECT * FROM notes WHERE guild_id = ? AND user_id = ? ORDER BY created_at DESC', [guildId, userId], (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
        });
    });
}

// Kayit log functions
async function addKayitLog(guildId, userId, userName, moderatorId, moderatorName, action, oldName, newName) {
    return new Promise((resolve, reject) => {
        const stmt = db.prepare('INSERT INTO kayitlog (guild_id, user_id, user_name, moderator_id, moderator_name, action, old_name, new_name) VALUES (?, ?, ?, ?, ?, ?, ?, ?)');
        stmt.run([guildId, userId, userName, moderatorId, moderatorName, action, oldName, newName], function(err) {
            if (err) reject(err);
            else resolve(this.lastID);
        });
        stmt.finalize();
    });
}

async function getKayitLogs(guildId, limit = 50) {
    return new Promise((resolve, reject) => {
        db.all('SELECT * FROM kayitlog WHERE guild_id = ? ORDER BY created_at DESC LIMIT ?', [guildId, limit], (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
        });
    });
}

// Close database
function closeDatabase() {
    db.close();
}

module.exports = {
    initDatabase,
    addWarn,
    getWarns,
    removeWarn,
    getWarnCount,
    setKayit,
    getKayit,
    addNote,
    getNotes,
    addKayitLog,
    getKayitLogs,
    closeDatabase
};
