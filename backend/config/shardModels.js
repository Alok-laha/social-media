const { shards } = require('./db');
const UserModel = require('../models/user');
const PostModel = require('../models/posts');
const FollowsModel = require('../models/follows');
const LikesModel = require('../models/likes');
const CommentsModel = require('../models/comments');


const shardModels = shards.map(sequelize => ({
  sequelize,
  User: UserModel(sequelize, require('sequelize').DataTypes),
  Post: PostModel(sequelize, require('sequelize').DataTypes),
  Follow: FollowsModel(sequelize, require('sequelize').DataTypes),
  Like: LikesModel(sequelize, require('sequelize').DataTypes),
  Comment: CommentsModel(sequelize, require('sequelize').DataTypes),
}));

module.exports = shardModels;