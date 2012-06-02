/**
 * Map object global variable
 */
var map;
/**
 * Polyline object global variable
 */
var polyline;

$(document).ready(function() {
  /**
   * Call map functions that depends from Drupal.settings.ymaps_routes.is_admin
   */
  function mapFunctions() {
    if(Drupal.settings.ymaps_routes.is_admin) {
      polylineInit();
    }
    else {
      drawRoute(Drupal.settings.ymaps_routes.json_value);
    }
  }
  
  ymaps.ready(function () {
    if($("#YMaps_Map").length) {
      
      map = new ymaps.Map("YMaps_Map", {
        center: [41.965167, 45.042935],
        zoom: 1,
      });

     
      //Set map controls
      var mapControls = {
        TYPE_CONTROL: "typeSelector",
        TOOL_BAR: "mapTools",
        ZOOM: "zoomControl",
        MINI_MAP: "miniMap",
        SCALE_LINE: "scaleLine",
        SEARCH_CONTROL: "searchControl"
      };
      var blockMapControls = Drupal.settings.ymaps_routes.map_controls;
      for(var i = 0; i < blockMapControls.length; i++)
        map.controls.add(mapControls[blockMapControls[i]]);

      //@todo Разобраться, почему исчезает маршрут при нажатии Enter в области формы редактирования ноды
      $('#node-form').bind('keypress', function(e) {
        if(e.which == 13) e.preventDefault();
      });

      //Call map functions
      mapFunctions();
    }
  })
});