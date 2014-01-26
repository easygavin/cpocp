package com.html5.user.bank.charge;

import com.html5.user.bank.util.Common;
import com.html5.user.bank.util.MD5;
import com.html5.user.bank.util.Posturl;
import net.sf.json.JSONObject;

import java.net.URLEncoder;
import java.util.HashMap;
import java.util.Map;

/**
 * @author heming
 * @description: 农行手机充值
 * @Copyright: Copyright (c) 2013
 * @Company: cp888
 * @version: 1.0
 * @time: 2013.12.28
 */
public class AbcMobileCharge extends Charge {

    /**
     * 调用接口,发送请求
     *
     * @param data 页面传递
     * @return response
     */

    public static String getResponse(String data) {
        String localUrl = Common.getAbc_mobile_charge_url();
        String localResponse = "";
        try {
            Map<String, String> map = new HashMap<String, String>();
            //得到签名.
            String sign = getSign(JSONObject.fromObject(data));
            //得到签名,把这个属性添加到data中.
            JSONObject object = appendJasonAttribute(data, "sign", sign);
             object = appendJasonAttribute(object.toString(),"linkType",Common.getLinkType());
            String url = localUrl + "data=" + URLEncoder.encode(object.toString(), "UTF-8");
            //发送本地请求,得到农行url 请求地址.
            localResponse=Posturl.getLocalResponse(url).toString();
            System.out.println("===MobileChargeStyle localResponse=== "+localResponse);

        } catch (Exception e) {
            e.printStackTrace();
        }
        return localResponse;
    }

    /**
     * data后添加签名属性
     *
     * @param data  页面传递参数.data
     * @param key   sign签名
     * @param value sign签名
     * @return jsonObject
     */
    private static JSONObject appendJasonAttribute(String data, String key, String value) {
        JSONObject jsonObject = JSONObject.fromObject(data);
        jsonObject.put(key, value);
        return jsonObject;
    }

    /**
     * 得到md5签名
     *
     * @param jsonObject 从data对象转换而来
     * @return String
     */
    private static String getSign(JSONObject jsonObject) {
        String sign = "";
        if (jsonObject != null) {
            String amount = jsonObject.getString("amount");
            String userId = jsonObject.getString("userId");
            sign = MD5.md5(amount + userId +Common.getLinkType()+ Common.getAbcKcodeKey());
        }
        return sign;
    }
}
