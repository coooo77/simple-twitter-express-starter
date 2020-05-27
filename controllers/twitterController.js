const db = require('../models')
const Tweet = db.Tweet
const User = db.User
const Reply = db.Reply

const twitterController = {
  getTweets: (req, res) => {
    return Tweet.findAll({
      include: [User, Reply],
      raw: true,
      nest: true,
    })
      .then(tweets => {
        return res.render('tweets', { tweets })
      })
  }
}

module.exports = twitterController