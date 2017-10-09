var express = require('express');
var app = express();
var http = require('http').Server(app);//server
var io = require('socket.io')(http);
//var io=require('socket.io').listen(http)

app.use(express.static('public'));
app.use('/static', express.static(__dirname + '/public'));
app.use('/css',express.static(__dirname + '/css'));
app.use('/assets',express.static(__dirname + '/assets'));
 
//We define a route handler "/" that gets called when we hit our website home.
app.get('/', function(req, res){
  //Let’s refactor our route handler to use sendFile instead
  res.sendFile(__dirname + '/index.html');
});

http.listen(4000, function(){
  console.log('listening on *:4000');
});

//mantiene el último ID asignado
http.lastPlayderID=0;

//Then I listen on the connection event for incoming sockets, and I log it to the console.
//Each socket also fires a special disconnect event:
io.on('connection', function(socket){
  console.log('a user connected, ID: ', http.lastPlayderID);

  //socket.on: permite especificar callbacks para manejar diferentes mensajes
  socket.on('newplayer', function(){
    var idp=http.lastPlayderID&7;
    http.lastPlayderID=http.lastPlayderID+1
    
      socket.player={
        id: idp,
        x:randomInt(0, 1152),
        y:randomInt(0, 816) //posicion aleatoria del sprite
      };
      //le enviamos al jugador la lista de los jugadores conectados
      socket.emit('allplayers', getAllPlayers());
      socket.broadcast.emit('newplayer', socket.player);
      
      socket.on('moverJugador',function(data){
       // console.log('click to '+data.x+', '+data.y);
        socket.player.x = data.x;
        socket.player.y = data.y;
        io.emit('move',socket.player);
      });

      //el callback de 'disconnect' se registra acá, dentro del 
      // callback de 'newplayer', si esto no es así, y de alguna 
      // manera 'disconnect' es llamado antes que 'newplayer', 
      // se "rompe" el servidor
      socket.on('disconnect', function(){
        console.log('user disconnected');
        io.emit('remove', socket.player.id);
      });
  });

});


function getAllPlayers(){
  var players=[];
  Object.keys(io.sockets.connected).forEach(function(socketID){
    var player=io.sockets.connected[socketID].player;
    if(player){
      players.push(player);
    }
  });
  return players;
};

function randomInt(low, high){
  return Math.floor(Math.random() *(high-low) +low);
};




 




