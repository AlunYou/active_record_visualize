// Place all the behaviors and hooks related to the matching controller here.
// All this logic will automatically be available in application.js.
//= require jquery
//= require active_record_visualize/d3
//= require active_record_visualize/sized_quadtree
//= require active_record_visualize/d3.layout.no_collision_force
//= require active_record_visualize/ColumnDef
//= require active_record_visualize/Table

var nodes = [];
var node_hash = {};
var links = [];
var force;
$().ready(function() {
    var w = 1024, h = 550;
    var $container;

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

    function zoomed() {
        $container.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
    }
    function dragStarted(d) {
        d3.event.sourceEvent.stopPropagation();
        d3.select(this).classed("dragging", true);
    }

    function dragged(d) {
        var trans = getTransform(d);
        d.table.$canvas.attr("transform", "translate(" + (trans[0]+d3.event.dx) + "," + (trans[1]+d3.event.dy) + ")");
        //update links and texts connected with this node
        for(var i=0; i<links.length; i++) {
            var link = links[i];

            if(link.start === d['node_name'] || link.end === d['node_name']){
                link.start_node = node_hash[link.start];
                link.end_node = node_hash[link.end];
                var end_dx = d3.event.dx;
                var end_dy = d3.event.dy;
                var start_dx = 0;
                var start_dy = 0;
                if(link.start === d['node_name']){
                    start_dx = d3.event.dx;
                    start_dy = d3.event.dy;
                    end_dx = 0;
                    end_dy = 0;
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

    function dragEnded(d) {
        d3.select(this).classed("dragging", false);
    }

    var zoom = d3.behavior.zoom()
        .scaleExtent([1, 10])
        .on("zoom", zoomed);

    var drag = d3.behavior.drag()
        .on("dragstart", dragStarted)
        .on("drag", dragged)
        .on("dragend", dragEnded);

    var canvas = d3.select(".canvas")
        .append("g")
        .attr("transform", "translate(" + 0 + "," + 0 + ")")
        .call(zoom);
    $container = canvas.append("g");

    var rect = $container.append("rect")
        .attr("width", w)
        .attr("height", h)
        .style("fill", "none")
        .style("pointer-events", "all");

    var layout = function(){
        force = d3.layout.no_collision_force({
            layout_for:"rect",
            maxDepth:5,
            maxChildren:5,
            redrawCallback:redraw
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

    var redraw = function(layout_for){
        for(var i=0; i<nodes.length; i++){
            var node = nodes[i];
            var x = node.x - node.old_x;
            var y = node.y - node.old_y;
            node.table.$canvas.attr("transform", "translate(" + node.x + "," + node.y + ")");
        }
    };

    var getTransform = function(node){
        var trans = node.table.$canvas.attr("transform");
        trans = trans.replace("translate(", "");
        trans = trans.replace(")", "");
        var values = trans.split(",");
        return [parseFloat(values[0]), parseFloat(values[1])];
    };

    var renderRelations = function(table_name, id){
        $.ajax({
            type: "get",
            url: "/active_record_visualize/get_relations?table_name=" + table_name + "&id=" + id,
            data: {table_name:table_name, id:id},
            success: function (relationData) {
                //links = relationData.links;
                for(var i=0; i<relationData.nodes.length; i++){
                    var node = relationData.nodes[i];


                    var columns = $.map(node.columns, function(col, index){
                        return new ArvColumnDef(col.dbTableName, col.dbFieldName, col.title, col.valueType, col.linkType, col.width);
                    });
                    $.each(node.rows, function(index, row){
                        $.each(row, function(key, value){
                            if(value == null){
                                row[key] = ""
                            }
                        })
                    })

                    var table = new ArvTable("test", "single", columns, node.rows, 30, 30);
                    var pos = {left:50+10*nodes.length, top:50+10*nodes.length};
                    table.draw($container, pos);

                    var node = {width:table.width+40, height:table.height+40,
                    /*x:pos.left, y:pos.top,*/ old_x:pos.left, old_y:pos.top, table:table, node_name:node.node_name};
                    nodes.push(node);
                    node_hash[node.node_name] = node;
                }
                links = relationData.links;

                d3.selectAll(".table")
                    .datum(function(previous_d, i){
                        var node = nodes[i];
                        return node;
                    })
                    .call(drag);

                layout();

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

                for(var i=0; i<links.length; i++) {
                    var link = links[i];
                    link.start_node = node_hash[link.start];
                    link.end_node = node_hash[link.end];
                    link.start_x =  link.start_node.x + link.start_node.table.getLeftOfColumnName(link.rel_column) + 10;
                    link.start_y =  link.start_node.y + link.start_node.table.getTopOfRow(1) + 10;
                    link.end_x = link.end_node.x;
                    link.end_y = link.end_node.y;
                }

                var $link = $container.selectAll(".link");
                $link.data(links)
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

                var text = $container.selectAll(".text")
                    .data(links)
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
            },
            error: function (resp) {

                alert("failure");
            }
        });
    };


    renderRelations("project_user", 1);

    /*
    var renderTable = function(table_name){
        $.ajax({
            type: "get",
            url: "/active_record_visualize/table",
            data: {table_name:table_name},
            success: function (tableData) {
                var columns = $.map(tableData.columns, function(col, index){
                    return new ArvColumnDef(col.dbTableName, col.dbFieldName, col.title, col.valueType, col.linkType, col.width);
                });
                $.each(tableData.rows, function(index, row){
                    $.each(row, function(key, value){
                        if(value == null){
                            row[key] = ""
                        }
                    })
                })

                var table = new ArvTable("test", "single", columns, tableData.rows, 30, 30);

                var pos = {left:200+10*nodes.length, top:200+10*nodes.length};
                table.draw($container, pos);
                last_table = table;

                var node = {width:table.width, height:table.height,
                    x:pos.left, y:pos.top, old_x:pos.left, old_y:pos.top, table:table};
                nodes.push(node);

                layout();

            },
            error: function (resp) {

                alert("failure");
            }
        });
    };

    var last_table = null;

    var $select = $("#table_list_id");
    $select.on("change", function(){
        var table_name = $select.val();
        //last_table.destroy();
        renderTable(table_name);
    });
    var table_name = $select.val();
    renderTable(table_name);
    */

    function render_simple(){
        var colJson = [
            {"dbTableName":"Project", "dbFieldName":"id", "title":"Id", valueType:"text", linkType:"static", width:100},
            {"dbTableName":"Project", "dbFieldName":"name", "title":"Name", valueType:"text", linkType:"static", width:150},
            {"dbTableName":"Project", "dbFieldName":"start_date", "title":"Start Date", valueType:"text", linkType:"static", width:200}];
        var columns = $.map(colJson, function(col, index){
            return new ArvColumnDef(col.dbTableName, col.dbFieldName, col.title, col.valueType, col.linkType, col.width);
        });
        var dataRows = [
            {
                "Id": 3,
                "Name": "Richy",
                "Start Date": "2010-4-5"
            },
            {
                "Id": 4,
                "Name": "Fei",
                "Start Date": "2010-4-15"
            },
            {
                "Id": 5,
                "Name": "Jane",
                "Start Date": "2014-4-15"
            }
        ];
        var table = new ArvTable("test", "single", columns, dataRows, 30, 30);
        var pos = {left:10, top:10};
        table.draw($container, pos);

        var node = {width:table.width, height:table.height,
            x:pos.left, y:pos.top, old_x:pos.left, old_y:pos.top, table:table};
        nodes.push(node);
    }
});

