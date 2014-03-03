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
], function(template, page, pageEvent, jczqService, util, appConfig){

    // 彩种
    var lotteryType = "";

    // 请求方式
    var requestType = "";

    // 方案编号
    var projectId = "";

    /**
     * 初始化
     */
    var init = function(data, forward) {
        // 加载模板内容
        $("#container").empty().append($(template));

        if (data != null && typeof data != "undefined"){
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
        		"#jczq/details" + (JSON.stringify(params).length > 2 ? "?data=" + encodeURIComponent(JSON.stringify(params)) : "") ,
        		forward ? 1 : 0);

    };

    /**
     * 初始化显示
     */
    var initShow = function(data) {
        // 获取方案详情
        getDetails();
    };

    /**
     * 获取方案详情
     */
    var getDetails = function() {
        jczqService.getProjectDetails(lotteryType, requestType, projectId, function(data) {

            // 隐藏加载标示
            util.hideLoading();
            if (typeof data != "undefined" ) {
                if (typeof data.statusCode != "undefined") {
                    if (data.statusCode == "0") {
                        showDetails(data);
                    } else if(data.statusCode == "off") {
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
    var showDetails = function(data) {

        $(".details").append($("<p></p>").text("方案编号："+data.lotteryNo));
        $(".details").append($("<p></p>").text("  发起人："+data.createUser));
        $(".details").append($("<p></p>").text("发起时间："+data.createDate));
        $(".details").append($("<p></p>").text("方案金额："+data.totalAmount));
        $(".details").append($("<p></p>").text("认购金额："+data.oneAmount));
        $(".details").append($("<p></p>").text("方案状态："+data.projectState));
        $(".details").append($("<p></p>").text("方案奖金："+data.bonus));

        $(".detailsList ul").append($("<li></li>").html("<p>"+data.title+"<i class='fr'>"+data.passWay+"</i></p>"));
        $(".tzBox").text($.trim(data.title)+"投注");
        var detail = data.detail;

        var str = "<table width='100%' cellspacing='0' cellpadding='0' class='kjInformation'>";
        str += "<colgroup>" +
            "<col width='60%'>" +
            "<col width='20%'>" +
            "<col width='20%'>" +
            "</colgroup>" +
            "<thead>" +
            "<tr>" +
            "<td>对阵</td>" +
            "<td>比分</td>" +
            "<td>&nbsp;</td>" +
            "</tr>" +
            "</thead>";
        str += "<tbody>";
        for (var i = 0, len = detail.length; i < len; i++) {
            str += "<tr>" +
                "<td>"+detail[i].content+"</td>" +
                "<td>"+detail[i].score+"</td>" +
                "<td><i class='red'>"+detail[i].dan+"</i></td>" +
                "</tr>"
        }
        str += "</tbody></table>";

        $(".detailsList ul").append($("<li></li>").html("<p>"+str+"</p>"));
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

        // 去投注
        $(".tzBox").on(pageEvent.touchStart, function(e) {
            pageEvent.handleTapEvent(this, this, pageEvent.activate, e);
            return true;
        });

        $(".tzBox").on(pageEvent.activate, function(e) {
            // 删除缓存的购买数据
            appConfig.clearMayBuyData(appConfig.MAY_BUY_JCZQ_KEY);
            page.initPage("jczq/mixed", {}, 1);
            return true;
        });
    };

    return {init:init};
});
