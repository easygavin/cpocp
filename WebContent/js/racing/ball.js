/**
 * 幸运赛车选球
 */
define([
    "text!../../views/racing/ball.html",
    "util/Page",
    "util/PageEvent",
    "services/DigitService",
    "util/AppConfig",
    "util/Calculate",
    "util/Util",
    "util/Shake"
], function (template, page, pageEvent, digitService, appConfig, calculate, util, shake) {

    // 处理返回参数
    var canBack = 0;

    // 彩种
    var lotteryType = "14";

    // 缓存的数据
    var bufferData = null;
    // 数组下标
    var index = -1;

    // 初始化显示模式，默认前一
    var mode = "0";

    // 期号
    var issue = {};

    // 上期开奖
    var lastIssue = {};

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

    // 计时秒
    var seconds = 0;

    // 倒计时定时器
    var secondTimer = null;

    // 获取上期信息
    var lastIssueTimer = null;
    /**
     * 初始化
     */
    var init = function (data, forward) {
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
        page.setHistoryState({url:"racing/ball", data:params},
            "racing/ball",
            "#racing/ball" + (JSON.stringify(params).length > 2 ? "?data=" + encodeURIComponent(JSON.stringify(params)) : ""),
            canBack);
    };

    /**
     * 显示缓存数据
     */
    var showBuffer = function (forward) {

        // 缓存的数据
        bufferData = appConfig.getLocalJson(appConfig.keyMap.MAY_BUY_RACING_KEY);

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
            if (redTs.length) {
                addRedsTFocus(data.redTs);
            }

        } else {
            pay = 0, total = 0;
        }
    };

    /**
     * 初始化显示
     */
    var initShow = function (forward) {

        // 显示缓存数据
        showBuffer(forward);

        // 获取期号信息
        getIssue();

        // 获取上期信息
        getLastIssue();

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
    var getIssue = function () {
        issue = {};
        digitService.getCurrLottery(lotteryType, function (data) {

            // 隐藏加载标示
            util.hideLoading();
            if (typeof data != "undefined") {
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
    var handleIssue = function () {

        if (issue.endTime != null && typeof issue.endTime != "undefined"
            && $.trim(issue.endTime) != "") {
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
            console.log("seconds:" + seconds);
            showIssue();

            // 倒计时
            clearInterval(secondTimer);
            secondTimer = setInterval(function () {
                if (seconds > 0) {
                    seconds--;
                    showIssue();
                } else {
                    clearInterval(secondTimer);

                    // 重新拉取期号信息
                    getIssue();

                    clearTimeout(lastIssueTimer);
                    // 5分钟之后重新拉去上期信息
                    lastIssueTimer = setTimeout(function () {
                        getLastIssue();
                    }, 3 * 60 * 1000);
                }
            }, 1000);
        }
    };

    /**
     * 处理字符时间
     */
    var handleStrDate = function (str) {

        var sParam = str.split("-");
        var sYear = sParam[0], sMonth = sParam[1];
        var sdParam = sParam[2].split(" ");
        var sDay = sdParam[0];
        var sHMS = sdParam[1].split(":");
        var sHour = sHMS[0], sMinute = sHMS[1], sSecond = sHMS[2];

        return {
            year:sYear,
            month:sMonth,
            day:sDay,
            hour:sHour,
            minute:sMinute,
            second:sSecond
        };
    };

    /**
     * 显示期号，倒计时
     */
    var showIssue = function () {
        var minute = Math.floor(seconds / 60);
        var second = seconds % 60;
        var issueTxt = issue.issueNo.substring(6) + "期截止:" + minute + ":" +
            ( second < 10 ? "0" + second : second );
        $("#RBIssueNo").text(issueTxt);
    };


    /**
     * 获取上期开奖号码
     */
    var getLastIssue = function () {
        clearTimeout(lastIssueTimer);
        lastIssue = {};
        $("#RBLastIssue").text("获取开奖号码中...");
        digitService.getLastLottery(lotteryType, function (data) {
            if (typeof data != "undefined") {
                if (typeof data.statusCode != "undefined") {
                    if (data.statusCode == "0") {
                        console.log(JSON.stringify(data));
                        lastIssue = data;
                        showLastIssue();
                    } else {
                        util.toast(data.errorMsg);
                    }
                }
            }
        });
    };

    /**
     * 处理上期开奖号码
     */
    var showLastIssue = function () {
        var issueTxt = lastIssue.issueNo.substring(6) + "期 : " + lastIssue.lastLotteryNumber;
        $("#RBLastIssue").text(issueTxt);
    };

    /**
     * 显示模式区域
     */
    var showModeZone = function () {

        // 获取当期奖金
        getRacingPosAward();

        $(".popup li").removeClass("click");
        var $mode = $("#mode_" + mode);
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
            case "0": // 前一
                title = "竞猜获得冠军的号码,单注奖金6-110元";

                showF = true;
                titleF = "冠军";
                break;
            case "1": // 前二
                title = "竞猜获得冠，亚军的号码,单注奖金30-5000元";

                showF = true;
                showS = true;
                titleF = "冠军";
                titleS = "亚军";
                break;
            case "2": // 前三
                title = "竞猜获得冠，亚，季军的号码,单注奖金150-50000元";

                showF = true;
                showS = true;
                showT = true;
                titleF = "冠军";
                titleS = "亚军";
                titleT = "季军";
                break;
            case "3": // 位置
                title = "竞猜获得前三甲任一号码,单注奖金2-36元";

                showF = true;
                titleF = "选号";
                break;
            case "4": // 过两关
                title = "竞猜两场比赛获得冠军的号码,单注奖金30-10000元";

                showF = true;
                showS = true;
                titleF = "第一场";
                titleS = "第二场";
                break;
            case "5": // 过三关
                title = "竞猜三场比赛获得冠军的号码,单注奖金150-500000元";

                showF = true;
                showS = true;
                showT = true;
                titleF = "第一场";
                titleS = "第二场";
                titleT = "第三场";
                break;
            case "6": // 前二胆拖
                title = "由1个胆码加n个拖码组成1注";

                showF = true;
                showS = true;
                titleF = "胆";
                titleS = "拖";
                break;
            case "7": // 前三胆拖
                title = "由1~2个胆码加n个拖码组成1注";

                showF = true;
                showS = true;
                titleF = "胆";
                titleS = "拖";
                break;
            case "8": // 两关胆拖
                title = "由1个胆码加n个拖码组成1注";

                showF = true;
                showS = true;
                titleF = "胆";
                titleS = "拖";
                break;
            case "9": // 三关胆拖
                title = "由1~2个胆码加n个拖码组成1注";

                showF = true;
                showS = true;
                titleF = "胆";
                titleS = "拖";
                break;
        }

        if (showF) {
            $("#numbers0").show();
            $("#numbers0 .ext").text("");
            $("#numbers0").find(".tipIcon").text(titleF);
        } else {
            $("#numbers0").hide();
        }

        if (showS) {
            $("#numbers1").show();
            $("#numbers1 .ext").text("");
            $("#numbers1").find(".tipIcon").text(titleS);
        } else {
            $("#numbers1").hide();
        }

        if (showT) {
            $("#numbers2").show();
            $("#numbers2 .ext").text("");
            $("#numbers2").find(".tipIcon").text(titleT);
        } else {
            $("#numbers2").hide();
        }

        $(".showTipM10").text(title);
    };

    /**
     * 获取排位奖金
     */
    var getRacingPosAward = function () {
        var playType = "";
        if (mode == "0") { // 前一
            playType = "0";
        } else if (mode == "3") { // 位置
            playType = "1";
        }

        if (playType != "") {
            $(".posAwardL").show();
            digitService.getRacingPosAward(lotteryType, playType, function (data) {
                util.hideLoading();
                if (typeof data != "undefined") {
                    if (typeof data.statusCode != "undefined") {
                        if (data.statusCode == "0") {
                            if ($.trim(data.bonusDatas) != "") {
                                handleBonusData(data.bonusDatas);
                            } else {
                                util.toast("无当期奖金");
                            }
                        } else {
                            util.toast(data.errorMsg);
                        }
                    }
                }
            });
        } else {
            $(".posAwardL").hide();
        }
    };

    /**
     * 处理当期奖金
     * @param data
     */
    var handleBonusData = function (data) {
        var bonus = data.split(",");
        if (bonus.length > 1) {
            $(".awardT .awardN td").each(function (i, item) {
                $(item).text(bonus[i]);
            });
        }
    };

    /**
     * 绑定事件
     */
    var bindEvent = function () {

        // 摇一摇
        if (window.DeviceMotionEvent) {
            $(window).off("devicemotion");
            $(window).on("devicemotion", function (eventData) {
                if (parseInt(mode, 10) < 12) {
                    shake.deviceMotionHandler(eventData, getRandomBalls);
                }
            });
        }

        // 返回
        $(".back").on(pageEvent.touchStart, function (e) {
            pageEvent.handleTapEvent(this, this, pageEvent.activate, e);
            return true;
        });

        $(".back").on(pageEvent.activate, function (e) {
            if (typeof index == "NaN" || index == -1) {
                appConfig.clearLocalData(appConfig.keyMap.MAY_BUY_RACING_KEY);
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
        $("#RBIssueNo").on(pageEvent.touchStart, function (e) {
            pageEvent.handleTapEvent(this, this, pageEvent.activate, e);
            return true;
        });

        $("#RBIssueNo").on(pageEvent.activate, function (e) {

            // 获取期号信息
            getIssue();

            // 获取上期信息
            getLastIssue();
            return true;
        });

        // 获取当期奖金
        $(".awardR").on(pageEvent.touchStart, function (e) {
            pageEvent.handleTapEvent(this, this, pageEvent.activate, e);
            return true;
        });

        $(".awardR").on(pageEvent.activate, function (e) {

            util.showLoading();

            // 获取当期奖金
            getRacingPosAward();
            return true;
        });

        // 模式选择
        $("#modeSelect").on(pageEvent.touchStart, function (e) {
            pageEvent.handleTapEvent(this, this, pageEvent.activate, e);
            return true;
        });

        $("#modeSelect").on(pageEvent.activate, function (e) {
            if ($(this).hasClass("radioBox")) {
                $(".popup").show();
                // 显示遮盖层
                util.showCover();
            } else {
                util.toast("本站暂不支持多种玩法混合投注");
            }
            return true;
        });

        // 双色球机选
        $(".shake").on(pageEvent.touchStart, function (e) {
            pageEvent.handleTapEvent(this, this, pageEvent.activate, e);
            return true;
        });

        $(".shake").on(pageEvent.activate, function (e) {
            getRandomBalls();
            return true;
        });

        // 选中模式
        $(".popup li").on(pageEvent.click, function (e) {
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
        $("#numbers0").on(pageEvent.tap, function (e) {
            var $num = $(e.target).closest(".num");
            if ($num.hasClass("click")) {
                $num.removeClass("click");
            } else if ($num.length) {
                // 只能选20个红球
                var redsCount = $("#numbers0 .click").length;
                if (parseInt(mode, 10) > 5) {
                    // 胆拖
                    switch (mode) {
                        case "6": // 前二胆拖
                        case "8": // 两关胆拖
                            if (redsCount == 1) {
                                util.toast("所选号码已经达到最大限制");
                                return false;
                            }
                            break;
                        case "7": // 前三胆拖
                        case "9": // 三关胆拖
                            if (redsCount == 2) {
                                util.toast("所选号码已经达到最大限制");
                                return false;
                            }
                            break;
                    }
                    $num.addClass("click");
                    // 移除拖红选中
                    $("#numbers1 li .num :contains('" + $num.text() + "')").removeClass("click");
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
        $("#numbers1").on(pageEvent.tap, function (e) {
            var $num = $(e.target).closest(".num");
            if ($num.hasClass("click")) {
                $num.removeClass("click");
            } else if ($num.length) {
                $num.addClass("click");

                if (parseInt(mode, 10) > 5) {
                    // 胆拖
                    // 移除胆红选中
                    $("#numbers0 li .num :contains('" + $num.text() + "')").removeClass("click");
                }
            }

            // 计算注数，金额
            unitTotal();
            return true;
        });

        // 第三行
        $("#numbers2").on(pageEvent.tap, function (e) {
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
        $(".delete").on(pageEvent.touchStart, function (e) {
            pageEvent.handleTapEvent(this, this, pageEvent.activate, e);
            return true;
        });

        $(".delete").on(pageEvent.activate, function (e) {
            clear();
            unitTotal();
            return true;
        });

        // 确认
        $(".sure").on(pageEvent.touchStart, function (e) {
            pageEvent.handleTapEvent(this, this, pageEvent.activate, e);
            return true;
        });

        $(".sure").on(pageEvent.activate, function (e) {

            // 缓存的数据
            bufferData = (bufferData == null || typeof bufferData == "undefined" || bufferData.length == 0) ? [] : bufferData;

            if (typeof issue.issueNo == "undefined" && bufferData.length == 0) {
                util.toast("无法获取到彩票期号");
                return false;
            }

            if (total > 0) {

                // 保存11选5数据
                var data = {};
                // 投注模式
                data.mode = mode;
                data.total = total;
                //data.pay = pay;
                var redFs = new Array(), redSs = new Array(), redTs = new Array();

                // 第一批数据
                $("#numbers0 .click").each(function (i, item) {
                    redFs.push($(item).text());
                });
                data.redFs = redFs;

                // 第二排数据
                $("#numbers1 .click").each(function (i, item) {
                    redSs.push($(item).text());
                });
                data.redSs = redSs;

                // 第三排数据
                $("#numbers2 .click").each(function (i, item) {
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
                        bufferData.splice(index, 1);
                    } else {
                        // 再选一注
                        util.toast("请至少选择 1 注");
                        return false;
                    }
                } else if (bufferData.length > 0 && index == -1) {
                    if (ballCount) {
                        // 再选一注
                        util.toast("请至少选择 1 注");
                        return false;
                    }
                }
            }

            appConfig.setLocalJson(appConfig.keyMap.MAY_BUY_RACING_KEY, bufferData);

            if (bufferData.length == 0) {
                util.toast("请至少选择 1 注");
                return false;
            }

            if (typeof index != "NaN" && index > -1) {
                page.goBack();
            } else {
                offBind();

                page.initPage("racing/list", {}, 1);
            }
            return true;
        });

        // 右菜单
        $(".menu").on(pageEvent.touchStart, function (e) {
            pageEvent.handleTapEvent(this, this, pageEvent.activate, e);
            return true;
        });

        $(".menu").on(pageEvent.activate, function (e) {
            $(".menuBox").show();
            util.showCover();
            return true;
        });

        // 购彩记录
        $(".gcBg").on(pageEvent.click, function (e) {
            offBind();
            util.hideCover();
            if (!appConfig.checkLogin(null)) {
                // 尚未登录，弹出提示框
                util.prompt("", "您还未登录，请先登录", "登录", "取消",
                    function (e) {
                        page.initPage("login", {}, 1);
                    },
                    function (e) {
                    }
                );
                return false;
            }
            page.initPage("user/buyRecord", {lotteryTypeArray:lotteryType}, 1);
            return true;
        });

        // 开奖信息
        $(".kjBg").on(pageEvent.click, function (e) {
            offBind();
            util.hideCover();
            page.initPage("digit/history", {lottery:lotteryType}, 1);
            return true;
        });

        // 玩法介绍
        $(".wfBg").on(pageEvent.click, function (e) {
            offBind();
            util.hideCover();
            page.initPage("racing/intro", {}, 1);
            return true;
        });

        // 关闭显示框
        $(".cover").on(pageEvent.click, function (e) {
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
            $("#numbers0 li .num :contains('" + (parseInt(arr[i], 10) < 10 ? ("0" + parseInt(arr[i], 10)) : arr[i]) + "')").addClass("click");
        }
    };

    /**
     * 第二批焦点显示
     * @param arr
     */
    var addRedsSFocus = function (arr) {
        for (var i = 0, redLen = arr.length; i < redLen; i++) {
            $("#numbers1 li .num :contains('" + (parseInt(arr[i], 10) < 10 ? ("0" + parseInt(arr[i], 10)) : arr[i]) + "')").addClass("click");
        }
    };

    /**
     * 第三批焦点显示
     * @param arr
     */
    var addRedsTFocus = function (arr) {
        for (var i = 0, redLen = arr.length; i < redLen; i++) {
            $("#numbers2 li .num :contains('" + (parseInt(arr[i], 10) < 10 ? ("0" + parseInt(arr[i], 10)) : arr[i]) + "')").addClass("click");
        }
    };

    /**
     * 随机一注
     */
    var getRandomBalls = function () {
        // 清空原始的选中
        clear();
        var redFs = new Array(), redSs = new Array(), redTs = new Array();
        switch (mode) {
            case "0": // 前一
                redFs = calculate.getSrand(1, 12, 1);
                break;
            case "1": // 前二
                var randoms = calculate.getSrand(1, 12, 3);
                redFs.push(randoms[0]);
                redSs.push(randoms[1]);
                break;
            case "2": // 前三
                var randoms = calculate.getSrand(1, 12, 3);
                redFs.push(randoms[0]);
                redSs.push(randoms[1]);
                redTs.push(randoms[2]);
                break;
            case "3": // 位置
                redFs = calculate.getSrand(1, 12, 1);
                break;
            case "4": // 过两关
                redFs = calculate.getSrand(1, 12, 1);
                redSs = calculate.getSrand(1, 12, 1);
                break;
            case "5": // 过三关
                redFs = calculate.getSrand(1, 12, 1);
                redSs = calculate.getSrand(1, 12, 1);
                redTs = calculate.getSrand(1, 12, 1);
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
    var offBind = function () {
        clearInterval(secondTimer);
        clearTimeout(lastIssueTimer);
        $(".cover").off(pageEvent.click);
    };

    /**
     * 验证是否显示机选
     */
    var validShake = function () {
        if (parseInt(mode, 10) < 6) {
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
    var unitTotal = function () {
        total = 0, pay = 0;

        switch (mode) {
            case "0": // 前一
            case "3": // 位置
                var redCount = $("#numbers0 .click").length;
                total = redCount;
                break;
            case "1": // 前二
                var redFs = new Array(), redSs = new Array();
                $("#numbers0 .click").each(function (i, item) {
                    redFs.push($(item).text());
                });
                $("#numbers1 .click").each(function (i, item) {
                    redSs.push($(item).text());
                });

                for (var i = 0; i < redFs.length; i++) {
                    for (var j = 0; j < redSs.length; j++) {
                        if (redFs[i] == redSs[j]) {
                            if (j == redSs.length - 1) {
                                break;
                            } else {
                                continue;
                            }
                        }
                        total++;
                    }
                }
                break;
            case "2": // 前三
                var redFs = new Array(), redSs = new Array(), redTs = new Array();
                $("#numbers0 .click").each(function (i, item) {
                    redFs.push($(item).text());
                });
                $("#numbers1 .click").each(function (i, item) {
                    redSs.push($(item).text());
                });
                $("#numbers2 .click").each(function (i, item) {
                    redTs.push($(item).text());
                });

                for (var i = 0; i < redFs.length; i++) {
                    for (var j = 0; j < redSs.length; j++) {
                        if (redFs[i] == redSs[j]) {
                            if (j == redSs.length - 1) {
                                break;
                            } else {
                                continue;
                            }
                        }
                        for (var k = 0; k < redTs.length; k++) {
                            if (redSs[j] == redTs[k]
                                || redFs[i] == redTs[k]) {
                                if (k == redTs.length - 1) {
                                    break;
                                } else {
                                    continue;
                                }
                            }
                            total++;
                        }
                    }
                }
                break;
            case "4": // 过二关
                var redFsCount = $("#numbers0 .click").length;
                var redSsCount = $("#numbers1 .click").length;
                if (redFsCount >= 1 && redSsCount >= 1) {
                    total = redFsCount * redSsCount;
                }
                break;
            case "5": // 过三关
                var redFsCount = $("#numbers0 .click").length;
                var redSsCount = $("#numbers1 .click").length;
                var redTsCount = $("#numbers2 .click").length;
                if (redFsCount >= 1 && redSsCount >= 1 && redTsCount >= 1) {
                    total = redFsCount * redSsCount * redTsCount;
                }
                break;
            case "6": // 前二胆拖
                var redDanCount = $("#numbers0 .click").length;
                var redTuoCount = $("#numbers1 .click").length;
                if (redDanCount == 1 && redTuoCount >= 1) {
                    total = redTuoCount * 2;
                }
                break;
            case "7": // 前三胆拖
                var redDanCount = $("#numbers0 .click").length;
                var redTuoCount = $("#numbers1 .click").length;
                if (redDanCount >= 1 && redDanCount <= 2 && redDanCount + redTuoCount >= 3) {
                    total = calculate.getCombineCount(3 - redDanCount, redTuoCount) * 6;
                }
                break;
            case "8": // 两关胆拖
                var redDanCount = $("#numbers0 .click").length;
                var redTuoCount = $("#numbers1 .click").length;
                if (redDanCount == 1 && redDanCount + redTuoCount >= 3) {
                    total = redTuoCount * 2;
                }
                break;
            case "9": // 三关胆拖
                var redDanCount = $("#numbers0 .click").length;
                var redTuoCount = $("#numbers1 .click").length;
                if (redDanCount >= 1 && redDanCount <= 2 && redDanCount + redTuoCount >= 4) {
                    total = calculate.getCombineCount(3 - redDanCount, redTuoCount) * 6;
                }
                break;
        }

        pay = total * 2;

        $("#total").text(total);
        $("#pay").text(pay);
    };

    return {init:init};
});
