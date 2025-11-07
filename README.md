# Secure vs Insecure Webapp

This small Node.js/Express sample app demonstrates both insecure and secure implementations of two common web vulnerabilities: SQL injection and broken authentication. It's meant for learning and demonstration purposes only — do not use insecure patterns in production.

## Overview

- Server: Express (EJS views)
- Database: PostgreSQL (initialized from SQL files in `models/`)
- Purpose: show contrasting insecure and secure variants for fetching student data and user login

Key behaviors shown in the app:
- `/student-info` — insecure SQL query concatenating user input (vulnerable to SQL injection)
- `/secure-student-info` — parameterized query using query parameters (safe)
- `/login` — insecure user authentication with string-interpolated SQL
- `/secure-login` — safer login flow (parameterized queries, simple login attempt tracking and lock)

The UI includes checkboxes that toggle which (insecure vs secure) route the forms submit to so you can compare behaviors.

## Project structure

```
.
├── app.js                 # Express app setup, session config, DB initialization and sample data
├── db.js                  # PostgreSQL pool configuration (loads env vars)
├── package.json           # Node project config and scripts
├── README.md              # Project documentation (this file)
├── LICENSE                # License for the repository
├── models/                # SQL schema files used to create tables
│   ├── Students.sql       # students table schema
│   └── Users.sql          # users2 table schema
├── public/                # static assets served to the browser
│   ├── scripts/
│   │   └── formValidation.js  # client-side logic that switches form actions and validates inputs
│   └── styles/
│       └── main.css       # basic styling
├── routes/
│   └── home.routes.js     # route handlers demonstrating secure/insecure behaviors
└── views/
   └── index.ejs         # EJS template for the main UI
```


## Environment

Create a `.env` file in the project root with the following variables:

```
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_HOST=localhost
DB_PORT=5432
DB_NAME=your_db_name
SESSION_SECRET=some_secret_value
PORT=4010
BASE_URL=http://localhost:4010
```

Notes:
- The app reads `models/Students.sql` and `models/Users.sql` on startup and attempts to create tables if they don't exist. It also inserts sample rows if the tables are empty.

## Install and run 

Open PowerShell in the project directory and run:

```powershell
npm install
npm start
```

By default the server listens on `http://localhost:4010` unless you override `PORT`.

## How to use

1. Open the app in a browser at the configured `BASE_URL`.
2. Use the login form to test authentication:
   - Toggle the "Enable broken authentication" checkbox to choose between `/login` (insecure) and `/secure-login` (safer).
3. After logging in, use the JMBAG form to fetch student data:
   - Toggle the "Enable SQL injection" checkbox to choose between `/student-info` (insecure) and `/secure-student-info` (parameterized).

The insecure endpoints intentionally illustrate bad patterns so you can test/observe what can go wrong. The secure endpoints show safer approaches using parameterized queries and simple brute-force protection for login. You can also experiment to see how SQL injection works. The app demonstrates several injection scenarios such as tautology-based injections, malformed inputs, and UNION-style injections. If you’re unsure how to construct a query, inspect the database table structure (column names and types) to help you build appropriate queries or example inputs.

## Routes summary

- GET `/` — main page
- POST `/student-info` — insecure: builds SQL string like `SELECT * FROM students WHERE jmbag = '${jmbag}'`
- POST `/secure-student-info` — secure: uses parameterized query `SELECT * FROM students WHERE jmbag = $1`
- POST `/login` — insecure: string-interpolated SQL for user lookup
- POST `/secure-login` — safer: parameterized query, login_attempts and lock_until logic
- POST `/logout` — destroys session

## Security notes and recommendations

- Never construct SQL by concatenating raw user input. Use parameterized queries / prepared statements (as in `/secure-student-info`).
- Store passwords hashed with a strong algorithm (bcrypt/argon2). The code includes a commented hint about `bcrypt.compare`.
- Use proper session cookie settings in production: `secure: true`, `httpOnly: true`, and a strict `SameSite` policy.
- Use environment-specific configuration and do not hard-code secrets. Keep `.env` out of source control.
- Implement stronger account lockout, rate-limiting, and multi-factor authentication for production systems.

## Development notes

- The project uses ES modules (`type: "module"` in `package.json`).
- On startup, `app.js` reads the SQL in `models/` and runs it against the configured PostgreSQL instance.
- If you want to reset sample data, you can drop and recreate the `students` and `users2` tables manually, or edit the SQL files.

## License

This repository includes an existing `LICENSE` file in the project root. Review it for license terms.

## Next steps (suggested)

- Replace plain-text password usage with proper hashing (bcrypt).
- Add unit tests for route handlers and DB interactions.
- Add CI checks for linting/security scanning.
- Uncomment Securiy cookie settings and comment current cookie settings
