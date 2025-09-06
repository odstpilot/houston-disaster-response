# Houston Disaster Response & Recovery AI Assistant

A comprehensive Progressive Web Application (PWA) that provides personalized disaster preparedness and recovery advice specifically for Houston residents. The system leverages LLM capabilities augmented with real-time data and local Houston resources.

## 🚨 Features

### Core Disaster Response Capabilities

- **Multi-Disaster Support**: Hurricanes, flooding, extreme heat, winter storms, chemical emergencies, and tornadoes
- **Real-Time Data Integration**: Weather alerts, flood monitoring, air quality, traffic conditions, and power outages
- **Personalized Recommendations**: Tailored advice based on location, household composition, and special needs
- **Interactive Maps**: Evacuation routes, flood zones, shelters, and medical centers
- **AI-Powered Assistant**: Natural language chat interface for disaster preparedness questions
- **Offline Mode**: Critical information cached for access during power/internet outages
- **Multi-Language Support**: English, Spanish, Vietnamese, and Chinese

## 🚀 Getting Started

### Installation

1. **Open the application**: Navigate to `index.html` in a web browser
2. **Install as PWA**: Click the install prompt or use browser's "Install App" option
3. **Set up profile**: Complete the personalization questionnaire for tailored recommendations

### Quick Start Guide

1. **Create Your Profile**
   - Enter your ZIP code and neighborhood
   - Specify household members (elderly, children, pets, medical needs)
   - Select evacuation capability and preferred language

2. **Explore Features**
   - **Dashboard**: View current conditions and active warnings
   - **Map**: Explore flood zones, evacuation routes, and shelter locations
   - **Checklist**: Complete personalized preparedness tasks
   - **AI Assistant**: Ask questions about disaster preparedness

3. **Enable Notifications**
   - Allow browser notifications for emergency alerts
   - Receive real-time updates about weather warnings and evacuation orders

## 📱 Key Features

### Disaster Type Recognition & Response

#### Hurricane Module
- 5-day preparation timeline
- Evacuation zone lookup
- Category explanations and impact assessments
- Personalized preparation checklists

#### Flood Response
- Real-time bayou level monitoring
- Street-level flood risk assessment
- Turn Around Don't Drown reminders
- Flood insurance guidance (30-day waiting period warning)

#### Extreme Weather
- Heat index monitoring with cooling center locations
- Winter storm pipe protection guidance
- Power grid status updates
- Vulnerable population alerts

### Personalization Engine

The app creates customized experiences based on:
- Specific Houston neighborhood/ZIP code
- Household composition and special needs
- Housing type and evacuation capability
- Language preferences
- Previous disaster experience

### During-Disaster Features

- **Shelter Finder**: Real-time capacity and pet policies
- **Emergency Contacts**: Quick-dial interface
- **Damage Documentation**: Photo assistant for insurance claims
- **Family Reunification**: Tools to connect with loved ones
- **Resource Requests**: System for requesting emergency supplies

### Recovery Module

- FEMA assistance application helper
- Insurance claim guidance
- Contractor verification (fraud prevention)
- Mental health resource connections
- Long-term recovery planning

## 🗺️ Houston-Specific Information

### Integrated Local Resources
- Harris County Flood Warning System
- Houston Office of Emergency Management guidelines
- CenterPoint Energy outage maps
- Houston TranStar traffic conditions
- METRO Houston service status

### Evacuation Zones
- **Zone A**: Coastal areas - Evacuate for all hurricanes
- **Zone B**: Near coast - Evacuate for Category 3+ storms
- **Zone C**: Inland - Evacuate for Category 4+ storms

### Emergency Contacts
- Emergency: **911**
- Houston Non-Emergency: **713-884-3131**
- Houston 311: **311**
- Red Cross Gulf Coast: **713-526-8300**
- FEMA: **1-800-621-3362**

## 🔧 Technical Details

### Technologies Used
- **Frontend**: HTML5, CSS3 (Tailwind CSS), JavaScript (ES6+)
- **Mapping**: Leaflet.js with OpenStreetMap
- **PWA**: Service Worker for offline functionality
- **Storage**: LocalStorage for user data persistence
- **APIs**: Simulated weather, flood, and emergency service APIs

### Browser Requirements
- Modern browser with JavaScript enabled
- Service Worker support for offline mode
- Geolocation API for location-based features
- Notification API for emergency alerts

### Accessibility Features
- WCAG 2.1 AA compliance
- Screen reader compatible
- High contrast mode
- Large text options
- Keyboard navigation support

## 📖 User Flows

### New Hurricane Approaching
1. User receives push notification 5 days out
2. Opens personalized preparation timeline
3. Gets evacuation decision tree based on flood zone
4. Receives household-specific checklist

### During Flooding Event
1. User reports street flooding with photo
2. System provides alternate routes
3. Connects to nearest open shelter
4. Provides real-time bayou levels

### Post-Freeze Recovery
1. User reports burst pipes
2. System provides vetted plumber list
3. Guides through insurance documentation
4. Connects to disaster relief resources

## 🛡️ Privacy & Security

- All user data stored locally on device
- No personal information transmitted without consent
- HIPAA considerations for medical information
- Secure handling of sensitive data

## 🌐 Multi-Language Support

The app supports four languages:
- English (Default)
- Español (Spanish)
- Tiếng Việt (Vietnamese)  
- 中文 (Chinese)

Switch languages via the language button in the navigation bar.

## 📱 Progressive Web App Features

- **Installable**: Add to home screen for app-like experience
- **Offline Mode**: Access critical information without internet
- **Push Notifications**: Receive emergency alerts
- **Background Sync**: Sync data when connection restored
- **Responsive Design**: Works on all device sizes

## 🆘 Emergency Mode

During active disasters, the app automatically:
- Prioritizes critical information display
- Enables low-bandwidth mode
- Caches essential data for offline access
- Provides quick access to emergency contacts

## 🔄 Updates & Maintenance

The app automatically checks for updates and will notify you when new features or critical updates are available. The service worker ensures smooth updates without disrupting your experience.

## 📞 Support

For technical support or to report issues:
- During emergencies: Call **311**
- General inquiries: Visit houstonemergency.org
- App feedback: Use the in-app feedback form

## ⚠️ Disclaimer

This app provides guidance and information but should not replace official emergency communications. Always follow official evacuation orders and emergency instructions from local authorities.

## 🏛️ Credits

Developed as part of the Houston Disaster Response Initiative in collaboration with:
- Houston Office of Emergency Management
- Harris County Flood Control District
- National Weather Service Houston/Galveston
- Local community organizations

---

**Stay Safe, Houston!** 🤠

Remember: **Turn Around Don't Drown** and always have a plan!
