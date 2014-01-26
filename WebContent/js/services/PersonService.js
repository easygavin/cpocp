/**
 * PersonCenter Service
 */
define([
    "util/RequestConfig",
    "util/Md5"
], function (requestConfig) {

    /**
     * 获取用户余额
     * @param requestType     请求类型
     * @param userId          用户id
     * @param userKey         用户key
     * @param callback         回调函数
     */
    var getUserBalance = function (requestType, userId, userKey, callback) {
        var data = {
            "requestType": requestType,
            "userId": userId,
            "userKey": userKey
        };

        $.ajax({
            type: "GET",
            url: requestConfig.request.GET_BALANCE,
            data: {data: JSON.stringify(data)},
            dataType: "jsonp",
            success: callback,
            error: callback
        });
    };
    /**
     * 查询身份证是否绑定
     * @param userId
     * @param userKey
     * @param callback
     */
    var inspectUserIDCardState = function (userId, userKey, callback) {
        var data =
        {
            "userId": userId,
            "userKey": userKey
        };

        $.ajax({
            url: requestConfig.request.GET_CARD_ID,
            type: "GET",
            data: {data: JSON.stringify(data)},
            dataType: "jsonp",
            success: callback,
            error: callback
        });
    };
    /**
     * 身份认证
     * @param  personCardId   身份证号码
     * @param  personCardName 身份证姓名
     * @param  userId         用户Id
     * @param  userKey        用户key
     * @param  callback       回调函数
     */
    var bindIDCard = function (personCardId, personCardName, userId, userKey, callback) {
        //请求参数
        var data = {
            "personCardId": personCardId,
            "name": encodeURIComponent(personCardName),
            "userId": userId,
            "userKey": userKey
        };

        $.ajax({
            url: requestConfig.request.BIND_PERSON_CARD,
            type: "GET",
            data: {data: JSON.stringify(data)},
            dataType: "jsonp",
            success: callback,
            error: callback
        });
    };

    /**
     * 发送验证码接口
     * @param userKey 用户Key
     * @param mobileNo 手机号码
     * @param userId 用户id
     * @param callback 回调
     */
    var sendCaptcha = function (userKey, mobileNo, userId, callback) {
        var data = {
            "userKey": userKey,
            "mobileNo": mobileNo,
            "userId": userId
        };
        $.ajax({
            type: "GET",
            url: requestConfig.request.SEND_MSG_TO_PHONE,
            data: {data: JSON.stringify(data)},
            dataType: "jsonp",
            success: callback,
            error: callback
        });
    };

    /**
     * 绑定手机号
     */
    var bindMobileNo = function (mobileNo, userId, userKey, indentifyingCode, callback) {
        var data = {
            "mobileNo": mobileNo,
            "userId": userId,
            "userKey": userKey,
            "indentifyingCode": indentifyingCode
        };

        $.ajax({
            type: "GET",
            url: requestConfig.request.VALIDATE_CODE,
            data: {data: JSON.stringify(data)},
            dataType: "jsonp",
            success: callback,
            error: callback
        });
    };

    /**
     * 获取银行卡省市列表
     */
    var getBankLists = function (callback) {
        $.ajax(
            {
                type: "POST",
                url: requestConfig.request.GET_BANKS,
                data: {},
                dataType: "jsonp",
                success: callback,
                error: callback
            });
    };

    /**
     *获取银行卡省市列表
     */
    var getBankLocus = function (callback) {
        $.ajax(
            {
                type: "POST",
                url: requestConfig.request.GET_BANK_LOCUS,
                data: {},
                dataType: "jsonp",
                success: callback,
                error: callback
            });
    };

    /**
     * 绑定银行卡
     * @param   userId      用户id
     * @param   userKey     用户key
     * @param   name        真实姓名
     * @param   cardNo      银行卡号
     * @param   bankInfo    开户行信息
     * @param   bankName    开户银行名称
     * @param   province    开户省份
     * @param   city        开户城市
     * @param   password    提款密码
     * @param   confirmPassword 提款密码确认
     * @param   bankCode    银行代码
     */
    var bindUserBankCard = function (userId, userKey, name, cardNo, bankInfo, bankName, province, city, password, confirmPassword, bankCode, callback) {
        //请求参数
        var data =
        {
            "userId": userId,
            "userKey": userKey,
            "name":encodeURIComponent(name),
            "cardNo": cardNo,
            "bankInfo": encodeURIComponent(bankInfo),
            "bankName": encodeURIComponent(bankName),
            "province": encodeURIComponent(province),
            "city": encodeURIComponent(city),
            "password": password ,
            "confirmPassword": confirmPassword ,
            "bankCode": bankCode
        };
        $.ajax(
            {
                type: "GET",
                url: requestConfig.request.BIND_BANK_CARD,
                data: {data: JSON.stringify(data)},
                dataType: "jsonp",
                success: callback,
                error: callback
            });
    };

    /**
     * abcK码充值
     * @param amount 金额
     * @param userId 用户ID
     * @param mobile 用户手机号
     * @param bankNo 银行卡后四位
     * @param callback 回调
     */
    var abcKcodePay = function (amount, userId, mobile, bankNo, callback) {
        var data = {
            "amount": amount,
            "userId": userId,
            "mobile": mobile,
            "bankNo": bankNo
        };

        $.ajax({
            type: "POST",
            url: "/abckpay",
            data: {data: JSON.stringify(data)},
            dataType: "json",
            success: callback,
            error: callback
        });
    };
    /**
     * abc手机充值
     * @param userId
     * @param amount
     */
    var abcMobilePay = function (userId, amount,callback) {
        var data = {
            "userId": userId,
            "amount": amount
        };
        $.ajax({
            type: "GET",
            url:"/abcmpay",
            data: {data: JSON.stringify(data)},
            dataType: "json",
            success: callback,
            error: callback
        });
    };
    /**
     * 提款
     * @param userId      用户id
     * @param userKey     用户userKey
     * @param userName    用户名
     * @param drawMoney   提款金额
     * @param drawPwd     密码.
     * @param callback    回调函数
     */
    var withdrawal = function (userId, userKey, userName, drawMoney, drawPwd, callback) {
        var afterMd5drawPwd = hex_md5(drawPwd).substring(8, 24);
        var data = {
            "userId": userId,
            "userKey": userKey,
            "drawMoney": drawMoney,
            "drawPwd": afterMd5drawPwd,
            "md5Sign": hex_md5("userId=" + userId + ",userKey=" + userKey + ",drawMoney=" + drawMoney + ",drawPwd=" + afterMd5drawPwd + userName).substr(8, 16)
        };

        $.ajax({
            type: "GET",
            url: requestConfig.request.DRAWING,
            data: {data: JSON.stringify(data)},
            dataType: "jsonp",
            success: callback,
            error: callback
        });
    };
    /**
     * 修改登录密码
     */
    var editLoginPassword = function (userId, userKey, oldPwd, newPwd, callback) {
        //请求参数
        var data =
        {
            "userId": userId,
            "userKey": userKey,
            "oldPwd": hex_md5(oldPwd).substr(8, 16),
            "newPwd": hex_md5(newPwd).substr(8, 16)
        };

        $.ajax({
            type: "GET",
            url: requestConfig.request.CHANG_PWD,
            data: {data: JSON.stringify(data)},
            dataType: "jsonp",
            success: callback,
            error: callback
        });
    };


    /**
     * 用户注销接口
     */
    var logout = function(userId, userKey) {

        // 请求参数
        var data = {
            userKey: userKey,
            userId: userId + ""
        };

        // 请求登录
        $.ajax({
            type: "GET",
            url: requestConfig.request.USER_LOGOUT,
            data: {data: JSON.stringify(data)},
            dataType: "jsonp",
            success: callback,
            error: callback
        });
    };


    /**
     * 获取用户购彩记录
     * @param data
     * @param callback
     */
    var getBuyRecordsList = function (data, callback) {
        $.ajax({
            type: "GET",
            url: requestConfig.request.BUY_AWARD,
            data: {data: JSON.stringify(data)},
            dataType: "jsonp",
            success: callback,
            error: callback
        });
    };

    /**
     * 获取账户明细
     * @param data
     * @param callback
     */
    var getAccountDetailList = function (data, callback) {
        $.ajax({
            type: "GET",
            url: requestConfig.request.GET_ACCOUNT_DETAIL,
            data: {data: JSON.stringify(data)},
            dataType: "jsonp",
            success: callback,
            error: callback
        });
    };

    return {
        bindIDCard: bindIDCard,
        getUserBalance: getUserBalance,
        inspectUserIDCardState: inspectUserIDCardState,
        editLoginPassword: editLoginPassword,
        logout: logout,
        sendCaptcha: sendCaptcha,
        bindMobileNo: bindMobileNo,
        getBankLocus: getBankLocus,
        bindUserBankCard: bindUserBankCard,
        getBuyRecordsList: getBuyRecordsList,
        getAccountDetailList: getAccountDetailList,
        withdrawal: withdrawal,
        abcKcodePay: abcKcodePay,
        abcMobilePay:abcMobilePay
    };
});