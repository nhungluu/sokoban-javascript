# sokoban-javascript
Sokoban, a Japanese puzzle game created with Javascript. 
This project in development.
<p>
<h2>Introduction</h2> <br/>
Sokoban (Literally, ``Warehouse keeper'' in Japanese) is a single-player puzzle game originally devised by Hiroyuki Imabayashi and published by Thinking Rabbit in 1982. 
</p>
<p>
<h2>Rules </h2> <br/>
Like most good puzzles the rules of Sokoban are simple and elegant. Play takes place on a fixed-size board that represents a overhead view of a warehouse floor. The warehouse contains walls, open spaces, boxes, and a man (controlled by the player). Some of the open spaces are marked specially to indicate that they are "goal" spaces. The object is to move the boxes so that they are all on goal spaces. To do this, the player moves the man up, down, left, or right. The man may push a box (if he moves into it), but it will move only one square, and cannot be pushed if is there is anything behind it (even another box). It is not possible to pull boxes.<br/>
In this game, the movement is controlled by arrow keys. I changed the graphic into bottles and target spots. Basically, player needs to move the character to push all the bottles into the right spot. This is inspired by a Saturday morning stroll along Liffey River with loads of broken glasses and bottles I guess....<br/>
After pushing all the bottles into the right spots, you move up to the next level.
</p>
<p>
<h2>Structure </h2> <br/>
The game is built on javascript and displayed on html5 canvas.
The map of all levels are stored in json.
</p>
