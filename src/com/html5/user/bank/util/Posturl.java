package com.html5.user.bank.util;

import org.apache.http.HttpEntity;
import org.apache.http.HttpResponse;
import org.apache.http.HttpStatus;
import org.apache.http.client.HttpClient;
import org.apache.http.client.methods.HttpGet;
import org.apache.http.impl.client.DefaultHttpClient;
import org.apache.http.protocol.HTTP;
import org.json.JSONObject;
import org.json.JSONTokener;

import java.io.*;
import java.net.HttpURLConnection;
import java.net.URI;
import java.net.URL;
import java.util.Iterator;
import java.util.Map;


@SuppressWarnings("unused")
public class Posturl {

    /**
     * httpClient GetMethod
     *
     * @param url 主机地址 (hostUrl+parameter)
     * @return string
     */
    public static JSONObject getLocalResponse(String url) {
        HttpClient client = new DefaultHttpClient();
        HttpGet get = new HttpGet(url);
        org.json.JSONObject json = null;
        try {
            HttpResponse res = client.execute(get);
            if (res.getStatusLine().getStatusCode() == HttpStatus.SC_OK) {
                HttpEntity entity = res.getEntity();
                json = new org.json.JSONObject(new JSONTokener(new InputStreamReader(entity.getContent(), HTTP.UTF_8)));
            }
        } catch (Exception e) {
            throw new RuntimeException(e);

        } finally {
            //关闭连接 ,释放资源
            client.getConnectionManager().shutdown();
        }
        return json;
    }

    /**
     * 转向农行请求.httpClient Request
     *
     * @param url
     * @return
     */
    public static String getRequest(String url) {
        // 响应内容
        StringBuilder sb = new StringBuilder();
        HttpClient client = new DefaultHttpClient();
        HttpGet get = new HttpGet(url);
        // 定义访问地址的链接状态
        try {
            HttpResponse res = client.execute(get);
            if (res.getStatusLine().getStatusCode() == HttpStatus.SC_OK) {
                HttpEntity entity = res.getEntity();
                InputStream in = entity.getContent();//将返回的内容流入输入流内
                BufferedReader reader = new BufferedReader(new InputStreamReader(in));
                String line = "";
                try {
                    while ((line = reader.readLine()) != null) {
                        sb.append(line);
                    }
                } catch (IOException e) {
                    e.printStackTrace();
                } finally {
                    try {
                        in.close();
                        reader.close();
                    } catch (IOException e) {
                        e.printStackTrace();
                    }
                }
            }
        } catch (Exception e) {
            throw new RuntimeException(e);
        } finally {
            //关闭连接 ,释放资源
            client.getConnectionManager().shutdown();
        }
        return sb.toString();
    }

    /**
     * @param url     农行host请求地址
     * @param message 农行请求参数
     * @return String
     */
    public static String transportUrl(String url, String message) {
        StringBuffer sb = new StringBuffer();
        BufferedReader in = null;
        OutputStream os = null;
        DataOutputStream dos = null;
        HttpURLConnection uc = null;
        try {
            URL urls = new URL(url);
            uc = (HttpURLConnection) urls.openConnection();
            uc.setRequestMethod("GET");
            uc.setRequestProperty("content-type",
                    "application/x-www-form-urlencoded");
            uc.setRequestProperty("charset", "UTF-8");
            uc.setDoOutput(true);
            uc.setDoInput(true);
            uc.setReadTimeout(10000);
            uc.setConnectTimeout(10000);
            os = uc.getOutputStream();
            dos = new DataOutputStream(os);
            dos.write(message.getBytes("UTF-8"));
            dos.flush();
            in = new BufferedReader(new InputStreamReader(uc.getInputStream(),
                    "GBK"));
            String readLine = "";
            while ((readLine = in.readLine()) != null) {
                sb.append(readLine);
            }
        } catch (Exception e) {
        } finally {
            try {
                if (in != null) {
                    in.close();
                }
                if (os != null) {
                    os.close();
                }
                if (dos != null) {
                    dos.close();
                }

                uc.disconnect();
            } catch (IOException ie) {
            }
        }
        return sb.toString();
    }

    
    /**
     * @param map 前端传送数据
     * @return 拼接url String
     * @detail Map对象转url.
     */
    public static String mapToUrl(Map map) {
        StringBuilder sb = new StringBuilder("?");
        Iterator iterator = map.entrySet().iterator();
        while (iterator.hasNext()) {
            Map.Entry entry = (Map.Entry) iterator.next();
            sb.append(entry.getKey());
            sb.append("=");
            sb.append(entry.getValue());
            sb.append("&");
        }
        if (sb.toString().endsWith("&")) {
            return sb.toString().substring(0, sb.length() - 1);
        }
        return sb.toString();
    }

}
