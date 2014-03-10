/**
 * 数字彩服务
 */
define([
    "util/RequestConfig",
    "util/AppConfig"
], function (requestConfig, appConfig) {

    /**
     * 获取当前期号
     * @param callback
     */
    var getCurrLottery = function (lotteryType, callback) {

        var data = {
            lotteryType:lotteryType
        };

        // 请求登录
        $.ajax({
            type:"GET",
            url:requestConfig.request.GET_CURRENT_LOTTERY,
            data:{data:JSON.stringify(data)},
            dataType:"jsonp",
            success:callback,
            error:callback
        });
    };

    /**
     * 获取当前期号
     * @param callback
     */
    var getLastLottery = function (lotteryType, callback) {

        var data = {
            lotteryType:lotteryType
        };

        // 请求登录
        $.ajax({
            type:"GET",
            url:requestConfig.request.GET_LAST_ISSUE_MSG,
            data:{data:JSON.stringify(data)},
            dataType:"jsonp",
            success:callback,
            error:callback
        });
    };

    /**
     * 获取当前期号
     * @param callback
     */
    var getRacingPosAward = function (lotteryType, playType, callback) {

        var data = {
            lotteryType:lotteryType,
            playType:playType
        };

        // 请求登录
        $.ajax({
            type:"GET",
            url:requestConfig.request.GET_RACING_POS_AWARD,
            data:{data:JSON.stringify(data)},
            dataType:"jsonp",
            success:callback,
            error:callback
        });
    };

    /**
     * 购买
     * @param params
     * @param callback
     */
    var toBuy = function (lottery, type, params, price, callback) {

        if (!appConfig.checkLogin(null)) {
            // 尚未登录
            callback({statusCode:"off"});
            return false;
        }

        // 保存登录成功信息
        var user = appConfig.getLocalJson(appConfig.keyMap.LOCAL_USER_INFO_KEY);

        // 请求参数
        var data = {};

        data.issueNo = params.issueNo; // 期号
        data.lotteryType = lottery;  // 彩种类型
        data.content = params.content;  // 方案内容
        data.playType = params.playType;  // 玩法类型 2 复式, 5 胆拖
        data.betType = params.betType; // 投注类型 1 直选，2 组选，3 组三，4组六，5 大乐透12 选2，6生肖，7 季节，8 方位；高频彩默认传入1

        data.bets = params.bets; // 当期总注数
        data.totalIssue = params.totalIssue;  // 总期数
        data.totalBet = params.totalBet;  // 总倍数
        data.totalAmount = (parseInt(data.totalBet, 10) * parseInt(data.bets, 10) * price) + "";  // 总金额
        data.stopBetting = params.stopBetting;  // 中奖后停止追号 0不停止，1停止
        data.addtionSupper = params.addtionSupper;  // 大乐透专用，0不追加，1追加
        data.btzh = params.btzh;  // 高频彩，是否是倍投计算器
        data.stopCondition = params.stopCondition;  // 停止追号条件

        var detailStr = JSON.stringify(params.detail).replace(/\"/g, '\"');
        data.detail = detailStr; // 购买当期的详细信息
        // 固定参数
        data.projectDesc = ""; // 方案描述

        switch (type) {
            case "1": // 复式 胆拖
                data.projectType = "0"; // 自购
                data.projectHold = "0";  // 方案保底份数 0 为不保底
                data.projectOpenState = "2";  // 方案公开方式 0公开，1跟单后，2截止后，3不公开
                data.projectBuy = "1";  // 方案认购份数 至少总份数的5%

                data.projectCount = "1";  // 合买方案总份数
                data.projectCommissions = "5";  // 合买方案提成百分比0-10

                break;

            case "2":  // 合买
                data.projectType = "1"; // 自购
                data.projectHold = params.projectHold;  // 方案保底份数 0 为不保底
                data.projectOpenState = params.projectOpenState;  // 方案公开方式 0公开，1跟单后，2截止后，3不公开
                data.projectBuy = params.projectBuy;  // 方案认购份数 至少总份数的5%

                data.projectCount = params.projectCount;  // 合买方案总份数
                data.projectCommissions = params.projectCommissions;  // 合买方案提成百分比0-10

                break;
        }

        data.channelNo = requestConfig.request.channelNo;
        data.platform = requestConfig.request.platform;
        data.userKey = user.userKey;
        data.userId = user.userId + "";
        data.userName = user.userName;

        // 购买登录
        $.ajax({
            type:"GET",
            url:requestConfig.request.DIGIT_BUY,
            data:{data:JSON.stringify(data)},
            dataType:"jsonp",
            success:callback,
            error:callback
        });
    };

    /**
     * 获取方案详情
     * @param lotteryType
     * @param requestType
     * @param projectId
     * @param callback
     */
    var getProjectDetails = function (lotteryType, requestType, projectId, callback) {

        if (!appConfig.checkLogin(null)) {
            // 尚未登录
            callback({statusCode:"off"});
            return false;
        }

        // 保存登录成功信息
        var user = appConfig.getLocalJson(appConfig.keyMap.LOCAL_USER_INFO_KEY);

        var data = {
            lotteryType:lotteryType,
            requestType:requestType,
            projectId:projectId,
            userKey:user.userKey,
            userId:user.userId + ""
        };

        // 请求登录
        $.ajax({
            type:"GET",
            url:requestConfig.request.SUBSCRIBE_ORDER,
            data:{data:JSON.stringify(data)},
            dataType:"jsonp",
            success:callback,
            error:callback
        });
    };

    /**
     * 获取方案追期列表
     * @param lotteryType
     * @param projectId
     * @param callback
     * @return {Boolean}
     */
    var getProjectAllIssue = function (lotteryType, projectId, callback) {

        if (!appConfig.checkLogin(null)) {
            // 尚未登录
            callback({statusCode:"off"});
            return false;
        }

        // 保存登录成功信息
        var user = appConfig.getLocalJson(appConfig.keyMap.LOCAL_USER_INFO_KEY);

        var data = {
            lotteryType:lotteryType,
            projectId:projectId,
            userId:user.userId + ""
        };

        // 请求登录
        $.ajax({
            type:"GET",
            url:requestConfig.request.ALL_ISSUE,
            data:{data:JSON.stringify(data)},
            dataType:"jsonp",
            success:callback,
            error:callback
        });
    };

    /**
     * 复活追号
     * @param lotteryType
     * @param projectId
     * @param callback
     * @return {Boolean}
     */
    var addBuyDigit = function (lotteryType, projectId, callback) {

        if (!appConfig.checkLogin(null)) {
            // 尚未登录
            callback({statusCode:"off"});
            return false;
        }

        // 保存登录成功信息
        var user = appConfig.getLocalJson(appConfig.keyMap.LOCAL_USER_INFO_KEY);

        var data = {
            lotteryType:lotteryType,
            projectId:projectId,
            userKey:user.userKey,
            userId:user.userId + ""
        };

        // 请求登录
        $.ajax({
            type:"GET",
            url:requestConfig.request.ADD_BUY_DIGIT,
            data:{data:JSON.stringify(data)},
            dataType:"jsonp",
            success:callback,
            error:callback
        });
    };

    /**
     * 获取开奖记录
     * @param lottery 彩种
     * @param size 记录数
     */
    var getHistoryAwardsByTypes = function (lottery, size, callback) {

        // 请求参数
        var data = {
            lotteryType:lottery,
            issueCount:size
        };

        // 开奖记录
        $.ajax({
            type:"GET",
            url:requestConfig.request.AWARD_LIST_ISSUE,
            data:{data:JSON.stringify(data)},
            dataType:"jsonp",
            success:callback,
            error:callback
        });
    };

    /**
     * 数字彩某期开奖详情
     * @param lottery 彩种
     * @param issueNo 期号
     * @param callback
     */
    var getDigitDetailsByIssue = function (lottery, issueNo, callback) {
        var data = {
            lotteryId:lottery,
            issueNo:issueNo
        };

        // 数字彩某期开奖详情
        $.ajax({
            type:"GET",
            url:requestConfig.request.GET_DIGIT_NB,
            data:{data:JSON.stringify(data)},
            dataType:"jsonp",
            success:callback,
            error:callback
        });
    };

    /**
     * 获取开奖信息列表
     * @param lotteryTypeArray
     * @param callback
     */
    var getAwardInfoList = function (lotteryTypeArray, callback) {
        var data = {
            lotteryTypeArray:lotteryTypeArray
        };

        // 数字彩某期开奖详情
        $.ajax({
            type:"GET",
            url:requestConfig.request.AWARD_LIST,
            data:{data:JSON.stringify(data)},
            dataType:"jsonp",
            success:callback,
            error:callback
        });
    };

    return {
        getCurrLottery:getCurrLottery,
        getLastLottery:getLastLottery,
        getRacingPosAward:getRacingPosAward,
        toBuy:toBuy,
        getProjectDetails:getProjectDetails,
        getProjectAllIssue:getProjectAllIssue,
        addBuyDigit:addBuyDigit,
        getHistoryAwardsByTypes:getHistoryAwardsByTypes,
        getDigitDetailsByIssue:getDigitDetailsByIssue,
        getAwardInfoList:getAwardInfoList
    };
});
