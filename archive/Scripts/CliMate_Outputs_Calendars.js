

function generateYearlyMudMap(containerId, data) {
    var height = 0;
    var canvas = document.getElementById(containerId + "-canvas");
    if (Validate(data)) {
        var years = data.EndYear - data.StartYear;
        height = (years * 50 / 10)+200;
        $("#" + containerId ).css("height", height);
        $("#" + containerId + "-canvas").css("height", height);
        canvas.width = canvas.clientWidth;
        canvas.height = canvas.clientHeight;
    } else {
        canvas.width = canvas.clientWidth;
        canvas.height = canvas.clientHeight;
        height = canvas.height;
    }
    
    if (canvas != null) {
        if (typeof (G_vmlCanvasManager) != 'undefined')
            G_vmlCanvasManager.initElement(canvas);
        var ctx = canvas.getContext('2d');
        var w = canvas.width;
        var h = height;//canvas.height;
        
        ctx.clearRect(0, 0, w, h);
        var decimals = data.Units==="mm"?0:1;
        if (w >= 979)
            ctx.font = "9pt Verdana";
        else if (w >= 768)
            ctx.font = "8pt Verdana";
        else if (w >= 320) {
            ctx.font = "7pt Verdana";
            decimals = 0;
        } else {
            ctx.font = "6pt Verdana";
            decimals = 0;
        }

        var filter = data.ENSOFilterState;
            var rows = calculaterowcount(data.StartYear, data.EndYear);
            var cellwidth = w / 10.0;
            var cellheight = 50; //(height-25)/(rows+2);

            ctx.fillStyle = 'black';

            var index = 0;
            var dataindex = 0;
            var cellstartyear = data.StartYear;
            var buf = 2;
            for (var row = 0; row <= rows; ++row) {
                var top = (row) * cellheight;

                for (var col = 0; col < 10; ++col) {
                    var year = index + cellstartyear;
                    if (year >= data.StartYear && year <= data.EndYear) {
                        var left = col * cellwidth;
                        if (!Validate(data.YearlyData)||dataindex < data.YearlyData.length) {
                            
                            var ensoindex = Validate(data.ENSOData) ? data.ENSOData[dataindex] : 3; //esElNino,esLaNina,esNeutral,esUndefined
                            var drawnormal = filter === 3 || filter === ensoindex;
                      
                            if (drawnormal) {
                                var percentage =
                                    getGradientPercentage(Validate(data.YearlyData) ? data.YearlyData[dataindex] : 0,
                                        data.Max,
                                        data.Min,
                                        data.Average);


                                if (percentage > 0)
                                    ctx.fillStyle = GetValueColor(1 - percentage, 49, 153, 255);
                                else
                                    ctx.fillStyle = GetValueColor(1 + percentage, 239, 163, 31);
                                ctx.fillRect(left + buf, top + buf, cellwidth - 2 * buf, cellheight - 2 * buf);


                                ctx.strokeStyle = Validate(data.ENSOData) ? GetENSOColor(data.ENSOData[dataindex]) : "white";
                                ctx.lineWidth = 2;
                                ctx.strokeRect(left + buf, top + buf, cellwidth - 2 * buf, cellheight - 2 * buf);
                                if (percentage < 0.7 || percentage <= 0) {
                                    DrawTextsCenteredInRect(ctx,
                                        w,
                                        Validate(data.YearlyData) ? data.YearlyData[dataindex].toFixed(decimals) : "",
                                        year,
                                        left,
                                        top,
                                        cellwidth,
                                        cellheight,
                                        'black');
                                } else {
                                    DrawTextsCenteredInRect(ctx,
                                        w,
                                        Validate(data.YearlyData) ? data.YearlyData[dataindex].toFixed(decimals) : "",
                                        year,
                                        left,
                                        top,
                                        cellwidth,
                                        cellheight,
                                        'white');
                                }
                            }
                            else {
                                
                                    DrawTextsCenteredInRect(ctx,
                                        w,
                                        Validate(data.YearlyData) ? data.YearlyData[dataindex].toFixed(decimals) : "",
                                        year,
                                        left,
                                        top,
                                        cellwidth,
                                        cellheight,
                                        'silver');
                                
                            }
                            
                            dataindex = dataindex + 1;

                        } else {
                            ctx.fillStyle = 'white';
                            ctx.fillRect(left, top, cellwidth, cellheight);
                        }


                    }
                    index = index + 1;

                }

            
    
           

            }
            var colors = [];
            colors.push("rgb(239,163,31)");
            colors.push("white");
            colors.push("rgb(49,153,255)");
    
            DrawLegend(ctx,w, h, rows * cellheight - 1, data.Max, data.Min, data.Average,data.Units,colors,true);
    }

};

//function getENSOFilter(inputstate) {
    
//    if (inputstate === 0) 
//    {
//        return 0;//esElNino
//    }
//    else if (data.ENSOFilterState === 0) 
//    {
//        return 1;//esLaNina
//    }
//    else if (data.ENSOFilterState === 0) 
//    {
//        return 2;//esNeutral
//    }
   
//    return 3;//esUndefined
//}



function DrawLegend(ctx, width, height, _top, maxvalue, minvalue, mymedian, units, colors, showenso) {
    var center = width / 2.0;
    var cellwidth = 120;
    var cellheight = 20;

    ctx.lineWidth = 2;
    var left, right;
    var top = _top + 4;
    var bottom;
    var bottom2;
    if (showenso) {
        ctx.strokeStyle = GetENSOColor(0);
        left = center - cellwidth / 2.0 - cellwidth - 4;
        ctx.strokeRect(left, top, cellwidth, cellheight);
        DrawTextCenteredInRect2(ctx, "El Nino", left, top, cellwidth, cellheight, 'black');

        left = center - cellwidth / 2.0;
        ctx.strokeStyle = GetENSOColor(2);
        ctx.strokeRect(left, top, cellwidth, cellheight);
        DrawTextCenteredInRect2(ctx, "Neutral", left, top, cellwidth, cellheight, 'black');

        left = center + cellwidth / 2.0 + 4;
        ctx.strokeStyle = GetENSOColor(1);
        ctx.strokeRect(left, top, cellwidth, cellheight);
        DrawTextCenteredInRect2(ctx, "La Nina", left, top, cellwidth, cellheight, 'black');
    }
    left = center - cellwidth / 2.0 - cellwidth - 4;
    right = center + cellwidth / 2.0 + cellwidth + 4;
    top = top + cellheight + 4;
    bottom = top + cellheight;
    bottom2 = bottom + 4;

    var legendwidth = right - left + 1;
    var grd = ctx.createLinearGradient(left, 0, left + legendwidth, 0);
    for (var i = 0; i < colors.length; ++i) {
        var color = colors[i];
        var stop = i / (colors.length - 1);
        grd.addColorStop(stop,color);
    }
    

    ctx.fillStyle = grd;
    ctx.fillRect(left, top, legendwidth, cellheight);

    ctx.lineWidth = 0.5;
    ctx.strokeStyle = 'gray';
    ctx.strokeRect(left, top, legendwidth, cellheight);

    ctx.font = "10pt Verdana";
    top = bottom;
    var text1 = "min:" + minvalue.toFixed(0) + units;
    var text2 = "avg:" + mymedian.toFixed(0) + units;
    var text3 = "max:" + maxvalue.toFixed(0) + units;

    var metrics1 = ctx.measureText(text1);
    var metrics2 = ctx.measureText(text2);
    var metrics3 = ctx.measureText(text3);

    var left1 = left - metrics1.width / 2.0;
    var left2 = center - metrics2.width / 2.0;
    var left3 = right - metrics2.width / 2.0;


    DrawTextCenteredInRect2(ctx, text1, left1, top, metrics1.width, cellheight, 'black');
    DrawTextCenteredInRect2(ctx, text2, left2, top, metrics2.width, cellheight, 'black');
    DrawTextCenteredInRect2(ctx, text3, left3, top, metrics3.width, cellheight, 'black');

};


function calculaterowcount(startyear, endyear) {
    var start = (startyear / 10.0).toFixed(0);
    var end = (endyear / 10.0).toFixed(0);
    return end - start + 1;
}


function DrawTextCenteredInRect2(ctx, text, left, top, cellwidth, cellheight, color) {
    var metrics = ctx.measureText(text);

    var textwidth = metrics.width;
    var textheight = 8;
    var newleft = left + (cellwidth - textwidth) / 2.0;
    var newtop = top + cellheight / 2.0 + textheight / 2.0;
    ctx.fillStyle = color;
    ctx.fillText(text, newleft, newtop);
};

function DrawTextsCenteredInRect(ctx, width, text1, text2, left, top, cellwidth, cellheight, color) {
    var metrics1 = ctx.measureText(text1);

    var textwidth1 = metrics1.width;

    var metrics2 = ctx.measureText(text2);

    var textwidth2 = metrics2.width;
    var textheight = 6;
    if (width >= 979)
        textheight = 9;
    else if (width >= 768)
        textheight = 8;
    else if (width >= 320)
        textheight = 7;

    var newleft1 = left + (cellwidth - textwidth1) / 2.0;
    var newleft2 = left + (cellwidth - textwidth2) / 2.0;
    var newtop = top + cellheight - 25;//+textheight/2.0;      
    ctx.fillStyle = color;
    ctx.fillText(text2, newleft2, newtop);


    ctx.fillText(text1, newleft1, newtop + textheight + 4);
};


function GetENSOColor(state) {
    if (state === 0)
        return "red";
    else if (state === 1)
        return "blue";
    return "gray";
};

function GetValueColor(percent, r, g, b) {

    // offset our red, green, and blue according to the distance into our gradient against
    // the total distance to go
    var NewRed = percent * (255 - r);
    var NewBlue = percent * (255 - b);
    var NewGreen = percent * (255 - g);


    NewRed += r;
    NewBlue += b;
    NewGreen += g;

    if (NewRed > 255) NewRed = 255;
    if (NewBlue > 255) NewBlue = 255;
    if (NewGreen > 255) NewGreen = 255;

    //  set our new color acording to our changed red, green, and blue values
    return "rgb(" + NewRed.toFixed(0) + "," + NewGreen.toFixed(0) + "," + NewBlue.toFixed(0) + ")";


};

function getGradientPercentage(value, maxvalue, minvalue, median) {
    var diff1 = maxvalue - median;
    var diff2 = median - minvalue;
    var diff = (diff1 > diff2 ? diff2 : diff1);
    if (diff > 0) {
        if (value > median) {
            var percent = (value - median) / diff1;
            if (percent < 0) percent = 0;
            if (percent > 1) percent = 1;
            return percent;
        }
        else if (value < median) {
            var percent = (median - value) / diff2;
            if (percent < 0) percent = 0;
            if (percent > 1) percent = 1;
            return -percent; //return negative so that we know that this is a below -median value.
        }
    }
    return 0;
}




var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function generateMonthlyMudMap(containerId,data)
{
    var height = 0;
    var showENSOColorsTemp = getCookie("show-enso-colours");
    var showENSOColors = Validate(showENSOColorsTemp) && Number(showENSOColorsTemp) === 1 ? true : false;
    var canvas = document.getElementById(containerId + "-canvas");
    if (Validate(data)) {
        var years = data.EndYear - data.StartYear;
        height = years * 20+100+70;
        $("#" + containerId).css("height", height);
        $("#" + containerId + "-canvas").css("height", height);
    
        canvas.width = canvas.clientWidth;
        canvas.height = height; canvas.clientHeight;
    } else {
        canvas.width = canvas.clientWidth;
        canvas.height = canvas.clientHeight;
        height = canvas.height;
    }
    
    
    
    if (canvas != null) {
        if (typeof (G_vmlCanvasManager) != 'undefined')
            G_vmlCanvasManager.initElement(canvas);
        var ctx = canvas.getContext('2d');
        //var width = canvas.width;
        //var height = canvas.height;
        var width = canvas.scrollWidth;
        //var height = canvas.scrollHeight;
        ctx.clearRect(0, 0, width, height);
        if (width >= 979)
            ctx.font = "9pt Verdana";
        else if (width >= 768)
            ctx.font = "8pt Verdana";
        else if (width >= 320)
            ctx.font = "7pt Verdana";
        else
            ctx.font = "6pt Verdana";

      
        var filter = data.ENSOFilterState;
        var rows = data.EndYear - data.StartYear + 1 + 1;//additional line added for averages at bottom of table.
        var cellwidth = width / 13.0;
        var cellheight = 20;// (height - 25) / (rows + 2);

        ctx.fillStyle = 'black';
        var top = 0;
        for (var col = 1; col <= 12; ++col) {
            var left = (col) * cellwidth;
            DrawTextCenteredInRect(ctx, months[col - 1], left, top, cellwidth, cellheight, 'black');
        }
        var averages = data.MonthlyStats;

        var index = data.StartIndex;
        for (var row = 1; row <= rows-1; ++row) {

            var top = (row) * cellheight;

            for (var col = 0; col <= 12; ++col) {
                var left = col * cellwidth;

                if (col > 0) {

                    if (index >= 0 ) {

                        var value = (Validate(data.MonthlyData)&&index < data.MonthlyData.length)? data.MonthlyData[index] :null;

                        if (value !== null) {
                            var ensoindex = Validate(data.ENSOData) ? data.ENSOData[index] : 0;
                            var drawnormal = filter === 3 || filter === ensoindex;

                            if (drawnormal) {


                                var valuecolor = GetValueColor(1.0 -
                                    (value - data.Min) / (data.Max - data.Min),
                                    0,
                                    18,
                                    255);
                                ctx.fillStyle = valuecolor;
                                ctx.fillRect(left, top, cellwidth, cellheight);

                                if (value < data.Max - (data.Max - data.Min) * 0.5)
                                    DrawTextCenteredInRect(ctx, value, left, top, cellwidth, cellheight, 'black');
                                else
                                    DrawTextCenteredInRect(ctx, value, left, top, cellwidth, cellheight, 'white');
                                if (showENSOColors) {
                                    ctx.strokeStyle = Validate(data
                                            .ENSOData)
                                        ? GetENSOColor(data.ENSOData[index])
                                        : "white";
                                } else {
                                    ctx.strokeStyle = Validate(data
                                            .ENSOData)
                                        ? "gray"
                                        : "white";
                                }
                                ctx.lineWidth = 1;
                                var buf = 0;
                                ctx
                                    .strokeRect(left + buf,
                                        top + buf,
                                        cellwidth - 2 * buf - 1,
                                        cellheight - 2 * buf - 1);


                            } else {
                                ctx.fillStyle = 'white';
                                ctx.fillRect(left, top, cellwidth, cellheight);
                                DrawTextCenteredInRect(ctx, value, left, top, cellwidth, cellheight, 'silver');
                            }
                        }
                    } else {
                        ctx.fillStyle = 'white';
                        ctx.fillRect(left, top, cellwidth, cellheight);
                    }
                    index = index + 1;

                } else {

                    var year = data.StartYear + row - 1;
                    // if(year%2==0)
                    // {
                    DrawTextCenteredInRect(ctx, year, left, top, cellwidth, cellheight, 'black');
                    // }
                }
            }

            
            ctx.strokeStyle = 'black';
            ctx.strokeRect(cellwidth, cellheight, 12 * cellwidth, rows * cellheight);

        }

        //for (var col = 0; col <= 12; ++col) {

        //    var left = (col) * cellwidth;


        //    if (col === 0) {
        //        DrawTextCenteredInRect(ctx, "Avgs", left, top, cellwidth, cellheight, 'black');
        //    }
        //    else {
        //    var index = col - 1;
        //        var value = (Validate(data.MonthlyStats) && index < data.MonthlyStats.length)
        //            ? data.MonthlyData[index]
        //            : null;
        //        ctx.fillStyle = 'white';
        //        ctx.fillRect(left, top, cellwidth, cellheight);
        //        DrawTextCenteredInRect(ctx, value, left, top, cellwidth, cellheight, 'silver');
        //    }
        //}
        
        //draw averages
        if (Validate(averages)) {
            top = top + cellheight;
            for (var col = 0; col <= 12; ++col) {
                var left = col * cellwidth;
                var text = col === 0 ? "Avgs" : averages[col - 1];
                if (col === 0) {
                    ctx.fillStyle = "white";
                }
                else {
                    ctx.fillStyle = "black";
                }
                ctx.fillRect(left, top, cellwidth, cellheight);
                if (col === 0) {
                    DrawTextCenteredInRect(ctx, text, left, top, cellwidth, cellheight, 'black');
                }
                else {
                    DrawTextCenteredInRect(ctx, text, left, top, cellwidth, cellheight, 'white');
                }
            
            }

        }


        var colors = [];
        colors.push("white");
        var coloravg = (data.Max - data.Min)>0? GetValueColor(1.0 -
                                (data.Average - data.Min) / (data.Max - data.Min),
                                0,
                                18,
                                255):"white";
        colors.push(coloravg);
        colors.push("rgb(0,18,255)");
        DrawLegend(ctx, canvas.width, canvas.height, (rows + 2) * cellheight+(showENSOColors?0:-20), data.Max, data.Min, data.Average, data.Units, colors, showENSOColors);
    }
}




function DrawTextCenteredInRect(ctx, text, left, top, cellwidth, cellheight, color) {
    var metrics = ctx.measureText(text);

    var textwidth = metrics.width;
    var textheight = 8;
    var newleft = left + (cellwidth - textwidth) / 2.0;
    var newtop = top + cellheight / 2.0 + textheight / 2.0;
    ctx.fillStyle = color;
    ctx.fillText(text, newleft, newtop);
};


//function GetValueColor(percent, r, g, b) {

//    // offset our red, green, and blue according to the distance into our gradient against
//    // the total distance to go
//    var NewRed = percent * (255 - r);
//    var NewBlue = percent * (255 - b);
//    var NewGreen = percent * (255 - g);


//    NewRed += r;
//    NewBlue += b;
//    NewGreen += g;

//    if (NewRed > 255) NewRed = 255;
//    if (NewBlue > 255) NewBlue = 255;
//    if (NewGreen > 255) NewGreen = 255;

//    //  set our new color acording to our changed red, green, and blue values
//    return "rgb(" + NewRed.toFixed(0) + "," + NewGreen.toFixed(0) + "," + NewBlue.toFixed(0) + ")";


//};



