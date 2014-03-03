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

    // 本地登录用户名
    var LOCAL_USER_NAME_KEY = "local_user_name";

    // 本地登录用户信息
    var LOCAL_USER_INFO_KEY = "local_user_info";

    //本地用户其他信息
    var LOCAL_USER_EXTERNAL_INFO_KEY="local_user_external_info";
    // 用户真实姓名
    var LOCAL_USER_TRUE_NAME_KEY = "local_user_true_name";

    //用户身份验证状态
    var LOCAL_USER_AUTH_STATE="local_user_auth_state";

    // 双色球缓存数据标示
    var MAY_BUY_RED_BLUE_KEY = "redBlue";

    // 大乐透缓存数据标示
    var MAY_BUY_HAPPY_KEY = "happy";

    // 十一运夺金缓存数据标示
    var MAY_BUY_LUCK_KEY = "luck";

    // 用户阅读过的活动公告id
    var NOTICE_READ_ID = "notice_read_id";
    
    // 十一夺金智能追号
    var SMART_LUCK_KEY = "smart_luck";

    // 福彩3D缓存数据标示
    var MAY_BUY_3D_KEY = "3d";

    // 幸运赛车缓存数据标示
    var MAY_BUY_RACING_KEY = "racing";

    // 竞彩篮球缓存数据标示
    var MAY_BUY_JCLQ_KEY = "jclq";

    // 竞彩足球缓存数据标示
    var MAY_BUY_JCZQ_KEY = "jczq";

    //竞彩足球,对阵情报信息缓存.

    var JCZQ_AGAINST_INFO="jczq_against_info";

    /**
     * 获取用户真实姓名
     * @returns {*}
     */
    var getLocalUserTrueName = function () {
        if (localStorage.getItem) {
            return localStorage.getItem(LOCAL_USER_TRUE_NAME_KEY);
        } else {
            return ecp.data[LOCAL_USER_TRUE_NAME_KEY];
        }
    };
    
    /**
     * 设置用户真实姓名
     * @returns {*}
     */
    var setLocalUserTrueName = function (val) {
        if (localStorage.setItem) {
			localStorage.removeItem(LOCAL_USER_TRUE_NAME_KEY);
            localStorage.setItem(LOCAL_USER_TRUE_NAME_KEY, val);
        } else {
            ecp.data[LOCAL_USER_TRUE_NAME_KEY] = val;
        }
    };
    
    /**
     *获取用户身份验证状态
     * @returns {*}
     */

    var setUserAuthState =function(val){
        if (localStorage.setItem) {
			localStorage.removeItem(LOCAL_USER_AUTH_STATE);
          	localStorage.setItem(LOCAL_USER_AUTH_STATE, JSON.stringify(val));
        } else {
          	ecp.data[LOCAL_USER_AUTH_STATE] = val;
        }
    };

    /**
     *保存用户身份验证状态
     * @returns {*}
     */
    var getUserAuthState =function(val){
        if (localStorage.getItem) {
            var localVal = localStorage.getItem(LOCAL_USER_AUTH_STATE);
            return localVal == null ? null : JSON.parse(localVal);
        } else {
            return ecp.data[LOCAL_USER_AUTH_STATE];
        }
    };

    /*
     * 获取本地登录用户名
     * @return {*}
     */
    var getLocalUserName = function () {
        if (localStorage.getItem) {
            return localStorage.getItem(LOCAL_USER_NAME_KEY);
        } else {
            return ecp.data[LOCAL_USER_NAME_KEY];
        }
    };

    /**
     * 设置本地登录用户名
     * @param val
     */
    var setLocalUserName = function (val) {
        if (localStorage.setItem) {
			localStorage.removeItem(LOCAL_USER_NAME_KEY);
            localStorage.setItem(LOCAL_USER_NAME_KEY, val);
        } else {
            ecp.data[LOCAL_USER_NAME_KEY] = val;
        }
    };

    /**
     * 获取本地用户信息
     * @return {*}
     */
    var getLocalUserInfo = function () {
        if (localStorage.getItem) {
            var localVal = localStorage.getItem(LOCAL_USER_INFO_KEY);
            return localVal == null ? null : JSON.parse(localVal);
        } else {
            return ecp.data[LOCAL_USER_INFO_KEY];
        }
    };

    /**
     * 设置本地用户信息
     * @param data
     */
    var setLocalUserInfo = function (data) {
        if (localStorage.setItem) {
            localStorage.removeItem(LOCAL_USER_INFO_KEY);
            localStorage.setItem(LOCAL_USER_INFO_KEY, JSON.stringify(data));
        } else {
            ecp.data[LOCAL_USER_INFO_KEY] = data;
        }
    };

    /**
     * 删除本地用户信息
     * @param key
     */
    var clearLocalUserInfo = function () {
        if (localStorage.removeItem) {
            localStorage.removeItem(LOCAL_USER_INFO_KEY);
        } else {
            ecp.data[LOCAL_USER_INFO_KEY] = [];
        }
    };

    /**
     * 设置本地用户其他信息
     * @param data
     */
    var setLocalUserExternalInfo = function (data) {
        if (localStorage.setItem) {
			localStorage.removeItem(LOCAL_USER_EXTERNAL_INFO_KEY);
            localStorage.setItem(LOCAL_USER_EXTERNAL_INFO_KEY, JSON.stringify(data));
        } else {
            ecp.data[LOCAL_USER_EXTERNAL_INFO_KEY] = data;
        }
    };

    /**
     * 获取本地用户信息
     * @return {*}
     */
    var getLocalUserExternalInfo = function () {
        if (localStorage.getItem) {
            var localVal = localStorage.getItem(LOCAL_USER_EXTERNAL_INFO_KEY);
            return localVal == null ? null : JSON.parse(localVal);
        } else {
            return ecp.data[LOCAL_USER_EXTERNAL_INFO_KEY];
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
		} else if (data != null && typeof data != "undefined"){
			// 获取地址栏token值
			nowToken = data.token;	
		} else {
            return "";
        }
		
		// 本地保存用户token值
		var userInfo = this.getLocalUserInfo();
		
		if (nowToken != null && typeof nowToken != "undefined"
			&& $.trim(nowToken) != "" 
			&& userInfo != null && userInfo.token != null 
			&& typeof userInfo.token != "undefined"
			&& $.trim(userInfo.token) != "") {
			if ($.trim(nowToken) == $.trim(userInfo.token))	{
                this.token = nowToken;
				return nowToken;
			} else {
				return "";	
			}
		} else {
			return "";	
		}
    };

    /**
     * 设置可能购买页面缓存记录
     * @param key
     * @param data
     */
    var setMayBuyData = function (key, data) {
        if (localStorage.setItem) {
			localStorage.removeItem(key);
            localStorage.setItem(key, JSON.stringify(data));
        } else {
            ecp.data[key] = data;
        }
    };

    /**
     * 获取可能购买页面缓存记录
     * @param key
     * @return {*}
     */
    var getMayBuyData = function (key) {
        if (localStorage.getItem) {
            var localVal = localStorage.getItem(key);
            return localVal == null ? null : JSON.parse(localVal);
        } else {
            return ecp.data[key];
        }
    };

    /**
     * 删除可能购买页面缓存记录
     * @param key
     */
    var clearMayBuyData = function (key) {
        if (localStorage.removeItem) {
            localStorage.removeItem(key);
        } else {
            ecp.data[key] = [];
        }
    };

    /**
     * 设置已经阅读的公告编号字符串
     */
    var setNoticeReadIDs = function(data) {
        if (localStorage.setItem) {
            localStorage.removeItem(NOTICE_READ_ID);
            localStorage.setItem(NOTICE_READ_ID, JSON.stringify(data));
        } else {
            ecp.data[NOTICE_READ_ID] = data;
        }
    };

    /**
     * 获取已经阅读的公告编号字符串
     */
    var getNoticeReadIDs = function() {
        if (localStorage.getItem) {
            var localVal = localStorage.getItem(NOTICE_READ_ID);
            return localVal == null ? null : JSON.parse(localVal);
        } else {
            return ecp.data[NOTICE_READ_ID];
        }
    };

    return {
        WAP_URL: WAP_URL,
        data: ecp.data,
        token: token,
        MAY_BUY_RED_BLUE_KEY: MAY_BUY_RED_BLUE_KEY,
        MAY_BUY_HAPPY_KEY: MAY_BUY_HAPPY_KEY,
        MAY_BUY_LUCK_KEY: MAY_BUY_LUCK_KEY,
        SMART_LUCK_KEY: SMART_LUCK_KEY,
        MAY_BUY_3D_KEY: MAY_BUY_3D_KEY,
        MAY_BUY_RACING_KEY: MAY_BUY_RACING_KEY,
        MAY_BUY_JCLQ_KEY: MAY_BUY_JCLQ_KEY,
        MAY_BUY_JCZQ_KEY: MAY_BUY_JCZQ_KEY,
        getLocalUserName: getLocalUserName,
        setLocalUserName: setLocalUserName,
        getLocalUserInfo: getLocalUserInfo,
        setLocalUserInfo: setLocalUserInfo,
        clearLocalUserInfo: clearLocalUserInfo,
        setLocalUserExternalInfo:setLocalUserExternalInfo,
        getLocalUserExternalInfo:getLocalUserExternalInfo,
        checkLogin: checkLogin,
        setLocalUserTrueName:setLocalUserTrueName,
        getLocalUserTrueName:getLocalUserTrueName,
        setMayBuyData: setMayBuyData,
        getMayBuyData: getMayBuyData,
        clearMayBuyData: clearMayBuyData,
        LOCAL_USER_NAME_KEY:LOCAL_USER_NAME_KEY,
        setUserAuthState:setUserAuthState,
        getUserAuthState:getUserAuthState,
        setNoticeReadIDs: setNoticeReadIDs,
        getNoticeReadIDs: getNoticeReadIDs
    };
});

