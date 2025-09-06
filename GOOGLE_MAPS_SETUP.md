# Google Maps API Setup Guide

## 🗝️ Getting Your Google Maps API Key

### Step 1: Create a Google Cloud Project
1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Click "Create Project" or select an existing project
3. Name your project (e.g., "Houston Disaster Response")

### Step 2: Enable Required APIs
Enable these APIs in your Google Cloud Console:

1. **Maps JavaScript API** - For the main map functionality
2. **Places API** - For location search and nearby places
3. **Directions API** - For routing and navigation
4. **Geocoding API** - For address-to-coordinates conversion
5. **Distance Matrix API** - For calculating distances

### Step 3: Create API Key
1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "API Key"
3. Copy your API key

### Step 4: Secure Your API Key
1. Click on your API key to edit it
2. Under "Application restrictions", select "HTTP referrers"
3. Add your domain(s):
   - `localhost:*` (for development)
   - `yourdomain.com/*` (for production)
4. Under "API restrictions", select "Restrict key" and choose the APIs you enabled above

### Step 5: Configure the Application
1. Open `js/config.js`
2. Replace `YOUR_GOOGLE_MAPS_API_KEY` with your actual API key:

```javascript
GOOGLE_MAPS: {
    API_KEY: 'AIzaSyC-your-actual-api-key-here',
    LIBRARIES: ['places', 'geometry', 'drawing'],
    MAP_ID: 'houston_disaster_map'
}
```

## 🎨 Optional: Custom Map Styling

### Step 1: Create a Map ID (Optional)
1. In Google Cloud Console, go to "Maps" > "Map management"
2. Click "Create Map ID"
3. Choose "JavaScript" as the map type
4. Customize your map style or use the default
5. Copy the Map ID and add it to your config

### Step 2: Update Configuration
```javascript
GOOGLE_MAPS: {
    API_KEY: 'your-api-key',
    LIBRARIES: ['places', 'geometry', 'drawing'],
    MAP_ID: 'your-custom-map-id' // Add your Map ID here
}
```

## 💰 Pricing Information

Google Maps API has a pay-as-you-go pricing model with generous free tier:

- **Maps JavaScript API**: $7 per 1,000 loads (first 28,000 free per month)
- **Places API**: $17 per 1,000 requests (first 2,500 free per month)
- **Directions API**: $5 per 1,000 requests (first 2,500 free per month)
- **Geocoding API**: $5 per 1,000 requests (first 40,000 free per month)

For a disaster response app, you'll likely stay within the free tier unless you have very high usage.

## 🔒 Security Best Practices

1. **Restrict your API key** to specific domains and APIs
2. **Monitor usage** in Google Cloud Console
3. **Set usage quotas** to prevent unexpected charges
4. **Use environment variables** for API keys in production
5. **Never commit API keys** to public repositories

## 🚀 Testing Your Setup

1. Open your application in a browser
2. Check the browser console for any Google Maps API errors
3. Verify that:
   - The map loads correctly
   - Your location marker appears
   - Map layers toggle properly
   - Directions work when clicking "Get Directions"

## 🐛 Common Issues

### "Google Maps JavaScript API error: RefererNotAllowedMapError"
- **Solution**: Add your domain to the API key restrictions

### "Google Maps JavaScript API error: ApiNotActivatedMapError"
- **Solution**: Enable the Maps JavaScript API in Google Cloud Console

### Map appears gray or doesn't load
- **Solution**: Check that your API key is correct and has proper permissions

### "For development purposes only" watermark
- **Solution**: This appears when using an unrestricted API key. Add domain restrictions to remove it.

## 📞 Support

If you encounter issues:
1. Check the [Google Maps API documentation](https://developers.google.com/maps/documentation)
2. Review the browser console for specific error messages
3. Verify your API key permissions and quotas in Google Cloud Console

## 🎯 Houston-Specific Features

The Google Maps integration includes Houston-specific enhancements:

- **Custom map styling** optimized for disaster response
- **Local emergency services** integration
- **Houston-area flood zones** and evacuation routes
- **Real-time directions** to shelters and medical centers
- **Places API integration** for finding nearby resources

Your Google Maps setup is now complete! The application will provide a much richer mapping experience with real-time data and enhanced navigation capabilities.
