/**
 * common
 */
define([
    "util/PageEvent"
], function(pageEvent) {

    /**
     * toast 定时器
     * @type {*}
     */
    var TOAST_TIMER = null;

    /**
     * 显示toast
     * @param title
     */
    var toast = function(title) {
        clearTimeout(TOAST_TIMER);
        $(".toast").text(title).show();
        clearTimeout(TOAST_TIMER);
        TOAST_TIMER = setTimeout(function() {
            $(".toast").hide();
        }, 1000);
    };

    /**
     * 提示框
     * @param title
     * @param ctx
     * @param button
     * @param callback
     */
    var dialog = function(title, ctx, button, callback) {

        if ($.trim(title) == "") {
            $(".dialog .tit").hide();
        } else {
            $(".dialog .tit").text(title).show();
        }

        $(".dialog .cxt").html(ctx);
        var $btn = $("#dialog_l");
        $btn.text(button);
        $btn.off(pageEvent.touchStart).off(pageEvent.activate);
        $btn.on(pageEvent.touchStart, function(e) {
            pageEvent.handleTapEvent(this, this, pageEvent.activate, e);
            return true;
        }).on(pageEvent.activate, function(e) {
            hideCover();
            $(".dialog").hide();
            callback(e);
        });

        showCover();
        $(".dialog").show();
    };

    /**
     * 对话框
     * @param title
     * @param ctx
     * @param l_btn
     * @param r_btn
     * @param l_callback
     * @param r_callback
     */
    var prompt = function(title, ctx, l_btn, r_btn, l_callback, r_callback) {
        if ($.trim(title) == "") {
            $(".prompt .tit").hide();
        } else {
            $(".prompt .tit").text(title).show();
        }

        $(".prompt .cxt").html(ctx);
        var $l_btn = $("#prompt_l"), $r_btn = $("#prompt_r");
        $l_btn.text(l_btn), $r_btn.text(r_btn);

        $l_btn.off(pageEvent.touchStart).off(pageEvent.activate);
        $r_btn.off(pageEvent.touchStart).off(pageEvent.activate);

        $l_btn.on(pageEvent.touchStart, function(e) {
            pageEvent.handleTapEvent(this, this, pageEvent.activate, e);
            return true;
        }).on(pageEvent.activate, function(e) {
            hideCover();
            $(".prompt").hide();
            l_callback(e);
        });

        $r_btn.on(pageEvent.touchStart, function(e) {
            pageEvent.handleTapEvent(this, this, pageEvent.activate, e);
        }).on(pageEvent.activate, function(e) {
            hideCover();
            $(".prompt").hide();
            r_callback(e);
        });

        showCover();
        $(".prompt").show();
    };
    /**
	 * 显示遮盖层
	 */
    var showCover = function() {
        var bodyHeight = Math.max(document.documentElement.clientHeight, document.body.offsetHeight);
        $(".cover").css({"height": bodyHeight + "px"}).show();
    };

    /**
	 * 隐藏遮盖层
	 */
    var hideCover = function() {
        $(".cover").hide();
    };

    /**
     * 显示加载图标
     */
    var showLoading = function() {
        $(".load").show();
    };

    /**
     * 隐藏加载图标
     */
    var hideLoading = function() {
        $(".load").hide();
    };

    /**
     * 手机号码验证
     * @param mobile
     * @return {Boolean}
     */
    var isMobile = function(mobile) {
        var pattern = /^(?:1\d{2}|15[0123456789])-?\d{5}(\d{3}|\*{3})$/;
        if(pattern.test(mobile) && mobile != ""){
            return true;
        }
        return false;
    };

    
    return {
        toast: toast,
        dialog: dialog,
        prompt: prompt,
        showCover: showCover,
        hideCover: hideCover,
        showLoading: showLoading,
        hideLoading: hideLoading,
        isMobile: isMobile
    };
});