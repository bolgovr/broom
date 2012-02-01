var assert = require('assert');
var Root = function(){
  this.dependencies = {'r':"/"};
  this.start = this.entry.bind(this);
};
Root.prototype.entry = function(cb,data){
  assert.equal(data.r.request,1);
  cb(null,true);
};

module.exports = Root;

