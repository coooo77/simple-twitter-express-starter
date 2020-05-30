const imgur = require('imgur-node-api')
const IMGUR_CLIENT_ID = process.env.IMGUR_CLIENT_ID
const bcrypt = require('bcryptjs')
const db = require('../models')
const User = db.User
const Tweet = db.Tweet
const Reply = db.Reply
const Like = db.Like
const Followship = db.Followship
const Sequelize = require('sequelize');
const helpers = require('../_helpers')

const userController = {

  signUpPage: (req, res) => {
    return res.render('signup')
  },
  signUp: (req, res) => {

    if (req.body.password !== req.body.passwordCheck) {
      req.flash('error_messages', '兩次密碼輸入不同!')
      return res.redirect('/signup')
    } else {
      const { or, and, gt, lt } = Sequelize.Op
      User.findOne({ where: { [or]: [{ email: req.body.email }, { name: req.body.name }] } }).then(user => {

        if (user) {
          req.flash('error_messages', '此信箱or名稱已註冊!')
          return res.redirect('/signup')

        } else {
          User.create({
            name: req.body.name,
            email: req.body.email,
            password: bcrypt.hashSync(req.body.password, bcrypt.genSaltSync(10), null)
          }).then(user => {
            req.flash('success_messages', '成功註冊帳號!')
            return res.redirect('/signin')
          })

        }
      })
    }
  },
  signInPage: (req, res) => {
    return res.render('signin')
  },
  signIn: (req, res) => {
    req.flash('success_messages', '成功登入！')
    res.redirect('/tweets')
  },

  logout: (req, res) => {
    req.flash('success_messages', '登出成功！')
    req.logout()
    res.redirect('/signin')
  },

  editUser: async (req, res) => {
    if (helpers.getUser(req).id === Number(req.params.id)) {
      const user = await User.findByPk(helpers.getUser(req).id)
      res.render('edit', { user })
    } else {
      res.redirect('back')
    }
  },

  putUser: (req, res) => {
    if (!req.body.name) {
      req.flash('error_messages', "name didn't exist")
      return res.redirect('back')
    }
    const { file } = req
    if (file) {
      imgur.setClientID(IMGUR_CLIENT_ID)
      imgur.upload(file.path, (err, img) => {
        return User.findByPk(helpers.getUser(req).id)
          .then((user) => {
            user.update({
              ...user,
              name: req.body.name,
              introduction: req.body.introduction,
              avatar: file ? img.data.link : user.avatar
            }).then((user) => {
              req.flash('success_messages', 'User data was successfully updated')
              res.redirect(`/users/${helpers.getUser(req).id}/tweets`)
            })
          })
      })
    } else {
      return User.findByPk(helpers.getUser(req).id)
        .then((user) => {
          user.update({
            ...user,
            name: req.body.name,
            introduction: req.body.introduction,
            avatar: user.avatar
          }).then(user => {
            req.flash('success_messages', 'User was successfully updated')
            res.redirect(`/users/${helpers.getUser(req).id}/tweets`)
          })
        })
    }
  },

  getUser: async (req, res) => {
    try {
      // User personal info
      let isOwner = helpers.getUser(req).id === Number(req.params.id)
      let user = await User.findByPk(req.params.id, {
        include: [
          { model: Tweet },
          { model: Tweet, as: 'LikedTweets', include: [User] },
          { model: User, as: 'Followers' },
          { model: User, as: 'Followings' },
        ],
        order: [['createdAt', 'DESC']]
      })
      let userData = JSON.parse(JSON.stringify(user))
      // Sorting for the latest first
      let LikedTweets = userData.LikedTweets
      let Followers = userData.Followers
      let Followings = userData.Followings
      LikedTweets = LikedTweets.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      Followers = Followers.sort((a, b) => new Date(b.Followship.createdAt) - new Date(a.Followship.createdAt))
      Followings = Followings.sort((a, b) => new Date(b.Followship.createdAt) - new Date(a.Followship.createdAt))
      // Number info use in handlebars
      const numOfTweeks = user.Tweets ? user.Tweets.length : 0
      const numOfLikedTweets = user.LikedTweets ? user.LikedTweets.length : 0
      const numOfFollowers = user.Followers ? user.Followers.length : 0
      const numOfFollowings = user.Followings ? user.Followings.length : 0
      const isFollowed = helpers.getUser(req).Followings.some(d => d.id === user.id)
      // User tweets info
      let tweets = await Tweet.findAll({
        where: { UserId: req.params.id },
        order: [['createdAt', 'DESC']],
        include: [
          { model: User },
          { model: Reply },
          { model: User, as: 'LikedUsers' }
        ]
      })
      let tweetsData = JSON.parse(JSON.stringify(tweets))
      tweetsData = tweetsData.map(tweet => ({
        ...tweet,
        numOfReplies: tweet.Replies ? tweet.Replies.length : 0,
        numOfLikes: tweet.LikedUsers ? tweet.LikedUsers.length : 0,
        isLiked: tweet.LikedUsers.some(d => d.id === helpers.getUser(req).id)
      }))
      return res.render('profile', {
        userData: user,
        LikedTweets,
        Followers,
        Followings,
        tweets: tweetsData,
        isOwner,
        isFollowed,
        numOfTweeks,
        numOfLikedTweets,
        numOfFollowers,
        numOfFollowings
      })
    } catch (error) {
      console.error(error)
      req.flash('error_messages', '無法讀取使用者資料，請稍後再嘗試!')
      return res.redirect('back')
    }
  },

  addFollowing: async (req, res) => {
    try {
      await Followship.create({
        followerId: helpers.getUser(req).id,
        followingId: req.params.followingId
      })
      return res.redirect('back')
    } catch (error) {
      console.error(error)
      req.flash('error_messages', '追蹤失敗，請稍後再嘗試!')
      return res.redirect('back')
    }
  },
  removeFollowing: async (req, res) => {
    try {
      const followship = await Followship.findOne({
        where: {
          followerId: helpers.getUser(req).id,
          followingId: req.params.followingId
        }
      })
      await followship.destroy()
      return res.redirect('back')
    } catch (error) {
      console.error(error)
      req.flash('error_messages', '取消追蹤失敗，請稍後再嘗試!')
      return res.redirect('back')
    }
  },

  getFollowers: async (req, res) => {
    try {
      let isOwner = helpers.getUser(req).id === Number(req.params.id)
      let user = await User.findByPk(req.params.id, {
        include: [
          { model: Tweet },
          { model: Tweet, as: 'LikedTweets', include: [User] },
          { model: User, as: 'Followers' },
          { model: User, as: 'Followings' },
        ],
        order: [['createdAt', 'DESC']]
      })
      //let userData = JSON.parse(JSON.stringify(user))
      let followers = user.Followers
      followers = followers.sort((a, b) => new Date(b.Followship.createdAt) - new Date(a.Followship.createdAt))
      followers = followers.map(follower => ({
        ...follower.dataValues,
        isFollowed: helpers.getUser(req).Followings.some(d => d.id === follower.id)
      }))
      // Number info use in handlebars
      const numOfTweeks = user.Tweets ? user.Tweets.length : 0
      const numOfLikedTweets = user.LikedTweets ? user.LikedTweets.length : 0
      const numOfFollowers = user.Followers ? user.Followers.length : 0
      const numOfFollowings = user.Followings ? user.Followings.length : 0
      const isFollowed = helpers.getUser(req).Followings.some(d => d.id === user.id)
      return res.render('follower', {
        userData: user,
        followers,
        isOwner,
        isFollowed,
        numOfTweeks,
        numOfLikedTweets,
        numOfFollowers,
        numOfFollowings
      })
    } catch (error) {
      console.error(error)
      req.flash('error_messages', '請稍後再嘗試!')
      return res.redirect('back')
    }
  },
  getFollowings: async (req, res) => {
    try {
      // User personal info
      let isOwner = helpers.getUser(req).id === Number(req.params.id)
      let user = await User.findByPk(req.params.id, {
        include: [
          { model: Tweet },
          { model: Tweet, as: 'LikedTweets', include: [User] },
          { model: User, as: 'Followers' },
          { model: User, as: 'Followings' },
        ],
        order: [['createdAt', 'DESC']]
      })
      //let userData = JSON.parse(JSON.stringify(user))
      // Sorting for the latest first
      let followings = user.Followings
      followings = followings.sort((a, b) => new Date(b.Followship.createdAt) - new Date(a.Followship.createdAt))
      followings = followings.map(following => ({
        ...following.dataValues,
        isFollowed: helpers.getUser(req).Followings.some(d => d.id === following.id)
      }))
      // Number info use in handlebars
      const numOfTweeks = user.Tweets ? user.Tweets.length : 0
      const numOfLikedTweets = user.LikedTweets ? user.LikedTweets.length : 0
      const numOfFollowers = user.Followers ? user.Followers.length : 0
      const numOfFollowings = user.Followings ? user.Followings.length : 0
      const isFollowed = helpers.getUser(req).Followings.some(d => d.id === user.id)
      return res.render('following', {
        userData: user,
        followings,
        isOwner,
        isFollowed,
        numOfTweeks,
        numOfLikedTweets,
        numOfFollowers,
        numOfFollowings
      })
    } catch (error) {
      console.error(error)
      req.flash('error_messages', '請稍後再嘗試!')
      return res.redirect('back')
    }
  },

  getLikes: async (req, res) => {
    try {
      // User personal info
      let isOwner = helpers.getUser(req).id === Number(req.params.id)
      let user = await User.findByPk(req.params.id, {
        include: [
          { model: Tweet },
          { model: Tweet, as: 'LikedTweets', include: [User, { model: User, as: 'LikedUsers' }, Reply] },
          { model: User, as: 'Followers' },
          { model: User, as: 'Followings' },
        ],
        order: [['createdAt', 'DESC']]
      })
      //let userData = JSON.parse(JSON.stringify(user))
      // Sorting for the latest first
      let likedTweets = user.LikedTweets
      likedTweets = likedTweets.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      likedTweets = likedTweets.map(likedTweet => ({
        ...likedTweet.dataValues,
        isLiked: helpers.getUser(req).LikedTweets.some(d => d.id === likedTweet.id),
        numOfLikes: likedTweet.LikedUsers ? likedTweet.LikedUsers.length : 0,
        numOfReplies: likedTweet.Replies ? likedTweet.Replies.length : 0,
        isOwner: likedTweet.User.id === helpers.getUser(req).id
      }))
      // Number info use in handlebars
      const numOfTweeks = user.Tweets ? user.Tweets.length : 0
      const numOfLikedTweets = user.LikedTweets ? user.LikedTweets.length : 0
      const numOfFollowers = user.Followers ? user.Followers.length : 0
      const numOfFollowings = user.Followings ? user.Followings.length : 0
      const isFollowed = helpers.getUser(req).Followings.some(d => d.id === user.id)
      console.log('likedtweets---------', likedTweets)
      return res.render('like', {
        userData: user,
        likedTweets,
        isOwner,
        isFollowed,
        numOfTweeks,
        numOfLikedTweets,
        numOfFollowers,
        numOfFollowings
      })
    } catch (error) {
      console.error(error)
      req.flash('error_messages', '請稍後再嘗試!')
      return res.redirect('back')
    }
  }
}

module.exports = userController