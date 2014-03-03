define([
    "util/RequestConfig",
    "util/AppConfig"
], function (requestConfig, appConfig) {

    /**
     * 获取竞彩足球对阵数据.
     */
    var getJCZQBetList = function (lotteryType, callback) {

        var data = {
            "lotteryType": lotteryType
        };

        $.ajax({
            type: "GET",
            url: requestConfig.request.JCZQ_GAME_LIST,
            data: {data: JSON.stringify(data)},
            dataType: "jsonp",
            success: callback,
            error: callback
        });
    };
    /**
     * 情报数据积分压盘欧亚析接口
     * @param teamNo  赛事编号
     * @param issueNo 期号
     * @param gliveId 情报id
     * @param userId  userId
     * @param userKey userKey
     */
    var getJCZQAgainstInfo = function (teamNo, issueNo, gliveId, userId, userKey, callback) {
        var data = {
            "teamNo": encodeURIComponent(teamNo),
            "issueNo": issueNo,
            "gliveId": gliveId,
            "userId": userId,
            "userKey": userKey
        };

        $.ajax({
            type: "GET",
            url: requestConfig.request.JCZQ_AGAINST,
            data: {data: JSON.stringify(data)},
            dataType: "jsonp",
            success: callback,
            error: callback
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
            callback({statusCode: "off"});
            return false;
        }

        // 保存登录成功信息
        var user = appConfig.getLocalUserInfo();

        var data = {
            lotteryType: lotteryType,
            requestType: requestType,
            projectId: projectId,
            userKey: user.userKey,
            userId: user.userId + ""
        };

        // 请求登录
        $.ajax({
            type: "GET",
            url: requestConfig.request.JCZQ_DETAIL,
            data: {data: JSON.stringify(data)},
            dataType: "jsonp",
            success: callback,
            error: callback
        });
    };

    /**
     * 获取竞彩足球开奖信息
     * @param lotteryType  玩法类型.
     * @param dateTime     开奖时间.
     * @param callback     回调函数
     */
    var getJczqHistoryLottery = function (lotteryType, date, callback) {

        var data = {
            lotteryType: lotteryType,
            date: date
        };

        $.ajax({
            type: "GET",
            url: requestConfig.request.JCZQ_LOTTERY_RECORD,
            data: {data: JSON.stringify(data)},
            dataType: "jsonp",
            success: callback,
            error: callback
        });
    };

    /**
     * 获取某个对阵开奖的SP值
     * @param matchId  对阵ID
     * @param callback 回调
     */
    var getSpLottery = function (matchId, callback) {

        var data = {
            "matchId": matchId
        };

        $.ajax({
            type: "GET",
            url: requestConfig.request.JCZQ_SP_LOTTERY,
            data: {data: JSON.stringify(data)},
            dataType: "jsonp",
            success: callback,
            error: callback
        });

    };

    var customMap = function () {

        this.elements = new Array();

        //获取MAP元素个数
        this.size = function () {
            return this.elements.length;
        };

        //判断MAP是否为空
        this.isEmpty = function () {
            return (this.elements.length < 1);
        };

        //删除MAP所有元素
        this.clear = function () {
            this.elements = new Array();
        };

        //向MAP中增加元素（key, value)
        this.put = function (_key, _value) {
            this.elements.push({
                key: _key,
                value: _value
            });
        };

        //删除指定KEY的元素，成功返回True，失败返回False
        this.remove = function (_key) {
            var bln = false;
            try {
                for (i = 0; i < this.elements.length; i++) {
                    if (this.elements[i].key == _key) {
                        this.elements.splice(i, 1);
                        return true;
                    }
                }
            } catch (e) {
                bln = false;
            }
            return bln;
        };

        //获取指定KEY的元素值VALUE，失败返回NULL
        this.get = function (_key) {
            try {
                for (i = 0; i < this.elements.length; i++) {
                    if (this.elements[i].key == _key) {
                        return this.elements[i].value;
                    }
                }
            } catch (e) {
                return null;
            }
        };

        //获取指定索引的元素（使用element.key，element.value获取KEY和VALUE），失败返回NULL
        this.element = function (_index) {
            if (_index < 0 || _index >= this.elements.length) {
                return null;
            }
            return this.elements[_index];
        };

        //判断MAP中是否含有指定KEY的元素
        this.containsKey = function (_key) {
            var bln = false;
            try {
                for (i = 0; i < this.elements.length; i++) {
                    if (this.elements[i].key == _key) {
                        bln = true;
                    }
                }
            } catch (e) {
                bln = false;
            }
            return bln;
        };

        //判断MAP中是否含有指定VALUE的元素
        this.containsValue = function (_value) {
            var bln = false;
            try {
                for (i = 0; i < this.elements.length; i++) {
                    if (this.elements[i].value == _value) {
                        bln = true;
                    }
                }
            } catch (e) {
                bln = false;
            }
            return bln;
        };

        //获取MAP中所有VALUE的数组（ARRAY）
        this.values = function () {
            var arr = new Array();
            for (i = 0; i < this.elements.length; i++) {
                arr.push(this.elements[i].value);
            }
            return arr;
        };

        //获取MAP中所有KEY的数组（ARRAY）
        this.keys = function () {
            var arr = new Array();
            for (i = 0; i < this.elements.length; i++) {
                arr.push(this.elements[i].key);
            }
            return arr;
        };
    };

    return{
        getJCZQBetList: getJCZQBetList,
        customMap: customMap,
        getProjectDetails: getProjectDetails,
        getJCZQAgainstInfo: getJCZQAgainstInfo,
        getJczqHistoryLottery: getJczqHistoryLottery,
        getSpLottery:getSpLottery
    };
});
