/**
 * 首页
 */
define([
    "text!../views/home.html",
    "util/Page",
	"util/PageEvent",
    "util/AppConfig",
    "util/Util",
    "services/NoticeService",
    "services/AccountService",
    "util/Md5",
    "util/Slider"
], function(template, page, pageEvent, appConfig, util, noticeService, accountService) {

    // 读过的ID
    var readIDs = {};

    // 待写的ID
    var writeIDs = {};

    // 过滤过的公告列表
    var notices = [];

    // 图片滑动控件
    var slider = null;

    // 是否登录
    var hasLogin = false;

    // 公告图片轮播定时器
    var noticeTimer = null;
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
            hasLogin = true;
            params.token = tkn;
        } else {
            hasLogin = false;
        }

        // 初始化显示
        initShow();

        // 绑定事件
        bindEvent();

        // 处理返回
        page.setHistoryState({url: "home", data: params},
        		"home", 
        		"#home" + (JSON.stringify(params).length > 2 ? "?data=" + encodeURIComponent(JSON.stringify(params)) : ""),
        		forward ? 1 : 0);
    };

    /**
     * 初始化显示
     */
    var initShow = function() {
        if (hasLogin) {
            $("#person").find("span").text("个人中心");
        } else {
            $("#person").find("span").text("登录/注册");
        }

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

        notices = [];
        for (var i = 0, len = data.length; i < len; i++) {
            if ($.trim(data[i].htmlUrl) != ""){
                notices.push(data[i]);
            }
        }

        if (!notices.length) {
            $(".bunner").hide();
            return;
        }

        slider = null;
        $("#slides").empty();
        for(var i = 0, len = notices.length; i < len; i++) {

            if (readIDs != null && typeof readIDs != "undefined"
                && readIDs[notices[i].noticeId] != null && typeof readIDs[notices[i].noticeId] != "undefined") {
                // 重置需要写入的ID集合
                writeIDs[notices[i].noticeId] = "1";
            }
            $("#slides").append("<img id='img_"+notices[i].noticeId+"' src='"+noticeService.getImageServerUrl() + notices[i].htmlUrl+"' width='100%' class='notice' style='top:0;left:"+(i*100)+"%;'>");
            $(".grayBg .next").append($("<dd></dd>"));
        }
        
        if (notices.length > 1) {
            // 滑动
            slider = new Slider({items:$(".notice").toArray(),width:100,duration:300});

            // 轮播
            if (this.noticeTimer == null) {
                this.noticeTimer = setInterval(function() {
                    $("#slides").trigger("swipeLeft");
                }, 5000);
            }
        }
        itemFocus();
    };

    /**
     * 图片焦点小按钮
     */
    var itemFocus = function() {
        var $children = $(".grayBg .next").children();
        $children.removeClass("click");
        $children.each(function(i, item) {
            var index = slider == null ? 0 : slider.getIndex();
            if (i == index) {
                $(item).addClass("click");
                $(".grayBg .title").text(notices[i].title);
            }

        });
    };

    /**
     * 绑定事件
     */
    var bindEvent = function() {

        // 滑动公告
        $(document).undelegate("#slides", "swipeLeft");
        $(document).delegate("#slides", "swipeLeft", function(e) {
            if (slider != null) {
                slider.next();
                itemFocus();
            }
            return true;
        });

        $(document).undelegate("#slides", "swipeRight");
        $(document).delegate("#slides", "swipeRight", function(e) {
            if (slider != null) {
                slider.preview();
                itemFocus();
            }
            return true;
        });

        // 公告图片点击
        $("#slides").undelegate("img", pageEvent.touchStart);
        $("#slides").delegate("img", pageEvent.touchStart, function(e) {
            pageEvent.handleTapEvent(this, this, pageEvent.activate, e);
            return true;
        });

        $("#slides").undelegate("img", pageEvent.activate);
        $("#slides").delegate("img", pageEvent.activate, function(e) {
            var noticeId = e.target.id.split("_")[1];
            if (typeof noticeId != "undefined" && $.trim(noticeId) != "") {
                writeIDs[noticeId] = "1";
                appConfig.setNoticeReadIDs(writeIDs);

                page.initPage("notice/detail", {noticeId: noticeId}, 1);
            }
            return true;
        });

        // 菜单点击
        $(".nav").undelegate("li", pageEvent.touchStart);
        $(".nav").delegate("li", pageEvent.touchStart, function(e) {
            pageEvent.handleTapEvent(this, this, pageEvent.activate, e);
            return true;
        });

        $(".nav").undelegate("li", pageEvent.activate);
        $(".nav").delegate("li", pageEvent.activate, function(e) {
            var href = $(this).find("a").attr("id");
            switch (href) {
                case "person": // 个人中心，登录/注册
                    if (hasLogin) {
                        page.initPage("user/person", {}, 1);
                    } else {
                        page.initPage("login", {}, 1);
                    }

                    break;
                case "notice": // 活动公告
                    page.initPage("notice/list", {}, 1);
                    break;
                case "award": // 开奖信息
                    page.initPage("awardInfo", {}, 1);
                    break;
                case "banks": // 充值

                    if (hasLogin) {
                        page.initPage("user/abccharge", {}, 1);
                    } else {
                        // 尚未登录，弹出提示框
                        util.prompt("", "您还未登录，请先登录", "登录", "取消",
                            function(e) {
                                page.initPage("login", {}, 1);
                            },
                            function(e) {}
                        );
                    }
                    break;
            }
            return true;
        });

        // 彩种点击
        $(".czList") .undelegate("li", pageEvent.touchStart);
        $(".czList") .delegate("li", pageEvent.touchStart, function(e) {
            pageEvent.handleTapEvent(this, this, pageEvent.activate, e);
            return true;
        });

        $(".czList") .undelegate("li", pageEvent.activate);
        $(".czList") .delegate("li", pageEvent.activate, function(e) {
            switch (this.id) {
                case "redblue":
					
					// 删除缓存的购买数据
                    appConfig.clearMayBuyData(appConfig.MAY_BUY_RED_BLUE_KEY);
                    page.initPage("redblue/ball", {}, 1);
					
                    break;
                case "happy":

                    // 删除缓存的购买数据
                    appConfig.clearMayBuyData(appConfig.MAY_BUY_HAPPY_KEY);
                    page.initPage("happy/ball", {}, 1);

                    break;
                case "luck":

                    // 删除缓存的购买数据
                    appConfig.clearMayBuyData(appConfig.MAY_BUY_LUCK_KEY);
                    page.initPage("luck/ball", {}, 1);

                    break;
                case "more": // 更多玩法

                    var wapUrl = appConfig.WAP_URL;

                    // 保存登录成功信息
                    var user = appConfig.getLocalUserInfo();

                    if (user != null && typeof user != "undefined"
                        && user.userId != null && typeof user.userId != "undefined"
                        && user.wapKey != null && user.wapKey != "undefined") {
                        // 登录状态
                        wapUrl += "?useId=" + user.userId
                            + "&password=" + hex_md5(new Date().getTime()).substr(8,16) + "-"
                            + user.wapKey + "&type=3";

                    }
                    console.log("[wap url] : "+wapUrl);
                    window.location.href = wapUrl;
                    break;
            }
            return true;
        });
    };

    return {init:init};
});
