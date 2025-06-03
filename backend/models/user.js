module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    username: DataTypes.STRING,
    email: DataTypes.STRING,
    password: DataTypes.STRING,
    profilePicture: DataTypes.STRING,
    bio: DataTypes.STRING,
    createdAt: DataTypes.DATE
  }, {
    tableName: 'users',
    timestamps: false,
    indexes: [
      // Create a unique index on email
      {
        unique: true,
        fields: ['email']
      }
    ],
  });

  return User;
};
