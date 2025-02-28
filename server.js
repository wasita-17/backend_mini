const http = require('http');
const express = require('express');
const app = express();
const mysql = require('mysql2');
const cors = require('cors');
const bodyParser = require('body-parser');
const hostname = '127.0.0.1';
const port = 3000;
const fs = require('fs');

const { readFileSync } = require('fs');
const path = require('path');
let certPath = path.join(process.cwd(), 'isrgrootx1.pem');

const connection = mysql.createConnection({
    host: 'gateway01.us-west-2.prod.aws.tidbcloud.com',
    user: '24snuJdD7cZ1NAc.root',
    password: 'PpumsFpwaScE99ao',
    database: 'test',
    port: '4000',
    ssl: {
        ca: fs.readFileSync(certPath)
    }
});

connection.connect(err => {
    if (err) {
        console.error('Database connection failed: ' + err.stack);
        return;
    }
    console.log('Connected to database.');
});

app.use(cors())
app.use(express.json())
app.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`);
});

var urlencodedParser = bodyParser.urlencoded({ extended: false })

app.get('/', (req, res) => {
    res.json({
        "Name":"MINI PROJECT",
        "Author":"PAMWEIR",
        "APIs":[
            {"api_name":"/getUsers/","method":"get"},
            {"api_name":"/getUsers/:id","method":"get"},
            {"api_name":"/addUsers/","method":"post"},
            {"api_name":"/editUsers/","method":"put"},
            {"api_name":"/editUsers/","method":"delete"},
        ]
    });
});

app.get('/Users', (req, res) => {
    let sql = 'SELECT * FROM Users;';
    connection.query(sql, function(err, results, fields) {
        res.json(results);
      }
    );
});

app.get('/Users/:id', (req, res) => {
    let id = req.params.id;
    let sql = 'SELECT * FROM Users WHERE user_id = ?';
    connection.query(sql,[id], function(err, results, fields) {
          res.json(results);
        }
      );
});

app.post('/Users', (req, res) => {
    console.log(req.body);
    let sql = 'INSERT INTO users (user_name, password, email, age, gender) VALUES (?, ?, ?, ?, ?)';
    let values = [req.body.user_name, req.body.password, req.body.email, req.body.age, req.body.gender];
    let message = "Cannot Insert";
    connection.query(sql,values, function(err, results, fields) {
      if(results) { message = "Inserted";}
          res.json({error:false,data:results,msg:message});
        }
      );
});

app.post('/login',urlencodedParser,  (req, res) => {
    const { user_name, password } = req.body;
    const sql = 'SELECT * FROM users WHERE user_name = ? AND password = ?';
    connection.query(sql, [user_name, password], (err, results) => {
        if (err) return res.status(500).json({ message: 'Database error' });
        if (results.length > 0) {
            res.status(200).json({ valid: true, user: results[0] });
        } else {
            res.status(401).json({ message: 'Invalid credentials' });
        }
    });
});

app.post('/healthdata', urlencodedParser, (req, res) => {
    const { user_id, weight, height, record_date } = req.body;
    const heightInMeters = height / 100; // แปลง cm เป็น m
    const bmi = (weight / (heightInMeters ** 2)).toFixed(1); // คำนวณ BMI และปัดเป็นทศนิยม 1 ตำแหน่ง

    const sql = 'INSERT INTO health_data (user_id,weight, height, bmi, record_date) VALUES (?,?, ?, ?, ?)';
    connection.query(sql, [user_id, weight, height, bmi, record_date], (err, result) => {
        if (err) return res.status(500).json({ message: 'Database error', error: err });
        res.status(201).json({ message: 'Health data saved successfully', bmi , record_id: result.insertId });
    });
});