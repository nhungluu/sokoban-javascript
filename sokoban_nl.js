"use strict";
window.onload = startGame;

////////////////////////////////////////
//Variables declaration/////////////////
////////////////////////////////////////

var sokoban;            //the player component - stores the current coordinates (on canvas) of the player to be used to direct move after handle key stroke
var myGameCanvas;       //canvas to create & display game
var currentMap = [];    //matrix initially loaded from json, updated map after each move
var moves = 0;          //number of moves made
var currentLevel = 0;   //current level of the game loaded
var target = 0;         //number of target spots to filled
var goalCounter = 0;    //number of target goals achieved
var CELL_SIZE = 40;     //size of each matrix cell to display on canvas
var mapsObject = {};    //game maps loaded from json
//stores the source of image file and character used on game map matrix
const gameObjects = {
    player:{
        source: "gfx/player.png",
        sign: "@",

    },
    grass:{
        source: "gfx/grass.png",
        sign: "G",
    },
    block:{
        source: "gfx/block.png",
        sign: "D",
    },
    box:{
        source:"gfx/box.png",
        sign: "B",
    },
    spot:{
        source:"gfx/spot.png",
        sign: "*",
    },
    floor:{
        source:"gfx/floor.png",
        sign: "-",
    },
    "box on spot":{
        source:"gfx/bspot.png",
        sign: "$"
    },
    "player on spot":{
        source:"gfx/player.png",
        sign: "#"
    }
};

////////////////////////////////////////
//Functions declaration/////////////////
////////////////////////////////////////

function startGame(){
    $.getJSON("maps.json", function(data){
        mapsObject = data;
        myGameCanvas.start(mapsObject,currentLevel);
    });
}

//function to load game canvas of current level from map stored in json
myGameCanvas = {
    canvas : document.createElement("canvas"),

    //load map at the current level from existing map library stored in json
    start : function(maps,level) {
        currentMap = maps.mapLevels[level].map;
        this.canvas.height = currentMap.length*CELL_SIZE;
        this.canvas.width = currentMap[0].length*CELL_SIZE;
        this.context = this.canvas.getContext("2d");
        this.displayMap(currentMap);
        var gameCanvas = document.getElementById("sokoban_holder");
        gameCanvas.appendChild(this.canvas);
        //document.body.insertBefore(this.canvas, document.body.childNodes[0]);
    },
    clear : function() {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    },

    displayMap: function(map) {
        goalCounter = 0;
        target = 0;
        //Important: for matrix, the coordination is reverse order to the canvas i.e.
        //matrix: y (vertical - column) => x (horizontal - row)
        //canvas: x (horizontal) => y (vertical)
        for(var i=0; i<map.length; i++){
            for(var j=0; j<map[0].length; j++){
                if (map[i][j]=== gameObjects.player.sign){
                    sokoban = new component(gameObjects.player.source,j*CELL_SIZE,i*CELL_SIZE);
                    console.log(sokoban.x);
                    console.log(sokoban.y);
                }
                else if (map[i][j]=== gameObjects.grass.sign){
                    var grass= new component(gameObjects.grass.source,j*CELL_SIZE,i*CELL_SIZE);
                }
                else if (map[i][j]=== gameObjects.block.sign){
                    var block = new component(gameObjects.block.source,j*CELL_SIZE,i*CELL_SIZE);
                }
                else if (map[i][j]=== gameObjects.box.sign || map[i][j]=== gameObjects["box on spot"].sign){
                    if(map[i][j] === gameObjects.box.sign){
                        var box= new component(gameObjects.box.source,j*CELL_SIZE,i*CELL_SIZE);
                    }
                    else{
                        box = new component(gameObjects["box on spot"].source,j*CELL_SIZE,i*CELL_SIZE);
                        goalCounter++;
                        target++;
                    }

                }
                else if (map[i][j]=== gameObjects.spot.sign || map[i][j]=== gameObjects["player on spot"].sign){
                    if(map[i][j] === gameObjects.spot.sign){
                        var spot = new component(gameObjects.spot.source,j*CELL_SIZE,i*CELL_SIZE);
                    }
                    else {
                        var playerOnSpot = new component(gameObjects.player.source,j*CELL_SIZE,i*CELL_SIZE);
                    }
                    target++;

                }
                else if(map[i][j]=== gameObjects.floor.sign){
                    var floor = new component(gameObjects.floor.source,j*CELL_SIZE,i*CELL_SIZE);
                }

            }
        }
    },
};

//function to create game object on canvas
function component(img,x,y) {
    this.x = x;
    this.y = y;
    this.img = new Image;
    this.img.src = img;
    //console.log(this.img);

    var ctx = myGameCanvas.context;
    ctx.drawImage(this.img, this.x, this.y, CELL_SIZE, CELL_SIZE);
}

//function to manage game objects' moves
function move(keyCode, object) {
    var dx = 0;
    var dy = 0;
    //console.log("keycode =" + keyCode);
    if (keyCode === 37) dy = -1; //go left
    else if (keyCode === 38) dx = -1; //go up
    else if (keyCode === 39) dy = 1; //go right
    else if (keyCode === 40) dx = 1; //go down

    var posX = object.y/CELL_SIZE; //convert from canvas coordinate to matrix position - reversed order of canvas object's coordinates
    var posY = object.x/CELL_SIZE;
    var nextPosX = posX + dx;
    var nextPosY = posY + dy;

    var currentPos = currentMap[posX][posY];
    var newPos = currentMap[nextPosX][nextPosY];
    console.log(currentMap);
    console.log("currentpos ="+ posX +"" + posY);
    console.log("newpos ="+ nextPosX +"" + nextPosY +","+newPos);

    //update the previous position of player after making the move
    function updatePreviousPos() {
        if (currentPos === gameObjects["player on spot"].sign) {
            console.log("Old spot: " + currentPos);
            currentMap[posX][posY] = gameObjects.spot.sign; //player on spot => spot
        }
        else {
            currentMap[posX][posY] = gameObjects.floor.sign; //player on blank space => blank space
        }
        console.log("updated pos: " + currentMap[posX][posY]);
    }

    //next move is a blank space
    if (newPos === gameObjects.floor.sign) {
        //update new position
        currentMap[nextPosX][nextPosY] = gameObjects.player.sign;
        updatePreviousPos();
        moves++;
        updateGameCanvas();
        console.log(currentMap[nextPosX][nextPosY]);
    }

    //next move is a target spot
    else if (newPos === gameObjects.spot.sign) {
        //update new position
        currentMap[nextPosX][nextPosY] = gameObjects["player on spot"].sign;
        updatePreviousPos();
        moves++;
        updateGameCanvas();
    }

    // next move is a box or box-on-spot => push
    else if (newPos === gameObjects.box.sign || newPos === gameObjects["box on spot"].sign) {
        //next move of box/box-on-spot is a goal spot
        if (currentMap[nextPosX + dx][nextPosY + dy] === gameObjects.spot.sign) {
            //update player's next position and box's next position
            currentMap[nextPosX][nextPosY] = gameObjects.player.sign; //box/box-on-spot => player
            currentMap[nextPosX + dx][nextPosY + dy] = gameObjects["box on spot"].sign; //spot => box on spot
            goalCounter++;
            updatePreviousPos();
            moves++;
        }
        //next move of box/box-on-spot is a blank space
        else if (currentMap[nextPosX + dx][nextPosY + dy] === gameObjects.floor.sign) {
            //update player's next position and box's next position
            currentMap[nextPosX][nextPosY] = gameObjects.player.sign; //box/box-on-spot => player
            currentMap[nextPosX + dx][nextPosY + dy] = gameObjects.box.sign; //blank space => box
            updatePreviousPos();
            moves++;
        }
        updateGameCanvas();
    }
    console.log(currentMap);
}

//function to check for game status (up-level or not) after each move and reload game canvas
function updateGameCanvas() {
    myGameCanvas.clear();
    myGameCanvas.displayMap(currentMap);
    var moveDisplay = document.getElementById("moves");
    moveDisplay.innerHTML = "Moves: "+ moves;
    console.log(moves);
    console.log(sokoban.x, sokoban.y);
    var message = document.getElementById("message");
    message.innerHTML = "";

    if (goalCounter === target) {
        var message = document.getElementById("message");
        if(currentLevel < mapsObject.mapLevels.length) {
            message.innerHTML = "Great job! Now up to the next level.";
            //display message you win => move to next level
            currentLevel++;
            moves = 0;
            myGameCanvas.clear();
            myGameCanvas.start(mapsObject,currentLevel);
        }
        else {
            message.innerHTML = "Arg, you've won all of our puzzle. No more games smarty pants!";
        }
    }

}

document.addEventListener('keydown',function(e) {
    if([32, 37, 38, 39, 40].indexOf(e.keyCode) > -1) {
        e.preventDefault();
    }
    move(e.keyCode,sokoban);
});
