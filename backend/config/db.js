// Database connectivity source
const { Sequelize } = require('sequelize');

const shardCount = 3;
const shards = [];

for (let i = 0; i < shardCount; i++) {
  const sequelize = new Sequelize(`social_shard_${i}`, process.env.DB_USERNAME, process.env.DB_PASSWORD, {
    host: process.env.DB_HOST,
    dialect: process.env.DB_DIALECT,
    logging: false,
  });
  shards.push(sequelize);
}

module.exports = { shards, shardCount };