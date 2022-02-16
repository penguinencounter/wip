function setup() {
    document.getElementById('wipeme').innerHTML = '';
    createCanvas(windowWidth, windowHeight);
    resetStateTimer();
}
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

let state = "LoadingScreen";
let stateInitializedTime = null;
let stateFrames = 0;

let keymap = {}
function keyPressed() {
    console.debug('key '+ keyCode + ' ['+key+'] pressed')
    keymap[keyCode] = true;
}
function keyReleased() {
    console.debug('key '+ keyCode + ' ['+key+'] released')
    keymap[keyCode] = false;
}


function resetStateTimer() {
    stateInitializedTime = new Date();
    stateFrames = 0;
}

function hold(milisec) {
    return new Promise(resolve => {
        setTimeout(() => { resolve('') }, milisec);
    })
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
        loadTasks().then(() => {console.log("loadTasks completed")})
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
        safeMode = keymap[SHIFT]
        if (safeMode) {
            console.warn('Safe mode activated')
        }
        resetStateTimer();
    } else if (loaded && loadState === 0) {
        loadState = 1;
        console.info('Loading completed with extra ' + diff + ' ms. Waiting to terminate load screen.')
    }
}

// mainMenu constants
let mainMenuIMG;
function mainMenu() {
    let stateTimeMS = (new Date()) - stateInitializedTime;
    background(Math.sin(stateTimeMS/1000)*63+63, 0, 0);
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