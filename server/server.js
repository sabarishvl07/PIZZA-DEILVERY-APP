require('dotenv').config();
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const connectDB = require('./config/db');

// Initialize app
const app = express();
const server = http.createServer(app);

// Allow any localhost origin in development
const corsOrigin = (origin, callback) => {
  // Allow requests with no origin (mobile apps, curl, etc.)
  if (!origin) return callback(null, true);
  // Allow any localhost port
  if (origin.startsWith('http://localhost') || origin === process.env.FRONTEND_URL) {
    return callback(null, true);
  }
  callback(new Error('Not allowed by CORS'));
};

// Socket.io Setup
const io = socketIo(server, {
  cors: {
    origin: corsOrigin,
    methods: ['GET', 'POST', 'PATCH'],
    credentials: true
  }
});

// Connect Database
connectDB();

// Middleware
app.use(cors({
  origin: corsOrigin,
  credentials: true
}));
app.use(express.json());

// Socket.io Connection Logic
io.on('connection', (socket) => {
  console.log(`New client connected: ${socket.id}`);

  // Join Room for specific user tracking or admin dashboard
  socket.on('join', (userId) => {
    socket.join(userId);
    console.log(`Socket ${socket.id} joined room: ${userId}`);
  });

  socket.on('disconnect', () => {
    console.log(`Client disconnected: ${socket.id}`);
  });
});

// Store io instance on app for use in routes
app.set('io', io);

// Route Middleware Registrations
app.use('/api/auth', require('./routes/auth'));
app.use('/api/pizzas', require('./routes/pizza'));
app.use('/api/payment', require('./routes/payment'));
app.use('/api/orders', require('./routes/order'));
app.use('/api/admin', require('./routes/admin'));

// Basic route
app.get('/api/ping', (req, res) => {
  res.json({ message: 'pizza delivery api is running...' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal Server Error' });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
