nearbysearch = function(parameters, outputFormat, callback){

  var https = require("https");
  var url = process.env.MAPS_NEAR_PLACES_URL + outputFormat + "?";
  for(var key in parameters){
    url += key + "=" + parameters[key] + "&";
  }
  url = url.slice(0, -1);
  console.log(url);

  var options = {
      hostname: process.env.MAPS_HOST,
      path: url
  };

  var req = https.request(options, function(res)
    {
        var output = '';
        // console.log(options.hostname + ':' + res.statusCode);
        res.setEncoding('utf8');

        res.on('data', function (chunk) {
            output += chunk;
        });

        res.on('end', function() {
            var obj = JSON.parse(output);
            callback(res.statusCode, obj);
        });
    });

    req.on('error', function(err) {
        res.send('error: ' + err.message);
    });

    req.end();
};

exports.nearbysearch = nearbysearch;
