import gameAssets from '/wip/static/loader.mjs'

class Player {
    constructor(spawnX, spawnY) {
        this.x = spawnX;
        this.y = spawnY;
        
    }
    draw() {
        fill(0, 0, 255);
        noStroke();
        let i;
        switch(Math.floor(frameCount / 30) % 4) {
            default:
                i = gameAssets.getImage('testplayer')
                break;
        }
        image(i, this.x, this.y);
    }
}
export default Player;
