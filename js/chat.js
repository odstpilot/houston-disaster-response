// Chat Module for AI Assistant
class ChatAssistant {
    constructor() {
        this.chatContainer = null;
        this.chatInput = null;
        this.chatSend = null;
        this.conversationHistory = [];
        this.isTyping = false;
    }

    initialize() {
        this.chatContainer = document.getElementById('chatContainer');
        this.chatInput = document.getElementById('chatInput');
        this.chatSend = document.getElementById('chatSend');

        if (!this.chatContainer || !this.chatInput || !this.chatSend) return;

        // Event listeners
        this.chatSend.addEventListener('click', () => this.sendMessage());
        this.chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });

        // Quick question buttons
        document.querySelectorAll('.quick-question').forEach(button => {
            button.addEventListener('click', () => {
                this.chatInput.value = button.textContent;
                this.sendMessage();
            });
        });

        // Load conversation history
        this.loadHistory();
    }

    async sendMessage() {
        const message = this.chatInput.value.trim();
        if (!message || this.isTyping) return;

        // Add user message to chat
        this.addMessage(message, 'user');
        this.chatInput.value = '';

        // Show typing indicator
        this.showTypingIndicator();

        try {
            // Get user context for personalized responses
            const context = {
                userProfile: this.getUserProfile(),
                history: this.conversationHistory.slice(-5), // Last 5 messages for context
                currentLocation: 'Houston, TX'
            };

            // Use intelligent chat service if available
            let response;
            if (window.intelligentChatService) {
                const responseText = await window.intelligentChatService.generateResponse(message, context);
                response = { message: responseText };
            } else {
                // Fallback to API service
                response = await apiService.sendChatMessage(message, {
                    profile: context.userProfile,
                    history: context.history
                });
            }

            // Remove typing indicator
            this.hideTypingIndicator();

            // Add bot response
            this.addMessage(response.message, 'bot');

            // Update quick suggestions if provided
            if (response.suggestions && response.suggestions.length > 0) {
                this.updateQuickQuestions(response.suggestions);
            }

            // Check for actionable items
            if (response.actions) {
                this.processActionableResponse(response);
            }

        } catch (error) {
            console.error('Chat error:', error);
            this.hideTypingIndicator();
            this.addMessage('I apologize, but I encountered an error. Please try again or call 311 for immediate assistance.', 'bot');
        }
    }

    addMessage(message, sender) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `chat-message ${sender}`;
        
        // Create avatar
        const avatar = document.createElement('div');
        avatar.className = `chat-avatar ${sender}`;
        if (sender === 'bot') {
            avatar.innerHTML = '<i class="fas fa-robot"></i>';
        } else {
            avatar.innerHTML = '<i class="fas fa-user"></i>';
        }
        
        // Create message content
        const messageContent = document.createElement('div');
        messageContent.className = 'message-content';
        
        // Parse message for special formatting
        messageContent.innerHTML = this.formatMessage(message);
        
        // Arrange elements based on sender
        if (sender === 'user') {
            messageDiv.appendChild(messageContent);
            messageDiv.appendChild(avatar);
        } else {
            messageDiv.appendChild(avatar);
            messageDiv.appendChild(messageContent);
        }
        
        this.chatContainer.appendChild(messageDiv);
        
        // Scroll to bottom
        this.chatContainer.scrollTop = this.chatContainer.scrollHeight;
        
        // Add to history
        this.conversationHistory.push({ sender, message, timestamp: Date.now() });
        this.saveHistory();
    }

    formatMessage(message) {
        // Parse markdown syntax
        message = this.parseMarkdown(message);
        
        // Convert URLs to links (if not already converted by markdown)
        message = message.replace(/(?<!href="|>)(https?:\/\/[^\s<]+)/g, '<a href="$1" target="_blank" class="text-blue-600 hover:text-blue-800 underline">$1</a>');
        
        // Convert phone numbers to tel links
        message = message.replace(/(\d{3}-\d{3}-\d{4}|\d{3}-\d{4}|\d{1}-\d{3}-\d{3}-\d{4})/g, 
            '<a href="tel:$1" class="text-blue-600 hover:text-blue-800 underline">$1</a>');
        
        // Bold important keywords (if not already formatted)
        const keywords = ['emergency', 'evacuate', 'warning', 'danger', 'immediately', 'urgent'];
        keywords.forEach(keyword => {
            const regex = new RegExp(`(?<!<[^>]*>)\\b${keyword}\\b(?![^<]*>)`, 'gi');
            message = message.replace(regex, '<strong class="text-red-600 font-bold">$&</strong>');
        });
        
        return message;
    }

    parseMarkdown(text) {
        // Handle headers
        text = text.replace(/^### (.*$)/gim, '<h3 class="text-lg font-semibold text-gray-800 mt-4 mb-2">$1</h3>');
        text = text.replace(/^## (.*$)/gim, '<h2 class="text-xl font-semibold text-gray-800 mt-4 mb-2">$1</h2>');
        text = text.replace(/^# (.*$)/gim, '<h1 class="text-2xl font-bold text-gray-800 mt-4 mb-2">$1</h1>');
        
        // Handle bold and italic
        text = text.replace(/\*\*\*(.*?)\*\*\*/g, '<strong class="font-bold"><em class="italic">$1</em></strong>');
        text = text.replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold">$1</strong>');
        text = text.replace(/\*(.*?)\*/g, '<em class="italic">$1</em>');
        
        // Handle code blocks and inline code
        text = text.replace(/```([\s\S]*?)```/g, '<pre class="bg-gray-100 p-3 rounded-lg my-2 overflow-x-auto"><code class="text-sm font-mono">$1</code></pre>');
        text = text.replace(/`([^`]+)`/g, '<code class="bg-gray-100 px-2 py-1 rounded text-sm font-mono">$1</code>');
        
        // Handle unordered lists
        text = text.replace(/^\s*[\*\-\+]\s+(.*)$/gim, '<li class="ml-4 mb-1">• $1</li>');
        text = text.replace(/(<li.*<\/li>)/s, '<ul class="my-2">$1</ul>');
        text = text.replace(/<\/li>\s*<ul class="my-2"><li/g, '</li><li');
        text = text.replace(/<\/ul>\s*<ul class="my-2">/g, '');
        
        // Handle ordered lists
        text = text.replace(/^\s*\d+\.\s+(.*)$/gim, '<li class="ml-4 mb-1">$1</li>');
        // Note: This is a simplified approach. For more complex lists, consider a proper markdown parser
        
        // Handle line breaks
        text = text.replace(/\n\n/g, '</p><p class="mb-2">');
        text = text.replace(/\n/g, '<br>');
        
        // Wrap in paragraphs if not already wrapped
        if (!text.includes('<h1') && !text.includes('<h2') && !text.includes('<h3') && 
            !text.includes('<ul') && !text.includes('<ol') && !text.includes('<pre')) {
            text = '<p class="mb-2">' + text + '</p>';
        }
        
        // Handle blockquotes
        text = text.replace(/^>\s+(.*)$/gim, '<blockquote class="border-l-4 border-blue-300 pl-4 py-2 my-2 bg-blue-50 italic">$1</blockquote>');
        
        // Handle horizontal rules
        text = text.replace(/^---$/gim, '<hr class="border-gray-300 my-4">');
        
        return text;
    }

    showTypingIndicator() {
        this.isTyping = true;
        const typingDiv = document.createElement('div');
        typingDiv.className = 'chat-typing-indicator';
        typingDiv.id = 'typingIndicator';
        
        typingDiv.innerHTML = `
            <div class="chat-avatar bot">
                <i class="fas fa-robot"></i>
            </div>
            <div class="typing-dots">
                <div class="typing-dot"></div>
                <div class="typing-dot"></div>
                <div class="typing-dot"></div>
            </div>
        `;
        
        this.chatContainer.appendChild(typingDiv);
        this.chatContainer.scrollTop = this.chatContainer.scrollHeight;
    }

    hideTypingIndicator() {
        this.isTyping = false;
        const indicator = document.getElementById('typingIndicator');
        if (indicator) {
            indicator.remove();
        }
    }

    updateQuickQuestions(suggestions) {
        const buttons = document.querySelectorAll('.quick-question');
        suggestions.forEach((suggestion, index) => {
            if (buttons[index]) {
                buttons[index].textContent = suggestion;
            }
        });
    }

    processActionableResponse(response) {
        // Check for specific actions in the response
        if (response.action) {
            switch (response.action) {
                case 'show_map':
                    this.showMapWithLocation(response.data);
                    break;
                case 'update_checklist':
                    this.updateChecklist(response.data);
                    break;
                case 'show_alert':
                    this.showAlert(response.data);
                    break;
                case 'call_emergency':
                    this.promptEmergencyCall(response.data);
                    break;
            }
        }
    }

    showMapWithLocation(data) {
        // Switch to map view and center on location
        if (window.disasterMap && data.coordinates) {
            window.disasterMap.centerOnLocation(data.coordinates.lat, data.coordinates.lng);
            if (data.marker) {
                window.disasterMap.addCustomMarker(
                    data.coordinates.lat,
                    data.coordinates.lng,
                    data.marker.title,
                    data.marker.popup
                );
            }
        }
    }

    updateChecklist(data) {
        // Update the preparedness checklist
        if (data.items) {
            data.items.forEach(item => {
                const checkbox = document.querySelector(`input[data-item="${item}"]`);
                if (checkbox) {
                    checkbox.checked = true;
                    checkbox.dispatchEvent(new Event('change'));
                }
            });
        }
    }

    showAlert(data) {
        const alertBanner = document.getElementById('emergencyAlert');
        const alertMessage = document.getElementById('alertMessage');
        if (alertBanner && alertMessage) {
            alertMessage.textContent = data.message;
            alertBanner.classList.remove('hidden');
            
            // Auto-hide after 10 seconds unless critical
            if (!data.critical) {
                setTimeout(() => {
                    alertBanner.classList.add('hidden');
                }, 10000);
            }
        }
    }

    promptEmergencyCall(data) {
        if (confirm(`Call ${data.number} - ${data.service}?`)) {
            window.location.href = `tel:${data.number}`;
        }
    }

    getUserProfile() {
        const profileData = localStorage.getItem(CONFIG.STORAGE_KEYS.USER_PROFILE);
        return profileData ? JSON.parse(profileData) : null;
    }

    saveHistory() {
        // Keep only last 50 messages
        if (this.conversationHistory.length > 50) {
            this.conversationHistory = this.conversationHistory.slice(-50);
        }
        
        try {
            sessionStorage.setItem('chat_history', JSON.stringify(this.conversationHistory));
        } catch (error) {
            console.error('Error saving chat history:', error);
        }
    }

    loadHistory() {
        try {
            const saved = sessionStorage.getItem('chat_history');
            if (saved) {
                this.conversationHistory = JSON.parse(saved);
                // Optionally restore last few messages to UI
                const recent = this.conversationHistory.slice(-5);
                recent.forEach(msg => {
                    this.addMessageToUI(msg.message, msg.sender);
                });
            }
        } catch (error) {
            console.error('Error loading chat history:', error);
        }
    }

    addMessageToUI(message, sender) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `chat-message ${sender}`;
        
        const messageContent = document.createElement('p');
        messageContent.className = sender === 'user' 
            ? 'bg-blue-500 text-white p-3 rounded-lg inline-block max-w-xs md:max-w-md'
            : 'bg-blue-100 text-gray-800 p-3 rounded-lg inline-block max-w-xs md:max-w-md';
        
        messageContent.innerHTML = this.formatMessage(message);
        messageDiv.appendChild(messageContent);
        this.chatContainer.appendChild(messageDiv);
    }

    clearHistory() {
        this.conversationHistory = [];
        sessionStorage.removeItem('chat_history');
        
        // Clear UI except initial message
        const messages = this.chatContainer.querySelectorAll('.chat-message');
        messages.forEach((msg, index) => {
            if (index > 0) msg.remove();
        });
    }

    // Special disaster response methods
    async getEvacuationGuidance() {
        const profile = this.getUserProfile();
        let guidance = "Based on your location:\n\n";
        
        if (profile?.neighborhood) {
            const neighborhood = CONFIG.NEIGHBORHOODS[profile.neighborhood];
            if (neighborhood) {
                guidance += `• Your area (${profile.neighborhood}) has ${neighborhood.floodRisk} flood risk\n`;
                if (neighborhood.evacuationZone !== 'None') {
                    guidance += `• You are in Evacuation Zone ${neighborhood.evacuationZone}\n`;
                    guidance += `• Monitor news for Zone ${neighborhood.evacuationZone} evacuation orders\n`;
                }
            }
        }
        
        guidance += "\nGeneral evacuation guidelines:\n";
        guidance += "• Zone A: Evacuate for all hurricanes\n";
        guidance += "• Zone B: Evacuate for Category 3+ hurricanes\n";
        guidance += "• Zone C: Evacuate for Category 4+ hurricanes\n";
        guidance += "• Mobile homes: Always evacuate regardless of zone\n";
        
        return guidance;
    }

    async getPersonalizedChecklist() {
        const profile = this.getUserProfile();
        const checklist = [...CONFIG.DISASTERS.hurricane.checklist];
        
        if (profile) {
            if (profile.elderly) {
                checklist.push('Ensure medications are refilled for 30 days');
                checklist.push('Register with State of Texas Emergency Assistance Registry (STEAR)');
            }
            if (profile.pets) {
                checklist.push('Prepare pet carrier and supplies');
                checklist.push('Update pet ID tags and microchip info');
                checklist.push('Locate pet-friendly shelters or hotels');
            }
            if (profile.medical) {
                checklist.push('Contact medical equipment provider about emergency plans');
                checklist.push('Register with utility company for priority restoration');
            }
            if (profile.children) {
                checklist.push('Pack comfort items and activities for children');
                checklist.push('Explain emergency plan in age-appropriate way');
            }
        }
        
        return checklist;
    }
}

// Initialize chat assistant
window.chatAssistant = new ChatAssistant();
