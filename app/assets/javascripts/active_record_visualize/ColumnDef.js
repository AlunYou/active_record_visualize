//= require jquery
//= require active_record_visualize/d3

var column_def = function(dbTableName, dbFieldName, title, valueType, linkType, width){
    this.dbTableName = dbTableName;
    this.dbFieldName = dbFieldName;
    this.title = title;;
    this.valueType = valueType;//text, image
    this.linkType = linkType;//static, single, multiple
    this.width = width;
};
window.ArvColumnDef = column_def;
$.extend(column_def.prototype, {
     date_format: d3.time.format("%Y-%m-%d"),
     sort: function(a, b) {
         if (typeof a == "string") {
             var parseA = this.date_format.parse(a);
             if (parseA) {
                 var timeA = parseA.getTime();
                 var timeB = this.date_format.parse(b).getTime();
                 return timeA > timeB ? 1 : timeA == timeB ? 0 : -1;
             }
             else{
                 return a.localeCompare(b);
             }
         }
         else if (typeof a == "number") {
             return a > b ? 1 : a == b ? 0 : -1;
         }
         else if (typeof a == "boolean") {
             return b ? 1 : a ? -1 : 0;
         }
     }
});
