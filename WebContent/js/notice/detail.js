/**
 * 公告详情
 */
define([
    "text!../../views/notice/detail.html",
    "util/Page",
    "util/PageEvent",
    "services/NoticeService",
    "util/AppConfig"
], function(template, page, pageEvent, noticeService, appConfig){

    // 公告ID
    var noticeId = "";

    // 返回数据
    var result = null;

    /**
     * 初始化
     */
    var init = function(data, forward) {
        // 加载模板内容
        $("#container").empty().append($(template));

        // 公告ID
        if (data != null && typeof data != "undefined"
            && typeof data.noticeId != "undefined" && $.trim(data.noticeId) != "") {
            noticeId = data.noticeId;
        }

        // 参数设置
        var params = {};
        if (noticeId != "") {
            params.noticeId = noticeId;
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
        page.setHistoryState({url: "notice/detail", data: params},
        		"notice/detail",
        		"#notice/detail" + (JSON.stringify(params).length > 2 ? "?data="+encodeURIComponent(JSON.stringify(params)) : ""),
        		forward ? 1 : 0);

    };

    /**
     * 初始化显示
     */
    var initShow = function(data) {

        // 请求数据
        getNoticeDetail();
    };

    /**
     * 获取公告详情
     */
    var getNoticeDetail = function() {

        // 请求数据
        noticeService.getNoticeDetail(noticeId, function(data) {
             if (typeof data != "undefined" ) {
                 if (typeof data.statusCode != "undefined") {
                     if (data.statusCode == "0") {
                        showDetail(data);
                     }
                 }
             }
         });
    };

    /**
     * 显示列表信息
     * @param data
     */
    var showDetail = function(data) {

        result = data;
        // 标题
        $("#noticeTitle").text(result.title);

        var $mBox = $(".lBox");

        // 图片
        if ($.trim(result.imgUrl) != "") {
            console.log(noticeService.getImageServerUrl()+result.imgUrl);
            $mBox.append($("<img width='95%' style='width: 95%;display: block;margin: 1em auto;' " +
                "src='"+noticeService.getImageServerUrl()+result.imgUrl+"'/>"));
        }

        // 内容
        if ($.trim(result.contentUrl) != "") {
            var contentUrl = noticeService.getImageServerUrl() + result.contentUrl;
            $mBox.append($("<div style='width: 98%;margin:0 auto;'></div>").append($("<iframe id='noticeFrame' scrolling='no' frameborder='0' width='100%' height='0' style='padding: 0;margin: 0;height:1500px;'" +
                " src="+contentUrl+"></iframe>")));
        }

        // 类型
        if (result.type == "-1") { // 不显示立即参与
            // 普通活动
            $(".footer").hide();
        }

    };

    /**
     * 绑定事件
     */
    var bindEvent = function() {

		$(window).off("message");
        $(window).on("message", function(e) {
            if (e.origin === "http://gj.caipiao123.com.cn") {
                var height = parseInt(e.data, 10) + 40;
                $("#noticeFrame").css({"height": height + "px"});
            }
            return true;
        });

        // 返回
        $(".back").on(pageEvent.touchStart, function(e) {
            pageEvent.handleTapEvent(this, this, pageEvent.activate, e);
            return true;
        });

        $(".back").on(pageEvent.activate, function(e) {
            page.goBack();
            return true;
        });

        // 立即参与
        $(".tzBox").on(pageEvent.touchStart, function(e) {
            pageEvent.handleTapEvent(this, this, pageEvent.activate, e);
            return true;
        });

        $(".tzBox").on(pageEvent.activate, function(e) {
            switch (result.type) {
                case "0": // 普通活动
                    switch (result.lotteryId) {
                        case "500": // 注册页
                            page.initPage("register", {}, 1);
                            break;
                        case "501": // 反馈页
                            break;
                        case "502": // 设置页
                            break;
                    }
                    break;
                case "1": // 充值
                    // 跳到充值页面

                    break;
                case "2": // 购彩
                    switch (result.lotteryId) {
                        case "11": // 双色球

                            // 删除缓存的购买数据
                            appConfig.clearMayBuyData(appConfig.MAY_BUY_RED_BLUE_KEY);
                            page.initPage("redblue/ball", {}, 1);
                            break;
                        case "13": // 大乐透

                            // 删除缓存的购买数据
                            appConfig.clearMayBuyData(appConfig.MAY_BUY_HAPPY_KEY);
                            page.initPage("happy/ball", {}, 1);
                            break;
                        case "31": // 十一运夺金

                            // 删除缓存的购买数据
                            appConfig.clearMayBuyData(appConfig.MAY_BUY_LUCK_KEY);
                            page.initPage("luck/ball", {}, 1);
                            break;
                    }
                    break;
                case "3": // 网页跳转
                    window.location.href = result.openUrl;
                    break;
            }
            return true;
        });

    };

    return {init:init};
});
