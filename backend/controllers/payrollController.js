const pool = require('../config/db');

exports.addPayroll = async (req, res) => {
  try {
    const data = req.body;
    console.log('Adding payroll:', data);

    const earnings = parseFloat(data.basic_salary || 0) +
      parseFloat(data.da || 0) +
      parseFloat(data.hra || 0) +
      parseFloat(data.conveyance || 0) +
      parseFloat(data.special_allowance || 0) +
      parseFloat(data.dp || 0) +
      parseFloat(data.arrears || 0) +
      parseFloat(data.overtime || 0);

    const deductions = parseFloat(data.lop || 0) +
      parseFloat(data.advance || 0) +
      parseFloat(data.medical_deduction || 0) +
      parseFloat(data.loan || 0) +
      parseFloat(data.personal_bill || 0) +
      parseFloat(data.other_deduction || 0);

    const total_salary = earnings - deductions;

    const [result] = await pool.execute(`
      INSERT INTO payroll (
        emp_code, emp_name, department, designation, category,
        basic_salary, da, hra, conveyance, special_allowance, dp,
        lop, advance, medical_deduction, loan, personal_bill, other_deduction,
        arrears, overtime, remarks, is_active, total_salary
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      data.emp_code, data.emp_name, data.department, data.designation, data.category,
      data.basic_salary, data.da, data.hra, data.conveyance, data.special_allowance,
      data.dp, data.lop, data.advance, data.medical_deduction, data.loan,
      data.personal_bill, data.other_deduction, data.arrears, data.overtime,
      data.remarks, data.is_active, total_salary
    ]);

    res.status(201).json({ message: 'Payroll added', id: result.insertId, total_salary });
  } catch (err) {
    console.error('Error adding payroll:', err);
    res.status(500).json({ error: 'Failed to add payroll', details: err.message });
  }
};

exports.getAllPayrolls = async (req, res) => {
  try {
    const { month, year, is_active } = req.query;
    let query = 'SELECT * FROM payroll';
    let params = [];
    let conditions = [];

    if (month && year) {
      conditions.push('MONTH(created_at) = ? AND YEAR(created_at) = ?');
      params.push(parseInt(month), parseInt(year));
    }

    if (is_active !== undefined) {
      conditions.push('is_active = ?');
      params.push(parseInt(is_active));
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY created_at DESC';
    const [rows] = await pool.execute(query, params);
    console.log('Fetched payrolls:', rows);
    res.status(200).json(rows);
  } catch (err) {
    console.error('Error fetching payrolls:', err);
    res.status(500).json({ error: 'Failed to fetch payrolls', details: err.message });
  }
};

exports.getPayrollById = async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT * FROM payroll WHERE id = ?', [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Payroll record not found' });
    }
    res.status(200).json(rows[0]);
  } catch (err) {
    console.error('Error fetching payroll by ID:', err);
    res.status(500).json({ error: 'Failed to get payroll', details: err.message });
  }
};

exports.updatePayroll = async (req, res) => {
  try {
    const data = req.body;
    const id = req.params.id;
    console.log('Updating payroll:', { id, data });

    const [existing] = await pool.execute('SELECT id FROM payroll WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ error: 'Payroll record not found' });
    }

    const earnings = parseFloat(data.basic_salary || 0) +
      parseFloat(data.da || 0) +
      parseFloat(data.hra || 0) +
      parseFloat(data.conveyance || 0) +
      parseFloat(data.special_allowance || 0) +
      parseFloat(data.dp || 0) +
      parseFloat(data.arrears || 0) +
      parseFloat(data.overtime || 0);

    const deductions = parseFloat(data.lop || 0) +
      parseFloat(data.advance || 0) +
      parseFloat(data.medical_deduction || 0) +
      parseFloat(data.loan || 0) +
      parseFloat(data.personal_bill || 0) +
      parseFloat(data.other_deduction || 0);

    const total_salary = earnings - deductions;

    const [result] = await pool.execute(`
      UPDATE payroll SET
        emp_code = ?, emp_name = ?, department = ?, designation = ?, category = ?, basic_salary = ?, da = ?, hra = ?,
        conveyance = ?, special_allowance = ?, dp = ?, lop = ?, advance = ?, medical_deduction = ?, loan = ?, 
        personal_bill = ?, other_deduction = ?, arrears = ?, overtime = ?, remarks = ?, is_active = ?, total_salary = ?
      WHERE id = ?
    `, [
      data.emp_code, data.emp_name, data.department, data.designation, data.category, data.basic_salary, data.da,
      data.hra, data.conveyance, data.special_allowance, data.dp, data.lop, data.advance, data.medical_deduction,
      data.loan, data.personal_bill, data.other_deduction, data.arrears, data.overtime, data.remarks,
      data.is_active, total_salary, id
    ]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Payroll record not found' });
    }

    res.status(200).json({ message: 'Payroll updated', total_salary });
  } catch (err) {
    console.error('Error updating payroll:', err);
    res.status(500).json({ error: 'Failed to update payroll', details: err.message });
  }
};

exports.deletePayroll = async (req, res) => {
  try {
    const id = req.params.id;
    console.log('Deleting payroll:', id);

    const [existing] = await pool.execute('SELECT id FROM payroll WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ error: 'Payroll record not found' });
    }

    const [result] = await pool.execute('DELETE FROM payroll WHERE id = ?', [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Payroll record not found' });
    }

    res.status(200).json({ message: 'Payroll deleted' });
  } catch (err) {
    console.error('Error deleting payroll:', err);
    res.status(500).json({ error: 'Failed to delete payroll', details: err.message });
  }
};