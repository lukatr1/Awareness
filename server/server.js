const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const session = require('express-session');
const bcrypt = require('bcrypt');
const db = require('./db'); 

require('dotenv').config({ path: './server/.env' });

const app = express();
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(session({
    secret: process.env.AUTH_KEY,
    cookie: { maxAge: 30000 },
    saveUninitialized: false,
    resave: true
}));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'files', 'HTML'));
app.use(express.static(__dirname + "/files"));

app.get('/', (req, res) => {
    if (req.session.authenticated) {
        res.sendFile(path.join(__dirname, "files", "HTML", "index.html"));
    } else {
        res.sendFile(path.join(__dirname, "files", "HTML", "login.html"));
    }
});

app.post('/register', async (req, res) => {
    try {
        const { username, email, password } = req.body;
        if (!password) return res.status(400).json({ message: 'Password is required' });

        // Check if the user already exists
        const existingUser = await db.findUserByEmail(email);
        if (existingUser.length > 0) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        await db.registerUser(username, email, hashedPassword);  

        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});


app.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const rows = await db.findUserByEmail(email);  

        if (rows.length === 0) return res.status(400).json({ message: 'Invalid Credentials' });

        const user = rows[0];
        const isPasswordMatch = await bcrypt.compare(password, user.password);
        if (!isPasswordMatch) return res.status(400).json({ message: 'Invalid Credentials' });

        req.session.authenticated = true;
        req.session.userId = user.id;
        req.session.email = user.email;

        req.session.save((err) => {
            if (err) return res.status(500).json({ message: 'Session save error' });
            res.json({ message: 'Login successful' });
        });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

app.get('/userinfo', async (req, res) => {
    try {
        const userID = req.session.userId;
        const rows = await db.getUserById(userID); 
        if (rows.length === 0) return res.status(404).json({ message: 'User not found' });

        res.json({ user: rows[0] });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

app.get('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) return res.status(500).json({ message: 'Logout failed' });
        res.redirect('/login');
    });
});

app.get('/register', (req, res) => res.sendFile(path.join(__dirname, "files", "HTML", "register.html")));
app.get('/login', (req, res) => res.sendFile(path.join(__dirname, "files", "HTML", "login.html")));

app.get('/netflixGame', (req, res) => res.sendFile(path.join(__dirname, "files", "HTML", "netflixGame.html")));
app.get('/LinkedinGame', (req, res) => res.sendFile(path.join(__dirname, "files", "HTML", "LinkedinGame.html")));


app.get('/NetflixFake', (req, res) => res.sendFile(path.join(__dirname, "files", "gameSites", "NetflixFake.html")));
app.get('/NetflixReal', (req, res) => res.sendFile(path.join(__dirname, "files", "gameSites", "NetflixReal.html")));


app.get('/LinkedinReal', (req, res) => res.sendFile(path.join(__dirname, "files", "gameSites", "LinkedinReal.html")));
app.get('/LinkedinFake', (req, res) => res.sendFile(path.join(__dirname, "files", "gameSites", "LinkedinFake.html")));

app.post('/vote', async (req, res) => {
    if (!req.session.authenticated) {
        return res.status(401).json({ message: 'User not authenticated' });
    }

    try {
        const { selectedOption, correctOption } = req.body;
        const userId = req.session.userId;

        // Check if the answer is correct
        const isCorrect = selectedOption === correctOption;

        // Update user stats in the database
        await db.incrementGamesPlayed(userId, isCorrect);

        res.json({ message: isCorrect ? "Correct choice!" : "Wrong choice!" });
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
});



const port = 3000;
app.listen(port, () => console.log(`Server running on http://localhost:${port}`));