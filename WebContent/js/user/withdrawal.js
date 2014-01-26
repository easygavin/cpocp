/**
 * 提款
 */
define([
    "text!../../views/user/withdrawal.html",
    "util/Page",
    "util/PageEvent",
    "util/AppConfig",
    "services/PersonService",
    "util/Util"
], function (template, page, pageEvent, appConfig, personService, util) {
    var reduce = 0;  //提款之前的可提取金额
    var userBankInfo = {};
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

        //初始化查询可提款金额
        initShow();
        // 绑定事件
        bindEvent();

        // 处理返回
        page.setHistoryState({url: "user/withdrawal", data: params}, "user/withdrawal", "#user/withdrawal" + (JSON.stringify(params).length > 2 ? "?data=" + encodeURIComponent(JSON.stringify(params)) : ""), forward ? 1 : 0);

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

        //提款须知
        $("#withdrawalNotes").on(pageEvent.touchStart, function (e) {
            pageEvent.handleTapEvent(this, this, pageEvent.activate, e);
            return false;
        });

        $("#withdrawalNotes").on(pageEvent.activate, function (e) {
            page.initPage("user/withdrawalNotes", {}, 1);
            return true;
        });

        //确认提款
        $("#confirmwithdrawal").on(pageEvent.touchStart, function (e) {
            pageEvent.handleTapEvent(this, this, pageEvent.activate, e);
            return false;
        });

        $("#confirmwithdrawal").on(pageEvent.activate, function (e) {
            withDrawl();
            return true;
        });
    };
    /**
     * 初始化显示
     */
    var initShow = function () {
        // 获取账号余额
        getBalance();
    };
    /**
     * 提款
     */
    var withDrawl = function () {
        if (null != userBankInfo && null != userBankInfo.availMoney) {
            var availMoney = parseInt(userBankInfo.availMoney);
            var withDrawlMoney = $("#withDrawlMoney").val();
            var drawPassword = $("#drawPassword").val();
            /* var kcodeTeleNumber = $("#kcodeTeleNumber").val();
             if (kcodeTeleNumber == null || "" == kcodeTeleNumber || isNaN(kcodeTeleNumber)) {
             util.toast("请输入有效的手机号");
             return false;
             }*/
            if (availMoney < 10) {
                util.toast("您的可提款金额小于10元");
                return false;
            }
            if (withDrawlMoney < 10) {
                util.toast("提款金额最少10元");
                return false;
            } else if (isNaN(withDrawlMoney)) {
                util.toast("取款金额必须为正整数");
                return false;
            }
            if (null == drawPassword || "" == drawPassword) {
                util.toast("请输入提款密码");
                return false;
            }
            // 发送请求.
            personService.withdrawal(userInfo.userId, userInfo.userKey, userInfo.userName, withDrawlMoney, drawPassword, function (data) {
                if (typeof data != "undefined") {
                    if (data.statusCode == "0") {
                        var afterWithdrawal = reduce - parseFloat(withDrawlMoney); //充值之后的可提款显示
                        var afterBalance = parseFloat(data.userBalance);            //充值之后的可用余额显示
                        if (afterBalance > 0) {
                            $("#w_balance").html(afterBalance > 0 ? afterBalance.toFixed(2) : 0);
                        } else {
                            $("#afterBalance").html(afterBalance > 0 ? afterBalance.toFixed(2) : 0);
                        }

                        if (afterWithdrawal > 0) {
                            $("#w_availMoney").val("可提款金额:" + afterWithdrawal.toFixed(2) + "元");
                        } else {
                            $("#w_availMoney").val("可提款金额:0 元");
                        }
                        //提款成功.更新可用金额显示.
                        util.prompt(
                            "提款成功",
                            "提款申请成功，经审核无误款项将在三个工作日内汇进您的指定账户",
                            "返回个人中心",
                            "确定",
                            function (e) {
                                page.initPage("user/person", {}, 0);
                            },
                            function (e) {
                                page.initPage("user/withdrawal", {}, 0);
                            }
                        );
                    } else {
                        util.toast(data.errorMsg);
                    }
                } else {
                    util.toast("系统错误请稍后重试");
                }
            });
        }
    };
    var getBalance = function () {
        //加载页获取账户名跟可用余额.
        var requestType = 1;
        if (userInfo != null) {
            var userId = userInfo.userId;
            var userKey = userInfo.userKey;
            if (userId != "" && userKey != "") {
                personService.getUserBalance(requestType, userId, userKey, function (data) {
                    if (typeof  data != "undefined") {
                        if (data.statusCode == "0") {
                            userBankInfo = data;
                            reduce = parseFloat(data.availMoney); //可提款金额
                            var userBalance = parseFloat(data.userBalance);   //可用金额
                            $("#w_userName").html(userInfo.userName);
                            $("#w_balance").html(userBalance > 0 ? userBalance.toFixed(2) : 0);
                            $("#w_trueName").val("真实姓名:" + data.name.substring(0, 1) + "***");
                            if (reduce > 0) {
                                $("#w_availMoney").val("可提款金额:" + reduce.toFixed(2) + "元");
                            } else {
                                $("#w_availMoney").val("可提款金额:0元");
                            }
                            $("#w_bankInfo").val("开户银行:" + data.bankInfo);
                            if ((data.cardNo).length > 10) {
                                $("#w_cardNo").val("银行卡号:" + (data.cardNo).substring(0, 9) + "*****");
                            } else {
                                $("#w_cardNo").val("银行卡号:" + data.cardNo);
                            }
                        } else if (data.statusCode == "0007") {
                            util.toast(data.errorMsg);
                            page.initPage("user/person", {}, 1);
                        } else {
                            util.toast(data.errorMsg);
                        }
                    } else {
                        //接口返回数据失败.
                        util.toast("获取余额失败");
                    }
                });
            }
        } else {
            page.initPage("login", {}, 1);
        }
    };
    return {init: init};
});
