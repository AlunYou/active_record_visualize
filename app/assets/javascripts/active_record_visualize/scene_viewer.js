
(function () {
    "use strict";

    var SceneViewer = function(){};

    SceneViewer.prototype.initialize = function(){
        var $container;
        function zoomed() {
            $container.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
        }
        var zoom = d3.behavior.zoom()
            .scaleExtent([0.1, 10])
            .on("zoom", zoomed);
        var canvas = d3.select(".canvas")
            .append("g")
            .call(zoom);
        $container = canvas.append("g");
        $container.append("rect")
            .attr("width", "100000px")
            .attr("height", "100000px")
            .attr("x", "-50000px")
            .attr("y", "-50000px")
            .style("fill", "none")
            .style("pointer-events", "all");
        $container.append("text")
            .attr("class", "hidden-text");
        $container.append("svg:defs").html(
                '<filter id="drop-shadow" height="130%">' +
                '<feGaussianBlur in="SourceAlpha" stdDeviation="3"/>' + <!-- stdDeviation is how much to blur -->
                '<feOffset dx="2" dy="2" result="offsetblur"/>' + <!-- how much to offset -->
                '<feMerge>' +
                '    <feMergeNode/>' + <!-- this contains the offset blurred image -->
                '    <feMergeNode in="SourceGraphic"/>' + <!-- this contains the element that the filter is applied to -->
                '</feMerge>' +
                '</filter>');

        this.$container = $container;
        var $body = $(document);
        this.w = $body.width();
        this.h = $body.height();
    };

    SceneViewer.prototype.renderScene = function(scene){
        var nodes = scene.nodes;
        var links = scene.links;

        var nodeVisualizer = new TableNodeVisualizer();
        var linkVisualizer = new SimpleLinkVisualizer();
        //var layouter = new ForceLayouter();
        var layouter = new LevelLayouter();
        var relation_viewer = new RelationViewer(nodes, links, nodeVisualizer, linkVisualizer,
            layouter, this.$container, this.w, this.h);
        relation_viewer.draw();
    };

    SceneViewer.prototype.destroyScene = function(scene){
        if(scene){
            for(var i=0; i<scene.nodes.length; i++) {
                var node = scene.nodes[i];
                if(node.table.$canvas){
                    node.table.$canvas.remove();
                }

            }
            for(var i=0; i<scene.links.length; i++) {
                var link = scene.links[i];
                link.$canvas.remove();
            }
        };
    };

    window.SceneViewer = SceneViewer;
    return SceneViewer;
}());