const db = require('../models')
const helpers = require('../_helpers');
const Tweet = db.Tweet
const User = db.User
const Reply = db.Reply
const Like = db.Like
const pageLimit = 10
const Google_API_KEY = process.env.Google_API_KEY

const twitterController = {
  getTweets: async (req, res) => {
    let offset = 0
    if (req.query.page) {
      offset = (req.query.page - 1) * pageLimit
    }
    let tweets = await Tweet.findAndCountAll({
      include: [User, Reply, Like],
      distinct: true,
      order: [['createdAt', 'DESC']],
      limit: pageLimit,
      offset: offset
    })

    tweets = JSON.parse(JSON.stringify(tweets))
    let page = Number(req.query.page) || 1
    let pages = Math.ceil(tweets.count / pageLimit)
    let totalPage = Array.from({ length: pages }).map((item, index) => index + 1)
    let prev = page - 1 < 1 ? 1 : page - 1
    let next = page + 1 > pages ? pages : page + 1
    tweets = tweets.rows.map(tweet => ({
      ...tweet,
      numOfReplies: tweet.Replies ? tweet.Replies.length : 0,
      numOfLikes: tweet.Likes ? tweet.Likes.length : 0,
      isLiked: helpers.getUser(req).LikedTweets ? helpers.getUser(req).LikedTweets.some(d => d.id === tweet.id) : false,
      isOwner: tweet.User.id === helpers.getUser(req).id
    }))

    let users = await User.findAll({
      include: [{ model: User, as: 'Followers' }]
    })
    users = users.map(user => ({
      ...user.dataValues,
      FollowersCount: user.Followers ? user.Followers.length : 0,
      introduction: user.introduction ? user.introduction.substring(0, 50) : '',
      isFollowed: helpers.getUser(req).Followings ? helpers.getUser(req).Followings.some(following => following.id === user.id) : false,
      isOwner: helpers.getUser(req).id === user.id,
    }))
    users = users.sort((a, b) => b.FollowersCount - a.FollowersCount)
    const userData = users.splice(0, 10)
    let top10PopularUsers = JSON.parse(JSON.stringify(userData))

    return res.render('tweets', {
      tweets,
      top10PopularUsers,
      page,
      totalPage,
      prev,
      next,
      Google_API_KEY
    })
  },
  postTweets: async (req, res) => {
    const { description, location, latitude, longitude } = req.body
    if (!req.body.description) {
      req.flash('error_messages', "description didn't exist")
      return res.redirect('back')
    } else if (req.body.description.length > 140) {
      req.flash('error_messages', "description can't be longer than 140 words")
      return res.redirect('back')
    }
    try {
      await Tweet.create({
        description,
        UserId: helpers.getUser(req).id,
        location,
        latitude,
        longitude
      })
      return res.redirect('/tweets')
    } catch (error) {
      console.error(error)
      req.flash('error_messages', '無法新增Tweek，請稍後再嘗試!')
      return res.redirect('back')
    }
  },
  getTweetReplies: async (req, res) => {

    try {
      const tweet = await Tweet.findByPk(req.params.tweet_id, {
        include: [
          { model: Reply, include: [User] },
          { model: User, as: 'LikedUsers' },
          {
            model: User, include: [Tweet,
              { model: User, as: 'Followers' },
              { model: User, as: 'Followings' },
              Like
            ]
          },
          Like
        ]
      })

      const replies = tweet.Replies
      const numOfLikes = tweet.LikedUsers ? tweet.LikedUsers.length : 0

      const tweetOwner = tweet.User
      const isOwner = helpers.getUser(req).id === tweetOwner.id
      const numOfTweeks = tweetOwner.Tweets ? tweetOwner.Tweets.length : 0
      const numOfLikedTweets = tweetOwner.LikedTweets ? tweetOwner.LikedTweets.length : 0
      const numOfFollowers = tweetOwner.Followers ? tweetOwner.Followers.length : 0
      const numOfFollowings = tweetOwner.Followings ? tweetOwner.Followings.length : 0
      const isFollowed = helpers.getUser(req).Followings ? helpers.getUser(req).Followings.some(d => d.id === tweetOwner.id) : false
      const isLiked = tweet.Likes ? tweet.Likes.some(d => d.UserId === helpers.getUser(req).id) : false

      return res.render('tweet', {
        tweet,
        tweetOwner,
        numOfLikes,
        isOwner,
        replies,
        numOfTweeks,
        numOfLikedTweets,
        numOfFollowers,
        numOfFollowings,
        isFollowed,
        isLiked,
        Google_API_KEY
      })
    } catch (error) {
      console.error(error)
      req.flash('error_messages', '無法瀏覽Replies，請稍後再嘗試!')
      return res.redirect('back')
    }
  },
  postTweetReplies: async (req, res) => {
    // if (!req.body.comment || !req.body.userId) {      
    //   return res.redirect('back')
    // }
    try {
      const reply = await Reply.create({
        TweetId: req.params.tweet_id,
        UserId: helpers.getUser(req).id,
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
        UserId: helpers.getUser(req).id,
        TweetId: req.params.tweet_id
      })
      return res.redirect('back')
    } catch (error) {
      console.error(error)
      req.flash('error_messages', '無法送出Like，請稍後再嘗試!')
      return res.redirect('back')
    }
  },
  deleteLike: async (req, res) => {
    try {
      const like = await Like.findOne({
        where: {
          UserId: helpers.getUser(req).id,
          TweetId: req.params.tweet_id
        }
      })
      await like.destroy()
      return res.redirect('back')
    } catch (error) {
      console.error(error)
      req.flash('error_messages', '無法取消Like，請稍後再嘗試!')
      return res.redirect('back')
    }
  }
}

module.exports = twitterController