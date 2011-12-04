var insertBlogPost = function(){
    this.name='insertBlogPost';
    this.deps=['start','userAuthorization'];
    this.onStart = this.entryPoint.bind(this);
};
insertBlogPost.prototype.entryPoint = function(callback,data){
    callback(null,{'title':'blog post inserted'});
};
module.exports = insertBlogPost;