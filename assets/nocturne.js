var NocturneMarker = L.Marker.extend({
  options: {
    image_url: "",
    like_count: 0,
    link: "",
    name: "",
    recent_posts: []
  }
});

$(function() {
  var map = L.map("map");
  var detailsTmpl = doT.template($("#details").html());
  var markers = [];
  var latitudes = [];
  var longitudes = [];

  L.Icon.Default.imagePath = "images";
  L.tileLayer(
    'https://{s}.tiles.mapbox.com/v3/foodmaap.l0153oc9/{z}/{x}/{y}.png', {
    attribution: '<a href="http://www.mapbox.com/about/maps/" ' +
                 'target="_blank">Terms &amp; Feedback</a>'
  }).addTo(map);
  render();

  $("#city-selector option").filter(function() {
    return $(this).val() === $("#map").data("city");
  }).prop('selected', true);

  $('#city-selector').on("change", function() {
    $("#map").data("city", $(this).val());
    render();
  });

  $(document).on("click", function(e) {
    var $el = $(e.target);

    if ($el.closest("#details-wrapper").length < 1) {
      $("#details-wrapper").fadeOut(200);
    }
  });

  map.on("moveend", showOutOfBoundsTips);

  function render() {
    var city = $("#map").data("city");
    var lat = COORDS[city].latitude;
    var lng = COORDS[city].longitude;

    // Clear old markers
    latitudes = [];
    longitudes = [];
    for (var i = 0; i < markers.length; i++) {
      map.removeLayer(markers[i]);
    }
    // Set new city view
    map.setView([lat, lng], DEFAULT_ZOOM);
    // Get new markers
    getLocations(city);
  }

  function getLocations(city) {
    markers = [];
    $.ajax({
      url: "api/v1/locations",
      data: 'city=' + city,
      success: function(response) {
        for (var i = 0; i < response.data.length; i++) {
          var locationInfo = response.data[i];

          var pin = new NocturneMarker(
              [locationInfo.latitude, locationInfo.longitude], {
            author: locationInfo.author,
            caption: locationInfo.caption,
            image_url: locationInfo.image_url,
            like_count: locationInfo.like_count,
            link: locationInfo.link,
            name: locationInfo.name,
            recent_posts: locationInfo.recent_posts
          });

          markers.push(pin);
          map.addLayer(pin);
          latitudes.push(locationInfo.latitude);
          longitudes.push(locationInfo.longitude);
          pin.on("click", showLocationDetails);
        }

        showOutOfBoundsTips();
      }
    });
  }

  function showLocationDetails(e) {
    var data = e.target.options;

    $("#details-wrapper").html(detailsTmpl(data)).fadeIn();
  }

  function outOfBoundsCount(bounds) {
    var count = { north: 0, east: 0, south: 0, west: 0 };
    var northBound = bounds.getNorth();
    var eastBound = bounds.getEast();
    var southBound = bounds.getSouth();
    var westBound = bounds.getWest();

    for (var i = 0; i < latitudes.length; i++) {
      if (northBound < latitudes[i]) {
        count.north++;
      }
      if (southBound > latitudes[i]) {
        count.south++;
      }
    }

    for (var j = 0; j < longitudes.length; j++) {
      if (eastBound < longitudes[j]) {
        count.east++;
      }
      if (westBound > longitudes[j]) {
        count.west++;
      }
    }

    return count;
  }

  function showOutOfBoundsTips() {
    var bounds = map.getBounds();
    var count = outOfBoundsCount(bounds);

    if (count.north) {
      $("#tip-north .tip-count").html(count.north);
      $("#tip-north").fadeIn();
    } else {
      $("#tip-north").fadeOut();
    }

    if (count.east) {
      $("#tip-east .tip-count").html(count.east);
      $("#tip-east").fadeIn();
    } else {
      $("#tip-east").fadeOut();
    }

    if (count.south) {
      $("#tip-south .tip-count").html(count.south);
      $("#tip-south").fadeIn();
    } else {
      $("#tip-south").fadeOut();
    }

    if (count.west) {
      $("#tip-west .tip-count").html(count.west);
      $("#tip-west").fadeIn();
    } else {
      $("#tip-west").fadeOut();
    }
  }
});
