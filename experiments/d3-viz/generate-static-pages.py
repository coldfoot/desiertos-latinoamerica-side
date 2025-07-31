#!/usr/bin/env python3
"""
Static Page Generator for D3 Visualization
Generates HTML files with custom OG tags for social sharing
"""

import json
import os
import unicodedata
import re

def normalize_for_filename(text):
    """Normalize text for use in filenames"""
    if not text:
        return ""
    
    # Convert to lowercase
    text = text.lower()
    
    # Remove accents
    text = unicodedata.normalize('NFD', text)
    text = ''.join(c for c in text if not unicodedata.combining(c))
    
    # Replace spaces with hyphens
    text = re.sub(r'\s+', '-', text)
    
    # Remove special characters except hyphens
    text = re.sub(r'[^a-z0-9-]', '', text)
    
    return text

def capitalize_first_letter(text):
    """Capitalize the first letter of a string"""
    if not text:
        return ""
    return text[0].upper() + text[1:]

def generate_html(title, description, og_url, redirect_url):
    """Generate HTML template with OG tags and redirect"""
    return f"""<!DOCTYPE html>
<html lang=\"es\">
<head>
    <meta charset=\"UTF-8\">
    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">
    <title>{title}</title>
    
    <!-- Open Graph Meta Tags -->
    <meta property=\"og:title\" content=\"{title}\">
    <meta property=\"og:description\" content=\"{description}\">
    <meta property=\"og:type\" content=\"website\">
    <meta property=\"og:url\" content=\"{og_url}\">
    
    <!-- Twitter Card Meta Tags -->
    <meta name=\"twitter:card\" content=\"summary\">
    <meta name=\"twitter:title\" content=\"{title}\">
    <meta name=\"twitter:description\" content=\"{description}\">
    
    <!-- Redirect to SPA -->
    <meta http-equiv=\"refresh\" content=\"0; url={redirect_url}\">
    
    <!-- Fallback redirect with JavaScript -->
    <script>
        window.location.replace('{redirect_url}');
    </script>
    
    <style>
        body {{
            font-family: Arial, sans-serif;
            text-align: center;
            padding: 50px;
            background: #f9f1e3;
            color: #333;
        }}
        .loading {{
            font-size: 18px;
            margin: 20px 0;
        }}
        .redirecting {{
            font-size: 14px;
            color: #666;
        }}
    </style>
</head>
<body>
    <div class=\"loading\">Cargando visualización...</div>
    <div class=\"redirecting\">Redirigiendo a la aplicación interactiva...</div>
    <p>Si no eres redirigido automáticamente, <a href=\"{redirect_url}\">haz clic aquí</a>.</p>
</body>
</html>"""

def main():
    """Main function to generate static pages"""
    
    # Read the data
    try:
        with open('../../data.json', 'r', encoding='utf-8') as f:
            data = json.load(f)
    except FileNotFoundError:
        print("❌ Error: data.json not found. Make sure you're running this from the experiments/d3-viz directory.")
        return
    except json.JSONDecodeError:
        print("❌ Error: Invalid JSON in data.json")
        return
    
    # Set the correct base path for redirects and OG URLs
    base_path = '/desiertos-latinoamerica/experiments/d3-viz'
    base_url = 'https://coldfoot.studio' + base_path
    
    # Create output directory
    output_dir = 'static-pages'
    if not os.path.exists(output_dir):
        os.makedirs(output_dir)
        print(f"📁 Created directory: {output_dir}")
    
    generated_count = 0
    
    # Generate pages for each country
    for country in data.keys():
        country_name = capitalize_first_letter(country)
        norm_country = normalize_for_filename(country).replace('-', '')
        
        # Country-level page
        country_title = f"Desiertos: {country_name}"
        country_description = f"Visualización de datos para {country_name}"
        country_filename = f"{normalize_for_filename(country)}.html"
        hash_path = f"#/{norm_country}"
        og_url = f"{base_url}/{hash_path}"
        redirect_url = f"{base_path}/{hash_path}"
        
        with open(os.path.join(output_dir, country_filename), 'w', encoding='utf-8') as f:
            f.write(generate_html(country_title, country_description, og_url, redirect_url))
        
        print(f"✅ Generated: {country_filename}")
        generated_count += 1
        
        # Large units (regions/provinces)
        if 'large_units' in data[country] and data[country]['large_units']:
            for region in data[country]['large_units']:
                region_title = f"Desiertos: {region['BASIC_INFO']['NAME']}, {country_name}"
                region_description = f"Visualización de datos para {region['BASIC_INFO']['NAME']}, {country_name}"
                region_filename = f"{normalize_for_filename(country)}-{normalize_for_filename(region['BASIC_INFO']['NAME'])}.html"
                norm_region = normalize_for_filename(region['BASIC_INFO']['NAME']).replace('-', '')
                hash_path = f"#/{norm_country}/{norm_region}"
                og_url = f"{base_url}/{hash_path}"
                redirect_url = f"{base_path}/{hash_path}"
                
                with open(os.path.join(output_dir, region_filename), 'w', encoding='utf-8') as f:
                    f.write(generate_html(region_title, region_description, og_url, redirect_url))
                
                print(f"✅ Generated: {region_filename}")
                generated_count += 1
                
                # Small units (cities) that belong to this region
                if 'small_units' in data[country] and data[country]['small_units']:
                    cities_in_region = [
                        city for city in data[country]['small_units']
                        if normalize_for_filename(city['BASIC_INFO']['PARENT']) == normalize_for_filename(region['BASIC_INFO']['NAME'])
                    ]
                    
                    for city in cities_in_region:
                        city_title = f"Desiertos: {city['BASIC_INFO']['NAME']}, {city['BASIC_INFO']['PARENT']}, {country_name}"
                        city_description = f"Visualización de datos para {city['BASIC_INFO']['NAME']}, {city['BASIC_INFO']['PARENT']}, {country_name}"
                        city_filename = f"{normalize_for_filename(country)}-{normalize_for_filename(region['BASIC_INFO']['NAME'])}-{normalize_for_filename(city['BASIC_INFO']['NAME'])}.html"
                        norm_city = normalize_for_filename(city['BASIC_INFO']['NAME']).replace('-', '')
                        hash_path = f"#/{norm_country}/{norm_region}/{norm_city}"
                        og_url = f"{base_url}/{hash_path}"
                        redirect_url = f"{base_path}/{hash_path}"
                        
                        with open(os.path.join(output_dir, city_filename), 'w', encoding='utf-8') as f:
                            f.write(generate_html(city_title, city_description, og_url, redirect_url))
                        
                        print(f"✅ Generated: {city_filename}")
                        generated_count += 1
    
    print(f"\n🎉 Static pages generated successfully!")
    print(f"📁 Output directory: {output_dir}")
    print(f"📄 Total files generated: {generated_count}")
    print("🚀 Deploy these files to your web server for custom OG previews!")

if __name__ == "__main__":
    main() 