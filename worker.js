var state, brot = [];

/**
 * Convert a bitmap ("real") space coordinate to brot space.
 */
function pointForPixel(x, y) {
    var rw = state.width, rh = state.height; // real space width/height
    var bl = -2.0, bt = -1.0, br = 1.0, bb = 1.0; // brot space bounds
    var bw = br - bl, bh = bb - bt; // brot space width/height
    
    var bx = bl + (x * (bw / rw)), by = bt + (y * (bh / rh)); // transform coords to brot space
    
    return { x: bx, y: by };
}

/**
 * Calculate if a brot space coordinate is within the set.
 */
function pointInSet(c) {
    var cx = c.x, cy = c.y;
    var zx = 0.0, zy = 0.0, flarp;
    var count = 0;
    while (count < state.depth && (zx*zx + zy*zy) <= (2*2)) {
        flarp = zx*zx - zy*zy + cx;
        zy = 2*zx*zy + cy;
        zx = flarp;
        count++;
    }
    return (count == state.depth) ? null : count;
}

/**
 * Start the calculation when a message is received from the main process.
 */
onmessage = function(event) {
    state = JSON.parse(event.data);
    var y = 0, yl = state.height;
    var x = 0, xl = state.width;
    
    for (; y < yl; y++) {
        for (x = 0; x < xl; x++) {
            brot[x] = pointInSet(pointForPixel(x, y)) * state.scale;
        }
        postMessage(JSON.stringify(brot)); // send the results back whenever a line is ready
    }
    postMessage(JSON.stringify(null));
}
