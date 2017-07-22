var map;

function initMap() {
  map = new google.maps.Map(document.getElementById('map'), {
    center: {lat: 36.802172, lng: 28.099165},
    zoom: 8
  });



// marker image
var image = 'https://developers.google.com/maps/documentation/javascript/examples/full/images/beachflag.png';


var bounds = new google.maps.LatLngBounds();


// MARKERS
//var markers = [];

// Make markers

/*
  // Marker 1
  var marker = new google.maps.Marker({
    position: locations[0].position,
    map: map,
    //map: null, // hides marker
    title: 'First Marker',
    icon: image
  });

*/

  // infowindow
  var infowindow = new google.maps.InfoWindow({
    content: "(" + JSON.stringify(marker.position) + ", " + JSON.stringify(marker.position) + ")"
  });


  // Click event
  marker.addListener('click', function() {
    infowindow.open(map, marker);
  });


}
