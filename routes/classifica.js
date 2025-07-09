const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const pool = require('../db');

// GET /api/classifica - visibile solo agli iscritti al torneo
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

    // Query per calcolare la classifica
    const { rows } = await pool.query(`
      SELECT 
        u.id,
        u.nome,
        u.cognome,
        COUNT(i.id) FILTER (
          WHERE (i.partecipante_a_id = u.id OR i.partecipante_b_id = u.id)
          AND i.giocato = true
        ) AS partite_giocate,
        
        COUNT(i.id) FILTER (
          WHERE i.giocato = true
          AND (
            (i.partecipante_a_id = u.id AND i.punti_a > i.punti_b)
            OR
            (i.partecipante_b_id = u.id AND i.punti_b > i.punti_a)
          )
        ) AS vittorie

      FROM utenti u
      LEFT JOIN incontri i ON u.id = i.partecipante_a_id OR u.id = i.partecipante_b_id
      WHERE u.iscritto_al_torneo = true
      GROUP BY u.id, u.nome, u.cognome
      ORDER BY u.cognome, u.nome
    `);

    // Calcola percentuali e ordina secondo le regole
    const classifica = rows.map(p => {
      const vittorie = parseInt(p.vittorie, 10);
      const partiteGiocate = parseInt(p.partite_giocate, 10);
      const percentualeVittorie = partiteGiocate >= 5 
        ? parseFloat(((vittorie / partiteGiocate) * 100).toFixed(2)) 
        : null;

      return {
        id: p.id,
        nome: p.nome,
        cognome: p.cognome,
        partite_giocate: partiteGiocate,
        vittorie: vittorie,
        percentuale_vittorie: percentualeVittorie,
        posizione_valida: partiteGiocate >= 5
      };
    });

    // Ordinamento: prima chi ha giocato almeno 5 partite (per % vittorie desc), poi gli altri
    const classificaOrdinata = [
      ...classifica
        .filter(p => p.posizione_valida)
        .sort((a, b) => b.percentuale_vittorie - a.percentuale_vittorie),
      ...classifica
        .filter(p => !p.posizione_valida)
        .sort((a, b) => b.vittorie - a.vittorie || b.partite_giocate - a.partite_giocate)
    ];

    // Aggiungi la posizione in classifica
    classificaOrdinata.forEach((p, index) => {
      p.posizione = index + 1;
    });

    res.json(classificaOrdinata);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Errore server' });
  }
});

module.exports = router;