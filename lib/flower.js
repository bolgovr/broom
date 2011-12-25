var async = require('async');
var Flower = function (modules) {
    this._moduleContainer = modules || {};
    this._flows = {};
    this._currentFlow = '';
    this._lastAdded = null;
};

Flower.prototype.setModuleContainer = function (modules) {
    for (var m in modules) {
        this._moduleContainer[m] = modules[m];
    }


};
Flower.prototype.createFlow = function (flowname, startFunc) {
    if (flowname) {
        this._flows[flowname] = {};
        this._currentFlow = flowname;
        this._lastAdded = 'start';
        this._prevAdded = 'start';
        this._flows[flowname][this._lastAdded] = [startFunc];
        return this;
    } else {
        throw new Error('you should specify name of new flow');
    }
};
Flower.prototype.then = function (name) {
    if (this._lastAdded === null) {
        this._lastAdded = 'start';
    }
    if (Object.prototype.toString.call(name) === '[object Array]') {
        for (var i = 0, len = name.length; i < len; i++) {
            if (name[i] in this._moduleContainer) {
                this.and(name[i]);
            }
        }
    } else if (name in this._moduleContainer) {
        var workingUnit = this._moduleContainer[name];
        this._flows[this._currentFlow][name] = [this._lastAdded, workingUnit[workingUnit.length - 1]];
        this._prevAdded = this._lastAdded;
        this._lastAdded = name;


    } else {
        throw new Error('module not found');
    }
    return this;
};
Flower.prototype.and = function (name) {
    if (name in this._moduleContainer && this._lastAdded !== null) {
        var workingUnit = this._moduleContainer[name];

        this._flows[this._currentFlow][name] = [this._prevAdded, workingUnit[workingUnit.length - 1]];
        this._lastAdded = name;
        return this;
    } else {
        throw new Error('module not found');
    }
};
Flower.prototype.getCurrentFlow = function () {
    return
};
Flower.prototype.run = function (finalFunc) {
    async.auto(this._flows[this._currentFlow], finalFunc);
}

module.exports = Flower;
