const express = require('express');
const cors = require('cors');
const app = express();
const payrollRoutes = require('./routes/payrollRoutes');

// Middleware
app.use(cors({ origin: 'http://localhost:3000' }));
app.use(express.json());

// Payroll Routes
app.use('/api/payroll', payrollRoutes);

// New endpoint to fetch designations from payroll_db.cd_dcd
app.get('/api/cd_dcd', async (req, res) => {
  try {
    const typecd = req.query.typecd;
    if (!typecd) {
      return res.status(400).json({ error: 'typecd query parameter is required' });
    }

    // Assuming a database connection (e.g., mysql2/promise)
    const mysql = require('mysql2/promise');
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: 'root',
      database: 'payroll_db',
    });

    const [rows] = await connection.execute(
      'SELECT code, dcd FROM cd_dcd WHERE typecd = ?',
      [typecd]
    );

    await connection.end();
    res.json(rows);
  } catch (error) {
    console.error('Error fetching designations:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Start Server
app.listen(5000, () => {
  console.log('Server running on port 5000');
});