import gameAssets from '/static/loader.mjs'

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
            case 0:
                i = gameAssets.getImage('player');
                break;
            case 1:
                i = gameAssets.getImage('player2');
                break;
            case 2:
                i = gameAssets.getImage('player3');
                break;
            case 3:
                i = gameAssets.getImage('player4');
                break;
        }
        image(i, this.x, this.y);
    }
}
export default Player;
