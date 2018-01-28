const API_ROOT = 'https://g4k8bjzsp8.execute-api.us-east-1.amazonaws.com/dev';

const map = L.map('map').setView([38.918, -77.040], 11);
let userLocation;

L.tileLayer('https://{s}.tile.thunderforest.com/cycle/{z}/{x}/{y}.png?apikey={apikey}', {
  attribution: '&copy; <a href="http://www.thunderforest.com/">Thunderforest</a>, &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  apikey: '43a3528946814e018e2667b156d87992',
  maxZoom: 22
}).addTo(map)

const AddStandControl = L.Control.extend({
  options: {
    position: 'topright'
  },

  onAdd: function (map) {
    // create the control container with a particular class name
    const container = L.DomUtil.create('div', 'leaflet-bar add-control');

    container.innerHTML = '<a href="#"><i class="fa fa-plus-square-o fa-2x"</a>';

    container.onclick = function(ev) {
      ev.preventDefault();
      map.adding = !map.adding;
      if (map.adding) {
        container.querySelector('.fa').classList.add('fa-plus-square');
        container.querySelector('.fa').classList.remove('fa-plus-square-o');
      } else {
        container.querySelector('.fa').classList.add('fa-plus-square-o');
        container.querySelector('.fa').classList.remove('fa-plus-square');
      }
      return false;
    };

    map.on('click', function(ev) {
      if (!map.adding || ev.originalEvent.defaultPrevented) return;
      const modalNode = L.DomUtil.create('div', 'add-modal');
      modalNode.innerHTML = `
      <h2>Is this a Fixit-style stand or a Pump?</h2>
      <form><p>
      <input id="r-fixit" checked="checked" type="radio" name="style" value="fixit"><label for="r-fixit"><img src="fixit.svg"> Fixit-style stand</label>
      <input id="r-pump-shop" type="radio" name="style" value="pump+shop"><label for="r-pump-shop"><img src="pump+shop.svg"> Pump + Bike Shop</label>
      <input id="r-pump" type="radio" name="style" value="pump"><label for="r-pump"><img src="pump.svg"> Pump</label>
      </p><button type="submit">Submit</button></form>
      `;
      L.DomEvent.on(modalNode.querySelector('button[type=submit]'), 'click', function() {
        modalNode.querySelector('[type=submit]').disabled = 'disabled';
        modalNode.querySelector('[type=submit]').innerHTML = '<i class="fa fa-spinner fa-spin"></i> Submit</i>';
        fetch(`${API_ROOT}/stand`, {
          method: 'POST',
          body: JSON.stringify({
            stand_type: new FormData(this.form).get('style'),
            lat: ev.latlng.lat,
            lng: ev.latlng.lng,
          }),
          cors: true,
        })
          .then(function(resp) {
            return resp.json();
          })
          .then(function(json) {
            new L.marker(json.coordinates.reverse(), {
              icon: L.icon({
                iconUrl: `${json.properties.stand_type}.svg`,
                iconSize: [48, 48],
                iconAnchor: [24, 24]
              })
            }).addTo(map);
            map.closeModal();
            container.click();
          });
      });
      map.openModal({element: modalNode});
    });

    map.adding = false;

    return container;
  }
});

const helpModal = function(ev) {
  if (ev) ev.preventDefault();
  document.cookie = 'viewedHelp=true';
  const modalNode = L.DomUtil.create('div', 'help-modal');
  modalNode.innerHTML = `
  <h2>About BikeHero</h2>
  <p>BikeHero is a map of fixit stands and publicly accessible bike pumps. Some of the
  fixit stands were imported from a manufacturers map of where their stands are
  installed. The others (and all the pumps) are added by users!</p>
  <h3>Adding Stands & Pumps</h3>
  <p>To add a fixit stand or a pump, tap the plus(+) sign in the
  top right corner of the map. Then tap anywhere on the map to add a stand or pump at
  that location. A window will popup asking you if it is a fixit stand or a pump. Make
    your selection and click submit. Your addition is now on the BikeHero map!
  <h3>Legend</h3>
  <p class="legend">
  <img src="fixit.svg"> <a href="https://www.google.com/search?tbm=isch&q=fixit%20stand">Fixit stands</a>
    <br>
  <img src="pump+shop.svg"> Bike pump outside a bike shop
  <br>
  <img src="pump.svg"> Other pulicly accessible bike pump
  </p>
  <h3>Source</h3>
  <p>BikeHero is open source and on <a href="https://github.com/dschep/bikehero">Github</a>.</p>
    `;
  map.openModal({element: modalNode});
  return false;
};

const HelpControl = L.Control.extend({
  options: {
    position: 'topright'
  },

  onAdd: function () {
    // create the control container with a particular class name
    const container = L.DomUtil.create('div', 'leaflet-bar add-control');

    container.innerHTML = '<a href="#"><i class="fa fa-question fa-2x"</a>';

    container.onclick = helpModal;

    return container;
  }
});

map.addControl(new HelpControl());
map.addControl(new AddStandControl());
if (!document.cookie)
  helpModal();

fetch(`${API_ROOT}/stands`, {cors: true})
  .then(function(resp) {
    return resp.json();
  })
  .then(function(geoJson) {
    L.geoJSON(geoJson, {
      pointToLayer: function (feature, latlng) {
        return L.marker(latlng, {
          icon: L.icon({
            iconUrl: `${feature.properties.stand_type}.svg`,
            iconSize:     [48, 48],
            iconAnchor:   [24, 24]
          })
        }).on('click', e => {
        // create geoJson feature just to get bounds of 2 points
          const bounds = L.geoJson({
            type: 'FeatureCollection',
            'features': [
              {
                type: 'Point',
                coordinates: [userLocation.lng, userLocation.lat],
              },
              {
                type: 'Point',
                coordinates: [e.latlng.lng, e.latlng.lat],
              },
            ],
          }).getBounds();
          map.fitBounds(bounds);
        });
      }

    }).addTo(map);
  });

const lc = L.control.locate({
  locateOptions: { maxZoom: 14 }
}).addTo(map);
map.on('locationfound', e => {userLocation = e.latlng;});
lc.start();


if (navigator.serviceWorker) navigator.serviceWorker.register('/sw.js')
  .then(function() { console.log('Service Worker Registered'); });
