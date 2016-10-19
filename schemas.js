var mongoose = require('mongoose');

var URLSchema = new mongoose.Schema({
  "id" : Number,
  "url" : String,
  "short url" : String,
  "created at" : {type : Date, default : Date.now}
});

URLSchema.query.byId = function(id){
  return this.findOne({'id': id});
};

URLSchema.query.byURL = function(url){
  return this.findOne({'url' : url});
};

mongoose.model('TinyURL', URLSchema);
