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
    if(value instanceof MyPromise) {
      value.then(resolve, reject);
    }
    if(self.status === PENDING){
      setTimeout(()=>{
        self.status = FULFILLED;
        self.value = value;
        self.onFulfilledCallbacks.forEach(callback => {
          callback(self.value);
        }, 0);
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
        }, 0)
      })
    }
  }

  try {
    fn(resolve, reject);
  } catch (error) {
    reject(error);    
  }
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
      }, 0)
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
      }, 0)
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
  // 避免循环引用
  if(x === bridgePromise) {
    return reject(new TypeError('Circular reference'));
  }

  let called = false;

  // x 为对象或者函数
  if (x != null && ((typeof x === 'object') || (typeof x === 'function'))){
    try{
      // 是否为thenable对象
      let then = x.then;
      if (typeof then === 'function') {
        then.call(x, y => {
          if(called) return;
          called = true;
          resolvePromise(bridgePromise, y, resolve, reject);
        }, error => {
          if(called) return;
          called = true;
          reject(error);
        })
      } else {
        // 非thenable对象，则以x为值进行fulfill
        resolve(x);
      }
    } catch (e) {
      if(called) return;
      called = true;
      reject(e);
    }
  } else {
    resolve(x);
  }
}

// MyPromise.all
MyPromise.all = function (promises) {
  return new MyPromise((resolve, reject) => {
    let result = [];
    let count = 0;
    for(let i = 0; i < promises.length; i++) {
      promises[i].then(data => {
        result[i] = data;
        if(++count === promises.length) {
          resolve(result);
        }
      }, err => {
        reject(err);
      });
    }
  });
}

// MyPromise.race
MyPromise.race = function(promises) {
  return new MyPromise((resolve, reject) => {
    for(let i = 0; i < promises.length; i++) {
      promises[i].then(data => {
        resolve(data);
      }, err => {
        reject(err);
      })
    }
  })
}

// MyPromise.resolve
MyPromise.resolve = function(value) {
  return new MyPromise(resolve => {
    resolve(value);
  })
}

// MyPromise.reject
MyPromise.reject = function(error) {
  return new MyPromise((resolve, reject) => {
    reject(error);
  })
}

// Promisify
MyPromise.promisify = function(fn) {
  return () => {
    var args = Array.from(arguments);
    return new MyPromise((resolve, reject) => {
      fn.apply(null, args.concat((err) => {
        err ? reject(err) : resolve(arguments[1]);
      }));
    })
  }
}

module.exports = MyPromise;