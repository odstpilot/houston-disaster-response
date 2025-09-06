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

    // LLM Chat API (simulated)
    async sendChatMessage(message, context = {}) {
        // Simulate LLM response based on keywords
        const lowerMessage = message.toLowerCase();
        
        let response = "I'm here to help you with disaster preparedness and response. ";
        
        if (lowerMessage.includes('hurricane')) {
            response += "For hurricane preparation in Houston: Start monitoring the storm 5 days out. "
                + "Know your evacuation zone (check harriscountyfws.org). Stock up on supplies when the storm is 72 hours away. "
                + "Fill your gas tank at 48 hours. Secure outdoor items at 24 hours. "
                + "If you're in zones A or B, evacuate when ordered. Never stay in a mobile home during a hurricane.";
        } else if (lowerMessage.includes('flood')) {
            response += "Houston flooding tips: Never drive through flooded streets - just 6 inches can stall your car. "
                + "Monitor bayou levels at harriscountyfws.org. Move vehicles to higher ground early. "
                + "Know multiple evacuation routes. Turn Around Don't Drown! "
                + "If water enters your home, turn off electricity at the breaker.";
        } else if (lowerMessage.includes('emergency kit') || lowerMessage.includes('supplies')) {
            response += "Essential emergency kit for Houston: Water (1 gallon/person/day for 7 days), "
                + "non-perishable food for 7 days, medications, first aid kit, flashlights, "
                + "battery-powered radio, phone chargers, cash, important documents in waterproof container, "
                + "tools, duct tape, plastic sheeting, and supplies for pets.";
        } else if (lowerMessage.includes('shelter')) {
            response += "Houston opens emergency shelters during disasters. Main locations include "
                + "George R. Brown Convention Center, NRG Center, and Toyota Center. "
                + "Call 311 or check houstonemergency.org for current shelter locations. "
                + "Bring medications, important documents, and supplies for 3 days.";
        } else if (lowerMessage.includes('insurance') || lowerMessage.includes('fema')) {
            response += "After a disaster: Document all damage with photos/video before cleaning. "
                + "Contact your insurance company immediately. Register with FEMA at disasterassistance.gov "
                + "or call 1-800-621-3362. Keep all receipts for emergency repairs and temporary housing. "
                + "Note: Flood insurance has a 30-day waiting period - get it before hurricane season!";
        } else {
            response += "What specific disaster preparedness topic would you like to know about? "
                + "I can help with hurricanes, flooding, extreme weather, emergency kits, evacuation planning, "
                + "shelters, insurance claims, and recovery resources.";
        }
        
        return {
            message: response,
            suggestions: this.getSuggestions(lowerMessage)
        };
    }

    getSuggestions(message) {
        const suggestions = [];
        
        if (!message.includes('kit')) {
            suggestions.push('What should be in my emergency kit?');
        }
        if (!message.includes('evacuate')) {
            suggestions.push('When should I evacuate?');
        }
        if (!message.includes('shelter')) {
            suggestions.push('Where are the emergency shelters?');
        }
        if (!message.includes('insurance')) {
            suggestions.push('How do I file an insurance claim?');
        }
        
        return suggestions;
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
