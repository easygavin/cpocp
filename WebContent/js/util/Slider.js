/**
 *    @desc javascript Slider
 *    @parameter opt
 *    @parameter string opt.items  Array
 *    @parameter string opt.width  int
 *    @parameter string opt.duration  int
 *    @date 2013年11月5日
 *    @author Gavin
 */
function Slider(opt) {
    this.items = opt.items;
    this.width = opt.width;
    this.duration = opt.duration;
    this.timer = null;
    this.avg = 10;
    this.direction = 1;
    this.handleWidth = this.width;
    this.prefix = this.getVendorPrefix();
    this.index = 0; // 焦点位置
}

Slider.prototype.getIndex = function () {
    return this.index;
};

Slider.prototype.slide = function (direction) {

    this.direction = direction;
    var direcWidth = this.direction > 0 ? -this.width : this.width;

    //this.prefix = this.getVendorPrefix();
    if (this.prefix) {
        var duration = this.prefix + "TransitionDuration";
        for (var i = 0, len = this.items.length; i < len; i++) {
            this.items[i].style[duration] = this.duration + "ms";
            this.items[i].style.left = (parseInt(this.items[i].style.left, 10) + direcWidth) + "%";
        }
    } else {
        this.handleWidth = this.width;
        if (this.timer == null) {
            var that = this;
            (function (that) {
                that.timer = setInterval(function () {
                    var step = Math.ceil((that.width * that.avg * 3) / that.duration);
                    // handle special
                    if (that.handleWidth - step < 0) {
                        step = that.handleWidth;
                    }

                    var direcStep = that.direction > 0 ? -step : step;
                    for (var i = 0, len = that.items.length; i < len; i++) {
                        that.items[i].style.left = (parseInt(that.items[i].style.left, 10) + direcStep) + "%";
                    }

                    that.handleWidth -= step;
                    if (that.handleWidth == 0) {
                        clearInterval(that.timer);
                        that.timer = null;
                    }
                }, that.avg);
            })(that);
        }
    }

};

Slider.prototype.getVendorPrefix = function () {
    var body, i, style, transition, vendor;
    body = document.body || document.documentElement;
    style = body.style;
    transition = "transition";
    vendor = ["Moz", "Webkit", "Khtml", "O", "ms"];
    transition = transition.charAt(0).toUpperCase() + transition.substr(1);
    i = 0;
    while (i < vendor.length) {
        if (typeof style[vendor[i] + transition] === "string") {
            return vendor[i];
        }
        i++;
    }
    return false;
};

Slider.prototype.next = function () {

    // 滑动之后需要移动第一个到最后一个位置
    // 滑动
    this.slide(1);

    // 移动位置
    var that = this;
    (function (that) {

        if (that.prefix) {
            $(that.items[0]).on("transitionend webkitTransitionEnd oTransitionEnd otransitionend MSTransitionEnd", function (event) {

                // 第一个
                var first = that.items.shift();
                // 最后一个
                var last = that.items[that.items.length - 1];

                //that.prefix = that.getVendorPrefix();
                if (that.prefix) {
                    var duration = that.prefix + "TransitionDuration";
                    first.style[duration] = "0ms";
                }

                first.style.left = (parseInt(last.style.left, 10) + that.width) + "%";

                that.items.push(first);
                $(event.target).off("transitionend webkitTransitionEnd oTransitionEnd otransitionend MSTransitionEnd", arguments.callee);
            });
        } else {

            setTimeout(function () {
                // 第一个
                var first = that.items.shift();
                // 最后一个
                var last = that.items[that.items.length - 1];

                first.style.left = (parseInt(last.style.left, 10) + that.width) + "%";

                that.items.push(first);
            }, that.duration);

        }
    })(that);

    // 焦点位置
    this.index = (this.index + 1) % this.items.length;
};

Slider.prototype.preview = function () {

    // 滑动之前需要移动最后一个到第一个位置
    // 移动位置
    // 最后一个
    var last = this.items.pop();
    // 第一个
    var first = this.items[0];

    if (this.prefix) {
        var duration = this.prefix + "TransitionDuration";
        last.style[duration] = "1ms";
    }

    last.style.left = (parseInt(first.style.left, 10) - this.width) + "%";
    this.items.unshift(last);

    var that = this;
    (function (that) {
        if (that.prefix) {
            $(that.items[0]).on("transitionend webkitTransitionEnd oTransitionEnd otransitionend MSTransitionEnd", function (event) {

                // 滑动
                that.slide(-1);
                $(event.target).off("transitionend webkitTransitionEnd oTransitionEnd otransitionend MSTransitionEnd", arguments.callee);
            });
        } else {

            // 滑动
            that.slide(-1);
        }
    })(that);

    // 焦点位置
    this.index = (this.index - 1 + this.items.length) % this.items.length;
};