
const express = require('express');
const path = require("path");
const sqlite3 = require('sqlite3').verbose();
const router = express.Router();

// 创建一个连接到SQLite数据库的函数
function createConnection() {
  return new sqlite3.Database(path.join(__dirname, '../../ARoute.db'));
}

const db = createConnection();
// 创建一个API端点，查询passage表中的所有文章数并返回
router.get('/count', (req, res) => {
  const query = 'SELECT COUNT(*) AS count FROM passage';
  db.get(query, [], (err, row) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ count: row.count });
  });
});

//从System_info表的name列的home_assembly值中获取对应的value
router.get('/home_assembly', (req, res) => {
  const query = 'SELECT value FROM System_info WHERE name = "home_assembly"';
  db.get(query, [], (err, row) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.setHeader('Content-Type', 'application/json');
    res.json({ home_assembly: row.value });
  });
});

//从System_info表的name列的home_assembly值中写入对应的value
// routes/v1/PassageControl.js

router.post('/set_home_assembly', (req, res) => {
  const query = 'UPDATE System_info SET value = ? WHERE name = "home_assembly"';
  const components = JSON.stringify(req.body.components);
  db.run(query, [components], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ message: 'success' });
  });
});

// 创建一个API端点，查询passage表中所有文章的阅读数之和并返回
router.get('/total_reads', (req, res) => {
  const query = 'SELECT SUM(read) AS total_reads FROM passage';
  db.get(query, [], (err, row) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ total_reads: row.total_reads });
  });
});

module.exports = router;