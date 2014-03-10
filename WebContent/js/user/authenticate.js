/**
 *身份验证
 */

define([
    "text!../../views/user/authenticate.html",
    "util/Page",
    "util/PageEvent",
    "util/AppConfig",
    "util/Util",
    "services/PersonService"
], function (template, page, pageEvent, appConfig, util, personService) {

    var loginData = null;
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

        loginData = appConfig.getLocalJson(appConfig.keyMap.LOCAL_USER_INFO_KEY);

        //初始化显示
        initShow();

        // 绑定事件
        bindEvent();

        // 处理返回
        page.setHistoryState({url: "user/authenticate", data: params}, "user/authenticate", "#user/authenticate" + (JSON.stringify(params).length > 2 ? "?data=" + encodeURIComponent(JSON.stringify(params)) : ""), forward ? 1 : 0);

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

        //身份验证_绑定.
        $("#bindCardID").on(pageEvent.touchStart, function (e) {
            pageEvent.handleTapEvent(this, this, pageEvent.activate, e);
            return false;
        });

        $("#bindCardID").on(pageEvent.activate, function (e) {
            goTOBindIDCard();
            return true;
        });
    };
    /**
     * 初始化显示,查询身份证是否认证.
     */
    var initShow = function () {

        // 显示遮住层
        util.showCover();
        util.showLoading();

        if (loginData != null) {
            var userId = loginData.userId;
            var userKey = loginData.userKey;
            if ("" != userId && "" != userKey) {
                personService.inspectUserIDCardState(userId, userKey, function (data) {

                    //隐藏遮盖层
                    util.hideCover();
                    util.hideLoading();

                    if (data != "undefined") {
                        if (data.statusCode == "0") {
                            var idCardName = data.name, idCode = data.personCardId;
                            if ("" != idCardName && idCardName.length >= 2) {
                                var displayName = idCardName.substring(0, 1) + "***";
                                $("#idCardName").val(displayName).attr("readonly", true);
                            }
                            if ("" != idCode && idCode.length >= 13) {
                                var displayCode = idCode.substring(0, 12) + "******";
                                $("#idCode").val(displayCode).attr("readonly", true);
                            }
                            appConfig.setLocalString(appConfig.keyMap.LOCAL_USER_TRUE_NAME_KEY, idCardName);
                            $("#bindCardID")
                                .off(pageEvent.active)
                                .html("返回")
                                .on(pageEvent.click, function () {
                                    page.goBack();
                                });
                        } else {
                            fillText();
                        }
                    } else {
                        fillText();
                        util.toast("系统错误,请稍后重试");
                        page.initPage("user/person", {}, 1);
                    }
                });
            } else {
                page.initPage("user/person", {}, 1);
            }
        } else {
            page.initPage("login", {}, 1);
        }

    };

    var fillText = function () {
        $("#idCardName").attr("placeholder", "真实姓名");
        $("#idCode").attr("placeholder", "身份证号");
        $("#bindCardID").html("立即认证");
    };

    var goTOBindIDCard = function () {
        var idCardName = $("#idCardName").val().trim(), idCode = $("#idCode").val().trim();
        if (idCardName == "" || idCardName == "真实姓名") {
            util.toast("真实姓名不能为空");
            return false;
        } else if (!idCardName.match(/^[\u4E00-\u9FA5a-zA-Z0-9_]{2,10}$/)) {
            util.toast("真实姓名输入有误,请重试");
            return false;
        }
        var isIDCard1 = "[1-9]\\d{5}[1-9]\\d{3}((0\\d)|(1[0-2]))(([0|1|2]\\d)|3[0-1])\\d{3}(\\d|x|X)$";
        if (idCode == "" || idCode == "身份证号") {
            util.toast("身份证号码不能为空");
            return false;
        } else if (!idCode.match(isIDCard1)) {
            util.toast("身份证号码不正确");
            return false;
        }
        if (loginData != null) {
            var userId = loginData.userId;
            var userKey = loginData.userKey;
            if (userId != "" && userKey != "") {
                personService.bindIDCard(idCode, idCardName, userId, userKey, function (data) {
                    if (data != "undefined") {
                        if (data.statusCode == "0") {
                            util.toast("绑定成功");
                            appConfig.setLocalString(appConfig.keyMap.LOCAL_USER_TRUE_NAME_KEY, idCardName);
                            page.goBack();
                        } else {
                            util.toast(data.errorMsg);
                        }
                    } else {
                        //接口返回失败.
                        util.toast("登录失败");
                        page.initPage("user/person", {}, 1);
                    }
                });
            }
        }
    };
    return {init: init};
});
