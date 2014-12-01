// Place all the behaviors and hooks related to the matching controller here.
// All this logic will automatically be available in application.js.
//= require jquery
//= require active_record_visualize/d3
//= require active_record_visualize/sized_quadtree
//= require active_record_visualize/d3.layout.no_collision_force
//= require active_record_visualize/ColumnDef
//= require active_record_visualize/Table

var nodes = [];
$().ready(function() {
    var w = 1024, h = 550;

    var canvas = d3.select(".canvas");

    var force;
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
    }

    var renderRelations = function(table_name, id){
        $.ajax({
            type: "get",
            url: "/active_record_visualize/get_relations?table_name=" + table_name + "&id=" + id,
            data: {table_name:table_name, id:id},
            success: function (relationData) {
                //links = relationData.links;
                var node_hash = {};
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
                    table.draw(canvas, pos);
                    //last_table = table;

                    var node = {width:table.width+40, height:table.height+40,
                    /*x:pos.left, y:pos.top,*/ old_x:pos.left, old_y:pos.top, table:table, node_name:node.node_name};
                    nodes.push(node);
                    node_hash[node.node_name] = node;
                }

                layout();

                // build the arrow.
                canvas.append("svg:defs").selectAll("marker")
                    .data(["end"])      // Different link/path types can be defined here
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
                    //.attr("d", "M0,-5L10,0L0,5");

                var link = canvas.selectAll(".link");
                link.data(relationData.links)
                    .enter()
                    .append("path")
                    .attr("class", "link")
                    .attr("marker-end", "url(#end)")
                    .attr("d", function(d) {
                        var start_node = node_hash[d.start];
                        var end_node   = node_hash[d.end];

                        var start_x =  start_node.x + start_node.table.getLeftOfColumnName(link.rel_column) + 10;
                        var start_y =  start_node.y + start_node.table.getTopOfRow(1) + 10;
                        var end_x = end_node.x;
                        var end_y = end_node.y;
                        var dx = end_x - start_x,
                            dy = end_y - start_y,
                            dr = Math.sqrt(dx * dx + dy * dy);
                        return "M" + start_x + "," + start_y + "A" + dr + "," + dr + " 0 0,1 " + end_x + "," + end_y;
                    });
                    //.exit();
                    //.remove();

                /*for(var i=0; i<relationData.links.length; i++) {
                    var link = relationData.links[i];
                    var start_node = node_hash[link.start];
                    var end_node   = node_hash[link.end];
                    if(link.rel_column !== "collection"){

                    }
                    var start_trans = getTransform(start_node);
                    var end_trans   = getTransform(end_node);
                    var start_x =  start_node.x + start_node.table.getLeftOfColumnName(link.rel_column) + 10;
                    var start_y =  start_node.y + start_node.table.getTopOfRow(1) + 10;
                    var end_x = end_node.x;
                    var end_y = end_node.y;

                    var lineData = [ { "x": start_x,   "y": start_y},  { "x": end_x,  "y": end_y}];
                    var lineFunction = d3.svg.line()
                        .x(function(d) { return d.x; })
                        .y(function(d) { return d.y; })
                        .interpolate("bundle");
                    var lineGraph = canvas.append("path")
                        .attr("d", lineFunction(lineData))
                        .attr("stroke", "slategray")
                        .attr("stroke-width", "1.5px")
                        .attr("stroke-opacity", 0.6)
                        .attr("fill", "none");
                }*/
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
                table.draw(canvas, pos);
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
        table.draw(canvas, pos);

        var node = {width:table.width, height:table.height,
            x:pos.left, y:pos.top, old_x:pos.left, old_y:pos.top, table:table};
        nodes.push(node);
    }
});

