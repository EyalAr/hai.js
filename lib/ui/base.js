import $ from "jquery";
import when from "when/when";
import lessc from "less";
import Base from "../base";

var syms = {
    pElement: Symbol("pElement"),
    pStyleElement: Symbol("pStyleElement")
};

var viewsCache = {},
    stylesCache = {};

/**
 * Components of this class have a view - DOM component(s) associated with them.
 *
 * This class inherits from the Base class and adds:
 *
 * 1. DOM construction from HTML string / url to an html file.
 *
 * 2. Styling from LESS / CSS string / url.
 *
 * @extends Base
 */
class UIBase extends Base {

    /**
     * Build a new UIBase object
     *
     * @param {Object|String} view The view of this UI element.
     *
     * **As a string:**
     *
     * will try to detect if it's a url or html string. If url, will fetch it
     * with ajax get request and use the result as the view.
     *
     * **As an object:**
     *
     * 1. If contains 'element' property, will be treated as a DOM element and
     *    used directly.
     *
     * 2. If contains 'html' property, will be treated as html string.
     *
     * 3. If contains 'url' property, will be used to fetch content with ajax
     *    get request. In that case the entire object will be passed to jQuery's
     *    $.get method.
     *
     * If the object contains a 'transform' function, it will be called with
     * the html string. Its return value will be used instead of the html; which
     * may be a DOM element, jQuery element or a string.
     *
     * If the view is fetched from a url with ajax, it will be cached, unless
     * the object contains a 'skipCache: true' property.
     *
     * @param {Object|String} style The style of this UI element.
     *
     * **As a string:**
     *
     * will try to detect if it's a url or LESS/CSS string. If url, will fetch
     * it with ajax get request and use the result as the style. Will be treated
     * as LESS/CSS based on the extension, or fallback to LESS if can't detect.
     * If not a url, will be treated as a LESS style string.
     *
     * **As an object:**
     *
     * 1. If contains 'css' property, will be treated as a CSS string and
     *    injected to the head of the page.
     *
     * 2. If contains 'less' property, will be treated as a LESS string; and
     *    compiled by the LESS compiler before injected as CSS to the head of
     *    the page.
     *
     * 3. If contains 'url' property, will be used to fetch content with ajax
     *    get request. In that case the entire object will be passed to jQuery's
     *    $.get method.
     *
     * If the style is fetched from a url with ajax, it will be cached, unless
     * the object contains a 'skipCache: true' property.
     */
    constructor(view = { html: "<div></div>" }, style = { css: "" }){
        super(true);

        if (typeof view === "string") view = UIBase.normalizeViewString(view);
        if (typeof style === "string") style = UIBase.normalizeStyleString(style);

        var pView;
        if (view.element) {
            pView = when($(view.element));
        } else if (view.html) {
            if (view.transform) pView = view.transform(view.html).then(result => when($(result)));
            else pView = when($(view.html));
        } else if (view.url){
            if (viewsCache[view.url]){
                if (view.transform) pView = view.transform(viewsCache[view.url]).then(result => when($(result)));
                else pView = when($(viewsCache[view.url]));
            } else {
                pView = when($.ajax(view)).then(function(data){
                    if (!view.skipCache) viewsCache[view.url] = data;
                    if (view.transform) return view.transform(data).then(result => when($(result)));
                    else return $(data);
                });
            }
        } else throw Error("Template must contain DOM element, html string or url");
        pView = pView.then($el => $el.addClass(this.getId()));

        var pStyle, styleIsLess;
        if (style.css !== undefined){
            styleIsLess = false;
            if (style.transform) pStyle = when(style.transform(style.css));
            else pStyle = when(style.css);
        } else if (style.less !== undefined){
            styleIsLess = style.less !== "";
            if (style.transform) pStyle = when(style.transform(style.less));
            else pStyle = when(style.less);
        } else if (style.url){
            styleIsLess = style.url.indexOf(".less", style.url.length - 5) !== -1;
            if (stylesCache[style.url]){
                if (style.transform) pStyle = when(style.transform(style.css));
                else pStyle = when(stylesCache[style.url]);
            } else {
                pStyle = when($.ajax(style)).then(function(data){
                    if (!style.skipCache) stylesCache[style.url] = data;
                    if (style.transform) return when(style.transform(style.css));
                    else return data;
                });
            }
        } else throw Error("Style must contain css, less or url");

        this[syms.pStyleElement] = pStyle.then(function(style){
            if (styleIsLess) return when(lessc.render(style));
            else return when({css: style});
        }).then(function(output){
            return $("<style type='text/css'>" + output.css + "</style>");
        });

        this[syms.pElement] = when.join(
            pView,
            this[syms.pStyleElement]
        ).spread(function($el, $style){
            return $el;
        });
    }

    /**
     * Get a promise which resolves into the jQuery element of this component.
     *
     * @return {Promise}
     */
    getElement(){
        return this[syms.pElement];
    }

    /**
     * Apply this component's styles.
     *
     * @return {Promise}
     */
    start(){
        return this[syms.pStyleElement].then(function($style){
            $style.appendTo('head');
            return super.start()
        });
    }

    /**
     * Remove this component's styles.
     *
     * @return {Promise}
     */
    stop(){
        var that = this;
        return that[syms.pStyleElement].then(function($style){
            $style.detach();
            return super.stop();
        });
    }

    /**
     * Checks if the string contains html content.
     *
     * @param {String} str
     * @return {Boolean}
     * @private
     */
    static isHtmlString(str){
        return str.indexOf("<") !== -1;
    }

    /**
     * Checks if the string contains LESS/CSS.
     *
     * @param {String} str
     * @return {Boolean}
     * @private
     */
    static isStyleString(str){
        return str.indexOf("{") !== -1;
    }

    static normalizeViewString(view){
        if (UIBase.isHtmlString(view) || view === "") {
            return { html: view };
        } else {
            return { url: view };
        }
    }

    static normalizeStyleString(style){
        if (UIBase.isStyleString(style) || style === "") {
            return { less: style };
        } else {
            return { url: style };
        }
    }
}

export default UIBase;
