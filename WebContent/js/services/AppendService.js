/**
 * 智能追号服务
 */
define([
    "util/Calculate"
], function(calculate) {
    /**
     * 获取智能追号列表
     * @param startIssue 开始期号
     * @param endIssue 结束期号
     * @param money 单期金额
     * @param minBonus 单期最小奖金
     * @param maxBonus 单期大奖金
     * @param type 计算方式 1：盈利率，2：盈利金额
     * @param rate 盈利率
     * @param income 盈利金额
     */
    var getAppendList = function (opt) {
        // startIssue, endIssue, money, minBonus, maxBonus, type, rate, income
        opt.startIssue = parseInt(opt.startIssue, 10);
        opt.endIssue = parseInt(opt.endIssue, 10);

        var items = [];
        var totalPay = 0; // 总投入
        var muls = 1; // 倍数
        for (var i = opt.startIssue; i < opt.endIssue + 1; i++) {
            var pay = 0, // 投入
                minIncome = 0, // 最小收益
                maxIncome = 0, // 最大收益
                minRate = 0, // 最小收益率
                maxRate = 0; // 最大收益率

            do {

                pay = muls * opt.money;

                minIncome = muls * opt.minBonus - (pay + totalPay);
                minRate = (minIncome / (pay + totalPay)) * 100;

                if (opt.maxBonus) {
                    maxIncome = muls * opt.maxBonus - (pay + totalPay);
                    maxRate = (maxIncome / (pay + totalPay)) * 100;
                }

                if (opt.type == 1 &&  minRate > opt.rate) {
                    break;
                } else if (opt.type == 2 && minIncome > opt.income) {
                    break;
                }

                muls++;
                if (muls == 10000) {
                    break;
                }
            } while (true);

            if (muls < 10000) {
                var item = {};
                item.issueNo = i + "";
                item.muls = muls;
                item.pay = pay;
                item.minIncome = minIncome;
                item.minRate = minRate;
                item.maxIncome = maxIncome;
                item.maxRate = maxRate;

                totalPay = item.pay + totalPay;
                item.totalPay = totalPay;

                items.push(item);
            } else {
                break;
            }

        }
        return items;
    };

    /**
     * 智能追号前处理
     * @param money 单期消费
     * @param bonus 单注奖金
     * @param issueNo 期号
     * @param count 追期数
     * @param sum 开奖期数
     * @param mode 投注模式
     * @param bet 总注数
     * @param balls 总球数
     * @param dans 胆球数
     * @param tuos 拖球数
     */
    var beforeHandler = function (opt) {
        // money, bonus, issueNo, count, sum, mode, bet, balls, dans, tuos
        // 返回数据
        var result = {};
        if (opt.money >= opt.bonus) {
            // 单期消费 大于等于 奖金 不处理智能追号
            return result;
        }

        // 期数检查
        var number = opt.issueNo.substring(opt.issueNo.length - 2);
        if (typeof number != "undefined" && number != "") {
            number = parseInt(number, 10);
        }

        // 剩余期数
        var leave = opt.sum - number + 1;
        if (number + opt.count - 1 > opt.sum) {
            opt.count = leave;
        }

        // 截止期号
        var endIssue = "";
        var prepend = opt.issueNo.substring(0, opt.issueNo.length - 2);
        if (opt.count > 0) {
            var endNum = number + opt.count - 1;
            endIssue = prepend + (endNum < 10 ? ("0" + endNum) : endNum);
        }

        // 模式处理
        var maxBonus = 0;
        switch (opt.mode) {
            /*case "0": // 任一
                maxBonus = 0;
                break;*/
            case "1": // 任二
            case "2": // 任三
            case "3": // 任四
                if (opt.bet > 1) {
                    // 复式追号 5个号码最多10注
                    var modeI = parseInt(opt.mode, 10) + 1;
                    var ballR = opt.balls < 5 ? opt.balls : 5;
                    maxBonus = calculate.getFactorial(ballR, modeI) * opt.bonus;
                }
                break;
            /*case "4": // 任五
                maxBonus = 0;
                break;*/
            case "5": // 任六
            case "6": // 任七
            case "7": // 任八
                // 复式追号
                if (opt.bet > 1) {
                    var modeI = parseInt(opt.mode, 10) + 1;
                    maxBonus = calculate.getFactorial(opt.balls - 5, modeI - 5) * opt.bonus;
                }
                break;
            /*case "8": // 前三直选
                maxBonus = 0;
                break;
            case "9": // 前三组选
                maxBonus = 0;
                break;
            case "10": // 前二直选
                maxBonus = 0;
                break;
            case "11": // 前二组选
                maxBonus = 0;
                break;
            case "12": // 前三直选胆拖
                maxBonus = 0;
                break;
            case "13": // 前三组选胆拖
                maxBonus = 0;
                break;
            case "14": // 前二直选胆拖
                maxBonus = 0;
                break;
            case "15": // 前二组选胆拖
                maxBonus = 0;
                break;*/
            case "16": // 任二胆拖
            case "17": // 任三胆拖
            case "18": // 任四胆拖
            case "19": // 任五胆拖
                if (opt.bet > 1) {
                    var modeI = parseInt(opt.mode, 10) - 14;
                    var tuoR = opt.tuos < 5 - opt.dans + 1 ? opt.tuos : 5 - opt.dans;
                    maxBonus = calculate.getFactorial(tuoR, modeI - opt.dans) * opt.bonus;
                }
                break;
            case "20": // 任六胆拖
            case "21": // 任七胆拖
            case "22": // 任八胆拖
                if (opt.bet > 1) {
                    if (opt.dans > 4) {
                        var modeI = parseInt(opt.mode, 10) - 14;
                        maxBonus = calculate.getFactorial(opt.tuos, modeI - opt.dans) * opt.bonus;
                    }
                }
                break;
        }

        result.startIssue = opt.issueNo;
        result.endIssue = endIssue;
        result.money = opt.money;
        result.minBonus = opt.bonus,
        result.maxBonus = maxBonus;
        result.count = opt.count;
        result.leave = leave;

        return result;
    };

    /**
     * 模式映射
     * @type {Object}
     */
    var modeMap = {
        "0": {title: "任一", key: "201", bonus: 13},
        "1": {title: "任二", key: "202", bonus: 6},
        "2": {title: "任三", key: "203", bonus: 19},
        "3": {title: "任四", key: "204", bonus: 78},
        "4": {title: "任五", key: "205", bonus: 540},
        "5": {title: "任六", key: "206", bonus: 90},
        "6": {title: "任七", key: "207", bonus: 26},
        "7": {title: "任八", key: "208", bonus: 9},
        "8": {title: "前三直选", key: "511", bonus: 1170},
        "9": {title: "前三组选", key: "501", bonus: 195},
        "10": {title: "前二直选", key: "411", bonus: 130},
        "11": {title: "前二组选", key: "401", bonus: 65},
        "12": {title: "前三直选胆拖", key: "512", bonus: 1170},
        "13": {title: "前三组选胆拖", key: "502", bonus: 195},
        "14": {title: "前二直选胆拖", key: "412", bonus: 130},
        "15": {title: "前二组选胆拖", key: "402", bonus: 65},
        "16": {title: "任二胆拖", key: "302", bonus: 6},
        "17": {title: "任三胆拖", key: "303", bonus: 19},
        "18": {title: "任四胆拖", key: "304", bonus: 78},
        "19": {title: "任五胆拖", key: "305", bonus: 540},
        "20": {title: "任六胆拖", key: "306", bonus: 90},
        "21": {title: "任七胆拖", key: "307", bonus: 26},
        "22": {title: "任八胆拖", key: "308", bonus: 9}
    };

    return {
        modeMap: modeMap,
        beforeHandler: beforeHandler,
        getAppendList: getAppendList
    };
});