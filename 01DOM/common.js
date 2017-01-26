/**
 * Created by lenovo on 2016/7/20.
 */
/**1
 * 获取任意对象的内部文本的兼容写法
 * @param element
 * @returns {*}
 */
function getInnerText(element) {
    if (typeof element.innerText === "string") {
        return element.innerText;
    }
    else {
        return element.textContent;
    }
}
//封装代码：可以设置任意对象的内部文本
/**2
 * 可以设置任意对象的内部文本的兼容写法
 * @param element
 * @param content
 */
function setInnerText(element, content) {
    if (typeof element.innerText === "string") {
        element.innerText = content;
    } else {
        element.textContent = content;
    }
}

//封装firstElementChild 第一个子元素
/**3
 * 得到第一个子孩子元素
 * @param elment
 * @returns {*}
 */
function getFirstElement(elment) {
    if (elment.firstElementChild) {
        return elment.firstElementChild;
    } else {
        var first = elment.firstChild;//得到第一个孩子节点
        while (first && 1 !== first.nodeType) {
            first = first.nextSibling;//继续往下找下一个兄弟节点
        }
        return first;
    }
}
//封装lastElementChild 最后一个子元素
/**4
 * 得到最后一个孩子元素
 * @param elment
 * @returns {*}
 */
function getLastElement(elment) {
    if (elment.lastElementChild) {
        return elment.lastElementChild;
    } else {
        var last = elment.lastChild;
        while (last && 1 !== last.nodeType) {
            last = last.previousSibling;//继续往前找上一个兄弟节点
        }
        return last;
    }

}
/**5
 * 封装获取对象的id
 * @param id
 * @returns {Element}
 */
function myid(id) {
    return document.getElementById(id);
}
//封装得到类名的函数
/**6
 * 通过类名获取元素的兼容方法
 * @param elment
 * @param className
 * @returns {*}
 */
function getElementBysClassName(elment, className) {
    if (elment.getElementsByClassName(className)) {
        return elment.getElementsByClassName(className);
    }
    else//如果支持，先把elment里面的所有的标签都获取出来，放在一个空数组中
    {
        var filterarr = [];
        var elments = elment.getElementsByTagName("*");//获得所有的标签
        for (var i = 0; i < elments.length; i++) {
            if (elments[i].className.indexOf(className) !== -1) {//有缺陷
                filterarr.push(elments[i]);//把这个元素添加到数组中
            }

        }
        return filterarr;
    }
}

/**7
 * 升级版：getElmentsByClassName方法
 * @param elment
 * @param className
 * @returns {*}
 */
function getElementBysClassName(elment, className) {
    if (elment.getElementsByClassName(className)) {
        return elment.getElementsByClassName(className);
    }
    else//如果支持，先把elment里面的所有的标签都获取出来，放在一个空数组中
    {
        var filterarr = [];
        var elments = elment.getElementsByTagName("*");//获得所有的标签
        for (var i = 0; i < elments.length; i++) {//遍历每一个标签
            var nameArr =  elments[i].className.split(" ");//把每一个标签的类名以空格形式分割，并以数组形式返回
            for(var j=0;j<nameArr.length;j++)//遍历每一个标签中的每一个类名，找出符合的类名
            {
                if(nameArr[i] == className)
                {
                    filterarr.push(elments[i]);
                    break;
                }

            }
        }
        return filterarr;
    }
}
/**8
 * 把一个节点插入到另一个节点之后
 * @param newEleement
 * @param targetElement
 */
function insertAfter(newEleement, targetElement) {
    var parent = targetElement.parentNode;
    if (parent.lastChild == targetElement) {
        parent.appendChild(newEleement);
    }
    else {
        parent.insertBefore(newEleement, targetElement.nextSibling);
    }
}
/**9
 * 排序方法的封装（全新的版本）
 * @param fn
 * @returns {Array}
 */
Array.prototype.newSort = function (fn) {
    //深层复制
    var newarr = [];
    for (var i = 0; i < this.length; i++)
    {
        newarr[newarr.length] = this[i];
    }
    //排序
    for(var i=0;i<newarr.length-1;i++){
        var isSort = true;
        for(var j=0;j<newarr.length-1-i;j++){
            if(fn(newarr[j],newarr[j+1])>0){
                var temp = newarr[j];
                newarr[j] = newarr[j+1];
                newarr[j+1]=temp;
                isSort = false;
            }
        }
        if(isSort)
        {
            break;
        }
    }
    return newarr;
}
/**10
 * 倒序方法的封装
 * @returns {Array}
 */
Array.prototype.newReverse = function () {
    var newarr = [];
    for (var i = this.length-1; i >=0; i--)
    {
        newarr[newarr.length] = this[i];
    }
    return newarr;
}
/**11
 *深层复制数组，不改变原来的数组
 * @param arr
 * @returns {Array}
 */
function deepClone(arr){
    var newArr = [];
    for(var i=0;i<arr.length;i++)
    {
        newArr[newArr.length] = arr[i];
    }
    return newArr;
}
/**12
 *Join方法自己封装（和join()方法一样）
 * @param arr
 * @param sep
 * @returns {*}
 * @constructor
 */
function Join(arr,sep) {
    var str = arr[0];
    for (var i = 1; i < arr.length; i++)
    {
        str = str + sep + arr[i];
    }
    return str;
}
//封装：把旧的字符串替换成新的字符串
//以目前的知识看封装的函数是有缺陷的：当如果页面中有相同的内容那么就会对其他的受影响，以后
//正则表达式解决
/*function replace(element,oldstr,newstr){
    element.className = element.className.replace(oldstr,newstr);
}*/
//改进13
function replaceClassName(elment,oldStr,newStr){
    //把类名这个字符串按照空格分割，把里面每一个类名 做判断 这样就没问题了
    var arr = elment.className.split(" ");
    for(var i=0;i<arr.length;i++)
    {
        if(arr[i] == oldStr)
        {
            arr[i]=newStr;
            break;//如果在一个元素中的目标类名已经找到，就不用往下找了，因为没谁会无聊到，在一个元素的类上写多个相同的类名。
        }
    }
     console.log(arr.join(" "));//使用空格拼接，如果是空字符串就会连一起
}
/**14
 * 添加加载事件
 * @param fn
 */
function addLoadEvent(fn) {
    var oldOnLoad = window.onload;
    if (typeof oldOnLoad === "function") {//说明已经绑定此事件
        window.onload = function () {
            oldOnLoad();//之前绑定的要执行
            fn();     //新绑定的也要执行
        };
    } else {// 没有绑定
        window.onload = function () {
            fn();
        };
    }

}
//需求：往左往右都可以
/**15
 * 动画函数封装：匀速运动
 * @param obj
 * @param target
 */
function animate(obj, target) {
    clearInterval(obj.timer);
    obj.timer = setInterval(function () {
        var leader = obj.offsetLeft;
        var step = 10;//之前只能是正数 只能往右走
        step = leader < target ? step : -step;
        //当前位置到目标的距离如果很大 这一步迈出之后 到不了目标 或者正好到
        // 就可以迈出这一步
        if (Math.abs(target - leader) >= Math.abs(step)) {
            leader = leader + step;
            obj.style.left = leader + "px";
        } else {//就差一点儿了手动放到目标即可
            obj.style.left = target + "px";
            clearInterval(obj.timer);
        }
    }, 15);
}
//封装自己的scroll()方法
// .top就可以获取被卷去的头部的高度
// .left就可以获取被卷去的左侧的宽度
/**16
 * 滚动函数的封装方法
 * @returns {{top: (Number|number), left: (Number|number)}}
 */
function scroll() {
    return {
        top: window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0,
        left: window.pageXOffset || document.documentElement.scrollLeft || document.body.scrollLeft || 0
    };
}

/**17.1
 * 缓冲动画封装函数添加任意的一个属性
 * @param obj
 * @param attr
 * @param target  目标值
 */
function animate(obj, attr, target) {
    clearInterval(obj.timer);
    obj.timer = setInterval(function () {
        //var leader = obj.offsetLeft;
        //获取任意数值属性的当前值
        var leader = parseInt(getStyle(obj, attr)) || 0;//如果是NaN 给个默认值0
        var step = (target - leader) / 10;
        step = step > 0 ? Math.ceil(step) : Math.floor(step);
        leader = leader + step;
        obj.style[attr] = leader + "px";
        if (leader === target) {
            clearInterval(obj.timer);
        }
    }, 15);
}
/**
 * 17.2
 * 缓冲动画框架封装添加任意多个属性的完整版
 * @param obj
 * @param json
 */
function animate(obj, json) {
        clearInterval(obj.timer);
        obj.timer = setInterval(function () {
            //先假设 这一次执行完 所有的属性都到达目标了
            var flag = true;
            for (var k in json) {
                var leader = parseInt(getStyle(obj, k)) || 0;
                var target = json[k];
                var step = (target - leader) / 10;
                step = step > 0 ? Math.ceil(step) : Math.floor(step);
                leader = leader + step;
                obj.style[k] = leader + "px";
                if (leader != target) {
                    flag = false;//告诉标记 当前这个属性还没到达
                }
            }
            //如果此时仍然为true 就说明真的都到达了
            if (flag) {
                clearInterval(obj.timer);
            }
        }, 15);
}
/**
 * 17.3
 * 缓冲动画封装框架4添加回调函数
 * @param obj
 * @param json
 * @param fn
 */
function animate(obj, json, fn) {
    clearInterval(obj.timer);
    obj.timer = setInterval(function () {
        var flag = true;
        for (var k in json) {
            var leader = parseInt(getStyle(obj, k)) || 0;
            var target = json[k];
            var step = (target - leader) / 10;
            step = step > 0 ? Math.ceil(step) : Math.floor(step);
            leader = leader + step;
            obj.style[k] = leader + "px";
            if (leader != target) {
                flag = false;
            }
        }
        if (flag) {
            clearInterval(obj.timer);
            if (fn) {
                fn();
            }
        }
    }, 15);
}
/**
 * 17.4
 * 缓动动画函数的封装（特别的处理特殊的属性以及属性的值）
 * 功能：把任意对象的任意多个属性改变为任意的目标值
 * @param obj 对象
 * @param json  对象字面量
 * @param fn   回调函数
 */
function animate(obj, json, fn) {
    clearInterval(obj.timer);
    obj.timer = setInterval(function () {
        var flag = true;
        for (var k in json) {
            if (k === "opacity") {//opacity要特殊处理
                //opacity没有单位 参与运算自动转换成数值 所以不用parsetInt
                //取值范围 0-1 0.1 0.33 33 为了让以前的计算公式生效 要扩大100倍
                var leader = getStyle(obj, k) * 100;
                var target = json[k] * 100;
                var step = (target - leader) / 10;
                step = step > 0 ? Math.ceil(step) : Math.floor(step);
                leader = leader + step;
                obj.style[k] = leader / 100;//opacity没有单位
            } else if (k === "zIndex") {
                obj.style.zIndex = json[k];//层级不需要渐变 直接设置即可
            } else {
                var leader = parseInt(getStyle(obj, k)) || 0;
                var target = json[k];
                var step = (target - leader) / 10;
                step = step > 0 ? Math.ceil(step) : Math.floor(step);
                leader = leader + step;
                obj.style[k] = leader + "px";
            }
            if (leader != target) {
                flag = false;
            }
        }
        if (flag) {
            clearInterval(obj.timer);
            if (fn) {
                fn();
            }
        }
    }, 15);
}
/**18
 * 封装获取计算后样式的值
 * @param obj  对象
 * @param attr 属性
 * @returns {*}
 */
function getStyle(obj, attr) {
    if (window.getComputedStyle) {
        return window.getComputedStyle(obj, null)[attr];//null取得是伪元素
    } else {
        return obj.currentStyle[attr];
    }
}
/**
 * 19
 * 网页可视区宽高的兼容写法
 * @returns {{width: (Number|number), height: (Number|number)}}
 */
function client(){
    return {
        width:window.innerWidth|| document.documentElement.clientWidth|| document.body.clientWidth|| 0,
        height:window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight || 0
    }
}
/**
 * 20
 * 返回数组的最小值和最小值的索引
 * @param arr
 * @returns {{}}
 */
function getMin(arr) {
    var min = {};//定义一个空对象
    min.index = 0;//最小值的索引
    min.value = arr[min.index];//最小值的值
    //遍历数组 一个一个比较
    for (var i = 0; i < arr.length; i++) {
        if (min.value > arr[i]) {
            min.value = arr[i];
            min.index = i;
        }
    }
    return min;
}
//event的兼容 写法
var event = event || window.event;
//pageX和PageY的兼容写法
var pageX = event.pageX || event.clientX + document.documentElement.scrollLeft;
var pageY = event.pageY || event.clientY + document.documentElement.scrollTop;
//阻止冒泡的兼容写法
if(event.stopPropagation)
{
   event.stopPropagation();
}else{
    event.cancelable = true;//ie678支持的方法
}
//事件目标的兼容写法
var target = event.target || event.srcElement;
//判断选中文字的代码(兼容写法)
var txt = window.getSelection ? window.getSelection().toString() : document.selection.createRange().text;
//清除选中的文字
window.getSelection ? window.getSelection().removeAllRanges() : document.selection.empty();
//封装trim()方法
/**
 * 去除字符串的空白部分
 * @param str
 * @returns {string|XML|void}
 */
function trim(str) {
    return str.replace(/^\s+|\s+$/g, "");
}
