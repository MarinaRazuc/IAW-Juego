var express = require('express');
var app = express();
var http = require('http').Server(app);//server
var io = require('socket.io')(http);
//var io=require('socket.io').listen(http)
var player_lst = [];
var p2 = require('p2'); 
var world = new p2.World({
  gravity : [0,0]
});
app.use(express.static('public'));
app.use('/static', express.static(__dirname + '/public'));
app.use('/css',express.static(__dirname + '/css'));
app.use('/assets',express.static(__dirname + '/assets'));
 
app.use('/js', express.static(__dirname+'/js'));


var physicsPlayer = require('./public/physics/playermovement.js');



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
    //console.log("newplayer");
    sleepFor(1000); //a ver si se soluciona el cannot set property
    var idp=http.lastPlayderID&7;
    http.lastPlayderID=http.lastPlayderID+1
    socket.player={
        id: idp,
        x:randomInt(0, 1152),
        y:randomInt(0, 816) //posicion aleatoria del sprite
    };
    //le enviamos al jugador la lista de los jugadores conectados
    socket.emit('allplayers', getAllPlayers());
    // socket.emit('allfood', getAllFood()); //????????????????????????????
    socket.broadcast.emit('newplayer', socket.player);
//  socket.broadcast.emit('newfood', socket.food); //???????????????????
      
    socket.on('moverJugador',function(data){
    // console.log('click to '+data.x+', '+data.y);
      socket.player.x = data.x;
      socket.player.y = data.y;
      io.emit('move',socket.player);
    //socket.broadcast.emit('movePlayer', socket.player); //enviar pos a los demas jugadores
    });

    socket.on('new_player', function(data) {
              //new player instance
              console.log("new_player!!!!!!!");
              var newPlayer = new Player(data.x, data.y, data.angle, (http.lastPlayderID-1));
            //  console.log("http id ", http.lastPlayderID-1);
              newPlayer.id = this.id;  
              
              playerBody = new p2.Body ({
                mass: 0,
                position: [0,0],
                fixedRotation: true
              });
              
              //add the playerbody into the player object 
              newPlayer.playerBody = playerBody;
              world.addBody(newPlayer.playerBody); //Y PO ESTO , CREO QUE ESTOY HACIENDO TODO MAL. VER
              //information to be sent to all clients except sender
              var current_info = {
                id: newPlayer.id, 
                x: newPlayer.x,
                y: newPlayer.y,
                angle: newPlayer.angle,
              }; 
              
              //send to the new player about everyone who is already connected.   
              for (i = 0; i < player_lst.length; i++) {
                existingPlayer = player_lst[i];
                var player_info = {
                  id: existingPlayer.id,
                  x: existingPlayer.x,
                  y: existingPlayer.y, 
                  angle: existingPlayer.angle,      
                };
                 //send message to the sender-client only
                socket.emit("new_enemyPlayer", player_info);
              }
              player_lst.push(newPlayer); 
              //send message to every connected client except the sender
              socket.broadcast.emit('new_enemyPlayer', current_info);
  });

      //el callback de 'disconnect' se registra acá, dentro del callback de 'newplayer', si esto no es así, 
      //y de alguna manera 'disconnect' es llamado antes que 'newplayer', se "rompe" el servidor
      socket.on('disconnect', function(){
        console.log('user disconnected');
        io.emit('remove', socket.player.id);
        var removePlayer = find_playerid(this.id); 
    
        if (removePlayer) {
          player_lst.splice(player_lst.indexOf(removePlayer), 1);
        }
        //send message to every connected client except the sender
        this.broadcast.emit('remove_player', {id: this.id});
      });

      socket.on('player_move', function(moveplayerData){
        socket.broadcast.emit('movePlayer', socket.player)
      });
      
      //listen for new player inputs. 
      socket.on("input_fired", function(data) {
         // var movePlayer = Game.playerMap[this.socket.id];  //ACA VA A FALLAR, NO EXISTE THIS.ID
          var movePlayer = find_playerid(this.id, this.room); 
          if (!movePlayer) {
            return;
          }
           //when sendData is true, we send the data back to client. 
          if (!movePlayer.sendData) {
            return;
          }
          
          //every 50ms, we send the data. 
          setTimeout(function() {movePlayer.sendData = true}, 50);
          //we set sendData to false when we send the data. 
          movePlayer.sendData = false;
          
          //Make a new pointer with the new inputs from the client. 
          //contains player positions in server
          var serverPointer = {
            x: data.pointer_x,
            y: data.pointer_y,
            worldX: data.pointer_worldx,    
            worldY: data.pointer_worldy
          }
          
         
          //new player position to be sent back to client. 
          var info = {
            x: movePlayer.playerBody.position[0], //ESTO VA A FALLAR
            y: movePlayer.playerBody.position[1],
            angle: movePlayer.playerBody.angle
          }

          //send to sender (not to every clients). 
        //  socket.emit('input_recieved', info);
          socket.player.x=data.x;
          socket.player.y=data.y;

          socket.emit('input_recieved', socket.player);
          //data to be sent back to everyone except sender 

          
          var moveplayerData = {
            id: movePlayer.id, 
            cli_id:movePlayer.cli_id,
            x: movePlayer.playerBody.position[0],//ESTO VA A FALLAR
            y: movePlayer.playerBody.position[1],
            angle: movePlayer.playerBody.angle,
            
          }
          
          //send to everyone except sender 
          socket.broadcast.emit('enemy_move', moveplayerData);
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

function getAllFood(){
  var food=[];
  Object.keys(io.sockets.connected).forEach(function(socketID){
    var player=io.sockets.connected[socketID].player;
    if(player){
      food.push(Game.foodMap[player.id]);
    }
  });
  return food;
};

function randomInt(low, high){
  return Math.floor(Math.random() *(high-low) +low);
};

function sleepFor( sleepDuration ){
    var now = new Date().getTime();
    while(new Date().getTime() < now + sleepDuration){ /* do nothing */ } 
}

//---------------------------------------------------------------------------------
 
//instead of listening to player positions, we listen to user inputs  ????????????????????????????????????

// find player by the the unique socket id 
function find_playerid(id) {
  for (var i = 0; i < player_lst.length; i++) {
    if (player_lst[i].id == id) {
      return player_lst[i]; 
    }
  }
  
  return false; 
}

// when a new player connects, we make a new instance of the player object,
// and send a new player message to the client. 



//a player class in the server
var Player = function (startX, startY, startAngle, cid) {
  this.x = startX
  this.y = startY
  this.angle = startAngle
  this.speed = 500;
  //We need to intilaize with true.
  this.sendData = true;
  this.cli_id=cid;
}
