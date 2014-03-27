/**
 * 竞彩篮球方案详情
 */
define([
    "text!../../views/jczq/details.html",
    "util/Page",
    "util/PageEvent",
    "services/JczqService",
    "util/Util",
    "util/AppConfig"
], function (template, page, pageEvent, jczqService, util, appConfig) {

    // 彩种
    var lotteryType = "";

    // 请求方式
    var requestType = "";

    // 方案编号
    var projectId = "";

    //赛事对阵信息..

    var item = {};

    //用户信息
    var user = null;

    //map对象.保存状态信息
    var dataMap;

    //需要查询的赛事id...

    var aliveItemIds ={} ;

    var specialId  ="";
    /**
     * 初始化
     */
    var init = function (data, forward) {
        // 加载模板内容
        $("#container").empty().append($(template));

        if (data != null && typeof data != "undefined") {
            // 彩种
            if (typeof data.lotteryType != "undefined" && $.trim(data.lotteryType) != "") {
                lotteryType = data.lotteryType;
            }

            // 请求方式
            if (typeof data.requestType != "undefined" && $.trim(data.requestType) != "") {
                requestType = data.requestType;
            }

            // 方案编号
            if (typeof data.projectId != "undefined" && $.trim(data.projectId) != "") {
                projectId = data.projectId;
            }
        }

        // 参数设置
        var params = {};
        if ($.trim(lotteryType) != "") {
            params.lotteryType = lotteryType;
        }

        if ($.trim(requestType) != "") {
            params.requestType = requestType;
        }

        if ($.trim(projectId) != "") {
            params.projectId = projectId;
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
        page.setHistoryState({url: "jczq/details", data: params},
            "jczq/details",
            "#jczq/details" + (JSON.stringify(params).length > 2 ? "?data=" + encodeURIComponent(JSON.stringify(params)) : ""),
            forward ? 1 : 0);

    };

    /**
     * 初始化显示
     */
    var initShow = function (data) {

        // 获取方案详情
        getDetails();

        user = appConfig.getLocalJson(appConfig.keyMap.LOCAL_USER_INFO_KEY);

        item.userId = user.userId;
        item.userKey = user.userKey;
    };

    /**
     *查询即使比分接口,确定赛事状态..
     */
    var queryGameState = function () {
        for (var at in aliveItemIds) {
            var item = aliveItemIds[at];
            (function () {
                var specialId = at;
                jczqService.getAliveState(item, function (data) {
                    if (typeof data != "undefined") {
                        if (data.statusCode != "undefined" && data.statusCode == "0") {
                            var combine  = "#"+specialId;
                            $(combine).html(dataMap[data.datas[0].status]);
                        }
                    }
                });
            })(at, item);

        }
    };

    /**
     * 获取方案详情
     */
    var getDetails = function () {
        jczqService.getProjectDetails(lotteryType, requestType, projectId, function (data) {
            // 隐藏加载标示
            util.hideLoading();
            if (typeof data != "undefined") {
                if (typeof data.statusCode != "undefined") {
                    if (data.statusCode == "0") {
                        showDetails(data);
                        queryGameState();
                    } else if (data.statusCode == "off") {
                        // 尚未登录
                        page.initPage("login", {}, 1);
                    } else {
                        util.toast(data.errorMsg);
                    }
                }
            }
        });
    };

    /**
     * 显示详情
     * @param data
     */
    var showDetails = function (data) {
        $(".details").append($("<p></p>").text("方案编号：" + data.lotteryNo));
        $(".details").append($("<p></p>").text("发起人：" + data.createUser));
        $(".details").append($("<p></p>").text("发起时间：" + data.createDate));
        $(".details").append($("<p></p>").text("方案金额：" + data.totalAmount + "元"));
        $(".details").append($("<p></p>").text("认购金额：" + data.oneAmount + "元"));
        $(".details").append($("<p></p>").text("方案状态：" + data.projectState));
        $(".details").append($("<p></p>").text("方案奖金：" + data.bonus + (isNaN(data.bonus) ? "" : "元")));

        $(".detailsList ul").append($("<li></li>").html("<p>" + data.title + "<i class='fr'>" + data.passWay + "</i></p>"));
        $(".tzBox").text($.trim(data.title) + "投注");
        var detail = data.detail;

        var str = "<table width='100%' cellspacing='0' cellpadding='0' class='jckjInfor'>";
        str += "<colgroup>" +
            "<col width='70%'>" +
            "<col width='20%'>" +
            "<col width='10%'>" +
            "</colgroup>";

        str += "<tbody>";
        for (var i = 0, len = detail.length; i < len; i++) {
            var content = detail[i].content.replace(/{/g, '<span class="red">')
                .replace(/}/g, '</span>')
                .replace(/\n/g, '<br>');
            str += "<tr>" +
                "<td>" + content + "</td>";
            var score = detail[i].score;
            item ={};
            var gliveId = detail[i].gliveId;
            if (score == "" || score == null) {
                item.lotteryId = "";
                item.projectId = projectId;
                item.searchType = 0;
                item.matchIdArray = detail[i].gliveId;
                aliveItemIds["F"+gliveId] = item;
                str += "<td id='F" + detail[i].gliveId + "'>" + detail[i].score + "</td>";
            } else {
                str += "<td>" + detail[i].score + "</td>";
            }

            str += "<td><i class='red'>" + detail[i].dan + "</i></td>" +
                "</tr>"
        }
        str += "</tbody></table>";

        $(".detailsList ul").append($("<li></li>").append($("<p></p>").html(str)));
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
            // 删除缓存的购买数据
            appConfig.clearLocalData(appConfig.keyMap.MAY_BUY_JCZQ_KEY);
            page.initPage("jczq/mixed", {}, 1);
            return true;
        });
    };
    dataMap = {
        "0": "未开赛",
        "1": "上半场",
        "2": "中场",
        "3": "下半场",
        "-11": "待定",
        "-12": "腰斩",
        "-13": "中断",
        "-14": "推迟",
        "-1": "完场"
    };
    return {init: init};
})
;
