/**
 * 公告服务
 */
define([
    "util/RequestConfig",
], function(requestConfig) {

    /**
     * 获取公告图片服务器路径
     * @return {*}
     */
    var getImageServerUrl = function() {
        return requestConfig.request.NOTICE_SERVER_URL;
    };

    /**
     * 获取公告列表
     * @param callback
     */
    var getNoticeList = function( callback) {

        // 请求参数
        var data = {
            "platform": requestConfig.request.platform,
            "channelNo": requestConfig.request.channelNo
        };

        // 请求公告列表
        $.ajax({
            type: "GET",
            url: requestConfig.request.NOTICE_LIST,
            data: {data: JSON.stringify(data)},
            dataType: "jsonp",
            success: callback,
            error: callback
        });
    };

    /**
     * 获取公告详情
     * @param noticeId
     * @param callback
     */
    var getNoticeDetail = function(noticeId, callback) {

        // 请求参数
        var data = {
            "noticeId": noticeId
        };

        // 请求公告详情
        $.ajax({
            type: "GET",
            url: requestConfig.request.NOTICE_DETAIL,
            data: {data: JSON.stringify(data)},
            dataType: "jsonp",
            success: callback,
            error: callback
        });
    };

    return {
        getImageServerUrl: getImageServerUrl,
        getNoticeList: getNoticeList,
        getNoticeDetail: getNoticeDetail
    };
});
