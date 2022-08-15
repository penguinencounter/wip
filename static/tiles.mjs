export function gridRenderer(cam, color, size) {
    let isize = size??64;
    stroke(color)
    strokeWeight(1);
    // start at 0, 0 world and draw a grid; however only render the visible part of the grid
    // the world extends in both the positive and negative directions
    let cx = -cam.xPos;
    let cy = -cam.yPos;
    let cw = windowWidth/cam.zoom;
    let ch = windowHeight/cam.zoom;

    let ex = cx - cw/2;
    let ey = cy - ch/2;

    let x0 = Math.floor(ex/isize);
    let y0 = Math.floor(ey/isize);
    let x1 = Math.ceil((ex+cw)/isize);
    let y1 = Math.ceil((ey+ch)/isize);
    for (let x = x0; x <= x1; x++) {
        line(x*isize, cy+ch, x*isize, cy-ch);
    }
    for (let y = y0; y <= y1; y++) {
        line(cx+cw, y*isize, cx-cw, y*isize);
    }
}


export class Tile {
    // each Tile has a position in the world
    // each Tile has a texture

    constructor(x, y, texture) {
        this.x = x;
        this.y = y;
        this.texture = texture;
    }
    draw() {
        // TODO: draw the tile
        image(this.texture, this.x, this.y);
    }
}


export class World {
    // The world is a 2D array of tiles
    // Each tile is Tile

    constructor() {
        this.tiles = [];
        this.width = 0;
        this.height = 0;
        this.minX = 0;
        this.minY = 0;
        this.maxX = 0;
        this.maxY = 0;
        
        this.lastCamera = {
            xPos: 0,
            yPos: 0,
            zoom: 1
        }

        this.currentOnScreen = [];
    }

    // Compute world bounds
    // X/Y can be negative, so we need to find the max and min
    fullRecompute() {
        let maxX = 0;
        let maxY = 0;
        let minX = 0;
        let minY = 0;
        for (let tile of this.tiles) {
            if (tile.x > maxX) maxX = tile.x;
            if (tile.y > maxY) maxY = tile.y;
            if (tile.x < minX) minX = tile.x;
            if (tile.y < minY) minY = tile.y;
        }
        this.width = maxX - minX;
        this.height = maxY - minY;
        this.minX = minX;
        this.minY = minY;
        this.maxX = maxX;
        this.maxY = maxY;
    }

    // Put a tile
    putTile(tile) {
        this.tiles.push(tile);
        
        if (tile.x > this.maxX) this.maxX = tile.x;
        if (tile.y > this.maxY) this.maxY = tile.y;
        if (tile.x < this.minX) this.minX = tile.x;
        if (tile.y < this.minY) this.minY = tile.y;

        this.width = this.maxX - this.minX;
        this.height = this.maxY - this.minY;
    }

    computeVisible(camera) {
        // compute the visible tiles
        this.currentOnScreen = [];
        for (let item of this.tiles) {
            if (camera.isVisible(item.x, item.y, 64, 64, windowWidth, windowHeight)) this.currentOnScreen.push(item);
        }
        this.lastCamera.xPos = camera.xPos;
        this.lastCamera.yPos = camera.yPos;
        this.lastCamera.zoom = camera.zoom;
    }

    draw(camera) {
        // check if the camera has changed
        if (this.lastCamera.xPos !== camera.xPos || this.lastCamera.yPos !== camera.yPos || this.lastCamera.zoom !== camera.zoom) {
            this.computeVisible(camera);
        }
        // draw the visible tiles
        for (let item of this.currentOnScreen) {
            item.draw();
        }
    }
}
