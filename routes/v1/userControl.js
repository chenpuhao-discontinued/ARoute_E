// routes/v1/userControl.js
const express = require('express');
const router = express.Router();
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

function createConnection() {
  return new sqlite3.Database(path.join(__dirname, '../../ARoute.db'));
}

//验证token返回用户信息
router.get('/checkToken', function(req, res, next) {
  const db = createConnection();
  const token = req.query.token;
  db.get(`SELECT * FROM userInfo WHERE token = ?`, [token], function (error, row) {
    db.close();
    if (error) {
      res.status(500).send({code: 500, message: 'Database error', error: error.message});
    } else if (row) {
      res.send({code: 200, message: 'success', data: row});
    } else {
      res.status(401).send({code: 401, message: 'token无效'});
    }
  });
});

// routes/v1/userControl.js
router.get('/login', function(req, res, next) {
  const db = createConnection();
  const email = req.query.email;
  const password = req.query.password;
  //随机生成数字token
    const token = Math.floor(Math.random() * 1000000000);
  db.get(`SELECT * FROM userInfo WHERE email = ? AND password = ?`, [email, password], function (error, row) {
    if (error) {
      res.status(500).send({code: 500, message: 'Database error', error: error.message});
    } else if (row) {
      //返回token
        db.run(`UPDATE userInfo SET token = ? WHERE email = ?`, [token, email], function (error) {
            if (error) {
            res.status(500).send({code: 500, message: 'Database error', error: error.message});
            } else {
            res.send({code: 200, message: 'true', token: token});
            }
        });
    } else {
      res.status(401).send({code: 401, message: 'false'});
    }
    db.close();
  });
});

router.get('/register', function(req, res, next) {
  const db = createConnection();
  const email = req.query.email;
  const username = req.query.username;
  const password = req.query.password;
  const icon = '';
  const token = 0;
  db.get(`SELECT * FROM userInfo WHERE username = ?`, [username], function (error, row) {
    if (error) {
      db.close();
      res.status(500).send({code: 500, message: 'Database error', error: error.message});
    } else if (row) {
      db.close();
      res.send({code: 500, message: '用户已存在'});
    } else {
      db.run(`INSERT INTO userInfo (email, username, password, icon, token) VALUES (?, ?, ?, ?, ?)`, [email, username, password, icon, token], function (error) {
        db.close();
        if (error) {
          res.status(500).send({code: 500, message: 'Database error', error: error.message});
        } else {
          res.send({code: 200, message: '注册成功'});
        }
      });
    }
  });
});

router.get('/isUserExist', function(req, res, next) {
  const db = createConnection();
  const email = req.query.email;
  db.get(`SELECT * FROM userInfo WHERE email = ?`, [email], function (error, row) {
    db.close();
    if (error) {
      res.status(500).send({code: 500, message: 'Database error', error: error.message});
    } else if (row) {
      res.send(true);
    } else {
      res.send(false);
    }
  });
});

router.get('/test', function(req, res, next) {
  res.send('test');
});

router.get('/connect', function(req, res, next) {
  const db = createConnection();
  db.serialize(() => {
    db.run("SELECT 1", function(err) {
      if (err) {
        res.send({code: 500, message: '连接失败', error: err.message || '未知错误'});
      } else {
        res.send({code: 200, message: '连接成功'});
      }
      db.close();
    });
  });
});

module.exports = router;