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

function resetStateTimer() {
    stateInitializedTime = new Date();
}

// loadingScreen constants
const loadingScreenMinTime = 1;
let loaded = true;
function loadingScreen() {
    let stateTimeMS = (new Date()) - stateInitializedTime;
    background(100);
    fill(255, 255, 0);
    textSize(40);
    textAlign(CENTER, CENTER);
    textFont("monospace");
    text("Loading...", windowWidth/2, windowHeight/2);
    fill(120);
    textSize(20);
    text((Math.round(stateTimeMS/100)/10)+'s/'+loadingScreenMinTime+'s', windowWidth/2, windowHeight/2+30);
    text("hold SHIFT for safe mode", windowWidth/2, windowHeight-10);
    if (loaded && stateTimeMS >= loadingScreenMinTime*1000) {
        state = "MainMenu"
        resetStateTimer();
    }
}


function mainMenu() {

}

function draw() {
    switch (state) {
        case "LoadingScreen":
            loadingScreen();
            break;
        case "MainMenu":
            background();
            break;
    }
}