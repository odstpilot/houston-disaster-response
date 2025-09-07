// Intelligent Chat Service using Mistral AI and Tavily Search
class IntelligentChatService {
    constructor() {
        this.mistralApiKey = null;
        this.tavilyApiKey = null;
        this.conversationHistory = [];
        this.envReady = false;
        
        // Wait for environment to be ready
        this.waitForEnvironment();
    }

    async generateServerResponse(userMessage, context, searchResults) {
        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userMessage, context, searchResults })
            });
            if (!response.ok) return null;
            const data = await response.json();
            if (!data?.message) return null;
            // Update conversation history
            this.conversationHistory.push(
                { role: 'user', content: userMessage },
                { role: 'assistant', content: data.message }
            );
            return data.message;
        } catch (_) {
            return null;
        }
    }

    async waitForEnvironment() {
        if (window.ENV && window.ENV.MISTRAL_API_KEY) {
            this.loadApiKeys();
            return;
        }
        
        // Listen for environment ready event
        window.addEventListener('envConfigReady', () => {
            console.log('🤖 Environment ready for intelligent chat');
            this.loadApiKeys();
        });
    }

    async loadApiKeys() {
        try {
            // Wait for environment if not ready
            if (!window.ENV && window.secureEnvLoader) {
                await window.secureEnvLoader.waitForConfig();
            }
            
            // Load API keys from environment
            if (window.ENV) {
                this.mistralApiKey = window.ENV.MISTRAL_API_KEY;
                this.tavilyApiKey = window.ENV.TAVILY_API_KEY;
                this.envReady = true;
                
                console.log('🔑 API Keys loaded for intelligent chat:', {
                    mistral: this.mistralApiKey ? '✅ Available' : '❌ Missing',
                    tavily: this.tavilyApiKey ? '✅ Available' : '❌ Missing'
                });
            }
            
            if (!this.mistralApiKey) {
                console.warn('⚠️  Mistral API key not found. AI chat will use fallback responses.');
            }
            
            if (!this.tavilyApiKey) {
                console.warn('⚠️  Tavily API key not found. Real-time search will be limited.');
            }
        } catch (error) {
            console.error('❌ Error loading API keys:', error);
        }
    }

    async generateResponse(userMessage, context = {}) {
        console.log('🤖 Intelligent Chat Service called with:', userMessage);
        
        // Ensure environment is loaded
        if (!this.envReady) {
            console.log('⏳ Waiting for environment to be ready...');
            await this.loadApiKeys();
        }
        
        console.log('🔑 API Keys status:', {
            mistral: this.mistralApiKey ? 'Available' : 'Missing',
            tavily: this.tavilyApiKey ? 'Available' : 'Missing',
            envReady: this.envReady
        });
        
        try {
            // Check if we need real-time information
            const needsRealTimeInfo = this.needsRealTimeSearch(userMessage);
            let searchResults = null;
            
            if (needsRealTimeInfo && this.tavilyApiKey) {
                console.log('🔍 Searching for real-time information...');
                searchResults = await this.searchWithTavily(userMessage);
            }

            // Generate AI response via serverless API (so keys stay server-side)
            const viaServer = await this.generateServerResponse(userMessage, context, searchResults);
            if (viaServer) return viaServer;

            // If serverless route fails, fall back to direct API if key exists
            if (this.mistralApiKey) {
                if (window.ENV?.DEBUG_MODE === 'true') console.log('🧠 Falling back to direct Mistral API call...');
                return await this.generateMistralResponse(userMessage, context, searchResults);
            }

            if (window.ENV?.DEBUG_MODE === 'true') console.log('⚠️ No AI path available, using fallback');
            return this.generateFallbackResponse(userMessage, searchResults);
        } catch (error) {
            console.error('❌ Error generating response:', error);
            return this.getErrorResponse();
        }
    }

    needsRealTimeSearch(message) {
        const realTimeKeywords = [
            'current', 'latest', 'recent', 'today', 'now', 'live', 'active',
            'weather', 'forecast', 'warning', 'alert', 'evacuation',
            'road', 'traffic', 'closure', 'flood', 'hurricane', 'storm',
            'news', 'update', 'report', 'status', 'what', 'who', 'when', 'where'
        ];
        
        const lowerMessage = message.toLowerCase();
        return realTimeKeywords.some(keyword => lowerMessage.includes(keyword)) || 
               message.includes('?'); // Any question might benefit from real-time search
    }

    async searchWithTavily(query) {
        if (!this.tavilyApiKey) {
            console.warn('⚠️  Tavily API key not available - skipping search');
            return null;
        }

        try {
            console.log('🔍 Starting Tavily search for:', query);
            
            const searchQuery = this.buildSearchQuery(query);
            console.log('🔍 Enhanced search query:', searchQuery);
            
            const response = await fetch('https://api.tavily.com/search', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.tavilyApiKey}`
                },
                body: JSON.stringify({
                    query: searchQuery,
                    search_depth: 'basic',
                    include_answer: true,
                    include_raw_content: true,
                    max_results: 5,
                    // Remove domain restrictions for better general search
                    // include_domains: [] // Allow all domains for better coverage
                })
            });

            console.log('🔍 Tavily API response status:', response.status);

            if (response.ok) {
                const data = await response.json();
                console.log('✅ Tavily search results:', {
                    answer: data.answer ? 'Found' : 'None',
                    results_count: data.results?.length || 0
                });
                return data;
            } else {
                const errorText = await response.text();
                console.error('❌ Tavily API error:', response.status, errorText);
                return null;
            }
        } catch (error) {
            console.error('❌ Tavily search error:', error);
            return null;
        }
    }

    buildSearchQuery(userMessage) {
        // Check if the message is disaster/Houston related
        const houstonKeywords = ['houston', 'harris county', 'texas', 'hurricane', 'flood', 'disaster', 'emergency'];
        const lowerMessage = userMessage.toLowerCase();
        const isHoustonRelated = houstonKeywords.some(keyword => lowerMessage.includes(keyword));
        
        if (isHoustonRelated) {
            // Enhance with Houston-specific context for local queries
            const houstonContext = 'Houston Texas disaster emergency preparedness';
            return `${userMessage} ${houstonContext}`;
        } else {
            // For general queries, search as-is to get current information
            return userMessage;
        }
    }

    async generateMistralResponse(userMessage, context, searchResults) {
        try {
            const systemPrompt = this.buildSystemPrompt(context, searchResults);
            
            console.log('📡 Making Mistral API call...');
            console.log('System prompt length:', systemPrompt.length);
            console.log('User message:', userMessage);
            
            const response = await fetch('https://api.mistral.ai/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.mistralApiKey}`
                },
                body: JSON.stringify({
                    model: 'mistral-small-latest',
                    messages: [
                        { role: 'system', content: systemPrompt },
                        ...this.conversationHistory.slice(-10), // Last 10 messages for context
                        { role: 'user', content: userMessage }
                    ],
                    max_tokens: 800,
                    temperature: 0.7
                })
            });

            console.log('📡 Mistral API response status:', response.status);

            if (response.ok) {
                const data = await response.json();
                const assistantMessage = data.choices[0].message.content;
                
                console.log('✅ Mistral AI response received:', assistantMessage.substring(0, 100) + '...');
                
                // Update conversation history
                this.conversationHistory.push(
                    { role: 'user', content: userMessage },
                    { role: 'assistant', content: assistantMessage }
                );
                
                return assistantMessage;
            } else {
                const errorText = await response.text();
                console.error('❌ Mistral API error:', response.status, errorText);
                throw new Error(`Mistral API error: ${response.status} - ${errorText}`);
            }
        } catch (error) {
            console.error('❌ Mistral API call failed:', error);
            return this.generateFallbackResponse(userMessage, searchResults);
        }
    }

    buildSystemPrompt(context, searchResults) {
        let prompt = `You are an expert Houston Disaster Response Assistant. You help residents prepare for, respond to, and recover from disasters in the Houston, Texas area.

Key responsibilities:
- Provide accurate, actionable disaster preparedness advice
- Give Houston-specific guidance (hurricanes, floods, heat waves, winter storms, chemical emergencies)
- Help users understand evacuation zones, shelter locations, and emergency resources
- Offer personalized advice based on user context
- Stay calm and reassuring while being informative
- Use clear, simple language accessible to all education levels

IMPORTANT: If the user asks about non-disaster topics, you can provide general information but always try to connect it back to emergency preparedness or Houston context when relevant.

Houston-specific context:
- Hurricane season: June-November (peak: August-October)
- Major flood risk areas: downtown, bayou areas, coastal regions
- Harris County Flood Control District manages flood warnings
- Evacuation zones: A (most vulnerable) to E (least vulnerable)
- Major hospitals: Memorial Hermann, Houston Methodist, MD Anderson
- Key agencies: Harris County Office of Emergency Management, Houston Emergency Management

Response guidelines:
- Keep responses conversational and informative
- Provide specific, actionable steps when discussing disasters
- Include relevant phone numbers when appropriate
- Mention local resources and programs when relevant
- If unsure about current conditions, recommend official sources
- For general questions, provide accurate information and relate to emergency preparedness when possible`;

        if (searchResults && searchResults.results) {
            prompt += `\n\nCurrent real-time information from search:\n`;
            searchResults.results.forEach(result => {
                prompt += `- ${result.title}: ${result.content.substring(0, 200)}...\n`;
            });
            
            if (searchResults.answer) {
                prompt += `\nSearch summary: ${searchResults.answer}\n`;
            }
        }

        if (context.userProfile) {
            prompt += `\n\nUser context:
- Location: ${context.userProfile.neighborhood || 'Houston area'}
- Housing: ${context.userProfile.housingType || 'not specified'}
- Evacuation capability: ${context.userProfile.evacuationCapability || 'not specified'}
- Language preference: ${context.userProfile.language || 'English'}`;
        }

        return prompt;
    }

    generateFallbackResponse(userMessage, searchResults) {
        // Smart fallback responses based on keywords
        const message = userMessage.toLowerCase();
        
        if (searchResults && searchResults.answer) {
            return `Based on current information: ${searchResults.answer}\n\nFor the most up-to-date information, please check official sources like Harris County Emergency Management or call 311.`;
        }
        
        if (message.includes('hurricane')) {
            return `Hurricane preparation is crucial in Houston. Key steps:\n\n• Monitor NOAA Hurricane Center updates\n• Know your evacuation zone (A-E)\n• Stock 7-10 days of supplies\n• Secure outdoor items\n• Have evacuation plan ready\n\nFor current hurricane information, visit nhc.noaa.gov or call Harris County Emergency Management.`;
        }
        
        if (message.includes('flood')) {
            return `Houston flood safety:\n\n• Never drive through flooded roads ("Turn Around, Don't Drown")\n• Know your flood risk zone\n• Move to higher ground if advised\n• Monitor Harris County Flood Warning System\n• Have emergency kit ready\n\nFor current flood conditions: harriscountyfws.org or call 713-884-3131.`;
        }
        
        if (message.includes('evacuation')) {
            return `Houston evacuation zones run A-E:\n\n• Zone A: Most vulnerable (coastal/surge areas)\n• Zone E: Least vulnerable (inland areas)\n• Know your zone at readyharris.org\n• Plan multiple routes out\n• Leave early if advised\n\nFor evacuation assistance: 311 or visit evacuation_resources.html in this app.`;
        }
        
        if (message.includes('shelter')) {
            return `Houston emergency shelters:\n\n• Red Cross shelters open during disasters\n• Pet-friendly options available\n• Check shelter_resources.html in this app\n• Call 2-1-1 for current shelter information\n• Bring ID, medications, comfort items\n\nFor shelter locations: dial 2-1-1 or visit readyharris.org.`;
        }
        
        if (message.includes('heat')) {
            return `Houston heat safety (summer temps 95-105°F):\n\n• Stay hydrated - drink before thirsty\n• Limit outdoor activity 10am-6pm\n• Use AC or visit cooling centers\n• Never leave anyone in cars\n• Watch for heat exhaustion signs\n\nCooling centers: call 311 or visit houstonhealthdepartment.org.`;
        }
        
        // Default response
        return `I'm here to help with Houston disaster preparedness! I can assist with:\n\n• Hurricane & flood preparation\n• Evacuation planning\n• Emergency supplies\n• Shelter information\n• Recovery resources\n\nFor immediate emergencies: call 911\nFor non-emergency help: call 311\n\nWhat specific disaster topic can I help you with?`;
    }

    getErrorResponse() {
        return `I'm experiencing technical difficulties right now. For immediate assistance:\n\n• Emergency: 911\n• Non-emergency: 311\n• Harris County Emergency: 713-884-3131\n• Red Cross: 713-526-8300\n\nPlease try your question again in a moment.`;
    }
}

// Initialize intelligent chat service
window.intelligentChatService = new IntelligentChatService();
