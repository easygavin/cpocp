/**
 * 竞彩篮球历史开奖信息详情
 */
define([
    "text!../../views/jclq/look.html",
    "util/Page",
    "util/PageEvent",
    "services/JclqService",
    "util/AppConfig",
    "util/Util"
], function (template, page, pageEvent, jclqService, appConfig, util) {

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
        page.setHistoryState({url:"jclq/look", data:params},
            "jclq/look",
            "#jclq/look" + (JSON.stringify(params).length > 2 ? "?data=" + encodeURIComponent(JSON.stringify(params)) : ""),
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
        jclqService.getAwardDetailSP(matchResult.matchId, function (data) {

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

        // 开奖结果
        var result = matchResult.result;

        // 胜负
        var sf = result[0].sf;
        if (sf == "主胜") {
            $("#sf_3").addClass("red");
        } else if (sf == "客胜") {
            $("#sf_0").addClass("red");
        }

        // 让分胜负
        var rfsf = result[1].rfsf;
        if (rfsf == "主胜") {
            $("#rfsf_3").addClass("red");
        } else if (rfsf == "客胜") {
            $("#rfsf_0").addClass("red");
        }

        // 胜分差
        var sfc = result[2].sfc;
        sfc = sfc.replace('主胜', 'h').replace('客胜', 'v').replace('+', '');
        $("#" + sfc).addClass("red");

        // 大小分
        var dxf = result[3].dxf;
        if (dxf == "大分") {
            $("#dxf_3").addClass("red");
        } else if (dxf == "小分") {
            $("#dxf_0").addClass("red");
        }
    };

    /**
     * 显示列表信息
     * @param data
     */
    var showDetail = function (data) {

        var spDatas = data.spDatas;
        // 胜负
        var sf = spDatas.sf.split(",");
        $(".contain td").each(function (i, td) {
            $(td).find("span").text(sf[i]);
        });

        // 让分胜负
        var rfsf = spDatas.rfsf.split(",");
        $(".lYTable td").each(function (i, td) {
            $(td).find("span").text(rfsf[i]);
        });

        // 大小分
        var dxf = spDatas.dxf.split(",");
        $(".lBTable td").each(function (i, td) {
            $(td).find("span").text(dxf[i]);
        });

        // 胜分差
        var sfc = spDatas.sfc.split(",");
        $(".lRTable td").each(function (i, td) {
            $(td).find("span").text(sfc[i]);
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
            page.initPage("jclq/mixed", {}, 1);
            return true;
        });

    };

    return {init:init};
});
