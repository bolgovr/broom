Why?
=======

To prevent node.js devs from applications with over 9k LOC in one file.

Installation
=======
  npm install broom


How can I use it?
=======

*Split your code into small pieces with single responsibility
*From each piece of code make module.
*Name it.
*declare module dependencies.
*run broom

	var Broom = require('broom');

	var flow = new Broom();

	flow.setRoot(__dirname);

	flow.registerPath('global', './dirWithModules', function () {
  	  var user = {
   	     'login':'r00t',
    	    'password':'12345'
   	 };
    		flow.run('global', function (callback) {
    	 	   callback(null, {'user':user});
    		}, function (err, data) {
    	 	   console.log(arguments);
    		});
        });


broom.run method expect
*modules namespace name
*first function(to put in closure variables)
*last function which called when all done or any error occured(execution model build on top of async.auto)

Example with express:

	var Broom = require('broom');
	var app = require('express').createServer();
	var flow = new Broom();

	flow.setRoot(__dirname);

	flow.registerPath('global', './dirWithModules');

	app.get('/path/:var1/var2', function (req, res) {
  	  flow.run('global', function (callback) {
   	     callback(null, {'req':req}); //any module can access to req params throgh 	data.start.req
   	 });


	}, function (err, data) {
   	 if (err) {
      	  res.end('error'); //if any error occured - that function will be called immidiately
  	  } else {
     	   res.end(data.renderHTML); //if you have module with name renderHTML and it passes rendered template in callback
   	 }
	});

For more check out example.js and test folder

Tests
=======
    vows test/test.js





Licence
=======
MIT
