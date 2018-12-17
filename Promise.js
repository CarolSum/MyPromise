const PENDING = 'pending';
const FULFILLED = 'fulfilled';
const REJECTED = 'rejected';

function MyPromise(fn) {
  let self = this;
  self.onFulfilledCallbacks = [];
  self.onRejectedCallbacks = [];
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
        self.onFulfilledCallbacks.forEach(callback => {
          callback(self.value);
        });
      })
    }
  }

  function reject(error) {
    if (self.status === PENDING) {
      setTimeout(() => {
        self.status = REJECTED;
        self.error = error;
        self.onRejectedCallbacks.forEach(callback => {
          callback(self.error);
        })
      })
    }
  }
  fn(resolve, reject);
}

MyPromise.prototype.then = function(onFulfilled, onRejected) {
  const self = this;
  let bridgePromise; // 新的Promise对象，用以衔接后面的异步操作
  // 提供默认回调函数
  onFulfilled = typeof onFulfilled === 'function' ? onFulfilled : value => value;
  onRejected = typeof onRejected === 'function' ? onRejected : error => { throw error };
  
  if(self.status === FULFILLED) {
    return bridgePromise = new MyPromise((resolve, reject) => {
      setTimeout(() => {
        try {
          let x = onFulfilled(self.value);
          resolvePromise(bridgePromise, x, resolve, reject);
        } catch (error) {
          reject(error);
        }
      })
    })
  }
  if(self.status === REJECTED) {
    return bridgePromise = new MyPromise((resolve, reject) => {
      setTimeout(() => {
        try {
          let x = onRejected(self.error);
          resolvePromise(bridgePromise, x, resolve, reject);
        } catch (error) {
          reject(error);
        }
      })
    })
  }
  if(self.status === PENDING) {
    // 为Promise添加成功回调和失败回调
    return bridgePromise = new MyPromise((resolve, reject) => {
      // resolve时会执行这个函数
      self.onFulfilledCallbacks.push((value) => {
        try {
          let x = onFulfilled(value);
          resolvePromise(bridgePromise, x, resolve, reject);
        } catch (error) {
          reject(error);
        }
      })
      // reject时会执行这个函数
      self.onRejectedCallbacks.push((error) => {
        try {
          let x = onRejected(error);
          resolvePromise(bridgePromise, x, resolve, reject);
        } catch (error) {
          reject(error);
        }
      })
    })
  }
}

// 添加then方法，实际上就是只传onRejected不传onFulfilled的then方法
MyPromise.prototype.catch = function (onRejected) {
  return this.then(null, onRejected);
}

// 根据返回值x的类型来resolve该promise
function resolvePromise(bridgePromise, x, resolve, reject) {
  if(x instanceof MyPromise) {
    if(x.status === PENDING) {
      x.then(y => {
        resolvePromise(bridgePromise,y,resolve,reject);
      }, err => {
        reject(err);
      })
    } else {
      x.then(resolve, reject);
    }
  } else {
    resolve(x);
  }
}

module.exports = MyPromise;