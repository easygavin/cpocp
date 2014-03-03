/**
 * 十一运夺金追能追号列表
 */
define([
    "text!../../views/luck/append.html",
    "util/Page",
	"util/PageEvent",
    "services/DigitService",
    "services/AppendService",
    "util/AppConfig",
	"util/Util",
    "util/ErrorHandler"
], function(template, page, pageEvent, digitService, appendService, appConfig, util, errorHandler){

    // 传递参数
    var args = {};

    // 单价
    var price = 2;

    // 焦点方式
    var redType = 1;

    var items = [];

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

        page.setHistoryState({url: "luck/append", data:{}},
        		"luck/append",
        		"#luck/append" + (JSON.stringify(params).length > 2 ? "?data=" + encodeURIComponent(JSON.stringify(params)) : ""),
                forward ? 1 : 0);

        // 隐藏加载标示
        util.hideLoading();
    };

    /**
     * 初始化显示
     */
    var initShow = function(data, forward) {

        // 获取智能追号检查结果
        getBufferResult();

        if (forward) {
            args.rate = 30, args.income = 100, args.type = 1;
        } else {
            $("#minRate").val(args.rate);
            $("#minIncome").val(args.income);
            if (args.type == 2) {
                $("#minIncome").siblings("span").removeClass().addClass("red");
                $("#minRate").siblings("span").removeClass().addClass("grey");
            }
        }

        // 获取智能追号列表
        getSmartList();

    };

    /**
     * 获取智能追号检查结果
     */
    var getBufferResult = function() {
        args = appConfig.getMayBuyData(appConfig.SMART_LUCK_KEY);
    };

    /**
     * 获取智能追号列表
     */
    var getSmartList = function () {
        var opt = {};
        opt.startIssue = args.startIssue;
        opt.endIssue = args.endIssue;
        opt.money = args.money;
        opt.minBonus = args.minBonus;
        opt.maxBonus = args.maxBonus;
        opt.type = args.type;
        opt.rate = parseInt(args.rate, 10);
        opt.income = parseInt(args.income, 10);

        items = appendService.getAppendList(opt);
        showPayInfo();
        showItems();
    };

    /**
     * 显示消费信息
     * @param items
     */
    var showPayInfo = function() {
        var issueCount = 0, pays = 0;
        if (items.length) {
            issueCount = items.length;
            pays = items[issueCount - 1].totalPay;
        }

        $("#issueCount").text(issueCount);
        $("#pays").text(pays);
    };

    /**
     * 显示投注列表
     */
    var showItems = function() {
        $(".smartList tbody").empty();

        if (!items.length) {
            util.toast("你太贪心哦，人家满足不了你呢");
        } else {
            for (var i = 0, len = items.length; i < len; i++) {
                addItem(items[i]);
            }
        }
    };

    /**
     * 添加一项数据
     */
    var addItem = function(item) {
        var $tr = $("<tr></tr>");

        var html = "<td>&nbsp;&nbsp;" + item.issueNo.substring(4) + "</td>";
        html += "<td>" + item.muls + "</td>";
        html += "<td>" + item.totalPay + "</td>";

        if (item.maxIncome > 0) {
            html += "<td>" + item.minIncome + "<br>~" + item.maxIncome + "</td>";
        } else {
            html += "<td>" + item.minIncome + "</td>";
        }

        if (item.maxRate > 0) {
            html += "<td>" + item.minRate.toFixed(2) + "%<br>~" + item.maxRate.toFixed(2) + "%&nbsp;&nbsp;</td>";
        } else {
            html += "<td>" + item.minRate.toFixed(2) + "%&nbsp;&nbsp;</td>";
        }

        $tr.html(html);

        $(".smartList tbody").append($tr);
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

        // 修改追号规则
        $(".zhTb").on(pageEvent.touchStart, function(e) {
            pageEvent.handleTapEvent(this, this, pageEvent.activate, e);
            return true;
        });

        $(".zhTb").on(pageEvent.activate, function(e) {
            if ($(".smartModBox").css("display") == "none") {
                showModBox();
            } else {
                hideModBox();
            }
            return true;
        });

        // 关闭显示层
        $(".lCover").on(pageEvent.click, function(e) {
            hideModBox();
            return true;
        });

        // 追期
        $("#issueUnit").on("keyup", function(e) {
            this.value = this.value.replace(/\D/g,'');
            var $issueUnit = $(this);
            args.count = $issueUnit.val();

            if ($.trim(args.count) == "") {
                return false;
            }

            if ($.trim(args.count) != "" && (typeof args.count == "NaN" || args.count < 1)) {
                args.count = 10;
                $issueUnit.val(10);
            } else if (args.count > args.leave ) {
                util.toast("离截止还剩" + args.leave + "期可追");
                args.count = args.leave;
                $issueUnit.val(args.leave);
            }
            handleEndIssue();
            return true;
        }).on("blur", function(e) {
            this.value = this.value.replace(/\D/g,'');
            var $issueUnit = $(this);
            args.count = $issueUnit.val();

            if ($.trim(args.count) == "" || typeof args.count == "NaN" || args.count < 1) {
                args.count = 10;
                $issueUnit.val(10);
                handleEndIssue();
            }
        });

        // 最小盈利率
        $("#minRate").on("focus", function(e) {
            $(this).siblings("span").removeClass().addClass("red");
            $("#minIncome").siblings("span").removeClass().addClass("grey");

            // 盈利率方式计算
            redType = 1;
        }).on("keyup", function(e) {
            this.value = this.value.replace(/\D/g,'');
            var $minRate = $(this);
            args.rate = $minRate.val();

            if ($.trim(args.rate) == "") {
                return false;
            }

            if ($.trim(args.rate) != "" && (typeof args.rate == "NaN" || args.rate < 1)) {
                args.rate = 30;
                $minRate.val(30);
            } else if (args.rate > 1000 ) {
                args.rate = 999;
                $minRate.val(999);
            }

            return true;
        }).on("blur", function(e) {
            this.value = this.value.replace(/\D/g,'');
            var $minRate = $(this);
            args.rate = $minRate.val();

            if ($.trim(args.rate) == "" || typeof args.rate == "NaN" || args.rate < 1) {
                args.rate = 30;
                $minRate.val(30);
            }
        });

        // 最小盈利金额
        $("#minIncome").on("focus", function(e) {
            $(this).siblings("span").removeClass().addClass("red");
            $("#minRate").siblings("span").removeClass().addClass("grey");

            // 盈利金额方式计算
            redType = 2;
        }).on("keyup", function(e) {
            this.value = this.value.replace(/\D/g,'');
            var $minIncome = $(this);
            args.income = $minIncome.val();

            if ($.trim(args.income) == "") {
                return false;
            }

            if ($.trim(args.income) != "" && (typeof args.income == "NaN" || args.income < 1)) {
                args.income = 100;
                $minIncome.val(100);
            }

            return true;
        }).on("blur", function(e) {
            this.value = this.value.replace(/\D/g,'');
            var $minIncome = $(this);
            args.income = $minIncome.val();

            if ($.trim(args.income) == "" || typeof args.income == "NaN" || args.income < 1) {
                args.income = 100;
                $minIncome.val(100);
            }
        });

        // 确定计算方式
        $("#operate").on(pageEvent.touchStart, function(e) {
            pageEvent.handleTapEvent(this, this, pageEvent.activate, e);
            return true;
        });

        $("#operate").on(pageEvent.activate, function(e) {
            if ($(this).hasClass("gmBtn")) { // 购买
                toBuy();
            } else {
                hideModBox();
                args.type = redType;

                // 获取智能追号列表
                getSmartList();
            }

            return true;
        });

    };

    /**
     * 购买付款
     */
    var toBuy = function() {
        if (items == null || typeof items == "undefined" || items.length == 0) {
            return false;
        }
        // 参数设置
        var params = {};

        // 开始期号
        params.issueNo = items[0].issueNo; // 期号
        params.lotteryType = args.lotteryType; //彩种

        var modeItem = appendService.modeMap[args.mode];

        // 内容
        var content = "[" + modeItem.key + "]" + args.content;
        params.content = content.replace(/[ ]/g,"");

        // 大乐透专用，0不追加，1追加
        params.addtionSupper = "0";

        // 购买当期的详细信息
        var details = [], totalBet = 0;
        for (var i = 0, len = items.length; i < len; i++) {
            var detail = {
                amount: items[i].pay + "", // 当期金额
                muls: items[i].muls + "", // 当期倍数
                bets: args.bet + "", // 当期注数
                issueNo: items[i].issueNo // 当期期号
            };
            totalBet += items[i].muls;
            details.push(detail);
        }

        params.detail = details;
        params.bets = args.bet + ""; // 总注数
        params.totalIssue = args.count + ""; // 总期数
        params.totalBet = totalBet + ""; // 总倍数
        params.stopBetting = $("#stopBetting").attr("checked") ? "1" : "0"; // 中奖后停止追号 0不停止，1停止
        params.btzh = "1"; // 高频彩，是否是倍投计算器
        params.stopCondition = "0";  // 停止追号条件

        // 玩法类型 1 直选， 2 复式, 5 胆拖
        params.playType = modeItem.playType;
        params.betType = modeItem.betType; // 投注类型 1 直选

        // 显示遮住层
        util.showCover();
        util.showLoading();

        appConfig.setMayBuyData(appConfig.SMART_LUCK_KEY, args);

        // 请求接口
        digitService.toBuy(args.lotteryType, "1", params, price, function(data) {

            // 隐藏遮住层
            util.hideCover();
            util.hideLoading();

            if (typeof data != "undefined" ) {
                if (typeof data.statusCode != "undefined") {
                    if (data.statusCode == "0") {
                        result = data;
                        util.prompt(
                            "十一运夺金 第 "+items[0].issueNo+" 期投注成功",
                            "编号:"+data.lotteryNo + "<br>" + "账号余额:"+data.userBalance+" 元",
                            "查看方案",
                            "确定",
                            function(e) {
                                page.initPage("digit/details", {lotteryType: args.lotteryType, requestType: "0", projectId: result.projectId}, 0);
                            },
                            function(e) {
                                page.goBack();
                            }
                        );
                        // 删除缓存记录
                        appConfig.clearMayBuyData(appConfig.SMART_LUCK_KEY);

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
     * 处理截止期号
     */
    var handleEndIssue = function() {
        args.count = parseInt(args.count, 10);
        // 期数检查
        var number = args.startIssue.substring(args.startIssue.length - 2);
        if (typeof number != "undefined" && number != "") {
            number = parseInt(number, 10);
        }

        // 截止期号
        var endIssue = "";
        var prepend = args.startIssue.substring(0, args.startIssue.length - 2);
        if (args.count > 0) {
            var endNum = number + args.count - 1;
            args.endIssue = prepend + (endNum < 10 ? ("0" + endNum) : endNum);
        }
    };

    /**
     * 显示修改条件
     */
    var showModBox = function() {
        $(".smartModBox").show();
        showLCover();

        // 图标
        $(".gmBtn").removeClass().addClass("sure");
    };

    /**
     * 隐藏修改条件
     */
    var hideModBox = function() {
        $(".smartModBox").hide();
        hideLCover();

        // 图标
        $(".sure").removeClass().addClass("gmBtn");
    };

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

    return {init:init};
});
