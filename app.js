var mongoose = require('mongoose');
var express = require('express');
var app = express();
var port = process.env.PORT;

'use strict';
// app.use('/static',express.static(__direname));
app.set('view engine', 'pug');
app.set('views', './');


var db = mongoose.connect('mongodb://bumbaneitor:abcde12345@ds061676.mlab.com:61676/short-url').connection;
require('./schemas');

var ShortURL = mongoose.model('TinyURL');

db.on('error',function(error){
  console.log('error connecting to the database...');
  console.log(error);
  console.log('exitting the process...');
  process.exit();
});

app.param('url',function(req,res,next,url){
  // http regex : /https?:\/\/[\w.-]+\:?\d{0,4}/
  if(!url) {
    // res.send('Path cannot be empty.');
    res.redirect('/');
  }
  else {
    req.params['tempurl'] = url;
    ShortURL.findOne({"url":url},function(err,url){
      if (err) next(err);   // Send the error to be handled
      if(url){
        req.params.tinyurl = {
        'original_url' : url.url,
        'short_url' : url['short url']
        };
        next();
      }
      else {
        var checkIfExists = function(retries){
          var retries = retries || 0;
          var randomNumber = +(Math.random() * 10000).toFixed(0);
          // console.log('executing the demonical function...');
          // The demonical function!!!
          (function(num, callback, retries){
            // console.log('Here I am... Checking for your ID...');
            ShortURL.findOne({'id':num},function(err,res){
              if(err) next(err);
              if(res) {
                if(retries > 10) {
                  console.log('ERROR: The max of tries trying to find a unique ID was reached');
                  next('ERROR: The max of tries trying to find a unique ID was reached');
                }
                // console.log('Here I am... Calling myself back again...');

                callback(++retries);
              }
              else {
                // console.log('Here I am! getting you a new ID');
                var tinyurl = {
                  "id" : num,
                  "url" : req.params['tempurl'],
                  "short url" : req.protocol + '://' + req.get('host') + '/' + num
                };

                var newshorturl = new ShortURL(tinyurl);
                newshorturl.save(function(err){
                  if (err) next(err);
                  req.params['tinyurl'] = tinyurl;
                  next();
                });
              }
            });
          })(randomNumber, checkIfExists);
        };

        checkIfExists(0);
      }
    });
  }
});

app.param('tinyurl',function(req,res,next,tinyurl){
  ShortURL.findOne({'id': tinyurl },function(err,url){
    if (err){
      next(err);
    }     // Send the error to be handled
    req.redirecturl = url || {};
    next();
  });
});

app.get('/new/:url(*)',function(req,res){
  if(req.params.tinyurl) res.end(JSON.stringify(req.params.tinyurl));
  else res.redirect('/');
});

app.get('/:tinyurl',function(req,res){
  if(req.redirecturl.url) res.redirect(
    req.redirecturl.url.indexOf('http://')!= -1 ?
    req.redirecturl.url :
    'http://' + req.redirecturl.url
  );
  else res.redirect('/');
});

app.get('/', function(req,res){
  res.render('index',{
    'url' : req.protocol + '://' + req.get('host')
  });
});

console.log('Starting server at port ' + (port || 8001) + '...');
app.listen(port || 8001);
