// Place all the behaviors and hooks related to the matching controller here.
// All this logic will automatically be available in application.js.
//= require jquery
//= require active_record_visualize/underscore
//= require active_record_visualize/backbone
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
//= require active_record_visualize/scene_viewer

$().ready(function() {

    window.page_size = 2;
    window.scene = null;

    var $body = $(document);
    var w = $body.width();
    var h = $body.height() - $(".setting-tab").height();

    var sceneViewer = new SceneViewer(w, h);

    var renderResource = function(table_name, id, resource){
        $.ajax({
            type: "get",
            url: "/active_record_visualize/" + resource,
            data: {table_name:table_name, id:id==null?null:id, page_size:window.page_size, page_index:0},
            success: function (scene) {
                sceneViewer.destroyScene(window.scene);
                window.scene = scene;
                sceneViewer.renderScene(scene);
            },
            error: function (resp) {
                alert("failure");
            }
        });
    };


    var Router = Backbone.Router.extend({
        routes: {
            "active_record_visualize": "view_default",
            "active_record_visualize/:table_name": "view_table",
            "active_record_visualize/:table_name/:id": "view_object"
        },

        view_default: function() {
            var $select = $("#table_list_id");
            var table_name = $select.val();
            renderResource(table_name, null, "table");
        },

        view_table: function(table_name) {
            renderResource(table_name, null, "table");
        },
        view_object: function(table_name, id) {
            renderResource(table_name, id, "relation");
        }
    });

    var router = new Router();

    Backbone.history.start({ pushState: true, root:"/" });

    var $select = $("#table_list_id");
    $select.on("change", function(){
        var table_name = $select.val();
        router.navigate("/active_record_visualize/"+table_name, true);
        //renderResource(table_name, null, "table");
    });
    //renderResource(table_name, null, "table");
    //renderResource("project_user", 1, "relation");

    Events.on("switch_scene", function(table_name, id){
        router.navigate("/active_record_visualize/"+table_name+"/"+id, true);
        //renderResource(table_name, id, "relation");
    }, this);

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

