var GetUser = function () {
  this.deps = {
    'main': '/',
    'readyActions': '/blogActions',
    'currentUser': '/getUser'
  };
  this.onStart = this.entryPoint.bind(this);
};
GetUser.prototype.entryPoint = function (callback, data) {
  //this module runs after blogActions index, so currentUser counter should be incremented
  data.currentUser.save(callback);
};
module.exports = GetUser;
