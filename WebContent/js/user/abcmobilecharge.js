/**
 * K码支付
 */
define([
    "text!../../views/user/abcmobilecharge.html",
    "util/Page",
    "util/PageEvent",
    "util/AppConfig",
    "services/PersonService",
    "util/Util"
], function (template, page, pageEvent, appConfig, personService, util) {

    var userInfo = null;
    /**
     * 初始化
     */
    var init = function (data, forward) {

        // 加载模板内容
        $("#container").empty().append($(template));

        // 参数设置
        var params = {};
        var tkn = appConfig.checkLogin(data);
        if (tkn) {
            params.token = tkn;
        }

        userInfo = appConfig.getLocalUserInfo();

        // 绑定事件
        bindEvent();

        // 处理返回
        page.setHistoryState({url: "user/abcmobilecharge", data: params},
            "user/abcmobilecharge",
            "#user/abcmobilecharge" + (JSON.stringify(params).length > 2 ? "?data=" + encodeURIComponent(JSON.stringify(params)) : ""),
            forward ? 1 : 0);

        // 隐藏加载标示
        util.hideLoading();
    };

    /**
     * 绑定事件
     */
    var bindEvent = function () {

        // 返回
        $(".back").on(pageEvent.touchStart, function (e) {
            pageEvent.handleTapEvent(this, this, pageEvent.activate, e);
            return false;
        });

        $(".back").on(pageEvent.activate, function (e) {
            page.goBack();
        });

        $("#abcMobileCharge").on(pageEvent.touchStart, function (e) {
            pageEvent.handleTapEvent(this, this, pageEvent.activate, e);
            return false;
        });

        $("#abcMobileCharge").on(pageEvent.activate, function (e) {
            checkInputAndRequest();
            return true;
        });
    };

    /**
     * 输入校验
     * @returns {boolean}
     */
    var checkInputAndRequest = function () {
        var mobileChargeMoney = $("#mobileChargeMoney").val().trim();
        var pattern = /^[1-9]\d*$/;
        if (null == mobileChargeMoney || "" == mobileChargeMoney) {
            util.toast("请输入充值金额(元)");
            return false;
        } else if (isNaN(mobileChargeMoney) || !pattern.test(mobileChargeMoney)) {
            util.toast("请输入充值金额(整数)");
            return false;
        }

        if (null != userInfo && "" != userInfo.userId) {
            // 显示遮住层
            util.showCover();
            util.showLoading();

            personService.abcMobilePay(userInfo.userId, mobileChargeMoney, function (data) {

            //隐藏遮盖层
            util.hideCover();
            util.hideLoading();

                if (typeof data != "undefined" && null != data) {
                    if (data.statusCode == "0") {
                        $("#mobilecharge").attr("target", "_parent").attr("href", data.result).trigger("click");
                    } else {
                        util.toast(data.errorMsg);
                    }
                } else {
                    util.toast("系统错误,请重试");
                }
            });
        } else {
            page.initPage("login", {}, 1);
        }

    };
    return {init: init};
});

