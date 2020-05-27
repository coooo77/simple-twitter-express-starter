const twitterController = require('../controllers/twitterController')
const adminController = require('../controllers/adminController')
const userController = require('../controllers/userController')


module.exports = (app) => {
  app.get('/', (req, res) => res.redirect('/tweets'))
  app.get('/tweets', twitterController.getTweets)

  app.get('/admin', (req, res) => res.redirect('/admin/tweets'))
  app.get('/admin/tweets', adminController.getTweets)
  app.post('/admin/tweets/:id', adminController.deleteTweets)

  /****  Register  ****/
  app.get('/signup', userController.signUpPage)
  app.post('/signup', userController.signUp)
}