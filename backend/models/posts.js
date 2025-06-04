module.exports = (sequelize, DataTypes) => {
  const Post = sequelize.define('Post', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    userId: DataTypes.INTEGER,
    content: DataTypes.STRING,
    imageUrl: DataTypes.STRING,
    createdAt: DataTypes.DATE
  }, {
    tableName: 'posts',
    timestamps: false,
    indexes: [],
  });

  return Post;
};
