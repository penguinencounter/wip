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

console.log(renderer);
// let rendererCam;

window.setup = function () {
    document.getElementById('wipeme').innerHTML = '';
    canvas = createCanvas(windowWidth, windowHeight);
    window.rendererCam = new renderer.Camera(0, 0, 1);
    renderer.setup();
    rendererCam.settings.push(renderer.Camera.CENTER_ORIGIN);
    hypervisor.apply();
}
window.windowResized = function () {
  resizeCanvas(windowWidth, windowHeight);
}

let f = 0;
let motion = 0;

window.draw = function () {
    f++;
    if (pmouseX === mouseX && pmouseY === mouseY) motion = 0;
    else motion++;
    rendererCam.xPos = lerp(rendererCam.xPos, mouseX-windowWidth/2, 10);
    rendererCam.yPos = lerp(rendererCam.yPos, mouseY-windowHeight/2, 10);
    rendererCam.zoom = lerp(rendererCam.zoom, motion/100+1, 10);
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
    fill(255, 255, 255, (1-frameRate()/60)*128+128);
    let calcFPSPct = (frameRate()/60*100).toFixed(1)
    let zeroes = "0".repeat(5-calcFPSPct.toString().length)
    text(frameRate().toFixed(2) + "fps " + zeroes + calcFPSPct + "%", windowWidth , windowHeight - 50);

    textAlign(CENTER, CENTER)
    text(f, windowWidth/2, windowHeight-18);
}
