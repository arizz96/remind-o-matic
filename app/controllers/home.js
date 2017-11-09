var numeral = require('numeral');
var dateFormat = require('dateformat');
var poisearch = require('../modules/placesearch');

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

  console.log(req.body.text);
  var request = ai.textRequest(req.body.text, options);

  request.on('response', function(response) {
    console.log(response);

    console.log(response.result.action);
    // res.end(response.result.action);

    action = response.result.action;
    action = action.substring(action.lastIndexOf('.') + 1);

    console.log(action);
    console.log(response.result.parameters);
    console.log(req.headers['accept-language'])

    customResponse = responses.handleAction(action, response.result.parameters, req);

    res.json(customResponse);
  });

  request.on('error', function(error) {
    console.log(error);
    res.end();
  });

  request.end();
}

exports.place = function(req, res) {
  const keyword = req.query.keyword;
  const rankby = req.query.rankby;
  // console.log(req.query.location);
  // get place coordinates
  maps.geocode({
    address: req.query.location
  }, function(err, response) {
    if (!err) {
      var parameters = {};
      // console.log(response.json.results[0].geometry.location);
      parameters.location = response.json.results[0].geometry.location.lat + "," + response.json.results[0].geometry.location.lng;
      parameters.key = process.env.MAPS_KEY;
      parameters.rankby = rankby;
      if(rankby == "prominence")
        parameters.radius = process.env.SEARCH_RADIUS
      parameters.keyword = keyword;
      parameters.limit = process.env.LIMIT;
      // console.log(parameters);

      poisearch.nearbysearch(parameters, process.env.FORMAT, function(statusCode, result) {
        res.statusCode = statusCode;
        res.send(result);
      });
    }
  });

}

exports.answer = function(req, res) {
  res.redirect('/home');
}
