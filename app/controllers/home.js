var numeral = require('numeral');
var dateFormat = require('dateformat');

exports.welcome = function(req, res) {
  console.log(req);
  res.json({
    action: 'welcome',
    status: 200,
    body: req.__('welcome')
  });
}

exports.ask = function(req, res) {
  var options = {
    sessionId: '123456789'
  };

  console.log(req.body.text);
  var request = ai.textRequest(req.body.text, options);

  request.on('response', function(response) {
    console.log(response);

    console.log(response.result.action);
    res.end(response.result.action);
  });

  request.on('error', function(error) {
    console.log(error);
    res.end();
  });

  request.end();
}

exports.answer = function(req, res) {
  res.redirect('/home');
}
