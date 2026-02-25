const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);

app.get('/', (req, res) => {
    res.send('asad.to Backend API is running correctly.');
});

const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

// Database connection
let db;
async function connectDB() {
    try {
        db = await mysql.createPool({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASS,
            database: process.env.DB_NAME,
            waitForConnections: true,
            connectionLimit: 10,
            queueLimit: 0
        });
        console.log('Connecté à la base de données MySQL');
    } catch (err) {
        console.error('Erreur de connexion MySQL:', err);
    }
}
connectDB();

// In-memory sessions for real-time tracking (non-persistent part)
const onlineVisitors = {};
const onlineAgents = {};

// Bot logic
const botResponses = {
    "prix": "Le service de base asad.to est 100% gratuit à vie ! Nous proposons des options premium pour la personnalisation avancée.",
    "contact": "Vous pouvez nous contacter à support@asad.to ou appeler notre bureau à Bourg-la-Reine.",
    "aide": "Je peux vous aider à configurer votre widget, gérer vos agents ou personnaliser vos réponses automatiques.",
    "bonjour": "Bonjour ! Je suis l'assistant asad.to (Bourg-la-Reine). Comment puis-je vous aider ?",
    "hello": "Hi! I am the asad.to assistant. How can I help you today?"
};

async function handleBotAction(visitorId, text, conversationId) {
    const lowerText = text.toLowerCase();
    let responseText = "";

    for (const key in botResponses) {
        if (lowerText.includes(key)) {
            responseText = botResponses[key];
            break;
        }
    }

    if (responseText) {
        setTimeout(async () => {
            if (conversationId) {
                await db.execute(
                    'INSERT INTO messages (conversation_id, sender_type, content) VALUES (?, ?, ?)',
                    [conversationId, 'bot', responseText]
                );
            }
            io.to(visitorId).emit('agent_message', { text: responseText, fromBot: true });
            io.to('agents_room').emit('visitor_message', { visitorId, text: responseText, fromBot: true });
        }, 1000);
    }
}

// Authentication Endpoints
app.post('/api/signup', async (req, res) => {
    const { name, email, password } = req.body;
    try {
        const [existing] = await db.execute('SELECT id FROM users WHERE email = ?', [email]);
        if (existing.length > 0) return res.status(400).json({ error: 'Email déjà utilisé' });

        const hash = await bcrypt.hash(password, 10);
        await db.execute('INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)', [name, email, hash]);
        res.status(201).json({ message: 'Utilisateur créé' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const [users] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);
        if (users.length === 0) return res.status(401).json({ error: 'Identifiants invalides' });

        const user = users[0];
        const match = await bcrypt.compare(password, user.password_hash);
        if (!match) return res.status(401).json({ error: 'Identifiants invalides' });

        res.json({ id: user.id, name: user.name, email: user.email });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/users/:id', async (req, res) => {
    const { name, email } = req.body;
    const { id } = req.params;

    console.log(`Tentative de mise à jour profil pour ID: ${id}`, req.body);

    if (!id || id === 'undefined') {
        return res.status(400).json({ error: 'ID utilisateur manquant' });
    }

    try {
        const [result] = await db.execute('UPDATE users SET name = ?, email = ? WHERE id = ?', [name, email, id]);
        console.log('Résultat UPDATE:', result);
        res.json({ message: 'Profil mis à jour', name, email });
    } catch (err) {
        console.error('Erreur SQL détaillée:', err);
        if (err.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ error: 'Cet email est déjà utilisé' });
        }
        res.status(500).json({ error: 'Erreur lors de la mise à jour' });
    }
});

// Conversations & Messages Endpoints
app.get('/api/conversations', async (req, res) => {
    try {
        const [convs] = await db.execute(`
            SELECT c.*, m.content as last_message, m.created_at as last_message_time
            FROM conversations c
            LEFT JOIN (
                SELECT conversation_id, content, created_at
                FROM messages
                WHERE id IN (SELECT MAX(id) FROM messages GROUP BY conversation_id)
            ) m ON c.id = m.conversation_id
            ORDER BY m.created_at DESC
        `);
        res.json(convs);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/conversations/:id/messages', async (req, res) => {
    try {
        const [messages] = await db.execute(
            'SELECT sender_type as sender, content as text, created_at as timestamp FROM messages WHERE conversation_id = ? ORDER BY created_at ASC',
            [req.params.id]
        );
        res.json(messages);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Socket logic
io.on('connection', (socket) => {
    socket.on('register_visitor', async (data) => {
        onlineVisitors[socket.id] = { ...data, socketId: socket.id };
        socket.join(data.visitorId);

        let [convs] = await db.execute('SELECT id FROM conversations WHERE visitor_id = ? AND status = "open"', [data.visitorId]);
        let conversationId;

        if (convs.length === 0) {
            const [result] = await db.execute('INSERT INTO conversations (visitor_id) VALUES (?)', [data.visitorId]);
            conversationId = result.insertId;
        } else {
            conversationId = convs[0].id;
        }

        socket.conversationId = conversationId;

        const [history] = await db.execute('SELECT sender_type as sender, content as text, created_at as timestamp FROM messages WHERE conversation_id = ? ORDER BY created_at ASC', [conversationId]);
        socket.emit('chat_history', history);

        io.to('agents_room').emit('visitor_list', Object.values(onlineVisitors));
    });

    socket.on('register_agent', (data) => {
        onlineAgents[socket.id] = data;
        socket.join('agents_room');
        socket.emit('visitor_list', Object.values(onlineVisitors));
    });

    socket.on('visitor_message', async (data) => {
        const visitor = onlineVisitors[socket.id];
        if (visitor) {
            await db.execute(
                'INSERT INTO messages (conversation_id, sender_type, content) VALUES (?, ?, ?)',
                [socket.conversationId, 'visitor', data.text]
            );

            io.to('agents_room').emit('visitor_message', {
                visitorId: visitor.visitorId,
                text: data.text,
                timestamp: Date.now()
            });

            handleBotAction(visitor.visitorId, data.text, socket.conversationId);
        }
    });

    socket.on('agent_message', async (data) => {
        let [convs] = await db.execute('SELECT id FROM conversations WHERE visitor_id = ? AND status = "open"', [data.visitorId]);
        if (convs.length > 0) {
            await db.execute(
                'INSERT INTO messages (conversation_id, sender_type, content) VALUES (?, ?, ?)',
                [convs[0].id, 'agent', data.text]
            );
        }

        io.to(data.visitorId).emit('agent_message', {
            text: data.text,
            timestamp: Date.now()
        });
    });

    socket.on('typing', (data) => {
        if (data.isAgent) {
            io.to(data.visitorId).emit('typing', { isAgent: true });
        } else {
            io.to('agents_room').emit('typing', { visitorId: data.visitorId });
        }
    });

    socket.on('disconnect', () => {
        delete onlineVisitors[socket.id];
        delete onlineAgents[socket.id];
        io.to('agents_room').emit('visitor_list', Object.values(onlineVisitors));
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Serveur en cours d'exécution sur le port ${PORT}`);
});
