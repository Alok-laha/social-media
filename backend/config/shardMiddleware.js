const { shardCount } = require('./db');
const shardModels = require('./shardModels');

// Simple mod-based sharding function
function getShard(userId) {
  const shardIndex = userId % shardCount;
  return shardModels[shardIndex]; // returns { sequelize, User }
}

module.exports = {getShard};