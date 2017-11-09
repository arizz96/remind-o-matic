/*globals require, module */

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var UserSchema = new Schema({
    remindOMaticId: String,
    city: String
    
});

module.exports = mongoose.model('User', UserSchema);
