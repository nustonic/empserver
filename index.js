const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
const port = 5000;

// Middleware
app.use(cors());
app.use(express.json());

// สร้างการเชื่อมต่อกับ MySQL
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root', // แทนที่ด้วย MySQL username ของคุณ
  password: '', // แทนที่ด้วย MySQL password ของคุณ
  database: 'employee_management', // แทนที่ด้วยชื่อ Database ของคุณ
});

// เชื่อมต่อกับ MySQL
db.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL:', err);
    return;
  }
  console.log('Connected to MySQL database');
});

// API สำหรับดึงข้อมูลพนักงานทั้งหมด
app.get('/api/employees', (req, res) => {
  const query = 'SELECT * FROM employees';
  db.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching employees:', err);
      res.status(500).send('Error fetching employees');
      return;
    }
    
    res.json(results);
  });
});

// API สำหรับดึงข้อมูลพนักงานโดย ID
app.get('/api/employees/:id', (req, res) => {
  const { id } = req.params;
  const query = 'SELECT * FROM employees WHERE id = ?';
  db.query(query, [id], (err, results) => {
    if (err) {
      console.error('Error fetching employee:', err);
      res.status(500).send('Error fetching employee');
      return;
    }
    if (results.length === 0) {
      res.status(404).send('Employee not found');
      return;
    }
    res.json(results[0]);
  });
});

// API สำหรับเพิ่มพนักงานใหม่
app.post('/api/employees', (req, res) => {
  const { name, position, department, salary, hireDate, image } = req.body;
  const query = 'INSERT INTO employees (name, position, department, salary, hireDate, image) VALUES (?, ?, ?, ?, ?, ?)';
  db.query(query, [name, position, department, salary, hireDate, image], (err, results) => {
    if (err) {
      console.error('Error adding employee:', err);
      res.status(500).send('Error adding employee');
      return;
    }
    res.status(201).json({ id: results.insertId, ...req.body });
  });
});

// API สำหรับแก้ไขข้อมูลพนักงาน
app.put('/api/employees/:id', (req, res) => {
  const { id } = req.params;
  const { name, position, department, salary, hireDate, image } = req.body;
  const query = 'UPDATE employees SET name = ?, position = ?, department = ?, salary = ?, hireDate = ?, image = ? WHERE id = ?';
  db.query(query, [name, position, department, salary, hireDate, image, id], (err, results) => {
    if (err) {
      console.error('Error updating employee:', err);
      res.status(500).send('Error updating employee');
      return;
    }
    if (results.affectedRows === 0) {
      res.status(404).send('Employee not found');
      return;
    }
    res.json({ id, ...req.body });
  });
});

// API สำหรับลบพนักงาน
app.delete('/api/employees/:id', (req, res) => {
  const { id } = req.params;
  const query = 'DELETE FROM employees WHERE id = ?';
  db.query(query, [id], (err, results) => {
    if (err) {
      console.error('Error deleting employee:', err);
      res.status(500).send('Error deleting employee');
      return;
    }
    if (results.affectedRows === 0) {
      res.status(404).send('Employee not found');
      return;
    }
    res.status(204).send();
  });
});

// API สำหรับเพิ่มการโยกย้าย
app.post('/api/employees/:id/transfers', (req, res) => {
  const { id } = req.params; // Correctly get employee_id from URL
  const { transfer_date, from_department, to_department } = req.body;
  
  const query = 'INSERT INTO transfers (employee_id, transfer_date, from_department, to_department) VALUES (?, ?, ?, ?)';
  
  db.query(query, [id, transfer_date, from_department, to_department], (err, results) => {
    if (err) {
      console.error('Error adding transfer:', err);
      res.status(500).send('Error adding transfer');
      return;
    }
    res.status(201).json({ id: results.insertId, ...req.body });
  });
});

// เริ่มต้นเซิร์ฟเวอร์
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});