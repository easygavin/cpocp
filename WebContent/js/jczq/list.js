/**
 * 竞彩篮球列表
 */
define([
    "text!../../views/jczq/list.html",
    "util/Page",
    "util/PageEvent",
    "util/AppConfig",
    "services/JczqService",
    "util/Util",
    "util/ErrorHandler"
], function (template, page, pageEvent, appConfig, jczqService, util, errorHandler) {

    // 彩种
    var lotteryType = "46";

    // 显示投注列表
    var bufferData = null;

    // 倍数
    var timesUnit = 1;

    // 注数
    var totals = 0;

    // 总付款
    var pays = 0;

    // 单价
    var price = 2;

    // 购买成功后返回的结果集
    var result = {};

    // 标题类型标示
    var titleFlag = "mix";

    // 投注方式列表
    var types = []; //spf,rqspf,zjq,bqc,bf

    // 普通过关
    var normalWays = [];

    // 多串过关
    var manyWays = [];

    // 赛事数据
    var optArr = {};

    // SP值对象数组
    var spArr = {};

    // 混投计算需要
    var agcg = {};

    //最大最小奖金
    var prizes = {};

    //默认选择的胆码
    var selectedDan = [];
    /**
     * 初始化
     */
    var init = function (data, forward) {
        // 加载模板内容
        $("#container").empty().append($(template));

        // 参数设置
        var params = {};
        var tkn = appConfig.checkLogin(data);
        if (tkn) {
            params.token = tkn;
        }

        // 初始化显示
        initShow(data, forward);

        // 绑定事件
        bindEvent();

        // 处理返回
        page.setHistoryState({url: "jczq/list", data: {}},
            "jczq/list",
            "#jczq/list" + (JSON.stringify(params).length > 2 ? "?data=" + encodeURIComponent(JSON.stringify(params)) : ""),
            forward ? 1 : 0);

        // 隐藏加载标示
        util.hideLoading();
    };

    /**
     * 初始化显示
     */
    var initShow = function (data, forward) {
        if (forward) {
            timesUnit = 1;
        } else {
            $("#timesUnit").val(timesUnit);
        }

        // 显示投注列表
        bufferData = appConfig.getLocalJson(appConfig.keyMap.MAY_BUY_JCZQ_KEY);

        // 显示标题
        showTitle();

        // 显示投注列表
        showItems();

        // 获取过关方式
        getCrossWayArr();

        // 初始化显示文本
        initShowTxt();

        // 获取总注数,包括最大最小奖金..
        getTotalBet();

        // 获取最小最大奖金
        getMinMaxPrize();

        // 显示付款信息
        showPayInfo();

        //初始化显示选择的胆码..
        getSelectedDan();
    };

    /**
     * 显示投注列表
     */
    var showItems = function () {
        optArr = {}, spArr = {};
        totals = 0, pays = 0, result = {}, price = 2;
        $(".zckjTab tbody").empty();
        if (bufferData != null && typeof bufferData != "undefined"
            && bufferData.matchBetList != null && typeof bufferData.matchBetList != "undefined"
            && bufferData.matchBetList.length) {
            var matchBetList = bufferData.matchBetList;
            for (var i = 0, len = matchBetList.length; i < len; i++) {
                //matchBetList[i] =data..包括,matchid-F361234，match-该对阵的所有信息. spfIds,rqspfIds,bfIds,zjqIds----得到选择的项.
                addItem(i, matchBetList[i]);
            }
        }
    };


    /**
     * 添加一项数据
     * @param index
     * @param item
     */
    var addItem = function (index, item) {
        var matchId = item.matchId;
        var match = item.match;

        var $tr = $("<tr></tr>");
        $tr.attr("id", "m_" + matchId);

        var str = "";

        var teams = match.playAgainst.split("|");

        str += "<td>";
        str += "<p>";
        str += "<i>" + match.number + "</i>";
        str += "<i>" + teams[0] + "</i><i>vs</i><i>" + teams[1] + "</i>"
        str += "</p>";

        str += "<p>";

        // 胜负, 让分胜负, 大小分, 胜负差
        var spfIds = item.spfIds,
            rqspfIds = item.rqspfIds,
            zjqIds = item.zjqIds,
            bqcIds = item.bqcIds,
            bfIds = item.bfIds,
            spCount = 0;

        // 收集SP值数组
        var itemSPArr = [];
        var agcgArr = [];
        //根据选择的胜平负赛事,得到对应的SP值..
        if (spfIds.length) {
            spCount += spfIds.length;
            for (var i = 0, len = spfIds.length; i < len; i++) {
                var sp = handleSPValue(spfIds[i], match);
                itemSPArr.push(sp);
                agcgArr.push(1);

                var mode = spModeMap[spfIds[i]]; //spfIds[i] =spf_0  spModeMap[spfIds[i]] 得到title,以及对应的投注项如胜平负,3.1.0
                str += '<i class="red" id="' + matchId + "_spf_" + mode.flag + "_" + sp + "_" + item.match.transfer + '">' + mode.title + '</i>';
            }
        }

        if (rqspfIds.length) {
            spCount += rqspfIds.length;
            for (var i = 0, len = rqspfIds.length; i < len; i++) {

                var sp = handleSPValue(rqspfIds[i], match);
                itemSPArr.push(sp);
                agcgArr.push(2);

                var mode = spModeMap[rqspfIds[i]];
                str += '<i class="red" id="' + matchId + "_spfrq_" + mode.flag + "_" + sp + '">' + mode.title + '</i>';
            }
        }

        if (zjqIds.length) {
            spCount += zjqIds.length;
            for (var i = 0, len = zjqIds.length; i < len; i++) {

                var sp = handleSPValue(zjqIds[i], match);
                itemSPArr.push(sp);
                agcgArr.push(3);

                var mode = spModeMap[zjqIds[i]];
                str += '<i class="red" id="' + matchId + "_zjq_" + mode.flag + "_" + sp + '">' + mode.title + '</i>';
            }
        }

        if (bqcIds.length) {
            spCount += bqcIds.length;
            for (var i = 0, len = bqcIds.length; i < len; i++) {

                var sp = handleSPValue(bqcIds[i], match);
                itemSPArr.push(sp);
                agcgArr.push(4);

                var mode = spModeMap[bqcIds[i]];
                str += '<i class="red" id="' + matchId + "_bqc_" + mode.flag + "_" + sp + '">' + mode.title + '</i>';
            }
        }

        if (bfIds.length) {
            spCount += bfIds.length;
            for (var i = 0, len = bfIds.length; i < len; i++) {

                var sp = handleSPValue(bfIds[i], match);
                itemSPArr.push(sp);
                agcgArr.push(5);

                var mode = spModeMap[bfIds[i]];
                str += '<i class="red" id="' + matchId + "_bf_" + mode.flag + "_" + sp + '">' + mode.title + '</i>';
            }
        }

        // 赛事数据
        optArr[matchId] = spCount; //某场比赛,选了多少sp值.....
        agcg[matchId] = agcgArr;   //暂未确定...

        // SP值排序
        itemSPArr.sort(jczqService.asc);
        // 保存SP数组
        spArr[matchId] = itemSPArr;

        str += "</p>"
        str += "</td>";

        str += "<td>";
        // 竞彩足球混投无胆
        str += (titleFlag != "mix" ? "<i id='t_" + matchId + "' class='danBtn fr'>胆</i>" : "&nbsp;");
        str += "</td>";

        $tr.html(str);
        $(".zckjTab tbody").append($tr);
    };

    /**
     * 通过mixed页面所选项处理SP值
     * @param spWayIndex 如spf_0,代表match.spDatas.spf 第一个下标.
     * @param match
     */
    var handleSPValue = function (spWayIndex, match) {
        var spWayIndexArr = spWayIndex.split("_");
        var sp = "0";
        if (spWayIndexArr.length > 1) {
            var spWay = spWayIndexArr[0];// spway=spf
            var index = parseInt(spWayIndexArr[1], 10); //index=0
            var spDatas = match.spDatas;
            switch (spWay) {
                case "spf": // 胜平负
                    var spf = spDatas.spf.split(",");
                    sp = spf[index]; //sp =1.26
                    break;
                case "rqspf": // 让分胜负
                    var rqspf = spDatas.rqspf.split(",");
                    sp = rqspf[index];//sp =3
                    break;
                case "zjq": // 大小分
                    var zjq = spDatas.zjq.split(",");
                    sp = zjq[index];  //sp =1 or 2 or 3,or 4。。。。。
                    break;
                case "bqc": // 半全场
                    var bqc = spDatas.bqc.split(",");
                    sp = bqc[index];
                    break;
                case "bf": // 比分
                    var bf = spDatas.bf.split(",");
                    sp = bf[index];
                    break;
            }
        }
        return sp;
    };

    /**
     * 显示标题
     */
    var showTitle = function () {
        types = [];
        var count = 0;
        titleFlag = "";
        var title = "竞足";

        if (bufferData != null && typeof bufferData != "undefined"
            && bufferData.matchBetList != null && typeof bufferData.matchBetList != "undefined"
            && bufferData.matchBetList.length) {
            for (var t in bufferData.titleMap) {
                count++;
                titleFlag = t;
                types.push(t);
            }
            if (count == 1) {
                switch (titleFlag) {
                    case "spf":
                        title += "胜平负";
                        break;
                    case "rqspf":
                        title += "让球胜平负";
                        break;
                    case "zjq":
                        title += "总进球";
                        break;
                    case "bqc":
                        title += "半全场";
                        break;
                    case "bf":
                        title += "比分";
                }
            } else {
                title += "混投";
                titleFlag = "mix";
            }
        }

        $("#title").text(title);
    };

    /**
     * 获取过关方式
     */
    var getCrossWayArr = function () {
        normalWays = [], manyWays = [];
        if (bufferData != null && typeof bufferData != "undefined"
            && bufferData.matchBetList != null && typeof bufferData.matchBetList != "undefined"
            && bufferData.matchBetList.length) {
            // 胆数
            var danCount = $(".zckjTab .click").length;
            // 场数
            var matchLen = bufferData.matchBetList.length;

            // 普通过关
            normalWays = jczqService.getNormalWays(matchLen, danCount, types);
            if (normalWays.length > 0) {
                for (var i = 0, len = normalWays.length; i < len; i++) {
                    $("#way_0").append("<li id='" + normalWays[i] + "'>" + normalWays[i].replace('-', '串') + "</li>");
                }
            }

            // 多串过关
            manyWays = jczqService.getManyWay(matchLen, types);
            if (manyWays.length > 0) {
                for (var i = 0, len = manyWays.length; i < len; i++) {
                    $("#way_1").append("<li id='" + manyWays[i] + "'>" + manyWays[i].replace('-', '串') + "</li>");
                }
                $("#tab_1").show();
            }
        }
    };

    /**
     * 初始化显示文本
     */
    var initShowTxt = function () {
        // 初始过关方式
        var initWay = normalWays[normalWays.length - 1];
        $("#" + initWay).addClass("click");
        $("#way_0").show();

        showCrossTxt();
    };

    /**
     * 显示过关方式文本
     */
    var showCrossTxt = function () {
        var txt = "", clicks = $(".ggbox .tabcon .click");
        if (clicks.length) {
            clicks.each(function (i, item) {
                if (i != 0) {
                    txt += ",";
                }

                txt += $(item).text();
            });
        } else {
            txt = "过关方式";
        }
        $("#crossTxt").text(txt);
    };

    /**
     * 获取总注数
     */
    var getTotalBet = function () {
        totals = 0;
        var ways = $("#crossTxt").text().replace(/串/g, '-').split(",");
        console.log(ways.toString());

        if (ways != "过关方式") {
            // 胆数据
            var danNOs = {};
            var danBtn = $(".zckjTab .click");
            if (danBtn.length) {
                danBtn.each(function (i, item) {
                    var matchId = $(item).closest("tr").attr("id").split("_")[1];
                    danNOs[matchId] = matchId;
                });
            }
            var result = jczqService.getBetsRelate(true, ways, spArr, danNOs, timesUnit);
            //总注数..
            totals = result.count;
            //最大奖金范围....
            prizes.max = (result.max).toFixed(2);
            //最小奖金范围....
            prizes.min = (result.min).toFixed(2);
        } else {
            //如果为选择过关方式,则清空最大最小金额
            prizes.max = "0.0";
            prizes.min = "0.0";
        }
    };

    /**
     * 获取最小最大奖金
     */
    var getMinMaxPrize = function () {

        $("#guessBonus").html("奖金:" + prizes.min + "~" + (prizes.max > 100000 ? "<br>" : "") + prizes.max + "元");
    };

    /**
     * 胆显示
     * @param flag
     */
    var showDan = function (flag) {
        if (flag) {
            $(".zckjTab .danBtn").show();
        } else {
            $(".zckjTab .danBtn").removeClass("click").hide();
        }
    };

    /**
     * 付款信息
     */
    var showPayInfo = function () {

        // 倍数
        $("#times").text(timesUnit);

        // 注数
        $("#totals").text(totals);

        pays = totals * price * timesUnit;
        // 总付款
        $("#pays").text(pays);
    };

    var showCrossBox = function () {

        var $tab0 = $("#tab_0");
        if ($tab0.hasClass("click")) {
            // 普通投注，需要过滤小于胆数的过关方式
            // 胆数
            var danCount = $(".zckjTab .click").length;
            for (var i = 2; i < danCount + 1; i++) {
                $("#way_0 li[id^='" + i + "-']").hide();
            }
        }

        $(".ggbox").show();
        showLCover();
    };

    var hideCrossBox = function () {
        $(".ggbox").hide();
        hideLCover();
    };

    /**
     * 绑定事件
     */
    var bindEvent = function () {

        // 返回
        $(".back").on(pageEvent.touchStart, function (e) {
            pageEvent.handleTapEvent(this, this, pageEvent.activate, e);
            return true;
        });

        $(".back").on(pageEvent.activate, function (e) {
            page.goBack();
            return true;
        });

        // 协议
        $("#protocolA").on(pageEvent.touchStart, function (e) {
            pageEvent.handleTapEvent(this, this, pageEvent.activate, e);
            return true;
        });

        $("#protocolA").on(pageEvent.activate, function (e) {
            //获取选择的胆码..
            storeSelectedDan();
            page.initPage("protocol", {}, 1);
            return true;
        });

        // 胆
        $(".zckjTab").on(pageEvent.tap, function (e) {
            var $target = $(e.target);
            var $danBtn = $target.closest(".danBtn");
            if ($danBtn.length) {
                if ($danBtn.hasClass("click")) {
                    $danBtn.removeClass("click");
                    // 获取总注数
                    getTotalBet();
                    // 获取最小最大奖金
                    getMinMaxPrize();
                    // 显示付款信息
                    showPayInfo();
                } else {
                    // 最大胆数
                    var danCount = $(".zckjTab .click").length;
                    var ways = $("#crossTxt").text().split(",");
                    var prev = ways[0].split("串")[0];

                    if ((danCount + 1) == parseInt(prev, 10)) {
                        util.toast("当期最多只能设" + danCount + "个胆");
                    } else {
                        $danBtn.addClass("click");
                        // 获取总注数
                        getTotalBet();
                        // 获取最小最大奖金
                        getMinMaxPrize();
                        // 显示付款信息
                        showPayInfo();
                    }
                }
            }
            return true;
        });

        // 倍数
        $("#timesUnit").on("keyup",function (e) {
            this.value = this.value.replace(/\D/g, '');
            var $timesUnit = $(this);
            timesUnit = $timesUnit.val();

            if ($.trim(timesUnit) == "") {
                timesUnit=0;
            }else{
                if ($.trim(timesUnit) != "" && (isNaN(timesUnit) || timesUnit < 1)) {
                    timesUnit = 1;
                    $timesUnit.val(1);
                } else if (timesUnit > 10000) {
                    util.toast("亲，最多只能投10000倍哦");
                    timesUnit = 10000;
                    $timesUnit.val(10000);
                }
            }
            getTotalBet();
            // 获取最小最大奖金
            getMinMaxPrize();
            // 显示付款信息
            showPayInfo();
            return true;
        }).on("blur", function (e) {
            this.value = this.value.replace(/\D/g, '');
        });

        // 过关
        $("#crossWay").on(pageEvent.click, function (e) {
            if ($(".ggbox").is(":visible")) {
                hideCrossBox();
            } else {
                showCrossBox();
            }
            return true;
        });

        // 关闭显示层
        $(".lCover").on(pageEvent.click, function (e) {
            hideCrossBox();
            return true;
        });

        // tab 切换
        $(".tabopition").on(pageEvent.click, function (e) {
            var $target = $(e.target);
            var $li = $target.closest("li");
            if ($li.length) {
                if (!$li.hasClass("click")) {
                    var tabId = $li.attr("id").split("_")[1];

                    $(".tabopition li").removeClass("click");
                    $("#tab_" + tabId).addClass("click");

                    $(".tabcon").hide();
                    $("#way_" + tabId).show();

                    if (tabId == "0") {
                        // 普通过关
                        showDan(1);

                        // 显示所有的过关方式
                        $("#way_0 li").show();

                        // 清除多串过关焦点
                        $("#way_1 li").removeClass("click");
                    } else if (tabId == "1") {
                        // 多串过关
                        showDan(0);

                        // 清除普通过关焦点
                        $("#way_0 li").removeClass("click");
                    }

                    showCrossTxt();

                    // 获取总注数
                    getTotalBet();
                    // 获取最小最大奖金
                    getMinMaxPrize();
                    // 显示付款信息
                    showPayInfo();
                }
            }
        });

        // 普通过关点击
        $("#way_0").on(pageEvent.tap, function (e) {
            var $li = $(e.target).closest("li");
            if ($li.length) {
                if ($li.hasClass("click")) {
                    $li.removeClass("click");
                } else {

                    // 最多只能选5种过关方式
                    var wayLen = $("#way_0 .click").length;
                    if (wayLen == 5) {
                        util.toast("组合过关的方式最多选5种");
                    } else {
                        $li.addClass("click");
                    }
                }

                showCrossTxt();

                // 获取总注数
                getTotalBet();
                // 获取最小最大奖金
                getMinMaxPrize();
                // 显示付款信息
                showPayInfo();
            }
            return true;
        });

        // 多串过关点击
        $("#way_1").on(pageEvent.tap, function (e) {
            var $li = $(e.target).closest("li");
            if ($li.length) {
                if ($li.hasClass("click")) {
                    $li.removeClass("click");
                } else {
                    $li.addClass("click");
                }
                $li.siblings().removeClass("click");

                showCrossTxt();

                // 获取总注数
                getTotalBet();
                // 获取最小最大奖金
                getMinMaxPrize();
                // 显示付款信息
                showPayInfo();
            }

            return true;
        });

        // 付款
        $(".gmBtn").on(pageEvent.touchStart, function (e) {
            pageEvent.handleTapEvent(this, this, pageEvent.activate, e);
            return true;
        });

        $(".gmBtn").on(pageEvent.activate, function (e) {

            // 检查值
            if (bufferData != null && typeof bufferData != "undefined"
                && bufferData.matchBetList != null && typeof bufferData.matchBetList != "undefined"
                && bufferData.matchBetList.length && checkVal()) {
                // 购买
                toBuy();
            }
            return true;
        });

    };

    /**
     * 检查有效值
     */
    var checkVal = function () {

        // 倍数
        var $timesUnit = $("#timesUnit");
        timesUnit = $timesUnit.val();

        if ($.trim(timesUnit) == "" || isNaN(timesUnit) || timesUnit < 1) {
            timesUnit = 0;
            util.toast("请至少选择 1 注");

            // 显示付款信息
            showPayInfo();
            return false;
        }

        var ways = $("#crossTxt").text();

        if (ways == "过关方式") {
            util.toast("请至少选择 1 注");
            return false;
        }
        return true;
    };

    /**
     * 获取购买参数
     */
    var getBuyParams = function () {
        var detailArr = [],
            matchArr = [],
            buySPArr = [],
            danArr = [],
            passway = "";
        $(".zckjTab tr").each(function (i, item) {
            var $item = $(item);
            var mid = $item.attr("id").split("_");
            if (mid.length > 1) {
                // 赛事ID
                var matchId = mid[1];
                // SP 标示
                var spf = [], rqspf = [], zjq = [], bqc = [], bf = [];
                // SP 值
                var spfV = [], rqspfV = [], zjqV = [], bqcV = [], bfV = [];

                $item.find(".red").each(function (j, p) {
                    var spFlagV = $(p).attr("id").split("_");
                    // li red id 格式..F20140305002_spf_3_1.81_-1
                    if (spFlagV.length > 1) {
                        switch (spFlagV[1]) {
                            case "spf": // 胜负
                                spf.push(spFlagV[2]); //3.1.0
                                spfV.push(spFlagV[3]);//sp值..
                                break;
                            case "spfrq": // 让分胜负
                                rqspf.push(spFlagV[2]);
                                rqspfV.push(spFlagV[3]);
                                break;
                            case "zjq": // 大小分
                                zjq.push(spFlagV[2]);
                                zjqV.push(spFlagV[3]);
                                break;
                            case "bqc": // 胜分差
                                bqc.push(spFlagV[2]);
                                bqcV.push(spFlagV[3]);
                                break;
                            case  "bf":   //比分..
                                bf.push(spFlagV[2]);
                                bfV.push(spFlagV[3]);
                        }
                    }
                });

                // 赛事编号
                matchArr.push(matchId);
                // 详情，SP值
                switch (titleFlag) {
                    case "spf": // 胜负
                        detailArr.push(matchId + ":" + spf.join(","));
                        buySPArr.push(matchId + ":" + spf.join(","));
                        break;
                    case "rqspf": // 让球胜平负.
                        detailArr.push(matchId + ":" + rqspf.join(","));
                        buySPArr.push(matchId + ":" + rqspfV.join(","));
                        break;
                    case "zjq": // 总进球
                        detailArr.push(matchId + ":" + zjq.join(","));
                        buySPArr.push(matchId + ":" + zjqV.join(","));
                        break;
                    case "bqc": // 半全场
                        detailArr.push(matchId + ":" + bqc.join(","));
                        buySPArr.push(matchId + ":" + bfV.join(","));
                        break;
                    case "bf":   //  比分.
                        detailArr.push(matchId + ":" + bf.join(","));
                        buySPArr.push(matchId + ":" + bfV.join(","));
                    case "mix": //   混投。
                        detailArr.push(matchId + ":" + spf.join(",") + "|" + bf.join(",") + "|" + zjq.join(",") + "|" + bqc.join(",") + "|" + rqspf.join(","));
                        buySPArr.push(matchId + ":" + spfV.join(",") + "|" + bfV.join(",") + "|" + zjqV.join(",") + "|" + bqcV.join(",") + "|" + rqspfV.join(","));
                        break;
                }

                // 混投不能设胆
                if (titleFlag != "mix") {
                    // 胆
                    if ($item.find(".click").length) {
                        danArr.push(matchId)
                    }
                }
            }
        });
        // 投注方式
        passway = $("#crossTxt").text().replace(/串/g, '-');

        return {
            detail: detailArr.join("\/"),
            matchIds: matchArr.join(","),
            buySP: buySPArr.join("\/"),
            danCount: danArr.length + "",
            dan: danArr.join(","),
            passway: passway
        };
    };

    /**
     * 购买付款
     */
    var toBuy = function () {
        // 参数设置
        var params = {};
        params.issueNo = bufferData.issueNo; // 期号
        params.lotteryType = lotteryMap[titleFlag].lotteryId; //彩种

        // 获取投注参数
        var buyParams = getBuyParams();

        // 购买当期的详细信息
        params.detail = buyParams.detail;
        // 胆数
        params.danCount = buyParams.danCount;
        // 胆赛事ID
        params.dan = buyParams.dan;
        // 赛事ID
        params.matchIds = buyParams.matchIds;
        // SP值
        params.buySP = buyParams.buySP;
        // 过关方式
        params.passway = buyParams.passway;
        // 1 竞彩，2 单场
        params.passType = "1";
        // 默认2，奖金优化10，上下盘12
        params.playType = "2";
        // 理论最大奖金
        params.prevMoney = prizes.max;
        // 客户端默认1
        params.betType = "1";

        params.totalBet = totals + ""; // 总注数
        params.totalBei = timesUnit + ""; // 总倍数

        // 显示遮住层
        util.showCover();
        util.showLoading();

        // 请求接口
        jczqService.toBuy("1", params, price, function (data) {

            // 隐藏遮住层
            util.hideCover();
            util.hideLoading();

            if (typeof data != "undefined") {
                if (typeof data.statusCode != "undefined") {
                    if (data.statusCode == "0") {
                        result = data;
                        util.prompt(
                            $("#title").text() + " 投注成功",
                            "编号:" + data.lotteryNo + "<br>" + "账号余额:" + data.userBalance + " 元",
                            "查看方案",
                            "确定",
                            function (e) {
                                page.initPage("jczq/details", {lotteryType: lotteryType, requestType: "0", projectId: result.projectId}, 0);
                            },
                            function (e) {
                                page.goBack();
                            }
                        );
                        // 删除选号记录
                        appConfig.clearLocalData(appConfig.keyMap.MAY_BUY_JCZQ_KEY);

                    } else {
                        errorHandler.handler(data);
                    }
                } else {
                    util.toast("投注失败");
                }
            } else {
                util.toast("投注失败");
            }
        });
    };

    /**
     * 显示遮盖层
     */
    var showLCover = function () {
        var bodyHeight = Math.max(document.documentElement.clientHeight, document.body.offsetHeight);
        var headerH = $(".iheader").height();
        $(".lCover").css({"height": (bodyHeight - headerH) + "px"}).show();
    };

    /**
     * 隐藏遮盖层
     */
    var hideLCover = function () {
        $(".lCover").hide();
    };

    /**
     * 模式映射
     * @type {Object}
     */
    var spModeMap = {
        // 胜平负
        "spf_0": {title: "胜", flag: "3"},
        "spf_1": {title: "平", flag: "1"},
        "spf_2": {title: "负", flag: "0"},

        //让球胜平负.
        "rqspf_1": {title: "让胜", flag: "3"},
        "rqspf_2": {title: "让平", flag: "1"},
        "rqspf_3": {title: "让负", flag: "0"},

        //总进球
        "zjq_0": {title: "0球", flag: "0"},
        "zjq_1": {title: "1球", flag: "1"},
        "zjq_2": {title: "2球", flag: "2"},
        "zjq_3": {title: "3球", flag: "3"},
        "zjq_4": {title: "4球", flag: "4"},
        "zjq_5": {title: "5球", flag: "5"},
        "zjq_6": {title: "6球", flag: "6"},
        "zjq_7": {title: "7球", flag: "7"},

        //半全场.
        "bqc_0": {title: "胜胜", flag: "s-s"},
        "bqc_1": {title: "胜平", flag: "s-p"},
        "bqc_2": {title: "胜负", flag: "s-f"},
        "bqc_3": {title: "平胜", flag: "p-s"},
        "bqc_4": {title: "平平", flag: "p-p"},
        "bqc_5": {title: "平负", flag: "p-f"},
        "bqc_6": {title: "负胜", flag: "f-s"},
        "bqc_7": {title: "负平", flag: "f-p"},
        "bqc_8": {title: "负负", flag: "f-f"},

        //比分
        "bf_0": {title: "1:0", flag: "1-0"},
        "bf_1": {title: "2:0", flag: "2-0"},
        "bf_2": {title: "2:1", flag: "2-1"},
        "bf_3": {title: "3:0", flag: "3-0"},
        "bf_4": {title: "3:1", flag: "3-1"},
        "bf_5": {title: "3:2", flag: "3-2"},
        "bf_6": {title: "4:0", flag: "4-0"},
        "bf_7": {title: "4:1", flag: "4-1"},
        "bf_8": {title: "4:2", flag: "4-2"},
        "bf_9": {title: "5:0", flag: "5-0"},
        "bf_10": {title: "5:1", flag: "5-1"},
        "bf_11": {title: "5:2", flag: "5-2"},
        "bf_12": {title: "胜其他", flag: "s-s"},//胜其他
        "bf_13": {title: "0:0", flag: "0-0"},
        "bf_14": {title: "1:1", flag: "1-1"},
        "bf_15": {title: "2:2", flag: "2-2"},
        "bf_16": {title: "3:3", flag: "3-3"},
        "bf_17": {title: "平其他", flag: "p-p"},//平其他
        "bf_18": {title: "0:1", flag: "0-1"},
        "bf_19": {title: "0:2", flag: "0-2"},
        "bf_20": {title: "1:2", flag: "1-2"},
        "bf_21": {title: "0:3", flag: "0-3"},
        "bf_22": {title: "1:3", flag: "1-3"},
        "bf_23": {title: "2:3", flag: "2-3"},
        "bf_24": {title: "0:4", flag: "0-4"},
        "bf_25": {title: "1:4", flag: "1-4"},
        "bf_26": {title: "2:4", flag: "2-4"},
        "bf_27": {title: "0:5", flag: "0-5"},
        "bf_28": {title: "1:5", flag: "1-5"},
        "bf_29": {title: "2:5", flag: "2-5"},
        "bf_30": {title: "负其他", flag: "f-f"} //负其他
    };

    /**
     * 不同投注方式对于的彩种
     * @type {Object}
     */
    var lotteryMap = {
        "spf": {lotteryId: "46"},    // 胜负
        "bf": {lotteryId: "47"},     // 比分
        "zjq": {lotteryId: "48"},   // 总进球
        "bqc": {lotteryId: "49"},   // 半全场
        "mix": {lotteryId: "52"},   //  混投
        "rqspf": {lotteryId: "56"}  // 让球胜平负
    };

    /**
     * 得到点击阅读协议之前选择的胆码,保存.
     */
    var storeSelectedDan = function () {
       selectedDan =[];
        var danBtn = $(".zckjTab .click");
        danBtn.each(function (i, item) {
            var targetId = $(item).closest(".danBtn").attr("id");
            selectedDan[targetId] = targetId;
        });
    };

    var getSelectedDan = function () {
        for (var v in selectedDan) {
            $("#" + v).addClass("click");
        }
    };
    return {init: init};
});
