module.exports = (sequelize, DataTypes) => {
  const Comments = sequelize.define('Comments', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    userId: DataTypes.INTEGER,
    postId: DataTypes.INTEGER,
    content: DataTypes.STRING,
    createdAt: DataTypes.DATE
  }, {
    tableName: 'comments',
    timestamps: false,
    indexes: [],
  });

  return Comments;
};
