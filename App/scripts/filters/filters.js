'use strict';
(function () {
    var app = angular.module("Mealtime.Filters", []);
    app.filter("merge", function () {
        return function (ls, key, n, omit) {
            var a = [];
            angular.forEach(ls, function (v, i) {
                if (n && n <= i) return false;
                a.push(v[key]);
                return true;
            });
            if (n && ls.length > n)
                return a.join(',') + (omit || '');
            return a.join(',');
        }
    });
    app.filter("none", function () {
        return function (obj, content) {
            if (obj == null || obj === '') {
                return content;
            }
            return obj;
        }
    });
    app.filter("state", function () {
        return function (obj) {
            switch (obj) {
                case 1:
                    return "废弃";
                case 2:
                    return "正常";
                case 3:
                    return "禁止";
                default:
                    return "未知状态";
            }
        }
    });
    app.filter("enumVals", ["utils", function (utils) {
        var vals = utils.enums();  //vals获取结果为：var enumVals = { AdminLevel:[ { Name:'超级管理员',Val: 1 },{ Name:'普通管理员',Val: 2 },{ Name:'网站管理员',Val: 3 },{ Name:'查看管理员',Val: 4 },], HotKeywordState:[ { Name:'门户显示',Val: 1 },{ Name:'屏蔽显示',Val: 2 },], 
        return function (obj, key) { //key : AdminLevel
            var v = vals[key];  //v 执行为  [ { Name:'超级管理员',Val: 1 },{ Name:'普通管理员',Val: 2 },{ Name:'网站管理员',Val: 3 },{ Name:'查看管理员',Val: 4 },]
            for (key in v) {
                if (v[key].Val === obj) {
                    return v[key].Name;
                }
            }
            return "未知类型";
        };
    }]);
    /**
     * 过滤图片地址(特权图标过滤使用)
     */
    app.filter("extension", function () {
        return function (url, replacement) {
            return url.replace(/\.[^\.]*$/, replacement);
        };
    });
    /**
     * 时间转化为秒数
     */
    app.filter('timeConver', function($filter){
        return function(time, format){
            if(!time || !(/^\d*$/.test(time)) ){ return '' }
            time = parseInt(time, 10) + (new Date).getTimezoneOffset() * 60;
            return $filter('date')(time * 1000, format);
        }
    });
})();