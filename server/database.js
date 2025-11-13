const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const DB_PATH = path.join(__dirname, 'database.sqlite');

const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) {
    console.error('Error al conectar con la base de datos:', err.message);
  } else {
    console.log('✅ Conectado a la base de datos SQLite');
    initializeDatabase();
  }
});

function initializeDatabase() {
  // Tabla de usuarios
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    phone TEXT,
    birthdate TEXT,
    gender TEXT,
    allergies TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`, (err) => {
    if (err) {
      console.error('Error al crear tabla users:', err.message);
    } else {
      console.log('✅ Tabla users creada/verificada');
    }
  });

  // Tabla de citas
  db.run(`CREATE TABLE IF NOT EXISTS appointments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_email TEXT NOT NULL,
    specialty TEXT NOT NULL,
    date TEXT NOT NULL,
    time TEXT NOT NULL,
    client_name TEXT NOT NULL,
    reason TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_email) REFERENCES users(email)
  )`, (err) => {
    if (err) {
      console.error('Error al crear tabla appointments:', err.message);
    } else {
      console.log('✅ Tabla appointments creada/verificada');
    }
  });
}

// Funciones de usuarios
const userQueries = {
  create: (user, callback) => {
    const { name, email, password, phone, birthdate, gender, allergies } = user;
    db.run(
      `INSERT INTO users (name, email, password, phone, birthdate, gender, allergies)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [name, email, password, phone || null, birthdate || null, gender || null, allergies || null],
      function(err) {
        if (err) {
          callback(err, null);
        } else {
          callback(null, { id: this.lastID, ...user });
        }
      }
    );
  },

  findByEmail: (email, callback) => {
    db.get('SELECT * FROM users WHERE email = ?', [email], (err, row) => {
      callback(err, row);
    });
  },

  update: (email, userData, callback) => {
    const { name, phone, birthdate, gender, allergies } = userData;
    db.run(
      `UPDATE users SET name = ?, phone = ?, birthdate = ?, gender = ?, allergies = ?
       WHERE email = ?`,
      [name, phone, birthdate, gender, allergies, email],
      function(err) {
        callback(err, this.changes > 0);
      }
    );
  }
};

// Funciones de citas
const appointmentQueries = {
  create: (appointment, callback) => {
    const { user_email, specialty, date, time, client_name, reason } = appointment;
    db.run(
      `INSERT INTO appointments (user_email, specialty, date, time, client_name, reason)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [user_email, specialty, date, time, client_name, reason],
      function(err) {
        if (err) {
          callback(err, null);
        } else {
          callback(null, { id: this.lastID, ...appointment });
        }
      }
    );
  },

  findByUser: (userEmail, callback) => {
    db.all(
      'SELECT * FROM appointments WHERE user_email = ? ORDER BY date, time',
      [userEmail],
      (err, rows) => {
        callback(err, rows);
      }
    );
  },

  findAll: (callback) => {
    db.all(
      'SELECT * FROM appointments ORDER BY date, time',
      [],
      (err, rows) => {
        callback(err, rows);
      }
    );
  },

  checkAvailability: (specialty, date, time, callback) => {
    db.get(
      `SELECT COUNT(*) as count FROM appointments 
       WHERE specialty = ? AND date = ? AND time = ?`,
      [specialty, date, time],
      (err, row) => {
        callback(err, row && row.count > 0);
      }
    );
  }
};

module.exports = {
  db,
  userQueries,
  appointmentQueries
};

