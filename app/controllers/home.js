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

  console.log(req.body.text);
  var request = ai.textRequest(req.body.text, options);

  request.on('response', function(response) {
    console.log(response);

    console.log(response.result.action);
    // res.end(response.result.action);

    action = response.result.action;
    action = action.substring(action.lastIndexOf('.') + 1);

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

  maps.geocode({
    address: req.query.location
  }).asPromise()
  .then(function(response){
    var parameters = {};
    parameters.location = response.json.results[0].geometry.location.lat + "," + response.json.results[0].geometry.location.lng;
    parameters.key = process.env.MAPS_KEY;
    parameters.rankby = rankby;
    if(rankby == "prominence")
      parameters.radius = process.env.SEARCH_RADIUS;
    parameters.keyword = keyword;
    return parameters;
  })
  .then(function(parameters){
    return poisearch.nearbysearch(parameters, process.env.FORMAT);
  })
  .then(function(response){
    console.log('ok');
    // console.log(JSON.parse(response).results[0]);
    jsonResponse = JSON.parse(response);
    parsedResult = {
      result_type: process.env.NEAR_PLACE,
      values: []
    };
    for(i = 0; i < process.env.LIMIT; i++)
      parsedResult.values.push({
        lat:     jsonResponse.results[i].geometry.location.lat,
        lng:     jsonResponse.results[i].geometry.location.lng,
        icon:    jsonResponse.results[i].icon,
        name:    jsonResponse.results[i].name,
        address: jsonResponse.results[i].vicinity
      });
    res.send(parsedResult);
  });
}

exports.answer = function(req, res) {
  res.redirect('/home');
}
