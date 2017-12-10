var responses   = require('../modules/responses');
var database    = require('../modules/database');

exports.poi = function(remindOMaticId, req, res, user, parameters) {
  switch(user.status) {
    case 'confirmTargetFirst':
    case 'confirmTargetFinal':
      res.json(responses.handleAction('finish', req));
      res.end();
      user.status = 'end';
      user.save()
      .catch(function(error){
        console.log(error);
        res.json(responses.handleAction('server_error', req));
        res.end();
      });;
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
      user.save()
      .catch(function(error){
        console.log(error);
        res.json(responses.handleAction('server_error', req));
        res.end();
      });
      break;
    case 'confirmNear':
      res.json(responses.handleAction('forward', req));
      res.end();
      user.status = 'forward';
      user.save()
      .catch(function(error){
        console.log(error);
        res.json(responses.handleAction('server_error', req));
        res.end();
      });
      break;
    case 'confirmTargetFinal':
      res.json(responses.handleAction('error_finish', req));
      res.end();
      user.status = 'end';
      user.save()
      .catch(function(error){
        console.log(error);
        res.json(responses.handleAction('server_error', req));
        res.end();
      });
      break;
  }
}
