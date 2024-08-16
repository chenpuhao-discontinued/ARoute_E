const express = require('express');
const router = express.Router();
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bcrypt = require('bcrypt'); // 引入bcrypt模块

function createConnection() {
  return new sqlite3.Database(path.join(__dirname, '../../ARoute.db'));
}

// 计算密码的哈希值
async function hashPassword(password) {
  const saltRounds = 10;
  return await bcrypt.hash(password, saltRounds);
}

// 验证密码
async function verifyPassword(password, hash) {
  return bcrypt.compare(password, hash);
}

// 验证token返回用户信息
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

router.get('/login', async function(req, res) {
  const db = createConnection();
  const email = req.query.email;
  const password = req.query.password;
  const token = Math.floor(Math.random() * 1000000000);

  db.get(`SELECT * FROM userInfo WHERE email = ?`, [email], async function (error, row) {
    if (error) {
      res.status(500).send({code: 500, message: 'Database error', error: error.message});
    } else if (row && await verifyPassword(password, row.password)) {
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

router.get('/register', async function(req, res) {
  const db = createConnection();
  const email = req.query.email;
  const username = req.query.username;
  const password = await hashPassword(req.query.password);
  const icon = '';
  const token = 0;
  const title = 'user';

  db.get(`SELECT * FROM userInfo WHERE email = ?`, [email], function (error, row) {
    if (error) {
      db.close();
      res.status(500).send({code: 500, message: 'Database error', error: error.message});
    } else if (row) {
      db.close();
      res.send({code: 500, message: '用户已存在'});
    } else {
      db.run(`INSERT INTO userInfo (email, username, password, icon, token, title) VALUES (?, ?, ?, ?, ?, ?)`, [email, username, password, icon, token, title], function (error) {
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

router.get('/isUserExist', function(req, res) {
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

router.get('/test', function(req, res) {
  res.send('test');
});

router.get('/connect', function(req, res) {
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

//注册管理员
router.get('/registerAdmin', async function(req, res) {
  const db = createConnection();
  const email = req.query.email;
  const username = req.query.username;
  const password = await hashPassword(req.query.password);
  const icon = '';
  const token = 0;
  const title = 'admin';

  db.get(`SELECT * FROM userInfo WHERE email = ?`, [email], function (error, row) {
    if (error) {
      db.close();
      res.status(500).send({code: 500, message: 'Database error', error: error.message});
    } else if (row) {
      db.close();
      res.send({code: 500, message: '用户已存在'});
    } else {
      db.run(`INSERT INTO userInfo (email, username, password, icon, token, title) VALUES (?, ?, ?, ?, ?, ?)`, [email, username, password, icon, token, title], function (error) {
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

//重置密码校验
router.get('/resetPasswordCheck', function(req, res) {
  const db = createConnection();
  const email = req.query.email;
  const username = req.query.username;
  db.get(`SELECT * FROM userInfo WHERE email = ? AND username = ?`, [email, username], function (error, row) {
    db.close();
    if (error) {
      res.status(500).send({code: 500, message: 'Database error', error: error.message});
    } else if (row) {
      res.send({code: 200, message: 'success'});
    } else {
      res.status(401).send({code: 401, message: 'false'});
    }
  });
});

//重置密码
router.get('/resetPassword', async function(req, res) {
  const db = createConnection();
  const email = req.query.email;
  const password = await hashPassword(req.query.password);
  db.run(`UPDATE userInfo SET password = ? WHERE email = ?`, [password, email], function (error) {
    if (error) {
      res.status(500).send({code: 500, message: 'Database error', error: error.message});
    } else {
      res.send({code: 200, message: 'success'});
    }
    db.close();
  });
});

//获取总用户数
router.get('/getUserCount', function(req, res) {
  const db = createConnection();
  db.get(`SELECT COUNT(*) AS count FROM userInfo`, function (error, row) {
    db.close();
    if (error) {
      res.status(500).send({code: 500, message: 'Database error', error: error.message});
    } else {
      res.send({code: 200, message: 'success', data: row.count});
    }
  });
});

router.get('/getUsername', function(req, res) {
  const db = createConnection();
  const token = req.query.token;
  db.get(`SELECT username FROM userInfo WHERE token = ?`, [token], function (error, row) {
    db.close();
    if (error) {
      res.status(500).send({code: 500, message: 'Database error', error: error.message});
    } else if (row) {
      res.send({code: 200, message: 'success', data: row.username});
    } else {
      res.status(404).send({code: 404, message: 'User not found'});
    }
  });
});
//通过token返回用户权限
router.get('/getUserTitle', function(req, res) {
  const db = createConnection();
  const token = req.query.token;
  db.get(`SELECT title FROM userInfo WHERE token = ?`, [token], function (error, row) {
    db.close();
    if (error) {
      res.status(500).send({code: 500, message: 'Database error', error: error.message});
    } else if (row) {
      res.send({code: 200, message: 'success', data: row.title});
    } else {
      res.status(404).send({code: 404, message: 'User not found'});
    }
  });
});




module.exports = router;