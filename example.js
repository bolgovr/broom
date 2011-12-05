var Loader = require('./lib/loader.js');


var flow = new Loader();

flow.setRoot(__dirname);

flow.registerPath('global', './test/sampleDirStructure', function () {
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
