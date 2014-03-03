/**
 * 历史开奖信息
 */
define([
    "text!../../views/digit/history.html",
    "util/Page",
    "util/PageEvent",
    "services/DigitService",
    "util/AppConfig",
    "util/Util"
], function(template, page, pageEvent, digitService, appConfig, util){

    // 彩种
    var lottery = "";

    /**
     * 初始化
     */
    var init = function(data, forward) {
        // 加载模板内容
        $("#container").empty().append($(template));

        // 彩种
        if (data != null && typeof data != "undefined"
            && typeof data.lottery != "undefined" && $.trim(data.lottery) != "") {
            lottery = data.lottery;
        }

        // 参数设置
        var params = {};
        if (lottery != "") {
            params.lottery = lottery;
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
        page.setHistoryState({url: "digit/history", data: params}, 
        		"digit/history", 
        		"#digit/history" + (JSON.stringify(params).length > 2 ? "?data="+encodeURIComponent(JSON.stringify(params)) : ""),
        		forward ? 1 : 0);

    };

    /**
     * 初始化显示
     */
    var initShow = function(data) {

        // 标题
        showTitle();

        // 请求数据
        getHistory();
    };

    /**
     * 显示title信息
     */
    var showTitle = function() {
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
     * 获取历史开奖信息
     */
    var getHistory = function() {

        // 请求数据
        digitService.getHistoryAwardsByTypes(lottery, 20, function(data) {

            // 隐藏加载标示
            util.hideLoading();
             if (typeof data != "undefined" ) {
                 if (typeof data.statusCode != "undefined") {
                     if (data.statusCode == "0") {
                        showItems(data.data);
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
        $(".listTab tbody").empty();
        for (var i = 0, len = data.length; i < len; i++) {
            addItem(data[i]);
        }
    };

    /**
     * 添加一项数据
     * @param item
     */
    var addItem = function(item) {
        var $tr = $("<tr></tr>");
        // 期数
        $tr.append($("<td></td>").html("第"+item.issueNo+"期"));

        // 红球，蓝球
        var numbers = item.lotteryNumbers.split(",");
        var reds, blues;
        switch(lottery) {
            case "11": // 双色球
                if (numbers.length > 6) {
                    reds = numbers.slice(0,6);
                    blues = numbers.slice(6,7);
                }
                break;
            case "13": // 大乐透
                if (numbers.length > 6) {
                    reds = numbers.slice(0,5);
                    blues = numbers.slice(5,7);
                }
                break;
            case "31": // 十一运夺金
                reds = numbers;
                break;
            case "12": // 福彩3D
                reds = numbers;
                break;
            case "14": // 幸运赛车
                reds = numbers;
                break;
        }

        var html = "";
        if (reds != null) {
            html += "<span class='red'>"+reds.join(" ")+"</span>";
        }

        if (blues != null) {
            html += "+<span class='blue'>"+blues.join(" ")+"</span>";
        }
        $tr.append($("<td class='tl'></td>").html(html));

        var $a_more = "";
        if (lottery == "11" || lottery == "13" || lottery == "12") {
            $a_more = $("<a class='moreBg'> </a>").attr({"id": "more_"+item.issueNo});
        }

        $tr.append($("<td></td>").append($a_more));

        $(".listTab tbody").append($tr);
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
            page.goBack();
            return true;
        });

		$(".listTab").undelegate("tr", pageEvent.touchStart);
        $(".listTab").delegate("tr", pageEvent.touchStart, function(e) {
            pageEvent.handleTapEvent(this, this, pageEvent.activate, e);
            return true;
        });

		$(".listTab").undelegate("tr", pageEvent.activate);
        $(".listTab").delegate("tr", pageEvent.activate, function(e) {

            if (lottery == "11" || lottery == "13" || lottery == "12") {
                // 详情
                var issueNo = $(this).find(".moreBg").attr("id").split("_")[1];
                if ($.trim(issueNo) != "") {
                    page.initPage("digit/look", {lottery: lottery, issueNo: issueNo}, 1);
                }
            }
            return true;
        });
    };

    return {init:init};
});
