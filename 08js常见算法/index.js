/*
数组排序数字
 */
function sortNum(a, b){
     return a -b;
}

/*
去重:去除数字的数组
方法：先把原数组排序，然后将新数组的最后一项与原数组的每一项进行比较，
            不相同的就添加入新数组中

[1,2,3,2,3,2,3]
[1,2,2,2,3,3,3]
 */

 Array.prototype.delRepeat = function(){
  this.sort(sortNum);
  var newArr = [this[0]],
      len = this.length,
      i;
  for(i=1; i<len; i++){
    if(this[i]!== newArr[newArr.length-1]){
      newArr.push(this[i]);
    }
  }
  return newArr;
}
/**
 * 去重2：去除非数字的数组
 * 方法：把数组每一项当做键存入对象里面，如果这个键已经存在了就不存入了。
 */
 Array.prototype.jsonUniqure = function(){
  var json = {},
      i,
      len = this.length;
  for(i=0; i<len; i++){
      if(!json[this[i]]){
        json[this[i]]=1;
      }
  }
  return json;
}
/**
 * 折半查找算法
 * 注意：要求查找对象是排好序的
 * [1,2,3,4,5,6,7,8]
 */
 Array.prototype.binary = function(item){
  this.sort(sortNum);
  var startIndex = 0,
      lastIndex = this.length -1;
      middleIndex = Math.floor((startIndex + lastIndex)/2);//注意js的整除也是带小数的，所以要自己处理
  while(this[middleIndex]!==item && startIndex <lastIndex){
    if(this[middleIndex]>item){
      lastIndex = middleIndex - 1;
    }else{
      startIndex = middleIndex + 1;
    }
     middleIndex = Math.floor((startIndex + lastIndex)/2);
  }
  return this[middleIndex]!==item ? false:true;
}
/**
 * 冒泡排序：
 */
 Array.prototype.clone = function(){
  var newArr = [],
      len = this.length,
      i;
  for(i=0; i<len; i++){
    newArr[i] = this[i];
  }
  return newArr;
}
 Array.prototype.bubbleSort = function(callback){
  var newArr = this.clone(),
      flag,//假设已经排好序
      temp;//临时变量
  for(var i =0; i < newArr.length -1; i++){//外循环控制趟数
    flag = true;
    for(var j =0; j< newArr.length -1 -i; j++){//内循环控制两两比较的次数
        if(callback(newArr[j],newArr[j+1])>0){
          temp = newArr[j];
          newArr[j] = newArr[j+1];
          newArr[j+1] = temp;
          flag = false;          //说明还没有排好序
        }
    }
    if(flag){
      break;
    }
  }
  return newArr;
}
