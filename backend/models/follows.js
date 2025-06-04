module.exports = (sequelize, DataTypes) => {
  const Follows = sequelize.define('Follows', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    followerId: DataTypes.INTEGER,
    followedId: DataTypes.INTEGER,
    createdAt: DataTypes.DATE
  }, {
    tableName: 'follows',
    timestamps: false,
    indexes: [],
  });

  return Follows;
};
