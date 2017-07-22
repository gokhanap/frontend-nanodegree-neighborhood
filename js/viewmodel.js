function ViewModel() {

    var self = this;

    // Sidebar visibility change function
    this.changeStatus = function() {
        if (this.menuActive()) {
            this.menuActive(false);
        } else {
            this.menuActive(true);
        }
    };

    // Sidebar display status
    this.menuActive = ko.observable(true);

    // infowindow for marker
    this.infowindow = new google.maps.InfoWindow();
    //this.infowindow.contentStr = "";
    //this.infowindow.InfoWindowOptions = 300;


    this.defaultIcon = makeMarkerIcon('3cd1fa');

    // Location constructor
    var Location = function(data) {
        var that = this;
        this.title = data.title;
        this.position = data.position;
        this.venueId = data.venueId;
        this.visible = true;
        this.photoStr = ""; // this will store photos html code at infowindows

        // Marker for location
        this.marker = new google.maps.Marker({
            map: map,
            position: that.position,
            title: that.title,
            animation: google.maps.Animation.DROP,
            icon: self.defaultIcon,
            id: data
        });

        // Click listener for marker
        this.marker.addListener('click', function() {
            self.openInfoWindow(that);
        });

        // get location photos from foursquare API
        // and store them as html code in photoStr
        this.fourSquareURL = "https://api.foursquare.com/v2/venues/" + this.venueId + "/photos?v=20131016&limit=5&client_id=GG1H33NFRKGI0IKDMQFHICPGUIVSBI2FEPG2H0ZFBMY01WVI&client_secret=BUKJMECCSW3R1Y4GOP4ZGW0YXK4MZNRPF53ZBUMFDLRX3J30";

        $.getJSON(that.fourSquareURL, function(data) {

            // photosArr will hold photo json data array temporarily
            var photosArr = data.response.photos.items;

            // this will get each photo information, convert them to html
            // code and store them in photoStr for use in infowindow
            for (var i = 0; i < photosArr.length; i++) {
                var photo = photosArr[i];
                var imgUrl = photo.prefix + "200x200" + photo.suffix;

                that.photoStr = that.photoStr + '<img src="' + imgUrl + '"><br/>';
            };

            // Title of the location and coordinates will be added after adding all photos.
            that.photoStr = '<div class="infowindow-title">' + that.title + '</div>' + that.photoStr;

            // Final wrap div to for sizing infowindow.
            that.photoStr = '<div class="infoWindowsSizer">' + that.photoStr + '</div>';

        }).fail(function() {
            that.photoStr = '<div>Failed to load images.</div>';
        });
    }

    // LocationList knockout array
    this.locationList = ko.observableArray([]);

    // get location data from model
    // then construct locationList using Location class
    locationsData.forEach(function(place) {
        self.locationList.push(new Location(place));
    });

    // holds clicked location information
    this.currentLocation = ko.observable();

    // filter word container
    this.filter = ko.observable("");

    // filter location function
    this.filteredLocationList = ko.computed(function() {
        var filter = self.filter().toLowerCase();

        if (!filter) {
        for (var j = 0; j < self.locationList().length; j++) {
            self.locationList()[j].marker.setMap(map);
        }
            return self.locationList()
        } else {
            return ko.utils.arrayFilter(self.locationList(), function(item) {
                if (item.title.toLowerCase().indexOf(filter) === 0) {
                    item.marker.setMap(map);
                    return item;
                } else {
                    //item.marker.setVisible(false);
                    item.marker.setMap(null);
                    console.log("some markers filtered");
                }
            });
        }
    });

/*
    // visibility changer experiment
    this.isVisible = ko.observable(false);
    this.changeVisibility = function() {
        if (self.isVisible()) {
            self.isVisible(false);
        } else {
            self.isVisible(true);
        }
    };
*/

    // clear function for filter input box
    this.clearFilter = function() {
        self.filter("");
    };

    // sets current location to clicked location
    this.setLocation = function(clickedLocation) {
        self.currentLocation(clickedLocation);
    };

    // opens info window and sets content related with clicked location
    this.openInfoWindow = function(location) {
        if (self.infowindow.marker != location.marker) {
            self.infowindow.marker = location.marker;

            // center map to current location position (disabled)
            //map.setCenter(location.position);

            // get photos html code from photoStr
            self.infowindow.setContent(location.photoStr);

            self.infowindow.open(map, location.marker);

            // close sidebar whenever clicked on any location
            self.menuActive(false);

            // Make sure the marker property is cleared if the infowindow is closed.
            self.infowindow.addListener('closeclick', function() {
                self.infowindow.marker = null;
                self.setLocation(null);
            });
        }

        // Animates marker when clicked
        if (location.marker.getAnimation() !== null) {
          location.marker.setAnimation(null);
        } else {
          location.marker.setAnimation(google.maps.Animation.DROP);
        }

        // run setLocation function to update current location.
        self.setLocation(location);
    };

    // This function will loop through the markers array and display them all.
    this.showCamps = function() {
        var bounds = new google.maps.LatLngBounds();
        // Extend the boundaries of the map for each marker and display the marker
        for (var i = 0; i < self.locationList().length; i++) {
            self.locationList()[i].marker.setMap(map);
            bounds.extend(self.locationList()[i].marker.position);
        }
        map.fitBounds(bounds);
        self.filter("");
    };

    // This function will loop through the camps and hide them all.
    this.hideCamps = function() {
        //self.infowindow.setContent('');
        self.infowindow.marker = null;
        self.infowindow.close(map, location.marker);
        for (var i = 0; i < self.locationList().length; i++) {
            self.locationList()[i].marker.setMap(null);
            self.setLocation(null);
            self.filter(" ");
        }
    }

    // Function source: Udacity Project_Code_5_BeingStylish.html
    // This function takes in a COLOR, and then creates a new marker
    // icon of that color. The icon will be 21 px wide by 34 high, have an origin
    // of 0, 0 and be anchored at 10, 34).
    function makeMarkerIcon(markerColor) {
        var markerImage = new google.maps.MarkerImage(
          'http://chart.googleapis.com/chart?chst=d_map_spin&chld=1.15|0|'+ markerColor +
          '|40|_|%E2%80%A2',
            new google.maps.Size(21, 34),
            new google.maps.Point(0, 0),
            new google.maps.Point(10, 34),
            new google.maps.Size(21,34));
        return markerImage;
        }
    }

var map;
var vm;

function initMap() {
    map = new google.maps.Map(document.getElementById('map'), {
            center: {lat: 36.802172, lng: 28.099165},
            zoom: 8,
    });
    vm = new ViewModel();
    ko.applyBindings(vm);
}

function initMapError() {
  alert('Failed to initialize Map');
  console.log('Failed to initialize Map');
}