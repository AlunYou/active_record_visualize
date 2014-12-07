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

    var ForceLayouter = function(){};

    ForceLayouter.prototype.layout = function(nodes, w, h){
        var force = d3.layout
            .no_collision_force({
                layout_for:"rect",
                maxDepth:5,
                maxChildren:5,
                redrawCallback:function(){
                    redraw(nodes);
                },
                nodes:nodes
            })
            .gravity(0.5)
            .charge(function(d, i) { return i ? 0 : -2000; })
            .nodes(nodes)
            .size([w, h]);

        force.start();
        for(var i=0; i<100; i++){
            force.tick();
        }
        force.stop();
    }

    window.ForceLayouter = ForceLayouter;
    return ForceLayouter;
}());