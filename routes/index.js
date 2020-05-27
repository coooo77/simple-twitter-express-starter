const twitterController = require('../controllers/twitterController')
const adminController = require('../controllers/adminController')
const userController = require('../controllers/userController')


module.exports = (app) => {
  app.get('/', (req, res) => res.redirect('/tweets'))
  app.get('/tweets', twitterController.getTweets)

  app.get('/admin', (req, res) => res.redirect('/admin/tweets'))
  app.get('/admin/tweets', adminController.getTweets)

  /****  Register  ****/
  app.get('/signup', userController.signUpPage)
  app.post('/signup', userController.signUp)

  /****  User  ****/
  app.get('/users/:id/edit', userController.editUser)
  app.put('/users/:id/edit', upload.single('image'), userController.putUser)
}