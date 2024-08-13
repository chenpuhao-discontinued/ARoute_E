const express = require('express');
const router = express.Router();
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

function createConnection() {
    return new sqlite3.Database(path.join(__dirname, '../../ARoute.db'));
}

// 检查安装状态(表System_check的name列的install对应的value值)只返回value
router.get('/checkInstall', function(req, res, next) {
    const db = createConnection();
    db.get(`SELECT value FROM System_info WHERE name = 'install'`, function (error, row) {
        db.close();
        if (error) {
            res.status(500).send({code: 500, message: 'Database error', error: error.message});
        } else if (row) {
            res.status(200).send(row);
        } else {
            res.status(404).send({code: 404, message: '未找到安装状态'});
        }
    });
});


// 安装系统(表System_check的name列的install对应的value值)只返回value
router.get('/install', function(req, res, next) {
    const db = createConnection();
    db.run(`UPDATE System_info SET value = 1 WHERE name = 'install'`, function (error) {
        db.close();
        if (error) {
            res.status(500).send({code: 500, message: 'Database error', error: error.message});
        } else {
            res.send({code: 200, message: '安装成功'});
        }
    });
});

// 卸载系统(表System_check的name列的install对应的value值)只返回value
router.get('/uninstall', function(req, res, next) {
    const db = createConnection();
    db.run(`UPDATE System_info SET value = 0 WHERE name = 'install'`, function (error) {
        db.close();
        if (error) {
            res.status(500).send({code: 500, message: 'Database error', error: error.message});
        } else {
            res.send({code: 200, message: '卸载成功'});
        }
    });
});

// 写入邮件配置
router.post('/setMailConfig', function(req, res, next) {
    const db = createConnection();
    const { host, port, secure, user, pass } = req.query;

    const queries = [
        { name: 'host', value: host },
        { name: 'port', value: port },
        { name: 'secure', value: secure },
        { name: 'user', value: user },
        { name: 'pass', value: pass }
    ];

    let remaining = queries.length;
    let hasError = false;

    queries.forEach(query => {
        db.run(`UPDATE System_info SET value = ? WHERE name = ?`, [query.value, query.name], function (error) {
            if (error) {
                hasError = true;
                res.status(500).send({ code: 500, message: 'Database error', error: error.message });
                return;
            }
            if (--remaining === 0 && !hasError) {
                db.close();
                res.send({ code: 200, message: '邮件配置更新成功' });
            }
        });
    });
});
//更新网站名（website_name）
router.post('/setWebsiteName', function(req, res, next) {
    const db = createConnection();
    const { website_name } = req.query;
    db.run(`UPDATE System_info SET value = ? WHERE name = 'website_name'`, [website_name], function (error) {
        db.close();
        if (error) {
            res.status(500).send({ code: 500, message: 'Database error', error: error.message });
        } else {
            res.send({ code: 200, message: '网站名更新成功' });
        }
    });
});
module.exports = router;