// server.js
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { Client } = require('pg');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(bodyParser.json());

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

client.connect()
  .then(() => console.log('Connected to PostgreSQL'))
  .catch(err => console.error('Connection error', err.stack));

// API routes
app.get('/api/projects', async (req, res) => {
  try {
    const result = await client.query('SELECT * FROM projects');
    res.status(200).json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching projects' });
  }
});

app.post('/api/projects', async (req, res) => {
  const { name, category, status, payment, nominal } = req.body;
  try {
    const result = await client.query(
      'INSERT INTO projects(name, category, status, payment, nominal) VALUES($1, $2, $3, $4, $5) RETURNING *',
      [name, category, status, payment, nominal]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Error adding project' });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
