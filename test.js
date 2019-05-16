var Promise = require('./promise')

var promise = new Promise(function(resolve, reject){
    setTimeout(function(){
        resolve('helloworld')
    }, 0)
    // resolve('helloworld')
}).then(function(data) {
    console.log(data, 1)
    return 123
}).then(function(data) {
    console.log(data, 2)
})