# 🔐 Environment Variables Setup

## Quick Start

### 1. Create your `.env` file
Copy and paste this content into a new file called `.env` in your project root:

```bash
# Houston Disaster Response - Environment Variables
# DO NOT COMMIT THIS FILE TO VERSION CONTROL

# Google Maps API Configuration (REQUIRED)
# This single key provides: Maps, Places, Directions, Geocoding
GOOGLE_MAPS_API_KEY=your_actual_google_maps_api_key_here

# Optional: AI Chat Features
OPENAI_API_KEY=your_openai_key_here

# Application Configuration
APP_ENV=development
DEBUG_MODE=true

# Note: Weather, Flood, Air Quality, and Traffic data use FREE government APIs
# No additional API keys required for these services!
```

### 2. Add your Google Maps API Key
Replace `your_actual_google_maps_api_key_here` with your real Google Maps API key.

Example:
```bash
GOOGLE_MAPS_API_KEY=AIzaSyC-your-actual-api-key-12345
```

### 3. That's it! 
The app will automatically load your API key from the `.env` file.

## 🛡️ Security Features

✅ **Automatic .gitignore** - Your `.env` file won't be committed to git  
✅ **Runtime loading** - Environment variables loaded securely at runtime  
✅ **Fallback defaults** - App works even without `.env` file  
✅ **Development friendly** - Easy to set up and modify  

## 🔧 How it Works

1. **`js/env.js`** - Loads environment variables from `.env` file
2. **`js/config.js`** - Uses environment variables with fallbacks
3. **`.gitignore`** - Prevents committing sensitive data

## 📁 File Structure

```
houston-disaster-response/
├── .env                    # Your API keys (NOT in git)
├── .gitignore             # Protects .env from being committed
├── js/
│   ├── env.js            # Environment loader
│   └── config.js         # Configuration with env vars
└── ENV_SETUP.md          # This file
```

## 🚨 Important Notes

- **Never commit your `.env` file** - It contains your API keys
- **Keep your API key secure** - Don't share it publicly
- **Restrict your API key** - Set domain restrictions in Google Cloud Console

## 🐛 Troubleshooting

### "Map doesn't load"
- Check that your `.env` file exists
- Verify your API key is correct
- Make sure there are no spaces around the `=` sign

### "API key error"
- Ensure your Google Maps API is enabled
- Check domain restrictions in Google Cloud Console
- Verify your API key has the right permissions

## 🎯 Production Deployment

For production, you can either:
1. Create a `.env` file on your server
2. Set environment variables in your hosting platform
3. Use the runtime configuration approach

The app will automatically detect and use available environment variables!
