var numeral = require('numeral');
var dateFormat = require('dateformat');
var poisearch = require('placesearch');

exports.welcome = function(req, res) {
  console.log(req);
  res.cookie('test', 'test');
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

exports.place = function(req, res) {
  var jsonGeocode;
  // get place coordinates
  maps.geocode({
    address: '1600 Amphitheatre Parkway, Mountain View, CA'
  }, function(err, response) {
    if (!err) {
      console.log(response.json.results);
      jsonGeocode = response.json.results;
    }
  });

  console.log(jsonGeocode);

  // get attraction near the founded place
  var parameters = {
    location : '45.6448315,11.3024802',
    key : process.env.MAPS_KEY,
    rankby : 'distance',
    keyword : 'pizzeria'
  };

  poisearch.nearbysearch(parameters, process.env.FORMAT, function(statusCode, result) {
    // I could work with the result html/json here.  I could also just return it
    // console.log("onResult: (" + statusCode + ")" + JSON.stringify(result));
    res.statusCode = statusCode;
    res.send(result);
  });

}

exports.answer = function(req, res) {
  res.redirect('/home');
}
