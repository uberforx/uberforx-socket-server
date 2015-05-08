
var socket = io();
var map;
var markers = [];
var STROKE_WEIGHT = 2
/*TO-DO move to utils/core.js*/

function guid() {
    function s4() { return Math.floor((1 + Math.random()) * 0x10000)
        .toString(16).substring(1);
    }
    return s4() + s4() + '-' + s4() + '-' + s4() + s4();
}

function getRandomColor() {
  return '#'+(0x1000000+(Math.random())*0xffffff).toString(16).substr(1,6);
}

/* Move to utils/core.js */


//Initialize tracker
function initTracker(){

  var data = {
    userId : guid()
  };


  navigator.geolocation.getCurrentPosition(function(position){
    var lat = position.coords.latitude
    var lng = position.coords.longitude

    initialize(new google.maps.LatLng(lat, lng));

    var new_user = {
      "userId" : data.userId,
      "lat" : lat,
      "lng" : lng
    };

    socket.emit('new user', new_user);

    var watchID = navigator.geolocation.watchPosition(function(position) {
      var lat = position.coords.latitude
      var lng = position.coords.longitude
      var p = {
          timestamp: position.timestamp,
          longitude: position.coords.longitude,
          latitude:  position.coords.latitude
        };
      var user = {
        "userId" : data.userId,
        "lat" : lat,
        "lng" : lng,
        stroke: {color: getRandomColor(), weight: STROKE_WEIGHT},
         path :[]
      };
      user.path.push(p);

      socket.emit('user move', user);
    });
  });

  return false;
}

socket.on('users', function(user){
  addMarker(user);
});
socket.on('user moved', function(user){
  drawPath(user);
});


function addMarker(user){
  // clearMarkers();

    var location = new google.maps.LatLng(user.lat, user.lng);
    var marker = new google.maps.Marker({
      position: location,
      map: map
    });

    var infowindow = new google.maps.InfoWindow({
      content: '<div><strong>'+ user.userId +'</strong></div>'
    });

    infowindow.open(map, marker);
}
function drawPath(user){

   var oldLocation = new google.maps.LatLng(user.lat, user.lng);

   clearMarker(user);
   //Get updated location of user
   navigator.geolocation.getCurrentPosition(function(position){
     var lat = position.coords.latitude
     var lng = position.coords.longitude
     user.lat = lat,
     user.lng = lng;
   });

    var newLocation = new google.maps.LatLng(user.lat, user.lng);

    socket.emit('user update', user);
    var marker = new google.maps.Marker({
       position: newLocation,
       map: map
     });
    var flightPlanCoordinates = [
      new google.maps.LatLng(37.772323, -122.214897),
      new google.maps.LatLng(21.291982, -157.821856),
      new google.maps.LatLng(-18.142599, 178.431),
      new google.maps.LatLng(-27.46758, 153.027892)
    ];
var pathLine = new google.maps.Polyline({
        path: flightPlanCoordinates,
        geodesic: true,
        strokeColor: '#FF0000',
        strokeOpacity: 1.0,
        strokeWeight: 2
      });

    var infowindow = new google.maps.InfoWindow({
      content: '<div><strong>'+ user.userId +'</strong></div>'
    });
    pathLine.setMap(map);
    infowindow.open(map, marker);
}
function clearMarkers(){
  for (var i = 0; i < markers.length; i++) {
    markers[i].setMap(null);
    markers = [];
  }
}

function clearMarker(user){
  for (var i = 0; i < markers.length; i++) {
    markers[i].setMap(null);
    markers = [];
  }
}


function initialize(coords) {
  var mapOptions = {
    zoom: 19,
    center: coords ,
    mapTypeId: google.maps.MapTypeId.TERRAIN
  };

  map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);
}