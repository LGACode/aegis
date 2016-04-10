var Discord = require("discord.js");
var config = require('./config');
var express = require('express');
var bodyParser = require('body-parser');
var app = express();

var mybot = new Discord.Client();

mybot.on('message', function(message){
    if(message.content === 'smug')
        mybot.reply(message, 'snug smug');
});

mybot.login(config.discord.email, config.discord.password).then(function(){
  app.use(bodyParser.json());

  app.post('/github/webhook', function (req, res) {
    var event = req.get('X-GitHub-Event');
    var data = req.body;
    console.log(data);
    console.log(event);
    switch(event){
      case 'push':
      var message = `Wai~! ${data.pusher.name} just pushed ${data.commits.length} commits to ${data.repository.name} (${data.repository.html_url})!`;
      message += '\n```';
      for (var i = 0; i < data.commits.length; i++) {
        message += `\n${data.commits[i].author.name} - ${data.commits[i].id} - ${data.commits[i].message} - ${data.commits[i].url}`;
      }
      message += '\n```';
      mybot.sendMessage('general', message);
      break;
    }


    res.send('Success');
  });

  app.listen(8008, function () {
    console.log('Aegis is listening on port 8008');
  });
});
