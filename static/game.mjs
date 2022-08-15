/**
 * game.mjs
 * "es6 is pretty cool"
 * 
 * no exports
 * @requires p5.min.js 
 *     impl note: p5 doesn't have modules compat. place this after or don't defer p5.min.js loading
 * 
 */

import renderer from '/wip/static/renderer.mjs';
import hypervisor from '/wip/static/hypervisor.mjs';
import {lerp as lerp} from '/wip/static/utils.mjs';
import {gridRenderer as gridRenderer, Tile as Tile, World as World} from '/wip/static/tiles.mjs';
import Player from '/wip/static/player.mjs';
import {
    loadingAssetsScreen as assetsScreen, loadImageAsset as imageLoader,
    loadJSONAsset as jsonLoader, done as doneLoading,
    default as gameAssets
} from '/wip/static/loader.mjs';
import Monke from '/wip/static/Monke.mjs';

console.log(renderer);
// let rendererCam;
let gameWorld = new World();

window.setup = function () {
    // add some tiles or something
    document.getElementById('wipeme').innerHTML = '';
    window.canvas = createCanvas(windowWidth, windowHeight);
    window.rendererCam = new renderer.Camera(0, 0, 1);
    renderer.setup();
    rendererCam.settings.push(renderer.Camera.CENTER_ORIGIN);
    hypervisor.apply();
    let load = function(j) {
        let k = 0
        for (let i of j) {
            imageLoader(i.name, i.path);
            k++;
        }
    }
    jsonLoader("testing_resources", "/wip/static/testing_resources.json", Monke.mix(load, () => {
        gameWorld.putTile(new Tile(0, 0, gameAssets.getImage('grass')));
        gameWorld.putTile(new Tile(64, 0, gameAssets.getImage('grass')));
        gameWorld.putTile(new Tile(-64, 0, gameAssets.getImage('grass')));
        gameWorld.putTile(new Tile(0, 64, gameAssets.getImage('grass')));
        gameWorld.putTile(new Tile(0, -64, gameAssets.getImage('grass')));
    }));
}
window.windowResized = function () {
    resizeCanvas(windowWidth, windowHeight);
}

let f = 0;
let me = new Player(0, 0);
window.camTarget = {
    x: 0,
    y: 0
}

window.draw = function () {
    f++;
    if (!doneLoading()) {
        assetsScreen();
        return;
    }
    rendererCam.xPos = lerp(rendererCam.xPos, camTarget.x, 10);
    rendererCam.yPos = lerp(rendererCam.yPos, camTarget.y, 10);
    textAlign(CENTER, CENTER);
    textFont('monospace');
    // 
    rendererCam.setupRenderState();
    background(128);
    fill(255, 255, 255);
    stroke(255, 255, 255);
    strokeWeight(10)
    rect(-1010, -10, 20, 20);
    line(-500, 0, 500, 0);
    line(0, -500, 0, 500);

    gameWorld.draw(rendererCam);

    me.draw()
    gridRenderer(rendererCam, color(0, 0, 0, 128), 64);
    rendererCam.finish();


    stroke(255, 255, 255, 128);
    strokeWeight(3);
    line(0, windowHeight/2, windowWidth, windowHeight/2);
    line(windowWidth/2, 0, windowWidth/2, windowHeight);

    fill(0, 128, 0, 128);
    noStroke();
    rect(0, windowHeight-70, windowWidth, 150);
    fill(255);
    textSize(32);
    textAlign(LEFT, CENTER);
    text("Debug info", 5, windowHeight-50);
    fill(0, 0, 0, 128);
    text(focused?"Focused":"Unfocused", 5, windowHeight-18);
    textAlign(RIGHT, CENTER);
    textSize(32);
    let dimStr = windowWidth + "x" + windowHeight
    text(dimStr, windowWidth, windowHeight - 18);
    fill(255, 255, 255, (1-frameRate()/60)*128+128);
    let calcFPSPct = (frameRate()/60*100).toFixed(1)
    let zeroes = "0".repeat(5-calcFPSPct.toString().length)
    text(frameRate().toFixed(2) + "fps " + zeroes + calcFPSPct + "%", windowWidth , windowHeight - 50);
    
    textAlign(CENTER, CENTER)
    text(f, windowWidth/2, windowHeight-18);
}
