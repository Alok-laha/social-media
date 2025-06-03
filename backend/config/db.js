// Database connectivity source
const Sequelize = require('sequelize');
const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USERNAME, process.env.DB_PASSWORD, {
  host: process.env.DB_HOST,
  dialect: process.env.DB_DIALECT
});
const User = require('../models/user')(sequelize, Sequelize.DataTypes);
const db = {};

db.sequelize = sequelize;
db.users = User;

module.exports = db;