function Promise(executor) {
    var self = this
    self.status = 'pending' // Promise当前的状态
    self.data = undefined  // Promise的值
    self.onResolvedCallback = [] // Promise resolve时的回调函数集
    self.onRejectedCallback = [] // Promise reject时的回调函数集

    function resolve(value) {
        if (self.status === 'pending') {
            self.status = 'resolved'
            self.data = value
            for(var i = 0; i < self.onResolvedCallback.length; i++) {
                self.onResolvedCallback[i](value)
            }
        }
    }

    function reject(reason) {
        if (self.status === 'pending') {
            self.status = 'rejected'
            self.data = reason
            for(var i = 0; i < self.onRejectedCallback.length; i++) {
                self.onRejectedCallback[i](reason)
            }
        }
    }

    executor(resolve, reject) // 执行new Promise()时，传入的function。等于说每次新建new Promise实例，总会执行传入的函数
}

Promise.prototype.then = function(onResolved, onRejected) {
    var self = this
    var promise2 // 重要，根据Promise A+标准，then方法总是返回一个新的promise2 = new Promise()，这点非常重要

    // 状态处理，大部分走pending
    if (self.status === 'pending') {
      return promise2 = new Promise(function(resolve, reject) {
        // resolvedCallback调用时间：promise1调用resolve
        var resolvedCallback = function(value) {
            var x = onResolved(self.data)
            resolve(x) // 重要。这是promise2的resolve，触发链式调用
        }
        var rejectedCallback = function(reason) {
          var x = onRejected(self.data)
          reject(x)
        }

        // 如果当前的Promise还处于pending状态，我们并不能确定调用onResolved还是onRejected，只能等到Promise的状态确定后，才能确实如何处理.
        // 重要：第一个then()回调，放进promise1.callbacks，第二个then()，放进promise2.callback。
        self.onResolvedCallback.push(resolvedCallback)
        self.onRejectedCallback.push(rejectedCallback)
      })
    }

    if (self.status === 'resolved') {
      return promise2 = new Promise(function(resolve, reject) {
          var x = onResolved(self.data)
          resolve(x)
      })
    }
    if (self.status === 'rejected') {
      return promise2 = new Promise(function(resolve, reject) {
          var x = onRejected(self.data)
          reject(x)
      })
    }
  }

module.exports = Promise