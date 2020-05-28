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
  },
  postTweets: (req, res) => {
    if (!req.body.description) {
      req.flash('error_messages', "description didn't exist")
      return res.redirect('back')
    }
    return Tweet.create({
      description: req.body.description,
      UserId: req.user.id
    }).then(tweet => {
      return res.redirect('/tweets')
    })
  }
}

module.exports = twitterController