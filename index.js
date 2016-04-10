var Discord = require("discord.js");
var config = require('./config');
var express = require('express');
var app = express();


var mybot = new Discord.Client();

mybot.on('message', function(message){
    if(message.content === 'smug')
        mybot.reply(message, 'snug smug');
});

mybot.login(config.discord.email, config.discord.password).then(function(){
  console.log(mybot.channels);
});

app.post('/github/webhook', function (req, res) {
  console.log(req.body)
  res.send('Success');
});

app.listen(8008, function () {
  console.log('Aegis is listening on port 8008');
});
