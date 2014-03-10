/**
 * APP Config Service
 */
define([], function () {

    // wap 跳转地址
    var WAP_URL = "http://tools.ecp888.com/wap/user/waprecharge/index.shtml";

    // 名称空间
    var ecp = {};

    // 动态存储数据
    ecp.data = {};

    // 登录token
    var token = "";

    // 关键字Map
    var keyMap = {
        LOCAL_USER_NAME_KEY:"local_user_name", // 本地登录用户名
        LOCAL_USER_INFO_KEY:"LOCAL_USER_INFO_KEY", // 本地登录用户信息
        LOCAL_USER_EXTERNAL_INFO_KEY:"local_user_external_info", // 本地用户其他信息
        LOCAL_USER_TRUE_NAME_KEY:"local_user_true_name", // 用户真实姓名
        MAY_BUY_RED_BLUE_KEY:"redBlue", // 双色球缓存数据标示
        MAY_BUY_HAPPY_KEY:"happy", // 大乐透缓存数据标示
        MAY_BUY_LUCK_KEY:"luck", // 十一运夺金缓存数据标示
        NOTICE_READ_ID:"notice_read_id", // 用户阅读过的活动公告id
        SMART_LUCK_KEY:"smart_luck", // 十一夺金智能追号
        MAY_BUY_3D_KEY:"3d", // 福彩3D缓存数据标示
        MAY_BUY_RACING_KEY:"racing", // 幸运赛车缓存数据标示
        MAY_BUY_JCLQ_KEY:"jclq", // 竞彩篮球缓存数据标示
        MAY_BUY_JCZQ_KEY:"jczq" // 竞彩足球缓存数据标示
    };

    // 无痕浏览
    var nonMark = false;

    /**
     * 获取本地字符串信息
     * @param key
     * @return {*}
     */
    var getLocalString = function (key) {
        if (localStorage.getItem && !nonMark) {
            return localStorage.getItem(key);
        } else {
            return ecp.data[key];
        }
    };

    /**
     * 设置本地字符信息
     * @param key
     * @param val
     */
    var setLocalString = function (key, val) {
        if (localStorage.setItem) {
            try {
                localStorage.removeItem(key);
                localStorage.setItem(key, val);
            } catch (e) {
                nonMark = true;
                ecp.data[key] = val;
            }
        } else {
            ecp.data[key] = val;
        }
    };

    /**
     * 删除本地字符串信息
     * @param key
     */
    var clearLocalData = function (key) {
        if (localStorage.removeItem && !nonMark) {
            localStorage.removeItem(key);
        } else {
            ecp.data[key] = [];
        }
    };

    /**
     * 获取本地Json数据
     * @param key
     * @return {*}
     */
    var getLocalJson = function (key) {
        if (localStorage.getItem && !nonMark) {
            var localVal = localStorage.getItem(key);
            return localVal == null ? null : JSON.parse(localVal);
        } else {
            return ecp.data[key];
        }
    };

    /**
     * 设置本地json数据
     * @param key
     * @param val
     */
    var setLocalJson = function (key, val) {
        if (localStorage.setItem) {
            try {
                localStorage.removeItem(key);
                localStorage.setItem(key, JSON.stringify(val));
            } catch (e) {
                nonMark = true;
                ecp.data[key] = val;
            }
        } else {
            ecp.data[key] = val;
        }
    };

    /**
     * 检查是否已经登录
     * @param data
     * @return {String}
     */
    var checkLogin = function (data) {
        var nowToken = "";
        if ($.trim(this.token) != "") {
            // 获取缓存的token值
            nowToken = this.token;
        } else if (data != null && typeof data != "undefined") {
            // 获取地址栏token值
            nowToken = data.token;
        } else {
            return "";
        }

        // 本地保存用户token值
        var userInfo = this.getLocalJson(this.keyMap.LOCAL_USER_INFO_KEY);

        if (nowToken != null && typeof nowToken != "undefined"
            && $.trim(nowToken) != ""
            && userInfo != null && userInfo.token != null
            && typeof userInfo.token != "undefined"
            && $.trim(userInfo.token) != "") {
            if ($.trim(nowToken) == $.trim(userInfo.token)) {
                this.token = nowToken;
                return nowToken;
            } else {
                return "";
            }
        } else {
            return "";
        }
    };

    return {
        WAP_URL:WAP_URL,
        data:ecp.data,
        token:token,
        keyMap: keyMap,
        getLocalString:getLocalString,
        setLocalString:setLocalString,
        clearLocalData:clearLocalData,
        getLocalJson:getLocalJson,
        setLocalJson:setLocalJson,
        checkLogin:checkLogin
    };
});

