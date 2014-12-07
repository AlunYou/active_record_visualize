(function () {
    "use strict";

    function linkPathContent(link) {
        var dx = link.end_x - link.start_x,
            dy = link.end_y - link.start_y,
            dr = Math.sqrt(dx * dx + dy * dy);
        if (link.end_x >= link.start_x) {
            return "M" + link.start_x + "," + link.start_y + "A" + dr + "," + dr + " 0 0,1 " + link.end_x + "," + link.end_y;
        }
        else {
            return "M" + link.end_x + "," + link.end_y + "A" + dr + "," + dr + " 0 0,1 " + link.start_x + "," + link.start_y;
        }
    }

    var SimpleLinkVisualizer = function(){};

    SimpleLinkVisualizer.prototype.draw = function($container, link){
        link.start_x =  link.start_node.x + link.start_node.table.getLeftOfColumnName(link.rel_column) + 10;
        link.start_y =  link.start_node.y + link.start_node.table.getTopOfRow(1) + 10;
        link.end_x = link.end_node.x;
        link.end_y = link.end_node.y;

        this.defineArrow($container);

        var $linkContainer = $container.append("g");
        $linkContainer
            .selectAll(".link")
            .data([link])
            .enter()
            .append("path")
            .attr("id", function(link){
                return link.start+"_"+link.end;
            })
            .attr("class", "link")
            .attr("marker-start", function(link) {
                if(link.end_x < link.start_x) {
                    return "url(#end)";
                }
            })
            .attr("marker-end", function(link) {
                if(link.end_x >= link.start_x) {
                    return "url(#start)";
                }
            })
            .attr("d", linkPathContent);

        $linkContainer
            .selectAll(".text")
            .data([link])
            .enter()
            .append("text")
            .attr("class", "text")
            .attr("dx",10)
            .attr("dy",10)
            .append("textPath")
            .attr("xlink:href", function(link){
                return "#" + link.start + "_" + link.end;
            })
            .style("text-anchor", function(link){
                return link.end_x >= link.start_x ? "end" : "start"
            })
            .attr("startOffset", function(link){
                return link.end_x >= link.start_x ? "80%" : "20%"
            })
            .text(function(link){
                return link.relation;
            });
        link.$canvas = $linkContainer;
    }

    SimpleLinkVisualizer.prototype.refreshPos = function(links, node, dx, dy){
        for(var i=0; i<links.length; i++) {
            var link = links[i];

            if(link.start === node['node_name'] || link.end === node['node_name']){
                var end_dx = 0, end_dy = 0, start_dx = 0, start_dy = 0;
                if(link.start === node['node_name']){
                    start_dx = dx;
                    start_dy = dy;
                }
                else{
                    end_dx = dx;
                    end_dy = dy;
                }
                link.start_x += start_dx;
                link.start_y += start_dy;
                link.end_x += end_dx;
                link.end_y += end_dy;

                d3.select("#"+link.start+"_"+link.end)
                    .attr("marker-start", function(link) {
                        if(link.end_x < link.start_x) {
                            return "url(#end)";
                        }
                    })
                    .attr("marker-end", function(link) {
                        if(link.end_x >= link.start_x) {
                            return "url(#start)";
                        }
                    })
                    .attr("d", linkPathContent);
            }
        }
    }

    SimpleLinkVisualizer.prototype.hasDefinedArrow = function($container){
        return $container.selectAll("marker").length >= 2;
    }

    SimpleLinkVisualizer.prototype.defineArrow = function($container){
        if(this.hasDefinedArrow($container)){
            return;
        }
        // arrow at the end
        $container.append("svg:defs").selectAll("marker")
            .data(["end"])      // Different link/path types can be defined here
            .enter().append("svg:marker")    // This section adds in the arrows
            .attr("id", String)
            .attr("viewBox", "0 -5 10 10")
            .attr("refX", 0)
            .attr("refY",0)
            .attr("markerWidth", 6)
            .attr("markerHeight", 6)
            .attr("orient", "auto")
            .append("svg:path")
            .attr("d", "M10,3L0,0L10,-3");

        //arrow at the start
        $container.append("svg:defs").selectAll("marker")
            .data(["start"])      // Different link/path types can be defined here
            .enter().append("svg:marker")    // This section adds in the arrows
            .attr("id", String)
            .attr("viewBox", "-10 -5 10 10")
            .attr("refX", 0)
            .attr("refY",0)
            .attr("markerWidth", 6)
            .attr("markerHeight", 6)
            .attr("orient", "auto")
            .append("svg:path")
            .attr("d", "M-10,-3L0,0L-10,3");
    }


    window.SimpleLinkVisualizer = SimpleLinkVisualizer;
    return SimpleLinkVisualizer;
}());