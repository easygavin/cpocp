/**
 * 福彩3D选球
 */
define([
    "text!../../views/3d/ball.html",
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
    var lotteryType = "12";

    // 缓存的数据
    var bufferData = null;
    // 数组下标
    var index = -1;

    // 初始化显示模式，默认直选
    var mode = "0";

    // 期号
    var issue = {};

    var showF = false, // 第一批显示
        showS = false, // 第二排显示
        showT = false; // 第三排显示
    var titleF = "", // 第一批标题
        titleS = "", // 第二批标题
        titleT = ""; // 第三批标题

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
        page.setHistoryState({url: "3d/ball", data: params},
            "3d/ball",
            "#3d/ball" + (JSON.stringify(params).length > 2 ? "?data=" + encodeURIComponent(JSON.stringify(params)) : ""),
            canBack);
    };

    /**
     * 显示缓存数据
     */
    var showBuffer = function(forward) {

        // 缓存的数据
        bufferData = appConfig.getMayBuyData(appConfig.MAY_BUY_3D_KEY);

        if (bufferData != null && typeof bufferData != "undefined" && bufferData.length > 0) {
            mode = bufferData[0].mode;

            // 清除模式选择
            $("#modeSelect").removeClass("radioBox");
        } else {
            if (forward) {
                mode = "0";
            }
        }

        var text = $("#mode_" + mode).text();
        $("#modeSelect").text(text);

        if (typeof index != "NaN" && index > -1) {
            var data = bufferData[index];
                pay = data.total * 2, total = data.total,
                    redFs = data.redFs, redSs = data.redSs, redTs = data.redTs;
            if (redFs.length) {
                addRedsFFocus(redFs);
            }
            if (redSs.length) {
                addRedsSFocus(redSs);
            }
            if(redTs.length) {
                addRedsTFocus(data.redTs);
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

        // 显示模式区域
        showModeZone();

        // 验证是否可以机选
        validShake();

        // 统计
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
     * 显示模式区域
     */
    var showModeZone = function() {

        $(".popup li").removeClass("click");
        var $mode = $("#mode_"+mode);
        $mode.addClass("click");
        $(".radioBox").text($mode.text());

        showF = false, // 第一批显示
            showS = false, // 第二排显示
            showT = false; // 第三排显示
        titleF = "", // 第一批标题
            titleS = "", // 第二批标题
            titleT = ""; // 第三批标题

        var title = "";
        switch (mode) {
            case "0": // 直选
                title = "由每位1个号码组成1注,单注奖金1000元";

                showF = true;
                titleF = "百位";
                showS = true;
                titleS = "十位";
                showT = true;
                titleT = "个位";
                break;
            case "1": // 组三
                title = "由2个号码组成1注,单注奖金320元";

                showF = true;
                titleF = "选号";
                break;
            case "2": // 组六
                title = "由3个号码组成1注,单注奖金160元";

                showF = true;
                titleF = "选号";
                break;
            case "3": // 直选胆拖
                title = "由1~2个胆码加n个拖码组成1注";

                showF = true;
                titleF = "胆";
                showS = true;
                titleS = "拖";
                break;
            case "4": // 组三胆拖
                title = "由1个胆码加n个拖码组成1注";

                showF = true;
                titleF = "胆";
                showS = true;
                titleS = "拖";
                break;
            case "5": // 组六胆拖
                title = "由1~2个胆码加n个拖码组成1注";

                showF = true;
                titleF = "胆";
                showS = true;
                titleS = "拖";
                break;
        }

        if (showF) {
            $("#numbers0").show();
            $("#numbers0").find(".tipIcon").text(titleF);
        } else {
            $("#numbers0").hide();
        }

        if (showS) {
            $("#numbers1").show();
            $("#numbers1").find(".tipIcon").text(titleS);
        } else {
            $("#numbers1").hide();
        }

        if (showT) {
            $("#numbers2").show();
            $("#numbers2").find(".tipIcon").text(titleT);
        } else {
            $("#numbers2").hide();
        }

        $(".showTipM10").text(title);
    };

    /**
     * 绑定事件
     */
    var bindEvent = function() {

        // 摇一摇
        if (window.DeviceMotionEvent) {
            $(window).off("devicemotion");
            $(window).on("devicemotion", function(eventData) {
                if (parseInt(mode, 10) < 12) {
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
                appConfig.clearMayBuyData(appConfig.MAY_BUY_3D_KEY);
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

            // 获取期号信息
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
                // 保存模式
                mode = id;

                // 显示模式区域
                showModeZone();

                $(".popup").hide();
                util.hideCover();

                // 清除原来选中号
                clear();
                unitTotal();

                validShake();
            }
            return true;
        });

        // 第一行
        $("#numbers0").on(pageEvent.tap, function(e) {
            var $num = $(e.target).closest(".num");
            if ($num.hasClass("click")) {
                $num.removeClass("click");
            } else if ($num.length) {
                var redsCount = $("#numbers0 .click").length;

                if (parseInt(mode, 10) > 2) {
                    // 胆拖
                    switch(mode) {
                        case "3": // 直选胆拖
                        case "5": // 组六胆拖
                            if (redsCount == 2) {
                                util.toast("所选号码已经达到最大限制");
                                return false;
                            }
                            break;
                        case "4": // 组三胆拖
                            if (redsCount == 1) {
                                util.toast("所选号码已经达到最大限制");
                                return false;
                            }
                            break;
                    }
                    $num.addClass("click");
                    // 移除拖红选中
                    $("#numbers1 li .num :contains('"+$num.text()+"')").removeClass("click");
                } else {
                    // 复试
                    $num.addClass("click");
                }
            }
            // 计算注数，金额
            unitTotal();
            return true;
        });

        // 第二行
        $("#numbers1").on(pageEvent.tap, function(e) {
            var $num = $(e.target).closest(".num");
            if ($num.hasClass("click")) {
                $num.removeClass("click");
            } else if ($num.length) {
                $num.addClass("click");

                if (parseInt(mode, 10) > 2) {
                    // 胆拖
                    // 移除胆红选中
                    $("#numbers0 li .num :contains('"+$num.text()+"')").removeClass("click");
                }
            }

            // 计算注数，金额
            unitTotal();
            return true;
        });

        // 第三行
        $("#numbers2").on(pageEvent.tap, function(e) {
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
                var redFs = new Array(), redSs = new Array(), redTs = new Array();

                // 第一批数据
                $("#numbers0 .click").each(function(i, item) {
                    redFs.push($(item).text());
                });
                data.redFs = redFs;

                // 第二排数据
                $("#numbers1 .click").each(function(i, item) {
                    redSs.push($(item).text());
                });
                data.redSs = redSs;

                // 第三排数据
                $("#numbers2 .click").each(function(i, item) {
                    redTs.push($(item).text());
                });
                data.redTs = redTs;

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

            appConfig.setMayBuyData(appConfig.MAY_BUY_3D_KEY, bufferData);

            if (bufferData.length == 0) {
                util.toast("请至少选择 1 注");
                return false;
            }

            if (typeof index != "NaN" && index > -1) {
                page.goBack();
            } else {
                offBind();

                page.initPage("3d/list", {}, 1);
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

            page.initPage("3d/intro", {}, 1);
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
     * 第一批焦点显示
     * @param arr
     */
    var addRedsFFocus = function (arr) {
        for (var i = 0, redLen = arr.length; i < redLen; i++) {
            $("#numbers0 li .num :contains('"+arr[i]+"')").addClass("click");
        }
    };

    /**
     * 第二批焦点显示
     * @param arr
     */
    var addRedsSFocus = function (arr) {
        for (var i = 0, redLen = arr.length; i < redLen; i++) {
            $("#numbers1 li .num :contains('"+arr[i]+"')").addClass("click");
        }
    };

    /**
     * 第三批焦点显示
     * @param arr
     */
    var addRedsTFocus = function (arr) {
        for (var i = 0, redLen = arr.length; i < redLen; i++) {
            $("#numbers2 li .num :contains('"+arr[i]+"')").addClass("click");
        }
    };

    /**
     * 随机一注
     */
    var getRandomBalls = function() {
        // 清空原始的选中
        clear();
        var redFs = new Array(), redSs = new Array(), redTs = new Array();
        switch (mode) {
            case "0": // 直选
                redFs = calculate.getSrand(0,9,1);
                redSs = calculate.getSrand(0,9,1);
                redTs = calculate.getSrand(0,9,1);
                break;
            case "1": // 组三
                redFs = calculate.getSrand(0,9,2);
                break;
            case "2": // 组六
                redFs = calculate.getSrand(0,9,3);
                break;
        }

        if (redFs.length) {
            addRedsFFocus(redFs);
        }

        if (redSs.length) {
            addRedsSFocus(redSs);
        }

        if (redTs.length) {
            addRedsTFocus(redTs);
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
        if (parseInt(mode, 10) < 3) {
            $(".shake").show();
        } else {
            $(".shake").hide();
        }
    };

    /**
     * 清除
     */
    var clear = function () {
        $("#numbers0").find(".click").removeClass("click");
        $("#numbers1").find(".click").removeClass("click");
        $("#numbers2").find(".click").removeClass("click");
    };

    /**
     * 统计注数，消费金额
     */
    var unitTotal = function() {
        total = 0, pay = 0;

        switch (mode) {
            case "0": // 直选
                var redFCount = $("#numbers0 .click").length,
                    redSCount = $("#numbers1 .click").length,
                    redTCount = $("#numbers2 .click").length;
                total = redFCount * redSCount * redTCount;
                break;
            case "1": // 组三
                var redFCount = $("#numbers0 .click").length;
                if (redFCount >= 2) {
                    total = calculate.getFactorial(redFCount, 2) * 2;
                }
                break;
            case "2": // 组六
                var redFCount = $("#numbers0 .click").length;
                if (redFCount >= 3) {
                    total = calculate.getFactorial(redFCount, 3);
                }
                break;
            case "3": // 直选胆拖
                var redDanCount = $("#numbers0 .click").length,
                    redTuoCount = $("#numbers1 .click").length;
                if (redDanCount >= 1 && redDanCount <= 2 && redTuoCount >= 1) {
                    total = calculate.getCombineCount(3 - redDanCount, redTuoCount) * 6;
                }
                break;
            case "4": // 组三胆拖
                var redDanCount = $("#numbers0 .click").length,
                    redTuoCount = $("#numbers1 .click").length;
                if (redDanCount == 1 && redTuoCount >= 1) {
                    total = redTuoCount * 2;
                }
                break;
            case "5": // 组六胆拖
                var redDanCount = $("#numbers0 .click").length,
                    redTuoCount = $("#numbers1 .click").length;
                if (redDanCount >= 1 && redDanCount <= 2 && redTuoCount >= 1) {
                    total = calculate.getCombineCount(3 - redDanCount, redTuoCount);
                }
                break;
        }

        pay = total * 2;

        $("#total").text(total);
        $("#pay").text(pay);
    };

    return {init:init};
});
