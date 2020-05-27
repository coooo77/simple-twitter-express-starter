'use strict';
const bcrypt = require('bcrypt-nodejs')
const faker = require('faker')

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('Users', [{
      email: 'root@example.com',
      password: bcrypt.hashSync('12345678', bcrypt.genSaltSync(10), null),
      name: 'root',
      avatar: 'https://loremflickr.com/320/240/man,girl/?random=${Math.random() * 100}',
      introduction: faker.lorem.text(),
      role: 'Admin',
      createdAt: new Date(),
      updatedAt: new Date()
    }, {
      email: 'user1@example.com',
      password: bcrypt.hashSync('12345678', bcrypt.genSaltSync(10), null),
      name: 'user1',
      avatar: 'https://loremflickr.com/320/240/man,girl/?random=${Math.random() * 100}',
      introduction: faker.lorem.text(),
      role: 'User',
      createdAt: new Date(),
      updatedAt: new Date()
    }, {
      email: 'user2@example.com',
      password: bcrypt.hashSync('12345678', bcrypt.genSaltSync(10), null),
      name: 'user2',
      avatar: 'https://loremflickr.com/320/240/man,girl/?random=${Math.random() * 100}',
      introduction: faker.lorem.text(),
      role: 'User',
      createdAt: new Date(),
      updatedAt: new Date()
    }], {});

    const users = await queryInterface.sequelize.query(
      `SELECT id from USERS;`
    );

    const usersRow = users[0]

    await queryInterface.bulkInsert('Tweets',
      Array.from({ length: 10 }).map(d =>
        ({
          UserId: usersRow[0].id,
          description: faker.lorem.text(),
          createdAt: new Date(),
          updatedAt: new Date()
        })
      ), {});

    await queryInterface.bulkInsert('Tweets',
      Array.from({ length: 10 }).map(d =>
        ({
          UserId: usersRow[1].id,
          description: faker.lorem.text(),
          createdAt: new Date(),
          updatedAt: new Date()
        })
      ), {});

    return await queryInterface.bulkInsert('Tweets',
      Array.from({ length: 10 }).map(d =>
        ({
          UserId: usersRow[2].id,
          description: faker.lorem.text(),
          createdAt: new Date(),
          updatedAt: new Date()
        })
      ), {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('Users', null, {})
    return await queryInterface.bulkDelete('Tweets', null, {})
  }
};
