#!/usr/bin/env python3
"""
Houston Disaster Response App Server
A secure server that serves static files and provides environment variables via API endpoints.
"""

import os
import json
import http.server
import socketserver
from urllib.parse import urlparse, parse_qs
from pathlib import Path
import mimetypes

# Load environment variables from .env file
def load_env():
    env_vars = {}
    env_file = Path('.env')
    if env_file.exists():
        with open(env_file, 'r') as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith('#') and '=' in line:
                    key, value = line.split('=', 1)
                    env_vars[key.strip()] = value.strip()
    return env_vars

class DisasterResponseHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        # Load environment variables
        self.env_vars = load_env()
        super().__init__(*args, **kwargs)
    
    def do_GET(self):
        parsed_path = urlparse(self.path)
        
        # Handle API endpoints
        if parsed_path.path == '/api/config':
            self.handle_config_request()
        elif parsed_path.path == '/api/health':
            self.handle_health_request()
        else:
            # Serve static files
            super().do_GET()
    
    def handle_config_request(self):
        """Serve environment configuration for client-side use"""
        try:
            # Only expose specific environment variables that are safe for client-side
            safe_config = {
                'GOOGLE_MAPS_API_KEY': self.env_vars.get('GOOGLE_MAPS_API_KEY', ''),
                'MISTRAL_API_KEY': self.env_vars.get('MISTRAL_API_KEY', ''),
                'TAVILY_API_KEY': self.env_vars.get('TAVILY_API_KEY', '')
            }
            
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.send_header('Access-Control-Allow-Methods', 'GET, OPTIONS')
            self.send_header('Access-Control-Allow-Headers', 'Content-Type')
            self.end_headers()
            
            response = json.dumps(safe_config)
            self.wfile.write(response.encode('utf-8'))
            
        except Exception as e:
            self.send_error(500, f"Internal server error: {str(e)}")
    
    def handle_health_request(self):
        """Health check endpoint"""
        self.send_response(200)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        
        health_status = {
            'status': 'healthy',
            'timestamp': str(int(time.time())),
            'env_loaded': len(self.env_vars) > 0
        }
        
        response = json.dumps(health_status)
        self.wfile.write(response.encode('utf-8'))
    
    def do_OPTIONS(self):
        """Handle CORS preflight requests"""
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()

def run_server(port=8000):
    """Start the disaster response server"""
    import time
    
    try:
        with socketserver.TCPServer(("", port), DisasterResponseHandler) as httpd:
            print(f"🚨 Houston Disaster Response Server")
            print(f"📍 Server running at http://localhost:{port}")
            print(f"🔧 Environment variables loaded: {len(load_env())} variables")
            print(f"🌐 Open your browser to http://localhost:{port}")
            print(f"⚡ API endpoints:")
            print(f"   - http://localhost:{port}/api/config (Environment config)")
            print(f"   - http://localhost:{port}/api/health (Health check)")
            print(f"🛑 Press Ctrl+C to stop the server")
            print("-" * 60)
            
            httpd.serve_forever()
            
    except KeyboardInterrupt:
        print("\n🛑 Server stopped by user")
    except OSError as e:
        if e.errno == 48:  # Address already in use
            print(f"❌ Port {port} is already in use. Try a different port:")
            print(f"   python server.py --port 8001")
        else:
            print(f"❌ Server error: {e}")

if __name__ == "__main__":
    import sys
    import time
    
    port = 8000
    if len(sys.argv) > 1:
        if '--port' in sys.argv:
            try:
                port_index = sys.argv.index('--port') + 1
                port = int(sys.argv[port_index])
            except (ValueError, IndexError):
                print("❌ Invalid port number. Using default port 8000.")
    
    run_server(port)
