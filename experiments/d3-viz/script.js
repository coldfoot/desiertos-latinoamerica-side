// D3 Experiment - Main Application Controller
// Handles data loading, UI management, and user interactions

// ============================================================================
// GLOBAL STATE
// ============================================================================

let data;
let selectedUnit = null;

// ============================================================================
// INITIALIZATION
// ============================================================================

/**
 * Initialize the application when the page loads
 */
document.addEventListener('DOMContentLoaded', loadData);

/**
 * Load and initialize the application data
 */
function loadData() {
    console.log("Loading data.json with D3...");
    
    d3.json('../../data.json')
        .then(handleDataLoadSuccess)
        .catch(handleDataLoadError);
}

/**
 * Handle successful data loading
 * @param {Object} jsonData - The loaded JSON data
 */
function handleDataLoadSuccess(jsonData) {
    data = jsonData;
    console.log("Data loaded successfully with D3!");
    console.log("Available countries:", Object.keys(data));
    
    // Data preprocessing is no longer needed since _PCT values are already in data.json
    initializeUI();
    handleHashRoute();
}

/**
 * Handle data loading errors
 * @param {Error} error - The error object
 */
function handleDataLoadError(error) {
    console.error("Error loading data with D3:", error);
}

/**
 * Initialize the user interface
 */
function initializeUI() {
    populateCountrySelector(Object.keys(data));
    populateLevelSelector();
    setupEventListeners();
    disableInitialControls();
}

/**
 * Disable controls that should be disabled initially
 */
function disableInitialControls() {
    const controls = ['#level-select', '#unit-search', '#draw-button'];
    controls.forEach(selector => {
        d3.select(selector).property('disabled', true);
    });
}

// ============================================================================
// UI POPULATION
// ============================================================================

/**
 * Populate the country selector dropdown
 * @param {Array} countries - Array of country names
 */
function populateCountrySelector(countries) {
    const countrySelect = d3.select('#country-select');
    clearAndAddDefaultOption(countrySelect, 'Seleccione un país');
    
    countrySelect.selectAll('option.country-option')
        .data(countries)
        .enter()
        .append('option')
        .attr('class', 'country-option')
        .attr('value', d => d)
        .text(capitalizeFirstLetter);
}

/**
 * Populate the level selector dropdown
 */
function populateLevelSelector() {
    const levels = [
        { value: 'small_units', label: 'Unidades pequeñas' },
        { value: 'large_units', label: 'Unidades grandes' },
        { value: 'country', label: 'País' }
    ];
    
    const levelSelect = d3.select('#level-select');
    clearAndAddDefaultOption(levelSelect, 'Seleccione un nivel');
    
    levelSelect.selectAll('option.level-option')
        .data(levels)
        .enter()
        .append('option')
        .attr('class', 'level-option')
        .attr('value', d => d.value)
        .text(d => d.label);
}

/**
 * Clear selector and add default option
 * @param {Object} selector - D3 selection of the selector
 * @param {string} defaultText - Text for the default option
 */
function clearAndAddDefaultOption(selector, defaultText) {
    selector.selectAll('option').remove();
    selector.append('option').attr('value', '').text(defaultText);
}

/**
 * Capitalize the first letter of a string
 * @param {string} str - The string to capitalize
 * @returns {string} The capitalized string
 */
function capitalizeFirstLetter(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Populate the unit datalist for autocomplete
 * @param {Array} units - Array of unit objects
 * @param {string} level - The current level
 */
function populateUnitDatalist(units, level) {
    const datalist = d3.select('#unit-options');
    datalist.selectAll('option').remove();
    
    // Store units data for later lookup
    window.currentUnits = units;
    
    datalist.selectAll('option')
        .data(units)
        .enter()
        .append('option')
        .attr('value', d => getUnitDisplayName(d, level))
        .attr('data-key', d => d.BASIC_INFO.KEY);
}

/**
 * Get the display name for a unit based on level
 * @param {Object} unit - The unit object
 * @param {string} level - The current level
 * @returns {string} The display name
 */
function getUnitDisplayName(unit, level) {
    return level === 'large_units' 
        ? unit.BASIC_INFO.NAME 
        : `${unit.BASIC_INFO.NAME} - ${unit.BASIC_INFO.PARENT}`;
}

// ============================================================================
// EVENT HANDLING
// ============================================================================

/**
 * Set up all event listeners
 */
function setupEventListeners() {
    setupSelectorListeners();
    setupFormListeners();
    setupInputListeners();
    setupButtonListeners();
}

/**
 * Set up selector change listeners
 */
function setupSelectorListeners() {
    d3.select('#country-select').on('change', updateLevelSelector);
    d3.select('#level-select').on('change', updateUnitSelector);
}

/**
 * Set up form submission listeners
 */
function setupFormListeners() {
    d3.select('#unit-form').on('submit', function(e) {
        e.preventDefault();
        const searchContent = d3.select('#unit-search').property('value');
        if (searchContent) {
            handleUnitSelection();
        }
    });
}

/**
 * Set up input change listeners
 */
function setupInputListeners() {
    d3.select('#unit-search').on('change', handleUnitSelection);
}

/**
 * Set up button click listeners
 */
function setupButtonListeners() {
    d3.select('#draw-button').on('click', handleDrawButton);
    d3.select('#share-button').on('click', handleShareButton);
}

// ============================================================================
// SELECTOR UPDATES
// ============================================================================

/**
 * Update level selector based on country selection
 */
function updateLevelSelector() {
    const selectedCountry = getSelectedCountry();
    
    if (!selectedCountry) {
        disableLevelSelector();
        return;
    }
    
    enableLevelSelector();
}

/**
 * Update unit selector based on level selection
 */
function updateUnitSelector() {
    const { selectedCountry, selectedLevel } = getSelectedValues();
    
    if (!selectedCountry || !selectedLevel) {
        disableUnitSelector();
        return;
    }
    
    const countryData = data[selectedCountry];
    if (!isValidCountryData(countryData, selectedLevel)) {
        disableUnitSelector();
        return;
    }
    
    // Auto-select for country level
    if (selectedLevel === 'country') {
        const units = countryData[selectedLevel];
        if (units && units.length === 1) {
            updateSelectedUnit(units[0]);
            populateUnitDatalist(units, selectedLevel);
            // Lock the unit selector
            d3.select('#unit-search').property('disabled', true);
            return;
        }
    }
    
    enableUnitSelector(countryData[selectedLevel], selectedLevel);
    // Make sure the unit selector is enabled for other levels
    d3.select('#unit-search').property('disabled', false);
}

/**
 * Check if country data is valid for the selected level
 * @param {Object} countryData - The country data
 * @param {string} selectedLevel - The selected level
 * @returns {boolean} True if valid, false otherwise
 */
function isValidCountryData(countryData, selectedLevel) {
    return countryData && countryData[selectedLevel];
}

/**
 * Disable level selector and clear unit selector
 */
function disableLevelSelector() {
    d3.select('#level-select').property('disabled', true);
    clearUnitSelector();
}

/**
 * Enable level selector and reset selection
 */
function enableLevelSelector() {
    d3.select('#level-select').property('disabled', false);
    d3.select('#level-select').property('value', '');
    clearUnitSelector();
}

/**
 * Disable unit selector
 */
function disableUnitSelector() {
    d3.select('#unit-search').property('disabled', true);
    clearUnitSelector();
}

/**
 * Enable unit selector and populate datalist
 * @param {Array} units - Array of units
 * @param {string} level - The current level
 */
function enableUnitSelector(units, level) {
    d3.select('#unit-search').property('disabled', false);
    populateUnitDatalist(units, level);
}

// ============================================================================
// UNIT SELECTION
// ============================================================================

/**
 * Handle unit selection from search input
 */
function handleUnitSelection() {
    const searchValue = getSearchValue();
    const { selectedLevel } = getSelectedValues();
    
    if (!isValidSearch(searchValue)) {
        clearSelectedUnit();
        return;
    }
    
    const foundUnit = findMatchingUnit(searchValue, selectedLevel);
    updateSelectedUnit(foundUnit);
}

/**
 * Get the current search value
 * @returns {string} The search value
 */
function getSearchValue() {
    return d3.select('#unit-search').property('value');
}

/**
 * Check if search value is valid
 * @param {string} searchValue - The search value to validate
 * @returns {boolean} True if valid, false otherwise
 */
function isValidSearch(searchValue) {
    return searchValue && window.currentUnits;
}

/**
 * Find a matching unit based on search value and level
 * @param {string} searchValue - The search value
 * @param {string} selectedLevel - The selected level
 * @returns {Object|null} The found unit or null
 */
function findMatchingUnit(searchValue, selectedLevel) {
    return window.currentUnits.find(unit => {
        const displayName = getUnitDisplayName(unit, selectedLevel);
        return displayName === searchValue;
    });
}

/**
 * Update the selected unit and button state
 * @param {Object|null} foundUnit - The found unit or null
 */
function updateSelectedUnit(foundUnit) {
    if (foundUnit) {
        selectedUnit = foundUnit;
        logSelectedUnit(foundUnit);
        enableDrawButton();
    } else {
        clearSelectedUnit();
        console.log('No matching unit found for:', getSearchValue());
    }
}

/**
 * Clear the selected unit and disable draw button
 */
function clearSelectedUnit() {
    selectedUnit = null;
    disableDrawButton();
}

/**
 * Log selected unit information
 * @param {Object} unit - The selected unit
 */
function logSelectedUnit(unit) {
    console.log('Selected unit:', unit);
    console.log('Unit key:', unit.BASIC_INFO.KEY);
}

/**
 * Enable the draw button
 */
function enableDrawButton() {
    d3.select('#draw-button').property('disabled', false);
}

/**
 * Disable the draw button
 */
function disableDrawButton() {
    d3.select('#draw-button').property('disabled', true);
}

// ============================================================================
// DRAW BUTTON HANDLING
// ============================================================================

/**
 * Handle draw button click
 */
function handleDrawButton() {
    const { selectedCountry, selectedLevel } = getSelectedValues();
    const searchValue = getSearchValue();
    
    logSelectedValues(selectedCountry, selectedLevel, searchValue);
    logSelectedUnitDetails();
    
    if (selectedUnit) {
        // Build hash based on selection
        let hash = `/${selectedCountry}`;
        if (selectedLevel === 'large_units') {
            hash += `/${normalize(selectedUnit.BASIC_INFO.NAME)}`;
        } else if (selectedLevel === 'small_units') {
            hash += `/${normalize(selectedUnit.BASIC_INFO.PARENT)}/${normalize(selectedUnit.BASIC_INFO.NAME)}`;
        }
        window.location.hash = hash;
        // The router will handle visualization
    }
}

/**
 * Log all selected values for debugging
 * @param {string} selectedCountry - The selected country
 * @param {string} selectedLevel - The selected level
 * @param {string} searchValue - The search value
 */
function logSelectedValues(selectedCountry, selectedLevel, searchValue) {
    console.log('=== SELECTED VALUES ===');
    console.log('Country:', selectedCountry);
    console.log('Level:', selectedLevel);
    console.log('Unit Search Value:', searchValue);
    console.log('Selected Unit Object:', selectedUnit);
}

/**
 * Log detailed information about the selected unit
 */
function logSelectedUnitDetails() {
    if (!selectedUnit) return;
    
    const info = selectedUnit.BASIC_INFO;
    console.log('Unit Key:', info.KEY);
    console.log('Unit Name:', info.NAME);
    console.log('Unit Parent:', info.PARENT);
    console.log('Unit Classification:', info.classification);
    console.log('Unit Population:', info.population);
    console.log('Unit Area:', info.area);
    console.log('Unit News Org Count:', info.news_org_count);
    console.log('Unit Journalist Count:', info.journalist_count);
}

/**
 * Execute the data visualization
 * @param {string} selectedCountry - The selected country
 * @param {string} selectedLevel - The selected level
 */
function executeDataVisualization(selectedCountry, selectedLevel) {
    console.log('=== READY FOR DATA VIZ ===');
    console.log('Calling createDataVisualization function...');
    
    const countryData = data[selectedCountry];
    const unitKey = selectedUnit.BASIC_INFO.KEY;
    
    createDataVisualization(countryData, selectedLevel, unitKey);
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Get selected values from form controls
 * @returns {Object} Object containing selected country and level
 */
function getSelectedValues() {
    return {
        selectedCountry: getSelectedCountry(),
        selectedLevel: getSelectedLevel()
    };
}

/**
 * Get the selected country
 * @returns {string} The selected country
 */
function getSelectedCountry() {
    return d3.select('#country-select').property('value');
}

/**
 * Get the selected level
 * @returns {string} The selected level
 */
function getSelectedLevel() {
    return d3.select('#level-select').property('value');
}

/**
 * Clear the unit selector
 */
function clearUnitSelector() {
    const unitSearch = d3.select('#unit-search');
    unitSearch.property('value', '');
    unitSearch.property('disabled', true);
    
    const datalist = d3.select('#unit-options');
    datalist.selectAll('option').remove();
    
    window.currentUnits = null;
    selectedUnit = null;
    disableDrawButton();
}

// === HASH ROUTER FOR URL-DRIVEN VISUALIZATION ===
window.addEventListener('hashchange', handleHashRoute);

function handleHashRoute() {
    if (!data) return; // Data not loaded yet
    const hash = window.location.hash.slice(1); // Remove '#'
    const parts = hash.split('/').filter(Boolean);
    if (parts.length === 0) return; // No hash, do nothing

    const country = parts[0]?.toLowerCase();
    if (!data[country]) return;

    // Set dropdowns to match route
    d3.select('#country-select').property('value', country);
    updateLevelSelector();

    // --- DYNAMIC OG DESCRIPTION ---
    let ogDesc = 'Explora visualizaciones interactivas de datos sobre desiertos y periodismo local en Latinoamérica.';
    let ogTitle = 'DESIERTOS - D3 Experiment';
    let match = null; // Declare match in outer scope

    if (parts.length === 1) {
        // Country-level viz
        d3.select('#level-select').property('value', 'country');
        updateUnitSelector();
        const units = data[country]['country'];
        if (units && units.length === 1) {
            match = units[0];
            updateSelectedUnit(match);
            d3.select('#unit-search').property('value', getUnitDisplayName(match, 'country'));
            createDataVisualization(data[country], 'country', match.BASIC_INFO.KEY);
            ogDesc = `Visualización de datos para ${capitalizeFirstLetter(country)}`;
            ogTitle = `Desiertos: ${capitalizeFirstLetter(country)}`;
        }
    } else if (parts.length === 2) {
        // Unidad mayor (large_units)
        d3.select('#level-select').property('value', 'large_units');
        updateUnitSelector();
        const units = data[country]['large_units'];
        match = units.find(u => normalize(u.BASIC_INFO.NAME) === normalize(parts[1]));
        if (match) {
            updateSelectedUnit(match);
            d3.select('#unit-search').property('value', getUnitDisplayName(match, 'large_units'));
            createDataVisualization(data[country], 'large_units', match.BASIC_INFO.KEY);
            ogDesc = `Visualización de datos para ${match.BASIC_INFO.NAME}, ${capitalizeFirstLetter(country)}`;
            ogTitle = `Desiertos: ${match.BASIC_INFO.NAME}, ${capitalizeFirstLetter(country)}`;
        }
    } else if (parts.length === 3) {
        // Unidad menor (small_units)
        d3.select('#level-select').property('value', 'small_units');
        updateUnitSelector();
        const units = data[country]['small_units'];
        match = units.find(u => normalize(u.BASIC_INFO.NAME) === normalize(parts[2]) && normalize(u.BASIC_INFO.PARENT) === normalize(parts[1]));
        if (match) {
            updateSelectedUnit(match);
            d3.select('#unit-search').property('value', getUnitDisplayName(match, 'small_units'));
            createDataVisualization(data[country], 'small_units', match.BASIC_INFO.KEY);
            ogDesc = `Visualización de datos para ${match.BASIC_INFO.NAME}, ${match.BASIC_INFO.PARENT}, ${capitalizeFirstLetter(country)}`;
            ogTitle = `Desiertos: ${match.BASIC_INFO.NAME}, ${match.BASIC_INFO.PARENT}, ${capitalizeFirstLetter(country)}`;
        }
    }

    // Update og:description meta tag
    const ogMeta = document.getElementById('og-description');
    if (ogMeta) ogMeta.setAttribute('content', ogDesc);
    
    // Update og:title meta tag
    const ogTitleMeta = document.getElementById('og-title');
    if (ogTitleMeta) ogTitleMeta.setAttribute('content', ogTitle);
}

// Helper to normalize names for matching (lowercase, remove accents, spaces, etc.)
function normalize(str) {
    return (str || '').toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '').replace(/\s+/g, '');
}

/**
 * Handle share button click
 */
function handleShareButton() {
    const frozenUrl = getFrozenUrlFromHash();
    copyToClipboard(frozenUrl);
}

/**
 * Generate frozen URL from current hash
 */
function getFrozenUrlFromHash() {
    const hash = window.location.hash.slice(1); // Remove '#'
    const parts = hash.split('/').filter(Boolean);
    const basePath = '/desiertos-latinoamerica/experiments/d3-viz/static-pages/';

    // Helper for normalization (same as Python)
    function normalizeForFilename(text) {
        return (text || '')
            .toLowerCase()
            .normalize('NFD')
            .replace(/\p{Diacritic}/gu, '')
            .replace(/\s+/g, '-')
            .replace(/[^a-z0-9-]/g, '');
    }

    if (parts.length === 0) {
        return window.location.origin + basePath + 'index.html';
    }

    // Data-driven mapping
    let filename = '';
    if (parts.length === 1) {
        // Country level
        const country = parts[0];
        filename = normalizeForFilename(country) + '.html';
    } else if (parts.length === 2) {
        // Region level
        const country = parts[0];
        const region = parts[1];
        // Find the region in data
        let regionName = region;
        if (data && data[country] && data[country].large_units) {
            const match = data[country].large_units.find(r => normalize(r.BASIC_INFO.NAME) === normalize(region));
            if (match) regionName = match.BASIC_INFO.NAME;
        }
        filename = normalizeForFilename(country) + '-' + normalizeForFilename(regionName) + '.html';
    } else if (parts.length === 3) {
        // City level
        const country = parts[0];
        const region = parts[1];
        const city = parts[2];
        // Find the region and city in data
        let regionName = region;
        let cityName = city;
        if (data && data[country] && data[country].large_units && data[country].small_units) {
            const regionMatch = data[country].large_units.find(r => normalize(r.BASIC_INFO.NAME) === normalize(region));
            if (regionMatch) regionName = regionMatch.BASIC_INFO.NAME;
            const cityMatch = data[country].small_units.find(
                c => normalize(c.BASIC_INFO.NAME) === normalize(city) && normalize(c.BASIC_INFO.PARENT) === normalize(regionName)
            );
            if (cityMatch) cityName = cityMatch.BASIC_INFO.NAME;
        }
        filename = normalizeForFilename(country) + '-' + normalizeForFilename(regionName) + '-' + normalizeForFilename(cityName) + '.html';
    } else {
        // Fallback: normalize all parts
        filename = parts.map(normalizeForFilename).join('-') + '.html';
    }

    return window.location.origin + basePath + filename;
}

/**
 * Copy text to clipboard
 */
function copyToClipboard(text) {
    if (navigator.clipboard && window.isSecureContext) {
        // Use modern clipboard API
        navigator.clipboard.writeText(text).then(() => {
            showShareSuccess();
        }).catch(() => {
            fallbackCopyToClipboard(text);
        });
    } else {
        // Fallback for older browsers
        fallbackCopyToClipboard(text);
    }
}

/**
 * Fallback copy method for older browsers
 */
function fallbackCopyToClipboard(text) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    try {
        document.execCommand('copy');
        showShareSuccess();
    } catch (err) {
        console.error('Fallback: Oops, unable to copy', err);
        showShareError(text);
    }
    
    document.body.removeChild(textArea);
}

/**
 * Show success message for share
 */
function showShareSuccess() {
    const shareButton = d3.select('#share-button');
    const originalText = shareButton.text();
    
    shareButton.text('¡Copiado!').style('background', '#45a049');
    
    setTimeout(() => {
        shareButton.text(originalText).style('background', '#4CAF50');
    }, 2000);
}

/**
 * Show error message for share (with manual copy option)
 */
function showShareError(text) {
    const url = prompt('Copia este enlace manualmente:', text);
    if (url) {
        showShareSuccess();
    }
} 