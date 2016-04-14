var discord = require('discord.js');
var config = require('./config');
var express = require('express');
var bodyParser = require('body-parser');
var crypto = require('crypto');
var version = require('./package.json').version;
const fs = require('fs');
var github = require('./integrations/github');
var yuki = require('./integrations/yuki');
var app = express();

var aegis = new discord.Client();

function verifySignature(key, data, signature) {
  var sig = 'sha1=' + crypto.createHmac('sha1', key).update(data).digest('hex');
  return sig === signature;
}

function getDischanBuilds() {
  return aegis.servers.get('id', '166292276832763905').channels.get('name', 'builds');
}

function reconnect() {
  aegis.login(config.discord.email, config.discord.password, function(error){
    //if we have an error, try again in 30 seconds
    if(error){
      setTimeout(reconnect, 30000);
    }
  });
}

aegis.on('message', function(message){
  if(message.content === 'smug')
    aegis.reply(message, 'snug smug');
});

aegis.on('disconnected', function() {
  //try to reconnect
  reconnect();
});

aegis.on("ready", function () {
  console.log("Ready to begin! Serving in " + aegis.channels.length + " channels");
  fs.stat(`${__dirname}/update.flag`, function(err, stat) {
    if(err === null) {
      var message = `Tadaima~! (✿╹◡╹) I'm back and running version ${version} of my code!`;
      aegis.sendMessage(getDischanBuilds(), message);
      fs.unlinkSync(`${__dirname}/update.flag`);
    }
  });
});

aegis.login(config.discord.email, config.discord.password, function(){
  //attach functions and aegis to request
  app.use(function (req, res, next) {
    req.aegis = aegis;
    req.verifySignature = verifySignature;
    req.getDischanBuilds = getDischanBuilds;
    next();
  });
  app.use(bodyParser.json());
  app.post('/github/webhook', github.webhook);
  app.post('/yuki/update', yuki.update);
  app.post('/yuki/notify', yuki.notify);

  app.listen(8008, function () {
    console.log('Aegis is listening on port 8008');
  });
});
