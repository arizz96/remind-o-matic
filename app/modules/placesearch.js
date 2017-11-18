var rp = require('request-promise');

nearbysearch = function(parameters, outputFormat){
  var url = "https://" + process.env.MAPS_HOST + process.env.MAPS_NEAR_PLACES_URL + outputFormat + "?";
  for(var key in parameters)
    url += key + "=" + parameters[key] + "&";
  url = url.slice(0, -1);
  console.log(url);

  return rp(url)
  .then(function (repos) {
      return repos;
  })
  .catch(function (err) {
      // API call failed...
      console.log(err);
  });
};

exports.nearbysearch = nearbysearch;
