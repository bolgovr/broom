var fs = require('fs'),
fspath = require('path'),
assert = require('assert'),
async = require('async'),
_ = require('underscore');
var Broom = function(namingConvention){
  this.convention = namingConvention || {};
  this.path = __dirname;
  this.tree = {};
  this.ignore ='.';
  this.flowTree = {}; 
  this.fileName = this.convention.fileName || 'broom.js';
  this.convention.fileName = this.convention.fileName || 'broom.js';
  this.convention.dependenciesName = this.convention.dependenciesName || 'dependencies';
  this.convention.entryName = this.convention.entryName || 'start';
};

Broom.prototype.setRootPath = function(path){
  this.path = path;
};

Broom.prototype.scan = function(dir,callback){
  this.workingDir = fspath.join(this.path,dir);
  var self = this;

  this._scanRecursive(this.workingDir,function(err,results){
    if(err){
      callback(err);
    }else{
      callback(null,results);
    }
  });
};
Broom.prototype.setRootArgs = function(args){
  this.flowTree['/'] = function(cb){
    cb(null,args);
  }; 
};
Broom.prototype.run = function(cb){
  async.auto(this.flowTree,cb);
};

Broom.prototype._handleFile = function(path){
  var TemporaryFileHandle = require(fspath.join(path.path,path.file));
  var fileHandler;
  try{
    fileHandler = new TemporaryFileHandle();
    assert.ok(fileHandler[this.convention.dependenciesName],'dependencies');
    assert.ok(fileHandler[this.convention.entryName],'start');
  }catch(e){
    console.log('cannot handle file \''+path.path+'\'');
    return false;
  }
  var deps = {};
  deps.values =_.values(fileHandler[this.convention.dependenciesName]);
  deps.keys = Object.keys(fileHandler[this.convention.dependenciesName]);
  deps.raw = fileHandler[this.convention.dependenciesName];
  var self = this;
  var handler = function(cb,data){
    var iterator,args={};
    for(iterator in deps.raw){
      args[iterator] = data[deps.raw[iterator]]||null;    
    }
    process.nextTick(function(){
      fileHandler[self.convention.entryName](cb,args);
    });
  };
  deps.values.push(handler);
  path.path = path.path.replace(this.workingDir,'');
  this.flowTree[path.path]= deps.values;
};

Broom.prototype._scanRecursive = function(path,done){
  var self = this;
  var results = {};
  if(path.indexOf(self.ignore)!==-1){
    return done(null);
  }
  fs.readdir(path, function(err, list) {
    if (err){
      return done(err);
    } 
    var pending = list.length;
    if (!pending){
      return done(null,results);
    }
    list.forEach(function(file) {
      if(file==self.fileName){
        self._handleFile({'path':path,'file':file});
      }
      file = fspath.join(path,file);
      fs.stat(file, function(err, stat) {
        if (stat && stat.isDirectory()) {
          self._scanRecursive(file, function(err, res) {
            _.extend(results,res);
            if (!--pending){
              return done(null,results);

            }
          });
        } else {
          if (!--pending){
            return done(null,results);
          }
        }
      });
    });
  });
};

module.exports = {
  'broom':Broom
}; 
