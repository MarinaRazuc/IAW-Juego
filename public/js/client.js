var player;

//objeto cliente que actuara como la interface entre el servidor y el cliente en sí
var Client = {};

//iniciar una conexion con el servidor (localhost 
//si no se especifica otro link entre parentesis)
Client.socket = io.connect();

// Client.setFood=function(foodData){
//   Client.
// };
/*Usa nuestro objeto socket y envía a través del mismo un mensaje al servidor
  Este msj tendrá la etiqueta 'newplayer'*/
Client.askNewPlayer=function(){
  Client.socket.emit('newplayer');
 // console.log("askNewPlayer");
  Client.socket.emit('new_player', {x: 0, y: 0, angle: 0});
  
};

Client.moverJugador = function(pointer/*x,y*/){  //CAMBIOS ACAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
 // var pointer = game.input.mousePointer;
          
      //Send a new position data to the server 
      Client.socket.emit('input_fired', {
        pointer_x: pointer.x, 
        pointer_y: pointer.y, 
        pointer_worldx: pointer.worldX, 
        pointer_worldy: pointer.worldY, 
      });
//  Client.socket.emit('moverJugador',{x:x, y:y});
};

Client.emitMovement=function(moveplayerData){//{id, XX, YY}
  Client.socket.emit('player_move', moveplayerData);
};
Client.socket.on('movePlayer', function(data){
  //console.log("id, x, y en CLIENT ", data.id, " ", data.x, ", ", data.y);
  Game.actualizarPos(data.id, data.x, data.y);
});

Client.socket.on('newplayer',function(data){
    Game.addNewPlayer(data.id,data.x,data.y);
});    




Client.socket.on('allplayers',function(data){
  //  console.log(data);
    for(var i = 0; i < data.length; i++){
        Game.addNewPlayer(data[i].id,data[i].x,data[i].y);
    }
  
  Client.socket.on('move',function(data){//data es socket.player
      //console.log("Info de data ", data.id, " ", data.x, " ", data.y);
      Game.movePlayer(data.id, data.x, data.y);
  });

  Client.socket.on('remove',function(id){
      Game.removePlayer(id);
  });
});

Client.socket.on('allfood',function(data){
  for (var i = 0; i < data.length; i++) {
    Game.addNewFood(data[i].id, data[i].x, data[i].y); //me parece que seria uno por cada comida, NO por cada grupo.
  }
}); 

Client.socket.on("enemy_move", function(data){
    Game.onEnemyMove(data); 
}); //???????????????????????????????????????''
Client.socket.on('input_recieved', function(data){
    //Game.onInputRecieved(data);
    Game.movePlayer(data.id, data.x, data.y);
});//??????????????????????????????????????

//listen to new enemy connections
Client.socket.on("new_enemyPlayer", function(data){
    Game.onNewPlayer(data);
});
