const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

const PORT = process.env.DASHBOARD_PORT || 3001;

// Middleware
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

// Database connection
let db;
async function initializeDashboard() {
    return new Promise((resolve, reject) => {
        const dbPath = path.join(__dirname, '..', 'moderation.db');
        db = new sqlite3.Database(dbPath, (err) => {
            if (err) {
                console.error('❌ Dashboard database connection failed:', err);
                reject(err);
            } else {
                console.log('✅ Dashboard database connected');
                resolve(db);
            }
        });
    });
}

// API Routes
app.get('/api/stats', async (req, res) => {
    try {
        if (!db) {
            return res.status(500).json({ error: 'Database not connected' });
        }

        // Get basic stats
        const totalWarns = await new Promise((resolve, reject) => {
            db.get('SELECT COUNT(*) as count FROM warns', (err, row) => {
                if (err) reject(err);
                else resolve(row.count);
            });
        });

        const totalUsers = await new Promise((resolve, reject) => {
            db.get('SELECT COUNT(DISTINCT user_id) as count FROM warns', (err, row) => {
                if (err) reject(err);
                else resolve(row.count);
            });
        });

        const recentWarns = await new Promise((resolve, reject) => {
            db.all('SELECT * FROM warns ORDER BY created_at DESC LIMIT 10', (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });

        res.json({
            totalWarns,
            totalUsers,
            recentWarns,
            uptime: process.uptime(),
            memory: process.memoryUsage(),
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Stats API error:', error);
        res.status(500).json({ error: 'Failed to fetch stats' });
    }
});

app.get('/api/warnings', async (req, res) => {
    try {
        if (!db) {
            return res.status(500).json({ error: 'Database not connected' });
        }

        const guildId = req.query.guildId;
        if (!guildId) {
            return res.status(400).json({ error: 'Guild ID required' });
        }

        const warns = await new Promise((resolve, reject) => {
            db.all('SELECT * FROM warns WHERE guild_id = ? ORDER BY created_at DESC', [guildId], (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });

        res.json(warns);
    } catch (error) {
        console.error('Warnings API error:', error);
        res.status(500).json({ error: 'Failed to fetch warnings' });
    }
});

app.get('/api/health', (req, res) => {
    res.json({
        status: 'healthy',
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        timestamp: new Date().toISOString()
    });
});

// WebSocket connections
io.on('connection', (socket) => {
    console.log('🔌 Dashboard client connected:', socket.id);

    // Send initial data
    socket.emit('connected', {
        message: 'Dashboard connected successfully',
        timestamp: new Date().toISOString()
    });

    // Handle disconnection
    socket.on('disconnect', () => {
        console.log('🔌 Dashboard client disconnected:', socket.id);
    });

    // Handle real-time stats request
    socket.on('requestStats', async () => {
        try {
            if (!db) {
                socket.emit('statsError', { error: 'Database not connected' });
                return;
            }

            const totalWarns = await new Promise((resolve, reject) => {
                db.get('SELECT COUNT(*) as count FROM warns', (err, row) => {
                    if (err) reject(err);
                    else resolve(row.count);
                });
            });

            const memory = process.memoryUsage();
            const uptime = process.uptime();

            socket.emit('statsUpdate', {
                totalWarns,
                memory,
                uptime,
                timestamp: new Date().toISOString()
            });
        } catch (error) {
            console.error('WebSocket stats error:', error);
            socket.emit('statsError', { error: 'Failed to fetch stats' });
        }
    });
});

// Serve the main dashboard page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start server
async function startDashboard() {
    await initializeDashboard();
    
    server.listen(PORT, () => {
        console.log(`🌐 Dashboard server running on http://localhost:${PORT}`);
    });
}

// Handle graceful shutdown
process.on('SIGINT', () => {
    console.log('🛑 Shutting down dashboard server...');
    server.close(() => {
        if (db) {
            db.close();
        }
        process.exit(0);
    });
});

startDashboard().catch(console.error);

module.exports = { app, io };
