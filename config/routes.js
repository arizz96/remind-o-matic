var express = require('express');
var home = require('../app/controllers/home');

//you can include all your controllers

module.exports = function (app, passport) {
  var v1 = express.Router();

  v1.get('/welcome', home.welcome);
  v1.post('/ask', home.ask);
  v1.post('/ask', home.ask);

  app.use('/api/v1', v1);
  app.use('/', v1); // Set the default version to latest.

  // app.get('/')
  //
  // app.get('/login', home.login);
  // app.get('/signup', home.signup);
  //
  // app.get('/', home.loggedIn, home.home);//home
  // app.get('/home', home.loggedIn, home.home);//home
  //
  // app.post('/signup', passport.authenticate('local-signup', {
  //   successRedirect: '/home', // redirect to the secure profile section
  //   failureRedirect: '/signup', // redirect back to the signup page if there is an error
  //   failureFlash: true // allow flash messages
  // }));
  // // process the login form
  // app.post('/login', passport.authenticate('local-login', {
  //   successRedirect: '/home', // redirect to the secure profile section
  //   failureRedirect: '/login', // redirect back to the signup page if there is an error
  //   failureFlash: true // allow flash messages
  // }));

}
