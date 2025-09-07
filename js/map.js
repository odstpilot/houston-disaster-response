// Google Maps Module for Houston Disaster Response
class DisasterMap {
    constructor() {
        this.map = null;
        this.markers = [];
        this.overlays = {
            shelters: null,
            medical: null
        };
        this.userLocation = null;
        this.infoWindow = null;
        this.directionsService = null;
        this.directionsRenderer = null;
        this.isLoaded = false;
        this.configReady = false;
        
        // Wait for configuration to be ready before initializing
        this.waitForConfig();
    }

    waitForConfig() {
        if (window.CONFIG && window.CONFIG.GOOGLE_MAPS) {
            this.configReady = true;
            console.log('🗺️  Configuration ready for Google Maps');
        } else {
            // Listen for config ready event
            window.addEventListener('configReady', () => {
                this.configReady = true;
                console.log('🗺️  Configuration loaded for Google Maps');
            });
        }
    }

    async initialize() {
        try {
            // Wait for configuration to be ready
            await this.waitForConfigReady();
            
            // Validate API key
            if (!CONFIG.GOOGLE_MAPS.API_KEY || CONFIG.GOOGLE_MAPS.API_KEY === 'YOUR_GOOGLE_MAPS_API_KEY') {
                console.error('❌ Invalid Google Maps API key');
                this.showMapError('Invalid or missing Google Maps API key. Please check your configuration.');
                return;
            }

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

    async waitForConfigReady() {
        // Wait for configuration to be ready
        while (!this.configReady) {
            await new Promise(resolve => setTimeout(resolve, 100));
        }
        console.log('✅ Configuration ready for Google Maps initialization');
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
            this.loadShelters(),
            this.loadMedicalCenters()
        ]);
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
            // Major Hospital Systems - Texas Medical Center
            {
                name: 'Texas Medical Center',
                coordinates: { lat: 29.7100, lng: -95.4000 },
                type: 'Hospital Complex',
                phone: '713-791-1000',
                category: 'Major Hospital',
                services: ['Emergency', 'Trauma', 'Specialty Care'],
                address: '6565 Fannin St, Houston, TX 77030'
            },
            {
                name: 'Memorial Hermann Hospital - TMC',
                coordinates: { lat: 29.7030, lng: -95.3900 },
                type: 'Level 1 Trauma Center',
                phone: '713-704-4000',
                category: 'Major Hospital',
                services: ['Emergency', 'Trauma', 'Life Flight'],
                address: '6411 Fannin St, Houston, TX 77030'
            },
            {
                name: 'Ben Taub Hospital',
                coordinates: { lat: 29.7110, lng: -95.3980 },
                type: 'Level 1 Trauma Center',
                phone: '713-873-2000',
                category: 'Major Hospital',
                services: ['Emergency', 'Trauma', 'Public Hospital'],
                address: '1502 Taub Loop, Houston, TX 77030'
            },
            {
                name: 'Houston Methodist Hospital',
                coordinates: { lat: 29.7200, lng: -95.3950 },
                type: 'Magnet Hospital',
                phone: '713-790-3311',
                category: 'Major Hospital',
                services: ['Emergency', 'Heart Care', 'Cancer Care'],
                address: '6565 Fannin St, Houston, TX 77030'
            },
            {
                name: 'MD Anderson Cancer Center',
                coordinates: { lat: 29.7080, lng: -95.3970 },
                type: 'Cancer Specialty Hospital',
                phone: '713-792-2121',
                category: 'Specialty Hospital',
                services: ['Cancer Care', 'Emergency Oncology'],
                address: '1515 Holcombe Blvd, Houston, TX 77030'
            },
            {
                name: 'Texas Children\'s Hospital',
                coordinates: { lat: 29.7120, lng: -95.3980 },
                type: 'Pediatric Hospital',
                phone: '832-824-1000',
                category: 'Pediatric Hospital',
                services: ['Pediatric Emergency', 'Children\'s Trauma'],
                address: '6621 Fannin St, Houston, TX 77030'
            },

            // Memorial Hermann System - Other Locations
            {
                name: 'Memorial Hermann Northeast',
                coordinates: { lat: 29.8740, lng: -95.2180 },
                type: 'General Hospital',
                phone: '281-540-7700',
                category: 'Regional Hospital',
                services: ['Emergency', 'General Medicine'],
                address: '18951 Memorial North, Humble, TX 77338'
            },
            {
                name: 'Memorial Hermann Northwest',
                coordinates: { lat: 29.9520, lng: -95.6180 },
                type: 'General Hospital',
                phone: '281-440-1000',
                category: 'Regional Hospital',
                services: ['Emergency', 'Surgery', 'Women\'s Services'],
                address: '1635 N Loop W, Houston, TX 77008'
            },
            {
                name: 'Memorial Hermann Southwest',
                coordinates: { lat: 29.6420, lng: -95.4810 },
                type: 'General Hospital',
                phone: '713-456-5000',
                category: 'Regional Hospital',
                services: ['Emergency', 'Heart Care'],
                address: '7600 Beechnut St, Houston, TX 77074'
            },
            {
                name: 'Memorial Hermann Southeast',
                coordinates: { lat: 29.6580, lng: -95.2280 },
                type: 'General Hospital',
                phone: '281-929-6100',
                category: 'Regional Hospital',
                services: ['Emergency', 'General Medicine'],
                address: '11800 Astoria Blvd, Houston, TX 77089'
            },

            // Houston Methodist System
            {
                name: 'Houston Methodist West',
                coordinates: { lat: 29.7380, lng: -95.6390 },
                type: 'General Hospital',
                phone: '713-394-7000',
                category: 'Regional Hospital',
                services: ['Emergency', 'Surgery', 'Heart Care'],
                address: '18500 Katy Fwy, Houston, TX 77094'
            },
            {
                name: 'Houston Methodist Sugar Land',
                coordinates: { lat: 29.6190, lng: -95.6350 },
                type: 'General Hospital',
                phone: '281-274-7000',
                category: 'Regional Hospital',
                services: ['Emergency', 'Women\'s Services'],
                address: '16655 Southwest Fwy, Sugar Land, TX 77479'
            },
            {
                name: 'Houston Methodist Clear Lake',
                coordinates: { lat: 29.5540, lng: -95.0890 },
                type: 'General Hospital',
                phone: '281-333-2100',
                category: 'Regional Hospital',
                services: ['Emergency', 'General Medicine'],
                address: '18300 Houston Methodist Dr, Nassau Bay, TX 77058'
            },
            {
                name: 'Houston Methodist Willowbrook',
                coordinates: { lat: 29.9890, lng: -95.6120 },
                type: 'General Hospital',
                phone: '281-477-1000',
                category: 'Regional Hospital',
                services: ['Emergency', 'Surgery'],
                address: '18220 Tomball Pkwy, Houston, TX 77070'
            },

            // CHI St. Joseph Health System
            {
                name: 'St. Joseph Medical Center',
                coordinates: { lat: 29.8120, lng: -95.3380 },
                type: 'General Hospital',
                phone: '713-757-1000',
                category: 'Regional Hospital',
                services: ['Emergency', 'Heart Care', 'Surgery'],
                address: '1401 St Joseph Pkwy, Houston, TX 77002'
            },

            // HCA Houston Healthcare System
            {
                name: 'HCA Houston Healthcare Medical Center',
                coordinates: { lat: 29.7280, lng: -95.3420 },
                type: 'General Hospital',
                phone: '713-790-0232',
                category: 'Regional Hospital',
                services: ['Emergency', 'Surgery'],
                address: '2121 W Holcombe Blvd, Houston, TX 77030'
            },
            {
                name: 'HCA Houston Healthcare Northwest',
                coordinates: { lat: 29.8720, lng: -95.5580 },
                type: 'General Hospital',
                phone: '281-440-1000',
                category: 'Regional Hospital',
                services: ['Emergency', 'General Medicine'],
                address: '710 FM 1960 Rd W, Houston, TX 77090'
            },
            {
                name: 'HCA Houston Healthcare Clear Lake',
                coordinates: { lat: 29.5420, lng: -95.0720 },
                type: 'General Hospital',
                phone: '281-332-2511',
                category: 'Regional Hospital',
                services: ['Emergency', 'Women\'s Services'],
                address: '500 Medical Center Blvd, Webster, TX 77598'
            },

            // Specialty and Emergency Centers
            {
                name: 'TIRR Memorial Hermann',
                coordinates: { lat: 29.7150, lng: -95.3900 },
                type: 'Rehabilitation Hospital',
                phone: '713-799-5000',
                category: 'Specialty Hospital',
                services: ['Rehabilitation', 'Emergency Rehab'],
                address: '1333 Moursund St, Houston, TX 77030'
            },
            {
                name: 'Shriners Children\'s Texas',
                coordinates: { lat: 29.7180, lng: -95.3920 },
                type: 'Pediatric Specialty Hospital',
                phone: '713-797-1616',
                category: 'Pediatric Hospital',
                services: ['Pediatric Specialty Care', 'Burn Care'],
                address: '6977 Main St, Houston, TX 77030'
            },

            // Emergency Centers and Urgent Care
            {
                name: 'Memorial Hermann Emergency Center - Katy',
                coordinates: { lat: 29.7590, lng: -95.8240 },
                type: 'Emergency Center',
                phone: '281-644-7000',
                category: 'Emergency Center',
                services: ['24/7 Emergency Care'],
                address: '23960 Katy Fwy, Katy, TX 77494'
            },
            {
                name: 'Memorial Hermann Emergency Center - Pearland',
                coordinates: { lat: 29.5630, lng: -95.2860 },
                type: 'Emergency Center',
                phone: '713-242-3000',
                category: 'Emergency Center',
                services: ['24/7 Emergency Care'],
                address: '2555 Pearland Pkwy, Pearland, TX 77581'
            },
            {
                name: 'Memorial Hermann Emergency Center - Cypress',
                coordinates: { lat: 29.9420, lng: -95.6980 },
                type: 'Emergency Center',
                phone: '281-897-2700',
                category: 'Emergency Center',
                services: ['24/7 Emergency Care'],
                address: '27700 Northwest Fwy, Cypress, TX 77433'
            },
            {
                name: 'NextCare Urgent Care - Multiple Locations',
                coordinates: { lat: 29.7604, lng: -95.3698 },
                type: 'Urgent Care Network',
                phone: '713-364-3627',
                category: 'Urgent Care',
                services: ['Urgent Care', 'Walk-in Clinic'],
                address: 'Multiple Houston Locations'
            },
            {
                name: 'CareNow Urgent Care - Network',
                coordinates: { lat: 29.7304, lng: -95.4000 },
                type: 'Urgent Care Network',
                phone: '214-544-7700',
                category: 'Urgent Care',
                services: ['Urgent Care', 'Occupational Health'],
                address: 'Multiple Houston Locations'
            },

            // Additional Regional Hospitals
            {
                name: 'Houston Northwest Medical Center',
                coordinates: { lat: 29.8890, lng: -95.5520 },
                type: 'General Hospital',
                phone: '281-440-1000',
                category: 'Regional Hospital',
                services: ['Emergency', 'Surgery', 'Women\'s Services'],
                address: '710 FM 1960 Rd W, Houston, TX 77090'
            },
            {
                name: 'Park Plaza Hospital',
                coordinates: { lat: 29.7380, lng: -95.3920 },
                type: 'General Hospital',
                phone: '713-527-5000',
                category: 'Regional Hospital',
                services: ['Emergency', 'Heart Care'],
                address: '1313 Hermann Dr, Houston, TX 77004'
            },
            {
                name: 'West Houston Medical Center',
                coordinates: { lat: 29.7420, lng: -95.6180 },
                type: 'General Hospital',
                phone: '281-558-3444',
                category: 'Regional Hospital',
                services: ['Emergency', 'General Medicine'],
                address: '12141 Richmond Ave, Houston, TX 77082'
            },
            {
                name: 'Clear Lake Regional Medical Center',
                coordinates: { lat: 29.5280, lng: -95.0890 },
                type: 'General Hospital',
                phone: '281-332-2511',
                category: 'Regional Hospital',
                services: ['Emergency', 'Women\'s Services'],
                address: '500 W Medical Center Blvd, Webster, TX 77598'
            }
        ];

        const medicalMarkers = medicalCenters.map(center => {
            // Get appropriate icon and color based on facility type
            const iconInfo = this.getMedicalFacilityIcon(center.category);
            
            const marker = new google.maps.Marker({
                position: center.coordinates,
                map: null, // Initially hidden
                title: center.name,
                icon: {
                    url: 'data:image/svg+xml;base64,' + btoa(`
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="32" height="32">
                            <circle cx="12" cy="12" r="10" fill="${iconInfo.color}" stroke="#ffffff" stroke-width="2"/>
                            <path d="${iconInfo.path}" fill="#ffffff"/>
                        </svg>
                    `),
                    scaledSize: new google.maps.Size(32, 32)
                }
            });

            marker.addListener('click', () => {
                const distance = this.userLocation ? 
                    this.calculateDistance(this.userLocation, center.coordinates) : null;
                
                this.infoWindow.setContent(`
                    <div class="p-4 max-w-sm">
                        <h3 class="font-bold text-red-600 mb-2">${center.name}</h3>
                        <div class="space-y-2 text-sm">
                            <p><strong>Type:</strong> ${center.type}</p>
                            <p><strong>Category:</strong> <span class="px-2 py-1 rounded text-xs ${iconInfo.categoryClass}">${center.category}</span></p>
                            ${center.address ? `<p><strong>Address:</strong> ${center.address}</p>` : ''}
                            ${distance ? `<p><strong>Distance:</strong> ${distance.toFixed(1)} miles</p>` : ''}
                            <div class="mt-2">
                                <p class="font-semibold text-gray-700">Services:</p>
                                <div class="flex flex-wrap gap-1 mt-1">
                                    ${center.services.map(service => 
                                        `<span class="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">${service}</span>`
                                    ).join('')}
                                </div>
                            </div>
                        </div>
                        <div class="mt-4 flex gap-2">
                            <button onclick="disasterMap.getDirections(${this.userLocation?.lat || CONFIG.HOUSTON_CENTER.lat}, ${this.userLocation?.lng || CONFIG.HOUSTON_CENTER.lng}, ${center.coordinates.lat}, ${center.coordinates.lng})" 
                                    class="px-3 py-2 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 flex items-center">
                                <i class="fas fa-directions mr-1"></i> Directions
                            </button>
                            <button onclick="window.open('tel:${center.phone}', '_self')" 
                                    class="px-3 py-2 bg-red-600 text-white text-xs rounded hover:bg-red-700 flex items-center">
                                <i class="fas fa-phone mr-1"></i> Call
                            </button>
                        </div>
                        ${center.category === 'Emergency Center' ? 
                            '<div class="mt-2 p-2 bg-red-50 border border-red-200 rounded"><p class="text-xs text-red-700"><i class="fas fa-exclamation-triangle mr-1"></i>24/7 Emergency Services Available</p></div>' : 
                            ''}
                        ${center.category === 'Urgent Care' ? 
                            '<div class="mt-2 p-2 bg-orange-50 border border-orange-200 rounded"><p class="text-xs text-orange-700"><i class="fas fa-clock mr-1"></i>Walk-in Care Available</p></div>' : 
                            ''}
                    </div>
                `);
                this.infoWindow.open(this.map, marker);
            });

            return marker;
        });

        this.overlays.medical = medicalMarkers;
    }

    getMedicalFacilityIcon(category) {
        const iconMap = {
            'Major Hospital': {
                color: '#DC2626', // Red
                path: 'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z', // Star
                categoryClass: 'bg-red-100 text-red-700'
            },
            'Regional Hospital': {
                color: '#7C3AED', // Purple
                path: 'M19 8h-2v3h-3v2h3v3h2v-3h3v-2h-3V8zM4 8h2v8H4V8zm3 0h2v8H7V8zm3 0h2v8h-2V8z', // Hospital cross
                categoryClass: 'bg-purple-100 text-purple-700'
            },
            'Specialty Hospital': {
                color: '#059669', // Green
                path: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z', // Check mark
                categoryClass: 'bg-green-100 text-green-700'
            },
            'Pediatric Hospital': {
                color: '#F59E0B', // Amber
                path: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z', // Pediatric symbol
                categoryClass: 'bg-amber-100 text-amber-700'
            },
            'Emergency Center': {
                color: '#EF4444', // Bright red
                path: 'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2zM12 6L9.5 11.5 4 12l4 3.5-1 5.5 5-3 5 3-1-5.5 4-3.5-5.5-.5L12 6z', // Emergency star
                categoryClass: 'bg-red-100 text-red-800'
            },
            'Urgent Care': {
                color: '#F97316', // Orange
                path: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm3.5 6L12 10.5 8.5 8 11 5.5 13 7.5 15.5 8zM12 18.5c-1.25 0-2.45-.2-3.57-.57.35-.51.9-.93 1.64-.93.71 0 1.36.35 1.93.93.57-.58 1.22-.93 1.93-.93.74 0 1.29.42 1.64.93-1.12.37-2.32.57-3.57.57z', // Urgent care symbol
                categoryClass: 'bg-orange-100 text-orange-700'
            }
        };

        return iconMap[category] || iconMap['Regional Hospital']; // Default to Regional Hospital
    }

    calculateDistance(point1, point2) {
        const R = 3959; // Earth's radius in miles
        const dLat = this.toRadians(point2.lat - point1.lat);
        const dLng = this.toRadians(point2.lng - point1.lng);
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                  Math.cos(this.toRadians(point1.lat)) * Math.cos(this.toRadians(point2.lat)) *
                  Math.sin(dLng / 2) * Math.sin(dLng / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }

    toRadians(degrees) {
        return degrees * (Math.PI / 180);
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

    showMapError(customMessage = null) {
        const mapContainer = document.getElementById('map');
        if (mapContainer) {
            const apiKey = CONFIG?.GOOGLE_MAPS?.API_KEY || 'Not available';
            const isValidKey = apiKey && apiKey !== 'YOUR_GOOGLE_MAPS_API_KEY' && apiKey.length > 10;
            
            let errorMessage;
            if (customMessage) {
                errorMessage = customMessage;
            } else if (!isValidKey) {
                errorMessage = 'Invalid or missing Google Maps API key. Please check your configuration.';
            } else {
                errorMessage = 'Unable to load Google Maps. Please check your internet connection and API key restrictions.';
            }
            
            mapContainer.innerHTML = `
                <div class="h-full flex items-center justify-center bg-gray-100">
                    <div class="text-center p-6">
                        <i class="fas fa-exclamation-triangle text-red-500 text-4xl mb-4"></i>
                        <h3 class="text-lg font-semibold text-gray-800 mb-2">Map Loading Error</h3>
                        <p class="text-sm text-gray-600 mb-4">
                            ${errorMessage}
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