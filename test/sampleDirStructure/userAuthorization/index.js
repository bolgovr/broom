var UserAuth = function(){
  this.name='userAuthorization';
  this.deps = ['start'];
  this.onStart = this.entryPoint.bind(this);
};
UserAuth.prototype.entryPoint = function(callback,data){
    var typicalUser = {
        'login':'r00t',
        'password':'12345'
    };
    var user = data.start.user;
    if(user&&user.password==typicalUser.password&&user.login==typicalUser.login){
        callback(null,true);
    }else{
        callback(new Error('I dont know you'));
    }
}



module.exports = UserAuth;

