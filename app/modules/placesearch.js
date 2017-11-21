var rp = require('request-promise');

search = function search(keyword, location, rankby = 'prominence') {
  return maps.geocode({
    address: location
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
    var url = "https://" + process.env.MAPS_HOST + process.env.MAPS_NEAR_PLACES_URL + process.env.FORMAT + "?";
    for(var key in parameters)
      url += key + "=" + parameters[key] + "&";
    url = url.slice(0, -1);

    return rp(url);
  })
  .then(function(repos) {
    return repos;
  })
  .then(function(response){
    // console.log(JSON.parse(response).results[0]);
    jsonResponse = JSON.parse(response);
    values = [];
    for(i = 0; i < Math.min(jsonResponse.results.length, process.env.LIMIT); i++)
      values.push({
        lat:     jsonResponse.results[i].geometry.location.lat,
        lng:     jsonResponse.results[i].geometry.location.lng,
        icon:    jsonResponse.results[i].icon,
        name:    jsonResponse.results[i].name,
        address: jsonResponse.results[i].vicinity
      });
    return values;
  });
}

exports.search = search;
