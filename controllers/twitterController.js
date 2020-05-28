const db = require('../models')
const Tweet = db.Tweet
const User = db.User
const Reply = db.Reply
const Like = db.Like

const twitterController = {
  getTweets: async (req, res) => {
    let tweets = await Tweet.findAll({
      include: [User, Reply, Like],
      order: [['createdAt', 'DESC']]
    })
    tweets = await tweets.map(tweet => ({
      ...tweet.dataValues,
      ReplyCount: tweet.Replies.length
    })
    )

    return res.render('tweets', { tweets })
  }
}

module.exports = twitterController