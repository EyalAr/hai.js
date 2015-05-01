import App from "./app";
import $ from "jquery";

var app = new App();

$(function(){
    console.log(app);
    app.start();
    app.getElement().then(function($el){
        $el.appendTo('body')
    });
});
