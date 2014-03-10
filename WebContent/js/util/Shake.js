/**
 * Shake 处理
 */
define([], function () {

    var SHAKE_THRESHOLD = 2000;
    var lastUpdate = 0;
    var x, y, z, last_x, last_y, last_z;

    var deviceMotionHandler = function (eventData, callback) {
        // Grab the acceleration including gravity from the results
        var acceleration = eventData.accelerationIncludingGravity;
        var curTime = new Date().getTime();
        if ((curTime - lastUpdate) > 100) {
            var diffTime = (curTime - lastUpdate);
            lastUpdate = curTime;
            x = acceleration.x;
            y = acceleration.y;
            z = acceleration.z;
            var speed = Math.abs(x + y + z - last_x - last_y - last_z) / diffTime * 10000;
            if (speed > SHAKE_THRESHOLD) {
                callback();
            }
            last_x = x;
            last_y = y;
            last_z = z;
        }
    };

    return {deviceMotionHandler:deviceMotionHandler};
});