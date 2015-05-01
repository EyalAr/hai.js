import UIBase  from "../base";
import $       from "jquery";
import when    from "when/when";
import Ractive from "ractive";

var syms = {
    model: Symbol("model"),
    pView: Symbol("pView"),
    ons: Symbol("ons")
};

/**
 * @extends UIBase
 */
class BoundUIBase extends UIBase {

    /**
     * Build a new BoundUIBase object.
     *
     * @param {Object|String} template Template for the view. See docs of UIBase.
     * @param {Object|String} style See docs of UIBase.
     * @param {Object} model The data to bind to the view
     */
    constructor(template = { html: "<div></div>" }, style = { css: "" }, model = {}){
        if (typeof template === "string") template = UIBase.normalizeViewString(template);

        var _template = {}, dView = when.defer();
        Object.keys(template).forEach(prop => _template[prop] = template[prop]);
        _template.transform = function(data){
            var $stub = $("<div>");
            var view = new Ractive({
                template: data,
                el: $stub,
                data: model
            });
            dView.resolve(view);
            return when($stub.children());
        };

        super(_template, style);
        this[syms.model] = model;
        this[syms.ons] = [];
        this[syms.pView] = dView.promise;
    }

    on(...args){
        this[syms.ons].push(args);
        if (this.isStarted()){
            this[syms.pView].then(function(view){
                view.on(...args);
            });
        }
    }

    off(...args){
        this[syms.ons] = [];
        if (this.isStarted()){
            this[syms.pView].then(function(view){
                view.off(...args);
            });
        }
    }

    set(...args){
        this[syms.pView].then(function(view){
            view.set(...args);
        });
    }

    get(...args){
        this[syms.pView].then(function(view){
            view.get(...args);
        });
    }

    start(){
        var that = this;
        return super.start().then(function(){
            return that[syms.pView].then(function(view){
                that[syms.ons].forEach(args => view.on(...args));
            });
        });
    }

    stop(){
        var that = this;
        return super.stop().then(function(){
            return that[syms.pView].then(function(view){
                view.off();
            });
        });
    }
}

export default BoundUIBase;
