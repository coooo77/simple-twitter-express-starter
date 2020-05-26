const db = require('../models')
const User = db.User
const Tweet = db.Tweet

const adminController = {
  getTweets: async (req, res) => {
    const tweets = await Tweet.findAll({
      raw: true,
      nest: true,
      include: [User]
    })
    const data = tweets.map(tweet => ({
      ...tweet,
      description: tweet.description.substring(0, 50)
    }))
    return res.render('admin/tweets', { tweet: data })
  }
}

module.exports = adminController