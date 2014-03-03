/**
 * 提款
 */

define([
    "text!../../views/user/accountDetail.html",
    "util/Page",
    "util/PageEvent",
    "util/AppConfig",
    "services/PersonService",
    "util/Util"
], function(template, page, pageEvent, appConfig, personService, util) {

    // 请求页码
    var requestPage = "1";

    // requestType 0: 全部，1：收入，2：支出
    var requestType = "0";

    // 时间段
    var periodOfCheck = "30";

    // 总页面数
    var pages = 0;

    /**
     * 初始化
     */
    var init = function(data, forward) {

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
        page.setHistoryState({url: "user/accountDetail", data: params},
            "user/accountDetail",
            "#user/accountDetail" + (JSON.stringify(params).length > 2 ? "?data=" + encodeURIComponent(JSON.stringify(params)) : ""),
            forward ? 1 : 0);

        // 隐藏加载标示
        util.hideLoading();
    };

    /**
     * 初始化显示
     */
    var initShow = function(data) {

        // 参数重置
        requestPage = "1", requestType = "0", periodOfCheck = "30";

        // 清空列表
        clearItems();

        // 请求数据
        getBuyRecordsList();
    };

    /**
     * 获取购买记录
     */
    var getBuyRecordsList = function() {

        // 总页数重置
        pages = 0;
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
        // sortType 排序方式,0 表示时间倒序默认为0;1 表示金额倒序
        data.sortType = "0";
        data.requestPage = requestPage;
        // requestType 0: 全部，1：中奖，2：未中奖
        data.requestType = requestType;
        data.pagesize = "20";
        data.periodOfCheck = periodOfCheck;
        data.userId = user.userId + "";
        data.userKey = user.userKey;

        // 显示加载图标
        loadingShow(1);

        personService.getAccountDetailList(data, function(data) {
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
        var typeTxt = "", typeClass = "";

        switch(item.incomeOrExpenses + "") {
            case "0": // 收入
                typeTxt = "收入";
                typeClass = "srBox";
                break;
            case "1": // 支出
                typeTxt = "支出";
                typeClass = "zcBox";
                break;
        }
        var $tr = $("<tr></tr>");
        $tr.append($("<td></td>").html("<span class='"+typeClass+"'>"+typeTxt+"</span>"));
        var html = "<p>时间："+item.time+"</p>" +
            "<p>类型："+item.exchangeType+"</p>" +
            "<p>编号："+item.lotteryNo+"</p>" +
            "<p>金额：<i class='red mlr5'>"+parseFloat(item.amount).toFixed(2)+"</i>元</p>";
        $tr.append($("<td class='tl fzc'></td>").html(html));

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
                case "out": // 支出
                    if ($target.hasClass("click")) {
                        // 全部
                        requestType = "0";
                        $target.removeClass("click");
                    } else {
                        // 中奖
                        requestType = "2";
                        $target.addClass("click");
                        $("#m_in").removeClass("click");
                    }
                    break;
                case "in": // 收入
                    if ($target.hasClass("click")) {
                        // 全部
                        requestType = "0";
                        $target.removeClass("click");
                    } else {
                        // 未中奖
                        requestType = "1";
                        $target.addClass("click");
                        $("#m_out").removeClass("click");
                    }
                    break;
                case "day": // 本日
                    if ($target.hasClass("click")) {
                        // 30 天
                        periodOfCheck = "30";
                        $target.removeClass("click");
                    } else {
                        // 本日
                        periodOfCheck = "1";
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
        if ($("#accountDetailView").height() <= distance) {
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