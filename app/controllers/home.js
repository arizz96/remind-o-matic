var numeral = require('numeral');
var dateFormat = require('dateformat');
var poisearch = require('../modules/placesearch');
var responses = require('../modules/responses');

exports.welcome = function(req, res) {
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

  var request = ai.textRequest(req.body.text, options);

  request.on('response', function(response) {
    Promise.resolve()
    .then(function() {
      keyword  = response.result.parameters.geo_poi;
      rankby   = req.query.rankby || 'distance';
      location = response.result.parameters.geo_place;

      if(keyword && rankby && location)
        return poisearch.search(keyword, location, rankby);
      else
        return [];
    })
    .then(function(result){
      return result;
    })
    .then(function(nearbyResults) {
      action = response.result.action;
      action = action.substring(action.lastIndexOf('.') + 1);

      customResponse = responses.handleAction(action, response.result.parameters, req);
      customResponse['nearbyResults'] = nearbyResults;
      return customResponse;
    })
    .then(function(customResponse) {
      res.json(customResponse);
      res.end();
    });
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
