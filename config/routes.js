var express = require('express');
var home    = require('../app/controllers/home');
var help    = require('../app/controllers/help');
var finish  = require('../app/controllers/finish');
var item    = require('../app/controllers/item');
var user    = require('../app/controllers/user');
var welcome = require('../app/controllers/welcome');

module.exports = function (app, passport) {
  var v1 = express.Router();

  v1.get('/welcome', welcome.show);
  v1.get('/help', help.show);
  v1.get('/finish', finish.show);
  v1.post('/push', home.push);
  v1.post('/ask', home.ask);
  v1.delete('/removeAllUsers', user.removeAllUsers);
  v1.delete('/removeAllItems', item.removeAllItems);
  v1.get('/getAllUsers', user.getAllUsers);
  v1.get('/getAllItems', item.getAllItems);
  v1.get('/getAllItemsByUser', item.getAllItemsByUser);

  app.use('/api/v1', v1);
  app.use('/', v1); // Set the default version to latest.
}
