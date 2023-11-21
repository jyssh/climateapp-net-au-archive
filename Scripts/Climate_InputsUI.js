var oldLocation = null;
function updateInputValue(mydatasource, $control) {
    var identifier = $control.attr("id");
    
    if (identifier !== "Location") {
        $('.ajax_spinner').show();
        mydatasource.InputValues[identifier] = $control.val();
        return true;
    } else {
        var val = $control.val();
        if (val === "-1") {
            $("#Location").blur();//hopefully will close combo
            openSelectLocationDialog($control,
                function(id, name) {
                    mydatasource.InputValues.Location = id;
                    mydatasource.InputValues.LocationName = name;
                    reloadLocationsSelector();
                    $('.ajax_spinner').show();
                    calculate(mydatasource, calculationsUrl);
                    oldLocation = id;
                },
                function () {

                    reloadLocationsSelector();
                },
                oldLocation);
            
        } else {
            $('.ajax_spinner').show();
            mydatasource.InputValues.Location = $control.val();
            mydatasource.InputValues.LocationName = $control.children("option:selected").text();
            calculate(mydatasource, calculationsUrl);
        }
        oldLocation = val;
    }
    return false;
}

function resortLocationsSelector() {
    $('#Location option[value=-1]').remove();
    var options = $('#Location option');
    var arr = options.map(function (_, o) { return { t: $(o).text(), v: o.value }; }).get();
    arr.sort(function (o1, o2) { return o1.t > o2.t ? 1 : o1.t < o2.t ? -1 : 0; });
    options.each(function (i, o) {
        o.value = arr[i].v;
        $(o).text(arr[i].t);
    });
    $("#Location").prepend("<option value='-1'>Select/edit new location</option>");
}

function reloadLocationsSelector() {
    $.getJSON('/Analyses/GetFavouriteLocations',
    null,
    function (results) {
        if (results.success) {
            $("#Location").empty();
            $("#Location").append("<option value='-1'>Select/edit new location</option>");
            mydatasource.InputConfig.Location.Items = [];
            for (var i = 0; i < results.stations.length; ++i) {
                var station = results.stations[i];
                var item = new Object();
                item.Key = station.value;
                item.Value = station.key;
                mydatasource.InputConfig.Location.Items.push(item);
                $("#Location").append("<option value='"+station.key+"'>"+station.value+"</option>");
            }
           
           
            var exists = 0 !== $('#Location option[value=' + mydatasource.InputValues.Location + ']').length;
            if (!exists) {
                var item = new Object();
                item.Key = mydatasource.InputValues.LocationName;
                item.Value = mydatasource.InputValues.Location;
                mydatasource.InputConfig.Location.Items.push(item);
                $("#Location").append("<option value='" + mydatasource.InputValues.Location + "'>" + mydatasource.InputValues.LocationName+ "</option>");
                resortLocationsSelector();
            }
            //else {
            //    $("#Location").append("<option value='-1'><i class='fa fa-globe' aria-hidden='true'></i> Select/edit new location...</option>");
            //}
            $("#Location").val(mydatasource.InputValues.Location);

            
        }
    });
}


function addInputEditor(identifier, rowindex, colwidth, colwidthsmall) {
    var rowclass = "row-" + rowindex.toString();
    var colclass = "col-sm-" + colwidth.toString();
    var colclasssmall = "col-xs-" + colwidthsmall.toString();
    var config = mydatasource.InputConfig[identifier];
    var modelvalue = mydatasource.InputValues[identifier];
    if (config.Type === "EnumeratedInput") {
        addEnumeratedSelector(identifier,config, rowclass, colclass,colclasssmall, modelvalue);
    }else if (config.Type === "ValueInput") {
        addDataValueSelector(identifier,config, rowclass, colclass,colclasssmall, modelvalue);
    } else if (config.Type === "DayInput") {
        addDaySelector(identifier,config, rowclass, colclass,colclasssmall, modelvalue);
    } else if (config.Type === "MonthInput") {
        addMonthSelector(identifier,config, rowclass, colclass,colclasssmall, modelvalue);
    } else if (config.Type === "PeriodInput") {
        addPeriodSelector(identifier, config, rowclass, colclass,colclasssmall, modelvalue);
    } else if (config.Type === "DataRecord") {
        addEnumeratedSelector(identifier, config, rowclass, colclass,colclasssmall, modelvalue);
    }
    if (identifier === "Location") {
        $("#Location").prepend("<option value='-1'>Select/edit new location</option>");
        oldLocation = $("#Location").val();
    }
}

function addInputLabel(identifier, rowindex, colwidth, colwidthsmall, alignment) {
    if (!Validate(alignment))
        alignment = "right";
    var rowclass = "row-" + rowindex.toString();
    var colclass = "col-sm-" + colwidth.toString();
    var colclasssmall = "col-xs-" + colwidthsmall.toString();
    var config = mydatasource.InputConfig[identifier];
    var text = Validate(config.Label) ? config.Label : "";
    var html = "<div class='input-label' id='"+identifier+"-label' style='text-align:" + alignment + "'>" + text + "</div>";
    generateInputElement(rowclass, colclass,colclasssmall, html,  identifier);
}

function addQuestion(identifier) {
    var config = mydatasource.Outputs[identifier];
    var text=Validate(config)?config.Text:"Question not defined"; 
    var rowclass = "row-0";
    var colclass = "col-md-12";
    var html ="<div class='hero-title'><img src='/Content/Images/Question2.png' width='30' height='30' alt='Question' style='margin-right:8px;' id='Question1'>" + text + "</div>";
    generateOutputElement(rowclass, colclass,  html, identifier);
    
}

function addEnumeratedSelector(identifier, settings, rowclass, colclass, colclasssmall, modelvalue) {
    var html = "<select  class='form-control input-control' id='" + identifier + "'>";
    if (Validate(settings.Items)) {
        for (var i = 0; i < settings.Items.length; ++i) {
            var item = settings.Items[i];
            html = html + "<option value='" + item.Value + "'>" + item.Key + "</option>";
        }
    }
    html = html + "</select>";
    generateInputElement(rowclass, colclass,colclasssmall, html, identifier);
    if (Validate(modelvalue)) {
        $("#" + identifier).val(modelvalue.toString());
    }


}


function addDataValueSelector(identifier, settings, rowclass, colclass, colclasssmall, modelvalue) {
    if (settings.Step > 0 &&settings.Min!==settings.Max) {
        var html = "<select  class='form-control input-control'  id='" + identifier + "''>";
        for (var val = settings.Min; val <= settings.Max; val = val + settings.Step) {

            html = html + "<option value='" + val + "'>" + val + settings.Units + "</option>";
        }
        if (Validate(settings.Max2) && settings.Max2 !== 0 && Validate(settings.Step2) && settings.Step2 !== 0) {
            for (var val2 = settings.Max; val2 <= settings.Max2; val2 = val2 + settings.Step2) {

                html = html + "<option value='" + val2 + "'>" + val2 + settings.Units + "</option>";
            }
        }


        html = html + "</select>";
        generateInputElement(rowclass, colclass,colclasssmall, html, identifier);
        $("#" + identifier).val(modelvalue);
        
    } else {
        generateInputElement(rowclass, colclass, colclasssmall,"<span>STEP=0</span>", identifier);
    }

}
    
function addPeriodSelector(identifier, settings, rowclass, colclass, colclasssmall, modelvalue) {
    var html = "<select  class='form-control input-control'  id='" + identifier + "''>";
    if (settings.PeriodType === 0 || settings.PeriodType === 3) {
        for (var val = settings.Min; val <= settings.Max; ++val) {

            html = html + "<option value='" + val + "'>" + val + settings.Units + "</option>";
        }
        if (Validate(settings.Max2) && settings.Max2 !== 0 && Validate(settings.Step2) && settings.Step2 !== 0) {
            for (var val2 = settings.Max; val2 <= settings.Max2; val2 = val2 + settings.Step2) {

                html = html + "<option value='" + val2 + "'>" + val2 + settings.Units + "</option>";
            }
        }
    }else if (settings.PeriodType ===1||settings.PeriodType ===2) {
        var date = new Date();
        var month = date.getMonth()-(settings.PeriodType===1?0:1);
        var monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        for (var val = settings.Min; val <= settings.Max; ++val) {
            var startindex = month + 1;
            var endindex = startindex + val - 1;
            if (startindex > 12) startindex = startindex - 12;
            if (endindex > 12) endindex = endindex - 12;
            html = html +"<option value='" +val +"'>" +monthNames[startindex] +"-" +monthNames[endindex] +" (" +val +settings.Units +")</option>";
        }
    }
    html = html + "</select>";
    generateInputElement(rowclass, colclass,colclasssmall, html, identifier);
    $("#" + identifier).val(modelvalue);
    
}



function rebuildPeriodSelector(identifier, modelvalue,minvalue, maxvalue) {
    var html = "";
    var config = mydatasource.InputConfig[identifier];
    if (modelvalue > maxvalue)
        modelvalue = maxvalue;
    for (var val = minvalue; val <= maxvalue; ++val) {

        html = html + "<option value='" + val + "'>" + val + config.Units+"</option>";
    }
   
    $("#" + identifier).empty();
    $("#" + identifier).append(html);
    $("#" + identifier).val(modelvalue);
}

function rebuildDaySelector(dayidentifier,monthidentifier ) {
    var html = "";
    var dayconfig = mydatasource.InputConfig[dayidentifier];
    var day=mydatasource.InputValues[dayidentifier];
    var month = mydatasource.InputValues[monthidentifier];
    var daysinmonth = Date.getDaysInMonth(2009, month - 1);//stupid month notation
    
    for (var val = 1; val <= daysinmonth; ++val) {
        html = html + "<option value='" + val + "'>" + val + "</option>";
    }
    if (day > daysinmonth) {
        day = daysinmonth;
        mydatasource.InputValues[dayidentifier] = day;
    }

    $("#" + dayidentifier).empty();
    $("#" + dayidentifier).append(html);
    $("#" + dayidentifier).val(day);
}


function addDaySelector(identifier, settings, rowclass, colclass,colclasssmall, modelvalue) {
    var html = "<select  class='form-control input-control'  id='" + identifier + "' >";
    var monthidentifier = identifier.replace("Day", "Month");
    var month = mydatasource.InputValues[monthidentifier];
    var lastday = 31;
    if (Validate(month)) {
        lastday = Date.getDaysInMonth(2009, month-1);//stupid month notation
        if (modelvalue > lastday) {
            modelvalue = lastday;
            mydatasource.InputValues[identifier] = modelvalue;
        }
    }

    for (var i = 1; i <= lastday; ++i) {
       html = html + "<option value='" + i + "'>" + i + "</option>";
    }
    html = html + "</select>";
    generateInputElement(rowclass, colclass,colclasssmall, html, identifier);
    $("#" + identifier).val(modelvalue);
   
}
function addMonthSelector(identifier, settings, rowclass, colclass, colclasssmall, modelvalue) {
    var html = "";
    if (settings.Format === 0) {
        html = "<select class='form-control input-control' id='" + identifier + "'>";
        html = html + "<option value='1'>January</option>";
        html = html + "<option value='2'>February</option>";
        html = html + "<option value='3'>March</option>";
        html = html + "<option value='4'>April</option>";
        html = html + "<option value='5'>May</option>";
        html = html + "<option value='6'>June</option>";
        html = html + "<option value='7'>July</option>";
        html = html + "<option value='8'>August</option>";
        html = html + "<option value='9'>September</option>";
        html = html + "<option value='10'>October</option>";
        html = html + "<option value='11'>November</option>";
        html = html + "<option value='12'>December</option>";
        html = html + "</select>";

    } else {
        html = "<select class='form-control input-control' id='" + identifier + "'>";
        html = html + "<option value='1'>Jan</option>";
        html = html + "<option value='2'>Feb</option>";
        html = html + "<option value='3'>Mar</option>";
        html = html + "<option value='4'>Apr</option>";
        html = html + "<option value='5'>May</option>";
        html = html + "<option value='6'>Jun</option>";
        html = html + "<option value='7'>Jul</option>";
        html = html + "<option value='8'>Aug</option>";
        html = html + "<option value='9'>Sep</option>";
        html = html + "<option value='10'>Oct</option>";
        html = html + "<option value='11'>Nov</option>";
        html = html + "<option value='12'>Dec</option>";
        html = html + "</select>";
    }
    generateInputElement(rowclass, colclass,colclasssmall, html, identifier);
    $("#" + identifier).val(modelvalue);
}


function generateInputElement(rowclass, colclass, colclasssmall, inputHtml, inputname) {
    
    var $container = $("#analysis-inputs");
    if ($container.exists()) {
        var $row = $("#" + rowclass);
        if ($row.exists() === false) {
            $container.append("<div class='row' id='" + rowclass + "'></div>");
            $row = $("#" + rowclass);
        }
        var html = "<div class='input-item " + colclass + " "+colclasssmall+"' >";
        html = html + inputHtml;
        html = html + "</div>";
        $row.append(html);

    } else {
        console.log("Couldn't find element '#analysis-inputs' while creating and Input Element: " + inputname);
    }
    
}

function generateOutputElement(rowclass, colclass, inputHtml, inputname) {

    var $container = $("#analysis-inputs");
    if ($container.exists()) {
        var $row = $("#" + rowclass);
        if ($row.exists() === false) {
            $container.append("<div class='row' id='" + rowclass + "'></div>");
            $row = $("#" + rowclass);
        }
        var html = "<div class='input-item " + colclass + "' >";
        html = html + inputHtml;
        html = html + "</div>";
        $row.append(html);

    } else {
        console.log("Couldn't find element '#analysis-inputs' while creating and Input Element: " + inputname);
    }

}

function hideShowElement(selector, visible) {
    if (visible) {
        $("#" + selector).parent().show();
        $("#" + selector + "-label").parent().show();
    } else {
        $("#" + selector).parent().hide();
        $("#" + selector + "-label").parent().hide();
    }
}

