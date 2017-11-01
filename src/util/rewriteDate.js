var _Date = window.Date;
_Date.now = _Date.now || function () {
    return (new _Date).getTime();
};
_Date.prototype.format = function (fmt = 'yyyy-MM-dd hh:mm:ss') {
    var date = this;
    var o = {
        'M+': date.getMonth() + 1, // 月份
        'd+': date.getDate(), // 日
        'h+': date.getHours(), // 小时
        'm+': date.getMinutes(), // 分
        's+': date.getSeconds(), // 秒
        'q+': Math.floor((date.getMonth() + 3) / 3), // 季度
        'S': date.getMilliseconds()// 毫秒
    };
    if (/(y+)/.test(fmt))
        fmt = fmt.replace(RegExp.$1, (date.getFullYear() + '')
            .substr(4 - RegExp.$1.length));
    for (var k in o)
        if (new RegExp('(' + k + ')').test(fmt))
            fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k])
                : (('00' + o[k]).substr(('' + o[k]).length)));
    return fmt;
};

class newDate {
    constructor(...args) {
        if (Object.prototype.toString.call(args[0]) === '[object String]' && args[0].indexOf('-') >= 0) {
            args[0] = args[0].replace(/-/g, '/');
        }
        return new _Date(...args);
    }
}
window.Date = newDate;
