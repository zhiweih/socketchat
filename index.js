var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

var currentConnections = {};
io.on('connection', function(socket){
  console.log('a user connected'); 

  socket.on('user activity', function(userActivity) {
    var nickname = userActivity.nickname;
    if (nickname) {
      currentConnections[socket.id] = nickname;
    }
    if (userActivity.typing !== undefined) {
      userActivity.nickname = currentConnections[socket.id];
      userActivity.socketid = socket.id;
    }
    socket.broadcast.emit('user activity', userActivity);
  });

  socket.on('disconnect', function(){
    var nickname = currentConnections[socket.id];
    if (nickname) {
      console.log(nickname + ' disconnected');
      socket.broadcast.emit('user activity', {disconnect: nickname});
    }
    console.log('user disconnected');
  });

  socket.on('chat message', function(msg) {
    socket.broadcast.emit('chat message', {
      socketid: socket.id,
      nickname: currentConnections[socket.id],
      message: msg,
    });
  });
});

http.listen(4000, function(){
  console.log('listening on *:4000');
});
