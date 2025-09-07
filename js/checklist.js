// Preparedness Checklist Module
class ChecklistManager {
    constructor() {
        this.checklistData = {};
        this.progress = 0;
    }

    initialize() {
        this.loadChecklist();
        this.setupEventListeners();
        this.updateProgress();
    }

    loadChecklist() {
        // Load saved checklist data
        try {
            const saved = localStorage.getItem(CONFIG.STORAGE_KEYS.CHECKLIST_PROGRESS);
            if (saved) {
                this.checklistData = JSON.parse(saved);
                this.restoreCheckboxStates();
            }
        } catch (error) {
            console.error('Error loading checklist:', error);
        }
    }

    setupEventListeners() {
        // Checklist item change handlers
        document.querySelectorAll('.checklist-item').forEach(checkbox => {
            checkbox.addEventListener('change', (e) => {
                this.updateItemStatus(e.target);
                this.updateProgress();
                this.saveChecklist();
            });
        });

        // Download checklist button
        const downloadBtn = document.querySelector('button[onclick*="download"]');
        if (downloadBtn) {
            downloadBtn.onclick = () => this.downloadChecklist();
        }

        // Share checklist button
        const shareBtn = document.querySelector('button[onclick*="share"]');
        if (shareBtn) {
            shareBtn.onclick = () => this.shareChecklist();
        }
    }

    updateItemStatus(checkbox) {
        const itemId = this.getItemId(checkbox);
        this.checklistData[itemId] = {
            checked: checkbox.checked,
            timestamp: Date.now()
        };

        // Visual feedback
        if (checkbox.checked) {
            checkbox.parentElement.classList.add('line-through', 'text-gray-500');
        } else {
            checkbox.parentElement.classList.remove('line-through', 'text-gray-500');
        }
    }

    getItemId(checkbox) {
        // Generate unique ID based on label text
        const label = checkbox.parentElement.textContent.trim();
        return btoa(label).replace(/[^a-zA-Z0-9]/g, '').substring(0, 10);
    }

    updateProgress() {
        const checkboxes = document.querySelectorAll('.checklist-item');
        const checkedCount = document.querySelectorAll('.checklist-item:checked').length;
        
        this.progress = checkboxes.length > 0 
            ? Math.round((checkedCount / checkboxes.length) * 100) 
            : 0;

        // Update UI
        const progressText = document.getElementById('checklistProgress');
        const progressBar = document.getElementById('progressBar');
        
        if (progressText) {
            progressText.textContent = this.progress;
        }
        
        if (progressBar) {
            progressBar.style.width = `${this.progress}%`;
            
            // Change color based on progress
            if (this.progress < 33) {
                progressBar.className = 'bg-red-500 h-3 rounded-full transition-all';
            } else if (this.progress < 66) {
                progressBar.className = 'bg-yellow-500 h-3 rounded-full transition-all';
            } else {
                progressBar.className = 'bg-green-500 h-3 rounded-full transition-all';
            }
        }

        // Show completion message
        if (this.progress === 100) {
            this.showCompletionMessage();
        }
    }

    saveChecklist() {
        try {
            localStorage.setItem(CONFIG.STORAGE_KEYS.CHECKLIST_PROGRESS, JSON.stringify(this.checklistData));
        } catch (error) {
            console.error('Error saving checklist:', error);
        }
    }

    restoreCheckboxStates() {
        document.querySelectorAll('.checklist-item').forEach(checkbox => {
            const itemId = this.getItemId(checkbox);
            if (this.checklistData[itemId]?.checked) {
                checkbox.checked = true;
                checkbox.parentElement.classList.add('line-through', 'text-gray-500');
            }
        });
    }

    showCompletionMessage() {
        const message = document.createElement('div');
        message.className = 'bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4';
        message.innerHTML = `
            <strong class="font-bold">Congratulations!</strong>
            <span class="block sm:inline"> You've completed your emergency preparedness checklist!</span>
            <button onclick="this.parentElement.remove()" class="absolute top-0 right-0 px-4 py-3">
                <span class="text-2xl">&times;</span>
            </button>
        `;
        
        const checklistView = document.getElementById('checklistView');
        if (checklistView) {
            checklistView.insertBefore(message, checklistView.firstChild);
        }
    }

    generatePersonalizedChecklist() {
        const profile = this.getUserProfile();
        const baseChecklist = this.getBaseChecklist();
        const personalizedItems = [];

        if (profile) {
            // Add items based on housing type
            if (profile.housingType === 'mobile') {
                personalizedItems.push({
                    category: 'Housing',
                    items: [
                        'Secure mobile home with tie-downs',
                        'Have evacuation plan (never stay in mobile home during hurricane)',
                        'Know nearest sturdy shelter location'
                    ]
                });
            } else if (profile.housingType === 'apartment' || profile.housingType === 'highrise') {
                personalizedItems.push({
                    category: 'Housing',
                    items: [
                        'Know building evacuation procedures',
                        'Identify stairwell locations (elevators may not work)',
                        'Coordinate with building management'
                    ]
                });
            }

            // Add items for elderly household members
            if (profile.elderly) {
                personalizedItems.push({
                    category: 'Elderly Care',
                    items: [
                        'Extra medications (30-day supply)',
                        'Medical equipment backup power',
                        'Cooling vests for heat emergencies',
                        'Register with STEAR program',
                        'List of doctors and pharmacies'
                    ]
                });
            }

            // Add items for children
            if (profile.children) {
                personalizedItems.push({
                    category: 'Children',
                    items: [
                        'Formula/diapers (7-day supply)',
                        'Comfort items (toys, blankets)',
                        'Children\'s medications',
                        'Entertainment (books, games)',
                        'School emergency contact info'
                    ]
                });
            }

            // Add items for pets
            if (profile.pets) {
                personalizedItems.push({
                    category: 'Pet Supplies',
                    items: [
                        'Pet food and water (7-day supply)',
                        'Pet medications',
                        'Carrier/crate for each pet',
                        'Leash, collar with ID tags',
                        'Pet first aid kit',
                        'Recent photos of pets',
                        'Vaccination records'
                    ]
                });
            }

            // Add items for medical needs
            if (profile.medical) {
                personalizedItems.push({
                    category: 'Medical Needs',
                    items: [
                        'Medical device backup batteries',
                        'Oxygen supply (if needed)',
                        'Dialysis center contact info',
                        'Medical alert bracelet/necklace',
                        'Power company medical registry'
                    ]
                });
            }

            // Add items based on evacuation capability
            if (profile.evacuationCapability === 'none') {
                personalizedItems.push({
                    category: 'Transportation',
                    items: [
                        'Register for evacuation assistance (call 311)',
                        'Arrange ride with neighbors/family',
                        'Know public transportation options',
                        'Pack light for easy transport'
                    ]
                });
            }
        }

        return { base: baseChecklist, personalized: personalizedItems };
    }

    getBaseChecklist() {
        return [
            {
                category: 'Emergency Supply Kit',
                items: [
                    'Water (1 gallon per person per day for 7 days)',
                    'Non-perishable food (7-day supply)',
                    'Manual can opener',
                    'Battery-powered or hand-crank radio',
                    'NOAA Weather Radio',
                    'Flashlight and extra batteries',
                    'First aid kit',
                    'Whistle (to signal for help)',
                    'Dust masks or N95 respirators',
                    'Plastic sheeting and duct tape',
                    'Moist towelettes and garbage bags',
                    'Wrench or pliers (to turn off utilities)',
                    'Local maps',
                    'Cell phone with chargers and backup battery'
                ]
            },
            {
                category: 'Important Documents',
                items: [
                    'Insurance policies (flood, home, auto, life)',
                    'Identification documents (driver\'s license, passport)',
                    'Bank account and credit card info',
                    'Medical records and medication list',
                    'Property deed or lease',
                    'Birth certificates',
                    'Social Security cards',
                    'Recent photos of family members',
                    'Emergency contact list'
                ]
            },
            {
                category: 'Financial Preparation',
                items: [
                    'Cash and coins (ATMs may not work)',
                    'Credit cards',
                    'Checkbook',
                    'Review insurance coverage',
                    'Document belongings (photos/video)',
                    'Know FEMA assistance process'
                ]
            },
            {
                category: 'Home Preparation',
                items: [
                    'Know how to turn off utilities',
                    'Install check valves in plumbing',
                    'Seal walls in basements',
                    'Clear gutters and drains',
                    'Trim trees near house',
                    'Secure outdoor furniture',
                    'Board windows if needed',
                    'Fill bathtubs with water',
                    'Charge all electronic devices'
                ]
            },
            {
                category: 'Communication Plan',
                items: [
                    'Family communication plan',
                    'Out-of-state contact person',
                    'School/work emergency plans',
                    'Meeting locations (nearby and out of area)',
                    'Subscribe to alert services',
                    'Download emergency apps',
                    'Program ICE contacts in phone'
                ]
            }
        ];
    }

    downloadChecklist() {
        const checklist = this.generateChecklistText();
        const blob = new Blob([checklist], { type: 'text/plain' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `houston-emergency-checklist-${Date.now()}.txt`;
        a.click();
        window.URL.revokeObjectURL(url);
    }

    generateChecklistText() {
        let text = 'HOUSTON DISASTER PREPAREDNESS CHECKLIST\n';
        text += '=' . repeat(50) + '\n\n';
        text += `Generated: ${new Date().toLocaleDateString()}\n`;
        text += `Progress: ${this.progress}% Complete\n\n`;

        document.querySelectorAll('.checklist-section').forEach(section => {
            const title = section.querySelector('h3').textContent.trim();
            text += `\n${title}\n${'-'.repeat(title.length)}\n`;
            
            section.querySelectorAll('.checklist-item').forEach(item => {
                const label = item.parentElement.textContent.trim();
                const checked = item.checked ? '[X]' : '[ ]';
                text += `${checked} ${label}\n`;
            });
        });

        text += '\n\nIMPORTANT PHONE NUMBERS\n';
        text += '-'.repeat(25) + '\n';
        Object.entries(CONFIG.EMERGENCY_CONTACTS).forEach(([name, number]) => {
            text += `${name}: ${number}\n`;
        });

        text += '\n\nFor more information visit:\n';
        text += 'houstonemergency.org\n';
        text += 'readyharris.org\n';

        return text;
    }

    shareChecklist() {
        const checklistText = this.generateChecklistText();
        
        if (navigator.share) {
            navigator.share({
                title: 'Houston Emergency Checklist',
                text: checklistText
            }).catch(err => console.log('Error sharing:', err));
        } else {
            // Fallback - copy to clipboard
            navigator.clipboard.writeText(checklistText).then(() => {
                alert('Checklist copied to clipboard!');
            }).catch(err => {
                console.error('Could not copy text:', err);
            });
        }
    }

    printChecklist() {
        window.print();
    }

    resetChecklist() {
        if (confirm('Are you sure you want to reset your checklist progress?')) {
            this.checklistData = {};
            this.progress = 0;
            
            document.querySelectorAll('.checklist-item').forEach(checkbox => {
                checkbox.checked = false;
                checkbox.parentElement.classList.remove('line-through', 'text-gray-500');
            });
            
            this.updateProgress();
            this.saveChecklist();
        }
    }

    getUserProfile() {
        const profileData = localStorage.getItem(CONFIG.STORAGE_KEYS.USER_PROFILE);
        return profileData ? JSON.parse(profileData) : null;
    }

    // Add reminder functionality
    setReminder(item, date) {
        if ('Notification' in window && Notification.permission === 'granted') {
            const now = new Date();
            const reminderDate = new Date(date);
            const timeDiff = reminderDate - now;
            
            if (timeDiff > 0) {
                setTimeout(() => {
                    new Notification('Houston Disaster Preparedness Reminder', {
                        body: `Don't forget to: ${item}`,
                        icon: '/favicon.png',
                        badge: '/favicon.png'
                    });
                }, timeDiff);
            }
        }
    }

    // Track seasonal items
    getSeasonalItems() {
        const month = new Date().getMonth();
        const seasonalItems = [];
        
        // Hurricane season (June - November)
        if (month >= 5 && month <= 10) {
            seasonalItems.push(
                'Review hurricane evacuation routes',
                'Check hurricane supplies',
                'Test generator (if you have one)',
                'Review flood insurance policy',
                'Trim trees and secure outdoor items'
            );
        }
        
        // Winter prep (November - February)
        if (month >= 10 || month <= 1) {
            seasonalItems.push(
                'Winterize pipes',
                'Check heating system',
                'Stock up on warm clothing/blankets',
                'Prepare for power outages',
                'Know warming center locations'
            );
        }
        
        // Summer heat (May - September)
        if (month >= 4 && month <= 8) {
            seasonalItems.push(
                'Check A/C system',
                'Stock extra water',
                'Know cooling center locations',
                'Plan for heat-sensitive medications',
                'Update emergency contact list'
            );
        }
        
        return seasonalItems;
    }

    loadDisasterChecklist(disasterChecklist) {
        // Clear existing checklist data for fresh start
        this.checklistData = {};
        
        // Update the checklist view with disaster-specific items
        const checklistContainer = document.querySelector('#checklistView .space-y-6');
        if (!checklistContainer) return;
        
        // Find the checklist items container
        const checklistItemsContainer = checklistContainer.querySelector('.space-y-3');
        if (!checklistItemsContainer) return;
        
        // Clear existing items
        checklistItemsContainer.innerHTML = '';
        
        // Add title
        const titleElement = document.querySelector('#checklistView h2');
        if (titleElement) {
            titleElement.textContent = disasterChecklist.title;
        }
        
        // Group items by priority
        const priorityGroups = {
            high: disasterChecklist.items.filter(item => item.priority === 'high'),
            medium: disasterChecklist.items.filter(item => item.priority === 'medium'),
            low: disasterChecklist.items.filter(item => item.priority === 'low')
        };
        
        // Add priority sections
        Object.entries(priorityGroups).forEach(([priority, items]) => {
            if (items.length > 0) {
                // Priority header
                const priorityHeader = document.createElement('div');
                priorityHeader.className = 'mt-6 mb-3';
                priorityHeader.innerHTML = `
                    <h3 class="text-lg font-semibold text-gray-800 capitalize border-b border-gray-200 pb-2">
                        ${priority} Priority
                        <span class="text-sm font-normal text-gray-500">(${items.length} items)</span>
                    </h3>
                `;
                checklistItemsContainer.appendChild(priorityHeader);
                
                // Add items for this priority
                items.forEach(item => {
                    const itemElement = document.createElement('div');
                    itemElement.className = 'flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors';
                    
                    const priorityColor = priority === 'high' ? 'red' : priority === 'medium' ? 'yellow' : 'blue';
                    
                    itemElement.innerHTML = `
                        <input type="checkbox" 
                               id="${item.id}" 
                               class="checklist-item mt-1 h-4 w-4 text-${priorityColor}-600 focus:ring-${priorityColor}-500 border-gray-300 rounded">
                        <label for="${item.id}" class="text-gray-700 cursor-pointer flex-1">
                            ${item.text}
                        </label>
                        <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium 
                                   bg-${priorityColor}-100 text-${priorityColor}-800">
                            ${priority}
                        </span>
                    `;
                    
                    checklistItemsContainer.appendChild(itemElement);
                });
            }
        });
        
        // Re-initialize event listeners for new checklist items
        this.setupEventListeners();
        
        // Update progress
        this.updateProgress();
        
        // Save the initial state
        this.saveChecklist();
    }
}

// Initialize checklist manager
window.checklistManager = new ChecklistManager();
