const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const pool = require('../db');

// POST /api/torneo/iscriviti
router.post('/iscriviti', auth, async (req, res) => {
  const userId = req.user.id;

  try {
    await pool.query(
      'UPDATE utenti SET iscritto_al_torneo = true WHERE id = $1',
      [userId]
    );
    res.json({ message: 'Iscrizione al torneo avvenuta con successo' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Errore server' });
  }
});

// POST /api/torneo/sono-un-organizzatore
router.post('/sono-un-organizzatore', auth, async (req, res) => {
  const userId = req.user.id;

  try {
    await pool.query(
      'UPDATE utenti SET organizzatore_del_torneo = true WHERE id = $1',
      [userId]
    );
    res.json({ message: 'Ora sei un organizzatore del torneo' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Errore server' });
  }
});

module.exports = router;