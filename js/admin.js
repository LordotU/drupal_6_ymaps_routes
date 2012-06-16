/**
 * Global array of route points
 */
var pointsGlobalArray = new Array();
/**
 * Global prompt cancel flag variable
 */
var cancelFlag;


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
    polyline.geometry.insert(i, [this.lat, this.lng]);

    if(this.type == 1) {
      var stopPoint = new ymaps.Placemark([this.lat, this.lng], {
        balloonContent: this.stopPointName
      });
      map.geoObjects.add(stopPoint);

      this.placemark = stopPoint;
      this.placemark.name = this.stopPointName;

      map.geoObjects.add(stopPoint);
    }

    pointsGlobalArray.push(this);

    if(route.points.length == i+1) {
      polyline.editor.startEditing();
      $('#edit-waiting').hide();
      map.setBounds(polyline.geometry.getBounds());
    }
  });

  addPointsToValue();
}


/**
 * Add polyline point
 *
 * @param {array} array of new point's coordinates
 * @param {number} index of new point
 */
function addPoint(coords, index) {
  var pointToAction = new Object();

  pointToAction.lat = coords[0];
  pointToAction.lng = coords[1];
  pointToAction.type = $('input[name="point-type"]:checked').val();

  if(pointToAction.type == 1) {
    var stopPointName = prompt('Введите название остановки:');

    if(stopPointName == '' || !stopPointName) {
      cancelFlag = true;
      polyline.geometry.remove(index);

      return;
    }
    pointToAction.stopPointName = stopPointName;

    pointToAction.placemark = new ymaps.Placemark(coords, {
        balloonContent: stopPointName
      });
    map.geoObjects.add(pointToAction.placemark);
  }

  pointsGlobalArray.splice(index, 0, pointToAction);

  addPointsToValue();
}
/**
 * Remove polyline point
 *
 * @param {number} index of point
 */
function removePoint(index) {
  if(cancelFlag) {
    cancelFlag = false;
    
    return;
  }

  if(pointsGlobalArray[index].type == 1)
    map.geoObjects.remove(pointsGlobalArray[index].placemark);

  pointsGlobalArray.splice(index, 1);

  addPointsToValue();
}
/**
 * Move polyline point
 *
 * @param {coords} array of point's new coordinates
 * @param {number} index of point
 */
function movePoint(coords, index) {
  pointsGlobalArray[index].lat = coords[0];
  pointsGlobalArray[index].lng = coords[1];
  
  if(pointsGlobalArray[index].type == 1)
    pointsGlobalArray[index].placemark.geometry.setCoordinates(coords);

  addPointsToValue();
}


/**
 * click event handler for map
 *
 * @param e click event
 */
function mapClickEventHandler(e) {
  polyline.geometry.insert(pointsGlobalArray.length, e.get('coordPosition'));
}
/**
 * Compare old and new polyline coordinates
 *
 * @param oldCoordinates
 * @param newCoordinates
 */
function coordinatesCompare(oldCoordinates, newCoordinates) {
  var oldLength = oldCoordinates.length,
      newLength =  newCoordinates.length;
  var result = new Object();

  if(oldLength < newLength) {
    for(var i = 0; i < newLength; i++) {
      if(typeof oldCoordinates[i] == 'undefined' || (newCoordinates[i][0] != oldCoordinates[i][0] && newCoordinates[i][1] != oldCoordinates[i][1])) {
        result.type = 'addPoint';
        result.coords = newCoordinates[i];
        result.index = i;

        return result;
      }
    }
  }
  else if(oldLength > newLength) {
    for(var i = 0; i < oldLength; i++) {
      if(typeof newCoordinates[i] == 'undefined' || (oldCoordinates[i][0] != newCoordinates[i][0] && oldCoordinates[i][1] != newCoordinates[i][1])) {
        result.type = 'removePoint';
        result.index = i;

        return result;
      }
    }
  }
  else if(oldLength == newLength) {
    for(var i = 0; i < oldLength; i++) {
      if(newCoordinates[i][0] != oldCoordinates[i][0] || newCoordinates[i][1] != oldCoordinates[i][1]) {
        result.type = 'movePoint';
        result.coords = newCoordinates[i];
        result.index = i;

        return result;
      }
    }
  }
}
/**
 * geometrychange event handler for polyline
 *
 * @param e geometrychange event
 */
function polylineGeometrychangeEventHandler(e) {
  var event = e.get('originalEvent');
  var oldCoordinates = event.get('oldCoordinates'),
      newCoordinates = event.get('newCoordinates');
  var compareResult = coordinatesCompare(oldCoordinates, newCoordinates);

  switch(compareResult.type) {
    case 'addPoint':
      addPoint(compareResult.coords, compareResult.index);break;
    case 'removePoint':
      removePoint(compareResult.index);break;
    case 'movePoint':
      movePoint(compareResult.coords, compareResult.index);break;
  };
}


/**
 * Service functions: addPointsToMap(), startEditing(), clearMap()
 */
function polylineServices() {
  if($('#edit-polyline').val() && $('#edit-polyline').val() != "0") {
    $('#edit-waiting').show();
    addPointsToMap(JSON.parse($('#edit-polyline').val()))
  }
  else {
    $('#edit-waiting').hide();
    polyline.editor.startEditing();
  }

  $('#edit-clear-map').unbind().click(function(e) {
    clearMap();
    e.preventDefault();
  });
}
/**
 * Init polyline
 */
function polylineInit() {
  polyline = new ymaps.Polyline([], {}, {}, {hasBalloon: false, hasHint: false});
  map.geoObjects.add(polyline);

  // Set map Click event handler
  map.events.add('click', mapClickEventHandler);

  // Set polyline PositionChange event handler
  polyline.events.add('geometrychange', polylineGeometrychangeEventHandler);

  polylineServices();
}
/**
 * Delete polyline and markers from map, global array and textarea
 */
function clearMap() {
  if(confirm("Вы действительно хотите очистить карту?")) {
    map.geoObjects.remove(polyline);

    $.each(pointsGlobalArray, function(i){
      if(this.type == 1) {
        map.geoObjects.remove(this.placemark);
      }
    });
    
    pointsGlobalArray = new Array();
    $('textarea[name="polyline"]').val('');

    map.events.remove('click', mapClickEventHandler);
    polyline.events.remove('geometrychange', polylineGeometrychangeEventHandler);

    polylineInit();
  }
}