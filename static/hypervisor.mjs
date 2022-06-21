// hypervisor: aka tick-on-command
// basically a wrapper around draw to allow single stepping and other crazy wack stuff

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
                if (hypervisor.unintended_behaviors.stepWhileRunning === "turbo") {
                    console.warn("Game running at 2x speed due to request to step " + hypervisor.runTo + " frames\nChange hypervisor.unintended_behaviors.stepWhileRunning to 'pause' to stop game instead.");
                } else if (hypervisor.unintended_behaviors.stepWhileRunning === "pause") {
                    console.warn("Game frozen due to request to step " + hypervisor.runTo + " frames\nChange hypervisor.unintended_behaviors.stepWhileRunning to 'turbo' to run game at 2x speed instead.");
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
    unintended_behaviors: {
        stepWhileRunning: "pause"
    }
}

export default hypervisor

