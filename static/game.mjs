/**
 * game.mjs
 * "es6 is pretty cool"
 * 
 * no exports
 * @requires p5.min.js 
 *     impl note: p5 doesn't have modules compat. place this after or don't defer p5.min.js loading
 * 
 */

import renderer from '/static/renderer.mjs';
import {worstTickTime as wdWorstTickTime, confTimeout as wdConfTimeout} from '/static/watchdog.mjs';

console.log(renderer);
let rendererCam;

window.setup = function () {
    document.getElementById('wipeme').innerHTML = '';
    canvas = createCanvas(windowWidth, windowHeight);
    rendererCam = new renderer.Camera(0, 0, 1);
    renderer.setup();
}
window.windowResized = function () {
  resizeCanvas(windowWidth, windowHeight);
}

function drawTestPattern() {
    fill(128, 128, 128);
    stroke(128, 128, 128);
    strokeWeight(4);
    renderer.drawer.line(rendererCam, -2048, 0, 2048, 0);
    renderer.drawer.line(rendererCam, 0, -2048, 0, 2048);
    noStroke();
    for (let i = -2048; i < 2048; i += 32) {
        for (let j = -2048; j < 2048; j += 32) {
            fill(0, 255, 0, 128)
            renderer.drawer.rect(rendererCam, i, j, 16, 16);
        }
    }
}

let f = 0;

window.draw = function () {
    f++;
    rendererCam.xPos = 200;
    rendererCam.yPos = 200;
    rendererCam.zoom = mouseX;
    textAlign(CENTER, CENTER);
    textFont('monospace');
    // 
    rendererCam.setupRenderState();
    background(0);
    drawTestPattern();
    fill(255, 255, 255);
    
    rendererCam.finish();

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
    text(wdWorstTickTime + "/" + wdConfTimeout + "mspt (worst)", windowWidth-textWidth(dimStr)-20, windowHeight - 18);
    fill(255, 255, 255, (1-frameRate()/60)*128+128);
    let calcFPSPct = (frameRate()/60*100).toFixed(1)
    let zeroes = "0".repeat(5-calcFPSPct.toString().length)
    text(frameRate().toFixed(2) + "fps " + zeroes + calcFPSPct + "%", windowWidth , windowHeight - 50);
}
