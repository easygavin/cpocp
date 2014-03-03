/**
 * K码支付
 */
define([
    "text!../../views/user/abckcodecharge.html",
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
        page.setHistoryState({url: "user/abckcodecharge", data: params},
            "user/abckcodecharge",
            "#user/abckcodecharge" + (JSON.stringify(params).length > 2 ? "?data=" + encodeURIComponent(JSON.stringify(params)) : ""),
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

        $("#abccodecharge").on(pageEvent.touchStart, function (e) {
            pageEvent.handleTapEvent(this, this, pageEvent.activate, e);
            return false;
        });

        $("#abccodecharge").on(pageEvent.activate, function (e) {
            checkInputAndRequest();
            return true;
        });

    };

    /**
     * 输入校验
     * @returns {boolean}
     */
    var checkInputAndRequest = function () {
        var cellPhoneNumber = $("#cellPhoneNumber").val().trim();
        var bankCardSlice = $("#bankCardSlice").val().trim();
        var abcChargeMoney = $("#abcChargeMoney").val().trim();
        var pattern = /^[1-9]\d*$/;
        if (null == cellPhoneNumber || "" == cellPhoneNumber) {
            util.toast("请输入手机号码");
            return false;
        } else if (isNaN(cellPhoneNumber) || cellPhoneNumber.length != 11 || !pattern.test(cellPhoneNumber)) {
            util.toast("请输入正确的手机号码");
            return false;
        }

        if (null == bankCardSlice || "" == bankCardSlice) {
            util.toast("请输入银行卡后四位");
            return false;
        } else if (isNaN(bankCardSlice) || bankCardSlice.length != 4 || !pattern.test(bankCardSlice)) {
            util.toast("请输入正确的卡号(后四位)");
            return false;
        }

        if (null == abcChargeMoney || "" == abcChargeMoney) {
            util.toast("请输入充值金额(元)");
            return false;
        } else if (isNaN(abcChargeMoney) || !pattern.test(abcChargeMoney)) {
            util.toast("请输入充值金额(整数)");
            return false;
        }

        if (null != userInfo && "" != userInfo.userId) {
            personService.abcKcodePay(abcChargeMoney, userInfo.userId, cellPhoneNumber, bankCardSlice, function (data) {
                if (typeof data != "undefined" && data != null) {
                    if (data.statusCode == "0000") {
                        util.prompt(
                            "充值成功",
                            "充值成功",
                            "立即去购彩",
                            "确定",
                            function (e) {
                                page.initPage("home", {}, 1);
                            },
                            function (e) {
                                page.goBack();
                            }
                        );
                    } else {
                        util.toast(data.errorMsg);
                    }
                } else {
                    util.toast("系统错误,请稍候重试");
                }
            });
        } else {
            page.initPage("login", {}, 1);
        }

    };

    /**
     * call charge interface
     */

    return {init: init};
});

