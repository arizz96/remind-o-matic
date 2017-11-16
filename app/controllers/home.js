var numeral = require('numeral');
var dateFormat = require('dateformat');
var User = require('../models/user')
//var poisearch = require('placesearch');

exports.welcome = function(req, res) {
  // creo la entry nel DB
  var user = new User();
  user.timeStamp = Date.now();
  user.save(function (err) {
      if (err) { res.send(err); }
  });

  // creo il remindOMaticId, e gli assegno l'_id dell'user appena creato
  var remindOMaticId = user._id.toString();
  res.cookie('remindOMaticId', remindOMaticId); // creo il cookie 'remindOMaticId'

  res.json(user)

  /*
  res.json({
    action: 'welcome',
    status: 200,
    body: req.__('welcome')
  });
  */
}


exports.removeAllUsers = function(req, res) {
  // rimuovo un determinato user
  User.remove(function (err) {
      if (err) { res.send(err); }
  });

  res.end();
}

exports.getAllUsers = function(req, res) {

  // Ottieni tutti gli Users
  User.find(function (err, user) {
      if (err) { res.send(err); }
      res.json(user);
  });


}

exports.ask = function(req, res) {
  var options = {
    sessionId: '123456789'
  };

  var cookies = parseCookies(req);
  var remindOMaticId = cookies['remindOMaticId'];
  var timeStamp = Date.now();


  User.findById(remindOMaticId, function (err, user) {
    if (err) return handleError(err);

    user.timeStamp = timeStamp;
    user.save(function (err, updatedUser) {
      if (err) return handleError(err);
      res.json(updatedUser);
    });
  });

  //console.log(req.body.text);
  var request = ai.textRequest(req.body.text, {sessionId: '1'});

  request.on('response', function(response) {
    //console.log(response);

    //console.log(response.result.action);
    res.end(response.result.action);
  });

  request.on('error', function(error) {
    console.log(error);
    res.end();
  });

  request.end();

}

function parseCookies (req) {
    var list = {},
        rc = req.headers.cookie;

    rc && rc.split(';').forEach(function( cookie ) {
        var parts = cookie.split('=');
        list[parts.shift().trim()] = decodeURI(parts.join('='));
    });

    return list;
}

/*exports.place = function(req, res) {
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
*/

exports.answer = function(req, res) {
  res.redirect('/home');
}
