var User        = require('../models/user');
var Item        = require('../models/item');
var responses   = require('../modules/responses');
var ask         = require('../modules/ask');
var push        = require('../modules/push');

exports.ask = function(req, res) {
  var cookies        = parseCookies(req);
  var remindOMaticId = cookies['remindOMaticId'];
  var options        = { sessionId: remindOMaticId };
  var request        = ai.textRequest(req.body.text, options);

  request.on('response', function(response) {
    // check basic information
    //var apiAiResponse = response;
    Item.findOne({ remindOMaticId: remindOMaticId, type: 'target' }, function(err, item) {
      switch(response.result.action) {
        case "input.place":
        case "input.poi":
        case "input.poiPlace":
          ask.place(remindOMaticId, req, res, response, item);
          break;
        case 'input.no':
          ask.no(remindOMaticId, req, res, response, item)
          break;
        default:
          res.json(responses.handleAction('unknown', req));
          res.end();
          break;
        }
    });
    // .catch(function(error){
    //   console.log(error);
    //   res.json(responses.handleAction('server_error', req));
    //   res.end();
    // });
  });

  request.on('error', function(error) {
    console.log(error);
    res.json(responses.handleAction('server_error', req));
    res.end();
  });
  request.end();
}

exports.push = function(req, res) {
  var type           = req.body.type;
  var remindOMaticId = parseCookies(req)['remindOMaticId'];
  var parameters     = {
    geo_poi:   req.body.coords,
    geo_place: req.body.name,
  };

  User.findOne({ _id: remindOMaticId })
  .then(function(user) {
    if(type == 'poi') {
      push.poi(remindOMaticId, req, res, user, parameters);
    } else {
      push.noMatch(remindOMaticId, req, res, user);
    }
  })
  .catch(function(error){
    console.log(error);
    res.json(responses.handleAction('server_error', req));
    res.end();
  });
}

function parseCookies(req) {
  var list = {};
  var rc   = req.headers.cookie;

  rc && rc.split(';').forEach(function( cookie ) {
    var parts = cookie.split('=');
    list[parts.shift().trim()] = decodeURI(parts.join('='));
  });

  return list;
}
