$(document).ready(function() {
  // Set up some basics
  var config = {};

  var baseurls;
  
  // 'search by area' enables drawing new bbox
  var drawbox = false;
  
  // Set up the map
  map = new OpenLayers.Map('bboxmap', 
                           {projection: "EPSG:900913",});

  map.addControl(new OpenLayers.Control.Attribution());
    
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
      return parseFloat(this.value);
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
      if(this.left.get() > this.right.get()) {
        temp = this.left.get();
        this.left.set(this.right.get());
        this.right.set(temp);
        updateNeeded = true;
      };
      if(this.bottom.get() > this.top.get()) {
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
  	  
    var xapiQuery = '/' ;
    if ($('#searchbytag').is(':checked')) {
      xapiQuery = xapiQuery + tagsearch();
      if ($('#searchbybbox').is(':checked')) {
        xapiQuery = xapiQuery + '[' + bboxstring() + ']'; };
    }
    else {
      if ($('#searchbybbox').is(':checked')) {
        xapiQuery = xapiQuery + 'map?' + bboxstring(); }
    };
    
    xapiurlHTML = "<table cellpadding=\"2\" cellspacing=\"2\">";
    for (var i=0; i<baseurls.length; i++) {
       url = baseurls[i]['url'] + xapiQuery;
       xapiurlHTML += "<tr>" +
                      "<td class=\"label\">" + baseurls[i]['label'] + " : </td> " +
                      "<td class=\"url_box\"><a href=\"" + url + "\">" + url + "</a></td>" + 
                      "</tr>\n";
    }
    xapiurlHTML += "</table>";
    $('#xapiurls').html(xapiurlHTML);  
  };

  // Set up some UI element functions
  $("#searchbytag").click(function() {
    if ( $(this).is(':checked') ) {
      $('#search_by_tag_filter').show();
    }
    else {
      $('#search_by_tag_filter').hide();
    };
    update_results();
  });
  
  $('#element').change(function() {
    update_results(); });
  
  $('#tag').keyup(function() {
    update_results(); });

  $('#searchbybbox').click(function() {
    if ( $(this).is(':checked')) {
      $('#search_by_bbox_filter').show();
      drawbox = true;
    }
    else {
      $('#search_by_bbox_filter').hide();
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
    baseurls = json.baseurls;
    tileurl = json.tileurl;
    document.title = json.title;
    $('#title').text(json.title);

    var maps = json.map; //get the set of configured map layers from config.json
    var count_maps = 0;
    $.each(maps, function(index, amap) {
      map.addLayer(new OpenLayers.Layer.OSM(amap.name,
        amap.tiles + "${z}/${x}/${y}.png", {attribution: amap.attribution }));
      count_maps++;
      //$('#attribution').append('<b>'+amap.name+':</b> '+amap.attribution+'<br />');
    });
    if (count_maps>1) {
      map.addControl(new OpenLayers.Control.LayerSwitcher());
    };
    map.zoomTo(1);
    update_results();
  });
  
  $('#search_by_bbox_filter').hide();

});
