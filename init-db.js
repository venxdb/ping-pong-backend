const pool = require('./db');

const createTables = async () => {
  try {
    console.log('🗄️ Creating database tables...');

    // Drop existing tables (se esistono)
    await pool.query('DROP TABLE IF EXISTS incontri CASCADE');
    await pool.query('DROP TABLE IF EXISTS utenti CASCADE');

    // Create utenti table
    await pool.query(`
      CREATE TABLE utenti (
        id SERIAL PRIMARY KEY,
        nome VARCHAR(100) NOT NULL,
        cognome VARCHAR(100) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        iscritto_al_torneo BOOLEAN DEFAULT false,
        organizzatore_del_torneo BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create incontri table
    await pool.query(`
      CREATE TABLE incontri (
        id SERIAL PRIMARY KEY,
        data DATE NOT NULL,
        partecipante_a_id INTEGER REFERENCES utenti(id) ON DELETE CASCADE,
        partecipante_b_id INTEGER REFERENCES utenti(id) ON DELETE CASCADE,
        giocato BOOLEAN DEFAULT false,
        punti_a INTEGER CHECK (punti_a >= 0),
        punti_b INTEGER CHECK (punti_b >= 0),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT different_players CHECK (partecipante_a_id != partecipante_b_id)
      )
    `);

    // Create indexes
    await pool.query('CREATE INDEX idx_utenti_iscritto ON utenti(iscritto_al_torneo)');
    await pool.query('CREATE INDEX idx_utenti_organizzatore ON utenti(organizzatore_del_torneo)');
    await pool.query('CREATE INDEX idx_incontri_data ON incontri(data)');

    console.log('✅ Database tables created successfully!');
  } catch (error) {
    console.error('❌ Error creating tables:', error);
  } finally {
    process.exit(0);
  }
};

createTables();