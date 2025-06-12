const express = require('express');
const cors = require('cors');
const server = express();
require('dotenv').config();
const { shards, shardCount } = require('./config/db');
const { seedDatabase, insertTimelinePosts } = require('./config/seeder');
const routers = require('./routes/index');
const {getRedisClient} = require('./config/redis');

let app;
let redisClient;
async function initiateServer() {
    server.use(cors());
    server.use(express.json());
    server.use(routers);

    const port = process.env.PORT || 8000;
    app = server.listen(port, () => {
        console.log(`Social media backend is running on port ${port}`);
    });

    redisClient = await getRedisClient();
    await redisClient.set("name", "Secial media redis");
    console.log(await redisClient.get("name"))

    async function validateDBInstanceAndSeedDB(shardIndex) {
        try {
            await shards[shardIndex].authenticate();
            console.log('Connection has been established successfully with shard - ', shardIndex);
        } catch (error) {
            console.error('Unable to connect to the database:', error);
        }
    }
    for (let count = 0; count < shardCount; count++) {
        validateDBInstanceAndSeedDB(count);
    }
    // seedDatabase();
    // insertTimelinePosts(0, 0, 10);
    // insertTimelinePosts(1, 0, 10);
    // insertTimelinePosts(2, 0, 10);

}

async function gracefulShutdown() {
    console.log('\nStarting graceful shutdown...');

    // Close Express server first to stop accepting new requests
    if (app) {
        await new Promise(resolve => app.close(resolve));
        console.log('Express server closed.');
    }

    // Close MySQL connection pool
    for (let count = 0; count < shardCount; count++) {
        try {
            await shards[count].close();
            console.log('Connection has been closed successfully with shard - ', count);
        } catch (error) {
            console.error('Unable to close database connection:', error);
        }
    }

    // Close Redis client connection
    if (redisClient) {
        try {
            await redisClient.quit(); // Use .quit() for a graceful disconnect
            console.log('Redis client disconnected.');
        } catch (error) {
            console.error('Error closing Redis client:', error);
        }
    }

    console.log('All connections closed. Exiting process.');
    process.exit(0); // Exit cleanly
}

// --- 4. Listen for termination signals ---
// SIGINT is sent when you press Ctrl+C in the terminal
process.on('SIGINT', () => {
    console.log('Received SIGINT signal. Initiating graceful shutdown...');
    gracefulShutdown();
});

// SIGTERM is sent by process managers (like Docker, Kubernetes, systemd) to terminate a process
process.on('SIGTERM', () => {
    console.log('Received SIGTERM signal. Initiating graceful shutdown...');
    gracefulShutdown();
});

// Optional: Catch unhandled promise rejections and uncaught exceptions
// This is good practice for logging, but should ideally lead to graceful shutdown
process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    // Optionally, trigger graceful shutdown here, though a crash might be imminent
    // gracefulShutdown();
});

process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err);
    // This is a sign of a serious bug. Log and then exit.
    // gracefulShutdown(); // You might attempt a shutdown, but it's less reliable here
    process.exit(1); // Exit with an error code
});

initiateServer();