'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Tweets', 'location', {
      type: Sequelize.STRING
    })
    await queryInterface.addColumn('Tweets', 'latitude', {
      type: Sequelize.FLOAT
    })
    return queryInterface.addColumn('Tweets', 'longitude', {
      type: Sequelize.FLOAT
    })
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Tweets', 'location')
    await queryInterface.removeColumn('Tweets', 'latitude')
    return queryInterface.removeColumn('Tweets', 'longitude')
  }
};
