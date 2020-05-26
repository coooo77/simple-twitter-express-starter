'use strict';
module.exports = (sequelize, DataTypes) => {
  const Tweet = sequelize.define('Tweet', {
    description: DataTypes.STRING,
    UserId: DataTypes.INTEGER
  }, {});
  Tweet.associate = function (models) {
    Tweet.belongsTo(models.User)
  };
  return Tweet;
};