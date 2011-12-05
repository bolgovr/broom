var assert = require('assert');
var Loader = require('../lib/loader.js');
var vows = require('../node_modules/vows');

vows.describe('Testing directory loader').addBatch({
    'create loader with default params':{
        'topic':new Loader(),
        'testing default values':function (topic) {
            var defaultValues = {
                'moduleName':'name',
                'moduleDependencies':'deps',
                'moduleInitFunction':'onStart'
            };
            for (var i in topic._namingConvention) {
                assert.equal(defaultValues[i], topic._namingConvention[i], 'default value of ' + i + ' should be ' + defaultValues[i]);
            }
            assert.equal(topic.ignoreFolderPrefix, '.', 'default ignored folder prefix should be "."');
        },
        'try some loading':{
            'topic':function (loader) {
                loader.setRoot(__dirname);
                var cb = this.callback;
                loader.registerPath('global', 'sampleDirStructure', function (err, done) {
                        if (err === null && done === true) {
                            cb(null, loader);
                        } else {
                            cb(null, null);
                        }
                    }
                );
            },
            'test for errors while loading':function (err, loader) {
                assert.isNull(err);
                assert.isNotNull(loader);
                assert.isObject(loader);
            },
            'test raw loaded functions':function (topic) {
                assert.ok(topic.namespaces.global, "we're trying to load global namespace");
                assert.equal(topic.namespaces.global.length, 3, "we expect 3 functions");
            },
            'test flow control structure':{
                "topic":function (loader) {
                    var closureVar = {'a':'b'};
                    var flow = loader.getFlowTree('global', function (callback) {
                        callback(null, closureVar);
                    });
                    this.callback(null, flow);
                },
                'test start function':function (flow) {
                    var start = flow.start;
                    var closureVar = {'a':'b'};
                    var callback = function (err, data) {
                        assert.isNull(err);
                        assert.deepEqual(data, closureVar);
                    };
                    start(callback);
                },
                'test userAuthorization dummy func':function (flow) {
                    var auth = flow.userAuthorization.pop();
                    var dummyDataCorrect = {
                        'start':{
                            'user':{
                                'login':'r00t',
                                'password':'12345'
                            }
                        }
                    };
                    var dummyDataIncorrect = {
                        'start':{
                            'user':{
                                'login':'r00t1',
                                'password':'54321'
                            }
                        }
                    };
                    var callbackForCorrectData = function (err, result) {
                        assert.isNull(err);
                        assert.isTrue(result);
                    };
                    var callbackForIncorrectData = function (err, result) {
                        assert.isUndefined(result);
                        assert.isTrue(err instanceof Error);
                        assert.equal(err.message, 'I dont know you');
                    };

                    auth(callbackForCorrectData, dummyDataCorrect);
                    auth(callbackForIncorrectData, dummyDataIncorrect);
                }

            },
            'try full run of functions':function (topic) {
                var closureVar = {
                    'login':'r00t',
                    'password':'12345'
                };
                var startCorrect = function (callback) {
                    callback(null, {'user':closureVar});
                };
                var endCorrect = function (err, results) {
                    assert.isNull(err);
                    assert.isObject(results.start.user);
                    assert.isTrue(results.userAuthorization);
                    assert.isObject(results.insertBlogPost);
                    assert.equal(results.insertBlogPost.title, 'blog post inserted');
                    assert.equal(results.renderingAnswer, 'post blog post inserted created');

                };
                var startIncorrect = function (callback) {
                    callback(null, 'incorrectValue');
                };
                var endIncorrect = function (error, data) {
                    assert.isUndefined(data);
                    assert.isTrue(error instanceof Error);
                    assert.equal(error.message, 'I dont know you');
                };

                topic.run('global', startCorrect, endCorrect);
                topic.run('global', startIncorrect, endIncorrect);
            }

        }
    }
}).export(module);