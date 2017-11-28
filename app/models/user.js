/*globals require, module */

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var UserSchema = new Schema({
    timeStamp: Number
});

module.exports = mongoose.model('User', UserSchema);
