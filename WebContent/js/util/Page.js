/**
 * page 页面处理
 */
define([
    "util/Util"
], function(util) {

    // 储存的页面列表
    var pages = [];

    /**
     * 启动页面
     * @param url js 加载文件地址
     * @param data 初始化页面数据
	 * @param forward 1:重新进入页面，0:替换当前页面
     */
    var initPage = function(url, data, forward) {
        util.showLoading();
        require([
            url
        ], function (page) {

            // 隐藏残留层
            util.hideCover();
            $(".dialog").hide();
            $(".prompt").hide();

            page.init(data, forward);

            // 重置滚动条
            window.scrollTo(0, 1);

        });
    };

    /**
     * 设置浏览记录
     * @param state 状态信息
     * @param title 标题
     * @param name 记录的地址参数名
     * @param type 1:新建地址，0:替换当前地址
     */
    var setHistoryState = function(state, title, name, type) {
        if (window.history.pushState) {
            if(type == 0) {
                window.history.replaceState(state, title, name);
            } else {
                window.history.pushState(state, title, name);
            }
        } else {
            if (type != 0) {
                pages.push({state: state, title: title, name: name});
            }
        }
    };

    /**
     * 返回
     */
    var goBack = function() {
        if (window.history.pushState) {
            window.history.go(-1);
        } else {
            if(pages.length > 0) {
                var pageName = "", pageData = {};
                if(pages.length == 1){
                    pageName = "#home";
                } else {
                    var pager = pages[pages.length - 2];
                    pageName = pager.state.url;
                    pageData = pager.state.data;
                }
                initPage(pageName, pageData);
                pages.pop();
            } else {
                window.history.go(-1);
            }
        }
    };
	
	/**
     * 返回 步骤处理
	 * @param step 步骤
     */
    var go = function(step) {
        if (window.history.pushState) {
            window.history.go(step);
        } else {
            if(pages.length > 0) {
                var pageName = "", pageData = {};
                if(pages.length == 1){
                    pageName = "#home";
                } else {
                    var pager = pages[pages.length - (step + 1)];
                    pageName = pager.state.url;
                    pageData = pager.state.data;
                }
                initPage(pageName, pageData);
                pages.splice(pages.length - (step + 1), step);
            } else {
                window.history.go(step);
            }
        }
    };

    return {
        pages: pages,
        initPage: initPage,
        setHistoryState: setHistoryState,
        goBack: goBack,
		go: go
    };
});