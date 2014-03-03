/**
 * 购彩协议
 */
define([
    "text!../views/protocol.html",
    "util/Page",
    "util/PageEvent",
    "util/AppConfig",
    "util/Util"
], function(template, page, pageEvent, appConfig, util) {

    /**
     * 初始化
     */
    var init = function(data, forward) {

        // 加载模板内容
        $("#container").empty().append($(template));

        // 参数设置
        var params = {};
        var tkn = appConfig.checkLogin(data);
        if (tkn) {
            params.token = tkn;
        }

        // 绑定事件
        bindEvent();

        // 处理返回
        page.setHistoryState({url: "protocol", data:{}}, 
        		"protocol", 
        		"#protocol" + (JSON.stringify(params).length > 2 ? "?data=" + encodeURIComponent(JSON.stringify(params)) : ""),
                forward ? 1 : 0);

        // 隐藏加载标示
        util.hideLoading();
    };

    /**
     * 绑定事件
     */
    var bindEvent = function() {

        // 返回
        $(".back").on(pageEvent.touchStart, function(e) {
            pageEvent.handleTapEvent(this, this, pageEvent.activate, e);
            return true;
        });

        $(".back").on(pageEvent.activate, function(e) {
            page.goBack();
            return true;
        });

        // 我已阅读
        $(".tzBox").on(pageEvent.touchStart, function(e) {
            pageEvent.handleTapEvent(this, this, pageEvent.activate, e);
            return true;
        });

        $(".tzBox").on(pageEvent.activate, function(e) {
            page.goBack();
            return true;
        });
    };

    return {init:init};
});
