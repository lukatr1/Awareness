const mysql = require("mysql2");
require('dotenv').config({ path: './server/.env' });

// Create a connection pool
const pool = mysql.createPool({
    host: "localhost",
    user: "root",
    password: process.env.DB_PW,
    database: 'Awareness',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Export the pool
const db = pool.promise();

// Function to register a user
const registerUser = async (username, email, hashedPassword) => {
    try {
        const result = await db.execute(
            'INSERT INTO users (username, email, password) VALUES (?, ?, ?)', 
            [username, email, hashedPassword]
        );
        return result;
    } catch (error) {
        throw new Error('Database Error: ' + error.message);
    }
};

// Function to find a user by email
const findUserByEmail = async (email) => {
    try {
        const [rows] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);
        return rows;
    } catch (error) {
        throw new Error('Database Error: ' + error.message);
    }
};

// Function to get user info by ID
const getUserById = async (userID) => {
    try {
        const [rows] = await db.execute('SELECT * FROM users WHERE id = ?', [userID]);
        return rows;
    } catch (error) {
        throw new Error('Database Error: ' + error.message);
    }
};

const incrementGamesPlayed = async (userId, isCorrect) => {
    try {
        await db.execute(
            'UPDATE users SET games_played = games_played + 1 WHERE id = ?',
            [userId]
        );
    } catch (error) {
        throw new Error('Database Error: ' + error.message);
    }
};

// Function to fetch all users
const getAllUsers = async () => {
    try {
        const [rows] = await db.execute('SELECT * FROM users');
        return rows;
    } catch (error) {
        throw new Error('Database Error: ' + error.message);
    }
};


module.exports = {
    registerUser,
    findUserByEmail,
    getUserById,
    incrementGamesPlayed,
    getAllUsers
};