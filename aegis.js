var Discord = require("discord.js");
var config = require('./config');
var express = require('express');
var bodyParser = require('body-parser');
var crypto = require('crypto');
var version = require('./package.json').version;
const fs = require('fs');
var proc = require('child_process');
var app = express();

var aegis = new Discord.Client();

function verifySignature(key, data, signature) {
  var sig = 'sha1=' + crypto.createHmac('sha1', key).update(data).digest('hex');
  return sig === signature;
}

aegis.on('message', function(message){
  if(message.content === 'smug')
    aegis.reply(message, 'snug smug');
});

aegis.on("ready", function () {
  console.log("Ready to begin! Serving in " + aegis.channels.length + " channels");
  fs.stat(`${__dirname}/update.flag`, function(err, stat) {
    if(err === null) {
      var message = `Tadaima~! (✿╹◡╹) I'm back and running version ${version} of my code!`;
      aegis.sendMessage(aegis.channels.get("name", "general"), message);
      fs.unlinkSync(`${__dirname}/update.flag`);
    }
  });
});

aegis.login(config.discord.email, config.discord.password).then(function(){
  app.use(bodyParser.json());

  app.post('/github/webhook', function (req, res) {
    var event = req.get('X-GitHub-Event');
    var signature = req.get('X-Hub-Signature');
    if(!verifySignature(config.github.secret, JSON.stringify(req.body), signature)){
      res.status(401).send('Invalid signature.');
    } else {
      var data = req.body;
      switch(event){
        case 'push':
          var message = `Wai~! ${data.pusher.name} just pushed ${data.commits.length} commit${data.commits.length > 1 ? 's' : ''} to ${data.repository.name} ( ${data.repository.html_url} )!`;
          message += '\n\n```';
          for (var i = 0; i < data.commits.length; i++) {
            message += `\n\n${data.commits[i].author.name}\n${data.commits[i].id}\n${data.commits[i].message}`;
          }
          message += '\n```';
          aegis.sendMessage(aegis.channels.get("name", "general"), message, function(){
            if(data.repository.name==='yuki'){
              message = `Since ${data.commits.length > 1 ? 'these' : 'this'} update is for Yuki, I'm going to try to update her myself...`;
              aegis.sendMessage(aegis.channels.get("name", "general"), message, function(){
                fs.writeFileSync(`${__dirname}/../yuki/update.flag`, 'updating');
                //update yuki
                try {
                  //kill bot
                  console.log('killing yuki');
                  proc.execSync('kill -9 $(ps aux | grep \'[y]uki.js\' | awk \'{print $2}\')');
                } finally {
                  //pull updates
                  console.log('pulling updates');
                  proc.execSync('git pull', {cwd: `${__dirname}/../yuki`});
                  //start bot
                  console.log('restarting bot');
                  proc.execSync('node yuki.js > stdout.txt 2> stderr.txt &', {cwd: `${__dirname}/../yuki`});

                  message = `I updated and restarted her, she's probably fine... (✿ •́ ‸ •̀ )`;
                  aegis.sendMessage(aegis.channels.get("name", "general"), message);
                }
              });
            }
          });
        break;
      }

      res.send('Success');
    }
  });

  app.post('/yuki/update', function (req, res) {
    var signature = req.get('X-Yuki-Signature');
    if(!verifySignature(config.yuki.secret, JSON.stringify(req.body), signature)) {
      res.status(401).send('Invalid signature.');
    } else {
      var data = req.body.githubData;
      var message = `Ittekimasu~! I'm going away for a bit to install the updates below! I'll hopefully be back soon! H-Hopefully... (✿˵•́ ‸ •̀˵)`;
      message += '\n\n```';
      for (var i = 0; i < data.commits.length; i++) {
        message += `\n\n${data.commits[i].author.name}\n${data.commits[i].id}\n${data.commits[i].message}`;
      }
      message += '\n```';

      aegis.sendMessage(aegis.channels.get("name", "general"), message, function(){
        //wait a bit for message to send
        setTimeout(function() {
          fs.writeFileSync(`${__dirname}/update.flag`, 'updating');
          res.send('Success');
        }, 2000);
      });
    }
  });

  app.post('/yuki/notify', function (req, res) {
    var signature = req.get('X-Yuki-Signature');
    if(!verifySignature(config.yuki.secret, JSON.stringify(req.body), signature)) {
      res.status(401).send('Invalid signature.');
    } else {
      var data = req.body;
      var message = `She just called, and she's totally fine! Yatta! ٩(✿˃̵ᴗ˂̵)و`;

      aegis.sendMessage(aegis.channels.get("name", "general"), message);
    }
  });

  app.listen(8008, function () {
    console.log('Aegis is listening on port 8008');
  });
});
