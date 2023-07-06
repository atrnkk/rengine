//== Library Written by reallypseudo ==\\
//== Repo: https://github.com/reallypseudo/RENGINE ==\\

const RENGINE = {
    version: "1.12.0",
    credits: "This was written by russtycrussty or rust. Free to use but please give credit.",
    instances: {}
}

RENGINE.newCanvas = function(data){
    let canvas = document.createElement("canvas");
    canvas.width = data.width;
    canvas.height = data.height;
    canvas.id = data.id || "RENGINE_canvas";
    
    if (data.parent) data.parent.appendChild(canvas);
    if (data.style) canvas.style = data.style;
    return canvas;
}

RENGINE.getBounds = function(data){
    return {topRight: data.x+data.width, bottomLeft:data.y+data.height};
}
RENGINE.isRectCollidingWith = function(rect1,rect2){
    return (rect1.x<rect2.x+rect2.width &&
            rect1.x+rect1.width>rect2.x &&
            rect1.y < rect2.y+rect2.height &&
            rect1.y+rect1.height>rect2.y)
}

RENGINE.getRandomInt = function(min, max) {
  return Math.floor(Math.random() * (max - min + 1) ) + min;
}

RENGINE.lerp = function(object, goal, t){
  return {x:object.x*t + goal.x*(1-t), y:object.y*t + goal.y*(1-t)};
}

RENGINE.wait = async function(ms){
    const p = new Promise((res)=>setTimeout(res,ms));
    return p;
}

RENGINE.game = class {
    constructor(startingCanvas, cvdata){
        this.canvas = startingCanvas;
        this.canvasData = cvdata || {material: "black"};
        this.objects = [];
        this.gameLoopCallback = null;
        this.ctx = this.canvas.getContext("2d");
        this.mouse = {x:0,y:0};
        this.mousemove = null;
        this.globalIndex = 0;
        //Binding
        this.createObject = this.createObject.bind(this);
        this.gameLoop = this.gameLoop.bind(this);
        this.loadGame = this.loadGame.bind(this);
        this.stopGame = this.stopGame.bind(this);
        this.drawBlock = this.drawBlock.bind(this);
        this.weld = this.weld.bind(this);
        this.remove = this.remove.bind(this);
        this.getMousePos = this.getMousePos.bind(this);
        this.trackMouse = this.trackMouse.bind(this);

        this.objectTypes = {
            "block": {render: this.drawBlock.bind(this)},
            "text": {render: this.drawText.bind(this)},
            "line": {render: this.drawLine.bind(this)},
        }
        
        this.objectDefaults = {
            "block": {
                area: 0,
                physics: true,
                weldedTo: null,
                offset: [0,0],
                material: "black",
                texture: null,
                textureSize: [],
                textureCrop: [0,0],
                textureScale: [1,1],
                alpha: 1,
                outlines: false,
                outlineColor: "black",
                shadow: null,
                rotate: 0,
                name: "block",
                pivot: [0,0],
            },
            "text": {
                material: "black",
                font: "bold 30px sans-serif",
                text: "Sample",
                x: 0,
                y: 0,
                name: "text",
                rotate: 0,
                alpha: 1,
            },
            "line": {
                start: [0,0],
                end: [0,0],
                path: [],
                width: 1,
                cap: "butt",
                join: "miter",
                dash: [],
                material: "black",
                quadraticCurveTo: null,
            }
        };

        console.log("RENGINE_gameInitiated", `Version: ${RENGINE.version}`, "The engine was loaded!");
    }

    getMousePos(evt){
        let rect = this.canvas.getBoundingClientRect();
        let scaleX = canvas.width / rect.width;    // relationship bitmap vs. element for x
        let scaleY = canvas.height / rect.height;  // relationship bitmap vs. element for y
        this.mouse = {
            x: (evt.clientX - rect.left) * scaleX,
            y: (evt.clientY - rect.top) * scaleY
        }
        if (this.mousemove) this.mousemove(evt, this.mouse);
    }

    trackMouse(enabled){
        if (enabled) {
            this.canvas.addEventListener("mousemove", this.getMousePos);
            this.canvas.addEventListener("touchmove", this.getMousePos);
        }else{
            this.canvas.removeEventListener("mousemove", this.getMousePos);
            this.canvas.removeEventListener("touchmove", this.getMousePos);
        }
    }

    drawBlock(selected){
        let position = null;
        let weldedTo = selected.weldedTo;
        let texture = selected.texture;
      
        this.ctx.save();

        if (weldedTo) { position = [weldedTo.x+weldedTo.offset[0], weldedTo.y+weldedTo.offset[1]]; }
        else{ position = [selected.x, selected.y]; }
        position = [position[0]+selected.offset[0], position[1]+selected.offset[1]];
        selected.realPosition = [position[0]+selected.pivot[0], position[1]+selected.pivot[1]];

        if (selected.shadow) {
            this.ctx.shadowBlur = selected.shadow[0];
            this.ctx.shadowColor = selected.shadow[1];
        }
        
        this.ctx.translate(position[0], position[1]);
        this.ctx.rotate(selected.rotate);
        this.ctx.globalAlpha = selected.alpha;
        this.ctx.fillStyle = selected.material;
        this.ctx.fillRect(selected.pivot[0], selected.pivot[1], selected.width, selected.height);

        if (selected.outlines) {
            this.ctx.strokeStyle = selected.outlineColor;
            this.ctx.strokeRect(selected.pivot[0], selected.pivot[1], selected.width, selected.height);
        }

        if (texture&&texture!="") { 
          if (selected.textureLoop) {
            for (let x=0; x<selected.textureLoop[0]; x++) {
              for (let y=0; y<selected.textureLoop[1]; y++) {
                this.ctx.scale(selected.textureScale[0], selected.textureScale[1]);
                this.ctx.drawImage(texture, selected.textureCrop[0], selected.textureCrop[1], selected.textureCrop[2]||texture.naturalWidth, selected.textureCrop[3]||texture.naturalHeight, texture.width*x, texture.height*y, texture.width, texture.height);
              }
            }
          } else {
            this.ctx.scale(selected.textureScale[0], selected.textureScale[1]);
            this.ctx.drawImage(texture, selected.textureCrop[0], selected.textureCrop[1], selected.textureCrop[2]||texture.naturalWidth, selected.textureCrop[3]||texture.naturalHeight, selected.pivot[0], selected.pivot[1], texture.width, texture.height);
          }
        }
        this.ctx.restore();
    }
    
    drawLine(selected){
        this.ctx.lineWidth = selected.width;
        this.ctx.lineCap = selected.cap;
        this.ctx.lineJoin = selected.join;
        this.ctx.setLineDash(selected.dash);
        this.ctx.beginPath();
        this.ctx.strokeStyle = selected.material;
        this.ctx.moveTo(selected.start[0], selected.start[1]);
        
        if (selected.quadraticCurveTo==null) {
            if (selected.path[0]) {
                for (let v of selected.path) { this.ctx.lineTo(v[0], v[1]); }
            }else{
                this.ctx.lineTo(selected.end[0], selected.end[1]);
            }
        } else {
            this.ctx.quadraticCurveTo(selected.quadraticCurveTo[0], selected.quadraticCurveTo[1], selected.quadraticCurveTo[2], selected.quadraticCurveTo[3]);
        }
      
        this.ctx.stroke();
    }
  
    drawText(selected){
      this.ctx.save();
      this.ctx.translate(selected.x, selected.y);
      this.ctx.rotate(selected.rotate);
      this.ctx.globalAlpha = selected.alpha;
      this.ctx.fillStyle = selected.material;
      this.ctx.font = selected.font;
      this.ctx.fillText(selected.text, 0, 0);
      this.ctx.restore();
    }

    createObject(data, type){
        let id = this.objects.length;
        let objectType = this.objectTypes[type]
        this.globalIndex+=1;
        type=type||"data";
        data.type=type;
        data.id=id;
        data.uid=this.globalIndex;
        if (objectType!==null) {
            data = {...this.objectDefaults[type], ...data};
            objectType.render(data);
        } else {
            console.warn("RENGINE_warn", "Type of object created was not valid: ", type);
            return false;
        }

        data.remove = () => {
          const index = this.objects.findIndex(v=>v.uid==data.uid)
          if (index>-1) this.objects.splice(index,1);
        }
        data.edit = (data) => this.objects[id] = {...this.objects[id], ...data};
        this.objects.push(data);
        return this.objects[id];
    }

    gameLoop(){
        this.ctx.fillStyle = this.canvasData.material;
        this.ctx.fillRect(0,0,this.canvas.width, this.canvas.height);

        for (let i=0; i<this.objects.length; i++) {
            let selected = this.objects[i]
            let objectType = this.objectTypes[selected.type];
            if (objectType.render) objectType.render(selected);
        }

        if (this.gameLoopCallback) this.gameLoopCallback();
        this.animationFrame = requestAnimationFrame(this.gameLoop);
    }

    loadGame(callback){
        requestAnimationFrame(this.gameLoop);
        if (callback) callback();
        console.log("RENGINE_gameLoaded");
    }

    stopGame(){
        window.cancelAnimationFrame(this.animationFrame);
        console.log("RENGINE_gameStopped");
    }

    weld(a, b, offset){
        b.weldedTo=a;
        b.offset=offset||b.offset;
    }
    
    remove(uid){
        const index = this.objects.findIndex(v=>v.uid==uid)
        if (index>-1) this.objects.splice(index,1);
    }
}
