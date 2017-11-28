/*globals require, module */

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var ItemSchema = new Schema({
    remindOMaticId: String,
    action: String,
    parameters: Array,
    timeStamp: Number,
    confirmed: Boolean
});

module.exports = mongoose.model('Item', ItemSchema);
