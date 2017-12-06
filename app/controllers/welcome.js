var User = require('../models/user');

exports.show = function(req, res) {
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
