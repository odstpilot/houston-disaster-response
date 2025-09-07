# Google Maps API Setup for Houston Disaster Response

## 🔐 Secure API Key Configuration

This application now uses **secure server-side API key management** to protect your Google Maps API key from being exposed in the browser.

## Quick Setup Steps

### 1. Get Your Google Maps API Key

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the **Maps JavaScript API**
4. Create credentials → API Key
5. **Important**: Restrict your API key to prevent unauthorized usage

### 2. Configure API Key Restrictions (Recommended)

**Application Restrictions:**
- Select "HTTP referrers (websites)"
- Add these referrer patterns:
  ```
  http://localhost:8000/*
  http://127.0.0.1:8000/*
  https://yourdomain.com/*  (if deploying)
  ```

**API Restrictions:**
- Restrict key to: "Maps JavaScript API"

### 3. Add API Key to Environment File

1. Open the `.env` file in your project root
2. Replace `YOUR_GOOGLE_MAPS_API_KEY` with your actual API key:
   ```
   GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
   ```

### 4. Start the Secure Server

**Windows:**
```bash
run.bat
```

**Linux/Mac:**
```bash
./run.sh
```

The secure Python server will:
- 🔒 Keep your API key on the server-side
- 🌐 Serve it securely via API endpoints
- 🛡️ Prevent client-side exposure

## 🚨 Security Features

### Before (Insecure)
- ❌ API keys exposed in client-side JavaScript
- ❌ Visible in browser developer tools
- ❌ Included in client-side source code

### After (Secure)
- ✅ API keys stored server-side only
- ✅ Served via secure API endpoints
- ✅ Protected from client-side inspection

## 🔧 Technical Details

### Server API Endpoints

- **`/api/config`** - Returns environment configuration
- **`/api/health`** - Server health check

### Environment File Structure

```properties
# Houston Disaster Response Environment Configuration
MISTRAL_API_KEY=your_mistral_key_here
TAVILY_API_KEY=your_tavily_key_here
GOOGLE_MAPS_API_KEY=your_google_maps_key_here
```

### Fallback Support

If the secure server isn't available, the app will:
1. Show a warning about reduced security
2. Fall back to client-side configuration
3. Continue functioning with basic features

## 🚀 Deployment Notes

### For Production Deployment:

1. **Never commit `.env` files** to version control
2. Use environment variables on your hosting platform
3. Update API key restrictions for production domain
4. Consider using Google Cloud IAM for advanced security

### Platform-Specific Environment Variables:

**Heroku:**
```bash
heroku config:set GOOGLE_MAPS_API_KEY=your_key_here
```

**Vercel:**
```bash
vercel env add GOOGLE_MAPS_API_KEY
```

**Netlify:**
Add in Site Settings → Environment Variables

## 🔍 Troubleshooting

### Common Issues:

1. **"Invalid API Key" Error**
   - Check that your API key is correctly set in `.env`
   - Verify API key restrictions allow your domain
   - Ensure Maps JavaScript API is enabled

2. **"Server API Not Available" Warning**
   - Make sure you're using `run.bat` or `./run.sh`
   - Check that Python is installed and accessible
   - Try starting the server manually: `python server.py`

3. **Map Not Loading**
   - Open browser developer tools
   - Check console for specific error messages
   - Verify your API key hasn't exceeded quotas

### Testing Your Setup:

1. Start the server: `run.bat`
2. Open: `http://localhost:8000`
3. Navigate to the Maps section
4. Check browser console for security confirmations

## 📞 Support

If you encounter issues:
1. Check the browser console for error messages
2. Verify your `.env` file configuration
3. Test your API key with Google's API tester
4. Ensure all required APIs are enabled in Google Cloud Console

---

**🔐 Remember**: Keep your API keys secure and never share them publicly!
