// AI Chatbot Implementation using Transformers.js + LaMini-Flan-T5-248M + RAG
class AlexAIChatbot {
    constructor() {
        this.model = null;
        this.tokenizer = null;
        this.knowledgeBase = null;
        this.isModelLoaded = false;
        this.isLoading = false;
        this.conversationHistory = [];
        
        this.initializeElements();
        this.initializeEventListeners();
        this.loadKnowledgeBase();
    }
    
    initializeElements() {
        this.overlay = document.getElementById('chatbot-overlay');
        this.toggle = document.getElementById('chatbot-toggle');
        this.close = document.getElementById('chatbot-close');
        this.messages = document.getElementById('chatbot-messages');
        this.loading = document.getElementById('chatbot-loading');
        this.input = document.getElementById('chatbot-input');
        this.send = document.getElementById('chatbot-send');
    }
    
    initializeEventListeners() {
        this.toggle.addEventListener('click', () => this.openChat());
        this.close.addEventListener('click', () => this.closeChat());
        this.send.addEventListener('click', () => this.sendMessage());
        this.input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });
        
        // Close on overlay click
        this.overlay.addEventListener('click', (e) => {
            if (e.target === this.overlay) {
                this.closeChat();
            }
        });
    }
    
    async loadKnowledgeBase() {
        try {
            // Load all knowledge base files
            const files = [
                'data/data.json',
                'data/knowledge/projects.json',
                'data/knowledge/experience.json',
                'data/knowledge/philosophy.json',
                'data/knowledge/tech_insights.json'
            ];
            
            const promises = files.map(file => 
                fetch(file).then(response => response.json()).catch(err => {
                    console.warn(`Failed to load ${file}:`, err);
                    return null;
                })
            );
            
            const results = await Promise.all(promises);
            this.knowledgeBase = {
                personal: results[0],
                projects: results[1],
                experience: results[2],
                philosophy: results[3],
                tech_insights: results[4]
            };
            
            console.log('Knowledge base loaded successfully');
        } catch (error) {
            console.error('Failed to load knowledge base:', error);
            this.addBotMessage('Sorry, It has been a while since last time a talked to Alex. I had trouble loading his memories...');
        }
    }
    
    async loadModel() {
        if (this.isModelLoaded || this.isLoading) return;
        
        this.isLoading = true;
        this.addBotMessage('Loading Alex memories... This might take a while, the guy has a big head... ;)');
        
        try {
            // Check if Transformers.js was pre-loaded
            if (!window.transformersLoaded) {
                throw new Error('Transformers.js not available');
            }
            
            // Import Transformers.js - use a more reliable CDN
            const transformers = await import('https://cdn.jsdelivr.net/npm/@xenova/transformers@2.17.1/dist/transformers.min.js');
            const { pipeline, env } = transformers;
            
            // Configure to use remote models only
            env.allowRemoteModels = true;
            env.allowLocalModels = false;
            
            // Initialize the text generation pipeline with a more reliable model
            this.model = await pipeline('text2text-generation', 'Xenova/flan-t5-small', {
                progress_callback: (data) => {
                    if (data.status === 'downloading') {
                        console.log(`Downloading model: ${Math.round(data.progress * 100)}%`);
                    }
                }
            });
            
            this.isModelLoaded = true;
            this.isLoading = false;
            
            console.log('Model loaded successfully');
            this.addBotMessage('AI model loaded! I\'m ready to answer your questions with full AI capabilities.');
        } catch (error) {
            console.error('Failed to load model:', error);
            this.isLoading = false;
            this.addBotMessage('I\'m working with my knowledge base instead of the full AI model. I can still provide detailed answers about Alex\'s experience and expertise!');
        }
    }
    
    openChat() {
        this.overlay.style.display = 'flex';
        this.input.focus();
        
        // Try to load model on first chat open, but don't block the UI
        if (!this.isModelLoaded && !this.isLoading) {
            // Wait a bit to ensure the page is fully loaded
            setTimeout(() => {
                this.loadModel();
            }, 500);
        }
    }
    
    closeChat() {
        this.overlay.style.display = 'none';
    }
    
    async sendMessage() {
        const userMessage = this.input.value.trim();
        if (!userMessage) return;
        
        // Add user message to chat
        this.addUserMessage(userMessage);
        this.input.value = '';
        
        // Show loading
        this.loading.style.display = 'block';
        
        try {
            // Check for inappropriate content first
            if (this.isInappropriateContent(userMessage)) {
                this.addBotMessage('How sassy! I\'m afraid I won\'t answer that... just ask him yourself! 😏');
                this.loading.style.display = 'none';
                return;
            }
            
            // Get relevant context from knowledge base
            const context = this.getRelevantContext(userMessage);
            
            // Generate response
            const response = await this.generateResponse(userMessage, context);
            
            // Add bot response
            this.addBotMessage(response);
        } catch (error) {
            console.error('Error generating response:', error);
            this.addBotMessage('Sorry, I encountered an error processing your question. Please try again.');
        }
        
        // Hide loading
        this.loading.style.display = 'none';
    }
    
    isInappropriateContent(message) {
        const inappropriateKeywords = [
            'sex', 'sexual', 'porn', 'nude', 'naked', 'horny', 'fuck', 'fucking', 
            'shit', 'damn', 'hell', 'bitch', 'dick', 'cock', 'pussy', 'ass',
            'masturbat', 'orgasm', 'erotic', 'kinky', 'fetish', 'penis', 'vagina',
            'breast', 'boob', 'dating', 'girlfriend', 'boyfriend', 'romantic',
            'love life', 'relationship', 'marry', 'marriage', 'intimate', 'hookup'
        ];
        
        const messageLower = message.toLowerCase();
        return inappropriateKeywords.some(keyword => messageLower.includes(keyword));
    }
    
    getRelevantContext(query) {
        if (!this.knowledgeBase) return '';
        
        const queryLower = query.toLowerCase();
        let relevantContext = [];
        
        // Keywords for different knowledge areas
        const projectKeywords = ['project', 'build', 'develop', 'create', 'mcp', 'weather', 'trade', 'fisheries', 'pyadmb'];
        const experienceKeywords = ['work', 'job', 'experience', 'team', 'lead', 'manage', 'architect', 'xaldigital', 'system73', 'iattc'];
        const techKeywords = ['technology', 'tech', 'python', 'ai', 'ml', 'distributed', 'microservices', 'aws', 'docker'];
        const philosophyKeywords = ['approach', 'philosophy', 'principle', 'think', 'believe', 'methodology'];
        const personalKeywords = ['personal', 'hobby', 'chess', 'yoga', 'exercise', 'hiking', 'podcast', 'sleep', 'nutrition'];
        
        // Check for project-related queries
        if (projectKeywords.some(keyword => queryLower.includes(keyword))) {
            if (this.knowledgeBase.projects && this.knowledgeBase.projects.projects) {
                relevantContext.push('Projects: ' + JSON.stringify(this.knowledgeBase.projects.projects.slice(0, 2)));
            }
        }
        
        // Check for experience-related queries
        if (experienceKeywords.some(keyword => queryLower.includes(keyword))) {
            if (this.knowledgeBase.experience && this.knowledgeBase.experience.experience) {
                relevantContext.push('Experience: ' + JSON.stringify(this.knowledgeBase.experience.experience.slice(0, 2)));
            }
        }
        
        // Check for technology-related queries
        if (techKeywords.some(keyword => queryLower.includes(keyword))) {
            if (this.knowledgeBase.tech_insights && this.knowledgeBase.tech_insights.technology_opinions) {
                relevantContext.push('Tech Insights: ' + JSON.stringify(this.knowledgeBase.tech_insights.technology_opinions));
            }
        }
        
        // Check for philosophy-related queries
        if (philosophyKeywords.some(keyword => queryLower.includes(keyword))) {
            if (this.knowledgeBase.philosophy && this.knowledgeBase.philosophy.personal_philosophy) {
                relevantContext.push('Philosophy: ' + JSON.stringify(this.knowledgeBase.philosophy.personal_philosophy));
            }
        }
        
        // Check for personal lifestyle queries
        if (personalKeywords.some(keyword => queryLower.includes(keyword))) {
            if (this.knowledgeBase.philosophy && this.knowledgeBase.philosophy.personal_philosophy && this.knowledgeBase.philosophy.personal_philosophy.personal_lifestyle) {
                relevantContext.push('Lifestyle: ' + JSON.stringify(this.knowledgeBase.philosophy.personal_philosophy.personal_lifestyle));
            }
        }
        
        // If no specific category, include basic personal info
        if (relevantContext.length === 0 && this.knowledgeBase.personal && this.knowledgeBase.personal.personal) {
            relevantContext.push('Basic Info: ' + JSON.stringify(this.knowledgeBase.personal.personal));
        }
        
        return relevantContext.join('\n\n').substring(0, 2000); // Limit context size
    }
    
    async generateResponse(userMessage, context) {
        // If model is not loaded, provide basic responses from knowledge base
        if (!this.isModelLoaded) {
            return this.generateBasicResponse(userMessage, context);
        }
        
        try {
            const prompt = this.buildPrompt(userMessage, context);
            const result = await this.model(prompt, {
                max_length: 300,
                temperature: 0.7,
                do_sample: true,
                top_p: 0.9
            });
            
            return result[0].generated_text || 'I apologize, but I couldn\'t generate a proper response. Could you try rephrasing your question?';
        } catch (error) {
            console.error('Model generation error:', error);
            return this.generateBasicResponse(userMessage, context);
        }
    }
    
    generateBasicResponse(userMessage, context) {
        const queryLower = userMessage.toLowerCase();
        
        // Simple pattern matching for common queries
        if (queryLower.includes('project')) {
            return "I've worked on several interesting projects including a Weather MCP Server integrating EUMETSAT data with AI forecasts, a Trade Promotion Management system, and tools for tuna fisheries data exploration. What specific project would you like to know more about?";
        }
        
        if (queryLower.includes('experience') || queryLower.includes('work')) {
            return "I'm currently a Technical Leader at XalDigital, leading AI/ML and IoT projects. Previously, I was a Software Architect at System73 building P2P streaming platforms, and I have experience in scientific computing from my work at IATTC. What aspect of my experience interests you?";
        }
        
        if (queryLower.includes('philosophy') || queryLower.includes('approach')) {
            return "My coding philosophy centers on Receptive Architecture, Essential Simplicity, and Collaborative Decoupling. I believe in listening to the code, starting simple, and designing for others. Would you like me to elaborate on any of these principles?";
        }
        
        if (queryLower.includes('chess') || queryLower.includes('yoga') || queryLower.includes('exercise')) {
            return "I'm passionate about chess for strategic thinking, yoga and meditation for mental clarity, and various physical activities including rock climbing, running, cycling, and hiking. I prioritize 8+ hours of sleep and maintain a protein-focused diet. These practices directly enhance my technical performance.";
        }
        
        return "I'd be happy to help! I can discuss Alejandro's projects, experience, technical philosophy, or personal lifestyle. What would you like to know more about?";
    }
    
    buildPrompt(userMessage, context) {
        return `You are Alejandro Pérez's AI assistant. Answer questions about Alejandro based on the provided context. Be conversational, informative, and speak in first person as if you are Alejandro.

Context: ${context}

Question: ${userMessage}

Response:`;
    }
    
    addUserMessage(message) {
        const messageDiv = document.createElement('div');
        messageDiv.className = 'message user-message';
        messageDiv.innerHTML = `<div class="message-content">${this.escapeHtml(message)}</div>`;
        this.messages.appendChild(messageDiv);
        this.scrollToBottom();
    }
    
    addBotMessage(message) {
        const messageDiv = document.createElement('div');
        messageDiv.className = 'message bot-message';
        messageDiv.innerHTML = `<div class="message-content">${this.escapeHtml(message)}</div>`;
        this.messages.appendChild(messageDiv);
        this.scrollToBottom();
    }
    
    scrollToBottom() {
        this.messages.scrollTop = this.messages.scrollHeight;
    }
    
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Initialize chatbot when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new AlexAIChatbot();
    console.log("how do you like it so far?");
});