/**
 * 方案详情
 */
define([
    "text!../../views/digit/details.html",
    "util/Page",
	"util/PageEvent",
    "services/DigitService",
    "util/Util",
    "util/AppConfig"
], function(template, page, pageEvent, digitService, util, appConfig){

    // 彩种
    var lotteryType = "";

    // 请求方式
    var requestType = "";

    // 方案编号
    var projectId = "";

    // 有无追期
    var hasWithdraw = 0;

    // 追期列表
    var allIssue = [];

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
        page.setHistoryState({url: "digit/details", data: params},
        		"digit/details", 
        		"#digit/details" + (JSON.stringify(params).length > 2 ? "?data=" + encodeURIComponent(JSON.stringify(params)) : "") ,
        		forward ? 1 : 0);

    };

    /**
     * 初始化显示
     */
    var initShow = function(data) {
        hasWithdraw = 0, allIssue = [];
        // 获取方案详情
        getDetails();
    };

    /**
     * 获取方案详情
     */
    var getDetails = function() {
        digitService.getProjectDetails(lotteryType, requestType, projectId, function(data) {
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
     * 获取方案详情
     */
    var getAllIssue = function() {
        util.showLoading();
        digitService.getProjectAllIssue(lotteryType, projectId, function(data) {
            util.hideLoading();
            if (typeof data != "undefined" ) {
                if (typeof data.statusCode != "undefined") {
                    if (data.statusCode == "0") {
                        allIssue = data.projectIssues;
                        showAllIssue();
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
        $(".details").append($("<p></p>").text("发起人："+data.createUser));
        $(".details").append($("<p></p>").text("发起时间："+data.createDate));
        $(".details").append($("<p></p>").text("方案金额："+data.totalAmount));
        $(".details").append($("<p></p>").text("认购金额："+data.oneAmount));
        $(".details").append($("<p></p>").text("方案状态："+data.projectState));
        $(".details").append($("<p></p>").text("方案奖金："+data.bonus));

        var isWithdraw = 0, // 可追期数
            past = 0, // 已追期数
            witdraw = 0; // 撤单期数

        if (data.isWithdraw != null && typeof data.isWithdraw != "undefined"
            && $.trim(data.isWithdraw) != "") {
            isWithdraw = parseInt(data.isWithdraw, 10);
        }

        if (data.past != null && typeof data.past != "undefined"
            && $.trim(data.past) != "") {
            past = parseInt(data.past, 10);
        }

        if (data.witdraw != null && typeof data.witdraw != "undefined"
            && $.trim(data.witdraw) != "") {
            witdraw = parseInt(data.witdraw, 10);
        }

        hasWithdraw = isWithdraw + past + witdraw;

        var title = data.title.replace('自购','&nbsp;&nbsp;').replace('追号','期可追');
        if (hasWithdraw > 1) {
            $(".detailsList ul").append($("<li></li>").html("<p><i id='pullBtn' class='fr sj sjup'></i>"+title+"</p>"));
            $(".detailsList ul").append($("<li id='allIssueList' class='hidden'></li>"));
        } else {
            $(".detailsList ul").append($("<li></li>").html("<p>"+title+"</p>"));
        }


        var detail = data.detail;

        var detail = detail.replace(/{/g,'<span class="red">')
            .replace(/}/g,'</span>')
            .replace(/#/g,'<br>');

        var openNumbers = "";
        if ($.trim(data.openNumber) != "") {
            var splitStr = data.openNumber.split("+");
            openNumbers += '<span class="red">'+splitStr[0]+'</span>';
            if (splitStr.length > 1) {
                openNumbers += '<span class="blue">|'+splitStr[1]+'</span>';
            }
        }
        if ($.trim(detail) != "") {
            $(".detailsList ul").append($("<li></li>").html("<p>"+detail+"</p>"));
        }

        if ($.trim(openNumbers) != "") {
            $(".detailsList ul").append($("<li class='czInfoS'></li>").html("<p>"+data.issueNo+"期开奖号码:"+openNumbers+"</p>"));
        }

    };

    /**
     * 显示追期列表
     * @param data
     */
    var showAllIssue = function() {
        var $table = $("<table cellpadding='0' cellspacing='0' width='100%' class='detailTab'></table>");

        for (var i = 0, len = allIssue.length; i < len; i++) {
            var $tr = $("<tr></tr>");
            var $td1 = $("<td></td>").html(allIssue[i].issueNo + "期," + allIssue[i].proBets + "注," + allIssue[i].proMul + "倍");
            var $td2 = $("<td></td>").html("<span class='red'>¥" + parseFloat(allIssue[i].oneAmount).toFixed(1) + "</span>");
            var $td3 = $("<td></td>").html(allIssue[i].status);

            $tr.append($td1).append($td2).append($td3);
            $table.append($tr);
        }

        $("#allIssueList").append($table).show();
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

        // 下拉图标
        $(".detailsList").undelegate("#pullBtn", pageEvent.click);
        $(".detailsList").delegate("#pullBtn", pageEvent.click, function(e) {
            if ($(this).hasClass("sjup")) {
                $(this).removeClass("sjup");
                if (allIssue != null && typeof allIssue != "undefined"
                    && allIssue.length) {
                    $("#allIssueList").show();
                } else {
                    getAllIssue();
                }
            } else {
                $(this).addClass("sjup");
                $("#allIssueList").hide();
            }
        });

        // 复活追号
        $(".tzBox").on(pageEvent.touchStart, function(e) {
            pageEvent.handleTapEvent(this, this, pageEvent.activate, e);
            return true;
        });

        $(".tzBox").on(pageEvent.activate, function(e) {
            if ($.trim(projectId) == "") {
                util.toast("方案无效");
                return false;
            }
            util.prompt(
                "",
                "以此选号方案再次购买当期彩种？",
                "确定",
                "取消",
                function(e) {
                    // 复活请求
                    digitService.addBuyDigit(lotteryType, projectId + "", function(data) {
                        if (typeof data != "undefined" ) {
                            if (typeof data.statusCode != "undefined") {
                                if (data.statusCode == "0") {
                                    util.dialog(
                                        "",
                                        "复活追号成功，您的账号余额为" + data.userBalance + "元",
                                        "确定",
                                        function(e) {}
                                    );
                                } else if(data.statusCode == "off") {
                                    // 尚未登录
                                    page.initPage("login", {}, 1);
                                } else {
                                    util.toast(data.errorMsg);
                                }
                            }
                        }
                    });
                },
                function(e) {}
            );
            return true;
        });
    };

    return {init:init};
});
