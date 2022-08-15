/**
 * game.mjs
 * "es6 is pretty cool"
 * 
 * no exports
 * @a p5.js
 *     impl note: p5 doesn't have modules compat. place this after or don't defer p5.min.js loading
 * 
 */

import renderer from '/static/renderer.mjs';
import hypervisor from '/static/hypervisor.mjs';
import {lerp as lerp} from '/static/utils.mjs';
import {gridRenderer as gridRenderer, Tile as Tile, World as World} from '/static/tiles.mjs';
import Player from '/static/player.mjs';
import {
    loadingAssetsScreen as assetsScreen, loadImageAsset as imageLoader,
    loadJSONAsset as jsonLoader, done as doneLoading,
    default as gameAssets
} from '/static/loader.mjs';
import Monke from '/static/Monke.mjs';

console.log(renderer);
// let rendererCam;
let gameWorld = new World();

let MIN_ZOOM = .25;
let MAX_ZOOM = 4;

window.setup = function () {
    // add some tiles or something
    document.getElementById('wipeme').innerHTML = '';
    window.canvas = createCanvas(windowWidth, windowHeight);
    window.rendererCam = new renderer.Camera(0, 0, 1);
    renderer.setup();
    rendererCam.settings.push(renderer.Camera.CENTER_ORIGIN);

    // recompute camera position
    gameWorld.computeVisible(rendererCam);
    hypervisor.registerEventHandler('scroll', e => {
        let dir = e.deltaY > 0 ? 1.2 : .8;
        camTarget.zoom *= dir;
        camTarget.zoom = Math.min(Math.max(camTarget.zoom, MIN_ZOOM), MAX_ZOOM);
    })
    hypervisor.apply();
    let load = j => {
        let k = 0
        for (let i of j) {
            imageLoader(i.name, i.path);
            k++;
        }
    }
    jsonLoader("testing_resources", "/static/testing_resources.json", Monke.mix(load, () => {
        for (let xPos = -(64*16); xPos < 64*16; xPos += 64) {
            for (let yPos = -(64*16); yPos < 64*16; yPos += 64) {
                gameWorld.putTile(new Tile(xPos, yPos, gameAssets.getImage('grass')));
            }
        }
        // drop cache
        console.info('Forcing visibility computation');
        gameWorld.computeVisible(rendererCam);
    }));
}
window.windowResized = function () {
    resizeCanvas(windowWidth, windowHeight);
}

let f = 0;
let me = new Player(0, 0);
window.camTarget = {
    x: 0,
    y: 0,
    zoom: 1
}

window.draw = function () {
    f++;
    if (!doneLoading()) {
        assetsScreen();
        return;
    }
    rendererCam.xPos = lerp(rendererCam.xPos, camTarget.x, 10);
    rendererCam.yPos = lerp(rendererCam.yPos, camTarget.y, 10);
    rendererCam.zoom = lerp(rendererCam.zoom, camTarget.zoom, 5);
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
