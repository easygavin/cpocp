/**
 * 开奖详情查看
 */
define([
    "text!../../views/jczq/spLottery.html",
    "util/Page",
    "util/PageEvent",
    "services/JczqService",
    "util/AppConfig",
    "util/Util"
], function (template, page, pageEvent, jczqService, appConfig, util) {

    // 彩种
    var matchInfo = "";

    /**
     * 初始化
     */
    var init = function (data, forward) {
        // 加载模板内容
        $("#container").empty().append($(template));

        if (data != null && typeof data != "undefined") {
            // 彩种
            if (typeof data.matchInfo != "undefined" && $.trim(data.matchInfo) != "") {
                matchInfo = data.matchInfo;
            }
        }

        // 参数设置
        var params = {};

        if (matchInfo != "") {
            params.matchInfo = matchInfo;
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
        page.setHistoryState({url: "jczq/spLottery", data: params},
            "jczq/spLottery",
            "#jczq/spLottery" + (JSON.stringify(params).length > 2 ? "?data=" + encodeURIComponent(JSON.stringify(params)) : ""),
            forward ? 1 : 0);

    };

    /**
     * 显示标题
     */

    var showTitle = function () {
        if (matchInfo != null && matchInfo != "undefined" && matchInfo != "") {
            var hostTeam = matchInfo.playAgainst.split("|")[0];
            var guestTeam = matchInfo.playAgainst.split("|")[1];
            var title = hostTeam + " " + matchInfo.goalscore + " " + guestTeam;
            $("#teamVs").text(title);
        }
    };

    /**
     * 初始化显示
     */
    var initShow = function (data) {

        // 请求数据
        getDetails();
    };
    /**
     * 获取详细信息
     */
    var getDetails = function () {
        jczqService.getSpLottery(matchInfo.matchId, function (data) {

            // 隐藏加载标示
            util.hideLoading();
            if (typeof data != "undefined") {
                if (typeof data.statusCode != "undefined") {
                    if (data.statusCode == "0") {
                        showDetails(data);
                        showTitle();
                        initDraw();
                    }
                }
            }
        });
    };

    //根据赛事结果,默认选定某些sp值..
    var initDraw = function () {

        //胜平负
        $(".sYTable tr td").each(function (i, item) {
            var sign = $(item);
            var spf = matchInfo.result[0].spf;
            if (sign.text().indexOf(spf) > 0) {
                sign.addClass("click");
            }
        });

        //让球胜平负
        $(".lYTable tr td").each(function (i, item) {
            var sign = $(item);
            var rqspf = matchInfo.result[4].rqspf;
            if (sign.text().indexOf(rqspf) > 0) {
                sign.addClass("click");
            }
        });

        //比分
        var bf = matchInfo.result[1].bf;
        $(".lRTable tr td").each(function (i, item) {
            var sign = $(item);
            var text  = sign.text();
            if (text.indexOf(bf) > 0) {
                sign.addClass("click");
            }
        });

        //半全场
        $(".lBTable tr td").each(function (i, item) {
            var sign = $(item);
            var bqc = matchInfo.result[3].bqc;
            if (sign.text().indexOf(bqc) > 0) {
                sign.addClass("click");
            }
        });

        //总进球

        $(".dYTable tr td").each(function (i, item) {
            var zjq = matchInfo.result[2].zjq;
            var sign = $(item);
            var text  = sign.text();
            //普通方式.
            if(text.indexOf('球')>0){
                var balls  =parseInt(sign.text().split("球")[0]);
                if (balls==zjq) {
                    sign.addClass("click");
                }
                // 7+ 竞彩足球总进球.唯一特殊..
            }else if (text.indexOf('7+')>0){
                if ("7+"==zjq){
                    sign.addClass("click");
                }
            }
        });

    };


    var showDetails = function (data) {
        var spf = data.spDatas.spf.split(",");
        var rqspf = data.spDatas.rqspf.split(",");
        var bqc = data.spDatas.bqc.split(",");
        var zjq = data.spDatas.zjq.split(",");
        var bf = data.spDatas.bf.split(",");
        //胜平负.

        var spLottery = "<table cellpadding='0' cellspacing='0' width='100%' class='sYTable'>";

        spLottery += "<colgroup>" +
            "<col width='33.33%'>" +
            "<col width='33.33%'>" +
            "<col width='33.33%'>" +
            "</colgroup>";

        spLottery += "<tbody>";

        spLottery += "<tr>";
        spLottery += '<td> 胜 ' + spf[0] + '</td>';
        spLottery += '<td> 平 ' + spf[1] + '</td>';
        spLottery += '<td> 负 ' + spf[2] + '</td>';
        spLottery += "</tr>";
        spLottery += "</tbody>";
        spLottery += "</table>";


        //让球胜平负
        spLottery += "<table cellpadding='0' cellspacing='0' width='100%' class='lYTable'>";

        spLottery += "<colgroup>" +
            "<col width='25%'>" +
            "<col width='25%'>" +
            "<col width='25%'>" +
            "<col width='25%'>" +
            "</colgroup>";

        spLottery += "<tbody>";

        spLottery += "<tr>" +
            "<td>" + "让球" + matchInfo.transfer + "</td>" +
            "<td> 让胜 <br>" + rqspf[0] + "</td>" +
            "<td> 让平 <br>" + rqspf[1] + "</td>" +
            "<td> 让负 <br>" + rqspf[2] + "</td>" +
            "</tr>";

        spLottery += "</tbody>";
        spLottery += "</table>";

        // 总进球
        spLottery += "<table cellpadding='0' cellspacing='0' width='100%' class='dYTable'>";

        spLottery += "<colgroup>" +
            "<col width='25%'>" +
            "<col width='25%'>" +
            "<col width='25%'>" +
            "<col width='25%'>" +
            "</colgroup>";

        spLottery += "<tbody>";

        //总进球
        spLottery += "<tr>" +
            "<td> 0球 <br>" + zjq[0] + "</td>" +
            "<td> 1球 <br>" + zjq[1] + "</td>" +
            "<td> 2球 <br>" + zjq[2] + "</td>" +
            "<td> 3球 <br>" + zjq[3] + "</td>" +
            "</tr>";

        spLottery += "<tr>" +
            "<td> 4球 <br>" + zjq[4] + "</td>" +
            "<td> 5球 <br>" + zjq[5] + "</td>" +
            "<td> 6球 <br>" + zjq[6] + "</td>" +
            "<td> 7+ <br>" + zjq[7] + "</td>" +
            "</tr>";

        spLottery += "</tbody>";
        spLottery += "</table>";

        // 半全场
        spLottery += "<table cellpadding='0' cellspacing='0' width='100%' class='lBTable'>";

        spLottery += "<colgroup>" +
            "<col width='20%'>" +
            "<col width='20%'>" +
            "<col width='20%'>" +
            "<col width='20%'>" +
            "<col width='20%'>" +
            "</colgroup>";

        spLottery += "<tbody>";

        spLottery += "<tr>" +
            "<td> 胜-胜 <br>" + bqc[0] + "</td>" +
            "<td> 胜-平 <br>" + bqc[1] + "</td>" +
            "<td> 胜-负 <br>" + bqc[2] + "</td>" +
            "<td> 平-胜 <br>" + bqc[3] + "</td>" +
            "<td> 平-平 <br>" + bqc[4] + "</td>" +
            "</tr>";

        spLottery += "<tr>" +
            "<td> 平-负 <br>" + bqc[5] + "</td>" +
            "<td> 负-胜 <br>" + bqc[6] + "</td>" +
            "<td> 负-平 <br>" + bqc[7] + "</td>" +
            "<td> 负-负 <br>" + bqc[8] + "</td>" +
            "</tr>";

        spLottery += "</tbody>";
        spLottery += "</table>";

        // 比分

        spLottery += "<table cellpadding='0' cellspacing='0' width='100%' class='lRTable'>";

        spLottery += "<colgroup>" +
            "<col width='14.28%'>" +
            "<col width='14.28%'>" +
            "<col width='14.28%'>" +
            "<col width='14.28%'>" +
            "<col width='14.28%'>" +
            "<col width='14.28%'>" +
            "</colgroup>";

        spLottery += "<tr>" +
            "<td> 1:0 <br>" + bf[0] + "</td>" +
            "<td> 2:0 <br>" + bf[1] + "</td>" +
            "<td> 2:1 <br>" + bf[2] + "</td>" +
            "<td> 3:0 <br>" + bf[3] + "</td>" +
            "<td> 3:1 <br>" + bf[4] + "</td>" +
            "<td> 3:2 <br>" + bf[5] + "</td>" +
            "<td> 4:0 <br>" + bf[6] + "</td>" +
            " </tr>";

        spLottery += "<tr>" +
            "<td> 4:1 <br>" + bf[7] + "</td>" +
            "<td> 4:2 <br>" + bf[8] + "</td>" +
            "<td> 5:0 <br>" + bf[9] + "</td>" +
            "<td> 5:1 <br>" + bf[10] + "</td>" +
            "<td> 5:2 <br>" + bf[11] + "</td>" +
            "<td colspan='2'> 胜其他 <br>" + bf[12] + "</td>" +
            " </tr>";

        spLottery += "<tr>" +
            "<td> 0:0 <br>" + bf[13] + "</td>" +
            "<td> 1:1 <br>" + bf[14] + "</td>" +
            "<td> 2:2 <br>" + bf[15] + "</td>" +
            "<td> 3:3 <br>" + bf[16] + "</td>" +
            "<td colspan='3'>  平其他    <br>" + bf[17] + "</td>" +
            " </tr>";

        spLottery += "<tr>" +
            "<td> 0:1 <br>" + bf[18] + "</td>" +
            "<td> 0:2 <br>" + bf[19] + "</td>" +
            "<td> 1:2 <br>" + bf[20] + "</td>" +
            "<td> 0:3 <br>" + bf[21] + "</td>" +
            "<td> 1:3 <br>" + bf[22] + "</td>" +
            "<td> 2:3 <br>" + bf[23] + "</td>" +
            "<td> 0:4 <br>" + bf[24] + "</td>" +
            " </tr>";

        spLottery += "<tr>" +
            "<td> 1:4 <br>" + bf[25] + "</td>" +
            "<td> 2:4 <br>" + bf[26] + "</td>" +
            "<td> 0:5 <br>" + bf[27] + "</td>" +
            "<td> 1:5 <br>" + bf[28] + "</td>" +
            "<td> 2:5 <br>" + bf[29] + "</td>" +
            "<td colspan='2'> 负其他 <br>" + bf[30] + "</td>" +
            " </tr>";

        spLottery += "</table>";
        $(".showTable").html(spLottery);
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
        $("#toBuy").on(pageEvent.touchStart, function (e) {
            pageEvent.handleTapEvent(this, this, pageEvent.activate, e);
            return true;
        });

        $("#toBuy").on(pageEvent.activate, function (e) {
            page.initPage("jczq/mixed", {}, 1);
            return true;
        });

    };
    return {init: init};
});
