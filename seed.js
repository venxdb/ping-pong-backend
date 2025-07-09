const pool = require('./db');
const bcrypt = require('bcryptjs');

const seedDatabase = async () => {
  try {
    console.log('🌱 Iniziando il seeding del database...');

    // Pulisci tabelle esistenti
    await pool.query('DELETE FROM incontri');
    await pool.query('DELETE FROM utenti');
    await pool.query('ALTER SEQUENCE utenti_id_seq RESTART WITH 1');
    await pool.query('ALTER SEQUENCE incontri_id_seq RESTART WITH 1');

    // Password hash comune per tutti gli utenti (password: "password123")
    const hashedPassword = await bcrypt.hash('password123', 10);

    // Dati utenti fittizi
    const utenti = [
      // Organizzatori
      {
        nome: 'Mario',
        cognome: 'Rossi',
        email: 'mario.rossi@azienda.com',
        iscritto: true,
        organizzatore: true
      },
      {
        nome: 'Laura',
        cognome: 'Bianchi',
        email: 'laura.bianchi@azienda.com',
        iscritto: true,
        organizzatore: true
      },
      
      // Partecipanti iscritti
      {
        nome: 'Giuseppe',
        cognome: 'Verdi',
        email: 'giuseppe.verdi@azienda.com',
        iscritto: true,
        organizzatore: false
      },
      {
        nome: 'Anna',
        cognome: 'Neri',
        email: 'anna.neri@azienda.com',
        iscritto: true,
        organizzatore: false
      },
      {
        nome: 'Francesco',
        cognome: 'Gialli',
        email: 'francesco.gialli@azienda.com',
        iscritto: true,
        organizzatore: false
      },
      {
        nome: 'Giulia',
        cognome: 'Blu',
        email: 'giulia.blu@azienda.com',
        iscritto: true,
        organizzatore: false
      },
      {
        nome: 'Marco',
        cognome: 'Viola',
        email: 'marco.viola@azienda.com',
        iscritto: true,
        organizzatore: false
      },
      {
        nome: 'Chiara',
        cognome: 'Rosa',
        email: 'chiara.rosa@azienda.com',
        iscritto: true,
        organizzatore: false
      },
      {
        nome: 'Davide',
        cognome: 'Grigi',
        email: 'davide.grigi@azienda.com',
        iscritto: true,
        organizzatore: false
      },
      {
        nome: 'Elena',
        cognome: 'Marroni',
        email: 'elena.marroni@azienda.com',
        iscritto: true,
        organizzatore: false
      },
      
      // Utenti non iscritti
      {
        nome: 'Andrea',
        cognome: 'Arancioni',
        email: 'andrea.arancioni@azienda.com',
        iscritto: false,
        organizzatore: false
      },
      {
        nome: 'Federica',
        cognome: 'Celesti',
        email: 'federica.celesti@azienda.com',
        iscritto: false,
        organizzatore: false
      }
    ];

    // Inserisci utenti
    console.log('👥 Inserendo utenti...');
    for (const utente of utenti) {
      await pool.query(
        `INSERT INTO utenti (nome, cognome, email, password, iscritto_al_torneo, organizzatore_del_torneo) 
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [utente.nome, utente.cognome, utente.email, hashedPassword, utente.iscritto, utente.organizzatore]
      );
    }

    // Prendi gli ID degli utenti iscritti
    const { rows: utentiIscritti } = await pool.query(
      'SELECT id, nome, cognome FROM utenti WHERE iscritto_al_torneo = true'
    );

    console.log('⚔️ Creando incontri...');
    
    // Crea molti più incontri per avere una classifica realistica
    const incontri = [
      // SETTIMANA 1 - Incontri completati
      {
        partecipante_a_id: utentiIscritti[0].id, // Mario
        partecipante_b_id: utentiIscritti[2].id, // Giuseppe
        data: '2024-11-15',
        giocato: true,
        punti_a: 11,
        punti_b: 7
      },
      {
        partecipante_a_id: utentiIscritti[1].id, // Laura
        partecipante_b_id: utentiIscritti[3].id, // Anna
        data: '2024-11-16',
        giocato: true,
        punti_a: 9,
        punti_b: 11
      },
      {
        partecipante_a_id: utentiIscritti[4].id, // Francesco
        partecipante_b_id: utentiIscritti[5].id, // Giulia
        data: '2024-11-17',
        giocato: true,
        punti_a: 12,
        punti_b: 10
      },
      {
        partecipante_a_id: utentiIscritti[6].id, // Marco
        partecipante_b_id: utentiIscritti[7].id, // Chiara
        data: '2024-11-18',
        giocato: true,
        punti_a: 11,
        punti_b: 4
      },
      {
        partecipante_a_id: utentiIscritti[8].id, // Davide
        partecipante_b_id: utentiIscritti[9].id, // Elena
        data: '2024-11-19',
        giocato: true,
        punti_a: 8,
        punti_b: 11
      },

      // SETTIMANA 2 - Incontri completati
      {
        partecipante_a_id: utentiIscritti[0].id, // Mario
        partecipante_b_id: utentiIscritti[4].id, // Francesco
        data: '2024-11-22',
        giocato: true,
        punti_a: 11,
        punti_b: 9
      },
      {
        partecipante_a_id: utentiIscritti[1].id, // Laura
        partecipante_b_id: utentiIscritti[6].id, // Marco
        data: '2024-11-23',
        giocato: true,
        punti_a: 11,
        punti_b: 6
      },
      {
        partecipante_a_id: utentiIscritti[3].id, // Anna
        partecipante_b_id: utentiIscritti[5].id, // Giulia
        data: '2024-11-24',
        giocato: true,
        punti_a: 13,
        punti_b: 11
      },
      {
        partecipante_a_id: utentiIscritti[2].id, // Giuseppe
        partecipante_b_id: utentiIscritti[7].id, // Chiara
        data: '2024-11-25',
        giocato: true,
        punti_a: 11,
        punti_b: 5
      },
      {
        partecipante_a_id: utentiIscritti[8].id, // Davide
        partecipante_b_id: utentiIscritti[0].id, // Mario
        data: '2024-11-26',
        giocato: true,
        punti_a: 6,
        punti_b: 11
      },

      // SETTIMANA 3 - Incontri completati
      {
        partecipante_a_id: utentiIscritti[9].id, // Elena
        partecipante_b_id: utentiIscritti[1].id, // Laura
        data: '2024-11-29',
        giocato: true,
        punti_a: 9,
        punti_b: 11
      },
      {
        partecipante_a_id: utentiIscritti[4].id, // Francesco
        partecipante_b_id: utentiIscritti[3].id, // Anna
        data: '2024-11-30',
        giocato: true,
        punti_a: 11,
        punti_b: 8
      },
      {
        partecipante_a_id: utentiIscritti[5].id, // Giulia
        partecipante_b_id: utentiIscritti[6].id, // Marco
        data: '2024-12-01',
        giocato: true,
        punti_a: 11,
        punti_b: 13
      },
      {
        partecipante_a_id: utentiIscritti[0].id, // Mario
        partecipante_b_id: utentiIscritti[7].id, // Chiara
        data: '2024-12-02',
        giocato: true,
        punti_a: 11,
        punti_b: 3
      },
      {
        partecipante_a_id: utentiIscritti[2].id, // Giuseppe
        partecipante_b_id: utentiIscritti[8].id, // Davide
        data: '2024-12-03',
        giocato: true,
        punti_a: 11,
        punti_b: 9
      },

      // SETTIMANA 4 - Incontri completati
      {
        partecipante_a_id: utentiIscritti[1].id, // Laura
        partecipante_b_id: utentiIscritti[4].id, // Francesco
        data: '2024-12-06',
        giocato: true,
        punti_a: 11,
        punti_b: 7
      },
      {
        partecipante_a_id: utentiIscritti[3].id, // Anna
        partecipante_b_id: utentiIscritti[6].id, // Marco
        data: '2024-12-07',
        giocato: true,
        punti_a: 11,
        punti_b: 9
      },
      {
        partecipante_a_id: utentiIscritti[5].id, // Giulia
        partecipante_b_id: utentiIscritti[9].id, // Elena
        data: '2024-12-08',
        giocato: true,
        punti_a: 8,
        punti_b: 11
      },
      {
        partecipante_a_id: utentiIscritti[0].id, // Mario
        partecipante_b_id: utentiIscritti[8].id, // Davide
        data: '2024-12-09',
        giocato: true,
        punti_a: 11,
        punti_b: 6
      },
      {
        partecipante_a_id: utentiIscritti[2].id, // Giuseppe
        partecipante_b_id: utentiIscritti[7].id, // Chiara
        data: '2024-12-10',
        giocato: true,
        punti_a: 11,
        punti_b: 4
      },

      // SETTIMANA 5 - Incontri completati (per raggiungere 5+ partite)
      {
        partecipante_a_id: utentiIscritti[0].id, // Mario
        partecipante_b_id: utentiIscritti[1].id, // Laura
        data: '2024-12-13',
        giocato: true,
        punti_a: 9,
        punti_b: 11
      },
      {
        partecipante_a_id: utentiIscritti[3].id, // Anna
        partecipante_b_id: utentiIscritti[2].id, // Giuseppe
        data: '2024-12-14',
        giocato: true,
        punti_a: 11,
        punti_b: 8
      },
      {
        partecipante_a_id: utentiIscritti[4].id, // Francesco
        partecipante_b_id: utentiIscritti[6].id, // Marco
        data: '2024-12-15',
        giocato: true,
        punti_a: 11,
        punti_b: 7
      },
      {
        partecipante_a_id: utentiIscritti[5].id, // Giulia
        partecipante_b_id: utentiIscritti[8].id, // Davide
        data: '2024-12-16',
        giocato: true,
        punti_a: 11,
        punti_b: 9
      },
      {
        partecipante_a_id: utentiIscritti[7].id, // Chiara
        partecipante_b_id: utentiIscritti[9].id, // Elena
        data: '2024-12-17',
        giocato: true,
        punti_a: 6,
        punti_b: 11
      },

      // INCONTRI PROGRAMMATI (futuro)
      {
        partecipante_a_id: utentiIscritti[0].id, // Mario
        partecipante_b_id: utentiIscritti[5].id, // Giulia
        data: '2024-12-20',
        giocato: false,
        punti_a: null,
        punti_b: null
      },
      {
        partecipante_a_id: utentiIscritti[1].id, // Laura
        partecipante_b_id: utentiIscritti[2].id, // Giuseppe
        data: '2024-12-21',
        giocato: false,
        punti_a: null,
        punti_b: null
      },
      {
        partecipante_a_id: utentiIscritti[3].id, // Anna
        partecipante_b_id: utentiIscritti[8].id, // Davide
        data: '2024-12-22',
        giocato: false,
        punti_a: null,
        punti_b: null
      },
      {
        partecipante_a_id: utentiIscritti[4].id, // Francesco
        partecipante_b_id: utentiIscritti[7].id, // Chiara
        data: '2024-12-23',
        giocato: false,
        punti_a: null,
        punti_b: null
      },
      {
        partecipante_a_id: utentiIscritti[6].id, // Marco
        partecipante_b_id: utentiIscritti[9].id, // Elena
        data: '2024-12-24',
        giocato: false,
        punti_a: null,
        punti_b: null
      }
    ];

    // Inserisci incontri
    for (const incontro of incontri) {
      await pool.query(
        `INSERT INTO incontri (partecipante_a_id, partecipante_b_id, data, giocato, punti_a, punti_b) 
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [incontro.partecipante_a_id, incontro.partecipante_b_id, incontro.data, incontro.giocato, incontro.punti_a, incontro.punti_b]
      );
    }

    console.log('✅ Seeding completato con successo!');
    console.log('');
    console.log('🔑 Credenziali di accesso:');
    console.log('   Email: mario.rossi@azienda.com (Organizzatore)');
    console.log('   Email: laura.bianchi@azienda.com (Organizzatore)');
    console.log('   Email: giuseppe.verdi@azienda.com (Partecipante)');
    console.log('   Email: anna.neri@azienda.com (Partecipante)');
    console.log('   Email: andrea.arancioni@azienda.com (Non iscritto)');
    console.log('   Password per tutti: password123');
    console.log('');
    console.log('📊 Dati inseriti:');
    console.log(`   - ${utenti.length} utenti (${utenti.filter(u => u.iscritto).length} iscritti, ${utenti.filter(u => u.organizzatore).length} organizzatori)`);
    console.log(`   - ${incontri.length} incontri (${incontri.filter(i => i.giocato).length} completati, ${incontri.filter(i => !i.giocato).length} programmati)`);
    console.log('');
    console.log('🏆 Partite per utente (approssimate):');
    console.log('   - Mario: 6 partite (5 vinte, 1 persa) - 83.33%');
    console.log('   - Laura: 5 partite (4 vinte, 1 persa) - 80%');
    console.log('   - Anna: 5 partite (4 vinte, 1 persa) - 80%');
    console.log('   - Giuseppe: 5 partite (3 vinte, 2 perse) - 60%');
    console.log('   - Francesco: 5 partite (3 vinte, 2 perse) - 60%');
    console.log('   - Marco: 5 partite (2 vinte, 3 perse) - 40%');
    console.log('   - Altri: < 5 partite (non qualificati per classifica)');
    
  } catch (error) {
    console.error('❌ Errore durante il seeding:', error);
  } finally {
    process.exit(0);
  }
};

seedDatabase();