// Emergency Actions Module
class EmergencyActions {
    constructor() {
        this.initialize();
    }

    initialize() {
        this.setupEmergencyButton();
    }

    setupEmergencyButton() {
        const emergencyBtn = document.getElementById('emergency911Btn');
        if (emergencyBtn) {
            emergencyBtn.addEventListener('click', () => this.handle911Call());
        }
    }

    // Detect if user is on mobile device
    isMobileDevice() {
        // Check user agent for mobile indicators
        const userAgent = navigator.userAgent.toLowerCase();
        const mobileKeywords = ['mobile', 'android', 'iphone', 'ipad', 'ipod', 'blackberry', 'windows phone'];
        
        const isMobileUA = mobileKeywords.some(keyword => userAgent.includes(keyword));
        
        // Check for touch capability
        const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
        
        // Check screen size (mobile-like dimensions)
        const isSmallScreen = window.innerWidth <= 768;
        
        // Combine checks for better detection
        return isMobileUA || (isTouchDevice && isSmallScreen);
    }

    // Detect iOS specifically
    isIOSDevice() {
        const userAgent = navigator.userAgent.toLowerCase();
        return /iphone|ipad|ipod/.test(userAgent);
    }

    // Detect Android specifically
    isAndroidDevice() {
        const userAgent = navigator.userAgent.toLowerCase();
        return userAgent.includes('android');
    }

    // Handle 911 button click
    handle911Call() {
        const isMobile = this.isMobileDevice();
        const isIOS = this.isIOSDevice();
        const isAndroid = this.isAndroidDevice();

        console.log('Emergency 911 button clicked');
        console.log('Device detection:', { isMobile, isIOS, isAndroid });

        if (isMobile || isIOS || isAndroid) {
            // Mobile device - initiate phone call
            this.initiatePhoneCall();
        } else {
            // Desktop/Web - redirect to 911.gov
            this.redirectTo911Website();
        }
    }

    // Initiate phone call on mobile devices
    initiatePhoneCall() {
        console.log('Initiating phone call to 911');
        
        // Show confirmation dialog first for safety
        const confirmed = confirm(
            "🚨 EMERGENCY CALL\n\n" +
            "This will call 911 Emergency Services.\n\n" +
            "• Only call if you have a real emergency\n" +
            "• Stay calm and speak clearly\n" +
            "• Provide your location\n\n" +
            "Do you want to call 911 now?"
        );

        if (confirmed) {
            // Create tel: link and trigger it
            const telLink = document.createElement('a');
            telLink.href = 'tel:911';
            telLink.style.display = 'none';
            document.body.appendChild(telLink);
            
            // Trigger the call
            telLink.click();
            
            // Clean up
            setTimeout(() => {
                document.body.removeChild(telLink);
            }, 1000);

            // Log the action
            this.logEmergencyAction('phone_call', '911');
        }
    }

    // Redirect to 911.gov website
    redirectTo911Website() {
        console.log('Redirecting to 911.gov website');
        
        // Show information dialog
        const confirmed = confirm(
            "🚨 EMERGENCY INFORMATION\n\n" +
            "You will be redirected to 911.gov for emergency information.\n\n" +
            "• If this is a real emergency, call 911 directly\n" +
            "• 911.gov provides information about emergency services\n" +
            "• For immediate help, dial 911 on your phone\n\n" +
            "Continue to 911.gov?"
        );

        if (confirmed) {
            // Open 911.gov in a new tab/window
            const link = document.createElement('a');
            link.href = 'https://www.911.gov/';
            link.target = '_blank';
            link.rel = 'noopener noreferrer';
            link.style.display = 'none';
            document.body.appendChild(link);
            
            // Trigger the redirect
            link.click();
            
            // Clean up
            setTimeout(() => {
                document.body.removeChild(link);
            }, 1000);

            // Log the action
            this.logEmergencyAction('website_redirect', 'https://www.911.gov/');
        }
    }

    // Log emergency actions for analytics/debugging
    logEmergencyAction(action, target) {
        const logData = {
            timestamp: new Date().toISOString(),
            action: action,
            target: target,
            userAgent: navigator.userAgent,
            isMobile: this.isMobileDevice(),
            isIOS: this.isIOSDevice(),
            isAndroid: this.isAndroidDevice(),
            screenSize: {
                width: window.innerWidth,
                height: window.innerHeight
            }
        };

        console.log('Emergency action logged:', logData);

        // Store in localStorage for debugging
        try {
            const existingLogs = JSON.parse(localStorage.getItem('emergency_logs') || '[]');
            existingLogs.push(logData);
            
            // Keep only last 10 logs
            if (existingLogs.length > 10) {
                existingLogs.splice(0, existingLogs.length - 10);
            }
            
            localStorage.setItem('emergency_logs', JSON.stringify(existingLogs));
        } catch (error) {
            console.error('Error saving emergency log:', error);
        }
    }

    // Get emergency contact numbers based on location
    getEmergencyContacts() {
        return {
            emergency: '911',
            nonEmergency: '713-884-3131',
            houston311: '311',
            redCross: '713-526-8300',
            fema: '1-800-621-3362',
            poisonControl: '1-800-222-1222'
        };
    }

    // Show emergency contacts modal
    showEmergencyContacts() {
        const contacts = this.getEmergencyContacts();
        const isMobile = this.isMobileDevice();
        
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4';
        modal.innerHTML = `
            <div class="bg-white rounded-lg max-w-md w-full p-6">
                <h2 class="text-xl font-bold mb-4 text-red-600">
                    <i class="fas fa-phone-alt mr-2"></i>
                    Emergency Contacts
                </h2>
                <div class="space-y-3">
                    ${Object.entries(contacts).map(([name, number]) => `
                        <div class="flex justify-between items-center p-3 bg-gray-50 rounded">
                            <span class="font-semibold capitalize">${name.replace(/([A-Z])/g, ' $1')}</span>
                            <div class="flex items-center gap-2">
                                <span class="text-blue-600">${number}</span>
                                ${isMobile ? `
                                    <button onclick="window.location.href='tel:${number}'" 
                                            class="px-2 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700">
                                        Call
                                    </button>
                                ` : ''}
                            </div>
                        </div>
                    `).join('')}
                </div>
                <div class="mt-6 text-center">
                    <button onclick="this.closest('.fixed').remove()" 
                            class="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400">
                        Close
                    </button>
                </div>
                <div class="mt-4 text-xs text-gray-500 text-center">
                    Device: ${isMobile ? 'Mobile' : 'Desktop'} | 
                    Emergency calls ${isMobile ? 'will dial directly' : 'redirect to 911.gov'}
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
    }

    // Test device detection (for debugging)
    testDeviceDetection() {
        const detection = {
            userAgent: navigator.userAgent,
            isMobile: this.isMobileDevice(),
            isIOS: this.isIOSDevice(),
            isAndroid: this.isAndroidDevice(),
            touchSupport: 'ontouchstart' in window,
            maxTouchPoints: navigator.maxTouchPoints,
            screenSize: {
                width: window.innerWidth,
                height: window.innerHeight
            }
        };

        console.log('Device Detection Test:', detection);
        return detection;
    }
}

// Initialize emergency actions
window.emergencyActions = new EmergencyActions();
