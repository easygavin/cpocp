/**
 * Page Event 处理
 */
define([], function () {

    // touchStart开始事件
    var touchStart = "touchstart";

    // touchEnd结束事件
    var touchEnd = "touchend";

    // touchMove事件
    var touchMove = "touchmove";

    // 自定义Tap激活事件
    var activate = document.hasOwnProperty("ontouchstart") ? "activate" : "click";

    // 点击事件
    var click = document.hasOwnProperty("ontouchstart") ? "touchstart" : "click";

    // Tap 事件
    var tap = document.hasOwnProperty("ontouchstart") ? "tap" : "click";

    // 时间目标对象
    var eventTarget = null;

    // 事件超时时间
    var eventTime = 750;

    // 开始时间
    var startTime = 0;

    // 结束时间
    var endTime = 0;

    // 移动距离
    var delta = 10;

    // 开始X坐标
    var startPageX = 0;

    // 开始Y坐标
    var startPageY = 0;

    // 标示触发处理事件
    var needTrigger = true;

    // 事件过长应该触发点击结束事件
    var triggerTimer = null;

    // Tap 样式定时器
    var tapCSSTimer = null;

    // 是否已经触发事件
    var hasActivate = false;
    /**
     * 处理Tap事件
     * @param el 样式元素
     * @param target 事件元素
     * @param trigger 触发事件
     * @param event 事件对象
     */
    var handleTapEvent = function (el, target, trigger, event) {

        // 记录开始时间
        startTime = new Date().getTime();
        eventTarget = target;
        needTrigger = true;
        hasActivate = false;

        clearTimeout(tapCSSTimer);
        tapCSSTimer = setTimeout(function () {
            if (needTrigger && !hasActivate) {
                // Tap显示样式
                $(".tapHover").css({
                    "top":$(el).offset().top,
                    "left":$(el).offset().left,
                    "width":$(el)[0].offsetWidth,
                    "height":$(el)[0].offsetHeight
                }).show();
            }
        }, 65);

        startPageX = event.pageX;
        startPageY = event.pageY;

        // touchEnd 触发事件
        $(target).off(touchEnd, handleTouchEnd);
        $(target).on(touchEnd, handleTouchEnd);

        // touchMove 触发事件
        $(target).off(touchMove, handleTouchMove);
        $(target).on(touchMove, handleTouchMove);

        clearTimeout(triggerTimer);
        triggerTimer = setTimeout(function () {
            // 隐藏Tap样式
            $(".tapHover").hide();
        }, eventTime);
    };

    var handleTouchEnd = function (e) {
        // 记录结束时间
        endTime = new Date().getTime();

        if (needTrigger && endTime - startTime < eventTime) {
            hasActivate = true;
            $(eventTarget).trigger(activate);
        }

        // 隐藏Tap样式
        $(".tapHover").hide();
        return true;
    };

    var handleTouchMove = function (e) {
        var pageX = e.pageX;
        var pageY = e.pageY;

        //if (Math.abs(startPageX - pageX) > delta || Math.abs(startPageY - pageY) > delta) {
        needTrigger = false;
        //}
        // 隐藏Tap样式
        $(".tapHover").hide();
        return true;
    };

    return {
        touchStart:touchStart, // touchStart 事件
        activate:activate, // 模拟事件
        click:click, // 点击事件
        tap:tap, // Tap 点击事件
        handleTapEvent:handleTapEvent
    };

});