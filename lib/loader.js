var fs = require('fs'),
    fspath = require('path'),
    assert = require('assert');

function Loader(pathContainer, defaultFilename, convention) {
    this.pathContainer = pathContainer || {};
    this._path = {};
    this._filenames = defaultFilename || 'index.js';
    this.namespaces = {};
    if (!convention) {
        convention = {};
    }
    this.ignoreFolderPrefix = convention.ignoreFolderPrefix || '.';

    this._namingConvention = {
        'moduleName':convention.name || 'name',
        'moduleDependencies':convention.deps || 'deps',
        'moduleInitFunction':convention.entry || 'onStart'
    };
}
Loader.prototype.registerNamespace = function (namespace) {
    if (!this.namespaces[namespace]) {
        this.namespaces[namespace] = [];
    }
};
Loader.prototype.registerPath = function (path) {
    if (!this.pathContainer[path]) {

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
            console.log(object);
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
    this.registerNamespace(ns);
    function loadSubDirs(subDirPath, cb) {
        var useExceptions = typeof(cb) !== 'function';
        fs.readdir(subDirPath, function (err, dirs) {
            if (err) {
                if (useExceptions) {
                    throw new Error(err);
                } else {
                    cb(err);
                }
            } else {
                if (useExceptions) {
                    //do nothing
                } else {
                    cb(null, dirs);
                }
            }

        });

    }

    if (fspath.existsSync(path)) {
        var requireModuleName = this._filenames;
        loadSubDirs(path, function (err, subDirs) {
            for (var _dir in subDirs) {
                if (subDirs[_dir].indexOf(self.ignoreFolderPrefix) === 0) {
                    //hidden folder
                    continue;
                }
                var _requirePath = fspath.join(path, subDirs[_dir], requireModuleName);
                console.log(_requirePath);
                try {
                    var _module = require(_requirePath);
                } catch (e) {
                    //do nothing, probably
                }
                self._testRequiredModule(_module, function (err, testedModule) {
                    self.namespaces[ns].push(testedModule);
                });


            }
        });
    }
};