/**
 * Created by andy on 2017/10/31.
 * 使用方法的
 * 设置前缀 localStorage.setPerfix(perfix)
 * 设置 localStorage.setItem(key,value)
 * 获取 localStorage.getItem(key)
 * 移除 localStorage.removeItem(key)
 * 清除所有 localStorage.clear()
 */
var global = window;
function isType(type) {
    return function (obj) {
        return Object.prototype.toString.call(obj) === '[object ' + type + ']';
    };
}

var isObject = isType('Object');
var isArray = isType('Array');

function toJson(value) {
    return JSON.stringify(value);
}

function isStringNumber(num) {
    return /^-?\d+\.?\d*$/.test(num.replace(/['']/g, ''));
}

function reviver(key, value) {
    if (value === 'true' || value === 'false') return value === 'true';
    return value;
}

var perfix = 'LMFUN.';
var _type = 'localStorage';  //sessionStorage
/**
 * localStorage
 */
var localStorage = {
    version: '1.0.0',
    setPerfix: function (_perfix) {
        perfix = _perfix;
        return this;
    },
    /**
     * 设置存储方式
     * @param type
     */
    setType: function (type) {
        if (type == 'localStorage' || type == 'sessionStorage') {
            _type = type;
        }
    },
    /**
     * 设置一个localStorage
     * @param {String} name
     * @param {String} value
     */
    setItem: function (name, value) {
        if (!this.isSupports()) {
            return;
        }
        if ((typeof(value) == 'undefined')) {
            return false;
        } else if (isArray(value) || isObject(value)) {
            value = toJson(value);
        }
        global[_type].setItem(this.formatKey(name), value);
        return this;
    },
    /**
     * 根据名字读取值
     * @param {String} name
     * @return {String}
     */
    getItem: function (name) {

        if (!this.isSupports()) {
            return null;
        }
        var item = global[_type].getItem(this.formatKey(name));
        if (!item || item === 'null') {
            return null;
        }

        if (item.charAt(0) === '{' || item.charAt(0) === '[' || isStringNumber(item)) {
            return JSON.parse(item, reviver);
        }

        return item;


    },
    /**
     * 根据名字移除值
     * @param {String} name
     */
    removeItem: function (name) {
        if (!this.isSupports()) {
            return null;
        }
        global[_type].removeItem(this.formatKey(name));

    },
    /**
     * 清空 localStorage
     */
    clear: function () {
        if (!this.isSupports()) {
            return null;
        }
        global[_type].clear();

    },
    /**
     * 判断是否支持 localStorage
     */
    isSupports: function () {
        return (_type in global) && global[_type] !== null;
    },
    /**
     *
     */
    formatKey: function (key) {
        return (perfix || '') + key;
    }
};

export default  localStorage;
