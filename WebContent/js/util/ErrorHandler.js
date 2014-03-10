/**
 * Error Handler Service
 */
define([
    "util/Page",
    "util/AppConfig",
    "util/Util",
    "services/AccountService",
], function (page, appConfig, util, accountService) {

    /**
     * 错误处理
     * @param data
     * @return {*}
     */
    var handler = function (data) {

        if (data.statusCode == "0008") {
            // 余额不足
            util.prompt("", "账号余额不足，请充值后重试", "去充值", "取消",
                function (e) {
                    page.initPage("user/abccharge", {}, 1);
                },
                function (e) {
                }
            );
        } else if (data.statusCode == "0007") {
            // 用户信息不完善
            util.prompt("", "用户信息不完善,请完善资料", "去完善", "取消",
                function (e) {
                    page.initPage("user/authenticate", {}, 1);
                },
                function (e) {
                }
            );
        } else if (data.statusCode == "off") {
            // 尚未登录，弹出提示框
            util.prompt("", "您还未登录，请先登录", "登录", "取消",
                function (e) {
                    page.initPage("login", {}, 1);
                },
                function (e) {
                }
            );
        } else {
            util.toast(data.errorMsg);
        }
    };

    return {
        handler:handler
    };
});