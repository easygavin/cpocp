/**
 * 历史开奖信息
 */
define([
    "text!../../views/jczq/history.html",
    "util/Page",
    "util/PageEvent",
    "services/JczqService",
    "util/AppConfig",
    "util/Util"
], function (template, page, pageEvent, jczqService, appConfig, util) {

    // 彩种.
    var lotteryType = "46";

    //开奖时间.
    var date = "";

    //数据
    var lotteryData = {};

    //可查询时间列表
    var issueList = "";

    // match Map值
    var matchMap = {};

    /**
     * 初始化
     */
    var init = function (data, forward) {
        // 加载模板内容
        $("#container").empty().append($(template));

        // 参数设置
        var params = {};

        if ($.trim(lotteryType) != "") {
            params.lotteryType = lotteryType;
        }

        if ($.trim(date) != "") {
            params.date = date;
        }

        var tkn = appConfig.checkLogin(data);
        if (tkn) {
            params.token = tkn;
        }

        // 初始化显示
        initShow(data);

        // 绑定事件
        bindEvent();

        // 处理返回
        page.setHistoryState({url: "jczq/history", data: params},
            "jczq/history",
            "#jczq/history" + (JSON.stringify(params).length > 2 ? "?data=" + encodeURIComponent(JSON.stringify(params)) : ""),
            forward ? 1 : 0);

    };

    /**
     * 初始化显示
     */
    var initShow = function (data) {
        // 请求数据
        getHistory();
    };

    /**
     * 显示title信息
     */
    var showTitle = function () {
        if (lotteryData != null) {
            /*  var current = lotteryData[0];
             var before = lotteryData[1];
             currentTitle = current.matchArray[0].date + " " + current.matchArray.length + "场比赛已开奖";
             beforeTitle = before.matchArray[0].date + " " + before.matchArray.length + "场比赛已开奖";
             $("#current").text(currentTitle);
             $("#before").text(beforeTitle);*/
        }
    };

    /**
     * 获取历史开奖信息
     */
    var getHistory = function () {
        jczqService.getJczqHistoryLottery(lotteryType, date, function (data) {

            // 隐藏加载标示
            util.hideLoading();
            if (typeof data != "undefined") {
                if (typeof data.statusCode != "undefined") {
                    if (data.statusCode == "0") {
                        lotteryData = data.datas;
                        if (data.datas != null) {
                            //可查询日期选项.
                            issueList = data.IssueList.split(",");
                            //最近一期
                            showItems(lotteryData);

                        }
                    } else {
                        util.toast(data.errorMsg);
                    }
                }
            }
        });
    };

    /**
     * 显示列表信息
     * @param data
     */
    var showItems = function (data) {
        for (var i = 0; i < data.length; i++) {
            //返回几条数据,就有几个title..
            var subItem = data[i];
            var titleStr = subItem.matchArray[0].date + " " + subItem.matchArray.length + "场比赛已开奖";
            var $target = $("<div id='target_" + i + "'></div>");

            //标题 XX日,XX场比赛.
            var tableHead = '<table cellpadding="0" cellspacing="0" width="100%" id="head_' + i + '">';
            tableHead += '<tr>' +
                '<td colspan="4" class="tl head"><i class="fr sj"></i><span id="title_' + i + '">' + titleStr + '</span></td>' +
                '</tr>';
            tableHead += '</table>';

            //详细比赛..
            var detailGame = '<table  cellpadding="0" cellspacing="0" width="100%" id="detail_' + i + '">';
            detailGame += '<colgroup>' +
                '<col width="25%">' +
                '<col width="25%">' +
                '<col width="25%">' +
                '<col width="25%">' +
                '</colgroup>';
            detailGame += '<tbody>';
            //循环读取数据.
            for (var t = 0; t < subItem.matchArray.length; t++) {
                var teams = subItem.matchArray[t];
                matchMap [teams.matchId] =teams;
                //比赛队伍.
                var playAgainst = teams.playAgainst.split("|");
                //主队.
                var hostTeam = playAgainst[0];
                //客队.
                var guestTeam = playAgainst[1];
                //比赛结果.
                var result = teams.result;
                detailGame += '<tr id="' + teams.matchId + '">';
                detailGame += '<td class="line30">' + teams.number + '<br>' + teams.leagueMatch + '</td>';
                detailGame += '<td class="bl1">' + hostTeam.substring(0, 4) + '</td>';

                if (result[0].spf == "胜") {
                    detailGame += '<td   class="line30 bl1 s">' + teams.goalscore + "<br>胜" + '</td>';
                } else if (result[0].spf == "平") {
                    detailGame += '<td   class="line30 bl1 p">' + teams.goalscore + "<br>平" + '</td>';
                } else if (result[0].spf == "负") {
                    detailGame += '<td   class="line30 bl1 f">' + teams.goalscore + "<br>负" + '</td>';
                } else {
                    detailGame += '<td class="u">' + "未开售" + '</td>';
                }
                detailGame += '<td class="bl1">' + guestTeam.substring(0, 4) + '</td>';
                detailGame += "</tr>";
            }
            detailGame += '</tbody>';

            detailGame += "</table>";

            $target.html(tableHead + detailGame);
            $(".lqkjBox").append($target);
        }
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
            page.goBack();
            return true;
        });


        // 右菜单
        $(".menu").on(pageEvent.touchStart, function (e) {
            pageEvent.handleTapEvent(this, this, pageEvent.activate, e);
            return true;
        });

        $(".menu").on(pageEvent.activate, function (e) {
            var issueMenu = $(".lotteryBox ul");
            if (issueMenu.is(":visible")) {
                $(".lotteryBox").hide();
            } else {
                if (issueMenu.hasClass("click")) {
                    $(".lotteryBox").show();
                } else {
                    for (var t = 0; t < issueList.length; t++) {
                        var $li = $("<li id='" + issueList[t] + "'>" + issueList[t] + "</li>");
                        issueMenu.append($li);
                    }
                    issueMenu.addClass("click");
                }
                $(".lotteryBox").show();
            }
            util.showCover();
            return true;
        });

        $("#select").on(pageEvent.tap, function (e) {
            var $target = $(e.target);
            //右侧菜单栏.
            var select_date = $target.closest(".lotteryBox ul li");
            //表格..标题被点击切换/隐藏..
            var select_title = $target.closest(".lqkjBox table");
            //点击当中的某一行,显示开奖sp.
            var displayFlag = "";
            if (select_title.length) {
                var titleId = select_title.attr("id");
                if (titleId.indexOf('head') > -1) {
                    var detailItem = "detail_" + titleId.split("_")[1];
                    displayFlag = $("#" + detailItem);
                    if (displayFlag.is(":visible")) {
                        displayFlag.hide();
                    } else {
                        displayFlag.show();
                    }
                }
            }

            var select_tr = $target.closest(".lqkjBox table tr");
            if (select_tr.length) {
                var matchId = select_tr.attr("id");
                var matchInfo = matchMap[matchId];
                if ($.trim(matchId) != "") {
                    page.initPage("jczq/spLottery", {matchInfo: matchInfo}, 1);
                }
            }

            if (select_date.length) {
                date = select_date.attr("id");
                if ($.trim(date) != "") {
                    page.initPage("jczq/history", {date: date, lotteryType: 46}, 1);
                    //getHistory();
                }
            }
        });

        /*   $(".select").undelegate("li", pageEvent.activate);
         $(".select").delegate("li", pageEvent.activate, function(e) {
         // 历史开奖信息 ，id是使用时间来设定.
         date = $(this).attr("id");
         if ($.trim(date) != "") {
         page.initPage("jczq/history", {date: date,lotteryType:46}, 1);
         //getHistory();
         }
         return true;
         });*/
        // 关闭显示框
        $(".cover").on(pageEvent.click, function (e) {
            $(".lotteryBox").hide();
            util.hideCover();
            return true;
        });
    };

    return {init: init};
});
