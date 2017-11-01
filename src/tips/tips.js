import dialog from '../dialog/dialog';

/**
 * tips 提示框。
 * @param {string} content 提示内容
 *
 * @example
 * var tipsDom = weui.tips('提示内容');
 * tipsDom.hide(); //手动关闭的tips
 */
function tips(content = '') {
    return dialog({
        content: content,
        buttons: []
    });
}
export default tips;
