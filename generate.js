const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');
const fetch = require("node-fetch");

async function download_image(url, filepath) {
    
const response = await fetch(url);
if (!response.ok) {
    throw new Error(`Failed to fetch image: ${response.statusText}`);
}

const buffer = await response.buffer();
fs.writeFileSync(filepath, buffer);

}

const countries_layers = {
    "argentina" : "tiagombp/cmdrid0x700jq01qp87mp2zap",
    "chile" : "tiagombp/cmdrie7bu00qp01s2cv7k0ru8",
    "mexico" : "tiagombp/cmdrikfj7004101rscaf65mph",
    "peru" : "tiagombp/cmdrifo7j003201s801gnetgs"
}

const country_names = {
    "argentina" : "Argentina",
    "chile" : "Chile",
    "colombia" : "Colombia",
    "mexico" : "México",
    "peru" : "Perú"
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
const template = fs.readFileSync('template.html', 'utf-8');

const countries = Object.keys(countries_layers);
console.log(countries);

const basic_output_dir = './static/';

// loop through countries    
countries.forEach(country => {

    let output_dir = basic_output_dir + country;
    if (!fs.existsSync(output_dir)) fs.mkdirSync(output_dir);

    console.log(country, output_dir);

    const mini_data = data[country].large_units;

    // loop through provincias
    mini_data.forEach(async (provincia_data, i) => {

        if (i > 2) return

        const name = provincia_data.BASIC_INFO.NAME;
        const key = provincia_data.BASIC_INFO.KEY;
        const narrative = provincia_data.NARRATIVE;

        const dom = new JSDOM(template);
        const document = dom.window.document;

        const tags = document.querySelectorAll("[data-relato-modal-campo]");

        // fills main tags
        tags.forEach(tag => {

            const field = tag.dataset.relatoModalCampo;
            console.log(field);

            tag.innerHTML = narrative[field];        
        });

        // fills place title
        document.querySelector(".static-page-place-name").innerHTML = name;

        // creates the directory
        const dir_name = slugify(name);
        const unit_dir = path.join(output_dir, dir_name);
        console.log(unit_dir);
        if (!fs.existsSync(unit_dir)) fs.mkdirSync(unit_dir);

        // defines the url
        const basic_url = "https://desiertosinformativos.fundaciongabo.org/static/";

        const url = basic_url + country + '/' + dir_name;
        console.log(url);

        // updates meta tags
        document.querySelector("title").innerHTML = "Desiertos de Noticias Locales &mdash; " + name;
        document.querySelector("[property='og:title']").setAttribute("title", "Desiertos de Noticias Locales &mdash; " + name);

        document.querySelector("[name='description']").innerHTML = `${name} (${country_names[country]}): ${narrative.TITLE}`;
        document.querySelector("[property='og:description']").setAttribute("content", `${name} (${country_names[country]}): ${narrative.TITLE}`);

        document.querySelector("[property='og:url']").setAttribute("content", url);

        // builds URL to fetch map from Mapbox Image API

        // #[lon(min),lat(min),lon(max),lat(max)]
        const img_bbox = `[${mini_data.BBOX.minx},${mini_data.BBOX.miny},${mini_data.BBOX.maxx},${mini_data.BBOX.maxy}]`;

        let img_url = "https://api.mapbox.com/styles/v1/";

        img_url += countries_layers[country] + "/static";
        img_url += img_bbox;
        img_url += "/600x600/?padding=25&access_token=pk.eyJ1IjoidGlhZ29tYnAiLCJhIjoiY2thdjJmajYzMHR1YzJ5b2huM2pscjdreCJ9.oT7nAiasQnIMjhUB-VFvmw";
        img_url += `&setfilter=[%22==%22,%22KEY%22,%22${mini_data.BASIC_INFO.KEY}%22]`;
        img_url += `&layer_id=${country}-provincia-border`;

        //  Save map image in folder
        const image_path = path.join(unit_dir, "map.png");
        try {
            await download_image(img_url, image_path);
            console.log(`Downloaded map for ${mini_data.BASIC_INFO.KEY}`);
        } catch (err) {
            console.error(`Failed to get map for ${mini_data.BASIC_INFO.KEY}:`, err.message);
        }
        
        // writes the HTML file.
        const output_path = path.join(unit_dir, "index.html");
        fs.writeFileSync(output_path, dom.serialize(), 'utf-8');
        console.log(`Generated ${output_path}`);

    });

});
