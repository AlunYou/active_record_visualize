(function () {
    "use strict";


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
        if(node.rows.length == 1){
            var titleHeight = 30, headerHeight = 30, rowHeight = 30,
                title = "Table";
            var hortNum = 2;
            var dataArray = node.rows[0];
            var columnArray = [];
            $.each(dataArray, function(key, value){
                columnArray.push({title:key, width:150});
            })
            table = new ObjectTableBase();
            table.initialize(titleHeight, headerHeight, rowHeight,
                    title, columnArray, dataArray, hortNum);
        }
        else{
            table = new ArvTable("test", "single", columns, node.rows, 30, 30);
        }


        var pos = {left:node.x?node.x:0, top:node.y?node.y:0};
        table.draw($container, pos);
        $.extend(node, {width:table.width+40, height:table.height+40,
            x:pos.left, y:pos.top, old_x:pos.left, old_y:pos.top, table:table});
    };

    TableNodeVisualizer.prototype.getCellPosition = function(node, column){
        var x = node.x + node.table.getLeftOfColumnName(column) + 10;
        var y = node.y + node.table.getTopOfRow(1) + 10;
        return {x:x, y:y};
    };


    window.TableNodeVisualizer = TableNodeVisualizer;
    return TableNodeVisualizer;
}());