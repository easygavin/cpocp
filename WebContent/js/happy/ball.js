/**
 * 大乐透选球
 */
define([
    "text!../../views/happy/ball.html",
    "util/Page",
	"util/PageEvent",
    "services/DigitService",
    "util/AppConfig",
	"util/Calculate",
	"util/Util",
    "util/Shake"
], function(template, page, pageEvent, digitService, appConfig, calculate, util, shake){

    // 处理返回参数
    var canBack = 0;

    // 彩种
    var lotteryType = "13";

    // 缓存的数据
    var bufferData = null;
    // 数组下标
    var index = -1;

    // 初始化显示模式
    var mode = "0";

    // 期号
    var issue = {};

    // 消费金额
    var pay = 0;

    // 注数
    var total = 0;
    /**
     * 初始化
     */
    var init = function(data, forward) {
        canBack = forward ? 1 : 0;

        // 加载模板内容
        $("#container").empty().append($(template));

        if (typeof data.index != "undefined") {
            index = parseInt(data.index, 10);
        } else {
            index = -1;
        }

        // 参数设置
        var params = {};
        if (index > -1) {
            params.index = index;
        }

        var tkn = appConfig.checkLogin(data);
        if (tkn) {
            params.token = tkn;
        }

        // 初始化显示
        initShow(canBack);

        // 绑定事件
        bindEvent();

        // 处理返回
        page.setHistoryState({url: "happy/ball", data: params}, 
        		"happy/ball", 
        		"#happy/ball" + (JSON.stringify(params).length > 2 ? "?data=" + encodeURIComponent(JSON.stringify(params)) : ""),
                canBack);
    };

    /**
     * 显示缓存数据
     */
    var showBuffer = function(forward) {
        // 缓存的数据
        bufferData = appConfig.getMayBuyData(appConfig.MAY_BUY_HAPPY_KEY);

        if (bufferData != null && typeof bufferData != "undefined" && bufferData.length > 0) {
            mode = bufferData[0].mode;

            // 清除模式选择
            $("#modeSelect").removeClass("radioBox");
        } else {
            if (forward) {
                mode = "0";
            }
        }

        var text = mode == "1" ? "胆拖投注" : "普通投注";
        $("#modeSelect").text(text);

        if (typeof index != "NaN" && index > -1) {
            var data = bufferData[index];
            pay = data.total * 2, total = data.total;

            if (mode == "1") {
                // 胆红
                for (var i = 0, len = data.danReds.length; i < len; i++) {
                    $("#danReds li .num :contains('"+data.danReds[i]+"')").addClass("click");
                }

                // 拖红
                for (var i = 0, len = data.tuoReds.length; i < len; i++) {
                    $("#tuoReds li .num :contains('"+data.tuoReds[i]+"')").addClass("click");
                }

                // 胆蓝
                for (var i = 0, len = data.danBlues.length; i < len; i++) {
                    $("#danBlues li .num :contains('"+data.danBlues[i]+"')").addClass("click");
                }

                // 拖蓝
                for (var i = 0, len = data.tuoBlues.length; i < len; i++) {
                    $("#tuoBlues li .num :contains('"+data.tuoBlues[i]+"')").addClass("click");
                }
            } else {
                // 红
                for (var i = 0, len = data.normalReds.length; i < len; i++) {
                    $("#normalReds li .num :contains('"+data.normalReds[i]+"')").addClass("click");
                }

                // 蓝
                for (var i = 0, len = data.normalBlues.length; i < len; i++) {
                    $("#normalBlues li .num :contains('"+data.normalBlues[i]+"')").addClass("click");
                }
            }

        } else {
            pay = 0, total = 0;
        }
    };

    /**
     * 初始化显示
     */
    var initShow = function(forward) {

       // 显示缓存数据
        showBuffer(forward);

        // 获取期号信息
        getIssue();

		validShake();
		
        $("#mode_" + mode).addClass("click");
        $("#" + mode + "_select").show();
		
        unitTotal();
    };
	
	/**
	 * 获取期号
	 */
	var getIssue = function() {
		issue = {};
        digitService.getCurrLottery(lotteryType, function(data) {

            // 隐藏加载标示
            util.hideLoading();
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
     * 绑定事件
     */
    var bindEvent = function() {

        // 摇一摇
        if (window.DeviceMotionEvent) {
            $(window).off("devicemotion");
            $(window).on("devicemotion", function(eventData) {
                if (mode == "0") {
                    shake.deviceMotionHandler(eventData, getRandomBalls);
                }
            });
        }

        // 返回
        $(".back").on(pageEvent.touchStart, function(e) {
            pageEvent.handleTapEvent(this, this, pageEvent.activate, e);
            return true;
        });

        $(".back").on(pageEvent.activate, function(e) {
            if (typeof index == "NaN" || index == -1) {
                appConfig.clearMayBuyData(appConfig.MAY_BUY_RED_BLUE_KEY);
            }
            offBind();
            if (canBack) {
                page.goBack();
            } else {
                page.initPage("home", {}, 1);
            }
            return true;
        });

        // 获取期号
        $("#issueNo").on(pageEvent.touchStart, function(e) {
            pageEvent.handleTapEvent(this, this, pageEvent.activate, e);
            return true;
        });

        $("#issueNo").on(pageEvent.activate, function(e) {
        
        	// 获取期号
            getIssue();
            return true;
        });

        // 模式选择
        $("#modeSelect").on(pageEvent.touchStart, function(e) {
            pageEvent.handleTapEvent(this, this, pageEvent.activate, e);
            return true;
        });

        $("#modeSelect").on(pageEvent.activate, function(e) {
            if ($(this).hasClass("radioBox")) {
                $(".popup").show();
                // 显示遮盖层
                util.showCover();
            } else {
                util.toast("本站暂不支持多种玩法混合投注");
            }
            return true;
        });

        // 机选
        $(".shake").on(pageEvent.touchStart, function(e) {
            pageEvent.handleTapEvent(this, this, pageEvent.activate, e);
            return true;
        });

        $(".shake").on(pageEvent.activate, function(e) {
            getRandomBalls();
            return true;
        });

        // 选中模式
        $(".popup li").on(pageEvent.click, function(e) {
            var id = this.id.split("_")[1];
            var $target = $(this);
            if (!$target.hasClass("click")) {
                $(".popup li").removeClass("click");
                $target.addClass("click");

                $(".hidden").hide();
                $("#" + id + "_select").show();

                $(".popup").hide();
                util.hideCover();

                $(".radioBox").text($target.text());

                // 清除原来选中号
                clear();
                unitTotal();
                // 保存模式
                mode = id;
				
				validShake();

            }
            return true;
        });

        // 普通投注红球选号
        $("#normalReds").on(pageEvent.tap, function(e) {
            var $num = $(e.target).closest(".num");
            if ($num.hasClass("click")) {
                $num.removeClass("click");
            } else if ($num.length) {
                // 只能选20个红球
                var normalRedsCount = $("#normalReds .click").length;
                if (normalRedsCount == 20) {
                    util.toast("所选号码已经达到最大限制");
                    return false;
                }
                $num.addClass("click");
            }
            // 计算注数，金额
            unitTotal();
            return true;
        });

        // 普通投注蓝球选号
        $("#normalBlues").on(pageEvent.tap, function(e) {
            var $num = $(e.target).closest(".num");
            if ($num.hasClass("click")) {
                $num.removeClass("click");
            } else if ($num.length) {
                $num.addClass("click");
            }

            // 计算注数，金额
            unitTotal();
            return true;
        });

        // 胆拖投注胆红选号
        $("#danReds").on(pageEvent.tap, function(e) {
            var $num = $(e.target).closest(".num");
            if ($num.hasClass("click")) {
                $num.removeClass("click");
            } else if ($num.length) {
                // 只能选5个胆红
                var danRedsCount = $("#danReds .click").length;
                if (danRedsCount == 4) {
                    util.toast("所选号码已经达到最大限制");
                    return false;
                }
                $num.addClass("click");
                // 移除拖红选中
                $("#tuoReds li .num :contains('"+$num.text()+"')").removeClass("click");
            }

            // 计算注数，金额
            unitTotal();
            return true;
        });


        // 胆拖投注拖红选号
        $("#tuoReds").on(pageEvent.tap, function(e) {
            var $num = $(e.target).closest(".num");
            if ($num.hasClass("click")) {
                $num.removeClass("click");
            } else if ($num.length) {
                $num.addClass("click");
                // 移除胆红选中
                $("#danReds li .num :contains('"+$num.text()+"')").removeClass("click");
            }

            // 计算注数，金额
            unitTotal();
            return true;
        });

        // 胆拖投注胆蓝选号
        $("#danBlues").on(pageEvent.tap, function(e) {
            var $num = $(e.target).closest(".num");
            if ($num.hasClass("click")) {
                $num.removeClass("click");
            } else if ($num.length) {
                // 只能选1个胆蓝
                var danBluesCount = $("#danBlues .click").length;
                if (danBluesCount == 1) {
                    util.toast("所选号码已经达到最大限制");
                    return false;
                }
                $num.addClass("click");
                // 移除拖蓝选中
                $("#tuoBlues li .num :contains('"+$num.text()+"')").removeClass("click");
            }

            // 计算注数，金额
            unitTotal();
            return true;
        });

        // 胆拖投注蓝球选号
        $("#tuoBlues").on(pageEvent.tap, function(e) {
            var $num = $(e.target).closest(".num");
            if ($num.hasClass("click")) {
                $num.removeClass("click");
            } else if ($num.length) {
                $num.addClass("click");
                // 移除胆蓝选中
                $("#danBlues li .num :contains('"+$num.text()+"')").removeClass("click");
            }

            // 计算注数，金额
            unitTotal();
            return true;
        });

        // 清除选中号
        $(".delete").on(pageEvent.touchStart, function(e) {
            pageEvent.handleTapEvent(this, this, pageEvent.activate, e);
            return true;
        });

        $(".delete").on(pageEvent.activate, function(e) {
            clear();
            unitTotal();
            return true;
        });

        // 确认
        $(".sure").on(pageEvent.touchStart, function(e) {
            pageEvent.handleTapEvent(this, this, pageEvent.activate, e);
            return true;
        });

        $(".sure").on(pageEvent.activate, function(e) {

            // 缓存的数据
            bufferData = (bufferData == null || typeof bufferData == "undefined" || bufferData.length == 0) ? [] : bufferData;

            if (typeof issue.issueNo == "undefined" && bufferData.length == 0) {
                util.toast("无法获取到彩票期号");
                return false;
            }

            if (total > 0) {

                // 保存数据
                var data = {};
                // 投注模式
                data.mode = mode;
                data.total = total;
                //data.pay = pay;
                if (data.mode == "1") {
                    // 胆红
                    data.danReds = new Array();
                    $("#danReds .click").each(function(i, item){
                        data.danReds.push($(item).text());
                    });

                    // 拖红
                    data.tuoReds = new Array();
                    $("#tuoReds .click").each(function(i, item){
                        data.tuoReds.push($(item).text());
                    });

                    // 胆蓝
                    data.danBlues = new Array();
                    $("#danBlues .click").each(function(i, item){
                        data.danBlues.push($(item).text());
                    });

                    // 拖蓝
                    data.tuoBlues = new Array();
                    $("#tuoBlues .click").each(function(i, item){
                        data.tuoBlues.push($(item).text());
                    });

                } else {
                    // 普通投注
                    data.normalReds = new Array();
                    $("#normalReds .click").each(function(i, item){
                        data.normalReds.push($(item).text());
                    });
                    data.normalBlues = new Array();
                    $("#normalBlues .click").each(function(i, item){
                        data.normalBlues.push($(item).text());
                    });
                }

                if (typeof index != "NaN" && index > -1) {
                    bufferData[index] = data;
                } else {
                    bufferData.push(data);
                }

            } else if (total == 0) {
                var ballCount = $(".balls .click").length;
                if (typeof index != "NaN" && index > -1) {
                    if (!ballCount) {
                        // 删除一注
                        bufferData.splice(index,1);
                    }
                } else if(bufferData.length > 0 && index == -1) {
                    if (ballCount) {
                        // 再选一注
                        util.toast("请至少选择 1 注");
                        return false;
                    }
                }
            }

            appConfig.setMayBuyData(appConfig.MAY_BUY_HAPPY_KEY, bufferData);

            if (bufferData.length == 0) {
                util.toast("请至少选择 1 注");
                return false;
            }

            if (typeof index != "NaN" && index > -1) {
                page.goBack();
            } else {
                offBind();
                page.initPage("happy/list", {}, 1);
            }
            return true;
        });

        // 右菜单
        $(".menu").on(pageEvent.touchStart, function(e) {
            pageEvent.handleTapEvent(this, this, pageEvent.activate, e);
            return true;
        });

        $(".menu").on(pageEvent.activate, function(e) {
            $(".menuBox").show();
            util.showCover();
            return true;
        });

        // 购彩记录
        $(".gcBg").on(pageEvent.click, function(e) {
            offBind();
            page.initPage("user/buyRecord", {lotteryTypeArray: lotteryType}, 1);
            util.hideCover();
            return true;
        });

        // 开奖信息
        $(".kjBg").on(pageEvent.click, function(e) {
            offBind();
            page.initPage("digit/history", {lottery: lotteryType}, 1);
            util.hideCover();
            return true;
        });

        // 玩法介绍
        $(".wfBg").on(pageEvent.click, function(e) {
            offBind();
            page.initPage("happy/intro", {}, 1);
            util.hideCover();
            return true;
        });

        // 关闭显示框
        $(".cover").on(pageEvent.click, function(e) {
            $(".popup").hide();
            $(".menuBox").hide();
            util.hideCover();
            return true;
        });
    };

    /**
     * 随机一注
     */
    var getRandomBalls = function() {
        // 清空原始的选中
        clear();
        var happyRedNos = calculate.getSrand(1,35,5);
        console.log(happyRedNos.toString());
        for (var i = 0, redLen = happyRedNos.length; i < redLen; i++) {
            $("#normalReds li .num :contains('"+(happyRedNos[i] < 10 ? ("0" + happyRedNos[i]) : happyRedNos[i])+"')").addClass("click");
        }
        var happyBlueNos = calculate.getSrand(1,12,2);
        console.log(happyBlueNos.toString());
        for (var i = 0, blueLen = happyBlueNos.length; i < blueLen; i++) {
            $("#normalBlues li .num :contains('"+(happyBlueNos[i] < 10 ? ("0" + happyBlueNos[i]) : happyBlueNos[i])+"')").addClass("click");
        }

        unitTotal();
    };

    /**
     * 解除绑定
     */
    var offBind = function() {
        $(".cover").off(pageEvent.click);
    };

    /**
     * 验证是否显示机选
     */
	var validShake = function() {
		if (mode == "0") {
			$(".shake").show();
		}  else if (mode == "1") {
			$(".shake").hide();
		}
	};

    /**
     * 清除
     */
    var clear = function () {
        $("#" + mode + "_select").find(".click").removeClass("click");
    };

    /**
     * 统计注数，消费金额
     */
    var unitTotal = function() {
        total = 0, pay = 0;
        if (mode == "0") {
            var happyNRed = $("#normalReds .click").length;
            var happyNBlue = $("#normalBlues .click").length;

            // 大乐透复式
            if (happyNRed >= 5 && happyNBlue >= 2) {
                total = calculate.getFactorial(happyNRed, 5) * calculate.getFactorial(happyNBlue, 2);
            }
        } else if (mode == "1") {
            var happyNRedDan = $("#danReds .click").length;
            var happyNRedTuo = $("#tuoReds .click").length;
            var happyNBlueDan = $("#danBlues .click").length;
            var happyNBlueTuo = $("#tuoBlues .click").length;

            if (happyNRedDan >= 1 && happyNRedTuo >= 1
                && happyNRedDan + happyNRedTuo > 5
                && happyNBlueDan <= 1 && happyNBlueTuo >= 2
                && happyNBlueDan + happyNBlueTuo >= 2) {
                total = calculate.getCombineCount(5 - happyNRedDan, happyNRedTuo) * calculate.getCombineCount(2 - happyNBlueDan, happyNBlueTuo);
            }
        }

        pay = total * 2;

        $("#total").text(total);
        $("#pay").text(pay);
    };

    return {init:init};
});
