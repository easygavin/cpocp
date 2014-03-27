define([
    "util/RequestConfig",
    "util/AppConfig"
], function (requestConfig, appConfig) {

    //胆码
    var danNO = {};

    //倍数
    var multipleJq;

    //
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
    var getJCZQAgainstInfo = function (gliveId, callback) {
        var data = {
            "gliveId": gliveId
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
        var user = appConfig.getLocalJson(appConfig.keyMap.LOCAL_USER_INFO_KEY);

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
     * @param lotteryType
     * @param date
     */
    var getHistoryAwards = function (lotteryType, date, callback) {

        // 请求参数
        var data={
            lotteryType: lotteryType,
            date: date
        };

        // 开奖记录
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
     * 获取竞彩足球开奖详情SP值
     * @param matchId
     */
    var getAwardDetailSP = function (matchId, callback) {

        // 请求参数
        var data={
            matchId: matchId
        };

        // 开奖记录
        $.ajax({
            type: "GET",
            url: requestConfig.request.JCZQ_SP_LOTTERY,
            data: {data: JSON.stringify(data)},
            dataType: "jsonp",
            success: callback,
            error: callback
        });
    };

    /**
     * 根据比赛gliveId查询及时比分接口.返回赛事状态.
     * @param item.lotteryId  彩种Id
     * @param item.projectId  方案id
     * @param item.searchType 搜索类型
     * @param item.userId     用户Id
     * @param item.userKey    用户Key
     * @param item.matchId    比赛Id
     * @param item.callback   回调函数..
     */
    var getAliveState = function(item,callback){

        var data = {
            lotteryId:item.lotteryId,
            projectId:item.projectId,
            searchType:item.searchType,
            userId: item.userId,
            userKey:item.userKey,
            matchIdArray:item.matchIdArray
        };

        $.ajax({
               type:"GET",
               url:requestConfig.request.JCZQ_ALIVE,
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

    /**
     * 获取投注相关内容,包括胆,拖码.投注内容--
     * @param flag true or false.
     * @param ggmodeArray  过关模式.单关是数组2-1,3-4 ____多串,混投是单个3-4
     * @param spArr
     * @param danNo
     */

    var collectInfo = function (flag, ggmodeArray, spArr, danNo) {
        var obj = {};
        obj.tuo = [];//拖
        obj.dan = [];//胆
        obj.ggmode = [];//过关方式
        obj.isShowhhgy = false;//不显示单一玩法
        obj.detail = [];//奖金预算
        obj.minArr = [];  //最小奖金
        obj.danMinArr = [];//最小胆奖金
        //选择的过关模式.
        for (var len = 0; len < ggmodeArray.length; len++) {
            obj.ggmode.push(ggmodeArray[len]);
        }

        $(".zckjTab").find("tr").each(function (key) {
            var gameid = $(this).attr("id").substring(2);   //对阵Id,"tzxxF20140301008" m_F20140301008
            var cc = $(this).find(".red");             //对象 <em ltype="spf" xxsort="1" id="F20140301008spf_3" sp="2.04" onclick="clickxx(this)">胜</em>
            var idx = gameid.substring(1);                     //       id   20140301008  <tr sort="20140301008" class="matchinfo" id="tzxxF20140301008"/>
            var item = [], sfp_ = [], jqs_ = [], cbf_ = [], bqc_ = [], rqspf_ = [];
            var sfp_Play = [], jqs_Play = [], cbf_Play = [], bqc_Play = [], rqspf_Play = [];
            var maxmin = [];//一场比赛中的最大最小值
            var hhsp = [];//一场比赛中的所有sp值
            var tempArr = spArr[gameid];
            if (tempArr) {
                if (danNo[gameid]) {
                    obj.danMinArr.push(tempArr[0]);
                } else {
                    obj.minArr.push(tempArr[0]);
                }
            }
            cc.each(function (i, item) {
                var target = $(item);
                var data = target.attr("id").split("_");//spf_3     //pc，F20140301008spf_3    //local,F20140301008_spf_3_2.11_-1
                var str = target.text();  //胜,让胜.
                var sp = parseFloat(data[3]); //sp值
                var type = data[1];  //胜平负/比分/总进球/半全场
                if (type == 'spf') {
                    sfp_.push(sp);
                    sfp_Play.push(str);
                } else if (type == 'bf') {
                    cbf_.push(sp);
                    cbf_Play.push(str);
                } else if (type == 'zjq') {
                    jqs_.push(sp);
                    jqs_Play.push(str);
                } else if (type == 'bqc') {
                    bqc_.push(sp);
                    bqc_Play.push(str);
                } else if (type == "spfrq") {
                    rqspf_.push(sp);
                    rqspf_Play.push(str);
                }
                hhsp.push(str + "(" + sp + ")");
                maxmin.push(sp);
            });

            //spf_2_3.2|2.8_130118002=3/1
            item.push("spf_" + sfp_.length + "_" + (max(sfp_) + "|" + min(sfp_)) + "_" + idx + "=" + sfp_Play.join("/") + "^" + sfp_.join("/"));
            item.push("jqs_" + jqs_.length + "_" + (max(jqs_) + "|" + min(jqs_)) + "_" + idx + "=" + jqs_Play.join("/") + "^" + jqs_.join("/"));
            item.push("cbf_" + cbf_.length + "_" + (max(cbf_) + "|" + min(cbf_)) + "_" + idx + "=" + cbf_Play.join("/") + "^" + cbf_.join("/"));
            item.push("bqc_" + bqc_.length + "_" + (max(bqc_) + "|" + min(bqc_)) + "_" + idx + "=" + bqc_Play.join("/") + "^" + bqc_.join("/"));
            item.push("rqspf_" + rqspf_.length + "_" + (max(rqspf_) + "|" + min(rqspf_)) + "_" + idx + "=" + rqspf_Play.join("/") + "^" + rqspf_.join("/"));
            var count = [];
            $.each(item, function (i) {
                var v = item[i].split("_");
                if (v[1] > 0) {
                    count.push(item[i]);
                }
            });
            if (danNo[gameid]) {//胆
                obj.dan.push(count);
            } else {//拖
                obj.tuo.push(count);
            }
        });
        return obj;
    };

    /**
     *
     * @param flag        true or false.
     * @param ggmodeArray 过关方式
     * @param spArr       sp值数组..
     * @param danNo       胆码数组.
     * @param multiple     倍数
     * @returns {{count: number, max: number, min: number, tz: Array, o: }}
     */
    var getBetsRelate = function (flag, ggmodeArray, spArr, danNo, multiple) {
        var obj = collectInfo(flag, ggmodeArray, spArr, danNo);
        danNO = danNo;
        var count = 0;                      //数量
        var maxPrice = 0;                   //最大奖金
        var minPrice = 0;                   //最小奖金
        var beishu = multiple;              //倍数
        multipleJq = multiple;              //Handle.getDTG_wl 中使用..
        var gg = obj.ggmode;               //过关模式
        var tuo = obj.tuo;                  //拖码
        var dan = obj.dan;                  //胆码
        var cccount = tuo.length + dan.length;
        var danMinArr = obj.danMinArr;
        var minArr = obj.minArr;
        var touzhu = [];                     //投注时用到
        var isSpfOrRqSpfPlay = isSpfRqspf(obj), MaxChuan, MinChuan, newMaxPirze = [], newMinPirze = [], info;
        if (obj.ggmode.length != 0) {
            if (!isSpfOrRqSpfPlay) {              //只有当前选择的比赛当中,没有1场胜平负才会执行下面.否则跳转到 359行.
                if (gg[0].split("-")[1] == 1) {  //串一的
                    var pass = gg[0].split("-")[0];
                    var danSize = danMinArr.length;
                    var undanSize = minArr.length;
                    danMinArr.sort(asc);
                    /*模糊定胆*/
                    var danMinHit = danSize;
                    var temp2Array = [];
                    for (var i = 0; i < danMinHit; i++) {
                        var spz = danMinArr[i].toString();
                        temp2Array.push(spz.substring(spz.indexOf(".") + 1, spz.length).length < 2 ? spz.replace(".", "") + "0" : spz.toString().replace(".", ""));
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
                        temp2Array.push(spz.substring(spz.indexOf(".") + 1, spz.length).length < 2 ? spz.replace(".", "") + "0" : spz.toString().replace(".", ""));
                    }
                    minPrice = cauScale(2, eval(temp2Array.join("*")) * 2 / Math.pow(10, temp2Array.length * 2));
                } else {
                    //得到最小过关
                    var pass = 1000;
                    for (var i = 0; i < gg.length; i++) {
                        if (allInterFace.passType[gg[i]][0] < pass) {
                            pass = allInterFace.passType[gg[i]][0];
                        }
                    }
                    var danSize = danMinArr.length;
                    var undanSize = minArr.length;
                    danMinArr.sort(asc);
                    /*模糊定胆*/
                    var danMinHit = danSize;
                    var temp2Array = [];
                    for (var i = 0; i < danMinHit; i++) {
                        var spz = danMinArr[i].toString();
                        temp2Array.push(spz.substring(spz.indexOf(".") + 1, spz.length).length < 2 ? spz.replace(".", "") + "0" : spz.toString().replace(".", ""));
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
                        temp2Array.push(spz.substring(spz.indexOf(".") + 1, spz.length).length < 2 ? spz.replace(".", "") + "0" : spz.toString().replace(".", ""));
                    }
                    minPrice = cauScale(2, eval(temp2Array.join("*")) * 2 / Math.pow(10, temp2Array.length * 2));
                    var min = 0;
                    for (var i = 0; i < gg.length; i++) {
                        var m = parseInt(gg[i].split("-")[0]);
                        if (allInterFace.passType[gg[i]][0] == pass) {
                            if (cccount == gg[i].split("-")[0]) {
                                min += parseFloat(minPrice);
                            } else {
                                min += minPrice * (allInterFace.C(cccount - pass, m - pass));     //最小奖乘最小奖重复的次数
                            }
                        }
                    }
                    minPrice = min;
                }
            }
            //如果是胜平负.让球胜平负,单关,....或者是胜平负,让球胜平负混投.都是走下面...
            if (isSpfOrRqSpfPlay) {
                info = Handle.getDTG_wl(gg, "mixbet");
                if (!info.reStart) {
                    maxPrice = info["MaxBonus"];
                    minPrice = info["MinBonus"];
                } else {
                    MaxChuan = info["MaxBonus"];
                    MinChuan = info["MinBonus"];
                }
            }
            for (var i = 0; i < gg.length; i++) {
                var t = gg[i];
                var fs = (t == "1-1" ? [1] : allInterFace.passType[t]);//3*4-->[2,3] //过关方式
                var guoguan_num = t.split("-")[0];//过关的数量(5*1,获得5)
                var guoguan_rep = t.split("-")[1];//过关的数量(5*1,获得1)
                var array = '', arr = [];
                var dan_lenth = dan.length;
                if (dan_lenth > 0) {//有胆
                    var danArray = [];
                    if (dan_lenth == guoguan_num) {//全胆
                        array = eachArr(dan, guoguan_num);
                    } else {
                        var tuoTemp = eachArr(tuo, guoguan_num - dan_lenth);//得到托组合数
                        for (var cc = 0; cc < tuoTemp.length; cc++) {
                            danArray.push(dan.concat(tuoTemp[cc]));//得到胆拖的组合数
                        }
                        array = danArray;
                    }
                } else {
                    array = eachArr(tuo, guoguan_num);
                }
                for (var m = 0, l = array.length; m < l; m++) {//第一次过滤个从复
                    var v = cl(array[m]);

                    arr = arr.concat(v);
                }
                for (var j = 0, jj = fs.length; j < jj; j++) {
                    for (var k = 0, kk = arr.length; k < kk; k++) {
                        var len = eachArr(arr[k], fs[j]);//[["2=1:4.3", "3=1:3.29|3=0:2.7"]]
                        for (var n = 0, nn = len.length; n < nn; n++) {
                            count += multiplyCount(len[n]);//注数
                            if (!isSpfOrRqSpfPlay) {
                                maxPrice += multiplyCount(len[n], "0");//max
                            }
                            else {
                                if (info.reStart) {//多串进这里重新计算理论奖金
                                    var info_s = multiplyNewCount(len[n], MaxChuan, MinChuan);
                                    newMaxPirze.push(info_s.maxPrice);
                                    newMinPirze.push(info_s.minPrice);
                                }
                            }
                            //minPrice += multiplyCount(len[n],"1");//max
                            touzhu.push(len[n]);
                        }
                    }
                }
            }
            if (isSpfOrRqSpfPlay && info.reStart) {
                maxPrice = eval(newMaxPirze.join("+"));
                minPrice = eval(newMinPirze.join("+"));
            }
        }
        var max = maxPrice * beishu;
        var min = minPrice * beishu;
        return {
            "count": count, //注数
            "max": max,//最大金额
            "min": min,//最大金额
            "tz": touzhu,//投注时用到
            "o": obj
        };

    };


    //二维数组的定位组
    var cl = function (a) {
        var n = 0,
            array = [],
            code = [];
        allArr(a, n);
        function allArr(arr, n) {
            if (n >= arr.length) {
                array.push(code.slice());
                code.length = n - 1;
            } else {
                for (var i = 0, j = arr[n].length; i < j; i++) {
                    code.push(arr[n][i]);
                    allArr(arr, n + 1);
                }
                if (n) {
                    code.length = n - 1;
                }
            }
        }

        return array;
    };

    var eachArr = function (arr, num) {
        var t = [
            []
        ], r = [];
        for (var i = 0, n = arr.length; i < n; i++) {
            for (var j = 0, k = t.length; j < k; j++) {
                var ss = t[j].concat([arr[i]]);
                ss.length < num ? t.push(ss) : r.push(ss);
            }
        }
        return r;
    };

    var min = function (obj) {
        return Math.min.apply(Math, obj);
    };

    var max = function (obj) {
        return Math.max.apply(Math, obj);
    };

    var multiplyCount = function (arr, flag) {
        var tempArray = [];
        var a = 1;
        if (arr.length == 0)return 0;
        for (var i = 0, l = arr.length; i < l; i++) {
            var v = arr[i].split("_");
            if (flag) {
                var spz = v[2].split("|")[flag];
                if (spz.indexOf(".") == -1) {
                    spz += ".0";
                }
                tempArray.push(spz.substring(spz.indexOf(".") + 1, spz.length).length < 2 ? spz.replace(".", "") + "0" : spz.toString().replace(".", ""));
                a = parseFloat(cauScale(2, eval(tempArray.join("*")) * 2 / Math.pow(10, tempArray.length * 2)));
                //a *= v[2].split("|")[flag];//价格
            } else {
                a *= v[1];//注数
            }
        }
        return a;
    };

    /***********************新胜平负/让球胜平负理论奖金js author：吴龙 start**********************/
    /***********该js对理论奖金进行了重新计算。（快捷投注页面、混合过关页面、单挑页面除外）*********************/
    var Handle = {
        recs: [],//最大值数组
        recs_min: [],//最小值数组
        recs_min_dan: [],
        recs_dan: [],
        bs: 0,//倍数
        ggTypes: null,//过关方式
        min_gg: 0,
        isdan: false,//false该方案未定胆，ture定胆
        'maxMinBonus': function (passtypes) {
            var minBonus = [], MaxBonus = [], pass = [], maxChuan = [], minChuan = [], isDC = false;

            function sortMaxCon(a, b) {
                return parseFloat(a.bonus > parseFloat(b.bonus) ? -1 : 1);
            }

            function sortMinCon(a, b) {
                return parseFloat(a.bonus > parseFloat(b.bonus) ? 1 : -1);
            }

            for (var pas in passtypes) {
                if (!isDC && Number(passtypes[pas].split("-")[1]) > 1)isDC = true;
                pass = pass.concat(allInterFace.passType[passtypes[pas]]);
            }
            pass.sort();
            Handle.min_gg = parseInt(pass[0], 10);
            for (var j = Handle.recs.length; j >= Handle.min_gg; j--) {
                var list = Handle.getSingles(j),
                    minlist = Handle.getSingles(j, true),
                    minInfo = Handle.parseSingle(minlist, true),
                    info = Handle.parseSingle(list);
                minBonus.push(minInfo.bonus), MaxBonus.push(info.bonus), minChuan.push(minInfo), maxChuan.push(info);
            }
            return !isDC ? {"MaxBonus": eval("Math.max(" + MaxBonus.join(",") + ")"), "MinBonus": eval("Math.min(" + minBonus.join(",") + ")"), "reStart": false} : {"MaxBonus": Handle.isCz(maxChuan.sort(sortMaxCon).slice(0, 1)), "MinBonus": Handle.isCz(minChuan.sort(sortMinCon).slice(0, 1)), "reStart": true};
        },
        'isCz': function (maxMinChuan) {
            var a = new HashMap();
            var content = maxMinChuan[0].content;
            var content = content.split("/");
            for (var i in content) {
                var ai = content[i].split("^");
                for (var j in ai) {
                    if (!a.containsKey(ai[j]))a.put(ai[j], ai[j]);
                }
            }
            return a;
        },
        /**
         * passway 传入过关方式数组
         * kjtz  胜平负投注就传这个"spfgg"，混合投注页面就传“mixbet”，各个页面传不同的字符串过来
         */
        'getDTG_wl': function (passway, kjtz) {
            //list

            if (getDan() != "") {
                Handle.isdan = true;
            }
            Handle.recs = [], Handle.recs_min = [], Handle.recs_dan = [], Handle.recs_min_dan = [];
            Handle.ggTypes = passway;
            //xzcc是上下盘,或者快捷投注的样式.
            //var itembody = $("#itembody").find(".xzcc");
            //判断是否是混合过关页面,如果是.则获取选择项..
            var isMixbet = kjtz.indexOf("mixbet") != -1;
            /* if (isMixbet) {
             itembody = $("#itembody").find(".matchinfo");
             }*/
           // var itembody = $(".zckjTab").find("tr").find(".red");
            var itembody = $(".zckjTab").find("tr");
            itembody.each(function (i, item) {

                var sps = [], bonusRec, bonusMinRec, rqbtn = [], nrqbtn = [];
                var isan = false, rqs = 0, sort = null, gameid = null, isdan = false;
                    //danNOs[matchId] = matchId 数据保存时的结构...
                    //要得到几个属性..
                $(item).find(".red").each(function(j, item_i){
                    var data = $(item_i).attr("id").split("_");//F20140301008_spf_3_2.11_-1
                    gameid = data[0]; //1.是否选中胆码..
                    if (danNO[gameid]) {isdan = true;  }
                    sort = gameid;  //2.得到对阵ID..
                    rqs = data[4];               //3.得到让球值(1,-1)..
                    var sp = data[3];           //sp值..
                    var val =data[2];           //spf..
                    var rq = data[1].indexOf("rq") != -1 ? true : false;
                    sps.push(sp);
                    (rq ? rqbtn : nrqbtn).push({
                        sp: sp, val: Number(val.replace(/\D/g, "")),
                        gameid: gameid, isrpf: (rq ? "rqspf" : "spf")
                    });
                });


                bonusRec =    {isdan: isdan, rq: rqbtn.slice(), nrq: nrqbtn.slice()};
                bonusMinRec = {isdan: isdan, rq: rqbtn.slice(), nrq: nrqbtn.slice()};
                if (isdan) {
                    Handle.recs_dan.push(bonusRec);
                    Handle.recs_min_dan.push(bonusMinRec);
                } else {
                    Handle.recs_min.push(bonusMinRec);
                    Handle.recs.push(bonusRec);
                }
                Handle.filterGooder(bonusRec, rqs - 0);
                Handle.filterGooder(bonusMinRec, rqs - 0, true);
            });
            Handle.bs = multipleJq;//倍数..
            if (Handle.isdan) {
                Handle.recs.sort(function (a, b) {
                    return a.sp_sum > b.sp_sum ? -1 : 1;
                });
                Handle.recs_min.sort(function (a, b) {
                    return a.sp_sum > b.sp_sum ? 1 : -1;
                });
                Handle.recs = Handle.recs_dan.concat(Handle.recs);
                Handle.recs_min = Handle.recs_min_dan.concat(Handle.recs_min);
            } else {
                Handle.recs.sort(function (a, b) {
                    return a.sp_sum > b.sp_sum ? -1 : 1;
                });
                Handle.recs_min.sort(function (a, b) {
                    return a.sp_sum > b.sp_sum ? 1 : -1;
                });
            }
            var bonusAll = Handle.maxMinBonus(passway);
            return {"MaxBonus": bonusAll.MaxBonus, "MinBonus": bonusAll.MinBonus, "reStart": bonusAll.reStart};
        },
        'filterGooder': function (REC, r, isMin) {
            var rq = REC.rq, nrq = REC.nrq, isUn = isMin ? -1 : 1;

            function sortDn(a, b) {
                return isUn * (parseFloat(a.sp) > parseFloat(b.sp) ? -1 : 1);
            }

            if (rq.length === 0) {
                nrq.sort(sortDn).splice(1, 99);
            }
            else if (nrq.length === 0) {
                rq.sort(sortDn).splice(1, 99);
            } else {
                var mathal = Math.al([nrq, rq]);
                var g = [];
                for (var ma in mathal) {
                    var z = mathal[ma];
                    var a = z[0].val, b = z[1].val, isture = false;
                    if (z[0].sp == '0' || z[1].sp == '0') {
                        isture = false;
                    }
                    if (a === 3) {
                        isture = (r > 0 ? b === 3 : (r !== -1 || b !== 0));
                    }
                    else if (a === 0) {
                        isture = (r < 0 ? b === 0 : (r !== 1 || b !== 3));
                    }
                    else if (a === 1) {
                        isture = (r > 0 ? b === 3 : b === 0);
                    }
                    if (isture)g.push(z);
                }
                g.sort(function (a, b) {
                    return isUn * (parseFloat(a[0].sp) + parseFloat(a[1].sp) > parseFloat(b[0].sp) + parseFloat(b[1].sp) ? -1 : 1);
                });
                if (g.length == 0) {
                    nrq.sort(sortDn).splice(1, 99);
                    rq.sort(sortDn).splice(1, 99);
                    if (isMin) {
                        if (nrq[0].sp < rq[0].sp) {
                            rq.length = 0;
                        } else {
                            nrq.length = 0;
                        }
                    }
                    else {
                        if (nrq[0].sp > rq[0].sp) {
                            rq.length = 0;
                        } else {
                            nrq.length = 0;
                        }
                    }
                } else {
                    rq.length = 0;
                    nrq.length = 0;
                    nrq.push(g[0][0]);
                    rq.push(g[0][1]);
                }
            }
            REC.sp_sum = (nrq[0] ? parseFloat(nrq[0].sp) : 0) + (rq[0] ? parseFloat(rq[0].sp) : 0);
        },
        'forEach': function (o, f, z) {
            if (o) {
                for (var i = 0, j = o.length; i < j; i++) {
                    if (false === f.call(z || o[i], o[i], i, o, j)) {
                        break;
                    }
                }
            }
            return z || o;
        },
        'getSingles': function (n, min) {//取得所有单注, min为true指使用最小值
            var obj = this, list = [];
            var dl = [], tl = [];
            Handle.forEach(min ? Handle.recs_min.slice(0, n) : Handle.recs.slice(0, n), function (lc) {
                var gc = [].concat(lc.rq).concat(lc.nrq);
                gc.isdan = this.isdan;
                if (gc.isdan) {
                    dl.push(gc);
                } else {
                    tl.push(gc);
                }
            });
            Handle.forEach(Handle.ggTypes, function (type) {
                list = list.concat(Handle.getSigleCodes(dl, tl, type));
            }, this);
            return list;
        },
        'getSigleCodes': function (d, t, n, del) {
            var ns = n.split("-");
            var nm = allInterFace.passType[n], group, len = Number(ns[0]), diff = len - (d.length + t.length);
            if (Number(ns[1]) > 1 && diff > 0) {
                for (var i = diff; i--;) {
                    t.push([0]);
                }
            }//多串中有子串，用0sp值的补全。
            group = Math.dtl(d, t, len);
            return Handle.reduce(group, function (codes, g) {
                var al = Math.al(g);//不考虑去除单一玩法串
                return codes.concat(Handle.reduce(al, function (rc, c) {
                    return rc.concat(Handle.splitNM(c, nm));
                }, []));
            }, []);
        },
        'splitNM': function (code, n1s) {
            return Handle.reduce(n1s, function (r, type) {
                return r.concat(Math.cl(code, Handle.intt(type)));
            }, []);
        },
        'intt': function (n) {
            return parseInt(n, 10);
        },
        'reduce': function (a, fn, b, o) {
            Handle.each(a, function (v, k, a, j) {
                if (b === undefined) {
                    b = v;
                } else {
                    b = fn.call(o || v, b, v, k, a, j);
                }
            });
            return b;
        },
        'each': function (o, f, z) {
            return (o && Handle.arrayLike(o)) ? Handle.forEach(o, f, z) : Handle.forIn(o, f, z);
        },
        'arrayLike': function (o) {
            return typeof o === 'object' && isFinite(o.length);
        },
        'forIn': function (o, f, z) {
            var k, i = 0;
            if (o) {
                for (k in o) {
                    if (Handle.has(o, k) && false === f.call(z || o[k], o[k], k, o, i++)) {
                        break;
                    }
                }
            }
            return z || o;
        },
        'has': function (o, k) {
            var _has = {}.hasOwnProperty;
            return _has.call(o, k);
        },
        'parseSingle': function (list, min) {//从中奖单注集内统计n串1的个数和奖金和
            function sortMaxCon(a, b) {
                return parseFloat(a.sumsp > parseFloat(b.sumsp) ? 1 : -1);
            }

            var cl = {}, sum = 0, info = [], bs = this.bs, content = [], content_s = [], sp_con = [];
            for (var i = 0, j = list.length; i < j; i++) {
                var code = list[i], b = 1, len = code.length, con = [];
                for (var x = code.length; x--;) {
                    var codes = code[x];
                    var codessp = Number(getReaplceByVar(codes.sp + ""));
                    b *= codessp;
                    if (codes)
                        con.push(codes.gameid + "-" + codes.isrpf + "-" + codes.val);
                }
                if (con.length > 1)content.push(con.join("^"));
                if (b) {//为0时不计入统计
                    var sp = parseFloat(cauScale(2, b * 2 / Math.pow(10, code.length * 2)));
                    if (min)content_s.push({"sumsp": sp, con: con.join("^")});
                    sp_con.push(sp);
                    if (!(len in cl)) {
                        cl[len] = 0;
                    }
                    cl[len]++;
                }
            }
            var resultsum = min ? parseFloat(cauScale(2, eval("Math.min(" + sp_con.join(",") + ")"))) : parseFloat(cauScale(2, eval(sp_con.join("+"))));
            var resultcontent = min ? content_s.sort(sortMaxCon).slice(0, 1)[0].con : content.join("/");
            return {bonus: resultsum, codeCount: cl, content: resultcontent};
        }
    };
    /**
     * hashmap对象
     * @returns {HashMap}
     */
    var HashMap =function(){
        var length = 0;
        var obj = new Object();
        this.isEmpty = function(){return length == 0;};
        this.containsKey=function(key){return (key in obj);};
        this.containsValue=function(value){for(var key in obj){if(obj[key] == value){return true;}}return false;};
        this.put=function(key,value){if(!this.containsKey(key)){length++;}obj[key] = value;};
        this.get=function(key){return this.containsKey(key)?obj[key]:null;};
        this.remove=function(key){if(this.containsKey(key)&&(delete obj[key])){length--;}};
        this.values=function(){var _values= new Array();for(var key in obj){_values.push(obj[key]);}return _values;};
        this.keySet=function(){var _keys = new Array();for(var key in obj){_keys.push(key);}return _keys;};
        this.size = function(){return length;};
        this.clear = function(){length = 0;obj = new Object();};
    };

    /**
     * 是否符合最大或者最大理论奖金
     * @param arr  单注["spf_2_3.25_1|2.1_20130903003=1/0^3.25/2.1", "spf_1_3.3_1|3.3_20130903004=1^3.3"]
     * @param MaxChuan  最大理论奖金判断的 hashmap集合
     * @param MinChuan 最小理论奖金判断的 hashmap集合
     * @returns {"maxPrice":maxPrice.length==0?0:eval(maxPrice.join("+")),"minPrice":minPrice.length==0?0:eval(minPrice.join("+"))};
     */
    var multiplyNewCount = function (arr, MaxChuan, MinChuan) {
        var tempArray = [], maxPrice = [], minPrice = [];
        for (var i in arr) {
            var arri = arr[i],
                arra = [],
                arr_c = arri.split("|"),
                arr_e = arr_c[0].split("_"),
                playtype = arr_e[0],
                arr_d = arr_c[1].split("="),
                gameid = arr_d[0].split("_")[1],
                arr_j = arr_d[1].split("^"),
                content = arr_j[0].split("/"),
                sp = arr_j[1].split("/");
            for (var h in content) {
                var contenth = content[h];
                contenth = contenth.replace('让胜', '3').replace('让平', '1').replace('让负', '0');
                contenth = contenth.replace('rq_', '').replace('胜', '3').replace('平', '1').replace('负', '0');
                arra.push("F" + gameid + "-" + playtype + "-" + contenth + "/" + sp[h]);
            }
            tempArray.push(arra);
        }
        var content_array = Math.al(tempArray, tempArray.length, null);//拆分组合
        for (var h in content_array) {
            var a_n = isMaxOrMin(content_array[h], MaxChuan);
            var a_m = isMaxOrMin(content_array[h], MinChuan);
            if (a_n)maxPrice.push(a_n);
            if (a_m)minPrice.push(a_m);
        }
        var info = {"maxPrice": maxPrice.length == 0 ? 0 : eval(maxPrice.join("+")), "minPrice": minPrice.length == 0 ? 0 : eval(minPrice.join("+"))};
        return info;
    };

    /***********************新胜平负/让球胜平负理论奖金js author：吴龙 end**********************/
    /******************工具组--author吴龙 start*************************/
    Math.al = function (A2, fn) {
        var n = 0,
            codes = [],
            code = [],
            isTest = typeof fn == 'function',
            stop;
        each(A2, n);
        function each(A2, n) {
            if (stop || n >= A2.length) {
                if (isTest && false === fn(code)) {
                    stop = true;
                } else {
                    codes.push(code.slice());
                    code.length = n - 1;
                }
            } else {
                var cur = A2[n];
                for (var i = 0, j = cur.length; i < j; i++) {
                    code.push(cur[i]);
                    each(A2, n + 1);
                }
                if (n) {
                    code.length = n - 1;
                }
            }
        }

        return codes;
    };
    Math.dtl = function (d, t, n, z) {
        var r = [];
        if (d.length <= n) {
            r = Math.cl(t, n - d.length, z);
            for (var i = r.length; i--;) {
                r[i] = d.concat(r[i]);
            }
        }
        return r;
    };
    Math.cl = function (arr, n, z) { // z is max count
        var r = [];
        fn([], arr, n);
        return r;
        function fn(t, a, n) {
            if (n === 0 || z && r.length == z) {
                return r[r.length] = t;
            }
            for (var i = 0, l = a.length - n; i <= l; i++) {
                if (!z || r.length < z) {
                    var b = t.slice();
                    b.push(a[i]);
                    fn(b, a.slice(i + 1), n - 1);
                }
            }
        }
    };

    var getDan = function () {
        var d = [];
        for (var no in danNO) {
            d.push(no);
        }
        return d.join(",");
    };
    /**
     * 返回当前注数是否符合最大或者最小理论奖金
     * @param value 单注
     * @param MaxMin 最大或者最小用来判断的理论奖金hashmap
     * @returns 不符合返回0，符合奖金当注的金额
     */
    var isMaxOrMin = function (value, MaxMin) {
        var b = [], c = MaxMin.keySet(), result = 1;
        for (var j in c) {
            b.push(c[j]);
        }
        b = b.join("/");
        for (var i in value) {
            var valuei = value[i].split("/");
            var key = valuei[0];
            var valu = valuei[1];
            if (MaxMin.containsKey(key)) {
                result *= Number(getReaplceByVar(valu));
            }
            else {
                result = 0;
                break;
            }
        }
        return result != 0 ? parseFloat(cauScale(2, result * 2 / Math.pow(10, value.length * 2))) : 0;
    };

    var getReaplceByVar = function (valu) {
        return valu.indexOf(".") != -1 ? (valu.substring(valu.indexOf(".") + 1, valu.length).length < 2 ? valu.replace(".", "") + "0" : valu.toString().replace(".", "")) : (valu + "00");
    };

    var allInterFace = {
        //过关以及场次关系
        passType: {
            '2-1': [2],
            '3-1': [3],
            '4-1': [4],
            '5-1': [5],
            '6-1': [6],
            '7-1': [7],
            '8-1': [8],
            '3-3': [2],
            '3-4': [2, 3],
            '4-4': [3],
            '4-5': [3, 4],
            '4-6': [2],
            '4-11': [2, 3, 4],
            '5-5': [4],
            '5-6': [4, 5],
            '5-10': [2],
            '5-16': [3, 4, 5],
            '5-20': [2, 3],
            '5-26': [2, 3, 4, 5],
            '6-6': [5],
            '6-7': [5, 6],
            '6-15': [2],
            '6-20': [3],
            '6-22': [4, 5, 6],
            '6-35': [2, 3],
            '6-42': [3, 4, 5, 6],
            '6-50': [2, 3, 4],
            '6-57': [2, 3, 4, 5, 6],
            '7-7': [6],
            '7-8': [6, 7],
            '7-21': [5],
            '7-35': [4],
            '7-120': [2, 3, 4, 5, 6, 7],
            '8-8': [7],
            '8-9': [7, 8],
            '8-28': [6],
            '8-56': [5],
            '8-70': [4],
            '8-247': [2, 3, 4, 5, 6, 7, 8]
        },
        C: function (n, m) {
            var n1 = 1, n2 = 1;
            for (var i = n, j = 1; j <= m; n1 *= i--, n2 *= j++);
            return n1 / n2;
        }
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
        var mathstr = big.toString();
        var dian = mathstr.indexOf(".");
        if (dian > 0 && mathstr.length - dian - 1 > mod) {
            var base = mathstr.substring(0, dian);
            var adress = mathstr.substring(dian + 1, mathstr.length);
            if (adress.length <= mod) {
                base = base + "." + adress;
            } else if (adress.length >= mod + 1) {
                var v = parseInt(adress.substring(mod, mod + 1), 10);//精确位小数后一位
                var v1 = parseInt(adress.substring(mod - 1, mod), 10);//精确位小数。
                var m = 0;

                if (v >= 6) { //精确位后大于等于6，精确位进一
                    m++;
                } else if (v <= 4) {//精确位后小于等于4，精确位后舍弃
                } else if (v == 5 && adress.length > mod + 1) {//精确位后为5时，精确位后一位还有其他值，精确位进一
                    m++;
                } else if (v == 5 && v1 % 2 == 0) {//精确位后为5时，精确位前为偶时，精确位后一位舍弃。
                } else if (v == 5 && v1 % 2 == 1) {//精确位后为5时，精确位前为奇时，精确位进一
                    m++;
                }
                var s = adress.substring(0, mod - 1);
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
                        var tempfl = '';
                        for (var k = 0; k < mod - 1; k++) {
                            tempfl += '0';
                        }
                        fl = tempfl + fl;
                    }
                    else if (fl == 10) {
                        var tempfl = '';
                        for (var k = 0; k < mod - 2; k++) {
                            tempfl += '0';
                        }
                        fl = tempfl + fl;
                    }
                    big = base.toString() + "." + fl.toString();
                }
                else {
                    big = base + "." + fl;
                }
            }
        }
        return big;
    };

    /**
     * 混投页面  判断用户是否选择了  除了胜平负和让球胜平负玩法以外了的玩法
     * @param obj
     * @returns {Boolean}
     */
    var isSpfRqspf = function (obj) {
        var tuo = obj.tuo;
        var dan = obj.dan;
        if (tuo != null && tuo.length > 0) {
            for (var i in tuo) {
                for (var j in  tuo[i]) {
                    if (tuo[i][j].indexOf("spf") < 0)
                        return false;
                }
            }
        }
        if (dan != null && dan.length > 0) {
            for (var k in dan) {
                for (var t in  dan[k]) {
                    if (dan[k][t].indexOf("spf") < 0) {
                        return false;
                    }
                }
            }
        }
        return true;
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
    /**
     * 最大串Map
     * @type {Object}
     */
    var maxMap = {
        "spf": {max: 8},
        "rqspf": {max: 8},
        "bqc": {max: 4},
        "zjq": {max: 6},
        "bf": {max: 4}
    };


    /**
     * 购买
     * @param params
     * @param callback
     */
    var toBuy = function(type, params, price, callback) {

        if (!appConfig.checkLogin(null)) {
            // 尚未登录
            callback({statusCode: "off"});
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
                params.projectType = "1"; // 合买
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
            type: "GET",
            url: requestConfig.request.JCZQ_GAME_BUY,
            data: {data: JSON.stringify(params)},
            dataType: "jsonp",
            success: callback,
            error: callback
        });
    };
    return{
        getJCZQBetList: getJCZQBetList,
        getProjectDetails: getProjectDetails,
        getAliveState:getAliveState,
        getJCZQAgainstInfo: getJCZQAgainstInfo,
        getHistoryAwards: getHistoryAwards,
        getAwardDetailSP: getAwardDetailSP,
        getNormalWays: getNormalWays,
        getManyWay: getManyWay,
        /* getBetByCrossWay:getBetByCrossWay,*/
        getBetsRelate: getBetsRelate,
        toBuy:toBuy,
        desc: desc,
        asc: asc
    };
})
;
