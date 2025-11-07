import { Router } from 'express';
import { pool } from '../db.js';

const router = Router();

router.get('/', (req, res) => {
    const sqlRows = req.session.sqlRows;
    const SQLerror = req.session.SQLerror;
    const user = req.session.user;
    const loginError = req.session.loginError;
    
    req.session.SQLerror = null;
    req.session.loginError = null;

    res.render('index', { userData: sqlRows === undefined ? undefined : sqlRows, 
                        SQLerror: SQLerror || null, 
                        user: user || null, 
                        loginError: loginError || null 
    });
});

router.post('/student-info', (req, res) => {
    const { jmbag } = req.body;

    const query = `SELECT * FROM students WHERE jmbag = '${jmbag}'`;
    pool.query(query)
        .then(result => {
            req.session.sqlRows = result.rows;
            req.session.SQLerror = null;
            res.redirect('/');
        })
        .catch(err => {
            console.error('Error fetching student info:', err);
            req.session.sqlRows = undefined;
            req.session.SQLerror = err.message;
            res.redirect('/');
        });
});

router.post('/secure-student-info', async(req, res) => {
    const { jmbag } = req.body;
    const isNumeric = /^[0-9]+$/.test(jmbag);

    if (!isNumeric){
        req.session.sqlRows = undefined;
        req.session.SQLerror = "Invalid JMBAG format";
        res.redirect('/');
        return;
    }
    const query = 'SELECT * FROM students WHERE jmbag = $1';
    const rows = await pool.query(query, [jmbag]);
    if (rows.rows.length === 0){
        req.session.sqlRows = undefined;
        req.session.SQLerror = "No student found with the provided JMBAG";
    }
    req.session.sqlRows = rows.rows;
    req.session.SQLerror = null;
    res.redirect('/');
});


router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    const result = await pool.query(`SELECT username, password FROM users2 WHERE username = '${username}'`); 
    if(result.rows.length === 0){
        req.session.loginError = "No username found in the database";
        res.status(404).redirect('/');
    }
    else if(result.rows[0].password !== password){
        req.session.loginError = "Incorrect password";
        res.status(401).redirect('/');
    }
    else{
        req.session.loginError = null;
        req.session.user = username;  
        res.redirect('/');  
    }
   
});

router.post('/secure-login', async (req, res) => {
    const { username, password } = req.body;
    const { rows } = await pool.query('SELECT username, password, login_attempts, lock_until FROM users2 WHERE username = $1', [username]);
    const user = rows[0];
    if (!user){
        await new Promise(resolve => setTimeout(resolve, 300));
        req.session.loginError = "Invalid username or password";
        res.redirect('/');
        return;
    }
    if (user.lock_until && new Date() < new Date(user.lock_until)) {
        req.session.loginError = "Account is temporarily locked. Please try again later.";
        res.redirect('/');
        return;
    }
    // const match = await bcrypt.compare(password, user.password); -> for hashed passwords 
    if (user.password !== password) {
        let loginAttempts = user.login_attempts + 1;
        let lockUntil = null;
        if (loginAttempts >= 5){
            lockUntil = new Date(Date.now() + 1 * 60 * 1000); 
            loginAttempts = 0;
        }
        await pool.query('UPDATE users2 SET login_attempts = $1, lock_until = $2 WHERE username = $3', 
            [loginAttempts, lockUntil, username]);
        req.session.loginError = "Invalid username or password";
        res.redirect('/');
        return;
    }
    await pool.query('UPDATE users2 SET login_attempts = 0, lock_until = NULL WHERE username = $1', [username]);
    req.session.loginError = null;
    req.session.user = username;
    res.redirect('/');
});

router.post('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            console.error('Error during logout:', err);
            return res.status(500).send('Internal Server Error');
        }
        res.redirect('/');
    });
});

export default router;
