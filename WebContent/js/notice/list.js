/**
 * 活动公告列表
 */
define([
    "text!../../views/notice/list.html",
    "util/Page",
    "util/PageEvent",
    "services/NoticeService",
    "util/AppConfig"
], function(template, page, pageEvent, noticeService, appConfig){

    // 处理返回参数
    var canBack = 0;

    // 读过的ID
    var readIDs = {};

    // 待写的ID
    var writeIDs = {};
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
        page.setHistoryState({url: "notice/list", data: params},
        		"notice/list",
        		"#notice/list" + (JSON.stringify(params).length > 2 ? "?data="+encodeURIComponent(JSON.stringify(params)) : ""),
                canBack);

    };

    /**
     * 初始化显示
     */
    var initShow = function(data) {

        readIDs = appConfig.getNoticeReadIDs();

        // 请求数据
        getNoticeList();
    };

    /**
     * 获取公告列表
     */
    var getNoticeList = function() {

        // 请求数据
        noticeService.getNoticeList(function(data) {
             if (typeof data != "undefined" ) {
                 if (typeof data.statusCode != "undefined") {
                     if (data.statusCode == "0") {
                        showItems(data.noticeArray);
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

        if (readIDs != null && typeof readIDs != "undefined"
            && readIDs[item.noticeId] != null && typeof readIDs[item.noticeId] != "undefined") {
            // 重置需要写入的ID集合
            writeIDs[item.noticeId] = "1";
            $tr.append($("<td></td>").append($("<span></span>")));
        } else {
            $tr.append($("<td></td>").append($("<span class='read'></span>")));
        }

        // 标题
        $tr.append($("<td class='tl'></td>").html(item.title));

        var $a_more = $("<a class='moreBg'> </a>").attr({"id": "more_"+item.noticeId});

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
            if (canBack) {
                page.goBack();
            } else {
                page.initPage("home", {}, 1);
            }
            return true;
        });

		$(".listTab").undelegate("tr", pageEvent.touchStart);
        $(".listTab").delegate("tr", pageEvent.touchStart, function(e) {
            pageEvent.handleTapEvent(this, this, pageEvent.activate, e);
            return true;
        });

		$(".listTab").undelegate("tr", pageEvent.activate);
        $(".listTab").delegate("tr", pageEvent.activate, function(e) {

            // 详情
            var noticeId = $(this).find(".moreBg").attr("id").split("_")[1];
            if ($.trim(noticeId) != "") {
                writeIDs[noticeId] = "1";
                appConfig.setNoticeReadIDs(writeIDs);
                page.initPage("notice/detail", {noticeId: noticeId}, 1);
            }

            return true;
        });
    };

    return {init:init};
});
