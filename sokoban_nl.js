(function(){

    "use strict";

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
        $.getJSON("maps.json", function(data) {
            mapsObject = data;
            console.log(data);
            myGameCanvas = new Game(mapsObject);
            myGameCanvas.start(0);
        });
    }

    //function to load game canvas of current level from map stored in json
    function Game(maps){

        this.maps = maps;
        this.currentLevel = 0;

        this.canvas = document.createElement("canvas"),
        this.context = this.canvas.getContext("2d");        

        //load map at the current level from existing map library stored in json
        this.start = function(level) {
            this.currentLevel = level;
            currentMap = this.maps.mapLevels[level].map;
            this.canvas.height = currentMap.length*CELL_SIZE;
            this.canvas.width = currentMap[0].length*CELL_SIZE;
            var gameCanvas = document.getElementById("sokoban_holder");
            gameCanvas.appendChild(this.canvas);
            setTimeout(()=>{
                this.displayMap(currentMap);
            })
            //document.body.insertBefore(this.canvas, document.body.childNodes[0]);
        };

        this.clear = function() {
            this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
        };
        
        this.displayMap = function(map) {
            console.log('displaying',map);
            goalCounter = 0;
            target = 0;
            //Important: for matrix, the coordination is reverse order to the canvas i.e.
            //matrix: y (vertical - column) => x (horizontal - row)
            //canvas: x (horizontal) => y (vertical)
            for(var i=0; i<map.length; i++){
                for(var j=0; j<map[0].length; j++) {
                    const cur = map[i][j];
                    if (cur=== gameObjects.player.sign) {
                        sokoban = new component(gameObjects.player.source,j*CELL_SIZE,i*CELL_SIZE);
                        console.log(sokoban.x);
                        console.log(sokoban.y);
                    }
                    else if (cur=== gameObjects.grass.sign) {
                        var grass = new component(gameObjects.grass.source,j*CELL_SIZE,i*CELL_SIZE);
                    }
                    else if (cur=== gameObjects.block.sign) {
                        var block = new component(gameObjects.block.source,j*CELL_SIZE,i*CELL_SIZE);
                    }
                    else if (cur === gameObjects.box.sign || cur === gameObjects["box on spot"].sign) {
                        if(cur === gameObjects.box.sign) {
                            var box = new component(gameObjects.box.source,j*CELL_SIZE,i*CELL_SIZE);
                        }
                        else {
                            box = new component(gameObjects["box on spot"].source,j*CELL_SIZE,i*CELL_SIZE);
                            goalCounter++;
                            target++;
                        }

                    }
                    else if (cur === gameObjects.spot.sign || cur === gameObjects["player on spot"].sign) {
                        if(cur === gameObjects.spot.sign) {
                            var spot = new component(gameObjects.spot.source, j*CELL_SIZE,i*CELL_SIZE);
                        }
                        else {
                            var playerOnSpot = new component(gameObjects.player.source, j*CELL_SIZE,i*CELL_SIZE);
                            sokoban.x = j*CELL_SIZE;
                            sokoban.y = i*CELL_SIZE;
                        }
                        target++;

                    }
                    else if(cur=== gameObjects.floor.sign) {
                        var floor = new component(gameObjects.floor.source,j*CELL_SIZE,i*CELL_SIZE);
                    }

                }
            }
        }
    };

    //function to create game object on canvas
    function component(img, x, y) {
        this.x = x;
        this.y = y;
        this.img = new Image();
        this.img.src = img;
        this.img.onload = function(){
            var ctx = myGameCanvas.context;
            ctx.drawImage(this.img, this.x, this.y, CELL_SIZE, CELL_SIZE);
        }.bind(this);
        //console.log(this.img);

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

        //next position is a blank space
        if (newPos === gameObjects.floor.sign) {
            //update new position
            currentMap[nextPosX][nextPosY] = gameObjects.player.sign;
            updatePreviousPos();
            moves++;
            updateGameCanvas();
            console.log(currentMap[nextPosX][nextPosY]);
        }

        //next position is a target spot
        else if (newPos === gameObjects.spot.sign) {
            //update new position
            currentMap[nextPosX][nextPosY] = gameObjects["player on spot"].sign;
            updatePreviousPos();
            moves++;
            updateGameCanvas();
        }

        //next position is a box
        else if (newPos === gameObjects.box.sign) {
            //next move of box is a goal spot
            if (currentMap[nextPosX + dx][nextPosY + dy] === gameObjects.spot.sign) {
                currentMap[nextPosX][nextPosY] = gameObjects.player.sign; //update box => player
                currentMap[nextPosX + dx][nextPosY + dy] = gameObjects["box on spot"].sign; //spot => box on spot
                updatePreviousPos();
                moves++;
            }
            //next move of box is a blank space
            else if (currentMap[nextPosX + dx][nextPosY + dy] === gameObjects.floor.sign) {
                currentMap[nextPosX][nextPosY] = gameObjects.player.sign; //update box => player
                currentMap[nextPosX + dx][nextPosY + dy] = gameObjects.box.sign; //blank space => box
                updatePreviousPos();
                moves++;
            }
            updateGameCanvas();
        }

        //next position is a box-on-spot
        else if (newPos === gameObjects["box on spot"].sign) {
            //next move of box-on-spot is a goal spot
            if (currentMap[nextPosX + dx][nextPosY + dy] === gameObjects.spot.sign) {
                currentMap[nextPosX][nextPosY] = gameObjects["player on spot"].sign; //box-on-spot => player-on-spot
                currentMap[nextPosX + dx][nextPosY + dy] = gameObjects["box on spot"].sign; //spot => box on spot
                updatePreviousPos();
                moves++;
            }
            //next move of box is a blank space
            else if (currentMap[nextPosX + dx][nextPosY + dy] === gameObjects.floor.sign) {
                currentMap[nextPosX][nextPosY] = gameObjects["player on spot"].sign; //box-on-spot => player-on-spot
                currentMap[nextPosX + dx][nextPosY + dy] = gameObjects.box.sign; //blank space => box
                updatePreviousPos();
                moves++;
            }
            updateGameCanvas();
        }
    }

    //function to check for game status (up-level or not) after each move and reload game canvas
    function updateGameCanvas() {
        // myGameCanvas.clear();
        myGameCanvas.displayMap(currentMap);
        var moveDisplay = document.getElementById("moves");
        moveDisplay.innerHTML = "Moves: "+ moves;
        console.log(moves);
        console.log(sokoban.x, sokoban.y);
        var message = document.getElementById("message");
        message.innerHTML = "";

        if (goalCounter === target) {
            var message = document.getElementById("message");
            if(currentLevel < (mapsObject.mapLevels.length-1)) {
                message.innerHTML = "Great job! Now up to the next level.";
                //display message you win => move to next level
                currentLevel++;
                moves = 0;
                myGameCanvas.clear();
                myGameCanvas.start(currentLevel);
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

    startGame();

})();
