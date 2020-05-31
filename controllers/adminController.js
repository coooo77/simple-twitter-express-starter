const db = require('../models')
const User = db.User
const Tweet = db.Tweet

const adminController = {
  getTweets: async (req, res) => {
    try {
      const pageLimit = 10
      let offset = 0
      if (req.query.page) {
        offset = (req.query.page - 1) * pageLimit
      }
      const tweets = await Tweet.findAndCountAll({
        include: [User],
        offset: offset,
        limit: pageLimit
      })
      const data = tweets.rows.map(tweet => ({
        ...tweet.dataValues,
        description: tweet.dataValues.description.substring(0, 50)
      }))

      let page = Number(req.query.page) || 1
      let pages = Math.ceil(tweets.count / pageLimit)
      let totalPage = Array.from({ length: pages }).map((item, index) => index + 1)
      let prev = page - 1 < 1 ? 1 : page - 1
      let next = page + 1 > pages ? pages : page + 1

      return res.render('admin/tweets', {
        tweet: JSON.parse(JSON.stringify(data)),
        page,
        totalPage,
        prev,
        next
      })
    } catch (error) {
      console.error(error)
      req.flash('error_messages', '無法讀取後台Tweeks，請稍後再嘗試!')
      return res.redirect('back')
    }
  },
  deleteTweets: async (req, res) => {
    try {
      let tweet = await Tweet.findByPk(req.params.id)
      await tweet.destroy()
      tweet = await Tweet.findByPk(req.param.id)
      if (tweet) {
        throw new Error()
      }
      req.flash('success_messages', `成功刪除第${req.params.id}號tweek!`)
      return res.redirect('back')
    } catch (error) {
      console.error(error)
      req.flash('error_messages', 'Tweek刪除失敗!')
      return res.redirect('back')
    }
  },
  getUsers: async (req, res) => {
    try {
      let users = await User.findAll({
        include: [
          Tweet,
          { model: Tweet, as: 'LikedTweets' },
          { model: User, as: 'Followers' },
          { model: User, as: 'Followings' }
        ]
      })
      let userData = JSON.parse(JSON.stringify(users))
      userData = userData.map(user => ({
        ...user,
        numOfTweeks: user.Tweets ? user.Tweets.length : 0,
        numOfLikedTweets: user.LikedTweets ? user.LikedTweets.length : 0,
        numOfFollowers: user.Followers ? user.Followers.length : 0,
        numOfFollowings: user.Followings ? user.Followings.length : 0
      }))
      userData = userData.sort((a, b) => b.numOfTweeks - a.numOfTweeks)
      return res.render('admin/users', { userData })
    } catch (error) {
      console.error(error)
      req.flash('error_messages', '無法讀取後台使用者資料，請稍後再嘗試!')
      return res.redirect('back')
    }
  }
}

module.exports = adminController