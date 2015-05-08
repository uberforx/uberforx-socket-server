var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var port = Number(process.env.PORT || 5000);

app.use('/static', express.static('public'));

app.get('/', function(req, res){
  res.sendFile(__dirname + '/public/index.html');
});

var users = [];


/* TO-DO Sepeare functions from socket events */

io.on('connection', function(socket){
    console.log('User connected');


    socket.on('new user', function(user){
      socket.nick = user.userId;
      users.push(user);
      console.log(user)

      io.emit('users', user);
    });

    socket.on('user move', function(user){
      console.log("User moved *", user.userId);
      io.emit('user moved', user);
    });
    socket.on('user update', function(user){
      console.log("User Updated *", user.userId);
      // io.emit('user moved', user);
    });

    socket.on('disconnect', function(){

      if (!socket.nick) {
        return;
      }

      for (var i = 0; i < users.length; i++) {
        if (users[i].userId === socket.nick) {
          console.log('- User disconnected: '+users[i].userId);
          users.splice(i, 1);
          io.emit('users', users);
          break;
        }
      }
    });
});

http.listen(port, function(){
  console.log('Server listening on port 5000');
});
