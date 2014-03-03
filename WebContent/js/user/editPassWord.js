/**
 * 修改密码
 */
define([
    "text!../../views/user/editPassWord.html",
    "util/Page",
    "util/PageEvent",
    "util/AppConfig",
    "services/PersonService",
    "util/Util",
    "util/Md5"
], function (template, page, pageEvent, appConfig, personService, util) {

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

        // 绑定事件
        bindEvent();

        // 处理返回
        page.setHistoryState({url: "user/editPassWord", data: params},"user/editPassWord","#user/editPassWord" + (JSON.stringify(params).length > 2 ? "?data=" + encodeURIComponent(JSON.stringify(params)) : ""),forward ? 1 : 0);

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

        //修改密码.
        $("#editPassword").on(pageEvent.touchStart, function (e) {
            pageEvent.handleTapEvent(this, this, pageEvent.activate, e);
            return false;
        });

        $("#editPassword").on(pageEvent.activate, function (e) {
            var oldPassword = $("#oldPassword").val(),
                newPassword = $("#newPassword").val(),
                confirmNewPassword = $("#confirmNewPassword").val();
            if ($.trim(oldPassword) == "" || oldPassword == null||oldPassword=="原登录密码") {
                util.toast("请输入原登录密码");
                return false;
            }
            if ($.trim(newPassword) == "" || newPassword == null||newPassword=="新登录密码") {
                util.toast("请输新录密码");
                return false;
            } else if (newPassword.length <= 5) {
                util.toast("新密码长度不能少于6位");
                return false;
            }
            if ($.trim(confirmNewPassword) == "" || confirmNewPassword == null||confirmNewPassword=="确认新密码") {
                util.toast("请确认新密码");
                return false;
            } else if (confirmNewPassword.length <= 5) {
                util.toast("确认密码长度不能少于6位");
                return false;
            }
            if (newPassword != confirmNewPassword) {
                util.toast("新密码必须与确认密码一致");
                return false;
            }
            //身份认证_查询.
            var loginData = appConfig.getLocalUserInfo();
            if (loginData != null) {
                var userId = loginData.userId;
                var userKey = loginData.userKey;
                personService.editLoginPassword(userId, userKey, oldPassword, newPassword, function (data) {
                    if (typeof data != "undefined") {
                        if (data.statusCode == "0") {

                            var loginData = appConfig.getLocalUserInfo();

                            // wap 跳转参数
                            loginData.wapKey = hex_md5(loginData.userName + $.trim($("#newPassword").val())).substr(8,16);

                            // 保存登录成功信息
                            appConfig.setLocalUserInfo(loginData);

                            util.toast("修改密码成功");
                            page.goBack();
                        } else {
                            util.toast(data.errorMsg);
                        }
                    } else {
                        util.toast("修改密码失败");
                    }
                });
            } else {
                page.initPage("login", {}, 1);
            }
            return true;
        });
    };

    return {init: init};
});



