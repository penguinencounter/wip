/**
 * renderer.mjs
 * "who knew tilemaps were so hard"
 * @exports camera and other things
 * 
 */

export class StateError extends Error {}

export class Camera {
    static READY = 8641023341;   // randomly generated
    static RUNNING = 8641023342;

    static CENTER_ORIGIN = 8641023343;
    constructor (xPos, yPos, zoom) {
        this.xPos = xPos;
        this.yPos = yPos;
        this.zoom = zoom;
        
        this.settings = []
        this.state = Camera.READY;
    }
    setupRenderState() {
        if (this.state == Camera.RUNNING) throw new StateError("Camera already started! finish() first.");
        this.state = Camera.RUNNING;
        push();
        if (this.settings.includes(Camera.CENTER_ORIGIN)) {
            translate(windowWidth/2, windowHeight/2);
        }
        scale(this.zoom);
        translate(this.xPos, this.yPos);
    }
    finish() {
        if (this.state == Camera.READY) throw new StateError("Camera not started! setupRenderState() first.");
        this.state = Camera.READY;
        pop();
    }

    isVisible(x, y, w, h, ww, wh) {
        let modified_x = x * this.zoom + this.xPos;
        let modified_y = y * this.zoom + this.yPos;

        if (this.settings.includes(Camera.CENTER_ORIGIN)) {
            modified_x += ww / 2;
            modified_y += wh / 2;
        }

        let modified_w = w * this.zoom;
        let modified_h = h * this.zoom;
        let result = (modified_x + modified_w > 0 && modified_x < ww && modified_y + modified_h > 0 && modified_y < wh);
        return result;
    }
}

export let drawer = {};

function populate(name, original, bbtransformer) {
    drawer[name] = function(cam, ...args) {
        let bb = bbtransformer(...args);
        if (cam.isVisible(bb.x, bb.y, bb.w, bb.h, windowWidth, windowHeight)) {
            original(...args);
        }
    };
}

export function setup() {
    populate('rect', rect, function(x, y, w, h){return {x:x, y:y, w:w, h:h};});
    populate('line', line, function(x1, y1, x2, y2) {
        return {
            x: Math.min(x1, x2),
            y: Math.min(y1, y2),
            w: Math.abs(x2-x1),
            h: Math.abs(y2-y1)
        };
    });
}

export default {
    StateError: StateError,
    Camera: Camera,
    setup: setup,
    drawer: drawer
}
