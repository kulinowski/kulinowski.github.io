import * as T from "./libs/build/three.module.js";
import { Level } from "./Level.js";
import { Block } from "./Block.js";

// Define each level with a comma delimited string. The first piece is at
// z = 0, the second piece is at z = 1, and so on. Within a piece, the first
// char is at x = 0, the second char is at x = 1, and so on. The char itself
// determines what exists at that position. 
//  "o" - No tile
//  "x" - Tile
//  "s" - Start position with tile
//  "e" - End position
let levelIndex = 0;
let levels = [
    "oooxxx,ooxxsx,ooxxxx,ooxxx,ooxxx,oxxxx,xxxx,xexx,xxxx,oxxo",
    "oxxxx,oxsxx,oxxxx,oxxxx,ooox,ooox,oooxxx,oooxxx,oooxxx,ooooox,ooooox,oxxxxx,xxxxxx,xxex,xxxx",
    "ooxxxxx,ooxsxxx,ooxxxxx,ooooooxxx,oooooooxx,xxxxoooxx,xexxoooxx,xxxxoooxx,ooxxoooxx,ooxxooxxx,xxxxxxx,xxxxxxx,xxxx,xxxx",
    "xxx,xexooxxxx,xxxooxxxx,xxooxxxxx,oxooxxxxx,oxooxooox,oxooxooox,oxooxooox,oxooxooox,oxooxooox,oxxxxooox,oxxxxoooxx,oxxxxooxxx,ooxxoooxsx,ooxxoooxxx",
    "oooooos,oooooox,oooooox,oooooox,ooooxxx,ooooxxxxxx,oxxxxxooox,xxxoooooox,xxxooooxxx,xxxxoooxxx,oxxxoooxxx,oooooxxx,ooooxxxx,ooooxex,ooooxxx",
    "ooxxxx,oxxxsx,xxxxxx,xxoox,xooox,xooox,xooox,xxxxx,ooxxxxxx,ooxxooxx,ooooooxx,oooooxxx,ooxxxx,ooxxex,ooxxxx",
    "oooos,ooooxxxxxx,ooooxooxex,ooooxooxxx,ooooxoooxx,oxxxxxx,oxxoxxx,oxxooox,xxxooox,xxooxxx,xxooxxx,oxxxx"
];

// Add the renderer to the window
let renderer = new T.WebGLRenderer();
renderer.setSize(500, 500);
document.getElementById("div1").appendChild(renderer.domElement);

// Create a scene, camera, and lights. The camera position is set later when a
// level is constructed
let scene = new T.Scene();
let camera = new T.PerspectiveCamera();
scene.add(new T.AmbientLight("white", 0.2));
let point = new T.PointLight("white", 1, 0, 0);
point.position.set(-20, 10, 15);
scene.add(point);

let isMoving = false;
let isFailed = false;
let isComplete = false;
let timer = 0;

let moveCount = 0;
document.getElementById("moves").innerHTML = moveCount;

// Add an event handler for key presses. If the block is moving or falling,
// then ignore key presses until the animation finishes 
let direction = "";
document.onkeydown = function(e) {
    if (isMoving == true || isFailed == true || isComplete == true) return;
    
    // Set the direction based on the key code
    if (e.code === "KeyW" || e.code === "ArrowUp") direction = "up";
    else if (e.code === "KeyA" || e.code === "ArrowLeft") direction = "left";
    else if (e.code === "KeyS" || e.code === "ArrowDown") direction = "down";
    else if (e.code === "KeyD" || e.code === "ArrowRight") direction = "right";
    else return;

    // If the direction is set, then update the game state, reset the animation
    // timer, and keep track of the move count
    isMoving = true;
    timer = 0;
    moveCount ++;
    document.getElementById("moves").innerHTML = moveCount;
}

// Create the first level and block. I factored the code into a function so it
// can be reused in the game loop and button click events
let level = undefined;
let block = undefined;
function changeLevel(levelIndex) {
    level = new Level(levels[levelIndex], scene, camera);
    block = new Block(level);

    // Keep track of the level
    document.getElementById("level").innerHTML = levelIndex + 1;
}
changeLevel(0);

// Add a button to jump to each level.
function addButton(levelIndex) {
    let button = document.createElement("button");
    button.innerHTML = "Level " + (levelIndex + 1);
    button.onclick = function() {
        changeLevel(levelIndex);
    }
    document.getElementById("div2").appendChild(button);
}
for (let i = 0; i < levels.length; i ++) {
    addButton(i);
}

// This is the callback function
let lasttime = undefined;
function animate(timestamp) {

    // Calculate the total elapsed time and change
    if (lasttime == undefined) lasttime = timestamp;
    let delta = timestamp - lasttime;
    timer += delta;

    // If the block is in motion, then continue the animation. The move
    // function will return false if the animation is complete
    if (isMoving == true) {
        isMoving = block.move(direction, timer);
    }

    // If the block isn't in motion, then check if it can be supported by the
    // tiles or if the level is complete
    if (isMoving == false) {
        if (level.canSupport(block) == false) {
            isFailed = true;
            timer = 0;
        }
        if (level.isComplete(block)) {
            isComplete = true;

            // Clear the last direction because the block shouldn't rotate when
            // it falls
            block.lastDirection = "";
            timer = 0;
        }
    }

    // If the block can't be supported or if the level is complete, then the
    // block will fall off the screen. The fall function returns whether the
    // level should be reset
    if (isFailed == true || isComplete == true) {
        let isReset = block.fall(delta);
        if (isReset == true && isFailed == true) {
            isFailed = false;
            block.reset(level);
        }
        else if (isReset == true && isComplete == true) {
            isComplete = false;

            // The next level should be selected for the reset
            levelIndex ++;
            if (levelIndex >= levels.length) levelIndex = 0;
            changeLevel(levelIndex);
        }
    }

    renderer.render(scene, camera);

    lasttime = timestamp;
    window.requestAnimationFrame(animate);
}

// Start the game loop
window.requestAnimationFrame(animate);