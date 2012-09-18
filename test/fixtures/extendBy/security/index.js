var ValidateUser = function () {
  this.deps = {
    'main': '/',
    'currentUser': '/getUser'
  };
  this.onStart = this.entryPoint.bind(this);
};
ValidateUser.prototype.entryPoint = function (callback, data) {
  if (data.currentUser.login === 'test') {
    callback(null, true); //valid user
  } else {
    callback(null, false); //not valid user
  }
};
module.exports = ValidateUser;
