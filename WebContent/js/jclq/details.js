/**
 * 竞彩篮球方案详情
 */
define([
    "text!../../views/jclq/details.html",
    "util/Page",
    "util/PageEvent",
    "services/JclqService",
    "util/Util",
    "util/AppConfig"
], function (template, page, pageEvent, jclqService, util, appConfig) {

    // 彩种
    var lotteryType = "";

    // 请求方式
    var requestType = "";

    // 方案编号
    var projectId = "";

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
        page.setHistoryState({url:"jclq/details", data:params},
            "jclq/details",
            "#jclq/details" + (JSON.stringify(params).length > 2 ? "?data=" + encodeURIComponent(JSON.stringify(params)) : ""),
            forward ? 1 : 0);

    };

    /**
     * 初始化显示
     */
    var initShow = function (data) {
        // 获取方案详情
        getDetails();
    };

    /**
     * 获取方案详情
     */
    var getDetails = function () {
        jclqService.getProjectDetails(lotteryType, requestType, projectId, function (data) {

            // 隐藏加载标示
            util.hideLoading();
            if (typeof data != "undefined") {
                if (typeof data.statusCode != "undefined") {
                    if (data.statusCode == "0") {
                        showDetails(data);
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
                "<td>" + content + "</td>" +
                "<td>" + detail[i].score + "</td>" +
                "<td><i class='red'>" + detail[i].dan + "</i></td>" +
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
            appConfig.clearLocalData(appConfig.keyMap.MAY_BUY_JCLQ_KEY);
            page.initPage("jclq/mixed", {}, 1);
            return true;
        });
    };

    return {init:init};
});
