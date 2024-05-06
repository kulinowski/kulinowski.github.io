import * as T from "./libs/build/three.module.js";

// Create the block geometry and material. I took a screenshot from the
// original game for the texture
let blockTexture = new T.TextureLoader().load("./images/block.png");
let blockGeometry = new T.BoxGeometry(1, 2, 1);
let blockMaterial = new T.MeshStandardMaterial({color: "white", map: blockTexture});

// Create a class for block
export class Block extends T.Object3D {
    constructor(level) {
        super();

        // Create a group for the block. It acts like a pivot point to rotate
        // the block when each move is animated. The block is added to the
        // group
        let group = new T.Group();
        group.position.set(level.start[0], 0, level.start[1]);
        level.scene.add(group);
        let block = new T.Mesh(blockGeometry, blockMaterial);
        block.position.set(0, 1, 0);
        group.add(block);

        // Start the block at the start position and standing
        this.positions = [level.start];
        this.isStanding = true;
        this.group = group;
        this.block = block;
        
        this.isMoving = false;
        this.isFalling = false;
        this.lastDirection = "";
        this.vy = 0;
    }

    // This function moves the block after a key press. It positions the group
    // and block, then rotates the group with a timer. It returns a boolean for
    // if the animation is complete
    move(direction, timer) {

        // If the block isn't moving, then it must the first frame after a key
        // press, so position the group and block
        if (this.isMoving == false) {
            this.group.rotation.set(0, 0, 0);
            this.block.rotation.set(0, 0, 0);

            // Get the center position and orientation
            let [x, y, z] = this.getCenter();
            let orientation = this.getOrientation();

            // If the block is standing, then the pivot point is in the center
            // of the edge in the direction of the key press. The new positions
            // will be the next two in the direction of the key press
            if (this.isStanding == true) {
                if (direction === "up") {
                    this.group.position.set(x + 0.5, 0, z);
                    this.block.position.set(-0.5, 1, 0);
                    this.positions = [[x + 1, z], [x + 2, z]];
                    this.isStanding = false;
                }
                else if (direction === "left") {
                    this.group.position.set(x, 0, z - 0.5);
                    this.block.position.set(0, 1, 0.5);
                    this.positions = [[x, z - 2], [x, z - 1]];
                    this.isStanding = false;
                }
                else if (direction === "down") {
                    this.group.position.set(x - 0.5, 0, z);
                    this.block.position.set(0.5, 1, 0);
                    this.positions = [[x - 2, z], [x - 1, z]];
                    this.isStanding = false;
                }
                else if (direction === "right") {
                    this.group.position.set(x, 0, z + 0.5);
                    this.block.position.set(0, 1, -0.5);
                    this.positions = [[x, z + 1], [x , z + 2]];
                    this.isStanding = false;
                }
            }

            // If the block isn't standing, then the logic is more complex. I
            // can explain it with the first example for an up key press.
            else {
                if (direction === "up") {

                    // If the block is oriented in the x direction, then the
                    // pivot point is in the center of the short edge, which
                    // is 1 unit away from the center, and the block will be
                    // standing afterwards
                    if (orientation === "x") {
                        this.group.position.set(x + 1, 0, z);
                        this.block.position.set(-1, 0.5, 0);
                        this.block.rotation.z = Math.PI / 2;
                        this.positions = [[x + 1.5, z]];
                        this.isStanding = true;
                    }

                    // If the block is oriented in the z direction, then the
                    // pivot point is in the center of the long edge, which is
                    // 0.5 units away from the center, and the block will not
                    // be standing afterwards
                    else {
                        this.group.position.set(x + 0.5, 0, z);
                        this.block.position.set(-0.5, 0.5, 0);
                        this.block.rotation.x = Math.PI / 2;
                        this.positions = [[x + 1, z - 0.5], [x + 1, z + 0.5]];
                    }
                }
                else if (direction === "left") {
                    if (orientation === "x") {
                        this.group.position.set(x, 0, z - 0.5);
                        this.block.position.set(0, 0.5, 0.5);
                        this.block.rotation.z = Math.PI / 2;
                        this.positions = [[x - 0.5, z - 1], [x + 0.5, z - 1]];
                    }
                    else {
                        this.group.position.set(x, 0, z - 1);
                        this.block.position.set(0, 0.5, 1);
                        this.block.rotation.x = Math.PI / 2;
                        this.positions = [[x, z - 1.5]];
                        this.isStanding = true;
                    }
                }
                else if (direction === "down") {
                    if (orientation === "x") {
                        this.group.position.set(x - 1, 0, z);
                        this.block.position.set(1, 0.5, 0);
                        this.block.rotation.z = Math.PI / 2;
                        this.positions = [[x - 1.5, z]];
                        this.isStanding = true;
                    }
                    else {
                        this.group.position.set(x - 0.5, 0, z);
                        this.block.position.set(0.5, 0.5, 0);
                        this.block.rotation.x = Math.PI / 2;
                        this.positions = [[x - 1, z - 0.5], [x - 1, z + 0.5]];
                    }
                }
                else if (direction === "right") {
                    if (orientation === "x") {
                        this.group.position.set(x, 0, z + 0.5);
                        this.block.position.set(0, 0.5, -0.5);
                        this.block.rotation.z = Math.PI / 2;
                        this.positions = [[x - 0.5, z + 1], [x + 0.5, z + 1]];
                    }
                    else {
                        this.group.position.set(x, 0, z + 1);
                        this.block.position.set(0, 0.5, -1);
                        this.block.rotation.x = Math.PI / 2;
                        this.positions = [[x, z + 1.5]];
                        this.isStanding = true;
                    }
                }
            }

            this.isMoving = true;
        }

        // The full rotation takes 0.2 seconds, so calculate a fraction of the
        // animation that has happened 
        let fraction = timer / 200;
        if (fraction > 1) {

            // If the animation is complete, then set the last direction in
            // case the block falls off an edge
            fraction = 1;
            this.isMoving = false;
            this.lastDirection = direction;
        }
        
        // Rotate the block around the pivot point
        if (direction === "up") this.group.rotation.z = -1 * fraction * Math.PI / 2;
        else if (direction === "left") this.group.rotation.x = -1 * fraction * Math.PI / 2;
        else if (direction === "down") this.group.rotation.z = fraction * Math.PI / 2;
        else if (direction === "right") this.group.rotation.x = fraction * Math.PI / 2;
     
        return this.isMoving;
    }

    // This function returns the center of the block
    getCenter() {
        if (this.isStanding == true) {
            return [this.positions[0][0], 1, this.positions[0][1]];
        }
        
        let x = (this.positions[0][0] + this.positions[1][0]) / 2;
        let z = (this.positions[0][1] + this.positions[1][1]) / 2;
        return [x, 0.5, z];
    }

    // This function returns the orientation of the block. The char returned is
    // the axis on which the block lies
    getOrientation() {
        if (this.isStanding == true) return "y";
        if (this.positions[0][0] == this.positions[1][0]) return "z";
        return "x";
    }

    // This function makes the block fall if it can't be supported by the tiles
    // or if the level is complete. It 
    fall(delta) {

        // If the block isn't falling, then it must the first frame after a move
        // finished, so position the group in the center of the block
        if (this.isFalling == false) {
            let [x, y, z] = this.getCenter();
            let dx = x - this.group.position.x;
            let dy = y - this.group.position.y;
            let dz = z - this.group.position.z;

            this.group.position.x += dx;
            this.group.position.y += dy;
            this.group.position.z += dz;
            this.block.position.set(0, 0, 0);

            this.isFalling = true;
        }

        // Rotate at a constant rate that matches the move animation
        let rotation = delta * Math.PI / 400;
        if (this.lastDirection === "up") this.group.rotation.z -= rotation;
        else if (this.lastDirection === "left") this.group.rotation.x -= rotation;
        else if (this.lastDirection === "down") this.group.rotation.z += rotation;
        else if (this.lastDirection === "right") this.group.rotation.x += rotation;

        // Make the block fall. I used a constant acceleration to make the fall
        // look like gravity. If the position is low enough, then finish the
        // animation
        this.vy -= 0.0001 * delta;
        this.group.position.y += this.vy * delta;
        if (this.group.position.y < -20) return true;
        return false;
    }

    // This function resets the block for a level. It moves it to the start
    // position, then resets the position and game state
    reset(level) {
        this.group.position.set(level.start[0], 0, level.start[1]);
        this.group.rotation.set(0, 0, 0);
        this.block.position.set(0, 1, 0);
        this.block.rotation.set(0, 0, 0);

        this.positions = [level.start];
        this.isStanding = true;
        
        this.isMoving = false;
        this.isFalling = false;
        this.lastDirection = "";
        this.vy = 0;
    }
}