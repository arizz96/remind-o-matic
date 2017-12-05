var rp = require('request-promise');
var User = require('../models/user');
var Item= require('../models/item')

search = function search(remindOMaticId) {
  return Item.find({remindOMaticId: remindOMaticId}).exec()
  .then(function(items){
    var averageLat = 0, averageLng = 0, poiCount = 0;
    var targetItem;
    console.log("TEST\n" + items);
    for(i = 0; i < items.length; i++)
      if(items[i].step == "target")
        targetItem = items[i];
      else {
        tmp = items[i].geo_poi.split(',')
        averageLat += parseFloat(tmp[0]);
        averageLng += parseFloat(tmp[1]);
        poiCount++;
      }
    averageLat /= poiCount;
    averageLng /= poiCount;

    var parameters = {};
    parameters.rankby = 'distance'
    parameters.key = process.env.MAPS_KEY;
    parameters.keyword = targetItem.geo_poi;
    parameters.location = averageLat + ',' + averageLng;
    console.log(parameters);
    return parameters;
  })
  .then(function(parameters){
    var url = "https://" + process.env.MAPS_HOST + process.env.MAPS_NEAR_PLACES_URL + process.env.FORMAT + "?";
    for(var key in parameters)
      url += key + "=" + parameters[key] + "&";
    url = url.slice(0, -1);
    console.log(url);
    return rp(url);
  })
  .then(function(repos) {
    // console.log(repos);
    return repos;
  })
  .then(function(response){
    // console.log(JSON.parse(response).results[0]);
    // console.log(response);
    jsonResponse = JSON.parse(response);
    values = [];
    for(i = 0; i < Math.min(jsonResponse.results.length, process.env.LIMIT); i++)
      values.push({
        coords:     jsonResponse.results[i].geometry.location.lat + ',' + jsonResponse.results[i].geometry.location.lng,
        icon:    jsonResponse.results[i].icon,
        name:    jsonResponse.results[i].name,
        address: jsonResponse.results[i].vicinity
      });
    console.log(values);
    return values;
  });
}



singlePoi = function(remindOMaticId, keyword) {
  var key = keyword;
  return Item.find({remindOMaticId: remindOMaticId}).exec()
  .then(function(items){
    var targetItem;
    for(i = 0; i < items.length; i++)
      if(items[i].step == "target")
        targetItem = items[i];
    var url = "https://" + process.env.MAPS_HOST + process.env.MAPS_PLACE_URL + process.env.FORMAT + "?key=" + process.env.MAPS_KEY + "&address=" + targetItem.geo_place;
    return rp(url);
  })
  .then(function(repos) {
    // console.log("Repos\n" + repos);
    return repos;
  })
  .then(function(response){
    jsonResponse = JSON.parse(response);
    var parameters = {};
    parameters.location = jsonResponse.results[0].geometry.location.lat + "," + jsonResponse.results[0].geometry.location.lng;
    parameters.key = process.env.MAPS_KEY;
    parameters.rankby = 'prominence';
    parameters.radius = process.env.SEARCH_RADIUS;
    parameters.keyword = key;
    return parameters;
  })
  .then(function(parameters){
    var url = "https://" + process.env.MAPS_HOST + process.env.MAPS_NEAR_PLACES_URL + process.env.FORMAT + "?";
    for(var key in parameters)
      url += key + "=" + parameters[key] + "&";
    url = url.slice(0, -1);
    return rp(url)
  })
  .then(function (repos) {
    return repos;
  })
  .then(function(response){
    jsonResponse = JSON.parse(response);
    values = [];
    for(i = 0; i < Math.min(jsonResponse.results.length, process.env.LIMIT); i++)
      values.push({
        coords:     jsonResponse.results[i].geometry.location.lat + ',' + jsonResponse.results[i].geometry.location.lng,
        icon:    jsonResponse.results[i].icon,
        name:    jsonResponse.results[i].name,
        address: jsonResponse.results[i].vicinity
      });
    return values;
  });
}
exports.search = search;
exports.singlePoi = singlePoi;
