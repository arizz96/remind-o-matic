var app = require('./app');
var port = process.env.PORT || 8080;

//launch ======================================================================
app.listen(port);
console.log('The magic happens on port ' + port);
