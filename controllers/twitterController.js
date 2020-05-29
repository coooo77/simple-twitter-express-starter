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
      introduction: user.introduction.substring(0, 50)
    }))
    users = users.sort((a, b) => b.FollowersCount - a.FollowersCount)
    const userData = users.splice(0, 10)
    let top10PopularUsers = JSON.parse(JSON.stringify(userData))
    console.log('top10PopularUsers', top10PopularUsers[0])
    return res.render('tweets', { tweets, top10PopularUsers })
  },
  postTweets: async (req, res) => {
    if (!req.body.description) {
      req.flash('error_messages', "description didn't exist")
      return res.redirect('back')
    }
    try {
      await Tweet.create({
        description: req.body.description,
        UserId: req.user.id
      })
      return res.redirect('/tweets')
    } catch (error) {
      console.error(error)
      req.flash('error_messages', '無法新增Tweek，請稍後再嘗試!')
      return res.redirect('back')
    }
  },
  getTweetReplies: async (req, res) => {
    if (!req.query.userId) {
      return res.redirect('back')
    }
    try {
      const replies = await Reply.findAll({
        where: { TweetId: req.params.tweet_id },
        include: [User],
        raw: true,
        nest: true
      })
      const tweet = await Tweet.findByPk(req.params.tweet_id, { include: [{ model: User, as: 'LikedUsers' }] })
      const numOfLikes = tweet.LikedUsers ? tweet.LikedUsers.length : 0
      const user = await User.findByPk(req.query.userId, {
        include: [
          Tweet,
          { model: Tweet, as: 'LikedTweets' },
          { model: User, as: 'Followers' },
          { model: User, as: 'Followings' },
        ]
      })
      if (!user) {
        req.flash('error_messages', "user didn't exist")
        return res.redirect('back')
      }
      const isOwner = req.user.id === Number(req.query.userId)
      const numOfTweeks = user.Tweets ? user.Tweets.length : 0
      const numOfLikedTweets = user.LikedTweets ? user.LikedTweets.length : 0
      const numOfFollowers = user.Followers ? user.Followers.length : 0
      const numOfFollowings = user.Followings ? user.Followings.length : 0
      const isFollowed = req.user.Followings.some(d => d.id === user.id)
      const isLiked = req.user.LikedTweets.some(d => d.id === Number(req.params.tweet_id))

      return res.render('tweet', {
        tweet: tweet.toJSON(),
        tweetOwner: user.toJSON(),
        numOfLikes,
        isOwner,
        replies,
        numOfTweeks,
        numOfLikedTweets,
        numOfFollowers,
        numOfFollowings,
        isFollowed,
        isLiked
      })
    } catch (error) {
      console.error(error)
      req.flash('error_messages', '無法瀏覽Replies，請稍後再嘗試!')
      return res.redirect('back')
    }
  },
  postTweetReplies: async (req, res) => {
    if (!req.body.comment || !req.body.userId) {
      return res.redirect('back')
    }
    try {
      const reply = await Reply.create({
        TweetId: req.params.tweet_id,
        UserId: req.body.userId,
        comment: req.body.comment
      })
      return res.redirect(`/tweets/${req.params.tweet_id}/replies`)
    } catch (error) {
      console.error(error)
      req.flash('error_messages', '無法送出Reply，請稍後再嘗試!')
      return res.redirect('back')
    }
  },
  addLike: async (req, res) => {
    try {
      await Like.create({
        UserId: req.user.id,
        TweetId: req.params.tweet_id
      })
      return res.redirect('back')
    } catch (error) {
      console.error(error)
      req.flash('error_messages', '無法送出Like，請稍後再嘗試!')
      return res.redirect('back')
    }
  }
}

module.exports = twitterController