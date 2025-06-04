module.exports = (sequelize, DataTypes) => {
  const Likes = sequelize.define('Likes', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    userId: DataTypes.INTEGER,
    postId: DataTypes.INTEGER,
    createdAt: DataTypes.DATE
  }, {
    tableName: 'likes',
    timestamps: false,
    indexes: [],
  });

  return Likes;
};
