const twitterController = require('../controllers/twitterController')
const adminController = require('../controllers/adminController')

module.exports = (app) => {
  app.get('/', (req, res) => res.redirect('/tweets'))
  app.get('/tweets', twitterController.getTweets)

  app.get('/admin', (req, res) => res.redirect('/admin/tweets'))
  app.get('/admin/tweets', adminController.getTweets)
}