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

  if(typeof Drupal.settings.ymaps_routes.marker_style != 'undefined') {
    var ms = new YMaps.Style();
    ms.iconStyle = new YMaps.IconStyle();
    ms.iconStyle.href = Drupal.settings.basePath + Drupal.settings.ymaps_routes.marker_style.filepath;
    console.log(ms.iconStyle.href);
    ms.iconStyle.size = new YMaps.Point(Drupal.settings.ymaps_routes.marker_style.width, Drupal.settings.ymaps_routes.marker_style.height);
    ms.iconStyle.offset = new YMaps.Point(-(Drupal.settings.ymaps_routes.marker_style.width/2), -Drupal.settings.ymaps_routes.marker_style.height);

    YMaps.Styles.add("ymaps_routes_marker", ms);
  }

  polyline.setStyle("ymaps_routes_polyline");
  polyline.setOptions({hasBalloon: false});

  map.addOverlay(polyline);

  var route = JSON.parse(json_value);
  $.slowEach(route.points, 10, function(i) {
    if(this.type == 1) {
      var stopPoint = new YMaps.Placemark(new YMaps.GeoPoint(this.lng, this.lat));
      stopPoint.name = this.stopPointName;
      stopPoint.setStyle("ymaps_routes_marker");
      map.addOverlay(stopPoint);
    }

    polyline.addPoint(new YMaps.GeoPoint(this.lng, this.lat));
    if(route.points.length == i+1)
    map.setBounds(new YMaps.GeoCollectionBounds(polyline.getPoints()));
  });
}