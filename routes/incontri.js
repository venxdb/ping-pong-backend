const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const pool = require('../db');
const { validatePingPongScore } = require('../utils/pingPongValidation');

// GET /api/incontri - accesso solo per iscritti al torneo
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

    // Restituisce la lista degli incontri con i nomi dei partecipanti
    const { rows } = await pool.query(`
      SELECT 
        i.id,
        i.data,
        i.giocato,
        i.punti_a,
        i.punti_b,
        ua.nome as nome_a,
        ua.cognome as cognome_a,
        ub.nome as nome_b,
        ub.cognome as cognome_b,
        i.partecipante_a_id,
        i.partecipante_b_id
      FROM incontri i
      JOIN utenti ua ON i.partecipante_a_id = ua.id
      JOIN utenti ub ON i.partecipante_b_id = ub.id
      ORDER BY i.data, i.id
    `);

    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Errore server' });
  }
});

// POST /api/incontri - crea incontro, solo per organizzatori
router.post('/', auth, async (req, res) => {
  const userId = req.user.id;

  try {
    // Verifica che l'utente sia organizzatore
    const { rows: [utente] } = await pool.query(
      'SELECT organizzatore_del_torneo FROM utenti WHERE id = $1',
      [userId]
    );

    if (!utente || !utente.organizzatore_del_torneo) {
      return res.status(403).json({ error: 'Accesso negato: non sei un organizzatore' });
    }

    const { partecipante_a_id, partecipante_b_id, data } = req.body;

    // Validazione dati
    if (!partecipante_a_id || !partecipante_b_id || !data) {
      return res.status(400).json({ error: 'Tutti i campi sono obbligatori' });
    }

    if (partecipante_a_id === partecipante_b_id) {
      return res.status(400).json({ error: 'I partecipanti devono essere diversi' });
    }

    // Verifica che entrambi i partecipanti siano iscritti al torneo
    const { rows: partecipanti } = await pool.query(
      'SELECT id FROM utenti WHERE id IN ($1, $2) AND iscritto_al_torneo = true',
      [partecipante_a_id, partecipante_b_id]
    );

    if (partecipanti.length !== 2) {
      return res.status(400).json({ error: 'Entrambi i partecipanti devono essere iscritti al torneo' });
    }

    // Crea l'incontro
    const { rows: [incontro] } = await pool.query(
      `INSERT INTO incontri (partecipante_a_id, partecipante_b_id, data)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [partecipante_a_id, partecipante_b_id, data]
    );

    res.status(201).json(incontro);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Errore server' });
  }
});

// PUT /api/incontri/:id - aggiorna incontro, solo per organizzatori
router.put('/:id', auth, async (req, res) => {
  const userId = req.user.id;
  const incontroId = req.params.id;

  try {
    // Verifica che l'utente sia organizzatore
    const { rows: [utente] } = await pool.query(
      'SELECT organizzatore_del_torneo FROM utenti WHERE id = $1',
      [userId]
    );

    if (!utente || !utente.organizzatore_del_torneo) {
      return res.status(403).json({ error: 'Accesso negato: non sei un organizzatore' });
    }

    const { punti_a, punti_b, data } = req.body;

    // Se vengono forniti i punti, valida secondo le regole del ping-pong
    if (punti_a !== undefined && punti_b !== undefined) {
      const validation = validatePingPongScore(punti_a, punti_b);
      if (!validation.valid) {
        return res.status(400).json({ error: validation.message });
      }
    }

    // Aggiorna l'incontro
    const { rows: [incontro] } = await pool.query(
      `UPDATE incontri 
       SET punti_a = $1, punti_b = $2, data = $3, giocato = $4, updated_at = CURRENT_TIMESTAMP
       WHERE id = $5
       RETURNING *`,
      [
        punti_a, 
        punti_b, 
        data, 
        (punti_a !== undefined && punti_b !== undefined), // giocato = true se ci sono i punti
        incontroId
      ]
    );

    if (!incontro) {
      return res.status(404).json({ error: 'Incontro non trovato' });
    }

    res.json(incontro);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Errore server' });
  }
});

// DELETE /api/incontri/:id - elimina incontro, solo per organizzatori
router.delete('/:id', auth, async (req, res) => {
  const userId = req.user.id;
  const incontroId = req.params.id;

  try {
    // Verifica che l'utente sia organizzatore
    const { rows: [utente] } = await pool.query(
      'SELECT organizzatore_del_torneo FROM utenti WHERE id = $1',
      [userId]
    );

    if (!utente || !utente.organizzatore_del_torneo) {
      return res.status(403).json({ error: 'Accesso negato: non sei un organizzatore' });
    }

    // Elimina l'incontro
    const { rowCount } = await pool.query(
      'DELETE FROM incontri WHERE id = $1',
      [incontroId]
    );

    if (rowCount === 0) {
      return res.status(404).json({ error: 'Incontro non trovato' });
    }

    res.json({ message: 'Incontro eliminato con successo' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Errore server' });
  }
});

module.exports = router;