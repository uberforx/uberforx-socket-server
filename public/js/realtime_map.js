
var socket = io();
var map;
var markers = [];

/*TO-DO move to utils/core.js*/

function guid() {
    function s4() { return Math.floor((1 + Math.random()) * 0x10000)
        .toString(16).substring(1);
    }
    return s4() + s4() + '-' + s4() + '-' + s4() + s4();
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
      var user = {
        "userId" : data.userId,
        "lat" : lat,
        "lng" : lng
      };

      socket.emit('user move', user);
    });
  });

  return false;
}

socket.on('users', function(users){
  addMarkers(users);
});

function addMarkers(users){
  clearMarkers();
  for (var i = 0, len = users.length; i < len; i++) {
    var location = new google.maps.LatLng(users[i].lat, users[i].lng);
    var marker = new google.maps.Marker({
      position: location,
      map: map
    });

    var infowindow = new google.maps.InfoWindow({
      content: '<div><strong>'+ users[i].userId +'</strong></div>'
    });

    markers.push(marker);
    infowindow.open(map, marker);
  }
}

function clearMarkers(){
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
