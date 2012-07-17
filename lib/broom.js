var fs = require('fs'),
    fspath = require('path'),
    assert = require('assert'),
    async = require('async'),
    _ = require('underscore');

/**
 * @constructor
 * @this Broom
 * @param namingConvention {object} naming convention
 */

var Broom = function (namingConvention) {
  this.convention = namingConvention || {};
  this.path = __dirname;
  this.tree = {};
  //containers for functions executed before and after each module, useful for debug and profile
  //used only with debug = true
  this.beforeEach = [];
  this.afterEach = [];
  this.debug = false;
  this.timeLimit = 100;
  this.flowTree = {};
  this.fileName = this.convention.fileName || 'broom.js';
  this.convention.fileName = this.convention.fileName || 'broom.js';
  this.convention.dependenciesName = this.convention.dependenciesName || 'dependencies';
  this.convention.entryName = this.convention.entryName || 'start';
};




/**
 * Set root path different from __dirname
 * @param {string} path
 * @this Broom
 */

Broom.prototype.setRootPath = function (path) {
  this.path = path;
};

/**
 * normalize path to actual modules relative to root
 * @param {string} dir directory relative to root
 * @param {function} callback callback
 * @this Broom
 */

Broom.prototype.scan = function (dir, callback) {
  this.workingDir = fspath.join(this.path, dir);
  this._scanRecursive(this.workingDir, callback);
};

/**
 * set arguments that can be reached in modules via '/' dependency
 * @param {mixed} arguments
 * @this Broom
 */

Broom.prototype.setRootArgs = function (args) {
  this.flowTree['/'] = function (cb) {
    cb(null, args);
  };
};

/**
 * runs all functions in flow tree
 * @param {function} cb final callback
 * @this Broom
 */

Broom.prototype.run = function (cb) {
  async.auto(this.flowTree, cb);
};

/**
 * handles single module file, check it according to namingConvention and create it instance
 * @param {path} path
 * @this Broom
 */

Broom.prototype._handleFile = function (path) {
  var TemporaryFileHandle = require(fspath.join(path.path, path.file));
  var fileHandler;
  try {
    fileHandler = new TemporaryFileHandle();
    assert.ok(fileHandler[this.convention.dependenciesName], 'dependencies');
    assert.ok(fileHandler[this.convention.entryName], 'start');
  } catch (e) {
    console.log('cannot handle file \'' + path.path + '\'');
    return false;
  }
  var deps = {};
  deps.values = _.values(fileHandler[this.convention.dependenciesName]);
  deps.keys = Object.keys(fileHandler[this.convention.dependenciesName]);
  deps.raw = fileHandler[this.convention.dependenciesName];
  var self = this;
  var handler = function (cb, data) {
    var iterator, args = {};
    for (iterator in deps.raw) {
      args[iterator] = data[deps.raw[iterator]];
    }
    process.nextTick(function () {
      fileHandler[self.convention.entryName](cb, args);
    });
  };
  deps.values.push(handler);
  path.path = path.path.replace(this.workingDir, '');
  this.flowTree[path.path] = deps.values;
};

/**
 * do the same as _handleFile but adds timeout function to monitor function execution time
 * @param {path} path
 * @this Broom
 */

Broom.prototype._handleFileDebug = function (path) {
  var TemporaryFileHandle = require(fspath.join(path.path, path.file));
  var fileHandler;
  try {
    fileHandler = new TemporaryFileHandle();
    assert.ok(fileHandler[this.convention.dependenciesName], 'dependencies');
    assert.ok(fileHandler[this.convention.entryName], 'start');
  } catch (e) {
    console.log('cannot handle file \'' + path.path + '\'');
    return false;
  }
  var deps = {};
  deps.values = _.values(fileHandler[this.convention.dependenciesName]);
  deps.keys = Object.keys(fileHandler[this.convention.dependenciesName]);
  deps.raw = fileHandler[this.convention.dependenciesName];
  var self = this;
  var handler = function (cb, data) {
    var iterator, args = {};
    for (iterator in deps.raw) {
      args[iterator] = data[deps.raw[iterator]] || null;
    }
    var time = setTimeout(function () {
      console.log('function ' + path.path + ' executing more than ' + self.timeLimit + ' ms');
      console.dir(args);
    }, self.timeLimit);
    process.nextTick(function () {
      var results = [];
      function onBeforeEach(func) {
        results.push(func(path.path, args));
      }
      function onAfterEach(func) {
        func(path.path, results);
      }
      self.beforeEach.forEach(onBeforeEach);
      fileHandler[self.convention.entryName](function (err, results) {
        self.afterEach.forEach(onAfterEach);
        clearTimeout(time);
        cb(err, results);
      }, args);
    });
  };
  deps.values.push(handler);
  path.path = path.path.replace(this.workingDir, '');
  this.flowTree[path.path] = deps.values;


};

/**
 * test tree for different kinds of errors: unresolved deps, depend on inself and circular dependencies
 * @param {Object} tree tree to test
 * @param {function} callback
 * @this Broom
 */

Broom.prototype.testTree = function (tree) {
  var testedTree = tree || this.flowTree;
  for (var leaf in testedTree) {
    var deps = testedTree[leaf];
    if (typeof deps === 'function') { //if leaf equal root
      continue;
    }
    deps.forEach(function (dependency) {
      if (typeof dependency !== 'function' && dependency !== '/') {
        if (!testedTree[dependency]) {
          console.error('found unresolved dependency "' + dependency + '" in leaf ' + leaf);
        }
        if (dependency === leaf) {
          console.error('module ' + leaf + ' depends on itself');
        }
        if (testedTree[dependency].indexOf(leaf) !== -1) {
          console.error('circular dependencies in ' + leaf + ' and ' + dependency);
        }
      }
    });
  }
};
/**
 * recursively scans directory and pass it to handleFile* functions, also return list of files that suitable for namingConvention
 * @param {string} path directory to scan
 * @param {function} done final callback
 * @this Broom
 */
Broom.prototype._scanRecursive = function (path, done) {
  var self = this;
  var results = {};
  fs.readdir(path, function (err, list) {
    if (err) {
      return done(err);
    }
    var pending = list.length;
    if (!pending) {
      return done(null, results);
    }
    list.forEach(function (file) {
      if (file === self.fileName) {
        if (self.debug === true) {
          self._handleFileDebug({'path': path, 'file': file});
        } else {
          self._handleFile({'path': path, 'file': file});
        }
      }
      file = fspath.join(path, file);
      fs.stat(file, function (err, stat) {
        if (stat && stat.isDirectory()) {
          self._scanRecursive(file, function (err, res) {
            _.extend(results, res);
            if (!--pending) {
              return done(null, results);

            }
          });
        } else {
          if (!--pending) {
            return done(null, results);
          }
        }
      });
    });
  });
};

module.exports = {
  'broom': Broom
};
