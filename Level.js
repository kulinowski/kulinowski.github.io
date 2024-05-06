import * as T from "./libs/build/three.module.js";

// Create the tile geometry and material. I created the texture myself with a
// drawing program
let tileTexture = new T.TextureLoader().load("./images/tile.png");
let tileGeometry = new T.BoxGeometry(1, 0.2, 1);
let tileMaterial = new T.MeshStandardMaterial({color: "white", map: tileTexture});

// Create a class for the level
export class Level extends T.Object3D {
    constructor(levelString, scene, camera) {
        super();

        // There should only be one level at a time, so traverse the scene and
        // remove all mesh and group objects
        let objectsToRemove = [];
        scene.traverse(function(object) {
            if (object.isMesh || object.isGroup) {
                objectsToRemove.push(object)
            }
        });
        for (let i = 0; i < objectsToRemove.length; i ++) {
            objectsToRemove[i].removeFromParent();
        }
    
        this.levelString = levelString;
        this.positions = [];
        this.start = [];
        this.end = [];
        this.scene = scene;

        // Load the level from the level string, then position the camera based
        // on the tile positions
        this.load(scene);
        this.positionCamera(camera);
    }

    // This function reads the level string and determines the tile, start, and
    // end positions. The structure is explained at the top of the main file
    load(scene) {

        // Split the string into comma delimited pieces, so each piece
        // corresponds to a position on the z axis
        let split = this.levelString.split(",");
        for (let z = 0; z < split.length; z ++) {

            // Loop over chars, which correspond to positions on the x axis
            for (let x = 0; x < split[z].length; x ++) {
                let char = split[z].charAt(x);
                let tile = new T.Mesh(tileGeometry, tileMaterial);
                switch (char) {
                    case "x": 
                        this.positions.push([x, z]);
                        tile.position.set(x, -0.05, z);
                        scene.add(tile);
                        break;
                    case "s":
                        this.positions.push([x, z]);
                        tile.position.set(x, -0.05, z);
                        scene.add(tile);
                        this.start = [x, z];
                        break;
                    case "e":
                        this.positions.push([x, z]);
                        this.end = [x, z];
                        break;
                    default:
                        break;
                }
            }
        }
    }
    
    // This function returns if the block can be supported by the tile
    // positions. It counts the number of block positions that overlap the
    // tile positions
    canSupport(block) {
        let count = 0;
        for (let i = 0; i < this.positions.length; i ++) {
            for (let j = 0; j < block.positions.length; j ++){
                if (this.positions[i][0] == block.positions[j][0] &&
                    this.positions[i][1] == block.positions[j][1]) {
                    count ++;
                }
            }
        }

        // The block is supported if two positions overlap, or if one position
        // overlaps and the block is standing
        if (count == 2 || (count == 1 && block.isStanding == true)) return true;
        return false;
    }

    // This function returns if the level is complete. It checks if the block
    // is standing at the end position
    isComplete(block) {
        if (this.end[0] == block.positions[0][0] &&
            this.end[1] == block.positions[0][1] &&
            block.isStanding == true) {
                return true;
        }
        return false;
    }

    // This function positions the camera to view the center of the level. It
    // calculates the maximum x and z, then points the camera at half of that
    // maximum position
    positionCamera(camera) {
        let maxx = 0;
        let maxz = 0;
        for (let i = 0; i < this.positions.length; i ++) {
            maxx = Math.max(maxx, this.positions[i][0]);
            maxz = Math.max(maxz, this.positions[i][1]);
        }

        let x = maxx / 2;
        let z = maxz / 2;

        camera.position.set(x - 15, 10, z - 5);
        camera.lookAt(x, 0, z);
    }
}