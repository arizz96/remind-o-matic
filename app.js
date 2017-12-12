var express = require('express');
var cookieParser = require('cookie-parser');
var expressSession = require('express-session');

var app = express();
var dotenv = require('dotenv').config();
var i18n = require('i18n');
var multer = require('multer')
var constants = require('constants');
var constant = require('./config/constants');
var apiai = require('apiai');
global.ai = apiai(process.env.DIALOGFLOW_DEV_KEY);

var googleMaps = require('@google/maps');
global.maps = googleMaps.createClient({
  key: process.env.MAPS_KEY,
  Promise: Promise
});

var port = process.env.PORT || 8042;
var mongoose = require('mongoose');
var flash = require('connect-flash');
var path = require('path');

var morgan = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
var bodyParser = require('body-parser');
var dateFormat = require('dateformat');
var now = new Date();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

// I18n config
i18n.configure({
    defaultLocale: 'it',
    directory: './locales'
});
app.use(i18n.init);

/***************Mongodb configuratrion********************/
var mongoose = require('mongoose');
var configDB = require('./config/database.js');
//configuration ===============================================================
var options = {
    useMongoClient: true,
    //user: '',
    //pass: ''
  };
mongoose.connect(configDB.url, options); // connect to our database
mongoose.Promise = Promise;

//set up our express application
app.use(morgan('dev')); // log every request to the console
//view engine setup
app.use(express.static(path.join(__dirname, 'public')));
app.set('views', path.join(__dirname, 'app/views'));
app.set('view engine', 'ejs');
//app.set('view engine', 'ejs'); // set up ejs for templating

// routes ======================================================================
require('./config/routes.js')(app); // load our routes and pass in our app and fully configured passport

// session
app.use(cookieParser());
app.use(expressSession({
  secret: 'stringaqualunque',
  resave: false,
  saveUninitialized: true
}));
app.use(function(req, res, next) {
  res.locals.session = req.session;
  next();
});

//launch ======================================================================
app.listen(port);
console.log('The magic happens on port ' + port);

//catch 404 and forward to error handler
app.use(function (req, res, next) {
    res.status(404).render('404', {title: "Sorry, page not found", session: req.sessionbo});
});

app.use(function (req, res, next) {
    res.status(500).render('404', {title: "Sorry, page not found"});
});
exports = module.exports = app;
exports.ai = ai;
