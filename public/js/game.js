//var width = 1400;
//var height = 1000;
var player;
var violet_food, orange_food, green_food, blue_food, red_food, pink_food, yellow_food;
var cursors;
var speed = 80;
var score = 0;
var scoreText;
var Keys=Phaser.keyboard;
var comida;
var jugadores=0;
var scaleRatio = window.devicePixelRatio / 3;

var Game={};

//the enemy player list 
var enemies = [];

//No obligatorio, pero útil, ya que mantendrá al juego reactivo a los mensajes del servidor 
//incluso cuando la ventana del juego no esté en foco 
Game.init=function(){
	game.stage.disableVisibilityChange=true;//estaba en true
//	game.physics.arcade.setBoundsToWorld(false, false, false, false, false)
};


 Game.preload=function(){
	
	//cargar assets

	game.load.image('violet_player', '/assets/circulo_violeta.png');
	game.load.image('orange_player', '/assets/circulo_naranja.png');
	game.load.image('red_player', '/assets/circulo_rojo.png');
	game.load.image('blue_player', '/assets/circulo_azul.png');
	game.load.image('green_player', '/assets/circulo_verde.png');
	game.load.image('pink_player', '/assets/circulo_rosa.png');
	game.load.image('yellow_player', '/assets/circulo_amarillo.png');
	
	game.load.image('violet_food', '/assets/comida_violeta.png');
	game.load.image('orange_food', '/assets/comida_naranja.png');
	game.load.image('blue_food', '/assets/comida_azul.png');
	game.load.image('yellow_food', '/assets/comida_amarilla.png');
	game.load.image('green_food', '/assets/comida_verde.png');
	game.load.image('pink_food', '/assets/comida_rosa.png');
	game.load.image('red_food', '/assets/comida_roja.png');

};

  

Game.create=function() {
	var width = this.game.width;
    var height = this.game.height;
 //   var map=game.add.tilemap('map');
	game.physics.startSystem(Phaser.Physics.ARCADE);

	// para trackear a los jugadores
    Game.playerMap={};
    Game.scores={};
    Game.foodMap={};

   // console.log("width y height ", width, ", ", height);
	//Make the world larger than the actual canvas
    this.game.world.setBounds(-100, -100, 2000, 2000);

	//game.world.setBounds(0, 0, 1800, 1800);
	//start arcade physics engine

	//initialize keyboard arrows for the game controls
	//cursors = game.input.keyboard.createCursorKeys();

 	Client.askNewPlayer(); 


};

Game.update=function(){

	var xpos=game.input.mousePointer.x;
	var ypos=game.input.mousePointer.y;

	for(i=0; i<7; i++){
		if(Game.playerMap[i]!=null){
			switch(i){
				case 6:{
					game.physics.arcade.overlap(Game.playerMap[6], pink_food, eatFood); //Game.playerMap[6]
					break;
				}case 5:{
					game.physics.arcade.overlap(Game.playerMap[5], blue_food, eatFood);
					break;
				}case 4:{
					game.physics.arcade.overlap(Game.playerMap[4], green_food, eatFood);
					break;
				}case 3:{
					game.physics.arcade.overlap(Game.playerMap[3], red_food, eatFood);
					break;
				}case 2:{
					game.physics.arcade.overlap(Game.playerMap[2], yellow_food, eatFood);
					break;
				}case 1:{
					game.physics.arcade.overlap(Game.playerMap[1], violet_food, eatFood);
					break;
				}case 0:{
					game.physics.arcade.overlap(Game.playerMap[0], orange_food, eatFood);
					break;
				}
			}
		}
	}

//	console.log("en update--> xpos e ypos: ", xpos, ypos);
	Client.moverJugador(xpos,ypos);
	
};


Game.movePlayer=function(id,x,y){

	//console.log("Dentro de movePlayer, ID ", id);
	var player=Game.playerMap[id]; //línea que no permite que los jugadores se pisen
	this.game.camera.follow(player);
	
	if(player!=null){
		if(game.physics.arcade.distanceToPointer(game.input.activePointer)>5){
			//  The maxTime parameter lets you control how fast it will arrive at the Pointer coords
			game.physics.arcade.moveToPointer(player, 200);
		}else{
			player.body.velocity.set(0);
		}
	}


	var XX = player.x;
	var YY = player.y;

//	console.log("ID, worldX, worldY: ", id, ", ", XX, ", ", YY);
	Client.emitMovement({id, XX, YY});

	
};

Game.actualizarPos=function(id, x, y){
	var player=Game.playerMap[id]; //problemas --> cannot read property 'id' of undefined

//	console.log("ACTUALIZAR POS:  id: ", id, " ","x e y ", x, ", ", y);
	//pos llegan perfecto, no se como asignarlas ni a que
	if(player!=null){
		player.x=x;
		player.y=y;
	}
};

/* Crea un nuevo sprite en las coordenadas especificadas, y almacena el correspondiente objeto sprite
	en un arreglo asociativo declarado en Game.create(), con el id dado como la clave (key).
	Esto permite acceder fácilmente al sprite correspondiente a un jugador específico, 
	por ej cuando necesitamos moverlo o removerlo.*/
Game.addNewPlayer=function(id,x,y){
	var width, height;
	width = this.game.width;
	height=this.game.height;
	
	var color/*,player*/;
	var a;
	var b;
 
	switch(id){
		case 0: {	color='orange_player';
					orange_food = game.add.group();
					
					for (var i = 0; i < 60; i++) {
						a=Math.random(2);
						b=Math.random(2);
						orange_food.create(width*a, height*b, 'orange_food');
						//Client.setFood({id, width*a, height*b});
					}

					for (var i in orange_food.children) {
						orange_food.children[i].anchor.set(0.3);
					}

					game.physics.arcade.enable(orange_food, Phaser.Physics.ARCADE);
					
					Game.foodMap[id]=orange_food;//Uncaught TypeError: Cannot set property '0' of undefined

					break;
				}
		case 1: {	color='violet_player';
					violet_food = game.add.group();

					for (var i = 0; i < 60; i++) {
						a=Math.random(2);
						b=Math.random(2);
						violet_food.create(width*a, height*b, 'violet_food');
					}

					for (var i in violet_food.children) {
						violet_food.children[i].anchor.set(0.3);
					}

					game.physics.arcade.enable(violet_food, Phaser.Physics.ARCADE);
					break;
				}
		case 2: {	color='yellow_player';
					yellow_food = game.add.group();

					for (var i = 0; i < 60; i++) {
						a=Math.random(2);
						b=Math.random(2);
						yellow_food.create(width*a, height*b, 'yellow_food');
					}
					
					for (var i in yellow_food.children) {
						yellow_food.children[i].anchor.set(0.3);
					}

					game.physics.arcade.enable(yellow_food, Phaser.Physics.ARCADE);
	
					break;
				}
		case 3: {	color='red_player';
					red_food = game.add.group();

					for (var i = 0; i < 60; i++) {
						a=Math.random(2);
						b=Math.random(2);
						red_food.create(width*a, height*b, 'red_food');
						
					}

					for (var i in red_food.children) {
						red_food.children[i].anchor.set(0.3);
					}

					game.physics.arcade.enable(red_food, Phaser.Physics.ARCADE);
	
					break;
				}
		case 4: {	color='green_player';
					green_food = game.add.group();
					for (var i = 0; i < 60; i++) {
						a=Math.random(2);
						b=Math.random(2);
						green_food.create(width*a, height*b, 'green_food');
						
					}
				
					for (var i in green_food.children) {
						green_food.children[i].anchor.set(0.3);
					}

					game.physics.arcade.enable(green_food, Phaser.Physics.ARCADE);
					break;
				}
		case 5: {	color='blue_player';
					blue_food = game.add.group();
					for (var i = 0; i < 60; i++) {
						a=Math.random(2);
						b=Math.random(2);
						blue_food.create(width*a, height*b, 'blue_food');
						
					}
				
					for (var i in blue_food.children) {
						blue_food.children[i].anchor.set(0.3);
						//podria ser random 
					}

					game.physics.arcade.enable(blue_food, Phaser.Physics.ARCADE);
					break;
				}
		case 6: {	color='pink_player';
					pink_food = game.add.group();

					for (var i = 0; i < 60; i++) {
						a=Math.random(2);
						b=Math.random(2);
						pink_food.create(width*a, height*b, 'pink_food');
						
					}
					for (var i in pink_food.children) {
						pink_food.children[i].anchor.set(0.3);
						//podria ser random 
					}

					game.physics.arcade.enable(pink_food, Phaser.Physics.ARCADE);
					break;
				}


	}

	player = game.add.sprite(x, y, color); //game.world.randomX, game.world.randomY
//set anchor point to center of the sprite
	player.anchor.setTo(0.5, 0.5);
//enable physics for the player body
	game.physics.arcade.enable(player, Phaser.Physics.ARCADE);
//make the player collide with the bounds of the world
	player.body.collideWorldBounds = true;
	//player.scale.setTo(scaleRatio, scaleRatio); //queda muy peque

//place score text on the screen
	scoreText = game.add.text(5, 3, score); //HACERLO FIJO
	scoreText.fixedToCamera=true;
//game.camera.follow(player);7
	//console.log("game.js 313, id es: ", id);
 //Game.playerMap[id] = player/*game.add.sprite(x,y,color)*/;

 	Game.scores[id]=scoreText;
 	Game.playerMap[id]=player;
 	

}

//eatFood function
function eatFood(id, food) {
	//console.log("eatfood");

	//remove the piece of food
	food.kill();
	//update the score
	score++;
	scoreText.text = score;
	Game.scores[id]=scoreText;
}
/*
function render() {

    game.debug.cameraInfo(game.camera, 320, 320);

}*/
 
 
Game.removePlayer=function(id){
    var player=Game.playerMap[id].destroy();
    delete Game.playerMap[id];
  //  delete Game.food[id];
  // enemies.splice(enemies.indexOf(player), 1);
};


function randomInt(low, high){
  return Math.floor(Math.random() *(high-low) +low);
};

