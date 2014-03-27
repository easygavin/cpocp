/**
 * 账号服务
 */
define([
    "util/RequestConfig",
    "util/Md5"
], function (requestConfig) {

    /**
     * 登录
     * @param name
     * @param password
     * @param callback
     */
    var goLogin = function (name, password, callback) {

        // 请求参数
        var data = {
            "platform":requestConfig.request.platform,
            "channelNo":requestConfig.request.channelNo,
            "username":encodeURIComponent(name),
            "changedPassword":hex_md5(password).substr(8, 16)
        };

        // 请求登录
        $.ajax({
            type:"GET",
            url:requestConfig.request.USER_LOGIN,
            data:{data:JSON.stringify(data)},
            dataType:"jsonp",
            success:callback,
            error:callback
        });
    };

    /**
     * 注册
     * @param name
     * @param password
     * @param phone
     * @param callback
     */
    var goRegister = function (name, password, phone, callback) {

        // 请求参数
        var data = {
            "platform":requestConfig.request.platform,
            "channelNo":requestConfig.request.channelNo,
            "cellphoneType":requestConfig.request.cellphoneType,
            "simCd":requestConfig.request.simCd,
            "imei":requestConfig.request.imei,
            "macAddr":requestConfig.request.macAddr,
            "resolution":requestConfig.request.resolution,
            "mobileNo":phone,
            "username":encodeURIComponent(name),
            "password":hex_md5(password).substr(8, 16)
        };

        // 请求登录
        $.ajax({
            type:"GET",
            url:requestConfig.request.USER_REG,
            data:{data:JSON.stringify(data)},
            dataType:"jsonp",
            success:callback,
            error:callback
        });
    };

    /**
     * 检查用户认证状态
     * @param callback
     */
    var checkAccountStatus = function (user, callback) {

        var data = {
            "requestType":"1",
            userKey:user.userKey,
            userId:user.userId + ""
        };

        $.ajax({
            type:"GET",
            url:requestConfig.request.GET_BALANCE,
            data:{data:JSON.stringify(data)},
            dataType:"jsonp",
            success:callback,
            error:callback
        });
    };

    /**
     * 微博联名登录
     * @param code
     */
    var unitWeiBoLogin = function(code, client_id, client_secret, redirect_uri, callback) {
        var data = {
            "code": code,
            "channelNo": requestConfig.request.channelNo,
            "platform": requestConfig.request.platform,
            "client_id": client_id,
            "client_secret": client_secret,
            "redirect_uri": redirect_uri
        };

        $.ajax({
            type: "GET",
            url: requestConfig.request.WEIBO_AUTH_LOGIN,
            data: {data: JSON.stringify(data)},
            dataType: "jsonp",
            success: callback,
            error: callback
        });
    };

    return {
        goLogin:goLogin,
        goRegister:goRegister,
	checkAccountStatus:checkAccountStatus,
        unitWeiBoLogin: unitWeiBoLogin
    };
});
