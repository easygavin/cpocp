/**
 * 登录
 */
define([
    "text!../views/login.html",
    "util/Page",
	"util/PageEvent",
    "util/AppConfig",
	"util/Util",
    "services/AccountService",
    "util/Md5"
], function(template, page, pageEvent, appConfig, util, accountService) {

    // 处理返回参数
    var canBack = 0;

    /**
     * 初始化
     */
    var init = function(data, forward) {
        canBack = forward ? 1 : 0;

        // 加载模板内容
        $("#container").empty().append($(template));

        // 绑定事件
        bindEvent();

        // 处理返回
        page.setHistoryState({url: "login", data:{}}, 
        		"login", 
        		"#login",
                canBack);

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
            if (canBack) {
                page.goBack();
            } else {
                page.initPage("home", {}, 0);
            }
            return true;
        });

        // 去注册
        $("#goReg").on(pageEvent.touchStart, function(e) {
            pageEvent.handleTapEvent(this, this, pageEvent.activate, e);
            return true;
        });

        $("#goReg").on(pageEvent.activate, function(e) {
            page.initPage("register", {}, 1);
        });

        // 登录
        $(".loginBtn").on(pageEvent.touchStart, function(e) {
            pageEvent.handleTapEvent(this, this, pageEvent.activate, e);
            return true;
        });

        $(".loginBtn").on(pageEvent.activate, function(e) {
            var nameVal = $("#loginName").val(), passwordVal = $("#loginPwd").val();
            if ($.trim(nameVal) == "") {
                util.toast("用户名不能为空");
                return false;
            }

            if ($.trim(passwordVal) == "") {
                util.toast("密码不能为空");
                return false;
            }

            // 保存登录名
            appConfig.setLocalUserName($.trim(nameVal));

            // 进行登录请求
            accountService.goLogin($.trim(nameVal), $.trim(passwordVal), function(data) {
            	console.log(JSON.stringify(data));
                if (typeof data != "undefined" ) {
                    if (typeof data.statusCode != "undefined") {
                        if (data.statusCode == "0") {

                            // 登录token
                            appConfig.token = new Date().getTime() + "";

							data.token = appConfig.token;

                            // wap 跳转参数
                            data.wapKey = hex_md5(data.userName + $.trim($("#loginPwd").val())).substr(8,16);

                            // 保存登录成功信息
                            appConfig.setLocalUserInfo(data);
                            util.toast("登录成功");
                            if (canBack) {
                                page.goBack();
                            } else {
                                page.initPage("home", {}, 0);
                            }
                        } else {
                            util.toast(data.errorMsg);
                        }
                    } else {
                        util.toast("登录失败");
                    }
                } else {
                    util.toast("登录失败");
                }
            });
            return true;
        });
    };

    return {init:init};
});
