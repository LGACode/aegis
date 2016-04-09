var Discord = require("discord.js");
var config = require('./config');

var mybot = new Discord.Client();

mybot.on('message', function(message){
    if(message.content === 'smug')
        mybot.reply(message, 'snug smug');
});

mybot.login(config.discord.email, config.discord.password).then(function(){
  console.log(mybot.channels);
});
