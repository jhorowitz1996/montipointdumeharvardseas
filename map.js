
mapboxgl.accessToken = 'pk.eyJ1IjoiamVubmlmZXJob3Jvd2l0eiIsImEiOiJja21pNXd5NzAwZHk4MnFxdXdlMDE1dTJjIn0.JNNHK-Megf7tCA47ctPcyg';

// set maxBounds
var bounds = [
    [-118.818504, 33.9946106], // Southwest coordinates
    [-118.791439, 34.0172447] // Northeast coordinates
];

//set center
var center = [-118.80619515655482, 34.0022885548465];

var map = new mapboxgl.Map({
    container: 'map',
    zoom: 15.7,
    center: center,
    // pitch: 0,
    // bearing: -35,
    pitch: 80.5,
    bearing: -21.34,
    maxBounds: bounds,
    // custom style with hillshade modifications per https://www.youtube.com/watch?v=xajWed7mQNQ&t=3376s
    style: 'mapbox://styles/jenniferhorowitz/cknyzk1kd2wsn17s0p5onj12t'
});

// Add zoom and rotation controls to the map.
map.addControl(new mapboxgl.NavigationControl());

map.on('load', function () {

    // draw tiles to full extents of div on various screen sizes
    map.resize();

    // add dem for 3d rendering
    map.addSource('mapbox-dem', {
        'type': 'raster-dem',
        'url': 'mapbox://mapbox.mapbox-terrain-dem-v1',
        'tileSize': 512,
        'maxzoom': 14
    });

    // add the DEM source as a terrain layer with exaggerated height
    map.setTerrain({ 'source': 'mapbox-dem', 'exaggeration': 1.5 });

    // add a sky layer that will show when the map is highly pitched
    //https://docs.mapbox.com/mapbox-gl-js/style-spec/layers/#sky
    map.addLayer({
        'id': 'sky',
        'type': 'sky',
        'paint': {
            'sky-type': 'atmosphere',
            'sky-atmosphere-halo-color': "black",
            'sky-atmosphere-color': '#262e31',
            'sky-atmosphere-sun': [0.0, 0.0],
            'sky-atmosphere-sun-intensity': 15
        }
    });

    // waypoints for images
    map.addSource('waypoints', {
        type: 'geojson',
        // Use a URL for the value for the `data` property.
        data: 'data/images.geojson'
    });

    map.addLayer({
        'id': 'waypoints-layer',
        'type': 'circle',
        'source': 'waypoints',
        'paint': {
            'circle-radius': 8,
            'circle-stroke-width': 2,
            'circle-color': 'red',
            'circle-stroke-color': 'white'
        }
    });

    // trails
    map.addSource('trails', {
        type: 'geojson',
        data: 'data/trails.geojson'
    });

    map.addLayer({
        id: 'trails-layer',
        type: 'line',
        source: 'trails',
        paint: {
            'line-color': 'red',
            'line-width': 1,
            'line-dasharray': [10, 3, 2, 3]
        },
    });
});
// Create a popup, but don't add it to the map yet.
var popup = new mapboxgl.Popup({
    closeButton: false,
    closeOnClick: false
});

map.on('mouseenter', 'waypoints-layer', function (e) {
    // Change the cursor style as a UI indicator.
    map.getCanvas().style.cursor = 'pointer';


    var coordinates = e.features[0].geometry.coordinates.slice();

    // Ensure that if the map is zoomed out such that multiple
    // copies of the feature are visible, the popup appears
    // over the copy being pointed to.
    while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
        coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
    }

    var title = e.features[0].properties.name;
    console.log(title)

    // Populate the popup and set its coordinates
    popup.setLngLat(coordinates).setHTML('<img style="width:100px;" src="images/' + title + '.jpg' + '">').addTo(map);

});

map.on('mouseleave', 'waypoints-layer', function () {
    map.getCanvas().style.cursor = '';
    popup.remove();
});
