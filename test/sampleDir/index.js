var Root = function(){
  this.dependencies = {'r':"/request"};
  this.start = this.entry.bind(this);
  this.end = this.endFunc.bind(this);
};
Root.prototype.entry = function(cb,data){
  console.log('request '+data.r);
  cb(null,true);
};

Root.prototype.endFunc = function(cb,data){
  console.log(' end func ');
  cb(null,true);
};

module.exports = Root;
