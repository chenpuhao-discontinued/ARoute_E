const express = require('express');
const nodemailer = require('nodemailer');
const router = express.Router();
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
function createConnection() {
    return new sqlite3.Database(path.join(__dirname, '../../ARoute.db'));
}

// 从数据库中获取SMTP配置
function getSMTPConfig(callback) {
    const db = createConnection();
    const config = {};
    const keys = ['host', 'port', 'secure', 'user', 'pass'];
    let remaining = keys.length;

    keys.forEach(key => {
        db.get(`SELECT value FROM System_info WHERE name = ?`, [key], function (error, row) {
            if (error) {
                db.close();
                callback(error, null);
                return;
            }
            if (row) {
                config[key] = row.value;
            } else {
                config[key] = ''; // or handle the missing key appropriately
            }
            if (--remaining === 0) {
                db.close();
                callback(null, config);
            }
        });
    });
}

router.post('/sendMail', (req, res) => {
    const { to, subject, text } = req.query;

    getSMTPConfig((error, config) => {
        if (error) {
            return res.status(500).json({ error: 'Failed to retrieve SMTP configuration' });
        }

        // 检查是否缺少凭据
        if (!config.user || !config.pass) {
            return res.status(500).json({ error: 'Missing SMTP credentials' });
        }

        const transporter = nodemailer.createTransport({
            host: config.host,
            port: config.port,
            secure: config.secure === 'SSL', // true for 465, false for other ports
            auth: {
                user: config.user,
                pass: config.pass
            }
        });

        const mailOptions = {
            from: config.user,
            to: to,
            subject: subject,
            text: text
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                return res.status(500).json({ error: 'Failed to send email', details: error.message });
            }
            res.status(200).json({ message: 'Email sent successfully', info: info });
        });
    });
});
module.exports = router;