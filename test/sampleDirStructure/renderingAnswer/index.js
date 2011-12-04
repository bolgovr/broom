var Render = function(){
    this.name='renderingAnswer';
    this.deps = ['insertBlogPost'];
    this.onStart = this.entryPoint.bind(this);
};
Render.prototype.entryPoint = function(callback,data){
    callback(null,'post '+data.insertBlogPost.title+' created');
};
module.exports = Render;