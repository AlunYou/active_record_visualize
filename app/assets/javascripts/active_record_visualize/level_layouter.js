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
            if(a.level != b.level){
                return a.level < b.level ? 1: -1;
            }
            else{
                if(a.rows.length != b.rows.length){
                    return a.rows.length < b.rows.length ? 1 : -1;
                }
                else{
                    return a.index < b.rows.length ? 1 : -1;
                }
            }
        });
        var i = 0, level = 0, node = null, current_x = 10, space = 50;
        while(i<nodes.length){
            var level_width = 0;
            var current_y = 10;
            for(; i<nodes.length && (node=nodes[i]).level==level; i++){
                node.x = current_x;
                node.y = current_y;
                current_y += space;
                level_width = Math.max(level_width, node.width);
            }
            current_x += level_width + space;
            level++;
        }
    }

    window.LevelLayouter = LevelLayouter;
    return LevelLayouter;
}());