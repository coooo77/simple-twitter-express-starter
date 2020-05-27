const passport = require('passport')
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcryptjs')
const db = require('../models')
const User = db.User
const Tweet = db.Tweet

passport.use(new LocalStrategy(
  // customize user field
  {
    usernameField: 'email',/* username 在form中的name值 */
    passwordField: 'password',/* password 在form中的name值 */
    passReqToCallback: true /* 增設此參數可以讓下面的callback多增加req作為參數 */
  },
  (req, username, password, cb) => {
    User.findOne({ where: { email: username } }).then(user => {
      if (!user) return cb(null, false, req.flash('error_messages', '帳號或密碼輸入錯誤'))
      //if (!user) return cb(null, false, '帳號或密碼輸入錯誤')
      /* 如果以上一行的寫法,等同於 if (!user) return cb(null, false, req.flash('error', '帳號或密碼輸入錯誤'))*/
      if (!bcrypt.compareSync(password, user.password)) return cb(null, false, req.flash('error_messages', '帳號或密碼輸入錯誤！'))
      return cb(null, user.toJSON()) // 此處與影片示範不同
    })
  }
));


passport.serializeUser((user, cb) => {
  cb(null, user.id);
});

passport.deserializeUser((id, cb) => {

  User.findByPk(id, {
    include: [
      { model: Tweet, as: 'LikedTweets' },
      { model: User, as: 'Followers' },
      { model: User, as: 'Followings' }
    ]
  }).then(user => {
    return cb(null, user.toJSON())  // 此處與影片示範不同
  })
});


module.exports = passport