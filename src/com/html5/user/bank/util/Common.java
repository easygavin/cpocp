package com.html5.user.bank.util;

/**
 * 资源配置文件.
 */
public class Common {
    //管家正式地址.
    //public static String SERVER_URL=  "http://gj.caipiao123.com.cn/";
    //uat环境地址
    //public static final String BIND_BANK_CARD = "http://uatjc.ecp888.com/gjuser/bindbankcard/2/bindBankCard.shtml";
    // public static final String DRAWING = "http://uatjc.ecp888.com/drawmoneys/3/drawing.shtml";

    private static String abc_configPath = "com.html5.config.abcPay"; //配置文件地址.
    private static String abc_bind_bank_card_url; //绑定银行卡url
    private static String abcKcodeKey;            //农行充值密钥
    private static String abc_kcode_charge_url;   //农行k码支付url
    private static String abc_mobile_charge_url;  //农行手机支付url
    private static String linkType;               //支付接入方式

    static {
        ResLoader resLoader = new ResLoader(abc_configPath);
        abc_bind_bank_card_url = resLoader.getString("abc_bind_bank_card_url");
        abcKcodeKey = resLoader.getString("abcKcodeKey");
        abc_kcode_charge_url = resLoader.getString("abc_kcode_charge_url");
        abc_mobile_charge_url  =resLoader.getString("abc_mobile_charge_url");
        linkType = resLoader.getString("linkType");
    }

    public static String getAbc_bind_bank_card_url() {
        return abc_bind_bank_card_url;
    }

    public static String getAbcKcodeKey() {
        return abcKcodeKey;
    }

    public static void setAbcKcodeKey(String abcKcodeKey) {
        Common.abcKcodeKey = abcKcodeKey;
    }

    public static void setAbc_bind_bank_card_url(String abc_bind_bank_card_url) {
        Common.abc_bind_bank_card_url = abc_bind_bank_card_url;
    }

    public static String getAbc_kcode_charge_url() {
        return abc_kcode_charge_url;
    }

    public static void setAbc_kcode_charge_url(String abc_kcode_charge_url) {
        Common.abc_kcode_charge_url = abc_kcode_charge_url;
    }

    public static String getAbc_mobile_charge_url() {
        return abc_mobile_charge_url;
    }

    public static void setAbc_mobile_charge_url(String abc_mobile_charge_url) {
        Common.abc_mobile_charge_url = abc_mobile_charge_url;
    }

    public static String getLinkType() {
        return linkType;
    }

    public static void setLinkType(String linkType) {
        Common.linkType = linkType;
    }
}
