// config/redisConfig.js

// Make sure you've installed it: npm install redis
const { createClient } = require('redis');

let redisClient = null; // Declare a variable to hold the single Redis client instance
let clientPromise = null; // To store the promise of connection, to ensure single connection attempt

/**
 * Initializes and returns the Redis client instance.
 * Ensures that the Redis client is only created and connected once.
 * @returns {Promise<ReturnType<typeof createClient>>} A promise that resolves to the connected Redis client instance.
 */
async function getRedisClient() {
    // If the connection promise doesn't exist, create it
    if (!clientPromise) {
        clientPromise = (async () => { // Wrap the connection logic in an async IIFE
            redisClient = createClient({
                url: process.env.REDIS_URL || 'redis://localhost:6379', // Recommended way to configure with URL
                password: process.env.REDIS_PASSWORD || undefined, // If you have a password
                // Other client options if needed:
                // socket: {
                //     connectTimeout: 5000 // 5 seconds
                // }
            });

            // Add event listeners for logging connection status
            redisClient.on('connect', () => {
                console.log('Redis client connecting...');
            });

            redisClient.on('ready', () => {
                console.log('Redis client connected and ready.'); // This is when it's fully established
            });

            redisClient.on('error', (err) => {
                console.error('Redis client error:', err);
                // Important: ClientClosedError is an 'error' event.
                // You might need to handle reconnections based on your setup.
                // For a simple app, just logging might be enough.
            });

            redisClient.on('end', () => {
                console.log('Redis client connection closed.');
            });

            console.log('Attempting Redis client connection for the first time...');
            await redisClient.connect(); // Explicitly connect the client
            return redisClient;
        })();
    }

    // Await the promise to ensure the client is connected before returning
    return await clientPromise;
}

// Export the function to get the Redis client
module.exports = {
    getRedisClient,
};