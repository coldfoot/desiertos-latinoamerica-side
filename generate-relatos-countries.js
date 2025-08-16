const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

async function download_image(img_url, filepath) {
    
    const response = await fetch(img_url);
    if (!response.ok) {
        throw new Error(`Failed to fetch image: ${response.statusText}`);
    }

    //console.log(response);

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    fs.writeFileSync(filepath, buffer);

}

const countries_layers = {
    "argentina" : "tiagombp/cmdrid0x700jq01qp87mp2zap",
    "chile" : "tiagombp/cmdrie7bu00qp01s2cv7k0ru8",
    "mexico" : "tiagombp/cmdrikfj7004101rscaf65mph",
    "peru" : "tiagombp/cmdrifo7j003201s801gnetgs",
    "colombia" : ""
}

const country_names = {
    "argentina" : "Argentina",
    "chile" : "Chile",
    "colombia" : "Colombia",
    "mexico" : "México",
    "peru" : "Perú"
}

const bboxes = {
    "argentina" : [-73.57626953125, -55.03212890625, -53.6685546875, -21.8025390625],
    "chile" : [-109.434130859375, -55.89169921875, -66.435791015625, -17.5060546875],
    "colombia" : [-81.735610, -4.229406, -66.847215, 13.394496],
    "mexico" : [-118.4013671875, 14.54541015625, -86.6962890625, 32.71533203125],
    "peru" : [-81.33662109375, -18.34560546875, -68.68525390625, -0.041748046875]
}

function slugify(name) {
    return name
        .normalize("NFD")                    // decompose accents (e.g. ñ → n + ̃)
        .replace(/[\u0300-\u036f]/g, "")    // remove diacritical marks
        .replace(/['’"]/g, "")              // remove apostrophes and quotes
        .replace(/\s+/g, "_")               // replace whitespace with underscores
        .replace(/[^a-zA-Z0-9_]/g, "")      // remove all other special characters
        .toLowerCase();                     // lowercase
}

// Load JSON data
const data = JSON.parse(fs.readFileSync('data.json', 'utf-8'));

// Load the HTML template
const template = fs.readFileSync('template-relato-country.html', 'utf-8');

const countries = Object.keys(countries_layers);

const basic_output_dir = './static/';

// loop through countries    
countries.forEach( async (country, i) => {

    let output_dir = basic_output_dir + country;
    if (!fs.existsSync(output_dir)) fs.mkdirSync(output_dir);

    let country_data = data[country].country[0];

    const name = country_data.BASIC_INFO.NAME;
    const key = country;//country_data.BASIC_INFO.KEY;
    const narrative = country_data.NARRATIVE;

    const dom = new JSDOM(template);
    const document = dom.window.document;

    //adds country to data attribute
    document.querySelector("body").dataset.country = country;

    const tags = document.querySelectorAll("[data-relato-modal-campo]");

    // fills main tags
    tags.forEach(tag => {

        const field = tag.dataset.relatoModalCampo;

        tag.innerHTML = narrative[field];        
    });

    // fills place title
    document.querySelector(".static-page-place-name").innerHTML = name;

    // defines the url
    const basic_url = "https://desiertosinformativos.fundaciongabo.org/static/";

    const url = basic_url + country
    //console.log(url);

    // updates meta tags
    document.querySelector("title").innerHTML = "Desiertos de Noticias Locales &mdash; " + name;
    document.querySelector("[property='og:title']").setAttribute("content", "Desiertos de Noticias Locales — " + name);

    document.querySelector("[name='description']").setAttribute("content", `${country_names[country]}: ${narrative.TITLE}`);
    document.querySelector("[property='og:description']").setAttribute("content", `${country_names[country]}: ${narrative.TITLE}`);

    document.querySelector("[property='og:url']").setAttribute("content", url);
    document.querySelector("[property='og:image']").setAttribute("content", url + '/map.png');

    // Populate link to dashboard
    const dashboard_link = "../../dashboard/index.html?ubicacion=" + key;
    document.querySelector(".link-to-dashboard").setAttribute("href", dashboard_link);

    if (country != "colombia") {

        // builds URL to fetch map from Mapbox Image API

        // #[lon(min),lat(min),lon(max),lat(max)]
        
        const img_bbox = `%5B${bboxes[country].toString()}%5D`;//`%5B${provincia_data.BBOX.minx},${provincia_data.BBOX.miny},${provincia_data.BBOX.maxx},${provincia_data.BBOX.maxy}%5D`;

        let img_url = "https://api.mapbox.com/styles/v1/";

        img_url += countries_layers[country] + "/static/";
        img_url += img_bbox;
        img_url += "/600x600/?padding=25&access_token=pk.eyJ1IjoidGlhZ29tYnAiLCJhIjoiY2thdjJmajYzMHR1YzJ5b2huM2pscjdreCJ9.oT7nAiasQnIMjhUB-VFvmw";
        //img_url += `&setfilter=%5B%22==%22,%22KEY%22,%22${provincia_data.BASIC_INFO.KEY}%22%5D`;
        img_url += `&layer_id=${country}-provincia-border`;
        console.log(img_url);

        //  Save map image in folder
        const image_path = path.join(output_dir, "map.png");
        try {
            await download_image(img_url, image_path);
            console.log(`Downloaded map for ${country_data.BASIC_INFO.KEY}`);
        } catch (err) {
            console.error(`Failed to get map for ${country_data.BASIC_INFO.KEY}:`, err.message);
        }

    } else {

        document.querySelector("img.static-page-map").setAttribute("src", "");

        console.log("No maps for Colombia.");

    }
    
    // writes the HTML file.
    const output_path = path.join(output_dir, "index.html");
    fs.writeFileSync(output_path, dom.serialize(), 'utf-8');
    console.log(`Generated ${output_path}`);

});
