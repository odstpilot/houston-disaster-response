// Configuration and Constants
// Environment variables are loaded by env.js and available as window.ENV
const getEnvVar = (key, defaultValue = null) => {
    const value = window.ENV?.[key] || defaultValue;
    if (key === 'GOOGLE_MAPS_API_KEY') {
        console.log('Loading Google Maps API Key:', value ? value.substring(0, 10) + '...' : 'Not found');
    }
    return value;
};

const CONFIG = {
    // API Endpoints (these would be replaced with actual API endpoints)
    API: {
        WEATHER: 'https://api.weather.gov/gridpoints/HGX/',
        FLOOD: 'https://water.weather.gov/ahps2/hydrograph.php?wfo=hgx',
        AIR_QUALITY: 'https://www.airnow.gov/api/',
        TRAFFIC: 'https://traffic.houstontranstar.org/api/',
        OUTAGES: 'https://api.centerpointenergy.com/outages/',
        LLM: 'https://api.openai.com/v1/chat/completions',
        GEOCODING: 'https://maps.googleapis.com/maps/api/geocode/json'
    },
    
    // Google Maps Configuration - Using Environment Variables
    GOOGLE_MAPS: {
        API_KEY: getEnvVar('GOOGLE_MAPS_API_KEY', ''),
        LIBRARIES: ['places', 'geometry', 'drawing'],
        MAP_ID: 'houston_disaster_map' // Optional: for custom styling
    },
    
    // Houston-specific coordinates
    HOUSTON_CENTER: {
        lat: 29.7604,
        lng: -95.3698
    },
    
    // Emergency contacts
    EMERGENCY_CONTACTS: {
        EMERGENCY: '911',
        NON_EMERGENCY: '713-884-3131',
        HOUSTON_311: '311',
        RED_CROSS: '713-526-8300',
        FEMA: '1-800-621-3362',
        POISON_CONTROL: '1-800-222-1222'
    },
    
    // Disaster types configuration
    DISASTERS: {
        hurricane: {
            name: 'Hurricane',
            icon: 'fa-hurricane',
            color: 'red',
            checklist: [
                'Monitor weather updates from NWS Houston/Galveston',
                'Know your evacuation zone (A, B, or C)',
                'Fill vehicle gas tanks when storm is 48 hours out',
                'Secure outdoor furniture and decorations',
                'Stock up on water (1 gallon/person/day for 7 days)',
                'Charge all electronic devices and backup batteries',
                'Fill bathtubs with water for sanitation',
                'Board windows if in evacuation zone',
                'Review insurance policies',
                'Document property with photos/video'
            ]
        },
        flood: {
            name: 'Flooding',
            icon: 'fa-water',
            color: 'blue',
            checklist: [
                'Know your flood zone designation',
                'Monitor bayou levels via Harris County Flood Warning System',
                'Move vehicles to higher ground',
                'Elevate furniture and valuables',
                'Clear storm drains near your property',
                'Have sandbags ready if in flood-prone area',
                'Know multiple evacuation routes',
                'Turn off utilities if flooding is imminent',
                'Never drive through flooded streets',
                'Document flood damage immediately'
            ]
        },
        heat: {
            name: 'Extreme Heat',
            icon: 'fa-temperature-high',
            color: 'orange',
            checklist: [
                'Stay hydrated - drink water regularly',
                'Locate nearest cooling centers',
                'Check on elderly neighbors',
                'Avoid outdoor activities 10am-4pm',
                'Wear light-colored, loose clothing',
                'Never leave children or pets in vehicles',
                'Monitor for heat exhaustion symptoms',
                'Keep curtains closed during day',
                'Use fans to circulate air',
                'Know signs of heat stroke'
            ]
        },
        freeze: {
            name: 'Winter Storm',
            icon: 'fa-snowflake',
            color: 'cyan',
            checklist: [
                'Wrap exposed pipes with insulation',
                'Drip faucets during freeze',
                'Open cabinet doors under sinks',
                'Locate main water shut-off valve',
                'Stock up on non-perishable food',
                'Have alternative heating source ready',
                'Charge all devices before storm',
                'Bring pets indoors',
                'Cover plants and outdoor faucets',
                'Monitor ERCOT grid conditions'
            ]
        },
        chemical: {
            name: 'Chemical Emergency',
            icon: 'fa-radiation',
            color: 'yellow',
            checklist: [
                'Know shelter-in-place procedures',
                'Seal windows and doors with plastic/tape',
                'Turn off HVAC systems',
                'Monitor emergency alert system',
                'Have battery-powered radio ready',
                'Know wind direction',
                'Identify safe room (interior, no windows)',
                'Keep emergency supplies in safe room',
                'Follow evacuation orders immediately',
                'Avoid using elevators'
            ]
        },
        tornado: {
            name: 'Tornado',
            icon: 'fa-wind',
            color: 'purple',
            checklist: [
                'Identify safe room (interior, lowest floor)',
                'Monitor weather alerts',
                'Have emergency kit in safe room',
                'Practice tornado drills with family',
                'Know difference: watch vs warning',
                'Wear shoes during tornado warning',
                'Protect head with helmet if available',
                'Stay away from windows',
                'If in vehicle, seek sturdy shelter',
                'Never try to outrun tornado in vehicle'
            ]
        }
    },
    
    // Houston neighborhoods with flood risk levels
    NEIGHBORHOODS: {
        'downtown': { floodRisk: 'moderate', evacuationZone: 'None' },
        'heights': { floodRisk: 'low', evacuationZone: 'None' },
        'montrose': { floodRisk: 'moderate', evacuationZone: 'None' },
        'memorial': { floodRisk: 'high', evacuationZone: 'None' },
        'katy': { floodRisk: 'moderate', evacuationZone: 'None' },
        'sugarland': { floodRisk: 'moderate', evacuationZone: 'None' },
        'woodlands': { floodRisk: 'low', evacuationZone: 'None' },
        'pearland': { floodRisk: 'moderate', evacuationZone: 'None' },
        'clearlake': { floodRisk: 'high', evacuationZone: 'B' }
    },
    
    // Language translations
    LANGUAGES: {
        en: 'English',
        es: 'Español',
        vi: 'Tiếng Việt',
        zh: '中文'
    },
    
    // Local storage keys
    STORAGE_KEYS: {
        USER_PROFILE: 'hdr_user_profile',
        CHECKLIST_PROGRESS: 'hdr_checklist_progress',
        NOTIFICATIONS: 'hdr_notifications',
        OFFLINE_DATA: 'hdr_offline_data',
        LANGUAGE: 'hdr_language'
    }
};

// Initialize configuration when secure environment is ready
function initializeConfig() {
    console.log('🔧 Initializing configuration with secure environment');
    
    // Update the API key with the secure value
    if (window.ENV && window.ENV.GOOGLE_MAPS_API_KEY) {
        CONFIG.GOOGLE_MAPS.API_KEY = window.ENV.GOOGLE_MAPS_API_KEY;
        console.log('✅ Google Maps API key loaded securely');
    } else {
        console.warn('⚠️  Google Maps API key not found in environment');
    }
    
    // Freeze the configuration to prevent modifications
    Object.freeze(CONFIG);
    
    // Notify that config is ready
    window.dispatchEvent(new CustomEvent('configReady', { detail: CONFIG }));
}

// Listen for environment configuration to be ready
window.addEventListener('envConfigReady', () => {
    initializeConfig();
});

// If environment is already ready, initialize immediately
if (window.ENV) {
    initializeConfig();
}
