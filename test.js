const MyPromise = require('./Promise.js');

let promise1 = new MyPromise((resolve, reject) => {
  setTimeout(()=>{
    console.log('1');
    resolve(100);
    console.log('2');
  }, 0);
}).then((value) => {
  console.log(value);
})

let promise2 = new MyPromise((resolve, reject) => {
  resolve(200);
}).then((value) => {
  console.log(value);
}).then((value)=> {
  console.log(value * 2);
})