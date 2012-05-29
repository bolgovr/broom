var BlogActions = function () {
  this.deps = {
    'main': '/',
    'statsSended': '/blogActions/sendStats',
    'viewCounter': '/blogActions/setPageView',
    'currentUser': '/getUser'
  };
  this.onStart = this.entryPoint.bind(this);
};
BlogActions.prototype.entryPoint = function (callback, data) {
  if (data.statsSended) {
    data.currentUser.incrementViews(data.viewCounter.exampleCounter + data.main.test);
  }
  callback(null, {
    'statsSended': data.statsSended,
    'pageViews': data.viewCounter
  });
};
module.exports = BlogActions;
