var Item = require('../models/item');

exports.pushToDatabase = function(remindOMaticId, type, parameters) {
  var item            = new Item();
  item.remindOMaticId = remindOMaticId;
  item.type           = type;
  item.geo_poi        = parameters.geo_poi ? parameters.geo_poi : null;
  item.geo_place      = parameters.geo_place ? parameters.geo_place : null;
  item.timeStamp      = Date.now();

  if(item.geo_poi && item.geo_place)
    item.confirmed = true;
  else
    item.confirmed = false;
  if(item.geo_poi != null || item.geo_place != null) {
    item.save();
    return true;
  } else
    return false;
}
