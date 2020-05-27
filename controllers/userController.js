const imgur = require('imgur-node-api')
const IMGUR_CLIENT_ID = process.env.IMGUR_CLIENT_ID
const bcrypt = require('bcryptjs')
const db = require('../models')
const User = db.User
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
  }


}

module.exports = userController