const express = require('express')
const helpers = require('./_helpers');
const handlebars = require('express-handlebars')
const app = express()
const port = 3000
const bodyParser = require('body-parser')
const flash = require('connect-flash')
const session = require('express-session')
const passport = require('./config/passport')
const methodOverride = require('method-override')

if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config()
}

// use helpers.getUser(req) to replace req.user
// use helpers.ensureAuthenticated(req) to replace req.isAuthenticated()
app.engine('handlebars', handlebars({
  defaultLayout: 'main'
}))
app.set('view engine', 'handlebars')
const hbs = handlebars.create({})
hbs.handlebars.registerHelper(require('./config/handlebars-helpers'))

// body-parser
app.use(bodyParser.urlencoded({ extended: true }))

// set method-override
app.use(methodOverride('_method'))

// setup session and flash
app.use(session({ secret: 'secret', resave: false, saveUninitialized: false }))
app.use(flash())

// passport
app.use(passport.initialize())
app.use(passport.session())

app.use((req, res, next) => {
  res.locals.success_messages = req.flash('success_messages')
  res.locals.error_messages = req.flash('error_messages')
  res.locals.user = req.user
  next()
})
app.listen(port, () => console.log(`Example app listening on port ${port}!`))

require('./routes')(app, passport)
module.exports = app