#Why?
This is yet another try to solve callback hell and 500+ LOC files. Split your codebase into small easy-to-test and maintain modules and feed it to broom. It will run your code according
to each module dependencies. Broom will handle parallel and sequental execution of your modules where is needed.

#How can I install it?

`npm install broom`

#How can I use it?

assume we have directory structure like this:
  app
  -modules
   -first
    -index.js
   -second
    -index.js
   -third
    -index.js
*yourapp.js*
```javascript
  var Broom = require('broom').broom;
  var flow = new Broom({
    'fileName': 'index.js', //Broom will hunt for only for modules with this name, so you can put any files in brooms module directory.
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
  flow.setRootArgs({'request': request, 'models': models});

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

```


