function movetoPointer (displayObject, speed, pointer, maxTime) {

if(displayObject!=null){
	pointer = pointer;
	if (maxTime === undefined) { maxTime = 0; }

	var angle = angleToPointer(displayObject, pointer);

	if (maxTime > 0)
	{
		//  We know how many pixels we need to move, but how fast?
		speed = distanceToPointer(displayObject, pointer) / (maxTime / 1000);
	}
	


	displayObject.playerBody.velocity[0] = Math.cos(angle) * speed;
	displayObject.playerBody.velocity[1] = Math.sin(angle) * speed;


	return angle;
}else{
	//console.log("NULO");
}

}

function distanceToPointer (displayObject, pointer, world) {  ///esto no sirve

	if(displayObject!=null){
        if (world === undefined) { world = false; }

        var dx = (world) ? displayObject.world.x - pointer.worldX : displayObject.position[0] - pointer.worldX;
        var dy = (world) ? displayObject.world.y - pointer.worldY : displayObject.position[1] - pointer.worldY;

        return Math.sqrt(dx * dx + dy * dy);
    }else{
	//console.log("NULO");
}
}

function angleToPointer (displayObject, pointer, world) {

    if(displayObject!=null){
        if (world === undefined) { world = false; }

        if (world)
        {
            return Math.atan2(pointer.worldY - displayObject.world.y, pointer.worldX - displayObject.world.x);
        }
        else
        {
            return Math.atan2(pointer.worldY - displayObject.playerBody.position[1], 
			pointer.worldX - displayObject.playerBody.position[0]);
        }
	}else{
	console.log("NULO");
}
}

//we export these three functions 
this.exports = {
	movetoPointer: movetoPointer,
	distanceToPointer: distanceToPointer,
	angleToPointer: angleToPointer
}