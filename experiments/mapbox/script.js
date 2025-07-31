


function plot_country(country) {

    console.log(country);


}

let map;

function init() {

    console.log("initi");

    const selector = document.querySelector('select#countries');

    selector.addEventListener('change', function(e) {

        console.log("hi");

        const country = e.target.value;

        console.log(country);
        
        plot_country(country);
    });

    const countries = ["Argentina", "Colombia", "Peru", "Chile", "Mexico"];

    mapboxgl.accessToken = 'pk.eyJ1IjoidGlhZ29tYnAiLCJhIjoiY2thdjJmajYzMHR1YzJ5b2huM2pscjdreCJ9.oT7nAiasQnIMjhUB-VFvmw';

    map = new mapboxgl.Map({
        container: 'map',
        // Choose from Mapbox's core styles, or make your own style with Mapbox Studio
        style: 'mapbox://styles/tiagombp/clgxtpl6400eg01p6dtzv8igv',
        center: [-76.8, -4.48],
        zoom: 2
    });
    
    let hoveredPolygonId = null;

    map.on('load', () => {
        map.addSource('countries', {
            'type': 'vector',
            'url': 'mapbox://tiagombp.bmw9axxy'
        });

        // The feature-state dependent fill-opacity expression will render the hover effect
        // when a feature's hover state is set to true.
        map.addLayer({
            'id': 'countries-fills',
            'type': 'fill',
            'source': 'countries',
            'source-layer' : 'data-blt69d',
            'layout': {},
            'paint': {
                'fill-color': '#627BC1',
                'fill-opacity': [
                    'case',
                    ['boolean', ['feature-state', 'hover'], false],
                    1,
                    0.5
                ]
            }
        });

        map.addLayer({
            'id': 'countries-borders',
            'type': 'line',
            'source': 'countries',
            'source-layer' : 'data-blt69d',
            'layout': {},
            'paint': {
                'line-color': '#627BC1',
                'line-width': 2
            }
        });

        //map.querySourceFeatures("countries", {'sourceLayer' : 'data-blt69d'})

    });

}

init();