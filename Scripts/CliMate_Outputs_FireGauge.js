// JavaScript Document

//var values;
//var names;
//var brushcolors;
//var textcolors;
var Width;

var Radius, CenterX, CenterY;
var TotalValue = 100;
var PointerValue = 50;

function generateFireGauge(containerId, output)
{   
    var canvas = document.getElementById(containerId + "-canvas");
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
    if (canvas != null) {
        if (typeof (G_vmlCanvasManager) != 'undefined')
            G_vmlCanvasManager.initElement(canvas);
        var ctx = canvas.getContext('2d');
        var w = canvas.width;
        var h= canvas.height;
        ctx.clearRect(0, 0, w, h);
        var pointerpercent = Validate(output.Value) ? output.Value : null;
        var brushcolors = output.FillColors;
        var textcolors = output.FontColors;
        var names = output.Labels;

        if (pointerpercent > 100) pointerpercent = 100;
        else if (pointerpercent < 0) pointerpercent = 0;
        var piecesCount = names.length;
        var values = [];
        var sizes = output.Sizes;
        var max = 0;
        for (var i = 0; i < piecesCount; ++i)
            max = max + sizes[i];
        for (i = 0; i < piecesCount; ++i)
            values.push(180.0 *sizes[i]/max);
        Width = w;
        
        
        
        Radius = Width / 2 - 5;
        if (Radius > h-10)
            Radius = h-10;
        CenterX = Width / 2;
        CenterY = Radius;
        var total = 0;
        
        for (var x = 0; x < values.length; x++) {
            total += values[x];
        };
        TotalValue = total;
        var lastend = Math.PI;

        for (var x = 0; x < values.length; x++) {
            var thispart = values[x];
            ctx.beginPath();
            ctx.fillStyle = brushcolors[x];
            ctx.moveTo(CenterX, CenterY);
            var arcsector = Math.PI * (thispart / total);
            ctx.arc(CenterX, CenterY, Radius, lastend, lastend + arcsector, false);
            ctx.lineTo(CenterX, CenterY);
            ctx.fill();
            ctx.closePath();

            var angle = (lastend + lastend + arcsector) / 2.0;
            DrawRotatedText(ctx, CenterX, CenterY, angle, names[x], textcolors[x]);

            lastend += arcsector;
        }
        DrawPointerOverlay(ctx, pointerpercent);
    }

}

function DrawRotatedText(ctx,xpos, ypos, angle, text, color) {
    ctx.save();
    //			ctx.font = ' 12pt Calibri';
    if (Width >= 400)
        ctx.font = '16pt Arial';
    else if (Width >= 350)
        ctx.font = '15pt Arial';
    else if (Width >= 300)
        ctx.font = '14pt Arial';
    else if (Width >= 250)
        ctx.font = '13pt Arial';
    else if (Width >= 200)
        ctx.font = '12pt Arial';
    else if (Width >= 150)
        ctx.font = '11pt Arial';
    else if (Width >= 100)
        ctx.font = '10pt Arial';
    else if (Width >= 75)
        ctx.font = '9pt Arial';
    else if (Width >= 50)
        ctx.font = '8pt Arial';
    else
        ctx.font = '7pt Arial';


    var metrics = ctx.measureText(text);
    var width = metrics.width;
    var halfheight = 9;//metrics.height/2.0;
    ctx.fillStyle = color;
    var left = Radius / 2.0 - width / 2.0 + 20;
    if (angle >= Math.PI / 2.0 * 3.0) {
        ctx.translate(xpos, ypos + halfheight);
        ctx.rotate(angle);
        ctx.fillText(text, left, 5);
    }
    else {
        left = left + width;
        var newangle = Math.PI - angle;
        var dx = left * Math.cos(newangle);
        var dy = left * Math.sin(newangle);
        ctx.translate(xpos - dx, ypos + dy + halfheight);
        ctx.rotate(-newangle);
        ctx.fillText(text, 0, 0);

    }


    ctx.restore();
}

function GetAngleForValue(value) {
    if (TotalValue > 0 && value >= 0) {
        var temp = -(Math.PI - value / TotalValue * Math.PI);
        if (temp < -Math.PI) temp = -Math.PI;
        if (temp > 0) temp = 0;
        return temp;
    }
    return -180;
}

function DrawPointerOverlay(ctx, pointerpercent) {
    if (Validate(pointerpercent)) {
        PointerValue = pointerpercent / 100.0 * Math.PI;

        var angle = Math.PI + PointerValue;
        var pointerwidth = Radius * 0.14;
        var _radius = Radius * 0.95;
        ctx.save();
        ctx.translate(CenterX, CenterY);
        ctx.rotate(angle);

        var midx = 0;//CenterX;
        var midy = 0;//CenterY;         

        ctx.beginPath();
        var x1 = midx;

        var x2 = midx + 0.8 * _radius;
        var x3 = midx + 0.98 * _radius;
        var y1 = midy - pointerwidth / 2.0 * 1.2;
        var y2 = midy - pointerwidth / 4.0 * 1.0;
        var y3 = midy;
        var y4 = midy + pointerwidth / 4.0 * 1.0;
        var y5 = midy + pointerwidth / 2.0 * 1.2;


        ctx.moveTo(x1, y2);
        ctx.lineTo(x2, y2);
        ctx.lineTo(x2, y1);
        ctx.lineTo(x3, y3);
        ctx.lineTo(x2, y5);
        ctx.lineTo(x2, y4);
        ctx.lineTo(x1, y4);
        ctx.arc(0, 0, pointerwidth / 4.0, Math.PI / 2.0, -Math.PI / 2.0, false);
        // ctx.Arc(x1, y2, pointerwidth / 4.0, 180, true, SweepDirection.Clockwise, true, true);
        ctx.lineWidth = 4;
        ctx.fillStyle = 'black';
        ctx.strokeStyle = 'white';
        ctx.fill();
        ctx.stroke();

        ctx.closePath();
        ctx.restore();


    }

}




