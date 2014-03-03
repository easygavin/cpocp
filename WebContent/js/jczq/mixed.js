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
            bufferData = appConfig.getMayBuyData(appConfig.MAY_BUY_JCZQ_KEY);
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
        betList = {}, matchMap = {}, issueNo = "";
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
        /*  var result = '{"datas":[{"issueNo":"2014-02-13","matchArray":[{"time":"23:50","transfer":-1,"playAgainst":"里昂|朗斯","showctrlstr":"","matchId":"F20140213001","spDatas":{"rqspf":"-1,2.1,3.4,2.68","spf":"1.31,3.95,8.0","bqc":"1.95,17.0,60.0,3.55,5.9,13.0,25.0,17.0,11.0","zjq":"10.0,4.5,3.3,3.6,5.2,9.0,16.0,25.0","bf":"6.0,5.5,7.0,8.0,10.5,24.0,14.0,20.0,50.0,34.0,39.0,100.0,29.0,10.0,7.0,17.0,80.0,500.0,16.0,39.0,19.0,120.0,70.0,70.0,500.0,300.0,300.0,1000.0,900.0,900.0,300.0"},"number":"周四001","leagueMatch":"法国杯","date":"2014年02月13日 星期四","gliveId":"951633"},{"time":"23:50","transfer":1,"playAgainst":"里奥阿维|布拉加","showctrlstr":"","matchId":"F20140213002","spDatas":{"rqspf":"1,1.7,3.55,3.65","spf":"3.6,3.15,1.82","bqc":"5.6,13.0,29.0,7.2,4.6,4.6,36.0,13.0,2.95","zjq":"8.0,3.85,3.25,3.65,5.95,11.0,20.0,30.0","bf":"8.0,16.0,10.0,50.0,30.0,36.0,200.0,100.0,150.0,500.0,300.0,400.0,200.0,8.0,5.3,15.0,70.0,400.0,6.0,8.0,8.0,15.0,14.0,26.0,39.0,34.0,60.0,100.0,80.0,200.0,60.0"},"number":"周四002","leagueMatch":"葡联杯","date":"2014年02月13日 星期四","gliveId":"951635"},{"time":"23:50","transfer":-1,"playAgainst":"巴拉纳竞技|最强者","showctrlstr":"","matchId":"F20140213003","spDatas":{"rqspf":"-1,1.6,3.8,3.95","spf":"1.13,5.8,11.5","bqc":"1.55,23.0,100.0,3.45,7.5,23.0,24.0,23.0,18.0","zjq":"17.0,6.0,3.85,3.5,4.4,7.0,11.0,14.0","bf":"7.0,6.0,7.0,7.0,9.25,22.0,9.5,14.0,35.0,18.0,25.0,65.0,14.0,17.0,9.5,20.0,75.0,500.0,23.0,60.0,25.0,250.0,100.0,80.0,700.0,400.0,400.0,1000.0,1000.0,1000.0,300.0"},"number":"周四003","leagueMatch":"解放者杯","date":"2014年02月13日 星期四","gliveId":"954234"},{"time":"23:50","transfer":-1,"playAgainst":"智利大学|捍卫者竞技","showctrlstr":"","matchId":"F20140213004","spDatas":{"rqspf":"-1,2.2,3.4,2.53","spf":"1.35,4.0,6.5","bqc":"1.92,18.0,50.0,3.85,5.8,13.0,22.0,18.0,10.0","zjq":"10.5,4.75,3.4,3.55,5.0,8.5,15.0,23.0","bf":"6.5,6.5,7.0,9.0,10.0,19.0,17.0,19.0,35.0,35.0,50.0,100.0,27.0,10.5,7.0,16.0,70.0,400.0,14.0,29.0,16.0,80.0,50.0,50.0,300.0,200.0,200.0,900.0,700.0,700.0,250.0"},"number":"周四004","leagueMatch":"解放者杯","date":"2014年02月13日 星期四","gliveId":"954282"},{"time":"23:50","transfer":-1,"playAgainst":"蒙得维的亚国民|格雷米奥","showctrlstr":"","matchId":"F20140213005","spDatas":{"rqspf":"-1,5.3,3.97,1.42","spf":"2.32,2.95,2.67","bqc":"3.95,14.0,33.0,5.3,4.0,5.8,29.0,14.0,4.25","zjq":"7.0,3.5,3.1,3.85,6.5,13.0,26.0,38.0","bf":"6.5,10.0,8.0,23.0,21.0,34.0,70.0,60.0,100.0,250.0,200.0,300.0,120.0,7.0,5.25,14.0,80.0,500.0,6.75,11.0,8.5,25.0,23.0,35.0,75.0,65.0,100.0,250.0,250.0,400.0,150.0"},"number":"周四005","leagueMatch":"解放者杯","date":"2014年02月13日 星期四","gliveId":"954293"},{"time":"23:50","transfer":-1,"playAgainst":"拉努斯|奥伊金斯","showctrlstr":"","matchId":"F20140213006","spDatas":{"rqspf":"-1,2.27,3.3,2.5","spf":"1.36,3.9,6.55","bqc":"1.95,19.0,60.0,3.6,5.3,12.0,25.0,19.0,11.75","zjq":"9.0,3.9,3.2,3.6,5.8,11.0,20.0,29.0","bf":"5.25,6.0,7.0,8.25,11.5,26.0,17.0,23.0,55.0,35.0,55.0,150.0,39.0,9.0,7.0,18.0,100.0,600.0,12.0,29.0,17.0,100.0,60.0,60.0,400.0,250.0,300.0,1000.0,800.0,900.0,300.0"},"number":"周四006","leagueMatch":"解放者杯","date":"2014年02月13日 星期四","gliveId":"954258"},{"time":"10:20","transfer":-1,"playAgainst":"麦德林国民竞技|纽维尔老男孩","showctrlstr":"","matchId":"F20140213007","spDatas":{"rqspf":"-1,4.0,3.65,1.62","spf":"1.93,3.1,3.3","bqc":"3.25,14.0,39.0,4.6,4.25,6.5,29.0,14.0,5.2","zjq":"7.5,3.45,3.1,3.8,6.5,13.0,25.0,39.0","bf":"6.0,8.0,7.25,16.0,16.0,28.0,45.0,45.0,75.0,150.0,150.0,250.0,80.0,7.5,6.0,15.0,80.0,500.0,7.5,13.5,9.5,35.0,28.0,35.0,120.0,80.0,150.0,400.0,400.0,500.0,200.0"},"number":"周四007","leagueMatch":"解放者杯","date":"2014年02月13日 星期四","gliveId":"954294"},{"time":"10:20","transfer":-1,"playAgainst":"埃梅莱克|玻利瓦尔","showctrlstr":"","matchId":"F20140213008","spDatas":{"rqspf":"-1,1.79,3.55,3.3","spf":"1.2,4.9,9.5","bqc":"1.65,20.0,80.0,3.5,7.0,18.0,25.0,20.0,15.0","zjq":"13.0,5.1,3.5,3.5,4.8,8.0,13.0,19.0","bf":"6.0,6.0,7.0,7.0,10.0,24.0,12.0,17.0,40.0,22.0,32.0,75.0,17.0,13.0,8.5,19.0,80.0,500.0,19.0,50.0,21.0,150.0,80.0,70.0,600.0,400.0,300.0,1000.0,1000.0,900.0,300.0"},"number":"周四008","leagueMatch":"解放者杯","date":"2014年02月13日 星期四","gliveId":"954306"}]}],"statusCode":0}';
         betList = JSON.parse(result);
         handleBetList();*/
    };

    /**
     * 处理对阵列表
     */
    var handleBetList = function () {
        // 隐藏加载标示
        util.hideLoading();

        // 显示期号
        showIssueNo();

        // 显示赛事列表
        showMatchItems();
    };

    /**
     * 显示期号
     */
    var showIssueNo = function () {
        // 140103期，共16场比赛可投注
        issueNo = betList.datas[0].issueNo;
        var matchLen = betList.datas[0].matchArray.length;
        $("#issueNo").text(issueNo + "期，共" + matchLen + "场比赛可投注");
    };

    /**
     * 显示赛事列表
     */
    var showMatchItems = function () {
        for (var i = 0, iLen = betList.datas.length; i < iLen; i++) {
            var matchArr = betList.datas[i].matchArray;
            var issueNo = betList.datas[i].issueNo;
            for (var j = 0, jLen = matchArr.length; j < jLen; j++) {
                showMathItem(matchArr[j], issueNo);
            }
        }
    };

    /**
     * 显示单场赛事
     * @param item
     */
    var showMathItem = function (item, issueNo) {
        var matchId = item.matchId;
        var $contain = $("<div id='m_" + matchId + "' class='betContain'></div>");

        // 缓存赛事数据
        matchMap[matchId] = item;

        // 字符串
        var str = "<div class='footballTz' title='" + item.gliveId + '_' + issueNo + '_' + item.number + "'>" + "<table cellpadding='0' cellspacing='0' width='100%'>";
        str += "<colgroup>" +
            "<col width='25%'>" +
            "<col width='25%'>" +
            "<col width='25%'>" +
            "<col width='25%'>" +
            "</colgroup>";

        str += "<tbody>";

        str += "<tr>";
        str += "<td class='bordernone'>" + item.number + "<br>" + item.leagueMatch + "</td>";
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
            str += "<td class='bgfff' id='spf_3_" + matchId + "'><i class='mlr10'> 胜 </i>" + spf[0] + "</td>";
            str += "<td class='bgfff' id='spf_1_" + matchId + "'><i class='mlr10'> 平 </i>" + spf[1] + "</td>";
            str += "<td class='bgfff' id='spf_0_" + matchId + "'><i class='mlr10'> 负 </i>" + spf[2] + "</td>";
        } else {
            str += "<td colspan='3'>该玩法未开售</td>";
        }
        str += "</tr>";

        str += "</tbody>";
        str += "</table></div>";

        $contain.html(str);
        $(".balls").append($contain);
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

            if (spfIds.length > 0 || rqspfIds.length > 0 || zjqIds.length > 0 || bqcIds.length > 0 || bfIds.length > 0) {
                // 显示SP层
                showSPOptions(matchId);
            }

            // 胜平负
            for (var j = 0, jLen = spfIds.length; j < jLen; j++) {
                $("#spf_" + spfIds[j] + "_" + matchId).addClass("click");
            }

            // 让球胜平负
            for (var k = 0, kLen = rqspfIds.length; k < kLen; k++) {
                $("#rqspf_" + rqspfIds[k] + "_" + matchId).addClass("click");
            }

            // 总进球
            for (var d = 0, dLen = zjqIds.length; d < dLen; d++) {
                $("#zjq_" + zjqIds[d] + "_" + matchId).addClass("click");
            }

            // 半全场
            for (var c = 0, cLen = bqcIds.length; c < cLen; c++) {
                $("#bqc_" + bqcIds[c] + "_" + matchId).addClass("click");
            }

            // 比分
            for (var f = 0, bLen = bfIds.length; c < bLen; f++) {
                $("#bf_" + bfIds[f] + "_" + matchId).addClass("clfick");
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
            "<td id='rqspf_3_" + matchId + "'> 让胜 <br>" + rqspf[1] + "</td>" +
            "<td id='rqspf_1_" + matchId + "'> 让平 <br>" + rqspf[2] + "</td>" +
            "<td id='rqspf_0_" + matchId + "'> 让负 <br>" + rqspf[3] + "</td>" +
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
            "<td id='zjq_0_" + matchId + "'> 0球 <br>" + zjq[0] + "</td>" +
            "<td id='zjq_1_" + matchId + "'> 1球 <br>" + zjq[1] + "</td>" +
            "<td id='zjq_2_" + matchId + "'> 2球 <br>" + zjq[2] + "</td>" +
            "<td id='zjq_3_" + matchId + "'> 3球 <br>" + zjq[3] + "</td>" +
            "</tr>";

        str += "<tr>" +
            "<td id='zjq_4_" + matchId + "'> 4球 <br>" + zjq[4] + "</td>" +
            "<td id='zjq_5_" + matchId + "'> 5球 <br>" + zjq[5] + "</td>" +
            "<td id='zjq_6_" + matchId + "'> 6球 <br>" + zjq[6] + "</td>" +
            "<td id='zjq_7_" + matchId + "'> 7+ <br>" + zjq[7] + "</td>" +
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
            "<td id='bqc_s-s_" + matchId + "'> 胜胜 <br>" + bqc[0] + "</td>" +
            "<td id='bqc_s-p_" + matchId + "'> 胜平 <br>" + bqc[1] + "</td>" +
            "<td id='bqc_s-f_" + matchId + "'> 胜负 <br>" + bqc[2] + "</td>" +
            "<td id='bqc_p-s_" + matchId + "'> 平胜 <br>" + bqc[3] + "</td>" +
            "<td id='bqc_p-p_" + matchId + "'> 平平 <br>" + bqc[4] + "</td>" +
            "</tr>";

        str += "<tr>" +
            "<td id='bqc_p-s_" + matchId + "'> 平负 <br>" + bqc[5] + "</td>" +
            "<td id='bqc_f-s_" + matchId + "'> 负胜 <br>" + bqc[6] + "</td>" +
            "<td id='bqc_f-p_" + matchId + "'> 负平 <br>" + bqc[7] + "</td>" +
            "<td id='bqc_f-f_" + matchId + "'> 负负 <br>" + bqc[8] + "</td>" +
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

        str += "<tr>" +
            "<td id='bf_1-0_" + matchId + "'> 1:0 <br>" + bf[0] + "</td>" +
            "<td id='bf_2-0_" + matchId + "'> 2:0 <br>" + bf[1] + "</td>" +
            "<td id='bf_2-1_" + matchId + "'> 2:1 <br>" + bf[2] + "</td>" +
            "<td id='bf_3-0_" + matchId + "'> 3:0 <br>" + bf[3] + "</td>" +
            "<td id='bf_3-1_" + matchId + "'> 3:1 <br>" + bf[4] + "</td>" +
            "<td id='bf_3-2_" + matchId + "'> 3:2 <br>" + bf[5] + "</td>" +
            "<td id='bf_4-0_" + matchId + "'> 4:0 <br>" + bf[6] + "</td>" +
            " </tr>";

        str += "<tr>" +
            "<td id='bf_4-1_" + matchId + "'> 4:1 <br>" + bf[7] + "</td>" +
            "<td id='bf_4-2_" + matchId + "'> 4:2 <br>" + bf[8] + "</td>" +
            "<td id='bf_5-0_" + matchId + "'> 5:0 <br>" + bf[9] + "</td>" +
            "<td id='bf_5-1_" + matchId + "'> 5:1 <br>" + bf[10] + "</td>" +
            "<td id='bf_5-2_" + matchId + "'> 5:2 <br>" + bf[11] + "</td>" +
            "<td id='bf_s-s_" + matchId + "' colspan='2'> 胜其他 <br>" + bf[12] + "</td>" +
            " </tr>";

        str += "<tr>" +
            "<td id='bf_0-0_" + matchId + "'> 0:0 <br>" + bf[13] + "</td>" +
            "<td id='bf_1-1_" + matchId + "'> 1:1 <br>" + bf[14] + "</td>" +
            "<td id='bf_2-2_" + matchId + "'> 2:2 <br>" + bf[15] + "</td>" +
            "<td id='bf_3-3_" + matchId + "'> 3:3 <br>" + bf[16] + "</td>" +
            "<td id='bf_p-p_" + matchId + "' colspan='3'>  平其他    <br>" + bf[17] + "</td>" +
            " </tr>";

        str += "<tr>" +
            "<td id='bf_0-1_" + matchId + "'> 0:1 <br>" + bf[18] + "</td>" +
            "<td id='bf_0-2_" + matchId + "'> 0:2 <br>" + bf[19] + "</td>" +
            "<td id='bf_1-2_" + matchId + "'> 1:2 <br>" + bf[20] + "</td>" +
            "<td id='bf_0-3_" + matchId + "'> 0:3 <br>" + bf[21] + "</td>" +
            "<td id='bf_1-3_" + matchId + "'> 1:3 <br>" + bf[22] + "</td>" +
            "<td id='bf_2-3_" + matchId + "'> 2:3 <br>" + bf[23] + "</td>" +
            "<td id='bf_0-4_" + matchId + "'> 0:4 <br>" + bf[24] + "</td>" +
            " </tr>";

        str += "<tr>" +
            "<td id='bf_1-4_" + matchId + "'> 1:4 <br>" + bf[25] + "</td>" +
            "<td id='bf_2-4_" + matchId + "'> 2:4 <br>" + bf[26] + "</td>" +
            "<td id='bf_0-5_" + matchId + "'> 0:5 <br>" + bf[27] + "</td>" +
            "<td id='bf_1-5_" + matchId + "'> 1:5 <br>" + bf[28] + "</td>" +
            "<td id='bf_2-5_" + matchId + "'> 2:5 <br>" + bf[29] + "</td>" +
            "<td id='bf_f-f_" + matchId + "'colspan='2'> 负其他 <br>" + bf[30] + "</td>" +
            " </tr>";

        $contain.html(str);
        $("#m_" + matchId).append($contain);
        $("#m_" + matchId).find(".colDown").removeClass("colDown").addClass("colUp");
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
            $(".menuBox").show();
            util.showCover();
            return true;
        });

        // 购彩记录
        $(".gcBg").on(pageEvent.click, function (e) {
            page.initPage("user/buyRecord", {lotteryTypeArray: "36|37|38|39|53|46"}, 1);
            util.hideCover();
            return true;
        });

        // 开奖信息
        $(".kjBg").on(pageEvent.click, function (e) {
            page.initPage("jczq/history", {lottery: lotteryType}, 1);
            util.hideCover();
            return true;
        });

        // 玩法介绍
        $(".wfBg").on(pageEvent.click, function (e) {
            page.initPage("jczq/intro", {}, 1);
            util.hideCover();
            return true;
        });

        // 关闭显示框
        $(".cover").on(pageEvent.click, function (e) {
            $(".popup").hide();
            $(".menuBox").hide();
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
                var titleAttribute = $target.closest(".footballTz").attr("title");
                var title = titleAttribute.split("_");
                if (title != null) {
                    page.initPage("jczq/against", {gliveId:title[0],issueNo:title[1],teamNo:title[2]}, 1);
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
                                        var spfId = $(spf).attr("id").split("_")[1];
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
                                        var rqspfId = $(rqspf).attr("id").split("_")[1];
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
                                        var zjqId = $(zjq).attr("id").split("_")[1];
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
                                        var bqcId = $(bqc).attr("id").split("_")[1];
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
                                        var bfId = $($bf).attr("id").split("_")[1];
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
                    appConfig.setMayBuyData(appConfig.MAY_BUY_JCLQ_KEY, bufferData);

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

    return {init: init};
});
