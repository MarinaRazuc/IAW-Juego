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
};

Client.moverJugador = function(x,y){
  Client.socket.emit('moverJugador',{x:x, y:y});
};

Client.emitMovement=function(moveplayerData){//{id, XX, YY}
  Client.socket.emit('player_move', moveplayerData);
};
Client.socket.on('movePlayer', function(data){
  console.log("id, x, y en CLIENT ", data.id, " ", data.x, ", ", data.y);
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

