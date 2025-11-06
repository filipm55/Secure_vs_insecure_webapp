CREATE TABLE IF NOT EXISTS users(
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    login_attempts INT DEFAULT 0,
    lock_until TIMESTAMP,
    jmbag VARCHAR(10) REFERENCES students(jmbag)
)