/**
 * 竞彩篮球列表
 */
define([
    "text!../../views/jczq/list.html",
    "util/Page",
	"util/PageEvent",
    "util/AppConfig",
	"util/Calculate",
	"util/Util",
    "util/ErrorHandler"
], function(template, page, pageEvent, appConfig, calculate, util, errorHandler){

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
    var types = [];

    /**
     * 初始化
     */
    var init = function(data, forward) {
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
        page.setHistoryState({url: "jczq/list", data:{}},
        		"jczq/list",
        		"#jczq/list" + (JSON.stringify(params).length > 2 ? "?data=" + encodeURIComponent(JSON.stringify(params)) : ""),
                forward ? 1 : 0);

        // 隐藏加载标示
        util.hideLoading();
    };

    /**
     * 初始化显示
     */
    var initShow = function(data, forward) {
        if (forward) {
            timesUnit = 1;
        } else {
            $("#timesUnit").val(timesUnit);
        }

        // 显示投注列表
        bufferData = appConfig.getMayBuyData(appConfig.MAY_BUY_JCZQ_KEY);

        // 显示标题
        showTitle();

        // 显示投注列表
        showItems();

        showLCover();
    };

    /**
     * 显示投注列表
     */
    var showItems = function() {
        totals = 0, pays = 0, result = {}, price = 2;
        $(".zckjTab tbody").empty();
        if (bufferData != null && typeof bufferData != "undefined"
            && bufferData.matchBetList != null &&  typeof bufferData.matchBetList != "undefined"
            && bufferData.matchBetList.length) {
            var matchBetList = bufferData.matchBetList;
            for (var i = 0, len = matchBetList.length; i < len; i++) {
                addItem(i, matchBetList[i]);
            }
        }

        // 显示付款信息
        showPayInfo();
    };


    /**
     * 添加一项数据
     * @param index
     * @param item
     */
    var addItem = function(index, item) {
        var matchId = item.matchId;
        var match = item.match;

        var $tr = $("<tr></tr>");
        $tr.attr("id", "m_"+matchId);

        var str = "";

        var teams = match.playAgainst.split("|");

        str +="<td>";
            str +="<p>";
                str += "<i>"+match.number+"</i>";
                str += "<i>"+teams[0]+"</i><i>vs</i><i>"+teams[1]+"</i>"
            str +="</p>";

        str +="<p>";

        // 胜负, 让分胜负, 大小分, 胜负差
        var sfIds = item.sfIds,
            rfsfIds = item.rfsfIds,
            dxfIds = item.dxfIds,
            sfcIds = item.sfcIds;
        if (sfIds.length) {
            for (var i = 0, len = sfIds.length; i < len; i++) {
                str +="<i class='red'>"+spModeMap[sfIds[i]].title+"</i>";
            }
        }

        if (rfsfIds.length) {
            for (var i = 0, len = rfsfIds.length; i < len; i++) {
                str +="<i class='red'>"+spModeMap[rfsfIds[i]].title+"</i>";
            }
        }

        if (dxfIds.length) {
            for (var i = 0, len = dxfIds.length; i < len; i++) {
                str +="<i class='red'>"+spModeMap[dxfIds[i]].title+"</i>";
            }
        }

        if (sfcIds.length) {
            for (var i = 0, len = sfcIds.length; i < len; i++) {
                str +="<i class='red'>"+spModeMap[sfcIds[i]].title+"</i>";
            }
        }


        str +="</p>"
        str +="</td>";

        str +="<td>";
        // 竞彩篮球混投无胆
        str += (titleFlag != "mix" ? "<i class='danBtn fr'>胆</i>" : "&nbsp;");
        str +="</td>";

        $tr.html(str);
        $(".zckjTab tbody").append($tr);
    };

    /**
     * 显示标题
     */
    var showTitle = function () {
        var count = 0;
        titleFlag = "";
        var title = "竞蓝";

        if (bufferData != null && typeof bufferData != "undefined"
            && bufferData.matchBetList != null &&  typeof bufferData.matchBetList != "undefined"
            && bufferData.matchBetList.length) {
            for (var t in bufferData.titleMap) {
                count++;
                titleFlag = t;
                types.push(t);
            }
            if (count == 1) {
                switch (titleFlag) {
                    case "sf":
                        title +="胜负";
                        break;
                    case "rfsf":
                        title +="让分胜负";
                        break;
                    case "dxf":
                        title +="大小分";
                        break;
                    case "sfc":
                        title +="胜分差";
                        break;
                }
            } else {
                title +="混投";
                titleFlag = "mix";
            }
        }

        $("#title").text(title);
    };

    /**
     * 获取过关方式
     */
    var getCrossWayArr = function () {
        // 胆数
        var danCount = $(".zckjTab .click").length;
        // 场数
        var matchLen = bufferData.matchBetList.length;

        // 普通过关

    };

    /**
     * 清除胆
     */
    var clearDan = function () {
        $(".zckjTab").removeClass("click");
    };

    /**
     * 付款信息
     */
    var showPayInfo = function() {

        // 倍数
        $("#times").text(timesUnit);

        // 注数
        $("#totals").text(totals);

        pays = totals * price * timesUnit;
        // 总付款
        $("#pays").text(pays);
    };

    /**
     * 绑定事件
     */
    var bindEvent = function() {

        // 返回
        $(".back").on(pageEvent.touchStart, function(e) {
            pageEvent.handleTapEvent(this, this, pageEvent.activate, e);
            return true;
        });

        $(".back").on(pageEvent.activate, function(e) {
            page.goBack();
            return true;
        });

        // 协议
        $("#protocolA").on(pageEvent.touchStart, function(e) {
            pageEvent.handleTapEvent(this, this, pageEvent.activate, e);
            return true;
        });

        $("#protocolA").on(pageEvent.activate, function(e) {
            page.initPage("protocol", {}, 1);
            return true;
        });

        // 胆
        $(".zckjTab").on(pageEvent.tap, function(e) {
            var $target = $(e.target);
            var $danBtn = $target.closest(".danBtn");
            if ($danBtn.length) {
                if ($danBtn.hasClass("click")) {
                    $danBtn.removeClass("click");
                } else {
                    var danCount = $(".zckjTab .click").length;
                    if (bufferData.matchBetList.length < 8
                        && danCount == bufferData.matchBetList.length - 1) {
                        util.toast("当期最多只能设"+danCount+"个胆");
                    } else if (bufferData.matchBetList.length >= 8
                        && danCount == 7) {
                        util.toast("当期最多只能设"+danCount+"个胆");
                    } else {
                        $danBtn.addClass("click");
                    }
                }
            }
            return true;
        });

        // 倍数
        $("#timesUnit").on("keyup", function(e) {
            this.value = this.value.replace(/\D/g,'');
            var $timesUnit = $(this);
            timesUnit = $timesUnit.val();

            if ($.trim(timesUnit) == "") {
                return false;
            }

            if ($.trim(timesUnit) != "" && (typeof timesUnit == "NaN" || timesUnit < 1)) {
                timesUnit = 1;
                $timesUnit.val(1);
            } else if (timesUnit > 999 ) {
                util.toast("亲，最多只能投999倍哦");
                timesUnit = 999;
                $timesUnit.val(999);
            }
            // 显示付款信息
            showPayInfo();
            return true;
        }).on("blur", function(e) {
            this.value = this.value.replace(/\D/g,'');
        });

        // 付款
        $(".gmBtn").on(pageEvent.touchStart, function(e) {
            pageEvent.handleTapEvent(this, this, pageEvent.activate, e);
            return true;
        });

        $(".gmBtn").on(pageEvent.activate, function(e) {

            // 检查值
            if (checkVal()) {
                // 购买
                //toBuy();
            }
            return true;
        });

    };

    /**
     * 检查有效值
     */
    var checkVal = function() {

        // 倍数
        var $timesUnit = $("#timesUnit");
        timesUnit = $timesUnit.val();

        if ($.trim(timesUnit) == "" || typeof timesUnit == "NaN" || timesUnit < 1) {
            timesUnit = 0;
            util.toast("请至少选择 1 注");

            // 显示付款信息
            showPayInfo();
            return false;
        }
        return true;
    };

    /**
     * 购买付款
     */
    /*var toBuy = function() {
        // 参数设置
        var params = {};
        params.issueNo = issue.issueNo; // 期号
        params.lotteryType = lotteryType; //彩种

        // 内容
        var content = "";
        $(".tl p").each(function(i, item) {
            if (i > 0) {content += "#";}
            content +=$(item).text();
        });
        params.content = content.replace(/[ ]/g,"");

        // 大乐透专用，0不追加，1追加
        params.addtionSupper = $("#addtionSupper").attr("checked") ? "1" : "0";

        // 购买当期的详细信息
        var detail = [{
            amount: (totals * timesUnit * price) + "", // 当期金额
            muls: timesUnit + "", // 当期倍数
            bets: totals + "", // 当期注数
            issueNo: issue.issueNo // 当期期号
        }];
        params.detail = detail;
        params.bets = totals + ""; // 总注数
        params.totalIssue = issueUnit + ""; // 总期数
        params.totalBet = (timesUnit * issueUnit) + ""; // 总倍数
        params.stopBetting = $("#stopBetting").attr("checked") ? "1" : "0"; // 中奖后停止追号 0不停止，1停止
        params.btzh = "0"; // 高频彩，是否是倍投计算器
        params.stopCondition = "8";  // 停止追号条件

        var modeItem = modeMap[mode];
        // 玩法类型 2 复式, 5 胆拖
        params.playType = modeItem.playType;
        params.betType = modeItem.betType; // 投注类型 1 直选

        // 显示遮住层
        util.showCover();
        util.showLoading();

        // 请求接口
        digitService.toBuy(lotteryType, "1", params, price, function(data) {

            // 隐藏遮住层
            util.hideCover();
            util.hideLoading();

            if (typeof data != "undefined" ) {
                if (typeof data.statusCode != "undefined") {
                    if (data.statusCode == "0") {
                        result = data;
                        util.prompt(
                            "大乐透 第 "+issue.issueNo+" 期投注成功",
                            "编号:"+data.lotteryNo + "<br>" + "账号余额:"+data.userBalance+" 元",
                            "查看方案",
                            "确定",
                            function(e) {
                                page.initPage("digit/details", {lotteryType: lotteryType, requestType: "0", projectId: result.projectId}, 0);
                            },
                            function(e) {
                                page.goBack();
                            }
                        );
                        // 删除选号记录
                        appConfig.clearMayBuyData(appConfig.MAY_BUY_HAPPY_KEY);

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
    };*/

    /**
     * 显示遮盖层
     */
    var showLCover = function() {
        var bodyHeight = Math.max(document.documentElement.clientHeight, document.body.offsetHeight);
        var headerH = $(".header").height();
        $(".lCover").css({"height": (bodyHeight - headerH) + "px"}).show();
    };

    /**
     * 隐藏遮盖层
     */
    var hideLCover = function() {
        $(".lCover").hide();
    };

    /**
     * 模式映射
     * @type {Object}
     */
    var spModeMap = {
        "sf_0": {title: "主胜"},
        "sf_1": {title: "客胜"},
        "rfsf_1": {title: "让分主胜"},
        "rfsf_2": {title: "让分客胜"},
        "dxf_1": {title: "大分"},
        "dxf_2": {title: "小分"},
        "sfc_0": {title: "主胜1-5分"},
        "sfc_1": {title: "主胜6-10分"},
        "sfc_2": {title: "主胜11-15分"},
        "sfc_3": {title: "主胜16-20分"},
        "sfc_4": {title: "主胜21-25分"},
        "sfc_5": {title: "主胜26+分"},
        "sfc_6": {title: "客胜1-5分"},
        "sfc_7": {title: "客胜6-10分"},
        "sfc_8": {title: "客胜11-15分"},
        "sfc_9": {title: "客胜16-20分"},
        "sfc_10": {title: "客胜21-25分"},
        "sfc_11": {title: "客胜26+分"}
    };

    /**
     * 不同投注方式对于的彩种
     * @type {Object}
     */
    var lotteryMap = {
        "sf": {lotteryId: "36"}, // 胜负
        "rfsf": {lotteryId: "37"}, // 让分胜负
        "sfc": {lotteryId: "38"}, // 胜分差
        "dxf": {lotteryId: "39"}, // 大小分
        "mix": {lotteryId: "53"} // 混投
    };

    return {init:init};
});
