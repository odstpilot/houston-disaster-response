# 🏠 Houston Disaster Response & Recovery Assistant

A comprehensive Progressive Web Application (PWA) designed specifically for Houston residents to prepare for, respond to, and recover from disasters. The app provides personalized, AI-powered guidance with real-time data integration and offline capabilities.

## 🎯 Overview

The Houston Disaster Response Assistant is a feature-rich emergency preparedness application that combines real-time emergency data, personalized risk assessment, AI-powered assistance, and extensive local resource mapping to provide Houston residents with a complete disaster preparedness and response solution.

**Key Highlights:**
- Works offline with PWA technology
- Supports 4 languages (English, Spanish, Vietnamese, Chinese)
- 30+ medical facilities mapped across Houston area
- AI-powered chat assistant with Houston-specific knowledge
- Personalized risk assessment based on neighborhood
- Real-time shelter capacity and availability

## 🚨 Core Features & Modules

### 1. **Dashboard & Status Center**
- **Real-Time Conditions Display**
  - Current weather status with active alerts
  - Air Quality Index (AQI) monitoring  
  - Live evacuation status updates
  - Emergency alerts banner
- **Disaster Preparedness Cards**
  - Hurricane, Flooding, Extreme Heat
  - Winter Storm, Chemical, Tornado
  - Click-to-access detailed guidance for each disaster type

### 2. **Interactive Google Maps System**
- **Shelter Network**
  - Real-time capacity and occupancy data
  - Pet-friendly shelter indicators
  - Distance calculation from user location
  - Direct calling and turn-by-turn navigation

- **Comprehensive Medical Network (30+ Facilities)**
  - **Major Hospitals**: Texas Medical Center, Memorial Hermann, Houston Methodist
  - **Regional Hospitals**: Distributed across Houston metropolitan area
  - **Specialty Hospitals**: MD Anderson Cancer Center, Texas Children's Hospital
  - **Emergency Centers**: 24/7 standalone emergency care facilities
  - **Urgent Care Networks**: Walk-in clinics throughout the city
  - **Color-coded markers** by facility type for easy identification

- **Advanced Map Features**
  - GPS positioning with custom user location marker
  - Turn-by-turn directions to any facility
  - Distance calculations and estimated travel time

### 3. **AI-Powered Chat Assistant**
- **Natural Language Interface**
  - Ask questions about disaster preparedness
  - Get personalized recommendations based on your profile
  - Quick response buttons for common emergency queries
  - Context-aware responses with Houston-specific information

### 4. **Personal Profile System**
- **Comprehensive Customization**
  - ZIP code and Houston neighborhood selection
  - Housing type classification (house, apartment, condo, mobile home, high-rise)
  - Household composition tracking (elderly, children, pets, special medical needs)
  - Evacuation capability assessment
  - Preferred language selection

### 5. **Emergency Preparedness Checklist**
- **Progressive Tracking System**
  - Visual progress bar showing completion percentage
  - Categorized preparation tasks by priority
  - Emergency supply kit requirements
  - Important documents checklist
  - Interactive check-off functionality with local storage

### 6. **Multi-Language Support**
- **Complete Internationalization**
  - **English** (default), **Español** (Spanish)
  - **Tiếng Việt** (Vietnamese), **中文** (Chinese)
- **Easy language switcher in navigation bar**

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

## 📱 Technical Architecture

### **Progressive Web App (PWA) Features**
- **Installable Application**
  - Add to home screen functionality for app-like experience
  - Standalone display mode with custom branding
  - App shortcuts for quick access to emergency features
  - Custom app icons and splash screens

- **Offline Capabilities**
  - Service worker for robust offline functionality
  - Critical emergency data cached locally
  - Background sync when internet connection restored
  - Low-bandwidth mode for emergency network conditions

- **Push Notifications**
  - Emergency alerts and weather warnings
  - Evacuation order notifications
  - Shelter capacity updates

### **Technology Stack**
- **Frontend**: HTML5, CSS3 (Tailwind CSS), JavaScript (ES6+)
- **Mapping**: Google Maps API with comprehensive integration
- **Storage**: LocalStorage for user data persistence
- **PWA**: Service Worker with advanced caching strategies
- **APIs**: Real-time weather, emergency services, and medical facility data

### **Responsive Design & Accessibility**
- **Multi-Device Support**
  - Optimized for desktop, tablet, and mobile devices
  - Touch-friendly interface elements
  - Adaptive layouts for all screen sizes

- **Accessibility Features**
  - WCAG 2.1 AA compliance
  - Screen reader compatibility
  - High contrast mode option
  - Large text mode for visually impaired users
  - Full keyboard navigation support

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

## 📊 Current Feature Status

### **✅ Fully Implemented & Tested**
- Complete Google Maps integration with 30+ medical facilities
- Real-time shelter location system with capacity data
- AI chat assistant with Houston-specific emergency knowledge
- Multi-language support (English, Spanish, Vietnamese, Chinese)
- Progressive Web App with offline capabilities
- Personal profile system with neighborhood risk assessment
- Interactive emergency preparedness checklist
- Quick access emergency contacts (911, 311)
- Responsive design for all device types
- Accessibility compliance (WCAG 2.1 AA)

### **🔧 Technical Implementation Details**
- **Service Worker**: Advanced caching strategies for offline functionality
- **Local Storage**: Persistent user data with privacy protection
- **Google Maps API**: Full integration with custom markers and info windows
- **Tailwind CSS**: Responsive design framework
- **JavaScript ES6+**: Modern web standards implementation
- **PWA Manifest**: Complete app installation and shortcut support

## 🏥 Houston Medical Network Coverage

### **Major Hospital Systems**
- **Texas Medical Center Complex** - World's largest medical center
- **Memorial Hermann Health System** (6 locations across Houston)
- **Houston Methodist System** (5 locations including flagship downtown)
- **HCA Houston Healthcare** (3 strategically located facilities)

### **Specialty & Emergency Care**
- **MD Anderson Cancer Center** - World-renowned cancer treatment
- **Texas Children's Hospital** - Leading pediatric care facility
- **TIRR Memorial Hermann** - Rehabilitation services
- **24/7 Emergency Centers** in Katy, Pearland, Cypress
- **Urgent Care Networks** throughout Houston metro area

## 🆘 Emergency Contacts & Resources

### **Immediate Emergency**
- **Emergency Services**: **911**
- **Houston Non-Emergency**: **713-884-3131**
- **Houston 311**: **311** (or visit houstonmergency.org)

### **Disaster-Specific Resources**
- **Harris County Flood Warning**: Real-time flood monitoring
- **Red Cross Gulf Coast**: **713-526-8300**
- **FEMA Disaster Assistance**: **1-800-621-3362**

## ⚠️ Important Disclaimers

- **Official Information Priority**: This app provides guidance but should not replace official emergency communications
- **Follow Official Orders**: Always follow official evacuation orders and emergency instructions from local authorities
- **Emergency Services**: For immediate life-threatening emergencies, always call 911
- **Data Accuracy**: While we strive for accuracy, emergency conditions can change rapidly

## 🏛️ Credits & Acknowledgments

**Developed in collaboration with:**
- Houston Office of Emergency Management
- Harris County Flood Control District  
- Harris County Public Health Department
- Houston medical community for facility information
- Emergency management professionals for guidance
- Community volunteers for testing and feedback

---

**🤠 Stay Safe, Houston!**

**Remember: Turn Around Don't Drown** and always have an emergency plan!

*Last Updated: December 2024*
*Version: 2.0 - Enhanced Medical Network & Streamlined Interface*
