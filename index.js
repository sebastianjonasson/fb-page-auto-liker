var express = require('express'),
  request = require('request'),
  app = express(),
  config = require('./config.json');

var app_id = config.app_id
  app_secret = config.app_secret,
  page_id = config.page_id,
  short_token = "",
  access_token = "";


app.get('/auth', function(req, res) {
  short_token = req.query.token;

  getAndSetLongTermToken();
  res.send(short_token);
})

var buildLongTermTokenUrl = function() {
  var url = "https://graph.facebook.com/v2.3/oauth/access_token?";
  url += "grant_type=fb_exchange_token&";
  url += "client_id="+app_id+"&";
  url += "client_secret="+app_secret+"&";
  url += "fb_exchange_token="+short_token;

  return url;
}

var getAndSetLongTermToken = function() {
  var options = {
    method:"GET",
    url: buildLongTermTokenUrl()
  }

  request(options, function(error, response, body) {
    if(error) {
      console.log("has err", error);
    }
    var b = JSON.parse(body);
    access_token = b.access_token;
  })
}

app.use('/', express.static(__dirname));

app.listen(1337);
console.log("Server up and running");


setInterval(function() {
  var options = {
    method: "GET",
    url: "https://graph.facebook.com/v2.3/"+page_id+"/feed?access_token="+access_token,
  };

  request(options, function(err, res, body) {
    var data = JSON.parse(body);
    data = data.data;

    for(var i=0; i<data.length; i++) {
      var opts = {
        method: "POST",
        url: "https://graph.facebook.com/v2.3/"+data[i].id+"/likes?access_token="+access_token
      }
      request(opts, function(e, res, body) {
        console.log(body);
      })
    }
  })
  
  var options = {
    method: "GET",
    url: "https://graph.facebook.com/v2.3/"+page_id+"/photos?type=uploaded&access_token="+access_token,
  };

  request(options, function(err, res, body) {
    var data = JSON.parse(body);
    data = data.data;

    for(var i=0; i<data.length; i++) {
      var opts = {
        method: "POST",
        url: "https://graph.facebook.com/v2.3/"+data[i].id+"/likes?access_token="+access_token
      }
      request(opts, function(e, res, body) {
        console.log(body);
      })
    }
  })
}, 7000);
