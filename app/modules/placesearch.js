var rp        = require('request-promise');
var Item      = require('../models/item');
var responses = require('../modules/responses');

search = function(remindOMaticId, key) {
  var keyword = key;
  return Item.find({ remindOMaticId: remindOMaticId })
  .then(function(items){
    var averageLat = 0, averageLng = 0, poiCount = 0;
    var targetItem;
    for(i = 0; i < items.length; i++)
      if(items[i].type == "target")
        targetItem = items[i];
      else {
        tmp = items[i].geo_poi.split(',')
        averageLat += parseFloat(tmp[0]);
        averageLng += parseFloat(tmp[1]);
        poiCount++;
      }
    averageLat /= poiCount;
    averageLng /= poiCount;

    var parameters      = {};
    parameters.rankby   = 'distance'
    parameters.key      = process.env.MAPS_KEY;
    parameters.keyword  = keyword == null ? targetItem.geo_poi : keyword;
    parameters.location = averageLat + ',' + averageLng;
    return parameters;
  })
  .then(function(parameters) {
    var url = "https://" + process.env.MAPS_HOST + process.env.MAPS_NEAR_PLACES_URL + process.env.FORMAT + "?";

    for(var key in parameters)
      url += key + "=" + parameters[key] + "&";
    url = url.slice(0, -1);
    return rp(url);
  })
  .then(function(repos) {
    return repos;
  })
  .then(function(response) {
    jsonResponse = JSON.parse(response);
    values       = [];

    for(i = 0; i < Math.min(jsonResponse.results.length, process.env.LIMIT); i++)
      values.push({
        coords:  jsonResponse.results[i].geometry.location.lat + ',' + jsonResponse.results[i].geometry.location.lng,
        icon:    jsonResponse.results[i].icon,
        name:    jsonResponse.results[i].name,
        address: jsonResponse.results[i].vicinity
      });
    return values;
  });
}

singlePoi = function(remindOMaticId, keyword) {
  var key = keyword;
  return Item.find({ remindOMaticId: remindOMaticId }).exec()
  .then(function(items){
    var targetItem;

    for(i = 0; i < items.length; i++)
      if(items[i].type == "target")
        targetItem = items[i];
    var url = "https://" + process.env.MAPS_HOST + process.env.MAPS_PLACE_URL + process.env.FORMAT + "?key=" + process.env.MAPS_KEY + "&address=" + targetItem.geo_place;
    return rp(url);
  })
  .then(function(repos) {
    return repos;
  })
  .then(function(response) {
    jsonResponse        = JSON.parse(response);

    var parameters      = {};
    parameters.location = jsonResponse.results[0].geometry.location.lat + "," + jsonResponse.results[0].geometry.location.lng;
    parameters.key      = process.env.MAPS_KEY;
    parameters.rankby   = 'prominence';
    parameters.radius   = process.env.SEARCH_RADIUS;
    parameters.keyword  = key;
    return parameters;
  })
  .then(function(parameters) {
    var url = "https://" + process.env.MAPS_HOST + process.env.MAPS_NEAR_PLACES_URL + process.env.FORMAT + "?";

    for(var key in parameters)
      url += key + "=" + parameters[key] + "&";
    url = url.slice(0, -1);
    return rp(url);
  })
  .then(function (repos) {
    return repos;
  })
  .then(function(response){
    jsonResponse = JSON.parse(response);
    values       = [];

    for(i = 0; i < Math.min(jsonResponse.results.length, process.env.LIMIT); i++) {
      values.push({
        coords:     jsonResponse.results[i].geometry.location.lat + ',' + jsonResponse.results[i].geometry.location.lng,
        icon:    jsonResponse.results[i].icon,
        name:    jsonResponse.results[i].name,
        address: jsonResponse.results[i].vicinity
      });
    }
    return values;
  });
}

exports.sendSearch = function(response, id, poi) {
  var res            = response;
  var remindOMaticId = id;
  var geo_poi        = poi;

  Promise.resolve()
  .then(function() {
    return search(remindOMaticId, geo_poi);
  })
  .then(function(result) {
    return result;
  })
  .then(function(nearbyResults) {
    customResponse = responses.handleAction('search', res);
    customResponse['nearbyResults'] = nearbyResults;
    return customResponse;
  })
  .then(function(customResponse) {
    res.json(customResponse);
    res.end();
  });
}

exports.sendSingleSearch = function(response, i) {
  var res  = response;
  var item = i;

  Promise.resolve()
  .then(function() {
    parameters = {
      keyword:  item.geo_poi,
      location: item.geo_place
    };
    return singlePoi(item.remindOMaticId, item.geo_poi);
  })
  .then(function(result) {
    return result;
  })
  .then(function(nearbyResults) {
    customResponse = responses.handleAction('search', res);
    customResponse['nearbyResults'] = nearbyResults;
    return customResponse;
  })
  .then(function(customResponse) {
    res.json(customResponse);
    res.end();
  });
}

exports.search = search;
exports.singlePoi = singlePoi;
