// API Service Module
class APIService {
    constructor() {
        this.cache = new Map();
        this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
    }

    // Generic fetch with caching
    async fetchWithCache(url, options = {}) {
        const cacheKey = url + JSON.stringify(options);
        
        // Check cache
        if (this.cache.has(cacheKey)) {
            const cached = this.cache.get(cacheKey);
            if (Date.now() - cached.timestamp < this.cacheTimeout) {
                return cached.data;
            }
        }

        try {
            const response = await fetch(url, options);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const data = await response.json();
            
            // Cache the response
            this.cache.set(cacheKey, {
                data: data,
                timestamp: Date.now()
            });
            
            return data;
        } catch (error) {
            console.error('API fetch error:', error);
            // Return cached data if available, even if expired
            if (this.cache.has(cacheKey)) {
                return this.cache.get(cacheKey).data;
            }
            throw error;
        }
    }

    // Weather API
    async getWeatherData(lat, lon) {
        // Simulated weather data for demo
        return {
            status: 'clear',
            temperature: 78,
            humidity: 65,
            windSpeed: 8,
            alerts: [],
            forecast: [
                { day: 'Today', high: 82, low: 68, condition: 'sunny' },
                { day: 'Tomorrow', high: 85, low: 70, condition: 'partly_cloudy' },
                { day: 'Thursday', high: 83, low: 69, condition: 'cloudy' }
            ]
        };
    }

    // Flood monitoring
    async getFloodData(location) {
        // Simulated flood data
        return {
            floodStage: 'normal',
            bayouLevels: {
                'Buffalo Bayou': { current: 12.5, flood: 25.0 },
                'Brays Bayou': { current: 8.2, flood: 20.0 },
                'White Oak Bayou': { current: 10.1, flood: 22.0 }
            },
            floodWarnings: []
        };
    }

    // Air quality
    async getAirQuality(lat, lon) {
        // Simulated air quality data
        return {
            aqi: 65,
            category: 'Moderate',
            pollutant: 'Ozone',
            healthMessage: 'Sensitive groups should limit prolonged outdoor exertion'
        };
    }

    // Traffic conditions
    async getTrafficData() {
        // Simulated traffic data
        return {
            incidents: [
                { location: 'I-45 North at Loop 610', type: 'accident', severity: 'moderate' },
                { location: 'US-59 South at Beltway 8', type: 'construction', severity: 'minor' }
            ],
            congestionLevel: 'moderate'
        };
    }

    // Power outages
    async getOutageData() {
        // Simulated outage data
        return {
            totalOutages: 245,
            affectedCustomers: 1250,
            estimatedRestoration: '2 hours',
            outageMap: []
        };
    }

    // Emergency shelters
    async getShelters(lat, lon, radius = 10) {
        // Simulated shelter data
        return [
            {
                name: 'George R. Brown Convention Center',
                address: '1001 Avenida De Las Americas, Houston, TX',
                distance: 2.5,
                capacity: 5000,
                currentOccupancy: 250,
                acceptsPets: true,
                amenities: ['meals', 'medical', 'showers', 'charging'],
                coordinates: { lat: 29.751825, lng: -95.357439 }
            },
            {
                name: 'NRG Center',
                address: '1 NRG Park, Houston, TX',
                distance: 5.8,
                capacity: 3000,
                currentOccupancy: 100,
                acceptsPets: true,
                amenities: ['meals', 'medical', 'charging'],
                coordinates: { lat: 29.684781, lng: -95.407608 }
            },
            {
                name: 'Toyota Center',
                address: '1510 Polk St, Houston, TX',
                distance: 3.2,
                capacity: 2000,
                currentOccupancy: 50,
                acceptsPets: false,
                amenities: ['meals', 'medical'],
                coordinates: { lat: 29.750751, lng: -95.362145 }
            }
        ];
    }

    // Cooling/Warming centers
    async getComfortCenters(type = 'cooling') {
        // Simulated comfort center data
        return [
            {
                name: 'Houston Public Library - Central',
                address: '500 McKinney St, Houston, TX',
                type: type,
                hours: '9 AM - 6 PM',
                phone: '832-393-1300'
            },
            {
                name: 'Community Center - Heights',
                address: '3201 White Oak Dr, Houston, TX',
                type: type,
                hours: '8 AM - 8 PM',
                phone: '713-868-3634'
            }
        ];
    }

    // LLM Chat API - Redirects to intelligent chat service
    async sendChatMessage(message, context = {}) {
        // Use the intelligent chat service if available
        if (window.intelligentChatService) {
            const response = await window.intelligentChatService.generateResponse(message, context);
            return {
                message: response,
                suggestions: []
            };
        }
        
        // Fallback if intelligent service unavailable
        return {
            message: "I'm temporarily unavailable. For emergency assistance, call 911. For non-emergency help, call 311.",
            suggestions: []
        };
    }

    // Save data for offline use
    saveOfflineData(key, data) {
        try {
            const offlineData = JSON.parse(localStorage.getItem(CONFIG.STORAGE_KEYS.OFFLINE_DATA) || '{}');
            offlineData[key] = {
                data: data,
                timestamp: Date.now()
            };
            localStorage.setItem(CONFIG.STORAGE_KEYS.OFFLINE_DATA, JSON.stringify(offlineData));
        } catch (error) {
            console.error('Error saving offline data:', error);
        }
    }

    // Get offline data
    getOfflineData(key) {
        try {
            const offlineData = JSON.parse(localStorage.getItem(CONFIG.STORAGE_KEYS.OFFLINE_DATA) || '{}');
            return offlineData[key]?.data || null;
        } catch (error) {
            console.error('Error getting offline data:', error);
            return null;
        }
    }
}

// Create global API service instance
window.apiService = new APIService();
