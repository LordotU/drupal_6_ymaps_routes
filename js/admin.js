/**
 * Global array of route points
 */
var pointsGlobalArray = new Array();
/**
 * Global map click listener object
 */
var mapClickListener;

/**
 * Adding point to textarea value
 */
function addPointsToValue() {
  var pointsStringArray = new Array();

  for(i in pointsGlobalArray)
    pointsStringArray.push('{"lat":' + pointsGlobalArray[i].lat + ', "lng":' + pointsGlobalArray[i].lng + ', "type":"' + pointsGlobalArray[i].type + '"' + ((typeof pointsGlobalArray[i].stopPointName != 'undefined') ? ', "stopPointName":"' + pointsGlobalArray[i].stopPointName.replace(/"/g, '\\"') + '"' : '') +'}');

  $('textarea[name="polyline"]').val('{"points":[' + pointsStringArray.join(',') + ']}');
}

/**
 * Draw concrete route
 *
 * @param {object} route JSON object of route
 */
function addPointsToMap(route) {
  $.slowEach(route.points, 10, function(i) {
    polyline.addPoint(new YMaps.GeoPoint($(this)[0].lng, $(this)[0].lat));

    if($(this)[0].type == 1) {
      var stopPoint = new YMaps.Placemark(new YMaps.GeoPoint($(this)[0].lng, $(this)[0].lat));
      stopPoint.name = $(this)[0].stopPointName;

      $(this)[0].placemark = stopPoint;
      $(this)[0].placemark.name = stopPoint.name;

      map.addOverlay(stopPoint);
    }

    pointsGlobalArray.push($(this)[0]);

    if(route.points.length == i+1) {
      polyline.startEditing();
      $('#edit-waiting').hide();
      map.setBounds(new YMaps.GeoCollectionBounds(polyline.getPoints()));
    }
  });

  addPointsToValue();
}

/**
 * Adding and deleting points to/from map and global array
 *
 * @param {object} polyline
 * @param {number} index of point
 */
function addDeletePoints(polyline, index) {
  var points = polyline.getPoints();
  var pointToAction = new Object();

  if(points.length == pointsGlobalArray.length && typeof index != 'undefined') { //Change position of existing point
    pointsGlobalArray[index].lat = polyline.getPoint(index).__lat;
    pointsGlobalArray[index].lng = polyline.getPoint(index).__lng;
    if(pointsGlobalArray[index].type == 1)
      pointsGlobalArray[index].placemark.setGeoPoint(new YMaps.GeoPoint(polyline.getPoint(index).__lng, polyline.getPoint(index).__lat));
  }
  else if(points.length > pointsGlobalArray.length && typeof index != 'undefined') { //Set new point
    pointToAction.lat = polyline.getPoint(index).__lat;
    pointToAction.lng = polyline.getPoint(index).__lng;
    pointToAction.type = $('input[name="point-type"]:checked').val();

    if($('input[name="point-type"]:checked').val() == 1) {
      var stopPointName = prompt('Введите название остановки:');
      if(stopPointName == '' || !stopPointName) {
        polyline.removePoint(index);
        return;
      }
      pointToAction.stopPointName = stopPointName;

      pointToAction.placemark = new YMaps.Placemark(new YMaps.GeoPoint(polyline.getPoint(index).__lng, polyline.getPoint(index).__lat));
      pointToAction.placemark.name = stopPointName;
      map.addOverlay(pointToAction.placemark);
    }

    pointsGlobalArray.splice(index, 0, pointToAction);
  }
  else if(points.length < pointsGlobalArray.length && typeof index == 'undefined') { //Delete point
    var endPointFlag = true;
    for(var i = 0; i < points.length; i++)
      if(pointsGlobalArray[i].lat != points[i].__lat && pointsGlobalArray[i].lng != points[i].__lng) {
        if(pointsGlobalArray[i].type == 1)
          map.removeOverlay(pointsGlobalArray[i].placemark);
        pointsGlobalArray.splice(i, 1);
        endPointFlag = false;
        break;
      }
    if(endPointFlag) {
      if(pointsGlobalArray[0].type == 1)
        map.removeOverlay(pointsGlobalArray[i].placemark);

      pointsGlobalArray.splice(-1,1);
    }
  }

  addPointsToValue();
}

/**
 * Service functions
 */
function polylineServices() {
  if($('#edit-polyline').val() && $('#edit-polyline').val() != "0") {
    $('#edit-waiting').show();
    addPointsToMap(JSON.parse($('#edit-polyline').val()))
  }
  else {
    $('#edit-waiting').hide();
    polyline.startEditing();
  }

  $('#edit-clear-map').click(function(e) {
    polylineDelete();
    e.preventDefault();
  });
}

/**
 * Init polyline
 */
function polylineInit() {
  polyline = new YMaps.Polyline();
  map.addOverlay(polyline);

  var tempIndex;
  // Set polyline onPointDragging event handler
  polyline.setEditingOptions({
    onPointDragging: function(points, index, actionMarker) {
      if(actionMarker)
        tempIndex = index;

      return points[index];
    },
    onPointDrawing: function(points, index, actionMarker) {
      if(actionMarker)
        tempIndex = index;

      return points[index];
    }
  });


  // Set map Click event handler
  mapClickListener = YMaps.Events.observe(map, map.Events.Click, function (map, mEvent) {
    var pointObject = new Object();
    var pointCoords = mEvent.getGeoPoint();

    pointObject.lat = pointCoords.__lat;
    pointObject.lng = pointCoords.__lng;
    pointObject.type = $('input[name="point-type"]:checked').val();

    if($('input[name="point-type"]:checked').val() == 1) {
      var stopPointName = prompt('Введите название остановки:');

      if(stopPointName == '' || !stopPointName) return;

      pointObject.stopPointName = stopPointName;

      pointObject.placemark = new YMaps.Placemark(pointCoords);
      pointObject.placemark.name = stopPointName;

      map.addOverlay(pointObject.placemark);
    }

    pointsGlobalArray.push(pointObject);

    polyline.addPoint(pointCoords);
  });

  // Set polyline PositionChange event handler
  YMaps.Events.observe(polyline, polyline.Events.PositionChange, function () {
    addDeletePoints(polyline, tempIndex);

    tempIndex = undefined;
  });

  polylineServices();
}

/**
 * Delete polyline and markers from map, global array and textarea
 */
function polylineDelete() {
  map.removeAllOverlays();
  mapClickListener.cleanup();
  pointsGlobalArray = new Array();
  $('textarea[name="polyline"]').val('');

  polylineInit();
}