/**
 * 十一运夺金选球
 */
define([
    "text!../../views/luck/ball.html",
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
    var lotteryType = "31";

    // 缓存的数据
    var bufferData = null;
    // 数组下标
    var index = -1;

    // 初始化显示模式，默认任五
    var mode = "4";

    // 期号
    var issue = {};

    // 上期开奖
    var lastIssue = {};

    // 遗留号Key
    var omitKey = "";

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
        page.setHistoryState({url:"luck/ball", data:params},
            "luck/ball",
            "#luck/ball" + (JSON.stringify(params).length > 2 ? "?data=" + encodeURIComponent(JSON.stringify(params)) : ""),
            canBack);
    };

    /**
     * 显示缓存数据
     */
    var showBuffer = function (forward) {

        // 缓存的数据
        bufferData = appConfig.getLocalJson(appConfig.keyMap.MAY_BUY_LUCK_KEY);

        if (bufferData != null && typeof bufferData != "undefined" && bufferData.length > 0) {
            mode = bufferData[0].mode;

            // 清除模式选择
            $("#modeSelect").removeClass("radioBox");
        } else {
            if (forward) {
                mode = "4";
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
        var issueTxt = issue.issueNo.substring(8) + "期截止:" + minute + ":" +
            ( second < 10 ? "0" + second : second );
        $("#LBIssueNo").text(issueTxt);
    };


    /**
     * 获取上期开奖号码
     */
    var getLastIssue = function () {
        clearTimeout(lastIssueTimer);
        lastIssue = {};
        $("#lBLastIssue").text("获取开奖号码中...");
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
        var issueTxt = lastIssue.issueNo.substring(8) + "期 : " + lastIssue.lastLotteryNumber;
        $("#lBLastIssue").text(issueTxt);

        // 显示遗留号
        handleOmitData();
    };

    /**
     * 显示模式区域
     */
    var showModeZone = function () {

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
            case "0": // 任一
                title = "选择1个号码,包含开奖号码第1位即中奖13元";
                omitKey = "201";

                showF = true;
                titleF = "选号";
                break;
            case "1": // 任二
                title = "选择2个号码,包含开奖号码任意2位即中奖6元";
                omitKey = "202";

                showF = true;
                titleF = "选号";
                break;
            case "2": // 任三
                title = "选择3个号码,包含开奖号码任意3位即中奖19元";
                omitKey = "202";

                showF = true;
                titleF = "选号";
                break;
            case "3": // 任四
                title = "选择4个号码,包含开奖号码任意4位即中奖78元";
                omitKey = "202";

                showF = true;
                titleF = "选号";
                break;
            case "4": // 任五
                title = "选择5个号码,包含开奖号码即中奖540元";
                omitKey = "202";

                showF = true;
                titleF = "选号";
                break;
            case "5": // 任六
                title = "选择6个号码,包含开奖号码即中奖90元";
                omitKey = "202";

                showF = true;
                titleF = "选号";
                break;
            case "6": // 任七
                title = "选择7个号码,包含开奖号码即中奖26元";
                omitKey = "202";

                showF = true;
                titleF = "选号";
                break;
            case "7": // 任八
                title = "选择8个号码,包含开奖号码即中奖9元";
                omitKey = "202";

                showF = true;
                titleF = "选号";
                break;
            case "8": // 前三直选
                title = "每位各选1个号码,与开奖号码前3位按位一致即中奖1170";
                omitKey = "511";

                showF = true;
                showS = true;
                showT = true;
                titleF = "一";
                titleS = "二";
                titleT = "三";
                break;
            case "9": // 前三组选
                title = "至少选择3个号码,包含开奖号码前3位即中奖195元";
                omitKey = "";

                showF = true;
                titleF = "选号";
                break;
            case "10": // 前二直选
                title = "每位各选1个号码,与开奖号码前2位按位一致即中奖130元";
                omitKey = "411";

                showF = true;
                showS = true;
                titleF = "一";
                titleS = "二";
                break;
            case "11": // 前二组选
                title = "至少选择2个号码,包含开奖号码前2位即中奖65元";
                omitKey = "";

                showF = true;
                titleF = "选号";
                break;
            case "12": // 前三直选胆拖
            case "13": // 前三组选胆拖
                title = "由1～2个胆码加n个拖码组成1注";
                omitKey = "";

                showF = true;
                showS = true;
                titleF = "胆";
                titleS = "拖";
                break;
            case "14": // 前二直选胆拖
            case "15": // 前二组选胆拖
                title = "由1个胆码加n个拖码组成1注";
                omitKey = "";

                showF = true;
                showS = true;
                titleF = "胆";
                titleS = "拖";
                break;
            case "16": // 任二胆拖
                title = "由1个胆码加n个拖码组成1注";
                omitKey = "";//"201";

                showF = true;
                showS = true;
                titleF = "胆";
                titleS = "拖";
                break;
            case "17": // 任三胆拖
                title = "由1～2个胆码加n个拖码组成1注";
                omitKey = "";//"201";

                showF = true;
                showS = true;
                titleF = "胆";
                titleS = "拖";
                break;
            case "18": // 任四胆拖
                title = "由1～3个胆码加n个拖码组成1注";
                omitKey = "";//"201";

                showF = true;
                showS = true;
                titleF = "胆";
                titleS = "拖";
                break;
            case "19": // 任五胆拖
                title = "由1～4个胆码加n个拖码组成1注";
                omitKey = "";//"201";

                showF = true;
                showS = true;
                titleF = "胆";
                titleS = "拖";
                break;
            case "20": // 任六胆拖
                title = "由1～5个胆码加n个拖码组成1注";
                omitKey = "";//"201";

                showF = true;
                showS = true;
                titleF = "胆";
                titleS = "拖";
                break;
            case "21": // 任七胆拖
                title = "由1～6个胆码加n个拖码组成1注";
                omitKey = "";//"201";

                showF = true;
                showS = true;
                titleF = "胆";
                titleS = "拖";
                break;
            case "22": // 任八胆拖
                title = "由1～7个胆码加n个拖码组成1注";
                omitKey = "";//"201";

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

        if (typeof lastIssue.statusCode != "undefined") {
            handleOmitData();
        }

        $(".showTipM10").text(title);
    };

    /**
     * 指定Key下的数组
     */
    var getOmitDataByKey = function () {
        for (var i = 0, len = lastIssue.omitDatas.length; i < len; i++) {
            if (lastIssue.omitDatas[i][omitKey]) {
                return lastIssue.omitDatas[i][omitKey];
            }
        }
    };

    /**
     * 处理遗留号
     */
    var handleOmitData = function () {
        if (showF) {
            if ($.trim(omitKey) != ""
                && lastIssue.omitDatas.length > 0) {
                var omitData = getOmitDataByKey();
                if (omitData.length > 0) {
                    var items = omitData[0];
                    $("#numbers0 .ext").each(function (i, $item) {
                        $($item).text(items[i]);
                    });
                }
            }
        }

        if (showS) {
            if ($.trim(omitKey) != ""
                && lastIssue.omitDatas.length > 0) {
                var omitData = getOmitDataByKey();
                if (omitData.length > 1) {
                    var items = omitData[1];
                    $("#numbers1 .ext").each(function (i, $item) {
                        $($item).text(items[i]);
                    });
                } else if (omitData.length > 0 && omitKey == "201") { // 任二胆拖 - 任八胆拖显示第一批的遗留号
                    var items = omitData[0];
                    $("#numbers1 .ext").each(function (i, $item) {
                        $($item).text(items[i]);
                    });
                }
            }
        }

        if (showT) {
            if ($.trim(omitKey) != ""
                && lastIssue.omitDatas.length > 0) {
                var omitData = getOmitDataByKey();
                if (omitData.length > 2) {
                    var items = omitData[2];
                    $("#numbers2 .ext").each(function (i, $item) {
                        $($item).text(items[i]);
                    });
                }
            }
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
                appConfig.clearLocalData(appConfig.keyMap.MAY_BUY_LUCK_KEY);
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
        $("#LBIssueNo").on(pageEvent.touchStart, function (e) {
            pageEvent.handleTapEvent(this, this, pageEvent.activate, e);
            return true;
        });

        $("#LBIssueNo").on(pageEvent.activate, function (e) {

            // 获取期号信息
            getIssue();

            // 获取上期信息
            getLastIssue();
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

        // 机选
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
                var redsCount = $("#numbers0 .click").length;
                if (parseInt(mode, 10) > 11) {
                    // 胆拖
                    switch (mode) {
                        case "12": // 前三直选胆拖
                        case "13": // 前三组选胆拖
                        case "17": // 任三胆拖
                            if (redsCount == 2) {
                                util.toast("所选号码已经达到最大限制");
                                return false;
                            }
                            break;
                        case "14": // 前二直选胆拖
                        case "15": // 前二组选胆拖
                        case "16": // 任二胆拖
                            if (redsCount == 1) {
                                util.toast("所选号码已经达到最大限制");
                                return false;
                            }
                            break;
                        case "18": // 任四胆拖
                            if (redsCount == 3) {
                                util.toast("所选号码已经达到最大限制");
                                return false;
                            }
                            break;
                        case "19": // 任五胆拖
                            if (redsCount == 4) {
                                util.toast("所选号码已经达到最大限制");
                                return false;
                            }
                            break;
                        case "20": // 任五胆拖
                            if (redsCount == 5) {
                                util.toast("所选号码已经达到最大限制");
                                return false;
                            }
                            break;
                        case "21": // 任六胆拖
                            if (redsCount == 6) {
                                util.toast("所选号码已经达到最大限制");
                                return false;
                            }
                            break;
                        case "22": // 任六胆拖
                            if (redsCount == 7) {
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

                if (parseInt(mode, 10) > 11) {
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

            appConfig.setLocalJson(appConfig.keyMap.MAY_BUY_LUCK_KEY, bufferData);

            if (bufferData.length == 0) {
                util.toast("请至少选择 1 注");
                return false;
            }

            if (typeof index != "NaN" && index > -1) {
                page.goBack();
            } else {
                offBind();

                page.initPage("luck/list", {}, 1);
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
            page.initPage("luck/intro", {}, 1);
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
            case "0": // 任一
                redFs = calculate.getSrand(1, 11, 1);
                break;
            case "1": // 任二
                redFs = calculate.getSrand(1, 11, 2);
                break;
            case "2": // 任三
                redFs = calculate.getSrand(1, 11, 3);
                break;
            case "3": // 任四
                redFs = calculate.getSrand(1, 11, 4);
                break;
            case "4": // 任五
                redFs = calculate.getSrand(1, 11, 5);
                break;
            case "5": // 任六
                redFs = calculate.getSrand(1, 11, 6);
                break;
            case "6": // 任七
                redFs = calculate.getSrand(1, 11, 7);
                break;
            case "7": // 任八
                redFs = calculate.getSrand(1, 11, 8);
                break;
            case "8": // 前三直选
                var randoms = calculate.getSrand(1, 11, 3);
                redFs.push(randoms[0]);
                redSs.push(randoms[1]);
                redTs.push(randoms[2]);
                break;
            case "9": // 前三组选
                redFs = calculate.getSrand(1, 11, 3);
                break;
            case "10": // 前二直选
                var randoms = calculate.getSrand(1, 11, 2);
                redFs.push(randoms[0]);
                redSs.push(randoms[1]);
                break;
            case "11": // 前二组选
                redFs = calculate.getSrand(1, 11, 2);
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
        if (parseInt(mode, 10) < 12) {
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
            case "0": // 任一
                var redCount = $("#numbers0 .click").length;
                total = redCount;
                break;
            case "1": // 任二 - 任八
            case "2":
            case "3":
            case "4":
            case "5":
            case "6":
            case "7":
                var redCount = $("#numbers0 .click").length;
                var rdmType = parseInt(mode, 10) + 1;
                if (redCount >= rdmType) {
                    // rdmType为选择的玩法，比如任二rdmType=2
                    total = calculate.getFactorial(redCount, rdmType);
                }
                break;
            case "8": // 前三直选复式
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

                if (redFs.length > 0 && redSs.length > 0 && redTs.length > 0) {
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
                }

                break;
            case "9": // 前三组选复式
                var redCount = $("#numbers0 .click").length;
                if (redCount >= 3) {
                    total = calculate.getFactorial(redCount, 3);
                }
                break;
            case "10": // 前二直选复式
                var redFs = new Array(), redSs = new Array();
                $("#numbers0 .click").each(function (i, item) {
                    redFs.push($(item).text());
                });
                $("#numbers1 .click").each(function (i, item) {
                    redSs.push($(item).text());
                });

                if (redFs.length > 0 && redSs.length > 0) {
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
                }

                break;
            case "11": // 前二组选复式
                var redCount = $("#numbers0 .click").length;
                if (redCount >= 2) {
                    total = calculate.getFactorial(redCount, 2);
                }
                break;
            case "12": // 前三直选复式胆拖
                var redDanCount = $("#numbers0 .click").length;
                var redTuoCount = $("#numbers1 .click").length;
                if (redDanCount >= 1 && redDanCount <= 2) {
                    total = calculate.getCombineCount(3 - redDanCount, redTuoCount) * 6;
                }
                break;
            case "13": // 前三组选复式胆拖
                var redDanCount = $("#numbers0 .click").length;
                var redTuoCount = $("#numbers1 .click").length;
                if (redDanCount >= 1 && redDanCount <= 2) {
                    total = calculate.getCombineCount(3 - redDanCount, redTuoCount);
                }
                break;
            case "14": // 前二直选复式胆拖
                var redDanCount = $("#numbers0 .click").length;
                var redTuoCount = $("#numbers1 .click").length;
                if (redDanCount == 1) {
                    total = redTuoCount * 2;
                }
                break;
            case "15": // 前二组选复式胆拖
                var redDanCount = $("#numbers0 .click").length;
                var redTuoCount = $("#numbers1 .click").length;
                if (redDanCount == 1) {
                    total = redTuoCount;
                }
                break;
            case "16": // 任二胆拖 - 任八胆拖
            case "17":
            case "18":
            case "19":
            case "20":
            case "21":
            case "22":
                var rdmDanType = parseInt(mode, 10) - 14;
                var redDanCount = $("#numbers0 .click").length;
                var redTuoCount = $("#numbers1 .click").length;

                if (redDanCount >= 1) {
                    total = calculate.getCombineCount((rdmDanType - redDanCount), redTuoCount);
                }
                break;
        }

        pay = total * 2;

        $("#total").text(total);
        $("#pay").text(pay);
    };

    return {init:init};
});
