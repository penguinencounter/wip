/**
 * watchdog.mjs
 * Stop the game from crashing people's computers.
 */

export let lastTick = null;
let disabledTicks = 0;
export let worstTickTime = 0;
export let confTimeout = 500;
window.watchdog_reset = function() {
    lastTick = null;
    disabledTicks = 1;
    worstTickTime = 0;
    loop();
}
export default function watchdog() {
    let computedLastTick = lastTick??Date.now();
    let currentTick = Date.now();
    if (!focused) {
        if (disabledTicks === 0) {
            console.warn('watchdog disabled: unfocused');
        }
        disabledTicks = 2;
        lastTick = currentTick;
        return;
    }
    if (disabledTicks > 0) {
        console.warn('watchdog disabled for ' + disabledTicks + ' ticks');
        disabledTicks--;
        lastTick = currentTick;
        return;
    }
    let delta = currentTick - computedLastTick;
    if (delta > worstTickTime) {
        worstTickTime = delta;
    }
    if (delta > confTimeout) {
        background(0);
        textAlign(CENTER, CENTER);
        textFont('monospace');
        textSize(32);
        fill(255, 0, 0);
        text("Game rendering stopped (performance)", windowWidth/2, windowHeight/2);
        fill(128, 128, 128);
        textSize(16);
        text("last tick took " + delta + "ms", windowWidth/2, windowHeight/2+40);
        text("current timeout is " + confTimeout + "ms", windowWidth/2, windowHeight/2+58);
        fill(64, 64, 64);
        text("wanna try to boot it back up?", windowWidth/2, windowHeight/2+76);
        text("type watchdog_reset(); in your browser's console", windowWidth/2, windowHeight/2+94);
        noLoop(); // halt the game's rendering
    }
    lastTick = currentTick;
}