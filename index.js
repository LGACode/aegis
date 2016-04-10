var Discord = require("discord.js");
var config = require('./config');
var express = require('express');
var bodyParser = require('body-parser');
var app = express();

var aegis = new Discord.Client();

aegis.on('message', function(message){
  if(message.content === 'smug')
    aegis.reply(message, 'snug smug');
});

aegis.on("ready", function () {
  console.log("Ready to begin! Serving in " + aegis.channels.length + " channels");
});

aegis.login(config.discord.email, config.discord.password).then(function(){
  app.use(bodyParser.json());

  app.post('/github/webhook', function (req, res) {
    var event = req.get('X-GitHub-Event');
    var data = req.body;
    switch(event){
      case 'push':
      var message = `Wai~! ${data.pusher.name} just pushed ${data.commits.length} commit${data.commits.length > 1 ? s : ''} to ${data.repository.name} ( ${data.repository.html_url} )!`;
      message += '\n\n```';
      for (var i = 0; i < data.commits.length; i++) {
        message += `\n\n${data.commits[i].author.name}\n${data.commits[i].id}\n${data.commits[i].message}`;
      }
      message += '\n```';
      aegis.sendMessage(aegis.channels.get("name", "general"), message);
      break;
    }


    res.send('Success');
  });

  app.listen(8008, function () {
    console.log('Aegis is listening on port 8008');
  });
});
