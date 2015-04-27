import chai from "chai";
import sinon from "sinon";
import when from "when/when";
import $ from "jquery";
import UIBase from "../lib/ui/base";

var spy = sinon.spy,
    expect = chai.expect

function check(done, fn){
    return function(){
        try{
            fn.apply(null, arguments);
            done();
        } catch (e) {
            done(e);
        }
    };
}

describe("UIBase class", function(){

    describe("building a UI component with hard coded html and LESS", function(){

        var comp = new UIBase("<div class='parent'><span class='child'>foo</span></div>", ".parent{.child{display:none;}}"),
            $el;

        before(function(done){
            comp.getElement().then(function(_$el){
                _$el.appendTo("body");
                $el = _$el;
                done();
            });
        });

        describe("parent element", function(){

            it("should exist", function(){
                expect($el).to.exist;
            });

            it("should be visible", function(){
                expect($el.is(":visible")).to.be.true;
            });

            it("should be of type div", function(){
                expect($el.is("div")).to.be.true;
            });

        });

        describe("child element", function(){

            it("should exist", function(){
                expect($el.find(".child")).to.exist;
            });

            it("should not be visible", function(){
                expect($el.find(".child").is(":visible")).to.be.false;
            });

            it("should be of type span", function(){
                expect($el.find(".child").is("span")).to.be.true;
            });

            it("should contain the text 'foo'", function(){
                expect($el.find(".child").text()).to.be.equal("foo");
            });

        });

    });

    describe("building a UI component with html and LESS fetched by ajax", function(){

        var comp = new UIBase("/base/test/01.uibase_test.html", "/base/test/01.uibase_test.less"),
            $el;

        before(function(done){
            comp.getElement().then(function(_$el){
                _$el.appendTo("body");
                $el = _$el;
                done();
            });
        });

        describe("parent element", function(){

            it("should exist", function(){
                expect($el).to.exist;
            });

            it("should be visible", function(){
                expect($el.is(":visible")).to.be.true;
            });

            it("should be of type div", function(){
                expect($el.is("div")).to.be.true;
            });

        });

        describe("child element", function(){

            it("should exist", function(){
                expect($el.find(".child")).to.exist;
            });

            it("should be visible", function(){
                expect($el.find(".child").is(":visible")).to.be.false;
            });

            it("should be of type span", function(){
                expect($el.find(".child").is("span")).to.be.true;
            });

            it("should contain the text 'foo'", function(){
                expect($el.find(".child").text()).to.be.equal("foo");
            });

        });

    });

});
