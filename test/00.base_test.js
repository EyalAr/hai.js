import chai from "chai";
import sinon from "sinon";
import when from "when/when";
import Base from "../lib/base";

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

describe('Base class', function(){

    describe("initial state", function(){

        var comp = new Base();

        it("should be stopped", function(){
            expect(comp.isStarted()).to.be.false;
        });

    });

    describe("start component", function(){

        var comp = new Base(),
            p = comp.start();

        it("should be started", function(done){
            p.then(check(done, function(){
                expect(comp.isStarted());
            }));
        });

    });

    describe("stop component", function(){

        var comp = new Base(),
            p = comp.start().then(function(){
                return comp.stop();
            });
        it("should be stopped", function(done){
            p.then(check(done, function(){
                expect(comp.isStarted()).to.be.false;
            }));
        });

    });

    describe("component with memory", function(){

        describe("publish / subscribe to messages on component", function(){

            var comp = new Base(true),
                callback = spy(),
                data = {},
                p = comp.start().then(function(){
                    comp.subscribe("TEST", callback);
                    comp.publish("TEST", data);
                });

            it("should call callback once", function(done){
                p.then(check(done, function(){
                    expect(callback.calledOnce).to.be.true;
                }));
            });

            it("should call callback with correct params", function(done){
                p.then(check(done, function(){
                    expect(callback.calledWith(data)).to.be.true;
                }));
            });

        });

        describe("publish while component is stopped", function(){

            var comp = new Base(true),
                callback1 = spy(),
                callback2 = spy(),
                data = {};

            comp.publish("TEST", data);
            comp.subscribe("TEST", callback1);

            var p = comp.start().then(function(){
                    comp.subscribe("TEST", callback2);
                });

            it("should call a callback subscribed before start", function(done){
                p.then(check(done, function(){
                    expect(callback1.calledOnce).to.be.true;
                }));
            });

            it("should call callback1 with correct params", function(done){
                p.then(check(done, function(){
                    expect(callback1.calledWith(data)).to.be.true;
                }));
            });

            it("should not call callback subscribed after start", function(done){
                p.then(check(done, function(){
                    expect(callback2.called).to.be.false;
                }));
            });

        });

        describe("relay messages to another component", function(){

            var comp = new Base(true),
                other = new Base();
            comp.relayTo(other, "TEST");

            var callback = spy(),
                data = {},
                p = when.join(
                    comp.start(),
                    other.start()
                );

            p.then(function(){
                other.subscribe("TEST", callback);
                comp.publish("TEST", data);
            });

            it("should call callback on other component once", function(done){
                p.then(check(done, function(){
                    expect(callback.calledOnce).to.be.true;
                }));
            });

            it("should call callback on other component with correct params", function(done){
                p.then(check(done, function(){
                    expect(callback.calledWith(data)).to.be.true;
                }));
            });

        });

    });

    describe("component without memory", function(){

        describe("publish while component is stopped", function(){

            var comp = new Base(false);

            it("should throw an error", function(){
                expect(comp.publish.bind(comp, "TEST", {})).to.throw(Error);
            });

        });

    });

});
