var utils = (function(){
  var flag = 'getComputedStyle' in window;
  /**
   * [likeArray把类数组转化为数组]
   * @param  {[type]} arg [description]
   * @return {[type]}     [description]
   */
  function likeArray(arg){
      if(flag){
        return Array.prototype.slice.call(arg);
      }else{
        var arr = [];
        for(var i =0; i<arg.length;i++){
          arr.push(arg[i]);
        }
        return arr;
      }
  }
/**
 * [JsonParse 将json字符串转化成json对象]
 * @param {[type]} str [description]
 */
  function JsonParse(str){
      return flag ? JSON.parse(str) : eval('('+str+')')
  }
  /**
   * offset:当前元素距离body的偏移量
   * @param {Object} curEle
   * 通过累加的计算与定位父级的之间的距离，一直循环到body
   */
  function offset(curEle) {
    var l = 0;
    var t = 0;
    var par = curEle.offsetParent;
    l += curEle.offsetLeft;
    t += curEle.offsetTop;
    while (par) {
      //IE8 offsetLeft/top已经包含了边框，但是其他浏览器不包含边框；
      if (navigator.userAgent.indexOf('MSIE 8.0') === -1) {
        l += par.clientLeft;
        t += par.clientTop;
      }
      l += par.offsetLeft;
      t += par.offsetTop;
      par = par.offsetParent;

    }
    return {
      left: l,
      top: t
    }
  }
  /**
   * [getWin 设置盒子模型的大小]
   * @param  {[type]} attr  [description]
   * @param  {[type]} value [description]
   * @return {[type]}       [description]
   */
  function getWin(attr,value){
    if(typeof value === 'undefined'){
      return document.documentElement[attr] || document.body[attr]
    }
    document.documentElement[attr] = document.body[attr] = value;
  }
  return {
    likeArray:likeArray,
    JsonParse:JsonParse,
    offset:offset,
    getWin:getWin,

    getByClass: getByClass,
    hasClass: hasClass,
    addClass: addClass,
    removeClass: removeClass,
    getCss: getCss,
    setCss: setCss,
    setGroupCss: setGroupCss,
    css: css,
    children: children,
    prev: prev,
    prevAll: prevAll,
    next: next,
    nextAll: nextAll,
    sibling: sibling,
    siblings: siblings,
    firstChild: firstChild,
    lastChild: lastChild,
    getIndex: getIndex,
    appendChild: appendChild,
    prepend: prepend,
    insertBefore: insertBefore,
    insertAfter: insertAfter
  }

})()
