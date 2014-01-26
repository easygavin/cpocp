/**
 * calculate 计算处理
 */
define([], function() {
	
	/**
     * 阶乘计算 m > n
     */
    var getFactorial = function (m, n) {
        if (m <= 0 || n <= 0 || m < n) {
            return 0;
        }

        var max = m, min = n, total = 1, div;
        // m * (m-1) * (m 2) * ... * (n+1)
        for (var i = min + 1; i <= max; i++) {
            total *= i;
            div = i - min;
            total /= div;
        }
        return total;
    };

    /**
     * 从n个元素中取出m个元素的组合公式n!/((n-m)!m!)
     * @param m 6-胆
     * @param n 拖
     * @return
     */
    var getCombineCount = function(m, n) {
        if (m < 0 || n < 0 || n < m) {
            return 0; // 当m小于0时返回0 by:liaoyuding
        }
        if (m == 0 || n == 0) {
            return 1;// 当m为0或者n 为 0 时,返回 1 by :zw
        }
        var n1 = 1, n2 = 1;
        for (var i = n, j = 1; j <= m; n1 *= i--, n2 *= j++) {

        }
        return n1 / n2;
    };

    /**
     * 从n个元素中取出m个元素的排列公式n!/(n-m)!
     * @param m
     * @param n
     * @return
     */
    var getPLNumber = function(m, n) {
        var p = 1;
        if (m <= 0 || n <= 0 || n < m) {
            return 0;
        }
        p = getJCNumber(n) / getJCNumber(n - m);
        console.log("从" + n + "个不同的数中取" + m + "个数字的排列数：" + p);
        return p;
    };

    /**
     * 计算n的阶乘1*2*3*4。。。。n-1
     * @param n
     * @return
     */
    var getJCNumber = function(n) {
        var result = 1;
        if ((n < 0) || (n > 19)) {
            return -1;
        }
        for (var i = 1; i <= n; i++) {
            result = i * result;
        }
        return result;
    };

    /**
     * 随机从m---n数中，随机选择count个数，并用spilt分割
     * @param m 开始数
     * @param n 结束数
     * @param count 随机个数
     */
    var getSrand = function(m, n, count) {
        var arr = new Array();
        if (m == n || m > n || count == 0) {
            return arr;
        }

        do{
            var val = getRandom(m, n);
            if(!isContain(arr, val)) {
                arr.push(val);
            }
        }while(arr.length < count);
        // 排序
        arr = sortNumber(arr, "asc");
        return arr;
    };

    /**
     * 指定范围的一个随机数
     * @param s 开始数
     * @param e 结束数
     * @return {Number}
     */
    var getRandom = function(s, e) {
        return Math.floor(Math.random() * (e + 1 - s)) + s;
    };

    /**
     * 数组中是否包含某项值
     * @param arr 数组
     * @param n 某项值
     * @return {Boolean}
     */
    var isContain = function(arr, n) {
        for (var i = 0, len = arr.length; i < len; i++) {
            if(arr[i] == n) {
                return true;
            }
        }
        return false;
    };

    /**
     * 数组排序
     * @param arr 数组
     * @param ad 排序方式
     * @return {*}
     */
    var sortNumber = function(arr, ad) {
        var f = ad != "desc" ? function(a, b) {
            return a - b;
        } : function(a, b) {
            return b - a;
        };
        return arr.sort(f);
    };
	
	return {
		getFactorial: getFactorial,
        getCombineCount: getCombineCount,
        getPLNumber: getPLNumber,
        getJCNumber: getJCNumber,
        getSrand: getSrand
	};

});