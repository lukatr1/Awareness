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

// increment the Games section
const incrementGamesPlayed = async (userId, isCorrect) => {
    try {
        await db.execute(
            'UPDATE users SET games_played = games_played + 1 WHERE id = ?',
            [userId]
        );

        if (isCorrect) {
            await db.execute(
                'UPDATE users SET correct_attempts = correct_attempts + 1 WHERE id = ?',
                [userId]
            );
        } else {
            await db.execute(
                'UPDATE users SET incorrect_attempts = incorrect_attempts + 1 WHERE id = ?',
                [userId]
            );
        }

        // Update success and failure rates
        await db.execute(`
            UPDATE users 
            SET success_rate = (correct_attempts / games_played) * 100,
                failure_rate = (incorrect_attempts / games_played) * 100
            WHERE id = ?
        `, [userId]);

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

// timing code
let startTime;

const setGameStartTime = () => {
    startTime = Date.now(); 
};

// Method to set game end time and calculate the time taken
const setGameEndTime = async (userId) => {
    try {
        const endTime = Date.now(); 
        const timeTaken = (endTime - startTime) / 1000; // Time taken in seconds

        // Fetch current game stats from the database
        const [result] = await db.execute(
            `SELECT average_completion_time, games_played 
             FROM users WHERE id = ?`, 
            [userId]
        );

        if (result.length === 0) {
            throw new Error(`No user found with id: ${userId}`);
        }

        const { average_completion_time, games_played } = result[0];

        const newGamesPlayed = games_played + 1;

        // Check if this is the first game and handle NULL average time
        let newAverageTime;
        if (average_completion_time === null) {
            // If its the first game, set the average to the time taken
            newAverageTime = timeTaken;
        } else {
            // Calculate the new average time
            newAverageTime = ((average_completion_time * games_played) + timeTaken) / newGamesPlayed;
        }

        // validate so its in a reasonable range (24h)
        if (newAverageTime < 0 || newAverageTime > 86400) { 
            throw new Error("Calculated average time is out of valid range.");
        }

        // Update stats of user
        await db.execute(
            `UPDATE users 
             SET average_completion_time = ?
             WHERE id = ?`, 
            [newAverageTime, userId]
        );

        return timeTaken; 
    } catch (error) {
        throw new Error('Database Error: ' + error.message);
    }
};


module.exports = {
    registerUser,
    findUserByEmail,
    getUserById,
    incrementGamesPlayed,
    setGameStartTime,
    setGameEndTime,
    getAllUsers
};