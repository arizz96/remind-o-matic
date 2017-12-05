/*globals require, module */

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var ItemSchema = new Schema({
    remindOMaticId: String,
    type: String,
    geo_poi: String,
    geo_place: String,
    timeStamp: Number,
    confirmed: Boolean
});

module.exports = mongoose.model('Item', ItemSchema);
