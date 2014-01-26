package com.html5.user.bank.util;
import java.util.ResourceBundle;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;

/**
 * Title: 获取资源文件
 * @Copyright: Copyright (c) 2013
 * @Company: cp888
 * @version: 1.0
 * @time: 2013.12.28
*/

public class ResLoader {

	private static final Log log = LogFactory.getLog(ResLoader.class);
	private ResourceBundle resBundle;

	public ResLoader(String resourceName) {
		try {
			resBundle = ResourceBundle.getBundle(resourceName);
		}
		catch (Exception e) {
			log.error("====ResLoader 获取资源文件出错：====" + e);

		}

	}

	public synchronized String getString(String key) {
		return resBundle.containsKey(key) ? resBundle.getString(key) : null;
	}
}
