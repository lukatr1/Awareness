/*
const express = require('express')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const db = require('./db')


const router = express.Router();

router.post('/register', async (req, res) => {
    try {
        const { username, email, password } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        const [rows, fields] = await db.execute('INSERT INTO users (username, email, password) VALUES (?, ?, ?)', [username, email, hashedPassword]);
        res.status(201).json({message: 'User registered successfully' })

    } catch (error) {
        console.error('Error registering user:', error);
        res.status(500).json({message: 'Server Error' });
    }
});

router.post('/login', async (req, res) => {
    try {
        const {email, password } = req.body;
        const [rows, fields] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);
        if (rows.length === 0) {
            return res.status(400).json({ message: 'Invalid Credentials'})
        }
        const user = rows[0];
        const isPasswordMatch = await bcrypt.compare(password, user.password);
        if (!isPasswordMatch) {
            return res.status(400).json({message: 'Invalide Credentials' });
        }
        const token = jwt.sign({ userID: user.id }, 'secretKey', {expiresIn: '1h'});
        res.json({ token });
    } catch (error) {
        console.error('Error logging in:', error)
        res.status(500).json({ message: 'Server Error' });
    }
})

// Middleware to verify JWT token
function verifyToken(req, res, next) {
    const token = req.header('Authorization');
    if(!token) {
        return res.status(401).json({message: 'Access Denied'})
    }
    
    try {
        const decoded = jwt.verify(
            token.split(" ")[1],
            'secretKey'
        );
        req.user = decoded;
        next();
    } catch (error) {
        console.error('Error verifying token:', error)
        res.status(401).json({ message: 'Invalid Token' });
    }
}





// Protected Route to get user info
router.get('/userinfo', verifyToken, async (req, res) => {
    try {
        const userID = req.user.userID;
        const [rows, fields] = await db.execute('SELECT * FROM users WHERE id = ?', [userID]);
        if (rows.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json({ user: rows[0] });        
    } catch (error) {
        console.error('Error fetching user info:', error);
        res.status(500).json({message: 'Server Error'})
    }
});


module.exports = router;

*/