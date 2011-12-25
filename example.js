var Loader = require('./lib/loader.js');
var async = require('async');
var FlowerLib = require('./lib/flower.js');

var flower = new FlowerLib();
var flow = new Loader();

flow.setRoot(__dirname);

flow.registerPath('global', './test/sampleDirStructure', function () {
    var user = {
        'login':'r00t',
        'password':'12345'
    };
    flower.setModuleContainer(flow.getFlowTree('global'));
    var startfunc = function (callback, data) {
        callback(null, {'user':user})
    };
    flower.createFlow('test', startfunc).then('userAuthorization').and('insertBlogPost')
        .then('renderingAnswer').run(function (err, data) {
            console.log(arguments);
        });


    flow.run('global', function (callback) {
        callback(null, {'user':user});
    }, function (err, data) {
        console.log(arguments);
    });

});
