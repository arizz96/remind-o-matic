var numeral = require('numeral');
var dateFormat = require('dateformat');

exports.welcome = function(req, res) {
  // res.json({
  //   action: 'welcome',
  //   status: 200,
  //   body: req.__('welcome')
  // });

  var options = {
    sessionId: '<UNIQE SESSION ID>'
  };

  var request = apiai.textRequest('Ciao', options);

  request.on('response', function(response) {
      console.log(response);
  });

  request.on('error', function(error) {
      console.log(error);
  });

  request.end();
}

exports.ask = function(req, res) {
  res.redirect('/home');
}

exports.answer = function(req, res) {
  res.redirect('/home');
}
