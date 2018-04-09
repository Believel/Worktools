// 快速排序
  var quickSort = function(arr) {
    if (arr.length <= 1) return arr;
    var leftArr = [],
        rightArr = [];
    var distIndex = Math.floor(arr.length % 2);
    var distValue = arr.splice(distIndex, 1)[0]; // 基准
    for (var i = 0, len = arr.length; i < len; i++) {
      if (arr[i] < distValue) {
        leftArr.push(arr[i]);
      } else {
        rightArr.push(arr[i]);
      }
    }
    return quickSort(leftArr).concat([distValue], quickSort(rightArr));
  }
  console.log(quickSort([1, 6, 2, 8, 3]));

  // 选择排序
  var selectSort = function(arr) {
    var temp, minIndex ;
    for (var i = 0, len = arr.length; i < len; i++) {
      minIndex = i;
      for (var j = i+1; j < arr.length; j++) {
        if (arr[minIndex] > arr[j]) { // 寻找最小的数
            minIndex = j;            // 将最小数的索引保存
        }
      }
      temp = arr[i];
      arr[i] = arr[minIndex];
      arr[minIndex] = temp;
    }
    return arr;
  }

  console.log(selectSort([9, 0, 2, 5, 3]))


  // 冒泡排序
  var bubbleSort = function(arr) {
    var newArr = arr.slice();
    var flag, temp;
    for (var i = 0; i < newArr.length -1; i++) {
      flag = true;
      for (var j = 0; j < newArr.length -1 -i; j++) {
        if (newArr[j] > newArr[j+1]) {
          temp = newArr[j];
          newArr[j] = newArr[j+1];
          newArr[j+1] = temp;
          flag = false;
        }
      }
      if (flag) {
        break;
      }
    }
    return newArr;
  }
  var arr = [1, 8, 7, 3, 2, 5];
  console.log(bubbleSort(arr));
  console.log(arr);


  // 判断类型方法实现
  function isType(obj, type) {
    if (typeof obj !== 'object') return false;
    var typeString = Object.prototype.toString.call(obj);
    var flag;
    switch (type) {
      case 'Array':
        flag = typeString === '[object Array]';
      break;
      case 'Date':
        flag = typeString == '[object Date]';
      break;
      case 'RegExp':
        flag = typeString == '[object RegExp]';
      break;
      default:
      flag = false;
    }
    return flag;
  }
var obj = {
  name: '隔壁老王',
  age: 60,
  sex: 'male',
  card: ['信用卡', '借记卡', '理发卡'],
  wife: {
        name: '小刘',
        son: {
            name1: '王小宝',
            name2: '王二宝'
        }
  },
  divorce: function () { }
}
  // 深度克隆
  function deepClone(origin, target) {
    var target = target || {},
        toStr = Object.prototype.toString,
        arrStr = '[object Array]';
        for (var prop in origin) {
          if (origin.hasOwnProperty(prop)) {
            if (typeof (origin[prop]) == 'object' && origin[prop] !== null) {
              target[prop] = (toStr.call(origin[prop])=== arrStr) ? [] : {};
              deepClone(origin[prop], target[prop]);
            } else {
              target[prop] = origin[prop];
            }
          }
        }
        return target;
  }
console.log(deepClone(obj, {}));
