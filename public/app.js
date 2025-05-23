document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const promptForm = document.getElementById('prompt-form');
    const promptInput = document.getElementById('prompt-input');
    const submitBtn = document.getElementById('submit-btn');
    const chatContainer = document.getElementById('chat-container');
    const welcomeMessage = document.getElementById('welcome-message');
    const historyBtn = document.getElementById('history-btn');
    const historyPanel = document.getElementById('history-panel');
    const closeHistoryBtn = document.getElementById('close-history');
    const historyItems = document.getElementById('history-items');
    const clearBtn = document.getElementById('clear-btn');
    const suggestionButtons = document.querySelectorAll('.suggestion');
    const featureButtons = document.querySelectorAll('.feature-button');
    const chatInterface = document.getElementById('chat-interface');

    // State variables
    let conversationHistory = [];
    let isWaitingForResponse = false;
    
    // Initially hide the chat interface until a feature button is clicked
    chatInterface.style.display = 'none';

    // Check for existing history in localStorage
    const loadHistory = () => {
        const storedHistory = localStorage.getItem('omnicore_history');
        if (storedHistory) {
            try {
                conversationHistory = JSON.parse(storedHistory);
                updateHistoryPanel();
                
                // If there are previous conversations, populate the chat container
                if (conversationHistory.length > 0) {
                    welcomeMessage.style.display = 'none';
                    conversationHistory.forEach(item => {
                        addMessageToChat('user', item.prompt);
                        addMessageToChat('ai', item.response);
                    });
                }
            } catch (error) {
                console.error('Error loading history:', error);
            }
        }
    };

    // Save history to localStorage
    const saveHistory = () => {
        localStorage.setItem('omnicore_history', JSON.stringify(conversationHistory));
    };

    // Format timestamp
    const formatTimestamp = () => {
        const now = new Date();
        return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    // Format date for history items
    const formatDate = (timestamp) => {
        const date = new Date(timestamp);
        return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    // Add message to chat container
    const addMessageToChat = (sender, text) => {
        welcomeMessage.style.display = 'none';
        
        const messageEl = document.createElement('div');
        messageEl.className = `message ${sender}-message`;
        
        // Process markdown-like syntax for code blocks
        let processedText = text;
        
        // Handle code blocks
        processedText = processedText.replace(/```([\s\S]*?)```/g, (match, code) => {
            return `<pre>${code.trim()}</pre>`;
        });
        
        // Handle inline code
        processedText = processedText.replace(/`([^`]+)`/g, (match, code) => {
            return `<code>${code}</code>`;
        });
        
        // Handle line breaks
        processedText = processedText.replace(/\n/g, '<br>');
        
        messageEl.innerHTML = `
            <div class="avatar ${sender}-avatar">
                ${sender === 'user' ? 'U' : 'AI'}
            </div>
            <div class="message-content">
                <div class="message-text">${processedText}</div>
                <div class="message-time">${formatTimestamp()}</div>
            </div>
        `;
        
        chatContainer.appendChild(messageEl);
        chatContainer.scrollTop = chatContainer.scrollHeight;
    };

    // Add typing indicator
    const addTypingIndicator = () => {
        const typingEl = document.createElement('div');
        typingEl.className = 'typing-indicator';
        typingEl.innerHTML = `
            <div class="avatar ai-avatar">AI</div>
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
        `;
        typingEl.id = 'typing-indicator';
        chatContainer.appendChild(typingEl);
        chatContainer.scrollTop = chatContainer.scrollHeight;
    };

    // Remove typing indicator
    const removeTypingIndicator = () => {
        const typingEl = document.getElementById('typing-indicator');
        if (typingEl) {
            typingEl.remove();
        }
    };

    // Send prompt to API
    const sendPrompt = async (prompt) => {
        isWaitingForResponse = true;
        submitBtn.disabled = true;
        addMessageToChat('user', prompt);
        addTypingIndicator();

        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ prompt }),
            });

            if (!response.ok) {
                throw new Error('Failed to get response');
            }

            const data = await response.json();
            removeTypingIndicator();
            addMessageToChat('ai', data.response);

            // Add to conversation history
            conversationHistory.push({
                prompt,
                response: data.response,
                timestamp: Date.now()
            });

            // Save to localStorage
            saveHistory();
            updateHistoryPanel();

        } catch (error) {
            console.error('Error:', error);
            removeTypingIndicator();
            addMessageToChat('ai', 'Sorry, I encountered an error processing your request. Please try again.');
        } finally {
            isWaitingForResponse = false;
            submitBtn.disabled = false;
            promptInput.focus();
        }
    };

    // Update history panel
    const updateHistoryPanel = () => {
        historyItems.innerHTML = '';
        
        if (conversationHistory.length === 0) {
            const emptyState = document.createElement('div');
            emptyState.className = 'history-empty-state';
            emptyState.textContent = 'No conversation history yet';
            historyItems.appendChild(emptyState);
            return;
        }
        
        // Sort history by timestamp (newest first)
        const sortedHistory = [...conversationHistory].reverse();
        
        sortedHistory.forEach((item, index) => {
            const historyItemEl = document.createElement('div');
            historyItemEl.className = 'history-item';
            historyItemEl.innerHTML = `
                <div class="history-item-prompt">${item.prompt}</div>
                <div class="history-item-time">${formatDate(item.timestamp)}</div>
            `;
            
            historyItemEl.addEventListener('click', () => {
                addMessageToChat('user', item.prompt);
                addMessageToChat('ai', item.response);
                toggleHistoryPanel();
            });
            
            historyItems.appendChild(historyItemEl);
        });
    };

    // Toggle history panel
    const toggleHistoryPanel = () => {
        historyPanel.classList.toggle('active');
    };

    // Clear conversation
    const clearConversation = () => {
        if (confirm('Are you sure you want to clear the entire conversation?')) {
            chatContainer.innerHTML = '';
            welcomeMessage.style.display = 'block';
            conversationHistory = [];
            saveHistory();
            updateHistoryPanel();
        }
    };

    // Feature navigation handling
    const activateFeature = (mode) => {
        // Make all feature buttons inactive
        featureButtons.forEach(button => {
            button.classList.remove('active');
            if (button.getAttribute('data-mode') === mode) {
                button.classList.add('active');
            }
        });
        
        // Handle specific feature activation
        if (mode === 'chat') {
            // Show chat interface, hide welcome message
            welcomeMessage.style.display = 'none';
            document.getElementById('chat-interface').style.display = 'flex';
        } else if (mode === 'audit') {
            // The audit tool button has a direct link to the audit tool page
            // No additional action needed here as it's handled by the onclick function
        }
    };
    
    // Handle feature button clicks
    featureButtons.forEach(button => {
        button.addEventListener('click', () => {
            const mode = button.getAttribute('data-mode');
            if (mode === 'chat') {
                activateFeature(mode);
            }
            // Note: The audit button has its own onclick handler to navigate to the audit page
        });
    });

    // Event Listeners
    promptForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const prompt = promptInput.value.trim();
        
        if (prompt && !isWaitingForResponse) {
            promptInput.value = '';
            sendPrompt(prompt);
            
            // Make sure chat feature is active when sending a prompt
            activateFeature('chat');
        }
    });

    historyBtn.addEventListener('click', toggleHistoryPanel);
    closeHistoryBtn.addEventListener('click', toggleHistoryPanel);
    clearBtn.addEventListener('click', clearConversation);

    // Handle suggestion buttons
    suggestionButtons.forEach(button => {
        button.addEventListener('click', () => {
            const promptText = button.getAttribute('data-prompt');
            if (promptText && !isWaitingForResponse) {
                promptInput.value = '';
                sendPrompt(promptText);
            }
        });
    });

    // Initialize
    loadHistory();
    promptInput.focus();
});

// Automation Hub Functions
function showAutomationHub() {
    const mainContent = document.querySelector('main');
    
    mainContent.innerHTML = `
        <div class="automation-hub">
            <div class="hub-header">
                <h2>🤖 OmniCore Automation Hub</h2>
                <p>Transform your business processes with AI-powered automation</p>
            </div>
            
            <div class="automation-form">
                <div class="form-group">
                    <label for="task-type">Task Type</label>
                    <select id="task-type" class="form-control">
                        <option value="summarize">📄 Summarize Content</option>
                        <option value="rewrite">✏️ Rewrite & Improve</option>
                        <option value="audit">🔍 Business Audit</option>
                        <option value="generate-copy">📝 Generate Marketing Copy</option>
                        <option value="insights">💡 Extract Business Insights</option>
                    </select>
                </div>
                
                <div class="form-group">
                    <label for="content-input">Content to Process</label>
                    <textarea id="content-input" class="form-control" rows="8" 
                        placeholder="Paste your content here for AI processing..."></textarea>
                </div>
                
                <div class="form-actions">
                    <button id="process-btn" class="btn-primary">
                        <span class="btn-icon">⚡</span>
                        Process with AI
                    </button>
                    <button onclick="showDashboard()" class="btn-secondary">
                        ← Back to Dashboard
                    </button>
                </div>
            </div>
            
            <div id="automation-result" class="result-panel" style="display: none;">
                <h3>AI Processing Result</h3>
                <div id="result-content"></div>
                <div class="result-actions">
                    <button onclick="copyToClipboard()" class="btn-secondary">📋 Copy Result</button>
                    <button onclick="showTaskLogs()" class="btn-secondary">📊 View All Tasks</button>
                </div>
            </div>
        </div>
    `;
    
    // Add event listener for process button
    document.getElementById('process-btn').addEventListener('click', processAutomationTask);
}

function showTaskLogs() {
    const mainContent = document.querySelector('main');
    
    mainContent.innerHTML = `
        <div class="task-logs">
            <div class="logs-header">
                <h2>📈 Task Logs & Analytics</h2>
                <p>Track your automation workflow history</p>
            </div>
            
            <div class="logs-actions">
                <button onclick="refreshLogs()" class="btn-secondary">🔄 Refresh</button>
                <button onclick="showDashboard()" class="btn-secondary">← Back to Dashboard</button>
            </div>
            
            <div id="logs-content" class="logs-content">
                <div class="loading">Loading task history...</div>
            </div>
        </div>
    `;
    
    loadTaskLogs();
}

async function processAutomationTask() {
    const taskType = document.getElementById('task-type').value;
    const content = document.getElementById('content-input').value.trim();
    const processBtn = document.getElementById('process-btn');
    const resultPanel = document.getElementById('automation-result');
    const resultContent = document.getElementById('result-content');
    
    if (!content) {
        alert('Please enter content to process');
        return;
    }
    
    // Show processing state
    processBtn.innerHTML = '<span class="btn-icon">⏳</span> Processing...';
    processBtn.disabled = true;
    
    try {
        const response = await fetch('/api/automation/nlp-query', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                query: content,
                type: taskType
            })
        });
        
        const result = await response.json();
        
        if (response.ok) {
            // Show result
            resultContent.innerHTML = formatResult(result.result);
            resultPanel.style.display = 'block';
            resultPanel.scrollIntoView({ behavior: 'smooth' });
        } else {
            alert('Error processing task: ' + result.error);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Failed to process task. Please try again.');
    } finally {
        // Reset button
        processBtn.innerHTML = '<span class="btn-icon">⚡</span> Process with AI';
        processBtn.disabled = false;
    }
}

async function loadTaskLogs() {
    const logsContent = document.getElementById('logs-content');
    
    try {
        const response = await fetch('/api/automation/logs');
        const data = await response.json();
        
        if (response.ok && data.tasks.length > 0) {
            const logsHtml = data.tasks.map(task => `
                <div class="log-item">
                    <div class="log-header">
                        <span class="task-type">${getTaskTypeIcon(task.type)} ${task.type}</span>
                        <span class="task-time">${formatTaskDate(task.timestamp)}</span>
                    </div>
                    <div class="log-content">
                        <div class="task-query">${task.query.substring(0, 100)}${task.query.length > 100 ? '...' : ''}</div>
                        <div class="task-result">${task.result.substring(0, 200)}${task.result.length > 200 ? '...' : ''}</div>
                    </div>
                    <div class="log-status status-${task.status}">${task.status}</div>
                </div>
            `).join('');
            
            logsContent.innerHTML = `
                <div class="logs-summary">
                    <div class="summary-item">
                        <span class="summary-number">${data.total}</span>
                        <span class="summary-label">Total Tasks</span>
                    </div>
                    <div class="summary-item">
                        <span class="summary-number">${data.tasks.filter(t => t.status === 'completed').length}</span>
                        <span class="summary-label">Completed</span>
                    </div>
                </div>
                <div class="logs-list">
                    ${logsHtml}
                </div>
            `;
        } else {
            logsContent.innerHTML = '<div class="empty-logs">No automation tasks found. Start by using the Automation Hub!</div>';
        }
    } catch (error) {
        console.error('Error loading logs:', error);
        logsContent.innerHTML = '<div class="error">Failed to load task logs</div>';
    }
}

function refreshLogs() {
    document.getElementById('logs-content').innerHTML = '<div class="loading">Refreshing...</div>';
    loadTaskLogs();
}

function formatResult(result) {
    // Format the AI result with proper styling
    return result.replace(/\n/g, '<br>').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
}

function formatTaskDate(timestamp) {
    const date = new Date(timestamp);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function getTaskTypeIcon(type) {
    const icons = {
        'summarize': '📄',
        'rewrite': '✏️',
        'audit': '🔍',
        'generate-copy': '📝',
        'insights': '💡'
    };
    return icons[type] || '⚡';
}

function copyToClipboard() {
    const resultContent = document.getElementById('result-content');
    const text = resultContent.textContent;
    
    navigator.clipboard.writeText(text).then(() => {
        alert('Result copied to clipboard!');
    }).catch(() => {
        alert('Failed to copy to clipboard');
    });
}

function showDashboard() {
    const mainContent = document.querySelector('main');
    
    mainContent.innerHTML = `
        <div class="welcome-message" id="welcome-message">
            <h2>Welcome to OmniCore</h2>
            <p>Your AI Command Center for Building Automated Client Workflows</p>
            
            <div class="features-container">
                <div class="feature">
                    <div class="feature-icon">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <circle cx="12" cy="12" r="3"></circle>
                            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
                        </svg>
                    </div>
                    <h3>AI Chat Assistant</h3>
                    <p>Get expert business advice on automation, workflows, and AI implementation</p>
                    <button class="feature-button active" data-mode="chat" onclick="activateFeature('chat')">Access Now</button>
                </div>
                <div class="feature">
                    <div class="feature-icon">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M20 11.08V8l-6-6H6a2 2 0 0 0-2 2v16c0 1.1.9 2 2 2h6"></path>
                            <path d="M14 3v5h5M18 16v6M15 19h6"></path>
                        </svg>
                    </div>
                    <h3>Business Audit Tool</h3>
                    <p>Analyze your operation and get tailored workflow automation recommendations</p>
                    <button class="feature-button" data-mode="audit" onclick="window.location.href='/audit-form'">Launch Tool</button>
                </div>
                <div class="feature">
                    <div class="feature-icon">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"></path>
                        </svg>
                    </div>
                    <h3>Automation Hub</h3>
                    <p>Process tasks with AI: Summarize, Rewrite, Generate Copy, and Get Insights</p>
                    <button class="feature-button" data-mode="automation" onclick="showAutomationHub()">Process with AI</button>
                </div>
                <div class="feature">
                    <div class="feature-icon">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M3 3v5h5"></path>
                            <path d="M6 17l4-4 4 4"></path>
                            <path d="M10 13l4-4 4 4"></path>
                            <path d="M17 8l3-3"></path>
                            <circle cx="21" cy="21" r="1"></circle>
                        </svg>
                    </div>
                    <h3>Task Logs</h3>
                    <p>View completed automation tasks and track your workflow history</p>
                    <button class="feature-button" data-mode="logs" onclick="showTaskLogs()">View History</button>
                </div>
            </div>
        </div>
        
        <div id="chat-interface" class="chat-interface">
            <div class="chat-container" id="chat-container"></div>
            <footer>
                <form id="prompt-form" class="prompt-form">
                    <div class="input-container">
                        <input type="text" id="prompt-input" placeholder="Ask about business process optimization, AI implementation, or workflow strategies..." autocomplete="off">
                        <button type="submit" id="submit-btn">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <line x1="22" y1="2" x2="11" y2="13"></line>
                                <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                            </svg>
                        </button>
                    </div>
                </form>
            </footer>
        </div>
    `;
    
    // Reinitialize the chat functionality
    initializeChatFeature();
}

function initializeChatFeature() {
    // Reinitialize all the chat-related event listeners
    const promptForm = document.getElementById('prompt-form');
    const promptInput = document.getElementById('prompt-input');
    
    if (promptForm) {
        promptForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const prompt = promptInput.value.trim();
            
            if (prompt && !isWaitingForResponse) {
                promptInput.value = '';
                sendPrompt(prompt);
                activateFeature('chat');
            }
        });
    }
}

// Welcome Tour System
class WelcomeTour {
    constructor() {
        this.currentStep = 0;
        this.isActive = false;
        this.steps = [
            {
                target: '.feature:nth-child(1)',
                title: 'AI Chat Assistant 🤖',
                description: 'Your intelligent business advisor that provides expert guidance on automation strategies, workflow optimization, and implementation best practices. Get personalized recommendations based on your specific business needs.',
                position: 'bottom'
            },
            {
                target: '.feature:nth-child(2)',
                title: 'Business Audit Tool 📊',
                description: 'Complete a comprehensive 4-step assessment analyzing your business basics, operations, growth challenges, and AI readiness. Receive detailed reports with actionable automation recommendations.',
                position: 'bottom'
            },
            {
                target: '.feature:nth-child(3)',
                title: 'Automation Hub ⚡',
                description: 'Powerful AI-driven content processing center. Automatically summarize documents, rewrite content for different audiences, generate marketing copy, and extract valuable business insights.',
                position: 'top'
            },
            {
                target: '.feature:nth-child(4)',
                title: 'Analytics & Insights 📈',
                description: 'Track your automation performance with real-time metrics including cost savings, time recovered, and efficiency gains. Monitor ROI and get intelligent optimization recommendations.',
                position: 'top'
            },
            {
                target: '.feature:nth-child(5)',
                title: 'Client Onboarding 👥',
                description: 'Streamline new client acquisition with automated workflows for welcome sequences, document collection, consultation scheduling, and progress tracking for consistent professional experiences.',
                position: 'top'
            },
            {
                target: '.feature:nth-child(6)',
                title: 'ROI Tracking 💰',
                description: 'Calculate and monitor your automation investment returns with detailed financial analytics. Use the built-in calculator to project potential savings and measure actual business impact.',
                position: 'top'
            },
            {
                target: '.logo',
                title: 'Welcome to OmniCore! 🎉',
                description: 'You\'re all set! Click the logo anytime to return to this dashboard. Ready to automate your business?',
                position: 'bottom'
            }
        ];
        this.init();
    }

    init() {
        this.createTourElements();
        this.checkFirstVisit();
    }

    checkFirstVisit() {
        const hasVisited = localStorage.getItem('omnicore-tour-completed');
        if (!hasVisited) {
            setTimeout(() => this.showWelcomeBanner(), 1000);
        }
    }

    showWelcomeBanner() {
        const welcomeMessage = document.querySelector('.welcome-message');
        if (welcomeMessage) {
            const banner = document.createElement('div');
            banner.className = 'welcome-banner';
            banner.innerHTML = `
                <div style="animation: fadeInScale 0.6s ease-out;">
                    <h3 style="margin-bottom: 0.75rem; font-size: 1.8rem;">👋 Welcome to OmniCore!</h3>
                    <p style="margin-bottom: 1.5rem; font-size: 1.1rem; opacity: 0.95;">Discover how AI automation can transform your business operations</p>
                    <div style="display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap;">
                        <button class="start-tour-btn" onclick="tour.startTour()" style="animation: pulse 2s infinite;">
                            🚀 Take the Interactive Tour
                        </button>
                        <button class="start-tour-btn" onclick="tour.skipTour()" style="background: transparent; border: 2px solid rgba(255,255,255,0.4);">
                            Maybe Later
                        </button>
                    </div>
                </div>
            `;
            
            welcomeMessage.insertBefore(banner, welcomeMessage.firstChild);
            
            // Smooth animation reveal
            setTimeout(() => {
                banner.classList.add('show');
                banner.style.animation = 'slideDown 0.8s cubic-bezier(0.4, 0, 0.2, 1)';
            }, 200);
        }
    }

    createTourElements() {
        // Create overlay
        const overlay = document.createElement('div');
        overlay.className = 'tour-overlay';
        overlay.id = 'tour-overlay';
        document.body.appendChild(overlay);

        // Create popup
        const popup = document.createElement('div');
        popup.className = 'tour-popup';
        popup.id = 'tour-popup';
        document.body.appendChild(popup);
    }

    startTour() {
        this.hideWelcomeBanner();
        this.isActive = true;
        this.currentStep = 0;
        this.showStep();
    }

    showStep() {
        const step = this.steps[this.currentStep];
        const target = document.querySelector(step.target);
        const overlay = document.getElementById('tour-overlay');
        const popup = document.getElementById('tour-popup');

        if (!target) return;

        // Show overlay
        overlay.classList.add('active');

        // Highlight target
        this.clearHighlights();
        target.classList.add('tour-highlight');

        // Position and show popup
        this.positionPopup(target, step, popup);
        this.updatePopupContent(step, popup);
        
        setTimeout(() => popup.classList.add('active'), 100);
    }

    positionPopup(target, step, popup) {
        const rect = target.getBoundingClientRect();
        const popupRect = popup.getBoundingClientRect();
        
        let top, left;

        if (step.position === 'bottom') {
            top = rect.bottom + 20;
            left = rect.left + (rect.width / 2) - (350 / 2);
        } else if (step.position === 'top') {
            top = rect.top - popupRect.height - 20;
            left = rect.left + (rect.width / 2) - (350 / 2);
        }

        // Keep popup on screen
        if (left < 20) left = 20;
        if (left + 350 > window.innerWidth - 20) left = window.innerWidth - 370;
        if (top < 20) top = 20;

        popup.style.top = top + 'px';
        popup.style.left = left + 'px';
    }

    updatePopupContent(step, popup) {
        const isLastStep = this.currentStep === this.steps.length - 1;
        const progress = this.steps.map((_, index) => 
            `<div class="tour-dot ${index <= this.currentStep ? 'active' : ''}"></div>`
        ).join('');

        popup.innerHTML = `
            <h3>${step.title}</h3>
            <p>${step.description}</p>
            <div class="tour-controls">
                <div class="tour-progress">
                    ${progress}
                </div>
                <div class="tour-nav">
                    <button class="tour-btn tour-btn-skip" onclick="tour.skipTour()">
                        Skip Tour
                    </button>
                    <button class="tour-btn ${isLastStep ? 'tour-btn-finish' : 'tour-btn-next'}" 
                            onclick="tour.${isLastStep ? 'finishTour' : 'nextStep'}()">
                        ${isLastStep ? 'Get Started!' : 'Next'}
                    </button>
                </div>
            </div>
        `;
    }

    nextStep() {
        this.currentStep++;
        if (this.currentStep < this.steps.length) {
            this.showStep();
        } else {
            this.finishTour();
        }
    }

    skipTour() {
        this.hideWelcomeBanner();
        this.endTour();
    }

    finishTour() {
        localStorage.setItem('omnicore-tour-completed', 'true');
        this.endTour();
        this.showCompletionMessage();
    }

    endTour() {
        this.isActive = false;
        this.clearHighlights();
        
        const overlay = document.getElementById('tour-overlay');
        const popup = document.getElementById('tour-popup');
        
        popup.classList.remove('active');
        setTimeout(() => {
            overlay.classList.remove('active');
        }, 300);
    }

    clearHighlights() {
        document.querySelectorAll('.tour-highlight').forEach(el => {
            el.classList.remove('tour-highlight');
        });
    }

    hideWelcomeBanner() {
        const banner = document.querySelector('.welcome-banner');
        if (banner) {
            banner.style.animation = 'slideDown 0.3s ease reverse';
            setTimeout(() => banner.remove(), 300);
        }
    }

    showCompletionMessage() {
        // Create a subtle success notification
        const notification = document.createElement('div');
        notification.innerHTML = `
            <div style="
                position: fixed;
                top: 20px;
                right: 20px;
                background: linear-gradient(135deg, var(--accent) 0%, var(--primary) 100%);
                color: white;
                padding: 1rem 1.5rem;
                border-radius: 12px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.2);
                z-index: 1000;
                animation: slideDown 0.5s ease;
            ">
                <div style="display: flex; align-items: center; gap: 0.5rem;">
                    <span style="font-size: 1.2rem;">🎉</span>
                    <span style="font-weight: 500;">Welcome tour completed!</span>
                </div>
                <div style="font-size: 0.9rem; opacity: 0.9; margin-top: 0.25rem;">
                    Ready to automate your business workflows!
                </div>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideDown 0.3s ease reverse';
            setTimeout(() => notification.remove(), 300);
        }, 4000);
    }
}

// Initialize tour when page loads
let tour;
document.addEventListener('DOMContentLoaded', function() {
    tour = new WelcomeTour();
});

// Add manual tour trigger for testing
function startWelcomeTour() {
    if (tour) {
        localStorage.removeItem('omnicore-tour-completed');
        tour.showWelcomeBanner();
    }
}

// Analytics & Insights Dashboard
function showAnalyticsDashboard() {
    const mainContent = document.querySelector('main');
    
    mainContent.innerHTML = `
        <div class="analytics-dashboard enhanced-automation-panel">
            <div class="dashboard-header">
                <h2>📊 Analytics & Insights Dashboard</h2>
                <p>Track your business automation performance and growth metrics</p>
            </div>
            
            <div class="metrics-grid">
                <div class="metric-card">
                    <div class="metric-icon">⚡</div>
                    <div class="metric-data">
                        <span class="metric-value" id="automations-count">0</span>
                        <span class="metric-label">Automations Running</span>
                    </div>
                </div>
                <div class="metric-card">
                    <div class="metric-icon">💰</div>
                    <div class="metric-data">
                        <span class="metric-value" id="cost-savings">$0</span>
                        <span class="metric-label">Monthly Savings</span>
                    </div>
                </div>
                <div class="metric-card">
                    <div class="metric-icon">⏱️</div>
                    <div class="metric-data">
                        <span class="metric-value" id="time-saved">0</span>
                        <span class="metric-label">Hours Saved</span>
                    </div>
                </div>
                <div class="metric-card">
                    <div class="metric-icon">📈</div>
                    <div class="metric-data">
                        <span class="metric-value" id="efficiency-gain">0%</span>
                        <span class="metric-label">Efficiency Gain</span>
                    </div>
                </div>
            </div>
            
            <div class="insights-section">
                <h3>🎯 Key Insights</h3>
                <div class="insights-list" id="insights-list">
                    <div class="insight-item">
                        <span class="insight-icon">💡</span>
                        <span class="insight-text">Start tracking your automation ROI by completing a business audit</span>
                    </div>
                </div>
            </div>
            
            <div class="dashboard-actions">
                <button onclick="showDashboard()" class="btn-secondary">← Back to Dashboard</button>
                <button onclick="showROIDashboard()" class="enhanced-button">View ROI Details</button>
            </div>
        </div>
    `;
    
    loadAnalyticsData();
}

// Client Onboarding Workflows
function showOnboardingWorkflows() {
    const mainContent = document.querySelector('main');
    
    mainContent.innerHTML = `
        <div class="onboarding-workflows enhanced-automation-panel">
            <div class="workflow-header">
                <h2>👥 Client Onboarding Workflows</h2>
                <p>Automate your client setup and engagement processes</p>
            </div>
            
            <div class="workflow-templates">
                <div class="template-card">
                    <div class="template-icon">📋</div>
                    <h3>New Client Setup</h3>
                    <p>Automated welcome emails, document collection, and initial consultations</p>
                    <button class="enhanced-button" onclick="setupClientWorkflow('new-client')">Setup Workflow</button>
                </div>
                <div class="template-card">
                    <div class="template-icon">📊</div>
                    <h3>Business Assessment</h3>
                    <p>Automated audit scheduling, data collection, and report generation</p>
                    <button class="enhanced-button-secondary" onclick="setupClientWorkflow('assessment')">Setup Workflow</button>
                </div>
                <div class="template-card">
                    <div class="template-icon">🎯</div>
                    <h3>Implementation Plan</h3>
                    <p>Automated milestone tracking, progress updates, and check-ins</p>
                    <button class="enhanced-button" onclick="setupClientWorkflow('implementation')">Setup Workflow</button>
                </div>
            </div>
            
            <div class="active-workflows">
                <h3>🚀 Active Workflows</h3>
                <div class="workflow-list" id="workflow-list">
                    <div class="workflow-item">
                        <span class="workflow-status">⚪</span>
                        <span class="workflow-name">No active workflows yet</span>
                        <span class="workflow-action">Start by setting up your first workflow above</span>
                    </div>
                </div>
            </div>
            
            <div class="workflow-actions">
                <button onclick="showDashboard()" class="btn-secondary">← Back to Dashboard</button>
                <button onclick="showAutomationHub()" class="enhanced-button-secondary">Create Custom Workflow</button>
            </div>
        </div>
    `;
}

// ROI Tracking Dashboard
function showROIDashboard() {
    const mainContent = document.querySelector('main');
    
    mainContent.innerHTML = `
        <div class="roi-dashboard enhanced-automation-panel">
            <div class="roi-header">
                <h2>💰 ROI Tracking Dashboard</h2>
                <p>Monitor your automation investment returns and business impact</p>
            </div>
            
            <div class="roi-overview">
                <div class="roi-card primary">
                    <h3>Total ROI</h3>
                    <div class="roi-value">
                        <span class="roi-percentage" id="total-roi">0%</span>
                        <span class="roi-trend positive">↗ +0%</span>
                    </div>
                </div>
                <div class="roi-breakdown">
                    <div class="breakdown-item">
                        <span class="breakdown-label">Cost Savings</span>
                        <span class="breakdown-value" id="total-savings">$0</span>
                    </div>
                    <div class="breakdown-item">
                        <span class="breakdown-label">Time Recovered</span>
                        <span class="breakdown-value" id="time-recovered">0 hrs</span>
                    </div>
                    <div class="breakdown-item">
                        <span class="breakdown-label">Productivity Boost</span>
                        <span class="breakdown-value" id="productivity-boost">0%</span>
                    </div>
                </div>
            </div>
            
            <div class="roi-calculator">
                <h3>🧮 Calculate Your Potential ROI</h3>
                <div class="calculator-form">
                    <div class="form-row">
                        <label>Monthly Revenue</label>
                        <input type="number" id="monthly-revenue" placeholder="50000" class="form-control">
                    </div>
                    <div class="form-row">
                        <label>Hours Spent on Manual Tasks</label>
                        <input type="number" id="manual-hours" placeholder="40" class="form-control">
                    </div>
                    <div class="form-row">
                        <label>Average Hourly Rate</label>
                        <input type="number" id="hourly-rate" placeholder="75" class="form-control">
                    </div>
                    <button onclick="calculateROI()" class="enhanced-button">Calculate Potential ROI</button>
                </div>
                <div class="roi-results" id="roi-results" style="display: none;">
                    <div class="result-item">
                        <span class="result-label">Potential Monthly Savings:</span>
                        <span class="result-value" id="potential-savings">$0</span>
                    </div>
                    <div class="result-item">
                        <span class="result-label">Annual ROI Projection:</span>
                        <span class="result-value" id="annual-roi">0%</span>
                    </div>
                </div>
            </div>
            
            <div class="roi-actions">
                <button onclick="showDashboard()" class="btn-secondary">← Back to Dashboard</button>
                <button onclick="showAnalyticsDashboard()" class="enhanced-button-secondary">View Analytics</button>
            </div>
        </div>
    `;
}

// Supporting Functions
function loadAnalyticsData() {
    // Simulate loading analytics data
    setTimeout(() => {
        document.getElementById('automations-count').textContent = '3';
        document.getElementById('cost-savings').textContent = '$2,400';
        document.getElementById('time-saved').textContent = '32';
        document.getElementById('efficiency-gain').textContent = '45%';
        
        const insightsList = document.getElementById('insights-list');
        insightsList.innerHTML = `
            <div class="insight-item">
                <span class="insight-icon">💡</span>
                <span class="insight-text">Your automation workflows are saving 32 hours per month</span>
            </div>
            <div class="insight-item">
                <span class="insight-icon">📈</span>
                <span class="insight-text">Efficiency has improved by 45% since implementing AI automation</span>
            </div>
            <div class="insight-item">
                <span class="insight-icon">🎯</span>
                <span class="insight-text">Consider adding client onboarding automation for additional 20% savings</span>
            </div>
        `;
    }, 500);
}

function setupClientWorkflow(workflowType) {
    alert(`Setting up ${workflowType} workflow! This feature connects with your existing business systems to automate client processes.`);
    
    // Add to active workflows
    const workflowList = document.getElementById('workflow-list');
    const workflowNames = {
        'new-client': 'New Client Setup Workflow',
        'assessment': 'Business Assessment Workflow', 
        'implementation': 'Implementation Plan Workflow'
    };
    
    workflowList.innerHTML = `
        <div class="workflow-item">
            <span class="workflow-status">🟢</span>
            <span class="workflow-name">${workflowNames[workflowType]}</span>
            <span class="workflow-action">Active - Processing clients</span>
        </div>
    `;
}

function calculateROI() {
    const revenue = parseFloat(document.getElementById('monthly-revenue').value) || 0;
    const hours = parseFloat(document.getElementById('manual-hours').value) || 0;
    const rate = parseFloat(document.getElementById('hourly-rate').value) || 0;
    
    if (revenue && hours && rate) {
        const monthlySavings = hours * rate * 0.7; // 70% time savings assumption
        const annualSavings = monthlySavings * 12;
        const investmentCost = 3000; // Estimated automation setup cost
        const roi = ((annualSavings - investmentCost) / investmentCost) * 100;
        
        document.getElementById('potential-savings').textContent = `$${monthlySavings.toLocaleString()}`;
        document.getElementById('annual-roi').textContent = `${Math.round(roi)}%`;
        document.getElementById('roi-results').style.display = 'block';
    } else {
        alert('Please fill in all fields to calculate ROI');
    }
}

// Fix missing functions for dashboard navigation
function activateFeature(featureName) {
    console.log('Activating feature:', featureName);
    
    // Hide dashboard
    const dashboard = document.getElementById('dashboard');
    if (dashboard) dashboard.style.display = 'none';
    
    if (featureName === 'chat') {
        const chatInterface = document.getElementById('chat-interface');
        if (chatInterface) {
            chatInterface.style.display = 'block';
            initializeChatFeature();
        }
    }
}

function showDashboard() {
    console.log('Showing dashboard');
    // Hide all sections safely (check if elements exist first)
    const sections = ['chat-interface', 'automation-hub', 'task-logs', 'analytics-dashboard', 'onboarding-workflows', 'roi-dashboard'];
    
    sections.forEach(sectionId => {
        const element = document.getElementById(sectionId);
        if (element) {
            element.style.display = 'none';
        }
    });
    
    // Show dashboard
    const dashboard = document.getElementById('dashboard');
    if (dashboard) {
        dashboard.style.display = 'block';
    }
}

// User Authentication Functions
let currentUser = null;
let authToken = null;

function showLoginForm() {
    document.getElementById('login-modal').style.display = 'block';
}

function showRegisterForm() {
    document.getElementById('register-modal').style.display = 'block';
}

function closeModal() {
    document.getElementById('login-modal').style.display = 'none';
    document.getElementById('register-modal').style.display = 'none';
}

function logout() {
    currentUser = null;
    authToken = null;
    localStorage.removeItem('authToken');
    localStorage.removeItem('username');
    updateUserInterface();
}

function updateUserInterface() {
    const userControls = document.getElementById('user-controls');
    const userInfo = document.getElementById('user-info');
    const usernameDisplay = document.getElementById('username-display');
    
    if (currentUser) {
        userControls.style.display = 'none';
        userInfo.style.display = 'flex';
        usernameDisplay.textContent = `Welcome, ${currentUser}!`;
    } else {
        userControls.style.display = 'flex';
        userInfo.style.display = 'none';
    }
}

// Login form handler
document.addEventListener('DOMContentLoaded', function() {
    // Check for existing session
    const savedToken = localStorage.getItem('authToken');
    const savedUsername = localStorage.getItem('username');
    if (savedToken && savedUsername) {
        authToken = savedToken;
        currentUser = savedUsername;
        updateUserInterface();
    }

    // Login form
    document.getElementById('login-form').addEventListener('submit', async function(e) {
        e.preventDefault();
        const username = document.getElementById('login-username').value;
        const password = document.getElementById('login-password').value;
        
        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password })
            });
            
            const data = await response.json();
            
            if (response.ok) {
                authToken = data.token;
                currentUser = data.username;
                localStorage.setItem('authToken', authToken);
                localStorage.setItem('username', currentUser);
                updateUserInterface();
                closeModal();
                alert('Login successful!');
            } else {
                alert(data.message || 'Login failed');
            }
        } catch (error) {
            alert('Login error: ' + error.message);
        }
    });
    
    // Register form
    document.getElementById('register-form').addEventListener('submit', async function(e) {
        e.preventDefault();
        const username = document.getElementById('register-username').value;
        const password = document.getElementById('register-password').value;
        
        try {
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password })
            });
            
            const data = await response.json();
            
            if (response.ok) {
                alert('Registration successful! Please log in.');
                closeModal();
                showLoginForm();
            } else {
                alert(data.message || 'Registration failed');
            }
        } catch (error) {
            alert('Registration error: ' + error.message);
        }
    });
});

// Add missing navigation functions
function showAutomationHub() {
    console.log('Showing automation hub');
    const dashboard = document.getElementById('dashboard');
    
    if (dashboard) dashboard.style.display = 'none';
    
    // Create enhanced automation hub with workflow builder
    const main = document.querySelector('main');
    main.innerHTML = `
        <div id="automation-hub" class="automation-hub">
            <div class="dashboard-header">
                <h2>⚡ AI Automation Hub</h2>
                <p>Build powerful workflows that run your business automatically</p>
                <button onclick="showDashboard()" class="btn-secondary">← Back to Dashboard</button>
            </div>
            
            <div class="automation-tabs">
                <button class="tab-button active" onclick="showAutomationTab('quick-tasks')">🔥 Quick Tasks</button>
                <button class="tab-button" onclick="showAutomationTab('workflow-builder')">🔧 Workflow Builder</button>
                <button class="tab-button" onclick="showAutomationTab('scheduled-tasks')">⏰ Scheduled Tasks</button>
                <button class="tab-button" onclick="showAutomationTab('templates')">📋 Templates</button>
            </div>

            <!-- Quick Tasks Tab -->
            <div id="quick-tasks-tab" class="tab-content active">
                <div class="quick-task-grid">
                    <div class="task-type-card" onclick="selectTaskType('summarize')">
                        <div class="task-icon">📝</div>
                        <h4>Summarize Content</h4>
                        <p>AI-powered content summarization</p>
                    </div>
                    <div class="task-type-card" onclick="selectTaskType('rewrite')">
                        <div class="task-icon">✏️</div>
                        <h4>Rewrite Text</h4>
                        <p>Improve and optimize your content</p>
                    </div>
                    <div class="task-type-card" onclick="selectTaskType('generate-copy')">
                        <div class="task-icon">💡</div>
                        <h4>Generate Copy</h4>
                        <p>Create marketing content</p>
                    </div>
                    <div class="task-type-card" onclick="selectTaskType('insights')">
                        <div class="task-icon">📊</div>
                        <h4>Business Insights</h4>
                        <p>Analyze data and trends</p>
                    </div>
                </div>
                
                <div id="task-processor" class="task-processor" style="display: none;">
                    <div class="processor-header">
                        <h3 id="selected-task-title">Selected Task</h3>
                        <button onclick="resetTaskSelection()" class="btn-secondary">Choose Different Task</button>
                    </div>
                    <div class="task-input-section">
                        <textarea id="task-input" placeholder="Enter your content here..." rows="6"></textarea>
                        <div class="task-controls">
                            <button id="process-btn" onclick="processAutomationTask()" class="btn-primary">
                                <span class="btn-icon">⚡</span> Process with AI
                            </button>
                        </div>
                    </div>
                    <div id="result-panel" class="result-panel" style="display: none;">
                        <div id="result-content"></div>
                    </div>
                </div>
            </div>

            <!-- Workflow Builder Tab -->
            <div id="workflow-builder-tab" class="tab-content">
                <div class="workflow-builder">
                    <div class="builder-header">
                        <h3>🔧 Visual Workflow Builder</h3>
                        <button onclick="createNewWorkflow()" class="btn-primary">+ New Workflow</button>
                    </div>
                    <div id="workflow-canvas" class="workflow-canvas">
                        <div class="workflow-placeholder">
                            <div class="placeholder-icon">🏗️</div>
                            <h4>Ready to Build Amazing Workflows?</h4>
                            <p>Create automated processes that save time and grow your business</p>
                            <button onclick="showWorkflowTemplates()" class="btn-primary">Start with Template</button>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Scheduled Tasks Tab -->
            <div id="scheduled-tasks-tab" class="tab-content">
                <div class="scheduled-tasks">
                    <div class="schedule-header">
                        <h3>⏰ Automated Schedules</h3>
                        <button onclick="loadScheduledTasks()" class="btn-primary">+ Schedule New Task</button>
                    </div>
                    <div id="scheduled-tasks-list" class="tasks-list">
                        <div class="task-item">
                            <div class="task-info">
                                <h4>📊 Daily Performance Report</h4>
                                <p>Generate and email daily business metrics</p>
                                <span class="schedule-time">Every day at 9:00 AM</span>
                            </div>
                            <div class="task-status active">Active</div>
                        </div>
                        <div class="task-item">
                            <div class="task-info">
                                <h4>📧 Lead Follow-up Sequence</h4>
                                <p>Automated follow-up emails for new leads</p>
                                <span class="schedule-time">Weekdays at 10:00 AM & 2:00 PM</span>
                            </div>
                            <div class="task-status active">Active</div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Templates Tab -->
            <div id="templates-tab" class="tab-content">
                <div class="workflow-templates">
                    <h3>📋 Business Automation Templates</h3>
                    <div class="templates-grid">
                        <div class="template-card" onclick="useTemplate('lead-processing')">
                            <div class="template-icon">🎯</div>
                            <h4>Lead Processing</h4>
                            <p>Automatically score, qualify, and follow up with new leads</p>
                            <div class="template-steps">3 steps • AI Analysis • Email</div>
                        </div>
                        <div class="template-card" onclick="useTemplate('content-creation')">
                            <div class="template-icon">📝</div>
                            <h4>Content Pipeline</h4>
                            <p>Generate blog posts and social media content automatically</p>
                            <div class="template-steps">4 steps • AI Content • Social</div>
                        </div>
                        <div class="template-card" onclick="useTemplate('customer-onboarding')">
                            <div class="template-icon">👥</div>
                            <h4>Customer Onboarding</h4>
                            <p>Welcome new customers with automated setup sequences</p>
                            <div class="template-steps">5 steps • Email • Setup</div>
                        </div>
                        <div class="template-card" onclick="useTemplate('data-insights')">
                            <div class="template-icon">📈</div>
                            <h4>Business Intelligence</h4>
                            <p>Weekly reports with insights and recommendations</p>
                            <div class="template-steps">3 steps • Analysis • Reports</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Enhanced automation hub functions
let selectedTaskType = null;

function showAutomationTab(tabName) {
    // Hide all tabs
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    document.querySelectorAll('.tab-button').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Show selected tab
    const targetTab = document.getElementById(tabName + '-tab');
    const targetButton = document.querySelector(`[onclick="showAutomationTab('${tabName}')"]`);
    
    if (targetTab) targetTab.classList.add('active');
    if (targetButton) targetButton.classList.add('active');
}

function selectTaskType(taskType) {
    selectedTaskType = taskType;
    const taskProcessor = document.getElementById('task-processor');
    const taskTitle = document.getElementById('selected-task-title');
    
    const taskTitles = {
        'summarize': '📝 AI Content Summarizer',
        'rewrite': '✏️ AI Text Rewriter', 
        'generate-copy': '💡 AI Copy Generator',
        'insights': '📊 AI Business Insights'
    };
    
    taskTitle.textContent = taskTitles[taskType] || 'Selected Task';
    taskProcessor.style.display = 'block';
    taskProcessor.scrollIntoView({ behavior: 'smooth' });
}

function resetTaskSelection() {
    selectedTaskType = null;
    const taskProcessor = document.getElementById('task-processor');
    taskProcessor.style.display = 'none';
}

function createNewWorkflow() {
    const canvas = document.getElementById('workflow-canvas');
    canvas.innerHTML = `
        <div class="workflow-builder-interface">
            <div class="workflow-header">
                <input type="text" placeholder="Enter workflow name..." class="workflow-name-input" id="workflow-name">
                <button onclick="alert('Workflow Builder Coming Soon! 🚀')" class="btn-primary">💾 Save Workflow</button>
            </div>
            <div class="workflow-steps">
                <div class="step-builder">
                    <h4>🔧 Build Your Workflow Steps</h4>
                    <div class="available-steps">
                        <div class="step-option" onclick="alert('AI Processing step selected! 🤖')">
                            <span class="step-icon">🤖</span> AI Processing
                        </div>
                        <div class="step-option" onclick="alert('Email step selected! 📧')">
                            <span class="step-icon">📧</span> Send Email
                        </div>
                        <div class="step-option" onclick="alert('Logic step selected! 🔀')">
                            <span class="step-icon">🔀</span> Conditional Logic
                        </div>
                    </div>
                </div>
                <div class="workflow-steps-list">
                    <div class="workflow-placeholder-mini">
                        <p>✨ Advanced workflow builder coming soon!</p>
                        <p>For now, use Quick Tasks for instant AI automation</p>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function useTemplate(templateName) {
    const templates = {
        'lead-processing': 'Lead Processing Automation - Score and follow up with leads automatically',
        'content-creation': 'Content Pipeline - Generate blog posts and social media content',
        'customer-onboarding': 'Customer Onboarding - Welcome new customers with automated sequences',
        'data-insights': 'Business Intelligence - Weekly reports with insights and recommendations'
    };
    
    alert(`🚀 Loading ${templates[templateName]}!\n\nThis template will help you automate your business processes.`);
    showAutomationTab('workflow-builder');
    setTimeout(createNewWorkflow, 100);
}

function showWorkflowTemplates() {
    showAutomationTab('templates');
}

function loadScheduledTasks() {
    alert('📅 Schedule Management coming soon!\n\nFor now, you can use Quick Tasks for immediate AI processing.');
}

// AI-Powered Quick Actions Menu System
let quickActionsVisible = false;
let currentQuickActions = [];

// Initialize quick actions menu
function initializeQuickActions() {
    // Add floating action button
    const quickActionButton = document.createElement('div');
    quickActionButton.id = 'quick-action-button';
    quickActionButton.className = 'quick-action-fab';
    quickActionButton.innerHTML = `
        <div class="fab-icon">⚡</div>
        <div class="fab-label">Quick Actions</div>
    `;
    quickActionButton.onclick = toggleQuickActionsMenu;
    document.body.appendChild(quickActionButton);

    // Add quick actions menu container
    const quickActionsMenu = document.createElement('div');
    quickActionsMenu.id = 'quick-actions-menu';
    quickActionsMenu.className = 'quick-actions-menu hidden';
    document.body.appendChild(quickActionsMenu);

    // Load initial contextual actions
    loadContextualActions();
    
    // Auto-refresh actions based on user context
    setInterval(refreshContextualActions, 30000); // Every 30 seconds
}

function toggleQuickActionsMenu() {
    const menu = document.getElementById('quick-actions-menu');
    const button = document.getElementById('quick-action-button');
    
    if (quickActionsVisible) {
        menu.classList.add('hidden');
        button.classList.remove('active');
        quickActionsVisible = false;
    } else {
        menu.classList.remove('hidden');
        button.classList.add('active');
        quickActionsVisible = true;
        loadContextualActions(); // Refresh actions when opened
    }
}

async function loadContextualActions() {
    try {
        const contextData = gatherUserContext();
        
        const response = await fetch('/api/quick-actions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(contextData)
        });

        if (response.ok) {
            const result = await response.json();
            currentQuickActions = result.actions || [];
            renderQuickActions();
        } else {
            // Use fallback actions if API fails
            currentQuickActions = getFallbackActions();
            renderQuickActions();
        }
    } catch (error) {
        console.error('Error loading quick actions:', error);
        currentQuickActions = getFallbackActions();
        renderQuickActions();
    }
}

function gatherUserContext() {
    return {
        currentPage: getCurrentPageContext(),
        businessType: 'small_business',
        selectedText: getSelectedText(),
        recentActions: getRecentUserActions(),
        businessGoals: ['growth', 'efficiency', 'automation']
    };
}

function getCurrentPageContext() {
    const currentView = document.querySelector('main').innerHTML;
    if (currentView.includes('automation-hub')) return 'automation';
    if (currentView.includes('analytics-dashboard')) return 'analytics';
    if (currentView.includes('roi-dashboard')) return 'roi';
    return 'dashboard';
}

function getSelectedText() {
    return window.getSelection().toString().substring(0, 100);
}

function getRecentUserActions() {
    // Track recent actions from localStorage
    return JSON.parse(localStorage.getItem('recentActions') || '[]').slice(0, 5);
}

function renderQuickActions() {
    const menu = document.getElementById('quick-actions-menu');
    if (!menu) return;

    const highPriorityActions = currentQuickActions
        .filter(action => action.priority >= 7)
        .sort((a, b) => b.priority - a.priority)
        .slice(0, 6);

    menu.innerHTML = `
        <div class="quick-actions-header">
            <h3>⚡ Smart Quick Actions</h3>
            <p>AI-recommended based on your current context</p>
            <button class="close-btn" onclick="toggleQuickActionsMenu()">×</button>
        </div>
        <div class="quick-actions-grid">
            ${highPriorityActions.map(action => `
                <div class="quick-action-card" onclick="executeQuickAction('${action.action}', '${action.title}')" data-category="${action.category}">
                    <div class="action-icon">${action.icon}</div>
                    <div class="action-content">
                        <h4>${action.title}</h4>
                        <p>${action.description}</p>
                        <div class="action-meta">
                            <span class="time-estimate">${action.estimatedTime}</span>
                            <span class="impact-badge impact-${action.businessImpact}">${action.businessImpact} impact</span>
                        </div>
                    </div>
                </div>
            `).join('')}
        </div>
        <div class="quick-actions-footer">
            <button onclick="showAllQuickActions()" class="btn-secondary">View All Actions</button>
            <button onclick="refreshContextualActions()" class="btn-primary">🔄 Refresh</button>
        </div>
    `;
}

async function executeQuickAction(actionType, actionTitle) {
    // Track the action
    trackUserAction(actionType);
    
    // Close the menu
    toggleQuickActionsMenu();
    
    // Execute the action based on type
    switch (actionType) {
        case 'summarize':
            showAutomationHub();
            setTimeout(() => selectTaskType('summarize'), 500);
            break;
        case 'generate-copy':
            showAutomationHub();
            setTimeout(() => selectTaskType('generate-copy'), 500);
            break;
        case 'insights':
            showAutomationHub();
            setTimeout(() => selectTaskType('insights'), 500);
            break;
        case 'rewrite':
            showAutomationHub();
            setTimeout(() => selectTaskType('rewrite'), 500);
            break;
        case 'email-draft':
            showAutomationHub();
            setTimeout(() => {
                selectTaskType('generate-copy');
                document.getElementById('task-input').placeholder = 'Describe the email you want to create...';
            }, 500);
            break;
        case 'social-media':
            showAutomationHub();
            setTimeout(() => {
                selectTaskType('generate-copy');
                document.getElementById('task-input').placeholder = 'Describe your social media post...';
            }, 500);
            break;
        default:
            alert(`🚀 Executing: ${actionTitle}\n\nThis will help automate your business processes!`);
    }
}

function trackUserAction(action) {
    const recentActions = JSON.parse(localStorage.getItem('recentActions') || '[]');
    recentActions.unshift(action);
    localStorage.setItem('recentActions', JSON.stringify(recentActions.slice(0, 10)));
}

function refreshContextualActions() {
    loadContextualActions();
    alert('🔄 Quick actions refreshed based on your current context!');
}

function showAllQuickActions() {
    const menu = document.getElementById('quick-actions-menu');
    menu.innerHTML = `
        <div class="quick-actions-header">
            <h3>📋 All Quick Actions</h3>
            <button class="close-btn" onclick="toggleQuickActionsMenu()">×</button>
        </div>
        <div class="actions-by-category">
            ${renderActionsByCategory()}
        </div>
        <div class="quick-actions-footer">
            <button onclick="loadContextualActions(); renderQuickActions();" class="btn-primary">← Back to Smart Actions</button>
        </div>
    `;
}

function renderActionsByCategory() {
    const categories = {
        'content': { name: 'Content Creation', icon: '📝' },
        'marketing': { name: 'Marketing', icon: '📈' },
        'operations': { name: 'Operations', icon: '⚙️' },
        'analysis': { name: 'Analysis', icon: '📊' },
        'communication': { name: 'Communication', icon: '💬' }
    };

    return Object.entries(categories).map(([category, info]) => {
        const categoryActions = currentQuickActions.filter(action => action.category === category);
        if (categoryActions.length === 0) return '';

        return `
            <div class="category-section">
                <h4>${info.icon} ${info.name}</h4>
                <div class="category-actions">
                    ${categoryActions.map(action => `
                        <div class="mini-action-card" onclick="executeQuickAction('${action.action}', '${action.title}')">
                            <span class="mini-icon">${action.icon}</span>
                            <span class="mini-title">${action.title}</span>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }).join('');
}

function getFallbackActions() {
    return [
        {
            id: "content_summarize",
            title: "📝 Summarize Content",
            description: "Quickly summarize long documents or articles",
            icon: "📝",
            category: "content",
            priority: 8,
            action: "summarize",
            estimatedTime: "2-5 min",
            businessImpact: "medium"
        },
        {
            id: "marketing_copy",
            title: "💡 Generate Marketing Copy",
            description: "Create compelling marketing content",
            icon: "💡",
            category: "marketing",
            priority: 9,
            action: "generate-copy",
            estimatedTime: "5-10 min",
            businessImpact: "high"
        },
        {
            id: "business_insights",
            title: "📊 Business Analysis",
            description: "Get insights from your business data",
            icon: "📊",
            category: "analysis",
            priority: 7,
            action: "insights",
            estimatedTime: "10-15 min",
            businessImpact: "high"
        }
    ];
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(initializeQuickActions, 1000);
});

function showAnalyticsDashboard() {
    console.log('Showing analytics dashboard');
    const dashboard = document.getElementById('dashboard');
    
    if (dashboard) dashboard.style.display = 'none';
    
    // Create analytics dashboard content if it doesn't exist
    const main = document.querySelector('main');
    main.innerHTML = `
        <div id="analytics-dashboard" class="analytics-dashboard">
            <div class="dashboard-header">
                <h2>📊 Analytics & Insights Dashboard</h2>
                <p>Track your business automation performance and growth metrics</p>
                <button onclick="showDashboard()" class="btn-secondary">← Back to Dashboard</button>
            </div>
            <div class="metrics-grid">
                <div class="metric-card">
                    <div class="metric-icon">⚡</div>
                    <div class="metric-data">
                        <span class="metric-value">5</span>
                        <span class="metric-label">Active Automations</span>
                    </div>
                </div>
                <div class="metric-card">
                    <div class="metric-icon">💰</div>
                    <div class="metric-data">
                        <span class="metric-value">$2,500</span>
                        <span class="metric-label">Monthly Savings</span>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function showROIDashboard() {
    console.log('Showing ROI dashboard');
    const dashboard = document.getElementById('dashboard');
    
    if (dashboard) dashboard.style.display = 'none';
    
    // Create ROI dashboard content
    const main = document.querySelector('main');
    main.innerHTML = `
        <div id="roi-dashboard" class="roi-dashboard">
            <div class="dashboard-header">
                <h2>💰 ROI Tracking Dashboard</h2>
                <p>Monitor your automation investment returns and business impact</p>
                <button onclick="showDashboard()" class="btn-secondary">← Back to Dashboard</button>
            </div>
            <div class="roi-overview">
                <div class="roi-card">
                    <h3>Total ROI</h3>
                    <div class="roi-value">
                        <span class="roi-percentage">245%</span>
                        <span class="roi-trend positive">↗ +15%</span>
                    </div>
                </div>
                <div class="roi-metrics">
                    <div class="metric-item">
                        <span class="metric-label">Monthly Savings</span>
                        <span class="metric-value">$2,500</span>
                    </div>
                    <div class="metric-item">
                        <span class="metric-label">Time Recovered</span>
                        <span class="metric-value">40 hrs/month</span>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function showOnboardingWorkflows() {
    console.log('Showing onboarding workflows');
    const dashboard = document.getElementById('dashboard');
    const onboardingSection = document.getElementById('onboarding-workflows');
    
    if (dashboard) dashboard.style.display = 'none';
    if (onboardingSection) onboardingSection.style.display = 'block';
}