/// <reference path="UteGuideTools.js" />

jQuery.fn.exists = function () { return this.length > 0; }



function getNewGuid() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}
function Validate(object) {
    return object != null && object != undefined;
}
function createElement(tag) {
    return "<" + tag + "></" + tag + ">";
}

function extractText(name) {
    var $item = $("input[name='" + name + "']");
    return $item.val();
}

function extractTextArea(name) {
    var $item = $("textarea[name='" + name + "']");
    return $item.val();
}


function extractBoolean(name) {
    return ($("select[name='" + name + "'] option:selected").val() == 1);
}

function extractCSVList(name) {
    return $("input[name='" + name + "']").val();
}

function extractBooleanParameter(parameter, name) {
    $("input[name='OrganicCarbon']").val();
}


var createCookie = function (name, value, days) {
    var expires;
    if (days) {
        var date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        expires = "; expires=" + date.toGMTString();
    }
    else {
        expires = "";
    }
    document.cookie = name + "=" + value + expires + "; path=/";
}

function getCookie(c_name, defaultvalue) {
    if (document.cookie.length > 0) {
        c_start = document.cookie.indexOf(c_name + "=");
        if (c_start != -1) {
            c_start = c_start + c_name.length + 1;
            c_end = document.cookie.indexOf(";", c_start);
            if (c_end == -1) {
                c_end = document.cookie.length;
            }
            return unescape(document.cookie.substring(c_start, c_end));
        }
    }
    return defaultvalue;
}

function setDateValidationMethod() {
    $.validator.addMethod('date',
        function (value, element, params) {
            if (this.optional(element)) {
                return true;
            }

            var ok = true;
            try {
                $.datepicker.parseDate('dd/mm/yy', value);
            } catch (err) {
                ok = false;
            }
            return ok;
        });
}


function replaceContents(parent, html) {
    var $item = $(html);
    parent.html($item);
    return $item;
}
function appendToItem(parent, html) {
    var $item = $(html);
    parent.append($item);
    return $item;
}



function addFormBeforeUnloadCheck() {

    $(window).bind('beforeunload', function (e) {
        if (unsaved)
            return true;
        else e = null;
        // i.e; if form state change show warning box, else don't show it.
    });
}


function updateModificationHistory() {
    var historyitems = mydatasource.history;
    if (historyitems != null) {
        var html = "<div style='color:silver;text-align:left;padding:10px;'><b>Edit History</b>";
        html = html + "<div style='font-size:0.9em;text-align:left;'>";
        $.each(historyitems, function (j, item) {
            html = html + "<p><b>" + item.modifiedBy + "</b> " + item.modifiedDate + "<br/>";
            if (item.description != null) {
                html = html + "<i>" + item.description + "</i></p>";
            } else {
                html = html + "<i>undefined</i></p>";
            }

        });
        html = html + "</div></div>";
        $("#history").html(html);
    }
}

function updateRegionsTags(controllername) {
    $("#Regions").tagEditor({
        initialTags: (mydatasource.Regions != null ? mydatasource.Regions.split(',') : ""),
        placeholder: 'Enter regions here',
        autocomplete: { 'source': '/' + controllername + '/GetRegionsJSON', minLength: 1 },
        sortable: true,
        forceLowercase: true,
        removeDuplicates: true
    });
}

function updateAdditionalPermissionsTags(controllername) {
    $("#AdditionalPermissions").tagEditor({
        initialTags: (mydatasource.AdditionalPermissions != null ? mydatasource.AdditionalPermissions.split(',') : ""),
        placeholder: 'Enter permissions here',
        autocomplete: { 'source': '/' + controllername + '/GetAdditionalPermissionsJSON', minLength: 1 },
        sortable: false,
        forceLowercase: true,
        removeDuplicates: true

    });
}

function applyFormStyleToTagEditors() {
    $("ul.tag-editor").addClass("form-control");
}

function getNewGuid() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}
function Validate(object) {
    return object != null && object != undefined;
}


function extractText(name) {
    var $item = $("input[name='" + name + "']");
    return $item.val();
}

function extractInteger(name) {
    var $item = $("input[name='" + name + "']");
    return $item.val();
}

function extractTextArea(name) {
    var $item = $("textarea[name='" + name + "']");
    return $item.val();
}

function extractBoolean(name) {
    return ($("select[name='" + name + "'] option:selected").val() == 1);
}

function extractCSVList(name) {
    return $("input[name='" + name + "']").val();
}

function extractBooleanParameter(parameter, name) {
    $("input[name='OrganicCarbon']").val();
}

function extractVectorParameter(parameter, name, count) {

    if (!Validate(parameter)) {
        parameter = new Object();
        parameter.Id = getNewGuid();
        parameter.Name = name;
    }
    parameter.Comments = extractParameterComments(name);
    var valuestext = "";
    for (var i = 0; i < count; ++i) {
        var indexstring = i.toString();
        var $input = $("input[name='" + name + indexstring + "']");
        if ($input.length) {
            if (i > 0) {
                valuestext = valuestext + "," + $input.val();
            }
            else {
                valuestext = valuestext + $input.val();
            }
        }
    }
    parameter.Values = valuestext;
    return parameter;
}


function extractScalarParameter(parameter, name) {
    var $input = $("input[name='" + name + "']");

    if (!Validate(parameter)) {
        parameter = new Object();
        parameter.Id = getNewGuid();
        parameter.Name = name;
    }
    parameter.Comments = extractParameterComments(name);
    parameter.Values = $input.val();
    return parameter;
}

function extractParameterComments(name) {
    var $input = $("input.comments-edit-" + name);
    return $input.val();
}


function getCurrentValue(parameter, index) {
    if (Validate(parameter)) {
        if (Validate(index) == false) {
            return parseInt(parameter.Values);
        } else {
            var res = parameter.Values.split(" ");
            if (index < res.length) {
                return parseInt(res[index]);
            }
        }
    }
    return null;
}

function setupTooltips() {
    $(document).tooltip({
        position: {
            my: "center bottom-20",
            at: "center top",
            using: function (position, feedback) {
                $(this).css(position);
                $("<div>")
                  .addClass("arrow")
                  .addClass(feedback.vertical)
                  .addClass(feedback.horizontal)
                  .appendTo(this);
            }
        },
        content: function () {
            var element = $(this);
            var title = element.attr("title");
            var items = title.split("|");
            var count = items.length;
            var html = "<div><h4>Previous Values</h4>";
            for (var i = 0; i < count; ++i) {
                var parts = items[i].split("#");
                if (i < count - 1) {
                    html = html + "<p><b><span style='color:gray'> Previous Saved Value" + (i + 1).toString() + " = " + parts[0] + "</span></b><span style='color:silver'>    (" + parts[1] + " on " + parts[2] + ")</span></p>";
                } else {
                    html = html + "<p><b><span style='color:blue'> Current Saved Value = " + parts[0] + "</span></b><span style='color:silver'>    (" + parts[1] + " on " + parts[2] + ")</span></p>";
                }
            }
            html = html + "</div>";
            return html;

        }
    });
}


function addTableLayerRowCell(html, parameter, index) {
    html = html + "<td>";
    var name = parameter.Name + index.toString();
    var classes = "value-edit form-control value-edit-" + parameter.Name + " index-" + index;

    var value = getParameterValue(parameter, index);
    var lastvalue = getLastParameterValue(parameter, index);
    html = html + createInput(parameter.Id, name, classes, value);
    if (lastvalue != value) {
        html = html + createBadge(parameter, index);
    }
    html = html + "</td>";
    return html;
}

function getParameterValue(parameter, index) {
    var values = parameter.Values.split(",");
    return (index >= 0 && index < values.length) ? values[index] : "";
}

function getLastParameterValue(parameter, index) {
    var values = parameter.LastValues.split(",");
    return (index >= 0 && index < values.length) ? values[index] : "";
}

function createInput(id, name, classes, value) {
    return "<input type='text' id='value-" + id + "' name='" + name + "' class='" + classes + "' value='" + value + "' />";
}

function createBadge(parameter, index) {
    var html = "";

    if (Validate(parameter.HintText) && parameter.HintText.length > 0) {
        var res = parameter.HintText.split("|");
        var id = Validate(index) ? "badge-" + parameter.Id + "-" + index.toString() : "badge-" + parameter.Id;
        // html = html + "<div style='position:relative'>";
        if (Validate(index)) {
            html = html + "<span id='" + id + "'  class='badge parameter-warning-badge' title='" + parameter.HintText + "'>";//style='margin-left:70%'
        } else {
            html = html + "<span id='" + id + "'  class='badge parameter-warning-badge' title='" + parameter.HintText + "'>";
        }
        html = html + "<i class='fa fa-exclamation-triangle' style='margin-right: 4px;'></i>";
        html = html + res.length.toString();
        html = html + "</span>";//"</div>";
    }

    return html;
}

function addInputOnChangeEvents() {
    $("input.value-edit").change(function (e) {
        var $editor = $(e.currentTarget);
        var val = $editor.val();
        var lastval = $editor.data("lastval");
        var id = $editor.attr("id");
        var paramid = id.replace("value-", "");
        var index = $editor.data("index");
        if (val != lastval) {
            showHintBadge($editor, paramid, index);
        } else {
            hideHintBadge(paramid, index);
        }

    });
}

function showHintBadge($input, paramid, index) {

    var parameter = getParameterFromID(paramid);
    if (Validate(parameter)) {
        var $existingBadge = Validate(index) ? $("#badge-" + paramid + "-" + index) : $("#badge-" + paramid);
        if ($existingBadge.length == 0) {
            var badgehtml = createBadge(parameter, index);
            $input.after(badgehtml);
        }

    }
}

function hideHintBadge(paramid, index) {
    var $existingBadge = Validate(index) ? $("#badge-" + paramid + "-" + index) : $("#badge-" + paramid);
    if ($existingBadge.length > 0)
        $existingBadge.remove();
}

//function generateNewHintText(parameter, val, lastval) {

//    String.Format("{0}#{1}#{2}", item.ValueString, item.UserName,item.DateTimeStamp.ToLocalTime().ToString("F"))).ToList();
//}

function getParameterFromID(id) {
    if (Validate(mydatasource)) {
        for (var property in mydatasource) {
            if (mydatasource.hasOwnProperty(property)) {
                var myobject = mydatasource[property];
                if (Validate(myobject) && Validate(myobject.Id)) {
                    if (myobject.Id == id) {
                        return myobject;
                    }
                }
            }
        }
    }
    return null;
}


var writeCookie = function (name, value) {

    document.cookie = name + "=" + value + "; path=/";
}

function readCookie(c_name, defaultvalue) {
    if (document.cookie.length > 0) {
        c_start = document.cookie.indexOf(c_name + "=");
        if (c_start != -1) {
            c_start = c_start + c_name.length + 1;
            c_end = document.cookie.indexOf(";", c_start);
            if (c_end == -1) {
                c_end = document.cookie.length;
            }
            return unescape(document.cookie.substring(c_start, c_end));
        }
    }
    return defaultvalue;
}