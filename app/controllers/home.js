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
      if (err) res.send(err);
    });
  });

  //console.log(req.body.text);
  var request = ai.textRequest(req.body.text, options);

  request.on('response', function(response) {
    console.log(response);

    var action = response.result.action
    var parameters = response.result.parameters

    Item.findOne({remindOMaticId: remindOMaticId, action: action}, function (err, it) {

      if(it == null && action != "input.unknown"){ // se non esiste un item così, E se è qualcosa che DialogFlow è riuscito a capire, ne creo uno nuovo

        // creo la entry nel DB
        var item = new Item();
        item.remindOMaticId = remindOMaticId;
        item.action = action;
        item.parameters = parameters
        item.timeStamp = timeStamp;
        item.confirmed = false;
        item.save(function (err) {
            if (err) { res.send(err); }
            res.json(item)
        });
      }
      else{
        res.json("Item già presente")
      }

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
