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
  /**
   * 得到网页大小：
   * 注意：1.这个函数必须在页面加载完成后才能运行，否则document对象还没生成，浏览器会报错
   *       2.clientWidth和clientHeight都是只读属性，不能对它们赋值
   * return:返回浏览器窗口的高和宽
   */
  function getViewPort(){
    if(document.compatMode=="BackCompat"){//IE的"quick Mode"
      return{
        height:document.body.clientHeight,
        width:document.body.clientWidth
      }
    }else{
      return {
        height:document.documentElement.clientHeight,
        width:document.documentElement.clientWidth
      }
    }
  }
/**
 * 得到网页大小的另一种方法
 * 如果网页内容能够在浏览器窗口中全部显示，不出现滚动条，那么网页的clientWidth和scrollWidth应该相等。
 * 但是实际上，不同浏览器有不同的处理，这两个值未必相等。所以，我们需要取它们之中较大的那个值
 */
function getPagearea(){
   if(document.compatMode=="BackCompat"){//IE的"quick Mode"
      return{
        height:Math.max(document.body.scrollHeight,
                        document.body.clientHeight),
        width:Math.max(document.body.scrollWidth,
                       document.body.clientWidth)
      }
    }else{
      return {
        height:Math.max(document.documentElement.scrollHeight,
                        document.documentElement.clientHeight),
        width:Math.max(document.documentElement.scrollWidth,
                       document.documentElement.clientWidth)
      }
    }
}
/**
 * 获得网页元素的绝对位置：指该元素的左上角相对于整张网页左上角的坐标。
 * 方法：累加offsetLeft或者offsetTop值得到
 */
//得到绝对位置的横坐标
function getEleLeft(element){
  var left = element.offsetLeft,
      current = element.offsetParent;
  while(current !== null){
    left += current.offsetLeft;
    current = current.offsetParent;

  }
  return left;
}
//得到绝对位置的纵坐标
function getEleTop(element){
  var top = element.offsetTop,
      current = element.offsetParent;
  while(current !== null){
    top += current.offsetTop;
    current = current.offsetParent;

  }
  return top;
}
/**
 * 获得元素的相对位置：指该元素左上角相对于浏览器窗口左上角的坐标
 * 方法：将绝对坐标减去页面的滚动条滚动的距离
 */
function getEleViewLeft(element){
  var left = element.offsetLeft,
      current = element.offsetParent;
  while(current !== null){
    left += current.offsetLeft;
    current = current.offsetParent;
  }
  if(document.compatMode=="BackCompat"){
    var elementScrollLeft = document.body.scrollLeft
  }else{
    var elementScrollLeft = document.documentElement.scrollLeft;
  }
  return left - elementScrollLeft;
}

function getEleViewTop(element){
  var top = element.offsetTop,
      current = element.offsetParent;
  while(current !== null){
    top += current.offsetTop;
    current = current.offsetParent;
  }
  if(document.compatMode=="BackCompat"){
    var elementScrollTop = document.body.scrollTop
  }else{
    var elementScrollTop = document.documentElement.scrollTop;
  }
  return top - elementScrollTop;
}


  return {
    likeArray:likeArray,
    JsonParse:JsonParse,
    offset:offset,
    getWin:getWin,

    getViewPort:getViewPort, //网页大小
    getPagearea:getPagearea,
    getEleLeft:getEleLeft,
    getEleTop:getEleTop,
    getEleViewLeft:getEleViewLeft,
    getEleViewTop:getEleViewTop


  }

})()
