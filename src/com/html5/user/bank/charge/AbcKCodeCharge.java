package com.html5.user.bank.charge;

import com.html5.user.bank.util.Common;
import com.html5.user.bank.util.MD5;
import com.html5.user.bank.util.Posturl;
import net.sf.json.JSONObject;
import org.apache.http.NameValuePair;
import org.apache.http.message.BasicNameValuePair;
import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.select.Elements;

import java.net.URLEncoder;
import java.util.*;

/**
 * @author heming
 * @description: 农行K码充值
 * @Copyright: Copyright (c) 2013
 * @Company: cp888
 * @version: 1.0
 * @time: 2013.12.28
 */
public class AbcKCodeCharge extends Charge {

    /**
     * 调用接口,发送请求
     *
     * @param data 页面传递
     * @return response
     */

    public static String getResponse(String data) {
        String localUrl = Common.getAbc_kcode_charge_url();
        String localResponse = "";
        String remoteResponse = "";
        String returnResult = "";
        try {
            //得到签名
            String sign = getSign(JSONObject.fromObject(data));
            //添加签名到jason
            JSONObject object = appendJasonAttribute(data, "sign", sign);
            //从jason到NameValuePair,组合对象.传递数据
            //List<NameValuePair> params = getNameValuePairs(object);
            //要传递的参数.
            String url = localUrl + "data=" + URLEncoder.encode(object.toString(), "UTF-8");
            //拼接路径字符串将参数包含进去
            localResponse = Posturl.getLocalResponse(url).toString();
            if (localResponse != null && !"".equals(localResponse)) {
                JSONObject jsonObject = JSONObject.fromObject(localResponse);
                String statusCode = jsonObject.getString("statusCode");
                if (statusCode != null && "0".equals(statusCode)) {
                    //如果成功,则读取 statusCode Value..转向农行请求.
                    String remoteUrl = jsonObject.getString("result");
                    String split[] = remoteUrl.split("\\?");
                    String host = split[0];
                    String query = split[1];
                    remoteResponse = Posturl.transportUrl(host, query);
                    if (null != remoteResponse && !"".equals(remoteResponse)) {
                        Document doc = Jsoup.parse(remoteResponse);
                        Elements code = doc.select("[name=code]");  //获得code
                        Elements msg = doc.select("[name=msg]");    //获得msg
                        JSONObject object1 = new JSONObject();
                        object1.put("statusCode", code.text());
                        object1.put("errorMsg", msg.text());
                        returnResult = object1.toString();
                    } else {
                        //农行接口，返回空数据.
                        returnResult = "{\"errorMsg\":\"系统错误,请稍后重试\"}";
                    }
                } else {
                    returnResult = localResponse;
                }
            } else {
                returnResult = "{\"errorMsg\":\"系统错误,请稍后重试\"}";
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        return returnResult;
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
            String mobile = jsonObject.getString("mobile");
            String bankNo = jsonObject.getString("bankNo");
            sign = MD5.md5(amount + userId + mobile + bankNo + Common.getAbcKcodeKey());
        }
        return sign;
    }

    private static List<NameValuePair> getNameValuePairs(JSONObject jason) {
        List<NameValuePair> nameValuePairs = new ArrayList<NameValuePair>();
        if (jason != null) {
            Iterator it = jason.keys();
            while (it.hasNext()) {
                String key = (String) it.next();
                nameValuePairs.add(new BasicNameValuePair(key, (jason.get(key)).toString()));
            }
        }
        return nameValuePairs;
    }

}
