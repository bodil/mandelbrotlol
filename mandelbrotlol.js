var fail = false;

var canvas = document.getElementById("canvas");
try {
    var context = canvas.getContext("2d");
} catch(e) {
    fail = "Your browser doesn't support the HTML5 canvas element. That smells like Internet Explorer to me.";
}
if (!fail) {
    try {
        var bitmap = context.createImageData(canvas.width, canvas.height);
    } catch (e) {
        fail = "Your browser has an incomplete implementation of the HTML5 canvas element. That smells like Opera to me.";
    }
}
if (fail) {
    document.getElementById("fail").innerHTML = fail +
        '<br/><br/>Try <a href="http://mozilla.com/">Firefox</a> or <a href="http://google.com/chrome">Google Chrome</a>!';
} else {
    var worker = new Worker("worker.js");
    var index = 0, lastTime = 0;
    worker.onmessage = function(event) {
        var msg = JSON.parse(event.data);
        if (msg === null) { // this is the "worker complete" event
            context.putImageData(bitmap, 0, 0);
        } else { // a line is ready for rendering
            Array.prototype.forEach.apply(msg, [function(it) {
                if (it === null) 
                    it = 0;
                if (it > 255) 
                    it = 255;
                bitmap.data[index++] = it;
                bitmap.data[index++] = it;
                bitmap.data[index++] = it;
                bitmap.data[index++] = 255;
            }]);
            // If more than 0.1 seconds have passed, render the bitmap to the canvas
            var curTime = Math.floor(new Date().getTime() / 100);
            if (curTime != lastTime) {
                lastTime = curTime;
                context.putImageData(bitmap, 0, 0);
            }
        }
    }
    
    // Send a message to the worker to start the calculation
    worker.postMessage(JSON.stringify({
        width: bitmap.width,
        height: bitmap.height,
        depth: 1024,
        scale: 4
    }));
}
