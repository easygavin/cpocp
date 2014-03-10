/**
 * 充值
 */
define([
    "text!../../views/user/abccharge.html",
    "util/Page",
    "util/PageEvent",
    "util/AppConfig",
    "services/PersonService",
    "util/Util"
], function(template, page, pageEvent, appConfig,personService,util) {
    var userInfo = null;
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

        userInfo = appConfig.getLocalJson(appConfig.keyMap.LOCAL_USER_INFO_KEY);

        //初始化显示
        initShow();

        // 绑定事件
        bindEvent();

        // 处理返回
        page.setHistoryState({url: "user/abccharge", data: params},"user/abccharge","#user/abccharge" + (JSON.stringify(params).length > 2 ? "?data=" + encodeURIComponent(JSON.stringify(params)) : ""),forward ? 1 : 0);
    };

    /**
     * 初始化显示
     */
    var initShow = function () {
        // 获取账号余额
        getBalance();
    };
    /**
     * 获取账号余额
     */
    var getBalance = function () {
        //加载页获取账户名跟可用余额.
        var requestType = 0;
        if (userInfo != null) {
            var userId = userInfo.userId;
            var userKey = userInfo.userKey;
            if (userId != "" && userKey != "") {
                personService.getUserBalance(requestType, userId, userKey, function (data) {

                    // 隐藏遮住层
                    util.hideCover();
                    util.hideLoading();

                    if (typeof  data != "undefined") {
                        if (data.statusCode == "0") {
                            var trueName = userInfo.userName;
                            var userBalance = new Number(data.userBalance);
                            if (trueName != "") {
                                $("#c_userName").html(userInfo.userName);
                                $("#c_balance").html(parseInt(userBalance)>0?userBalance.toFixed(2):0);
                            }
                        } else {
                            util.toast(data.errorMsg);
                        }
                    } else {
                        //接口返回数据失败.
                        util.toast("获取余额失败");
                    }
                });
            }
        }else{
            page.initPage("login", {}, 1);
        }
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

        // 刷新
        $(".refresh").on(pageEvent.touchStart, function (e) {
            pageEvent.handleTapEvent(this, this, pageEvent.activate, e);
            return true;
        });

        $(".refresh").on(pageEvent.activate, function (e) {
            // 显示遮住层
            util.showCover();
            util.showLoading();
            getBalance();

        });

        $("#abcChargeMode li").on(pageEvent.touchStart, function (e) {
            pageEvent.handleTapEvent(this, this, pageEvent.activate, e);
            return true;
        });

        $("#abcChargeMode li").on(pageEvent.activate, function (e) {
            var href = $(this).find("a").attr("id");
            switch (href) {
                case "kcodepay":
                    page.initPage("user/abckcodecharge", {}, 1);
                    break;
                case "mobilepay":
                    page.initPage("user/abcmobilecharge", {}, 1);
                    break;
            }
            return true;
        });



    };

    return {init:init};
});
