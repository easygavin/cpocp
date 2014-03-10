require.config({
    baseUrl:"js",
    paths:{
        text:"../lib/text.min"
    },
     urlArgs: "1.0.0"
});

require([
    "util/Page",
    "util/Util"    
], function (page, util) {

    // 页面加载完毕
    $(document).ready(function () {

        // 加载图标
        util.showLoading();

        initHomePage();
        /**
         * 初始化首页
         */
        function initHomePage() {
            // 参数处理
            var hash = location.hash;
            var hashName = "", hashData = {};
            if (hash != "") {
                var hashArr = hash.substring(1).split("?");
                hashName = hashArr[0];
                if (hashArr.length > 1) {
                    var dataArr = hashArr[1].split("=");
                    if ($.trim(dataArr[0]) == "data") {
                        console.log(dataArr[1]);
                        hashData = JSON.parse(decodeURIComponent(dataArr[1]));
                    }
                }
            }

            if ($.trim(hashName) == "") {
                hashName = "home";
            }

            // 启动页面模块
            page.initPage(hashName, hashData, 0);
        }

        $(window).on("popstate", function (e) {

            if (e.state) {
                if (e.state.url) {
                    page.initPage(e.state.url, e.state.data, 0);
                }
            }
        });
    });
});
