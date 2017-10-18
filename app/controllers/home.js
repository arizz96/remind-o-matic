var numeral = require('numeral');
var dateFormat = require('dateformat');

exports.welcome = function(req, res) {
  res.json({ body: 'Hey' });
}

exports.ask = function(req, res) {
  res.redirect('/home');
}

exports.answer = function(req, res) {
  res.redirect('/home');
}
