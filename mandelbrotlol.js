var canvas = document.getElementById("canvas");
var context = canvas.getContext("2d");

var bitmap = context.createImageData(canvas.width, canvas.height);

var worker = new Worker("worker.js");
var index = 0, lastTime = 0;
worker.onmessage = function(event) {
    if (event.data === null) { // this is the "worker complete" event
        context.putImageData(bitmap, 0, 0);
    } else { // a line is ready for rendering
        event.data.forEach(function(it) {
            if (it === null) 
                it = 0;
            if (it > 255)
                it = 255;
            bitmap.data[index++] = it;
            bitmap.data[index++] = it;
            bitmap.data[index++] = it;
            bitmap.data[index++] = 255;
        });
        // If more than 0.1 seconds have passed, render the bitmap to the canvas
        var curTime = Math.floor(new Date().getTime() / 100);
        if (curTime != lastTime) {
            lastTime = curTime;
            context.putImageData(bitmap, 0, 0);
        }
    }
}

// Send a message to the worker to start the calculation
worker.postMessage({
    width: bitmap.width,
    height: bitmap.height,
    depth: 1024,
    scale: 4
});

