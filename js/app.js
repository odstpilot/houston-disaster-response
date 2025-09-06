// Main Application Module
class HoustonDisasterApp {
    constructor() {
        this.initialized = false;
        this.modules = {};
    }

    async initialize() {
        if (this.initialized) return;
        
        console.log('Initializing Houston Disaster Response App...');
        
        // Check for browser compatibility
        this.checkBrowserSupport();
        
        // Initialize all modules
        await this.initializeModules();
        
        // Set up event listeners
        this.setupEventListeners();
        
        // Check online status
        this.setupOnlineStatusMonitoring();
        
        // Initialize service worker
        this.initializeServiceWorker();
        
        // Check for app updates
        this.checkForUpdates();
        
        // Load initial data
        await this.loadInitialData();
        
        this.initialized = true;
        console.log('App initialization complete');
    }

    checkBrowserSupport() {
        const features = {
            'Service Worker': 'serviceWorker' in navigator,
            'Notifications': 'Notification' in window,
            'Geolocation': 'geolocation' in navigator,
            'Local Storage': typeof(Storage) !== 'undefined',
            'Fetch API': 'fetch' in window
        };
        
        const unsupported = Object.entries(features)
            .filter(([name, supported]) => !supported)
            .map(([name]) => name);
        
        if (unsupported.length > 0) {
            console.warn('Unsupported features:', unsupported);
            this.showCompatibilityWarning(unsupported);
        }
    }

    showCompatibilityWarning(unsupported) {
        const warning = document.createElement('div');
        warning.className = 'bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded relative mb-4';
        warning.innerHTML = `
            <strong>Browser Compatibility Warning:</strong>
            Some features may not work properly. Missing: ${unsupported.join(', ')}
        `;
        
        const main = document.querySelector('main');
        if (main) {
            main.insertBefore(warning, main.firstChild);
        }
    }

    async initializeModules() {
        // Initialize map
        if (document.getElementById('map')) {
            this.modules.map = new DisasterMap();
            await this.modules.map.initialize();
            window.disasterMap = this.modules.map;
        }
        
        // Initialize chat assistant
        if (window.chatAssistant) {
            window.chatAssistant.initialize();
        }
        
        // Initialize profile manager
        if (window.profileManager) {
            window.profileManager.initialize();
        }
        
        // Initialize checklist manager
        if (window.checklistManager) {
            window.checklistManager.initialize();
        }
        
        // Initialize notification manager
        if (window.notificationManager) {
            await window.notificationManager.initialize();
        }
        
        // Initialize disaster manager
        if (window.disasterManager) {
            window.disasterManager.initialize();
        }
    }

    setupEventListeners() {
        // Navigation between views
        this.setupNavigation();
        
        // Map layer toggles
        this.setupMapControls();
        
        // Language switcher
        this.setupLanguageSwitcher();
        
        // PWA install prompt
        this.setupInstallPrompt();
        
        // Accessibility controls
        this.setupAccessibilityControls();
    }

    setupNavigation() {
        // Bottom navigation for mobile
        document.querySelectorAll('.nav-item').forEach((item, index) => {
            item.addEventListener('click', () => {
                this.navigateToView(index);
            });
        });
        
        // View checklist button
        const checklistBtns = document.querySelectorAll('[data-view="checklist"]');
        checklistBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                this.showView('checklistView');
            });
        });
    }

    navigateToView(index) {
        const views = ['dashboardView', 'map', 'checklistView', 'notifications', 'profileView'];
        const viewId = views[index];
        
        if (viewId === 'map') {
            // Scroll to map section
            document.getElementById('map')?.scrollIntoView({ behavior: 'smooth' });
        } else if (viewId === 'notifications') {
            // Show notifications panel
            window.notificationManager?.showNotificationPanel();
        } else {
            this.showView(viewId);
        }
        
        // Update active nav item
        document.querySelectorAll('.nav-item').forEach((item, i) => {
            if (i === index) {
                item.querySelector('i').className = item.querySelector('i').className.replace('text-gray-600', 'text-blue-600');
            } else {
                item.querySelector('i').className = item.querySelector('i').className.replace('text-blue-600', 'text-gray-600');
            }
        });
    }

    showView(viewId) {
        // Hide all views
        document.querySelectorAll('.view').forEach(view => {
            view.classList.add('hidden');
        });
        
        // Show selected view
        const view = document.getElementById(viewId);
        if (view) {
            view.classList.remove('hidden');
            window.scrollTo(0, 0);
        }
    }

    setupMapControls() {
        document.querySelectorAll('.map-layer-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const layer = e.currentTarget.dataset.layer;
                if (this.modules.map) {
                    const isActive = this.modules.map.toggleLayer(layer);
                    
                    // Update button style
                    if (isActive) {
                        e.currentTarget.classList.add('ring-2', 'ring-blue-500');
                    } else {
                        e.currentTarget.classList.remove('ring-2', 'ring-blue-500');
                    }
                }
            });
        });
    }

    setupLanguageSwitcher() {
        const langBtn = document.getElementById('languageBtn');
        if (langBtn) {
            langBtn.addEventListener('click', () => {
                this.showLanguageSelector();
            });
        }
    }

    showLanguageSelector() {
        // Lower map z-index to prevent overlap
        const mapElement = document.getElementById('map');
        if (mapElement) {
            mapElement.style.zIndex = '0';
        }
        
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center';
        modal.style.zIndex = '9999';
        modal.innerHTML = `
            <div class="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
                <h3 class="text-lg font-bold mb-4">Select Language / Seleccionar Idioma</h3>
                <div class="space-y-2">
                    ${Object.entries(CONFIG.LANGUAGES).map(([code, name]) => `
                        <button onclick="app.setLanguage('${code}')" 
                                class="w-full p-3 text-left hover:bg-gray-100 rounded">
                            ${name}
                        </button>
                    `).join('')}
                </div>
                <button onclick="app.closeModal(this)" 
                        class="mt-4 w-full py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400">
                    Cancel
                </button>
            </div>
        `;
        document.body.appendChild(modal);
    }

    closeModal(button) {
        // Restore map z-index
        const mapElement = document.getElementById('map');
        if (mapElement) {
            mapElement.style.zIndex = '1';
        }
        
        // Remove the modal
        const modal = button.closest('.fixed');
        if (modal) {
            modal.remove();
        }
    }

    setLanguage(lang) {
        if (window.profileManager) {
            window.profileManager.setLanguage(lang);
        }
        const modal = document.querySelector('.fixed');
        if (modal) {
            this.closeModal(modal.querySelector('button'));
        }
        
        // Reload content in new language
        this.loadTranslations(lang);
    }

    async loadTranslations(lang) {
        // In production, this would load language files
        console.log(`Loading translations for ${lang}`);
        
        // Show notification
        const langName = CONFIG.LANGUAGES[lang];
        if (window.notificationManager) {
            window.notificationManager.createAlert({
                type: 'info',
                severity: 'info',
                title: 'Language Changed',
                message: `Interface language set to ${langName}`,
                expires: Date.now() + 5000
            });
        }
    }

    setupInstallPrompt() {
        let deferredPrompt;
        
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            deferredPrompt = e;
            this.showInstallPrompt(deferredPrompt);
        });
        
        window.addEventListener('appinstalled', () => {
            console.log('App installed');
            this.hideInstallPrompt();
        });
    }

    showInstallPrompt(deferredPrompt) {
        const prompt = document.createElement('div');
        prompt.className = 'install-prompt';
        prompt.innerHTML = `
            <div class="flex items-center justify-between">
                <div>
                    <p class="font-semibold">Install Houston Disaster Response</p>
                    <p class="text-sm text-gray-600">Access offline and get instant alerts</p>
                </div>
                <div class="flex gap-2">
                    <button id="installBtn" class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                        Install
                    </button>
                    <button id="dismissBtn" class="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400">
                        Later
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(prompt);
        prompt.style.display = 'block';
        
        document.getElementById('installBtn').addEventListener('click', async () => {
            prompt.style.display = 'none';
            deferredPrompt.prompt();
            const { outcome } = await deferredPrompt.userChoice;
            console.log(`User response to install prompt: ${outcome}`);
        });
        
        document.getElementById('dismissBtn').addEventListener('click', () => {
            prompt.style.display = 'none';
        });
    }

    hideInstallPrompt() {
        const prompt = document.querySelector('.install-prompt');
        if (prompt) {
            prompt.style.display = 'none';
        }
    }

    setupAccessibilityControls() {
        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            // Alt + H for help
            if (e.altKey && e.key === 'h') {
                this.showHelp();
            }
            
            // Alt + N for notifications
            if (e.altKey && e.key === 'n') {
                window.notificationManager?.showNotificationPanel();
            }
            
            // Alt + C for checklist
            if (e.altKey && e.key === 'c') {
                this.showView('checklistView');
            }
        });
        
        // High contrast mode
        const savedContrast = localStorage.getItem('highContrast');
        if (savedContrast === 'true') {
            document.body.classList.add('high-contrast');
        }
        
        // Large text mode
        const savedTextSize = localStorage.getItem('largeText');
        if (savedTextSize === 'true') {
            document.body.classList.add('large-text');
        }
    }

    showHelp() {
        // Lower map z-index to prevent overlap
        const mapElement = document.getElementById('map');
        if (mapElement) {
            mapElement.style.zIndex = '0';
        }
        
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4';
        modal.style.zIndex = '9999';
        modal.innerHTML = `
            <div class="bg-white rounded-lg max-w-2xl w-full p-6 max-h-[80vh] overflow-y-auto">
                <h2 class="text-2xl font-bold mb-4">Help & Keyboard Shortcuts</h2>
                
                <div class="space-y-4">
                    <div>
                        <h3 class="font-semibold mb-2">Keyboard Shortcuts</h3>
                        <ul class="space-y-1 text-sm">
                            <li><kbd>Alt + H</kbd> - Show this help</li>
                            <li><kbd>Alt + N</kbd> - Show notifications</li>
                            <li><kbd>Alt + C</kbd> - Show checklist</li>
                            <li><kbd>Alt + P</kbd> - Show profile</li>
                            <li><kbd>Esc</kbd> - Close modals</li>
                        </ul>
                    </div>
                    
                    <div>
                        <h3 class="font-semibold mb-2">Emergency Contacts</h3>
                        <ul class="space-y-1 text-sm">
                            ${Object.entries(CONFIG.EMERGENCY_CONTACTS).map(([name, number]) => 
                                `<li><strong>${name}:</strong> ${number}</li>`
                            ).join('')}
                        </ul>
                    </div>
                    
                    <div>
                        <h3 class="font-semibold mb-2">Accessibility Options</h3>
                        <div class="space-y-2">
                            <label class="flex items-center">
                                <input type="checkbox" id="highContrastToggle" class="mr-2">
                                <span>High Contrast Mode</span>
                            </label>
                            <label class="flex items-center">
                                <input type="checkbox" id="largeTextToggle" class="mr-2">
                                <span>Large Text Mode</span>
                            </label>
                        </div>
                    </div>
                </div>
                
                <button onclick="app.closeModal(this)" 
                        class="mt-6 w-full py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                    Close
                </button>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Set up accessibility toggles
        const highContrastToggle = document.getElementById('highContrastToggle');
        const largeTextToggle = document.getElementById('largeTextToggle');
        
        highContrastToggle.checked = document.body.classList.contains('high-contrast');
        largeTextToggle.checked = document.body.classList.contains('large-text');
        
        highContrastToggle.addEventListener('change', (e) => {
            document.body.classList.toggle('high-contrast', e.target.checked);
            localStorage.setItem('highContrast', e.target.checked);
        });
        
        largeTextToggle.addEventListener('change', (e) => {
            document.body.classList.toggle('large-text', e.target.checked);
            localStorage.setItem('largeText', e.target.checked);
        });
    }

    setupOnlineStatusMonitoring() {
        const updateOnlineStatus = () => {
            if (!navigator.onLine) {
                document.body.classList.add('offline-mode');
                this.showOfflineIndicator();
            } else {
                document.body.classList.remove('offline-mode');
                this.hideOfflineIndicator();
            }
        };
        
        window.addEventListener('online', updateOnlineStatus);
        window.addEventListener('offline', updateOnlineStatus);
        
        // Initial check
        updateOnlineStatus();
    }

    showOfflineIndicator() {
        let indicator = document.querySelector('.offline-indicator');
        if (!indicator) {
            indicator = document.createElement('div');
            indicator.className = 'offline-indicator';
            indicator.innerHTML = `
                <i class="fas fa-wifi-slash mr-2"></i>
                Offline Mode - Limited Features Available
            `;
            document.body.appendChild(indicator);
        }
    }

    hideOfflineIndicator() {
        const indicator = document.querySelector('.offline-indicator');
        if (indicator) {
            indicator.remove();
        }
    }

    async initializeServiceWorker() {
        if ('serviceWorker' in navigator) {
            try {
                const registration = await navigator.serviceWorker.register('/sw.js');
                console.log('Service Worker registered:', registration);
                
                // Check for updates
                registration.addEventListener('updatefound', () => {
                    const newWorker = registration.installing;
                    newWorker.addEventListener('statechange', () => {
                        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                            this.showUpdateNotification();
                        }
                    });
                });
            } catch (error) {
                console.error('Service Worker registration failed:', error);
            }
        }
    }

    showUpdateNotification() {
        if (window.notificationManager) {
            window.notificationManager.createAlert({
                type: 'update',
                severity: 'info',
                title: 'App Update Available',
                message: 'A new version is available. Reload to update.',
                actions: [
                    {
                        id: 'reload',
                        title: 'Reload Now',
                        action: () => window.location.reload()
                    }
                ]
            });
        }
    }

    async checkForUpdates() {
        // Check for app updates periodically
        setInterval(() => {
            if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
                navigator.serviceWorker.controller.postMessage({ type: 'CHECK_UPDATE' });
            }
        }, 30 * 60 * 1000); // Every 30 minutes
    }

    async loadInitialData() {
        try {
            // Load weather data
            const weatherData = await apiService.getWeatherData(
                CONFIG.HOUSTON_CENTER.lat,
                CONFIG.HOUSTON_CENTER.lng
            );
            this.updateWeatherDisplay(weatherData);
            
            // Load flood data
            const floodData = await apiService.getFloodData('houston');
            this.updateFloodDisplay(floodData);
            
            // Load air quality
            const airQuality = await apiService.getAirQuality(
                CONFIG.HOUSTON_CENTER.lat,
                CONFIG.HOUSTON_CENTER.lng
            );
            this.updateAirQualityDisplay(airQuality);
            
        } catch (error) {
            console.error('Error loading initial data:', error);
        }
    }

    updateWeatherDisplay(data) {
        const weatherCard = document.querySelector('.status-card:nth-child(1)');
        if (weatherCard && data) {
            weatherCard.querySelector('p:nth-child(2)').textContent = data.status;
            weatherCard.querySelector('p:nth-child(3)').textContent = 
                data.alerts.length > 0 ? `${data.alerts.length} active alerts` : 'No active warnings';
        }
    }

    updateFloodDisplay(data) {
        const floodCard = document.querySelector('.status-card:nth-child(2)');
        if (floodCard && data) {
            floodCard.querySelector('p:nth-child(2)').textContent = 
                data.floodStage.charAt(0).toUpperCase() + data.floodStage.slice(1);
            
            const warnings = data.floodWarnings.length;
            floodCard.querySelector('p:nth-child(3)').textContent = 
                warnings > 0 ? `${warnings} flood warnings` : 'Bayous at normal levels';
        }
    }

    updateAirQualityDisplay(data) {
        const aqiCard = document.querySelector('.status-card:nth-child(3)');
        if (aqiCard && data) {
            aqiCard.querySelector('p:nth-child(2)').textContent = data.category;
            aqiCard.querySelector('p:nth-child(3)').textContent = `AQI: ${data.aqi}`;
            
            // Update card color based on AQI
            if (data.aqi > 150) {
                aqiCard.className = 'status-card p-4 bg-red-50 rounded-lg border border-red-200';
            } else if (data.aqi > 100) {
                aqiCard.className = 'status-card p-4 bg-orange-50 rounded-lg border border-orange-200';
            }
        }
    }

    // Utility methods
    async shareApp() {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: 'Houston Disaster Response',
                    text: 'Stay prepared for disasters in Houston with this emergency response app',
                    url: window.location.href
                });
            } catch (error) {
                console.log('Error sharing:', error);
            }
        }
    }

    printEmergencyCard() {
        window.print();
    }

    exportData() {
        const data = {
            profile: JSON.parse(localStorage.getItem(CONFIG.STORAGE_KEYS.USER_PROFILE) || '{}'),
            checklist: JSON.parse(localStorage.getItem(CONFIG.STORAGE_KEYS.CHECKLIST_PROGRESS) || '{}'),
            timestamp: new Date().toISOString()
        };
        
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `houston-disaster-data-${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);
    }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.app = new HoustonDisasterApp();
    window.app.initialize().catch(error => {
        console.error('Failed to initialize app:', error);
    });
});

// Handle PWA offline/online events
window.addEventListener('online', () => {
    console.log('Back online');
    if (window.notificationManager) {
        window.notificationManager.createAlert({
            type: 'info',
            severity: 'info',
            title: 'Connection Restored',
            message: 'You are back online. All features are available.',
            expires: Date.now() + 5000
        });
    }
});

window.addEventListener('offline', () => {
    console.log('Gone offline');
    if (window.notificationManager) {
        window.notificationManager.createAlert({
            type: 'warning',
            severity: 'warning',
            title: 'Offline Mode',
            message: 'You are offline. Some features may be limited.',
            expires: Date.now() + 10000
        });
    }
});
