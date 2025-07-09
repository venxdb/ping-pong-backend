require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 5000;

// Middleware - ORDINE IMPORTANTE!
// 1. CORS prima di tutto
app.use(cors({
  origin: function (origin, callback) {
    // Permette qualsiasi origin per ora
    callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// 2. Express JSON middleware per processare req.body
app.use(express.json());

// 3. Debug middleware (opzionale)
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

// Routes
const utentiRoutes = require('./routes/utenti');
const torneoRoutes = require('./routes/torneo');
const partecipantiRoutes = require('./routes/partecipanti');
const incontriRoutes = require('./routes/incontri');
const classificaRoutes = require('./routes/classifica');

app.use('/api/utenti', utentiRoutes);
app.use('/api/torneo', torneoRoutes);
app.use('/api/partecipanti', partecipantiRoutes);
app.use('/api/incontri', incontriRoutes);
app.use('/api/classifica', classificaRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    version: '1.0.2'
  });
});

// Default route
app.get('/', (req, res) => {
  res.json({ 
    message: 'API Ping-Pong Tournament - FIXED', 
    version: '1.0.2',
    endpoints: [
      '/api/utenti/register',
      '/api/utenti/login',
      '/api/torneo/iscriviti',
      '/api/torneo/sono-un-organizzatore',
      '/api/partecipanti',
      '/api/incontri',
      '/api/classifica'
    ]
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// 404 handler
app.use('*', (req, res) => {
  console.log(`404 - Route not found: ${req.method} ${req.path}`);
  res.status(404).json({ error: `Route ${req.method} ${req.path} not found` });
});

app.listen(port, () => {
  console.log(`🚀 Server running on port ${port}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔧 Express JSON middleware: ENABLED`);
});