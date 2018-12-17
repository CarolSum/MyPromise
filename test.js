const MyPromise = require('./Promise.js');

// let promise1 = new MyPromise((resolve, reject) => {
//   setTimeout(()=>{
//     console.log('1');
//     resolve(100);
//     console.log('2');
//   }, 0);
// }).then((value) => {
//   console.log(value);
// })

// let promise2 = new MyPromise((resolve, reject) => {
//   resolve(200);
// }).then((value) => {
//   console.log(value);
// }).then((value)=> {
//   console.log(value * 2);
// })

let p = new MyPromise((resolve, reject) => {
  resolve('p');
});

let f1 = function(data) {
  console.log(data)
  return new MyPromise((resolve, reject) => {
      resolve('f1');
  });
}
let f2 = function(data) {
  console.log(data)
  return new MyPromise((resolve, reject) => {
      reject('err');
  });
}
let f3 = function(data) {
  console.log(data);
}
let errorLog = function(error) {
  console.log(error)
}
p.then(f1).then(f2).then(f3).catch(errorLog)