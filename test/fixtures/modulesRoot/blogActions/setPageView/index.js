var SetPageView = function () {
  this.deps = {
    'main': '/',
  };
  this.onStart = this.entryPoint.bind(this);
};
SetPageView.prototype.entryPoint = function (callback, data) {
  //incrementing counter somewhere
  data.main.test++; //it actually *very* bad practice(change incoming arguments), it's just for testing
  callback(null, {'exampleCounter': 1});
};
module.exports = SetPageView;
