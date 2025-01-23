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
    cookie: { maxAge: 3000000 },
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
app.get('/githubGame', (req, res) => res.sendFile(path.join(__dirname, "files", "HTML", "githubGame.html")));

app.get('/quiz', (req, res) => res.sendFile(path.join(__dirname, "files", "HTML", "quiz.html")));


app.get('/githubOpt2', (req, res) => res.sendFile(path.join(__dirname, "files", "gameSites", "githubOpt2.html")));
app.get('/githubOpt1', (req, res) => res.sendFile(path.join(__dirname, "files", "gameSites", "githubOpt1.html")));
//app.get('/NetflixReal', (req, res) => res.sendFile(path.join(__dirname, "files", "gameSites", "NetflixReal.html")));

app.get('/revealWon', (req, res) => res.sendFile(path.join(__dirname, "files", "gameSites", "revealWon.html")));
app.get('/revealCongrat', (req, res) => res.sendFile(path.join(__dirname, "files", "gameSites", "revealCongrat.html")));


app.get('/LinkedinOpt1', (req, res) => res.sendFile(path.join(__dirname, "files", "gameSites", "LinkedinOpt1.html")));
app.get('/LinkedinOpt2', (req, res) => res.sendFile(path.join(__dirname, "files", "gameSites", "LinkedinOpt2.html")));

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

app.post('/revealWon',(req, res) => {
    const username = req.body.username || "";
    const password = req.body.password || "";

    req.session.username = username;
    req.session.password = password;

    res.status(200).set("Content-Type", "text/plain").send("OK");
    
});





app.post('/submit', (req, res) => {
    const username1 = req.body.username || "";
    const password1 = req.body.password || "";
    const userAgent1 = req.body.userAgent || "";
    const platform1 = req.body.platform || "";

    let ip1 = req.body.ip || "";

    if (!ip1) {
        ip1 = req.headers["x-forwarded-for"] || req.socket.remoteAddress || "Unknown IP";
    }

    req.session.username = username1;
    req.session.password = password1;
    req.session.ip = ip1;
    req.session.userAgent = userAgent1;
    req.session.platform = platform1;

    console.log(`Username: ${username1}`);
    console.log(`Password: ${password1}`);
    console.log(`IP: ${ip1}`);
    console.log(`User-Agent: ${userAgent1}`);
    console.log(`Platform: ${platform1}`);


    // Save the session explicitly
    req.session.save(err => {
        if (err) {
            console.error("Session save error:", err);
            return res.status(500).json({ message: "Failed to save session" });
        }

        // Send response after session is saved
        res.status(200).set("Content-Type", "text/plain").send("OK");
    });
});


app.get('/credentials', (req, res) => {
    console.log("Fetching from session:", req.session.username, req.session.password);
    res.json({
        username: req.session.username || "N/A",
        password: req.session.password || "N/A",
        ip: req.session.ip || "N/A",
        userAgent: req.session.userAgent || "N/A",
        platform: req.session.platform || "N/A"
    });
});

app.get("/getUser", async (req, res) => {
    if (!req.session.userId) {
        return res.status(401).json({ message: "User not logged in" });
    }
    
    try {
        const user = await db.getUserById(req.session.userId);
        if (user.length === 0) {
            return res.status(404).json({ message: "User not found" });
        }
        res.json(user[0]); 
    } catch (error) {
        res.status(500).json({ message: "Database Error", error: error.message });
    }
});



const port = 3000;
app.listen(port, () => console.log(`Server running on http://localhost:${port}`));