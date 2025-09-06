// Environment Configuration Loader
// This file loads environment variables for the Houston Disaster Response app

class EnvironmentLoader {
    constructor() {
        this.env = {};
        this.loaded = false;
    }

    async loadEnvironment() {
        if (this.loaded) return this.env;

        try {
            // Try to load from .env file (for development)
            await this.loadFromEnvFile();
        } catch (error) {
            console.log('No .env file found, using defaults');
        }

        // Set defaults for any missing values
        this.setDefaults();
        
        // Make environment available globally
        window.ENV = this.env;
        this.loaded = true;
        
        return this.env;
    }

    async loadFromEnvFile() {
        try {
            // Check if we're running on file:// protocol
            if (window.location.protocol === 'file:') {
                console.log('Running on file:// protocol - .env loading disabled for security');
                throw new Error('File protocol detected');
            }
            
            const response = await fetch('.env');
            if (!response.ok) throw new Error('No .env file');
            
            const text = await response.text();
            this.parseEnvFile(text);
        } catch (error) {
            // .env file not found or not accessible - this is normal for production
            console.log('Loading environment from runtime config...');
        }
    }

    parseEnvFile(envText) {
        const lines = envText.split('\n');
        
        lines.forEach(line => {
            // Skip comments and empty lines
            if (line.trim() === '' || line.trim().startsWith('#')) return;
            
            const [key, ...valueParts] = line.split('=');
            if (key && valueParts.length > 0) {
                const value = valueParts.join('=').trim();
                this.env[key.trim()] = value;
            }
        });
    }

    setDefaults() {
        // Set default values for missing environment variables
        this.env = {
            GOOGLE_MAPS_API_KEY: this.env.GOOGLE_MAPS_API_KEY || 'YOUR_GOOGLE_MAPS_API_KEY_HERE',
            OPENAI_API_KEY: this.env.OPENAI_API_KEY || '',
            WEATHER_API_KEY: this.env.WEATHER_API_KEY || '',
            APP_ENV: this.env.APP_ENV || 'development',
            DEBUG_MODE: this.env.DEBUG_MODE || 'true',
            ...this.env
        };
    }

    get(key, defaultValue = null) {
        return this.env[key] || defaultValue;
    }

    isDevelopment() {
        return this.env.APP_ENV === 'development';
    }

    isProduction() {
        return this.env.APP_ENV === 'production';
    }

    isDebugMode() {
        return this.env.DEBUG_MODE === 'true';
    }
}

// Create global environment loader
window.environmentLoader = new EnvironmentLoader();

// Load environment immediately
window.environmentLoader.loadEnvironment().then(() => {
    console.log('Environment loaded successfully');
    
    // Dispatch event to notify other scripts that environment is ready
    window.dispatchEvent(new CustomEvent('environmentLoaded', {
        detail: window.ENV
    }));
}).catch(error => {
    console.error('Failed to load environment:', error);
});
