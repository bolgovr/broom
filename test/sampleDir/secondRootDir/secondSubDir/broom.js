var assert = require('assert');
var Root = function(){
  this.dependencies = {'r':"/secondRootDir"};
  this.start = this.entry.bind(this);
};
Root.prototype.entry = function(cb,data){
  assert.equal(data.r,true);
  cb(null,true);
};

module.exports = Root;

