'use strict';

var config = require('./../config');
const fs = require('fs');

function update (req, res) {
  var signature = req.get('X-Yuki-Signature');
  if(!req.verifySignature(config.yuki.secret, JSON.stringify(req.body), signature)) {
    res.status(401).send('Invalid signature.');
  } else {
    var data = req.body.githubData;
    var message = `Ittekimasu~! I'm going away for a bit to install the updates below! I'll hopefully be back soon! H-Hopefully... (✿˵•́ ‸ •̀˵)`;
    message += '\n\n```';
    for (var i = 0; i < data.commits.length; i++) {
      message += `\n\n${data.commits[i].author.name}\n${data.commits[i].id}\n${data.commits[i].message}`;
    }
    message += '\n```';

    req.aegis.sendMessage(req.getDischanBuilds(), message, function(){
      //wait a bit for message to send
      setTimeout(function() {
        fs.writeFileSync(`${__dirname}/../update.flag`, 'updating');
        res.send('Success');
      }, 2000);
    });
  }
}

function notify (req, res) {
  var signature = req.get('X-Yuki-Signature');
  if(!req.verifySignature(config.yuki.secret, JSON.stringify(req.body), signature)) {
    res.status(401).send('Invalid signature.');
  } else {
    var data = req.body;
    var message = `She just called, and she's totally fine! Yatta! ٩(✿ ˃̵ ᴗ ˂̵)و`;

    req.aegis.sendMessage(req.getDischanBuilds(), message);
  }
}

module.exports = {
  update: update,
  notify: notify
}
