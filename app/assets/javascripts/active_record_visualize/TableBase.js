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
        var $cellContainer = $container.append("svg:g")
            .attr("class", "cell")
            .attr("transform", "translate(" + this.row.table.getLeftOfColumn(this.columnIndex) + ",0)");
        var size = this.getSize();
        $cellContainer.append("rect")
            .attr("width", size.width - 1)
            .attr("height", size.height - 1);
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
        //this.initialize(rows, columnArray);
    };

    TableBase.prototype.initialize = function(rows, columnArray){
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
    };
    TableBase.prototype.draw = function($container, pos){
        this.clearDrawCache();
        var $tableContainer = $container.append("svg:g")
            .attr("class", "table")
            .attr("transform", "translate(" + pos.left + "," + pos.top + ")");
        $.each(this.rows, function(index, row){
            row.draw($tableContainer);
        });
        this.$canvas = $tableContainer;
        var size = this.getSize();
        this.width = size.width;
        this.height = size.height;
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
                                   title, columnArray, dataArray) {
        //this.initialize(titleHeight, headerHeight, rowHeight,
        //    title, columnArray, dataArray);
    };
    //var ctor = function(){};
    //ctor.prototype = new TableBase();
    //SimpleTableBase.prototype = new ctor();
    SimpleTableBase.prototype = new TableBase();
    SimpleTableBase.prototype.initialize = function(titleHeight, headerHeight, rowHeight,
                                   title, columnArray, dataArray){
        this.titleHeight = titleHeight;
        this.headerHeight = headerHeight;
        this.rowHeight = rowHeight;
        this.title = title;
        this.dataArray = dataArray;

        var rows = [];
        var columnNum = columnArray.length;

        var titleCell = new TableCell(0, columnNum, this.title);
        rows.push(new TableRow(0, [titleCell]));

        var headerCells = [];
        for(var i=0; i<columnNum; i++){
            var headerCell = new TableCell(i, 1, columnArray[i]);
            headerCells.push(headerCell);
        }
        rows.push(new TableRow(1, headerCells));

        var dataNum = this.dataArray.length;
        for(var i=0; i<dataNum; i++){
            var dataCells = [];
            for(var j=0; j<columnNum; j++){
                var dataCell = new TableCell(j, 1);
                dataCells.push(dataCell);
            }
            var row = new TableRow(2+i, dataCells);
            rows.push(row);
        }
        TableBase.prototype.initialize.call(this, rows, columnArray);
    };

    window.SimpleTableBase = SimpleTableBase;
    return SimpleTableBase;
}());


//sub-module ObjectTableBase
(function () {
    "use strict";
    var ObjectTableBase = function(titleHeight, headerHeight, rowHeight,
                                   title, columnArray, dataArray) {
        //this.initialize(titleHeight, headerHeight, rowHeight,
        //    title, columnArray, dataArray);
    };

    ObjectTableBase.prototype = new SimpleTableBase();
    ObjectTableBase.prototype.initialize = function(titleHeight, headerHeight, rowHeight,
                                                    title, columnArray, dataArray, hortNum){
        this.titleHeight = titleHeight;
        this.headerHeight = headerHeight;
        this.rowHeight = rowHeight;
        this.title = title;
        this.dataArray = dataArray;
        this.hortNum = hortNum;

        var rows = [];
        var columnNum = hortNum;

        var titleCell = new TableCell(0, columnNum, this.title);
        rows.push(new TableRow(0, [titleCell]));

        var dataNum = columnArray.length;
        var dataCells = [];
        for(var i=0; i<dataNum; i++){
            var colIndex = i % columnNum;
            var dataCell = new TableCell(colIndex, 1);
            dataCells.push(dataCell);

            if(colIndex === columnNum - 1 || i === dataNum-1){
                var row = new TableRow(rows.length, dataCells);
                rows.push(row);
                dataCells = [];
            }
        }
        TableBase.prototype.initialize.call(this, rows, columnArray);


    };
    ObjectTableBase.prototype.renderCellData = function(rowIndex, colIndex, $cellContainer){
        var cell = this.getCell(rowIndex, colIndex);
        var size = cell.getSize();

        var object = this.dataArray;
        var text, columnName;
        if(rowIndex === 0 ){
            text = this.title;
        }
        else {
            var columnNum = this.hortNum;

            var indexInColumnArray = (rowIndex-1) * columnNum + colIndex;
            columnName = this.columnArray[indexInColumnArray].title;
            text = object[columnName];
        }

        $cellContainer.append("text")
            .attr("class", "hint")
            .attr("x", size.width / 2)
            .attr("y", size.height / 4 * 1)
            .attr("dy", ".35em")
            .text(columnName);
        $cellContainer.append("text")
            .attr("x", size.width / 2)
            .attr("y", size.height / 4 * 3)
            .attr("dy", ".35em")
            .text(text);
    };

    window.ObjectTableBase = ObjectTableBase;
    return ObjectTableBase;
}());


