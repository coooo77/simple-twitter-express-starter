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
            req.flash('success_message', '成功註冊帳號!')
            return res.redirect('/signin')
          })

        }
      })
    }
  }

}

module.exports = userController