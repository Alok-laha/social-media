const express = require('express');
const cors = require('cors');
const server = express();
require('dotenv').config();
const {shards, shardCount} = require('./config/db');
const {seedDatabase, insertTimelinePosts} = require('./config/seeder');
const routers = require('./routes/index');

server.use(cors());
server.use(express.json());
server.use(routers);

const port = process.env.PORT || 8000;
server.listen(port, () => {
    console.log(`Social media backend is running on port ${port}`);
});

async function validateDBInstanceAndSeedDB(shardIndex) {
    try {
        await shards[shardIndex].authenticate();
        console.log('Connection has been established successfully with shard - ', shardIndex);
    } catch (error) {
        console.error('Unable to connect to the database:', error);
    }
}
for(let count = 0;count < shardCount; count++) {
    validateDBInstanceAndSeedDB(count);
}
// seedDatabase();
// insertTimelinePosts(2, 0, 10);

server.get('/', (req, res) => res.status(200).send("Welcome to social media backend"));