'use strict';

var config = require('./../config');
const fs = require('fs');
var proc = require('child_process');

function webhook(req, res) {
  var event = req.get('X-GitHub-Event');
  var signature = req.get('X-Hub-Signature');
  if(!req.verifySignature(config.github.secret, JSON.stringify(req.body), signature)){
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
        req.aegis.sendMessage(req.getDischanBuilds(), message, function(){
          if(data.repository.name==='yuki'){
            message = `Since ${data.commits.length > 1 ? 'these' : 'this'} update${data.commits.length > 1 ? 's' : ''} ${data.commits.length > 1 ? 'are' : 'is'} for Yuki, I'm going to try to update her myself...`;
            req.aegis.sendMessage(req.getDischanBuilds(), message, function(){
              fs.writeFileSync(`${__dirname}/../yuki/update.flag`, 'updating');

              var stdoutStream = fs.createWriteStream(`${__dirname}/../yuki/stdout.txt`);
              stdoutStream.on('open', function () {
                var stderrStream = fs.createWriteStream(`${__dirname}/../yuki/stderr.txt`);
                stderrStream.on('open', function () {
                  //update yuki
                  try {
                    proc.execSync('kill -9 $(ps aux | grep \'[y]uki.js\' | awk \'{print $2}\')');
                  } catch(err) {}
                  try {
                    proc.execSync('git pull --progress', {cwd: `${__dirname}/../yuki`});
                  } catch(err) {}
                  try {
                    var child = proc.spawn('node', ['yuki.js'], {cwd: `${__dirname}/../yuki`, detached: true, stdio: [ stdoutStream, stderrStream, 'ignore' ]});
                    child.unref();
                  } catch(err) {}

                  message = `I updated and restarted her, she's probably fine... (✿ •́ ‸ •̀ )`;
                  req.aegis.sendMessage(req.getDischanBuilds(), message);
                });
              });
            });
          }
        });
      break;
    }

    res.send('Success');
  }
}

module.exports = {
  webhook: webhook
};
