const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const pool = require('../db');

// GET /api/partecipanti - accesso solo per iscritti al torneo
router.get('/', auth, async (req, res) => {
  const userId = req.user.id;

  try {
    // Verifica che l'utente sia iscritto al torneo
    const { rows: [utente] } = await pool.query(
      'SELECT iscritto_al_torneo FROM utenti WHERE id = $1',
      [userId]
    );

    if (!utente || !utente.iscritto_al_torneo) {
      return res.status(403).json({ error: 'Accesso negato: non sei iscritto al torneo' });
    }

    // Restituisce la lista dei partecipanti
    const { rows } = await pool.query(
      `SELECT id, nome, cognome, email 
       FROM utenti 
       WHERE iscritto_al_torneo = true 
       ORDER BY cognome, nome`
    );

    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Errore server' });
  }
});

module.exports = router;