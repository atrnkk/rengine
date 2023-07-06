# RENGINE

⚠️ Old and not updated ⚠️

⚠️ Ignore the date uploaded this was written a few years ago I just decided to upload it. ⚠️

Rusty 2D Engine/Library. Simplifies creating very simple games or interfaces with an html canvas in javascript. 

Rengine is very light-weight and gives more power to the developer.

When using Rengine in a project please consider giving credit (Not required just encouraged. Ex: "runs on Rengine library").

> #### **https://github.com/RusstyCrussty123/RENGINE/labels/note Library is rarely updated anymore.**
> 
> I have moved on to other projects.
> 
> I occasionaly push out updates here and there.
> 
> It is not hard to create new object types. I implemented ways to easily create new object types for other people.
>
> This could definitely be remade way better with a better approach and structure.

-----

## Getting Started
To start you will need a canvas. You can either make your own manually or use `RENGINE.newCanvas()`.
Then you will need to create a new `RENGINE.game` class pass through your canvas and some optional data.

Example:
```js
const canvas = RENGINE.newCanvas({
  width: 500, // Required
  height: 500, // Required
  id: "yourID",
  parent: document.body,
  style: "",
});

const game = new RENGINE.game(canvas, {material:"black"}); // Material is the color or fillStyle the background will be.
```

Run `game.loadGame(<callback>)` to start the game. The callback will run when game initilization finishes.
You can now create a game object. For example a block that displays on the canvas. For this you can use the `game.createObject(data, type)` function.

Example:
```js
const block = game.createObject({
  x: 250,
  y: 250,
  width: 50,
  height: 50,
  material: "rgb(255,0,0,0)", // Red
}, "block");
```

There are more optional values for the block object. These include:
* Physics: is the block affected by physics? (true, false)
* weldedTo: a game object that the block is attached/welded too. It can be offsetted.
* offset: array of how much object is offsetted from current position. default: \[0,0]
* material: fillStyle of object. default: "black"
* texture: html image object. (new Image(url))
* textureSize: an array of the texture's size. default \[block.width, block.height]
* outlines: is there outlines? (true, false)
* outlineColor: fillStyle of the outlines. default: "black"
* rotation: degrees
* area: do not edit this
* You may add your own custom values. This acts as a normal js object.
-------

## Rengine Object
This is the main rengine object.

* **newCanvas.** `RENGINE.newCanvas(object: {width, height, id, parent, style})`: Creates a new canvas.
* **getBounds.** `RENGINE.getBounds(object: {x, y, width, height})`: Returns bounds of rectangle. Returns: `{topRight, bottomLeft}`
* **isRectCollidingWith** `RENGINE.isRectCollidingWith(rect1, rect2)`: Returns weither or not rectangle objects are overlapping. Returns: `boolean` (true/false)
* **getRandomInt** `RENGINE.getRandomInt(min, max)`: gets a random int between min and max. both included.
* **wait** `RENGINE.wait(ms)`: Asyncronous Function that waits amount of ms.
* **(Class) game** `new RENGINE.game(startingCanvas, canvasData)`: Game class.
-------

## Game Class
This is the game class. RENGINE.game.

### Methods:
* **getMousePos(event)**: gets mouse position relative to canvas. no return value only sets mouse position and fires this.mousemove();
* **trackMouse(enabled)**: method that changes state of mouse tracking. set enabled to true for mouse to be tracked.
* **drawBlock(object)**: renders a block.
* **drawLine(object)**: renders a line.
* **createObject(object, type)**: creates a game object of type. (block, text, etc)
* **gameLoop()**: method that runs every frame.
* **loadGame(callback)**: method that loads game. callback runs after game is loaded.
* **stopGame()**: method that stops game loop.
* **weld(a, b, offset)**: method that welds object a to object b with an offset if provided.
* **remove(id)**: removes a certain game object from id.

### Values:
* **canvas**: canvas for current running game.
* **canvasData**: canvas's data.
* **objects**: all game objects.
* **gameLoopCallback**: function that runs after game loop finished. runs every frame.
* **ctx**: CanvasRenderingContext2D.
* **mouse**: mouse position on canvas. {x, y}.
* **mousemove**: function that runs when mouse moves.
* **objectDefaults**: a list of default values for specific game object types. (ex: game.objectDefaults.block.name=="block");
* **objectTypes**: a list of object types. each object has a render function and is run when the object is ready to be rendered.

--------

## Game Objects
Game objects are the fundamentals for rengine. They are stored in `game.objects`. Keep in mind that the game loop (that runs every frame) loops through all of these objects and determines what do with them, like rendering.

* **Block**: x, y, width, height, material, offset, weldedTo, physics, texture, textureSize, outlines, outlineColor, rotate, name, alpha, realPosition
, pivot, shadow, textureCrop, textureScale
* **Text**: material, font, text, x, y, name, alpha, rotation
* **Line**: start, end, material, path, width, cap, join, dash, quadraticCurveTo

--------

## Custom Objects and Rendering.
It is very simple to create a custom objectType.
Here is an example of creating a new objectType:

```js
function myRenderFunction(data){ // Function to be used when object is ready to be rendered.
  game.ctx.save();
  game.ctx.fillStyle = data.material;
  game.ctx.fillRect(data.x,data.y,data.width,data.height);
  game.ctx.restore();
}

game.objectTypes["myCustomType"] = {render:myRenderFunction};
game.objectDefaults["myCustomType"] = {x:0, y:0, width:0, height:0}; // If no data is given for a value on creation the default will be used.

game.createObject({x:50, y:50, width:100, height:100, material:"black"}, "myCustomType"); // Draws a black square at (x=50, y=50) with a size of (width=100, height=100).
```
--------

## Donations
If you feel like donating to support the project you can donate to [My Paypal](https://paypal.me/RusstyPay?country.x=US&locale.x=en_US).
Any amount is greatly appreciated because this is a very small project.

--------

## Key Input
There is not a method in RENGINE for key input, to keep rengine light-weight. But you can use document.addEventListener("keypress", function(event){});

Example:
```js
document.addEventListener("keypress", function(e){
  switch (e.key.toLowerCase()) {
    case "enter":
      console.log("Enter key pressed!");
      break;
    case "w":
      console.log("W key pressed!");
      break;
  }
});
```
