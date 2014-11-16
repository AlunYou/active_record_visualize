//= require active_record_visualize/ColumnDef
//= require active_record_visualize/d3

var table = function(name, type, columns, dataRows, headerHeight, rowHeight){
    this.name = name;
    this.type = type;
    this.headerHeight = headerHeight;
    this.rowHeight = rowHeight;
    this.columns = columns;
    this.dataRows = dataRows;
    $.each(this.dataRows, function(index, row){
        row.arv_inner_id = index + 1;
    });
};
window.ArvTable = table;
$.extend(table.prototype, {
    draw: function(parentNode, position) {
        this.clearDrawCache();
        this.width = this.getWidth();
        this.height = this.getHeight();

        var canvas = parentNode
            .append("g")
            .attr("width", this.width)
            .attr("height", this.height)
            .attr("transform", "translate(" + position.left + "," + position.top + ")");

        this.headerGrp = canvas.append("g").attr("class", "headerGrp");
        this.rowsGrp = canvas.append("g").attr("class", "rowsGrp");

        this.previousSort = null;
        this.refreshTable(null);
    },

    refreshTable: function(sortOn) {
        this.fillHeader();
        this.fillRows();
        this.updateSort(sortOn);
    },

    fillHeader: function(){
        var self = this;
        // create the table header
        var column_names = $.map(this.columns, function (column, index) {
            return column.title;
        });
        var header = this.headerGrp.selectAll("g")
            .data(column_names)
            .enter().append("g")
            .attr("class", "header")
            .attr("transform", function (d, i) {
                return "translate(" + self.getLeftOfColumn(i)  + ",0)";
            })
            .on("click", function (d) {
                return self.refreshTable(d);
            });

        header.append("rect")
            .attr("width", function (d, i) {
                return self.columns[i].width - 1;
            })
            .attr("height", self.headerHeight - 1);

        header.append("text")
            .attr("x", function (d, i) {
                return self.columns[i].width / 2;
            })
            .attr("y", this.headerHeight / 2)
            .attr("dy", ".35em")
            .text(String);
    },

    fillRows: function(){
        var self = this;
        // select rows
        this.rows = this.rowsGrp.selectAll("g.row").data(this.dataRows,
            function (d) {
                return d.arv_inner_id;
            });

        // create rows
        var rowsEnter = this.rows.enter().append("svg:g")
            .attr("class", "row")
            .attr("transform", function (d, i) {
                return "translate(0," + self.getTopOfRow(i+1) + ")";//strange 1 pixel;//(i + 1) * (fieldHeight + 1) +
            });

        // select cells
        var cells = this.rows.selectAll("g.cell").data(function (d) {
            //return d3.values(d);
            return $.map(self.columns, function(col, index){
                return d[col.title];
            });
        });

        // create cells
        var cellsEnter = cells.enter().append("svg:g")
            .attr("class", "cell")
            .attr("transform", function (d, i) {
                return "translate(" + self.getLeftOfColumn(i) + ",0)";
            });

        cellsEnter.append("rect")
            .attr("width", function (d, i) {
                return self.columns[i].width - 1;
            })
            .attr("height", this.rowHeight - 1);

        cellsEnter.append("text")
            .attr("x", function (d, i) {
                return self.columns[i].width / 2;
            })
            .attr("y", this.rowHeight / 2)
            .attr("dy", ".35em")
            .text(String);
    },

    updateSort: function(sortOn){
        var self = this;
        //update if not in initialisation
        if (sortOn !== null) {
            var sort_col = $.grep(this.columns, function(col, index){
                return col.title == sortOn;
            })[0];
            var sort = $.proxy(sort_col.sort, sort_col);
            // update rows
            if (sortOn != this.previousSort) {
                this.rows.sort(function (a, b) {
                    return sort(a[sortOn], b[sortOn]);
                });
                this.previousSort = sortOn;
            } else {
                this.rows.sort(function (a, b) {
                    return sort(b[sortOn], a[sortOn]);
                });
                this.previousSort = null;
            }
            this.rows.transition()
                .duration(500)
                .attr("transform", function (d, i) {
                    return "translate(0," + self.getTopOfRow(i+1) + ")";
                });
        }
    },

    getLeftOfColumn: function(index){
        if(this.columnLeftCache[i]){
            return this.columnLeftCache[i];
        }
        else{
            var left = 0;
            for(var i=0; i<index; i++){
                left += this.columns[i].width;
            }
            this.columnLeftCache[i] = left;
            return left;
        }
    },

    getTopOfRow: function(index){
        return this.rowHeight * index ;
    },

    getWidth: function(){
        var total_width = 0;
        $.each(this.columns, function (index, column) {
            total_width += column.width;
        });
        return total_width;
    },

    getHeight: function(){
        return this.headerHeight + this.rowHeight * this.dataRows.length;
    },

    clearDrawCache: function(){
        this.columnLeftCache = {};
    }
});
