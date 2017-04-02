var promise = Promise.resolve(1).then(function(value){
  console.log(value);
  return new Promise(function(resolve, reject){
    setTimeout(function(){
      resolve(value + 1);
    }, 1000);
  });
}).then(function(value){
  console.log(value);
  return Promise.resolve(value + 1);
})