// Place all the behaviors and hooks related to the matching controller here.
// All this logic will automatically be available in application.js.
//= require jquery
//= require active_record_visualize/d3
//= require active_record_visualize/ColumnDef
//= require active_record_visualize/Table

$().ready(function() {
    var renderTable = function(table_name){
        $.ajax({
            type: "get",
            url: "/active_record_visualize/table",
            data: {table_name:table_name},
            success: function (tableData) {
                var columns = $.map(tableData.columns, function(col, index){
                    return new ArvColumnDef(col.dbTableName, col.dbFieldName, col.title, col.valueType, col.linkType, col.width);
                });
                $.each(tableData.rows, function(index, row){
                    $.each(row, function(key, value){
                        if(value == null){
                            row[key] = ""
                        }
                    })
                })

                var table = new ArvTable("test", "single", columns, tableData.rows, 30, 30);
                var canvas = d3.select(".canvas");
                table.draw(canvas, {left:200, top:200});
                last_table = table;
            },
            error: function (resp) {

                alert("failure");
            }
        });
    };

    var last_table = null;

    var $select = $("#table_list_id");
    $select.on("change", function(){
        var table_name = $select.val();
        last_table.destroy();
        renderTable(table_name);
    });
    var table_name = $select.val();
    renderTable(table_name);

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
    var canvas = d3.select(".canvas");
    table.draw(canvas, {left:10, top:10});

});

