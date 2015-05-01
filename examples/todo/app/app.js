import BoundUIBase from "../../../lib/ui/bound/base";
import Item from "./item";

class App extends BoundUIBase{
    constructor(){
        var model = {
            items: [],
            title: ""
        };
        super("app.html", "app.less", model);
        var that = this;
        this.on('new-item', function(){
            var it = new Item(model.title);
            it.start().then(function(){
                it.getElement().then(function($el){
                    that.getElement().then(function($parent){
                        $el.appendTo($parent.find("#items"));
                    });
                });
            });
            it.subscribe("REMOVE", function(){
                it.getElement().then(function($el){
                    $el.remove();
                    it.stop();
                });
            });
        });
    }
}

export default App;
