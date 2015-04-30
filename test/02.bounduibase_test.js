import chai from "chai";
import sinon from "sinon";
import when from "when/when";
import $ from "jquery";
import BoundUIBase from "../lib/ui/bound/base";

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

describe("BoundUIBase class", function(){

    describe("Binding data to template", function(){

        var comp = new BoundUIBase(
                "<div>{{foo}}</div>",
                undefined,
                { foo: "bar" }
            ),
            $el;

        before("getting element", function(done){
            comp.getElement().then(function(_$el){
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

        describe("before component is started", function(){

            it("should be bound to the data", function(){
                expect($el.text()).to.be.equal("bar");
            });

        });

        describe("after component is started", function(){

            before("start and change data model", function(done){
                comp.start().then(function(){
                    comp.set("foo", "buz");
                    done();
                });
            });

            it("should be bound to the data", function(){
                expect($el.text()).to.be.equal("buz");
            });

        });

        describe("after component is started -> stopped", function(){

            before("stop and change data model", function(done){
                comp.stop().then(function(){
                    comp.set("foo", "brush");
                    done();
                });
            });

            it("should be bound to the data", function(){
                expect($el.text()).to.be.equal("brush");
            });

        });

        describe("after component is started -> stopped -> started", function(){

            before("start and change data model", function(done){
                comp.start().then(function(){
                    comp.set("foo", "crush");
                    done();
                });
            });

            it("should be bound to the data", function(){
                expect($el.text()).to.be.equal("crush");
            });

        });

    });

    describe("Listening to events from template", function(){

        var comp = new BoundUIBase("<button on-click='testevent'></button>"),
            $el, callback;

        before("getting element", function(done){
            comp.getElement().then(function(_$el){
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

        beforeEach(function(){
            callback = spy();
            comp.on("testevent", callback);
        });

        afterEach(function(){
            comp.off();
        });

        describe("before component is started", function(){

            it("should not catch event", function(){
                $el.click();
                expect(callback.calledOnce).to.be.false;
            });

        });

        describe("after component is started", function(){

            before("start", function(done){
                comp.start().then(done);
            });

            it("should catch event", function(){
                $el.click();
                expect(callback.calledOnce).to.be.true;
            });

        });

        describe("after component is started -> stopped", function(){

            before("stop", function(done){
                comp.stop().then(done);
            });

            it("should not catch event", function(){
                $el.click();
                expect(callback.calledOnce).to.be.false;
            });

        });

        describe("after component is started -> stopped -> started", function(){

            before("start", function(done){
                comp.start().then(done);
            });

            it("should catch event", function(){
                $el.click();
                expect(callback.calledOnce).to.be.true;
            });

        });

        describe("after event is off'ed", function(){

            it("should not catch event", function(){
                comp.off("testevent");
                $el.click();
                expect(callback.calledOnce).to.be.false;
            });

        });

    });

});
