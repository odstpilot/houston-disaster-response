// User Profile Management Module
class ProfileManager {
    constructor() {
        this.profile = null;
        this.profileForm = null;
        this.profileView = null;
    }

    initialize() {
        this.profileForm = document.getElementById('profileForm');
        this.profileView = document.getElementById('profileView');
        
        if (this.profileForm) {
            this.profileForm.addEventListener('submit', (e) => this.saveProfile(e));
        }

        // Load existing profile
        this.loadProfile();

        // Set up profile button
        const profileBtn = document.getElementById('profileBtn');
        if (profileBtn) {
            profileBtn.addEventListener('click', () => this.showProfileView());
        }
    }

    loadProfile() {
        try {
            const saved = localStorage.getItem(CONFIG.STORAGE_KEYS.USER_PROFILE);
            if (saved) {
                this.profile = JSON.parse(saved);
                this.populateForm();
                this.applyProfileSettings();
            } else {
                // Show profile setup on first visit
                setTimeout(() => {
                    if (!this.profile) {
                        this.showProfileSetupPrompt();
                    }
                }, 2000);
            }
        } catch (error) {
            console.error('Error loading profile:', error);
        }
    }

    saveProfile(event) {
        event.preventDefault();
        
        const formData = new FormData(this.profileForm);
        const profile = {
            zipcode: formData.get('zipcode'),
            neighborhood: formData.get('neighborhood'),
            housingType: formData.get('housingType'),
            elderly: formData.get('elderly') === 'on',
            children: formData.get('children') === 'on',
            pets: formData.get('pets') === 'on',
            medical: formData.get('medical') === 'on',
            evacuationCapability: formData.get('evacuationCapability'),
            language: formData.get('language'),
            createdAt: this.profile?.createdAt || Date.now(),
            updatedAt: Date.now()
        };

        try {
            localStorage.setItem(CONFIG.STORAGE_KEYS.USER_PROFILE, JSON.stringify(profile));
            this.profile = profile;
            this.applyProfileSettings();
            this.showSuccessMessage();
            
            // Generate personalized recommendations
            this.generateRecommendations();
            
            // Return to dashboard
            setTimeout(() => {
                this.hideProfileView();
            }, 1500);
        } catch (error) {
            console.error('Error saving profile:', error);
            this.showErrorMessage();
        }
    }

    populateForm() {
        if (!this.profile || !this.profileForm) return;

        // Fill in form fields
        const fields = ['zipcode', 'neighborhood', 'housingType', 'evacuationCapability', 'language'];
        fields.forEach(field => {
            const input = this.profileForm.elements[field];
            if (input && this.profile[field]) {
                input.value = this.profile[field];
            }
        });

        // Check checkboxes
        const checkboxes = ['elderly', 'children', 'pets', 'medical'];
        checkboxes.forEach(field => {
            const input = this.profileForm.elements[field];
            if (input) {
                input.checked = this.profile[field] || false;
            }
        });
    }

    applyProfileSettings() {
        if (!this.profile) return;

        // Apply language setting
        if (this.profile.language && this.profile.language !== 'en') {
            this.setLanguage(this.profile.language);
        }

        // Update UI based on profile
        this.updateDashboardForProfile();
    }

    setLanguage(lang) {
        document.documentElement.lang = lang;
        localStorage.setItem(CONFIG.STORAGE_KEYS.LANGUAGE, lang);
        
        // Update language button
        const langBtn = document.getElementById('languageBtn');
        if (langBtn) {
            const langCode = CONFIG.LANGUAGES[lang] || lang.toUpperCase();
            langBtn.innerHTML = `<i class="fas fa-language"></i> ${langCode}`;
        }

        // Load language-specific content
        this.loadTranslations(lang);
    }

    async loadTranslations(lang) {
        // In production, this would load from a translations file
        // For demo, we'll just update key UI elements
        if (lang === 'es') {
            document.querySelector('h1').textContent = 'Respuesta a Desastres de Houston';
            const emergencyBtn = document.querySelector('.quick-action');
            if (emergencyBtn) emergencyBtn.innerHTML = '<i class="fas fa-phone-alt mr-1"></i> Emergencia: 911';
        } else if (lang === 'vi') {
            document.querySelector('h1').textContent = 'Ứng Phó Thảm Họa Houston';
        } else if (lang === 'zh') {
            document.querySelector('h1').textContent = '休斯顿灾害响应';
        }
    }

    updateDashboardForProfile() {
        // Customize dashboard based on user profile
        if (this.profile.neighborhood) {
            const neighborhoodData = CONFIG.NEIGHBORHOODS[this.profile.neighborhood];
            if (neighborhoodData) {
                // Update flood risk indicator
                const floodRiskCard = document.querySelector('.status-card:nth-child(2)');
                if (floodRiskCard) {
                    const riskLevel = neighborhoodData.floodRisk;
                    const riskColors = {
                        low: { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-700' },
                        moderate: { bg: 'bg-yellow-50', border: 'border-yellow-200', text: 'text-yellow-700' },
                        high: { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700' }
                    };
                    
                    const colors = riskColors[riskLevel] || riskColors.moderate;
                    floodRiskCard.className = `status-card p-4 ${colors.bg} rounded-lg border ${colors.border}`;
                    floodRiskCard.querySelector('p:nth-child(2)').className = `text-2xl font-bold ${colors.text}`;
                    floodRiskCard.querySelector('p:nth-child(2)').textContent = riskLevel.charAt(0).toUpperCase() + riskLevel.slice(1);
                    floodRiskCard.querySelector('p:nth-child(3)').textContent = `${this.profile.neighborhood} area risk`;
                }
            }
        }

        // Show relevant alerts based on household composition
        if (this.profile.elderly || this.profile.medical) {
            this.addSpecialNeedsAlert();
        }
        
        if (this.profile.pets) {
            this.addPetEvacuationInfo();
        }
    }

    generateRecommendations() {
        const recommendations = [];

        // Location-based recommendations
        if (this.profile.neighborhood) {
            const neighborhoodData = CONFIG.NEIGHBORHOODS[this.profile.neighborhood];
            if (neighborhoodData?.floodRisk === 'high') {
                recommendations.push({
                    type: 'warning',
                    title: 'High Flood Risk Area',
                    message: 'Your area has high flood risk. Consider flood insurance (30-day waiting period).',
                    action: 'Learn about flood insurance',
                    link: 'https://www.floodsmart.gov'
                });
            }
            
            if (neighborhoodData?.evacuationZone !== 'None') {
                recommendations.push({
                    type: 'info',
                    title: `Evacuation Zone ${neighborhoodData.evacuationZone}`,
                    message: `You are in evacuation zone ${neighborhoodData.evacuationZone}. Know your evacuation routes.`,
                    action: 'View evacuation routes',
                    callback: () => this.showEvacuationRoutes()
                });
            }
        }

        // Household-based recommendations
        if (this.profile.elderly) {
            recommendations.push({
                type: 'info',
                title: 'Senior Services',
                message: 'Register with STEAR for assistance during emergencies.',
                action: 'Register with STEAR',
                link: 'https://tdem.texas.gov/stear/'
            });
        }

        if (this.profile.medical) {
            recommendations.push({
                type: 'warning',
                title: 'Medical Needs Registry',
                message: 'Register with CenterPoint for priority power restoration.',
                action: 'Register now',
                link: 'https://www.centerpointenergy.com/en-us/residential/customer-service/electric-outage-center/critical-care'
            });
        }

        if (this.profile.pets) {
            recommendations.push({
                type: 'info',
                title: 'Pet Preparedness',
                message: 'Not all shelters accept pets. Plan pet-friendly accommodations.',
                action: 'Find pet-friendly shelters',
                callback: () => this.showPetShelters()
            });
        }

        if (this.profile.evacuationCapability === 'none') {
            recommendations.push({
                type: 'warning',
                title: 'Transportation Assistance',
                message: 'Register for evacuation assistance if you lack transportation.',
                action: 'Get transportation help',
                link: 'tel:311'
            });
        }

        // Show recommendations
        this.displayRecommendations(recommendations);
    }

    displayRecommendations(recommendations) {
        // Create or update recommendations section
        let recSection = document.getElementById('recommendations');
        if (!recSection) {
            recSection = document.createElement('div');
            recSection.id = 'recommendations';
            recSection.className = 'bg-white rounded-lg shadow-md p-6 mb-6';
            
            const dashboard = document.getElementById('dashboardView');
            if (dashboard) {
                dashboard.insertBefore(recSection, dashboard.children[1]);
            }
        }

        recSection.innerHTML = `
            <h2 class="text-xl font-bold mb-4 text-gray-800">
                <i class="fas fa-exclamation-circle text-yellow-500 mr-2"></i>
                Personalized Recommendations
            </h2>
            <div class="space-y-3">
                ${recommendations.map(rec => this.createRecommendationCard(rec)).join('')}
            </div>
        `;

        // Add event listeners for action buttons
        recommendations.forEach((rec, index) => {
            if (rec.callback) {
                const btn = document.getElementById(`rec-action-${index}`);
                if (btn) {
                    btn.addEventListener('click', rec.callback);
                }
            }
        });
    }

    createRecommendationCard(rec) {
        const colors = {
            warning: { bg: 'bg-yellow-50', border: 'border-yellow-200', icon: 'fa-exclamation-triangle', iconColor: 'text-yellow-600' },
            info: { bg: 'bg-blue-50', border: 'border-blue-200', icon: 'fa-info-circle', iconColor: 'text-blue-600' },
            success: { bg: 'bg-green-50', border: 'border-green-200', icon: 'fa-check-circle', iconColor: 'text-green-600' }
        };

        const style = colors[rec.type] || colors.info;
        const actionButton = rec.link 
            ? `<a href="${rec.link}" target="_blank" class="text-sm px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700">${rec.action}</a>`
            : `<button id="rec-action-${Math.random().toString(36).substr(2, 9)}" class="text-sm px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700">${rec.action}</button>`;

        return `
            <div class="${style.bg} ${style.border} border rounded-lg p-4">
                <div class="flex items-start">
                    <i class="fas ${style.icon} ${style.iconColor} mr-3 mt-1"></i>
                    <div class="flex-1">
                        <h3 class="font-semibold text-gray-800">${rec.title}</h3>
                        <p class="text-sm text-gray-600 mt-1">${rec.message}</p>
                        <div class="mt-2">
                            ${actionButton}
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    showProfileView() {
        // Hide other views
        document.querySelectorAll('.view').forEach(view => {
            view.classList.add('hidden');
        });
        
        // Show profile view
        if (this.profileView) {
            this.profileView.classList.remove('hidden');
        }
    }

    hideProfileView() {
        if (this.profileView) {
            this.profileView.classList.add('hidden');
        }
        
        // Show dashboard
        const dashboard = document.getElementById('dashboardView');
        if (dashboard) {
            dashboard.classList.remove('hidden');
        }
    }

    showProfileSetupPrompt() {
        // Lower map z-index to prevent overlap
        const mapElement = document.getElementById('map');
        if (mapElement) {
            mapElement.style.zIndex = '0';
        }
        
        const prompt = document.createElement('div');
        prompt.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center';
        prompt.style.zIndex = '9999';
        prompt.innerHTML = `
            <div class="bg-white rounded-lg p-6 max-w-md mx-4">
                <h2 class="text-xl font-bold mb-4">Welcome to Houston Disaster Response</h2>
                <p class="text-gray-600 mb-6">
                    Set up your profile to receive personalized disaster preparedness advice 
                    and alerts specific to your location and needs.
                </p>
                <div class="flex gap-3">
                    <button id="setupProfileBtn" class="flex-1 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                        Set Up Profile
                    </button>
                    <button id="skipProfileBtn" class="flex-1 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400">
                        Skip for Now
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(prompt);
        
        document.getElementById('setupProfileBtn').addEventListener('click', () => {
            this.closeModal(prompt);
            this.showProfileView();
        });
        
        document.getElementById('skipProfileBtn').addEventListener('click', () => {
            this.closeModal(prompt);
        });
    }

    closeModal(element) {
        // Restore map z-index
        const mapElement = document.getElementById('map');
        if (mapElement) {
            mapElement.style.zIndex = '1';
        }
        
        // Remove the modal
        if (element) {
            element.remove();
        }
    }

    showSuccessMessage() {
        this.showToast('Profile saved successfully!', 'success');
    }

    showErrorMessage() {
        this.showToast('Error saving profile. Please try again.', 'error');
    }

    showToast(message, type = 'info') {
        const toast = document.createElement('div');
        const colors = {
            success: 'bg-green-500',
            error: 'bg-red-500',
            info: 'bg-blue-500',
            warning: 'bg-yellow-500'
        };
        
        toast.className = `fixed top-20 right-4 ${colors[type]} text-white px-6 py-3 rounded-lg shadow-lg z-50`;
        toast.textContent = message;
        
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.style.transition = 'opacity 0.5s';
            toast.style.opacity = '0';
            setTimeout(() => toast.remove(), 500);
        }, 3000);
    }


    showPetShelters() {
        // Filter shelters that accept pets
        if (window.disasterMap) {
            window.disasterMap.toggleLayer('shelters');
        }
        this.showToast('Showing pet-friendly shelters on map', 'info');
    }

    addSpecialNeedsAlert() {
        const alert = document.createElement('div');
        alert.className = 'bg-purple-50 border border-purple-200 rounded-lg p-4 mb-4';
        alert.innerHTML = `
            <div class="flex items-center">
                <i class="fas fa-wheelchair text-purple-600 mr-3"></i>
                <div>
                    <p class="font-semibold text-purple-800">Special Needs Registry</p>
                    <p class="text-sm text-gray-600">You may qualify for additional assistance during emergencies.</p>
                </div>
            </div>
        `;
        
        const dashboard = document.getElementById('dashboardView');
        if (dashboard) {
            dashboard.insertBefore(alert, dashboard.firstChild);
        }
    }

    addPetEvacuationInfo() {
        const info = document.createElement('div');
        info.className = 'bg-orange-50 border border-orange-200 rounded-lg p-4 mb-4';
        info.innerHTML = `
            <div class="flex items-center">
                <i class="fas fa-paw text-orange-600 mr-3"></i>
                <div>
                    <p class="font-semibold text-orange-800">Pet Evacuation Planning</p>
                    <p class="text-sm text-gray-600">Remember to include pet supplies and locate pet-friendly shelters.</p>
                </div>
            </div>
        `;
        
        const dashboard = document.getElementById('dashboardView');
        if (dashboard) {
            dashboard.insertBefore(info, dashboard.firstChild);
        }
    }

    exportProfile() {
        if (!this.profile) return;
        
        const dataStr = JSON.stringify(this.profile, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
        
        const exportFileDefaultName = `houston-disaster-profile-${Date.now()}.json`;
        
        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
    }

    importProfile(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const profile = JSON.parse(e.target.result);
                this.profile = profile;
                localStorage.setItem(CONFIG.STORAGE_KEYS.USER_PROFILE, JSON.stringify(profile));
                this.populateForm();
                this.applyProfileSettings();
                this.showSuccessMessage();
            } catch (error) {
                console.error('Error importing profile:', error);
                this.showErrorMessage();
            }
        };
        reader.readAsText(file);
    }
}

// Initialize profile manager
window.profileManager = new ProfileManager();
