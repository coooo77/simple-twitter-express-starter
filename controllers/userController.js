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

  editUser: async (req, res) => {
    if (req.user.id === Number(req.params.id)) {
      const user = await User.findByPk(req.user.id)
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
        return User.findByPk(req.user.id)
          .then((user) => {
            user.update({
              ...user,
              name: req.body.name,
              introduction: req.body.introduction,
              avatar: file ? img.data.link : user.avatar
            }).then((user) => {
              req.flash('success_messages', 'User data was successfully updated')
              res.redirect(`/users/${req.user.id}/tweets`)
            })
          })
      })
    } else {
      return User.findByPk(req.user.id)
        .then((user) => {
          user.update({
            ...user,
            name: req.body.name,
            introduction: req.body.introduction,
            avatar: user.avatar
          }).then(user => {
            req.flash('success_messages', 'User was successfully updated')
            res.redirect(`/users/${req.user.id}/tweets`)
          })
        })
    }
  },

  getUser: async (req, res) => {
    try {
      // User personal info
      let isOwner = req.user.id === Number(req.params.id)
      let user = await User.findByPk(req.params.id, {
        include: [
          { model: Tweet },
          { model: Tweet, as: 'LikedTweets' },
          { model: User, as: 'Followers' },
          { model: User, as: 'Followings' },
        ]
      })
      const numOfTweeks = user.Tweets ? user.Tweets.length : 0
      const numOfLikedTweets = user.LikedTweets ? user.LikedTweets.length : 0
      const numOfFollowers = user.Followers ? user.Followers.length : 0
      const numOfFollowings = user.Followings ? user.Followings.length : 0
      const isFollowed = req.user.Followings.some(d => d.id === user.id)
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
        numOfLikes: tweet.LikedUsers ? tweet.LikedUsers.length : 0
      }))
      return res.render('profile', {
        user,
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
        followerId: req.user.id,
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
          followerId: req.user.id,
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
  }
}

module.exports = userController