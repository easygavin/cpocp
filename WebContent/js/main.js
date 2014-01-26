require.config({
    baseUrl:"js",
    paths:{
        text:"../lib/text.min"
    }/*,
    urlArgs: "1.0.0"*/
});

require([
    "util/Page",
    "services/AccountService",
    "util/AppConfig",
    "util/Util"
], function (page, accountService, appConfig, util) {

    // 新浪微博授权页面
    var authorizeUrl = "https://api.weibo.com/oauth2/authorize";
    // App Key uat: 2217294276 正式: 783672977
    var client_id = "2217294276";
    // App Secret uat: 8f83955d8678127111ec6c06adcfc3ba 正式: 689ac2b6425898cc694cce71552a80c9
    var client_secret = "8f83955d8678127111ec6c06adcfc3ba";
    // 授权回调页 uat: http://uatjc.m.cpocp.com/abc/ 正式: http://m.cpocp.com/abc/
    var redirect_uri = "http://uatjc.m.cpocp.com/abc/";

    // 授权登录code
    var code = "";

    // 登录类型 0: 授权登录（默认），1：普通登录
    var type = "0";

    // hash 参数
    var hashName = "", hashData = {};

    // 页面加载完毕
    $(document).ready(function(){

        // 加载图标
        util.showLoading();

        // 处理参数
        handleSearch();
        handleHash();

        var userInfo = appConfig.getLocalUserInfo();

        // 检查登录状态
        var tkn = appConfig.checkLogin(hashData);

        if ($.trim(code) != "") {
            if (userInfo !=null && typeof userInfo != "undefined"
                && userInfo.code !=null && typeof userInfo.code != "undefined"
                && $.trim(userInfo.code) != "" && $.trim(userInfo.code) == $.trim(code)
                && $.trim(tkn) != "") {
                initHomePage();
            } else {
                useCodeUnitLogin();
            }
        } else if ($.trim(code) == "" && type == "1"){
            initHomePage();
        } else {
            goAuth();
        }

        /**
         * 新浪认证
         */
        function goAuth() {
            window.location.href = authorizeUrl + "?" +
                "client_id="+ client_id + "" +
                "&response_type=code" +
                "&redirect_uri=" + redirect_uri;
        };

        /**
         * 联名登录
         */
        function useCodeUnitLogin () {
            accountService.unitWeiBoLogin(code, client_id, client_secret, redirect_uri, function(data) {
                console.log(JSON.stringify(data));
                if (typeof data != "undefined" ) {
                    if (typeof data.statusCode != "undefined") {
                        if (data.statusCode == "0") {

                            // 登录token
                            appConfig.token = new Date().getTime() + "";

                            data.token = appConfig.token;

                            // wap 跳转参数
                            data.wapKey = hex_md5(data.userName + $.trim($("#loginPwd").val())).substr(8,16);

                            // 标示是否是授权登录
                            data.code = code;

                            // 保存登录成功信息
                            appConfig.setLocalUserInfo(data);
                            util.toast("登录成功");

                            // 初始页面
                            initHomePage();
                        } else {
                            util.hideLoading();
                            // 登录失败提示框
                            util.prompt("授权登录失败", data.errorMsg, "继续", "取消",
                                function(e) {
                                    // 继续认证
                                    goAuth();
                                },
                                function(e) {}
                            );
                        }
                    } else {
                        util.hideLoading();
                        // 登录失败提示框
                        util.prompt("", "授权登录失败", "继续", "取消",
                            function(e) {
                                // 继续认证
                                goAuth();
                            },
                            function(e) {}
                        );

                    }
                } else {
                    util.hideLoading();
                    // 登录失败提示框
                    util.prompt("", "授权登录失败", "继续", "取消",
                        function(e) {
                            // 继续认证
                            goAuth();
                        },
                        function(e) {}
                    );
                }
            });
        };


        /**
         * 处理search参数
         */
        function handleSearch () {
            var search = location.search;
            if (search != "") {
                var searchArr = search.substring(1).split("&");
                if (searchArr.length > 0) {
                    for (var i = 0, len = searchArr.length; i < len; i++) {
                        var keyVal = searchArr[i].split("=");
                        if (keyVal.length > 1) {
                            if (keyVal[0] == "code") {
                                // 授权code
                                code = keyVal[1];
                            } else if (keyVal[0] == "type") {
                                // 登录类型
                                type = keyVal[1];
                            }
                        }
                    }
                }
            }
        };

        /**
         * 处理hash参数
         */
        function handleHash() {
            // 参数处理
            var hash = location.hash;
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
        };

        /**
         * 初始化首页
          */
        function initHomePage () {

            // 启动页面模块
            page.initPage(hashName, hashData, 0);
        };

        $(window).on("popstate", function(e) {

            if (e.state){
                if (e.state.url){
                    page.initPage(e.state.url, e.state.data, 0);
                }
            }
        });
    });
});
