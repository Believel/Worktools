//封装一些公用的方法或者事件
//定义一个公用的空间
window.Believel = {};
Believel.tap = function(curDom,callback){
  if(!curDom || typeof curDom !=='object' ){
    return false;
  }
  var isMove = false;/*是否滑动过*/
  var time = 0;// 刚刚触摸屏幕的时间  touchstart的触发事件 
  curDom.addEventListener('touchstart',function(){
      time = Date.now();//时间戳 毫秒
  })
  curDom.addEventListener('touchmove',function(){
      isMove = true;
  })
  window.addEventListener('touchend',function(e){
     /*
         * 1.没有滑动过
         * 2.响应事件在150ms以内   要求比click要响应快
         * 
     */
    if(!isMove && (Date.now()-time) < 150 ){
            callback && callback(e);
        }

    /*重置参数*/
        isMove = false;
        time = 0;
    
  })
}
