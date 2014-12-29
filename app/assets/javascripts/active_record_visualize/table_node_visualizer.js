(function () {
    "use strict";

    var getTransform = function(node){
        var trans = node.table.$canvas.attr("transform");
        trans = trans.replace("translate(", "");
        trans = trans.replace(")", "");
        var values = trans.split(",");
        return [parseFloat(values[0]), parseFloat(values[1])];
    };

    var TableNodeVisualizer = function(){};

    TableNodeVisualizer.prototype.draw = function($container, node){
        var columns = $.map(node.columns, function(col, index){
            return new ArvColumnDef(col.dbTableName, col.dbFieldName, col.title, col.valueType, col.linkType, col.width);
        });
        $.each(node.rows, function(index, row){
            $.each(row, function(key, value){
                if(value == null){
                    row[key] = ""
                }
            })
        });
        var table;
        var self = this;
        if(node.collection){
            //table = new ArvTable("test", "single", columns, node.rows, 30, 30);
            var titleHeight = 30, headerHeight = 30, rowHeight = 30,
                title = node.node_display_name;
            var dataArray = node.rows;
            var columnArray = $.map(node.columns, function(col, index){
                return {title:col.title, width:col.width};
            });
            table = new SimpleTableBase();
            table.initialize(titleHeight, headerHeight, rowHeight,
                title, columnArray, dataArray, node.page_size, node.page_num, node.page_index);
            Events.on("nav_page", function(eventTable, navPage, currentPage){
                if(eventTable === table){
                    table.$canvas.classed("updating", true);
                    $.ajax({
                        type: "get",
                        url: window.mounted_at+"/table",
                        data: {condition:node.condition, table_name:node.table_name,
                               page_index:navPage, page_size:node.page_size},
                        success: function (scene) {
                            table.$canvas.classed("updating", false);
                            table.$canvas.remove();
                            var nodeData = scene.nodes[0];
                            node.rows = nodeData.rows;
                            node.page_index = nodeData.page_index;
                            dataArray = node.rows;
                            table.initialize(titleHeight, headerHeight, rowHeight,
                                title, columnArray, dataArray, node.page_size, node.page_num, node.page_index);
                            var trans = getTransform(node);
                            var pos = {left:trans[0], top:trans[1]};
                            table.draw($container, pos);

                            Events.trigger("node_reset", node);
                        },
                        error: function (resp) {
                            alert("failure");
                        }
                    });
                }
            });
        }
        else{
            var titleHeight = 30, headerHeight = 30, rowHeight = 30,
                title = node.node_display_name;
            var hortNum = window.object_table_column_num;
            var dataArray = node.rows[0];
            var columnArray = [];
            for(var i=0; i<hortNum; i++){
                columnArray.push({title:"col"+i, width:150});
            }
            //$.each(dataArray, function(key, value){
            //    columnArray.push({title:key, width:150});
            //})
            table = new ObjectTableBase();
            table.initialize(titleHeight, headerHeight, rowHeight,
                    title, columnArray, dataArray, hortNum, node.page_size, node.page_num, node.page_index);
        }

        var pos = {left:node.x?node.x:0, top:node.y?node.y:0};
        table.draw($container, pos);
        $.extend(node, {width:table.width+40, height:table.height+40,
            x:pos.left, y:pos.top, old_x:pos.left, old_y:pos.top, table:table});
    };

    TableNodeVisualizer.prototype.getCellPosition = function(node, column){
        var cell = node.table.getCellByColumnNameAndRowIndex(column, 1);
        if(!cell && column === "collection"){
            var size = node.table.getSize();
            return {x:node.x+size.width, y:node.y+0};
        }

        var position = cell.getPosition();
        var x = node.x + position.left + 10;//node.table.getLeftOfColumnName(column) + 10;
        var y = node.y + position.top + 10;//node.table.getTopOfRow(1) + 10;
        return {x:x, y:y};
    };


    window.TableNodeVisualizer = TableNodeVisualizer;
    return TableNodeVisualizer;
}());