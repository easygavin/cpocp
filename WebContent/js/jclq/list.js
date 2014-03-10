/**
 * 竞彩篮球列表
 */
define([
    "text!../../views/jclq/list.html",
    "util/Page",
    "util/PageEvent",
    "util/AppConfig",
    "services/JclqService",
    "util/Util",
    "util/ErrorHandler"
], function (template, page, pageEvent, appConfig, jclqService, util, errorHandler) {

    // 彩种
    var lotteryType = "36";

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
    var types = [];

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

    // 奖金
    var prizes = null;
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
        page.setHistoryState({url:"jclq/list", data:{}},
            "jclq/list",
            "#jclq/list" + (JSON.stringify(params).length > 2 ? "?data=" + encodeURIComponent(JSON.stringify(params)) : ""),
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
        bufferData = appConfig.getLocalJson(appConfig.keyMap.MAY_BUY_JCLQ_KEY);

        // 显示标题
        showTitle();

        // 显示投注列表
        showItems();

        // 获取过关方式
        getCrossWayArr();

        // 初始化显示文本
        initShowTxt();

        // 获取总注数
        getTotalBet();

        // 获取最小最大奖金
        getMinMaxPrize();

        // 显示付款信息
        showPayInfo();
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
        var sfIds = item.sfIds,
            rfsfIds = item.rfsfIds,
            dxfIds = item.dxfIds,
            sfcIds = item.sfcIds,
            spCount = 0;

        // 收集SP值数组
        var itemSPArr = [];
        var agcgArr = [];

        if (sfIds.length) {
            spCount += sfIds.length;
            for (var i = 0, len = sfIds.length; i < len; i++) {

                var sp = handleSPValue(sfIds[i], match);
                itemSPArr.push(sp);
                agcgArr.push(1);

                var mode = spModeMap[sfIds[i]];
                str += "<i class='red' id='sf_" + mode.flag + "|" + sp + "'>" + mode.title + "</i>";
            }
        }

        if (rfsfIds.length) {
            spCount += rfsfIds.length;
            for (var i = 0, len = rfsfIds.length; i < len; i++) {

                var sp = handleSPValue(rfsfIds[i], match);
                itemSPArr.push(sp);
                agcgArr.push(2);

                var mode = spModeMap[rfsfIds[i]];
                str += "<i class='red' id='rfsf_" + mode.flag + "|" + sp + "'>" + mode.title + "</i>";
            }
        }

        if (dxfIds.length) {
            spCount += dxfIds.length;
            for (var i = 0, len = dxfIds.length; i < len; i++) {

                var sp = handleSPValue(dxfIds[i], match);
                itemSPArr.push(sp);
                agcgArr.push(3);

                var mode = spModeMap[dxfIds[i]];
                str += "<i class='red' id='dxf_" + mode.flag + "|" + sp + "'>" + mode.title + "</i>";
            }
        }

        if (sfcIds.length) {
            spCount += sfcIds.length;
            for (var i = 0, len = sfcIds.length; i < len; i++) {

                var sp = handleSPValue(sfcIds[i], match);
                itemSPArr.push(sp);
                agcgArr.push(4);

                var mode = spModeMap[sfcIds[i]];
                str += "<i class='red' id='sfc_" + mode.flag + "|" + sp + "'>" + mode.title + "</i>";
            }
        }

        // 赛事数据
        optArr[matchId] = spCount;
        agcg[matchId] = agcgArr;

        // SP值排序
        itemSPArr.sort(jclqService.asc);
        // 保存SP数组
        spArr[matchId] = itemSPArr;

        str += "</p>"
        str += "</td>";

        str += "<td>";
        // 竞彩篮球混投无胆
        str += (titleFlag != "mix" ? "<i class='danBtn fr'>胆</i>" : "&nbsp;");
        str += "</td>";

        $tr.html(str);
        $(".zckjTab tbody").append($tr);
    };

    /**
     * 处理SP值
     * @param spWayIndex
     * @param match
     */
    var handleSPValue = function (spWayIndex, match) {
        var spWayIndexArr = spWayIndex.split("_");
        var sp = "0";
        if (spWayIndexArr.length > 1) {
            var spWay = spWayIndexArr[0];
            var index = parseInt(spWayIndexArr[1], 10);
            var spDatas = match.spDatas;
            switch (spWay) {
                case "sf": // 胜负
                    var sf = spDatas.sf.split(",");
                    sp = sf[index];
                    break;
                case "rfsf": // 让分胜负
                    var rfsf = spDatas.rfsf.split(",");
                    sp = rfsf[index];
                    break;
                case "dxf": // 大小分
                    var dxf = spDatas.dxf.split(",");
                    sp = dxf[index];
                    break;
                case "sfc": // 胜负差
                    var sfc = spDatas.sfc.split(",");
                    sp = sfc[index];
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
        var title = "竞篮";

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
                    case "sf":
                        title += "胜负";
                        break;
                    case "rfsf":
                        title += "让分胜负";
                        break;
                    case "dxf":
                        title += "大小分";
                        break;
                    case "sfc":
                        title += "胜分差";
                        break;
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
            normalWays = jclqService.getNormalWays(matchLen, danCount, types);
            if (normalWays.length > 0) {
                for (var i = 0, len = normalWays.length; i < len; i++) {
                    $("#way_0").append("<li id='" + normalWays[i] + "'>" + normalWays[i].replace('-', '串') + "</li>");
                }
            }

            if (titleFlag != "mix") {
                // 多串过关
                manyWays = jclqService.getManyWay(matchLen, types);
                if (manyWays.length > 0) {
                    for (var i = 0, len = manyWays.length; i < len; i++) {
                        $("#way_1").append("<li id='" + manyWays[i] + "'>" + manyWays[i].replace('-', '串') + "</li>");
                    }

                    $("#tab_1").show();
                }
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
            totals = jclqService.getBetByCrossWay(ways, optArr, danNOs);
        }
    };

    /**
     * 获取最小最大奖金
     */
    var getMinMaxPrize = function () {
        var ways = $("#crossTxt").text().replace(/串/g, '-').split(",");
        console.log(ways.toString());

        prizes = {
            min:"0.00",
            max:"0.00"
        };

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

            if (titleFlag == "mix") {
                prizes = jclqService.getMixMinMaxPrize(ways, optArr, spArr, agcg, timesUnit);
            } else {
                prizes = jclqService.getMinMaxPrize(ways, optArr, danNOs, spArr, timesUnit);
            }
            console.log("min: " + prizes.min + ", max: " + prizes.max);

        }

        $("#guessBonus").html("奖金:" + prizes.min + "~" + (prizes.max > 10000 ? "<br>" : "") + prizes.max + "元");
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
                        util.toast("当前最多只能设" + danCount + "个胆");
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
                timesUnit = 0;
            } else {
                if ($.trim(timesUnit) != "" && (isNaN(timesUnit) || timesUnit < 1)) {
                    timesUnit = 1;
                    $timesUnit.val(1);
                } else if (timesUnit > 999) {
                    util.toast("亲，最多只能投999倍哦");
                    timesUnit = 999;
                    $timesUnit.val(999);
                }
            }

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

            // 获取最小最大奖金
            getMinMaxPrize();
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
                var sf = [], rfsf = [], sfc = [], dxf = [];
                // SP 值
                var sfV = [], rfsfV = [], sfcV = [], dxfV = [];
                $item.find(".red").each(function (j, p) {
                    var spFlagV = $(p).attr("id").split("_");
                    if (spFlagV.length > 1) {
                        var flagV = spFlagV[1].split("|");
                        switch (spFlagV[0]) {
                            case "sf": // 胜负
                                sf.push(flagV[0]);
                                sfV.push(flagV[1]);
                                break;
                            case "rfsf": // 让分胜负
                                rfsf.push(flagV[0]);
                                rfsfV.push(flagV[1]);
                                break;
                            case "dxf": // 大小分
                                dxf.push(flagV[0]);
                                dxfV.push(flagV[1]);
                                break;
                            case "sfc": // 胜分差
                                sfc.push(flagV[0]);
                                sfcV.push(flagV[1]);
                                break;
                        }
                    }
                });

                // 赛事编号
                matchArr.push(matchId);
                // 详情，SP值
                switch (titleFlag) {
                    case "sf": // 胜负
                        detailArr.push(matchId + ":" + sf.join(","));
                        buySPArr.push(matchId + ":" + sfV.join(","));
                        break;
                    case "rfsf": // 让分胜负
                        detailArr.push(matchId + ":" + rfsf.join(","));
                        buySPArr.push(matchId + ":" + rfsfV.join(","));
                        break;
                    case "dxf": // 大小分
                        detailArr.push(matchId + ":" + dxf.join(","));
                        buySPArr.push(matchId + ":" + dxfV.join(","));
                        break;
                    case "sfc": // 胜分差
                        detailArr.push(matchId + ":" + sfc.join(","));
                        buySPArr.push(matchId + ":" + sfcV.join(","));
                        break;
                    case "mix": // 混投
                        detailArr.push(matchId + ":" + sf.join(",") + "|" + rfsf.join(",") + "|" + sfc.join(",") + "|" + dxf.join(","));
                        buySPArr.push(matchId + ":" + sfV.join(",") + "|" + rfsfV.join(",") + "|" + sfcV.join(",") + "|" + dxfV.join(","));
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
            detail:detailArr.join("\/"),
            matchIds:matchArr.join(","),
            buySP:buySPArr.join("\/"),
            danCount:danArr.length + "",
            dan:danArr.join(","),
            passway:passway
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
        jclqService.toBuy("1", params, price, function (data) {

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
                                page.initPage("jclq/details", {lotteryType:lotteryType, requestType:"0", projectId:result.projectId}, 0);
                            },
                            function (e) {
                                page.goBack();
                            }
                        );
                        // 删除选号记录
                        appConfig.clearLocalData(appConfig.keyMap.MAY_BUY_JCLQ_KEY);

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
        $(".lCover").css({"height":(bodyHeight - headerH) + "px"}).show();
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
        "sf_0":{title:"主胜", flag:"3"},
        "sf_1":{title:"客胜", flag:"0"},
        "rfsf_1":{title:"让分主胜", flag:"3"},
        "rfsf_2":{title:"让分客胜", flag:"0"},
        "dxf_1":{title:"大分", flag:"3"},
        "dxf_2":{title:"小分", flag:"0"},
        "sfc_0":{title:"主胜1-5分", flag:"h1-5"},
        "sfc_1":{title:"主胜6-10分", flag:"h6-10"},
        "sfc_2":{title:"主胜11-15分", flag:"h11-15"},
        "sfc_3":{title:"主胜16-20分", flag:"h16-20"},
        "sfc_4":{title:"主胜21-25分", flag:"h21-25"},
        "sfc_5":{title:"主胜26+分", flag:"h26"},
        "sfc_6":{title:"客胜1-5分", flag:"v1-5"},
        "sfc_7":{title:"客胜6-10分", flag:"v6-10"},
        "sfc_8":{title:"客胜11-15分", flag:"v11-15"},
        "sfc_9":{title:"客胜16-20分", flag:"v16-20"},
        "sfc_10":{title:"客胜21-25分", flag:"v21-25"},
        "sfc_11":{title:"客胜26+分", flag:"v26"}
    };

    /**
     * 不同投注方式对于的彩种
     * @type {Object}
     */
    var lotteryMap = {
        "sf":{lotteryId:"36"}, // 胜负
        "rfsf":{lotteryId:"37"}, // 让分胜负
        "sfc":{lotteryId:"38"}, // 胜分差
        "dxf":{lotteryId:"39"}, // 大小分
        "mix":{lotteryId:"53"} // 混投
    };

    return {init:init};
});
