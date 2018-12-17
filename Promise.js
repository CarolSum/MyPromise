function MyPromise(fn) {
  let self = this;
  self.onFulfilled = null;
  self.onRejected = null;
  // resolve的value
  self.value = null;
  // reject的error
  self.error = null;

  function resolve(value){
    self.value = value;
    self.onFulfilled(self.value);
  }

  function reject(error) {
    self.error = error;
    self.onRejected(self.error);
  }
  fn(resolve, reject);
}

MyPromise.prototype.then = function(onFulfilled, onRejected) {
  // 注册fulfilled和rejected对应的回调函数
  this.onFulfilled = onFulfilled;
  this.onRejected = onRejected;
}

module.exports = MyPromise;