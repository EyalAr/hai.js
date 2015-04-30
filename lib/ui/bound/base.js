import UIBase  from "../base";
import $       from "jquery";
import when    from "when/when";
import Ractive from "ractive";

var syms = {
    model: Symbol("model"),
    view: Symbol("view"),
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

        var _template = {}, view;
        Object.keys(template).forEach(prop => _template[prop] = template[prop]);
        _template.transform = function(data){
            var $stub = $("<div>");
            view = new Ractive({
                template: data,
                el: $stub,
                data: model
            });
            return when($stub.children());
        };

        super(_template, style);
        this[syms.model] = model;
        this[syms.ons] = [];
        this[syms.view] = view;
    }

    on(...args){
        this[syms.ons].push(args);
        if (this.isStarted()){
            this[syms.view].on(...args);
        }
    }

    off(...args){
        this[syms.ons] = [];
        if (this.isStarted()){
            this[syms.view].off(...args);
        }
    }

    set(...args){
        this[syms.view].set(...args);
    }

    get(...args){
        this[syms.view].get(...args);
    }

    start(){
        this[syms.ons].forEach(args => this[syms.view].on(...args));
        return super.start();
    }

    stop(){
        this[syms.view].off();
        return super.stop();
    }
}

export default BoundUIBase;
