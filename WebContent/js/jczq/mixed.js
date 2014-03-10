/**
 * 竞彩足球选场
 */
define([
    "text!../../views/jczq/mixed.html",
    "util/Page",
    "util/PageEvent",
    "util/AppConfig",
    "util/Util",
    "services/JczqService"
], function (template, page, pageEvent, appConfig, util, jczqService) {

    // 处理返回参数
    var canBack = 0;

    // 彩种
    var lotteryType = "46";

    // 对阵列表数据
    var betList = {};

    // match Map值
    var matchMap = {};

    // 缓存的数据
    var bufferData = null;

    // 消费金额
    var pay = 0;

    // 注数
    var total = 0;

    // 显示期号
    var issueNo = "";

    // 赛事分类
    var leagueMap = {};

    // 初始焦点元素
    var initEles = null;

    /**
     * 初始化
     */
    var init = function (data, forward) {
        canBack = forward ? 1 : 0;

        // 加载模板内容
        $("#container").empty().append($(template));

        // 参数设置
        var params = {};

        var tkn = appConfig.checkLogin(data);
        if (tkn) {
            params.token = tkn;
        }

        // 初始化显示
        initShow(canBack);

        // 绑定事件
        bindEvent();

        // 处理返回
        page.setHistoryState({url: "jczq/mixed", data: params},
            "jczq/mixed",
            "#jczq/mixed" + (JSON.stringify(params).length > 2 ? "?data=" + encodeURIComponent(JSON.stringify(params)) : ""),
            canBack);
    };

    /**
     * 初始化显示
     */
    var initShow = function (forward) {

        if (forward) {

            // 获取对阵列表
            getBetList();
        } else {
            // 根据缓存数据判断是否需要重新拉取列表
            // 缓存的数据
            bufferData = appConfig.getLocalJson(appConfig.keyMap.MAY_BUY_JCZQ_KEY);
            if (bufferData != null && typeof bufferData != "undefined"
                && betList != null && typeof betList != "undefined"
                && betList.datas != null && typeof betList.datas != "undefined") {

                // 处理对阵列表
                handleBetList();

                // 显示缓存数据
                showBuffer();
            } else {
                // 获取对阵列表
                getBetList();
            }
        }

        unitTotal();
    };

    /**
     * 获取对阵列表
     */
    var getBetList = function () {
        betList = {}, matchMap = {}, issueNo = "", leagueMap = {};
        jczqService.getJCZQBetList(lotteryType, function (data) {
            if (typeof data != "undefined") {
                if (typeof data.statusCode != "undefined") {
                    if (data.statusCode == "0") {
                        betList = data;
                        handleBetList();
                    } else {
                        util.toast(data.errorMsg);
                    }
                }
            }
        });
    };

    /**
     * 处理对阵列表
     */
    var handleBetList = function () {
        // 隐藏加载标示
        util.hideLoading();

        var matchLen = 0;
        for (var i = 0, len = betList.datas.length; i < len; i++) {
            matchLen += betList.datas[i].matchArray.length;
        }

        // 显示期号
        showIssueNo(matchLen);

        // 显示赛事列表
        showMatchItems();

        // 添加赛事种类列表
        addLeagueItems();
    };

    /**
     * 显示期号
     */
    var showIssueNo = function (matchLen) {
        // 140103期，共16场比赛可投注
        issueNo = betList.datas[0].issueNo;
        $("#JMIssueNo").text(issueNo + "期，共" + matchLen + "场比赛可投注");
    };

    /**
     * 显示赛事列表
     */
    var showMatchItems = function () {
        for (var i = 0, iLen = betList.datas.length; i < iLen; i++) {
            var matchArr = betList.datas[i].matchArray;
            for (var j = 0, jLen = matchArr.length; j < jLen; j++) {
                showMathItem(matchArr[j]);
            }
        }
    };

    /**
     * 显示单场赛事
     * @param item
     */
    var showMathItem = function (item) {
        var matchId = item.matchId;
        var $contain = $("<div id='m_" + matchId + "' class='betContain'></div>");

        // 缓存赛事数据
        matchMap[matchId] = item;

        // 缓存赛事种类数据
        var len = 1; // 赛事种类中的场数
        if (leagueMap[item.leagueMatch] != null && typeof leagueMap[item.leagueMatch] != "undefined") {
            var len = leagueMap[item.leagueMatch] + len;
        }

        leagueMap[item.leagueMatch] = len;

        // 字符串
        var str = "<div class='footballTz' title='" + item.gliveId + "'>" + "<table cellpadding='0' cellspacing='0' width='100%'>";
        str += "<colgroup>" +
            "<col width='25%'>" +
            "<col width='25%'>" +
            "<col width='25%'>" +
            "<col width='25%'>" +
            "</colgroup>";

        str += "<tbody>";

        str += "<tr>";
        str += "<td class='bordernone'>" + item.number + "<br><span class='leagueT'>" + item.leagueMatch + "</span></td>";
        str += "<td class='bgfff jcMore' colspan='3'>";
        if (item.gliveId != null && typeof item.gliveId != "undefined"
            && $.trim(item.gliveId) != "") {
            str += "<a class='moreBg fr'></a>";
        }

        str += item.playAgainst.replace('|', '<i class="mlr17">vs</i>') + "</td>";
        str += "</tr>";

        // 根据matchId 保存SP值
        var spDatas = item.spDatas;

        var spf = spDatas.spf.split(",");
        str += "<tr>";
        str += "<td class='bordernone'><i class=' jcArrow grayDown'>" + item.time + "</i></td>";
        if ($.trim(spf[0]) != "") {
            str += "<td class='bgfff' id='spf_0-" + matchId + "'><i class='mlr10'> 胜 </i>" + spf[0] + "</td>";
            str += "<td class='bgfff' id='spf_1-" + matchId + "'><i class='mlr10'> 平 </i>" + spf[1] + "</td>";
            str += "<td class='bgfff' id='spf_2-" + matchId + "'><i class='mlr10'> 负 </i>" + spf[2] + "</td>";
        } else {
            str += "<td colspan='2' width='74%'>该玩法尚未开售</td>";
        }
        str += "</tr>";

        str += "</tbody>";
        str += "</table></div>";

        $contain.html(str);
        $(".balls").append($contain);
    };

    /**
     * 添加赛事种类列表
     */
    var addLeagueItems = function () {
        for (var l in leagueMap) {
            $(".leagueBox .icon").append($("<li class='click'>" + l + "[<span>" + leagueMap[l] + "</span>场]</li>"));
        }

        showLeagueMatchLen();
    };

    /**
     * 显示选择赛事类型中的场数
     */
    var showLeagueMatchLen = function () {
        var matchLen = 0;
        $(".leagueBox .icon .click").each(function (i, li) {
            var $span = $(li).find("span");
            if ($span.length) {
                matchLen += parseInt($span.text(), 10);
            }
        });

        $(".bar .red").text(matchLen);
    };

    /**
     * 显示缓存数据
     */
    var showBuffer = function () {
        var matchBetList = bufferData.matchBetList;
        for (var i = 0, len = matchBetList.length; i < len; i++) {
            var item = matchBetList[i];
            var matchId = item.matchId;
            var spfIds = item.spfIds,
                rqspfIds = item.rqspfIds,
                zjqIds = item.zjqIds,
                bqcIds = item.bqcIds,
                bfIds = item.bfIds;

            if ( rqspfIds.length > 0 || zjqIds.length > 0 || bqcIds.length > 0 || bfIds.length > 0) {
                // 显示SP层
                showSPOptions(matchId);
            }

            // 胜平负
            for (var j = 0, jLen = spfIds.length; j < jLen; j++) {
                $("#" + spfIds[j] + "-" + matchId).addClass("click");
            }

            // 让球胜平负
            for (var k = 0, kLen = rqspfIds.length; k < kLen; k++) {
                $("#" + rqspfIds[k] + "-" + matchId).addClass("click");
            }

            // 总进球
            for (var d = 0, dLen = zjqIds.length; d < dLen; d++) {
                $("#" + zjqIds[d] + "-" + matchId).addClass("click");
            }

            // 半全场
            for (var c = 0, cLen = bqcIds.length; c < cLen; c++) {
                $("#" + bqcIds[c] + "-" + matchId).addClass("click");
            }

            // 比分
            for (var f = 0, bLen = bfIds.length; f < bLen; f++) {
                $("#" + bfIds[f] + "-" + matchId).addClass("click");
            }

            if (spfIds.length > 0 || rqspfIds.length > 0 || zjqIds.length > 0 || bqcIds.length > 0 || bfIds.length > 0) {
                // 焦点样式
                switchArrow(matchId, 0);
            }
        }
    };

    /**
     * 箭头转换样式
     * @param matchId 赛事id
     * @param flag 1:切换，0:焦点
     */
    var switchArrow = function (matchId, flag) {

        var $contain = $("#m_" + matchId);
        var $sp = $("#sp_" + matchId);
        if (flag) {
            // 切换箭头
            if ($contain.find(".click").length) {
                if ($sp.is(":visible")) {
                    $contain.find(".jcArrow").removeClass().addClass("jcArrow").addClass("redUp");
                } else {
                    $contain.find(".jcArrow").removeClass().addClass("jcArrow").addClass("redDown");
                }
            } else {
                if ($sp.is(":visible")) {
                    $contain.find(".jcArrow").removeClass().addClass("jcArrow").addClass("grayUp");
                } else {
                    $contain.find(".jcArrow").removeClass().addClass("jcArrow").addClass("grayDown");
                }
            }
        } else {
            // 焦点样式
            if ($sp.is(":visible")) {
                if ($contain.find(".click").length) {
                    $contain.find(".jcArrow").removeClass().addClass("jcArrow").addClass("redUp");
                } else {
                    $contain.find(".jcArrow").removeClass().addClass("jcArrow").addClass("grayUp");
                }
            } else {
                if ($contain.find(".click").length) {
                    $contain.find(".jcArrow").removeClass().addClass("jcArrow").addClass("redDown");
                } else {
                    $contain.find(".jcArrow").removeClass().addClass("jcArrow").addClass("grayDown");
                }
            }
        }
    };

    /**
     * 显示SP选择项
     * @param matchId
     */
    var showSPOptions = function (matchId) {

        var $sp = $("#sp_" + matchId);

        if ($sp.length) {
            if ($sp.is(":visible")) {
                $sp.hide();
            } else {
                $sp.show();
            }
            switchArrow(matchId, 1);
            return;
        }

        var spDatas = matchMap[matchId].spDatas;
        var $contain = $("<div id='sp_" + matchId + "' class='showTable' width='100%'></div>");

        // 字符串
        var str = "";

        // 让球胜平负

        str += "<table cellpadding='0' cellspacing='0' width='100%' class='lYTable'>";

        str += "<colgroup>" +
            "<col width='25%'>" +
            "<col width='25%'>" +
            "<col width='25%'>" +
            "<col width='25%'>" +
            "</colgroup>";

        str += "<tbody>";

        var rqspf = spDatas.rqspf.split(",");
        str += "<tr>" +
            "<td class='tab'> 让球 <br>" + rqspf[0] + "</td>" +
            "<td id='rqspf_1-" + matchId + "'> 让胜 <br>" + rqspf[1] + "</td>" +
            "<td id='rqspf_2-" + matchId + "'> 让平 <br>" + rqspf[2] + "</td>" +
            "<td id='rqspf_3-" + matchId + "'> 让负 <br>" + rqspf[3] + "</td>" +
            "</tr>";


        str += "</tbody>";
        str += "</table>";

        // 总进球
        str += "<table cellpadding='0' cellspacing='0' width='100%' class='dYTable'>";

        str += "<colgroup>" +
            "<col width='25%'>" +
            "<col width='25%'>" +
            "<col width='25%'>" +
            "<col width='25%'>" +
            "</colgroup>";

        str += "<tbody>";

        var zjq = spDatas.zjq.split(",");
        str += "<tr>" +
            "<td id='zjq_0-" + matchId + "'> 0球 <br>" + zjq[0] + "</td>" +
            "<td id='zjq_1-" + matchId + "'> 1球 <br>" + zjq[1] + "</td>" +
            "<td id='zjq_2-" + matchId + "'> 2球 <br>" + zjq[2] + "</td>" +
            "<td id='zjq_3-" + matchId + "'> 3球 <br>" + zjq[3] + "</td>" +
            "</tr>";

        str += "<tr>" +
            "<td id='zjq_4-" + matchId + "'> 4球 <br>" + zjq[4] + "</td>" +
            "<td id='zjq_5-" + matchId + "'> 5球 <br>" + zjq[5] + "</td>" +
            "<td id='zjq_6-" + matchId + "'> 6球 <br>" + zjq[6] + "</td>" +
            "<td id='zjq_7-" + matchId + "'> 7+ <br>" + zjq[7] + "</td>" +
            "</tr>";

        str += "</tbody>";
        str += "</table>";

        // 半全场
        str += "<table cellpadding='0' cellspacing='0' width='100%' class='lBTable'>";

        str += "<colgroup>" +
            "<col width='20%'>" +
            "<col width='20%'>" +
            "<col width='20%'>" +
            "<col width='20%'>" +
            "<col width='20%'>" +
            "</colgroup>";

        str += "<tbody>";

        var bqc = spDatas.bqc.split(",");
        str += "<tr>" +
            "<td id='bqc_0-" + matchId + "'> 胜胜 <br>" + bqc[0] + "</td>" +
            "<td id='bqc_1-" + matchId + "'> 胜平 <br>" + bqc[1] + "</td>" +
            "<td id='bqc_2-" + matchId + "'> 胜负 <br>" + bqc[2] + "</td>" +
            "<td id='bqc_3-" + matchId + "'> 平胜 <br>" + bqc[3] + "</td>" +
            "<td id='bqc_4-" + matchId + "'> 平平 <br>" + bqc[4] + "</td>" +
            "</tr>";

        str += "<tr>" +
            "<td id='bqc_5-" + matchId + "'> 平负 <br>" + bqc[5] + "</td>" +
            "<td id='bqc_6-" + matchId + "'> 负胜 <br>" + bqc[6] + "</td>" +
            "<td id='bqc_7-" + matchId + "'> 负平 <br>" + bqc[7] + "</td>" +
            "<td id='bqc_8-" + matchId + "'> 负负 <br>" + bqc[8] + "</td>" +
            "</tr>";

        str += "</tbody>";
        str += "</table>";

        // 比分
        var bf = spDatas.bf.split(",");        //比分

        str += "<table cellpadding='0' cellspacing='0' width='100%' class='lRTable'>";

        str += "<colgroup>" +
            "<col width='14.28%'>" +
            "<col width='14.28%'>" +
            "<col width='14.28%'>" +
            "<col width='14.28%'>" +
            "<col width='14.28%'>" +
            "<col width='14.28%'>" +
            "</colgroup>";

        str += "<tbody>";
        str += "<tr>" +
            "<td id='bf_0-" + matchId + "'> 1:0 <br>" + bf[0] + "</td>" +
            "<td id='bf_1-" + matchId + "'> 2:0 <br>" + bf[1] + "</td>" +
            "<td id='bf_2-" + matchId + "'> 2:1 <br>" + bf[2] + "</td>" +
            "<td id='bf_3-" + matchId + "'> 3:0 <br>" + bf[3] + "</td>" +
            "<td id='bf_4-" + matchId + "'> 3:1 <br>" + bf[4] + "</td>" +
            "<td id='bf_5-" + matchId + "'> 3:2 <br>" + bf[5] + "</td>" +
            "<td id='bf_6-" + matchId + "'> 4:0 <br>" + bf[6] + "</td>" +
            " </tr>";

        str += "<tr>" +
            "<td id='bf_7-" + matchId + "'> 4:1 <br>" + bf[7] + "</td>" +
            "<td id='bf_8-" + matchId + "'> 4:2 <br>" + bf[8] + "</td>" +
            "<td id='bf_9-" + matchId + "'> 5:0 <br>" + bf[9] + "</td>" +
            "<td id='bf_10-" + matchId + "'> 5:1 <br>" + bf[10] + "</td>" +
            "<td id='bf_11-" + matchId + "'> 5:2 <br>" + bf[11] + "</td>" +
            "<td id='bf_12-" + matchId + "' colspan='2'> 胜其他 <br>" + bf[12] + "</td>" +
            " </tr>";

        str += "<tr>" +
            "<td id='bf_13-" + matchId + "'> 0:0 <br>" + bf[13] + "</td>" +
            "<td id='bf_14-" + matchId + "'> 1:1 <br>" + bf[14] + "</td>" +
            "<td id='bf_15-" + matchId + "'> 2:2 <br>" + bf[15] + "</td>" +
            "<td id='bf_16-" + matchId + "'> 3:3 <br>" + bf[16] + "</td>" +
            "<td id='bf_17-" + matchId + "' colspan='3'>  平其他    <br>" + bf[17] + "</td>" +
            " </tr>";

        str += "<tr>" +
            "<td id='bf_18-" + matchId + "'> 0:1 <br>" + bf[18] + "</td>" +
            "<td id='bf_19-" + matchId + "'> 0:2 <br>" + bf[19] + "</td>" +
            "<td id='bf_20-" + matchId + "'> 1:2 <br>" + bf[20] + "</td>" +
            "<td id='bf_21-" + matchId + "'> 0:3 <br>" + bf[21] + "</td>" +
            "<td id='bf_22-" + matchId + "'> 1:3 <br>" + bf[22] + "</td>" +
            "<td id='bf_23-" + matchId + "'> 2:3 <br>" + bf[23] + "</td>" +
            "<td id='bf_24-" + matchId + "'> 0:4 <br>" + bf[24] + "</td>" +
            " </tr>";

        str += "<tr>" +
            "<td id='bf_25-" + matchId + "'> 1:4 <br>" + bf[25] + "</td>" +
            "<td id='bf_26-" + matchId + "'> 2:4 <br>" + bf[26] + "</td>" +
            "<td id='bf_27-" + matchId + "'> 0:5 <br>" + bf[27] + "</td>" +
            "<td id='bf_28-" + matchId + "'> 1:5 <br>" + bf[28] + "</td>" +
            "<td id='bf_29-" + matchId + "'> 2:5 <br>" + bf[29] + "</td>" +
            "<td id='bf_30-" + matchId + "'colspan='2'> 负其他 <br>" + bf[30] + "</td>" +
            " </tr>";

        str += "</tbody>";
        str += "</table>";

        $contain.html(str);
        $("#m_" + matchId).append($contain);
        switchArrow(matchId, 1);
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
            if (canBack) {
                page.goBack();
            } else {
                page.initPage("home", {}, 1);
            }
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
        // 筛选
        $(".loudou").on(pageEvent.touchStart, function (e) {
            pageEvent.handleTapEvent(this, this, pageEvent.activate, e);
            return true;
        });

        $(".loudou").on(pageEvent.activate, function (e) {
            showLeagueBox();
            return true;
        });

        // 购彩记录
        $(".gcBg").on(pageEvent.click, function (e) {
            util.hideCover();
            if (!appConfig.checkLogin(null)) {
                // 尚未登录，弹出提示框
                $(".menuBox").hide();
                util.prompt("", "您还未登录，请先登录", "登录", "取消",
                    function (e) {
                        page.initPage("login", {}, 1);
                    },
                    function (e) {
                    }
                );
                return false;
            }
            page.initPage("user/buyRecord", {lotteryTypeArray: "46|47|48|49|52|56"}, 1);
            return true;
        });

        // 开奖信息
        $(".kjBg").on(pageEvent.click, function (e) {
            util.hideCover();
            page.initPage("jczq/history", {lottery: lotteryType}, 1);
            return true;
        });

        // 玩法介绍
        $(".wfBg").on(pageEvent.click, function (e) {
            util.hideCover();
            page.initPage("jczq/intro", {}, 1);
            return true;
        });

        // 关闭显示框
        $(".cover").on(pageEvent.click, function (e) {
            $(".popup").hide();
            $(".menuBox").hide();
            if ($(".leagueBox").is(":visible")) {
                hideLeagueBox();
                $(".leagueBox .icon li").removeClass("click");
                initEles.each(function (i, item) {
                    $(item).addClass("click");
                });

                showLeagueMatchLen();
            }
            util.hideCover();
            return true;
        });

        $(".balls").on(pageEvent.tap, function (e) {
            var $target = $(e.target);
            // SP切换
            var $bordernone = $target.closest(".bordernone");
            // more 跳转
            var $more = $target.closest(".jcMore");
            // 胜平负
            var $spf = $target.closest(".footballTz");
            // 让球胜平负
            var $rqspf = $target.closest(".lYTable");

            //总进球
            var $zjq = $target.closest(".dYTable");

            // 半全场
            var $bqc = $target.closest(".lBTable");
            // 比分
            var $bf = $target.closest(".lRTable");

            if ($bordernone.length) {
                // 切换SP显示

                // 获取matchId
                var matchId = getMatchId($bordernone);
                if ($.trim(matchId) != "") {
                    // 显示SP层
                    showSPOptions(matchId);
                }

            } else if ($more.length) {
                // more 跳转
                var against = {};
                //存储数据,页面跳转...
                //查找最近div-title属性,分别得到gliveId 854099,issueNo 2014-02-21,teamNo 周五002
                var gliveId = $target.closest(".footballTz").attr("title");
                if (gliveId != null && gliveId != "") {
                    recordUserSelected();
                    page.initPage("jczq/against", {gliveId: gliveId}, 1);
                }

            } else if ($spf.length) {
                // 胜平负
                var $bgfff = $target.closest(".bgfff");
                // 获取matchId
                var matchId = getMatchId($bgfff);

                if ($bgfff.hasClass("click")) {
                    $bgfff.removeClass("click");
                } else {
                    if (getMatchFocus(matchId)) {
                        $bgfff.addClass("click");
                    } else {
                        if (total == 10) {
                            util.toast("最多选择10场比赛");
                        } else {
                            $bgfff.addClass("click");
                        }
                    }
                }

                if ($.trim(matchId) != "") {
                    switchArrow(matchId, 0);
                }

                // 赛事场数
                unitTotal();
            } else if (($rqspf.length || $zjq.length || $bqc.length || $bf.length) && !$target.hasClass("tab")) {
                // 让球胜平负, 总进球, 半全场,比分
                var $td = $target.closest("td");
                // 获取matchId
                var matchId = getMatchId($target);

                if ($td.hasClass("click")) {
                    $td.removeClass("click");
                } else {
                    if (getMatchFocus(matchId)) {
                        $td.addClass("click");
                    } else {
                        if (total == 10) {
                            util.toast("最多选择10场比赛");
                        } else {
                            $td.addClass("click");
                        }
                    }
                }

                if ($.trim(matchId) != "") {
                    switchArrow(matchId, 0);
                }

                // 赛事场数
                unitTotal();
            }
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

            if (betList != null && typeof betList != "undefined"
                && betList.datas != null && typeof betList.datas != "undefined"
                && betList.datas.length) {
                if (total > 1) {
                    recordUserSelected();
                    page.initPage("jczq/list", {}, 1);
                } else {
                    util.toast("至少选择2场比赛")
                }

            } else {
                util.toast("无法获取期号");
                return false;
            }

            return true;
        });

        // 赛事种类筛选
        $(".leagueBox .icon").on(pageEvent.tap, function (e) {
            var $li = $(e.target).closest("li");
            if ($li.length) {
                var id = $li.attr("id");
                if (id != null && typeof id != "undefined" && id == "leagueOpt") {
                    // 全选，全不选
                    if ($li.hasClass("click")) {
                        // 全不选
                        $(".leagueBox .icon li").removeClass("click");
                        $li.text("全选");
                    } else {
                        // 全选
                        $(".leagueBox .icon li").addClass("click");
                        $li.text("全不选");
                    }

                } else {
                    if ($li.hasClass("click")) {
                        $li.removeClass("click");
                        $("#leagueOpt").removeClass("click");
                    } else {
                        $li.addClass("click");
                        if (($(".leagueBox .icon .click").length + 1) == $(".leagueBox .icon li").length) {
                            $("#leagueOpt").addClass("click");
                        }
                    }
                }
                showLeagueMatchLen();
            }
        });

        $(".bar .btn").on(pageEvent.tap, function (e) {
            var $clicks = $(".leagueBox .icon .click");
            if (!$clicks.length) {
                util.toast("请至少选择1种赛事");
                return false;
            }

            var matchLen = 0;
            var $leagueAll = $("#leagueOpt");
            if ($leagueAll.hasClass("click")) {
                // 全选
                $(".betContain").show();
                matchLen = parseInt($(".bar .red").text(), 10);
            } else {
                $(".betContain").hide();
                $clicks.each(function (i, li) {
                    var text = $(li).text();
                    var leagueName = text.substring(0, text.indexOf("["));
                    $(".leagueT").each(function (i, t) {
                        var $t = $(t);
                        if (leagueName == $t.text()) {
                            matchLen++;
                            $t.closest(".betContain").show();
                        }
                    });
                });
            }
            showIssueNo(matchLen);

            hideLeagueBox();
        });
    };

    /**
     * 显示赛事种类层
     */
    var showLeagueBox = function () {
        if ($(".leagueBox .icon li").length > 1) {
            initEles = $(".leagueBox .icon .click");
            $(".leagueBox").show();
            util.showCover();
        }
    };

    /**
     * 隐藏赛事种类层
     */
    var hideLeagueBox = function () {
        $(".leagueBox").hide();
        util.hideCover();
    };

    /**
     * 获取matchId
     * @param $target
     */
    var getMatchId = function ($target) {
        var matchId = "";
        var $betContain = $target.closest(".betContain");
        if ($betContain.length) {
            var id = $betContain.attr("id");
            if (id != null && typeof id != "undefined" && $.trim(id) != "") {
                var ids = id.split("_");
                matchId = ids[1];
            }
        }
        return matchId;
    };

    /**
     * 清除
     */
    var clear = function () {
        $(".balls").find(".click").removeClass("click");
        $(".balls").find(".redUp").removeClass("redUp").addClass("grayUp");
        $(".balls").find(".redDown").removeClass("redDown").addClass("grayDown");
    };

    /**
     * 获取赛事是否选中
     * @param matchId
     */
    var getMatchFocus = function (matchId) {
        if ($("#m_" + matchId).find(".click").length) {
            return true;
        } else {
            return false;
        }
    };

    /**
     * 统计赛事场数
     */
    var unitTotal = function () {
        total = 0;
        $(".betContain").each(function (i, item) {
            if ($(item).find(".click").length) {
                total++;
            }
        });

        $("#total").text(total);
    };

    /**
     * 点击对阵赛事的欧亚盘,以及确认按钮,
     * back的时候要记录所选定的比赛.
     */
    var recordUserSelected = function () {

        // 赛事数据
        bufferData = {};
        // 期号
        bufferData.issueNo = issueNo;

        // 标题对象
        var titleMap = {};

        // 赛事对阵列表
        var matchBetList = [];

        $(".betContain").each(function (i, item) {
            var $item = $(item);
            if ($item.find(".click").length) {

                // 每场赛事数据
                var data = {};

                // 获取matchId
                var matchId = getMatchId($item);
                data.matchId = matchId;
                data.match = matchMap[matchId];

                if ($.trim(matchId) != "") {
                    // 选中模式
                    // 让球胜平负
                    var spfIds = [];
                    var $spf = $item.find(".footballTz .click");
                    if ($spf.length) {
                        $spf.each(function (j, spf) {
                            var spfId = $(spf).attr("id").split("-")[0];
                            spfIds.push(spfId);
                        });
                        titleMap["spf"] = "1";
                    }
                    data.spfIds = spfIds;

                    // 让球胜平负
                    var rqspfIds = [];
                    var $rqspf = $item.find(".lYTable .click");
                    if ($rqspf.length) {
                        $rqspf.each(function (k, rqspf) {
                            var rqspfId = $(rqspf).attr("id").split("-")[0];
                            rqspfIds.push(rqspfId);
                        });
                        titleMap["rqspf"] = "1";
                    }
                    data.rqspfIds = rqspfIds;

                    // 总进球
                    var zjqIds = [];
                    var $zjq = $item.find(".dYTable .click");
                    if ($zjq.length) {
                        $zjq.each(function (d, zjq) {
                            var zjqId = $(zjq).attr("id").split("-")[0];
                            zjqIds.push(zjqId);
                        });
                        titleMap["zjq"] = "1";
                    }
                    data.zjqIds = zjqIds;

                    // 半全场
                    var bqcIds = [];
                    var $bqc = $item.find(".lBTable .click");
                    if ($bqc.length) {
                        $bqc.each(function (c, bqc) {
                            var bqcId = $(bqc).attr("id").split("-")[0];
                            bqcIds.push(bqcId);

                        });
                        titleMap["bqc"] = "1";
                    }
                    data.bqcIds = bqcIds;

                    //比分
                    var bfIds = [];
                    var $bf = $item.find(".lRTable .click");
                    if ($bf.length) {
                        $bf.each(function (c, bf) {
                            var bfId = $(bf).attr("id").split("-")[0];
                            bfIds.push(bfId);

                        });
                        titleMap["bf"] = "1";
                    }
                    data.bfIds = bfIds;
                    matchBetList.push(data);
                }
            }
        });

        bufferData.matchBetList = matchBetList;
        bufferData.titleMap = titleMap;
        appConfig.setLocalJson(appConfig.keyMap.MAY_BUY_JCZQ_KEY, bufferData);

    };

    return {init: init};
});
