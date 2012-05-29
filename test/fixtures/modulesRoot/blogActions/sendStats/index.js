var SendStats = function () {
  this.deps = {
    'main': '/',
  };
  this.onStart = this.entryPoint.bind(this);
};
SendStats.prototype.entryPoint = function (callback, data) {
  //hardcore stat sending action
  callback(null, true);
};
module.exports = SendStats;
