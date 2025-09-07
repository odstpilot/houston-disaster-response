// Secure Environment Configuration Loader
// Loads environment variables from server API instead of client-side files

class SecureEnvLoader {
    constructor() {
        this.config = null;
        this.isLoaded = false;
        this.retryCount = 0;
        this.maxRetries = 3;
    }

    async loadConfig() {
        if (this.isLoaded && this.config) {
            return this.config;
        }

        try {
            console.log('🔐 Loading secure environment configuration...');
            
            // Try to load from server API first
            const serverConfig = await this.loadFromServer();
            if (serverConfig) {
                this.config = serverConfig;
                this.isLoaded = true;
                console.log('✅ Environment loaded from secure server API');
                return this.config;
            }

            // Fallback to runtime config (less secure but functional)
            console.warn('⚠️  Falling back to runtime configuration');
            this.config = this.getFallbackConfig();
            this.isLoaded = true;
            return this.config;

        } catch (error) {
            console.error('❌ Failed to load environment configuration:', error);
            
            // Use fallback config as last resort
            this.config = this.getFallbackConfig();
            this.isLoaded = true;
            return this.config;
        }
    }

    async loadFromServer() {
        try {
            const response = await fetch('/api/config', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                },
                cache: 'no-cache'
            });

            if (!response.ok) {
                throw new Error(`Server responded with ${response.status}: ${response.statusText}`);
            }

            const config = await response.json();
            
            // Validate that we got the expected configuration
            if (this.validateConfig(config)) {
                console.log('🔒 Secure configuration loaded:', {
                    'Google Maps API': config.GOOGLE_MAPS_API_KEY ? '✓ Available' : '✗ Missing',
                    'Mistral API': config.MISTRAL_API_KEY ? '✓ Available' : '✗ Missing',
                    'Tavily API': config.TAVILY_API_KEY ? '✓ Available' : '✗ Missing'
                });
                return config;
            } else {
                throw new Error('Invalid configuration received from server');
            }

        } catch (error) {
            console.warn('⚠️  Server API not available:', error.message);
            return null;
        }
    }

    getFallbackConfig() {
        // Fallback configuration (less secure - should be replaced with server config)
        console.warn('🚨 Using fallback configuration - API keys exposed on client side');
        return {
            GOOGLE_MAPS_API_KEY: 'YOUR_GOOGLE_MAPS_API_KEY', // This should be replaced with actual key
            MISTRAL_API_KEY: '6EaGM4ijaFF2pu4CxMMH4iSPwle4Vcpk',
            TAVILY_API_KEY: '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',
            APP_ENV: 'development',
            DEBUG_MODE: 'true'
        };
    }

    validateConfig(config) {
        // Check if the configuration has the expected structure
        return config && 
               typeof config === 'object' &&
               (config.GOOGLE_MAPS_API_KEY !== undefined) &&
               (config.MISTRAL_API_KEY !== undefined) &&
               (config.TAVILY_API_KEY !== undefined);
    }

    async waitForConfig() {
        // Wait for configuration to be loaded (useful for other modules)
        while (!this.isLoaded) {
            await new Promise(resolve => setTimeout(resolve, 100));
        }
        return this.config;
    }
}

// Global secure environment loader instance
window.secureEnvLoader = new SecureEnvLoader();

// Load configuration and make it available globally
(async function initializeEnvironment() {
    try {
        const config = await window.secureEnvLoader.loadConfig();
        
        // Make config available globally for backward compatibility
        window.ENV = config;
        window.RUNTIME_ENV = config; // For backward compatibility
        
        // Dispatch event to notify other modules that config is ready
        window.dispatchEvent(new CustomEvent('envConfigReady', { 
            detail: { config, source: 'secure-loader' } 
        }));

        console.log('🌍 Environment configuration ready for use');
        
    } catch (error) {
        console.error('💥 Critical error loading environment:', error);
        
        // Ensure some config is available even if loading fails
        window.ENV = window.secureEnvLoader.getFallbackConfig();
        window.RUNTIME_ENV = window.ENV;
        
        window.dispatchEvent(new CustomEvent('envConfigReady', { 
            detail: { config: window.ENV, source: 'fallback', error } 
        }));
    }
})();

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SecureEnvLoader;
}
