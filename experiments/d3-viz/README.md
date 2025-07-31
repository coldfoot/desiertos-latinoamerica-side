# D3 Visualization with Static OG Pages

This project includes a D3-based data visualization with hash-based routing and static page generation for custom Open Graph previews.

## Features

- **Interactive D3 Visualizations**: Explore data for countries, regions, and cities
- **Hash-based Routing**: URLs like `#/argentina/tucuman/capital` for direct navigation
- **Static Page Generation**: Pre-generated HTML files with custom OG tags for social sharing
- **Share Button**: Generate shareable links with proper social media previews

## How It Works

### 1. SPA Navigation
- Users interact with the app, URLs update with hash routing
- Example: `index.html#/argentina/tucuman/capital`

### 2. Static Pages for Social Sharing
- Pre-generated HTML files with custom OG tags
- Example: `argentina-tucuman-capital.html`
- These pages redirect to the SPA with the correct hash

### 3. Share Button
- Generates the correct static page URL for the current view
- Copies the URL to clipboard for easy sharing

## Setup

### 1. Generate Static Pages

You can use either Node.js or Python to generate the static pages:

#### Option A: Using Python (Recommended)
```bash
cd experiments/d3-viz
python generate-static-pages.py
```

#### Option B: Using Node.js
```bash
cd experiments/d3-viz
node generate-static-pages.js
```

Both scripts do exactly the same thing and create a `static-pages/` directory with HTML files for each:
- Country: `argentina.html`
- Region: `argentina-tucuman.html`
- City: `argentina-tucuman-capital.html`

### 2. Deploy Static Pages

Copy the generated HTML files to your web server alongside your main `index.html`.

For GitHub Pages, you can place them in the same directory as your main page.

## File Structure

```
experiments/d3-viz/
├── index.html              # Main SPA
├── script.js               # Main application logic
├── draw.js                 # D3 visualization functions
├── style.css               # Styles
├── generate-static-pages.py # Python static page generator
├── generate-static-pages.js # Node.js static page generator (alternative)
└── static-pages/           # Generated static HTML files
    ├── argentina.html
    ├── argentina-tucuman.html
    ├── argentina-tucuman-capital.html
    └── ...
```

## URL Examples

| SPA URL | Static Page | OG Preview |
|---------|-------------|------------|
| `index.html#/argentina` | `argentina.html` | "Desiertos: Argentina" |
| `index.html#/argentina/tucuman` | `argentina-tucuman.html` | "Desiertos: Tucumán, Argentina" |
| `index.html#/argentina/tucuman/capital` | `argentina-tucuman-capital.html` | "Desiertos: Capital, Tucumán, Argentina" |

## Usage

1. **Navigate**: Use the dropdowns and search to explore data
2. **Share**: Click the "Compartir" button to copy a shareable link
3. **Social Media**: The shared link will show custom previews on social platforms

## Customization

### Modify OG Tags
Edit the `generate_html()` function in either generator script to customize:
- Title format
- Description content
- Additional meta tags

### Add More Routes
Update the generator script to handle additional URL patterns or data structures.

## Notes

- Static pages automatically redirect to the SPA for the best user experience
- Social media bots see the custom OG tags before the redirect
- The SPA continues to work normally for all navigation after the redirect 