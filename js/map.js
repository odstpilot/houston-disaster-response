// Google Maps Module for Houston Disaster Response
class DisasterMap {
    constructor() {
        this.map = null;
        this.markers = [];
        this.overlays = {
            flood: null,
            evacuation: null,
            shelters: null,
            medical: null
        };
        this.userLocation = null;
        this.infoWindow = null;
        this.directionsService = null;
        this.directionsRenderer = null;
        this.isLoaded = false;
    }

    async initialize() {
        try {
            // Load Google Maps API dynamically
            await this.loadGoogleMapsAPI();
            
            // Initialize the map
            this.initializeMap();
            
            // Try to get user location
            this.getUserLocation();
            
            // Initialize services
            this.initializeServices();
            
            // Load initial layers
            await this.loadAllLayers();
            
            console.log('Google Maps initialized successfully');
        } catch (error) {
            console.error('Failed to initialize Google Maps:', error);
            this.showMapError();
        }
    }

    async loadGoogleMapsAPI() {
        return new Promise((resolve, reject) => {
            // Check if Google Maps is already loaded
            if (window.google && window.google.maps) {
                this.isLoaded = true;
                resolve();
                return;
            }

            // Create callback function name
            const callbackName = 'initGoogleMaps_' + Date.now();
            window[callbackName] = () => {
                this.isLoaded = true;
                delete window[callbackName];
                resolve();
            };

            // Create script element
            const script = document.createElement('script');
            script.src = `https://maps.googleapis.com/maps/api/js?key=${CONFIG.GOOGLE_MAPS.API_KEY}&libraries=${CONFIG.GOOGLE_MAPS.LIBRARIES.join(',')}&callback=${callbackName}`;
            script.onerror = () => {
                delete window[callbackName];
                reject(new Error('Failed to load Google Maps API'));
            };
            
            document.head.appendChild(script);
        });
    }

    initializeMap() {
        const mapOptions = {
            center: { lat: CONFIG.HOUSTON_CENTER.lat, lng: CONFIG.HOUSTON_CENTER.lng },
            zoom: 11,
            // Remove mapId to avoid conflicts with custom styles
            // mapId: CONFIG.GOOGLE_MAPS.MAP_ID, 
            mapTypeControl: true,
            mapTypeControlOptions: {
                style: google.maps.MapTypeControlStyle.HORIZONTAL_BAR,
                position: google.maps.ControlPosition.TOP_CENTER,
            },
            zoomControl: true,
            zoomControlOptions: {
                position: google.maps.ControlPosition.RIGHT_CENTER,
            },
            streetViewControl: true,
            streetViewControlOptions: {
                position: google.maps.ControlPosition.RIGHT_TOP,
            },
            fullscreenControl: true,
            styles: [
                // Custom styling for disaster response theme
                {
                    featureType: 'water',
                    elementType: 'geometry',
                    stylers: [{ color: '#193047' }]
                },
                {
                    featureType: 'landscape',
                    elementType: 'geometry',
                    stylers: [{ color: '#f5f5f2' }]
                },
                {
                    featureType: 'road',
                    elementType: 'geometry',
                    stylers: [{ color: '#ffffff' }]
                }
            ]
        };

        this.map = new google.maps.Map(document.getElementById('map'), mapOptions);
        
        // Add click listener for custom interactions
        this.map.addListener('click', (event) => {
            this.handleMapClick(event);
        });
    }

    initializeServices() {
        this.infoWindow = new google.maps.InfoWindow();
        this.directionsService = new google.maps.DirectionsService();
        this.directionsRenderer = new google.maps.DirectionsRenderer({
            draggable: true,
            map: this.map
        });
    }

    getUserLocation() {
        if ('geolocation' in navigator) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    this.userLocation = {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    };
                    this.addUserMarker();
                    this.map.setCenter(this.userLocation);
                    this.map.setZoom(13);
                },
                (error) => {
                    console.log('Geolocation error:', error);
                    this.userLocation = CONFIG.HOUSTON_CENTER;
                },
                {
                    enableHighAccuracy: true,
                    timeout: 10000,
                    maximumAge: 300000 // 5 minutes
                }
            );
        }
    }

    addUserMarker() {
        if (!this.userLocation) return;

        const userMarker = new google.maps.Marker({
            position: this.userLocation,
            map: this.map,
            title: 'Your Location',
            icon: {
                path: google.maps.SymbolPath.CIRCLE,
                fillColor: '#4285F4',
                fillOpacity: 1,
                strokeColor: '#ffffff',
                strokeWeight: 2,
                scale: 8
            },
            animation: google.maps.Animation.DROP
        });

        userMarker.addListener('click', () => {
            this.infoWindow.setContent(`
                <div class="p-2">
                    <h3 class="font-bold text-blue-600">Your Location</h3>
                    <p class="text-sm text-gray-600">Lat: ${this.userLocation.lat.toFixed(4)}</p>
                    <p class="text-sm text-gray-600">Lng: ${this.userLocation.lng.toFixed(4)}</p>
                </div>
            `);
            this.infoWindow.open(this.map, userMarker);
        });

        this.markers.push(userMarker);
    }

    async loadAllLayers() {
        await Promise.all([
            this.loadFloodZones(),
            this.loadEvacuationRoutes(),
            this.loadShelters(),
            this.loadMedicalCenters()
        ]);
    }

    async loadFloodZones() {
        // Create flood zone polygons
        const floodZones = [
            {
                name: 'Buffalo Bayou High Risk Zone',
                coordinates: [
                    { lat: 29.7604, lng: -95.3698 },
                    { lat: 29.7650, lng: -95.3750 },
                    { lat: 29.7700, lng: -95.3700 },
                    { lat: 29.7650, lng: -95.3650 },
                    { lat: 29.7604, lng: -95.3698 }
                ],
                risk: 'high'
            },
            {
                name: 'Brays Bayou Moderate Risk Zone',
                coordinates: [
                    { lat: 29.7200, lng: -95.4000 },
                    { lat: 29.7250, lng: -95.4050 },
                    { lat: 29.7300, lng: -95.4000 },
                    { lat: 29.7250, lng: -95.3950 },
                    { lat: 29.7200, lng: -95.4000 }
                ],
                risk: 'moderate'
            }
        ];

        const floodPolygons = floodZones.map(zone => {
            const color = zone.risk === 'high' ? '#dc2626' : '#f59e0b';
            
            const polygon = new google.maps.Polygon({
                paths: zone.coordinates,
                strokeColor: color,
                strokeOpacity: 0.8,
                strokeWeight: 2,
                fillColor: color,
                fillOpacity: 0.3,
                map: null // Initially hidden
            });

            polygon.addListener('click', (event) => {
                this.infoWindow.setContent(`
                    <div class="p-3">
                        <h3 class="font-bold text-blue-600">${zone.name}</h3>
                        <p class="text-sm"><strong>Risk Level:</strong> ${zone.risk}</p>
                        <p class="text-xs text-gray-600 mt-2">Click on map layers to show/hide flood zones</p>
                    </div>
                `);
                this.infoWindow.setPosition(event.latLng);
                this.infoWindow.open(this.map);
            });

            return polygon;
        });

        this.overlays.flood = floodPolygons;
    }

    async loadEvacuationRoutes() {
        const routes = [
            {
                name: 'I-45 North Evacuation Route',
                coordinates: [
                    { lat: 29.7604, lng: -95.3698 },
                    { lat: 29.8500, lng: -95.3700 },
                    { lat: 29.9500, lng: -95.3750 }
                ],
                direction: 'North to Dallas'
            },
            {
                name: 'US-59 Southwest Route',
                coordinates: [
                    { lat: 29.7604, lng: -95.3698 },
                    { lat: 29.7000, lng: -95.4500 },
                    { lat: 29.6500, lng: -95.5500 }
                ],
                direction: 'Southwest to Victoria'
            }
        ];

        const evacuationPolylines = routes.map(route => {
            const polyline = new google.maps.Polyline({
                path: route.coordinates,
                geodesic: true,
                strokeColor: '#dc2626',
                strokeOpacity: 0.8,
                strokeWeight: 4,
                map: null // Initially hidden
            });

            polyline.addListener('click', (event) => {
                this.infoWindow.setContent(`
                    <div class="p-3">
                        <h3 class="font-bold text-red-600">${route.name}</h3>
                        <p class="text-sm"><strong>Direction:</strong> ${route.direction}</p>
                        <button onclick="disasterMap.getDirections('${route.coordinates[0].lat}', '${route.coordinates[0].lng}', '${route.coordinates[route.coordinates.length-1].lat}', '${route.coordinates[route.coordinates.length-1].lng}')" 
                                class="mt-2 px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700">
                            Get Directions
                        </button>
                    </div>
                `);
                this.infoWindow.setPosition(event.latLng);
                this.infoWindow.open(this.map);
            });

            return polyline;
        });

        this.overlays.evacuation = evacuationPolylines;
    }

    async loadShelters() {
        try {
            const shelters = await apiService.getShelters(
                this.userLocation?.lat || CONFIG.HOUSTON_CENTER.lat,
                this.userLocation?.lng || CONFIG.HOUSTON_CENTER.lng
            );

            const shelterMarkers = shelters.map(shelter => {
                const marker = new google.maps.Marker({
                    position: { lat: shelter.coordinates.lat, lng: shelter.coordinates.lng },
                    map: null, // Initially hidden
                    title: shelter.name,
                    icon: {
                        url: 'data:image/svg+xml;base64,' + btoa(`
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="30" height="30">
                                <circle cx="12" cy="12" r="10" fill="#16a34a" stroke="#ffffff" stroke-width="2"/>
                                <path d="M10 17l-5-5 1.5-1.5L10 14l7.5-7.5L19 8l-9 9z" fill="#ffffff"/>
                            </svg>
                        `),
                        scaledSize: new google.maps.Size(30, 30)
                    }
                });

                marker.addListener('click', () => {
                    const occupancyPercent = Math.round((shelter.currentOccupancy / shelter.capacity) * 100);
                    const occupancyColor = occupancyPercent < 50 ? 'text-green-600' : 
                                         occupancyPercent < 80 ? 'text-yellow-600' : 'text-red-600';

                    this.infoWindow.setContent(`
                        <div class="p-3 max-w-xs">
                            <h3 class="font-bold text-green-600">${shelter.name}</h3>
                            <p class="text-sm text-gray-600 mb-2">${shelter.address}</p>
                            <div class="space-y-1 text-sm">
                                <p><strong>Capacity:</strong> <span class="${occupancyColor}">${shelter.currentOccupancy}/${shelter.capacity} (${occupancyPercent}%)</span></p>
                                <p><strong>Distance:</strong> ${shelter.distance} miles</p>
                                <p><strong>Pets:</strong> ${shelter.acceptsPets ? '✅ Allowed' : '❌ Not allowed'}</p>
                                <p><strong>Amenities:</strong> ${shelter.amenities.join(', ')}</p>
                            </div>
                            <div class="mt-3 space-x-2">
                                <button onclick="disasterMap.getDirections(${this.userLocation?.lat || CONFIG.HOUSTON_CENTER.lat}, ${this.userLocation?.lng || CONFIG.HOUSTON_CENTER.lng}, ${shelter.coordinates.lat}, ${shelter.coordinates.lng})" 
                                        class="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700">
                                    Directions
                                </button>
                                <button onclick="window.open('tel:${shelter.phone || '311'}', '_self')" 
                                        class="px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700">
                                    Call
                                </button>
                            </div>
                        </div>
                    `);
                    this.infoWindow.open(this.map, marker);
                });

                return marker;
            });

            this.overlays.shelters = shelterMarkers;
        } catch (error) {
            console.error('Error loading shelters:', error);
        }
    }

    async loadMedicalCenters() {
        const medicalCenters = [
            {
                name: 'Texas Medical Center',
                coordinates: { lat: 29.7100, lng: -95.4000 },
                type: 'Hospital Complex',
                phone: '713-791-1000'
            },
            {
                name: 'Memorial Hermann Hospital',
                coordinates: { lat: 29.7030, lng: -95.3900 },
                type: 'Level 1 Trauma Center',
                phone: '713-704-4000'
            },
            {
                name: 'Ben Taub Hospital',
                coordinates: { lat: 29.7110, lng: -95.3980 },
                type: 'Level 1 Trauma Center',
                phone: '713-873-2000'
            }
        ];

        const medicalMarkers = medicalCenters.map(center => {
            const marker = new google.maps.Marker({
                position: center.coordinates,
                map: null, // Initially hidden
                title: center.name,
                icon: {
                    url: 'data:image/svg+xml;base64,' + btoa(`
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="30" height="30">
                            <circle cx="12" cy="12" r="10" fill="#7c3aed" stroke="#ffffff" stroke-width="2"/>
                            <path d="M12 6v6l4 2-1 1.5-5-3V6h2z" fill="#ffffff"/>
                        </svg>
                    `),
                    scaledSize: new google.maps.Size(30, 30)
                }
            });

            marker.addListener('click', () => {
                this.infoWindow.setContent(`
                    <div class="p-3">
                        <h3 class="font-bold text-purple-600">${center.name}</h3>
                        <p class="text-sm text-gray-600">${center.type}</p>
                        <div class="mt-3 space-x-2">
                            <button onclick="disasterMap.getDirections(${this.userLocation?.lat || CONFIG.HOUSTON_CENTER.lat}, ${this.userLocation?.lng || CONFIG.HOUSTON_CENTER.lng}, ${center.coordinates.lat}, ${center.coordinates.lng})" 
                                    class="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700">
                                Directions
                            </button>
                            <button onclick="window.open('tel:${center.phone}', '_self')" 
                                    class="px-3 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700">
                                Call
                            </button>
                        </div>
                    </div>
                `);
                this.infoWindow.open(this.map, marker);
            });

            return marker;
        });

        this.overlays.medical = medicalMarkers;
    }

    toggleLayer(layerName) {
        const layer = this.overlays[layerName];
        if (!layer) return false;

        // Handle different layer types
        if (Array.isArray(layer)) {
            const isVisible = layer[0].getMap() !== null;
            layer.forEach(item => {
                item.setMap(isVisible ? null : this.map);
            });
            return !isVisible;
        } else {
            const isVisible = layer.getMap() !== null;
            layer.setMap(isVisible ? null : this.map);
            return !isVisible;
        }
    }

    clearAllLayers() {
        Object.values(this.overlays).forEach(layer => {
            if (Array.isArray(layer)) {
                layer.forEach(item => item.setMap(null));
            } else if (layer) {
                layer.setMap(null);
            }
        });
    }

    centerOnLocation(lat, lng, zoom = 15) {
        if (this.map) {
            this.map.setCenter({ lat, lng });
            this.map.setZoom(zoom);
        }
    }

    addCustomMarker(lat, lng, title, content) {
        const marker = new google.maps.Marker({
            position: { lat, lng },
            map: this.map,
            title: title,
            animation: google.maps.Animation.DROP
        });

        if (content) {
            marker.addListener('click', () => {
                this.infoWindow.setContent(content);
                this.infoWindow.open(this.map, marker);
            });
        }

        this.markers.push(marker);
        return marker;
    }

    removeAllMarkers() {
        this.markers.forEach(marker => {
            marker.setMap(null);
        });
        this.markers = [];
    }

    getDirections(startLat, startLng, endLat, endLng) {
        const start = new google.maps.LatLng(startLat, startLng);
        const end = new google.maps.LatLng(endLat, endLng);

        const request = {
            origin: start,
            destination: end,
            travelMode: google.maps.TravelMode.DRIVING,
            avoidHighways: false,
            avoidTolls: false
        };

        this.directionsService.route(request, (result, status) => {
            if (status === google.maps.DirectionsStatus.OK) {
                this.directionsRenderer.setDirections(result);
                
                // Show route info
                const route = result.routes[0];
                const leg = route.legs[0];
                
                this.infoWindow.setContent(`
                    <div class="p-3">
                        <h3 class="font-bold text-blue-600">Route Information</h3>
                        <p class="text-sm"><strong>Distance:</strong> ${leg.distance.text}</p>
                        <p class="text-sm"><strong>Duration:</strong> ${leg.duration.text}</p>
                        <p class="text-xs text-gray-600 mt-2">Route shown in blue on map</p>
                    </div>
                `);
                this.infoWindow.setPosition(start);
                this.infoWindow.open(this.map);
            } else {
                console.error('Directions request failed:', status);
                alert('Could not calculate route. Please try again.');
            }
        });
    }

    clearDirections() {
        this.directionsRenderer.setDirections({ routes: [] });
    }

    handleMapClick(event) {
        // Handle custom map interactions
        console.log('Map clicked at:', event.latLng.toJSON());
    }

    showMapError() {
        const mapContainer = document.getElementById('map');
        if (mapContainer) {
            const apiKey = CONFIG.GOOGLE_MAPS.API_KEY;
            const isValidKey = apiKey && apiKey !== 'YOUR_GOOGLE_MAPS_API_KEY' && apiKey.length > 10;
            
            mapContainer.innerHTML = `
                <div class="h-full flex items-center justify-center bg-gray-100">
                    <div class="text-center p-6">
                        <i class="fas fa-exclamation-triangle text-red-500 text-4xl mb-4"></i>
                        <h3 class="text-lg font-semibold text-gray-800 mb-2">Map Loading Error</h3>
                        <p class="text-sm text-gray-600 mb-4">
                            ${!isValidKey ? 
                                'Invalid or missing Google Maps API key. Please check your configuration.' :
                                'Unable to load Google Maps. Please check your internet connection and API key restrictions.'
                            }
                        </p>
                        <div class="text-xs text-gray-500 mb-4">
                            API Key: ${apiKey ? apiKey.substring(0, 10) + '...' : 'Not found'}
                        </div>
                        <button onclick="location.reload()" class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                            Retry
                        </button>
                    </div>
                </div>
            `;
        }
    }

    // Utility method to get distance between two points
    getDistance(lat1, lng1, lat2, lng2) {
        const point1 = new google.maps.LatLng(lat1, lng1);
        const point2 = new google.maps.LatLng(lat2, lng2);
        return google.maps.geometry.spherical.computeDistanceBetween(point1, point2);
    }

    // Method to search for places
    async searchNearby(query, location = null) {
        if (!location) {
            location = this.userLocation || CONFIG.HOUSTON_CENTER;
        }

        const service = new google.maps.places.PlacesService(this.map);
        const request = {
            location: new google.maps.LatLng(location.lat, location.lng),
            radius: 10000, // 10km radius
            query: query
        };

        return new Promise((resolve, reject) => {
            service.textSearch(request, (results, status) => {
                if (status === google.maps.places.PlacesServiceStatus.OK) {
                    resolve(results);
                } else {
                    reject(new Error(`Places search failed: ${status}`));
                }
            });
        });
    }
}

// Global function for navigation (called from info windows)
window.navigateToShelter = function(lat, lng) {
    if (window.disasterMap) {
        window.disasterMap.getDirections(
            window.disasterMap.userLocation?.lat || CONFIG.HOUSTON_CENTER.lat,
            window.disasterMap.userLocation?.lng || CONFIG.HOUSTON_CENTER.lng,
            lat,
            lng
        );
    }
};