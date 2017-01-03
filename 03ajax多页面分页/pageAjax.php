<?php
  header('Content-Type:text/html; charset=utf-8');
  /*
    1.请求方式  get
    2.请求url  data.php
    3.请求传递的参数    page当前页数   pageSize每一页多少条数据
    4.是后台在处理
    5.返回数据 
    {
      count:35,       //总页数
      list:array[{},{}]   //当前结果列数
    }
  */

  /*是json数据格式的字符串*/
  $json = file_get_contents('data.json');
  /*json_decode 把json字符串解析成 php 对象*/
  $json2php = json_decode($json);
  // 得到总条数
  $count =count($json2php); 
 /*json_encode 把php对象解析成json格式的字符串*/
  echo json_encode(array('count'=>$count,'list'=>$json2php));
 
  
?>
