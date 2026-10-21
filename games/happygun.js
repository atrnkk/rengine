const socket = io();

window.addEventListener("load", ()=>{
  const canvas = document.getElementById("canvas");
  const game = new RENGINE.game(canvas, {material:"black"});
  canvas.width = 600;
  canvas.height = 600;
  game.loadGame();
  game.trackMouse(true);
  //---------------------------------------//
  const background = game.createObject({x:0, y:0, width:canvas.width, height:canvas.height, physics:false, velocity:[0,0]}, "block");
  const background2 = game.createObject({x:0, y:0, width:canvas.width, height:canvas.height, physics:false, velocity:[0,0], weldedTo:background, offset:[canvas.width,0]}, "block");
  const floorHitbox = game.createObject({x:0, y:canvas.height-50, width:canvas.width, height:50, material:"black", velocity:[0,0], name:"floorHitbox"}, "block");
  const player = game.createObject({x:canvas.width/2-50, y:0, width:50, height:50, material:"rgba(0, 0, 0, 0)", shadow:[10, "black"], velocity:[0,0], speed:6, health:100, maxHealth:100, jumping:false, moving:false, lastMovementKey:"", colliding:false, name:"player"}, "block");
  const floor = game.createObject({x:0, y:canvas.height-50, width:canvas.width, height:50, material:"#EFC283", velocity:[0,0], name:"floorHitbox"}, "block");
  const floor2 = game.createObject({x:0, y:canvas.height-50, width:canvas.width, height:50, material:"#EFC283", velocity:[0,0], weldedTo:floor, offset:[canvas.width, 0], name:"floorHitbox"}, "block");

  loadMap("/code/testmap.json");
  
  const glock = game.createObject({x:0, y:1000, width:40, height:40, material:"rgba(0,0,0,0)", velocity:[0,0], physics:false, name:"glock", lastAttack:0, cooldown:150, damage:25, grip:[40,20]},"block");
  const shotgun = game.createObject({x:0, y:1000, width:70, height:30, material:"rgba(0,0,0,0)", velocity:[0,0], physics:false, name:"shotgun", lastAttack:0, cooldown:200, damage:5, grip:[40,20]}, "block");
  const ar = game.createObject({x:0, y:1000, width:90, height:30, material:"rgba(0,0,0,0)", velocity:[0,0], physics:false, name:"ar", lastAttack:0, cooldown:50, damage:10, grip:[30,20]}, "block");
  const sword = game.createObject({x:0, y:1000, width:100, height:100, textureCrop:[1,1,1,1], material:"rgba(0,0,0,0)", velocity:[0,0], physics:false, name:"sword", lastAttack:true, cooldown:50, damage:25, grip:[30,0], pivot:[0,-25]}, "block");
  const bloodScreen = game.createObject({x:0, y:0, width:canvas.width, height:canvas.height, material:"rgba(255,0,0,0)", al:0, velocity:[0,0], physics:false, name:"bloodScreen"}, "block");
  const healthBarRoot = game.createObject({x:10, y:10, width:200, height:10, material:"grey", velocity:[0,0], physics:false, name:"healthBarRoot"}, "block");
  const healthBar = game.createObject({x:0, y:0, width:200, height:10, weldedTo:healthBarRoot, material:"green", shadow:[10,"green"], velocity:[0,0], physics:false, name:"healthBar"}, "block");
  
  const startText1 = game.createObject({x:canvas.width/2-150, y:canvas.height/3, material:"yellow", font:"bold 50px sans-serif", text:"happy gun"}, "text");
  const startText2 = game.createObject({x:canvas.width/2-150, y:canvas.height/3+50, material:"yellow", font:"bold 25px sans-serif", text:"press e to switch items. space to shoot."}, "text");
  setTimeout(startText1.remove, 5000);
  setTimeout(startText2.remove, 2500);
  
  const players = [];
  const inventory = [glock, shotgun, ar, sword];
  let currentSlot = 0;
  let holding = null;
  let holdingOffset = [];
  let maxBlockTypes = 2;
  let playerWorldX = player.x;
  let playersOffset = 0;
  let lastMoveDirection = 0;
  
  function loadMap(url){
    const req = new XMLHttpRequest();
    
    req.addEventListener("load", ()=>{
      const data = JSON.parse(req.responseText);
      for (const v of data) {
        v.velocity = [0,0];
        
        if (v.texture) {
          const texture = new Image(v.width, v.height);
          texture.src = v.texture;
          v.texture = texture;
        }
        
        game.createObject(v, v.type);
      }
    });
    
    req.open("GET", url);
    req.send();
  }

  function loadTextures(){
    const floorImage = new Image(70, 70);
    const backgroundImage = new Image(background.width, background.height);
    const playerImage = new Image(player.width, player.height);
    const glockImage = new Image(glock.width, glock.height);
    const shotgunImage = new Image(shotgun.width, shotgun.height);
    const arImage = new Image(ar.width, ar.height);
    const swordSprite = new Image(sword.width, sword.height);

    floorImage.src = "https://cdn.glitch.global/b79d3565-4f48-45a8-9971-ab1a432b9222/Screenshot%202022-02-27%20152119.png?v=1645996895424";
    backgroundImage.src = "https://cdn.glitch.global/b79d3565-4f48-45a8-9971-ab1a432b9222/(JPEG%20Image%2C%201920%C2%A0%C3%97%C2%A01280%20pixels)%20%E2%80%94%20Scaled%20(70%25).jpg?v=1651706554455";
    playerImage.src = "https://cdn.glitch.global/b79d3565-4f48-45a8-9971-ab1a432b9222/external-content.duckduckgo.com.png?v=1645320718568";
    glockImage.src = "https://cdn.glitch.global/b79d3565-4f48-45a8-9971-ab1a432b9222/R.c4f5ac2fd2113ec8f01b967d7d3fcef0.png?v=1650652923986";
    shotgunImage.src = "https://cdn.glitch.global/b79d3565-4f48-45a8-9971-ab1a432b9222/Hy0M9Xm.png?v=1651706573053";
    arImage.src = "https://cdn.glitch.global/b79d3565-4f48-45a8-9971-ab1a432b9222/M16%2C_large.webp?v=1651706591001";
    swordSprite.src = "https://cdn.glitch.global/b79d3565-4f48-45a8-9971-ab1a432b9222/Swords_swoosh.png?v=1651709219429";

    background.texture = backgroundImage;
    background2.texture = backgroundImage;
    floor.texture = floorImage;
    floor2.texture = floorImage;
    player.texture = playerImage;
    glock.texture = glockImage;
    shotgun.texture = shotgunImage;
    ar.texture = arImage;
    sword.texture = swordSprite;
    floor.textureLoop = [12,1];
    floor2.textureLoop = [12,1];
  }

  loadTextures();

  function toRad(deg){
    return deg * Math.PI/360;
  }
  
  function toDirection(n){
    if (n>0) return 1;
    if (n<0) return -1;
    return 0;
  }
  
  function playSprite(sprite, delay, length, size, position, callback){
    if (!sprite.playingSprite) {
      sprite.playingSprite = true;
      const width = size[0];
      const height = size[1];
      const oldCrop = sprite.textureCrop;
      for (let i=0; i<length; i+=1) {
        setTimeout(()=>{
          sprite.textureCrop = [sprite.textureCrop[0]+width+position[1],position[0],width,height];
        }, delay*i);
        setTimeout(()=>{
          sprite.textureCrop=oldCrop; sprite.playingSprite=false;
          if (callback) callback();
        }, delay*length);
      }
    }
  }

  function makeBullet(velocity, damage, lifetime){
      velocity[0] *= Math.cos(-holding.rotate);
      velocity[1] += Math.sin(-holding.rotate) * 50;
      const bullet = game.createObject({x:player.x+holdingOffset[0], y:player.y+holdingOffset[1], width:40, height:5, material:"yellow", velocity:velocity, name:"bullet", bulletType:"client", physics:false, damage:damage, rotate:holding.facing-toRad(180)}, "block");
      setTimeout(bullet.remove, lifetime);
    
      bullet.shadow = [10, "orange"];
      
      if (velocity[1]<-10) {
        player.velocity[1] += -Math.sin(-holding.rotate) * 5;
        player.velocity[0] += -Math.cos(-holding.rotate) * 3
        player.collding = true;
      }
    
      socket.emit("bulletShot", {
        position: [playerWorldX+holdingOffset[0], player.y+holdingOffset[1]],
        velocity:velocity, damage:damage, lifetime:lifetime,
        rotation: bullet.rotate,
      });
  }
  
  function makeCoin(x,y) {
    const coin = game.createObject({x:x, y:y, width:50, height:50, material:"rgba(0,0,0,0)", velocity:[0,0], name:"coin", physics:false}, "block");
    const coinTexture = new Image(50, 50);
    coinTexture.src = "https://opengameart.org/sites/default/files/coin_gold.png";
    coin.textureCrop = [0,0,coinTexture.naturalWidth/8,coinTexture.naturalHeight];
    coin.texture = coinTexture;
    
    setInterval(()=>{
      coin.textureCrop = [coin.textureCrop[0]+coinTexture.naturalWidth/8,0,coinTexture.naturalWidth/8,coinTexture.naturalHeight];
      if (coin.textureCrop[0]>=coinTexture.naturalWidth) coin.textureCrop = [0,0,coinTexture.naturalWidth/8,coinTexture.naturalHeight];
    }, 50);
  }
  
  function serverBullet(data){
    const bullet = game.createObject({x:data.position[0]-playersOffset, y:data.position[1], width:40, height:5, material:"yellow", creator:data.id, velocity:data.velocity, name:"bullet", bulletType:"server", physics:false, damage:data.damage, rotate:data.rotation}, "block");
    setTimeout(bullet.remove, data.lifetime);
  }
  
  function makeHitbox(data){
    const hitbox = game.createObject({x:data.position[0]-playersOffset, y:data.position[1], width:data.size[0], height:data.size[1], material:"rgba(0,0,0,0)", creator:data.id, velocity:[data.velocity], name:"hitbox", physics:false, damage:data.damage, knockback:data.knockback}, "block");
    setTimeout(hitbox.remove, data.lifetime);
  }

  function takeDamage(humanoid, bullet){
    if (humanoid.health) {
      const damage = bullet.damage;
      humanoid.health-=damage;

      if (humanoid.name=="player") {
        bloodScreen.al+=0.1;
        if (humanoid.health<=0) {
          humanoid.health = humanoid.maxHealth;
          scroll(-playersOffset+RENGINE.getRandomInt(-200,200));
          player.velocity = [0,0];
          player.y = 0;
          if (bullet.creator) socket.emit("killed", bullet.creator);
        }
      }
    }
  }
  
  function heal(amount){
    player.health+=amount;
    if (player.health>player.maxHealth) player.health=player.maxHealth;
  }

  function letGo(){
    if (holding) {
      holding.weldedTo = null;
      holding.y = canvas.height+100;
      holding = null;
      socket.emit("playerMovement", {x:playerWorldX, y:player.y, holding:null});
    }
  }

  function switchItem(slot){
    letGo();
    currentSlot = slot || currentSlot+1
    if (currentSlot>=inventory.length)  currentSlot = 0;
    const item = inventory[currentSlot];
    item.weldedTo = player;
    item.offset = item.grip;
    holding = item;
    holdingOffset = item.grip;
    holding.shadow = [10, "black"];
  }

  function weaponEffect(data){
      if (data.audioURL) {
        (new Audio(data.audioURL)).play();
      }
      if (data.shellData) {
          data.shellData.startVelocity[0] *= -holding.facing;
          data.shellData.endVelocity[0] *= -holding.facing;
          const shell = game.createObject({x:player.x+holdingOffset[0], y:player.y+holdingOffset[1], width:20, height:5, material:data.shellData.material, velocity:data.shellData.startVelocity, name:"shell", physics:false}, "block");
          setTimeout(()=>{shell.velocity=data.shellData.endVelocity;}, 100);
          setTimeout(shell.remove, 1000);
      }
      if (data.recoil) {
        const oldOffset = holdingOffset;
        holdingOffset = data.recoil.offset;
        setTimeout(()=>{holdingOffset=oldOffset;}, 100);
      }
  }
  
  function shootWeapon(){
    if (holding) {
      if (Date.now()-holding.lastAttack>=holding.cooldown) {
        holding.lastAttack = Date.now();
        if (holding.name=="glock") {
            makeBullet([40,RENGINE.getRandomInt(-2,2)], holding.damage, 1000);

            weaponEffect({
                audioURL: "https://cdn.glitch.global/80c01d21-cb6e-4891-bc31-29ee00ad166e/9mm-pistol-shoot-short-reverb-7152.mp3?v=1644976172902",
                shellData: { material:"orange", startVelocity:[RENGINE.getRandomInt(-5,-3),RENGINE.getRandomInt(1,3)], endVelocity:[-1, -10] },
                recoil: { offset:[RENGINE.getRandomInt(30,35), RENGINE.getRandomInt(19,21)] }
            });
        }else if(holding.name=="shotgun") {
            for (let i=0; i<5; i++) makeBullet([40,RENGINE.getRandomInt(-5,5)], holding.damage, 1000);

            weaponEffect({
                audioURL: "https://cdn.glitch.global/80c01d21-cb6e-4891-bc31-29ee00ad166e/12-Gauge-Pump-Action-Shotgun-Close-Gunshot-A-www.fesliyanstudios.com.mp3?v=1644975021527",
                shellData: { material:"red", startVelocity:[RENGINE.getRandomInt(-5,-3),RENGINE.getRandomInt(1,3)], endVelocity:[-1, -10] },
                recoil: { offset:[RENGINE.getRandomInt(20,25), RENGINE.getRandomInt(20,23)] }
            });
        }else if(holding.name=="ar") {
            makeBullet([50, RENGINE.getRandomInt(-3,3)], holding.damage, 1000);

            weaponEffect({
              audioURL: "https://cdn.glitch.global/b79d3565-4f48-45a8-9971-ab1a432b9222/M16%20Single%20-%20QuickSounds.com.mp3?v=1645138206883",
              shellData: { material:"orange", startVelocity:[RENGINE.getRandomInt(-5,-3),RENGINE.getRandomInt(1,3)], endVelocity:[-1, -10] },
              recoil: { offset:[RENGINE.getRandomInt(10,20), RENGINE.getRandomInt(28,21)] }
            });
        }else if(holding.name=="sword") {
          const xFace = Math.cos(-holding.rotate);
          const yFace = Math.sin(holding.rotate);
          sword.shadow = null;
          weaponEffect({audioURL: "https://cdn.glitch.global/b79d3565-4f48-45a8-9971-ab1a432b9222/SWSH_Sword%20through%20the%20air%20(ID%200128)_BSB.wav?v=1651805297905"});
          playSprite(sword, 25, 6, [sword.texture.naturalWidth/25, sword.texture.naturalWidth/15], [0,0]);
          socket.emit("hitBox", {position:[playerWorldX+xFace*100, player.y+yFace * 100], size:[100,100], velocity:[0,0], damage:holding.damage, lifetime:25, knockback:[xFace*5, yFace*5]});
        }
      }
    }
  }
  
  document.addEventListener("mousedown", shootWeapon);

  document.addEventListener("keydown", function(e) {
    if (/^\d+(\.\d+)?/.exec(e.key)) {
      switchItem(parseInt(e.key));
      return;
    }
    
    switch (e.key.toLowerCase()) {
      case "w":
        if (!player.jumping) {
          player.jumping = true;
          player.y -= 5;
          player.velocity[1] += 16;
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
      
      case "e":
        switchItem();
        break;

      case " ":
      case "j":
        shootWeapon();
        break;
    }
  });

  document.addEventListener("keyup", function(e) {
    switch (e.key.toLowerCase()) {
        case player.lastMovementKey:
          if (player.moving) {
            player.moving = false;
            if (player.velocity[0]>player.speed || player.velocity[0]<-player.speed) {
              if (player.lastMovementKey=="a") player.velocity[0]+=player.speed;
              if (player.lastMovementKey=="d") player.velocity[0]-=player.speed;
            } else {
              player.velocity[0]=0;
            }
          }
          break;
      }
  });
  
  document.getElementById("fullscreen").addEventListener("click", ()=>{
    canvas.requestFullscreen();
  });
  
  document.getElementById("controls").addEventListener("click", ()=>{
    alert("WASD to move; E or 1-9 to change weapon; Space or Click to shoot.")
  });

  game.gameLoopCallback = function() {

    scroll(player.velocity[0]);
    
    if (holding) {
      const moveDirection = toDirection(player.offset[0]);
      let offset = 0;
      if (-toDirection(Math.sin(holding.facing))<0) offset = 50;
      holding.facing = -Math.atan2(game.mouse.x-player.x, game.mouse.y-player.y);
      holding.rotate = toRad(-moveDirection * player.velocity[1] * 2 + 180)+holding.facing;
      holding.offset = [-toDirection(Math.sin(holding.facing)) * holdingOffset[0] + offset + player.velocity[0], holdingOffset[1]+player.velocity[1]];
      
      if (holding.facing>0) {
        holding.textureScale = [1, -1];
      } else {
        holding.textureScale = [1, 1];
      }
    }

    // ========================= //

    //bullet
    for (const bullet of game.objects)
    {
      if (bullet.name=="bullet")
      {
        for (const rectangle of game.objects) 
        {
          if (!(rectangle.name=="player"&&bullet.bulletType=="client") && rectangle.name!="bullet" && rectangle!=holding && rectangle.physics && rectangle.name!="floorHitbox" && rectangle.name!="shell")
          {
            if (RENGINE.isRectCollidingWith(rectangle, bullet)) 
            {
              takeDamage(rectangle, bullet);
              bullet.velocity = [0,0];
              bullet.remove();
            }
          }
        }
      }
    }
    
    //hitbox
    for (const hitbox of game.objects)
    {
      if (hitbox.name=="hitbox") {
        for (const rectangle of game.objects) if (RENGINE.isRectCollidingWith(hitbox, rectangle)&&rectangle.name=="player") {
          takeDamage(rectangle, hitbox);
          if (hitbox.knockback) {
            rectangle.velocity[0]+=hitbox.knockback[0];
            rectangle.velocity[1]+=hitbox.knockback[1];
          }
          hitbox.remove();
        }
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
    
    if (player.y>canvas.height) takeDamage(player, {damage:1});

    player.colliding = false;

    //loop
    for (let v of game.objects) 
    {
      //shell
      if (v.name=="shell"&&holding) { v.rotate = -holding.facing; }
      
      //velocity
      if (v.type=="block") {
        if (v != player) { v.x += v.velocity[0]; }
        v.y -= v.velocity[1];
      }
      
      //collision
      if (v != player && v.physics) {
        if (RENGINE.isRectCollidingWith(player, v)) {
          player.colliding = true;
          if (player.y+player.height+10<v.y+player.height) {
            player.velocity[1]=0;
            player.y = v.y-player.height;
            player.jumping = false;
          }else if(player.y>v.y+v.height-10){
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
    
    socket.emit("playerMovement", {x:playerWorldX, y:player.y, holding:holding, material:player.material});

    if (!player.colliding) {
      player.velocity[1]-=1;
    }
    healthBar.width = (player.health/player.maxHealth)*200;
    bloodScreen.material = `rgba(255,0,0,${bloodScreen.al})`;
    player.material = `rgba(255,0,0,${bloodScreen.al*2})`;
    bloodScreen.al = Math.min(Math.max(bloodScreen.al-0.01, 0), 1);
  };

  function scroll(direction) {
    for (let v of game.objects) {
      if ((v.type=="block" || v.type=="text")&&v.name!="bloodScreen"&&v.name!="healthBarRoot") {
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
    
    playerWorldX += direction;
    playersOffset += direction;
  }
  
  socket.on("bulletShot", serverBullet);
  
  socket.on("hitBox", makeHitbox);
  
  socket.on("killed", (id)=>{
    if (socket.id==id) {
      heal(90);
    }
  }); // buggy fucking piece of shit
  
  socket.on("playerMovement", (data)=>{
    let character = players[data.id];
    
    if (!character) {
      character = game.createObject({x:data.x, y:data.y, width:50, height:50, physics:false, material:`rgba(0,0,0,0)`, velocity:[0,0], name:"otherPlayer", owning:[]}, "block");
      const playerImage = new Image(character.width, character.height);
      playerImage.src = "https://cdn.glitch.global/b79d3565-4f48-45a8-9971-ab1a432b9222/16451484586088685.png?v=1645148273781";
      character.texture = playerImage;
      players[data.id] = character;
    }
    
    character.material = data.material;
    character.x = data.x-=playersOffset;
    character.y = data.y;
    
    if (data.holding) {
      if (!character.holding) {
        const item = game.createObject({...game.objects.find(v=>v.name==data.holding.name)}, "block");
        character.holding = item;
        character.holding.weldedTo = character;
        character.owning.push(item);
      }
      character.holding.offset = data.holding.offset;
      character.holding.rotate = data.holding.rotate;
      character.holding.textureScale = data.holding.textureScale;
      character.holding.textureCrop = data.holding.textureCrop;
    } else if(character.holding) {
      character.holding.remove();
      character.holding = null;
      for (let v of character.owning) v.remove();
    }
  });
  
  makeCoin(750, floor.y-45);
  
});  
