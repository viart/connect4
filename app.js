var
  express = require('express'),
  app = express(),
  server = require('http').createServer(app),
  io = require('socket.io').listen(server),

  Game = require('./app/game'),
  openGame,
  chatHistory = [];

server.listen(8080);

app.use(express.static(__dirname + '/public'));

//TODO: get from the game object
app.get('/config', function (req, res) {
  res.json({width: 7, height: 6});
});

app.get('/replay', function () {
  //TODO
});

//TODO: unbind from 'login' after login, name validation
//TODO: use namespaces /chat & /game for the Event's emitting
io.sockets.on('connection', function (socket) {

  socket.on('login', function (data, cb) {
    var
      game = openGame,
      resp = {status: 'join', id: socket.id, name: data.name, creator: false};

    if (!game || !game.join(socket, data.name)) {
      game = new Game('room-' + Math.random());
      game.join(socket, data.name);
      resp.creator = true;
      openGame = game;
    }

    // create gameroom
    socket.join(game.id);

    // login response
    cb(resp);

    // unlock table for the creator
    if (!resp.creator) {
      game.getOpponents(socket.id)[0].socket.emit(resp.status, resp);
    }

    // public chat history
    socket.emit('history', chatHistory);

    // Game
    socket.on('turn', function (data, cb) {
      var resp;
      data = data || {};
      resp = game.handleTurn(socket.id, data.col, cb);
      cb(resp);

      // notify roommate (is there any better way to do that?)
      if (resp.status === 'win') {
        resp.status = 'lose';
      }
      game.getOpponents(socket.id)[0].socket.emit(resp.status, resp);
    });

    // Chat
    socket.on('msg', function (data) {
      var
        message,
        room = data.type !== 'public' ? game.id : null;

      // simple validation
      if (!data.msg || !data.type || data.msg.length > 500) {
        return;
      }

      message = {
        from: game.getPlayer(socket.id).name,
        date: +new Date(),
        msg: data.msg,
        type: data.type
      };

      io.sockets.to(room).emit('msg', message);

      // store last 10 lines from the Public chat as History
      if (data.type === 'public') {
        chatHistory.push(message);
        while (chatHistory.length > 10) {
          chatHistory.shift();
        }
      }
    });

    //TODO: update pool / join to the open game / destroy Game object
    socket.on('disconnect', function () {
      game.disconnect(socket.id);
    });
  });
});
