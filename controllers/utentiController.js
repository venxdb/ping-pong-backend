const pool = require('../db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.register = async (req, res) => {
  const { nome, cognome, email, password } = req.body;

  if (!nome || !cognome || !email || !password)
    return res.status(400).json({ error: 'Tutti i campi sono obbligatori' });

  try {
    const esiste = await pool.query('SELECT * FROM utenti WHERE email = $1', [email]);
    if (esiste.rows.length > 0)
      return res.status(400).json({ error: 'Email già registrata' });

    const hashedPassword = await bcrypt.hash(password, 10);

    const nuovoUtente = await pool.query(
      `INSERT INTO utenti (nome, cognome, email, password) 
       VALUES ($1, $2, $3, $4) RETURNING id, nome, cognome, email, iscritto_al_torneo, organizzatore_del_torneo`,
      [nome, cognome, email, hashedPassword]
    );

    res.status(201).json(nuovoUtente.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Errore server' });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password)
    return res.status(400).json({ error: 'Email e password obbligatorie' });

  try {
    const utente = await pool.query('SELECT * FROM utenti WHERE email = $1', [email]);
    if (utente.rows.length === 0)
      return res.status(401).json({ error: 'Credenziali non valide' });

    const valido = await bcrypt.compare(password, utente.rows[0].password);
    if (!valido)
      return res.status(401).json({ error: 'Credenziali non valide' });

    const token = jwt.sign(
      { id: utente.rows[0].id, email: utente.rows[0].email },
      process.env.JWT_SECRET,
      { expiresIn: '2h' }
    );

    res.json({ 
      token,
      user: {
        id: utente.rows[0].id,
        nome: utente.rows[0].nome,
        cognome: utente.rows[0].cognome,
        email: utente.rows[0].email,
        iscritto_al_torneo: utente.rows[0].iscritto_al_torneo,
        organizzatore_del_torneo: utente.rows[0].organizzatore_del_torneo
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Errore server' });
  }
};

exports.getUserInfo = async (req, res) => {
  const userId = req.params.id;

  if (parseInt(userId) !== req.user.id) {
    return res.status(403).json({ error: "Accesso non autorizzato" });
  }

  try {
    const { rows } = await pool.query(
      `SELECT id, nome, cognome, email, iscritto_al_torneo, organizzatore_del_torneo
       FROM utenti
       WHERE id = $1`,
      [userId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Utente non trovato' });
    }

    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Errore server" });
  }
};