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
    tweets = tweets.map(tweet => ({
      ...tweet.dataValues,
      ReplyCount: tweet.Replies.length
    }))

    let users = await User.findAll({
      include: [{ model: User, as: 'Followers' }]
    })
    users = users.map(user => ({
      ...user.dataValues,
      FollowersCount: user.Followers ? user.Followers.length : 0,
      introduction: user.introduction.substring(0, 50),
      isFollowed: req.user.Followings.some(following => following.id === user.id),
      isOwner: req.user.id === user.id,
    }))
    users = users.sort((a, b) => b.FollowersCount - a.FollowersCount)
    const userData = users.splice(0, 10)
    let top10PopularUsers = JSON.parse(JSON.stringify(userData))
    return res.render('tweets', { tweets, top10PopularUsers })
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
  },
  getTweetReplies: async (req, res) => {
    if (!req.query.userId) {
      return res.redirect('back')
    }
    const replies = await Reply.findAll({ where: { TweetId: req.params.tweet_id }, include: [User], raw: true, nest: true })
    const tweet = await Tweet.findByPk(req.params.tweet_id)
    const user = await User.findByPk(req.query.userId)
    if (!user) {
      req.flash('error_messages', "user didn't exist")
      return res.redirect('back')
    }

    return res.render('tweet', { tweet: tweet.toJSON(), tweetOwner: user.toJSON(), replies })
  },
  postTweetReplies: async (req, res) => {
    if (!req.body.comment || !req.body.userId) {
      return res.redirect('back')
    }
    const reply = await Reply.create({
      TweetId: req.params.tweet_id,
      UserId: req.body.userId,
      comment: req.body.comment
    })
    return res.redirect(`/tweets/${req.params.tweet_id}/replies`)
  }
}

module.exports = twitterController