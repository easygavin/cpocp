define([
    "text!../../views/jczq/against.html",
    "util/Page",
    "util/PageEvent",
    "util/AppConfig",
    "util/Util",
    "services/JczqService"
], function (template, page, pageEvent, appConfig, util, jczqService) {
    // 处理返回参数
    var canBack = 0;

    //情报id
    var gliveId = "";

    //期号.
    var issueNo = "";

    //赛事编号.
    var teamNo = "";

    // 数据存储.
    var dataStore = {};

    var init = function (data, forward) {
        canBack = forward ? 1 : 0;

        // 加载模板内容
        $("#container").empty().append($(template));

        //情报id
        if (data != null && typeof data != "undefined") {
            // 彩种
            if (typeof data.gliveId != "undefined" && $.trim(data.gliveId) != "") {
                gliveId = data.gliveId;
            }

            // 期号.
            if (typeof data.issueNo != "undefined" && $.trim(data.issueNo) != "") {
                issueNo = data.issueNo;
            }

            // 赛事编号
            if (typeof data.teamNo != "undefined" && $.trim(data.teamNo) != "") {
                teamNo = data.teamNo;
            }
        }

        // 参数设置
        var params = {};

        var tkn = appConfig.checkLogin(data);

        if ($.trim(gliveId) != "") {
            params.gliveId = gliveId;
        }

        if ($.trim(issueNo) != "") {
            params.issueNo = issueNo;
        }

        if ($.trim(teamNo) != "") {
            params.teamNo = teamNo;
        }

        if (tkn) {
            params.token = tkn;
        }

        // 初始化显示
        initQuery();

        // 绑定事件
        bindEvent();

        // 处理返回
        page.setHistoryState({url: "jczq/against", data: params},
            "jczq/against",
            "#jczq/against" + (JSON.stringify(params).length > 2 ? "?data=" + encodeURIComponent(JSON.stringify(params)) : ""),
            canBack);
    };
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
        // 刷新
        $(".refresh").on(pageEvent.touchStart, function (e) {
            pageEvent.handleTapEvent(this, this, pageEvent.activate, e);
            return true;
        });

        $(".refresh").on(pageEvent.activate, function (e) {
            // 显示遮住层
            //util.showCover();
            //util.showLoading();

            initQuery();
        });
        // 返回
        $(".tabs ul li").on(pageEvent.touchStart, function (e) {
            pageEvent.handleTapEvent(this, this, pageEvent.activate, e);
            return true;
        });

        $(".tabs ul li").on(pageEvent.activate, function (e) {
            var id = $(this).attr("id");
            //每次都清空.against-div.
            $("#against").html("");
            $(".tabs ul li").removeClass("click");
            $(this).addClass("click");
            if (id == "integral") {
                //积分
                integralShow(dataStore);
            } else if (id == "record") {
                //战绩
                recordShow(dataStore);
            } else if (id == "europeLost") {
                //欧盘
                europeLostShow(dataStore);
            } else if (id == "bigness") {
                //大小盘
                bignessShow(dataStore);
            } else {
                //默认为亚盘
                asiaShow(dataStore);
            }

        });
    };

    /**
     * 初始化,查询接口数据.
     * @param teamNo  赛事编号
     * @param issueNo 期号
     * @param gliveId 情报id
     */

    var initQuery = function () {
        //每次都清空.against-div中的内容.
        $("#against").html("");
        //选中某个选项,点击刷新时,先清除掉所有已选项,然后,默认选中亚盘。
        $(".tabs ul li").removeClass("click");
        $("#asiaPlate").addClass("click");
        if (gliveId != "" && gliveId != "undefined") {
            jczqService.getJCZQAgainstInfo( gliveId,function (data) {
                // 隐藏遮住层
                util.hideCover();
                util.hideLoading();
                if (typeof data != "undefined") {

                    if (data.statusCode == "0") {
                        dataStore = data;
                        //默认显示亚盘
                        asiaShow(dataStore);
                        teamVs(dataStore);
                    } else {
                        util.toast(data.errorMsg);
                    }
                }
            });
        }

        //测试数据..
        /*var data = '{"statusCode":0,"history":[{"jfHistory":[{"spf":"平","time":"2013-08-25","score":"1:1","hostname":"FSV法兰克福","visitname":"柏林联合","gameShortCn":"德乙"},{"spf":"负","time":"2013-03-31","score":"3:0","hostname":"FSV法兰克福","visitname":"柏林联合","gameShortCn":"德乙"},{"spf":"胜","time":"2012-10-21","score":"1:0","hostname":"柏林联合","visitname":"FSV法兰克福","gameShortCn":"德乙"},{"spf":"胜","time":"2011-12-10","score":"4:0","hostname":"柏林联","visitname":"FSV法兰克福","gameShortCn":"德乙"},{"spf":"平","time":"2011-07-15","score":"1:1","hostname":"FSV法兰克福","visitname":"柏林联","gameShortCn":"德乙"},{"spf":"胜","time":"2011-04-10","score":"2:0","hostname":"柏林联合","visitname":"FSV法兰克福","gameShortCn":"德乙"}],"visitHistory":[{"spf":"胜","time":"2014-02-15","score":"3:2","hostname":"FSV法兰克福","visitname":"特雷斯登","gameShortCn":"德乙"},{"spf":"胜","time":"2014-02-08","score":"1:2","hostname":"波鸿","visitname":"FSV法兰克福","gameShortCn":"德乙"},{"spf":"胜","time":"2014-02-01","score":"1:3","hostname":"卡尔斯鲁厄","visitname":"FSV法兰克福","gameShortCn":"友谊赛"},{"spf":"胜","time":"2014-01-29","score":"1:3","hostname":"克拉科夫","visitname":"FSV法兰克福","gameShortCn":"友谊赛"},{"spf":"胜","time":"2014-01-27","score":"1:3","hostname":"克卢日大学","visitname":"FSV法兰克福","gameShortCn":"友谊赛"},{"spf":"胜","time":"2014-01-25","score":"1:0","hostname":"FSV法兰克福","visitname":"慕尼黑1860","gameShortCn":"友谊赛"}],"hostHistory":[{"spf":"平","time":"2014-02-15","score":"1:1","hostname":"杜赛尔多夫","visitname":"柏林联合","gameShortCn":"德乙"},{"spf":"平","time":"2014-02-08","score":"0:0","hostname":"柏林联合","visitname":"特雷斯登","gameShortCn":"德乙"},{"spf":"胜","time":"2014-02-01","score":"1:0","hostname":"柏林联合","visitname":"比勒菲尔德","gameShortCn":"友谊赛"},{"spf":"平","time":"2014-01-21","score":"1:1","hostname":"柏林联合","visitname":"布加勒斯特星","gameShortCn":"友谊赛"},{"spf":"胜","time":"2014-01-16","score":"0:5","hostname":"弗赖堡","visitname":"柏林联合","gameShortCn":"友谊赛"},{"spf":"胜","time":"2013-12-21","score":"4:2","hostname":"柏林联合","visitname":"比勒菲尔德","gameShortCn":"德乙"}]}],"visitAllRank":10,"hostAllRank":6,"hostName":"柏林联合","oydx":{"europe":[{"oddsNow3":"4.30","oddsNow2":"3.40","company":"金宝博","oddsNow1":"1.90","oddsFirst1":"1.92","oddsFirst3":"3.60","oddsFirst2":"3.30"},{"oddsNow3":"4.30","oddsNow2":"3.40","company":"皇冠","oddsNow1":"1.90","oddsFirst1":"1.92","oddsFirst3":"3.60","oddsFirst2":"3.30"},{"oddsNow3":"4.00","oddsNow2":"3.40","company":"立博","oddsNow1":"1.90","oddsFirst1":"1.90","oddsFirst3":"3.75","oddsFirst2":"3.40"}],"dx":[{"oddsNow3":"0.90","oddsNow2":"2.5","company":"澳门","oddsNow1":"0.80","oddsFirst1":"0.80","oddsFirst3":"0.90","oddsFirst2":"2.5"},{"oddsNow3":"1.00","oddsNow2":"2.5","company":"皇冠","oddsNow1":"0.88","oddsFirst1":"0.90","oddsFirst3":"0.96","oddsFirst2":"2.5"},{"oddsNow3":"0.94","oddsNow2":"2.5","company":"立博","oddsNow1":"0.80","oddsFirst1":"0.80","oddsFirst3":"0.94","oddsFirst2":"2.5"},{"oddsNow3":"1.00","oddsNow2":"2.5","company":"BET365","oddsNow1":"0.85","oddsFirst1":"0.80","oddsFirst3":"1.05","oddsFirst2":"2.5"},{"oddsNow3":"1.01","oddsNow2":"2.5","company":"金宝博","oddsNow1":"0.89","oddsFirst1":"0.92","oddsFirst3":"0.98","oddsFirst2":"2.5"}],"asia":[{"oddsNow3":"0.92","oddsNow2":"0.5","company":"澳门","oddsNow1":"0.90","oddsFirst1":"0.94","oddsFirst3":"0.88","oddsFirst2":"0.5"},{"oddsNow3":"0.99","oddsNow2":"0.5","company":"皇冠","oddsNow1":"0.90","oddsFirst1":"0.95","oddsFirst3":"0.93","oddsFirst2":"0.5"},{"oddsNow3":"0.83","oddsNow2":"0.5","company":"立博","oddsNow1":"0.90","oddsFirst1":"0.90","oddsFirst3":"0.83","oddsFirst2":"0.5"},{"oddsNow3":"0.975","oddsNow2":"0.5","company":"BET365","oddsNow1":"0.875","oddsFirst1":"0.725","oddsFirst3":"1.15","oddsFirst2":"0.25"},{"oddsNow3":"1.01","oddsNow2":"0.5","company":"金宝博","oddsNow1":"0.91","oddsFirst1":"0.97","oddsFirst3":"0.95","oddsFirst2":"0.5"}]},"visitName":"FSV法兰克福","integral":{"host":{"zhu":{"matchLost":3,"ballNet":3,"ballGoal":17,"ballLost":14,"full":"主","nowScore":17,"rateWin":"50%","matchCount":10,"matchDraw":2,"ranking":8,"matchWin":5},"ke":{"matchLost":3,"ballNet":2,"ballGoal":15,"ballLost":13,"full":"客","nowScore":16,"rateWin":"36%","matchCount":11,"matchDraw":4,"ranking":7,"matchWin":4},"match":"柏林联合","all":{"matchLost":6,"ballNet":5,"ballGoal":32,"ballLost":27,"full":"总","nowScore":33,"rateWin":"42%","matchCount":21,"matchDraw":6,"ranking":6,"matchWin":9}},"visit":{"zhu":{"matchLost":3,"ballNet":1,"ballGoal":16,"ballLost":15,"full":"主","nowScore":16,"rateWin":"36%","matchCount":11,"matchDraw":4,"ranking":10,"matchWin":4},"ke":{"matchLost":5,"ballNet":-1,"ballGoal":16,"ballLost":17,"full":"客","nowScore":11,"rateWin":"30%","matchCount":10,"matchDraw":2,"ranking":13,"matchWin":3},"match":"FSV法兰克福","all":{"matchLost":8,"ballNet":0,"ballGoal":32,"ballLost":32,"full":"总","nowScore":27,"rateWin":"33%","matchCount":21,"matchDraw":6,"ranking":10,"matchWin":7}}}}'
         dataStore = JSON.parse(data);
         teamVs(dataStore);
         asiaShow(dataStore);*/
    };

    /**
     *柏林联合[6] VS FSV法[10]
     */
    var teamVs = function (data) {
        var hostName = data.hostName;
        var visitName = data.visitName;
        var hostAllRank = data.hostAllRank;
        var visitAllRank = data.visitAllRank;
        $("#teamVs").text(hostName + "[" + hostAllRank + "]" + " VS " + visitName + "[" + visitAllRank + "]");
    };

    /**
     *  积分数据显示.
     * @param data 数据
     */
    var integralShow = function (data) {
        // 积分...
        var integralStr = "<div id='integral' class='qbBox'>";
        integralStr += "<table cellpadding='0' id='host' cellspacing='0' width='100%'>";
        integralStr += "<tr>" +
            "<td colspan='11' class='c000'>" + data.integral.host.match + "</td>" +
            "</tr>";

        integralStr += "<tr>" +
            "<td></td>" +
            "<td> 赛 </td>" +
            "<td> 胜 </td>" +
            "<td> 平 </td>" +
            "<td> 负 </td>" +
            "<td> 得 </td>" +
            "<td> 失 </td>" +
            "<td> 净 </td>" +
            "<td> 积 </td>" +
            "<td> 排 </td>" +
            "<td>胜率 </td>" +
            "</tr>";

        //主队数据

        var host_all = data.integral.host.all;  //总共
        var host_home = data.integral.host.zhu; //主场
        var host_away = data.integral.host.ke; //客场
        integralStr += "<tr>" +
            "<td> 总 </td>" +
            "<td>" + host_all.matchCount + "</td>" +
            "<td>" + host_all.matchWin + "  </td>" +
            "<td>" + host_all.matchDraw + "  </td>" +
            "<td>" + host_all.matchLost + "  </td>" +
            "<td>" + host_all.ballGoal + "  </td>" +
            "<td>" + host_all.ballLost + "  </td>" +
            "<td>" + host_all.ballNet + "  </td>" +
            "<td>" + host_all.nowScore + "  </td>" +
            "<td>" + host_all.ranking + "  </td>" +
            "<td>" + host_all.rateWin + "  </td>" +
            "</tr>";

        integralStr += "<tr>" +
            "<td> 主 </td>" +
            "<td>" + host_home.matchCount + "</td>" +
            "<td>" + host_home.matchWin + " </td>" +
            "<td>" + host_home.matchDraw + "</td>" +
            "<td>" + host_home.matchLost + "</td>" +
            "<td>" + host_home.ballGoal + " </td>" +
            "<td>" + host_home.ballLost + " </td>" +
            "<td>" + host_home.ballNet + "  </td>" +
            "<td>" + host_home.nowScore + " </td>" +
            "<td>" + host_home.ranking + "  </td>" +
            "<td>" + host_home.rateWin + "  </td>" +
            "</tr>";


        integralStr += "<tr>" +
            "<td> 客 </td>" +
            "<td>" + host_away.matchCount + "</td>" +
            "<td>" + host_away.matchWin + " </td>" +
            "<td>" + host_away.matchDraw + "</td>" +
            "<td>" + host_away.matchLost + "</td>" +
            "<td>" + host_away.ballGoal + " </td>" +
            "<td>" + host_away.ballLost + " </td>" +
            "<td>" + host_away.ballNet + "  </td>" +
            "<td>" + host_away.nowScore + " </td>" +
            "<td>" + host_away.ranking + "  </td>" +
            "<td>" + host_away.rateWin + "  </td>" +
            "</tr>";
        integralStr += "</table>";

        //客队
        integralStr += "<table cellpadding='0' id='guest' cellspacing='0' width='100%'>";
        integralStr += "<tr>" +
            "<td colspan='11' class='c000'>" + data.integral.visit.match + "</td>" +
            "</tr>";

        integralStr += "<tr>" +
            "<td></td>" +
            "<td> 赛 </td>" +
            "<td> 胜 </td>" +
            "<td> 平 </td>" +
            "<td> 负 </td>" +
            "<td> 得 </td>" +
            "<td> 失 </td>" +
            "<td> 净 </td>" +
            "<td> 积 </td>" +
            "<td> 排 </td>" +
            "<td>胜率 </td>" +
            "</tr>";

        //客队数据

        var visit_all = data.integral.visit.all;  //总共
        var visit_home = data.integral.visit.zhu; //主场
        var visit_away = data.integral.visit.ke; //客场

        integralStr += "<tr>" +
            "<td> 总 </td>" +
            "<td>" + visit_all.matchCount + "</td>" +
            "<td>" + visit_all.matchWin + " </td>" +
            "<td>" + visit_all.matchDraw + "</td>" +
            "<td>" + visit_all.matchLost + "</td>" +
            "<td>" + visit_all.ballGoal + " </td>" +
            "<td>" + visit_all.ballLost + " </td>" +
            "<td>" + visit_all.ballNet + "  </td>" +
            "<td>" + visit_all.nowScore + " </td>" +
            "<td>" + visit_all.ranking + "  </td>" +
            "<td>" + visit_all.rateWin + "  </td>" +
            "</tr>";

        integralStr += "<tr>" +
            "<td> 主 </td>" +
            "<td>" + visit_home.matchCount + "</td>" +
            "<td>" + visit_home.matchWin + " </td>" +
            "<td>" + visit_home.matchDraw + "</td>" +
            "<td>" + visit_home.matchLost + "</td>" +
            "<td>" + visit_home.ballGoal + " </td>" +
            "<td>" + visit_home.ballLost + " </td>" +
            "<td>" + visit_home.ballNet + "  </td>" +
            "<td>" + visit_home.nowScore + " </td>" +
            "<td>" + visit_home.ranking + "  </td>" +
            "<td>" + visit_home.rateWin + "  </td>" +
            "</tr>";


        integralStr += "<tr>" +
            "<td> 客 </td>" +
            "<td>" + visit_away.matchCount + "</td>" +
            "<td>" + visit_away.matchWin + " </td>" +
            "<td>" + visit_away.matchDraw + "</td>" +
            "<td>" + visit_away.matchLost + "</td>" +
            "<td>" + visit_away.ballGoal + " </td>" +
            "<td>" + visit_away.ballLost + " </td>" +
            "<td>" + visit_away.ballNet + "  </td>" +
            "<td>" + visit_away.nowScore + " </td>" +
            "<td>" + visit_away.ranking + "  </td>" +
            "<td>" + visit_away.rateWin + "  </td>" +
            "</tr>";
        integralStr += "</table></div>";
        $("#against").html(integralStr);
    };

    /**
     *  战绩数据显示.
     * @param data 数据
     */
    var recordShow = function (data) {
        var $record = $("<div id='record'  class='qbBox'></div>");
        var hostName = data.hostName;   //主队名
        var visitName = data.visitName; //客队名
        var hostRecentlyClash = data.history[0].hostHistory;   //主队近期战绩
        var visitRecentlyHistory = data.history[0].visitHistory;//客队近期战绩
        var clashRecentlyHistory = data.history[0].jfHistory;   //历史交锋战绩.
        var recordStr = "<table cellpadding='0' id='host_record' cellspacing='0' width='100%'>";

        recordStr += "<thead>" +
            "<tr>" +
            "<td colspan='2'>近期战绩</td>" +
            "<td colspan='2'>" + hostName + "</td>" +
            "<td colspan='2'></td>" +
            "</tr>" +
            "</thead>";

        recordStr += "<tbody>";

        recordStr += "<tr class='c000'>" +
            "<td> 时间 </td>" +
            "<td> 赛事 </td>" +
            "<td> 主队 </td>" +
            "<td> 比分 </td>" +
            "<td> 客队 </td>" +
            "<td> 胜负</td>" +
            "</tr>";

        for (var i = 0; i < hostRecentlyClash.length; i++) {
            var hostRecentDetail = hostRecentlyClash[i];
            recordStr += "<tr>" +
                "<td>" + hostRecentDetail.time + " </td>" +
                "<td>" + hostRecentDetail.gameShortCn + "</td>" +
                "<td>" + hostRecentDetail.hostname + "</td>" +
                "<td>" + hostRecentDetail.score + " </td>" +
                "<td>" + hostRecentDetail.visitname + "</td>";

            if (hostRecentDetail.spf == "胜") {
                recordStr += "<td class='cff1010'>" + hostRecentDetail.spf + " </td>";
            } else if (hostRecentDetail.spf == "平") {
                recordStr += "<td class='c2f2fff'>" + hostRecentDetail.spf + " </td>";
            } else if (hostRecentDetail.spf == "负") {
                recordStr += "<td class='c32ff32'>" + hostRecentDetail.spf + " </td>";
            } else {
                recordStr += "<td>" + hostRecentDetail.spf + " </td>";
            }

            recordStr += "</tr>";
        }

        recordStr += "</tbody>";
        recordStr += "</table>";

        //客队近期战绩
        recordStr += "<table cellpadding='0' id='visit_record' cellspacing='0' width='100%'>";

        recordStr += "<thead>" +
            "<tr>" +
            "<td colspan='2'>近期战绩</td>" +
            "<td colspan='2'>" + visitName + "</td>" +
            "<td colspan='2'></td>" +
            "</tr>" +
            "</thead>";

        recordStr += "<tbody>";
        recordStr += "<tr class='c000'>" +
            "<td> 时间 </td>" +
            "<td> 赛事 </td>" +
            "<td> 主队 </td>" +
            "<td> 比分 </td>" +
            "<td> 客队 </td>" +
            "<td> 胜负</td>" +
            "</tr>";

        for (var y = 0; y < visitRecentlyHistory.length; y++) {
            var visitRecentDetail = visitRecentlyHistory[y];
            recordStr += "<tr>" +
                "<td>" + visitRecentDetail.time + "</td>" +
                "<td>" + visitRecentDetail.gameShortCn + "</td>" +
                "<td>" + visitRecentDetail.hostname + "</td>" +
                "<td>" + visitRecentDetail.score + "</td>" +
                "<td>" + visitRecentDetail.visitname + " </td>";

            if (visitRecentDetail.spf == "胜") {
                recordStr += "<td class='cff1010'>" + visitRecentDetail.spf + " </td>";
            } else if (visitRecentDetail.spf == "平") {
                recordStr += "<td class='c2f2fff'>" + visitRecentDetail.spf + " </td>";
            } else if (visitRecentDetail.spf == "负") {
                recordStr += "<td class='c32ff32'>" + visitRecentDetail.spf + " </td>";
            } else {
                recordStr += "<td>" + visitRecentDetail.spf + " </td>";
            }

            recordStr += "</tr>";
        }
        recordStr += "</tobody>";
        recordStr += "</table>";

        //历史交锋战绩
        recordStr += "<table cellpadding='0' id='clash_record' cellspacing='0' width='100%'>";
        recordStr += "<thead>" +
            "<tr>" +
            "<td colspan='2'>历史战绩</td>" +
            "<td colspan='4'></td>" +
            "</tr>";

        recordStr += "</thead>";

        recordStr += "<tr class='c000'>" +
            "<td> 时间 </td>" +
            "<td> 赛事 </td>" +
            "<td> 主队 </td>" +
            "<td> 比分 </td>" +
            "<td> 客队 </td>" +
            "<td> 胜负</td>" +
            "</tr>";

        for (var k = 0; k < clashRecentlyHistory.length; k++) {
            var clashRecentDetail = clashRecentlyHistory[k];
            recordStr += "<tr>" +
                "<td>" + clashRecentDetail.time + " </td>" +
                "<td>" + clashRecentDetail.gameShortCn + " </td>" +
                "<td>" + clashRecentDetail.hostname + " </td>" +
                "<td>" + clashRecentDetail.score + " </td>" +
                "<td>" + clashRecentDetail.visitname + " </td>";

            if (clashRecentDetail.spf == "胜") {
                recordStr += "<td class='cff1010'>" + clashRecentDetail.spf + " </td>";
            } else if (clashRecentDetail.spf == "平") {
                recordStr += "<td class='c2f2fff'>" + clashRecentDetail.spf + " </td>";
            } else if (clashRecentDetail.spf == "负") {
                recordStr += "<td class='c32ff32'>" + clashRecentDetail.spf + " </td>";
            } else {
                recordStr += "<td>" + clashRecentDetail.spf + " </td>";
            }
            recordStr += "</tr>";
        }

        recordStr += "</table>";

        $record.html(recordStr);
        $("#against").append($record);
    };

    /**
     * 欧赔数据显示.
     * @param data 数据.
     */
    var europeLostShow = function (data) {
        var $europe = $("<div id='europe' class='qbBox'></div>");
        var europeStr = "<table cellpadding='0' id='europeOdds' cellspacing='0' width='100%'>";
        var europeList = data.oydx.europe; //欧赔数据
        europeStr += "<colgroup>" +
            "<col width='20%'>" +
            "<col width='40%'>" +
            "</colgroup>";

        europeStr += "<thead>" +
            "<tr>" +
            "<td> 公司 </td>" +
            "<td> 即时 </td>" +
            "<td> 初盘 </td>" +
            "</tr>" +
            "</thead>";

        europeStr += "<tbody>";

        for (var y = 0; y < europeList.length; y++) {
            var europeDetail = europeList[y];
            europeStr += "<tr>" +
                "<td>" + europeDetail.company + "</td>" +
                "<td>" + europeDetail.oddsNow1 + "<i class='mlr10'>" + europeDetail.oddsNow2 + "</i>" + europeDetail.oddsNow3 + "</td>" +
                "<td>" + europeDetail.oddsFirst1 + "<i class='mlr10'>" + europeDetail.oddsFirst2 + "</i>" + europeDetail.oddsFirst3 + "</td>" +
                "</tr>";
        }
        europeStr += "</tbody>";
        europeStr += "</table>";
        $europe.html(europeStr);
        $("#against").append($europe);
    };

    /**
     * 亚盘数据显示.
     * @param data 数据
     */
    var asiaShow = function (data) {
        var $asia = $("<div id='asia' class='qbBox'></div>");
        var asiaStr = "<table cellpadding='0' id='asiaOdds' cellspacing='0' width='100%'>";
        var asiaList = data.oydx.asia; //欧赔数据

        asiaStr += "<colgroup>" +
            "<col width='20%'>" +
            "<col width='40%'>" +
            "</colgroup>";

        asiaStr += "<thead>" +
            "<tr>" +
            "<td> 公司 </td>" +
            "<td> 即时 </td>" +
            "<td> 初盘 </td>" +
            "</tr>" +
            "</thead>";

        asiaStr += "<tbody>";

        for (var z = 0; z < asiaList.length; z++) {
            var asiaDetail = asiaList[z];
            asiaStr += "<tr>" +
                "<td>" + asiaDetail.company + "</td>" +
                "<td>" + asiaDetail.oddsNow1 + "<i class='mlr10'>" + asiaDetail.oddsNow2 + "</i>" + asiaDetail.oddsNow3 + "</td>" +
                "<td>" + asiaDetail.oddsFirst1 + "<i class='mlr10'>" + asiaDetail.oddsFirst2 + "</i>" + asiaDetail.oddsFirst3 + "</td>" +
                "</tr>";
        }
        asiaStr += "</tbody>";
        asiaStr += "</table>";
        $asia.html(asiaStr);
        $("#against").append($asia);
    };

    /**
     * 大小数据显示.
     * @param data 数据
     */
    var bignessShow = function (data) {
        var $bigness = $("<div id='bigness' class='qbBox'></div>");
        var bignessStr = "<table cellpadding='0' id='europeOdds' cellspacing='0' width='100%'>";
        var bignessList = data.oydx.dx; //欧赔数据

        bignessStr += "<colgroup>" +
            "<col width='20%'>" +
            "<col width='40%'>" +
            "</colgroup>";

        bignessStr += "<thead>" +
            "<tr>" +
            "<td> 公司 </td>" +
            "<td> 即时 </td>" +
            "<td> 初盘 </td>" +
            "</tr>" +
            "</thead>";

        bignessStr += "<tbody>";

        for (var y = 0; y < bignessList.length; y++) {
            var bignessDetail = bignessList[y];
            bignessStr += "<tr>" +
                "<td>" + bignessDetail.company + "</td>" +
                "<td>" + bignessDetail.oddsNow1 + "<i class='mlr10'>" + bignessDetail.oddsNow2 + "</i>" + bignessDetail.oddsNow3 + "</td>" +
                "<td>" + bignessDetail.oddsFirst1 + "<i class='mlr10'>" + bignessDetail.oddsFirst2 + "</i>" + bignessDetail.oddsFirst3 + "</td>" +
                "</tr>";
        }
        bignessStr += "</tbody>";
        bignessStr += "</table>";
        $bigness.html(bignessStr);
        $("#against").append($bigness);
    };
    return {init: init};
});