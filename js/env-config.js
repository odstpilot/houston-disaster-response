// Runtime Environment Configuration
// This file is used when .env files can't be loaded (like when opening index.html directly)
// Copy your API key from config.js line 21

window.RUNTIME_ENV = {
    GOOGLE_MAPS_API_KEY: 'AIzaSyBqD4_uvapoL5DtaVI_6M57tneG131Rsvw',
    OPENAI_API_KEY: '',
    APP_ENV: 'development',
    DEBUG_MODE: 'true'
};

// Auto-load into window.ENV if not already set
if (!window.ENV) {
    window.ENV = window.RUNTIME_ENV;
    console.log('Loaded runtime environment config with API key:', window.RUNTIME_ENV.GOOGLE_MAPS_API_KEY.substring(0, 10) + '...');
}
