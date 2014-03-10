/**
 * 竞彩足球历史开奖信息详情
 */
define([
    "text!../../views/jczq/look.html",
    "util/Page",
    "util/PageEvent",
    "services/JczqService",
    "util/AppConfig",
    "util/Util"
], function (template, page, pageEvent, jczqService, appConfig, util) {

    // 赛事开奖结果
    var matchResult = {};

    /**
     * 初始化
     */
    var init = function (data, forward) {
        // 加载模板内容
        $("#container").empty().append($(template));

        // 赛事开奖结果
        if (data != null && typeof data != "undefined"
            && typeof data.matchResult != "undefined") {
            matchResult = data.matchResult;
        }

        // 参数设置
        var params = {};
        if (matchResult != "undefined") {
            params.matchResult = matchResult;
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
        page.setHistoryState({url:"jczq/look", data:params},
            "jczq/look",
            "#jczq/look" + (JSON.stringify(params).length > 2 ? "?data=" + encodeURIComponent(JSON.stringify(params)) : ""),
            forward ? 1 : 0);

    };

    /**
     * 初始化显示
     */
    var initShow = function (data) {

        // 显示赛事信息
        showMatch();

        // 请求数据
        getDetail();
    };

    /**
     * 获取历史开奖信息详情
     */
    var getDetail = function () {

        // 请求数据
        jczqService.getAwardDetailSP(matchResult.matchId, function (data) {

            // 隐藏加载标示
            util.hideLoading();
            if (typeof data != "undefined") {
                if (typeof data.statusCode != "undefined") {
                    if (data.statusCode == "0") {
                        showDetail(data);
                    }
                }
            }
        });
    };

    /**
     * 显示赛事信息
     */
    var showMatch = function () {
        // 对阵
        var teams = matchResult.playAgainst.split("|");
        $(".match").html(teams[0] + "&nbsp;" + matchResult.goalscore + "&nbsp;" + teams[1]);

        // 让球数
        $(".lYTable .tab").find("span").text(matchResult.transfer);

        // 开奖结果
        var result = matchResult.result;

        // 胜平负
        var spf = result[0].spf;
        if (spf == "胜") {
            $("#spf_3").addClass("red");
        } else if (spf == "平") {
            $("#spf_1").addClass("red");
        } else if (spf == "负") {
            $("#spf_0").addClass("red");
        }

        // 比分
        var bf = result[1].bf;
        var isColon = bf.indexOf(":");
        if (isColon) {
            bf = bf.replace(':', '-');
            $("#bf_" + bf).addClass("red");
        } else {
            if (bf == "胜其他") {
                $("#bf_s").addClass("red");
            } else if (bf == "平其他") {
                $("#bf_p").addClass("red");
            } else if (bf == "负其他") {
                $("#bf_s").addClass("red");
            }
        }

        // 总进球
        var zjq = result[2].zjq;
        if (parseInt(zjq, 10) > 6) {
            $("#zjq_7").addClass("red");
        } else {
            $("#zjq_" + zjq).addClass("red");
        }

        // 半全场
        var bqc = result[3].bqc;
        bqc = bqc.replace(/胜/g, 's').replace(/平/g, 'p').replace(/负/g, 'f');
        $("#bqc_" + bqc).addClass("red");

        // 让球胜平负
        var rqspf = result[4].rqspf;
        if (rqspf == "让胜") {
            $("#rqspf_3").addClass("red");
        } else if (rqspf == "让平") {
            $("#rqspf_1").addClass("red");
        } else if (rqspf == "让负") {
            $("#rqspf_0").addClass("red");
        }
    };

    /**
     * 显示列表信息
     * @param data
     */
    var showDetail = function (data) {

        var spDatas = data.spDatas;
        // 胜平负
        var spf = spDatas.spf.split(",");
        $(".contain td").each(function (i, td) {
            $(td).find("span").text(spf[i]);
        });

        // 让球胜平负
        var rqspf = spDatas.rqspf.split(",");
        $(".lYTable td").each(function (i, td) {
            var $td = $(td);
            if (!$td.hasClass("tab")) {
                $td.find("span").text(rqspf[i - 1]);
            }
        });

        // 半全场
        var bqc = spDatas.bqc.split(",");
        $(".lBTable td").each(function (i, td) {
            $(td).find("span").text(bqc[i]);
        });

        // 总进球
        var zjq = spDatas.zjq.split(",");
        $(".dYTable td").each(function (i, td) {
            $(td).find("span").text(zjq[i]);
        });

        // 比分
        var bf = spDatas.bf.split(",");
        $(".lRTable td").each(function (i, td) {
            $(td).find("span").text(bf[i]);
        });
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

        // 去投注
        $(".tzBox").on(pageEvent.touchStart, function (e) {
            pageEvent.handleTapEvent(this, this, pageEvent.activate, e);
            return true;
        });

        $(".tzBox").on(pageEvent.activate, function (e) {
            page.initPage("jczq/mixed", {}, 1);
            return true;
        });

    };

    return {init:init};
});
