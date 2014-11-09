$(function() {
  /*
   * Initialization
   */
  var TORONTO = [43.6500, -79.3900];
  var map = L.map('map').setView(TORONTO, 14);
  var detailsTmpl = doT.template($('#location-details').html());

  // The images are just a copy of the ones in bower_components
  // because Flask + Bower is lolz
  L.Icon.Default.imagePath = 'static/images';

  L.tileLayer(
    'https://{s}.tiles.mapbox.com/v3/foodmaap.jpid9gik/{z}/{x}/{y}.png', {
    attribution: '<a href="http://www.mapbox.com/about/maps/" ' +
                 'target="_blank">Terms &amp; Feedback</a>'
  }).addTo(map);

  /*
   * Main API call
   */
  $.ajax({
    url: 'api/v1/locations',
    success: function(response) {
      for (var i = 0; i < response.data.length; i++) {
        var place = response.data[i];
        var pin = L.marker([place.latitude, place.longitude]).addTo(map);
        pin
          .bindPopup(detailsTmpl({
            image_url: place.image_url,
            name: place.name,
            like_count: place.like_count
          }));
      }
    }
  });

  /*
   * Helpers
   */
});
