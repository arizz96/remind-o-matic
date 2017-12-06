var numeral = require('numeral');
var dateFormat = require('dateformat');
var User = require('../models/user');
var Item= require('../models/item')
var responses = require('../modules/responses');
var poisearch = require('../modules/placesearch');

exports.welcome = function(req, res) {
  // creo la entry nel DB
  var user = new User();

  user.timeStamp = Date.now();
  console.log("set status to first");
  user.status = 'first';
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
  console.log("entrato nell'ask");
  var request = ai.textRequest(req.body.text, options);
  request.on('response', function(response) {
    // check basic information
    console.log(response);
    //var response = ai_response;
    Item.findOne({remindOMaticId: remindOMaticId, type: 'target'}, function(err, item) {
      console.log(item);
      switch(response.result.action) {
        case "input.place":
        case "input.poi":
        case "input.poiPlace":
          if(item == null) {
            console.log(response.result.action)
            if(pushToDatabase(remindOMaticId, 'target', response.result.parameters)) {
              switch (response.result.action) {
                case 'input.place':
                  res.json(responses.handleAction('miss_poi', req));
                  res.end();
                  break;
                case 'input.poi':
                  res.json(responses.handleAction('miss_place', req));
                  res.end();
                  break;
                case 'input.poiPlace':
                  item = {};
                  item.remindOMaticId = remindOMaticId;
                  item.geo_poi = response.result.parameters.geo_poi;
                  item.geo_place = response.result.parameters.geo_place;
                  _sendSingleSearch(res, item);
                  User.findOne({_id: remindOMaticId}, function(err, user){
                    console.log("switch status from " + user.status + " to confirmTargetFirst");
                    user.status = 'confirmTargetFirst';
                    user.save();
                  });
                  break;
              }
            } else {
              res.json(responses.handleAction('unknown', req));
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
                      res.json(responses.handleAction('miss_poi', req));
                      res.end();
                    }
                  } else {
                    res.json(responses.handleAction('unknown', req));
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
                      res.json(responses.handleAction('miss_place',req));
                      res.end();
                    }
                  } else {
                    res.json(responses.handleAction('unknown', req));
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
                          res.json(responses.handleAction('miss_poi', req));
                        else
                          res.json(responses.handleAction('miss_place', req));
                        res.end();
                      }
                    } else {
                      res.json(responses.handleAction('unknown', req));
                      res.end();
                    }
                  break;
                  default:
                    res.json(responses.handleAction('unknown', req));
                    res.end();
                  break;
              }
            }
            if(item.confirmed){
              console.log("confirmed");
              User.findOne({_id: remindOMaticId}, function(err, user){
                switch (user.status) {
                  case 'first':
                    _sendSingleSearch(res, item);
                    console.log("switch status from " + user.status + " to confirmTargetFirst");
                    user.status = 'confirmTargetFirst';
                    user.save();
                    break;
                  // case 'confirmTargetFinal':
                  //   console.log("chiamata _sendSearch da riga 203");
                  //   _sendSearch(res, item.geo_poi);
                  //   user.status = 'confirmNear';
                  //   user.save();
                  //   break;
                  case 'firstForward':
                  case 'forward':
                    console.log(response.result);
                    // finchè non si trova un poi vicino a quello cercato devo chiamare la single
                    // dopo posso chiamare la search
                    Item.find({remindOMaticId: remindOMaticId, type: {'$ne': 'target' }}, function(err, result) {
                      console.log(result);
                      if(result.length == 0) {
                        console.log("chiamata _sendSearch da riga 213");
                        _sendSingleSearch(res, {remindOMaticId: remindOMaticId, geo_poi: response.result.parameters.geo_poi, geo_place: item.geo_place});
                      }
                      else {
                        console.log("chiamata _sendSearch da riga 216");
                        _sendSearch(res, remindOMaticId, response.result.parameters.geo_poi)
                      }
                    });
                    console.log("switch status from " + user.status + " to confirmNear");
                    user.status = 'confirmNear';
                    user.save();
                }
              });
            }
          }
          break;
        case 'input.unknown':
          res.json(responses.handleAction('unknown', req));
          res.end();
          break;
        case 'input.no':
          console.log("input no");
          if(item != null){
            if(item.confirmed) {
              User.findOne({_id: remindOMaticId}, function(err, user){
                console.log(user.status);
                switch (user.status) {
                  case 'firstForward':
                    res.json(responses.handleAction('error_finish'));
                    res.end();
                    console.log("switch status from " + user.status + " to end")
                    user.status = 'end';
                    user.save();
                    break;
                    break;
                  case 'forward':
                    Item.findOne({remindOMaticId: remindOMaticId, type: 'target'}, function(err, item) {
                      _sendSearch(res, remindOMaticId, null);
                      console.log("switch status from " + user.status + " to confirmTargetFinal");
                      user.status = 'confirmTargetFinal';
                      user.save();
                    });
                    break;
                }
              });
            } else {
              // dirgi che prima deve inserire poi e place
              res.json(responses.handleAction('error', req));
              res.end();
            }
          } else {
              res.json(responses.handleAction('error', req));
              res.end();
          }
          break;
        default:
          res.json(responses.handleAction('unknown', req));
          res.end();
          break;
      }
    });
  });

  request.on('error', function(error) {
       console.log(error);
  });
  request.end();
}

function _sendSearch(response, id, poi){
  console.log("entrato in _sendSearch");
  var res = response;
  var remindOMaticId = id;
  var geo_poi = poi;
  Promise.resolve()
  .then(function() {
    return poisearch.search(remindOMaticId, geo_poi);
  })
  .then(function(result){
    return result;
  })
  .then(function(nearbyResults) {
    customResponse = responses.handleAction("search");
    customResponse['nearbyResults'] = nearbyResults;
    return customResponse;
    console.log(customResponse);
  })
  .then(function(customResponse) {
    res.json(customResponse);
    res.end();
  });
}

function _sendSingleSearch(response, i){
  // console.log("entrato in _sendSingleSearch");
  var res = response;
  var item = i;
  // console.log(item);
  Promise.resolve()
  .then(function() {
    parameters = {
      keyword:  item.geo_poi,
      location: item.geo_place
    };

    // if(keyword && rankby && location)
    return poisearch.singlePoi(item.remindOMaticId, item.geo_poi);
    // else
    //   return [];
  })
  .then(function(result){
    return result;
  })
  .then(function(nearbyResults) {
    // console.log(nearbyResults);
    customResponse = responses.handleAction("search");
    customResponse['nearbyResults'] = nearbyResults;
    return customResponse;
    // console.log(customResponse);
  })
  .then(function(customResponse) {
    res.json(customResponse);
    res.end();
  });
}

exports.push = function(req, res) {
  var request = req;
  var type = req.body.type;
  var parameters = {
    geo_poi: req.body.coords,
    geo_place: req.body.name,
  };
  var remindOMaticId = parseCookies(req)['remindOMaticId'];
  User.findOne({_id: remindOMaticId}, function(err, user){
    if(type == 'poi'){
      switch(user.status){
        case 'confirmTargetFirst':
        case 'confirmTargetFinal':
          // fix handleAction response
          res.json(responses.handleAction('finish'));
          res.end();
          console.log("switch status from " + user.status + " to end");
          user.status = 'end';
          user.save();
          break;
        case 'confirmNear':
          pushToDatabase(remindOMaticId, 'POI', parameters);
          res.json(responses.handleAction('forward', request));
          res.end();
          console.log("switch status from " + user.status + " to forward");
          user.status = 'forward';
          user.save();
          break;
      }
    } else {
      switch(user.status){
        case 'confirmTargetFirst':
          res.json(responses.handleAction('forward', request));
          res.end();
          console.log("switch status from " + user.status + " to firstForward")
          user.status = 'firstForward';
          user.save();
          break;
        case 'confirmNear':
          res.json(responses.handleAction('forward', request));
          res.end();
          console.log("switch status from " + user.status + " to forward")
          user.status = 'forward';
          user.save();
          break;
        case 'confirmTargetFinal':
          res.json(responses.handleAction('error_finish'));
          res.end();
          console.log("switch status from " + user.status + " to end")
          user.status = 'end';
          user.save();
          break;
      }
    }
  });


}

function pushToDatabase(remindOMaticId, type, parameters) {
  var item = new Item();
  item.remindOMaticId = remindOMaticId;
  item.type = type;
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
