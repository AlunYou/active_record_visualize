//= require active_record_visualize/ColumnDef
//= require active_record_visualize/d3

//sub-module TableCell
(function () {
    "use strict";
    var TableCell = function(columnIndex, span){
        this.columnIndex = columnIndex;
        this.span = span;
    };
    TableCell.prototype.draw = function($container){
        this.$cellGrp = $container.append("g").attr("class", "cellGrp");
        var $cellContainer = this.$cellGrp.append("svg:g")
            .attr("class", "cell")
            .attr("transform", "translate(" + this.row.table.getLeftOfColumn(this.columnIndex) + ",0)");
        this.row.table.renderCellData(this.row.rowIndex, this.columnIndex, $cellContainer);
    };

    TableCell.prototype.getSize = function(){
        var width = 0;
        var height = 30;
        for(var i=this.columnIndex; i<this.row.table.columnArray.length && i<this.columnIndex+this.span; i++){
            width += this.row.table.columnArray[i].width;
        }
        return {width:width, height:height};
    };

    window.TableCell = TableCell;
    return TableCell;
}());


//sub-module TableRow
(function () {
    "use strict";
    var TableRow = function(rowIndex, cells){
        this.rowIndex = rowIndex;
        this.cells = cells;
        var self = this;
        $.each(this.cells, function(index, cell){
            cell.row = self;
        });
    };
    TableRow.prototype.draw = function($container){
        var $rowContainer = $container.append("svg:g")
            .attr("class", "row")
            .attr("transform", "translate(0," + this.table.getTopOfRow(this.rowIndex) + ")");
        $.each(this.cells, function(index, cell){
            cell.draw($rowContainer);
        });
    };

    TableRow.prototype.getCellByColIndex = function(colIndex){
        for(var i=0; i<this.cells.length; i++){
            if(this.cells[i].columnIndex === colIndex){
                return this.cells[i];
            }
        }
        return null;
    };

    TableRow.prototype.getSize = function(){
        var width = 0;
        var height = -1e10;
        $.each(this.cells, function(index, cell){
            var size = cell.getSize();
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
    var TableBase = function(rows, columnArray){
        this.rows = rows;
        this.columnArray = columnArray;
        var self = this;
        $.each(this.rows, function(index, row){
            row.table = self;
        });
    };

    TableBase.prototype.getCell = function(rowIndex, colIndex){
        var row = this.rows[rowIndex];
        var cell = row.getCellByColIndex(colIndex);
        return cell;
    };
    TableBase.prototype.renderCellData = function(rowIndex, colIndex, $cellContainer){
        var cell = this.getCell(rowIndex, colIndex);
        var size = cell.getSize();
        $cellContainer.append("rect")
            .attr("width", size.width - 1)
            .attr("height", size.height - 1);

        var colName = this.columnArray[colIndex].title;
        var text;
        if(rowIndex === 0 ){
            text = this.title;
        }
        else if(rowIndex == 1){
            text = colName;
        }
        else{
            var row = this.dataArray[rowIndex - 2];
            text = row[colName];
        }

        $cellContainer.append("text")
            .attr("x", size.width / 2)
            .attr("y", size.height / 2)
            .attr("dy", ".35em")
            .text(text);
        //.text(String);
    };
    TableBase.prototype.draw = function($container){
        this.clearDrawCache();
        $.each(this.rows, function(index, row){
            row.draw($container);
        });
    };

    TableBase.prototype.getSize = function(){
        var width = 0;
        var height = 0;
        $.each(this.rows, function(index, row){
            var size = row.getSize();
            width = size.width;
            height += size.height;
        });
        return {width:width, height:height};
    };

    TableBase.prototype.getLeftOfColumn = function(index){
        if(this.columnLeftCache[index]){
            return this.columnLeftCache[index];
        }
        else{
            var left = 0;
            for(var i=0; i<index; i++){
                left += this.columnArray[i].width;
            }
            this.columnLeftCache[index] = left;
            return left;
        }
    };

    TableBase.prototype.getLeftOfColumnName = function(name){
        var index = -1;
        for(var i=0; i<this.columnArray.length; i++){
            if(this.columnArray[i].title === name){
                index = i;
                break;
            }
        }
        return this.getLeftOfColumn(index);
    };

    TableBase.prototype.getTopOfRow = function(index){
        return this.rowHeight * index ;
    };

    TableBase.prototype.clearDrawCache = function(){
        this.columnLeftCache = {};
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
        this.rows.push(new TableRow(0, [titleCell]));

        var headerCells = [];
        for(var i=0; i<columnNum; i++){
            var headerCell = new TableCell(i, 1, columnArray[i]);
            headerCells.push(headerCell);
        }
        this.rows.push(new TableRow(1, headerCells));

        var dataNum = this.dataArray.length;
        for(var i=0; i<dataNum; i++){
            var dataCells = [];
            for(var j=0; j<columnNum; j++){
                var dataCell = new TableCell(j, 1);
                dataCells.push(dataCell);
            }
            var row = new TableRow(2+i, dataCells);
            this.rows.push(row);
        }
        var self = this;
        $.each(this.rows, function(index, row){
            row.table = self;
        });
    };
    SimpleTableBase.prototype = new TableBase([], []);
    window.SimpleTableBase = SimpleTableBase;
    return SimpleTableBase;
}());

