import chai from "chai";
import sinon from "sinon";
import when from "when/when";
import $ from "jquery";
import UIBase from "../lib/ui/base";

var spy = sinon.spy,
    expect = chai.expect;

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

    describe("UIBase class inherits from Base class", function(){

        var comp = new UIBase();

        before(function(done){
            comp.start().then(done);
        });

        it("should have subscribe", function(){
            comp.subscribe("TEST", function(){});
            // no exception?
        });

        it("should have publish", function(done){
            comp.subscribe("TEST", done);
            comp.publish("TEST");
        });

    });

    describe("building a UI component with hard coded html and LESS", function(){

        describe("using hard coded strings", function(){

            var comp = new UIBase("<div class='parent'><span class='child'>foo</span></div>", ".parent{.child{display:none;}}"),
                $el;

            before("Attaching component to body", function(done){
                comp.start().then(function(){
                    return comp.getElement();
                }).then(function(_$el){
                    _$el.appendTo("body");
                    $el = _$el;
                    done();
                });
            });

            after(function(done){
                comp.stop().then(function(){
                    return comp.getElement();
                }).then(function(_$el){
                    _$el.remove();
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

        describe("using option objects", function(){

            var comp = new UIBase({
                    html: "<div class='parent'><span class='child'>foo</span></div>"
                }, {
                    less: ".parent{.child{display:none;}}"
                }),
                $el;

            before("Attaching component to body", function(done){
                comp.start().then(function(){
                    return comp.getElement();
                }).then(function(_$el){
                    _$el.appendTo("body");
                    $el = _$el;
                    done();
                });
            });

            after(function(done){
                comp.stop().then(function(){
                    return comp.getElement();
                }).then(function(_$el){
                    _$el.remove();
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

        describe("using option objects with transforms", function(){

            var comp = new UIBase({
                    html: "<div class='parent'><span class='child'>foo</span></div>",
                    transform: function(data){
                        // transform the html by adding new elements and
                        // and returning an actuall DOM element
                        return when($("<div class='root'>" + data + "<div class='parent-2'></div></div>").get(0));
                    }
                }, {
                    less: ".parent{.child{display:none;}}",
                    transform: function(data){
                        // hide the added element
                        return when(data + ".parent-2{display:none;}");
                    }
                }),
                $root, $parent, $child, $parent2;

            before("Attaching component to body", function(done){
                comp.start().then(function(){
                    return comp.getElement();
                }).then(function(_$el){
                    _$el.appendTo("body");
                    $root = _$el;
                    $parent = $root.find(".parent");
                    $parent2 = $root.find(".parent-2");
                    $child = $parent.find(".child");
                    done();
                });
            });

            after(function(done){
                comp.stop().then(function(){
                    return comp.getElement();
                }).then(function(_$el){
                    _$el.remove();
                    done();
                });
            });

            describe("root element", function(){

                it("should exist", function(){
                    expect($root).to.exist;
                });

                it("should be visible", function(){
                    expect($root.is(":visible")).to.be.true;
                });

                it("should be of type div", function(){
                    expect($root.is("div")).to.be.true;
                });

            });

            describe("parent element", function(){

                it("should exist", function(){
                    expect($parent).to.exist;
                });

                it("should be visible", function(){
                    expect($parent.is(":visible")).to.be.true;
                });

                it("should be of type div", function(){
                    expect($parent.is("div")).to.be.true;
                });

            });

            describe("parent-2 element", function(){

                it("should exist", function(){
                    expect($parent2).to.exist;
                });

                it("should not be visible", function(){
                    expect($parent2.is(":visible")).to.be.false;
                });

                it("should be of type div", function(){
                    expect($parent.is("div")).to.be.true;
                });

            });

            describe("child element", function(){

                it("should exist", function(){
                    expect($child).to.exist;
                });

                it("should not be visible", function(){
                    expect($child.is(":visible")).to.be.false;
                });

                it("should be of type span", function(){
                    expect($child.is("span")).to.be.true;
                });

                it("should contain the text 'foo'", function(){
                    expect($child.text()).to.be.equal("foo");
                });

            });

        });

    });

    describe("building a UI component with html and LESS fetched by ajax", function(){

        var comp = new UIBase("/base/test/01.uibase_test.html", "/base/test/01.uibase_test.less"),
            $el;

        before("Attaching component to body", function(done){
            comp.start().then(function(){
                return comp.getElement();
            }).then(function(_$el){
                _$el.appendTo("body");
                $el = _$el;
                done();
            });
        });

        after(function(done){
            comp.stop().then(function(){
                return comp.getElement();
            }).then(function(_$el){
                _$el.remove();
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
