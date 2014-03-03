/**
 * 幸运赛车玩法介绍
 */
define([
    "text!../../views/racing/intro.html",
    "../util/Page",
    "util/PageEvent",
    "util/AppConfig",
    "util/Util"
], function(template, page, pageEvent, appConfig, util){

    /**
     * 当期显示区域
     * @type {String}
     */

    var flag = "intro";
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

        // 初始化显示
        initShow(data);

        // 绑定事件
        bindEvent();

        // 处理返回
        page.setHistoryState({url: "racing/intro", data:{}},
            "racing/intro",
            "#racing/intro" + (JSON.stringify(params).length > 2 ? "?data=" + encodeURIComponent(JSON.stringify(params)) : ""),
            forward ? 1 : 0);

        // 隐藏加载标示
        util.hideLoading();
    };

    /**
     * 初始化显示
     */
    var initShow = function(data) {
        flag = "intro";
        showZone();
    };

    /**
     * 显示区域
     */
    var showZone = function() {
        $("#m_"+flag).addClass("click");
        $("#"+flag).show();
    };

    /**
     * 隐藏区域
     */
    var hideZone = function() {
        $("#m_"+flag).removeClass("click");
        $("#"+flag).hide();
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

        // Tab 切换
		$(".btnMenu a").on(pageEvent.touchStart, function(e) {
            pageEvent.handleTapEvent(this, this, pageEvent.activate, e);
            return true;
        });

        $(".btnMenu a").on(pageEvent.activate, function(e) {
            var $target = $(this);
            if ($target.hasClass("click")) {
                return false;
            }
            hideZone();
            flag = $target.attr("id").split("_")[1];
            showZone();
            return true;
        });

    };

    return {init:init};
});
