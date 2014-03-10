/**
 * 注册
 */
define([
    "text!../views/register.html",
    "util/Page",
    "util/PageEvent",
    "util/AppConfig",
    "util/Util",
    "services/AccountService",
    "util/Md5"
], function (template, page, pageEvent, appConfig, util, accountService) {

    /**
     * 初始化
     */
    var init = function (data, forward) {

        // 加载模板内容
        $("#container").empty().append($(template));

        // 绑定事件
        bindEvent();

        // 处理返回
        page.setHistoryState({url:"register", data:{}},
            "register",
            "#register",
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
            return true;
        });

        $(".back").on(pageEvent.activate, function (e) {
            page.goBack();
            return true;
        });

        // 进行注册
        $(".loginBtn").on(pageEvent.touchStart, function (e) {
            pageEvent.handleTapEvent(this, this, pageEvent.activate, e);
            return true;
        });

        $(".loginBtn").on(pageEvent.activate, function (e) {
            var regNameVal = $("#regName").val(), regPwdVal = $("#regPwd").val();
            var regSurePwdVal = $("#regSurePwd").val(), regPhone = $("#regPhone").val();
            if ($.trim(regNameVal) == "") {
                util.toast("用户名不能为空");
                return false;
            }

            if ($.trim(regNameVal).length < 4 || $.trim(regNameVal).length > 50) {
                util.toast("用户名长度为4~50位字符");
                return false;
            }

            if ($.trim(regPwdVal) == "") {
                util.toast("密码不能为空");
                return false;
            }

            if ($.trim(regPwdVal).length < 6 || $.trim(regPwdVal).length > 15) {
                util.toast("密码长度为6~15位字符");
                return false;
            }

            if ($.trim(regSurePwdVal) == "") {
                util.toast("确认密码不能为空");
                return false;
            }

            if ($.trim(regPwdVal) != $.trim(regSurePwdVal)) {
                util.toast("确认密码与密码不一致");
                return false;
            }

            /*if ($.trim(regPhone) == "") {
             util.toast("电话号码不能为空");
             return false;
             }

             if (!util.isMobile($.trim(regPhone))) {
             util.toast("电话号码不正确");
             return false;
             }*/

            // 进行注册请求
            accountService.goRegister($.trim(regNameVal), $.trim(regPwdVal), "", function (data) {
                console.log(JSON.stringify(data));
                if (typeof data != "undefined") {
                    if (typeof data.statusCode != "undefined") {
                        if (data.statusCode == "0") {

                            // 登录token
                            appConfig.token = new Date().getTime() + "";

                            data.token = appConfig.token;

                            // wap 跳转参数
                            data.wapKey = hex_md5(data.userName + $.trim($("#regPwd").val())).substr(8, 16);

                            // 保存登录成功信息
                            appConfig.setLocalJson(appConfig.keyMap.LOCAL_USER_INFO_KEY, data);

                            util.toast("注册成功");
                            page.go(-2);
                        } else {
                            util.toast(data.errorMsg);
                        }
                    } else {
                        util.toast("注册失败");
                    }
                } else {
                    util.toast("注册失败");
                }
            });
            return false;
        });
    };

    return {init:init};
});
