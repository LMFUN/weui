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
import './ext/javascript';
import 'element-closest';
import $ from 'zepto-touch';
import  './zepto.refresh';
import objectAssign from 'object-assign';
import localStorage from './ext/localStorage';


import formSerialize from 'form-serialize';

console.log('$',$);
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

objectAssign($, {
    localStorage: localStorage,
    typeof: _typeof,

    isPhone: function (phone) {
        return REG.phone.test(phone);
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

    serializeObject: function () {
        const form = this[0];
        if (form) {
            return formSerialize(form, { hash: true });
        }
        return {};
    }
});


export default $;
