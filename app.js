import express from 'express';
import session from 'express-session';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import dotenv from 'dotenv';
import homeRoutes from './routes/home.routes.js';
import { pool } from './db.js';

dotenv.config();
const app = express();

app.use(session({
    name : 'sessionID',
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: { 
      maxAge: 24 * 60 * 60 * 1000 //24 h
      }
  }))

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function initializeDatabase() {
    const modelsDir = path.join(__dirname, 'models');
    const sqlFiles = ['Students.sql', 'Users.sql'];
    for(const file of sqlFiles){
        const schema = fs.readFileSync(path.join(modelsDir, file), 'utf8');
        try{
            await pool.query(schema);
        }
        catch(err){
            console.error(`Error initializing ${file}:`, err);
        }
    }
    console.log(`Database initialized successfully`);
}
await initializeDatabase().catch(err => console.error('Error initializing database', err));

async function fillDatabaseWithInitialData() {
    const { rows } = await pool.query('SELECT COUNT(*) AS count FROM users');
  
    if (parseInt(rows[0].count) > 0) {
        return;
    }
    await pool.query(`INSERT INTO students (jmbag, name, surname, oib, age) VALUES
                    ('0245123987', 'Marko', 'Horvat', '12345678901', 21),
                    ('0312254875', 'Ana', 'Kovač', '10987654321', 22),
                    ('0198754321', 'Petar', 'Novak', '12312312312', 20),
                    ('0456789123', 'Ivana', 'Barić', '32132132132', 23),
                    ('0523147896', 'Luka', 'Marić', '45645645645', 24),
                    ('0632581479', 'Sara', 'Perić', '78978978978', 22),
                    ('0745896321', 'David', 'Tomić', '98765432101', 21),
                    ('0812345679', 'Ema', 'Rogić', '65432109876', 20);
                `)
    await pool.query(`INSERT INTO users (username, email, password, jmbag) VALUES
                    ('marko_horvat', 'marko.horvat@student.hr', 'password123', '0245123987'),
                    ('ana_kovac', 'ana.kovac@student.hr', 'password123', '0312254875'),
                    ('petar_novak', 'petar.novak@student.hr', 'password123', '0198754321'),
                    ('ivana_baric', 'ivana.baric@student.hr', 'password123', '0456789123'),
                    ('luka_marić', 'luka.maric@student.hr', 'password123', '0523147896'),
                    ('sara_peric', 'sara.peric@student.hr', 'password123', '0632581479'),
                    ('david_tomic', 'david.tomic@student.hr', 'password123', '0745896321'),
                    ('ema_rogic', 'ema.rogic@student.hr', 'password123', '0812345679');
                `)
}
fillDatabaseWithInitialData().catch(err => console.error('Error inserting initial data', err));


app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use('/', homeRoutes);

app.listen(process.env.PORT || 4010, () => {
    console.log(`Server running at ${process.env.BASE_URL || `http://localhost:${process.env.PORT || 4010}`}`);
});
