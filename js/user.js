/*
 *Отрисовываем выбранный маршрут вместе с остановками
 */
function drawRoute(json_value) {
  polyline = new YMaps.Polyline();

  var ps = new YMaps.Style();
  ps.lineStyle = new YMaps.LineStyle();
  ps.lineStyle.strokeColor = Drupal.settings.ymaps_routes.line_color;
  ps.lineStyle.strokeWidth = Drupal.settings.ymaps_routes.line_width;

  YMaps.Styles.add("ymaps_routes_polyline", ps);

  polyline.setStyle("ymaps_routes_polyline");
  polyline.setOptions({hasBalloon: false});

  map.addOverlay(polyline);

  var route = JSON.parse(json_value);
  $.slowEach(route.points, 10, function(i) {
    if(this.type == 1) {
      var stopPoint = new YMaps.Placemark(new YMaps.GeoPoint(this.lng, this.lat));
      stopPoint.name = this.stopPointName;
      map.addOverlay(stopPoint);
    }

    polyline.addPoint(new YMaps.GeoPoint(this.lng, this.lat));
    if(route.points.length == i+1)
    map.setBounds(new YMaps.GeoCollectionBounds(polyline.getPoints()));
  });
}