import {lerp as lerp} from '/static/utils.mjs';


let noTextureLoaded = undefined;

export let assets = {
    getImage: function(name) {
        if (Object.keys(assets).includes(name)) {
            return assets[name];
        }
        loadImageAsset(name, `${defaultAssetsPrefix}${name}${imageSuffix}`);
        if (noTextureLoaded === undefined) {
            noTextureLoaded = createImage(64, 64);
            noTextureLoaded.loadPixels();
            function writeColor(image, x, y, red, green, blue, alpha) {
                let index = (x + y * width) * 4;
                image.pixels[index] = red;
                image.pixels[index + 1] = green;
                image.pixels[index + 2] = blue;
                image.pixels[index + 3] = alpha;
              }
            for (let xp = 0; xp < 64; xp++) {
                for (let yp = 0; yp < 64; yp++) {
                    let colorSwitch = 32 < xp + yp < 64
                    writeColor(noTextureLoaded, xp, yp, colorSwitch?255:0, 0, colorSwitch?255:0, 255);
                }
            }
        }
        return noTextureLoaded;
    }
};
export default assets;
const defaultAssetsPrefix = '/static/assets/';
const imageSuffix = '.png';
const jsonSuffix = '.json';
let imageAssetsLoaded = 0;
let imageAssetsFailed = 0;
let imageAssetsTotal = 0;
export function loadImageAsset(name, path, andThen) {
    imageAssetsTotal++;
    let finishedTarget = andThen??(a => {});
    loader_log['Loading image: ' + name] = 0;
    assets[name] = loadImage(path, () => {
        imageAssetsLoaded ++;
        finishedTarget(assets[name]);
        loader_log['Loaded image: ' + name] = 0;
    }, () => {
        imageAssetsFailed ++;
        loader_log['Failed to load image: ' + name] = 0;
    });
}

let jsonAssetsLoaded = 0;
let jsonAssetsFailed = 0;
let jsonAssetsTotal = 0;
export function loadJSONAsset(name, path, andThen) {
    jsonAssetsTotal++;
    let finishedTarget = andThen??(a => {});
    assets[name] = null
    loader_log['Loading JSON object: ' + name] = 0;
    fetch(path).then(r => r.json()).then(json => {
        assets[name] = json;
        jsonAssetsLoaded ++;
        finishedTarget(json);
        loader_log['Loaded JSON object: ' + name] = 0;
    }).catch(e => {
        jsonAssetsFailed ++;
        loader_log['Failed to load JSON object: ' + name] = 0;
    })
}

export function done() {
    return imageAssetsLoaded == imageAssetsTotal && jsonAssetsLoaded == jsonAssetsTotal;
}

let imageDrawPct = 0;
let imageFailPct = 0;
let jsonDrawPct = 0;
let jsonFailPct = 0;
let loader_log = {};
function renderLog() {
    let height = 0
    textAlign(LEFT, TOP)
    textSize(16)
    let keysSorted = Object.keys(loader_log).sort(function(a,b){return loader_log[a]-loader_log[b]})
    for (let key of keysSorted) {
        loader_log[key] ++;
        if (loader_log[key] > 255) {
            delete loader_log[key];
        }
        fill(255, 255, 255, 255-loader_log[key]*2);
        text(key, 0, height);
        height += 20;
    }
}

export function loadingAssetsScreen() {
    textFont("monospace")
    background(0);
    renderLog();
    // images
    if (imageAssetsTotal > 0) {
        fill(255);
        // success
        imageDrawPct = lerp(imageDrawPct, imageAssetsLoaded/imageAssetsTotal, 5);
        let w = imageDrawPct * (windowWidth-40);
        noStroke();
        rect(20, windowHeight-55, w, 20);
        // failed
        imageFailPct = lerp(imageFailPct, imageAssetsFailed/imageAssetsTotal, 5);
        let w2 = imageFailPct * (windowWidth-40);
        noStroke();
        rect(20 + w, windowHeight-55, w2, 20);
        fill(128, 0, 0);
        textSize(20);
        textAlign(LEFT, CENTER);
        fill(255);
        let loadingTexText = `Loading Textures: ${imageAssetsLoaded}/${imageAssetsTotal} ${Math.floor(imageAssetsLoaded/imageAssetsTotal*1000)/10}%`
        text(loadingTexText, 20, windowHeight-20);
        stroke(128);
        strokeWeight(3);
        noFill();
        rect(20, windowHeight-55, windowWidth-40, 20);
    }
    // json
    if (jsonAssetsTotal > 0) {
        fill(255)
        jsonDrawPct = lerp(jsonDrawPct, jsonAssetsLoaded/jsonAssetsTotal, 5);
        let w = jsonDrawPct * (windowWidth-40);
        noStroke();
        rect(20, windowHeight-105, w, 20);
        // failed
        fill(128, 0, 0)
        jsonFailPct = lerp(jsonFailPct, jsonAssetsFailed/jsonAssetsTotal, 5);
        let w2 = jsonFailPct * (windowWidth-40);
        noStroke();
        rect(20 + w, windowHeight-105, w2, 20);
        textSize(20);
        textAlign(LEFT, CENTER);
        let loadingTexText = `Loading JSON objects: ${jsonAssetsLoaded}/${jsonAssetsTotal} ${Math.floor(jsonAssetsLoaded/jsonAssetsTotal*1000)/10}%`
        fill(255);
        text(loadingTexText, 20, windowHeight-70);
        stroke(128);
        strokeWeight(3);
        noFill();
        rect(20, windowHeight-105, windowWidth-40, 20);
    }
}
