// 声明一个全局的对象
    window.$ = {};
 //    方法需求分析：
 //  =====请求=====
 //  1. 请求方式 type  get|post   默认 get
 //  2. 请求地址 url              默认 当前页面的地址
 //  3. 是否异步 async true|false 默认 true
 //  4. 传输数据 data  {}         默认 空对象{}
 // 
 //  =====响应=====
 //  5. 成功回调函数 success function 异步通讯成功做的事情
 //  6. 失败回调函数 error   function 异步通讯失败做的事情
    $.ajax = function(options){
      if(!options && typeof options !=='object'){
        return false;
      }
      // 参数的默认设置
      var type = options.type || 'get';
      var url = options.url || location.pathname;
      var async = options.async || true;
      var data = options.data || {};
     
      //处理data => name=zpp&age=22
      var dataStr = '';
      for(var k in data){
        dataStr+= k+'='+ data[k] + '&';
      }
      dataStr = dataStr && dataStr.slice(0,-1);
      var xhr = new XMLHttpRequest();
      //设置请求行
      xhr.open(type, type=='type' ? url+'?'+dataStr : url,async);
      //设置请求头
      if(type=="post"){
        xhr.setRequestHeader('Content-Type','application/x-www-form-encoded');
      }
      // 设置请求体
      xhr.send(type=='get'? null : dataStr);
      //响应
      xhr.onreadystatechange = function(){
        //判断通讯有没有完成
        if(xhr.readyState===4){
          //判断请求的状态
          if(xhr.status===200){
              //异步通讯成功做的事情
              var contenttype = xhr.getResponseHeader('Content-Type');
              var respnse = null;
              if(contenttype.indexOf('xml')>-1){
                // xml对象
                respnse = xhr.responseXML;
              }else if(contenttype.indexOf('json')>-1){
                //json对象
                respnse = JSON.parse(xhr.responseText);
              }else{
                respnse = xhr.responseText;
              }
               /*返回数据准备好了 返回给回调函数*/
              options.success && options.success(respnse);
          }else{
              //异步通讯失败做的事情
              var status = xhr.status;
              var statusText = xhr.statusText;
              options.error && options.error({code:status,msg:statusText});
          }
        }
      }
    }
    // get请求的ajax
    $.get = function(options){
      options.type = 'get';
      $.ajax(options);
    }
    // post请求的ajax
    $.post = function(options){
      options.type = 'post';
      $.ajax(options);
    }
