const db = require('../models')
const User = db.User
const Tweet = db.Tweet

const adminController = {
  getTweets: async (req, res) => {
    try {
      const tweets = await Tweet.findAll({
        raw: true,
        nest: true,
        include: [User]
      })
      const data = tweets.map(tweet => ({
        ...tweet,
        description: tweet.description.substring(0, 50)
      }))
      return res.render('admin/tweets', { tweet: data })
    } catch (error) {
      console.error(error)
      req.flash('error_messages', '無法讀取後台Tweeks，請稍後再嘗試!')
      return res.redirect('back')
    }
  },
  deleteTweets: async (req, res) => {
    try {
      let tweet = await Tweet.findByPk(req.params.id)
      tweet.destroy()
      tweet = await Tweet.findByPk(req.param.id)
      if (tweet) {
        throw new Error()
      }
      req.flash('success_messages', `成功刪除第${req.params.id}號tweek!`)
      return res.redirect('back')
    } catch (error) {
      console.error(error)
      req.flash('error_messages', 'Tweek刪除失敗!')
      return res.redirect('back')
    }
  }
}

module.exports = adminController