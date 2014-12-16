//= require active_record_visualize/ColumnDef
//= require active_record_visualize/d3

//sub-module TableCell
(function () {
    "use strict";
    var TableCell = function(column_index, span){
        this.column_index = column_index;
        this.span = span;
    };
    TableCell.prototype.draw = function($container, column_width_array){

    };

    TableCell.prototype.getSize = function(column_width_array){
        var width = 0;
        var height = 30;
        for(var i=this.column_index; i<column_width_array.length && i<this.column_index+this.span; i++){
            width += column_width_array[i];
        }
        return {width:width, height:height};
    };
    window.TableCell = TableCell;
    return TableCell;
}());


//sub-module TableRow
(function () {
    "use strict";
    var TableRow = function(cells){
        this.cells = cells;
    };
    TableRow.prototype.draw = function($container, column_width_array){
        $.each(this.cells, function(index, cell){
            cell.draw($container, column_width_array);
        });
    };

    TableRow.prototype.getSize = function(column_width_array){
        var width = 0;
        var height = -1e10;
        $.each(this.cells, function(index, cell){
            var size = cell.getSize(column_width_array);
            width += size.width;
            height = Math.max(height, size.height);
        });
        return {width:width, height:height};
    };
    window.TableRow = TableRow;
    return TableRow;
}());

//sub-module TableBase
(function () {
    "use strict";
    var TableBase = function(rows){
        this.rows = rows;
    };
    TableBase.prototype.draw = function($container, column_width_array){
        $.each(this.rows, function(index, row){
            row.draw($container, column_width_array);
        });
    };

    TableBase.prototype.getSize = function(column_width_array){
        var width = 0;
        var height = 0;
        $.each(this.rows, function(index, row){
            var size = row.getSize(column_width_array);
            width = size.width;
            height += size.height;
        });
        return {width:width, height:height};
    };
    window.TableBase = TableBase;
    return TableBase;
}());

//sub-module SimpleTableBase
(function () {
    "use strict";
    var SimpleTableBase = function(titleHeight, headerHeight, rowHeight,
                                   title, columnArray, dataArray){
        this.titleHeight = titleHeight;
        this.headerHeight = headerHeight;
        this.rowHeight = rowHeight;
        this.title = title;
        this.columnArray = columnArray;
        this.dataArray = dataArray;

        this.rows = [];
        var columnNum = columnArray.length;

        var titleCell = new TableCell(0, columnNum, this.title);
        this.rows.push(new TableRow([titleCell]));

        var headerCells = [];
        for(var i=0; i<columnNum; i++){
            var headerCell = new TableCell(i, 1, columnArray[i]);
            headerCells.push(headerCell);
        }
        this.rows.push(new TableRow(headerCells));

        var dataCells = [];
        var dataNum = dataArray.length;
        for(var i=0; i<dataNum; i++){
            var colIndex = dataNum % columnNum;
            var rowIndex = dataNum / columnNum;
            var dataCell = new TableCell(colIndex, 1, dataArray[i]);
            dataCells.push(dataCell);
            if(colIndex === columnNum - 1){
                this.rows.push(new TableRow(dataCells));
            }
        }

    };
    SimpleTableBase.prototype = new TableBase();
    window.SimpleTableBase = SimpleTableBase;
    return SimpleTableBase;
}());

