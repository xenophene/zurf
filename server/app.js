var fs = require("fs")
  , http = require("http")
  , https = require("https")
  , express = require("express")
  , app = express()
  , options = {
      key:  fs.readFileSync('./Authentication/server.key').toString(),
      cert: fs.readFileSync('./Authentication/server.csr').toString(),
      // ca: fs.readFileSync('./Authentication/ca.crt').toString(),
      requestCert: true,
      rejectUnauthorized: false
    }
  , httpServer = http.createServer(app.handle.bind(app)).listen(9128)
  , httpsSocketIo = require('socket.io').listen(httpServer)
  , httpsServer = https.createServer(options, app.handle.bind(app)).listen(9129)
  , httpsSocketIo = require('socket.io').listen(httpsServer);
//  , server = tls.createServer(app, options)
//  , io = require("socket.io").listen(server);


// server.listen(9128);
var sb_sessions = []
  , num_sessions = 0;

app.get('/', function (req, res) {
  key = req.query.key;
  res.send('<p class="result">Thank you. Your session key is ' + key + '</p>');
});

httpsSocketIo.sockets.on('connection', function (socket) {

  console.log('connection opened');

  socket.on('first_request', function (data, fn) {
    var request_type = data.type
      , request_key = data.key
      , resp_url;

    if (request_type == 'host') {
      var request_key = num_sessions;
      num_sessions += 1;
      sb_sessions[request_key] = {};
      sb_sessions[request_key].url = '';
      resp_url = 'https://10.66.59.129:9129/?key=' + request_key;
      //resp_url = 'https://localhost:9129/?key=' + request_key;
      /*

      socket.broadcast.emit('url_client_sync', {
        session: sb_sessions[request_key], 
        key: request_key
      });
      */

    } else if (request_key >= 0 && request_key < num_sessions) {
      resp_url = sb_sessions[request_key].url; 
      /*
      socket.broadcast.emit('url_client_sync', {
        session: sb_sessions[request_key],
        key: request_key
      });
      */
    }
    fn(request_key, resp_url);
  });

  socket.on('url_server_sync', function (data) {
    key = data.key;
    if (sb_sessions[key]) {
      if (sb_sessions[key].url == data.session.url) {
        return;
      }
      sb_sessions[key].url = data.session.url;
    }
    console.log('url_sync: ');
    console.log(data);
    console.log(sb_sessions);

    socket.broadcast.emit('url_client_sync', data);
    socket.emit('url_client_sync', data);
  });

});
