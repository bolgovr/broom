var GetUser = function () {
  this.deps = {
    'main': '/'
  };
  this.onStart = this.entryPoint.bind(this);
};
GetUser.prototype.entryPoint = function (callback, data) {
  setTimeout(function () {
    callback(null, {
      'incrementViews': function (cnt) {
        //incrementing views
        return cnt + 1;
      },
      'save': function (cb) {
        //saving user
        cb();
      },
      'login': 'test'
    });
  }, 20);
};
module.exports = GetUser;
