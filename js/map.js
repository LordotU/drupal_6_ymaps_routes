var map;
var polyline;

$(document).ready(function() {
  function mapFunctions() {
    if(Drupal.settings.ymaps_routes.isAdmin) {
      polylineInit();
    }
    else {
      drawRoute(Drupal.settings.ymaps_routes.json_value);
    }
  }
  YMaps.jQuery(function () {
    if($("#YMaps_Map").length) {
      map = new YMaps.Map($("#YMaps_Map"));

      map.setCenter(new YMaps.GeoPoint(41.965167, 45.042935), 1);

      map.addControl(new YMaps.TypeControl());
      map.addControl(new YMaps.ToolBar());
      map.addControl(new YMaps.Zoom());
      map.addControl(new YMaps.SearchControl({noPlacemark: true}));
      map.addControl(new YMaps.MiniMap());
      map.addControl(new YMaps.ScaleLine());


      $('#node-form').bind('keypress', function(e) {
        if(e.which == 13) e.preventDefault();
      });


      mapFunctions();
    }
  })
});