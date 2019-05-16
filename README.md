# Promise

手动实现promise过程。

``` js
new Promise(function(resolve, reject){
    setTimeout(function(){
        resolve('helloworld')
    }, 0)
}).then(function(data) {
    console.log(data, 1)
    return 123
}).then(function(data) {
    console.log(data, 2)
})
```

以上等价于：
``` js
var promise1 = new Promise(function(resolve, reject){
    setTimeout(function(){
        resolve('helloworld')
    }, 0)
})

var callback1 = function(data) {
    console.log(data, 1)
    return 123
}
var promise2 = promise1.then(callback1)

var callback2 = function(data) {
    console.log(data, 2)
}
var promise3 = promise2.then(callback2)
```

实例化`new Promise(fn)`，意味着马上执行fn()，但fn()里一般是异步代码，返回数据时间是不一定的。接下来继续走同步代码then。

`Promise.prototype.then`才是Promise实现的关键难点。根据Promise A+规范，then返回的是另外一个Promise（不能像jquery一样，返回this，每次都在同一个对象上操作）。因为Promise有三种状态：pending、fulfill、reject。而且默认pending状态改为fulfill/reject时，实例的promise就不能再改变状态了。

以上代码按照时间线执行路径：
1. 线执行`fn()`,启动异步进程，同时同步代码then继续。
2. 执行promise1.then,`Promise.prototype.then` 流程详细：
    1. 会新创建new Promise(fn2)，立马执行`fn2()`。fn2()中把包装callback1的函数resolvedCallback，放在promise1.callbacks中。啥时候promise1调用它的callbakcs呢？这个取决于用户，还记得new Promise(function(resolve, reject){})中的resolve函数吗？`什么调用它（还能返回‘helloworld’数据），就会去执行这个resolvedCallback`。

    ``` js
    var resolvedCallback = function(value) {
        var x = onResolved(self.data) // onResolved就是callback1；self就是promise1，能拿到data是因为这个函数执行会在promise1.resolve(‘helloworld’)后
        resolve(x) // 重要。这是promise2的resolve，触发链式调用
    }
    ```
    2. 返回一个新的promise2。
3. 执行promise2.then,同上，执行`fn3()`。此时：（每个onResolvedCallback里的self是不一样的。）
    * promise1.callbacks = [包装的resolvedCallback]
    * promise2.callbacks = [包装的resolvedCallback]
    * promise3.callbacks= [包装的resolvedCallback]
4. `异步代码拿到数据，用户手动触发第一个resolve`：promise1.resolve('helloworld')，星星之火点燃。
    1. 此时，promise1的data变为‘helloworld’
    2. 执行promise1.callbacks[0], 拿到promise1.data，然后执行callback1（promise1.data），同时拿到返回值x。
    3. 触发promise2.resove(x)，执行promise2.callbacks[0],让火继续烧下去。

> 第一个Promise的resolve是取决于用户，但后面Promise.resolve都被封装到then原型中，所以包装了resolvedCallback,一旦开始就会一直链路下去。

> callback1即是promise1.resolve('helloworld')的回调函数，返回的值也是给下一次Promise(promise2)返回的数据。

> 以上只是简单叙述Promise实现原理，真实情况是可能有更多情形，比如在then中返回Promise等。


## 参考文章

* [[译] Promises/A+ 规范](http://www.ituring.com.cn/article/66566)

* [ECMA262 Promise](https://tc39.github.io/ecma262/#sec-promise-objects)

* [
剖析Promise内部结构，一步一步实现一个完整的、能通过所有Test case的Promise类](https://github.com/xieranmaya/blog/issues/3)