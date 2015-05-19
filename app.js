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


    //A user is connected
    socket.on('new:user', function(user){
      console.log("user connected")
      socket.nick = user.userId;
      users.push(user);

      //Do something with user
      io.emit('user', user);
      io.emit('error', 'error');
      console.log('emitted' + user.userId);
    });

    socket.on('user:move', function(user){
      console.log("User moved *", user.userId);
      io.broadcast.emit('user:moved', user);
    });
    socket.on('user:update', function(user){
      console.log("User Updated *", user.userId);
      // io.broadcast.emit('user moved', user);
      io.emit("admin:driverlist", users)
    });
    //Admin is connected
    socket.on('new:admin', function(data){
      console.log('admin connected')

      io.emit('error', 'error');
      io.emit('admin:driverlist', users);
      console.log(data); //Hello
      console.log("emitted admin:driverlist")
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
