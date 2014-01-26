/**
 * 充值
 */
define([
    "text!../../views/user/recharge.html",
    "util/Page",
    "util/PageEvent",
    "util/AppConfig"
], function(template, page, pageEvent, appConfig) {

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
        page.setHistoryState({url: "user/recharge", data: params},"user/recharge","#user/recharge" + (JSON.stringify(params).length > 2 ? "?data=" + encodeURIComponent(JSON.stringify(params)) : ""),forward ? 1 : 0);
    };

    /**
     * 绑定事件
     */
    var bindEvent = function() {

        // 返回
        $(".back").on(pageEvent.touchStart, function(e) {
            pageEvent.handleTapEvent(this, this, pageEvent.activate, e);
            return false;
        });

        $(".back").on(pageEvent.activate, function(e) {
            page.goBack();
        });


    };

    return {init:init};
});
