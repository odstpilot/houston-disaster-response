# 🚀 Quick Start Guide

## ⚡ **Super Easy Method (No Server Required)**

**Just double-click:** `index-standalone.html`

That's it! The app will open in your browser with Google Maps working.

---

## 🖥️ **Server Method (Better Performance)**

### **Windows Users:**
1. **Double-click:** `run.bat`
2. **Open browser to:** `http://localhost:8000`

### **Mac/Linux Users:**
1. **Run:** `./run.sh` (or `bash run.sh`)
2. **Open browser to:** `http://localhost:8000`

### **Manual Server (If scripts don't work):**
```bash
# If you have Python (most common):
python -m http.server 8000

# If you have Node.js:
npx http-server -p 8000

# If you have PHP:
php -S localhost:8000
```

---

## 🗺️ **Your Google Maps API Key**

Your API key is already configured in both methods:
- **Server method**: Uses `.env` file and `js/env-config.js`
- **Standalone method**: Embedded in `index-standalone.html`

**Current key:** `AIzaSyBqD4_uvapoL5DtaVI_6M57tneG131Rsvw`

---

## ✅ **What Should Work:**

- ✅ **Google Maps** loads showing Houston
- ✅ **Interactive map** with zoom/pan
- ✅ **Layer buttons** (Flood Zones, Shelters, etc.)
- ✅ **Disaster information** cards
- ✅ **Emergency checklist**
- ✅ **Profile setup**
- ✅ **Smart 911 button** - Calls on mobile, redirects to 911.gov on desktop

---

## 🐛 **If Something's Wrong:**

1. **Maps not loading?** 
   - Check your internet connection
   - Verify API key is correct
   - Check browser console (F12) for errors

2. **Server won't start?**
   - Use the standalone version: `index-standalone.html`
   - Or install Python: https://python.org/downloads

3. **Still having issues?**
   - Open browser console (F12)
   - Look for red error messages
   - Check if your API key has domain restrictions

---

## 📱 **Mobile Testing:**

The app works great on mobile! If using the server method:
- **Find your computer's IP:** `ipconfig` (Windows) or `ifconfig` (Mac/Linux)
- **Open on phone:** `http://YOUR_IP:8000`
- **Test 911 button:** On mobile it will prompt to call, on desktop it redirects to 911.gov
- **Emergency test page:** `http://localhost:8000/test-emergency.html`

---

## 🎯 **Recommended:**

**For development:** Use `run.bat` or `run.sh`
**For quick testing:** Use `index-standalone.html`

**Both methods work perfectly!** Choose whichever is easier for you.

---

**🎉 You should now have a fully working Houston Disaster Response app with Google Maps! 🗺️**
