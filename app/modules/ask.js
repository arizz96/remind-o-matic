var User        = require('../models/user');
var Item        = require('../models/item');
var responses   = require('../modules/responses');
var placesearch = require('../modules/placesearch');
var database    = require('../modules/database');

exports.place = function(remindOMaticId, req, res, apiAiResponse, item) {
  if(item == null) {
    if(database.pushToDatabase(remindOMaticId, 'target', apiAiResponse.result.parameters)) {
      switch (apiAiResponse.result.action) {
        case 'input.place':
          res.json(responses.handleAction('miss_poi', req));
          res.end();
          break;
        case 'input.poi':
          res.json(responses.handleAction('miss_place', req));
          res.end()
          break;
        case 'input.poiPlace':
          item                = {};
          item.remindOMaticId = remindOMaticId;
          item.geo_poi        = apiAiResponse.result.parameters.geo_poi;
          item.geo_place      = apiAiResponse.result.parameters.geo_place;
          placesearch.sendSingleSearch(res, item);
          User.findOne({ _id: remindOMaticId })
          .then(function(user) {
            user.status = 'confirmTargetFirst';
            user.save()
            .catch(function(error){
              console.log(error);
              res.json(responses.handleAction('server_error', req));
              res.end();
            });
          })
          .catch(function(error){
            console.log(error);
            res.json(responses.handleAction('server_error', req));
            res.end();
          });
          break;
        default:
          res.json(responses.handleAction('unknown', req));
          res.end();
          break;
      }
    } else {
      res.json(responses.handleAction('unknown', req));
      res.end();
    }
  } else {
    if(item.confirmed == false) {
      switch (apiAiResponse.result.action) {
        case 'input.place':
          if(apiAiResponse.result.parameters.geo_place != '') {
            item.geo_place = apiAiResponse.result.parameters.geo_place;
            if(item.geo_place && item.geo_poi)
              item.confirmed = true;
            item.save()
            .catch(function(error){
              console.log(error);
              res.json(responses.handleAction('server_error', req));
              res.end();
            });
            if(!item.confirmed) {
              res.json(responses.handleAction('miss_poi', req));
              res.end();
            }
          } else {
            res.json(responses.handleAction('unknown', req));
            res.end();
          }
          break;
        case 'input.poi':
          if(apiAiResponse.result.parameters.geo_poi != '') {
            item.geo_poi = apiAiResponse.result.parameters.geo_poi;
            if(item.geo_place && item.geo_poi)
              item.confirmed = true;
            item.save()
            .catch(function(error){
              console.log(error);
              res.json(responses.handleAction('server_error', req));
              res.end();
            });
            if(!item.confirmed) {
              res.json(responses.handleAction('miss_place',req));
              res.end();
            }
          } else {
            res.json(responses.handleAction('unknown', req));
            res.end();
          }
          break;
        case 'input.poiPlace':
          if(apiAiResponse.result.parameters.geo_poi != '' || apiAiResponse.result.parameters.geo_place != '') {
            item.geo_poi   = apiAiResponse.result.parameters.geo_poi ? parameters.geo_poi : null;
            item.geo_place = apiAiResponse.result.parameters.geo_place ? parameters.geo_place : null;

            if(item.geo_place && item.geo_poi)
              item.confirmed = true;
            item.save()
            .catch(function(error){
              console.log(error);
              res.json(responses.handleAction('server_error', req));
              res.end();
            });
            if(!item.confirmed) {
              if(item.geo_place != null)
                res.json(responses.handleAction('miss_poi', req));
              else
                res.json(responses.handleAction('miss_place', req));
              res.end();
            }
          } else {
            res.json(responses.handleAction('unknown', req));
            res.end();
          }
          break;
        default:
          res.json(responses.handleAction('unknown', req));
          res.end();
          break;
      }
    }
    if(item.confirmed) {
      User.findOne({ _id: remindOMaticId })
      .then(function(user) {
        switch (user.status) {
          case 'first':
            placesearch.sendSingleSearch(res, item);
            user.status = 'confirmTargetFirst';
            user.save()
            .catch(function(error){
              console.log(error);
              res.json(responses.handleAction('server_error', req));
              res.end();
            });
            break;
          case 'firstForward':
          case 'forward':
            // finchè non si trova un poi vicino a quello cercato devo chiamare la single
            // dopo posso chiamare la search
            Item.find({ remindOMaticId: remindOMaticId, type: { '$ne': 'target' } })
            .then(function(result) {
              if(result.length == 0) {
                placesearch.sendSingleSearch(res, { remindOMaticId: remindOMaticId, geo_poi: apiAiResponse.result.parameters.geo_poi, geo_place: item.geo_place });
              }
              else {
                placesearch.sendSearch(res, remindOMaticId, apiAiResponse.result.parameters.geo_poi)
              }
            })
            .catch(function(error){
              console.log(error);
              res.json(responses.handleAction('server_error', req));
              res.end();
            });
            user.status = 'confirmNear';
            user.save()
            .catch(function(error){
              console.log(error);
              res.json(responses.handleAction('server_error', req));
              res.end();
            });
            break;
        }
      })
      .catch(function(error){
        console.log(error);
        res.json(responses.handleAction('server_error', req));
        res.end();
      });
    }
  }
}

exports.no = function(remindOMaticId, req, res, apiAiResponse, item) {
  if(item != null) {
    if(item.confirmed) {
      User.findOne({ _id: remindOMaticId })
      .then(function(user) {
        switch (user.status) {
          case 'firstForward':
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
          case 'forward':
            Item.findOne({ remindOMaticId: remindOMaticId, type: 'target' })
            .then(function(item) {
              placesearch.sendSearch(res, remindOMaticId, null);
              user.status = 'confirmTargetFinal';
              user.save()
              .catch(function(error){
                console.log(error);
                res.json(responses.handleAction('server_error', req));
                res.end();
              });
            })
            .catch(function(error){
              console.log(error);
              res.json(responses.handleAction('server_error', req));
              res.end();
            });
            break;
        }
      })
      .catch(function(error){
        console.log(error);
        res.json(responses.handleAction('server_error', req));
        res.end();
      });
    } else {
      // dirgli che prima deve inserire poi e place
      if(item.geo_poi)
        res.json(responses.handleAction('miss_place', req));
      else
        res.json(responses.handleAction('miss_poi', req));
      res.end();
    }
  } else {
    res.json(responses.handleAction('error', req));
    res.end();
  }
}
