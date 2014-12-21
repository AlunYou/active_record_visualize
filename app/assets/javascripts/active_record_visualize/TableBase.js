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
            .attr("transform", "translate(" + (this.row.table.getLeftOfColumn(this.columnIndex)+0) + ",0)");
        var size = this.getSize();
        var tl=false, tr=false, bl=false, br=false;
        if(this.columnIndex == 0){
            if(this.row.rowIndex == 0){
                tl = true;
            }
            if(this.row.rowIndex == this.row.table.rows.length - 1){
                bl = true;
            }
        }
        if(this.columnIndex + this.span - 1 == this.row.table.columnArray.length - 1){
            if(this.row.rowIndex == 0){
                tr = true;
            }
            if(this.row.rowIndex == this.row.table.rows.length - 1){
                br = true;
            }
        }
        var $background = new SVGHelper().drawRect($cellContainer, size.width, size.height,
            this.row.table.border_radius, tl, tr, bl, br);
        $background.attr("class", "cell-background");
        this.row.table.renderCellData(this.row.rowIndex, this.columnIndex, $cellContainer);

        //border-right
        if(this.columnIndex + this.span - 1 != this.row.table.columnArray.length - 1){
            $cellContainer.append("line")
                .attr("class", "border")
                .attr("x1", size.width)
                .attr("y1", 0)
                .attr("x2", size.width)
                .attr("y2", size.height);
        }
        var sel = $($cellContainer[0][0]).find("text");
        new SVGHelper().perfectEllipsis(sel, size.width-2);
    };

    TableCell.prototype.getSize = function(){
        var width = 0;
        var height = 30;
        for(var i=this.columnIndex; i<this.row.table.columnArray.length && i<this.columnIndex+this.span; i++){
            width += this.row.table.columnArray[i].width;
        }
        return {width:width, height:height};
    };
    TableCell.prototype.getPosition = function(){
        var left = this.row.table.getLeftOfColumn(this.columnIndex);
        var top = this.row.table.getTopOfRow(this.row.rowIndex);
        return {left:left, top:top};
    };

    window.TableCell = TableCell;
    return TableCell;
}());


//sub-module TableRow
(function () {
    "use strict";
    var TableRow = function(rowIndex, cells, classNames){
        this.rowIndex = rowIndex;
        this.cells = cells;
        this.classNames = classNames;
        var self = this;
        $.each(this.cells, function(index, cell){
            cell.row = self;
        });
    };
    TableRow.prototype.draw = function($container){
        var top = this.table.getTopOfRow(this.rowIndex);
        var $rowContainer = $container.append("svg:g")
            .attr("class", this.classNames + " row")
            .attr("transform", "translate(0," + (top+0) + ")");
        var size = this.getSize();


        $.each(this.cells, function(index, cell){
            cell.draw($rowContainer);
        });

        //border-bottom
        if(this.rowIndex != this.table.rows.length - 1){
            $rowContainer.append("line")
                .attr("class", "border")
                .attr("x1", 0)
                .attr("y1", size.height)
                .attr("x2", size.width)
                .attr("y2", size.height);
        }
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
    TableRow.prototype.getPosition = function(){
        var left = this.table.getLeftOfColumn(0);
        var top = this.table.getTopOfRow(this.rowIndex);
        return {left:left, top:top};
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

    TableBase.prototype.initialize = function(rows, columnArray, classNames){
        this.rows = rows;
        this.columnArray = columnArray;
        this.classNames = classNames;
        var self = this;
        $.each(this.rows, function(index, row){
            row.table = self;
        });
        this.border_radius = 5;
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
            .attr("class", "value")
            .attr("x", 2)//size.width / 2)
            .attr("y", size.height / 2)
            .attr("dy", ".35em")
            .text(text);
    };
    TableBase.prototype.draw = function($container, pos){
        this.clearDrawCache();
        var size = this.getSize();
        this.width = size.width;
        this.height = size.height;

        var $tableContainer = $container.append("svg:g")
            .attr("class", this.classNames + " table")
            .attr("transform", "translate(" + pos.left + "," + pos.top + ")");
        var $background = new SVGHelper().drawRect($tableContainer, size.width, size.height, this.border_radius, true, true, true, true);
        $background.attr("class", "table-background");
        for(var i=0; i<this.rows.length; i++){
            var row = this.rows[i];
            row.draw($tableContainer);
        }
        this.$canvas = $tableContainer;

    };

    TableBase.prototype.getSize = function(){
        var width = 0;
        var height = 0;
        $.each(this.rows, function(index, row){
            var size = row.getSize();
            width = Math.max(size.width, width);
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

    TableBase.prototype.getColumnIndexByColumnName = function(name){
        var index = -1;
        for(var i=0; i<this.columnArray.length; i++){
            if(this.columnArray[i].title === name){
                index = i;
                break;
            }
        }
        return index;
    };

    TableBase.prototype.getLeftOfColumnName = function(name){
        var index = this.getColumnIndexByColumnName(name);
        return this.getLeftOfColumn(index);
    };

    TableBase.prototype.getTopOfRow = function(index){
        if(this.rowTopCache[index]){
            return this.rowTopCache[index];
        }
        else{
            var top = 0;
            for(var i=0; i<index; i++){
                top += this.rows[i].getSize().height;
            }
            this.rowTopCache[index] = top;
            return top ;
        }
    };

    TableBase.prototype.clearDrawCache = function(){
        this.columnLeftCache = {};
        this.rowTopCache = {};
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
        this.classNames = "collection";

        var rows = [];
        var columnNum = columnArray.length;

        var titleCell = new TableCell(0, columnNum, this.title);
        rows.push(new TableRow(0, [titleCell], "title-row"));

        var headerCells = [];
        for(var i=0; i<columnNum; i++){
            var headerCell = new TableCell(i, 1, columnArray[i]);
            headerCells.push(headerCell);
        }
        rows.push(new TableRow(1, headerCells, "header-row"));

        var dataNum = this.dataArray.length;
        for(var i=0; i<dataNum; i++){
            var dataCells = [];
            for(var j=0; j<columnNum; j++){
                var dataCell = new TableCell(j, 1);
                dataCells.push(dataCell);
            }
            var row = new TableRow(2+i, dataCells, "data-row");
            rows.push(row);
        }
        TableBase.prototype.initialize.call(this, rows, columnArray, this.classNames);
    };

    SimpleTableBase.prototype.getCellByColumnNameAndRowIndex = function(columnName, dataIndex){
        var colIndex = this.getColumnIndexByColumnName(columnName);
        return this.getCell(dataIndex+2, colIndex);
    }

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
        this.classNames = "object";

        this.fieldArray = [];
        var self = this;
        $.each(this.dataArray, function(key, value){
            self.fieldArray.push({title:key});
        });

        var rows = [];
        var columnNum = hortNum;

        var titleCell = new TableCell(0, columnNum, this.title);
        rows.push(new TableRow(0, [titleCell], "title-row"));

        var dataNum = this.fieldArray.length;
        var dataCells = [];
        for(var i=0; i<dataNum; i++){
            var colIndex = i % columnNum;
            var dataCell = new TableCell(colIndex, 1);
            dataCells.push(dataCell);

            if(colIndex === columnNum - 1 || i === dataNum-1){
                while(dataCells.length < columnNum){
                    dataCells.push(new TableCell(++colIndex, 1));
                }
                var row = new TableRow(rows.length, dataCells, "data-row");
                rows.push(row);
                dataCells = [];
            }
        }
        TableBase.prototype.initialize.call(this, rows, columnArray, this.classNames);
    };
    ObjectTableBase.prototype.renderCellData = function(rowIndex, colIndex, $cellContainer){
        var cell = this.getCell(rowIndex, colIndex);
        var size = cell.getSize();

        var object = this.dataArray;
        var text, columnName;
        if(rowIndex === 0 ){
            text = this.title;

            $cellContainer.append("text")
                .attr("class", "value")
                .attr("x", size.width / 2)
                .attr("y", size.height / 2)
                .attr("dy", ".35em")
                .text(text);
        }
        else {
            var columnNum = this.hortNum;
            var indexInColumnArray = (rowIndex-1) * columnNum + colIndex;
            if(indexInColumnArray < this.fieldArray.length){
                columnName = this.fieldArray[indexInColumnArray].title;
                text = object[columnName];

                $cellContainer.append("text")
                    .attr("class", "hint")
                    .attr("x", 2)//size.width / 2)
                    .attr("y", size.height / 4 * 1)
                    .attr("dy", ".35em")
                    .text(columnName);
                $cellContainer.append("text")
                    .attr("class", "value")
                    .attr("x", 20)//size.width / 2)
                    .attr("y", size.height / 4 * 3)
                    .attr("dy", ".35em")
                    .text(text);
            }
        }
    };

    ObjectTableBase.prototype.getCellByColumnNameAndRowIndex = function(columnName, rowIndex){
        //parameter rowIndex is ignored
        var columnIndex = this.getFieldIndexByColumnName(columnName);

        var columnNum = this.hortNum;
        var rowIndex = Math.floor(columnIndex / columnNum) + 1;
        var colIndex = columnIndex % columnNum;
        return this.getCell(rowIndex, colIndex);
    }
    ObjectTableBase.prototype.getFieldIndexByColumnName = function(name){
        var index = -1;
        for(var i=0; i<this.fieldArray.length; i++){
            if(this.fieldArray[i].title === name){
                index = i;
                break;
            }
        }
        return index;
    };

    window.ObjectTableBase = ObjectTableBase;
    return ObjectTableBase;
}());


