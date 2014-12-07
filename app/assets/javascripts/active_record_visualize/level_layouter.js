(function () {
    "use strict";

    var redraw = function(nodes){
        for(var i=0; i<nodes.length; i++){
            var node = nodes[i];
            var x = node.x - node.old_x;
            var y = node.y - node.old_y;
            node.table.$canvas.attr("transform", "translate(" + node.x + "," + node.y + ")");
        }
    };

    var LevelLayouter = function(){};

    LevelLayouter.prototype.layout = function(nodes, w, h){
        nodes.sort(function(a, b){
            var a1= a.level, b1= b.level;
            return a1 > b1? 1: -1;
        });
    }

    window.LevelLayouter = LevelLayouter;
    return LevelLayouter;
}());