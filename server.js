const http = require('http');
const express = require('express');
const app = express();
const mysql = require('mysql2');
const cors = require('cors')
const bodyParser = require('body-parser');
const hostname = '127.0.0.1';
const port = 3000;
const fs = require('fs');

const  { readFileSync } = require("fs");
var path  = require("path");
let cer_part = path.join(process.cwd(),'isrgrootx1.pem')


const db = mysql.createConnection({
    host: 'gateway01.us-west-2.prod.aws.tidbcloud.com',
    user: '24snuJdD7cZ1NAc.root',
    password: 'PpumsFpwaScE99ao',
    database: 'test',
    port: '4000',
    ssl:{
        ca:fs.readFileSync(cer_part)
    }
    });

app.use(cors())
app.use(express.json())
app.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`);
});



app.post('/register', (req, res) => {
    const { username, password, email, age, gender } = req.body;
    const sql = 'INSERT INTO users (username, password, email, age, gender) VALUES (?, ?, ?, ?, ?)';
    db.query(sql, [username, password, email, age, gender], (err, result) => {
        if (err) return res.status(500).json(err);
        res.status(201).json({ id: result.insertId, username, email, age, gender });
    });
});

app.post('/login', (req, res) => {
    const { username, password } = req.body;
    const sql = 'SELECT * FROM users WHERE username = ? AND password = ?';
    db.query(sql, [username, password], (err, results) => {
        if (err) return res.status(500).json(err);
        if (results.length > 0) {
            res.status(200).json(results[0]);
        } else {
            res.status(401).json({ message: 'Invalid credentials' });
        }
    });
});

app.get('/users', (req, res) => {
    const sql = 'SELECT * FROM users';
    db.query(sql, (err, results) => {
        if (err) return res.status(500).json(err);
        res.json(results);
    });
});
