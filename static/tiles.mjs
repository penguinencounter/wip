export function gridRenderer(cam, color, size) {
    let isize = size??64;
    stroke(color)
    strokeWeight(1);
    // start at 0, 0 world and draw a grid; however only render the visible part of the grid
    // the world extends in both the positive and negative directions
    let cx = -cam.xPos;
    let cy = -cam.yPos;
    let cw = windowWidth/cam.zoom;
    let ch = windowHeight/cam.zoom;

    let ex = cx - cw/2;
    let ey = cy - ch/2;

    let x0 = Math.floor(ex/isize);
    let y0 = Math.floor(ey/isize);
    let x1 = Math.ceil((ex+cw)/isize);
    let y1 = Math.ceil((ey+ch)/isize);
    for (let x = x0; x <= x1; x++) {
        line(x*isize, cy+ch, x*isize, cy-ch);
    }
    for (let y = y0; y <= y1; y++) {
        line(cx+cw, y*isize, cx-cw, y*isize);
    }
}