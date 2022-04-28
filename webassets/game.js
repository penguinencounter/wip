class Button {
    constructor(str, x, y, w, h, bg, bg_hov, fg, fg_hov) {
        this.str = str;

        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;

        this.bg = bg;
        this.bg_hov = bg_hov;
        this.fg = fg;
        this.fg_hov = fg_hov;

        this.hovered = false;
        this.rendering = false;

        this.on_click = null;

        this.prio = 0;
    }

    draw() {
        if (!this.rendering) {return;}
        // Apply any stroke/textFont/textSize before calling draw.

        // Background of button
        fill(this.hovered?this.bg_hov:this.bg);
        rect(this.x, this.y, this.w, this.h);

        // Foreground text
        fill(this.hovered?this.fg_hov:this.fg);
        textAlign(CENTER, CENTER);
        text(this.str, this.x+(this.w/2), this.y+(this.h/2));
    }

    isCursorWithin(cX, cY) {
        let p1 = (this.x <= cX && cX <= (this.x + this.w));
        let p2 = (this.y <= cY && cY <= (this.y + this.h));
        let result = p1 && p2 && this.rendering;
        return result;
    }

    autoCenter(sW, sH, oX, oY) {
        this.x = (sW/2)-(this.w/2)+oX;
        this.y = (sH/2)-(this.h/2)+oY;
    }
}
let buttons = {}


function buttonClickAction() {
    let target = null;
    let max_prio = -1;
    for (let prop in buttons) {
        let button = buttons[prop];
        if (!button.rendering) {
            continue;
        }
        if (button.isCursorWithin(mouseX, mouseY) && button.prio > max_prio && button.on_click !== null) {
            max_prio = button.prio;
            target = button;
        }
    }
    if (target !== null) {
        target.on_click();
        return true;
    }
    return false;
}

function buttonDrawAction() {
    let target = null;
    let max_prio = -1;
    let rv = false;
    for (let prop in buttons) {
        let button = buttons[prop];
        if (!button.rendering) {
            continue;
        }
        button.hovered = false;
        if (button.isCursorWithin(mouseX, mouseY) && button.prio > max_prio) {
            max_prio = button.prio;
            target = button;
        }
    }
    if (target !== null) {
        target.hovered = true;
        rv = true;
    }
    for (let prop in buttons) {
        let button = buttons[prop];
        button.draw();
    }
    return rv
}

let cnv;


function setup() {
    document.getElementById('wipeme').innerHTML = '';
    cnv = createCanvas(windowWidth, windowHeight);
    cnv.mouseClicked(buttonClickAction);
    resetStateTimer();
}
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  recomputePositioning = true;
}

let recomputePositioning = true;

let state = "LoadingScreen";
let nextState = "MainMenu"
let stateInitializedTime = null;
let stateFrames = 0;

let keymap = {}
function keyPressed() {
    console.debug('key '+ keyCode + ' ['+key+'] pressed');
    keymap[keyCode] = true;
}
function keyReleased() {
    console.debug('key '+ keyCode + ' ['+key+'] released');
    keymap[keyCode] = false;
}


function resetStateTimer() {
    stateInitializedTime = new Date();
    stateFrames = 0;
}

function hold(milisec) {
    return new Promise(resolve => {
        setTimeout(() => { resolve('') }, milisec);
    });
}

// loadingScreen constants
const loadingScreenMinTime = 1;
let loaded = false;
let safeMode = false;
let loadState = 0;
let successCount = 0;
const requiredCount = 1;
async function loadTasks() {
    function incCounter() {successCount += 1;}
    mainMenuIMG = loadImage('/assets/images/menubg.png', incCounter);
    while (successCount < requiredCount) {
        await hold(100);
    }
    loaded = true;
}


function loadingScreen() {
    let shx = 0;
    let shy = 0;
    if (stateFrames === 1) {
        loadTasks().then(() => {console.log("loadTasks completed")});
    }
    let stateTimeMS = (new Date()) - stateInitializedTime;
    let diff = loadingScreenMinTime*1000 - stateTimeMS;
    background(100);
    fill(255, 255, 0);
    textSize(40);
    textAlign(CENTER, CENTER);
    textFont("monospace");
    text("Loading...", windowWidth/2, windowHeight/2);
    textSize(20);
    if (loaded) {
        fill(150);
        text('Waiting '+(Math.round(stateTimeMS/100)/10)+'s/'+loadingScreenMinTime+'s', windowWidth/2, windowHeight/2+30);
    } else {
        fill(255, 127, 0);
        text(`Loading: ${successCount}/${requiredCount} ${Math.round(successCount/requiredCount*1000)/10}%`, windowWidth/2, windowHeight/2+30);
    }
    fill(keymap[SHIFT]?255:150, keymap[SHIFT]?255:150, keymap[SHIFT]?0:150);
    if (keymap[SHIFT]) {
        shx = (Math.random()*2-1)*(stateFrames/10);
        shy = (Math.random()*2-1)*(stateFrames/10);
    } else {
        shx = 0;
        shy = 0;
    }
    text("hold SHIFT for safe mode", (windowWidth/2)+shx, (windowHeight-10)+shy);
    if (loaded && stateTimeMS >= loadingScreenMinTime*1000) {
        state = document.location.hash===''?"MainMenu":document.location.hash.substring(1);
        safeMode = keymap[SHIFT];
        if (safeMode) {
            console.warn('Safe mode activated');
        }
        resetStateTimer();
    } else if (loaded && loadState === 0) {
        loadState = 1;
        console.info('Loading completed with extra ' + diff + ' ms. Waiting to terminate load screen.')
    }
}

function extrapolateLineAngle(x1, y1, length, angle) {
    return [x1+length*Math.cos(angle), y1+length*Math.sin(angle)]
}


let coolBGBuffer = [];
let coolBGConfig = {
    start: {
        s: 100,
        b: 100,
        a: 0.2
    },
    current: {
        h: 0,
        r: 0,
        d: 0,
        pr: 0,
        pd: 0
    },
    h_gain: 0.1,
    r_gain: 120,
    d_gain: 1,
    max_d: 1000,
    steps_per_frame: 5,
    maxLinesDrawn: 1000,
    lightMode: false,
    lagFrames: 0,
    allowLightMode: true,
    useFillerLines: false
}
function coolBG() {
    if (frameRate() < 30 &&  coolBGConfig.allowLightMode) {
        coolBGConfig.lagFrames += 1;
        if (coolBGConfig.lagFrames > 20) {
            coolBGConfig.lightMode = true;
        }
    } else {
        coolBGConfig.lagFrames = 0;
    }
    colorMode(HSB);
    fill(coolBGConfig.current.h, coolBGConfig.start.s, coolBGConfig.start.b, 1);
    textAlign(LEFT, BOTTOM);
    textSize(30);
    if (coolBGConfig.lightMode) {
        coolBGConfig.maxLinesDrawn = 150;  // performance option 1
        // coolBGConfig.steps_per_frame = 1; // performance option 2
        coolBGConfig.useFillerLines = false;
        text(Math.round(frameRate()) + ' fps', 0, windowHeight-30)
        text('Performace mode enabled', 0, windowHeight);
    } else {
        text(Math.round(frameRate()) + ' fps', 0, windowHeight)
    }
    // Rendering
    if (coolBGConfig.useFillerLines) {
        for (let seg of coolBGBuffer) {
            stroke(seg.h, coolBGConfig.start.s, coolBGConfig.start.b, coolBGConfig.start.a/2);
            strokeWeight(40);
            line(seg.startPos[0], seg.startPos[1], seg.endPos[0], seg.endPos[1]);
        }
    }
    for (let seg of coolBGBuffer) {
        stroke(seg.h, coolBGConfig.start.s, coolBGConfig.start.b, coolBGConfig.start.a);
        strokeWeight(10);
        line(seg.startPos[0], seg.startPos[1], seg.endPos[0], seg.endPos[1]);
    }
    colorMode(RGB);
    for (let i = 0; i < coolBGConfig.steps_per_frame; i ++) {
        while (coolBGBuffer.length > coolBGConfig.maxLinesDrawn) {
            coolBGBuffer.shift();
        }
        coolBGConfig.current.h += coolBGConfig.h_gain;
        coolBGConfig.current.h %= 360;
        coolBGConfig.current.r += coolBGConfig.r_gain;
        coolBGConfig.current.d += coolBGConfig.d_gain;
        if (coolBGConfig.current.d >= coolBGConfig.max_d) {
            coolBGConfig.current.d = 0;
            coolBGConfig.current.pd = 0;
        }
        let startPos = extrapolateLineAngle(windowWidth/2, windowHeight/2, coolBGConfig.current.pd, coolBGConfig.current.pr);
        let endPos = extrapolateLineAngle(windowWidth/2, windowHeight/2, coolBGConfig.current.d, coolBGConfig.current.r);
        coolBGBuffer.push({startPos: startPos, endPos: endPos, h: coolBGConfig.current.h});
        coolBGConfig.current.pr = coolBGConfig.current.r;
        coolBGConfig.current.pd = coolBGConfig.current.d;
    }
}

// mainMenu constants
let mainMenuIMG;
let stretchX;
let stretchY;
let xPos;
let yPos;
function mainMenu() {
    let hasClickable = false;
    if (stateFrames === 1) {
        buttons.startButton = new Button("Start", 0, 0, 150, 50, color(0, 127, 255), color(0, 255, 255), color(255), color(0));
        buttons.startButton.rendering = true;
        buttons.startButton.on_click = function() {
            this.rendering = false;
            resetStateTimer();
            state = 'SelectProfile';  // Login automatically
        }
        recomputePositioning = true;
    }
    if (recomputePositioning) {
        stretchX = windowWidth >= 2048;
        stretchY = windowHeight >= 2048;
        xPos = stretchX?0:(windowWidth-2048)/2;
        yPos = stretchY?0:(windowHeight-2048)/2;
        console.log(`Background image aligned to ${xPos}, ${yPos}${stretchX?" Stretching X":""}${stretchY?" Stretching Y":""}`);

        // Center start button
        buttons.startButton.autoCenter(windowWidth, windowHeight, 0, 0);

        coolBGConfig.max_d = Math.max(windowWidth, windowHeight);
        coolBGConfig.maxLinesDrawn = Math.max(windowWidth, windowHeight);
        recomputePositioning = false;
    }
    background(0, 0, 0);
    // alignBGImg();
    coolBG();
    noStroke();
    textSize(30);
    hasClickable = buttonDrawAction();
    fill(255);
    cursor(hasClickable?'pointer':'default');
}

let errorReported = false;
let errorCount = 0;
function errorScreen(msg) {
    let hasClickable = false;
    if (stateFrames === 1) {
        let f = new FormData();
        f.append('msg', msg);
        const data = new URLSearchParams(f);
        fetch('/report_err', {
            method: "POST",
            body: data
        }).then(
            d => d.text()
        ).then((t) => {
            errorReported = true;
            errorCount = parseInt(t);
        });
        buttons.reset = new Button("Reset", 0, 0, 300, 50, color(255, 127, 0), color(255, 255, 0), color(0), color(0));
        buttons.reset.rendering = true;
        buttons.reset.on_click = function() {
            document.location.reload();
        }
        recomputePositioning = true;
    }

    if (recomputePositioning) {
        buttons.reset.autoCenter(windowWidth, windowHeight, 0, 50);
        recomputePositioning = false;
    }
    background(40);
    textAlign(CENTER, CENTER);
    textSize(40);
    fill(255, 0, 0);
    text(msg, windowWidth/2, windowHeight/2);
    textSize(20);
    text('ERROR' + (errorReported?` (Reported, Count ${errorCount})`:' (Sending...)'), windowWidth/2, windowHeight/2-40);
    textSize(40);
    hasClickable = buttonDrawAction();
    cursor(hasClickable?'pointer':'default');
}

function profileSelector() {
    background(0);
    fill(255, 255, 255, 127);
    ellipse((windowWidth/2)-5, (windowHeight/2)+150, 200, 100);
}

let validated = false;
function validateMe() {
    return fetch('/validate_me').then(response => response.json())
}
let validatationText = 'Signing in...'
function validation() {
    if (stateFrames === 1) {
        validationText = 'Signing in...'
        validateMe().then((json) => {
            if (json.result === true) {
                resetStateTimer();
                validated = true;
                state = nextState;
            } else {
                validationText = 'Loading...'
                document.location = '/login'
            }
        })
    }
    background(40);
    fill(255, 255, 0);
    textSize(25);
    textAlign(CENTER, CENTER);
    text(validationText, windowWidth/2, windowHeight/2);
}

function requiresLogin(src) {
    if (!validated) {
        resetStateTimer();
        state = "ValidateLogin";
        nextState = src;
    }
    return validated;
}

let errorStateMsg = ''
function draw() {
    try {
        stateFrames += 1;
        switch (state) {
            case "LoadingScreen":
                loadingScreen();
                break;
            case "MainMenu":
                mainMenu();
                break;
            case "ValidateLogin":
                validation();
                break;
            case "SelectProfile":
                if (!validated) {
                    resetStateTimer();
                    state = "ValidateLogin";
                    nextState = "SelectProfile";
                    break;
                }    
                profileSelector();
                break;
            case "Error":
                errorScreen(errorStateMsg);
                break;
            default:
                errorScreen(`State not found: "${state}"`);
                break;
        }
    } catch (e) {
        state = "Error";
        errorStateMsg = e.message;
        resetStateTimer();
    }
}