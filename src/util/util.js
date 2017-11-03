/*
 * Tencent is pleased to support the open source community by making WeUI.js available.
 *
 * Copyright (C) 2017 THL A29 Limited, a Tencent company. All rights reserved.
 *
 * Licensed under the MIT License (the 'License'); you may not use this file except in compliance
 * with the License. You may obtain a copy of the License at
 *
 *       http://opensource.org/licenses/MIT
 *
 * Unless required by applicable law or agreed to in writing, software distributed under the License is
 * distributed on an 'AS IS' BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND,
 * either express or implied. See the License for the specific language governing permissions and
 * limitations under the License.
 */

import 'element-closest';
import objectAssign from 'object-assign';
import localStorage from './ext/localStorage';
import moblieTouch from './ext/touch';
import moblieEvent from './ext/event';
import $ from 'balajs';
import formSerialize from 'form-serialize';


// 其实，$ 的原型就是一个数组，拥有数组的各种方法
// 这里只是库内部使用，所以通过文档约束，不做容错校验，达到代码最小化


/* 判断系统 */
function _detect(ua) {
    let os = this.os = {},
        android = ua.match(/(Android);?[\s\/]+([\d.]+)?/),
        wechat = ua.match(/MicroMessenger\/([\d\.]+)/i);
    if (android) {
        os.android = true;
        os.version = android[2];
    }
    if (wechat) {
        os.wechat = true;
        os.wechat_version = wechat[1];
    }
}
_detect.call($, navigator.userAgent);


//扩展方法
var REG = {phone: /^13[0-9]{9}$|14[0-9]{9}|15[0-9]{9}$|17[0-9]{9}$|18[0-9]{9}$/};
function _typeof(arg) {
    return Object.prototype.toString.call(arg);
}
function likeArray(obj) {
    return typeof obj.length == 'number';
}
function isWindow(obj) {
    return obj != null && obj == obj.window;
}
let emptyArray = [];
const readyRE = /complete|loaded|interactive/;
objectAssign($, {
    localStorage: localStorage,
    extend: objectAssign,
    typeof: _typeof,
    isArray: function (array) {
        return _typeof(array) == '[object Array]';
    },
    isObject: function (object) {
        return _typeof(object) == '[object Object]';
    },
    isFunction: function (object) {
        return _typeof(object) == '[object Function]';
    },
    isPlainObject: function (obj) {
        return _typeof(obj) == '[object Object]' && !isWindow(obj) && Object.getPrototypeOf(obj) == Object.prototype;
    },
    isPhone: function (phone) {
        return REG.phone.test(phone);
    },
    each: function (elements, callback) {
        var i, key;
        if (likeArray(elements)) {
            for (i = 0; i < elements.length; i++)
                if (callback.call(elements[i], i, elements[i]) === false) return elements;
        } else {
            for (key in elements)
                if (callback.call(elements[key], key, elements[key]) === false) return elements;
        }

        return elements;
    },
    date: function (...args) {
        if (_typeof(args[0]) === '[object String]' && args[0].indexOf('-') >= 0) {
            args[0] = args[0].replace(/-/g, '/');
        }
        return new Date(...args);
    },
    trim: function (text) {
        return text == null ? '' : ( text + '' ).replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, '');
    },
    /**
     * noop
     */
    noop: function () {

    },
    /**
     * render
     * 取值：<%= variable %>
     * 表达式：<% if {} %>
     * 例子：
     *  <div>
     *    <div class='weui-mask'></div>
     *    <div class='weui-dialog'>
     *    <% if(typeof title === 'string'){ %>
     *           <div class='weui-dialog__hd'><strong class='weui-dialog__title'><%=title%></strong></div>
     *    <% } %>
     *    <div class='weui-dialog__bd'><%=content%></div>
     *    <div class='weui-dialog__ft'>
     *    <% for(var i = 0; i < buttons.length; i++){ %>
     *        <a href='javascript:;' class='weui-dialog__btn weui-dialog__btn_<%=buttons[i]['type']%>'><%=buttons[i]['label']%></a>
     *    <% } %>
     *    </div>
     *    </div>
     *  </div>
     * A very simple template engine
     * @param {String} tpl
     * @param {Object=} data
     * @returns {String}
     */
    render: function (tpl, data) {
        const code = 'var p=[];with(this){p.push(\'' +
            tpl
                .replace(/[\r\t\n]/g, ' ')
                .split('<%').join('\t')
                .split('{{').join('\t')
                .replace(/((^|%>)[^\t]*)'/g, '$1\r')
                .replace(/((^|}})[^\t]*)'/g, '$1\r')
                .replace(/\t=(.*?)%>/g, '\',$1,\'')
                .replace(/\t=(.*?)}}/g, '\',$1,\'')
                .split('\t').join('\');')
                .split('}}').join('p.push(\'')
                .split('%>').join('p.push(\'')
                .split('\r').join('\\\'')
            + '\');}return p.join(\'\');';
        return new Function(code).apply(data);
    },
    /**
     * getStyle 获得元素计算后的样式值
     * (from http://stackoverflow.com/questions/2664045/how-to-get-an-html-elements-style-values-in-javascript)
     */
    getStyle: function (el, styleProp) {
        var value, defaultView = (el.ownerDocument || document).defaultView;
        // W3C standard way:
        if (defaultView && defaultView.getComputedStyle) {
            // sanitize property name to css notation
            // (hypen separated words eg. font-Size)
            styleProp = styleProp.replace(/([A-Z])/g, '-$1').toLowerCase();
            return defaultView.getComputedStyle(el, null).getPropertyValue(styleProp);
        } else if (el.currentStyle) { // IE
            // sanitize property name to camelCase
            styleProp = styleProp.replace(/\-(\w)/g, (str, letter) => {
                return letter.toUpperCase();
            });
            value = el.currentStyle[styleProp];
            // convert other units to pixels on IE
            if (/^\d+(em|pt|%|ex)?$/i.test(value)) {
                return ((value) => {
                    var oldLeft = el.style.left, oldRsLeft = el.runtimeStyle.left;
                    el.runtimeStyle.left = el.currentStyle.left;
                    el.style.left = value || 0;
                    value = el.style.pixelLeft + 'px';
                    el.style.left = oldLeft;
                    el.runtimeStyle.left = oldRsLeft;
                    return value;
                })(value);
            }
            return value;
        }
    }
});

//扩展选择器方法


objectAssign($.fn, {
    ready: function (callback) {
        // need to check if document.body exists for IE as that browser reports
        // document ready when it hasn't yet created the body element
        if (readyRE.test(document.readyState) && document.body) callback($);
        else document.addEventListener('DOMContentLoaded', function () {
            callback($);
        }, false);
        return this;
    },
    each: function (callback) {
        emptyArray.every.call(this, function (el, idx) {
            return callback.call(el, idx, el) !== false;
        });
        return this;
    },
    /**
     * 只能是一个 HTMLElement 元素或者 HTMLElement 数组，不支持字符串
     * @param {Element|Element[]} $child
     * @returns {append}
     */
    append: function ($child) {
        if (!($child instanceof HTMLElement)) {
            $child = $child[0];
        }
        this.forEach(($element) => {
            $element.appendChild($child);
        });
        return this;
    },
    /**
     *
     * @returns {remove}
     */
    remove: function () {
        this.forEach(($element) => {
            $element.parentNode.removeChild($element);
        });
        return this;
    },
    /**
     *
     * @param selector
     * @returns {HTMLElement}
     */
    find: function (selector) {
        return $(selector, this);
    },
    /**
     *
     * @param {String} className
     * @returns {addClass}
     */
    addClass: function (className) {
        this.forEach(($element) => {
            // http://caniuse.com/#search=classList
            $element.classList.add(className);
        });
        return this;
    },
    /**
     *
     * @param {String} className
     * @returns {removeClass}
     */
    removeClass: function (className) {
        this.forEach(($element) => {
            // http://caniuse.com/#search=classList
            $element.classList.remove(className);
        });
        return this;
    },
    /**
     *
     * @param index
     * @returns {*|jQuery|HTMLElement}
     */
    eq: function (index) {
        return $(this[index]);
    },
    /**
     *
     * @returns {show}
     */
    show: function () {
        this.forEach(($element) => {
            $element.style.display = 'block';
        });
        return this;
    },
    /**
     *
     * @returns {hide}
     */
    hide: function () {
        this.forEach(($element) => {
            $element.style.display = 'none';
        });
        return this;
    },
    /**
     *
     * @param html 目前只能接受字符串
     * @returns {html}
     */
    html: function () {
        if (arguments.length) {
            this.forEach(($element) => {
                $element.innerHTML = arguments[0];
            });
            return this;
        }
        return this[0] && this[0].innerHTML || '';
    },
    /**
     *
     * @param {Object} obj 目前只能接受object
     * @returns {css}
     */
    css: function (obj) {
        Object.keys(obj).forEach((key) => {
            this.forEach(($element) => {
                $element.style[key] = obj[key];
            });
        });
        return this;
    },

    /**
     *
     * @returns {Number}
     */
    index: function () {
        const $element = this[0];
        const $parent = $element.parentNode;
        return Array.prototype.indexOf.call($parent.children, $element);
    },
    /**
     * @desc 因为off方法目前不可以移除绑定的匿名函数，现在直接暴力移除所有listener
     * @returns {offAll}
     */
    offAll: function () {
        this.forEach(($element, index) => {
            var clone = $element.cloneNode(true);
            $element.parentNode.replaceChild(clone, $element);

            this[index] = clone;
        });
        return this;
    },
    /**
     *
     * @returns {*}
     */
    val: function () {
        if (arguments.length) {
            this.forEach(($element) => {
                $element.value = arguments[0];
            });
            return this;
        }
        return this[0] && this[0].value || '';
    },
    /**
     *
     * @returns {*}
     */
    attr: function () {
        if (typeof arguments[0] == 'object') {
            const attrsObj = arguments[0];
            const that = this;
            Object.keys(attrsObj).forEach((attr) => {
                that.forEach(($element) => {
                    $element.setAttribute(attr, attrsObj[attr]);
                });
            });
            return this;
        }

        if (typeof arguments[0] == 'string' && arguments.length < 2) {
            return this[0] && this[0].getAttribute(arguments[0]) || null;
        }

        this.forEach(($element) => {
            $element.setAttribute(arguments[0], arguments[1]);
        });
        return this;
    },
    /**
     *
     * @returns {*}
     */
    data: function () {
        if (typeof arguments[0] == 'object') {
            const attrsObj = arguments[0];
            const that = this;
            Object.keys(attrsObj).forEach((attr) => {
                that.forEach(($element) => {
                    $element.setAttribute('data-' + attr, JSON.stringify(attrsObj[attr]));
                });
            });
            return this;
        }

        if (typeof arguments[0] == 'string' && arguments.length < 2) {
            return this[0] && JSON.parse(this[0].getAttribute('data-' + arguments[0])) || null;
        }

        this.forEach(($element) => {
            $element.setAttribute('data-' + arguments[0], JSON.stringify(arguments[1]));
        });
        return this;
    },
    serialize: function () {
        const form = this[0];
        if (form) {
            return formSerialize(form);
        }
        return '';
    },
    serializeObject: function () {
        const form = this[0];
        if (form) {
            return formSerialize(form, true);
        }
        return {};
    }
});

// 移动端事件处理
moblieEvent.call($);
moblieTouch.call($);


export default $;
