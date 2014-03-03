/**
 * 充值
 */
define([
    "text!../../views/user/withdrawalNotes.html",
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
        page.setHistoryState({url: "user/withdrawalNotes", data: params},"user/recharge","#user/withdrawalNotes" + (JSON.stringify(params).length > 2 ? "?data=" + encodeURIComponent(JSON.stringify(params)) : ""),forward ? 1 : 0);

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
            return false;
        });

        $(".back").on(pageEvent.activate, function(e) {
            page.goBack();
        });

        //提款须知
        $("#aboutWithDraw").on(pageEvent.touchStart, function (e) {
            pageEvent.handleTapEvent(this, this, pageEvent.activate, e);
            return false;
        });

        $("#aboutWithDraw").on(pageEvent.activate, function (e) {
            page.goBack();
        });

    };

    return {init:init};
});

