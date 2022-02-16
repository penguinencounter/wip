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
    if (stateFrames === 1) {
        loadTasks().then(() => {console.log("loadTasks completed")});
    }
    let stateTimeMS = (new Date()) - stateInitializedTime;
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
    fill(150);
    text("hold SHIFT for safe mode", windowWidth/2, windowHeight-10);
    if (loaded && stateTimeMS >= loadingScreenMinTime*1000) {
        state = "MainMenu";
        safeMode = keymap[SHIFT];
        if (safeMode) {
            console.warn('Safe mode activated');
        }
        resetStateTimer();
    } else if (loaded && loadState === 0) {
        loadState = 1;
        let diff = loadingScreenMinTime*1000 - stateTimeMS;
        console.info('Loading completed with extra ' + diff + ' ms. Waiting to terminate load screen.');
    }
}

// mainMenu constants
let mainMenuIMG;
let stretchX;
let stretchY;
let xPos;
let yPos;
function mainMenu() {
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
        recomputePositioning = false;
    }
    let stateTimeMS = (new Date()) - stateInitializedTime;
    background(0, 0, 0);
    alignBGImg();
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