// Notifications Module
class NotificationManager {
    constructor() {
        this.permission = 'default';
        this.notifications = [];
        this.socket = null;
        this.alertSound = null;
    }

    async initialize() {
        // Request notification permission
        await this.requestPermission();
        
        // Load saved notifications
        this.loadNotifications();
        
        // Set up notification button
        this.setupNotificationButton();
        
        // Initialize alert sound
        this.initializeAlertSound();
        
        // Start checking for alerts
        this.startAlertMonitoring();
        
        // Set up service worker for push notifications
        this.setupServiceWorker();
    }

    async requestPermission() {
        if ('Notification' in window) {
            this.permission = await Notification.requestPermission();
            return this.permission;
        }
        return 'denied';
    }

    loadNotifications() {
        try {
            const saved = localStorage.getItem(CONFIG.STORAGE_KEYS.NOTIFICATIONS);
            if (saved) {
                this.notifications = JSON.parse(saved);
                this.updateNotificationBadge();
            }
        } catch (error) {
            console.error('Error loading notifications:', error);
        }
    }

    saveNotifications() {
        try {
            localStorage.setItem(CONFIG.STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(this.notifications));
        } catch (error) {
            console.error('Error saving notifications:', error);
        }
    }

    setupNotificationButton() {
        const notificationBtn = document.getElementById('notificationBtn');
        if (notificationBtn) {
            notificationBtn.addEventListener('click', () => this.showNotificationPanel());
        }
    }

    initializeAlertSound() {
        // Create audio element for emergency alerts
        this.alertSound = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSl+zPPTgjMGHm7A7+OZURE');
        this.alertSound.volume = 0.5;
    }

    async startAlertMonitoring() {
        // Check for alerts every 5 minutes
        setInterval(() => {
            this.checkForAlerts();
        }, 5 * 60 * 1000);
        
        // Initial check
        this.checkForAlerts();
    }

    async checkForAlerts() {
        try {
            const profile = this.getUserProfile();
            if (!profile?.zipcode) return;
            
            // Check weather alerts
            const weatherData = await apiService.getWeatherData(
                CONFIG.HOUSTON_CENTER.lat,
                CONFIG.HOUSTON_CENTER.lng
            );
            
            if (weatherData.alerts && weatherData.alerts.length > 0) {
                weatherData.alerts.forEach(alert => {
                    this.createAlert(alert);
                });
            }
            
            // Check flood warnings
            const floodData = await apiService.getFloodData(profile.neighborhood);
            if (floodData.floodWarnings && floodData.floodWarnings.length > 0) {
                floodData.floodWarnings.forEach(warning => {
                    this.createAlert({
                        type: 'flood',
                        severity: 'warning',
                        title: 'Flood Warning',
                        message: warning.message,
                        expires: warning.expires
                    });
                });
            }
            
            // Check air quality
            const airQuality = await apiService.getAirQuality(
                CONFIG.HOUSTON_CENTER.lat,
                CONFIG.HOUSTON_CENTER.lng
            );
            
            if (airQuality.aqi > 150) {
                this.createAlert({
                    type: 'air_quality',
                    severity: 'moderate',
                    title: 'Poor Air Quality',
                    message: `Air Quality Index: ${airQuality.aqi}. ${airQuality.healthMessage}`,
                    expires: Date.now() + 3600000
                });
            }
            
        } catch (error) {
            console.error('Error checking for alerts:', error);
        }
    }

    createAlert(alertData) {
        const notification = {
            id: Date.now() + Math.random(),
            type: alertData.type || 'general',
            severity: alertData.severity || 'info',
            title: alertData.title,
            message: alertData.message,
            timestamp: Date.now(),
            read: false,
            expires: alertData.expires || Date.now() + 86400000, // 24 hours default
            actions: alertData.actions || []
        };
        
        // Check if similar alert already exists
        const exists = this.notifications.find(n => 
            n.title === notification.title && 
            n.type === notification.type &&
            Date.now() - n.timestamp < 3600000 // Within last hour
        );
        
        if (!exists) {
            this.notifications.unshift(notification);
            this.saveNotifications();
            this.showNotification(notification);
            this.updateNotificationBadge();
            
            // Play alert sound for high severity
            if (notification.severity === 'emergency' || notification.severity === 'warning') {
                this.playAlertSound();
            }
        }
    }

    showNotification(notification) {
        // Browser notification
        if (this.permission === 'granted') {
            const options = {
                body: notification.message,
                icon: '/favicon.png',
                badge: '/favicon.png',
                tag: notification.id.toString(),
                requireInteraction: notification.severity === 'emergency',
                actions: notification.actions.map(a => ({
                    action: a.id,
                    title: a.title
                }))
            };
            
            const browserNotification = new Notification(notification.title, options);
            
            browserNotification.onclick = () => {
                window.focus();
                this.handleNotificationClick(notification);
            };
        }
        
        // In-app notification banner
        this.showInAppNotification(notification);
    }

    showInAppNotification(notification) {
        const alertBanner = document.getElementById('emergencyAlert');
        const alertMessage = document.getElementById('alertMessage');
        
        if (alertBanner && alertMessage) {
            // Set alert style based on severity
            const severityColors = {
                emergency: 'bg-red-600',
                warning: 'bg-orange-600',
                watch: 'bg-yellow-600',
                info: 'bg-blue-600'
            };
            
            alertBanner.className = `${severityColors[notification.severity] || 'bg-blue-600'} text-white p-3 text-center`;
            alertMessage.textContent = `${notification.title}: ${notification.message}`;
            alertBanner.classList.remove('hidden');
            
            // Auto-hide non-emergency alerts after 10 seconds
            if (notification.severity !== 'emergency') {
                setTimeout(() => {
                    alertBanner.classList.add('hidden');
                }, 10000);
            }
        }
    }

    handleNotificationClick(notification) {
        // Mark as read
        notification.read = true;
        this.saveNotifications();
        this.updateNotificationBadge();
        
        // Handle specific notification types
        switch (notification.type) {
            case 'evacuation':
                this.showEvacuationInfo();
                break;
            case 'flood':
                this.showFloodMap();
                break;
            case 'shelter':
                this.showShelters();
                break;
            case 'weather':
                this.showWeatherDetails();
                break;
            default:
                this.showNotificationPanel();
        }
    }

    showNotificationPanel() {
        const panel = document.createElement('div');
        panel.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
        panel.innerHTML = `
            <div class="bg-white rounded-lg max-w-md w-full mx-4 max-h-[80vh] overflow-hidden">
                <div class="p-4 border-b bg-blue-600 text-white">
                    <div class="flex justify-between items-center">
                        <h2 class="text-xl font-bold">Notifications</h2>
                        <button onclick="this.closest('.fixed').remove()" class="text-2xl">&times;</button>
                    </div>
                </div>
                <div class="overflow-y-auto max-h-[60vh]">
                    ${this.renderNotifications()}
                </div>
                <div class="p-4 border-t">
                    <button onclick="notificationManager.clearAllNotifications()" 
                            class="w-full py-2 bg-red-600 text-white rounded hover:bg-red-700">
                        Clear All Notifications
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(panel);
        
        // Mark all as read
        this.markAllAsRead();
    }

    renderNotifications() {
        if (this.notifications.length === 0) {
            return '<div class="p-8 text-center text-gray-500">No notifications</div>';
        }
        
        return this.notifications.map(n => {
            const severityIcons = {
                emergency: 'fa-exclamation-triangle text-red-600',
                warning: 'fa-exclamation-circle text-orange-600',
                watch: 'fa-info-circle text-yellow-600',
                info: 'fa-info-circle text-blue-600'
            };
            
            const icon = severityIcons[n.severity] || 'fa-bell text-gray-600';
            const timeAgo = this.getTimeAgo(n.timestamp);
            
            return `
                <div class="p-4 border-b ${n.read ? 'bg-white' : 'bg-blue-50'} hover:bg-gray-50">
                    <div class="flex items-start">
                        <i class="fas ${icon} mt-1 mr-3"></i>
                        <div class="flex-1">
                            <h3 class="font-semibold text-gray-800">${n.title}</h3>
                            <p class="text-sm text-gray-600 mt-1">${n.message}</p>
                            <p class="text-xs text-gray-400 mt-2">${timeAgo}</p>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }

    getTimeAgo(timestamp) {
        const seconds = Math.floor((Date.now() - timestamp) / 1000);
        
        if (seconds < 60) return 'Just now';
        if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`;
        if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
        return `${Math.floor(seconds / 86400)} days ago`;
    }

    updateNotificationBadge() {
        const badge = document.getElementById('notificationBadge');
        const unreadCount = this.notifications.filter(n => !n.read).length;
        
        if (badge) {
            if (unreadCount > 0) {
                badge.classList.remove('hidden');
            } else {
                badge.classList.add('hidden');
            }
        }
    }

    markAllAsRead() {
        this.notifications.forEach(n => n.read = true);
        this.saveNotifications();
        this.updateNotificationBadge();
    }

    clearAllNotifications() {
        if (confirm('Are you sure you want to clear all notifications?')) {
            this.notifications = [];
            this.saveNotifications();
            this.updateNotificationBadge();
            document.querySelector('.fixed').remove();
        }
    }

    playAlertSound() {
        if (this.alertSound) {
            this.alertSound.play().catch(e => console.log('Could not play alert sound:', e));
        }
    }

    getUserProfile() {
        const profileData = localStorage.getItem(CONFIG.STORAGE_KEYS.USER_PROFILE);
        return profileData ? JSON.parse(profileData) : null;
    }

    // Navigation methods for notification actions


    showShelters() {
        if (window.disasterMap) {
            window.disasterMap.toggleLayer('shelters');
        }
    }

    showWeatherDetails() {
        // Could open weather details panel
        console.log('Showing weather details');
    }

    // Test notification for demo
    sendTestNotification() {
        this.createAlert({
            type: 'test',
            severity: 'info',
            title: 'Test Notification',
            message: 'This is a test of the Houston Disaster Response notification system.',
            expires: Date.now() + 3600000
        });
    }

    // Setup service worker for background notifications
    async setupServiceWorker() {
        if ('serviceWorker' in navigator) {
            try {
                const registration = await navigator.serviceWorker.register('/sw.js');
                console.log('Service Worker registered:', registration);
            } catch (error) {
                console.log('Service Worker registration failed:', error);
            }
        }
    }

    // Subscribe to push notifications
    async subscribeToPushNotifications() {
        if ('serviceWorker' in navigator && 'PushManager' in window) {
            try {
                const registration = await navigator.serviceWorker.ready;
                const subscription = await registration.pushManager.subscribe({
                    userVisibleOnly: true,
                    applicationServerKey: this.urlBase64ToUint8Array('YOUR_VAPID_PUBLIC_KEY')
                });
                
                // Send subscription to server
                await this.sendSubscriptionToServer(subscription);
                
            } catch (error) {
                console.error('Failed to subscribe to push notifications:', error);
            }
        }
    }

    urlBase64ToUint8Array(base64String) {
        const padding = '='.repeat((4 - base64String.length % 4) % 4);
        const base64 = (base64String + padding)
            .replace(/\-/g, '+')
            .replace(/_/g, '/');

        const rawData = window.atob(base64);
        const outputArray = new Uint8Array(rawData.length);

        for (let i = 0; i < rawData.length; ++i) {
            outputArray[i] = rawData.charCodeAt(i);
        }
        return outputArray;
    }

    async sendSubscriptionToServer(subscription) {
        // In production, send to your server
        console.log('Push subscription:', subscription);
    }
}

// Initialize notification manager
window.notificationManager = new NotificationManager();
