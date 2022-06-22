// hypervisor: aka tick-on-command
// basically a wrapper around draw to allow single stepping and other crazy wack stuff
let wasMousePressed = false;
let overlayState = false;
let cachedImage = null;

export function hypervisorOverlay(expanded, renderCachedImage) {
    if (renderCachedImage) {
        if (cachedImage.width !== windowWidth || cachedImage.height !== windowHeight) {
            if (hypervisor.behaviors.reloadOnInvalidCache) {
                step();
            } else {
                background(0);
                fill(255, 0, 0);
                textSize(32);
                textAlign(CENTER, CENTER);
                text("Cached image is no longer valid", windowWidth/2, windowHeight/2);
                text("(Step or unfreeze to fix)", windowWidth/2, windowHeight/2+40);
                textSize(16);
                fill(128);
                text("run configureHypervisor(\"reloadOnInvalidCache\", true)", windowWidth/2, windowHeight/2+80);
                text("to automatically redraw when cache becomes invalid", windowWidth/2, windowHeight/2+95);
            }
        } else {
            image(cachedImage, 0, 0, windowWidth, windowHeight);
        }
    }
    fill(0, 0, 0, 128)
    noStroke();
    let returnValue = false;
    if (expanded) {
        rect(windowWidth-400, 0, windowWidth, windowHeight);
        let hoverCollapseButton = mouseX > windowWidth-450 && mouseX < windowWidth-400 && mouseY > windowHeight/2-50 && mouseY < windowHeight/2+50;
        rect(windowWidth-(hoverCollapseButton?430:450), windowHeight/2-50, hoverCollapseButton?30:50, 100);
        fill(255);
        textSize(48);
        textAlign(CENTER, CENTER);
        text(">", windowWidth-(hoverCollapseButton?415:435), windowHeight/2);
        returnValue = hoverCollapseButton && mouseIsPressed && !wasMousePressed;
        // actual tools and stuff
        // pause/resume button
        if (hypervisor.isTicking) {
            fill(255, 128, 0);
            rect(windowWidth-390, 10, 380, 100);
            fill(255);
            rect(windowWidth-370, 30, 15, 60);
            rect(windowWidth-340, 30, 15, 60);
            textSize(75);
            textAlign(CENTER, CENTER);
            text("Pause", windowWidth-160, 60);
        } else {
            fill(0, 128, 0);
            rect(windowWidth-390, 10, 380, 100);
            fill(255);
            triangle(windowWidth-370, 30, windowWidth-370, 90, windowWidth-325, 60);
            textSize(75);
            textAlign(CENTER, CENTER);
            text("Resume", windowWidth-160, 60);
        }
        if (mouseX > windowWidth-390 && mouseX < windowWidth-10 && mouseY > 10 && mouseY < 110 && mouseIsPressed && !wasMousePressed) {
            freeze();
        }

        // step button
        fill(128)
        rect(windowWidth-390, 120, 100, 100);
        fill(hypervisor.isTicking?192:255)
        triangle(windowWidth-370, 140, windowWidth-370, 200, windowWidth-325, 170);
        rect(windowWidth-325, 140, 15, 60);
        if (mouseX > windowWidth-390 && mouseX < windowWidth-290 && mouseY > 120 && mouseY < 220 && mouseIsPressed && !wasMousePressed && !hypervisor.isTicking) {
            step();
        }

        // hold-to-play button
        if (mouseX > windowWidth-280 && mouseX < windowWidth-180 && mouseY > 120 && mouseY < 220 && mouseIsPressed && !hypervisor.isTicking) {
            step();
            fill(0, 128, 0);
        } else {
            fill(128);
        }
        
        rect(windowWidth-280, 120, 100, 100);
        fill(hypervisor.isTicking?192:255)
        triangle(windowWidth-260, 140, windowWidth-260, 200, windowWidth-215, 170);
        triangle(windowWidth-240, 140, windowWidth-240, 200, windowWidth-195, 170);
        rect(windowWidth-325, 140, 15, 60);

        // slow playback
        if (mouseX > windowWidth-170 && mouseX < windowWidth-10 && mouseY > 120 && mouseY < 220 && mouseIsPressed && !hypervisor.isTicking) {
            if (hypervisor.runningFor % 8 == 0) {
                step();
            }
            let r = (hypervisor.runningFor % 8 / 8) * 128;
            let b = (hypervisor.runningFor % 8 / 8) * 128;
            fill(r, 128, b);
        } else {
            fill(128);
        }
        
        rect(windowWidth-170, 120, 160, 100);
        fill(hypervisor.isTicking?192:255)
        triangle(windowWidth-150, 140, windowWidth-150, 200, windowWidth-85, 170);
        rect(windowWidth-325, 140, 15, 60);
        push();
        translate(windowWidth-42, 170);
        rotate(PI/2);
        textSize(28);
        textAlign(CENTER, CENTER)
        text("0.125x", 0, 0);
        pop();
    } else {
        let hover = mouseX > windowWidth-30 && mouseX < windowWidth && mouseY > windowHeight/2-50 && mouseY < windowHeight/2+50;
        rect(windowWidth-(hover?50:30), windowHeight/2-50, hover?50:30, 100);
        fill(255);
        textSize(48);
        textAlign(CENTER, CENTER);
        text("<", windowWidth-(hover?35:15), windowHeight/2);
        returnValue = hover && mouseIsPressed && !wasMousePressed;
    }
    wasMousePressed = mouseIsPressed;
    return returnValue;
}

export function apply() {
    // monkey time
    let actualTickFunc = window.draw;
    window.draw = function () {
        hypervisor.runningFor ++;
        if (hypervisor.isTicking) {
            actualTickFunc();
            cachedImage = get()
        }
        if (hypervisor.runTo > 0) {
            if (hypervisor.isTicking) {
                console.warn("Unintended behavior warning: tried to run " + hypervisor.runTo + " frames, but game isn't frozen;");
                if (hypervisor.behaviors.stepWhileRunning === "turbo") {
                    console.warn("Game running at 2x speed due to request to step " + hypervisor.runTo + " frames\nChange hypervisor.behaviors.stepWhileRunning to 'pause' to stop game instead.");
                } else if (hypervisor.behaviors.stepWhileRunning === "pause") {
                    console.warn("Game frozen due to request to step " + hypervisor.runTo + " frames\nChange hypervisor.behaviors.stepWhileRunning to 'turbo' to run game at 2x speed instead.");
                    hypervisor.isTicking = false;
                }
            }
            if (hypervisor.warp) {
                console.info("Warping " + hypervisor.runTo + " frames");
                for (let i = 0; i < hypervisor.runTo; i++) {
                    actualTickFunc();
                }
                cachedImage = get();
                hypervisor.runTo = 0;
                hypervisor.warp = false;
            } else {
                actualTickFunc();
                hypervisor.runTo--;
                cachedImage = get();
            }
        }
        if (hypervisorOverlay(overlayState, !(hypervisor.isTicking || hypervisor.runTo !== 0))) overlayState = !overlayState;
    }
    hypervisor.isApplied = true;
}

window.freeze = function() {
    hypervisor.isTicking = !hypervisor.isTicking;
    console.info("Game is now " + (hypervisor.isTicking ? "unfrozen" : "frozen"));
}

window.step = function(frames, instantly) {
    hypervisor.runTo = frames??1;
    hypervisor.warp = instantly??false;
}

window.configureHypervisor = function(configName, value) {
    hypervisor.behaviors[configName] = value;
}

let hypervisor = {
    isTicking: true,
    isApplied: false,
    runTo: 0,
    warp: false,
    apply: apply,
    runningFor: 0,
    freeze: window.freeze,
    step: window.step,
    behaviors: {
        stepWhileRunning: "pause",
        reloadOnInvalidCache: false
    }
}

export default hypervisor

