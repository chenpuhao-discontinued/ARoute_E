const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const router = express.Router();

function createConnection() {
    return new sqlite3.Database(path.join(__dirname, '../../ARoute.db'));
}

router.get('/getWebsiteName', (req, res) => {
    const db = createConnection();
    db.get(`SELECT value FROM System_info WHERE name = 'website_name'`, (error, row) => {
        db.close();
        if (error) {
            return res.status(500).json({ error: 'Failed to retrieve website name' });
        }
        if (row) {
            res.status(200).json({ website_name: row.value });
        } else {
            res.status(404).json({ error: 'Website name not found' });
        }
    });
});

module.exports = router;