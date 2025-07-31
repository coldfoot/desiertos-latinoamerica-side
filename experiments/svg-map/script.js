let data;

function read_data(data_file) {

    fetch(data_file)
        .then(response => response.json())
        .then(data => {
            console.log(data);

            init(data);

        });

}

function plot_country(data, country) {

    const country_data = {
        
        type: 'FeatureCollection',
        features: data.features.filter(d => d.properties.country_name === country)

    }

    console.log(country_data);

    const svg = d3.select('svg');

    const width = +svg.style('width').slice(0,-2);
    const height = +svg.style('height').slice(0,-2);

    const margin = {top: 40, right: 40, bottom: 40, left: 40};
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    // Define the projection

    const projection = d3.geoNaturalEarth1()
        .fitSize([innerWidth, innerHeight], country_data)
    ;

    const path = d3.geoPath().projection(projection);

    svg.selectAll("g").remove();

    svg.append("g")
        .attr("class", "map")
        .attr("transform", `translate(${margin.left}, ${margin.top})`)
        .selectAll("path")
        .data(country_data.features)
        .join("path")
        .attr("d", path)
    ;

}

function init(data) {

    console.log("initi");

    const selector = document.querySelector('select#countries');

    selector.addEventListener('change', function(e) {

        console.log("hi");

        const country = e.target.value;

        console.log(country);
        
        plot_country(data, country);
    });

    const countries = ["Argentina", "Colombia", "Peru", "Chile", "Mexico"];

    const countries_paths = {};

    countries.forEach(country => {

        plot_country(data, country);

        countries_paths[country] = d3.select("path").attr("d");

    });

    console.log(countries_paths);

    // com isso aqui, fazer as transições.

}

read_data('data.json');