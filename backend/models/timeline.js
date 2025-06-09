module.exports = (sequelize, DataTypes) => {
  const Timeline = sequelize.define('Timeline', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    followerId: DataTypes.INTEGER,
    content: DataTypes.STRING(2000),
    imageUrl: DataTypes.STRING(250),
    likesCount: DataTypes.INTEGER,
    commentsCount: DataTypes.INTEGER,
    createdAt: DataTypes.DATE
  }, {
    tableName: 'timeline_posts',
    timestamps: false,
    indexes: [
      {
        fields: ['followerId']
      }
    ],
  });

  return Timeline;
};
