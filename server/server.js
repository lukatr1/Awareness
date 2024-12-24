const http = require('http');
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const session = require('express-session');
// const { cookie } = require('har-validator');
require('dotenv').config({path: './server/.env'});
const app = express();

// set port
const port = 3000;

// set view engine to ejs
app.set('view engine', 'ejs');

// set path 
app.set('views', path.join(__dirname, 'files', 'HTML'));

// make all files in path "/files" static
app.use(express.static(__dirname + "/files"))

app.use(bodyParser.urlencoded({ extended: true }));

app.use(bodyParser.json());

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, "files", "HTML", "index.html"))
})




/*
app.use(session({
    // take Secret from .env
    secret: process.env.SECRET,
    // 1 hour 
    cookie: { maxAge: 360000 },
    saveUninitialized: false,
    resave: true,
  }))   
*/



app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
  });
  


 