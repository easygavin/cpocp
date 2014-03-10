/**
 * 竞彩服务
 */
define([
    "util/RequestConfig",
    "util/AppConfig"
], function (requestConfig, appConfig) {

    /**
     * 获取竞彩篮球对阵
     * @param callback
     */
    var getJCLQBetList = function (lotteryType, callback) {

        var data = {
            lotteryType:lotteryType
        };

        // 请求登录
        $.ajax({
            type:"GET",
            url:requestConfig.request.JCLQ_GAME_LIST,
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
    var toBuy = function (type, params, price, callback) {

        if (!appConfig.checkLogin(null)) {
            // 尚未登录
            callback({statusCode:"off"});
            return false;
        }

        // 保存登录成功信息
        var user = appConfig.getLocalJson(appConfig.keyMap.LOCAL_USER_INFO_KEY);

        params.totalAmount = (parseInt(params.totalBet, 10) * parseInt(params.totalBei, 10) * price) + "";  // 总金额

        // 固定参数
        params.projectDesc = ""; // 方案描述

        switch (type) {
            case "1": // 复式 胆拖
                params.projectType = "0"; // 自购
                params.projectHold = "0";  // 方案保底份数 0 为不保底
                params.projectOpenState = "2";  // 方案公开方式 0公开，1跟单后，2截止后，3不公开
                params.projectBuy = "1";  // 方案认购份数 至少总份数的5%

                params.projectCount = "1";  // 合买方案总份数
                params.projectCommissions = "5";  // 合买方案提成百分比0-10

                break;

            case "2":  // 合买
                params.projectType = "1"; // 自购
                params.projectHold = params.projectHold;  // 方案保底份数 0 为不保底
                params.projectOpenState = params.projectOpenState;  // 方案公开方式 0公开，1跟单后，2截止后，3不公开
                params.projectBuy = params.projectBuy;  // 方案认购份数 至少总份数的5%

                params.projectCount = params.projectCount;  // 合买方案总份数
                params.projectCommissions = params.projectCommissions;  // 合买方案提成百分比0-10

                break;
        }

        params.channelNo = requestConfig.request.channelNo;
        params.platform = requestConfig.request.platform;
        params.userKey = user.userKey;
        params.userId = user.userId + "";
        params.userName = user.userName;

        // 购买登录
        $.ajax({
            type:"GET",
            url:requestConfig.request.JCLQ_GAME_BUY,
            data:{data:JSON.stringify(params)},
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
            url:requestConfig.request.JCLQ_DETAIL,
            data:{data:JSON.stringify(data)},
            dataType:"jsonp",
            success:callback,
            error:callback
        });
    };

    /**
     * 获取竞彩篮球开奖信息
     * @param lotteryType
     * @param date
     */
    var getHistoryAwards = function (lotteryType, date, callback) {

        // 请求参数
        var data = {
            lotteryType:lotteryType,
            date:date
        };

        // 开奖记录
        $.ajax({
            type:"GET",
            url:requestConfig.request.JCLQ_AWARD_LIST_ISSUE,
            data:{data:JSON.stringify(data)},
            dataType:"jsonp",
            success:callback,
            error:callback
        });
    };

    /**
     * 获取竞彩篮球开奖详情SP值
     * @param matchId
     */
    var getAwardDetailSP = function (matchId, callback) {

        // 请求参数
        var data = {
            matchId:matchId
        };

        // 开奖记录
        $.ajax({
            type:"GET",
            url:requestConfig.request.JCLQ_AWARD_DETAIL_SP,
            data:{data:JSON.stringify(data)},
            dataType:"jsonp",
            success:callback,
            error:callback
        });
    };

    /**
     * 根据赛事场数，胆数，投注方式列表计算普通过关列表
     * @param counts 赛事场数
     * @param dans 胆数
     * @param types 投注方式列表
     */
    var getNormalWays = function (counts, dans, types) {
        var ways = [];
        var minCross = getMinCrossNum(dans);
        var maxCross = getMaxCrossNum(counts, types);

        for (var i = minCross; i < maxCross + 1; i++) {
            ways.push(i + "-1");
        }

        return ways;
    };

    /**
     * 根据赛事场数，胆数，投注方式列表计算多串过关列表
     * @param counts 赛事场数
     * @param dans 胆数
     * @param types 投注方式列表
     */
    var getManyWay = function (counts, types) {
        // 多串过关无胆
        var ways = [];
        var minCross = 3;
        var maxCross = getMaxCrossNum(counts, types);
        for (var i = minCross; i < maxCross + 1; i++) {
            switch (i) {
                case 3:
                    ways.push("3-3");
                    ways.push("3-4");
                    break;
                case 4:
                    ways.push("4-4");
                    ways.push("4-5");
                    ways.push("4-6");
                    ways.push("4-11");
                    break;
                case 5:
                    ways.push("5-5");
                    ways.push("5-6");
                    ways.push("5-10");
                    ways.push("5-16");
                    ways.push("5-20");
                    ways.push("5-26");
                    break;
                case 6:
                    ways.push("6-6");
                    ways.push("6-7");
                    ways.push("6-15");
                    ways.push("6-20");
                    ways.push("6-22");
                    ways.push("6-35");
                    ways.push("6-42");
                    ways.push("6-50");
                    ways.push("6-57");
                    break;
                case 7:
                    ways.push("7-7");
                    ways.push("7-8");
                    ways.push("7-21");
                    ways.push("7-35");
                    ways.push("7-120");
                    break;
                case 8:
                    ways.push("8-8");
                    ways.push("8-9");
                    ways.push("8-28");
                    ways.push("8-56");
                    ways.push("8-70");
                    ways.push("8-247");
                    break;
            }
        }

        return ways;
    };


    /**
     * 获取最大串数
     * @param types
     */
    var getMaxCrossNum = function (counts, types) {
        var maxCross = 8;

        for (var i = 0; i < types.length; i++) {
            var max = maxMap[types[i]].max;
            maxCross = maxCross > max ? max : maxCross;
        }

        maxCross = counts >= maxCross ? maxCross : counts;

        return maxCross;
    };

    /**
     * 获取最小串数
     * @param dans
     */
    var getMinCrossNum = function (dans) {
        var minCross = 2;
        minCross = (dans + 1) > minCross ? (dans + 1) : minCross;

        return minCross;
    };

    /********* 注数计算 *********/
    /**
     * 获取注数
     * @param ways 过关数组
     * @param optArr 选中的场数
     * @param danNOs 胆
     * @return {Number}
     */
    var getBetByCrossWay = function (ways, optArr, danNOs) {
        var bet = 0, wagerType = "1", sa = [], sb = [];

        for (var k in optArr) {
            if (danNOs[k]) {
                sb.push(optArr[k]);
            } else {
                sa.push(optArr[k]);
            }
        }

        var minAbs = sb.length;
        var maxAbs = sb.length;

        for (var i = 0, len = ways.length; i < len; i++) {
            bet += myCalc(ways[i], wagerType, sa, sb, minAbs, maxAbs);
        }

        return bet;
    };

    /**
     * 计算器 过关方式,过关类型,非胆完事选项个数数组,胆选项个数数组,模糊定胆个数1,模糊定胆个数2
     */
    var myCalc = function (passType, wagerType, sa, sb, b0, b1) {
        if (sb.length == 0) {
            return calc(passType, wagerType, sa, sb);
        } else {
            var wCount = 0;
            for (var k = b0; k <= b1; k++) {
                var bm = combineArray(sb, k);
                for (var j in bm) {
                    wCount += calc(passType, wagerType, sa, bm[j]);
                }
            }
            return wCount;
        }
    };

    var calc = function (passType, wagerType, sa, sb) {
        var wagerCount = 0;
        var t_list = passType.split("-");
        var pc = parseInt(t_list[0], 10);
        if (wagerType == 1) {
            var absCount = sb.length;
            var len = pc - absCount;
            if (len == 0 && absCount > 0) {
                var pm = new Array(pc);
                for (var p in sb) {
                    var absVoteC = sb[p];
                    for (var k = 0; k < pc; k++) {
                        if (pm[k] == 0 || pm[k] == null) {
                            pm[k] = absVoteC;
                            break;
                        }
                    }
                }
                var pStr = pm.slice(0, pc).join(",");
                eval("wagerCount += calculateWC(passType," + pStr + ");");
            } else {
                var arr = new Array();
                for (var i in sa) {
                    arr[arr.length] = i;
                }
                var w = combineArray(arr, len);
                for (var i in w) {
                    var splitArr = w[i];
                    var pm = new Array(pc);
                    for (var k = 0; k < pc; k++) {
                        var d = splitArr[k];
                        pm[k] = splitArr[k] != null ? sa[d] : 0;
                    }
                    if (absCount > 0) {
                        for (var p in sb) {
                            var absVoteC = sb[p];
                            for (var k = 0; k < pc; k++) {
                                if (pm[k] == 0 || pm[k] == null) {
                                    pm[k] = absVoteC;
                                    break;
                                }
                            }
                        }
                    }
                    var pStr = pm.slice(0, pc).join(",");
                    eval("wagerCount += calculateWC(passType," + pStr + ");");
                }
            }
        } else if (wagerType == 2) {
            var t_list = passType.split("-");
            var len = parseInt(t_list[0], 10);
            var arr = new Array();
            for (var i in sa) {
                arr[arr.length] = i;
            }
            var w = subsectionArray(arr, len);
            for (var i in w) {
                var splitArr = w[i];
                var pm = new Array(pc);
                for (var k = 0; k < pc; k++) {
                    var d = splitArr[k];
                    pm[k] = splitArr[k] != null ? sa[d] : 0;
                }
                var pStr = pm.slice(0, pc).join(",");
                eval("wagerCount += calculateWC(passType," + pStr + ");");
            }
        }
        return wagerCount;
    };

    var calculateWC = function (passType, a, b, c, d, e, f, g, h, i, j, k, l, m, n, o) {
        var re = 0;
        a = a == null ? 0 : parseInt(a, 10);
        b = b == null ? 0 : parseInt(b, 10);
        c = c == null ? 0 : parseInt(c, 10);
        d = d == null ? 0 : parseInt(d, 10);
        e = e == null ? 0 : parseInt(e, 10);
        f = f == null ? 0 : parseInt(f, 10);
        g = g == null ? 0 : parseInt(g, 10);
        h = h == null ? 0 : parseInt(h, 10);
        i = i == null ? 0 : parseInt(i, 10);
        j = j == null ? 0 : parseInt(j, 10);
        k = k == null ? 0 : parseInt(k, 10);
        l = l == null ? 0 : parseInt(l, 10);
        m = m == null ? 0 : parseInt(m, 10);
        n = n == null ? 0 : parseInt(n, 10);
        o = o == null ? 0 : parseInt(o, 10);
        switch (passType) {
            case "1-1":
                re = a;
                break;
            case "2-1":
                re = a * b;
                break;
            case "2-3":
                re = (a + 1) * (b + 1) - 1;
                break;
            case "3-1":
                re = a * b * c;
                break;
            case "3-3":
                re = a * b + a * c + b * c;
                break;
            case "3-4":
                re = a * b * c + a * b + a * c + b * c;
                break;
            case "3-7":
                re = (a + 1) * (b + 1) * (c + 1) - 1;
                break;
            case "4-1":
                re = a * b * c * d;
                break;
            case "4-4":
                re = a * b * c + a * b * d + a * c * d + b * c * d;
                break;
            case "4-5":
                re = (a + 1) * (b + 1) * (c + 1) * (d + 1) - (a * (b + c + d + 1) + b * (c + d + 1) + (c + 1) * (d + 1));
                break;
            case "4-6":
                re = a * b + a * c + a * d + b * c + b * d + c * d;
                break;
            case "4-11":
                re = (a + 1) * (b + 1) * (c + 1) * (d + 1) - (a + b + c + d + 1);
                break;
            case "4-15":
                re = (a + 1) * (b + 1) * (c + 1) * (d + 1) - 1;
                break;
            case "5-1":
                re = a * b * c * d * e;
                break;
            case "5-5":
                re = a * b * c * d + a * b * c * e + a * b * d * e + a * c * d * e + b * c * d * e;
                break;
            case "5-6":
                re = a * b * c * d * e + a * b * c * d + a * b * c * e + a * b * d * e + a * c * d * e + b * c * d * e;
                break;
            case "5-10":
                re = a * b + a * c + a * d + a * e + b * c + b * d + b * e + c * d + c * e + d * e;
                break;
            case "5-16":
                re = (a + 1) * (b + 1) * (c + 1) * (d + 1) * (e + 1) - (a * (b + c + d + e + 1) + b * (c + d + e + 1) + c * (d + e + 1) + (d + 1) * (e + 1));
                break;
            case "5-20":
                re = a * b * c + a * b * d + a * b * e + a * c * d + a * c * e + a * d * e + b * c * d + b * c * e + b * d * e + c * d * e + a * b + a * c + a * d + a * e + b * c + b * d + b * e + c * d + c * e + d * e;
                break;
            case "5-26":
                re = (a + 1) * (b + 1) * (c + 1) * (d + 1) * (e + 1) - (a + b + c + d + e + 1);
                break;
            case "5-31":
                re = (a + 1) * (b + 1) * (c + 1) * (d + 1) * (e + 1) - 1;
                break;
            case "6-1":
                re = a * b * c * d * e * f;
                break;
            case "6-6":
                re = a * b * c * d * e + a * b * c * d * f + a * b * c * e * f + a * b * d * e * f + a * c * d * e * f + b * c * d * e * f;
                break;
            case "6-7":
                re = a * b * c * d * e * f + a * b * c * d * e + a * b * c * d * f + a * b * c * e * f + a * b * d * e * f + a * c * d * e * f + b * c * d * e * f;
                break;
            case "6-15":
                re = a * b + a * c + a * d + a * e + a * f + b * c + b * d + b * e + b * f + c * d + c * e + c * f + d * e + d * f + e * f;
                break;
            case "6-20":
                re = a * b * c + a * b * d + a * b * e + a * b * f + a * c * d + a * c * e + a * c * f + a * d * e + a * d * f + a * e * f + b * c * d + b * c * e + b * c * f + b * d * e + b * d * f + b * e * f + c * d * e + c * d * f + c * e * f + d * e * f;
                break;
            case "6-22":
                re = a * b * c * d * e * f + a * b * c * d * e + a * b * c * d * f + a * b * c * e * f + a * b * d * e * f + a * c * d * e * f + b * c * d * e * f + a * b * c * d + a * b * c * e + a * b * c * f + a * b * d * e + a * b * d * f + a * b * e * f + a * c * d * e + a * c * d * f + a * c * e * f + a * d * e * f + b * c * d * e + b * c * d * f + b * c * e * f + b * d * e * f + c * d * e * f;
                break;
            case "6-35":
                re = a * b * c + a * b * d + a * b * e + a * b * f + a * c * d + a * c * e + a * c * f + a * d * e + a * d * f + a * e * f + b * c * d + b * c * e + b * c * f + b * d * e + b * d * f + b * e * f + c * d * e + c * d * f + c * e * f + d * e * f + a * b + a * c + a * d + a * e + a * f + b * c + b * d + b * e + b * f + c * d + c * e + c * f + d * e + d * f + e * f;
                break;
            case "6-42":
                re = (a + 1) * (b + 1) * (c + 1) * (d + 1) * (e + 1) * (f + 1) - (a * (b + c + d + e + f + 1) + b * (c + d + e + f + 1) + c * (d + e + f + 1) + d * (e + f + 1) + (e + 1) * (f + 1));
                break;
            case "6-50":
                re = (a + 1) * (b + 1) * (c + 1) * (d + 1) * (e + 1) * (f + 1) - (a + b + c + d + e + f + 1) - (a * b * c * d * e + a * b * c * d * f + a * b * c * e * f + a * b * d * e * f + a * c * d * e * f + b * c * d * e * f + a * b * c * d * e * f);
                break;
            case "6-57":
                re = (a + 1) * (b + 1) * (c + 1) * (d + 1) * (e + 1) * (f + 1) - (a + b + c + d + e + f + 1);
                break;
            case "6-63":
                re = (a + 1) * (b + 1) * (c + 1) * (d + 1) * (e + 1) * (f + 1) - 1;
                break;
            case "7-1":
                re = a * b * c * d * e * f * g;
                break;
            case "7-7":
                re = a * b * c * d * e * f + a * b * c * d * e * g + a * b * c * d * f * g + a * b * c * e * f * g + a * b * d * e * f * g + a * c * d * e * f * g + b * c * d * e * f * g;
                break;
            case "7-8":
                re = a * b * c * d * e * f * g + a * b * c * d * e * f + a * b * c * d * e * g + a * b * c * d * f * g + a * b * c * e * f * g + a * b * d * e * f * g + a * c * d * e * f * g + b * c * d * e * f * g;
                break;
            case "7-21":
                re = a * b * c * d * e + a * b * c * d * f + a * b * c * d * g + a * b * c * e * f + a * b * c * e * g + a * b * c * f * g + a * b * d * e * f + a * b * d * e * g + a * b * d * f * g + a * b * e * f * g + a * c * d * e * f + a * c * d * e * g + a * c * d * f * g + a * c * e * f * g + a * d * e * f * g + b * c * d * e * f + b * c * d * e * g + b * c * d * f * g + b * c * e * f * g + b * d * e * f * g + c * d * e * f * g;
                break;
            case "7-35":
                re = a * b * c * d + a * b * c * e + a * b * c * f + a * b * c * g + a * b * d * e + a * b * d * f + a * b * d * g + a * b * e * f + a * b * e * g + a * b * f * g + a * c * d * e + a * c * d * f + a * c * d * g + a * c * e * f + a * c * e * g + a * c * f * g + a * d * e * f + a * d * e * g + a * d * f * g + a * e * f * g + b * c * d * e + b * c * d * f + b * c * d * g + b * c * e * f + b * c * e * g + b * c * f * g + b * d * e * f + b * d * e * g + b * d * f * g + b * e * f * g + c * d * e * f + c * d * e * g + c * d * f * g + c * e * f * g + d * e * f * g;
                break;
            case "7-120":
                re = (a + 1) * (b + 1) * (c + 1) * (d + 1) * (e + 1) * (f + 1) * (g + 1) - (a + b + c + d + e + f + g + 1);
                break;
            case "8-1":
                re = a * b * c * d * e * f * g * h;
                break;
            case "8-8":
                re = a * b * c * d * e * f * g + a * b * c * d * e * f * h + a * b * c * d * e * g * h + a * b * c * d * f * g * h + a * b * c * e * f * g * h + a * b * d * e * f * g * h + a * c * d * e * f * g * h + b * c * d * e * f * g * h;
                break;
            case "8-9":
                re = a * b * c * d * e * f * g * h + a * b * c * d * e * f * g + a * b * c * d * e * f * h + a * b * c * d * e * g * h + a * b * c * d * f * g * h + a * b * c * e * f * g * h + a * b * d * e * f * g * h + a * c * d * e * f * g * h + b * c * d * e * f * g * h;
                break;
            case "8-28":
                re = a * b * c * d * e * f + a * b * c * d * e * g + a * b * c * d * e * h + a * b * c * d * f * g + a * b * c * d * f * h + a * b * c * d * g * h + a * b * c * e * f * g + a * b * c * e * f * h + a * b * c * e * g * h + a * b * c * f * g * h + a * b * d * e * f * g + a * b * d * e * f * h + a * b * d * e * g * h + a * b * d * f * g * h + a * b * e * f * g * h + a * c * d * e * f * g + a * c * d * e * f * h + a * c * d * e * g * h + a * c * d * f * g * h + a * c * e * f * g * h + a * d * e * f * g * h + b * c * d * e * f * g + b * c * d * e * f * h + b * c * d * e * g * h + b * c * d * f * g * h + b * c * e * f * g * h + b * d * e * f * g * h + c * d * e * f * g * h;
                break;
            case "8-56":
                re = a * b * c * d * e + a * b * c * d * f + a * b * c * d * g + a * b * c * d * h + a * b * c * e * f + a * b * c * e * g + a * b * c * e * h + a * b * c * f * g + a * b * c * f * h + a * b * c * g * h + a * b * d * e * f + a * b * d * e * g + a * b * d * e * h + a * b * d * f * g + a * b * d * f * h + a * b * d * g * h + a * b * e * f * g + a * b * e * f * h + a * b * e * g * h + a * b * f * g * h + a * c * d * e * f + a * c * d * e * g + a * c * d * e * h + a * c * d * f * g + a * c * d * f * h + a * c * d * g * h + a * c * e * f * g + a * c * e * f * h + a * c * e * g * h + a * c * f * g * h + a * d * e * f * g + a * d * e * f * h + a * d * e * g * h + a * d * f * g * h + a * e * f * g * h + b * c * d * e * f + b * c * d * e * g + b * c * d * e * h + b * c * d * f * g + b * c * d * f * h + b * c * d * g * h + b * c * e * f * g + b * c * e * f * h + b * c * e * g * h + b * c * f * g * h + b * d * e * f * g + b * d * e * f * h + b * d * e * g * h + b * d * f * g * h + b * e * f * g * h + c * d * e * f * g + c * d * e * f * h + c * d * e * g * h + c * d * f * g * h + c * e * f * g * h + d * e * f * g * h;
                break;
            case "8-70":
                re = a * b * c * d + a * b * c * e + a * b * c * f + a * b * c * g + a * b * c * h + a * b * d * e + a * b * d * f + a * b * d * g + a * b * d * h + a * b * e * f + a * b * e * g + a * b * e * h + a * b * f * g + a * b * f * h + a * b * g * h + a * c * d * e + a * c * d * f + a * c * d * g + a * c * d * h + a * c * e * f + a * c * e * g + a * c * e * h + a * c * f * g + a * c * f * h + a * c * g * h + a * d * e * f + a * d * e * g + a * d * e * h + a * d * f * g + a * d * f * h + a * d * g * h + a * e * f * g + a * e * f * h + a * e * g * h + a * f * g * h + b * c * d * e + b * c * d * f + b * c * d * g + b * c * d * h + b * c * e * f + b * c * e * g + b * c * e * h + b * c * f * g + b * c * f * h + b * c * g * h + b * d * e * f + b * d * e * g + b * d * e * h + b * d * f * g + b * d * f * h + b * d * g * h + b * e * f * g + b * e * f * h + b * e * g * h + b * f * g * h + c * d * e * f + c * d * e * g + c * d * e * h + c * d * f * g + c * d * f * h + c * d * g * h + c * e * f * g + c * e * f * h + c * e * g * h + c * f * g * h + d * e * f * g + d * e * f * h + d * e * g * h + d * f * g * h + e * f * g * h;
                break;
            case "8-247":
                re = (a + 1) * (b + 1) * (c + 1) * (d + 1) * (e + 1) * (f + 1) * (g + 1) * (h + 1) - (a + b + c + d + e + f + g + h + 1);
                break;
            case "9-1":
                re = a * b * c * d * e * f * g * h * i;
                break;
            case "10-1":
                re = a * b * c * d * e * f * g * h * i * j;
                break;
            case "11-1":
                re = a * b * c * d * e * f * g * h * i * j * k;
                break;
            case "12-1":
                re = a * b * c * d * e * f * g * h * i * j * k * l;
                break;
            case "13-1":
                re = a * b * c * d * e * f * g * h * i * j * k * l * m;
                break;
            case "14-1":
                re = a * b * c * d * e * f * g * h * i * j * k * l * m * n;
                break;
            case "15-1":
                re = a * b * c * d * e * f * g * h * i * j * k * l * m * n * o;
                break;
            default:
                break;
        }
        return re;
    };

    var subsectionArray = function (arr, len) {
        var re = new Array();
        if (arr.length < len || len < 1) {
            return re;
        } else if (arr.length == len) {
            re[0] = arr;
            return re;
        }
        if (len == 1) {
            for (var i in arr) {
                re[i] = new Array();
                re[i][0] = arr[i];
            }
            return re;
        }
        if (len > 1) {
            var st = 0;
            var end = len - 1;
            var suitC = Math.ceil(arr.length / len);
            for (var i = 0; i < suitC; i++) {
                var a = new Array();
                var sid = i * len;
                var eid = (i + 1) * len - 1;
                if (sid < arr.length) {
                    if (eid >= arr.length) {
                        eid = arr.length - 1;
                        sid = arr.length - len;
                    }
                    for (var j = sid; j <= eid; j++) {
                        a[a.length] = arr[j];
                    }
                    re[re.length] = a;
                }
            }
        }
        return re;
    };

    var combineArray = function (arr, len) {
        var re = new Array();
        arr.sort(asc);
        if (arr.length < len || len < 1) {
            return re;
        } else if (arr.length == len) {
            re[0] = arr;
            return re;
        }
        if (len == 1) {
            for (var i in arr) {
                re[i] = new Array();
                re[i][0] = arr[i];
            }
            return re;
        }
        if (len > 1) {
            for (var i in arr) {
                var arr_b = new Array();
                for (var j in arr) {
                    if (j > i) arr_b[arr_b.length] = arr[j];
                }
                var s = combineArray(arr_b, len - 1);
                if (s.length > 0) {
                    for (var k in s) {
                        var p = s[k];
                        p[p.length] = arr[i];
                        p.sort(asc);
                        re[re.length] = p;
                    }
                }
            }
        }
        return re;
    };

    /********* 最大，最小奖金计算 *********/

    /**
     * 获取混投的注数最小最大奖金
     * @param ways
     * @param optArr
     * @param spArr
     * @param agcg
     * @param mul
     * @return {Object}
     */
    var getMixMinMaxPrize = function (ways, optArr, spArr, agcg, mul) {
        var minJi = 0;
        var maxJi = 0; //所有最高单注奖金的总和
        var allNoteCount = 0;

        //得到ptList 每一个过关方式的最大过关数
        var ptList = MaxMinC(ways);

        var lotList = new Array();
        for (var k = 0; k < ptList.length; k++) {
            var matchList = new Array();
            for (var m in optArr) {
                matchList.push(m);
            }

            //得到这个过关方式的组合 的push到这个list集合fonList
            fonList = [];
            fonList = fastGroupNum("", 1, 1, ptList[k], matchList.length);
            for (var l = 0; l < fonList.length; l++) {
                var subLotList = new Array();
                var changCiList = fonList[l].split(',');
                for (var n = 0; n < changCiList.length; n++)
                    subLotList.push(matchList[parseInt(changCiList[n], 10) - 1]);
                lotList.push(subLotList);
            }
        }
        for (var i = 0; i < lotList.length; i++) {
            var subLot = lotList[i];//1,2就是表示计算第二场和第三场组成
            //组合每个混合过关玩法
            var oriCombineList = new Array();
            for (var k = 0; k < subLot.length; k++) {
                oriCombineList.push(agcg[subLot[k]]);
            }
            var tt = combine(oriCombineList);
            var lotMixSplitList = new Array();
            for (var k = 0; k < tt.length; k++) {
                var curArray = tt[k].split(',');
                lotMixSplitList.push(curArray);
            }
            lotMixSplitList = distinct(lotMixSplitList);
            var validCount = 0;//有效的注数，如果全部都被去除就是0;
            for (var h = 0; h < lotMixSplitList.length; h++) {
                var subLotCount = 1;
                var minSubJi = 1;
                var tempSpMaxArray = [];
                var minMatch = "";
                var maxMatch = "";
                for (var k = 0; k < subLot.length; k++) {
                    var maxSubOdds = 0;
                    var minSubOdds = 0;
                    var subValidCount = 0;
                    //subLot[k]某一场比赛的index
                    //计算某场比赛的最大和最小赔率
                    for (var m = 0; m < spArr[subLot[k]].length; m++) {
                        if (lotMixSplitList[h][k] != agcg[subLot[k]][m]) continue;
                        subValidCount++;
                        var spz = spArr[subLot[k]][m];
                        if (minSubOdds == 0) minSubOdds = spz;
                        minSubOdds = Math.min(minSubOdds, spz);
                        if (maxSubOdds == 0) maxSubOdds = spz;
                        maxSubOdds = Math.max(maxSubOdds, spz);
                    }
                    minSubJi *= minSubOdds;
                    maxSubOdds = maxSubOdds.toFixed(2);
                    tempSpMaxArray.push(maxSubOdds.toString().replace(".", ""));
                    subLotCount *= subValidCount; //注数
                }
                if (subLotCount > 0) {
                    if (minJi == 0) {
                        minJi = (minSubJi * 2 * 100) / 100;
                        minJi = cauScale(2, minJi);
                    }
                    else
                        minJi = Math.min(minJi, cauScale(2, (minSubJi * 2 * 100) / 100));
                    var singleAward = eval(tempSpMaxArray.join("*")) * 2 / Math.pow(10, tempSpMaxArray.length * 2); //单注奖金
                    singleAward = cauScale(2, singleAward); //四舍六入五成双
                    maxJi = add(maxJi, singleAward);
                    allNoteCount += subLotCount;
                }
            }
        }

        var maxPrize = parseFloat(maxJi).toFixed(2);
        var minPrize = parseFloat(minJi).toFixed(2);

        return {
            min:cauScale(2, minPrize * mul),
            max:cauScale(2, maxPrize * mul)
        };
    };

    //返回选择的过关方式的最大关数和最小关数
    var MaxMinC = function (pTypeList) {
        var ptList = [];
        for (var i = 0; i < pTypeList.length; i++) {
            var subPType = pTypeList[i];
            var max = parseInt(subPType.replace(/\d+_\d+/gi, "$1")); //最大关数
            var min = parseInt(subPType.replace(/\d+_\d+/gi, "$1"));
            if (subPType == "2-3") {
                min = 1;
            } else if (subPType == "3-3") {
                min = 2;
                max = 2;
            } else if (subPType == "3-4") {
                min = 2;
            } else if (subPType == "3-7") {
                min = 1;
            } else if (subPType == "4-4") {
                min = 3;
                max = 3;
            } else if (subPType == "4-5") {
                min = 3;
            } else if (subPType == "4-6") {
                min = 2;
                max = 2;
            } else if (subPType == "4-11") {
                min = 2;
            } else if (subPType == "4-15") {
                min = 1;
            } else if (subPType == "5-5") {
                min = 4;
                max = 4;
            } else if (subPType == "5-6") {
                min = 4;
            } else if (subPType == "5-10") {
                min = 2;
                max = 2;
            } else if (subPType == "5-16") {
                min = 3;
            } else if (subPType == "5-20") {
                min = 2;
                max = 3;
            } else if (subPType == "5-26") {
                min = 2;
            } else if (subPType == "5-31") {
                min = 1;
            } else if (subPType == "6-6") {
                min = 5;
                max = 5;
            } else if (subPType == "6-7") {
                min = 5;
            } else if (subPType == "6-15") {
                min = 2;
                max = 2;
            } else if (subPType == "6-20") {
                min = 3;
                max = 3;
            } else if (subPType == "6-22") {
                min = 4;
            } else if (subPType == "6-35") {
                min = 2;
                max = 3;
            } else if (subPType == "6-42") {
                min = 3;
            } else if (subPType == "6-50") {
                min = 2;
                max = 4;
            } else if (subPType == "6-57") {
                min = 2;
            } else if (subPType == "6-63") {
                min = 1;
            } else if (subPType == "7-7") {
                min = 6;
                max = 6;
            } else if (subPType == "7-8") {
                min = 6;
            } else if (subPType == "7-21") {
                min = 5;
                max = 5;
            } else if (subPType == "7-35") {
                min = 4;
                max = 4;
            } else if (subPType == "7-120") {
                min = 2;
            } else if (subPType == "8-8") {
                min = 7;
                max = 7;
            } else if (subPType == "8-9") {
                min = 7;
            } else if (subPType == "8-28") {
                min = 6;
                max = 6;
            } else if (subPType == "8-56") {
                min = 5;
                max = 5;
            } else if (subPType == "8-70") {
                min = 4;
                max = 4;
            } else if (subPType == "8-247") {
                min = 2;
            }
            for (var k = min; k <= max; k++)
                ptList.push(k);
        }
        return ptList;
    };

    var fonList = [];
    var fastGroupNum = function (s, i, d, NumberLen, Numbers) {
        for (var n = i; n < Numbers - NumberLen + d + 1; n++) {
            if (d == NumberLen) {
                fonList.push(s + n);
            }
            else {
                fastGroupNum(s + n + ",", n + 1, d + 1, NumberLen, Numbers);
            }
        }
        return fonList;
    };

    /**
     * 得到所有的组合
     * @param s
     * @return {*}
     */
    var combine = function (s) {
        var temp = s[0];
        for (var i = 1; i < s.length; i++) {
            temp = multiplication(temp, s[i]);
        }
        return temp;
    };

    var multiplication = function (a, b) {
        var result = new Array();
        for (var i = 0; i < a.length; i++) {
            for (var j = 0; j < b.length; j++) {
                result.push(a[i] + "," + b[j]);
            }
        }
        return result;
    };

    /**
     * 去除重复的
     * @param objh
     * @return {Array}
     */
    var distinct = function (objh) {
        var sameObj = function (a, b) {
            var tag = true;
            if (!a || !b)
                return false;
            for (var x in a) {
                if (!b[x])
                    return false;
                if (typeof(a[x]) === 'object') {
                    tag = sameObj(a[x], b[x]);
                } else {
                    if (a[x] !== b[x])
                        return false;
                }
            }
            return tag;
        };
        var newArr = [],
            obj = {};
        for (var i = 0, len = objh.length; i < len; i++) {
            if (!sameObj(obj[typeof(objh[i]) + objh[i]], objh[i])) {
                newArr.push(objh[i]);
                obj[typeof(objh[i]) + objh[i]] = objh[i];
            }
        }
        return newArr;
    };

    /**
     * 获取单一投注方式的最小最大金额
     * @param ways 过关数组
     * @param optArr 选中的场数
     * @param danNOs 胆
     * @param spArr sp 对象数组
     * @param mul 倍数
     */
    var getMinMaxPrize = function (ways, optArr, danNOs, spArr, mul) {
        var minPrize = 0, maxPrize = 0;

        var minArr = [];
        var minPassCount = new Array(0, 0, 0, 0, 0, 0, 0, 0, 0);  //用于普通过关计算最小
        var min = 1000;

        for (var i = 0, len = ways.length; i < len; i++) {
            var passWay = ways[i];
            var passType = ptHash[passWay];
            var minPass = passType.passMatch[0];
            min = min < minPass ? min : minPass;
        }

        var cc = 0;//最小奖金出现的次数
        for (var i = 0, len = ways.length; i < len; i++) {
            var passWay = ways[i];
            // 是否是串1
            var isDC = passWay.split("-")[1] != 1;
            var passType = ptHash[passWay];
            var minPass = passType.passMatch[0];
            minPassCount[minPass]++;
            var arr = estimate(passWay, min, optArr, spArr, danNOs);
            arr[0] = cauScale(2, arr[0]);
            minArr.push(cauScale(2, multiply(arr[0], mul)));
            var maxAwardArray = arr[1];
            for (var k = 0; k < maxAwardArray.length; k++) {
                var maxAward = cauScale(2, maxAwardArray[k]); //四舍六入五成双
                maxPrize = add(maxPrize, cauScale(2, multiply(maxAward, mul)));
            }
            maxPrize = cauScale(2, maxPrize);
            if (isDC) {
                cc += arr[2];
            }
        }
        minArr.sort(asc);


        if (cc != 0) {
            minPrize = minArr[0] * cc;
        } else {
            minPrize = minArr[0] * minPassCount[min];
        }

        return {
            min:minPrize,
            max:maxPrize
        };
    };

    var estimate = function (way, minPassAll, optArr, spArr, danNOs) {
        var passType = ptHash[way];
        var minPass = passType.passMatch[0];
        // 是否是串1
        var mp = parseInt(way.split("-")[1]) == 1;

        /*取出所有的奖金数组*/
        var minArr = [];
        var maxArr = [];
        var danMinArr = [];
        var danMaxArr = [];
        var minAward;
        var maxAwardArray = [];
        var minTimes = 0;//最小奖金重复次数

        if (mp) {
            for (var k in optArr) {
                var spVArr = spArr[k];
                if (danNOs[k]) {
                    danMinArr.push(spVArr[0]);
                    danMaxArr.push(spVArr[spVArr.length - 1]);
                } else {
                    minArr.push(spVArr[0]);
                    maxArr.push(spVArr[spVArr.length - 1]);
                }
            }
        } else {
            for (var k in optArr) {
                var spVArr = spArr[k];
                minArr.push(spVArr[0]);
                maxArr.push(spVArr[spVArr.length - 1]);
            }
        }
        if (minArr.length != maxArr.length) {
            console.log("数据出错，请联系客服人员");
            return [0, 0];
        }
        minArr.sort(asc);
        maxArr.sort(desc);
        if (mp) {
            var pass = minPass;
            var danSize = danMinArr.length;
            var unDanSize = minArr.length;
            danMinArr.sort(asc);
            /* 模糊定胆 */
            var danMinHit = danSize;

            minAward = 1;
            var spzArr = [];
            for (var i = 0; i < danMinHit; i++) {
                var spz = danMinArr[i].toString();
                spzArr.push(spz.substring(spz.indexOf(".") + 1, spz.length).length < 2 ? spz.replace(".", "") + "0" : spz.toString().replace(".", ""));
            }
            var min_arr = [];
            for (var i = danMinHit; i < danSize; i++) {
                min_arr.push(danMinArr[i]);
            }
            min_arr = min_arr.concat(minArr);
            min_arr.sort(asc);
            var len = pass - danMinHit;
            for (var i = 0; i < len; i++) {
                var spz = min_arr[i].toString();
                spzArr.push(spz.substring(spz.indexOf(".") + 1, spz.length).length < 2 ? spz.replace(".", "") + "0" : spz.toString().replace(".", ""));
            }
            minAward = eval(spzArr.join("*")) * 2 / Math.pow(10, spzArr.length * 2);
            var countMaxFn = function (dan) {
                C3(danSize, dan, function (comb1, n1, m1) {
                    var award = 1;
                    var award3 = 1;
                    var tempArr = [];
                    var danTempArr = []; //胆
                    var pos = 0;
                    for (var k = 0; k < n1; k++) {
                        if (comb1[k] == true) {
                            var spz = danMaxArr[k].toString();
                            danTempArr.push(spz.substring(spz.indexOf(".") + 1, spz.length).length < 2 ? spz.replace(".", "") + "0" : spz.toString().replace(".", ""));
                            pos++;
                            if (pos == m1)
                                break;
                        }
                    }
                    C3(unDanSize, pass - m1, function (comb2, n2, m2) {
                        var award2 = award;
                        var pos2 = 0;
                        for (var k2 = 0; k2 < n2; k2++) {
                            if (comb2[k2] == true) {
                                var spz = maxArr[k2].toString();
                                tempArr.push(spz.substring(spz.indexOf(".") + 1, spz.length).length < 2 ? spz.replace(".", "") + "0" : spz.toString().replace(".", ""));
                                pos2++;
                                if (pos2 == m2)
                                    break;
                            }
                        }
                        tempArr = tempArr.concat(danTempArr);
                        award3 = eval(tempArr.join("*")) * 2 / Math.pow(10, tempArr.length * 2);
                        tempArr = [];
                        maxAwardArray.push(award3);
                    });
                });
            };
            for (var dan = danMinHit; dan <= danSize; dan++) {
                countMaxFn(dan);
            }
        } else {
            var spzArr = [];
            minAward = 1;
            for (var i = 0; i < minPass; i++) {
                var spz = minArr[i].toString();
                spzArr.push(spz.substring(spz.indexOf(".") + 1, spz.length).length < 2 ? spz.replace(".", "") + "0" : spz.toString().replace(".", ""));
            }
            minAward = eval(spzArr.join("*")) * 2 / Math.pow(10, spzArr.length * 2);
            var lotC = parseInt(way.split("-")[0]);
            var maxTempArr;
            var flag = false;

            C3(maxArr.length, lotC, function (comb1, n, m) {
                for (var i = 0; i < minPassAll & minPassAll == minPass; i++) {
                    if (!comb1[comb1.length - i - 1]) {
                        flag = false;
                        break;
                    } else {
                        flag = true;
                    }
                }
                if (flag) {
                    minTimes++;
                }
                maxTempArr = [];
                for (var j = 0; j < comb1.length; j++) {   //临时的赔率最大,串小于场数组合场次的SP存入数组
                    if (comb1[j]) {
                        maxTempArr.push(maxArr[j]);
                    }
                }
                for (var i = 0, l = passType.passMatch.length; i < l; i++) {
                    if (passType.passMatch[i] == lotC) {
                        var award = 1;
                        var tempArray = [];
                        var pos = 0;
                        for (var k = 0; k < maxArr.length; k++) {
                            if (comb1[k] == true) {
                                var spz = maxArr[k].toString();
                                tempArray.push(spz.substring(spz.indexOf(".") + 1, spz.length).length < 2 ? spz.replace(".", "") + "0" : spz.toString().replace(".", ""));
                                pos++;
                                if (pos == m)
                                    break;
                            }
                        }
                        award = eval(tempArray.join("*")) * 2 / Math.pow(10, tempArray.length * 2);
                        maxAwardArray.push(award);
                    } else {//小于串的情况继续拆
                        C3(lotC, passType.passMatch[i], function (comb2, n, m) {
                            var award = 1;
                            var tempArray = [];
                            var pos = 0;
                            for (var k = 0; k < n; k++) {
                                if (comb2[k] == true) {
                                    var spz = maxTempArr[k].toString();
                                    tempArray.push(spz.substring(spz.indexOf(".") + 1, spz.length).length < 2 ? spz.replace(".", "") + "0" : spz.toString().replace(".", ""));
                                    pos++;
                                    if (pos == m)
                                        break;
                                }
                            }
                            award = eval(tempArray.join("*")) * 2 / Math.pow(10, tempArray.length * 2);
                            maxAwardArray.push(award);
                        });
                    }
                }
            });
        }
        /*算出来的最大最小奖金开始进行计算*/
        return [minAward, maxAwardArray, minTimes];
    };
    /**
     * 四舍六入五成双 - 奖金计算方式
     * @param mod 精度-要处理的小数点位数（ 值必须大于0）
     * @param big 处理值（值必须大于0）
     * @return
     */
    var cauScale = function (mod, big) {
        if (mod <= 0) return big;
        if (big <= 0) return big;
        var mathStr = big.toString();
        var dian = mathStr.indexOf(".");
        if (dian > 0 && mathStr.length - dian - 1 > mod) {
            var base = mathStr.substring(0, dian);
            var address = mathStr.substring(dian + 1, mathStr.length);
            if (address.length <= mod) {
                base = base + "." + address;
            } else if (address.length >= mod + 1) {
                var v = parseInt(address.substring(mod, mod + 1), 10);//精确位小数后一位
                var v1 = parseInt(address.substring(mod - 1, mod), 10);//精确位小数。
                var m = 0;

                if (v >= 6) { //精确位后大于等于6，精确位进一
                    m++;
                } else if (v <= 4) {//精确位后小于等于4，精确位后舍弃
                } else if (v == 5 && address.length > mod + 1) {//精确位后为5时，精确位后一位还有其他值，精确位进一
                    m++;
                } else if (v == 5 && v1 % 2 == 0) {//精确位后为5时，精确位前为偶时，精确位后一位舍弃。
                } else if (v == 5 && v1 % 2 == 1) {//精确位后为5时，精确位前为奇时，精确位进一
                    m++;
                }
                var s = address.substring(0, mod - 1);
                var fl = s + v1;
                if (m > 0 && parseInt(s, 10) > 0) {
                    fl = parseInt(fl, 10) + 1;
                    if (fl >= Math.pow(10, mod)) {
                        base = parseInt(base, 10) + 1;
                        fl = fl % 100;
                    }
                    big = base.toString() + "." + fl.toString();
                }
                else if (m > 0 && parseInt(s, 10) == 0) {
                    fl = v1 + 1;
                    if (fl >= Math.pow(10, mod)) {
                        base = parseInt(base, 10) + 1;
                        fl = fl % 100;
                    } else if (fl < 10) {
                        var tempFl = '';
                        for (var k = 0; k < mod - 1; k++) {
                            tempFl += '0';
                        }
                        fl = tempFl + fl;
                    } else if (fl == 10) {
                        var tempFl = '';
                        for (var k = 0; k < mod - 2; k++) {
                            tempFl += '0';
                        }
                        fl = tempFl + fl;
                    }
                    big = base.toString() + "." + fl.toString();
                } else {
                    big = base + "." + fl;
                }
            }
        }
        return big;
    };

    var C3 = function (n, m, callbackFn) {
        if (m < 0 || m > n) {
            return;
        }
        var bs = [];
        for (var i = 0; i < m; i++) {
            bs[i] = true;
        }
        if (n == m) {
            callbackFn(bs, n, m);
            return;
        }
        for (var i = m; i < n; i++) {
            bs[i] = false;
        }
        if (m == 0) {
            callbackFn(bs, n, m);
            return;
        }
        var flag = true;
        var tempFlag = false;
        var pos = 0;
        var sum = 0;
        do {
            sum = 0;
            pos = 0;
            tempFlag = true;
            callbackFn(bs, n, m);

            for (var i = 0; i < n - 1; i++) {
                if (bs[i] == true && bs[i + 1] == false) {
                    bs[i] = false;
                    bs[i + 1] = true;
                    pos = i;
                    break;
                }
            }

            for (var i = 0; i < pos; i++) {
                if (bs[i] == true) {
                    sum++;
                }
            }
            for (var i = 0; i < pos; i++) {
                if (i < sum) {
                    bs[i] = true;
                } else {
                    bs[i] = false;
                }
            }

            for (var i = n - m; i < n; i++) {
                if (bs[i] == false) {
                    tempFlag = false;
                    break;
                }
            }
            if (tempFlag == false) {
                flag = true;
            } else {
                flag = false;
            }
        } while (flag);
        callbackFn(bs, n, m);
    };

    /**
     * 加法
     * @param s1
     * @param s2
     * @return {Number}
     */
    var add = function (s1, s2) {
        var r1, r2, m;
        try {
            r1 = s1.toString().split(".")[1].length;
        } catch (e) {
            r1 = 0;
        }
        try {
            r2 = s2.toString().split(".")[1].length;
        } catch (e) {
            r2 = 0;
        }
        m = Math.pow(10, Math.max(r1, r2));
        return (s1 * m + s2 * m) / m;
    };

    /**
     * 乘法
     * @param s1
     * @param s2
     * @return {Number}
     */
    var multiply = function (s1, s2) {
        var m = 0, s1 = s1.toString(), s2 = s2.toString();
        try {
            m += s1.split(".")[1].length;
        } catch (e) {
        }
        try {
            m += s2.split(".")[1].length;
        } catch (e) {
        }
        return Number(s1.replace(".", "")) * Number(s2.replace(".", "")) / Math.pow(10, m);
    };

    /**
     * 供数组排序用，降序
     * @param x
     * @param y
     * @return {Number}
     */
    var desc = function (x, y) {
        var a = parseFloat(x), b = parseFloat(y);
        if (a >= b) {
            return -1;
        }
        if (a < b) {
            return 1;
        }
    };

    /**
     * 供数组排序用，升序
     * @param x
     * @param y
     * @return {Number}
     */
    var asc = function (x, y) {
        var a = parseFloat(x), b = parseFloat(y);
        if (a > b) {
            return 1;
        }
        if (a <= b) {
            return -1;
        }
    };

    var ptHash = {
        '1':{key:'1', units:1, matchCount:1, passMatch:[1], text:'单关', value:1},
        '2-1':{key:'2-1', units:1, matchCount:2, passMatch:[2], text:'2x1', value:2},
        '3-1':{key:'3-1', units:1, matchCount:3, passMatch:[3], text:'3x1', value:4},
        '3-3':{key:'3-3', units:3, matchCount:3, passMatch:[2], text:'3x3', value:8},
        '3-4':{key:'3-4', units:4, matchCount:3, passMatch:[2, 3], text:'3x4', value:16},
        '4-1':{key:'4-1', units:1, matchCount:4, passMatch:[4], text:'4x1', value:32},
        '4-4':{key:'4-4', units:4, matchCount:4, passMatch:[3], text:'4x4', value:64},
        '4-5':{key:'4-5', units:5, matchCount:4, passMatch:[3, 4], text:'4x5', value:128},
        '4-6':{key:'4-6', units:6, matchCount:4, passMatch:[2], text:'4x6', value:256},
        '4-11':{key:'4-11', units:11, matchCount:4, passMatch:[2, 3, 4], text:'4x11', value:512},
        '5-1':{key:'5-1', units:1, matchCount:5, passMatch:[5], text:'5x1', value:1024},
        '5-5':{key:'5-5', units:5, matchCount:5, passMatch:[4], text:'5x5', value:2048},
        '5-6':{key:'5-6', units:6, matchCount:5, passMatch:[4, 5], text:'5x6', value:4096},
        '5-10':{key:'5-10', units:10, matchCount:5, passMatch:[2], text:'5x10', value:8192},
        '5-16':{key:'5-16', units:16, matchCount:5, passMatch:[3, 4, 5], text:'5x16', value:16384},
        '5-20':{key:'5-20', units:20, matchCount:5, passMatch:[2, 3], text:'5x20', value:32768},
        '5-26':{key:'5-26', units:26, matchCount:5, passMatch:[2, 3, 4, 5], text:'5x26', value:65536},
        '6-1':{key:'6-1', units:1, matchCount:6, passMatch:[6], text:'6x1', value:131072},
        '6-6':{key:'6-6', units:6, matchCount:6, passMatch:[5], text:'6x6', value:262144},
        '6-7':{key:'6-7', units:7, matchCount:6, passMatch:[5, 6], text:'6x7', value:524288},
        '6-15':{key:'6-15', units:15, matchCount:6, passMatch:[2], text:'6x15', value:1048576},
        '6-20':{key:'6-20', units:20, matchCount:6, passMatch:[3], text:'6x20', value:2097152},
        '6-22':{key:'6-22', units:22, matchCount:6, passMatch:[4, 5, 6], text:'6x22', value:4194304},
        '6-35':{key:'6-35', units:35, matchCount:6, passMatch:[2, 3], text:'6x35', value:8388608},
        '6-42':{key:'6-42', units:42, matchCount:6, passMatch:[3, 4, 5, 6], text:'6x42', value:16777216},
        '6-50':{key:'6-50', units:50, matchCount:6, passMatch:[2, 3, 4], text:'6x50', value:33554432},
        '6-57':{key:'6-57', units:57, matchCount:6, passMatch:[2, 3, 4, 5, 6], text:'6x57', value:67108864},
        '7-1':{key:'7-1', units:1, matchCount:7, passMatch:[7], text:'7x1', value:134217728},
        '7-7':{key:'7-7', units:7, matchCount:7, passMatch:[6], text:'7x7', value:268435456},
        '7-8':{key:'7-8', units:8, matchCount:7, passMatch:[6, 7], text:'7x8', value:536870912},
        '7-21':{key:'7-21', units:21, matchCount:7, passMatch:[5], text:'7x21', value:1073741824},
        '7-35':{key:'7-35', units:35, matchCount:7, passMatch:[4], text:'7x35', value:-2147483648},
        '7-120':{key:'7-120', units:120, matchCount:7, passMatch:[2, 3, 4, 5, 6, 7], text:'7x120', value:1},
        '8-1':{key:'8-1', units:1, matchCount:8, passMatch:[8], text:'8x1', value:2},
        '8-8':{key:'8-8', units:8, matchCount:8, passMatch:[7], text:'8x8', value:4},
        '8-9':{key:'8-9', units:9, matchCount:8, passMatch:[7, 8], text:'8x9', value:8},
        '8-28':{key:'8-28', units:28, matchCount:8, passMatch:[6], text:'8x28', value:16},
        '8-56':{key:'8-56', units:56, matchCount:8, passMatch:[5], text:'8x56', value:32},
        '8-70':{key:'8-70', units:70, matchCount:8, passMatch:[4], text:'8x70', value:64},
        '8-247':{key:'8-247', units:247, matchCount:8, passMatch:[2, 3, 4, 5, 6, 7, 8], text:'8x247', value:128}
    };

    /**
     * 最大串Map
     * @type {Object}
     */
    var maxMap = {
        "sf":{max:8},
        "rfsf":{max:8},
        "dxf":{max:8},
        "sfc":{max:4}
    };

    return {
        getJCLQBetList:getJCLQBetList,
        toBuy:toBuy,
        getProjectDetails:getProjectDetails,
        getHistoryAwards:getHistoryAwards,
        getAwardDetailSP:getAwardDetailSP,
        getNormalWays:getNormalWays,
        getManyWay:getManyWay,
        getBetByCrossWay:getBetByCrossWay,
        getMinMaxPrize:getMinMaxPrize,
        getMixMinMaxPrize:getMixMinMaxPrize,
        desc:desc,
        asc:asc
    };
});
