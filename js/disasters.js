// Disaster Type Recognition and Response Module
class DisasterManager {
    constructor() {
        this.currentDisaster = null;
        this.activeWarnings = [];
    }

    initialize() {
        this.setupDisasterCards();
        this.loadActiveWarnings();
    }

    setupDisasterCards() {
        document.querySelectorAll('.disaster-card').forEach(card => {
            card.addEventListener('click', (e) => {
                const disasterType = e.currentTarget.dataset.disaster;
                this.showDisasterInfo(disasterType);
            });
        });
    }

    async loadActiveWarnings() {
        try {
            // Check for active weather warnings
            const weatherData = await apiService.getWeatherData(
                CONFIG.HOUSTON_CENTER.lat,
                CONFIG.HOUSTON_CENTER.lng
            );
            
            if (weatherData.alerts && weatherData.alerts.length > 0) {
                this.activeWarnings = weatherData.alerts;
                this.displayActiveWarnings();
            }
        } catch (error) {
            console.error('Error loading warnings:', error);
        }
    }

    displayActiveWarnings() {
        if (this.activeWarnings.length === 0) return;
        
        const warningBanner = document.createElement('div');
        warningBanner.className = 'bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4';
        warningBanner.innerHTML = `
            <strong class="font-bold">Active Warnings:</strong>
            <ul class="mt-2">
                ${this.activeWarnings.map(w => `<li>• ${w.title}</li>`).join('')}
            </ul>
        `;
        
        const dashboard = document.getElementById('dashboardView');
        if (dashboard) {
            dashboard.insertBefore(warningBanner, dashboard.firstChild);
        }
    }

    showDisasterInfo(disasterType) {
        const disaster = CONFIG.DISASTERS[disasterType];
        if (!disaster) return;
        
        this.currentDisaster = disasterType;
        
        // Lower map z-index to prevent overlap
        const mapElement = document.getElementById('map');
        if (mapElement) {
            mapElement.style.zIndex = '0';
        }
        
        // Create modal with disaster information
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4';
        modal.style.zIndex = '9999';
        modal.innerHTML = `
            <div class="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
                <div class="p-6 border-b bg-gradient-to-r from-blue-600 to-blue-800 text-white">
                    <div class="flex justify-between items-center">
                        <h2 class="text-2xl font-bold flex items-center">
                            <i class="fas ${disaster.icon} mr-3"></i>
                            ${disaster.name} Preparedness
                        </h2>
                        <button onclick="disasterManager.closeModal(this)" class="text-3xl">&times;</button>
                    </div>
                </div>
                <div class="overflow-y-auto max-h-[70vh] p-6">
                    ${this.generateDisasterContent(disasterType)}
                </div>
                <div class="p-4 border-t bg-gray-50">
                    <div class="flex gap-3">
                        <button onclick="disasterManager.startPreparation('${disasterType}')" 
                                class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                            <i class="fas fa-clipboard-check mr-2"></i>
                            Start Preparation Checklist
                        </button>
                        <button onclick="disasterManager.showResources('${disasterType}')" 
                                class="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">
                            <i class="fas fa-book mr-2"></i>
                            View Resources
                        </button>
                        <button onclick="disasterManager.simulateDrill('${disasterType}')" 
                                class="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700">
                            <i class="fas fa-running mr-2"></i>
                            Practice Drill
                        </button>
                    </div>
                </div>
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

    generateDisasterContent(disasterType) {
        const content = {
            hurricane: this.getHurricaneContent(),
            flood: this.getFloodContent(),
            heat: this.getHeatContent(),
            freeze: this.getFreezeContent(),
            chemical: this.getChemicalContent(),
            tornado: this.getTornadoContent()
        };
        
        return content[disasterType] || '<p>Information not available</p>';
    }

    getHurricaneContent() {
        return `
            <div class="space-y-6">
                <!-- Timeline -->
                <div>
                    <h3 class="text-xl font-bold mb-3 text-gray-800">Hurricane Preparation Timeline</h3>
                    <div class="space-y-3">
                        ${this.createTimelineItem('5 Days Before', 'Begin monitoring storm track, review evacuation routes', 'blue')}
                        ${this.createTimelineItem('72 Hours Before', 'Stock up on supplies, fill prescriptions, fuel vehicles', 'yellow')}
                        ${this.createTimelineItem('48 Hours Before', 'Secure outdoor items, board windows if needed', 'orange')}
                        ${this.createTimelineItem('24 Hours Before', 'Charge devices, fill bathtubs, final preparations', 'red')}
                        ${this.createTimelineItem('12 Hours Before', 'Evacuate if ordered, shelter in place if staying', 'purple')}
                    </div>
                </div>

                <!-- Evacuation Zones -->
                <div>
                    <h3 class="text-xl font-bold mb-3 text-gray-800">Houston Evacuation Zones</h3>
                    <div class="bg-blue-50 p-4 rounded-lg">
                        <div class="space-y-2">
                            <div class="flex items-center">
                                <span class="w-20 font-semibold">Zone A:</span>
                                <span>Coastal areas - Evacuate for ALL hurricanes</span>
                            </div>
                            <div class="flex items-center">
                                <span class="w-20 font-semibold">Zone B:</span>
                                <span>Near coast - Evacuate for Category 3+ storms</span>
                            </div>
                            <div class="flex items-center">
                                <span class="w-20 font-semibold">Zone C:</span>
                                <span>Inland - Evacuate for Category 4+ storms</span>
                            </div>
                        </div>
                        <button onclick="window.open('https://www.harriscountyfws.org', '_blank')" 
                                class="mt-3 text-blue-600 underline">
                            Check Your Zone →
                        </button>
                    </div>
                </div>

                <!-- Hurricane Categories -->
                <div>
                    <h3 class="text-xl font-bold mb-3 text-gray-800">Hurricane Categories</h3>
                    <div class="space-y-2">
                        ${this.createCategoryCard(1, '74-95 mph', 'Minimal damage to structures')}
                        ${this.createCategoryCard(2, '96-110 mph', 'Moderate damage, risk to mobile homes')}
                        ${this.createCategoryCard(3, '111-129 mph', 'Devastating damage, evacuate zones A & B')}
                        ${this.createCategoryCard(4, '130-156 mph', 'Catastrophic damage, evacuate all zones')}
                        ${this.createCategoryCard(5, '157+ mph', 'Complete destruction, mandatory evacuation')}
                    </div>
                </div>

                <!-- Checklist -->
                <div>
                    <h3 class="text-xl font-bold mb-3 text-gray-800">Essential Hurricane Checklist</h3>
                    <div class="bg-gray-50 p-4 rounded-lg">
                        <ul class="space-y-2">
                            ${CONFIG.DISASTERS.hurricane.checklist.map(item => 
                                `<li class="flex items-start">
                                    <i class="fas fa-check-circle text-green-500 mr-2 mt-1"></i>
                                    <span>${item}</span>
                                </li>`
                            ).join('')}
                        </ul>
                    </div>
                </div>
            </div>
        `;
    }

    getFloodContent() {
        return `
            <div class="space-y-6">
                <!-- Flood Safety Rules -->
                <div>
                    <h3 class="text-xl font-bold mb-3 text-gray-800">Flood Safety Rules</h3>
                    <div class="bg-red-50 border border-red-200 p-4 rounded-lg">
                        <p class="font-bold text-red-800 mb-2">Turn Around Don't Drown!</p>
                        <ul class="space-y-1 text-sm">
                            <li>• 6 inches of water can knock you down</li>
                            <li>• 12 inches can carry away a vehicle</li>
                            <li>• 2 feet can float large vehicles</li>
                            <li>• Never drive through flooded roads</li>
                        </ul>
                    </div>
                </div>

                <!-- Bayou Monitoring -->
                <div>
                    <h3 class="text-xl font-bold mb-3 text-gray-800">Houston Bayou System</h3>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        ${this.createBayouCard('Buffalo Bayou', 'Downtown, Memorial, Heights')}
                        ${this.createBayouCard('Brays Bayou', 'Medical Center, Meyerland, Braeswood')}
                        ${this.createBayouCard('White Oak Bayou', 'Heights, Near Northside')}
                        ${this.createBayouCard('Greens Bayou', 'Greenspoint, North Houston')}
                    </div>
                    <button onclick="window.open('https://www.harriscountyfws.org', '_blank')" 
                            class="mt-3 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                        Monitor Bayou Levels
                    </button>
                </div>

                <!-- Flood Zones -->
                <div>
                    <h3 class="text-xl font-bold mb-3 text-gray-800">Understanding Flood Zones</h3>
                    <div class="space-y-2">
                        <div class="p-3 bg-red-100 rounded">
                            <strong>100-Year Floodplain:</strong> 1% chance of flooding each year
                        </div>
                        <div class="p-3 bg-yellow-100 rounded">
                            <strong>500-Year Floodplain:</strong> 0.2% chance of flooding each year
                        </div>
                        <div class="p-3 bg-green-100 rounded">
                            <strong>Outside Floodplain:</strong> Lower risk but flooding still possible
                        </div>
                    </div>
                </div>

                <!-- Flood Insurance -->
                <div>
                    <h3 class="text-xl font-bold mb-3 text-gray-800">Flood Insurance Information</h3>
                    <div class="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                        <p class="font-bold text-yellow-800 mb-2">⚠️ Important: 30-Day Waiting Period</p>
                        <p class="text-sm mb-3">Flood insurance takes 30 days to become effective. Don't wait for a storm!</p>
                        <ul class="space-y-1 text-sm">
                            <li>• Standard homeowners insurance does NOT cover flooding</li>
                            <li>• Available through NFIP or private insurers</li>
                            <li>• Covers structure and contents separately</li>
                            <li>• Required for mortgages in high-risk areas</li>
                        </ul>
                    </div>
                </div>
            </div>
        `;
    }

    getHeatContent() {
        return `
            <div class="space-y-6">
                <!-- Heat Index -->
                <div>
                    <h3 class="text-xl font-bold mb-3 text-gray-800">Understanding Heat Index</h3>
                    <div class="bg-orange-50 p-4 rounded-lg">
                        <div class="space-y-2">
                            <div class="p-2 bg-yellow-200 rounded">
                                <strong>80-90°F:</strong> Caution - Fatigue possible
                            </div>
                            <div class="p-2 bg-orange-200 rounded">
                                <strong>90-105°F:</strong> Extreme Caution - Heat cramps/exhaustion possible
                            </div>
                            <div class="p-2 bg-red-200 rounded">
                                <strong>105-130°F:</strong> Danger - Heat exhaustion likely
                            </div>
                            <div class="p-2 bg-red-400 text-white rounded">
                                <strong>Above 130°F:</strong> Extreme Danger - Heat stroke imminent
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Cooling Centers -->
                <div>
                    <h3 class="text-xl font-bold mb-3 text-gray-800">Houston Cooling Centers</h3>
                    <p class="mb-3">Free air-conditioned spaces open during extreme heat:</p>
                    <ul class="space-y-2">
                        <li>• Houston Public Libraries (all branches)</li>
                        <li>• Multi-Service Centers</li>
                        <li>• Community Centers</li>
                        <li>• Shopping Malls</li>
                    </ul>
                    <button onclick="notificationManager.createAlert({type:'info', title:'Find Cooling Centers', message:'Call 311 for nearest location'})" 
                            class="mt-3 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                        Find Nearest Center
                    </button>
                </div>

                <!-- Heat-Related Illness -->
                <div>
                    <h3 class="text-xl font-bold mb-3 text-gray-800">Recognize Heat Illness</h3>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div class="p-4 bg-yellow-50 rounded-lg">
                            <h4 class="font-bold text-yellow-800">Heat Exhaustion</h4>
                            <ul class="text-sm mt-2 space-y-1">
                                <li>• Heavy sweating</li>
                                <li>• Weakness/fatigue</li>
                                <li>• Nausea</li>
                                <li>• Headache</li>
                                <li>• Muscle cramps</li>
                            </ul>
                        </div>
                        <div class="p-4 bg-red-50 rounded-lg">
                            <h4 class="font-bold text-red-800">Heat Stroke (Call 911)</h4>
                            <ul class="text-sm mt-2 space-y-1">
                                <li>• High body temperature</li>
                                <li>• No sweating</li>
                                <li>• Confusion</li>
                                <li>• Loss of consciousness</li>
                                <li>• Seizures</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    getFreezeContent() {
        return `
            <div class="space-y-6">
                <!-- Winter Storm Preparation -->
                <div>
                    <h3 class="text-xl font-bold mb-3 text-gray-800">Texas Winter Storm Preparation</h3>
                    <div class="bg-cyan-50 p-4 rounded-lg">
                        <p class="mb-3">Houston's infrastructure is vulnerable to freezing temperatures:</p>
                        <ul class="space-y-2">
                            <li class="flex items-start">
                                <i class="fas fa-snowflake text-cyan-600 mr-2 mt-1"></i>
                                <span><strong>Power Grid:</strong> Monitor ERCOT conditions and prepare for outages</span>
                            </li>
                            <li class="flex items-start">
                                <i class="fas fa-tint text-blue-600 mr-2 mt-1"></i>
                                <span><strong>Water:</strong> Pipes can freeze and burst - know shut-off valve location</span>
                            </li>
                            <li class="flex items-start">
                                <i class="fas fa-car text-gray-600 mr-2 mt-1"></i>
                                <span><strong>Roads:</strong> Ice forms quickly on overpasses and bridges</span>
                            </li>
                        </ul>
                    </div>
                </div>

                <!-- Pipe Protection -->
                <div>
                    <h3 class="text-xl font-bold mb-3 text-gray-800">Protecting Your Pipes</h3>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div class="p-4 bg-blue-50 rounded-lg">
                            <h4 class="font-bold text-blue-800">Before the Freeze</h4>
                            <ul class="text-sm mt-2 space-y-1">
                                <li>• Insulate exposed pipes</li>
                                <li>• Disconnect garden hoses</li>
                                <li>• Cover outdoor faucets</li>
                                <li>• Seal cracks and openings</li>
                            </ul>
                        </div>
                        <div class="p-4 bg-purple-50 rounded-lg">
                            <h4 class="font-bold text-purple-800">During the Freeze</h4>
                            <ul class="text-sm mt-2 space-y-1">
                                <li>• Drip faucets (pencil-thin stream)</li>
                                <li>• Open cabinet doors under sinks</li>
                                <li>• Keep garage doors closed</li>
                                <li>• Maintain heat above 55°F</li>
                            </ul>
                        </div>
                    </div>
                </div>

                <!-- Warming Centers -->
                <div>
                    <h3 class="text-xl font-bold mb-3 text-gray-800">Warming Centers & Resources</h3>
                    <div class="bg-orange-50 p-4 rounded-lg">
                        <p class="mb-3">Houston opens warming centers when temperatures drop below 40°F:</p>
                        <ul class="space-y-1">
                            <li>• George R. Brown Convention Center</li>
                            <li>• Local churches and community centers</li>
                            <li>• Call 311 for locations and transportation</li>
                        </ul>
                    </div>
                </div>
            </div>
        `;
    }

    getChemicalContent() {
        return `
            <div class="space-y-6">
                <!-- Chemical Emergency Types -->
                <div>
                    <h3 class="text-xl font-bold mb-3 text-gray-800">Houston Chemical Hazards</h3>
                    <div class="bg-yellow-50 p-4 rounded-lg">
                        <p class="mb-3">Houston has numerous chemical facilities and refineries:</p>
                        <ul class="space-y-2">
                            <li>• <strong>Ship Channel:</strong> Multiple petrochemical plants</li>
                            <li>• <strong>Pasadena/Deer Park:</strong> Refinery row</li>
                            <li>• <strong>Texas City:</strong> Chemical manufacturing</li>
                            <li>• <strong>Rail/Highway:</strong> Hazmat transportation</li>
                        </ul>
                    </div>
                </div>

                <!-- Shelter in Place -->
                <div>
                    <h3 class="text-xl font-bold mb-3 text-gray-800">Shelter-in-Place Procedures</h3>
                    <div class="bg-red-50 border border-red-200 p-4 rounded-lg">
                        <p class="font-bold text-red-800 mb-3">If ordered to shelter-in-place:</p>
                        <ol class="space-y-2 list-decimal list-inside">
                            <li>Go inside immediately and close all doors/windows</li>
                            <li>Turn off HVAC systems, fans, and fireplace dampers</li>
                            <li>Go to pre-designated shelter room (interior, few windows)</li>
                            <li>Seal gaps with wet towels, plastic sheeting, and duct tape</li>
                            <li>Monitor emergency broadcasts</li>
                            <li>Do NOT leave until all-clear is given</li>
                        </ol>
                    </div>
                </div>

                <!-- Emergency Kit for Chemical Events -->
                <div>
                    <h3 class="text-xl font-bold mb-3 text-gray-800">Chemical Emergency Kit</h3>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <ul class="space-y-1">
                            <li>• Plastic sheeting (pre-cut to fit windows)</li>
                            <li>• Duct tape</li>
                            <li>• Scissors</li>
                            <li>• Wet towels</li>
                        </ul>
                        <ul class="space-y-1">
                            <li>• Battery-powered radio</li>
                            <li>• N95 or P100 masks</li>
                            <li>• First aid kit</li>
                            <li>• Water and snacks</li>
                        </ul>
                    </div>
                </div>
            </div>
        `;
    }

    getTornadoContent() {
        return `
            <div class="space-y-6">
                <!-- Tornado Safety -->
                <div>
                    <h3 class="text-xl font-bold mb-3 text-gray-800">Tornado Safety</h3>
                    <div class="bg-purple-50 p-4 rounded-lg">
                        <div class="mb-4">
                            <p class="font-bold text-purple-800">Watch vs Warning:</p>
                            <ul class="mt-2 space-y-1">
                                <li>• <strong>Watch:</strong> Conditions favorable - Be prepared</li>
                                <li>• <strong>Warning:</strong> Tornado spotted - Take shelter NOW</li>
                            </ul>
                        </div>
                    </div>
                </div>

                <!-- Safe Locations -->
                <div>
                    <h3 class="text-xl font-bold mb-3 text-gray-800">Where to Shelter</h3>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div class="p-4 bg-green-50 rounded-lg">
                            <h4 class="font-bold text-green-800">Best Options</h4>
                            <ul class="text-sm mt-2 space-y-1">
                                <li>• Basement or storm cellar</li>
                                <li>• Interior room on lowest floor</li>
                                <li>• Small interior room (closet, bathroom)</li>
                                <li>• Under stairwell</li>
                            </ul>
                        </div>
                        <div class="p-4 bg-red-50 rounded-lg">
                            <h4 class="font-bold text-red-800">Avoid These</h4>
                            <ul class="text-sm mt-2 space-y-1">
                                <li>• Windows</li>
                                <li>• Outside walls</li>
                                <li>• Large rooms (gyms, cafeterias)</li>
                                <li>• Mobile homes (evacuate!)</li>
                            </ul>
                        </div>
                    </div>
                </div>

                <!-- Tornado Signs -->
                <div>
                    <h3 class="text-xl font-bold mb-3 text-gray-800">Warning Signs</h3>
                    <ul class="space-y-2">
                        <li>• Dark, greenish sky</li>
                        <li>• Large, dark, low-lying clouds</li>
                        <li>• Large hail</li>
                        <li>• Loud roar (like freight train)</li>
                        <li>• Visible rotation in cloud base</li>
                    </ul>
                </div>
            </div>
        `;
    }

    createTimelineItem(time, action, color) {
        const colors = {
            blue: 'bg-blue-100 border-blue-300',
            yellow: 'bg-yellow-100 border-yellow-300',
            orange: 'bg-orange-100 border-orange-300',
            red: 'bg-red-100 border-red-300',
            purple: 'bg-purple-100 border-purple-300'
        };
        
        return `
            <div class="flex items-center p-3 ${colors[color]} border-l-4 rounded">
                <span class="font-bold w-32">${time}:</span>
                <span>${action}</span>
            </div>
        `;
    }

    createCategoryCard(category, windSpeed, description) {
        const colors = ['', 'bg-green-100', 'bg-yellow-100', 'bg-orange-100', 'bg-red-100', 'bg-purple-100'];
        return `
            <div class="p-3 ${colors[category]} rounded flex items-center">
                <span class="font-bold w-20">Cat ${category}:</span>
                <span class="w-32">${windSpeed}</span>
                <span class="text-sm">${description}</span>
            </div>
        `;
    }

    createBayouCard(name, areas) {
        return `
            <div class="p-3 bg-blue-50 rounded-lg">
                <h4 class="font-semibold text-blue-800">${name}</h4>
                <p class="text-sm text-gray-600 mt-1">Areas: ${areas}</p>
            </div>
        `;
    }

    startPreparation(disasterType) {
        // Close modal
        document.querySelector('.fixed').remove();
        
        // Switch to checklist view with disaster-specific items
        const checklistView = document.getElementById('checklistView');
        const dashboardView = document.getElementById('dashboardView');
        
        if (checklistView && dashboardView) {
            dashboardView.classList.add('hidden');
            checklistView.classList.remove('hidden');
            
            // Scroll to top
            window.scrollTo(0, 0);
            
            // Show notification
            notificationManager.createAlert({
                type: 'info',
                severity: 'info',
                title: `${CONFIG.DISASTERS[disasterType].name} Checklist`,
                message: 'Your personalized preparation checklist is ready.',
                expires: Date.now() + 10000
            });
        }
    }

    showResources(disasterType) {
        const resources = {
            hurricane: [
                { name: 'National Hurricane Center', url: 'https://www.nhc.noaa.gov' },
                { name: 'Harris County Flood Warning', url: 'https://www.harriscountyfws.org' },
                { name: 'Ready Harris', url: 'https://www.readyharris.org' }
            ],
            flood: [
                { name: 'Harris County Flood Control', url: 'https://www.hcfcd.org' },
                { name: 'FEMA Flood Maps', url: 'https://msc.fema.gov/portal' },
                { name: 'FloodSmart.gov', url: 'https://www.floodsmart.gov' }
            ],
            heat: [
                { name: 'Heat.gov', url: 'https://www.heat.gov' },
                { name: 'Houston Health Dept', url: 'https://www.houstontx.gov/health' }
            ],
            freeze: [
                { name: 'ERCOT Grid Conditions', url: 'https://www.ercot.com' },
                { name: 'CenterPoint Energy', url: 'https://www.centerpointenergy.com' }
            ],
            chemical: [
                { name: 'Local Emergency Planning', url: 'https://www.tceq.texas.gov' },
                { name: 'Pipeline Safety', url: 'https://www.phmsa.dot.gov' }
            ],
            tornado: [
                { name: 'Storm Prediction Center', url: 'https://www.spc.noaa.gov' },
                { name: 'NWS Houston', url: 'https://www.weather.gov/hgx' }
            ]
        };
        
        const links = resources[disasterType] || [];
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4';
        modal.innerHTML = `
            <div class="bg-white rounded-lg max-w-md w-full p-6">
                <h3 class="text-xl font-bold mb-4">Resources for ${CONFIG.DISASTERS[disasterType].name}</h3>
                <div class="space-y-2">
                    ${links.map(link => `
                        <a href="${link.url}" target="_blank" 
                           class="block p-3 bg-blue-50 rounded hover:bg-blue-100 transition">
                            <span class="text-blue-600 underline">${link.name}</span>
                            <i class="fas fa-external-link-alt ml-2 text-sm"></i>
                        </a>
                    `).join('')}
                </div>
                <button onclick="disasterManager.closeModal(this)" 
                        class="mt-4 w-full py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400">
                    Close
                </button>
            </div>
        `;
        document.body.appendChild(modal);
    }

    simulateDrill(disasterType) {
        // Close current modal
        document.querySelector('.fixed').remove();
        
        // Start interactive drill
        this.startInteractiveDrill(disasterType);
    }

    startInteractiveDrill(disasterType) {
        const drills = {
            hurricane: this.hurricaneDrill(),
            flood: this.floodDrill(),
            tornado: this.tornadoDrill()
        };
        
        const drill = drills[disasterType];
        if (!drill) {
            alert('Drill not available for this disaster type yet.');
            return;
        }
        
        this.runDrill(drill);
    }

    hurricaneDrill() {
        return {
            title: 'Hurricane Evacuation Drill',
            steps: [
                {
                    instruction: 'Check current hurricane category and your evacuation zone',
                    action: 'View your evacuation zone on the map',
                    time: 60
                },
                {
                    instruction: 'Gather important documents',
                    action: 'Collect insurance papers, IDs, medical records',
                    time: 120
                },
                {
                    instruction: 'Pack emergency kit',
                    action: 'Gather water, food, medications, flashlight',
                    time: 180
                },
                {
                    instruction: 'Secure your home',
                    action: 'Board windows, bring in outdoor items',
                    time: 300
                },
                {
                    instruction: 'Execute evacuation',
                    action: 'Load vehicle and follow evacuation route',
                    time: 120
                }
            ]
        };
    }

    floodDrill() {
        return {
            title: 'Flash Flood Response Drill',
            steps: [
                {
                    instruction: 'Monitor flood warnings',
                    action: 'Check bayou levels and weather alerts',
                    time: 30
                },
                {
                    instruction: 'Move to higher ground',
                    action: 'Identify safest route to higher elevation',
                    time: 60
                },
                {
                    instruction: 'Secure valuables',
                    action: 'Move important items to upper floors',
                    time: 120
                },
                {
                    instruction: 'Turn off utilities',
                    action: 'Shut off electricity and gas if flooding imminent',
                    time: 60
                }
            ]
        };
    }

    tornadoDrill() {
        return {
            title: 'Tornado Warning Drill',
            steps: [
                {
                    instruction: 'Tornado warning issued!',
                    action: 'Move to safe room immediately',
                    time: 30
                },
                {
                    instruction: 'Protect yourself',
                    action: 'Get low, cover head with hands or helmet',
                    time: 15
                },
                {
                    instruction: 'Wait for all-clear',
                    action: 'Stay in position until danger passes',
                    time: 180
                }
            ]
        };
    }

    runDrill(drill) {
        let currentStep = 0;
        
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4';
        modal.innerHTML = `
            <div class="bg-white rounded-lg max-w-2xl w-full p-6">
                <h2 class="text-2xl font-bold mb-4">${drill.title}</h2>
                <div id="drillContent">
                    <!-- Content will be updated dynamically -->
                </div>
                <div class="mt-6 flex gap-3">
                    <button id="drillNext" class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                        Start Drill
                    </button>
                    <button onclick="disasterManager.closeModal(this)" 
                            class="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400">
                        Cancel
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        const content = document.getElementById('drillContent');
        const nextBtn = document.getElementById('drillNext');
        
        const showStep = () => {
            if (currentStep >= drill.steps.length) {
                content.innerHTML = `
                    <div class="text-center py-8">
                        <i class="fas fa-check-circle text-green-500 text-6xl mb-4"></i>
                        <h3 class="text-xl font-bold text-green-700">Drill Complete!</h3>
                        <p class="mt-2 text-gray-600">Great job! You completed the ${drill.title}.</p>
                        <p class="mt-4 text-sm text-gray-500">
                            Remember to practice this drill regularly with your family.
                        </p>
                    </div>
                `;
                nextBtn.textContent = 'Close';
                nextBtn.onclick = () => this.closeModal(nextBtn);
            } else {
                const step = drill.steps[currentStep];
                content.innerHTML = `
                    <div class="space-y-4">
                        <div class="flex items-center justify-between">
                            <h3 class="text-lg font-semibold">Step ${currentStep + 1} of ${drill.steps.length}</h3>
                            <span class="text-sm text-gray-500">Time limit: ${step.time} seconds</span>
                        </div>
                        <div class="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                            <p class="font-semibold text-yellow-800">${step.instruction}</p>
                            <p class="mt-2 text-gray-700">${step.action}</p>
                        </div>
                        <div class="w-full bg-gray-200 rounded-full h-2">
                            <div class="bg-blue-600 h-2 rounded-full transition-all" 
                                 style="width: ${((currentStep + 1) / drill.steps.length) * 100}%"></div>
                        </div>
                    </div>
                `;
                
                nextBtn.textContent = currentStep === drill.steps.length - 1 ? 'Finish' : 'Next Step';
                currentStep++;
            }
        };
        
        nextBtn.onclick = showStep;
        showStep();
    }
}

// Initialize disaster manager
window.disasterManager = new DisasterManager();
