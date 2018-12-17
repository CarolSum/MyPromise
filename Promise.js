const PENDING = 'pending';
const FULFILLED = 'fulfilled';
const REJECTED = 'rejected';

function MyPromise(fn) {
  let self = this;
  self.onFulfilled = null;
  self.onRejected = null;
  self.status = PENDING;
  // resolve的value
  self.value = null;
  // reject的error
  self.error = null;

  function resolve(value){
    if(self.status === PENDING){
      setTimeout(()=>{
        self.status = FULFILLED;
        self.value = value;
        self.onFulfilled(self.value);
      })
    }
  }

  function reject(error) {
    if (self.status === PENDING) {
      setTimeout(() => {
        self.status = REJECTED;
        self.error = error;
        self.onRejected(self.error);
      })
    }
  }
  fn(resolve, reject);
}

MyPromise.prototype.then = function(onFulfilled, onRejected) {
  if(this.status === PENDING) {
    // 注册fulfilled和rejected对应的回调函数
    this.onFulfilled = onFulfilled;
    this.onRejected = onRejected;
  } else if (this.status === FULFILLED) {
    onFulfilled(this.value);
  } else {
    onRejected(this.error);
  }
  return this;
}

module.exports = MyPromise;