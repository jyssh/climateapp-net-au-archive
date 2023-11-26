var dialogItem;
var dialogSuccessCallback;
var dialogCancelCallback;
var currentPosition;
var selectedLocationId;

function initLocationSelector() {
    initialiseNavigation();
    $("#select-location").click(function () {

        openSelectLocationDialog(null,
            function(id,name) {
                $("#select-location").text(name);
            });
    });
}




function initialiseNavigation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function(position) {
                currentPosition = position.coords;

            },
            function(err) {
                currentPosition = null;
            }, { timeout: 10000 });
    }
}

var cancelGeoLocate = false;
function openSelectLocationDialog(sourceitem, onSuccessCallback,onCancelCallback,currentLocation) {
   
    var bodyWidth = $("body").width();
    var width = (bodyWidth < 600) ? bodyWidth : 600;

    var $dialog = $("#select-location-dialog");
    dialogItem = sourceitem;
    selectedLocationId = currentLocation;
    dialogSuccessCallback = onSuccessCallback;
    dialogCancelCallback = onCancelCallback;
    $dialog.dialog({
        resizable: true,
       
        height: 682,
        width: width,
        modal: true,
        open: function (event, ui) {
            initialiseUpdateAllCheckbox();
            setupPageTabs();
            if (navigator.geolocation) {
                $("#search-table").hide();
                $(".spinner-div").show();
                if (Validate(currentPosition)) {
                    $(".spinner-div").hide();
                    setupSearchTab();
                    $("#search-table_filter input").focus();
                } else {
                    navigator.geolocation.getCurrentPosition(function (position) {
                        currentPosition = position.coords;
                        if (!cancelGeoLocate) {
                           setupSearchTab();
                            $("#search-table_filter input").focus();
                        }
                    }, function (err) {
                       
                        currentPosition = null;
                        if (!cancelGeoLocate)
                        {
                            $(".spinner-div").hide();
                            setupSearchTab();
                            $("#search-table_filter input").focus();
                        }
                    }, { timeout: 5000 });
                }
                
                loadStations();
            } else {
                currentPosition = null;
                x.innerHTML = "Geolocation is not supported by this browser.";
                $(".spinner-div").hide();
                setupSearchTab();
                $("#search-table_filter input").focus();
            }
            
        },
        close: function () {
            cancelGeoLocate = false;
            $("#map-tooltip").hide();

        },
        buttons: {
            Cancel: function () {
                $("#Location").val(currentLocation);
                dialogCancelCallback();
                $(this).dialog("close");
            }
        }
    });
    
}


function continueWithoutGeolocation() {
    cancelGeoLocate = true;
    $(".spinner-div").hide();
    setupSearchTab();
    $("#search-table_filter input").focus();
}

function showPosition(position) {
    x.innerHTML = "Latitude: " + position.coords.latitude +
    "<br>Longitude: " + position.coords.longitude;
}

function setupPageTabs() {
    $("#select-location-dialog-tabs").tabs({
        active: 1,
        activate: function (event, ui) {

            switch (ui.newTab.index()) {
                case 0:
                    setupFavouritesTab();
                    break;
                case 1:
                    setupSearchTab();
                    break;
                case 2:
                    setupMapTab();
                    break;                
            }
            
        }
    });
    $("#select-location-dialog-tabs").tabs("disable", 2);
    
}

var tab1init = false;
function setupFavouritesTab()
{
    var selector = "#favourites-table";
    $(".spinner-div").hide();
    $(selector).fadeIn();
    if (!tab1init) {

        createFavouriteLocationsTable(selector, "/Analyses/FavouriteSationsTableViewSource");
        tab1init = true;
    } else {
        if (favouritesTable) {
            favouritesTable.ajax.reload();
        }
    }
    $("#map-tooltip").hide();
}

var tab2init = false;
function setupSearchTab() {
    var selector = "#search-table";
    $(".spinner-div").hide();
    $(selector).fadeIn();
    if (!tab2init) {
        createAllLocationsTable(selector, "/Analyses/AllStationsTableViewSource");
        tab2init = true;
    }
    else {
        if (searchTable) {
            searchTable.ajax.reload();
        }
    }
    $("#map-tooltip").hide();
}


var tab3init = false;
function setupMapTab() {
    var selector = "climate-stations-map";
    if (!tab3init) {
        setupMap(selector, null);
        tab3init = true;
    } else {
        UpdateStationBubbles(googleMap.getBounds());
    }
    $("#map-tooltip").hide();
}

var allStations = null;
function loadStations() {
    if (!Validate(allStations)) {
        $.getJSON("/Analyses/GetMapClimateStations",
            null,
            function(stations) {
                allStations = stations;
                $("#select-location-dialog-tabs").tabs("enable", 2);
                $("#map-tab-caption").text("From Map");
            });
    } else {
        $("#select-location-dialog-tabs").tabs("enable", 2);
        $("#map-tab-caption").text("From Map");
    }
}

var googleMap = null;

function setupMap(selector,defaultpos) {
    
    var myLatlng = null;
    var mapzoom = 5;
    if (Validate(defaultpos)) {
        myLatlng = defaultpos.coords;
        mapzoom = defaultpos.zoom;
    } else {


        if (Validate(currentPosition)) {
            mapzoom = 8;
            myLatlng = { lat: currentPosition.latitude, lng: currentPosition.longitude };
        } else {
            var mapzoom = 6;
            myLatlng = { lat: 141.016667, lng: -32.163333 };
        }

        if (Validate(currentPosition)) {
            mapzoom = 8;
            myLatlng = { lat: currentPosition.latitude, lng: currentPosition.longitude };
        }
    }
    googleMap = new google.maps.Map(document.getElementById(selector), {
        zoom: mapzoom,
        center: myLatlng
    });
   
    google.maps.event.addListener(googleMap, 'bounds_changed', function () {
        $("#map-tooltip").hide();
        UpdateStationBubbles(googleMap.getBounds());
    });


    bubbles = [];
    //map.addListener('center_changed', function () {
    //    // 3 seconds after the center of the map has changed, pan back to the
    //    // marker.
    //    window.setTimeout(function () {
    //        map.panTo(marker.getPosition());
    //    }, 3000);
    //});


}


var bubbles = null;


var lastMouseCircle = null;

function UpdateStationBubbles(bounds) {

    if (Validate(allStations) && Validate(googleMap)) {
        //var bounds = googleMap.getBounds();
        
        for (var i = 0; i < allStations.length; ++i) {
            var station = allStations[i];
           
            if (!Validate(station.hasMarker) || station.hasMarker !== true) {
                if (isInMapBounds(bounds, station)) {
                    //var marker = new google.maps.Marker({
                    //    position: new google.maps.LatLng(station.Latitude, station.Longitude),
                    //    icon: {
                    //        path: google.maps.SymbolPath.CIRCLE,
                    //        scale: 6,
                    //        strokeColor: getStationPenColor(station),
                    //        strokeOpacity: getStationStrokeOpacity(station),
                    //        strokeWeight: getStationStrokeWidth(station),
                    //        fillColor: getStationBrushColor(station),
                    //        fillOpacity: getStationFillOpacity(station),
                    //    },
                    //    hintTitle: station.Name,
                    //    selected: station.Selected,
                    //    zIndex: 99999,
                    //    Id:station.Id,
                    //    map: googleMap
                    //});
                    var marker = new google.maps.Circle({
                            strokeColor: getStationPenColor(station),
                            strokeOpacity: getStationStrokeOpacity(station),
                            strokeWeight: getStationStrokeWidth(station),
                            fillColor: getStationBrushColor(station),
                            //title: station.Name,
                            hintTitle: station.Name,
                            selected: station.Selected,
                            id: station.Id,
                            fillOpacity: getStationFillOpacity(station),
                            clickable: true,
                           
                            map: googleMap,
                            center: new google.maps.LatLng(station.Latitude, station.Longitude),
                            radius: 100
                        });

                    bubbles.push(marker);
                  
                    station.hasMarker = true;
                    marker.addListener('click', function () {
                        var id = this.id;
                        var oldid = selectedLocationId;
                        selectedLocationId = id;
                        changesMapStationSelectedStatus(true);///this remove yellow colouring on last selected station;
                        if (typeof mydatasource !== 'undefined' && Validate(mydatasource) && Validate(mydatasource.InputValues)) {
                            mydatasource.InputValues.Location = id;
                            mydatasource.InputValues.LocationName = this.hintTitle;
                        }
                        this.selected = true;
                        this.strokeColor = getStationPenColor(this);
                        this.strokeOpacity = getStationStrokeOpacity(this);
                        this.strokeWeight = getStationStrokeWidth(this);
                        this.fillColor = getStationBrushColor(this);
                        this.fillOpacity = getStationFillOpacity(this);
                        $("#map-tooltip").hide();
                        dialogSuccessCallback(id, this.hintTitle);
                        $("#select-location-dialog").dialog("close");
                    });
                    google.maps.event.addListener(marker,'mouseover', function () {
                        if (typeof this.hintTitle !== "undefined" && this !== lastMouseCircle) {
                            lastMouseCircle = this;
                            var html = getHtmlTitle(this.Id,this.hintTitle,this.selected);
                            //var point = fromLatLngToPoint(this.getPosition());
                            var point = fromLatLngToPoint(this.center);
                            var div = googleMap.getDiv();
                            var dialogpos = $(div).offset();
                            var $tooltip = $("#map-tooltip");
                            $tooltip.html(html);
                            var x = dialogpos.left + point.x-$tooltip.width()/2.0;
                            var y = dialogpos.top + point.y-55;
                            
                            $tooltip.css("left", x);
                            $tooltip.css("top", y);
                            $tooltip.fadeIn();

                            //if (this.selected) {
                            //    if (this.id === selectedLocationId) {
                            //        infoWindow.setContent("<span style='font-weight:bold;color:blue'><i class='fa fa-heart' aria-hidden='true' style='margin-right:6px;color:red;'></i>" + this.title + "</span> <span class='badge btn-danger'>current</span>"); // set content
                            //    } else {
                            //        infoWindow.setContent("<span style='font-weight:bold;color:blue'><i class='fa fa-heart' aria-hidden='true' style='margin-right:6px;color:red;'></i>" + this.title + "</span>"); // set content
                            //    }
                            //} else {
                            //    infoWindow.setContent("<b>" + this.title + "</b>"); // set content
                            //}
                            //infoWindow.open(googleMap, marker); // open at marker's location
                            //marker.setVisible(false); // show the marker
                        }
                    });

                    google.maps.event.addListener(marker,'mouseout', function () {
                        lastMouseCircle = null;
                        //infoWindow.close();
                        $("#map-tooltip").hide();
                    });
                }
            }
        }
    }

    var radius = getBubbleRadius(bounds);
    for (var i = 0; i < bubbles.length; ++i) {
        var bubble = bubbles[i];
        if (bounds.contains(bubble.center)) {
            if (bubble.radius !== radius) {
                bubble.setRadius(radius);
            }
        }
    }

}

function getBubbleRadius(bounds) {
    var zoom = getBoundsZoomLevel(bounds);
    if (zoom < 1) return 5000;
    if (zoom < 2) return 5000;
    if (zoom < 3) return 4000;
    if (zoom < 4) return 4000;
    if (zoom < 5) return 3000;
    if (zoom < 6) return 3000;
    if (zoom < 7) return 2000;
    if (zoom < 8) return 2000;
    if (zoom < 9) return 1000;
    if (zoom < 10) return 800;
    if (zoom < 11) return 600;
    if (zoom < 12) return 400;
    if (zoom < 13) return 300;
    if (zoom < 14) return 200;
    return 100;
}


function getHtmlTitle(id,title,selected) {
    if (selected)
    {
        if (id === selectedLocationId) {
            return "<span style='font-weight:bold;color:yellow'><i class='fa fa-heart' aria-hidden='true' style='margin-right:6px;color:red;'></i>" + title + "</span> <span class='badge btn-danger'>current</span>"; // set content
        } else {
            return "<span style='font-weight:bold;color:white'><i class='fa fa-heart' aria-hidden='true' style='margin-right:6px;color:red;'></i>" + title + "</span>"; // set content
        }
    } 
    return "<b>" + title + "</b>";
    
}

function getBoundsZoomLevel(bounds) {
    var mapwidth = 450;
    var mapheight = 380;


    var WORLD_DIM = { height: 256, width: 256 };
    var ZOOM_MAX = 21;

    function latRad(lat) {
        var sin = Math.sin(lat * Math.PI / 180);
        var radX2 = Math.log((1 + sin) / (1 - sin)) / 2;
        return Math.max(Math.min(radX2, Math.PI), -Math.PI) / 2;
    }

    function zoom(mapPx, worldPx, fraction) {
        return Math.floor(Math.log(mapPx / worldPx / fraction) / Math.LN2);
    }

    var ne = bounds.getNorthEast();
    var sw = bounds.getSouthWest();

    var latFraction = (latRad(ne.lat()) - latRad(sw.lat())) / Math.PI;

    var lngDiff = ne.lng() - sw.lng();
    var lngFraction = ((lngDiff < 0) ? (lngDiff + 360) : lngDiff) / 360;

    var latZoom = zoom(mapheight, WORLD_DIM.height, latFraction);
    var lngZoom = zoom(mapwidth, WORLD_DIM.width, lngFraction);

    return Math.min(latZoom, lngZoom, ZOOM_MAX);
}



function fromLatLngToPoint(latLng) {
    var topRight = googleMap.getProjection().fromLatLngToPoint(googleMap.getBounds().getNorthEast());
    var bottomLeft = googleMap.getProjection().fromLatLngToPoint(googleMap.getBounds().getSouthWest());
    var scale = Math.pow(2, googleMap.getZoom());
    var worldPoint = googleMap.getProjection().fromLatLngToPoint(latLng);
    return new google.maps.Point((worldPoint.x - bottomLeft.x) * scale, (worldPoint.y - topRight.y) * scale);
}

function getStationBrushColor(station) {
    if (station.Selected) {
        if (station.Id === selectedLocationId) {
            return "yellow";
        } else {
            return "white";
        }
    }
    return "red";
}
function getStationPenColor(station) {
    if (station.Selected) {
        if (station.Id === selectedLocationId) {
            return "black";
        } else {
            return "black";
        }
    }
    return "red";
}
function getStationFillOpacity(station) {
    if (station.Selected) {
        if (station.Id === selectedLocationId) {
            return 1;
        } else {
            return 1;
        }
    }
    return 0.25;
}
function getStationStrokeOpacity(station) {
    if (station.Selected) {
        if (station.Id === selectedLocationId) {
            return 1;
        } else {
            return 1;
        }
    }
    return 0.7;
}
function getStationStrokeWidth(station) {
    if (station.Selected) {
        if (station.Id === selectedLocationId) {
            return 2;
        } else {
            return 2;
        }
    }
    return 0.5;
}


function isInMapBounds(bounds, station) {
   // var southWest = bounds.getSouthWest();
   // var northEast = bounds.getNorthEast();
    var statloc = { lat: station.Latitude, lng: station.Longitude };
    return bounds.contains(statloc);
    //station.Latitude, station.Longitude
    
}

function handleLocationError(browserHasGeolocation, infoWindow, pos) {
    infoWindow.setPosition(pos);
    infoWindow.setContent(browserHasGeolocation ?
                          'Error: The Geolocation service failed.' :
                          'Error: Your browser doesn\'t support geolocation.');
}

var favouritesTable = null;

function createFavouriteLocationsTable(selector, sourceuri) {
    var sortCol = (Validate(currentPosition)) ? 3 : 0;
    favouritesTable = $(selector).DataTable({
        //"stateSave": true,
        "rowId": "Id",
        "bLengthChange": false,
        "bServerSide": true,
        "sAjaxSource": sourceuri,
        "order": [[sortCol, "asc"]],
        "fnServerData": function (sSource, aoData, fnCallback, oSettings) {

            aoData.push({ 'name': "latitude", 'value': Validate(currentPosition) && isNumeric(currentPosition.latitude) ? currentPosition.latitude : null });
            aoData.push({ 'name': "longitude", 'value': Validate(currentPosition) && isNumeric(currentPosition.longitude) ? currentPosition.longitude : null });
            //aoData.push({ 'name': "latitude", 'value':  null });
            //aoData.push({ 'name': "longitude", 'value':  null });
          
            oSettings.jqXHR = $.ajax({
                "dataType": 'json',
                "type": "POST",
                "url": sSource,
                "data": aoData,
                "success": fnCallback
            });
        },
        "bProcessing": true,
        "aoColumns": [
            {
                "mData": "Name", "bSearchable": true, "bSortable": true,
                "mRender": function (data, type, full) {
                    if (full.Id === selectedLocationId) {
                        return "<span style='font-weight:bold;color:blue'><i class='fa fa-heart' aria-hidden='true' style='margin-right:6px;color:red;'></i>" + full.Name + "</span> <span class='badge btn-danger'>current</span>";
                    } else {
                        return "<span style='color:blue;'><i class='fa fa-heart' aria-hidden='true' style='margin-right:6px;color:red;'></i>" + full.Name + "</span>";
                    }
                }
            },
            //{
            //    "mData": "StationNo", "bSearchable": true, "bSortable": true,
            //    "mRender": function (data, type, full) {
            //        if (full.Id === selectedLocationId) {
            //            return "<span style='font-weight:bold'>" + full.StationNo + "</span>";
            //        } else {
            //            return "<span>" + full.StationNo + "</span>";
            //        }
            //    }
            //},
            {
                "mData": "State", "bSearchable": true, "bSortable": true,
                "mRender": function (data, type, full) {
                    if (full.Id === selectedLocationId) {
                        return "<span style='font-weight:bold'>" + full.State + "</span>";
                    } else {
                        return "<span>" + full.State + "</span>";
                    }
                }
            },
            { "mData": "ElevationText", "bSearchable": true, "bSortable": true },
            {
                "mData": "Dist", "bSearchable": false, "bSortable": true,
                "mRender": function (data, type, full) {
                    if (full.Id === selectedLocationId) {
                        return "<span style='font-weight:bold'>" + full.Dist + "</span>";
                    } else {
                        return "<span>" + full.Dist + "</span>";
                    }
                }
            },
            {
                "mData": "Id",
                "bSearchable": false,
                "bSortable": false,
                "mRender": function (data, type, full) {
                   
                        return "<span><a href='#' onclick='javascript:removeLocation(\"" +
                            full.Id +
                            "\")' style='display:inline;'><i class='fa fa-trash-o fa-lg' style='color:blue' title='Remove Favourite'></i></a> </span>";
                    
                }
            }
        ],
        "fnRowCallback": function (nRow, aData, iDisplayIndex, iDisplayIndexFull) {
            $('td', nRow).attr("nowrap", "nowrap");
            if (aData["Selected"] === true) {
                if (selectedLocationId === aData["Id"]) {
                    $('td', nRow).closest('tr').css('background', 'yellow');
                } 
            }
            return nRow;
        }
    });

    //  $(".dataTables_wrapper .paginate_button").css("padding", 0);

    $(selector + " tbody").on("click", "tr td:not(:last-child)", function () {
        var row = favouritesTable.row(this.parentElement);
        var id = $(this.parentElement).attr("id");
        var name = $(this.parentElement).children("td:first").text();
        selectedLocationId = id;
        dialogSuccessCallback(id, name);
         $("#select-location-dialog").dialog("close");
    });
}

function removeLocation(removalid) {

    changesMapStationSelectedStatus(removalid, false);
    if (removalid === selectedLocationId) {
        confirmDelete("Remove Current Location?",
            "This climate station is selected in your current analysis. Still want to remove it?",
            function() {


                $.getJSON('/Analyses/RemoveLocation',
                    { RemovalId: removalid, SelectedId: selectedLocationId },
                    function(results) {
                        if (results.success) {
                            if (typeof mydatasource !== 'undefined' && Validate(mydatasource) && Validate(mydatasource.InputValues)) {
                                mydatasource.InputValues.Location = results.locationId;
                                mydatasource.InputValues.LocationName = results.locationName;
                            }
                            selectedLocationId = results.locationId;
                            favouritesTable.ajax.reload();
                            searchTable.ajax.reload();
                        }
                    });
            },
            null);
    } else {
        $.getJSON('/Analyses/RemoveLocation',
                    { RemovalId: removalid, SelectedId: selectedLocationId },
                    function (results) {
                        if (results.success) {
                            if (typeof mydatasource !== 'undefined'&& Validate(mydatasource) && Validate(mydatasource.InputValues)) {
                                mydatasource.InputValues.Location = results.locationId;
                                mydatasource.InputValues.LocationName = results.locationName;
                            }
                            selectedLocationId = results.locationId;
                            favouritesTable.ajax.reload();
                            searchTable.ajax.reload();
                        }
                    });
    }
}


function isNumeric(n) {
    return  !isNaN(parseFloat(n)) && isFinite(n);
}

var searchTable = null;
function createAllLocationsTable(selector, sourceuri) {
    var sortCol = Validate(currentPosition) ? 3 : 0;
    searchTable = $(selector).DataTable({
        //"stateSave": true,
        "rowId": "Id",
        "bLengthChange": false,
        "bServerSide": true,
        "sAjaxSource": sourceuri,
        "order": [[sortCol, "asc"]],
        "fnServerData": function (sSource, aoData, fnCallback, oSettings) {

            aoData.push({ 'name': "latitude", 'value': Validate(currentPosition) && isNumeric(currentPosition.latitude) ? currentPosition.latitude : null });
            aoData.push({ 'name': "longitude", 'value': Validate(currentPosition) && isNumeric(currentPosition.longitude) ? currentPosition.longitude : null });


            oSettings.jqXHR = $.ajax({
                "dataType": 'json',
                "type": "POST",
                "url": sSource,
                "data": aoData,
                "success": fnCallback
            });
        },
        "bProcessing": true,
        "aoColumns": [
            { "mData": "Name", "bSearchable": true, "bSortable": true,
                "mRender": function (data, type, full) {
                    if (full.Selected) {
                        if (full.Id === selectedLocationId) {
                            return "<span style='font-weight:bold;color:blue' ><i class='fa fa-heart' aria-hidden='true' style='margin-right:6px;color:red;'></i>" + full.Name + "</span> <span class='badge btn-danger'>current</span>";
                        } else {
                            return "<span style='color:blue'><i class='fa fa-heart' aria-hidden='true' style='margin-right:6px;color:red;'></i>" + full.Name + "</span>";
                        }
                        
                    } else {
                        return "<span>" + full.Name + "</span>";
                    }
                } },
            //{ "mData": "StationNo", "bSearchable": true, "bSortable": true },
            { "mData": "State", "bSearchable": true, "bSortable": true },
            { "mData": "ElevationText", "bSearchable": true, "bSortable": true },
            { "mData": "Dist", "bSearchable": false, "bSortable": true },
            {
                "mData": "Id",
                "bSearchable": false,
                "bSortable": false,
                "mRender": function (data, type, full) {

                    return "<span><a href='#' onclick='javascript:gotoLocation(\"" +full.Id +"\")' style='display:inline;'><i class='fa fa-globe fa-lg' style='color:blue' title='Show On Map'></i></a> </span>";

                }
            }
           
        ],
        "fnRowCallback": function (nRow, aData, iDisplayIndex, iDisplayIndexFull) {
            if (aData["Selected"] === true) {
                $('td', nRow).attr("nowrap", "nowrap");
                if (selectedLocationId === aData["Id"]) {
                    $('td', nRow).closest('tr').css('background', 'yellow');

                }
                // else {
                //    $('td', nRow).closest('tr').css('background', 'greenyellow');
                //}
            }
            return nRow;
        }
    });
 
   
    $(selector + ' tbody').on('click', "tr td:not(:last-child)", function () {
        var row = searchTable.row(this.parentElement);
        var id = $(this.parentElement).attr("id");
        var name = $(this.parentElement).children("td:first").text();
        selectedLocationId = id;
        changesMapStationSelectedStatus(selectedLocationId, true);
        dialogSuccessCallback(id, name);
        $("#select-location-dialog").dialog("close");
    });
}


function gotoLocation(locationid) {
    for (var i = 0; i < allStations.length; ++i) {
        var station = allStations[i];
        if (station.Id === locationid) {
            $("#select-location-dialog-tabs").tabs("option", "active", 2);
            var latlong = new google.maps.LatLng(station.Latitude, station.Longitude); 
            var zoomlevel = 11;
            if (Validate(googleMap)) {
                googleMap.setCenter(latlong);
                googleMap.setZoom(zoomlevel);
            } else {
                var pos = new Object;
                pos.coords = latlong;
                pos.zoom = zoomlevel;
                setupMap("climate-stations-map", pos);
            }
            return;
        }
    }
    
}



function confirmDelete(title, msg, onYesCallbackEvent, onNoCallbackEvent) {

    var $dialog = $("#confirm-delete-dialog");
    if ($dialog.exists() === false) {
        var dialoghtml =
            "<div id='confirm-delete-dialog'  class='climate-dialog' title='"+title+"' style='display: none;'>";
        dialoghtml = dialoghtml +
            "<p style='margin-top: 5px;'><i class='fa fa-3x fa-exclamation-triangle' style='color: red; float: left; margin-right: 30px; margin-top: 2px;'></i><span id='dialog-msg'>"+msg+"</span></p></div>";
        $dialog = $($.parseHTML(dialoghtml));
    }
    
    $dialog.dialog({
        resizable: false,
        height: 280,
        width: 400,
        modal: true,
        open: function (event, ui) {

        },
        buttons: {
            "Yes do it": function () {

                $(this).dialog("close");
                if (onYesCallbackEvent)
                    onYesCallbackEvent();

            },
            "No, Cancel": function () {
                $(this).dialog("close");
                if (onNoCallbackEvent)
                    onNoCallbackEvent();
            }
        }
    });
}

function changesMapStationSelectedStatus(id,status) {
    for (var i = 0; i < allStations.length; ++i) {
        var station = allStations[i];
        if (station.Id === id) {
            station.selected = status;
            station.strokeColor = getStationPenColor(station);
            station.strokeOpacity = getStationStrokeOpacity(station);
            station.strokeWeight = getStationStrokeWidth(station);
            station.fillColor = getStationBrushColor(station);
            station.fillOpacity = getStationFillOpacity(station);
            return;
        }
    }
}

function selectQLD() {
    if (Validate(googleMap)) {
        var latlong = new google.maps.LatLng(-22.486944, 146); //QLD
        var zoomlevel = 5;
        googleMap.setCenter(latlong);
        googleMap.setZoom(zoomlevel);
    }
}

function selectNSW() {
    if (Validate(googleMap)) {
        var latlong = new google.maps.LatLng(-32.7, 148.4); //NSW
        var zoomlevel = 6;
        googleMap.setCenter(latlong);
        googleMap.setZoom(zoomlevel);
    }
}

function selectSA() {
    if (Validate(googleMap)) {
        var latlong = new google.maps.LatLng(-33.9, 137); //SA
        var zoomlevel = 6;
        googleMap.setCenter(latlong);
        googleMap.setZoom(zoomlevel);
    }
}

function selectVIC() {
    if (Validate(googleMap)) {
        var latlong = new google.maps.LatLng(-37.38, 145.3); //VIC
        var zoomlevel = 7;
        googleMap.setCenter(latlong);
        googleMap.setZoom(zoomlevel);
    }
}

function selectWA() {
    if (Validate(googleMap)) {
        var latlong = new google.maps.LatLng(-28.56, 119); //WA
        var zoomlevel = 5;
        googleMap.setCenter(latlong);
        googleMap.setZoom(zoomlevel);
    }
}

function selectTAS() {
    if (Validate(googleMap)) {
        var latlong = new google.maps.LatLng(-42.1, 146.596111); //TAS
        var zoomlevel = 7;
        googleMap.setCenter(latlong);
        googleMap.setZoom(zoomlevel);
    }
}

function selectNT() {
    if (Validate(googleMap)) {
        var latlong = new google.maps.LatLng(-19.383333, 133.357778); //NT
        var zoomlevel = 5;
        googleMap.setCenter(latlong);
        googleMap.setZoom(zoomlevel);
    }
}

function initialiseUpdateAllCheckbox() {
    
    $.getJSON("/Analyses/GetGlobalLocationState",
        null,
        function (result) {
            var state = result.state;
            if (result.success) {
                if (state === true) {
                    $("#update-all-checkbox").prop('checked', true);
                } else {
                    $("#update-all-checkbox").prop('checked', false);
                }
                $("#update-all-checkbox-container").show();
                $("#update-all-checkbox").change(function () {
                    var state = $("#update-all-checkbox").prop('checked');
                    $.ajax({
                        url: "/Analyses/UpdateGlobalLocationState",
                        type: "POST",
                        dataType: "json",
                        data: {
                            "state": state
                        },
                        success: function (data) {
                            if (data.success) {
                               
                            } 
                        },
                        failure: function (data) {
                            
                        }
                    });

                });
            } else {
                
            }

        });
}
