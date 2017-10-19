var numeral = require('numeral');
var dateFormat = require('dateformat');

exports.welcome = function(req, res) {
  res.json({
    action: 'welcome',
    status: 200,
    body: req.__('welcome')
  });
}

exports.ask = function(req, res) {
  res.redirect('/home');
}

exports.answer = function(req, res) {
  res.redirect('/home');
}
