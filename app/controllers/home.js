var numeral = require('numeral');
var dateFormat = require('dateformat');
var User = require('../models/user');
var Item= require('../models/item')
var responses = require('../modules/responses');
var poisearch = require('../modules/placesearch');

/**************************** COOKIE ERASER ****************************/
/*
var interval = 5000//60000; // in ms = 1 min
var maxCookieTime = 10000 // in ms = 10 min

function cookieEraser() {
  var timeStamp = Date.now();

  // Ottengo e stampo tutti gli Users su console (debug)
  console.log("prima:")
  User.find(function (err, users) {
    if (err) { console.log("Errore0"); }
    console.log("Utenti: " + users);
  });
  console.log("");


  // scorro gli utenti, e rimuovo quelli con timeStamp più basso, insieme ai rispettivi item
  User.find(function (err, users) {
    if (err) { console.log("Errore1"); }

    for (index in users) {
      user = users[index]
      console.log(user);
      if(timeStamp - user.timeStamp >= maxCookieTime) // se il cookie ha superato il suo massimo tempo di vita, lo cancello
        User.remove({ _id: user._id }, function(err){
          if (err) { console.log("Errore2"); }
        });
        Item.remove({ remindOMaticId: user._id }, function(err){
          if (err) { console.log("Errore3"); }
        });
    }
  });

  // Ottengo e stampo tutti gli Users su console (debug)
  console.log("dopo:")
  User.find(function (err, users) {
    if (err) { console.log("Errore4"); }
    console.log(users);
  });
}

setInterval(cookieEraser, interval); // controllo ogni 1 minuti se ci sono cookie da cancellare

*/
/***********************************************************************/





exports.welcome = function(req, res) {
  // creo la entry nel DB
  var user = new User();
  var timeStamp = Date.now();

  user.timeStamp = timeStamp;
  user.save(function (err) {
    if (err) { res.send(err); }
  });

  // creo il remindOMaticId, e gli assegno l'_id dell'user appena creato
  var remindOMaticId = user._id.toString();
  res.cookie('remindOMaticId', remindOMaticId); // creo il cookie 'remindOMaticId'
  res.json({
    action: 'welcome',
    status: 200,
    body: req.__('welcome')
  });

}

exports.removeAllUsers = function(req, res) {
  // rimuovo un determinato user
  User.remove(function (err) {
    if (err) { res.send(err); }
  });

  res.end();
}

exports.removeAllItems = function(req, res) {
  // rimuovo un determinato user
  Item.remove(function (err) {
    if (err) { res.send(err); }
  });

  res.end();
}

exports.getAllUsers = function(req, res) {
  // Ottieni tutti gli Users
  User.find(function (err, users) {
    if (err) { res.send(err); }
    res.json(users);
  });
}


exports.getAllItems = function(req, res) {
  // Ottieni tutti gli Users
  Item.find(function (err, items) {
    if (err) { res.send(err); }
    res.json(items);
  });
}


exports.getAllItemsByUser = function(req, res) {
  var cookies = parseCookies(req);
  var remindOMaticId = cookies['remindOMaticId'];

  // Ottieni tutti gli items dell'user
  Item.find({ remindOMaticId: remindOMaticId}, function (err, items) {
    if (err) { res.send(err); }
    res.json(items);
  });
}


exports.ask = function(req, res) {


  var cookies = parseCookies(req);
  var remindOMaticId = cookies['remindOMaticId'];
  var options = {
    sessionId: remindOMaticId
  };

  var request = ai.textRequest(req.body.text, options);

  request.on('response', function(response) {
    // check basic information
    if(response.result.action == "input.place" || response.result.action == "input.poi" || response.result.action == "input.poiPlace") {
      Item.findOne({remindOMaticId: remindOMaticId, step: 'target'}, function(err, item) {
        if(item == null) {
          console.log(response.result.action)
          if(pushToDatabase(remindOMaticId, 'target', response.result.parameters))
            switch (response.result.action) {
              case 'input.place':
                res.json(responses.handleAction('miss_poi', response.result.parameters, req));
                res.end();
                break;
              case 'input.poi':
                res.json(responses.handleAction('miss_place', response.result.parameters, req));
                res.end();
                break;
              case 'input.poiPlace':
                item = {};
                item.remindOMaticId = remindOMaticId;
                item.geo_poi = response.result.parameters.geo_poi;
                item.geo_place = response.result.parameters.geo_place;
                _sendSingleSearch(res, item);
                break;
            }
          else {
            res.json(responses.handleAction('unknown', response.result.parameters, req));
            res.end();
          }
        } else {
          if(item.confirmed == false) {
            console.log("not confirmed");
            console.log(response.result);
            switch (response.result.action) {
              case 'input.place':
                if(response.result.parameters.geo_place != '') {
                  item.geo_place = response.result.parameters.geo_place;
                  if(item.geo_place && item.geo_poi)
                    item.confirmed = true;
                  // item.markModified('parameters');
                  item.save(function (err, updatedItem) {
                    if (err) console.log(err);
                    console.log(updatedItem);
                  });
                  if(!item.confirmed) {
                    res.json(responses.handleAction('miss_poi', response.result.parameters, req));
                    res.end();
                  }
                } else {
                  res.json(responses.handleAction('unknown', response.result.parameters, req));
                  res.end();
                }
                break;
              case 'input.poi':
                if(response.result.parameters.geo_poi != '') {
                  item.geo_poi = response.result.parameters.geo_poi;
                  if(item.geo_place && item.geo_poi)
                    item.confirmed = true;
                  // item.markModified('parameters');
                  item.save(function (err, updatedItem) {
                    if (err) console.log(err);
                    console.log(updatedItem);
                  });
                  if(!item.confirmed) {
                    res.json(responses.handleAction('miss_place', response.result.parameters, req));
                    res.end();
                  }
                } else {
                  res.json(responses.handleAction('unknown', response.result.parameters, req));
                  res.end();
                }
                break;
                case 'input.poiPlace':
                  if(response.result.parameters.geo_poi != '' || response.result.parameters.geo_place != '') {
                  item.geo_poi = response.result.parameters.geo_poi ? parameters.geo_poi : null;
                  item.geo_place = response.result.parameters.geo_place ? parameters.geo_place : null;
                    if(item.geo_place && item.geo_poi)
                      item.confirmed = true;
                    // item.markModified('parameters');
                    item.save(function (err, updatedItem) {
                      if (err) console.log(err);
                      console.log(updatedItem);
                    });
                    if(!item.confirmed) {
                      if(item.geo_place != null)
                        res.json(responses.handleAction('miss_poi', response.result.parameters, req));
                      else
                        res.json(responses.handleAction('miss_place', response.result.parameters, req));
                      res.end();
                    }
                  } else {
                    res.json(responses.handleAction('unknown', response.result.parameters, req));
                    res.end();
                  }
                break;
                default:
                  res.json(responses.handleAction('unknown', response.result.parameters, req));
                  res.end();
                break;

            }
          }
          if(item.confirmed == true){
            console.log("confirmed");
            _sendSingleSearch(res, item);

          }
        }
      });
    }
  });

function _sendSingleSearch(response, i){
  console.log("entrato in _sendSearch");
  var res = response;
  var item = i;
  Promise.resolve()
  .then(function() {
    keyword  = item.geo_poi;
    rankby   = 'prominence';
    location = item.geo_place;

    if(keyword && rankby && location)
      return poisearch.singlePoi(item.remindOMaticId, keyword);
    else
      return [];
  })
  .then(function(result){
    return result;
  })
  .then(function(nearbyResults) {
    customResponse = responses.handleAction("search", null, req);
    customResponse['nearbyResults'] = nearbyResults;
    return customResponse;
    console.log(customResponse);
  })
  .then(function(customResponse) {
    res.json(customResponse);
    res.end();
  });
}

  request.on('error', function(error) {
    console.log(error);
    res.end();
  });

  request.end();
}

exports.push = function(req, res) {
  remindOMaticId = parseCookies(req)['remindOMaticId'];
  parameters = {
    geo_poi: req.body.coords,
    geo_place: req.body.name,
  };
  pushToDatabase(remindOMaticId, 'POI', parameters);
  res.json(responses.handleAction('forward', req.body.name, req));
  res.end();
}




function pushToDatabase(remindOMaticId, step, parameters) {
  var item = new Item();
  item.remindOMaticId = remindOMaticId;
  item.step = step;
  item.geo_poi = parameters.geo_poi ? parameters.geo_poi : null;
  item.geo_place = parameters.geo_place ? parameters.geo_place : null;
  item.timeStamp = Date.now();
  if(item.geo_poi && item.geo_place)
    item.confirmed = true;
  else
    item.confirmed = false;
  if(item.geo_poi != null || item.geo_place != null) {
    item.save(function (err) {
        if (err) { console.log(err); }
        console.log("Pushed to DB\n" + item + "\n")
    });
    return true;
  } else
    return false;
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

exports.answer = function(req, res) {
  res.redirect('/home');
}
