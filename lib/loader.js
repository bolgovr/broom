var fs = require('fs'),
    fspath = require('path'),
    assert = require('assert'),
    async = require('../node_modules/async');
function Loader(convention) {
    this.pathContainer = {};
    if (!convention) {
        convention = {};
    }
    this._filenames = convention.defaultFile || 'index.js';
    this.namespaces = {};
    this.ignoreFolderPrefix = convention.ignoreFolderPrefix || '.';
    this._moduleRoot = '';
    this._namingConvention = {
        'moduleName':convention.name || 'name',
        'moduleDependencies':convention.deps || 'deps',
        'moduleInitFunction':convention.entry || 'onStart'
    };
}
Loader.prototype._registerNamespace = function (namespace) {
    if (!this.namespaces[namespace]) {
        this.namespaces[namespace] = [];
    }
};
Loader.prototype.setRoot = function (dir) {
    this._moduleRoot = dir;
};
Loader.prototype.registerPath = function (ns, path) {
    this._registerNamespace(ns);

    if (!this.pathContainer[path]) {
        this._loadPath(ns, path);
    }
};
Loader.prototype._testRequiredModule = function (requiredObj, callback) {
    var self = this;
    var cb = typeof callback === 'function' ? callback : function () {
    };
    var tests = {
        'isFunction':function (object) {
            assert.equal(typeof object, 'function');
        },
        'isConstructor':function (object) {
            assert.doesNotThrow(function () {
                new object();
            });
        },
        'hasRequiredFields':function (object) {
            var testableObject = new object();
            for (var requiredField in self._namingConvention) {
                assert.ok(testableObject[self._namingConvention[requiredField]], 'object should have ' + requiredField);
            }
        }
    };


    for (var test in tests) {
        tests[test](requiredObj);
    }
    cb(null, requiredObj);

};


Loader.prototype._loadPath = function (ns, path) {
    var self = this;

    function loadSubDirs(subDirPath, cb) {
        var useExceptions = typeof(cb) !== 'function';
        var callback = typeof (cb) ==='function'?cb:function(){};

        fs.readdir(subDirPath, function (err, dirs) {
            if (err) {
                if (useExceptions) {
                    throw new Error(err);
                } else {
                    cb(err);
                }
            } else {
                cb(null, dirs);

            }

        });

    }

    if (fspath.existsSync(path)) {
        var _requireModuleName = this._filenames;
        loadSubDirs(path, function (err, subDirs) {
            for (var _dir in subDirs) {
                if (subDirs[_dir].indexOf(self.ignoreFolderPrefix) === 0) {
                    //folder ignored
                    continue;
                }
                var _requirePath = fspath.join(self._moduleRoot, path, subDirs[_dir], _requireModuleName);
                var _module = require(_requirePath);
                if(typeof _module === 'object'){
                    console.log('are you sure that file '+_requirePath+' has "module.exports"?');
                    continue;
                }
                self._testRequiredModule(_module, function (err, testedModule) {
                    if (!err) {
                        self.namespaces[ns].push(testedModule);
                    }
                });


            }
        });
    }
};

Loader.prototype.getFlowTree = function (ns,startFunction) {
    var _modules = [];
    if (!this.namespaces[ns]) {
        return false;
    }

    if (ns instanceof Array) {
        for (var iter = 0; iter < this.namespaces[ns].length; iter++) {
            _modules.concat(this.namespaces[ns]);
        }
    } else {
        _modules = this.namespaces[ns];
    }

    var _flow = {
        'start': typeof startFunction ==='function'?startFunction:function(callback){callback(null,null)}
    };
    var mName = this._namingConvention.moduleName;
    var mDeps = this._namingConvention.moduleDependencies;
    var mEntry = this._namingConvention.moduleInitFunction;

    for (iter = 0, len = _modules.length; iter < len; iter++) {
        var _newObject = new _modules[iter]();
        if (_flow[_newObject[mName]]) {
            //such named object already instantiated
            throw new Error('duplicate objects with name ' + _newObject[mName]);
        }
        _flow[_newObject[mName]] = _newObject[mDeps].concat(_newObject[mEntry]);
    }
    return _flow;
};
Loader.prototype.run=function(ns,startFunction,endFunction){
    var flow = this.getFlowTree(ns,startFunction);
    async.auto(flow,endFunction);
};

module.exports = Loader;


