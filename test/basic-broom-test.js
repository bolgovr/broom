var Broom = require('../lib/broom.js').broom;
var assert = require('assert');
describe("#basic",function(){
  var handler;
  beforeEach(function(done){
    handler = new Broom();
    handler.setRootPath(__dirname); 
    done();
  });

  it('it should contain empty structure',function(done){
    assert.deepEqual(handler.tree,{});
    done();

  });

  it('should has current directory as root',function(done){
    assert.equal(handler.path,__dirname);
    done(); 
  });

  describe('#scanning tree',function(){
    beforeEach(function(done){
      handler.scan('./sampleDir',done);    
    });

    it('should contain all top level directories as root modules ',function(done){
      assert.ok(handler.flowTree['/firstRootDir']);
      assert.ok(handler.flowTree['/secondRootDir']);
      assert.ok(handler.flowTree['/thirdRootDir']);
      done();

    });
    it('should be able set start function args',function(done){
      handler.setRootArgs({'request':1});
      assert.ok(handler.flowTree['/']); 
      done();
    }); 
    describe('#running',function(){
      beforeEach(function(done){
        handler.setRootArgs({'request':1}); 
        done();
      });
      it('should call callback function when all done',function(done){
        handler.run(done);      
      });
      it('should pass in last callback correct args',function(done){
        handler.run(function(err,args){
          assert.equal(err,null);
          assert.equal(args['/secondRootDir'],true);
          assert.equal(args['/'].request,1);
          assert.equal(args['/thirdRootDir'],true);
          assert.equal(args['/secondRootDir/secondSubDir'],true);
          done();
        });


      });

    }); 
  });

});

describe('#wrong root dir',function(){
  it("should return error",function(done){
    handler.setRootPath(__dirname);
      assert.ok(err instanceof Error);
    });
  it("should not return error",function(done){
    var handler = new Broom();
    handler.setRootPath(__dirname);
    handler.scan('./',function(err,result){
      assert.equal(false, err instanceof Error);
      done();
    });
  });
});
