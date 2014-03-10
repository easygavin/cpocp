/**
 * 绑定手机号
 */
define([
    "text!../../views/user/bindMobile.html",
    "util/Page",
    "util/PageEvent",
    "util/AppConfig",
    "util/Util",
    "services/PersonService"
], function (template, page, pageEvent, appConfig, util, personService) {

    // 倒计时秒数
    var seconds = 0;

    //保存已绑定状态
    var storageBindMobile = "STORAGE_BIND_MOBILE";
    // 定时器
    var secondsTimer = null;

    var userInfo=null;
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

        userInfo = appConfig.getLocalJson(appConfig.keyMap.LOCAL_USER_INFO_KEY);

        // 绑定事件
        bindEvent();

        //初始化显示
        initQuery();

        // 处理返回
        page.setHistoryState({url: "user/bindMobile", data: params}, "user/bindMobile", "#user/bindMobile" + (JSON.stringify(params).length > 2 ? "?data=" + encodeURIComponent(JSON.stringify(params)) : ""), forward ? 1 : 0);

        // 隐藏加载标示
        util.hideLoading();
    };

    /**
     * 初始化查询是否绑定手机
     */
    var initQuery = function () {
        if (null != userInfo && "" != userInfo) {
            var mobileNo = userInfo.userMobile;
            if (null != mobileNo && "" != mobileNo) {
                $("#telephoneNumber").val("您已绑定手机号码").attr("disabled", true);
                if (null != mobileNo && "" != mobileNo && mobileNo.length >= 11) {
                    var displayNo = mobileNo.substr(0, 3) + "****" + mobileNo.substr(7, mobileNo.length);
                    //显示绑定号码,隐藏发送验证码按钮.
                    $("#captcha").val(displayNo).attr("disabled", true);
                    //$("#verificate").hide();
                    $(".inputList .loginBox ul li:eq(0)").hide();
                    $("#bindTeleNumber").off(pageEvent.active).html("返回").on(pageEvent.click, function () {
                        page.goBack();
                    });
                }
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
            return false;
        });

        $(".back").on(pageEvent.activate, function (e) {
            page.goBack();
        });

        //发送验证码
        $("#verificate").on(pageEvent.touchStart, function (e) {
            pageEvent.handleTapEvent(this, this, pageEvent.activate, e);
            return false;
        });

        $("#verificate").on(pageEvent.activate, function (e) {
            if (secondsTimer != null) {
                return false;
            } else {
                toVerification();
            }
            return true;
        });

        //确认绑定
        $("#bindTeleNumber").on(pageEvent.touchStart, function (e) {
            pageEvent.handleTapEvent(this, this, pageEvent.activate, e);
            return false;
        });

        $("#bindTeleNumber").on(pageEvent.activate, function (e) {
            /*if (secondsTimer != null) {
                return false;
            } else {*/
                bindTelephoneNumber();
           // }
            return true;
        });
    };

    /**
     * 发送验证码
     */
    var toVerification = function () {
        var telephoneNumber = $("#telephoneNumber").val().trim();
        var reg = new RegExp("^[0-9]*$");
        if (null == telephoneNumber || "" == telephoneNumber || telephoneNumber.length < 11) {
            util.toast("请输入有效的手机号码");
            return false;
        } else if (!reg.test(telephoneNumber)) {
            util.toast("请输入有效的手机号码");
            return false;
        }
        if (userInfo != null && "" != userInfo) {
            //发送验证码请求.
            var userKey = userInfo.userKey;
            var userId = userInfo.userId;
            personService.sendCaptcha(userKey, telephoneNumber, userId, function (data) {
                if (typeof data != "undefined") {
                    if (data.statusCode == "0") {
                        util.toast("验证码发送成功");
                        seconds = 60;
                        //倒计时60秒
                        countSec();
                    } else {
                        util.toast(data.errorMsg);
                    }
                } else {
                    util.toast("验证码发送失败");
                }
            });
        } else {
            page.initPage("login", {}, 1);
        }

    };

    /**
     *绑定手机号
     */
    var bindTelephoneNumber = function () {
        var captcha = $("#captcha").val().trim();
        if (null == captcha || "" == captcha) {
            util.toast("请输入有效的验证码");
            return false;
        } else if (isNaN(captcha)) {
            util.toast("请输入有效的6位验证码");
            return false;
        }

        var telephoneNumber = $("#telephoneNumber").val().trim();
        var reg = new RegExp("^[0-9]*$");
        if (null == telephoneNumber || "" == telephoneNumber || telephoneNumber.length < 11) {
            util.toast("请输入有效的手机号码");
            return false;
        } else if (!reg.test(telephoneNumber)) {
            util.toast("请输入有效的手机号码");
            return false;
        }
        if (null != userInfo && "" != userInfo) {
            personService.bindMobileNo(telephoneNumber, userInfo.userId, userInfo.userKey, captcha, function (data) {
                if (typeof data != "undefined") {
                    if (data.statusCode == "0") {
                        userInfo.userMobile = telephoneNumber;
                        appConfig.setLocalJson(appConfig.keyMap.LOCAL_USER_INFO_KEY, userInfo);
                        util.toast("手机绑定成功");
                        page.goBack();
                    } else {
                        util.toast(data.errorMsg);
                    }
                } else {
                    util.toast("系统错误,请稍后再重试");
                    page.goBack();
                }
            });
        } else {
            page.initPage("login", {}, 1);
        }
    };

    /**
     * 短信定时器(60s)
     */
    var countSec = function () {
        if (seconds-- > 0) {
            $("#verificate").html("剩余:" + seconds + "秒");
            clearTimeout(secondsTimer);
            secondsTimer = setTimeout(function () {
                countSec();
            }, 1000);

        } else {
            secondsTimer = null;
            clearTimeout(secondsTimer);
            $("#verificate").html("我要验证");
        }
    };
    return {init: init};
});

