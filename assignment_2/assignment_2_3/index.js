var map;
var path;
var markers = [];

var show_buses = false;

var routess;
var trips;
var shapes;

var prevWarning = 0;
var refreshHistory = [];
var refreshWaitTime = 60000;

function initMap(){
    var pos = {lat: 60.45, lng: 22.2833};
    map = new google.maps.Map(document.getElementById('map'), {
        center: pos,
        zoom: 12
        });
}

function hideMarkers(){
    markers.forEach(function(marker){
        marker.setMap(null);
    });
}
function showMarkers(){
    markers.forEach(function(marker){
        marker.setMap(map);
    });
}
function removeMarkers(){
    markers.forEach(function(marker){
        marker.setMap(null);
    });
    markers = [];
}

function addMarkers(positions){
    //For every {lat: xxx, lng: yyy} in positions
    positions.forEach(function(position){
        //create a marker with center at that position and map being map
        //var latLng = new google.maps.LatLng(position.lat, position.lng);
        var marker = new google.maps.Marker({
            position: position,
            map: map
        });
        //Add the marker to the list of markers (so that we can remove them later)
        markers.push(marker);
    });
    if(!show_buses){
        hideMarkers();
    }
}

function refresh(){
    //Check that we don't do get stuff too often according to Föli
    if(new Date().getTime() - refreshHistory[0] < refreshWaitTime){
        alert("I'm afraid we're not allowed to get the live bus data that often!"+
        " Try again in " + parseInt((refreshWaitTime-(new Date().getTime() - refreshHistory[0]))/1000) + " seconds.");
    }else if(refreshHistory.length < 3){
        refreshHistory.push(new Date().getTime());
        getLiveBuses(); //Create xhttprequest
    }else{
        refreshHistory.shift();
        refreshHistory.push(new Date().getTime())
        getLiveBuses(); //Create xhttprequest
    }
    setHistory(refreshHistory);
}
function getLiveBuses(live_buses){
    //Create xhttprequest with getLiveBuses2 as callback function
    xhttpRequest(getLiveBuses2, "http://data.foli.fi/siri/vm");
}
function getLiveBuses2(live_buses){
    var route_id = $("#busSelector").val();
    var route_name = getRouteName(route_id);

    //console.log("Live_buses: ", live_buses);
    buses = live_buses.result.vehicles;
    //console.log("Buses: ", buses);
    linename = "";

    //Initiate empty list of current positions of the buses on the line
    var current_positions = [];
    $.each(buses, function(k, v) {
        //For each bus get their key and value
        linename = v.publishedlinename;

        //If the linename matches the route_name we got from the currently
        //selected route in the selector
        if(linename === route_name){
            //Create the position object
            var latitude = v.latitude;
            var longitude = v.longitude;
            var position = {lat: latitude, lng: longitude};
            //Push it to the list of current positions
            current_positions.push(position);
        }
    });
    //Remove all the old markers
    removeMarkers();
    //Add the new markers
    addMarkers(current_positions);

}

function error(code, file){
    if(code == 404 && new Date().getTime() - prevWarning > 1000){
        alert("Could not get: " + file);
        prevWarning = new Date().getTime();
    }
}

function xhttpRequest(callback, file){
    var rawFile = new XMLHttpRequest();
    rawFile.open("GET", file, true);
    rawFile.onreadystatechange = function (){
        if(this.readyState == 4 && this.status == 200){
            var jsonObj = JSON.parse(this.responseText);
            callback(jsonObj);
        }
        if(this.status == 404){
            error(404, file);
        }
    }
    rawFile.send();
}
//Use the route_id to get the shape_id from /trips.
//The shape_id is used to get the coordinates from /shapes
function displayShape(route_id){
    var url = "http://data.foli.fi/gtfs/v0/20171130-162538/trips/route/" + route_id;
    xhttpRequest(displayShape2, url);
}
function displayShape2(shapes){
    var shape_id = shapes[0].shape_id;
    var url = "http://data.foli.fi/gtfs/v0/20171130-162538/shapes/" + shape_id;
    xhttpRequest(drawShape, url);
}
function drawShape(path_coordinates){
    if(path !== undefined) path.setMap(null); //Remove the old shape
    var path_length = Object.keys(path_coordinates).length;

    var coordinates = []
    for(i=0; i < path_length; i++){
        coordinates.push({lat: path_coordinates[i].lat, lng: path_coordinates[i].lon});
    }

    path = new google.maps.Polyline({
      path: coordinates,
      strokeColor: '#FF0000',
      strokeOpacity: 1.0,
      strokeWeight: 2
    });
    path.setMap(map);
}

function Comparator(a, b){
    if (a[1] < b[1]) return -1;
    if (a[1] > b[1]) return  1;
    return 0;
}

function getHistory(){
    return localStorage.getItem("refreshHistory");
}

function setHistory(history){
    localStorage.setItem("refreshHistory", JSON.stringify(history));
}

function getRouteName(route_id){
    for(i=0; i<routess.length; i++){
        if(route_id === routess[i].route_id){
            return routess[i].route_short_name;
        }
    }
}

function addRoutes(routes){
    var route_pairs = [];
    routess = routes;
    for(i=1; i<routes.length-1; i++){
        //route_id,agency_id,route_short_name,route_long_name,route_desc,route_type,route_url,route_color,route_text_col
        var route_pair = [routes[i].route_id, routes[i].route_short_name];
        route_pairs.push(route_pair);
    }
    //sort
    route_pairs.sort(Comparator);
    for(i=0; i<route_pairs.length; i++){
        var route_id = route_pairs[i][0];
        var route_name = route_pairs[i][1];
        $("#busSelector").append(`<option value="`+route_id+`">` + route_name + `</option>`);
    }

}
$(document).ready(function () {
    if(storageAvailable("localStorage")){
        //Check if there's some juicy localstorage refreshHistory
        if(localStorage.getItem("refreshHistory") !== null){
            refreshHistory = (JSON.parse(localStorage.refreshHistory)) || [];
            console.log("Found existing list in local storage: ", history);
        }else{
            //If there is no refreshHistory in local storage, put the empty list there
            setHistory(refreshHistory);
            console.log("Putting empty list in local storage");
        }
    }else{
        alert("Yo browsa so old, she don't support local storage.");
    }
    (function getRoutes(routess){
        xhttpRequest(addRoutes, "http://data.foli.fi/gtfs/v0/20171130-162538/routes");
    })();

    $("#refreshButton").click(function(){
        refresh();
    });

    $("#showBusButton").click(function(){
        show_buses = !show_buses;
        if(show_buses){
            $(this).html("Hide buses");
            refresh();
            showMarkers();
        }else{
            $(this).html("Show buses");
            hideMarkers();
        }
    });

    $("#showRouteButton").click(function(){
        var route_id = $("#busSelector").val();
        displayShape(route_id);
    });

    function storageAvailable(type) {
        try {
            var storage = window[type],
                x = '__storage_test__';
            storage.setItem(x, x);
            storage.removeItem(x);
            return true;
        }
        catch(e) {
            return e instanceof DOMException && (
                // everything except Firefox
                e.code === 22 ||
                // Firefox
                e.code === 1014 ||
                // test name field too, because code might not be present
                // everything except Firefox
                e.name === 'QuotaExceededError' ||
                // Firefox
                e.name === 'NS_ERROR_DOM_QUOTA_REACHED') &&
                // acknowledge QuotaExceededError only if there's something already stored
                storage.length !== 0;
        }
    }
});
