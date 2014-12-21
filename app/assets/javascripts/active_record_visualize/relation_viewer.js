/*
* nodeVisualizer interfaces:
*   draw($container, node);
* linkVisualizer interfaces:
*   draw($container, link);
*   refreshPos(links, node, dx, dy);//called when node position changes
* layouter interfaces:
*   layout(nodes, w, h);
* */

(function () {
    "use strict";

    var node_hash = {};

    var getTransform = function(node){
        var trans = node.table.$canvas.attr("transform");
        trans = trans.replace("translate(", "");
        trans = trans.replace(")", "");
        var values = trans.split(",");
        return [parseFloat(values[0]), parseFloat(values[1])];
    };

    function dragStarted(d) {
        d3.event.sourceEvent.stopPropagation();
        d3.select(this).classed("dragging", true);
    }

    function dragged(d) {
        var trans = getTransform(d);
        d.table.$canvas.attr("transform", "translate(" + (trans[0]+d3.event.dx) + "," + (trans[1]+d3.event.dy) + ")");
        Events.trigger("node_move", d, d3.event.dx, d3.event.dy);
    }

    function dragEnded(d) {
        d3.select(this).classed("dragging", false);
    }

    var drag = d3.behavior.drag()
        .on("dragstart", dragStarted)
        .on("drag", dragged)
        .on("dragend", dragEnded);

    var RelationViewer = function(nodes, links, nodeVisualizer, linkVisualizer,
                                  layouter, $container, w, h){
        this.nodes = nodes;
        this.links = links;
        this.nodeVisualizer = nodeVisualizer;
        this.linkVisualizer = linkVisualizer;
        this.layouter = layouter;
        this.$container = $container;
        this.w = w;
        this.h = h;
    };

    RelationViewer.prototype.draw = function(){
        this.initNodes();
        this.initLinks();
    }

    RelationViewer.prototype.initNodes = function(){
        for(var i=0; i<this.nodes.length; i++){
            var node = this.nodes[i];
            $.extend(node, {x:50+200*i, y:0+10*i});
            this.nodeVisualizer.draw(this.$container, node);
            node_hash[node.node_name] = node;
        }

        var self = this;
        d3.selectAll(".table")
            .datum(function(previous_d, i){
                var node = self.nodes[i];
                return node;
            })
            .call(drag);

        this.layouter.layout(this.nodes, this.w, this.h);
    };

    RelationViewer.prototype.resetNode = function(node){
        node.table.$canvas.remove();
        this.nodeVisualizer.draw(this.$container, node);

        /*var self = this;
        d3.selectAll(".table")
            .datum(function(previous_d, i){
                var node = self.nodes[i];
                return node;
            })
            .call(drag);*/

        //this.layouter.layout(this.nodes, this.w, this.h);
    };

    RelationViewer.prototype.initLinks = function(){
        for(var i=0; i<this.links.length; i++) {
            var link = this.links[i];
            link.start_node = node_hash[link.start];
            link.end_node = node_hash[link.end];
            this.linkVisualizer.draw(this.$container, link, this.nodeVisualizer);
        }
        var self = this;
        Events.on("node_move", function(node, dx, dy){
            self.linkVisualizer.refreshPos(self.links, node, dx, dy);
        });
    };

    window.RelationViewer = RelationViewer;
    return RelationViewer;
}());