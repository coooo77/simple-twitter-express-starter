'use strict';
module.exports = (sequelize, DataTypes) => {
  const Tweet = sequelize.define('Tweet', {
    description: DataTypes.TEXT,
    UserId: DataTypes.INTEGER,
    location: DataTypes.STRING,
    latitude: DataTypes.FLOAT,
    longitude: DataTypes.FLOAT
  }, {});
  Tweet.associate = function (models) {
    Tweet.hasMany(models.Reply)
    Tweet.belongsTo(models.User)
    Tweet.belongsToMany(models.User, {
      through: models.Like,
      foreignKey: 'TweetId',
      as: 'LikedUsers'
    })
    Tweet.hasMany(models.Like)
  };
  return Tweet;
};