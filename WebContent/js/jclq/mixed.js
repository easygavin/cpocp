/**
 * 竞彩篮球选场
 */
define([
    "text!../../views/jclq/mixed.html",
    "util/Page",
    "util/PageEvent",
    "util/AppConfig",
    "util/Util",
    "services/JclqService"
], function (template, page, pageEvent, appConfig, util, jclqService) {

    // 处理返回参数
    var canBack = 0;

    // 彩种
    var lotteryType = "36";

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
        page.setHistoryState({url:"jclq/mixed", data:params},
            "jclq/mixed",
            "#jclq/mixed" + (JSON.stringify(params).length > 2 ? "?data=" + encodeURIComponent(JSON.stringify(params)) : ""),
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
            bufferData = appConfig.getLocalJson(appConfig.keyMap.MAY_BUY_JCLQ_KEY);
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
        jclqService.getJCLQBetList(lotteryType, function (data) {
            if (typeof data != "undefined") {
                if (typeof data.statusCode != "undefined") {
                    if (data.statusCode == "0") {
                        betList = data;

                        // 处理对阵列表
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
        var str = "<div class='footballTz'>" + "<table cellpadding='0' cellspacing='0' width='100%'>";
        str += "<colgroup>" +
            "<col width='26%'>" +
            "<col width='37%'>" +
            "<col width='37%'>" +
            "</colgroup>";

        str += "<tbody>";

        str += "<tr>";
        str += "<td class='bordernone'>" + item.number + "<br><span class='leagueT'>" + item.leagueMatch + "</span></td>";
        str += "<td class='bgfff jcMore' colspan='2'>";
        if (item.gliveId != null && typeof item.gliveId != "undefined"
            && $.trim(item.gliveId) != "") {
            str += "<a class='moreBg fr'></a>";
        }

        str += item.playAgainst.replace('|', '<i class="mlr17">vs</i>') + "</td>";
        str += "</tr>";

        // 根据matchId 保存SP值
        var spDatas = item.spDatas;

        var sf = spDatas.sf.split(",");
        str += "<tr>";
        str += "<td class='bordernone'><i class='jcArrow grayDown'>" + item.time + "</i></td>";

        if ($.trim(sf[0]) != "") {
            str += "<td class='bgfff' id='sf_0-" + matchId + "'><i class='mlr10'> 主胜 </i>" + sf[0] + "</td>";
            str += "<td class='bgfff' id='sf_1-" + matchId + "'><i class='mlr10'> 客胜 </i>" + sf[1] + "</td>";
        } else {
            str += "<td colspan='2' width='74%'>该玩法未开售</td>";
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
            var sfIds = item.sfIds,
                rfsfIds = item.rfsfIds,
                dxfIds = item.dxfIds,
                sfcIds = item.sfcIds;

            if (rfsfIds.length > 0 || dxfIds.length > 0 || sfcIds.length > 0) {
                // 显示SP层
                showSPOptions(matchId);
            }

            // 胜负
            for (var j = 0, jLen = sfIds.length; j < jLen; j++) {
                $("#" + sfIds[j] + "-" + matchId).addClass("click");
            }

            // 让分胜负
            for (var k = 0, kLen = rfsfIds.length; k < kLen; k++) {
                $("#" + rfsfIds[k] + "-" + matchId).addClass("click");
            }

            // 大小分
            for (var d = 0, dLen = dxfIds.length; d < dLen; d++) {
                $("#" + dxfIds[d] + "-" + matchId).addClass("click");
            }

            // 胜负差
            for (var c = 0, cLen = sfcIds.length; c < cLen; c++) {
                $("#" + sfcIds[c] + "-" + matchId).addClass("click");
            }

            if (sfIds.length > 0 || rfsfIds.length > 0 || dxfIds.length > 0 || sfcIds.length > 0) {
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

        // 让分
        str += "<table cellpadding='0' cellspacing='0' width='100%' class='lYTable'>";

        str += "<colgroup>" +
            "<col width='33%'>" +
            "<col width='33%'>" +
            "<col width='34%'>" +
            "</colgroup>";

        str += "<tbody>";

        var rfsf = spDatas.rfsf.split(",");
        str += "<tr>" +
            "<td class='tab'> 让分 <br>" + rfsf[0] + "</td>" +
            "<td id='rfsf_1-" + matchId + "' " + ($.trim(rfsf[1]) != "" ? "" : "class='tab'") + "> " +
            "让分主胜 <br>" + ($.trim(rfsf[1]) != "" ? rfsf[1] : "&nbsp;") + "</td>" +

            "<td id='rfsf_2-" + matchId + "' " + ($.trim(rfsf[2]) != "" ? "" : "class='tab'") + "> " +
            "让分客胜 <br>" + ($.trim(rfsf[2]) != "" ? rfsf[2] : "&nbsp;") + "</td>" +
            "</tr>";

        str += "</tbody>";
        str += "</table>";

        // 大小分
        str += "<table cellpadding='0' cellspacing='0' width='100%' class='lBTable'>";

        str += "<colgroup>" +
            "<col width='33%'>" +
            "<col width='33%'>" +
            "<col width='34%'>" +
            "</colgroup>";

        str += "<tbody>";

        var dxf = spDatas.dxf.split(",");
        str += "<tr>" +
            "<td class='tab'> 总分 <br>" + dxf[0] + "</td>" +
            "<td id='dxf_1-" + matchId + "' " + ($.trim(dxf[1]) != "" ? "" : "class='tab'") + "> " +
            "大分 <br>" + ($.trim(dxf[1]) != "" ? dxf[1] : "&nbsp;") + "</td>" +

            "<td id='dxf_2-" + matchId + "' " + ($.trim(dxf[2]) != "" ? "" : "class='tab'") + "> " +
            "小分 <br>" + ($.trim(dxf[2]) != "" ? dxf[2] : "&nbsp;") + "</td>" +
            "</tr>";

        str += "</tbody>";
        str += "</table>";

        // 分差
        str += "<table cellpadding='0' cellspacing='0' width='100%' class='lRTable'>";

        str += "<colgroup>" +
            "<col width='33%'>" +
            "<col width='33%'>" +
            "<col width='34%'>" +
            "</colgroup>";

        str += "<tbody>";

        var sfc = spDatas.sfc.split(",");
        str += "<tr>" +
            "<td id='sfc_0-" + matchId + "' " + ($.trim(sfc[0]) != "" ? "" : "class='tab'") + "> " +
            "主胜1-5分 <br>" + ($.trim(sfc[0]) != "" ? sfc[0] : "&nbsp;") + "</td>" +

            "<td id='sfc_1-" + matchId + "' " + ($.trim(sfc[1]) != "" ? "" : "class='tab'") + "> " +
            "主胜6-10分 <br>" + ($.trim(sfc[1]) != "" ? sfc[1] : "&nbsp;") + "</td>" +

            "<td id='sfc_2-" + matchId + "' " + ($.trim(sfc[2]) != "" ? "" : "class='tab'") + "> " +
            "主胜11-15分 <br>" + ($.trim(sfc[2]) != "" ? sfc[2] : "&nbsp;") + "</td>" +
            "</tr>";

        str += "<tr>" +
            "<td id='sfc_3-" + matchId + "' " + ($.trim(sfc[3]) != "" ? "" : "class='tab'") + "> " +
            "主胜16-20分 <br>" + ($.trim(sfc[3]) != "" ? sfc[3] : "&nbsp;") + "</td>" +

            "<td id='sfc_4-" + matchId + "' " + ($.trim(sfc[4]) != "" ? "" : "class='tab'") + "> " +
            "主胜21-25分 <br>" + ($.trim(sfc[4]) != "" ? sfc[4] : "&nbsp;") + "</td>" +

            "<td id='sfc_5-" + matchId + "' " + ($.trim(sfc[5]) != "" ? "" : "class='tab'") + "> " +
            "主胜26+分 <br>" + ($.trim(sfc[5]) != "" ? sfc[5] : "&nbsp;") + "</td>" +
            "</tr>";

        str += "<tr>" +
            "<td id='sfc_6-" + matchId + "' " + ($.trim(sfc[6]) != "" ? "" : "class='tab'") + "> " +
            "客胜1-5分 <br>" + ($.trim(sfc[6]) != "" ? sfc[6] : "&nbsp;") + "</td>" +

            "<td id='sfc_7-" + matchId + "' " + ($.trim(sfc[7]) != "" ? "" : "class='tab'") + "> " +
            "客胜6-10分 <br>" + ($.trim(sfc[7]) != "" ? sfc[7] : "&nbsp;") + "</td>" +

            "<td id='sfc_8-" + matchId + "' " + ($.trim(sfc[8]) != "" ? "" : "class='tab'") + "> " +
            "客胜11-15分 <br>" + ($.trim(sfc[8]) != "" ? sfc[8] : "&nbsp;") + "</td>" +
            "</tr>";

        str += "<tr>" +
            "<td id='sfc_9-" + matchId + "' " + ($.trim(sfc[9]) != "" ? "" : "class='tab'") + "> " +
            "客胜16-20分 <br>" + ($.trim(sfc[9]) != "" ? sfc[9] : "&nbsp;") + "</td>" +

            "<td id='sfc_10-" + matchId + "' " + ($.trim(sfc[10]) != "" ? "" : "class='tab'") + "> " +
            "客胜21-25分 <br>" + ($.trim(sfc[10]) != "" ? sfc[10] : "&nbsp;") + "</td>" +

            "<td id='sfc_11-" + matchId + "' " + ($.trim(sfc[11]) != "" ? "" : "class='tab'") + "> " +
            "客胜26+分 <br>" + ($.trim(sfc[11]) != "" ? sfc[11] : "&nbsp;") + "</td>" +
            "</tr>";

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
                util.prompt("", "您还未登录，请先登录", "登录", "取消",
                    function (e) {
                        page.initPage("login", {}, 1);
                    },
                    function (e) {
                    }
                );
                return false;
            }
            page.initPage("user/buyRecord", {lotteryTypeArray:"36|37|38|39|53"}, 1);
            return true;
        });

        // 开奖信息
        $(".kjBg").on(pageEvent.click, function (e) {
            util.hideCover();
            page.initPage("jclq/history", {date:""}, 1);
            return true;
        });

        // 玩法介绍
        $(".wfBg").on(pageEvent.click, function (e) {
            util.hideCover();
            page.initPage("jclq/intro", {}, 1);
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
            // 胜负
            var $sf = $target.closest(".footballTz");
            // 让分
            var $rfsf = $target.closest(".lYTable");
            // 大小分
            var $dxf = $target.closest(".lBTable");
            // 胜负差
            var $sfc = $target.closest(".lRTable");

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
            } else if ($sf.length) {
                // 胜负
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
            } else if (($rfsf.length || $dxf.length || $sfc.length) && !$target.hasClass("tab")) {
                // 让分, 大小分, 胜负差
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

            if (betList != null && typeof betList != "undefined"
                && betList.datas != null && typeof betList.datas != "undefined"
                && betList.datas.length) {
                if (total > 1) {
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

                                // 胜负
                                // 选中胜负
                                var sfIds = [];
                                var $sf = $item.find(".footballTz .click");
                                if ($sf.length) {
                                    $sf.each(function (j, sf) {
                                        var sfId = $(sf).attr("id").split("-")[0];
                                        sfIds.push(sfId);
                                    });
                                    titleMap["sf"] = "1";
                                }
                                data.sfIds = sfIds;

                                // 让分
                                // 选中让分
                                var rfsfIds = [];
                                var $rfsf = $item.find(".lYTable .click");
                                if ($rfsf.length) {
                                    $rfsf.each(function (k, rfsf) {
                                        var rfsfId = $(rfsf).attr("id").split("-")[0];
                                        rfsfIds.push(rfsfId);
                                    });
                                    titleMap["rfsf"] = "1";
                                }
                                data.rfsfIds = rfsfIds;

                                // 大小分
                                // 选中大小分
                                var dxfIds = [];
                                var $dxf = $item.find(".lBTable .click");
                                if ($dxf.length) {
                                    $dxf.each(function (d, dxf) {
                                        var dxfId = $(dxf).attr("id").split("-")[0];
                                        dxfIds.push(dxfId);
                                    });
                                    titleMap["dxf"] = "1";
                                }
                                data.dxfIds = dxfIds;

                                // 胜负差
                                // 选中大胜负差
                                var sfcIds = [];
                                var $sfc = $item.find(".lRTable .click");
                                if ($sfc.length) {
                                    $sfc.each(function (c, sfc) {
                                        var sfcId = $(sfc).attr("id").split("-")[0];
                                        sfcIds.push(sfcId);
                                    });
                                    titleMap["sfc"] = "1";
                                }
                                data.sfcIds = sfcIds;

                                matchBetList.push(data);
                            }
                        }
                    });

                    bufferData.matchBetList = matchBetList;
                    bufferData.titleMap = titleMap;
                    appConfig.setLocalJson(appConfig.keyMap.MAY_BUY_JCLQ_KEY, bufferData);

                    page.initPage("jclq/list", {}, 1);
                } else {
                    util.toast("至少选择2场比赛");
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

    return {init:init};
});
