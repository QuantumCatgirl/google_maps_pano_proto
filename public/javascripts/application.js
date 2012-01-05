alert('Find taz.  Zoom in on him to win.  You\'ll probably find him in Oxford Circus');

var CUSTOM_PANORAMAS = {
  oxford_circus: {
    description: 'Oxford Circus',
    latlng: new google.maps.LatLng(51.515279, -0.1419700000000148),
    image_heading: 250
  }
};

$().ready(function() {
  window.application = new Application();
});

function Application() {
  window.map = new Map({
    holder_element: document.getElementById('map'),
    start_at: CUSTOM_PANORAMAS.oxford_circus.latlng
  });
  
  window.custom_pano_view = new CustomPanoView({
    holder_element: document.getElementById('pano')
  });
};


function Map(args) {
  var self = this;

  var MAP_OPTIONS = {
    zoom: 18,
    panControl: false,
    zoomControl: true,
    zoomControlOptions: {
      style: google.maps.ZoomControlStyle.DEFAULT,
      position: google.maps.ControlPosition.RIGHT_BOTTOM
    },
    mapTypeControl: true,
    mapTypeControlOptions: {
      style: google.maps.MapTypeControlStyle.DEFAULT,
      position: google.maps.ControlPosition.RIGHT_TOP
    },
    scaleControl: false,
    streetViewControl: true,
    mapTypeId: google.maps.MapTypeId.ROADMAP
  };
  
  self.map = new google.maps.Map(args.holder_element, MAP_OPTIONS);
  if (args.start_at) {
    self.map.setCenter(args.start_at);
  }
  
  google.maps.event.addListener(self.map.streetView, 'links_changed', intercept_street_view_pano);
  
  function intercept_street_view_pano() {
    var pos = self.map.streetView.position;
    var custom_pano = get_custom_pano(pos);
    
    if (custom_pano) show_custom_pano(custom_pano);
    
    function get_custom_pano(pos) {
      var pano;
      for (var i in CUSTOM_PANORAMAS) {
        pano_latlng = CUSTOM_PANORAMAS[i].latlng;
        if (
          pano_latlng.lat()+0.00001 > pos.lat() && pano_latlng.lat()-0.00001 < pos.lat() &&
          pano_latlng.lng()+0.00001 > pos.lng() && pano_latlng.lng()-0.00001 < pos.lng()
        ) 
        return i;
      }
      return null;
    }
  }
  
  function show_custom_pano(pano) {
    $('#overlay_screen').css('display', 'block');
    setTimeout(function() {
      alert('Congratulations, you\'ve found our special loaction, have a cake!');
    }, 2000);
    // window.custom_pano_view.show({
    //   pano: pano,
    //   pov: self.map.streetView.pov,
    //   links: self.map.streetView.links
    // });
  }
  
  function move_to_pano(args) {
    self.map.streetView.setPov(args.pov);
    self.map.streetView.setPano(args.pano);
  }
  self.move_to_pano = move_to_pano;
}


function CustomPanoView(args) {
  var self = this;
  
  self.holder_element = $(args.holder_element);
  self.pano = new google.maps.StreetViewPanorama(args.holder_element, {
    pano: '',
    visible: false,
    panoProvider: get_pano_data,
    enableCloseButton: true
  });
  
  self.holder_element.hide();
  
  google.maps.event.addListener(self.pano, 'pov_changed', test_for_win);
  
  var current_pano_links = [];

  function get_pano_data(pano, zoom, tile_x, tile_y) {
    var pano_location = CUSTOM_PANORAMAS[pano];
    if (pano_location) {
      // console.log(current_pano_links);
      return {
        location: {
          pano: pano,
          description: pano_location.description,
          latlng: pano_location.latlng
        },
        tiles: {
          tileSize: new google.maps.Size(1665, 832),
          worldSize: new google.maps.Size(1665, 832),
          centerHeading: CUSTOM_PANORAMAS[pano].image_heading,
          getTileUrl: get_pano_tile_url
        },
        links: current_pano_links
      };
    }
    else {
      hide_at_pano(pano);
      return null;      
    }
  }
  
  function get_pano_tile_url(pano, zoom, tile_x, tile_y) {
    return '/images/panoramas/'+pano+'.jpg';
  }
  
  function show(args) {
    current_pano_links = args.links;
    self.pano.setValues(args);
    self.holder_element.show();
    self.pano.setVisible(true);
  };
  self.show = show;
  
  function hide_at_pano(pano) {
    window.map.move_to_pano({
      pano: pano,
      pov: self.pano.pov
    });
    self.pano.setVisible(false);
    self.holder_element.hide();
  };
  self.hide_at_pano = hide_at_pano;
  
  var has_won = false;
  function test_for_win() {
    if (
      !has_won &&
      self.pano.pov.zoom >= 2 &&
      (self.pano.pov.heading+3600)%360 > 244 && (self.pano.pov.heading+3600)%360 < 254 &&
      self.pano.pov.pitch > -12 && self.pano.pov.pitch < -1
    ) 
    {
      has_won = true;
      alert('Congratulations, you found taz');
    }
  }
}
