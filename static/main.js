API_ROOT = 'https://g4k8bjzsp8.execute-api.us-east-1.amazonaws.com/dev'

var map = L.map('map').setView([38.918, -77.040], 11);

L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map);

var AddStandControl = L.Control.extend({
    options: {
        position: 'topright'
    },

    onAdd: function (map) {
        // create the control container with a particular class name
        var container = L.DomUtil.create('div', 'leaflet-bar add-control');

        container.innerHTML = '<a href="#"><i class="fa fa-plus-square-o fa-2x"</a>';

        container.onclick = function(ev) {
            ev.preventDefault();
            map.adding = !map.adding
                if (map.adding) {
                    container.querySelector('.fa').classList.add('fa-plus-square');
                    container.querySelector('.fa').classList.remove('fa-plus-square-o');
                } else {
                    container.querySelector('.fa').classList.add('fa-plus-square-o');
                    container.querySelector('.fa').classList.remove('fa-plus-square');
                }
            return false;
        }

        map.on('click', function(ev) {
            if (!map.adding || ev.originalEvent.defaultPrevented) return;
            var modalNode = L.DomUtil.create('div', 'add-modal');
            modalNode.innerHTML = `
            <h2>Is this a Fixit-style stand or a Pump?</h2>
            <form><p>
            <input id="r-fixit" checked="checked" type="radio" name="style" value="fixit"><label for="r-fixit"><img src="fixit.svg"> Fixit-style stand</label>
            <input id="r-pump-shop" type="radio" name="style" value="pump+shop"><label for="r-pump-shop"><img src="pump+shop.svg"> Pump + Bike Shop</label>
            <input id="r-pump" type="radio" name="style" value="pump"><label for="r-pump"><img src="pump.svg"> Pump</label>
            </p><button type="submit">Submit</button></form>
            `;
            L.DomEvent.on(modalNode.querySelector('button[type=submit]'), 'click', function() {
                modalNode.querySelector('[type=submit]').disabled = "disabled"
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
                        return resp.json()
                    })
                    .then(function(json) {
                        new L.marker(json.coordinates.reverse(), {
                            icon: L.icon({
                                iconUrl: `${json.properties.stand_type}.svg`,
                                iconSize:     [48, 48],
                                iconAnchor:   [24, 24]
                            })
                        }).addTo(map);
                        map.closeModal();
                        container.click();
                    });
            })
            map.openModal({element: modalNode});
        });

        map.adding = false;

        return container;
    }
});

map.addControl(new AddStandControl());


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
            });
        }

    }).addTo(map);
});

var lc = L.control.locate({
    locateOptions: { maxZoom: 14 }
}).addTo(map);
lc.start();
