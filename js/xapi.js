$(document).ready(function() {
  // Set up some basics
  var config = {};

  var baseurl;
  
  // 'search by area' enables drawing new bbox
  var drawbox = false;
  
  // Set up the map
  map = new OpenLayers.Map('bboxmap', 
                           {projection: "EPSG:900913",});  
  // We'll use these projections in our functions later
  var goog =  new OpenLayers.Projection("EPSG:900913");
  var latlon = new OpenLayers.Projection("EPSG:4326");

  // bbox class
  bbox_coord = function(ntype,nvalue) {
    var value; // start coord
    var type;  // lat or lon
    this.settype = function(newtype) {
      if((newtype=='lat')||(newtype=='lon')) {
        this.type = newtype;
        return 1;
      } else {
        return 0;
      }
    };
    this.gettype = function() {
      return this.type;
    };
    this.set = function(newvalue) {
      newvalue = parseFloat(newvalue);
      if(isNaN(newvalue)) {
        return 0;
      } else {
        newvalue = this.outofboundscheck(newvalue);
        this.value = newvalue.toFixed(5);
        return 1;
      }
    };
    this.get = function() {
      return this.value;
    };
    this.outofboundscheck = function(coord) {
      var bounds_min = 0;
      var bounds_max = 0;
      if (this.type == "lat") {
        bounds_min = -90;
        bounds_max = 90;
      }
      if (this.type == "lon") {
        bounds_min = -180;
        bounds_max = 180;
      }
      if ((bounds_min==0)&&(bounds_max==0)) { return null; }
      if (coord < bounds_min) { coord = bounds_min; }
      if (coord > bounds_max) { coord = bounds_max; }
      return coord;
    };
    // set initial values
    this.settype(ntype || 'lat');
    this.set(nvalue || 0);
  };

  bbox_set = function(cleft,cbottom,cright,ctop) {
    this.left = new bbox_coord('lon',cleft || -180);
    this.bottom = new bbox_coord('lat',cbottom || -90);
    this.right = new bbox_coord('lon',cright || 180);
    this.top = new bbox_coord('lat',ctop || 90);
    this.check = function() {
      var updateNeeded = false;
      var temp;
      if(parseFloat(this.left.get()) > parseFloat(this.right.get())) {
        temp = this.left.get();
        this.left.set(this.right.get());
        this.right.set(temp);
        updateNeeded = true;
      };
      if(parseFloat(this.bottom.get()) > parseFloat(this.top.get())) {
        temp = this.bottom.get();
        this.bottom.set(this.top.get());
        this.top.set(temp);
        updateNeeded = true;
      };
      return updateNeeded;
    };
  };

  var bbox = new bbox_set(-180,-90,180,90);

  var bboxVectors = new OpenLayers.Layer.Vector("Bounding Box", {});
  map.addLayer(bboxVectors);

  bboxControl = OpenLayers.Class(OpenLayers.Control, {
    handleRightClicks: false, // should be true if you use CTRL key
    autoActivate: true,
    draw: function() {
        this.box = new OpenLayers.Handler.Box( this,
            {"done": this.notice},
            {keyMask: this.keyMask});
        this.box.boxDivClassName = "olBBOXselect";
        if (this.handleRightClicks) {
          this.map.viewPortDiv.oncontextmenu = OpenLayers.Function.False;
        }
        if (this.autoActivate) {
          this.box.activate();
        }
    },
    notice: function(bounds) {
      if (drawbox) {
        var ll = map.getLonLatFromPixel(new OpenLayers.Pixel(bounds.left, bounds.bottom)); 
        var ur = map.getLonLatFromPixel(new OpenLayers.Pixel(bounds.right, bounds.top)); 
        var llLat = ll.transform(map.getProjectionObject(), latlon);
        var urLat = ur.transform(map.getProjectionObject(), latlon);
        bbox.left.set(llLat.lon);
        bbox.bottom.set(llLat.lat);
        bbox.right.set(urLat.lon);
        bbox.top.set(urLat.lat);
        update_inputfields();
        update_bbox();
        update_results();
      }
    },
    deactivate: function() {
      this.box.deactivate();
    },
    activate: function() {
      this.box.activate();
    }
  });
  
  var bboxKeyControl = new bboxControl({handleRightClicks:true, keyMask: OpenLayers.Handler.MOD_CTRL});
  map.addControl(bboxKeyControl);

  var bboxToggleControl = new bboxControl();
  map.addControl(bboxToggleControl);
  bboxToggleControl.deactivate();

  // Function to return proper tag search string
  var tagsearch = function() {
    if($("#searchbytag").is(':checked')) {
      t = $('#element').val() + '[' + $('#tag').val() + ']';
    }
    else { t = ""; };
    return t;
  };

  // Function to return a bbox string
  var bboxstring = function() {
    var b = 'bbox=' + bbox.left.get() + ',' + bbox.bottom.get() +
      ',' + bbox.right.get() + ',' + bbox.top.get();
    return b;
  }

  var update_inputfields = function() {
    $('#bbox_left').val(bbox.left.get());
    $('#bbox_bottom').val(bbox.bottom.get());
    $('#bbox_right').val(bbox.right.get());
    $('#bbox_top').val(bbox.top.get());
  }
  
  var read_inputfields = function() {
    bbox.left.set($('#bbox_left').val());
    bbox.bottom.set($('#bbox_bottom').val());
    bbox.right.set($('#bbox_right').val());
    bbox.top.set($('#bbox_top').val());
  }

  // Update the bbox from the text to the map
  var update_bbox = function() {
    var bounds = new OpenLayers.Bounds( bbox.left.get(), bbox.bottom.get(), bbox.right.get(), bbox.top.get());
    bounds.transform(latlon, goog);
    
    var bboxGeom = bounds.toGeometry();
    bboxVectors.removeAllFeatures();
    bboxVectors.addFeatures([new OpenLayers.Feature.Vector(bboxGeom)]);

    $('#bboxNone').attr('checked','true');
    bboxToggleControl.deactivate();
  };

  // Draw BBOX wihle toggle is activated
  $('#bboxNone').click(function() {
    bboxToggleControl.deactivate(); });
  $('#bboxToggle').click(function() {
    bboxToggleControl.activate(); });

  // Function to update the display on the page  
  var update_results = function() {
    var results = baseurl + '/' ;
    if ($('#searchbytag').is(':checked')) {
      results = results + tagsearch();
      if ($('#searchbybbox').is(':checked')) {
        results = results + '[' + bboxstring() + ']'; };
    }
    else {
      if ($('#searchbybbox').is(':checked')) {
        results = results + 'map?' + bboxstring(); }
    };
    $('#results').text(results);
    $('#results').attr('href', results);
  };

  // Set up some UI element functions
  $("#searchbytag").click(function() {
    if ( $(this).is(':checked') ) {
      $('#tag').removeAttr('disabled');
      $('#element').removeAttr('disabled');
    }
    else {
      $('#tag').attr('disabled', 'disabled');
      $('#element').attr('disabled', 'disabled');
    };
    update_results();
  });

  $('#element').change(function() {
    update_results(); });
  
  $('#tag').keyup(function() {
    update_results(); });

  $('#searchbybbox').click(function() {
    if ( $(this).is(':checked')) {
      $('#bbox_top').removeAttr('disabled');
      $('#bbox_bottom').removeAttr('disabled');
      $('#bbox_left').removeAttr('disabled');
      $('#bbox_right').removeAttr('disabled');
      $('#bboxNone').removeAttr('disabled');
      $('#bboxToggle').removeAttr('disabled');
      drawbox = true;
    }
    else {
      $('#bbox_top').attr('disabled', 'disabled');
      $('#bbox_bottom').attr('disabled', 'disabled');
      $('#bbox_left').attr('disabled', 'disabled');
      $('#bbox_right').attr('disabled', 'disabled');
      $('#bboxNone').attr('disabled', 'disabled');
      $('#bboxToggle').attr('disabled', 'disabled');
      drawbox = false;
    };
    update_results();
  });

  $('#bbox_top').change(function() {
    read_inputfields();
    if (bbox.check()) { $('#bbox_bottom').focus(); };
    update_inputfields();
    update_bbox();
    update_results();});
  $('#bbox_bottom').change(function() {
    read_inputfields();
    if (bbox.check()) { $('#bbox_top').focus(); };
    update_inputfields();
    update_bbox();
    update_results();});
  $('#bbox_left').change(function() {
    read_inputfields();
    if (bbox.check()) { $('#bbox_right').focus(); };
    update_inputfields();
    update_bbox();
    update_results();});
  $('#bbox_right').change(function() {
    read_inputfields();
    if (bbox.check()) { $('#bbox_left').focus(); };
    update_inputfields();
    update_bbox();
    update_results();});

  $.getJSON("config.json", function(json) {
    baseurl = json.baseurl;
    tileurl = json.tileurl;
    document.title = json.title;
    $('#title').text(json.title);
    attribution = json.attribution;
    
    var osm = new OpenLayers.Layer.OSM("bboxmap",
                                       tileurl + "${z}/${x}/${y}.png",
                                       {attribution: ''});
    $('#attribution').text(attribution);
    map.addLayer(osm);
    map.zoomTo(1);
    update_results();
  });

});
