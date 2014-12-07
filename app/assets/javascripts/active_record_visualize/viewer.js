// Place all the behaviors and hooks related to the matching controller here.
// All this logic will automatically be available in application.js.
//= require jquery
//= require active_record_visualize/d3
//= require active_record_visualize/events
//= require active_record_visualize/sized_quadtree
//= require active_record_visualize/d3.layout.no_collision_force
//= require active_record_visualize/ColumnDef
//= require active_record_visualize/Table
//= require active_record_visualize/simple_link_visualizer
//= require active_record_visualize/table_node_visualizer
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
    var $body = $(document);
    w = $body.width();
    h = $body.height();
    console.log("w,h=" + w + "," + h);

    var renderRelations = function(table_name, id){
        $.ajax({
            type: "get",
            url: "/active_record_visualize/get_relations?table_name=" + table_name + "&id=" + id,
            data: {table_name:table_name, id:id},
            success: function (relationData) {
                var nodes = relationData.nodes;
                var links = relationData.links;

                var nodeVisualizer = new TableNodeVisualizer();
                var linkVisualizer = new SimpleLinkVisualizer();
                var forceLayouter = new ForceLayouter();
                var relation_viewer = new RelationViewer(nodes, links, nodeVisualizer, linkVisualizer,
                    forceLayouter, $container, w, h);
                relation_viewer.draw();
            },
            error: function (resp) {
                alert("failure");
            }
        });
    };


    renderRelations("project_user", 1);

    /*
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

