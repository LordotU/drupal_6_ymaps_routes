/*
 * Draw concrete route
 *
 * @param {string} String value of route JSON object
 */
function drawRoute(json_value) {
  //Init polyline style
  var polylineStyle = {
    strokeColor: Drupal.settings.ymaps_routes.line_color,
    strokeWidth: Drupal.settings.ymaps_routes.line_width
  };

  //Init checkpoint marker style
  if(typeof Drupal.settings.ymaps_routes.marker_style != 'undefined') {
    var markerStyle = {
      iconImageHref: Drupal.settings.basePath + Drupal.settings.ymaps_routes.marker_style.filepath,
      iconImageSize: [Drupal.settings.ymaps_routes.marker_style.width, Drupal.settings.ymaps_routes.marker_style.height],
      iconImageOffset: [-(Drupal.settings.ymaps_routes.marker_style.width/2), -Drupal.settings.ymaps_routes.marker_style.height]
    };
  }

  //Init and adding polyline to map
  polyline = new ymaps.Polyline([], {}, polylineStyle, {hasBalloon: false, hasHint: false});
  map.geoObjects.add(polyline);

  var route = JSON.parse(json_value); //Parse @param string to JSON

  //Iterate through JSON object and draw route and checkpoints
  $.slowEach(route.points, 10, function(i) {
    
    if(this.type == 1) {
      var stopPoint = new ymaps.Placemark([this.lat, this.lng], {
        balloonContent: this.stopPointName
      }, markerStyle);
      map.geoObjects.add(stopPoint);  
    }

    //Push point to polyline
    polyline.geometry.insert(i, [this.lat, this.lng]);
    
    //If route drawing are ended, set new bounds for map
    if(route.points.length == i+1)
      map.setBounds(polyline.geometry.getBounds());
  });
}