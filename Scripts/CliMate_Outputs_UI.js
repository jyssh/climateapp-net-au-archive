Date.prototype.format = function (format) //author: meizz
{
    var o = {
        "M+": this.getMonth() + 1, //month
        "d+": this.getDate(),    //day
        "h+": this.getHours(),   //hour
        "m+": this.getMinutes(), //minute
        "s+": this.getSeconds(), //second
        "q+": Math.floor((this.getMonth() + 3) / 3),  //quarter
        "S": this.getMilliseconds() //millisecond
    }

    if (/(y+)/.test(format)) format = format.replace(RegExp.$1,
      (this.getFullYear() + "").substr(4 - RegExp.$1.length));
    for (var k in o) if (new RegExp("(" + k + ")").test(format))
        format = format.replace(RegExp.$1,
          RegExp.$1.length === 1 ? o[k] :
            ("00" + o[k]).substr(("" + o[k]).length));
    return format;
}

function addOutput(identifier) {
    
    var outputs = mydatasource.Outputs[identifier];
    if (Validate(outputs)) {
        var results = null;
        if (outputs.Type === "SimpleText") {
            if (identifier.indexOf("Question")!==-1) {
                createQuestion(identifier, outputs);
            } else if (identifier.indexOf("Answer") !== -1) {
                createAnswer(identifier, outputs);
            } else if (identifier.indexOf("HowDoWeKnowThis") !== -1) {
                createHowDoWeKnowThis(identifier, outputs);
            }
            else {
                createSimpleText(identifier, outputs);
            }
        } else if (outputs.Type === "FireGauge") {
            createFireGauge(identifier, outputs);
        } else if (outputs.Type === "FlotChart") {
            return createFlotChart(identifier, outputs);
        } else if (outputs.Type === "PieChart") {
            createPieChart(identifier, outputs);
        } else if (outputs.Type === "Table") {
            return createTable(identifier, outputs);
        } else if (outputs.Type === "Image") {
            createWebImage(identifier, outputs);
        } else if (outputs.Type === "HtmlText") {
            createHtmlOutput(identifier, outputs);
        } else if (outputs.Type === "YearlyCalendar") {
            createCalendar1(identifier, outputs);
        }
        else if (outputs.Type === "MonthlyCalendar") {
            createCalendar2(identifier, outputs);
        } if (outputs.Type === "EnumeratedInput") {
            updateEnumeratedSelector(identifier, outputs);
        }
    } else {
        console.log("Can't created output " + identifier);
    }

}


function getSpinnerHtml() {
    //return "<div style='text-align:center'><i class='fa fa-circle-o-notch fa-spin  fa-fw'></i></div>";
    return "<i class='fa fa-circle-o-notch fa-spin  fa-fw'></i>";
}
function updateEnumeratedSelector(identifier, settings) {

    var html = "<select  class='form-control input-control' id='" + identifier + "'>";
    if (Validate(settings.Items)) {
        for (var i = 0; i < settings.Items.length; ++i) {
            var item = settings.Items[i];
            html = html + "<option value='" + item.Value + "'>" + item.Key + "</option>";
        }
    }
    html = html + "</select>";

    var $container = $("#analysis-inputs");
    if ($container.exists()) {
        $("#" + identifier).replaceWith(html);

    } else {
        console.log("Couldn't find element '#analysis-inputs' while creating and Input Element: " + identifier);
    }
    var modelvalue = mydatasource.InputValues[identifier];
    if (Validate(modelvalue)) {
        $("#" + identifier).val(modelvalue.toString());
    }


}


function createQuestion(containerId, output) {
    var html = "<div class='hero-title'  style='position:relative'><img src='/Content/Images/Question.png' width='30' height='30' alt='Answer' class='analysis-text-header' style='position:absolute;top=0;left=0;'>";
    if (Validate(output.Text )) {
        html = html + "<div style='margin-left:40px;'><div class='question-text'>" + getLoadingTitle(output.Text) + "</div><div>";
    } else {
        html = html + "<div style='margin-left:40px;'><div class='question-text'>Updating " + getSpinnerHtml() + "</div><div>";
    }
    html = html + "</div>";
    if ($("#" + containerId).exists()) {
        $("#" + containerId).html(html);
    } else {
        console.log("Couldn't find element '#" + containerId + "' while creating a 'Question'");
    }
}

function createAnswer(containerId, output) {
    var html = "<div class='hero-title' style='position:relative'><img src='/Content/Images/Answer.png' width='30' height='30' alt='Answer' class='analysis-text-header' style='position:absolute;top=0;left=0;'>";
    if (Validate(output.Text)) {  
        html = html + "<div style='margin-left:40px;padding-top:3px;'><div class='answer-text'>" + getLoadingTitle(output.Text) + "</div><div>";
    } else {
        html = html + "<div style='margin-left:40px;padding-top:3px;'><div class='answer-text' >Updating " + getSpinnerHtml() + "</div></div>";
    }
    html = html + "</div>";
    if ($("#" + containerId).exists()) {
        $("#" + containerId).html(html);
    } else {
        console.log("Couldn't find element '#" + containerId + "' while creating an 'Answer'");
    }
}

function createHowDoWeKnowThis(containerId, data) {
    if (Validate(data)) {
        var html =
            "<div style='position:relative'>";
        html=html+"<img src='/Content/Images/Information.png' width='30' height='30' alt='Answer' class='analysis-text-header' style='position:absolute;top=0;left=0;'>";
        html = html + "<div class='hero-title' style='margin-left:40px;'>How do we know this?</div>";
        html = html + "<div class='howdoweknowthis-text' style='margin-left:40px;'>" + getLoadingTitle(data.Text) + "</div>";
        html = html + "</div>";
        if ($("#" + containerId).exists()) {
            $("#" + containerId).html(html);
        } else {
            console.log("Couldn't find element '#" + containerId + "' while creating 'How Do We Know This?'");
        }
    }
}

function createSimpleText(containerId, data) {
    if (Validate(data)) {
        var html = "";
        if (Validate(data.Text)) {
         html=html+ "<span class='simple-text-output'>" + getLoadingTitle(data.Text) + "</span>";
        }
        if ($("#" + containerId).exists()) {
            $("#" + containerId).html(html);
        } else {
            console.log("Couldn't find element '#" + containerId + "' while creating 'simple text'");
        }
    }
}

function createHtmlOutput(containerId,output) {
    var html = "";
    if (Validate(output.UseDefaultText)) {
        
        html = html + "<div class='html-text'>" + output.DefaultText + "</div>";
    }
    if ($("#" + containerId).exists()) {
        $("#" + containerId).html(html);
    } else {
        console.log("Couldn't find element '#" + containerId + "' while creating HTML output");
    }
}

function createFireGauge(containerId,output) {
    var html = "";
    
    if (Validate(output)) {
        if (TextExists(output.Title) && Validate(output.Title)) {
            html = html + "<div class='output-title'>" + getLoadingTitle(output.Title) + "</div>";
        }
        html = html + "<canvas class='firegauge-canvas' id='" + containerId + "-canvas' >" + "</canvas>";
        if (TextExists(output.Caption) && Validate(output.Caption)) {
            html = html + "<div class='firegauge-caption'>" + getLoadingTitle(output.Caption) + "</div>";
        }
        if (TextExists(output.Footer) & Validate(output.Footer)) {
            html = html + "<div class='firegauge-footer'>" + getLoadingTitle(output.Footer) + "</div>";
        }
    }

    
    if ($("#" + containerId).exists()) {
        $("#" + containerId).html(html);
        generateFireGauge(containerId, output);
    } else {
        console.log("Couldn't find element '#" + containerId + "' while creating a Firegauge");
    }
}


function createFlotChart(containerId,outputs) {
    var html = "";
    
    if (Validate(outputs)) {
        if (TextExists(outputs.Title) && Validate(outputs.Title)) {
            html = html + "<div class='output-title'>" + getLoadingTitle(outputs.Title) + "</div>";
        }
        html = html + "<div class='flotchart-canvas' id='" + containerId + "-canvas' style='width:100%;height:"+outputs.Height+"px'>" + "</div>";
        if (Validate(outputs.Caption)) {
            html = html + "<div class='flotchart-caption'>" + getLoadingTitle(outputs.Caption) + "</div>";
        }
        if (Validate(outputs.Footer)) {
            html = html + "<div class='flotchart-footer'>" + getLoadingTitle(outputs.Footer) + "</div>";
        }
    }
    $("#" + containerId).html(html);
    if ($("#" + containerId).exists()) {
        return generateFlotChart(containerId, outputs);
    } else {
        console.log("Couldn't find element '#" + containerId + "' while creating a Flot Chart");
    }
}

function TextExists(configtext) {
    return Validate(configtext) && configtext.length>0;
}

function getLoadingTitle(title) {
    var text = title.replace(/(\[).+?(\])/g, " " + getSpinnerHtml() + " ");
    text = text.replace("[", "");
    text = text.replace("]", "");
    return text;
}

function createPieChart(containerId, data,showlegend) {
    var html = "";
    if (Validate(data)) {
        if (Validate(data.Title)) {
            html = html + "<div class='output-title'>" + getLoadingTitle(data.Title) + "</div>";
        }
        html = html + "<div class='piechart-canvas' id='" + containerId + "-canvas' style='width:100%;height:80%'>" + "</div>";
        if (Validate(data.Caption)) {
            html = html + "<div class='piechart-caption'>" + getLoadingTitle(data.Caption) + "</div>";
        }

    } else {
        if (TextExists(config.Title)) {
            html = html + "<div class='output-title'>" + getLoadingTitle(data.Title) + "</div>";
        }
        html = html + "<div class='piechart-canvas'>" + "</div>";
    }
    $("#" + containerId).html(html);
    if ($("#" + containerId).exists()) {
        generatePieChart(containerId, data, showlegend);
    } else {
        console.log("Couldn't find element '#" + containerId + "' while creating a Pie Chart");
    }
}


function createTable(containerId, data,showdetail) {
    if (Validate(data)) {
        var html = "";
        if (Validate(data.Title)) {
            html = html + "<div class='output-title'>" + getLoadingTitle(data.Title) + "</div>";
        }
        html = html + "<div class='table-canvas' id='" + containerId + "-canvas' style='width:100%;height:80%'>" + "</div>";
        if (Validate(data.Footer)) {
            html = html + "<div class='table-caption'>" + getLoadingTitle(data.Footer) + "</div>";
        }
        $("#" + containerId).html(html);
        if ($("#" + containerId).exists()) {
            return generateTableHtml(containerId, data, showdetail);
        } else {
            console.log("Couldn't find element '#" + containerId + "' while creating a Table");
        }
    }
    return null;
}

function createCalendar1(containerId, data) {
    if (Validate(data)) {
        var html = "";
        if (Validate(data.Title)) {
            html = html + "<div class='output-title'>" + getLoadingTitle(data.Title) + "</div>";
        }
        html = html + "<canvas class='calendar1-canvas  ' id='" + containerId + "-canvas' style='width:100%;height:720px'>" + "</canvas>";
        if (Validate(data.Footer)) {
            html = html + "<div class='calendar1-caption'>" + getLoadingTitle(data.Footer) + "</div>";
        }
        $("#" + containerId).html(html);
    } else {
        $("#" + containerId)
            .html("<div style='text-align:center'><i class='fa fa-circle-o-notch fa-spin fa-3x fa-fw'></i></div>");
    }
    if ($("#" + containerId).exists()) {
        generateYearlyMudMap(containerId, data);
    } else {
        console.log("Couldn't find element '#" + containerId + "' while creating Calendar1");
    }

}

function createCalendar2(containerId, data) {
    if (Validate(data)) {
        var html = "";
        if (Validate(data.Title)) {
            html = html + "<div class='output-title'>" + getLoadingTitle(data.Title) + "</div>";
        }
        html = html + "<canvas class='calendar2-canvas' id='" + containerId + "-canvas' style='width:100%;height:1600px'>" + "</canvas>";
        if (Validate(data.Footer)) {
            html = html + "<div class='calendar2-caption'>" + getLoadingTitle(data.Footer) + "</div>";
        }
        $("#" + containerId).html(html);
    } else {
        $("#" + containerId)
            .html("<div style='text-align:center'><i class='fa fa-circle-o-notch fa-spin fa-3x fa-fw'></i></div>");
    }
    if ($("#" + containerId).exists()) {
        generateMonthlyMudMap(containerId, data);
    } else {
        console.log("Couldn't find element '#"+containerId+"' while creating Calendar2");
    }
}

function createWebImage(containerId,data) {
    if (Validate(data)) {
        if (Validate(data.ImageUri) || Validate(data.SVG)) {
            var html = "";
            if (Validate(data.Title)) {
                html = html + "<div class='output-title'>" + getLoadingTitle(data.Title) + "</div>";
            }
            if (data.ImageType === 0) {
                html = html +
                    "<a href='" +
                    data.HyperlinkUri +
                    "'><img class='webimage-canvas' id='" +
                    containerId +
                    "-img' src='" +
                    data.ImageUri +
                    "' alt='" +
                    data.AltText +
                    "' style='width:100%'></a>";
            } else {
                html = html +
                   "<a href='" + data.HyperlinkUri + "'>" + data.SVG + "</a>";
            }
            if (Validate(data.HyperlinkUri)) {
                html = html + "<a class='webimage-source' href='" + data.HyperlinkUri + "'>" + data.HyperlinkUri + "</a>";
            }
            if ($("#" + containerId).exists()) {
                $("#" + containerId).html(html);
            } else {
                console.log("Couldn't find element '#" + containerId + "' while creating WebImage");
            }
        }
        else{
            $("#" + containerId).empty();
}
    } else {
        $("#" + containerId).html("<div style='text-align:center'><i class='fa fa-circle-o-notch fa-spin fa-3x fa-fw'></i></div>");
    }
}


