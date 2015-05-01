import BoundUIBase from "../../../lib/ui/bound/base";

class Item extends BoundUIBase{
    constructor(title){
        var model = {
            title: title
        };
        super("item.html", "item.less", model);
        var that = this;
        this.on("remove", function(){
            that.publish("REMOVE");
        });
    }
}

export default Item;
