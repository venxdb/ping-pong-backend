require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 5000;

// Middleware
// CORS aggiornato con tutti gli URL Vercel
app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://ping-pong-frontend.vercel.app',
    'https://ping-pong-frontend-git-master-micheles-projects-bb62ac7b.vercel.app',
    'https://ping-pong-frontend-fsvd410zu-micheles-projects-bb62ac7b.vercel.app',
    /ping-pong-frontend.*\.vercel\.app$/,  // Regex per tutti i tuoi deployment
    /micheles-projects-bb62ac7b\.vercel\.app$/  // Regex per il tuo account
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

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
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Default route
app.get('/', (req, res) => {
  res.json({ 
    message: 'API Ping-Pong Tournament', 
    version: '1.0.0',
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
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.listen(port, () => {
  console.log(`🚀 Server running on port ${port}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
});