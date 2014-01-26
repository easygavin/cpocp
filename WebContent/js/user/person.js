/**
 * 个人中心
 */
define([
    "text!../../views/user/person.html",
    "util/Page",
    "util/PageEvent",
    "util/AppConfig",
    "services/PersonService",
    "util/Util"
], function (template, page, pageEvent, appConfig, personService, util) {
        // 处理返回参数
        var canBack = 0;

        var userInfo = null;
        /**
         * 初始化
         */
        var init = function (data, forward) {
            canBack = forward ? 1 : 0;

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

            // 初始化显示
            initShow();

            // 处理返回
            page.setHistoryState({url: "user/person", data: params},
                "user/person",
                "#user/person" + (JSON.stringify(params).length > 2 ? "?data=" + encodeURIComponent(JSON.stringify(params)) : ""),
                canBack);

        };

        /**
         * 初始化显示
         */
        var initShow = function () {

            userInfo = appConfig.getLocalUserInfo();

            initHideShow();

            // 防止事件污染
            offBind();

            // 获取账号余额
            getBalance();
        };

        /**
         * 授权登录不显示项
         */
        var initHideShow = function () {

            if (userInfo.code != null && typeof userInfo.code != "undefined"
                && $.trim(userInfo.code) != "") {
                $("#editPassWord").closest("li").hide();
                $("#logoutSys").closest("li").hide();
            }
        };

        /**
         * 获取账号余额
         */
        var getBalance = function () {
            //加载页获取账户名跟可用余额.
            var requestType = 0;
            if (null != userInfo) {
                var userId = userInfo.userId;
                var userKey = userInfo.userKey;
                if ("" != userId && "" != userKey) {
                    personService.getUserBalance(requestType, userId, userKey, function (data) {

                        // 隐藏遮住层
                        util.hideCover();
                        util.hideLoading();

                        if ("undefined" != data) {
                            if (data.statusCode == "0") {
                                var trueName = userInfo.userName;
                                var userBalance = new Number(data.userBalance);
                                if ("" != trueName) {
                                    $("#p_userName").html(userInfo.userName);
                                    $("#p_balance").html(parseInt(userBalance) > 0 ? userBalance.toFixed(2) : 0);
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
            }
        };

        /**
         * 绑定事件
         */
        var bindEvent = function () {

            // 返回
            $(".back").on(pageEvent.touchStart, function (e) {
                pageEvent.handleTapEvent(this, this, pageEvent.activate, e);
                return true;
            });

            $(".back").on(pageEvent.activate, function (e) {
                if (canBack) {
                    page.goBack();
                } else {
                    page.initPage("home", {}, 1);
                }
                return true;

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

            // 菜单点击
            $("#operateMoney li").on(pageEvent.touchStart, function (e) {
                pageEvent.handleTapEvent(this, this, pageEvent.activate, e);
                return true;
            });
            //充值,提款
            $("#operateMoney li").on(pageEvent.activate, function (e) {
                var href = $(this).find("a").attr("id");
                switch (href) {
                    case "charge":
                        var charge_url = "user/abccharge";
                        page.initPage(charge_url, {}, 1);
                        break;
                    case "withdrawal":
                        var withdrawal_url = "user/withdrawal";
                        bindBankCardState(withdrawal_url);
                        break;
                }
                return true;
            });

            //列表点击.

            $("#personDetail li").on(pageEvent.touchStart, function (e) {
                pageEvent.handleTapEvent(this, this, pageEvent.activate, e);
                return true;
            });

            $("#personDetail li").on(pageEvent.activate, function (e) {
                var href = $(this).find("a").attr("id");
                switch (href) {
                    case "accountDetail":
                        page.initPage("user/accountDetail", {}, 1);
                        break;
                    case "buyRecord":
                        page.initPage("user/buyRecord", {}, 1);
                        break;
                    case "authenticate":
                        page.initPage("user/authenticate", {}, 1);
                        break;
                    case "bindCard":
                        var url = "user/bindCard";
                        queryAuthenticateSate(url);
                        break;
                    case "bindMobile":
                        page.initPage("user/bindMobile", {}, 1);
                        break;
                    case "editPassWord":
                        page.initPage("user/editPassWord", {}, 1);
                        break;
                    case "logoutSys":
                        // 清除本地用户信息
                        appConfig.clearLocalUserInfo();
                        personService.logout(userInfo.userId, userInfo.userKey);
                        if (canBack) {
                            page.goBack();
                        } else {
                            page.initPage("home", {}, 1);
                        }
                        break;
                }
                return true;
            });

        };

        /**
         * 查询是否身份认证
         */
        var queryAuthenticateSate = function (url) {

            // 显示遮住层
            util.showCover();
            util.showLoading();

            if (null != userInfo) {
                var userId = userInfo.userId;
                var userKey = userInfo.userKey;
                personService.inspectUserIDCardState(userId, userKey, function (data) {

                    //隐藏遮盖层
                    util.hideCover();
                    util.hideLoading();

                    if ("undefined" != data) {
                        if (data.statusCode == "0") {
                            //已经绑定
                            appConfig.setLocalUserTrueName(data.name);
                            //查询是否绑定银行卡
                            personService.getUserBalance(1, userInfo.userId, userInfo.userKey, function (data) {
                                if (typeof data != "undefined") {
                                    //已绑定.
                                    if (data.statusCode == "0") {
                                        //存储用户信息
                                        appConfig.setLocalUserExternalInfo(data);
                                    }
                                    page.initPage(url, {}, 1);
                                } else {
                                    util.toast("系统错误,请稍后重试");
                                }
                            });

                        } else {
                            util.toast(data.errorMsg);
                        }
                    } else {
                        util.toast("系统错误,请重试!");
                    }
                });
            } else {
                page.initPage("login", {}, 1);
            }
        };

        /**
         *查询是否绑定银行卡.
         */
        var bindBankCardState = function (url) {
            //查询是否绑定.
            personService.getUserBalance(1, userInfo.userId, userInfo.userKey, function (data) {
                if (typeof data != "undefined") {
                    if (data.statusCode == "0") {
                        //初始化页面数据
                        appConfig.setLocalUserExternalInfo(data);
                        page.initPage(url, {}, 1);
                    } else if (data.statusCode == "0007") {
                        //0007尚未绑定身份证.
                        util.toast("您尚未进行身份验证");
                    } else {
                        util.toast(data.errorMsg);
                    }
                }
            });
        };

        /**
         * 解除绑定
         */
        var offBind = function () {
            $(window).off("scroll");
        };

        return {init: init};
    }
)
;
