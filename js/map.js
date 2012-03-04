$(document).ready(function() {
    function mapFunctions() {
        if(Drupal.settings.ymaps_routes.isAdmin) {
            polylineInit();
        }
        else;
    }
    YMaps.jQuery(function () {
        if($("#YMaps_Map").length) {
            map = new YMaps.Map($("#YMaps_Map"));


            map.setCenter(new YMaps.GeoPoint(41.965167, 45.042935), 11);

            map.addControl(new YMaps.TypeControl());
            map.addControl(new YMaps.ToolBar());
            map.addControl(new YMaps.Zoom());
            map.addControl(new YMaps.SearchControl());
            map.addControl(new YMaps.MiniMap());
            map.addControl(new YMaps.ScaleLine());

            mapFunctions();
        }
    })
});