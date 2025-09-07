// Runtime Environment Configuration
// This file is used when .env files can't be loaded (like when opening index.html directly)
// API keys from .env file

window.RUNTIME_ENV = {
    GOOGLE_MAPS_API_KEY: 'AIzaSyBqD4_uvapoL5DtaVI_6M57tneG131Rsvw',
    MISTRAL_API_KEY: '6EaGM4ijaFF2pu4CxMMH4iSPwle4Vcpk',
    TAVILY_API_KEY: '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',
    OPENAI_API_KEY: '',
    APP_ENV: 'development',
    DEBUG_MODE: 'true'
};

// Auto-load into window.ENV if not already set
if (!window.ENV) {
    window.ENV = window.RUNTIME_ENV;
    console.log('Loaded runtime environment config');
    console.log('Google Maps API key:', window.RUNTIME_ENV.GOOGLE_MAPS_API_KEY ? 'Available' : 'Missing');
    console.log('Mistral API key:', window.RUNTIME_ENV.MISTRAL_API_KEY ? 'Available' : 'Missing');
    console.log('Tavily API key:', window.RUNTIME_ENV.TAVILY_API_KEY ? 'Available' : 'Missing');
}
