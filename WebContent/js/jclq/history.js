/**
 * 竞彩篮球历史开奖信息
 */
define([
    "text!../../views/jclq/history.html",
    "util/Page",
    "util/PageEvent",
    "services/JclqService",
    "util/AppConfig",
    "util/Util",
], function (template, page, pageEvent, jclqService, appConfig, util) {

    // 彩种
    var lottery = "36";

    // 日期
    var date = "";

    // 返回数据
    var result = {};

    // 赛事结果数据
    var matchResultMap = [];

    /**
     * 初始化
     */
    var init = function (data, forward) {
        // 加载模板内容
        $("#container").empty().append($(template));

        // 彩种
        if (data != null && typeof data != "undefined"
            && typeof data.date != "undefined" && $.trim(data.date) != "") {
            date = data.date;
        }

        // 参数设置
        var params = {};
        if (date != "") {
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
        page.setHistoryState({url:"jclq/history", data:params},
            "jclq/history",
            "#jclq/history" + (JSON.stringify(params).length > 2 ? "?data=" + encodeURIComponent(JSON.stringify(params)) : ""),
            forward ? 1 : 0);

    };

    /**
     * 重新设置history
     */
    var resetHistoryState = function () {
        var params = {
            date:date
        };
        // 处理返回
        page.setHistoryState({url:"jclq/history", data:params},
            "jclq/history",
            "#jclq/history" + (JSON.stringify(params).length > 2 ? "?data=" + encodeURIComponent(JSON.stringify(params)) : ""),
            0);
    };

    /**
     * 初始化显示
     */
    var initShow = function (data) {

        // 请求数据
        getHistory();
    };

    /**
     * 获取历史开奖信息
     */
    var getHistory = function () {
        // 请求数据
        jclqService.getHistoryAwards(lottery, date, function (data) {

            // 隐藏加载标示
            util.hideLoading();
            if (typeof data != "undefined") {
                if (typeof data.statusCode != "undefined") {
                    if (data.statusCode == "0") {
                        result = data;
                        showItems();
                        addIssueList();
                    }
                }
            }
        });
    };

    /**
     * 显示列表信息
     * @param data
     */
    var showItems = function () {
        var data = result.datas, matchResultMap = [];

        $(".lqkjBox").empty();
        if (result.datas.length == 0) {
            $(".lqkjBox").html("<p class='tl'>暂无赛事数据</p>");
            return false;
        }

        for (var i = 0, len = data.length; i < len; i++) {
            addItem(i, data[i]);
        }

        showDateMatchArr(0);
        switchArrow(0, 0);
    };

    /**
     * 添加一项数据
     * @param item
     */
    var addItem = function (index, item) {
        var $target = $("<div id='d_" + index + "'></div>");

        var str = "";
        str += "<table id='t_" + index + "'  cellpadding='0' cellspacing='0' width='100%'>" +
            "<colgroup>" +
            "<col width='25%'>" +
            "<col width='25%'>" +
            "<col width='25%'>" +
            "<col width='25%'>" +
            "</colgroup>";

        str += "<tbody>";

        str += "<tr>";
        str += "<td colspan='4' class='tl head'>" +
            "<i class='fr sj sjup'></i>" +
            "<span>" + item.matchArray[0].date + " " + item.matchArray.length + "场比赛已开奖</span>" +
            "</td>";
        str += "</tr>";

        str += "</tbody>";
        str += "</table>";

        $target.html(str);

        $(".lqkjBox").append($target);
    };

    /**
     * 显示当前日期赛事
     * @param index
     */
    var showDateMatchArr = function (index) {
        var item = result.datas[index];
        var matchArr = item.matchArray;

        var $target = $("<div id='r_" + index + "'></div>");
        var str = "";
        str += "<table id='l_" + index + "' cellpadding='0' cellspacing='0' width='100%'>" +
            "<colgroup>" +
            "<col width='25%'>" +
            "<col width='25%'>" +
            "<col width='25%'>" +
            "<col width='25%'>" +
            "</colgroup>";

        str += "<tbody>";

        for (var i = 0, len = matchArr.length; i < len; i++) {
            var match = matchArr[i];
            str += "<tr id='m_" + match.matchId + "'>";
            str += "<td>" + match.number + "<br>" + match.leagueMatch + "</td>";
            var teams = match.playAgainst.split("|");
            str += "<td>" + teams[0].substring(0, 4) + "<br>(" + match.transfer + ")</td>";

            // 胜负
            var className = "s";
            if (match.result[0].sf == "主胜") {
                className = "s";
            } else if (match.result[0].sf == "客胜") {
                className = "f";
            } else if (match.result[0].sf == "未开售") {
                className = "u";
            }
            str += "<td class='" + className + "'>" + match.goalscore + "<br>" + match.result[0].sf + "</td>";

            str += "<td>" + teams[1].substring(0, 4) + "</td>";
            str += "</tr>";

            matchResultMap[match.matchId] = {
                matchId:match.matchId,
                playAgainst:match.playAgainst,
                goalscore:match.goalscore,
                result:match.result
            };
        }

        str += "</tbody>";
        str += "</table>";

        $target.html(str);

        $("#d_" + index).append($target);
    };

    /**
     * 转换箭头
     * @param index
     * @param up
     */
    var switchArrow = function (index, up) {
        if (up) {
            $("#t_" + index + " .sj").addClass("sjup")
        } else {
            $("#t_" + index + " .sj").removeClass("sjup")
        }
    };

    /**
     * 添加期号列表
     */
    var addIssueList = function () {
        if ($(".lotteryBox li").length) {
            return false;
        }

        var issueList = result.IssueList.split(",");
        var str = "";
        for (var i = 0, len = issueList.length; i < len; i++) {
            str += "<li>" + issueList[i] + "</li>";
        }

        $(".lotteryBox ul").html(str);
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
            $(".lotteryBox").show();
            util.showCover();
            return true;
        });

        // 关闭显示框
        $(".cover").on(pageEvent.click, function (e) {
            $(".lotteryBox").hide();
            util.hideCover();
            return true;
        });

        // 期号选择
        $(".lotteryBox").on(pageEvent.tap, function (e) {

            var $li = $(e.target).closest("li");
            if ($li.length) {
                date = $li.text();
                // 请求数据
                getHistory();
                // 重新设置history
                resetHistoryState();

                $(".lotteryBox li").removeClass("click");
                $li.addClass("click");

                $(".lotteryBox").hide();
                util.hideCover();
            }

            return true;
        });

        $(".lqkjBox").on(pageEvent.tap, function (e) {
            var $target = $(e.target);
            var $table = $target.closest("table");
            if ($table.length) {
                var typeId = $table.attr("id");
                if (typeId != null && typeof typeId != "undefined") {
                    var typeIdArr = typeId.split("_");
                    if (typeIdArr.length > 1) {
                        var index = parseInt(typeIdArr[1], 10);
                        switch (typeIdArr[0]) {
                            case "t":
                                // 标题日期
                                var $result = $("#r_" + typeIdArr[1]);
                                if ($result.length) {
                                    if ($result.is(":visible")) {
                                        $result.hide();
                                        switchArrow(index, 1);
                                    } else {
                                        $result.show();
                                        switchArrow(index, 0);
                                    }
                                } else {
                                    showDateMatchArr(index);
                                    switchArrow(index, 0);
                                }
                                break;
                            case "l":
                                var $tr = $target.closest("tr");
                                var matchId = $tr.attr("id").split("_")[1];
                                var matchResult = matchResultMap[matchId];
                                page.initPage("jclq/look", {matchResult:matchResult}, 1);
                                break;
                        }
                    }
                }
            }
        });

        // 赛事回查
        $(".tzBox").on(pageEvent.touchStart, function (e) {
            pageEvent.handleTapEvent(this, this, pageEvent.activate, e);
            return true;
        });

        $(".tzBox").on(pageEvent.activate, function (e) {
            page.initPage("user/buyRecord", {lotteryTypeArray:"36|37|38|39|53"}, 1, 0);
            return true;
        });

    };

    return {init:init};
});
