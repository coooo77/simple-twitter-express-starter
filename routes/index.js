const twitterController = require('../controllers/twitterController')
const adminController = require('../controllers/adminController')
const userController = require('../controllers/userController')
const helpers = require('../_helpers')
const multer = require('multer')
const upload = multer({ dest: 'temp/' })

module.exports = (app, passport) => {
  const authenticated = (req, res, next) => {
    if (helpers.ensureAuthenticated(req)) {
      return next()
    }
    res.redirect('/signin')
  }
  const authenticatedAdmin = (req, res, next) => {
    if (helpers.ensureAuthenticated(req)) {
      if (helpers.getUser(req).role === 'admin') { return next() }
      return res.redirect('/')
    }
    res.redirect('/signin')
  }
  /****  Tweet  ****/
  app.get('/', (req, res) => res.redirect('/tweets'))
  app.get('/tweets', authenticated, twitterController.getTweets)
  app.post('/tweets', authenticated, twitterController.postTweets)
  app.get('/tweets/:tweet_id/replies', authenticated, twitterController.getTweetReplies)
  app.post('/tweets/:tweet_id/replies', authenticated, twitterController.postTweetReplies)


  /**** Like ****/
  app.post('/tweets/:tweet_id/like', authenticated, twitterController.addLike)
  app.post('/tweets/:tweet_id/unlike', authenticated, twitterController.deleteLike)


  app.get('/admin', (req, res) => res.redirect('/admin/tweets'))
  app.get('/admin/tweets', authenticatedAdmin, adminController.getTweets)
  app.delete('/admin/tweets/:id', authenticatedAdmin, adminController.deleteTweets)
  app.get('/admin/users', authenticatedAdmin, adminController.getUsers)


  /****  Register  ****/
  app.get('/signup', userController.signUpPage)
  app.post('/signup', userController.signUp)

  /****  Login  ****/
  app.get('/signin', userController.signInPage)
  app.post('/signin',
    passport.authenticate('local', {
      failureRedirect: '/signin',
      failureFlash: true
    }),
    userController.signIn
  )
  /****  Logout  ****/
  app.get('/logout', userController.logout)

  /****  Followship  ****/
  app.post('/followships', authenticated, userController.addFollowing)
  app.delete('/followships/:followingId', authenticated, userController.removeFollowing)

  /****  User  ****/
  app.get('/users/:id/edit', authenticated, userController.editUser)
  app.post('/users/:id/edit', authenticated, upload.single('image'), userController.putUser)
  app.get('/users/:id/tweets', authenticated, userController.getUser)
  app.get('/users/:id/followers', authenticated, userController.getFollowers)
  app.get('/users/:id/followings', authenticated, userController.getFollowings)
  app.get('/users/:id/likes', authenticated, userController.getLikes)
}