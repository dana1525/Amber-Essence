# Amber-Essence

A web application for exploring and managing cocktail recipes, built with Node.js, Express, PostgreSQL, Bootstrap.

---

## Technologies Used

- Node.js
- Express.js
- PostgreSQL
- HTML5, CSS3, Sass
- Bootstrap

---

<details>
<summary>Installation and Local Setup</summary>

### 1. Clone the repository

```bash
git clone https://github.com/dana1525/Amber-Essence.git
cd Amber-Essence
```

### 2. Install Node.js dependencies

```bash
npm install
```

### 3. Configure PostgreSQL

#### a) Install PostgreSQL and client

```bash
sudo apt update
sudo apt install postgresql postgresql-contrib postgresql-client
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

#### b) Create the database and user

```bash
sudo -u postgres psql
```

```sql
CREATE DATABASE amber_essence;
CREATE USER user WITH ENCRYPTED PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE amber_essence TO user;
ALTER SCHEMA public OWNER TO user;
GRANT ALL PRIVILEGES ON SCHEMA public TO user;
ALTER USER user CREATEDB;
\q
```

#### c) Import the database schema

```bash
sudo -u postgres psql -d amber_essence -f retete_cocktailuri.sql
```

### 4. Configure the application

Open `index.js` (or your main server file) and add the PostgreSQL client configuration **at the top of the file**, before using it in any queries:

```js
const { Client } = require('pg');
const client = new Client({
  database: "amber_essence",
  user: "user",
  password: "your_password",
  host: "localhost",
  port: 5432
});

client.connect()
  .then(() => console.log("Connected to the database"))
  .catch(err => console.error("DB connection error:", err));
```

- Make sure to replace `your_password` with the password of the PostgreSQL user.
- Keep this configuration **before defining routes** or making any database queries.

### 5. Start the server

#### a) Check if the port is free

```bash
sudo lsof -i :8080
sudo kill -9 PID
```

#### b) Start the server

```bash
node index.js
```

Open in browser:
```
http://localhost:8080
```
