// Place all the behaviors and hooks related to the matching controller here.
// All this logic will automatically be available in application.js.
//= require jquery
//= require active_record_visualize/d3
//= require active_record_visualize/events
//= require active_record_visualize/sized_quadtree
//= require active_record_visualize/d3.layout.no_collision_force
//= require active_record_visualize/svg_helper
//= require active_record_visualize/ColumnDef
//= require active_record_visualize/Table
//= require active_record_visualize/simple_link_visualizer
//= require active_record_visualize/table_node_visualizer
//= require active_record_visualize/TableBase
//= require active_record_visualize/force_layouter
//= require active_record_visualize/level_layouter
//= require active_record_visualize/relation_viewer

$().ready(function() {
    var w = 1024, h = 550;
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
    var $body = $(document);
    w = $body.width();
    h = $body.height();
    console.log("w,h=" + w + "," + h);

    var renderScene = function(scene){

        var nodes = scene.nodes;
        var links = scene.links;

        var nodeVisualizer = new TableNodeVisualizer();
        var linkVisualizer = new SimpleLinkVisualizer();
        //var layouter = new ForceLayouter();
        var layouter = new LevelLayouter();
        var relation_viewer = new RelationViewer(nodes, links, nodeVisualizer, linkVisualizer,
            layouter, $container, w, h);
        relation_viewer.draw();
    };
    var destroyScene = function(){
        if(window.scene){
            var scene = window.scene;
            for(var i=0; i<scene.nodes.length; i++) {
                var node = scene.nodes[i];
                if(node.table.$canvas){
                    node.table.$canvas.remove();
                }

            }
            for(var i=0; i<scene.links.length; i++) {
                var link = scene.links[i];
            }
        };
    };


    window.page_size = 2;
    window.scene = null;
    var renderResource = function(table_name, id, resource){
        $.ajax({
            type: "get",
            url: "/active_record_visualize/" + resource,
            data: {table_name:table_name, id:id==null?null:id, page_size:page_size, page_index:0},
            success: function (scene) {
                destroyScene();
                window.scene = scene;
                renderScene(scene);
            },
            error: function (resp) {
                alert("failure");
            }
        });
    };

    var last_table = null;

    renderResource("project_user", 1, "relation");

    var $select = $("#table_list_id");
    $select.on("change", function(){
        var table_name = $select.val();
        renderResource(table_name, null, "table");
    });
    var table_name = $select.val();
    renderResource(table_name, null, "table");




    /*
    function render_simple() {

        var titleHeight = 30, headerHeight = 30, rowHeight = 30,
            title = "Table";
        var columnArray = [
            {
                "width": 100,
                "title": "Id"
            },
            {
                "width": 150,
                "title": "Name"
            },
            {
                "width": 250,
                "title": "Start Date"
            }
        ];
        var dataArray = [
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
        var pos = {left: 10, top: 10};
        var table = new SimpleTableBase();
        table.initialize(titleHeight, headerHeight, rowHeight,
            title, columnArray, dataArray);
        table.draw($container, pos);
    }
    //render_simple();

    function render_object(hortNum) {

        var titleHeight = 30, headerHeight = 30, rowHeight = 30,
            title = "Table";
        var columnArray = [
            {
                "width": 100,
                "title": "Id"
            },
            {
                "width": 150,
                "title": "Name"
            },
            {
                "width": 250,
                "title": "Start Date"
            },
            {
                "width": 250,
                "title": "End Date"
            }
        ];
        var dataArray = [
            {
                "Id": 3,
                "Name": "Richy",
                "Start Date": "2010-4-5",
                "End Date": "2010-4-5"
            },
            {
                "Id": 4,
                "Name": "Fei",
                "Start Date": "2010-4-15",
                "End Date": "2010-4-5"
            },
            {
                "Id": 5,
                "Name": "Jane",
                "Start Date": "2014-4-15",
                "End Date": "2010-4-5"
            }
        ];
        var pos = {left: 10, top: 10};
        var table = new ObjectTableBase();
        table.initialize(titleHeight, headerHeight, rowHeight,
            title, columnArray, dataArray, hortNum);
        table.draw($container, pos);
    }
    //render_object(2);

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
    }*/

});

