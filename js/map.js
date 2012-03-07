var map;
var polyline;

$(document).ready(function() {
  function mapFunctions() {
    if(Drupal.settings.ymaps_routes.is_admin) {
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

      var mapControls = {
        TYPE_CONTROL: new YMaps.TypeControl(),
        TOOL_BAR: new YMaps.ToolBar(),
        ZOOM: new YMaps.Zoom(),
        MINI_MAP: new YMaps.MiniMap(),
        SCALE_LINE: new YMaps.ScaleLine(),
        SEARCH_CONTROL: new YMaps.SearchControl({noPlacemark: true})
      };
      var blockMapControls = Drupal.settings.ymaps_routes.map_controls;
      for(var i = 0; i < blockMapControls.length; i++)
        map.addControl(mapControls[blockMapControls[i]]);


      $('#node-form').bind('keypress', function(e) {
        if(e.which == 13) e.preventDefault();
      });


      mapFunctions();
    }
  })
});