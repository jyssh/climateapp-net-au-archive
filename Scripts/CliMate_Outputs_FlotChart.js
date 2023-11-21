
var previousPoint;

function generateFlotChart(selector, data) {
    if (!Validate(data)) {
        data = new Object();
        data.Min = 0;
        data.YMax = 100;
        data.xaxis = new Object();
        data.xaxis.mode = null;
        data.xaxis.tickLength = 0;
        data.xaxis.tickSize = null;
        data.xaxis.axisLabelUseCanvas = true;
        data.xaxis.axisLabelFontSizePixels = 12;
        data.xaxis.axisLabelPadding = 5;
        data.xaxis.min = null;
        data.xaxis.max = null;
        data.legend = new Object();
        data.legend.show = false;
        data.Data = [[[0, 0],  [10, 0]]];
    }

   
    if (data.LegendPlaceholder != null && data.LegendPlaceholder.length > 0) {
        data.legend.container = $(data.LegendPlaceholder);
    }
    var plotid = "#" + selector+ " .flotchart-canvas";
    var exists = $(plotid).length > 0;
    var plot = $.plot(plotid,
        data.Data,
        {
            yaxes:data.yaxes,
            xaxis: data.xaxis,
            grid: data.grid,
            legend:data.legend

        });

    if (Validate(data.Annotations)) {
        for (var i = 0; i < data.Annotations.length; ++i) {
            var annotation = data.Annotations[i];
            var o = plot.pointOffset({ x: annotation.x, y: annotation.y });
            var ctx = plot.getCanvas().getContext("2d");
           
            o.left += annotation.offsetLeft;
            o.top += annotation.offsetTop;

            //ctx.beginPath();
            //ctx.moveTo(o.left, o.top);
            //ctx.lineTo(o.left, o.top - 10);
            //ctx.lineTo(o.left + 10, o.top - 5);
            //ctx.lineTo(o.left, o.top);
            //ctx.fillStyle = "#000";
            //ctx.fill();

            ctx.font = annotation.font;
            ctx.fillText(annotation.text, o.left, o.top);

        }
    }

    //$("<div id='tooltip'></div>").css({
    //    position: "absolute",
    //    display: "none",
    //    border: "1px solid #fdd",
    //    padding: "2px",
    //    "background-color": "#fee",
    //    opacity: 0.80
    //}).appendTo("body");

    $(plotid).bind("plothover",
        function(event, pos, item) {
            var chart = $(this);
            if (item) {
                if (previousPoint !== item.datapoint) {
                    previousPoint = item.datapoint;
                    
                    $("#flot-tooltip").remove();
                    var x = "";
                    if (Validate(item.series.labels)) {
                        var tmp = item.datapoint[0];
                        if (Validate(tmp) && tmp >= 0 && tmp < item.series.labels.length) {
                            x = item.series.labels[tmp];
                        } else {
                            x = item.datapoint[0].toFixed(0);
                        }
                    } else {
                        x=item.datapoint[0].toFixed(0);
                    }
                    var y = item.datapoint[1].toFixed(0);
                    var units = item.series.yaxis.position==="left" ? data.DataUnits : data.DataUnits2;
                    var _color = item.series.color;
                    if (Validate(item.series.name) && item.series.name.length > 0) {
                        if (data.xaxis.mode === "time") {
                            var date = new Date(Number(x));
                            var html = "<div>" + date.format("dd/F/") + "<span style='font-weight:bold;color:" + _color + "'>" + item.series.name + "</span>:  " + y + units +"</div>"; //+ dataunits;
                            showTooltip(item.pageX, item.pageY - 40, html, _color);
                        } else {
                            var html = "<div><span style='font-weight:bold;color:" + _color + "'>" + item.series.name + "</span><br/><span>" + x + ": " + y + units +"</div>"; //+ dataunits;
                            showTooltip(item.pageX, item.pageY - 60, html, _color);
                        }
                    } else {
                        if (data.xaxis.mode === "time") {
                            var date = new Date(Number(x));
                            var html = "<div>" + date.format("dd/MM") + ": " + y + units + "</div>"; //+ dataunits;
                            showTooltip(item.pageX, item.pageY - 40, html, _color);
                        } else {
                            var html = "<div><span>" + x + ": " + y + units + "</div>"; //+ dataunits;
                            showTooltip(item.pageX, item.pageY - 60, html, _color);
                        }
                    }

                }
            }
            else {
                $("#flot-tooltip").remove();
                previousPoint = null;
            }

        });
    $("#" + selector + " .output-spinner").hide();
    return plot;

}

function showTooltip(x, y, contents, _backcolor) {
    $('<div id="flot-tooltip">' + contents + '</div>').css({
        position: 'absolute',
        background: "#ffffff",
        display: 'none',
        opacity: 0.80,
        top: y + 5,
        left: x + 5,
        'border-radius': '4px',
        padding:'4px',
        border: '1px solid ' +_backcolor

}).appendTo("body").fadeIn(200);
}

function generatePieChart(selector, data, showlegend) {

    if (!Validate(data)) {
        var data = [
        	{ label: " ",  data: 33},
        	{ label: " ",  data: 33},
        	{ label: " ",  data: 33}
        	
        ];
    }
    if (showlegend) {
        $.plot("#" + selector + " .piechart-canvas", data.Data, {
            series: {
                pie: {
                    show: true,
                    radius: 1
                    
                }
            },
            legend: {
                show: true
            }
        });
    } else {
        $.plot("#" + selector + " .piechart-canvas", data.Data, {
            series: {
                pie: {
                    show: true,
                    radius: 0.86,
                    label: {
                        show: true,
                        radius: 1,
                        formatter: labelFormatter,
                        background: {
                            opacity: 0.0
                        },
                        threshold: 0.03
                    }
                }
            },
            legend: {
                show: false
            }
        });
    }
    $(".pieLabelBackground").css("height", "36px");
    $(".pieLabel").css("line-height", "1em");
    $("#" + selector + " .output-spinner").hide();
}

function labelFormatter(label, series) {
    return "<div style='font-size:10pt; text-align:center; padding:2px; color:black;'>" + label + "<br/>" + Math.round(series.percent) + "%</div>";
    //return "<div style='font-size:10pt; text-align:center; padding:2px; color:" + series.color + ";'>" + label + "<br/>" + Math.round(series.percent) + "%</div>";
}

