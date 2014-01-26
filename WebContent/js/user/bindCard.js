/**
 * 绑定银行卡
 */
define([
    "text!../../views/user/bindCard.html",
    "util/Page",
    "util/PageEvent",
    "util/AppConfig",
    "services/PersonService",
    "util/Util"
], function (template, page, pageEvent, appConfig, personService, util) {

    //用户其他信息.
    var loginData = null;
    var externalInfo = null;
    var trueName = "";
    var bankCode = "603";
    /**
     * 初始化
     */
    var init = function (data, forward) {

        // 加载模板内容
        $("#container").empty().append($(template));

        // 参数设置
        var params = {};
        var tkn = appConfig.checkLogin(data);
        if (tkn) {
            params.token = tkn;
        }

        loginData = appConfig.getLocalUserInfo();
        externalInfo = appConfig.getLocalUserExternalInfo();
        trueName = appConfig.getLocalUserTrueName();
        //初始化查询.
        initQuery();
        // 绑定事件
        bindEvent();

        // 处理返回
        page.setHistoryState({url: "user/bindCard", data: params}, "user/bindCard", "#user/bindCard" + (JSON.stringify(params).length > 2 ? "?data=" + encodeURIComponent(JSON.stringify(params)) : ""), forward ? 1 : 0);

    };

    /**
     * 绑定事件
     */
    var bindEvent = function () {

        // 返回
        $(".back").on(pageEvent.touchStart, function (e) {
            pageEvent.handleTapEvent(this, this, pageEvent.activate, e);
            return false;
        });

        $(".back").on(pageEvent.activate, function (e) {
            page.goBack();
        });

        $("#bandingBankCard").on(pageEvent.touchStart, function (e) {
            pageEvent.handleTapEvent(this, this, pageEvent.activate, e);
            return false;
        });

        $("#bandingBankCard").on(pageEvent.activate, function (e) {
            bindBankCard();
            return true;
        });

    };

    var initQuery = function () {

        // 显示遮住层
        util.showCover();
        util.showLoading();

        if (null != loginData) {
            if (null != externalInfo) {
                var bankCard = externalInfo.cardNo;
                //如果本地有缓存数据,并且userId，userKey与当前用户信息一致
                if (loginData.userId == externalInfo.userId && null != bankCard && typeof bankCard != "undefined" && "" != bankCard) {
                    //初始化页面数据.
                    initPageData(externalInfo);
                } else {
                    existsBind();
                }
            } else {
                //调用接口查询绑定信息.
                existsBind();
            }
            //隐藏遮盖层
            util.hideCover();
            util.hideLoading();

        } else {
            page.initPage("login", {}, 1);
        }

    };

    /**
     * 请求接口数据.
     */
    var existsBind = function () {
        var userId = loginData.userId;
        var userKey = loginData.userKey;
        if (null != userId && "" != userKey) {
            personService.getUserBalance(1, userId, userKey, function (data) {
                if (typeof data != "undefined") {
                    if (data.statusCode == "0") {
                        //初始化页面数据
                        appConfig.setLocalUserExternalInfo(data);
                        initPageData(data);
                    } else if (data.statusCode == "0007") {
                        //0007尚未绑定身份证.
                        util.toast("您尚未进行身份验证");
                        //page.initPage("user/person", {}, 1);
                        page.goBack();
                    } else {
                        //已经绑定身份证了,但尚未绑定银行卡
                        getBankLocus();
                    }
                }
            });
        } else {
            page.initPage("login", {}, 1);
        }
    };

    var bindBankCard = function () {
        var userBankName = $("#userBankName").val();       //用户姓名
        var selectBank = $("#selectBank").val();           //农业银行
        var selectProvince = $("#displayProvince").html(); //省
        var selectCity = $("#displayCity").html();          //市
        var bankInfo = $("#bankInfo").val();                //支行名称
        var cardNo = $("#cardNo").val();                    //卡号
        var password = $("#password").val();                //密码
        var confirmPassword = $("#confirmPassword").val(); //确认密码
        if (validateBankInfo(userBankName, selectBank, selectProvince, selectCity, bankInfo, cardNo, password, confirmPassword)) {
            var userTrueName = "";
            if (null != trueName && "" != trueName) {
                userTrueName = trueName;
            } else {
                //查询是否绑定.
                personService.inspectUserIDCardState(loginData.userId, loginData.userKey, function (data) {
                    if (typeof  data != "undefined") {
                        if (data.statusCode == "0") {
                            userTrueName = data.name;
                            appConfig.setLocalUserTrueName(userTrueName);
                        } else {
                            util.toast(data.errorMsg);
                        }
                    } else {
                        util.toast("系统错误,请稍后重试!");
                        page.goBack();
                    }
                });
            }
            personService.bindUserBankCard(
                loginData.userId, loginData.userKey, userTrueName, cardNo,
                bankInfo, selectBank, selectProvince, selectCity, password,
                confirmPassword, bankCode, function (data) {
                    if (data.statusCode == "0") {
                        var externalUserInfo = {
                            "userId": loginData.userId, "userKey": loginData.userKey, "name": userTrueName,
                            "cardNo": cardNo, "bankInfo": bankInfo, "bankName": selectBank, "province": selectProvince, "province": selectCity
                        };
                        appConfig.setLocalUserExternalInfo(externalUserInfo);
                        util.toast("绑定成功");
                        page.goBack();

                    } else {
                        util.toast(data.errorMsg);
                    }
                });
        }
    };

    var validateBankInfo = function (userBankName, selectBank, selectProvince, selectCity, bankInfo, cardNo, password, confirmPassword) {

        //默认农业银行...
        /*if (null == selectBank || "" == selectBank) {
         util.toast("请选择银行");
         return false;
         }*/

        if (null == selectProvince || "" == selectProvince || "请选择省份" == selectProvince) {
            util.toast("请选择省份");
            return false;
        }

        if (null == selectCity || "" == selectCity || "请选择城市" == selectCity) {
            util.toast("请选择城市");
            return false;
        }

        if (null == bankInfo || "" == bankInfo || "支行名称" == bankInfo) {
            util.toast("请填写支行名称");
            return false;
        }

        if (bankInfo.indexOf('支行') < 0) {
            util.toast('开户银行名必须包含"支行"文字');
            return false;
        }

        if (null == cardNo || "" == cardNo || isNaN(cardNo) || "银行卡卡号" == cardNo || cardNo.length < 16) {
            util.toast("请输入正确的银行卡号");
            return false;
        }

        var reg = /^[A-Za-z0-9]+$/;
        if (null == password || "" == password) {
            util.toast("请填写提款密码");
            return false;
        } else if (password.length < 6 || password.length > 15) {
            util.toast("提款密码为6到15位数字或字母");
            return false;
        } else if (!reg.test(password)) {
            util.toast("提款密码为6到15位数字或字母");
            return false;
        }
        if (null == confirmPassword || "" == confirmPassword) {
            util.toast("请确认提款密码");
            return false;
        } else if (confirmPassword.length < 6 || confirmPassword.length > 15) {
            util.toast("提款密码为6到15位数字或字母");
            return false;
        } else if (!reg.test(confirmPassword)) {
            util.toast("提款密码为6到15位数字或字母");
            return false;
        }
        if (password != confirmPassword) {
            util.toast("提款密码与确认密码不一致");
            return false;
        }
        return true;
    };

    /**
     *如果已经绑定银行卡则初始化页面数据.
     */
    var initPageData = function (data) {
        if (externalInfo != null) {
            data = externalInfo;
        }
        var trueName = data.name;
        $("#userBankName").val(trueName.substring(0, 1) + "***").attr("readonly", true);
        $("#selectBank").val(data.bankName).attr("readonly", true);
        $("#displayProvince").html(data.province).attr("disabled", true);
        $("#selectProvince").attr("disabled", true);
        $("#displayCity").html(data.city).attr("readonly", true);
        $(".pr b").remove();
        $("#selectCity").attr("disabled", true);
        $("#bankInfo").val(data.bankInfo).attr("readonly", true);
        var cardNo = data.cardNo;
        if ("" != cardNo && null != cardNo) {
            if (cardNo.length >= 16) {
                $("#cardNo").val(cardNo.substring(0, 10) + "******").attr("readonly", true);
            } else {
                $("#cardNo").val(cardNo).attr("readonly", true);
            }
            $("#cardNo")[0].blur();
        }
        $("#password").val("*******").attr("readonly", true);
        $("#confirmPassword").val("*******").attr("readonly", true);
        $("#bandingBankCard").off(pageEvent.active).html("返回").on(pageEvent.click, function () {
            page.goBack();
        });

    };
    /**
     * 初始化文本信息,以及省市列表
     */
    var getBankLocus = function () {
        if (null != trueName && "" != trueName && trueName.length > 0) {
            $("#userBankName").val(trueName.substring(0, 1) + "***").attr("disabled", true);
        } else {
            personService.inspectUserIDCardState(loginData.userId, loginData.userKey, function (data) {
                if (typeof  data != "undefined") {
                    if (data.statusCode == "0") {
                        trueName = data.name;
                        $("#userBankName").val(trueName.substring(0, 1) + "***").attr("disabled", true);
                        appConfig.setLocalUserTrueName(trueName);
                    } else {
                        util.toast(data.errorMsg);
                    }
                }else{
                    util.toast("系统错误,请稍后重试");
                }
            });
        }
        personService.getBankLocus(function (data) {
            if (typeof data != "undefined") {
                if (null != data && "" != data) {
                    setProvinceCitySelect(data);
                } else {
                    util.toast("系统错误,请稍后重试");
                    page.goBack();
                }
            } else {
                util.toast("系统错误,请稍后重试");
                page.goBack();
            }
        });
    };
    /**
     * 初始化省市下拉列表.
     */
    var setProvinceCitySelect = function (data) {
        var all = data.citylist;
        var selectProvince = document.getElementById("selectProvince");
        var selectCity = document.getElementById("selectCity");

        //读取省列表.
        for (var i = 1; i < all.length; i++) {
            selectProvince.options.add(new Option(all[i]["p"], i));
        }
        //读取市列表.并且选择以后,则填充lable
        selectProvince.onchange = function () {
            selectCity.options.length = 1;
            var cities = all[selectProvince.value]["c"];
            for (var i = 0; i < cities.length; i++) {
                selectCity.options.add(new Option(cities[i]["n"]));
            }

            var value = document.getElementById("selectProvince").value;
            var text = selectProvince.options[value - 1].text;
            $("#displayProvince").html(text).addClass("inputT");
        };
        selectCity.onchange = function () {
            var value = document.getElementById("selectCity").value;
            $("#displayCity").html(value).addClass("inputT");
        };
    };
    return {init: init};
});