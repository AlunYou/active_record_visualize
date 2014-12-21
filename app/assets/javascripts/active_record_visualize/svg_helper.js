//sub-module SVGHelper
(function () {
    "use strict";
    var SVGHelper = function(){
    };
    SVGHelper.prototype.drawRect = function($container, w, h, r, tl, tr, bl, br){
        var round = false;
        if(r && r > 0 && (tl || tr || bl || br)){
            round = true;
        }
        else{
            r = 0;
        }
        if(round && (!tl || !tr || !bl || !br)){
            return $container.append("path")
                .attr("d", function(d) {
                    return rounded_rect_path(0, 0, w, h, r, tl, tr, bl, br);
                });
        }
        else{
            return $container.append("rect")
                .attr("width", w)
                .attr("height", h)
                .attr("rx", r)
                .attr("ry", r);
        }
    };

    function rounded_rect_path(x, y, w, h, r, tl, tr, bl, br) {
        var retval;
        retval  = "M" + (x + r) + "," + y;
        retval += "h" + (w - 2*r);
        if (tr) { retval += "a" + r + "," + r + " 0 0 1 " + r + "," + r; }
        else { retval += "h" + r; retval += "v" + r; }
        retval += "v" + (h - 2*r);
        if (br) { retval += "a" + r + "," + r + " 0 0 1 " + -r + "," + r; }
        else { retval += "v" + r; retval += "h" + -r; }
        retval += "h" + (2*r - w);
        if (bl) { retval += "a" + r + "," + r + " 0 0 1 " + -r + "," + -r; }
        else { retval += "h" + -r; retval += "v" + -r; }
        retval += "v" + (2*r - h);
        if (tl) { retval += "a" + r + "," + r + " 0 0 1 " + r + "," + -r; }
        else { retval += "v" + -r; retval += "h" + r; }
        retval += "z";
        return retval;
    }

    window.SVGHelper = SVGHelper;
    return SVGHelper;
}());