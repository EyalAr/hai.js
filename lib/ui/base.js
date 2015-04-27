import $ from "jquery";
import when from "when/when";
import lessc from "less";
import Base from "../base";

var syms = {
    pElement: Symbol("pElement")
};

var viewsCache = {},
    stylesCache = {};

class UIBase extends Base {

    /**
     * Build a new UIBase object
     *
     * @param {Object, String} view The view of this UI element. If a string,
     * will try to detect if it's a url or html string. If url, will fetch it
     * with ajax get request and use the result as the view.
     * As an object:
     * 1. If contains 'element' property, will be treated as a DOM element and
     *    used directly.
     * 2. If contains 'html' property, will be treated as html string.
     * 3. If contains 'url' property, will be used to fetch content with ajax
     *    get request. In that case the entire object will be passed to jQuery's
     *    $.get method.
     * If the view is fetched from a url with ajax, it will be cached, unless
     * the object contains a 'skipCache: true' property.
     *
     * @param {Object, String} style The style of this UI element. If a string,
     * will try to detect if it's a url or LESS/CSS string. If url, will fetch
     * it with ajax get request and use the result as the style. Will be treated
     * as LESS/CSS based on the extension, or fallback to LESS if can't detect.
     * If not a url, will be treated as a LESS style string.
     * As an object:
     * 1. If contains 'css' property, will be treated as a CSS string and
     *    injected to the head of the page.
     * 2. If contains 'less' property, will be treated as a LESS string; and
     *    compiled by the LESS compiler before injected as CSS to the head of
     *    the page.
     * 3. If contains 'url' property, will be used to fetch content with ajax
     *    get request. In that case the entire object will be passed to jQuery's
     *    $.get method.
     * If the style is fetched from a url with ajax, it will be cached, unless
     * the object contains a 'skipCache: true' property.
     */
    constructor(view = { html: "<div></div>" }, style = { css: "" }){
        super(true);

        if (typeof view === "string") {
            if (UIBase.isHtmlString(view) || view === "") {
                view = { html: view };
            } else {
                view = { url: view };
            }
        }
        if (typeof style === "string") {
            if (UIBase.isStyleString(style) || style === "") {
                style = { less: style };
            } else {
                style = { url: style };
            }
        }

        var pView;
        if (view.element || view.html) {
            pView = when($(view.element || view.html));
        } else if (view.url){
            if (viewsCache[view.url]){
                pView = when($(viewsCache[view.url]));
            } else {
                pView = when($.get(view)).then(function(data){
                    if (!view.skipCache) viewsCache[view.url] = data;
                    return $(data);
                });
            }
        } else throw Error("Template must contain DOM element, html string or url");
        pView = pView.then($el => $el.addClass(this.getId()));

        var pStyle, styleIsLess, styleInCache;
        if (style.css !== undefined){
            styleIsLess = false;
            pStyle = when(style.css);
        } else if (style.less !== undefined){
            styleIsLess = style.less !== "";
            pStyle = when(style.less);
        } else if (style.url){
            styleIsLess = style.url.indexOf(".less", style.url.length - 5) !== -1;
            if (styleInCache = !!stylesCache[style.url]){
                pStyle = when(stylesCache[style.url]);
            } else {
                pStyle = when($.get(style)).then(function(data){
                    if (!style.skipCache) stylesCache[style.url] = data;
                    return data;
                });
            }
        } else throw Error("Style must contain css, less or url");

        this[syms.pElement] = when.join(
            pView,
            pStyle
        ).spread(function($el, style){
            var p;
            if (styleIsLess) p = lessc.render(style);
            else p = when({css: style});
            return p.then(function(output){
                // enough to append this style to the head only once...
                if (!styleInCache)
                    $("<style type='text/css'>" + output.css + "</style>").appendTo("head");
                return $el;
            });
        });
    }

    /**
     * Get a promise which resolves into the jQuery element of this component.
     * @return {Promise}
     */
    getElement(){
        return this[syms.pElement];
    }

    /**
     * Checks if the string contains html content.
     * @param {String} str
     * @return {Boolean}
     */
    static isHtmlString(str){
        return str.indexOf("<") !== -1;
    }

    /**
     * Checks if the string contains LESS/CSS.
     * @param {String} str
     * @return {Boolean}
     */
    static isStyleString(str){
        return str.indexOf("{") !== -1;
    }
}

export default UIBase;
