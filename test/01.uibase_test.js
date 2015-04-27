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

    describe("building a UI component with hard coded html and css", function(){

        var comp = new UIBase("<div></div>", "");

        it("should be ok", function(done){
            comp.getElement().then(function($el){
                console.log($el);
                done();
            });
        });

    });

});
