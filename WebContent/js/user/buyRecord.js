/**
 * 购彩记录
 */
define([
    "text!../../views/user/buyRecord.html",
    "util/Page",
    "util/PageEvent",
    "util/AppConfig",
    "services/PersonService",
    "util/Util"
], function (template, page, pageEvent, appConfig, personService, util) {

    // 彩种 双色球|大乐透|十一运夺金|福彩3D|幸运赛车|竞彩足球|
    // 竞彩篮球胜负|竞彩篮球让分胜负|竞彩篮球胜分差||竞彩篮球大小分|竞彩篮球混投
    // 竞彩足球胜平负|竞彩足球让球胜平负|竞彩足球比分|竞彩足球总进球|竞彩足球半全场|竞彩足球混投|让球胜平负
    var lotteryTypeArray = "11|13|31|12|14|36|37|38|39|53|46|56|47|48|49|52|56";

    // 请求彩种列表
    var typeArr = "";

    // buyType 0: 全部, 1: 自购
    var buyType = "0";

    // 请求页码
    var requestPage = "1";

    // requestType 0: 全部，1：中奖，2：未中奖
    var requestType = "0";

    // 总页面数
    var pages = 0;

    /**
     * 初始化
     */
    var init = function (data, forward) {

        // 加载模板内容
        $("#container").empty().append($(template));

        // 彩种列表
        typeArr = data.lotteryTypeArray || lotteryTypeArray;

        // 返回后的Tab焦点与数据加载参数
        if (forward) {
            buyType = "0", requestPage = "1", requestType = "0";
        }

        // 参数设置
        var params = {};
        var tkn = appConfig.checkLogin(data);
        if (tkn) {
            params.token = tkn;
        }

        params.lotteryTypeArray = typeArr;

        // 初始化显示
        initShow(data);

        // 绑定事件
        bindEvent();

        // 处理返回
        page.setHistoryState({url:"user/buyRecord", data:params},
            "user/buyRecord",
            "#user/buyRecord" + (JSON.stringify(params).length > 2 ? "?data=" + encodeURIComponent(JSON.stringify(params)) : ""),
            forward ? 1 : 0);

        // 隐藏加载标示
        util.hideLoading();

    };

    /**
     * 初始化显示
     */
    var initShow = function (data) {

        showTitle();

        showTab();

        // 清空列表
        clearItems();

        requestPage = "1";
        // 请求数据
        getBuyRecordsList();
    };

    /**
     * 显示title信息
     */
    var showTitle = function () {
        var title = "购彩记录", prepend = "";
        switch (typeArr) {
            case "11": // 双色球
                prepend = "双色球";
                break;
            case "13": // 大乐透
                prepend = "大乐透";
                break;
            case "31": // 十一运夺金
                prepend = "十一运夺金";
                break;
            case "12": // 福彩3D
                prepend = "福彩3D";
                break;
            case "14": // 幸运赛车
                prepend = "幸运赛车";
                break;
            case "46": // 竞彩足球胜平负
            case "47": // 竞彩足球比分
            case "48": // 竞彩足球总进球
            case "49": // 竞彩足球半全场
            case "52": // 竞彩足球混投
            case "56": // 竞彩足球让球胜平负
                prepend = "竞彩足球";

                break;
            case "36": // 竞彩蓝球胜负
            case "37": // 竞彩蓝球让分胜负
            case "38": // 竞彩蓝球胜分差
            case "39": // 竞彩蓝球大小分
            case "53": // 竞彩蓝球混投
                prepend = "竞彩蓝球";
                break;
        }
        $("#title").text(prepend + title);
    };

    /**
     * Tab 显示焦点
     */
    var showTab = function () {
        if (buyType == "1") {
            // 自购
            $("#m_buy").addClass("click");
        }

        if (requestType == "1") {
            // 中奖
            $("#m_awarded").addClass("click");
        } else if (requestType == "2") {
            // 未中奖
            $("#m_notAward").addClass("click");
        }
    };

    /**
     * 获取购买记录
     */
    var getBuyRecordsList = function () {

        // 总页数重置
        pages = 0;
        if (!appConfig.checkLogin(null)) {
            // 尚未登录，弹出提示框
            util.prompt("", "您还未登录，请先登录", "登录", "取消",
                function (e) {
                    page.initPage("login", {}, 1);
                },
                function (e) {
                    // 隐藏加载图标
                    loadingShow(0);
                }
            );
            return false;
        }

        // 保存登录成功信息
        var user = appConfig.getLocalJson(appConfig.keyMap.LOCAL_USER_INFO_KEY);

        var data = {};
        // buyType 0: 全部, 1: 自购
        data.buyType = buyType;
        data.requestPage = requestPage;
        // requestType 0: 全部，1：中奖，2：未中奖
        data.requestType = requestType;
        data.lotteryTypeArray = typeArr;
        data.pagesize = "20";
        data.periodOfCheck = "90";
        data.userId = user.userId + "";
        data.userKey = user.userKey;

        // 显示加载图标
        loadingShow(1);

        personService.getBuyRecordsList(data, function (data) {
            if (typeof data != "undefined") {
                if (typeof data.statusCode != "undefined") {
                    if (data.statusCode == "0") {
                        showItems(data);
                    } else {
                        util.toast(data.errorMsg);
                    }
                } else {
                    util.toast("加载失败");
                }
            } else {
                util.toast("加载失败");
            }

            // 隐藏加载图标
            loadingShow(0);
        });
    };

    /**
     * 显示列表信息
     * @param data
     */
    var showItems = function (data) {
        pages = data.pages;
        if (parseInt(requestPage, 10) < pages) {
            $(".loadText").text("查看更多");
        } else {
            $(".loadText").text("");
        }

        for (var i = 0, len = data.recordArray.length; i < len; i++) {
            addItem(data.recordArray[i]);
        }
    };

    /**
     * 添加一项数据
     * @param item
     */
    var addItem = function (item) {
        var lotteryLogo = "";

        switch (item.lotteryType + "") {
            case "11": // 双色球
                lotteryLogo = "ssqLogo";
                break;
            case "13": // 大乐透
                lotteryLogo = "dltLogo";
                break;
            case "31": // 十一运夺金
                lotteryLogo = "djLogo";
                break;
            case "12": // 福彩3D
                lotteryLogo = "fcLogo";
                break;
            case "14": // 幸运赛车
                lotteryLogo = "xyscLogo";
                break;
            case "46": // 竞彩足球胜平负
            case "47": // 竞彩足球比分
            case "48": // 竞彩足球总进球
            case "49": // 竞彩足球半全场
            case "52": // 竞彩足球混投
            case "56": // 竞彩足球让球胜平负
                lotteryLogo = "jzLogo";
                break;
            case "36": // 竞彩蓝球胜负
            case "37": // 竞彩蓝球让分胜负
            case "38": // 竞彩蓝球胜分差
            case "39": // 竞彩蓝球大小分
            case "53": // 竞彩蓝球混投
                lotteryLogo = "jlLogo";
                break;
        }
        var $tr = $("<tr></tr>");
        $tr.append($("<td></td>").append($("<a></a>").addClass(lotteryLogo).addClass(" fl")));
        var $p1 = $("<p></p>");
        $p1.html("<i class='fr'>" + item.time + "</i>" +
            "<i class='c000 f22'>" + item.lotteryName + "-" + item.purchaseType + "</i>");

        var schemeStatus = "";
        switch (item.schemeStatus) {
            case "0":
                schemeStatus = "失败";
                break;
            case "1":
                schemeStatus = "未满员";
                break;
            case "2":
                schemeStatus = "出票中";
                break;
            case "3":
                schemeStatus = "未开奖";
                break;
            case "4":
                schemeStatus = "未中奖";
                break;
            case "5":
                schemeStatus = "已中奖";
                break;
            case "6":
                schemeStatus = "已撤单";
                break;
            case "7":
                schemeStatus = "追号中";
                break;
        }

        var status = "<i class='fr'>" + schemeStatus + "</i>";

        var payment = "<i>认购金额：<span class='red mlr5'>" + parseFloat(item.payment).toFixed(2) + "</span>元</i>";
        var $p2 = $("<p></p>");
        $p2.html(status + payment);

        var $td = $("<td class='tl fzc'></td>");
        $td.append($p1).append($p2);

        var award = "";
        if (parseInt(item.income, 10) > 0) {
            var $p3 = $("<p></p>");
            $p3.html("<i>奖金：<i class='red mlr5'>" + parseFloat(item.income).toFixed(2) + "</i>元</i>");
            $td.append($p3);
        }
        $tr.append($td);
        $tr.append($("<td></td>").append($("<a class='moreBg'> </a>").attr({"id":"more_" + item.lotteryType + "_" + item.projectId})));
        $(".kjInformation tbody").append($tr);
    };

    /**
     * 绑定事件
     */
    var bindEvent = function () {

        // 返回
        $(".back").on(pageEvent.touchStart, function (e) {
            pageEvent.handleTapEvent(this, this, pageEvent.activate, e);
            return false;
        });

        $(".back").on(pageEvent.activate, function (e) {
            offBind();
            page.goBack();
        });

        // Tab 切换
        $(".btnMenu a").on(pageEvent.touchStart, function (e) {
            pageEvent.handleTapEvent(this, this, pageEvent.activate, e);
            return true;
        });

        $(".btnMenu a").on(pageEvent.activate, function (e) {
            var $target = $(this);
            var id = $target.attr("id").split("_")[1];
            switch (id) {
                case "awarded": // 中奖
                    if ($target.hasClass("click")) {
                        // 全部
                        requestType = "0";
                        $target.removeClass("click");
                    } else {
                        // 中奖
                        requestType = "1";
                        $target.addClass("click");
                        $("#m_notAward").removeClass("click");
                    }
                    break;
                case "notAward": // 未中奖
                    if ($target.hasClass("click")) {
                        // 全部
                        requestType = "0";
                        $target.removeClass("click");
                    } else {
                        // 未中奖
                        requestType = "2";
                        $target.addClass("click");
                        $("#m_awarded").removeClass("click");
                    }
                    break;
                case "buy": // 自购
                    if ($target.hasClass("click")) {
                        // 全部
                        buyType = "0";
                        $target.removeClass("click");
                    } else {
                        // 自购
                        buyType = "1";
                        $target.addClass("click");
                    }
                    break;
            }

            // 重新拉取数据
            requestPage = "1";

            clearItems();
            getBuyRecordsList();

            return true;
        });

        $(".kjInformation").undelegate("tr", pageEvent.touchStart);
        $(".kjInformation").delegate("tr", pageEvent.touchStart, function (e) {
            pageEvent.handleTapEvent(this, this, pageEvent.activate, e);
            return true;
        });

        $(".kjInformation").undelegate("tr", pageEvent.activate);
        $(".kjInformation").delegate("tr", pageEvent.activate, function (e) {

            // 详情
            var params = $(this).find(".moreBg").attr("id").split("_");

            if (params.length == 3) {
                offBind();
                var lotteryType = params[1], requestType = "0", projectId = params[2];
                if (lotteryType == "11" || lotteryType == "12" || lotteryType == "13" || lotteryType == "14" || lotteryType == "31") {
                    // 数字彩，高频彩
                    page.initPage("digit/details", {lotteryType:lotteryType, requestType:requestType, projectId:projectId}, 1);
                } else if (lotteryType == "36" || lotteryType == "37"
                    || lotteryType == "38" || lotteryType == "39"
                    || lotteryType == "53") {
                    // 竞彩篮球
                    page.initPage("jclq/details", {lotteryType:lotteryType, requestType:requestType, projectId:projectId}, 1);
                } else if (lotteryType == "46" || lotteryType == "47" || lotteryType == "48" || lotteryType == "49" || lotteryType == "52" || lotteryType == "56") {
                    page.initPage("jczq/details", {lotteryType:lotteryType, requestType:requestType, projectId:projectId}, 1);
                }
            }
            return true;
        });

        var timer = 0;
        $(window).on("scroll", function () {
            if (!timer) {
                timer = setTimeout(function () {
                    checkScrollPosition();
                    timer = 0;
                }, 250);
            }
        });
    };

    /**
     * 清空列表
     */
    var clearItems = function () {
        $(".kjInformation tbody").empty();
    };

    /**
     * 加载图片的显示
     */
    var loadingShow = function (flag) {
        if (flag) {
            $(".loadIcon").css({"visibility":"visible"});
        } else {
            $(".loadIcon").css({"visibility":"hidden"});
        }
    };

    /**
     * 检查滚动的位置
     */
    var checkScrollPosition = function () {
        var distance = $(window).scrollTop() + $(window).height();
        if ($("#buyRecordView").height() <= distance) {
            var intRequestPage = parseInt(requestPage, 10);
            if (intRequestPage < pages) {
                requestPage = (intRequestPage + 1) + "";
                getBuyRecordsList();
            }
        }
    };

    /**
     * 解除绑定
     */
    var offBind = function () {
        $(window).off("scroll");
    };


    return {init:init};
});
