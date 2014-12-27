
(function () {
    "use strict";

    var SceneViewer = function(w, h){
        this.initialize(w, h);
    };

    SceneViewer.prototype.initialize = function(w, h){
        var $scene_container;
        var $scene;
        function zoomed() {
            $scene_container.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
        }
        var zoom = d3.behavior.zoom()
            .scaleExtent([0.1, 10])
            .on("zoom", zoomed);
        var canvas = d3.select(".canvas")
            .call(zoom);
        var $parent = canvas.append("g")
            .attr("class", "global-container");
        $parent.append("rect")
            .attr("class", "scene-background")
            .attr("width", "100000px")
            .attr("height", "100000px")
            .attr("x", "-50000px")
            .attr("y", "-50000px")
            .style("fill", "none")
            .style("pointer-events", "all");
        $scene_container = $parent.append("g")
            .attr("class", "scene-container");
        $scene = $scene_container.append("g")
            .attr("class", "scene");
        $scene.append("text")
            .attr("class", "hidden-text");
        $scene.append("svg:defs").html(
                '<filter id="drop-shadow" height="130%">' +
                '<feGaussianBlur in="SourceAlpha" stdDeviation="3"/>' + <!-- stdDeviation is how much to blur -->
                '<feOffset dx="2" dy="2" result="offsetblur"/>' + <!-- how much to offset -->
                '<feMerge>' +
                '    <feMergeNode/>' + <!-- this contains the offset blurred image -->
                '    <feMergeNode in="SourceGraphic"/>' + <!-- this contains the element that the filter is applied to -->
                '</feMerge>' +
                '</filter>');

        this.$scene = $scene;
        this.w = w;
        this.h = h;

        var nodeVisualizer = new TableNodeVisualizer();
        var linkVisualizer = new SimpleLinkVisualizer();
        var layouter;
        if(window.layouter === "ForceLayouter"){
            layouter = new ForceLayouter();
        }
        else{
            layouter = new LevelLayouter();
        }
        this.relation_viewer = new RelationViewer(nodeVisualizer, linkVisualizer,
            layouter, this.$scene, this.w, this.h);
    };

    SceneViewer.prototype.renderScene = function(scene){
        var nodes = scene.nodes;
        var links = scene.links;
        this.relation_viewer.draw(nodes, links);
        if(window.auto_fit){
            new SVGHelper().zoomToExtent(this.$scene, this.w, this.h);
        }
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
            scene.nodes = [];
            scene.links = [];
        };
    };

    window.SceneViewer = SceneViewer;
    return SceneViewer;
}());