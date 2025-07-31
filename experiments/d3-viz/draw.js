// Data visualization functions for D3 experiment
// Main entry point and core visualization logic

/**
 * Main function to create data visualization
 * @param {Object} countryData - The entire country data object
 * @param {string} level - The level key (small_units or large_units)
 * @param {string} unitKey - The specific unit key to focus on
 */
function createDataVisualization(countryData, level, unitKey) {
    console.log('Creating data visualization with:', { countryData, level, unitKey });
    
    // Clear previous content and create new container
    const chartContainer = d3.select('#chart').html('');
    const vizContainer = chartContainer.append('div').attr('class', 'viz-container');
    
    // Draw the visualization
    drawVisualization(vizContainer, countryData, level, unitKey);
}

/**
 * Main visualization orchestrator
 * @param {Object} vizContainer - D3 selection of the visualization container
 * @param {Object} countryData - The entire country data object
 * @param {string} level - The level key
 * @param {string} unitKey - The specific unit key
 */
function drawVisualization(vizContainer, countryData, level, unitKey) {
    const levelData = getLevelData(countryData, level);
    const selectedUnit = findSelectedUnit(levelData, unitKey);
    
    logSelectedUnit(selectedUnit, unitKey);
    createMenuTriggers(vizContainer, levelData, selectedUnit, level);
}

// ============================================================================
// DATA ACCESS AND UTILITY FUNCTIONS
// ============================================================================

/**
 * Get data for the specified level
 * @param {Object} countryData - The entire country data object
 * @param {string} level - The level key
 * @returns {Array} Array of units for the specified level
 */
function getLevelData(countryData, level) {
    if (!countryData?.[level]) {
        console.error('Invalid country data or level:', { countryData, level });
        return [];
    }
    return countryData[level];
}

/**
 * Find the selected unit by key
 * @param {Array} levelData - Array of units for the level
 * @param {string} unitKey - The unit key to find
 * @returns {Object|null} The selected unit object or null if not found
 */
function findSelectedUnit(levelData, unitKey) {
    return levelData.find(unit => unit.BASIC_INFO.KEY === unitKey) || null;
}

/**
 * Log selected unit information for debugging
 * @param {Object} selectedUnit - The selected unit object
 * @param {string} unitKey - The unit key
 */
function logSelectedUnit(selectedUnit, unitKey) {
    console.log('=== SELECTED UNIT OBJECT ===');
    console.log('Unit Key:', unitKey);
    console.log('Selected Unit:', selectedUnit);
    console.log('===========================');
}

// ============================================================================
// MENU TRIGGER CREATION
// ============================================================================

/**
 * Create menu triggers for each data category
 * @param {Object} vizContainer - D3 selection of the visualization container
 * @param {Array} levelData - Array of units for the level
 * @param {Object} selectedUnit - The selected unit object
 * @param {string} level - The level key
 * @returns {Array} Array of menu container objects
 */
function createMenuTriggers(vizContainer, levelData, selectedUnit, level) {
    if (!levelData?.length) {
        console.error('No level data available');
        return [];
    }

    const menuKeys = getMenuKeys(levelData[0]);
    const menuContainers = [];

    menuKeys.forEach(key => {
        const menu = createMenuTrigger(vizContainer, key, levelData, selectedUnit, level);
        menuContainers.push({ key, menu });
    });

    return menuContainers;
}

/**
 * Get menu keys from the first unit (excluding metadata keys)
 * @param {Object} firstUnit - The first unit object
 * @returns {Array} Array of menu keys
 */
function getMenuKeys(firstUnit) {
    const excludedKeys = ['BASIC_INFO', 'BBOX', 'CENTROID', 'NARRATIVE'];
    return Object.keys(firstUnit).filter(key => !excludedKeys.includes(key));
}

/**
 * Create a single menu trigger
 * @param {Object} vizContainer - D3 selection of the visualization container
 * @param {string} key - The menu key
 * @param {Array} levelData - Array of units for the level
 * @param {Object} selectedUnit - The selected unit object
 * @param {string} level - The level key
 * @returns {Object} D3 selection of the created menu
 */
function createMenuTrigger(vizContainer, key, levelData, selectedUnit, level) {
    const menu = vizContainer.append('div')
        .attr('class', 'menu-trigger')
        .attr('data-key', key);

    const header = menu.append('h4').text(translateKeyToTitle(key));
    
    header.on('click', () => createPopupContent(key, levelData, selectedUnit, level));
    
    return menu;
}

// ============================================================================
// POPUP MANAGEMENT
// ============================================================================

/**
 * Create popup content fresh each time it's triggered
 * @param {string} key - The menu key
 * @param {Array} levelData - Array of units for the level
 * @param {Object} selectedUnit - The selected unit object
 * @param {string} level - The level key
 */
function createPopupContent(key, levelData, selectedUnit, level) {
    const contentContainer = createContentContainer();
    const stripplotContainer = createStripplotContainer(contentContainer);
    
    const categoryData = selectedUnit[key];
    if (!isValidCategoryData(categoryData)) {
        console.error('No category data found for:', key);
        return;
    }
    
    let percentageVariables = getPercentageVariables(categoryData);
    // Sort by selected unit's value, descending
    percentageVariables = percentageVariables.sort((a, b) => {
        return (selectedUnit[key][b] || 0) - (selectedUnit[key][a] || 0);
    });
    // If level is 'country', do not show peer markers
    const peerUnits = (level === 'country') ? [] : getPeerUnits(levelData, selectedUnit);
    
    percentageVariables.forEach(variable => {
        createStripplot(stripplotContainer, variable, selectedUnit, peerUnits, key, level);
    });
    
    // Add download button
    addDownloadButton(contentContainer, key, selectedUnit, peerUnits);
    
    showMenuPopup(translateKeyToTitle(key), contentContainer, key, selectedUnit.BASIC_INFO.NAME, selectedUnit, level);
}

/**
 * Create content container for popup
 * @returns {HTMLElement} The content container element
 */
function createContentContainer() {
    const container = document.createElement('div');
    container.className = 'viz-area';
    return container;
}

/**
 * Create stripplot container with flex layout
 * @param {HTMLElement} contentContainer - The content container
 * @returns {Object} D3 selection of the stripplot container
 */
function createStripplotContainer(contentContainer) {
    return d3.select(contentContainer).append('div')
        .attr('class', 'stripplot-container');
}

/**
 * Check if category data is valid
 * @param {*} categoryData - The category data to validate
 * @returns {boolean} True if valid, false otherwise
 */
function isValidCategoryData(categoryData) {
    return categoryData && typeof categoryData === 'object';
}

/**
 * Get percentage variables from category data
 * @param {Object} categoryData - The category data object
 * @returns {Array} Array of percentage variable names
 */
function getPercentageVariables(categoryData) {
    return Object.keys(categoryData).filter(key => key.endsWith('_PCT'));
}

/**
 * Get peer units for comparison
 * @param {Array} levelData - Array of units for the level
 * @param {Object} selectedUnit - The selected unit object
 * @returns {Array} Array of peer units
 */
function getPeerUnits(levelData, selectedUnit) {
    const selectedUnitKey = selectedUnit.BASIC_INFO.KEY;
    return levelData.filter(unit => 
        unit.BASIC_INFO.PARENT === selectedUnit.BASIC_INFO.PARENT && 
        unit.BASIC_INFO.KEY !== selectedUnitKey
    );
}

/**
 * Show menu popup with overlay
 * @param {string} title - The popup title
 * @param {Node} contentNode - The content node to display
 * @param {string} key - The key associated with the popup
 * @param {string} selectedUnitName - Name of the selected unit
 * @param {Object} selectedUnit - The selected unit object
 * @param {string} level - The level key
 */
function showMenuPopup(title, contentNode, key, selectedUnitName, selectedUnit, level) {
    // Remove any existing popup
    d3.selectAll('.menu-popup-overlay').remove();

    const overlay = createPopupOverlay();
    const popup = createPopupStructure(overlay, title, key, selectedUnitName, selectedUnit, level);
    
    // Add content
    popup.node().appendChild(contentNode);
}

/**
 * Create popup overlay
 * @returns {Object} D3 selection of the overlay
 */
function createPopupOverlay() {
    return d3.select('body').append('div').attr('class', 'menu-popup-overlay');
}

/**
 * Create popup content structure
 * @param {Object} overlay - D3 selection of the overlay
 * @param {string} title - The popup title
 * @param {string} key - The menu key
 * @param {string} selectedUnitName - Name of the selected unit
 * @param {Object} selectedUnit - The selected unit object
 * @param {string} level - The level key
 * @returns {Object} D3 selection of the popup
 */
function createPopupStructure(overlay, title, key, selectedUnitName, selectedUnit, level) {
    const popup = overlay.append('div').attr('class', 'menu-popup');

    // Add close button
    popup.append('button')
        .attr('class', 'menu-popup-close')
        .attr('aria-label', 'Cerrar')
        .html('&times;')
        .on('click', () => overlay.remove());

    // Add title
    popup.append('h4').text(title);

    // Add subtitle with inline legend
    addSubtitleWithLegend(popup, key, selectedUnitName, selectedUnit, level);

    return popup;
}

/**
 * Add subtitle with inline legend to popup
 * @param {Object} popup - D3 selection of the popup
 * @param {string} key - The menu key
 * @param {string} selectedUnitName - Name of the selected unit
 * @param {Object} selectedUnit - The selected unit object
 * @param {string} level - The level key
 */
function addSubtitleWithLegend(popup, key, selectedUnitName, selectedUnit, level) {
    const subtitle = translateKeyToSubtitle(key);
    if (!subtitle) return;
    const inlineSubtitle = createInlineSubtitle(subtitle, selectedUnitName || 'en xxx', selectedUnit, level);
    if (inlineSubtitle.type === 'inline') {
        popup.node().appendChild(inlineSubtitle.element);
    } else {
        popup.append('p')
            .attr('class', 'popup-subtitle')
            .text(inlineSubtitle.text);
    }
}

// ============================================================================
// STRIPPLOT CREATION
// ============================================================================

/**
 * Create a single stripplot visualization
 * @param {Object} container - D3 selection of the container
 * @param {string} variable - The percentage variable name
 * @param {Object} selectedUnit - The selected unit data
 * @param {Array} peerUnits - Array of peer units for comparison
 * @param {string} categoryKey - The category key
 * @param {string} level - The level key
 */
function createStripplot(container, variable, selectedUnit, peerUnits, categoryKey, level) {
    const variableName = variable.replace('_PCT', '');
    const totalPct = calculatePeerTotalPct(peerUnits, categoryKey, variable);
    
    const plotContainer = createPlotContainer(container, variableName);
    const svg = createStripplotSVG(plotContainer);
    const xScale = createXScale();
    
    // Add subtle background rectangle behind all bars
    addBackgroundRectangle(svg, xScale);
    
    addXAxis(svg, xScale);
    addPeerStrips(svg, xScale, peerUnits, categoryKey, variable, totalPct);
    addSelectedStrip(svg, xScale, selectedUnit, categoryKey, variable);
    if (level !== 'country') {
        addTotalStrip(svg, xScale, totalPct);
    }
    handleTextCollisions(svg, xScale, selectedUnit[categoryKey][variable], totalPct);
}

/**
 * Calculate average of peer units for a variable
 * @param {Array} peerUnits - Array of peer units
 * @param {string} categoryKey - The category key
 * @param {string} variable - The variable name
 * @returns {number} The calculated average
 */
function calculatePeerAverage(peerUnits, categoryKey, variable) {
    const validValues = peerUnits
        .map(unit => unit[categoryKey][variable])
        .filter(value => value !== undefined && value !== null && !isNaN(value));
    
    return validValues.length > 0 
        ? validValues.reduce((sum, value) => sum + value, 0) / validValues.length 
        : 0;
}

/**
 * Create plot container with title
 * @param {Object} container - D3 selection of the container
 * @param {string} variableName - The variable name for display
 * @returns {Object} D3 selection of the plot container
 */
function createPlotContainer(container, variableName) {
    const plotContainer = container.append('div').attr('class', 'stripplot-item');
    
    plotContainer.append('h5')
        .attr('class', 'stripplot-title')
        .text(translateKeyToTitle(variableName));
    
    return plotContainer;
}

/**
 * Create SVG for stripplot
 * @param {Object} plotContainer - D3 selection of the plot container
 * @returns {Object} D3 selection of the SVG
 */
function createStripplotSVG(plotContainer) {
    return plotContainer.append('svg')
        .attr('class', 'stripplot-svg')
        .attr('width', 300)
        .attr('height', 100);
}

/**
 * Create x-scale for stripplot
 * @returns {Object} D3 scale function
 */
function createXScale() {
    return d3.scaleLinear()
        .domain([0, 1])
        .range([20, 280]);
}

/**
 * Add x-axis to SVG
 * @param {Object} svg - D3 selection of the SVG
 * @param {Object} xScale - The x-scale function
 */
function addXAxis(svg, xScale) {
    const xAxis = d3.axisBottom(xScale)
        .tickFormat(d3.format('.0%'))
        .tickValues([0, 1])
        .tickSize(0)
        .tickPadding(3);
    
    svg.append('g')
        .attr('class', 'x-axis')
        .attr('transform', 'translate(0, 60)')
        .call(xAxis)
        .call(g => g.select('.domain').remove());
}

// Add this at the top-level (outside any function) to ensure a single tooltip div exists
if (!document.getElementById('stripplot-tooltip')) {
    const tooltip = document.createElement('div');
    tooltip.id = 'stripplot-tooltip';
    tooltip.style.position = 'absolute';
    tooltip.style.pointerEvents = 'none';
    tooltip.style.background = 'rgba(0,0,0,0.85)';
    tooltip.style.color = '#fff';
    tooltip.style.padding = '6px 10px';
    tooltip.style.borderRadius = '4px';
    tooltip.style.fontSize = '13px';
    tooltip.style.zIndex = '9999';
    tooltip.style.display = 'none';
    document.body.appendChild(tooltip);
}

function showTooltip(html, event) {
    const tooltip = document.getElementById('stripplot-tooltip');
    tooltip.innerHTML = html;
    tooltip.style.display = 'block';
    tooltip.style.left = (event.pageX + 12) + 'px';
    tooltip.style.top = (event.pageY - 24) + 'px';
}

function hideTooltip() {
    const tooltip = document.getElementById('stripplot-tooltip');
    tooltip.style.display = 'none';
}

/**
 * Add peer unit strips to SVG
 * @param {Object} svg - D3 selection of the SVG
 * @param {Object} xScale - The x-scale function
 * @param {Array} peerUnits - Array of peer units
 * @param {string} categoryKey - The category key
 * @param {string} variable - The variable name
 */
function addPeerStrips(svg, xScale, peerUnits, categoryKey, variable, totalPct) {
    peerUnits.forEach(unit => {
        const value = unit[categoryKey][variable];
        if (value !== undefined && !isNaN(value)) {
            svg.append('line')
                .attr('class', 'peer-strip')
                .attr('x1', xScale(value))
                .attr('y1', 15)
                .attr('x2', xScale(value))
                .attr('y2', 55)
                .attr('stroke', 'var(--color-peer-lines)')
                .attr('stroke-width', 2)
                .on('mouseover', function(event) {
                    showTooltip(`<b>${unit.BASIC_INFO.NAME}</b><br>Valor: ${d3.format('.1%')(value)}<br>Total en pares: ${d3.format('.1%')(totalPct)}` , event);
                })
                .on('mousemove', function(event) {
                    showTooltip(`<b>${unit.BASIC_INFO.NAME}</b><br>Valor: ${d3.format('.1%')(value)}<br>Total en pares: ${d3.format('.1%')(totalPct)}` , event);
                })
                .on('mouseout', hideTooltip);
        }
    });
}

/**
 * Add selected unit strip to SVG
 * @param {Object} svg - D3 selection of the SVG
 * @param {Object} xScale - The x-scale function
 * @param {Object} selectedUnit - The selected unit data
 * @param {string} categoryKey - The category key
 * @param {string} variable - The variable name
 */
function addSelectedStrip(svg, xScale, selectedUnit, categoryKey, variable) {
    const selectedValue = selectedUnit[categoryKey][variable];
    if (selectedValue === undefined || isNaN(selectedValue)) return;
    
    svg.append('line')
        .attr('class', 'selected-strip')
        .attr('x1', xScale(selectedValue))
        .attr('y1', 15)
        .attr('x2', xScale(selectedValue))
        .attr('y2', 55)
        .attr('stroke', 'var(--color-accent)')
        .attr('stroke-width', 2)
        .on('mouseover', function(event) {
            showTooltip(`<b>${selectedUnit.BASIC_INFO.NAME}</b><br>${d3.format('.1%')(selectedValue)}` , event);
        })
        .on('mousemove', function(event) {
            showTooltip(`<b>${selectedUnit.BASIC_INFO.NAME}</b><br>${d3.format('.1%')(selectedValue)}` , event);
        })
        .on('mouseout', hideTooltip);
    
    addValueAnnotation(svg, xScale(selectedValue), selectedValue, 'var(--color-accent)');
}

/**
 * Add total strip to SVG
 * @param {Object} svg - D3 selection of the SVG
 * @param {Object} xScale - The x-scale function
 * @param {number} total - The total value
 */
function addTotalStrip(svg, xScale, totalPct) {
    svg.append('line')
        .attr('class', 'total-strip')
        .attr('x1', xScale(totalPct))
        .attr('y1', 15)
        .attr('x2', xScale(totalPct))
        .attr('y2', 55)
        .attr('stroke', 'var(--color-accent-secondary)')
        .attr('stroke-width', 2);
    addValueAnnotation(svg, xScale(totalPct), totalPct, 'var(--color-accent-secondary)');
}

/**
 * Add value annotation to SVG
 * @param {Object} svg - D3 selection of the SVG
 * @param {number} x - X position
 * @param {number} value - The value to display
 * @param {string} color - The text color
 */
function addValueAnnotation(svg, x, value, color) {
    svg.append('text')
        .attr('class', 'reference-annotation')
        .attr('x', x)
        .attr('y', 10)
        .attr('text-anchor', 'middle')
        .attr('fill', color)
        .attr('font-size', '12px')
        .attr('font-weight', '500')
        .text(d3.format('.0%')(value));
}

/**
 * Handle text collisions by adjusting text anchor points
 * @param {Object} svg - D3 selection of the SVG
 * @param {Object} xScale - The x-scale function
 * @param {number} selectedValue - The selected value
 * @param {number} total - The total value
 */
function handleTextCollisions(svg, xScale, selectedValue, totalPct) {
    if (selectedValue === undefined || isNaN(selectedValue)) return;
    
    const selectedX = xScale(selectedValue);
    const totalX = xScale(totalPct);
    
    const selectedText = svg.selectAll('.reference-annotation')
        .filter((d, i, nodes) => d3.select(nodes[i]).attr('fill') === 'var(--color-accent)');
    
    const totalText = svg.selectAll('.reference-annotation')
        .filter((d, i, nodes) => d3.select(nodes[i]).attr('fill') === 'var(--color-accent-secondary)');
    
    if (selectedX < totalX) {
        selectedText.attr('text-anchor', 'end');
        totalText.attr('text-anchor', 'start');
    } else if (selectedX > totalX) {
        selectedText.attr('text-anchor', 'start');
        totalText.attr('text-anchor', 'end');
    }
    // If they're exactly the same, keep center alignment
}

/**
 * Add a subtle background rectangle behind all bars
 * @param {Object} svg - D3 selection of the SVG
 * @param {Object} xScale - The x-scale function
 */
function addBackgroundRectangle(svg, xScale) {
    svg.append('rect')
        .attr('class', 'stripplot-background')
        .attr('x', xScale.range()[0])
        .attr('y', 15)
        .attr('width', xScale.range()[1] - xScale.range()[0])
        .attr('height', 40)
        .attr('fill', 'rgba(0, 0, 0, 0.03)') // Very subtle darker background
        .attr('rx', 2); // Slight rounded corners
}

// ============================================================================
// TRANSLATION AND MAPPING FUNCTIONS
// ============================================================================

/**
 * Translate dictionary keys into human-readable titles
 * @param {string} key - The raw dictionary key
 * @returns {string} Human-readable title
 */
function translateKeyToTitle(key) {
    const titleMap = {
        // Main categories (popup titles)
        'HIRING': '¿Qué tipo de vínculo laboral tienen los periodistas?',
        'PLATFORMS': "¿En qué plataformas publican?",
        'THEMES': '¿Cuáles son las temáticas de su agenda informativa?',
        'INCOME': '¿De dónde provienen sus ingresos?',
        "FINANCING": "¿De dónde provienen sus ingresos?",
        'THREATS': '¿Experimentaron agresiones o amenazas en 2024?',
  
        
        // Hiring subcategories
        'CONTRATO INDEFINIDO': 'Contrato Indefinido',
        'OTRAS': 'Otras Modalidades',
        'TRABAJO INDEPENDIENTE': 'Trabajo Independiente',
        'PRACTICA PROFESIONAL': 'Práctica Profesional',
        'CONTRATO LIMITADO': 'Contrato Limitado',
        'CONTRATO POR PIEZAS': 'Contrato por Piezas',
        'EMPLEO INFORMAL': 'Empleo Informal',
        'COMISIÓN': 'Comisión',
        'TRABAJO VOLUNTARIO': 'Trabajo Voluntario',
        
        // Platforms subcategories
        'RADIO': 'Radio',
        'REVISTA': 'Revista',
        'X': 'X (Twitter)',
        'INSTAGRAM': 'Instagram',
        'TIKTOK': 'TikTok',
        'PRINT': 'Impreso',
        'WHATSAPP': 'WhatsApp',
        'NEWSLETTER': 'Newsletter',
        'FACEBOOK': 'Facebook',
        'BLOG': 'Blog',
        'TWITCH': 'Twitch',
        'TELEGRAM': 'Telegram',
        'YOUTUBE': 'YouTube',
        'PODCAST': 'Podcast',
        'WEBSITE': 'Sitio Web',
        'TV': 'Televisión',
        
        // Themes subcategories
        'INVESTIGACIÓN': 'Investigación',
        'EMERGENCIAS': 'Emergencias',
        'MEDIO AMBIENTE': 'Medio Ambiente',
        'SOCIAL': 'Social',
        'SEGURIDAD': 'Seguridad',
        'ECONOMÍA': 'Economía',
        'DERECHOS': 'Derechos',
        'GOBIERNO': 'Gobierno',
        'SERVICIOS': 'Servicios',
        
        // Threats subcategories
        'CRIMEN ORGANIZADO': 'Crimen Organizado',
        'NO RECIBE': 'No Recibe',
        'JUDICIAL': 'Judicial',
        'FÍSICAS': 'Físicas',
        'AMENAZAS DIRECTAS': 'Amenazas Directas',
        'NO RESPONDE': 'No Responde',
        'ECONÓMICAS': 'Económicas',
        'AMENAZAS DIGITALES': 'Amenazas Digitales',

        // Income subcategories
        'MEMBRESÍAS': 'Membresías',
        'FINANCIACIÓN PÚBLICA': 'Financiación Pública',
        'VENTA DE PRODUCTOS': 'Venta de Productos',
        'CROWDFUNDING': 'Crowdfunding',
        'SUBSCRIPCIONES': 'Suscripciones',
        'CONTENIDO PARA CLIENTES': 'Contenido para Clientes',
        'PUBLIREPORTAJES': 'Publireportajes',
        'DONACIONES PARTICULARES': 'Donaciones Particulares',
        'PAUTA DE VENTA DIRECTA': 'Pauta de Venta Directa',
        'PAUTA PROGRAMÁTICA': 'Pauta Programática',
        'ORGANIZACIÓN DE EVENTOS': 'Organización de Eventos',
        'CONSULTORÍA': 'Consultoría',
        'CUSTOM_ANSWERS': 'Otras Respuestas',
        'SERVICIOS DE FORMACIÓN': 'Servicios de Formación',
        'SUBSIDIOS O GRANTS': 'Subsidios o Grants'
        
    };
    
    return titleMap[key] || key;
}

/**
 * Translate menu keys into descriptive subtitles
 * @param {string} key - The menu key
 * @returns {string} Descriptive subtitle
 */
function translateKeyToSubtitle(key) {
    const subtitleMap = {
        'HIRING': 'Porcentaje de medios que contratan periodistas mediante…',
        "INCOME": "Porcentaje de medios que reciben ingresos provenientes de…",
        'PLATFORMS': 'Porcentaje de medios que tienen presencia en…',
        'THEMES': 'Porcentaje de medios que cubren temas de…',
        'THREATS': 'Porcentaje de medios cuyos periodistas sufrieron…'
    };
    
    return subtitleMap[key] || '';
}

/**
 * Create inline legend integrated with subtitle text
 * @param {string} subtitle - The subtitle text
 * @param {string} selectedUnitName - Name of the selected unit
 * @param {Object} selectedUnit - The selected unit object
 * @param {string} level - The level key
 * @returns {Object} Object with text and legend elements
 */
function createInlineSubtitle(subtitle, selectedUnitName, selectedUnit, level) {
    if (!subtitle.includes('Porcentaje de medios')) {
        return { type: 'regular', text: subtitle };
    }
    
    const container = document.createElement('div');
    container.className = 'inline-subtitle-container';
    
    // First div: text before "Porcentaje de medios"
    const firstDiv = document.createElement('div');
    firstDiv.className = 'inline-subtitle-text';
    firstDiv.appendChild(document.createElement('span')).textContent = 'Porcentaje de medios ';
    
    // Second div: legends with remaining text in first legend
    const secondDiv = document.createElement('div');
    secondDiv.className = 'inline-subtitle-legends';
    
    const selectedLegend = createLegendItem('selected', 'en ' + selectedUnitName, subtitle);
    secondDiv.appendChild(selectedLegend);
    
    // Only add the average/peer legend if not country level
    if (level !== 'country') {
        const parentName = selectedUnit.BASIC_INFO.LEVEL === 'large_units' 
            ? selectedUnit.BASIC_INFO.PARENT.charAt(0).toUpperCase() + selectedUnit.BASIC_INFO.PARENT.slice(1)
            : selectedUnit.BASIC_INFO.PARENT;
        const averageLegend = createLegendItem('average', 'en ' + parentName);
        secondDiv.appendChild(averageLegend);
    }
    
    container.appendChild(firstDiv);
    container.appendChild(secondDiv);
    
    return { type: 'inline', element: container };
}

/**
 * Create a legend item
 * @param {string} type - The legend type ('selected' or 'average')
 * @param {string} text - The legend text
 * @param {string} remainingText - Optional remaining text for selected legend
 * @returns {HTMLElement} The legend item element
 */
function createLegendItem(type, text, remainingText = '') {
    const legend = document.createElement('div');
    legend.className = 'inline-legend-item';
    
    const color = document.createElement('div');
    color.className = `inline-legend-color ${type}`;
    
    const textElement = document.createElement('span');
    textElement.className = `inline-legend-text ${type}`;
    textElement.textContent = text;
    
    legend.appendChild(color);
    legend.appendChild(textElement);
    
    if (remainingText && type === 'selected') {
        const remainingElement = document.createElement('span');
        remainingElement.className = 'inline-legend-text remaining';
        remainingElement.textContent = ' ' + remainingText.replace('Porcentaje de medios ', '');
        legend.appendChild(remainingElement);
    }
    
    return legend;
}

// ============================================================================
// CSV DOWNLOAD FUNCTIONALITY
// ============================================================================

/**
 * Add download button to the content container
 * @param {HTMLElement} contentContainer - The content container
 * @param {string} categoryKey - The category key
 * @param {Object} selectedUnit - The selected unit object
 * @param {Array} peerUnits - Array of peer units
 */
function addDownloadButton(contentContainer, categoryKey, selectedUnit, peerUnits) {
    // Create footer div
    const footer = d3.select(contentContainer).append('div')
        .attr('class', 'footer');

    // Add logo section on the left
    footer.append('div')
        .attr('class', 'footer-logo')
        .html('<div class="logo-placeholder">LOGO</div>');

    // Add download buttons section on the right
    const downloadSection = footer.append('div')
        .attr('class', 'footer-downloads');

    // Add CSV download button
    downloadSection.append('a')
        .attr('class', 'download-csv-link')
        .html('Descargar CSV <span class="download-arrow"></span>')
        .on('click', () => downloadCSV(categoryKey, selectedUnit, peerUnits));

    // Add image download button
    downloadSection.append('a')
        .attr('class', 'download-image-link')
        .html('Descargar imagen <span class="download-arrow"></span>')
        .on('click', () => downloadPNG(contentContainer, categoryKey, selectedUnit));
}

/**
 * Download CSV with absolute values
 * @param {string} categoryKey - The category key
 * @param {Object} selectedUnit - The selected unit object
 * @param {Array} peerUnits - Array of peer units
 */
function downloadCSV(categoryKey, selectedUnit, peerUnits) {
    const allUnits = [selectedUnit, ...peerUnits];
    const csvData = generateCSVData(categoryKey, allUnits);
    const filename = generateFilename(categoryKey, selectedUnit);
    
    downloadFile(csvData, filename, 'text/csv');
}

/**
 * Generate CSV data with absolute values
 * @param {string} categoryKey - The category key
 * @param {Array} units - Array of all units to include
 * @returns {string} CSV string
 */
function generateCSVData(categoryKey, units) {
    // Get all absolute value variables for this category (excluding _PCT versions)
    const variables = Object.keys(units[0][categoryKey])
        .filter(key => !key.endsWith('_PCT'))
        .sort();
    
    // Create headers
    const headers = [
        'Unidad',
        'Región/Estado',
        ...variables.map(v => translateKeyToTitle(v))
    ];
    
    // Create rows
    const rows = units.map(unit => {
        const basicInfo = unit.BASIC_INFO;
        const categoryData = unit[categoryKey];
        
        const row = [
            basicInfo.NAME || basicInfo.KEY,
            basicInfo.PARENT || basicInfo.state,
            ...variables.map(variable => {
                return categoryData[variable] !== undefined && categoryData[variable] !== null 
                    ? categoryData[variable] 
                    : 0;
            })
        ];
        
        return row;
    });
    
    // Convert to CSV
    return convertToCSV([headers, ...rows]);
}

/**
 * Convert array of arrays to CSV string
 * @param {Array} data - Array of arrays representing rows
 * @returns {string} CSV string
 */
function convertToCSV(data) {
    return data.map(row => 
        row.map(cell => {
            // Escape quotes and wrap in quotes if contains comma, quote, or newline
            const cellStr = String(cell);
            if (cellStr.includes(',') || cellStr.includes('"') || cellStr.includes('\n')) {
                return `"${cellStr.replace(/"/g, '""')}"`;
            }
            return cellStr;
        }).join(',')
    ).join('\n');
}

/**
 * Generate filename for download
 * @param {string} categoryKey - The category key
 * @param {Object} selectedUnit - The selected unit object
 * @returns {string} Filename
 */
function generateFilename(categoryKey, selectedUnit) {
    const basicInfo = selectedUnit.BASIC_INFO;
    const unitName = basicInfo.NAME || basicInfo.KEY;
    const categoryTitle = translateKeyToTitle(categoryKey).replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, '_');
    const date = new Date().toISOString().split('T')[0];
    
    return `datos_${categoryTitle}_${unitName}_${date}.csv`;
}

/**
 * Trigger file download
 * @param {string} content - File content
 * @param {string} filename - Filename
 * @param {string} mimeType - MIME type
 */
function downloadFile(content, filename, mimeType) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Clean up
    setTimeout(() => URL.revokeObjectURL(url), 100);
}

// ============================================================================
// PNG EXPORT FUNCTIONALITY
// ============================================================================

/**
 * Download popup content as PNG (excluding footer)
 * @param {HTMLElement} contentContainer - The content container
 * @param {string} categoryKey - The category key
 * @param {Object} selectedUnit - The selected unit object
 */
function downloadPNG(contentContainer, categoryKey, selectedUnit) {
    // Check if html2canvas is available
    if (typeof html2canvas === 'undefined') {
        console.error('html2canvas library not loaded');
        alert('Error: html2canvas library not available');
        return;
    }

    // Find the popup container (parent of contentContainer)
    const popup = contentContainer.closest('.menu-popup');
    if (!popup) {
        console.error('Popup container not found');
        alert('Error: No se encontró el contenedor del popup');
        return;
    }

    // Create a temporary container for capture (excluding footer)
    const tempContainer = createTempContainerForCapture(popup);
    
    // Configure html2canvas options
    const options = {
        backgroundColor: '#F9F1E3', // Match the background color
        scale: 2, // Higher resolution
        useCORS: true,
        allowTaint: true,
        width: tempContainer.scrollWidth,
        height: tempContainer.scrollHeight,
        scrollX: 0,
        scrollY: 0,
        windowWidth: tempContainer.scrollWidth,
        windowHeight: tempContainer.scrollHeight
    };

    // Capture the content
    html2canvas(tempContainer, options).then(canvas => {
        // Convert canvas to blob
        canvas.toBlob(blob => {
            // Generate filename
            const filename = generatePNGFilename(categoryKey, selectedUnit);
            
            // Download the image
            downloadImageFile(blob, filename);
            
            // Clean up temporary container
            document.body.removeChild(tempContainer);
        }, 'image/png', 0.95);
    }).catch(error => {
        console.error('Error capturing image:', error);
        alert('Error al generar la imagen');
        document.body.removeChild(tempContainer);
    });
}

/**
 * Create temporary container for image capture (excluding footer)
 * @param {HTMLElement} popup - The original popup container
 * @returns {HTMLElement} Temporary container without footer
 */
function createTempContainerForCapture(popup) {
    // Clone the popup container
    const tempContainer = popup.cloneNode(true);
    
    // Remove the footer from the clone
    const footer = tempContainer.querySelector('.footer');
    if (footer) {
        footer.remove();
    }
    
    // Remove the close button from the clone
    const closeButton = tempContainer.querySelector('.menu-popup-close');
    if (closeButton) {
        closeButton.remove();
    }
    
    // Apply the temporary capture class
    tempContainer.className = 'temp-popup-capture';
    
    // Add to body temporarily
    document.body.appendChild(tempContainer);
    
    return tempContainer;
}

/**
 * Generate filename for PNG download
 * @param {string} categoryKey - The category key
 * @param {Object} selectedUnit - The selected unit object
 * @returns {string} Filename
 */
function generatePNGFilename(categoryKey, selectedUnit) {
    const basicInfo = selectedUnit.BASIC_INFO;
    const unitName = basicInfo.NAME || basicInfo.KEY;
    const categoryTitle = translateKeyToTitle(categoryKey).replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, '_');
    const date = new Date().toISOString().split('T')[0];
    
    return `imagen_${categoryTitle}_${unitName}_${date}.png`;
}

/**
 * Download image file
 * @param {Blob} blob - Image blob
 * @param {string} filename - Filename
 */
function downloadImageFile(blob, filename) {
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Clean up
    setTimeout(() => URL.revokeObjectURL(url), 100);
}

// ============================================================================
// MODULE EXPORTS
// ============================================================================

// Export the function for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { createDataVisualization };
}

// Update calculatePeerTotal to use observed values and denominators
function calculatePeerTotalPct(peerUnits, categoryKey, variable) {
    let totalValue = 0;
    let totalDenominator = 0;
    peerUnits.forEach(unit => {
        const value = unit[categoryKey][variable.replace('_PCT', '')];
        const denominator = unit.BASIC_INFO.NEWS_ORG_COUNT;
        if (typeof value === 'number' && !isNaN(value) && typeof denominator === 'number' && denominator > 0) {
            totalValue += value;
            totalDenominator += denominator;
        }
    });
    return totalDenominator > 0 ? totalValue / totalDenominator : 0;
}
