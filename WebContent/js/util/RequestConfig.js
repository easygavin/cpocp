/**
 * Config Service
 */
define([], function() {

    // 管家服务器地址
    // 管家测试："http://uatjc.ecp888.com/" 管家正式："http://gj.caipiao123.com.cn/";
    var SERVER_URL = "http://uatjc.ecp888.com/";

    // 公告服务器地址
    // 公告测试："http://192.168.1.126:8081/gjguanggao/" 公告正式："http://gj.caipiao123.com.cn/";
    var NOTICE_SERVER_URL = "http://gj.caipiao123.com.cn/";

    var request = {
        // 用于设置图片路径
        NOTICE_SERVER_URL: NOTICE_SERVER_URL,
        // 客户端激活接口
        USER_ACTIVE: SERVER_URL + "gjdigit/user/reg/0/saveClientActiveRecord.shtml",
        // 用户登录接口
        USER_LOGIN: SERVER_URL + "gjuser/login/0/servantLogin.shtml",
        // 用户注销接口
        USER_LOGOUT: SERVER_URL + "gjuser/login/0/logout.shtml",
        // 用户注册接口
        USER_REG: SERVER_URL + "gjuser/reg/0/reg.shtml",
        // 修改登录密码接口
        CHANG_PWD: SERVER_URL + "gjuser/reg/0/changePw.shtml",
        // 获取账户余额/提款资料接口
        GET_BALANCE: SERVER_URL + "gjuser/blance/0/getBlance.shtml",
        // 获取银行列表接口
        GET_BANKS: SERVER_URL + "gjuser/bindbankcard/3/getBanks.shtml",
        // 获取银行卡省市列表接口
        GET_BANK_LOCUS: SERVER_URL + "gjuser/bindbankcard/3/getBankLocus.shtml",
        // 绑定银行卡接口
        BIND_BANK_CARD: SERVER_URL + "gjuser/bindbankcard/2/bindBankCard.shtml",
        // 绑定身份证接口
        BIND_PERSON_CARD: SERVER_URL + "gjuser/bindidcard/0/bindPersonCard.shtml",
        // 获取身份证信息接口
        GET_CARD_ID: SERVER_URL + "gjuser/bindidcard/0/getCardId.shtml",
        // 提款接口
        DRAWING: SERVER_URL + "gjuser/drawmoneys/3/drawing.shtml",
        // 发送验证码接口
        SEND_MSG_TO_PHONE: SERVER_URL + "gjuser/bindphoneno/0/sendMsgToPhone.shtml",
        // 绑定手机号码接口
        VALIDATE_CODE: SERVER_URL + "gjuser/bindphoneno/0/validateCodeOfBindMebile.shtml",
        // 获取用户帐户明细
        GET_ACCOUNT_DETAIL: SERVER_URL + "gjdigit/user/member!getAccountDetail.shtml",
        // 获取用户购彩记录
        BUY_AWARD: SERVER_URL + "gjdigit/user/buyaward!index.shtml",
        // 获取购彩/合买方案详情接口
        AWARD_DETAIL: SERVER_URL + "gjjczq!detail.shtml",
        // 获取方案奖金优化详情接口
        JJYH_DETAIL: SERVER_URL + "gjjczq!jjyhdetail.shtml",
        // 支付宝快捷登陆接口
        SHORT_CUT_LOGIN: SERVER_URL + "gjuser/shortcutlogin/0/wireless.shtml",
        // 用户反馈建议接口
        FEEDBACK: SERVER_URL + "gjuser/customerasks/1/ask.shtml",
        // 合买大厅列表接口
        GROUP_BUY: SERVER_URL + "gjdigit/group-buy/api/index.shtml",
        // 合买认购接口
        GROUP_SUBSCRIBE: SERVER_URL + "gjjczq!subscribe.shtml",
        // 获取数字/高频彩当前期号信息接口
        GET_CURRENT_LOTTERY: SERVER_URL + "gjdigit/lotteryissue!getCurrentLottery.shtml",
        // 获取高频彩上期开奖号码及遗漏数据接口
        GET_LAST_ISSUE_MSG: SERVER_URL + "gjdigit/lotteryissue!getLastIssueMessage.shtml",
        // 数字/高频彩投注接口
        DIGIT_BUY: SERVER_URL + "gjdigit/buy.shtml",
        // 数字/高频方案详情
        SUBSCRIBE_ORDER: SERVER_URL + "gjdigit/partner/api/subscribeorder.shtml",
        // 数字/高频方案详情可追期列表
        ALL_ISSUE: SERVER_URL + "gjdigit/group-buy/api/allissue.shtml",
        // 数字彩某期开奖详情接口
        GET_DIGIT_NB: SERVER_URL + "gjdigit/lotteryissue!getDigitKjNumber.shtml",
        // 数字/高频彩复活追号接口
        ADD_BUY_DIGIT: SERVER_URL + "gjdigit/buy!addBuyDigit.shtml",
        // 彩种开奖列表接口
        AWARD_LIST: SERVER_URL + "gjkj!allkj.shtml",
        // 彩种历史开奖列表接口
        AWARD_LIST_ISSUE: SERVER_URL + "gjdigit/lotteryissue!getKjNumberByIsscout.shtml",

        // 活动公告列表接口
        NOTICE_LIST: NOTICE_SERVER_URL + "gjgonggao/app/notic_app!index.shtml",
        // 活动公告详情接口
        NOTICE_DETAIL: NOTICE_SERVER_URL + "gjgonggao/app/notic_app!show.shtml",

        // 新浪微博授权登录
        WEIBO_AUTH_LOGIN: SERVER_URL + "gjuser/sinalogin!receiveCode.shtml"
    };

    /**
     * 平台类型
     * @type {String}
     */

    request.channelNo = "h5_abc";

    /**
     * 渠道号/推荐人
     * @type {String}
     */
    request.platform = "e";

    /**
     * 手机型号
     * @type {String}
     */
    request.cellphoneType = "sdk";

    /**
     * sim 卡号
     * @type {String}
     */
    request.simCd = "89014103211118510720";

    /**
     * 手机屏幕大小
     * @type {String}
     */
    request.resolution = "480*800";

    /**
     * 手机物理地址
     */
    request.macAddr = "7C:61:93:F6:64:00";

    /**
     * 手机序列号
     * @type {String}
     */
    request.imei = "355067048777916";

    return {
        request: request
    };
});
