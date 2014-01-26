package com.html5.user.bank.bindcard;

import com.html5.user.bank.util.Common;
import com.html5.user.bank.util.Posturl;

public class BandingBankCard {

    /**
     * 接收数据,发送请求
     *
     * @param data 前台页面传递
     */

    public static String bindResponseData(String data) {
        String hostAddress = Common.getAbc_bind_bank_card_url();
        org.json.JSONObject response = null;
        try {
            String info = net.sf.json.JSONObject.fromObject(data).toString();
            org.json.JSONObject jsonObject = new org.json.JSONObject();
            jsonObject.put("data", info);
            response = Posturl.postRequest(hostAddress, jsonObject);
        } catch (Exception e) {
            e.printStackTrace();
        }
        return response.toString();
    }
}
