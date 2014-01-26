/**
 * 十一运夺金列表
 */
define([
    "text!../../views/luck/list.html",
    "util/Page",
	"util/PageEvent",
    "services/DigitService",
    "services/AppendService",
    "util/AppConfig",
	"util/Calculate",
	"util/Util",
    "util/ErrorHandler"
], function(template, page, pageEvent, digitService, appendService, appConfig, calculate, util, errorHandler){

    // 彩种
    var lotteryType = "31";

    // 购彩模式
    var mode = "4";

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

    // 计时秒
    var seconds = 0;

    // 倒计时定时器
    var secondTimer = null;

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
        page.setHistoryState({url: "luck/list", data:{}},
        		"luck/list",
        		"#luck/list" + (JSON.stringify(params).length > 2 ? "?data=" + encodeURIComponent(JSON.stringify(params)) : ""),
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
     * 获取期号
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

        if (issue.endTime !=null && typeof issue.endTime != "undefined"
            && $.trim(issue.endTime) !=""){
            var serverTime = handleStrDate(issue.serverTime);
            var serverDate = new Date();
            serverDate.setFullYear(parseInt(serverTime.year, 10),
                parseInt(serverTime.month, 10) - 1,
                parseInt(serverTime.day, 10));
            serverDate.setHours(parseInt(serverTime.hour, 10),
                parseInt(serverTime.minute, 10),
                parseInt(serverTime.second, 10),
                0);

            var endTime = handleStrDate(issue.endTime);
            var endDate = new Date();
            endDate.setFullYear(parseInt(endTime.year, 10),
                parseInt(endTime.month, 10) - 1,
                parseInt(endTime.day, 10));
            endDate.setHours(parseInt(endTime.hour, 10),
                parseInt(endTime.minute, 10),
                parseInt(endTime.second, 10),
                0);

            seconds = (endDate.getTime() - serverDate.getTime()) / 1000;
            console.log("seconds:"+seconds);
            showIssue();

            // 倒计时
            clearInterval(secondTimer);
            secondTimer = setInterval(function() {
                if (seconds > 0) {
                    seconds--;
                    showIssue();
                } else {
                    util.dialog(
                        "",
                        issue.issueNo + "期已截止",
                        "确定",
                        function(e) {}
                    );

                    clearInterval(secondTimer);

                    // 重新拉取期号信息
                    getIssue();
                }
            }, 1000);
        }
    };

    /**
     * 处理字符时间
     */
    var handleStrDate = function(str) {

        var sParam = str.split("-");
        var sYear = sParam[0], sMonth = sParam[1];
        var sdParam = sParam[2].split(" ");
        var sDay = sdParam[0];
        var sHMS = sdParam[1].split(":");
        var sHour = sHMS[0], sMinute = sHMS[1], sSecond = sHMS[2];

        return {
            year: sYear,
            month: sMonth,
            day: sDay,
            hour: sHour,
            minute: sMinute,
            second: sSecond
        };
    };

    /**
     * 显示期号，倒计时
     */
    var showIssue = function() {
        var minute = Math.floor(seconds / 60);
        var second = seconds % 60;
        var issueTxt = issue.issueNo.substring(8) + "期截止:" + minute + ":" +
            ( second < 10 ? "0" + second : second );
        $("#issueNo").text(issueTxt);
    };

    /**
     * 显示投注列表
     */
    var showItems = function() {
        totals = 0, pays = 0, result = {};
        $(".listTz").empty();
        // 显示投注列表
        bufferData = appConfig.getMayBuyData(appConfig.MAY_BUY_LUCK_KEY);

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
        mode = item.mode;
        var text = "", nos_text = "", mode_text = "";

        var modeItem = appendService.modeMap[mode];
        text = modeItem.title;
        if (parseInt(mode, 10) > 11) {
            // 机选不显示
            $(".btnMenu .first").hide();
        }

        nos_text = "<p><span class='red mlr5'>";
        if (item.redFs.length) {
            nos_text += item.redFs.toString();
        }
        if (item.redSs.length) {
            nos_text +=";" + item.redSs.toString();
        }
        if (item.redTs.length) {
            nos_text +=";" + item.redTs.toString();
        }
        nos_text += "</span></p>";

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
            clearInterval(secondTimer);
            page.goBack();
            return true;
        });

        // 获取期号
        $("#issueNo").on(pageEvent.touchStart, function(e) {
            pageEvent.handleTapEvent(this, this, pageEvent.activate, e);
            return true;
        });

        $("#issueNo").on(pageEvent.activate, function(e) {

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
            offBind();
            page.initPage("protocol", {}, 1);
            return true;
        });

        // 随机一注
        $(".btnMenu .first").on(pageEvent.touchStart, function(e) {
            pageEvent.handleTapEvent(this, this, pageEvent.activate, e);
            return true;
        });

        $(".btnMenu .first").on(pageEvent.activate, function(event) {

            // 保存十一运夺金数据
            var data = {};
            // 投注模式
            data.mode = mode;
            data.total = 1;
            //data.pay = price;

            var redFs = new Array(), redSs = new Array(), redTs = new Array();
            switch (mode) {
                case "0": // 任一
                    redFs = attachZero(calculate.getSrand(1,11,1));
                    break;
                case "1": // 任二
                    redFs = attachZero(calculate.getSrand(1,11,2));
                    break;
                case "2": // 任三
                    redFs = attachZero(calculate.getSrand(1,11,3));
                    break;
                case "3": // 任四
                    redFs = attachZero(calculate.getSrand(1,11,4));
                    break;
                case "4": // 任五
                    redFs = attachZero(calculate.getSrand(1,11,5));
                    break;
                case "5": // 任六
                    redFs = attachZero(calculate.getSrand(1,11,6));
                    break;
                case "6": // 任七
                    redFs = attachZero(calculate.getSrand(1,11,7));
                    break;
                case "7": // 任八
                    redFs = attachZero(calculate.getSrand(1,11,8));
                    break;
                case "8": // 前三直选
                    var randoms = attachZero(calculate.getSrand(1,11,3));
                    redFs.push(randoms[0]);
                    redSs.push(randoms[1]);
                    redTs.push(randoms[2]);
                    break;
                case "9": // 前三组选
                    redFs = attachZero(calculate.getSrand(1,11,3));
                    break;
                case "10": // 前二直选
                    var randoms = attachZero(calculate.getSrand(1,11,2));
                    redFs.push(randoms[0]);
                    redSs.push(randoms[1]);
                    break;
                case "11": // 前二组选
                    redFs = attachZero(calculate.getSrand(1,11,2));
                    break;
            }
            data.redFs = redFs;
            data.redSs = redSs;
            data.redTs = redTs;

            bufferData.push(data);
            appConfig.setMayBuyData(appConfig.MAY_BUY_LUCK_KEY, bufferData);

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
            offBind();
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
                    appConfig.setMayBuyData(appConfig.MAY_BUY_LUCK_KEY, bufferData);

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
                    offBind();
                    page.initPage("luck/ball", {index: index}, 1);
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
            } else if (timesUnit > 9999 ) {
                util.toast("亲，最多只能投9999倍哦");
                timesUnit = 9999;
                $timesUnit.val(9999);
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

        // 智能追号
        $(".computer").on(pageEvent.touchStart, function(e) {
            pageEvent.handleTapEvent(this, this, pageEvent.activate, e);
            return true;
        });

        $(".computer").on(pageEvent.activate, function(e) {
            if (typeof issue.issueNo == "undefined") {
                util.toast("无法获取到彩票期号");
                return false;
            }

            // 智能追号检查
            toAppend();
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
     * 解除绑定
     */
    var offBind = function() {
        clearInterval(secondTimer);
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
            if (i > 0) {content += "/";}
            content +="[" + appendService.modeMap[mode].key + "]" + $(item).text();
        });
        params.content = content.replace(/[ ]/g,"");
        // 玩法类型 1 直选， 2 复式, 5 胆拖
        params.playType = "1";

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
        params.stopCondition = "0";  // 停止追号条件

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
                            "十一运夺金 第 "+issue.issueNo+" 期投注成功",
                            "编号:"+data.lotteryNo + "<br>" + "账号余额:"+data.userBalance+" 元",
                            "查看方案",
                            "确定",
                            function(e) {
                                offBind();
                                page.initPage("digit/details", {lotteryType: lotteryType, requestType: "0", projectId: result.projectId}, 0);
                            },
                            function(e) {
                                page.goBack();
                            }
                        );
                        // 删除选号记录
                        appConfig.clearMayBuyData(appConfig.MAY_BUY_LUCK_KEY);

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

    var toAppend = function () {

        // 检查方案数
        var $p = $(".tl p");

        if ($p.length > 1) {
            util.toast("暂不支持多种方案计算，请保留一种方案");
            return false;
        }

        var content = $p.text();
        var balls = 0, dans = 0, tuos = 0;
        var splitArr = content.split(";");
        if (splitArr.length > 1) {
            dans = splitArr[0].split(",").length;
            tuos = splitArr[1].split(",").length;
            balls = dans + tuos;
        } else {
            balls = content.split(",").length;
        }

        var opt = {};
        $p.siblings("i").find(".red").each(function (i, item) {
            if (i == 0) {
                opt.bet = parseInt($(item).text(), 10);
            } else if (i == 1) {
                opt.money = parseInt($(item).text(), 10);
            }
        });

        opt.bonus = appendService.modeMap[mode].bonus;
        opt.issueNo = issue.issueNo;
        opt.count = 10;
        opt.sum = 78;
        opt.mode = mode;
        opt.balls = balls;
        opt.dans = dans;
        opt.tuos = tuos;

        // 检查返回结果
        var aResult = appendService.beforeHandler(opt);

        if (typeof aResult.startIssue == "undefined") {
            util.toast("你太贪心哦，人家满足不了你呢");
            return false;
        }

        aResult.lotteryType = lotteryType;
        aResult.content = content;
        aResult.sum = 78;
        aResult.mode = mode;
        aResult.bet = opt.bet;

        offBind();

        appConfig.setMayBuyData(appConfig.SMART_LUCK_KEY, aResult);

        page.initPage("luck/append", {}, 1);

    };


    /**
     * 补0操作
     * @param arr
     */
    var attachZero = function(arr) {
        for (var i = 0, len = arr.length; i < len; i++) {
            arr[i] = parseInt(arr[i], 10) < 10 ? "0" + parseInt(arr[i], 10) : arr[i];
        }
        return arr;
    };
    return {init:init};
});
