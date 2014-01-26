/**
 * 双色球列表
 */
define([
    "text!../../views/redblue/list.html",
    "util/Page",
	"util/PageEvent",
    "services/DigitService",
    "util/AppConfig",
	"util/Calculate",
	"util/Util",
    "util/ErrorHandler"
], function(template, page, pageEvent, digitService, appConfig, calculate, util, errorHandler){

    // 彩种
    var lotteryType = "11";

    // 显示投注列表
    var bufferData = null;

    // 期号
    var issue = {};

    // 追期数
    var issueUnit = 1;

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
        page.setHistoryState({url: "redblue/list", data:{}}, 
        		"redblue/list", 
        		"#redblue/list" + (JSON.stringify(params).length > 2 ? "?data=" + encodeURIComponent(JSON.stringify(params)) : ""),
                forward ? 1 : 0);
    };

    /**
     * 初始化显示
     */
    var initShow = function(data, forward) {
        if (forward) {
            issueUnit = 1, timesUnit = 1;
        } else {
            $("#issueUnit").val(issueUnit);
            $("#timesUnit").val(timesUnit);
        }

        // 获取期号信息
        getIssue();

        // 显示投注列表
        showItems();
    };

    /**
     * 获取期号信息
     */
    var getIssue = function() {
        issue = {};
        digitService.getCurrLottery(lotteryType, function(data) {
            if (typeof data != "undefined" ) {
                if (typeof data.statusCode != "undefined") {
                    if (data.statusCode == "0") {
                        issue = data;
                        handleIssue();
                    } else {
                        util.toast(data.errorMsg);
                    }
                }
            }
        });
    };

    /**
     * 处理显示期号
     */
    var handleIssue = function() {
        // 13139期截止时间:11-26 19:30
        var issueTxt = issue.issueNo + "期截止时间:";
        if (issue.endTime !=null && typeof issue.endTime != "undefined"
            && $.trim(issue.endTime) !=""){
            issueTxt += issue.endTime.substring(issue.endTime.indexOf("-") + 1, issue.endTime.lastIndexOf(":"));
        }

        $("#issueNo").text(issueTxt);
    };


    /**
     * 显示投注列表
     */
    var showItems = function() {
        totals = 0, pays = 0, result = {};
        $(".listTz").empty();
        // 显示投注列表
        bufferData = appConfig.getMayBuyData(appConfig.MAY_BUY_RED_BLUE_KEY);

        if (bufferData != null && typeof bufferData != "undefined" && bufferData.length > 0) {
            for (var i = 0, len = bufferData.length; i < len; i++) {
                addItem(i, bufferData[i]);
                totals = totals + bufferData[i].total;
            }

        }

        // 显示付款信息
        showPayInfo();
    };

    /**
     * 付款信息
     */
    var showPayInfo = function() {

        // 追期
        $("#issueCount").text(issueUnit);

        // 倍数
        $("#times").text(timesUnit);

        // 注数
        $("#totals").text(totals);

        pays = totals * price * timesUnit * issueUnit;
        // 总付款
        $("#pays").text(pays);
    };

    /**
     * 添加一项数据
     * @param index
     * @param item
     */
    var addItem = function(index, item) {
        var mode = item.mode, text = "", nos_text = "", mode_text = "";

        if (mode == "1") {
            text = "胆拖投注";
            $(".btnMenu .first").hide();
        } else {
            text = "普通投注";
        }

        if (mode == "1") {
            nos_text = "<p><span class='red mlr5'>[D:" + item.danReds.toString() + "]" +
                "[T:" + item.tuoReds.toString() + "]</span>" +
                " | <span class='c4195eb'> " + item.danTuoBlues.toString() + " </span></p>";

        } else {
            nos_text = "<p><span class='red mlr5'>" + item.normalReds.toString() + "</span>" +
                " | <span class='c4195eb'> " + item.normalBlues.toString() + " </span></p>";
        }
        mode_text = text + "<i class='fr'><i class='red mlr5'>" + item.total + "</i>注" +
            "<i class='red mlr5'>" + item.total * price + "</i>元</i>";

        var $tr = $("<tr></tr>");

        var $a_del = $("<a class='czdelete'> </a>").attr({"title": "删除", "id": "del_"+index});
        $tr.append($("<td></td>").append($a_del));

        $tr.append($("<td class='tl ptb10'></td>").html(nos_text + mode_text));

        var $a_edit = $("<a class='moreBg'> </a>").attr({"id": "edit_"+index});
        $tr.append($("<td></td>").append($a_edit).append("&nbsp;&nbsp;"));

        $(".listTz").append($tr);
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

        $(".back").on(pageEvent.activate, function(event) {
            page.goBack();
            return true;
        });

        // 获取期号
        $("#issueNo").on(pageEvent.touchStart, function(e) {
            pageEvent.handleTapEvent(this, this, pageEvent.activate, e);
            return true;
        });

        $("#issueNo").on(pageEvent.activate, function(event) {
            
            // 获取期号信息
            getIssue();
            return true;
        });

        // 协议
        $("#protocolA").on(pageEvent.touchStart, function(e) {
            pageEvent.handleTapEvent(this, this, pageEvent.activate, e);
            return true;
        });

        $("#protocolA").on(pageEvent.activate, function(event) {
            page.initPage("protocol", {}, 1);
            return true;
        });

        // 随机一注
        $(".btnMenu .first").on(pageEvent.touchStart, function(e) {
            pageEvent.handleTapEvent(this, this, pageEvent.activate, e);
            return true;
        });

        $(".btnMenu .first").on(pageEvent.activate, function(event) {

            // 保存双色球数据
            var data = {};
            // 投注模式
            data.mode = "0";
            data.total = 1;
            //data.pay = price;

            // 普通投注
            var dcRedNos = calculate.getSrand(1,33,6);
            data.normalReds = new Array();
            for (var i = 0, redLen = dcRedNos.length; i < redLen; i++) {
                data.normalReds.push(dcRedNos[i] < 10 ? ("0" + dcRedNos[i]) : dcRedNos[i]);
            }

            var dcBlueNo = calculate.getSrand(1,16,1);
            data.normalBlues = new Array();
            data.normalBlues.push(dcBlueNo < 10 ? ("0" + dcBlueNo) : dcBlueNo);

            bufferData.push(data);
            appConfig.setMayBuyData(appConfig.MAY_BUY_RED_BLUE_KEY, bufferData);

            addItem(bufferData.length - 1, data);

            // 总注数
            totals += data.total;

            // 显示付款信息
            showPayInfo();
            return true;
        });

        // 机选投注
        $(".btnMenu .end").on(pageEvent.touchStart, function(e) {
            pageEvent.handleTapEvent(this, this, pageEvent.activate, e);
            return true;
        });

        $(".btnMenu .end").on(pageEvent.activate, function(event) {
            page.goBack();
            return true;
        });

        // 删除
		$(".listTz").undelegate("td", pageEvent.touchStart);
        $(".listTz").delegate("td", pageEvent.touchStart, function(e) {
            var $target = $(e.target);
            var $czdelete = $target.hasClass("czdelete") ? $target : $target.find(".czdelete");
            if ($czdelete.length) {
                pageEvent.handleTapEvent(this, this, pageEvent.activate, e);
                return true;
            }
        });

		$(".listTz").undelegate("td", pageEvent.activate);
        $(".listTz").delegate("td", pageEvent.activate, function(e) {
            var $target = $(e.target);
            var $czdelete = $target.hasClass("czdelete") ? $target : $target.find(".czdelete");
            if ($czdelete.length) {
                // 删除
                var index = parseInt($czdelete.attr("id").split("_")[1], 10);
                if (bufferData != null && typeof bufferData != "undefined"
                    && bufferData.length == 1) {
                    util.toast("至少选择一注");
                    return false;
                }

                if (bufferData != null && typeof bufferData != "undefined"
                    && bufferData.length > 1 && typeof index != "NaN") {

                    bufferData.splice(index,1);
                    appConfig.setMayBuyData(appConfig.MAY_BUY_RED_BLUE_KEY, bufferData);

                    // 显示投注列表
                    showItems();
                }
                return true;
            }
        });

        // 编辑
		$(".listTz").undelegate("tr", pageEvent.touchStart);
        $(".listTz").delegate("tr", pageEvent.touchStart, function(e) {
            var $target = $(e.target);
            var $czdelete = $target.hasClass("czdelete") ? $target : $target.find(".czdelete");
            if (!$czdelete.length) {
                pageEvent.handleTapEvent(this, $target, pageEvent.activate, e);
                return true;
            }
        });

		$(".listTz").undelegate("tr", pageEvent.activate);
        $(".listTz").delegate("tr", pageEvent.activate, function(e) {
            var $target = $(e.target);
            var $czdelete = $target.hasClass("czdelete") ? $target : $target.find(".czdelete");
            if (!$czdelete.length) {
                // 重新编辑
                var index = parseInt($(this).find(".moreBg").attr("id").split("_")[1], 10);
                if (typeof  index != "NaN") {
                    page.initPage("redblue/ball", {index: index}, 1);
                }
                return true;
            }
        });

        // 追期
        $("#issueUnit").on("keyup", function(e) {
            this.value = this.value.replace(/\D/g,'');
            var $issueUnit = $(this);
            issueUnit = $issueUnit.val();

            if ($.trim(issueUnit) == "") {
                return false;
            }

            if ($.trim(issueUnit) != "" && (typeof issueUnit == "NaN" || issueUnit < 1)) {
                issueUnit = 1;
                $issueUnit.val(1);
            } else if (issueUnit > 50 ) {
                util.toast("亲，最多只能追50期哦");
                issueUnit = 50;
                $issueUnit.val(50);
            }

            // 显示付款信息
            showPayInfo();
            return true;
        }).on("blur", function(e) {
            this.value = this.value.replace(/\D/g,'');
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
            if (typeof issue.issueNo == "undefined") {
                util.toast("无法获取到彩票期号");
                return false;
            }

            // 检查值
            if (checkVal()) {
                // 购买
                toBuy();
            }
            return true;
        });
    };

    /**
     * 检查有效值
     */
    var checkVal = function() {
        // 追期
        var $issueUnit = $("#issueUnit");
        issueUnit = $issueUnit.val();

        if ($.trim(issueUnit) == "" || typeof issueUnit == "NaN" || issueUnit < 1) {
            issueUnit = 0;
            util.toast("请至少选择 1 注");

            // 显示付款信息
            showPayInfo();
            return false;
        }

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
    var toBuy = function() {
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
        // 玩法类型 2 复式, 5 胆拖
        params.playType = bufferData[0].mode == "1" ? "5" :"2";

        // 大乐透专用，0不追加，1追加
        params.addtionSupper = "0";

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
                            "双色球 第 "+issue.issueNo+" 期投注成功",
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
                        appConfig.clearMayBuyData(appConfig.MAY_BUY_RED_BLUE_KEY);

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

    return {init:init};
});
