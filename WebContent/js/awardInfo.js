/**
 * 开奖信息
 */
define([
    "text!../views/awardInfo.html",
    "util/Page",
    "util/PageEvent",
    "services/DigitService",
    "util/AppConfig"
], function(template, page, pageEvent, digitService, appConfig){

    // 处理返回参数
    var canBack = 0;

    // 彩种 双色球|大乐透|十一运夺金
    var lotteryTypeArray = "11|13|31";

    /**
     * 初始化
     */
    var init = function(data, forward) {
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
        initShow(data);

        // 绑定事件
        bindEvent();

        // 处理返回
        page.setHistoryState({url: "awardInfo", data: params},
            "awardInfo",
            "#awardInfo" + (JSON.stringify(params).length > 2 ? "?data="+encodeURIComponent(JSON.stringify(params)) : ""),
            canBack);

    };

    /**
     * 初始化显示
     */
    var initShow = function(data) {

        // 请求数据
        getAwardInfoList();
    };

    /**
     * 获取历史开奖信息
     */
    var getAwardInfoList = function() {

        // 请求数据
        digitService.getAwardInfoList(lotteryTypeArray, function(data) {
            if (typeof data != "undefined" ) {
                if (typeof data.statusCode != "undefined") {
                    if (data.statusCode == "0") {
                        showItems(data.datas);
                    }
                }
            }
        });
    };

    /**
     * 显示列表信息
     * @param data
     */
    var showItems = function(data) {
        $(".kjInformation tbody").empty();
        for (var i = 0, len = data.length; i < len; i++) {
            addItem(data[i]);
        }
    };

    /**
     * 添加一项数据
     * @param item
     */
    var addItem = function(item) {
        var lotteryLogo = "", title = "";
        var numbers = item.lotteryNumbers.split(",");
        var reds, blues;

        switch(item.lotteryType + "") {
            case "11": // 双色球
                lotteryLogo = "ssqLogo", title = "双色球";
                if (numbers.length > 6) {
                    reds = numbers.slice(0,6);
                    blues = numbers.slice(6,7);
                }
                break;
            case "13": // 大乐透
                lotteryLogo = "dltLogo", title = "大乐透";
                if (numbers.length > 6) {
                    reds = numbers.slice(0,5);
                    blues = numbers.slice(5,7);
                }
                break;
            case "31": // 十一运夺金
                lotteryLogo = "djLogo", title = "十一运夺金";
                reds = numbers;
                break;
        }
        var $tr = $("<tr></tr>");
        $tr.append($("<td></td>").append($("<a></a>").addClass(lotteryLogo).addClass(" fl")));
        var $p1 = $("<p></p>"); $p1.html("<i class=c000>"+title+"</i><i class='mlr10'>第"+item.issueNo+"期</i>");
        var html = "";
        if (reds != null) {
            html += "<span class='red'>"+reds.join(" ")+"</span>";
        }

        if (blues != null) {
            html += "+<span class='blue'>"+blues.join(" ")+"</span>";
        }
        var $p2 = $("<p></p>");$p2.html(html);
        $tr.append($("<td class='tl'></td>").append($p1).append($p2));

        $tr.append($("<td></td>").append($("<a class='moreBg'> </a>").attr({"id": "more_"+item.lotteryType})));
        $(".kjInformation tbody").append($tr);
    };

    /**
     * 绑定事件
     */
    var bindEvent = function() {

        // 返回
        $(".back").on(pageEvent.touchStart, function(e) {
            pageEvent.handleTapEvent(this, this, pageEvent.activate, e);
            return true;
        });

        $(".back").on(pageEvent.activate, function(e) {
            if (canBack) {
                page.goBack();
            } else {
                page.initPage("home", {}, 1);
            }
            return true;
        });

		$(".kjInformation").undelegate("tr", pageEvent.touchStart);
        $(".kjInformation").delegate("tr", pageEvent.touchStart, function(e) {
            pageEvent.handleTapEvent(this, this, pageEvent.activate, e);
            return true;
        });

		$(".kjInformation").undelegate("tr", pageEvent.activate);
        $(".kjInformation").delegate("tr", pageEvent.activate, function(e) {
            // 历史开奖信息
            var lotteryType = $(this).find(".moreBg").attr("id").split("_")[1];
            if ($.trim(lotteryType) != "") {
                page.initPage("digit/history", {lottery: lotteryType}, 1);
            }
            return true;
        });
    };

    return {init:init};
});
