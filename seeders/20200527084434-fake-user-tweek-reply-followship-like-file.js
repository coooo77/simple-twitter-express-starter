'use strict';
const bcrypt = require('bcrypt-nodejs')
const faker = require('faker')
const db = require('../models')
const User = db.User
const Tweet = db.Tweet

function getRandomFollower(numOfFollower, userId, array) {
  const newArray = [...array]
  newArray.splice(array.indexOf(userId), 1)
  for (let i = newArray.length - 1; i > 0; i--) {
    let randomIndex = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[randomIndex]] = [newArray[randomIndex], newArray[i]]
  }
  const result = newArray.map(id => ({
    followerId: userId,
    followingId: id,
    createdAt: new Date(),
    updatedAt: new Date()
  }))
  return result.splice(0, numOfFollower)
}

module.exports = {
  up: async (queryInterface, Sequelize) => {

    const userIdList = Array.from(Array(15).keys())
    // user1、user2已經被使用，先移除
    userIdList.splice(1, 2)
    await queryInterface.bulkInsert('Users', userIdList.map(id => ({
      email: `user${id}@example.com`,
      password: bcrypt.hashSync('12345678', bcrypt.genSaltSync(10), null),
      name: `user${id}`,
      avatar: 'https://loremflickr.com/320/240/man,girl/?random=${Math.random() * 100}',
      introduction: faker.lorem.text(),
      role: id % 4 === 0 ? 'Admin' : 'User',
      createdAt: new Date(),
      updatedAt: new Date()
    })))

    const users = await User.findAll({
      raw: true,
      nest: true,
      include: [Tweet]
    })
    const tweets = await Tweet.findAll({
      raw: true,
      nest: true,
      include: [User]
    })

    const tempUserId = users.map(user => user.id)
    // 不知道為什麼userId產生重複id，所以先把重複id刪除
    const userId = [...new Set(tempUserId)]
    const tempTweetId = tweets.map(tweet => tweet.id)
    // 保險起見tweetId也刪除重複id
    const tweetId = [...new Set(tempTweetId)]

    await queryInterface.bulkInsert('Tweets',
      Array.from({ length: 30 }).map(d =>
        ({
          UserId: userId[Math.floor(Math.random() * userId.length)],
          description: faker.lorem.text(),
          createdAt: new Date(),
          updatedAt: new Date()
        })
      ), {});


    await queryInterface.bulkInsert('Replies',
      Array.from({ length: 10 }).map(d =>
        ({
          TweetId: tweetId[Math.floor(Math.random() * tweetId.length)],
          UserId: userId[Math.floor(Math.random() * userId.length)],
          comment: faker.lorem.text(),
          createdAt: new Date(),
          updatedAt: new Date()
        })
      ), {});

    const dataForFollowships = []
    userId.map(id => {
      const maxFollower = 6
      const randomFollowers = Math.floor(Math.random() * maxFollower)
      const data = getRandomFollower(randomFollowers, id, userId)
      insertData.push(...data)
    })
    await queryInterface.bulkInsert('Followships',
      dataForFollowships, {});

    const dataForLikses = []
    await userId.forEach(async (id) => {
      // 每個使用者至少有一個likes
      const minLikes = 1
      // 每個使用者至多有額外5個likes
      const maxAddtionLikes = 5
      // 取隨機like數量
      const numOfLikes = Math.floor(Math.random() * maxAddtionLikes) + minLikes
      // 把使用者的tweekId輸出成陣列
      const tweekIdOfUser = tweets.filter(tweet => tweet.UserId === id).map(tweet => tweet.id)
      // 把所有的tweekId輸出成陣列
      const allTweekId = [...tweetId]
      // 取出不包含使用者的tweekId
      const resultId = allTweekId.filter(id => !tweekIdOfUser.includes(id))
      // 交換id順序
      for (let i = resultId.length - 1; i > 0; i--) {
        let randomIndex = Math.floor(Math.random() * (i + 1));
        [resultId[i], resultId[randomIndex]] = [resultId[randomIndex], resultId[i]]
      }
      // 取出指定數量的tweekId，打包資料給資料庫
      const randomLikes = resultId.splice(0, numOfLikes)
      const outPut = randomLikes.map(tweekId => ({
        UserId: id,
        TweetId: tweekId,
        createdAt: new Date(),
        updatedAt: new Date()
      }))
      dataForLikses.push(...outPut)
    })

    return queryInterface.bulkInsert('Likes',
      dataForLikses, {});
  },

  down: (queryInterface, Sequelize) => {
    queryInterface.bulkDelete('Users', null, {})
    queryInterface.bulkDelete('Tweets', null, {})
    queryInterface.bulkDelete('Replies', null, {})
    queryInterface.bulkDelete('followships', null, {})
    return queryInterface.bulkDelete('Likes', null, {})
  }
};