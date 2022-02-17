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
    }

    draw() {
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
        const result = (this.x <= cX <= this.x + this.w) && (this.y <= cY <= this.y + this.h);
        this.hovered = result;
        return result;
    }

    autoCenter(sW, sH, oX, oY) {
        this.x = (sW/2)-(this.w/2)+oX;
        this.x = (sH/2)-(this.h/2)+oY;
    }
}


function setup() {
    document.getElementById('wipeme').innerHTML = '';
    createCanvas(windowWidth, windowHeight);
    resetStateTimer();
}
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  recomputePositioning = true;
}

let recomputePositioning = true;

let state = "LoadingScreen";
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
const loadingScreenMinTime = 10;
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
        state = "MainMenu";
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

// mainMenu constants
let mainMenuIMG;
let stretchX;
let stretchY;
let xPos;
let yPos;
let startButton;
function mainMenu() {
    if (stateFrames === 1) {
        startButton = new Button("Start", 0, 0, 150, 50, color(0, 127, 255), color(0, 255, 255), color(255), color(0));
    }
    // Image alignment: we have 2048*2048.
    // Try to center.
    // If display is too wide, apply stretch.
    function alignBGImg() {
        image(mainMenuIMG, xPos, yPos, stretchX?windowWidth:2048, stretchY?windowHeight:2048);
    }
    if (recomputePositioning) {
        stretchX = windowWidth >= 2048;
        stretchY = windowHeight >= 2048;
        xPos = stretchX?0:(windowWidth-2048)/2;
        yPos = stretchY?0:(windowHeight-2048)/2;
        console.log(`Background image aligned to ${xPos}, ${yPos}${stretchX?" Stretching X":""}${stretchY?" Stretching Y":""}`);

        // Center start button
        startButton.autoCenter(windowWidth, windowHeight, 0, 0);

        recomputePositioning = false;
    }
    let stateTimeMS = (new Date()) - stateInitializedTime;
    background(0, 0, 0);
    alignBGImg();
    textSize(30);
    startButton.draw();
    startButton.isCursorWithin(mouseX, mouseY);
}

function draw() {
    stateFrames += 1;
    switch (state) {
        case "LoadingScreen":
            loadingScreen();
            break;
        case "MainMenu":
            mainMenu();
            break;
    }
}