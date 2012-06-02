#Why?
This is yet another try to solve callback hell and 500+ LOC files. Split your codebase into small easy to test and maintain modules and feed it to Broom. It will run your code according
to each module dependencies. Broom will handle parallel and sequental execution of your modules where it needed.
[![Build Status](https://secure.travis-ci.org/bolgovr/broom.png)](http://travis-ci.org/bolgovr/broom)
#How can I install it?

`npm install broom`

#How can I use it?

assume you have directory structure like this:

 * app
    * modules
        * first
            * index.js
        * second
            * index.js
        * third
            * index.js

*yourapp.js*
```javascript
  var Broom = require('broom').broom;
  var flow = new Broom({
    'fileName': 'index.js', //Broom will hunt for only for files with this name, so you can put any other files in brooms module directory.
    'dependenciesName': 'deps', //Broom will check this property for module dependencies
    'entryName': 'onStart' //What function Broom should run
  });
  flow.setRootPath(__dirname); //pointing to modules root directory

  flow.scan('./app/modules', function (err, done) { //path is relative to rootPath
    if (!done) {
      console.error('broom scan dirs completed with errors');
      console.dir(err);
      process.exit(1);
    }
  });

  //then set root arguments, you can reach them with {'main': '/'} in deps property of your modules
  flow.setRootArgs({'request': request, 'models': models}); //assume that we handling http request

  //run it
  flow.run(function (err, data) {
    //if any module pass error as first parameter to callback - flow will stop immideately and call final callback

    //you can reach results of your modules by path to index.js from Broom`s root
    data['/first'];
  });

```

###module example


*first/index.js*
```javascript
var MyFirstModule = function () {
  this.deps = {
    'main': '/',
    'sec': '/second',
    'third': '/third'
  };
  this.onStart = this.entryPoint.bind(this);
};
MyFirstModule.prototype.entryPoint = function (callback, data) {
  //here you can access results of second/index.js with data.sec
  callback(null, {});
};
module.exports = MyFirstModule;
```
*second/index.js*
```javascript
var MySecondModule = function () {
  this.deps = {
    'main': '/'
  };
  this.onStart = this.entryPoint.bind(this);
};
MySecondModule.prototype.entryPoint = function (callback, data) {
  //here you can access root args with data.main

  setTimeout(function () { //all dependent modules will run only when you call callback with results
    callback(null, {});
  }, 1000);


};
module.exports = MySecondModule;
```

*third/index.js*
```javascript
var MyThirdModule = function () {
  this.deps = {
    'main': '/'
  };
  this.onStart = this.entryPoint.bind(this);
};
MyThirdModule.prototype.entryPoint = function (callback, data) {
  //here you can access root args with data.main
  callback(null, {});
};
module.exports = MyThirdModule;
```

Modules *second* and *third* will execute in parallel, and than *first* module will executed with results of *second* and *third* modules, after that final callback will be called with all results.

If any module pass error as it first parameter - Broom will stop and call final callback(passed to *run* function) with error

#catching errors API

###Broom.testTree()
validate all dependencies in execution tree, it will output to console all unresolved, circular dependencies and when module depends on itself situations.

###Broom.debug
if set to `true`, Broom will look for functions that executes more than Broom.timeLimit mseconds and output into console it's name and arguments.

###Broom.timeLimit
max execution time in milliseconds for single function.


#Licence
MIT

