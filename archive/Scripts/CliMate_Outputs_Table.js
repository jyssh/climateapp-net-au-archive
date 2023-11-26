

function generateTableHtml(selector, data, transform) {
    if (Validate(data)) {
        
        var tableid = selector + "-table";
        var additionclass = transform === true ? "show-detail" : "";
        var html = "<table class='table table-striped  " + additionclass + "' id='" + tableid + "'>";
        if (Validate(data.HeaderRow)) {
            html = html + "<thead>";
            html = html + "<tr>";
            for (var i = 0; i < data.HeaderRow.Cells.length; ++i) {
                html = html +
                    "    <th class='col" + i.toString() + "' style='width:" + data.Widths[i] + "%'>" + data.HeaderRow.Cells[i] + "</th>";
            }
            html = html + "</tr>";
            html = html + "</thead>";
        }
        html = html + "<tbody>";
        for (var rowindex = 0; rowindex < data.BodyRows.length; ++rowindex) {
            var row = data.BodyRows[rowindex];
            var dataid = Validate(row.Guid) ? "data-id='" + row.Guid + "' " : " ";
            var controlleraction = Validate(row.ControllerAction) ? "data-controlleraction='" + row.ControllerAction + "' " : " ";
            if (Validate(row.BrushColor)&&Validate(row.PenColor)) {
                html = html + "<tr "+dataid+controlleraction+" style='background:" + row.BrushColor + ";color:"+row.PenColor+"'>";
            } else {
                html = html + "<tr  " + dataid + controlleraction + ">";
            }

            for (var colindex = 0; colindex < row.Cells.length; ++colindex) {
                var coltext = row.Cells[colindex];
                html = html + "<td class='col"+colindex.toString()+"' style='width:" + data.Widths[colindex] + "%'>" + coltext + "</td>";
            }
            html = html + "</tr>";
        }
        html = html + "</tbody>";
        html = html + "</table>";
        $("#" + selector + "-canvas").html(html);
        if (transform) {
            var datatable= $("#" + selector + "-canvas table").DataTable({
                stateSave: true

            });
            $("#" + selector + "-canvas table  tbody").on('click', 'tr', function () {
                var row = $(this);
                var id = row.attr("data-id");
                var controlleraction = row.attr("data-controlleraction");
               
                window.open("/" + controlleraction + "/" + id, "_blank");

            });
            return datatable;
        }
    }
    return null;
}