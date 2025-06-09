const { shards } = require('./db');
const UserModel = require('../models/user');
const PostModel = require('../models/posts');
const FollowsModel = require('../models/follows');
const LikesModel = require('../models/likes');
const CommentsModel = require('../models/comments');
const TimelineModel = require('../models/timeline');
const DataTypes = require('sequelize').DataTypes;


const shardModels = shards.map(sequelize => ({
  sequelize,
  User: UserModel(sequelize, DataTypes),
  Post: PostModel(sequelize, DataTypes),
  Follow: FollowsModel(sequelize, DataTypes),
  Like: LikesModel(sequelize, DataTypes),
  Comment: CommentsModel(sequelize, DataTypes),
  Timeline: TimelineModel(sequelize, DataTypes)
}));

module.exports = shardModels;