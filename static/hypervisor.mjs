// hypervisor: aka tick-on-command
// basically a wrapper around draw to allow single stepping and other crazy wack stuff
let wasMousePressed = false;
let overlayState = false;
let cachedImage = null;

export function hypervisorOverlay(expanded, renderCachedImage) {
    if (renderCachedImage) {
        if (cachedImage.width !== windowWidth || cachedImage.height !== windowHeight) {
            background(0);
            fill(255, 0, 0);
            textSize(32);
            textAlign(CENTER, CENTER);
            text("Cached image is no longer valid", windowWidth/2, windowHeight/2);
            text("(unfreeze to fix)", windowWidth/2, windowHeight/2+40);
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
        if (hypervisor.isTicking) {
            actualTickFunc();
        }
        if (hypervisor.runTo > 0) {
            if (hypervisor.isTicking) {
                console.warn("Unintended behavior warning: tried to run " + hypervisor.runTo + " frames, but game isn't frozen;");
                if (hypervisor.unintendedBehaviors.stepWhileRunning === "turbo") {
                    console.warn("Game running at 2x speed due to request to step " + hypervisor.runTo + " frames\nChange hypervisor.unintendedBehaviors.stepWhileRunning to 'pause' to stop game instead.");
                } else if (hypervisor.unintendedBehaviors.stepWhileRunning === "pause") {
                    console.warn("Game frozen due to request to step " + hypervisor.runTo + " frames\nChange hypervisor.unintendedBehaviors.stepWhileRunning to 'turbo' to run game at 2x speed instead.");
                    hypervisor.isTicking = false;
                }
            }
            if (hypervisor.warp) {
                console.info("Warping " + hypervisor.runTo + " frames");
                for (let i = 0; i < hypervisor.runTo; i++) {
                    actualTickFunc();
                }
                hypervisor.runTo = 0;
                hypervisor.warp = false;
            } else {
                actualTickFunc();
                hypervisor.runTo--;
            }
        }
        if (hypervisor.isTicking || hypervisor.runTo !== 0) {
            cachedImage = get()
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

let hypervisor = {
    isTicking: true,
    isApplied: false,
    runTo: 0,
    warp: false,
    apply: apply,
    freeze: window.freeze,
    step: window.step,
    unintendedBehaviors: {
        stepWhileRunning: "pause"
    }
}

export default hypervisor

