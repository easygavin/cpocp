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
], function(template, page, pageEvent, appConfig, personService, util) {

    // 彩种 双色球|大乐透|十一运夺金
    var lotteryTypeArray = "11|13|31";

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
    var init = function(data, forward) {

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
        page.setHistoryState({url: "user/buyRecord", data: params},
            "user/buyRecord",
            "#user/buyRecord" + (JSON.stringify(params).length > 2 ? "?data=" + encodeURIComponent(JSON.stringify(params)) : ""),
            forward ? 1 : 0);

    };

    /**
     * 初始化显示
     */
    var initShow = function(data) {

        showTitle();

        showTab();

        // 清空列表
        clearItems();

        // 请求数据
        getBuyRecordsList();
    };

    /**
     * 显示title信息
     */
    var showTitle = function() {
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
        }
        $("#title").text(prepend + title);
    };

    /**
     * Tab 显示焦点
     */
    var showTab = function() {
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
    var getBuyRecordsList = function() {

        // 总页数重置
        pages = 0, requestPage = "1";
        if (!appConfig.checkLogin(null)) {
            // 尚未登录，弹出提示框
            util.prompt("", "您还未登录，请先登录", "登录", "取消",
                function(e) {
                    page.initPage("login", {}, 1);
                },
                function(e) {

                }
            );
            return false;
        }

        // 保存登录成功信息
        var user = appConfig.getLocalUserInfo();

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

        personService.getBuyRecordsList(data, function(data) {
            if (typeof data != "undefined" ) {
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
    var showItems = function(data) {
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
    var addItem = function(item) {
        var lotteryLogo = "";

        switch(item.lotteryType + "") {
            case "11": // 双色球
                lotteryLogo = "ssqLogo";
                break;
            case "13": // 大乐透
                lotteryLogo = "dltLogo";
                break;
            case "31": // 十一运夺金
                lotteryLogo = "djLogo";
                break;
        }
        var $tr = $("<tr></tr>");
        $tr.append($("<td></td>").append($("<a></a>").addClass(lotteryLogo).addClass(" fl")));
        var $p1 = $("<p></p>"); $p1.html("<i class='fr'>"+item.time+"</i>" +
            "<i class='c000 f22'>"+item.lotteryName+"-"+item.purchaseType+"</i>");
        var award = "";
        if (parseInt(item.income, 10) > 0) {
            award = "<i class='fr'>奖金：<i class='red mlr5'>"+parseFloat(item.income).toFixed(2)+"</i>元</i>";
        } else {
            award = "<i class='fr'>"+item.incomeDetail+"</i>";
        }

        var payment = "<i>认购金额：<span class='red mlr5'>"+parseFloat(item.payment).toFixed(2)+"</span>元</i>";
        var $p2 = $("<p></p>");$p2.html(award + payment);
        $tr.append($("<td class='tl fzc'></td>").append($p1).append($p2));

        $tr.append($("<td></td>").append($("<a class='moreBg'> </a>").attr({"id": "more_"+item.lotteryType+"_"+item.projectId})));
        $(".kjInformation tbody").append($tr);
    };

    /**
     * 绑定事件
     */
    var bindEvent = function() {

        // 返回
        $(".back").on(pageEvent.touchStart, function(e) {
            pageEvent.handleTapEvent(this, this, pageEvent.activate, e);
            return false;
        });

        $(".back").on(pageEvent.activate, function(e) {
            offBind();
            page.goBack();
        });

        // Tab 切换
        $(".btnMenu a").on(pageEvent.touchStart, function(e) {
            pageEvent.handleTapEvent(this, this, pageEvent.activate, e);
            return true;
        });

        $(".btnMenu a").on(pageEvent.activate, function(e) {
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
        $(".kjInformation").delegate("tr", pageEvent.touchStart, function(e) {
            pageEvent.handleTapEvent(this, this, pageEvent.activate, e);
            return true;
        });

		$(".kjInformation").undelegate("tr", pageEvent.activate);
        $(".kjInformation").delegate("tr", pageEvent.activate, function(e) {

            // 详情
            var params = $(this).find(".moreBg").attr("id").split("_");
            if (params.length == 3) {
                offBind();
                page.initPage("digit/details", {lotteryType: params[1], requestType: "0", projectId: params[2]}, 1);
            }

            return true;
        });

        var timer = 0;
        $(window).on("scroll", function() {
            if (!timer) {
                timer = setTimeout(function() {
                    checkScrollPosition();
                    timer = 0;
                }, 250);
            }
        });
    };

    /**
     * 清空列表
     */
    var clearItems = function() {
        $(".kjInformation tbody").empty();
    };

    /**
     * 加载图片的显示
     */
    var loadingShow = function(flag) {
        if (flag) {
            $(".loadIcon").css({"visibility": "visible"});
        } else {
            $(".loadIcon").css({"visibility": "hidden"});
        }
    };

    /**
     * 检查滚动的位置
     */
    var checkScrollPosition = function() {
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
    var offBind = function() {
        $(window).off("scroll");
    };


    return {init:init};
});
