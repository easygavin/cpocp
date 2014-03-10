/**
 * 开奖详情查看
 */
define([
    "text!../../views/digit/look.html",
    "util/Page",
    "util/PageEvent",
    "services/DigitService",
    "util/AppConfig",
    "util/Util"
], function (template, page, pageEvent, digitService, appConfig, util) {

    // 彩种
    var lottery = "";

    // 期号
    var issueNo = "";

    /**
     * 初始化
     */
    var init = function (data, forward) {
        // 加载模板内容
        $("#container").empty().append($(template));

        if (data != null && typeof data != "undefined") {
            // 彩种
            if (typeof data.lottery != "undefined" && $.trim(data.lottery) != "") {
                lottery = data.lottery;
            }
            // 期号
            if (typeof data.issueNo != "undefined" && $.trim(data.issueNo) != "") {
                issueNo = data.issueNo;
            }
        }

        // 参数设置
        var params = {};
        if (lottery != "") {
            params.lottery = lottery;
        }

        if (issueNo != "") {
            params.issueNo = issueNo;
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
        page.setHistoryState({url:"digit/look", data:params},
            "digit/look",
            "#digit/look" + (JSON.stringify(params).length > 2 ? "?data=" + encodeURIComponent(JSON.stringify(params)) : ""),
            forward ? 1 : 0);

    };

    /**
     * 初始化显示
     */
    var initShow = function (data) {

        // 标题
        showTitle();

        // 请求数据
        getDetails();
    };

    /**
     * 显示title信息
     */
    var showTitle = function () {
        var title = "";
        switch (lottery) {
            case "11": // 双色球
                title = "双色球";
                break;
            case "13": // 大乐透
                title = "大乐透";
                break;
            case "31": // 十一运夺金
                title = "十一运夺金";
                break;
            case "12": // 福彩3D
                title = "福彩3D";
                break;
            case "14": // 幸运赛车
                title = "幸运赛车";
                break;
        }
        $("#title").text(title + "开奖信息");
    };

    /**
     * 获取详细信息
     */
    var getDetails = function () {
        digitService.getDigitDetailsByIssue(lottery, issueNo, function (data) {

            // 隐藏加载标示
            util.hideLoading();
            if (typeof data != "undefined") {
                if (typeof data.statusCode != "undefined") {
                    if (data.statusCode == "0") {
                        showDetails(data);
                    }
                }
            }
        });
    };

    /**
     * 显示开奖详情
     * @param data
     */
    var showDetails = function (data) {
        var issueTitle = "", time = "", numbers, reds = new Array(), blues = new Array(),
            betAmount, bonusAmount;
        switch (data.lotteryType) {
            case "11": // 双色球
                issueTitle = "双色球";

                numbers = data.lotteryNumber.split(",");
                if (numbers.length > 6) {
                    reds = numbers.slice(0, 6);
                    blues = numbers.slice(6, 7);
                }

                for (var i = 0, len = data.winDatas.length; i < len; i++) {
                    switch (data.winDatas[i].level) {
                        case "1":
                            data.winDatas[i].level = "一等奖";
                            break;
                        case "2":
                            data.winDatas[i].level = "二等奖";
                            break;
                        case "3":
                            data.winDatas[i].level = "三等奖";
                            break;
                        case "4":
                            data.winDatas[i].level = "四等奖";
                            break;
                        case "5":
                            data.winDatas[i].level = "五等奖";
                            break;
                        case "6":
                            data.winDatas[i].level = "六等奖";
                            break;

                    }
                }
                break;
            case "13": // 大乐透
                issueTitle = "大乐透";

                numbers = data.lotteryNumber.split(",");
                if (numbers.length > 6) {
                    reds = numbers.slice(0, 5);
                    blues = numbers.slice(5, 7);
                }

                for (var i = 0, len = data.winDatas.length; i < len; i++) {
                    switch (data.winDatas[i].level) {
                        case "1":
                            data.winDatas[i].level = "一等奖基本";
                            break;
                        case "2":
                            data.winDatas[i].level = "一等奖追加";
                            break;
                        case "3":
                            data.winDatas[i].level = "二等奖基本";
                            break;
                        case "4":
                            data.winDatas[i].level = "二等奖追加";
                            break;
                        case "5":
                            data.winDatas[i].level = "三等奖基本";
                            break;
                        case "6":
                            data.winDatas[i].level = "三等奖追加";
                            break;
                        case "7":
                            data.winDatas[i].level = "四等奖基本";
                            break;
                        case "8":
                            data.winDatas[i].level = "四等奖追加";
                            break;
                        case "9":
                            data.winDatas[i].level = "五等奖基本";
                            break;
                        case "10":
                            data.winDatas[i].level = "五等奖追加";
                            break;
                        case "11":
                            data.winDatas[i].level = "六等奖基本";
                            break;
                        case "12":
                            data.winDatas[i].level = "六等奖追加";
                            break;
                        case "13":
                            data.winDatas[i].level = "七等奖基本";
                            break;
                        case "14":
                            data.winDatas[i].level = "七等奖追加";
                            break;
                        case "15":
                            data.winDatas[i].level = "八等奖基本";
                            break;
                        case "16":
                            data.winDatas[i].level = "12选2";
                            break;
                    }
                }
                break;
            case "12": // 福彩3D
                issueTitle = "福彩3D";

                numbers = data.lotteryNumber.split(",");
                reds = numbers;

                for (var i = 0, len = data.winDatas.length; i < len; i++) {
                    switch (data.winDatas[i].level) {
                        case "1":
                            data.winDatas[i].level = "直选";
                            break;
                        case "2":
                            data.winDatas[i].level = "组选3";
                            break;
                        case "3":
                            data.winDatas[i].level = "组选6";
                            break;
                    }
                }
                break;
        }
        
        time = data.openDate;
        betAmount = data.betAmount;
        bonusAmount = data.bonusAmount;

        // 期数
        $(".details").append($("<p></p>").html(issueTitle + "第" + issueNo + "期"));
        // 开奖时间
        $(".details").append($("<p></p>").html("开奖时间 : " + time));
        // 开奖球
        // 红球，蓝球
        var $balls = $("<div></div>"), $ul = $("<ul class='look'></ul>");

        for (var i = 0, len = reds.length; i < len; i++) {
            $ul.append("<li><div class='num click'>" + reds[i] + "</div></li>");
        }

        for (var i = 0, len = blues.length; i < len; i++) {
            $ul.append("<li><div class='num blue'>" + blues[i] + "</div></li>");
        }

        $balls.append($ul);
        $(".details").append($balls);

        $(".details").append($("<p></p>").html("本期销量 : " + betAmount));
        $(".details").append($("<p></p>").html("奖池滚存 : " + bonusAmount));

        for (var i = 0, len = data.winDatas.length; i < len; i++) {
            $(".zjNum tbody").append($("<tr></tr>").html("<td>" + data.winDatas[i].level + "</td>" +
                "<td>" + data.winDatas[i].count + "</td>" +
                "<td>" + data.winDatas[i].bonus + "</td>"));
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

        // 去投注
        $(".tzBox").on(pageEvent.touchStart, function (e) {
            pageEvent.handleTapEvent(this, this, pageEvent.activate, e);
            return true;
        });

        $(".tzBox").on(pageEvent.activate, function (e) {
            switch (lottery) {
                case "11": // 双色球
                    page.initPage("redblue/ball", {}, 1);
                    break;
                case "13": // 大乐透
                    page.initPage("happy/ball", {}, 1);
                    break;
                case "31": // 十一运夺金
                    page.initPage("luck/ball", {}, 1);
                    break;
                case "12": // 福彩3D
                    page.initPage("3d/ball", {}, 1);
                    break;
                case "14": // 幸运赛车
                    page.initPage("racing/ball", {}, 1);
                    break;
            }
            return true;
        });

    };

    return {init:init};
});
