var http = require("http")
  , express = require("express")
  , app = express()
  , server = http.createServer(app)
  , io = require("socket.io").listen(server);

server.listen(9128);
var sb_sessions = []
  , num_sessions = 0;

app.get('/', function (req, res) {
  key = req.query.key;
  res.send('<p class="result">Thank you. Your session key is ' + key + '</p>');
});

io.sockets.on('connection', function (socket) {

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
      resp_url = 'http://localhost:9128/?key=' + request_key;
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
    console.log('first_request: ');
    console.log(data);
  });

  socket.on('url_server_sync', function (data) {
    key = data.key;
    if (sb_sessions[key]) {
      sb_sessions[key].url = data.session.url;
    }
    console.log('url_sync: ');
    console.log(data);
    console.log(sb_sessions);

    socket.broadcast.emit('url_client_sync', data);
  });

});
