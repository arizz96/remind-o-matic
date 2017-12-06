var responses   = require('../modules/responses');
var database    = require('../modules/database');

exports.poi = function(remindOMaticId, req, res, user, parameters) {
  switch(user.status) {
    case 'confirmTargetFirst':
    case 'confirmTargetFinal':
      res.json(responses.handleAction('finish', req));
      res.end();
      user.status = 'end';
      user.save();
      break;
    case 'confirmNear':
      database.pushToDatabase(remindOMaticId, 'POI', parameters);
      res.json(responses.handleAction('forward', req));
      res.end();
      user.status = 'forward';
      user.save();
      break;
  }
}

exports.noMatch = function(remindOMaticId, req, res, user) {
  switch(user.status) {
    case 'confirmTargetFirst':
      res.json(responses.handleAction('forward', req));
      res.end();
      user.status = 'firstForward';
      user.save();
      break;
    case 'confirmNear':
      res.json(responses.handleAction('forward', req));
      res.end();
      user.status = 'forward';
      user.save();
      break;
    case 'confirmTargetFinal':
      res.json(responses.handleAction('error_finish', req));
      res.end();
      user.status = 'end';
      user.save();
      break;
  }
}
