const background = game.createObject({x:0, y:0, width:canvas.width, height:canvas.height, physics:false, velocity:[0,0]}, "block");
const background2 = game.createObject({x:0, y:0, width:canvas.width, height:canvas.height, physics:false, velocity:[0,0], weldedTo:background, offset:[canvas.width,0]}, "block");
const floorHitbox = game.createObject({x:0, y:canvas.height-50, width:canvas.width, height:50, material:"black", velocity:[0,0]}, "block");
const player = game.createObject({x:canvas.width/2-50, y:0, width:50, height:50, material:"rgba(0, 0, 0, 0)", velocity:[0,0], speed:5, jumping:false, moving:false, lastMovementKey:"", colliding:false, placeType:0, name:"player"}, "block");
const floor = game.createObject({x:0, y:canvas.height-50, width:canvas.width, height:50, material:"#EFC283", velocity:[0,0]}, "block");
const floor2 = game.createObject({x:0, y:canvas.height-50, width:canvas.width, height:50, material:"#EFC283", velocity:[0,0], weldedTo:floor, offset:[canvas.width, 0], physics:true}, "block");
const stone = game.createObject({x:150, y:canvas.height-150, width:50, height:100, material:"grey", velocity:[0,0]}, "block");
const enemy = game.createObject({x:400, y:canvas.height-100, width:50, height:50, material:"red", velocity:[0,0], health:100}, "block");

const glock = game.createObject({x:300, y:canvas.height-100, width:40, height:40, material:"rgba(0,0,0,0)", velocity:[0,0], physics:false, name:"glock", canShoot:true, cooldown:50},"block");
const shotgun = game.createObject({x:350, y:canvas.height-100, width:70, height:30, material:"rgba(0,0,0,0)", velocity:[0,0], physics:false, name:"shotgun", canShoot:true, cooldown:100}, "block");

let holding = null;
let holdingOffset = [];
let maxBlockTypes = 2;

function loadTextures(){
  const floorImage = new Image(floor.width, 250);
  const stoneImage = new Image(stone.width, stone.height);
  const backgroundImage = new Image(background.width, background.height);
  const playerImage = new Image(player.width, player.height);
  const glockImage = new Image(glock.width, glock.height);
  const shotgunImage = new Image(shotgun.width, shotgun.height);

  floorImage.src = "https://external-content.duckduckgo.com/iu/?u=http%3A%2F%2F2.bp.blogspot.com%2F-17SdUuwmnN0%2FUIb50VJWI-I%2FAAAAAAAAGGw%2FzoEA5YYn78s%2Fs1600%2Fdalles2_3.png&f=1&nofb=1";
  stoneImage.src = "https://external-content.duckduckgo.com/iu/?u=http%3A%2F%2F2.bp.blogspot.com%2F-17SdUuwmnN0%2FUIb50VJWI-I%2FAAAAAAAAGGw%2FzoEA5YYn78s%2Fs1600%2Fdalles2_3.png&f=1&nofb=1";
  backgroundImage.src = "https://external-content.duckduckgo.com/iu/?u=http%3A%2F%2Fcdn.wallpapersafari.com%2F92%2F28%2FUnvdz7.jpg&f=1&nofb=1";
  playerImage.src = "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fvignette.wikia.nocookie.net%2Fclubpenguin%2Fimages%2F4%2F49%2F8bit.png%2Frevision%2Flatest%3Fcb%3D20140206023624&f=1&nofb=1";
  glockImage.src = "https://th.bing.com/th/id/R.c4f5ac2fd2113ec8f01b967d7d3fcef0?rik=lFoBKci%2bl%2fK2Ew&riu=http%3a%2f%2fi.imgur.com%2fGLiCSdQ.png&ehk=8PamjZgUlzmw12iwafrxRbCFU8xu6V5e%2bq02KQy300k%3d&risl=&pid=ImgRaw&r=0";
  shotgunImage.src = "http://i.imgur.com/Hy0M9Xm.png";
  
  background.texture = backgroundImage;
  background2.texture = backgroundImage;
  floor.texture = floorImage;
  floor2.texture = floorImage;
  player.texture = playerImage;
  stone.texture = stoneImage;
  glock.texture = glockImage;
  shotgun.texture = shotgunImage;
}

loadTextures();

function toRad(deg){
	return deg * Math.PI/360;
}

function makeBullet(velocity, damage, lifetime){
  	velocity[0] *= holding.textureScale[0];
	let bullet = game.createObject({x:player.x+holdingOffset[0], y:player.y+holdingOffset[1], width:40, height:5, material:"yellow", velocity:velocity, name:"bullet", physics:false, damage:damage, rotate:toRad(-velocity[1]*holding.textureScale[0])}, "block");
  	setTimeout(()=>{if (bullet){bullet.remove();}}, lifetime);
}

function takeDamage(humanoid, damage){
	if (humanoid.health) {
    	humanoid.health-=damage;
      
      	if (humanoid.health<=0) {
        	humanoid.remove();
        }
    }
}

function letGo(){
	if (holding) {
    	holding.weldedTo = null;
        holding.x = player.x+player.velocity[0]*20;
        holding.y = player.y;
        holding = null;
    }
}

function pickUp(item, offset){
  	letGo();
	item.weldedTo = player;
    item.offset = offset;
    holding = item;
    holdingOffset = item.offset;
}

function weaponEffect(data){
	if (data.audioURL) {
    	(new Audio(data.audioURL)).play();
    }
  	if (data.shellData) {
      	data.shellData.startVelocity[0] *= holding.textureScale[0];
      	data.shellData.endVelocity[0] *= holding.textureScale[0];
    	const shell = game.createObject({x:player.x+holdingOffset[0], y:player.y+holdingOffset[1], width:20, height:5, material:data.shellData.material, velocity:data.shellData.startVelocity, name:"shell", physics:false}, "block");
      	setTimeout(()=>{shell.velocity=data.shellData.endVelocity;}, 100);
      	setTimeout(()=>{shell.remove();}, 500);
    }
  	if (data.recoil) {
    	const oldOffset = holdingOffset;
      	holdingOffset = data.recoil.offset;
		setTimeout(()=>{holdingOffset=oldOffset;}, 100);
    }
}

//game.ctx.shadowBlur = 10;
//game.ctx.shadowColor = "grey";

document.addEventListener("keydown", function(e) {
  switch (e.key.toLowerCase()) {
    case "w":
      if (!player.jumping) {
        player.jumping = true;
      	player.y -= 5;
      	player.velocity[1] += 15;
      }
      break;

    case "a":
      player.moving = true;
      player.lastMovementKey = "a";
      player.velocity[0] = -player.speed;
      break;

    case "d":
      player.moving = true;
      player.lastMovementKey = "d";
      player.velocity[0] = player.speed;
      break;
    
    case "j":
    case "e":
      if (holding) {
      	if (holding.canShoot) {
        	if (holding.name=="glock") {
                holding.canShoot = false;
              	makeBullet([50,RENGINE.getRandomInt(-2,2)], 10, 1000);
                setTimeout(()=>{holding.canShoot = true}, holding.cooldown);
              	
              	weaponEffect({
                	audioURL: "https://cdn.glitch.global/80c01d21-cb6e-4891-bc31-29ee00ad166e/9mm-pistol-shoot-short-reverb-7152.mp3?v=1644976172902",
                  	shellData: { material:"orange", startVelocity:[RENGINE.getRandomInt(-5,-3),RENGINE.getRandomInt(1,3)], endVelocity:[-1, -10] },
                  	recoil: { offset:[RENGINE.getRandomInt(30,35), RENGINE.getRandomInt(19,21)] }
                });
            }else if(holding.name=="shotgun") {
              	holding.canShoot = false;
              	for (let i=0; i<5; i++) makeBullet([50,RENGINE.getRandomInt(-5,5)], 5, 1000);
              	setTimeout(()=>{holding.canShoot = true}, holding.cooldown);
              
              	weaponEffect({
                	audioURL: "https://cdn.glitch.global/80c01d21-cb6e-4891-bc31-29ee00ad166e/12-Gauge-Pump-Action-Shotgun-Close-Gunshot-A-www.fesliyanstudios.com.mp3?v=1644975021527",
                  	shellData: { material:"red", startVelocity:[RENGINE.getRandomInt(-5,-3),RENGINE.getRandomInt(1,3)], endVelocity:[-1, -10] },
                  	recoil: { offset:[RENGINE.getRandomInt(25,30), RENGINE.getRandomInt(19,21)] }
                });
            }
        }
      }
      break;
      
    case "backspace":
      letGo();
      break;
  }
});

document.addEventListener("keyup", function(e) {
	switch (e.key.toLowerCase()) {
      case player.lastMovementKey:
        if (player.moving) {
        	player.moving = false;
        	player.velocity[0]=0;
        }
        break;
    }
})

game.gameLoopCallback = function() {
  
  scroll(player.velocity[0]);
  
  if (RENGINE.isRectCollidingWith(glock, player)) {
  	pickUp(glock, [40,20]);
  }
  if (RENGINE.isRectCollidingWith(shotgun, player)) {
  	pickUp(shotgun, [40,20]);
  }
  if (holding) {  
    
    if (player.velocity[0]<0) {
      	holding.offset = [-holdingOffset[0]+50+player.velocity[0], holdingOffset[1]+player.velocity[1]]; 
      	holding.rotate=toRad(-player.velocity[1]*2);
    	holding.textureScale = [-1, 1];
    }else{
      	holding.offset = [holdingOffset[0]-player.velocity[0], holdingOffset[1]+player.velocity[1]];
      	holding.rotate=toRad(player.velocity[1]*2);
    	holding.textureScale = [1,1];
    }
  }
  
  // ========================= //
  
  //bullet
  for (let bullet of game.objects) {
  	if (bullet.name=="bullet") {
    	for (let rectangle of game.objects) {
        	if (rectangle.name!="player" && rectangle.name!="bullet" && rectangle!=holding && rectangle.physics) {
            	if (RENGINE.isRectCollidingWith(bullet, rectangle)) {
                  takeDamage(rectangle, bullet.damage);
                  bullet.remove();
              	}
            }
        }
    }
  }
  
  //shell
  for (let shell of game.objects) {
  	if (shell.name=="shell"&&holding) { shell.rotate = toRad(shell.velocity[1]*2*holding.textureScale[0]); }
  }
  
  //velocity
  for (let rectangle of game.objects) {
    if (rectangle.type=="block") {
    	if (rectangle != player) { rectangle.x += rectangle.velocity[0]; }
    	rectangle.y -= rectangle.velocity[1];
    }
  }

  //friction
  if (!player.jumping) {
  	if (!player.moving) {
    	if (player.velocity[0] > 0) {
          player.velocity[0]-=player.speed/80;
        } else if (player.velocity[0] < 0) {
          player.velocity[0]+=player.speed/80;
        }
    }
    if (player.velocity[0]<0.1 && player.velocity[0]>-0.1) { player.velocity[0]=0 }
  }
  
  player.colliding = false;
  
  //collision
  for (let v of game.objects) {
    if (v != player && v.physics) {
      if (RENGINE.isRectCollidingWith(player, v)) {
        player.colliding = true;
        if (player.y+player.height+10<=v.y+player.height) {
          player.velocity[1]=0;
          player.y = v.y-player.height;
          player.jumping = false;
        }else if(player.y>=v.y+v.height-10){
          player.y+=10;
          player.velocity[1]=-player.velocity[1];
        }else{
          if (player.velocity[0]>0) {
            scroll(-10);
          } else if(player.velocity[0]<0) {
            scroll(10);
          }
          player.velocity[0]=-player.velocity[0]/5;
        }
      }
    }
  }
  
  if (!player.colliding) {
  	player.velocity[1]-=1;
  }
};

function scroll(direction) {
  for (let v of game.objects) {
    if (v.type=="block" || v.type=="text") {
    	if (v.id>3) { v.x-=direction; }
    	if (v.id<1) { v.x-=direction/3; }
    }
  }
  
  if (background.x<-canvas.width) {
    background.x=0
  }else if(background.x>0){
  	background.x=-canvas.width;
  }
  
  if (floor.x<-canvas.width) {
    floor.x=0
  }else if(floor.x>0){
  	floor.x=-canvas.width;
  }
}
