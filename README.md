Why?
=======

To prevent node.js devs from making applications with over 9k LOC in one file.

Installation
=======
  npm install broom


How can I use it?
=======

* Split your code into small pieces with single responsibility.
* From each piece of code make module.
* Name it.
* Declare module dependencies.
* Run broom

Example:

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


broom.run method expect:

* Declared namespace.
* First function(to put in closure variables).
* Last function which called when all done or any error occured(execution model build on top of async.auto).

Example with express:

	var Broom = require('broom');
	var app = require('express').createServer();
	var flow = new Broom();

	flow.setRoot(__dirname);

	flow.registerPath('global', './dirWithModules');

	app.get('/path/:var1/var2', function (req, res) {
  	  flow.run('global', function (callback) {
   	     callback(null, {'req':req}); //any module can access to req params through data.start.req
     }, function (err, data) {
   	 if (err) {
      	  res.end('error'); //if any error occured - that function will be called immediately
  	  } else {
     	   res.end(data.renderHTML); //if you have module with name renderHTML and it passes rendered template in callback
   	 }
	});



Module example

        var UserAuth = function () {
            this.name = 'userAuthorization'; //name of the module
            this.deps = ['start']; //dependency declaration
            this.onStart = this.entryPoint.bind(this); //module start point
        };
        UserAuth.prototype.entryPoint = function (callback, data) { //method will be called when "start" function is done
            var typicalUser = {
                'login':'r00t',
                'password':'12345'
            };
            var user = data.start.user || null;
            if (user && user.password == typicalUser.password && user.login == typicalUser.login) {
                callback(null, true);
            } else {
                callback(new Error('I dont know you'));
            }
        };


        module.exports = UserAuth;

For more check out example.js and test folder



Tests
=======
    vows test/test.js





Licence
=======
MIT
