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

/*
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
*/

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

// Function to update game start time
const setGameStartTime = async (userId) => {
    try {
        await db.execute(
            'UPDATE users SET last_game_start = CURRENT_TIMESTAMP WHERE id = ?',
            [userId]
        );
    } catch (error) {
        throw new Error('Database Error: ' + error.message);
    }
};

// Function to update game end time and return time taken
const setGameEndTime = async (userId) => {
    try {
        await db.execute(
            'UPDATE users SET last_game_end = CURRENT_TIMESTAMP WHERE id = ?',
            [userId]
        );

        // Get time taken for the last game
        const [result] = await db.execute(
            `SELECT TIMESTAMPDIFF(SECOND, last_game_start, last_game_end) AS timeTaken, 
                    average_completion_time, games_played
             FROM users WHERE id = ?`,
            [userId]
        );

        if (result.length === 0) {
            throw new Error(`No user found with id: ${userId}`);
        }

        const { timeTaken, average_completion_time, games_played } = result[0];

        if (timeTaken === null) {
            throw new Error(`Game time could not be calculated for user: ${userId}`);
        }

        const newGamesPlayed = games_played + 1;
        const newAverageTime = ((average_completion_time * games_played) + timeTaken) / newGamesPlayed;

        await db.execute(
            `UPDATE users 
             SET average_completion_time = ?, 
                 games_played = ?
             WHERE id = ?`,
            [newAverageTime, newGamesPlayed, userId]
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