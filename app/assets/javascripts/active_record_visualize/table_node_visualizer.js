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
        var table = new ArvTable("test", "single", columns, node.rows, 30, 30);
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