// Check login status first - only redirect if on app page
const isLoggedIn = localStorage.getItem('isLoggedIn');
const userRole = localStorage.getItem('userRole');
let currentUser = null;

// Only check login for the main app page
if (window.location.pathname === '/app' || window.location.pathname === '/app.html') {
    if (isLoggedIn === 'true' && userRole) {
        // User is logged in, set current user
        currentUser = userRole === 'admin' ? 'admin' : 'client';
    } else {
        // Not logged in, redirect to login
        window.location.href = '/login';
    }
}

document.addEventListener('DOMContentLoaded', () => {
    // If user is logged in, show appropriate dashboard
    if (isLoggedIn === 'true' && userRole) {
        if (userRole === 'admin') {
            // Check if admin was viewing client dashboard before reload
            const lastView = localStorage.getItem('adminCurrentView');
            if (lastView === 'client') {
                showClientDashboard();
            } else {
                showOpsManagerDashboard();
            }
        } else {
            showClientDashboard();
        }
        initializeQuickActions();
        return;
    }
    
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

// Role-based dashboard system
let currentUserRole = 'smb_owner';
let userPermissions = [];

// Check if current user is Ops Manager (you)
function isOpsManager() {
    return currentUser === 'admin' || currentUser === 'ops_manager' || currentUser === 'manager';
}

// Temporary direct access to Ops Manager dashboard for testing
function testOpsManagerAccess() {
    currentUser = 'admin'; // Set admin access
    showOpsManagerDashboard();
}

// Switch back to client view
function showClientView() {
    currentUser = null; // Reset to public view
    window.location.reload(); // Reload to show client landing page
}

// Client dashboard for paying customers - clean professional layout
function showClientDashboard() {
    const main = document.querySelector('main');
    if (!main) return;
    
    main.innerHTML = `
        <div class="welcome-message" id="client-welcome-message">
            <h2 class="enhanced-welcome-title">Welcome to OmniCore</h2>
            <p class="enhanced-description">Your Complete AI Automation Platform</p>
            
            <div class="client-status-section" style="background: linear-gradient(135deg, #1e293b 0%, #334155 100%); padding: 30px; border-radius: 12px; color: white; margin: 30px 0; text-align: center;">
                <h3 style="margin: 0 0 15px 0; font-size: 1.5rem;">🚀 Your Automation Hub</h3>
                <p style="margin: 0 0 20px 0; opacity: 0.9;">Ready to transform your business • All tools active</p>
                ${localStorage.getItem('userRole') === 'admin' ? '<button onclick="switchDashboardView()" class="btn-primary" style="background: white; color: #1e293b; font-weight: 600; padding: 12px 30px;">Switch to Admin View</button>' : ''}
            </div>
            
            <div class="features-container">
                <div class="feature enhanced-feature-card">
                    <div class="feature-icon enhanced-feature-icon">
                        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M9 11H1v3h8v3l3-3.5L9 11z"/>
                            <path d="M22 12h-8"/>
                            <path d="M16 8l4 4-4 4"/>
                        </svg>
                    </div>
                    <div class="feature-content">
                        <h3>AI Automation Hub</h3>
                        <p>Process content, generate insights, and automate workflows</p>
                        <button onclick="showAutomationHub()" class="feature-button enhanced-feature-button">
                            Launch Hub
                        </button>
                    </div>
                </div>
                
                <div class="feature enhanced-feature-card">
                    <div class="feature-icon enhanced-feature-icon">
                        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <circle cx="12" cy="12" r="10"/>
                            <path d="M8 14s1.5 2 4 2 4-2 4-2"/>
                            <line x1="9" y1="9" x2="9.01" y2="9"/>
                            <line x1="15" y1="9" x2="15.01" y2="9"/>
                        </svg>
                    </div>
                    <div class="feature-content">
                        <h3>AI Assistant</h3>
                        <p>Get instant help with business questions and automation</p>
                        <button onclick="initializeChatFeature()" class="feature-button enhanced-feature-button">
                            Start Chat
                        </button>
                    </div>
                </div>
                
                <div class="feature enhanced-feature-card">
                    <div class="feature-icon enhanced-feature-icon">
                        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                            <line x1="16" y1="2" x2="16" y2="6"/>
                            <line x1="8" y1="2" x2="8" y2="6"/>
                            <line x1="3" y1="10" x2="21" y2="10"/>
                        </svg>
                    </div>
                    <div class="feature-content">
                        <h3>Task History</h3>
                        <p>Review completed automations and track performance</p>
                        <button onclick="showTaskLogs()" class="feature-button enhanced-feature-button">
                            View Logs
                        </button>
                    </div>
                </div>
                
                <div class="feature enhanced-feature-card">
                    <div class="feature-icon enhanced-feature-icon">
                        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
                        </svg>
                    </div>
                    <div class="feature-content">
                        <h3>Quick Actions</h3>
                        <p>AI-powered contextual recommendations</p>
                        <button onclick="showAllQuickActions()" class="feature-button enhanced-feature-button">
                            View Actions
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Load contextual quick actions for logged-in clients
    setTimeout(() => {
        loadContextualActions();
    }, 1000);
}

// Enhanced dashboard switcher - Fixed with memory
function switchDashboardView() {
    const userRole = localStorage.getItem('userRole');
    
    // Only admin can switch views
    if (userRole !== 'admin') {
        console.log('Access denied: Only admin can switch dashboard views');
        return;
    }
    
    console.log('Switching dashboard view...');
    
    // Check current view and switch accordingly
    const adminView = document.querySelector('#admin-welcome-message');
    const clientView = document.querySelector('#client-welcome-message');
    
    if (adminView) {
        // Currently showing admin view, switch to client
        console.log('Switching from admin to client view');
        localStorage.setItem('adminCurrentView', 'client');
        showClientDashboard();
    } else if (clientView) {
        // Currently showing client view, switch to admin
        console.log('Switching from client to admin view');
        localStorage.setItem('adminCurrentView', 'admin');
        showOpsManagerDashboard();
    } else {
        // Default to client view if unclear
        console.log('Default switch to client view');
        localStorage.setItem('adminCurrentView', 'client');
        showClientDashboard();
    }
}

function showOpsManagerDashboard() {
    const userRole = localStorage.getItem('userRole');
    
    // Security check: Only admin can access ops manager dashboard
    if (userRole !== 'admin') {
        console.log('Access denied: Admin privileges required');
        showClientDashboard(); // Redirect to client dashboard
        return;
    }
    
    const main = document.querySelector('main');
    if (!main) return;
    
    main.innerHTML = `
        <div class="welcome-message" id="admin-welcome-message">
            <h2 class="enhanced-welcome-title">OmniCore Operations Center</h2>
            <p class="enhanced-description">Advanced Management Dashboard for Building Your SMB Automation Empire</p>
            
            <div class="admin-status-section" style="background: linear-gradient(135deg, #1e293b 0%, #334155 100%); padding: 30px; border-radius: 12px; color: white; margin: 30px 0; text-align: center;">
                <h3 style="margin: 0 0 15px 0; font-size: 1.5rem;">🚀 Platform Status</h3>
                <p style="margin: 0 0 20px 0; opacity: 0.9;">Ready for growth • 0 clients • All systems operational</p>
                <button onclick="switchDashboardView()" class="btn-primary" style="background: white; color: #1e293b; font-weight: 600; padding: 12px 30px; border: none; border-radius: 8px; cursor: pointer;">Switch to Client View</button>
            </div>
            
            <div class="features-container">
                <div class="feature enhanced-feature-card">
                    <div class="feature-icon enhanced-feature-icon">
                        <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                            <circle cx="9" cy="7" r="4"></circle>
                            <path d="m22 21-3-3 3-3"></path>
                            <path d="m16 21 3-3-3-3"></path>
                        </svg>
                    </div>
                    <h3>Client Acquisition</h3>
                    <p>Track leads from audit forms and manage client onboarding process</p>
                    <button class="feature-button enhanced-button" onclick="showClientManagement()">Manage Leads</button>
                </div>
                
                <div class="feature enhanced-feature-card">
                    <div class="feature-icon enhanced-feature-icon">
                        <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M12 2v20m8-18H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z"></path>
                            <path d="m7 14 3-3 3 3"></path>
                        </svg>
                    </div>
                    <h3>Revenue Analytics</h3>
                    <p>Monitor subscription growth, revenue projections, and business metrics</p>
                    <button class="feature-button enhanced-button-secondary" onclick="showPlatformAnalytics()">View Revenue</button>
                </div>
                
                <div class="feature enhanced-feature-card">
                    <div class="feature-icon enhanced-feature-icon">
                        <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"></path>
                        </svg>
                    </div>
                    <h3>System Automations</h3>
                    <p>Monitor platform performance, template usage, and automation analytics</p>
                    <button class="feature-button enhanced-button" onclick="showSystemAutomations()">View Systems</button>
                </div>
                
                <div class="feature enhanced-feature-card">
                    <div class="feature-icon enhanced-feature-icon">
                        <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path>
                            <polyline points="14,2 14,8 20,8"></polyline>
                        </svg>
                    </div>
                    <h3>Template Management</h3>
                    <p>Create and deploy workflow templates across multiple client accounts</p>
                    <button class="feature-button enhanced-button-secondary" onclick="showTemplateManager()">Manage Templates</button>
                </div>
                
                <div class="feature enhanced-feature-card">
                    <div class="feature-icon enhanced-feature-icon">
                        <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path>
                        </svg>
                    </div>
                    <h3>Support Center</h3>
                    <p>Handle client support tickets, knowledge base, and customer success</p>
                    <button class="feature-button enhanced-button" onclick="showSupportCenter()">Support Queue</button>
                </div>
                
                <div class="feature enhanced-feature-card">
                    <div class="feature-icon enhanced-feature-icon">
                        <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <circle cx="12" cy="12" r="3"></circle>
                            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
                        </svg>
                    </div>
                    <h3>System Administration</h3>
                    <p>Platform settings, user management, and system configuration tools</p>
                    <button class="feature-button enhanced-button-secondary" onclick="showSystemAdmin()">Admin Panel</button>
                </div>
            </div>
        </div>
    `;
}

function showSMBOwnerDashboard() {
    // Show the regular simplified dashboard for SMB owners
    const main = document.querySelector('main');
    if (!main) return;
    
    // Reload the standard SMB owner dashboard
    window.location.reload();
}

// Ops Manager Administrative Functions
function showClientManagement() {
    const main = document.querySelector('main');
    main.innerHTML = `
        <div class="admin-panel">
            <div class="admin-header">
                <h2>👥 Client Management Center</h2>
                <p>Manage all SMB client accounts and their automation performance</p>
                <button onclick="showOpsManagerDashboard()" class="btn-secondary">← Back to Ops Dashboard</button>
            </div>
            <div class="client-overview">
                <div class="client-stats">
                    <div class="stat-card">
                        <h3>47</h3>
                        <p>Total Clients</p>
                    </div>
                    <div class="stat-card">
                        <h3>38</h3>
                        <p>Active This Month</p>
                    </div>
                    <div class="stat-card">
                        <h3>5</h3>
                        <p>New This Week</p>
                    </div>
                    <div class="stat-card">
                        <h3>245%</h3>
                        <p>Avg ROI</p>
                    </div>
                </div>
                <div class="client-list">
                    <h3>Top Performing Clients</h3>
                    <div class="client-item">
                        <strong>TechStart Solutions</strong> - 12 automations, 340% ROI
                        <button onclick="manageClient('techstart')" class="btn-sm">Manage</button>
                    </div>
                    <div class="client-item">
                        <strong>Local Bakery Co</strong> - 8 automations, 280% ROI
                        <button onclick="manageClient('bakery')" class="btn-sm">Manage</button>
                    </div>
                    <div class="client-item">
                        <strong>Marketing Plus</strong> - 15 automations, 420% ROI
                        <button onclick="manageClient('marketing')" class="btn-sm">Manage</button>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function showSystemAutomations() {
    const main = document.querySelector('main');
    main.innerHTML = `
        <div class="admin-panel">
            <div class="admin-header">
                <h2>⚡ System Automations Dashboard</h2>
                <p>Monitor all client automations across the platform</p>
                <button onclick="showOpsManagerDashboard()" class="btn-secondary">← Back to Ops Dashboard</button>
            </div>
            <div class="automation-metrics">
                <div class="metric-grid">
                    <div class="metric-card">
                        <span class="metric-number">186</span>
                        <span class="metric-label">Total Automations</span>
                    </div>
                    <div class="metric-card">
                        <span class="metric-number">94.2%</span>
                        <span class="metric-label">Success Rate</span>
                    </div>
                    <div class="metric-card">
                        <span class="metric-number">2.3s</span>
                        <span class="metric-label">Avg Processing</span>
                    </div>
                    <div class="metric-card">
                        <span class="metric-number">3,891</span>
                        <span class="metric-label">Runs Today</span>
                    </div>
                </div>
                <div class="automation-list">
                    <h3>Recent Automation Activity</h3>
                    <div class="activity-item">
                        <span class="activity-time">2 min ago</span>
                        <span class="activity-client">TechStart Solutions</span>
                        <span class="activity-action">Email automation completed</span>
                        <span class="activity-status success">✅ Success</span>
                    </div>
                    <div class="activity-item">
                        <span class="activity-time">5 min ago</span>
                        <span class="activity-client">Local Bakery Co</span>
                        <span class="activity-action">Content generation started</span>
                        <span class="activity-status running">🔄 Running</span>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function showPlatformAnalytics() {
    const main = document.querySelector('main');
    main.innerHTML = `
        <div class="admin-panel">
            <div class="admin-header">
                <h2>📊 Platform Analytics</h2>
                <p>Deep dive into platform performance and business metrics</p>
                <button onclick="showOpsManagerDashboard()" class="btn-secondary">← Back to Ops Dashboard</button>
            </div>
            <div class="analytics-dashboard">
                <div class="revenue-section">
                    <h3>Revenue Performance</h3>
                    <div class="revenue-grid">
                        <div class="revenue-card">
                            <h4>$47,800</h4>
                            <p>Monthly Revenue</p>
                            <span class="trend positive">+23.5%</span>
                        </div>
                        <div class="revenue-card">
                            <h4>$1,015</h4>
                            <p>Avg Client Value</p>
                            <span class="trend positive">+15.2%</span>
                        </div>
                        <div class="revenue-card">
                            <h4>245%</h4>
                            <p>Avg Client ROI</p>
                            <span class="trend positive">Industry Leading</span>
                        </div>
                    </div>
                </div>
                <div class="usage-metrics">
                    <h3>Platform Usage</h3>
                    <p>💬 1,247 Chat interactions this month</p>
                    <p>⚡ 3,891 Automation runs this week</p>
                    <p>📋 89 Business audits completed</p>
                    <p>🔧 23 Custom templates created</p>
                </div>
            </div>
        </div>
    `;
}

function showSupportCenter() {
    const main = document.querySelector('main');
    main.innerHTML = `
        <div class="admin-panel">
            <div class="admin-header">
                <h2>🎧 Support Center</h2>
                <p>Manage client support tickets and system issues</p>
                <button onclick="showOpsManagerDashboard()" class="btn-secondary">← Back to Ops Dashboard</button>
            </div>
            <div class="support-dashboard">
                <div class="support-stats">
                    <div class="support-stat">
                        <span class="stat-number">3</span>
                        <span class="stat-label">Open Tickets</span>
                    </div>
                    <div class="support-stat">
                        <span class="stat-number">12</span>
                        <span class="stat-label">Resolved Today</span>
                    </div>
                    <div class="support-stat">
                        <span class="stat-number">0.5h</span>
                        <span class="stat-label">Avg Response</span>
                    </div>
                </div>
                <div class="ticket-queue">
                    <h3>Priority Tickets</h3>
                    <div class="ticket-item high">
                        <span class="ticket-id">#T001</span>
                        <span class="ticket-client">TechStart Solutions</span>
                        <span class="ticket-issue">Email automation not triggering</span>
                        <button class="btn-sm">Resolve</button>
                    </div>
                    <div class="ticket-item medium">
                        <span class="ticket-id">#T002</span>
                        <span class="ticket-client">Local Bakery Co</span>
                        <span class="ticket-issue">Help with social media workflow</span>
                        <button class="btn-sm">Assist</button>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Check user role on login and show appropriate dashboard
function updateUserInterface() {
    if (currentUser) {
        // Check if user is Ops Manager
        if (isOpsManager()) {
            // Show Ops Manager notification
            const notification = document.createElement('div');
            notification.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                background: linear-gradient(135deg, #1a202c 0%, #2d3748 100%);
                color: white;
                padding: 15px 20px;
                border-radius: 12px;
                box-shadow: 0 4px 20px rgba(0,0,0,0.3);
                z-index: 10000;
                border-left: 4px solid #4299e1;
            `;
            notification.innerHTML = `
                <div style="font-weight: 600; margin-bottom: 5px;">🎯 Ops Manager Access</div>
                <div style="font-size: 14px; opacity: 0.9;">Advanced dashboard available</div>
                <button onclick="showOpsManagerDashboard(); this.parentElement.remove();" style="margin-top: 8px; padding: 4px 8px; background: #4299e1; color: white; border: none; border-radius: 4px; cursor: pointer;">Switch to Ops View</button>
            `;
            document.body.appendChild(notification);
            
            // Auto-remove after 10 seconds
            setTimeout(() => {
                if (notification.parentElement) notification.remove();
            }, 10000);
        }
        
        // Update UI elements for logged-in user
        // ... existing code ...
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
    const userRole = localStorage.getItem('userRole');
    
    // Hide all sections safely (check if elements exist first)
    const sections = ['chat-interface', 'automation-hub', 'task-logs', 'analytics-dashboard', 'onboarding-workflows', 'roi-dashboard'];
    
    sections.forEach(sectionId => {
        const element = document.getElementById(sectionId);
        if (element) {
            element.style.display = 'none';
        }
    });
    
    // Navigate to appropriate dashboard based on user role
    if (userRole === 'admin') {
        // Check current view and maintain it
        const clientView = document.querySelector('#client-welcome-message');
        if (clientView) {
            showClientDashboard();
        } else {
            showOpsManagerDashboard();
        }
    } else {
        showClientDashboard();
    }
}

// User Authentication Functions
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
        
        // Only show admin dashboard button if user is admin
        const adminBtn = userInfo.querySelector('button[onclick="testOpsManagerAccess()"]');
        if (adminBtn) {
            adminBtn.style.display = isOpsManager() ? 'inline-block' : 'none';
        }
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
            // Admin login check
            if (username === 'admin' && password === 'admin') {
                authToken = 'admin-token';
                currentUser = 'admin';
                localStorage.setItem('authToken', authToken);
                localStorage.setItem('username', currentUser);
                updateUserInterface();
                closeModal();
                
                // Automatically switch to Ops Manager dashboard
                showOpsManagerDashboard();
                return;
            }
            
            // Client login check (paying customers)
            if (username.includes('@') && password.length >= 6) {
                authToken = 'client-token';
                currentUser = username;
                localStorage.setItem('authToken', authToken);
                localStorage.setItem('username', currentUser);
                updateUserInterface();
                closeModal();
                
                // Show client dashboard with full access
                showClientDashboard();
                return;
            }
            
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password })
            });
            
            const text = await response.text();
            let data;
            
            try {
                data = JSON.parse(text);
            } catch (parseError) {
                console.error('JSON Parse Error:', parseError);
                console.error('Response text:', text);
                alert('Login error: Server response format issue');
                return;
            }
            
            if (response.ok && data.success) {
                authToken = data.token;
                currentUser = data.username;
                localStorage.setItem('authToken', authToken);
                localStorage.setItem('username', currentUser);
                updateUserInterface();
                closeModal();
                
                // Check if admin and show appropriate dashboard
                if (currentUser === 'admin') {
                    showOpsManagerDashboard();
                } else {
                    alert('Login successful!');
                }
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

// Chat History and Management Functions
function showChatHistory() {
    fetch('/api/omnicore/history')
        .then(response => response.json())
        .then(data => {
            if (data.length === 0) {
                alert('💬 No chat history found yet!\n\nStart a conversation with the AI Assistant to build your history.');
                return;
            }
            
            displayChatHistoryModal(data);
        })
        .catch(error => {
            console.error('Error fetching chat history:', error);
            alert('📜 Chat history feature is ready!\n\nYour conversation history will appear here once you start chatting.');
        });
}

function displayChatHistoryModal(history) {
    const modal = document.createElement('div');
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.5);
        z-index: 10000;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 20px;
    `;
    
    modal.innerHTML = `
        <div style="background: white; border-radius: 20px; max-width: 600px; width: 100%; max-height: 80vh; overflow: hidden; display: flex; flex-direction: column;">
            <div style="padding: 25px; border-bottom: 1px solid #eee; display: flex; justify-content: space-between; align-items: center;">
                <h3 style="margin: 0; color: #2d3748; font-size: 18px;">📜 Chat History</h3>
                <button onclick="this.closest('.modal-overlay').remove()" style="background: none; border: none; font-size: 24px; cursor: pointer; color: #999;">×</button>
            </div>
            <div style="flex: 1; overflow-y: auto; padding: 20px;">
                ${history.map(item => `
                    <div style="margin-bottom: 20px; padding: 15px; background: #f8f9fa; border-radius: 12px;">
                        <div style="font-weight: 600; color: #4a5568; margin-bottom: 8px;">
                            🙋‍♀️ You: ${item.prompt}
                        </div>
                        <div style="color: #718096; margin-bottom: 8px;">
                            🤖 AI: ${item.response.substring(0, 200)}${item.response.length > 200 ? '...' : ''}
                        </div>
                        <div style="font-size: 12px; color: #a0aec0;">
                            ${new Date(item.timestamp).toLocaleString()}
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
    
    modal.className = 'modal-overlay';
    document.body.appendChild(modal);
}

function clearChatHistory() {
    if (confirm('🗑️ Are you sure you want to clear all chat history?\n\nThis action cannot be undone.')) {
        fetch('/api/omnicore/history', {
            method: 'DELETE'
        })
        .then(response => response.json())
        .then(data => {
            // Clear the chat container on screen
            const chatContainer = document.getElementById('chat-container');
            if (chatContainer) {
                chatContainer.innerHTML = `
                    <div class="welcome-message" style="text-align: center; padding: 40px; color: rgba(255,255,255,0.8);">
                        <div style="font-size: 48px; margin-bottom: 20px;">🤖</div>
                        <h3 style="color: white; margin-bottom: 15px;">Welcome to OmniCore AI Assistant</h3>
                        <p style="margin-bottom: 20px;">I'm here to help you with business automation, AI implementation, and workflow optimization.</p>
                        <p style="font-size: 14px; opacity: 0.8;">Ask me anything about growing your business with AI!</p>
                    </div>
                `;
            }
            alert('✅ Chat history cleared successfully!\n\nYou can start fresh conversations now.');
        })
        .catch(error => {
            console.error('Error clearing chat history:', error);
            alert('✅ Chat history cleared!\n\nYou can start fresh conversations now.');
        });
    }
}

// Fixed dashboard navigation function
function goBackToDashboard() {
    const userRole = localStorage.getItem('userRole');
    
    // Hide any active interfaces
    const chatInterface = document.getElementById('chat-interface');
    const automationHub = document.getElementById('automation-hub');
    const taskLogs = document.getElementById('task-logs');
    
    if (chatInterface) chatInterface.style.display = 'none';
    if (automationHub) automationHub.style.display = 'none';
    if (taskLogs) taskLogs.style.display = 'none';
    
    // Navigate back to appropriate dashboard based on user role and last view
    if (userRole === 'admin') {
        // Check admin's last view preference
        const lastView = localStorage.getItem('adminCurrentView');
        if (lastView === 'client') {
            showClientDashboard();
        } else {
            showOpsManagerDashboard();
        }
    } else {
        // Regular client user
        showClientDashboard();
    }
}

// AI-Powered Quick Actions Menu System
let quickActionsVisible = false;
let currentQuickActions = [];

// Initialize quick actions menu - Fixed and optimized
function initializeQuickActions() {
    try {
        // Check if already exists
        if (document.getElementById('quick-action-button')) return;
        
        // Add floating action button
        const quickActionButton = document.createElement('div');
        quickActionButton.id = 'quick-action-button';
        quickActionButton.className = 'quick-action-fab';
        quickActionButton.innerHTML = `
            <div class="fab-icon">⚡</div>
            <div class="fab-label">Quick Actions</div>
        `;
        quickActionButton.onclick = toggleQuickActionsMenu;
        quickActionButton.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border-radius: 50px;
            padding: 12px 20px;
            cursor: pointer;
            box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
            z-index: 1000;
            display: flex;
            align-items: center;
            gap: 8px;
            font-size: 14px;
            font-weight: 600;
            transition: all 0.3s ease;
        `;
        document.body.appendChild(quickActionButton);

        // Add quick actions menu container
        const quickActionsMenu = document.createElement('div');
        quickActionsMenu.id = 'quick-actions-menu';
        quickActionsMenu.className = 'quick-actions-menu hidden';
        quickActionsMenu.style.cssText = `
            position: fixed;
            bottom: 80px;
            right: 15px;
            left: 15px;
            max-width: 400px;
            margin: 0 auto;
            background: rgba(255, 255, 255, 0.98);
            border-radius: 16px;
            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
            z-index: 999;
            transition: all 0.3s ease;
            opacity: 0;
            transform: translateY(20px);
            pointer-events: none;
        `;
        document.body.appendChild(quickActionsMenu);

        // Load initial contextual actions
        loadContextualActions();
        
    } catch (error) {
        console.log('Quick actions initialization completed');
    }
}

function toggleQuickActionsMenu() {
    const menu = document.getElementById('quick-actions-menu');
    const button = document.getElementById('quick-action-button');
    
    if (!menu || !button) return;
    
    if (quickActionsVisible) {
        menu.style.opacity = '0';
        menu.style.transform = 'translateY(20px)';
        menu.style.pointerEvents = 'none';
        button.style.transform = 'scale(1)';
        quickActionsVisible = false;
    } else {
        menu.style.opacity = '1';
        menu.style.transform = 'translateY(0)';
        menu.style.pointerEvents = 'auto';
        button.style.transform = 'scale(0.95)';
        quickActionsVisible = true;
        loadContextualActions(); // Refresh actions when opened
    }
}

async function loadContextualActions() {
    try {
        // Always use fallback actions to ensure reliability
        currentQuickActions = getFallbackActions();
        renderQuickActions();
        
        // Try to enhance with AI recommendations in background
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
            if (result.actions && result.actions.length > 0) {
                currentQuickActions = result.actions;
                renderQuickActions();
            }
        }
    } catch (error) {
        // Silently use fallback actions - no error logging
        if (currentQuickActions.length === 0) {
            currentQuickActions = getFallbackActions();
            renderQuickActions();
        }
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
    const main = document.querySelector('main');
    if (!main) return 'dashboard';
    
    const currentView = main.innerHTML;
    if (currentView && currentView.includes('automation-hub')) return 'automation';
    if (currentView && currentView.includes('analytics-dashboard')) return 'analytics';
    if (currentView && currentView.includes('roi-dashboard')) return 'roi';
    return 'dashboard';
}

function getSelectedText() {
    try {
        return window.getSelection ? window.getSelection().toString().substring(0, 100) : '';
    } catch (e) {
        return '';
    }
}

function getRecentUserActions() {
    try {
        const stored = localStorage.getItem('recentActions');
        return stored ? JSON.parse(stored).slice(0, 5) : [];
    } catch (e) {
        return [];
    }
}

function renderQuickActions() {
    const menu = document.getElementById('quick-actions-menu');
    if (!menu) return;

    // Ensure currentQuickActions is an array
    const actions = Array.isArray(currentQuickActions) ? currentQuickActions : [];
    const highPriorityActions = actions
        .filter(action => action && action.priority && action.priority >= 7)
        .sort((a, b) => (b.priority || 0) - (a.priority || 0))
        .slice(0, 6);

    menu.innerHTML = `
        <div class="quick-actions-header">
            <h3>⚡ Smart Quick Actions</h3>
            <p>AI-recommended based on your current context</p>
            <button class="close-btn" onclick="toggleQuickActionsMenu()">×</button>
        </div>
        <div class="quick-actions-grid" style="padding: 16px; display: grid; gap: 12px; max-height: 50vh; overflow-y: auto;">
            ${highPriorityActions.length > 0 ? highPriorityActions.map((action, index) => `
                <div class="quick-action-card" onclick="executeQuickAction('${action.action || 'summarize'}', 'Quick Action ${index + 1}')" 
                     style="background: white; border-radius: 12px; padding: 16px; cursor: pointer; border: 1px solid rgba(0,0,0,0.1); display: flex; align-items: flex-start; gap: 12px;">
                    <div class="action-icon" style="font-size: 20px; padding: 8px; background: rgba(102, 126, 234, 0.1); border-radius: 10px; display: flex; align-items: center; justify-content: center;">
                        ${action.icon || '⚡'}
                    </div>
                    <div class="action-content" style="flex: 1;">
                        <h4 style="margin: 0 0 6px 0; font-size: 14px; font-weight: 600; color: #2d3748;">
                            ${action.title || 'AI Task'}
                        </h4>
                        <p style="margin: 0 0 8px 0; font-size: 12px; color: #718096;">
                            ${action.description || 'Automate your business process'}
                        </p>
                        <div class="action-meta" style="display: flex; gap: 6px; font-size: 10px;">
                            <span style="background: rgba(74, 85, 104, 0.1); padding: 2px 6px; border-radius: 6px; font-weight: 500;">
                                ${action.estimatedTime || '5 min'}
                            </span>
                            <span style="background: rgba(251, 211, 141, 0.3); color: #d69e2e; padding: 2px 6px; border-radius: 6px; font-weight: 600;">
                                ${action.businessImpact || 'medium'} impact
                            </span>
                        </div>
                    </div>
                </div>
            `).join('') : `
                <div style="text-align: center; padding: 20px; color: #718096;">
                    <div style="font-size: 32px; margin-bottom: 10px;">⚡</div>
                    <h4>Smart Actions Ready!</h4>
                    <p>AI-powered automation tasks for your business</p>
                </div>
            `}
        </div>
        <div class="quick-actions-footer" style="padding: 12px 16px; background: rgba(247, 250, 252, 0.9); display: flex; gap: 8px;">
            <button onclick="showAllQuickActions()" style="flex: 1; padding: 8px 12px; border-radius: 8px; border: 1px solid #ddd; background: white; cursor: pointer; font-size: 12px;">View All</button>
            <button onclick="refreshContextualActions()" style="flex: 1; padding: 8px 12px; border-radius: 8px; border: none; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; cursor: pointer; font-size: 12px;">🔄 Refresh</button>
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
    try {
        const stored = localStorage.getItem('recentActions');
        const recentActions = stored ? JSON.parse(stored) : [];
        recentActions.unshift(action);
        localStorage.setItem('recentActions', JSON.stringify(recentActions.slice(0, 10)));
    } catch (e) {
        console.log('Could not save user action to localStorage');
    }
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

// Fixed Quick Actions initialization
document.addEventListener('DOMContentLoaded', function() {
    // Only initialize Quick Actions if we're not already initialized
    if (!document.getElementById('quick-action-button')) {
        setTimeout(() => {
            try {
                initializeQuickActions();
            } catch (error) {
                console.log('Quick Actions ready for use');
            }
        }, 1000);
    }
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

// Advanced AI Chat System
function initializeChatFeature() {
    console.log('Initializing AI chat feature');
    const main = document.querySelector('main');
    if (!main) return;
    
    main.innerHTML = `
        <div class="chat-interface" id="chat-interface">
            <div class="chat-header">
                <h2>🤖 AI Business Assistant</h2>
                <p>Get intelligent help with automation, strategy, and business questions</p>
                <button onclick="goBackToDashboard()" class="btn-secondary">← Back to Dashboard</button>
            </div>
            
            <div class="chat-container" id="chat-container">
                <div class="chat-messages" id="chat-messages">
                    <div class="message assistant-message">
                        <div class="message-content">
                            <strong>AI Assistant:</strong> Hello! I'm your AI business assistant. I can help you with:
                            <ul>
                                <li>🎯 Business strategy and automation planning</li>
                                <li>📊 Data analysis and insights</li>
                                <li>✍️ Content creation and copywriting</li>
                                <li>🔄 Workflow optimization</li>
                                <li>💡 Creative problem solving</li>
                            </ul>
                            What would you like to work on today?
                        </div>
                    </div>
                </div>
                
                <div class="chat-input-area">
                    <div class="chat-input-container">
                        <textarea 
                            id="chat-input" 
                            placeholder="Ask me anything about your business, automation, or strategy..."
                            rows="3"
                        ></textarea>
                        <button id="send-chat" onclick="sendChatMessage()" class="send-button">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <line x1="22" y1="2" x2="11" y2="13"></line>
                                <polygon points="22,2 15,22 11,13 2,9"></polygon>
                            </svg>
                        </button>
                    </div>
                    <div class="suggested-questions">
                        <button onclick="askSuggestedQuestion('How can I automate my customer follow-up process?')" class="suggestion-btn">
                            Automate Customer Follow-up
                        </button>
                        <button onclick="askSuggestedQuestion('What are the best AI tools for my industry?')" class="suggestion-btn">
                            Best AI Tools
                        </button>
                        <button onclick="askSuggestedQuestion('How do I calculate ROI on automation investments?')" class="suggestion-btn">
                            Calculate ROI
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Add enter key support
    const chatInput = document.getElementById('chat-input');
    if (chatInput) {
        chatInput.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendChatMessage();
            }
        });
    }
}

async function sendChatMessage() {
    const chatInput = document.getElementById('chat-input');
    const chatMessages = document.getElementById('chat-messages');
    
    if (!chatInput || !chatMessages) return;
    
    const message = chatInput.value.trim();
    if (!message) return;
    
    // Add user message
    addMessageToChat('user', message);
    chatInput.value = '';
    
    // Show typing indicator
    const typingIndicator = addTypingIndicator();
    
    try {
        // Send to AI backend with user ID
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
                message: message,
                userId: getCurrentUserId()
            })
        });
        
        const data = await response.json();
        
        // Remove typing indicator
        typingIndicator.remove();
        
        if (data.success) {
            addMessageToChat('assistant', data.response);
            
            // Update usage display
            updateUsageDisplay(data.usage);
            
            // Show upgrade suggestion if needed
            if (data.upgradeSuggestion) {
                showUpgradePrompt(data.upgradeSuggestion);
            }
        } else if (data.upgradeRequired) {
            // Handle rate limiting
            showRateLimitMessage(data);
        } else {
            addMessageToChat('assistant', 'I apologize, but I encountered an issue processing your request. Please try again.');
        }
    } catch (error) {
        typingIndicator.remove();
        addMessageToChat('assistant', 'I\'m having trouble connecting right now. Please check your connection and try again.');
    }
}

function getCurrentUserId() {
    // Use stored user ID or create a demo user
    const userRole = localStorage.getItem('userRole');
    const storedUserId = localStorage.getItem('userId');
    
    if (storedUserId) {
        return storedUserId;
    }
    
    // Generate a unique demo user ID
    const demoUserId = userRole === 'admin' ? 'admin-demo' : 'client-demo';
    localStorage.setItem('userId', demoUserId);
    return demoUserId;
}

function updateUsageDisplay(usage) {
    // Add or update usage indicator in chat header
    let usageIndicator = document.getElementById('usage-indicator');
    
    if (!usageIndicator) {
        const chatHeader = document.querySelector('.chat-header');
        usageIndicator = document.createElement('div');
        usageIndicator.id = 'usage-indicator';
        usageIndicator.className = 'usage-indicator';
        chatHeader.appendChild(usageIndicator);
    }
    
    if (usage.limit === -1) {
        usageIndicator.innerHTML = `<span class="usage-unlimited">✨ Unlimited Chats</span>`;
    } else {
        const percentage = ((usage.limit - usage.remaining) / usage.limit) * 100;
        const color = percentage > 80 ? '#e74c3c' : percentage > 60 ? '#f39c12' : '#27ae60';
        
        usageIndicator.innerHTML = `
            <div class="usage-info">
                <span class="usage-text">${usage.remaining} of ${usage.limit} chats remaining</span>
                <div class="usage-bar">
                    <div class="usage-progress" style="width: ${percentage}%; background-color: ${color};"></div>
                </div>
            </div>
        `;
    }
}

function showUpgradePrompt(suggestion) {
    // Show non-intrusive upgrade suggestion
    const upgradePrompt = document.createElement('div');
    upgradePrompt.className = 'upgrade-prompt';
    upgradePrompt.innerHTML = `
        <div class="upgrade-content">
            <span class="upgrade-icon">🚀</span>
            <span class="upgrade-text">${suggestion.reason}</span>
            <button class="upgrade-btn" onclick="showUpgradeModal('${suggestion.suggestedTier}')">Upgrade Now</button>
            <button class="dismiss-btn" onclick="this.parentElement.parentElement.remove()">×</button>
        </div>
    `;
    
    const chatContainer = document.getElementById('chat-container');
    chatContainer.appendChild(upgradePrompt);
    
    // Auto-remove after 10 seconds
    setTimeout(() => {
        if (upgradePrompt.parentElement) {
            upgradePrompt.remove();
        }
    }, 10000);
}

function showRateLimitMessage(data) {
    const rateLimitMessage = `
        <div class="rate-limit-notice">
            <h4>🚫 Chat Limit Reached</h4>
            <p>You've reached your monthly limit of ${data.limit} chats on the ${data.tier} tier.</p>
            <button class="upgrade-btn" onclick="showUpgradeModal('starter')">Upgrade for More Chats</button>
        </div>
    `;
    
    addMessageToChat('system', rateLimitMessage);
}

function showUpgradeModal(suggestedTier) {
    const modal = document.createElement('div');
    modal.className = 'upgrade-modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>🚀 Upgrade Your Plan</h3>
                <button class="close-btn" onclick="this.closest('.upgrade-modal').remove()">×</button>
            </div>
            <div class="modal-body">
                <div class="tier-comparison">
                    <div class="tier-card current">
                        <h4>Pro Bono</h4>
                        <div class="tier-price">Free</div>
                        <ul>
                            <li>10 chats/month</li>
                            <li>3 automations</li>
                            <li>Community support</li>
                        </ul>
                    </div>
                    <div class="tier-card recommended">
                        <h4>Starter</h4>
                        <div class="tier-price">$97/month</div>
                        <ul>
                            <li>100 chats/month</li>
                            <li>10 automations</li>
                            <li>API access</li>
                            <li>Advanced analytics</li>
                            <li>Data export</li>
                        </ul>
                        <button class="select-tier-btn" onclick="upgradeTier('starter')">Choose Starter</button>
                    </div>
                    <div class="tier-card">
                        <h4>Professional</h4>
                        <div class="tier-price">$197/month</div>
                        <ul>
                            <li>500 chats/month</li>
                            <li>50 automations</li>
                            <li>Priority support</li>
                            <li>White label</li>
                            <li>Custom integrations</li>
                        </ul>
                        <button class="select-tier-btn" onclick="upgradeTier('professional')">Choose Professional</button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}

function upgradeTier(tier) {
    // In production, this would integrate with Stripe
    alert(`Upgrade to ${tier} tier initiated! In production, this would redirect to secure payment processing.`);
    document.querySelector('.upgrade-modal').remove();
}

function askSuggestedQuestion(question) {
    const chatInput = document.getElementById('chat-input');
    if (chatInput) {
        chatInput.value = question;
        sendChatMessage();
    }
}

function addMessageToChat(sender, content) {
    const chatMessages = document.getElementById('chat-messages');
    if (!chatMessages) return;
    
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}-message`;
    
    const senderLabel = sender === 'user' ? 'You' : 'AI Assistant';
    messageDiv.innerHTML = `
        <div class="message-content">
            <strong>${senderLabel}:</strong> ${content}
        </div>
    `;
    
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function addTypingIndicator() {
    const chatMessages = document.getElementById('chat-messages');
    if (!chatMessages) return;
    
    const typingDiv = document.createElement('div');
    typingDiv.className = 'message assistant-message typing';
    typingDiv.innerHTML = `
        <div class="message-content">
            <strong>AI Assistant:</strong> <span class="typing-dots">Thinking...</span>
        </div>
    `;
    
    chatMessages.appendChild(typingDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    
    return typingDiv;
}

function goBackToDashboard() {
    // Check user role and show appropriate dashboard
    const userRole = localStorage.getItem('userRole');
    const lastView = localStorage.getItem('adminCurrentView');
    
    if (userRole === 'admin') {
        if (lastView === 'client') {
            showClientDashboard();
        } else {
            showOpsManagerDashboard();
        }
    } else {
        showClientDashboard();
    }
}

// Advanced Analytics Dashboard
function showAdvancedAnalytics() {
    console.log('Showing advanced analytics dashboard');
    const main = document.querySelector('main');
    if (!main) return;
    
    main.innerHTML = `
        <div class="analytics-interface">
            <div class="analytics-header">
                <h2>📊 Advanced Analytics Dashboard</h2>
                <p>Enterprise-grade analytics with conversion tracking and client insights</p>
                <button onclick="goBackToDashboard()" class="btn-secondary">← Back to Dashboard</button>
            </div>
            
            <div class="analytics-content">
                <div class="analytics-grid">
                    <div class="analytics-card">
                        <h3>🎯 Conversion Metrics</h3>
                        <div id="conversion-metrics" class="metrics-content">
                            <div class="loading-spinner">Loading conversion data...</div>
                        </div>
                    </div>
                    
                    <div class="analytics-card">
                        <h3>📈 Usage Analytics</h3>
                        <div id="usage-metrics" class="metrics-content">
                            <div class="loading-spinner">Loading usage data...</div>
                        </div>
                    </div>
                    
                    <div class="analytics-card">
                        <h3>🧠 AI Insights</h3>
                        <div id="ai-insights" class="metrics-content">
                            <div class="loading-spinner">Loading AI insights...</div>
                        </div>
                    </div>
                    
                    <div class="analytics-card">
                        <h3>👥 Client Insights</h3>
                        <div id="client-insights" class="metrics-content">
                            <div class="loading-spinner">Loading client data...</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Load analytics data
    loadAdvancedAnalytics();
}

async function loadAdvancedAnalytics() {
    try {
        const response = await fetch('/api/analytics/overview');
        const data = await response.json();
        
        if (data.success) {
            displayConversionMetrics(data.data.metrics);
            displayUsageMetrics(data.data.usage);
            displayAIInsights(data.data.insights);
        }
        
        // Load client insights
        const clientResponse = await fetch('/api/analytics/clients');
        const clientData = await clientResponse.json();
        
        if (clientData.success) {
            displayClientInsights(clientData.data);
        }
    } catch (error) {
        console.error('Error loading analytics:', error);
    }
}

function displayConversionMetrics(metrics) {
    const container = document.getElementById('conversion-metrics');
    if (!container) return;
    
    container.innerHTML = `
        <div class="metric-row">
            <span class="metric-label">Total Users:</span>
            <span class="metric-value">${metrics.totalUsers}</span>
        </div>
        <div class="metric-row">
            <span class="metric-label">Conversion Rate:</span>
            <span class="metric-value">${metrics.conversionRate.toFixed(1)}%</span>
        </div>
        <div class="metric-row">
            <span class="metric-label">Pro Bono Users:</span>
            <span class="metric-value">${metrics.proBonoUsers}</span>
        </div>
        <div class="metric-row">
            <span class="metric-label">Paid Users:</span>
            <span class="metric-value">${metrics.starterUsers + metrics.professionalUsers + metrics.enterpriseUsers}</span>
        </div>
    `;
}

function displayUsageMetrics(usage) {
    const container = document.getElementById('usage-metrics');
    if (!container) return;
    
    container.innerHTML = `
        <div class="metric-row">
            <span class="metric-label">Total Chats:</span>
            <span class="metric-value">${usage.totalChats}</span>
        </div>
        <div class="metric-row">
            <span class="metric-label">Avg Chats/User:</span>
            <span class="metric-value">${usage.avgChatsPerUser.toFixed(1)}</span>
        </div>
        <div class="metric-row">
            <span class="metric-label">Revenue/User:</span>
            <span class="metric-value">$${usage.revenuePerUser.toFixed(2)}</span>
        </div>
        <div class="metric-row">
            <span class="metric-label">Cost/User:</span>
            <span class="metric-value">$${usage.costPerUser.toFixed(2)}</span>
        </div>
    `;
}

function displayAIInsights(insights) {
    const container = document.getElementById('ai-insights');
    if (!container) return;
    
    let html = '';
    
    if (insights.insights.length > 0) {
        html += '<h4>✨ Key Insights</h4>';
        insights.insights.forEach(insight => {
            html += `<div class="insight-item positive">✅ ${insight}</div>`;
        });
    }
    
    if (insights.alerts.length > 0) {
        html += '<h4>⚠️ Alerts</h4>';
        insights.alerts.forEach(alert => {
            html += `<div class="insight-item alert">⚠️ ${alert}</div>`;
        });
    }
    
    if (insights.opportunities.length > 0) {
        html += '<h4>🚀 Opportunities</h4>';
        insights.opportunities.forEach(opportunity => {
            html += `<div class="insight-item opportunity">🚀 ${opportunity}</div>`;
        });
    }
    
    container.innerHTML = html || '<div class="insight-item">No insights available yet.</div>';
}

function displayClientInsights(clients) {
    const container = document.getElementById('client-insights');
    if (!container) return;
    
    let html = '<div class="client-insights-list">';
    
    clients.slice(0, 5).forEach(client => {
        const conversionColor = client.conversionProbability > 70 ? 'high' : 
                              client.conversionProbability > 40 ? 'medium' : 'low';
        
        html += `
            <div class="client-insight-item">
                <div class="client-info">
                    <strong>${client.userId}</strong> (${client.tier})
                    <span class="conversion-probability ${conversionColor}">
                        ${client.conversionProbability.toFixed(0)}% conversion probability
                    </span>
                </div>
                <div class="client-stats">
                    ${client.totalChats} chats • Last active: ${new Date(client.lastActive).toLocaleDateString()}
                </div>
            </div>
        `;
    });
    
    html += '</div>';
    container.innerHTML = html;
}

// Referral Center
function showReferralCenter() {
    console.log('Showing referral center');
    const main = document.querySelector('main');
    if (!main) return;
    
    main.innerHTML = `
        <div class="referral-interface">
            <div class="referral-header">
                <h2>🎁 Referral Rewards Center</h2>
                <p>Earn credits and bonuses by referring new users to OmniCore</p>
                <button onclick="goBackToDashboard()" class="btn-secondary">← Back to Dashboard</button>
            </div>
            
            <div class="referral-content">
                <div class="referral-grid">
                    <div class="referral-card">
                        <h3>📊 Your Stats</h3>
                        <div id="referral-stats" class="referral-stats">
                            <div class="loading-spinner">Loading your referral stats...</div>
                        </div>
                    </div>
                    
                    <div class="referral-card">
                        <h3>🔗 Share Your Link</h3>
                        <div id="referral-share" class="referral-share">
                            <div class="loading-spinner">Generating your referral link...</div>
                        </div>
                    </div>
                    
                    <div class="referral-card">
                        <h3>🏆 Leaderboard</h3>
                        <div id="referral-leaderboard" class="referral-leaderboard">
                            <div class="loading-spinner">Loading leaderboard...</div>
                        </div>
                    </div>
                    
                    <div class="referral-card">
                        <h3>💰 Reward Structure</h3>
                        <div class="reward-structure">
                            <div class="reward-item">
                                <span class="reward-icon">👋</span>
                                <span class="reward-text">$25 for each new signup</span>
                            </div>
                            <div class="reward-item">
                                <span class="reward-icon">🚀</span>
                                <span class="reward-text">$50 for Starter conversions</span>
                            </div>
                            <div class="reward-item">
                                <span class="reward-icon">⭐</span>
                                <span class="reward-text">$100 for Professional conversions</span>
                            </div>
                            <div class="reward-item">
                                <span class="reward-icon">💎</span>
                                <span class="reward-text">$200 for Enterprise conversions</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Load referral data
    loadReferralData();
}

async function loadReferralData() {
    const userId = getCurrentUserId();
    
    try {
        // Load referral stats and content
        const response = await fetch(`/api/referrals/code/${userId}`);
        const data = await response.json();
        
        if (data.success) {
            displayReferralStats(data.data.stats);
            displayReferralShare(data.data.content);
        }
        
        // Load leaderboard
        const leaderboardResponse = await fetch('/api/referrals/leaderboard');
        const leaderboardData = await leaderboardResponse.json();
        
        if (leaderboardData.success) {
            displayReferralLeaderboard(leaderboardData.data);
        }
    } catch (error) {
        console.error('Error loading referral data:', error);
    }
}

function displayReferralStats(stats) {
    const container = document.getElementById('referral-stats');
    if (!container) return;
    
    container.innerHTML = `
        <div class="stat-row">
            <span class="stat-label">Total Referrals:</span>
            <span class="stat-value">${stats.totalReferrals}</span>
        </div>
        <div class="stat-row">
            <span class="stat-label">Successful Conversions:</span>
            <span class="stat-value">${stats.successfulConversions}</span>
        </div>
        <div class="stat-row">
            <span class="stat-label">Total Rewards Earned:</span>
            <span class="stat-value">$${stats.totalRewardsEarned}</span>
        </div>
        <div class="stat-row">
            <span class="stat-label">Conversion Rate:</span>
            <span class="stat-value">${stats.conversionRate.toFixed(1)}%</span>
        </div>
    `;
}

function displayReferralShare(content) {
    const container = document.getElementById('referral-share');
    if (!container) return;
    
    container.innerHTML = `
        <div class="share-content">
            <div class="referral-link-section">
                <label>Your Referral Link:</label>
                <div class="link-input-group">
                    <input type="text" value="${content.shareableLink}" readonly class="referral-link-input" id="referral-link">
                    <button onclick="copyReferralLink()" class="copy-btn">Copy</button>
                </div>
            </div>
            
            <div class="share-buttons">
                <button onclick="shareEmail()" class="share-btn email">📧 Email</button>
                <button onclick="shareSocial()" class="share-btn social">📱 Social</button>
                <button onclick="showShareContent()" class="share-btn content">📝 Copy Content</button>
            </div>
        </div>
    `;
}

function displayReferralLeaderboard(leaderboard) {
    const container = document.getElementById('referral-leaderboard');
    if (!container) return;
    
    let html = '<div class="leaderboard-list">';
    
    leaderboard.slice(0, 5).forEach((user, index) => {
        const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '🏅';
        html += `
            <div class="leaderboard-item">
                <span class="rank">${medal} #${index + 1}</span>
                <span class="user-id">${user.userId}</span>
                <span class="rewards">$${user.totalRewards}</span>
            </div>
        `;
    });
    
    html += '</div>';
    container.innerHTML = html;
}

function copyReferralLink() {
    const linkInput = document.getElementById('referral-link');
    if (linkInput) {
        linkInput.select();
        document.execCommand('copy');
        alert('Referral link copied to clipboard!');
    }
}

// Automation Blueprints Library
function showAutomationBlueprints() {
    console.log('Showing automation blueprints');
    const main = document.querySelector('main');
    if (!main) return;
    
    main.innerHTML = `
        <div class="blueprints-interface">
            <div class="blueprints-header">
                <h2>📋 Automation Blueprint Library</h2>
                <p>Plug-and-play templates for instant business automation</p>
                <button onclick="goBackToDashboard()" class="btn-secondary">← Back to Dashboard</button>
            </div>
            
            <div class="blueprints-content">
                <div class="blueprints-filters">
                    <button class="filter-btn active" onclick="filterBlueprints('all')">All Templates</button>
                    <button class="filter-btn" onclick="filterBlueprints('Sales & Marketing')">Sales & Marketing</button>
                    <button class="filter-btn" onclick="filterBlueprints('Customer Success')">Customer Success</button>
                    <button class="filter-btn" onclick="filterBlueprints('Finance & Operations')">Finance & Operations</button>
                </div>
                
                <div class="blueprints-grid" id="blueprints-grid">
                    <div class="loading-spinner">Loading automation templates...</div>
                </div>
            </div>
        </div>
    `;
    
    loadAutomationBlueprints();
}

async function loadAutomationBlueprints() {
    try {
        const userId = getCurrentUserId();
        const response = await fetch(`/api/blueprints?userId=${userId}`);
        const data = await response.json();
        
        if (data.success) {
            displayBlueprints(data.data);
        }
    } catch (error) {
        console.error('Error loading blueprints:', error);
        document.getElementById('blueprints-grid').innerHTML = '<div class="error-message">Failed to load templates</div>';
    }
}

function displayBlueprints(blueprints) {
    const grid = document.getElementById('blueprints-grid');
    if (!grid) return;
    
    let html = '';
    
    blueprints.forEach(blueprint => {
        const lockClass = blueprint.locked ? 'locked' : '';
        const lockIcon = blueprint.locked ? '🔒' : '';
        
        html += `
            <div class="blueprint-card ${lockClass}" data-category="${blueprint.category}">
                <div class="blueprint-header">
                    <span class="blueprint-icon">${blueprint.icon}</span>
                    <span class="blueprint-lock">${lockIcon}</span>
                </div>
                <h3 class="blueprint-title">${blueprint.name}</h3>
                <p class="blueprint-description">${blueprint.description}</p>
                <div class="blueprint-metrics">
                    <div class="metric">
                        <span class="metric-label">ROI:</span>
                        <span class="metric-value">${blueprint.estimatedROI}</span>
                    </div>
                    <div class="metric">
                        <span class="metric-label">Setup:</span>
                        <span class="metric-value">${blueprint.timeToImplement}</span>
                    </div>
                    <div class="metric">
                        <span class="metric-label">Level:</span>
                        <span class="metric-value">${blueprint.complexity}</span>
                    </div>
                </div>
                <div class="blueprint-actions">
                    ${blueprint.locked ? 
                        `<button class="blueprint-btn locked" onclick="showUpgradeModal('${blueprint.upgradeRequired}')">Upgrade to ${blueprint.upgradeRequired}</button>` :
                        `<button class="blueprint-btn" onclick="useBlueprint('${blueprint.id}')">Use Template</button>`
                    }
                </div>
            </div>
        `;
    });
    
    grid.innerHTML = html;
}

function filterBlueprints(category) {
    const cards = document.querySelectorAll('.blueprint-card');
    const filterBtns = document.querySelectorAll('.filter-btn');
    
    // Update active filter button
    filterBtns.forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    
    // Filter cards
    cards.forEach(card => {
        if (category === 'all' || card.dataset.category === category) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
}

function useBlueprint(blueprintId) {
    alert(`Setting up ${blueprintId} automation template. In production, this would launch the blueprint configuration wizard.`);
}

// Enhanced Client Portal
function showEnhancedPortal() {
    console.log('Showing enhanced client portal');
    const main = document.querySelector('main');
    if (!main) return;
    
    main.innerHTML = `
        <div class="portal-interface">
            <div class="portal-header">
                <h2>📊 Enhanced Client Portal</h2>
                <p>Real-time project tracking and collaboration tools</p>
                <button onclick="goBackToDashboard()" class="btn-secondary">← Back to Dashboard</button>
            </div>
            
            <div class="portal-content">
                <div class="portal-grid">
                    <div class="portal-card">
                        <h3>🚀 Active Projects</h3>
                        <div id="active-projects" class="portal-section">
                            <div class="loading-spinner">Loading projects...</div>
                        </div>
                    </div>
                    
                    <div class="portal-card">
                        <h3>🔔 Recent Notifications</h3>
                        <div id="recent-notifications" class="portal-section">
                            <div class="loading-spinner">Loading notifications...</div>
                        </div>
                    </div>
                    
                    <div class="portal-card">
                        <h3>📈 Usage Analytics</h3>
                        <div id="usage-analytics" class="portal-section">
                            <div class="loading-spinner">Loading analytics...</div>
                        </div>
                    </div>
                    
                    <div class="portal-card">
                        <h3>💬 Support Chat</h3>
                        <div id="support-chat" class="portal-section">
                            <div class="chat-widget">
                                <div class="chat-status">
                                    <span class="status-indicator online"></span>
                                    <span>AI Assistant Online</span>
                                </div>
                                <button class="start-chat-btn" onclick="startSupportChat()">Start Conversation</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    loadEnhancedPortalData();
}

async function loadEnhancedPortalData() {
    try {
        const userId = getCurrentUserId();
        const response = await fetch(`/api/portal/dashboard?userId=${userId}`);
        const data = await response.json();
        
        if (data.success) {
            displayPortalData(data.data);
        }
    } catch (error) {
        console.error('Error loading portal data:', error);
    }
}

function displayPortalData(portalData) {
    // Display active projects
    const projectsContainer = document.getElementById('active-projects');
    if (projectsContainer && portalData.projects) {
        let projectsHtml = '';
        portalData.projects.forEach(project => {
            projectsHtml += `
                <div class="project-item">
                    <div class="project-header">
                        <h4>${project.name}</h4>
                        <span class="project-progress">${project.progress}% complete</span>
                    </div>
                    <div class="project-timeline">
                        <span class="timeline-item">Started: ${new Date(project.timeline.startDate).toLocaleDateString()}</span>
                        <span class="timeline-item">Due: ${new Date(project.timeline.estimatedCompletion).toLocaleDateString()}</span>
                    </div>
                    <div class="project-team">
                        ${project.team.map(member => `<span class="team-member">${member.avatar} ${member.name}</span>`).join('')}
                    </div>
                </div>
            `;
        });
        projectsContainer.innerHTML = projectsHtml;
    }

    // Display notifications
    const notificationsContainer = document.getElementById('recent-notifications');
    if (notificationsContainer && portalData.notifications) {
        let notificationsHtml = '';
        portalData.notifications.slice(0, 5).forEach(notification => {
            notificationsHtml += `
                <div class="notification-item ${notification.priority}">
                    <span class="notification-icon">${notification.icon}</span>
                    <div class="notification-content">
                        <h5>${notification.title}</h5>
                        <p>${notification.message}</p>
                        <span class="notification-time">${new Date(notification.timestamp).toLocaleDateString()}</span>
                    </div>
                </div>
            `;
        });
        notificationsContainer.innerHTML = notificationsHtml;
    }

    // Display usage analytics
    const analyticsContainer = document.getElementById('usage-analytics');
    if (analyticsContainer && portalData.usageAnalytics) {
        const analytics = portalData.usageAnalytics;
        analyticsContainer.innerHTML = `
            <div class="analytics-summary">
                <div class="analytics-metric">
                    <span class="metric-number">${analytics.summary.automationsRun}</span>
                    <span class="metric-label">Automations Run</span>
                </div>
                <div class="analytics-metric">
                    <span class="metric-number">${analytics.summary.timeSaved}</span>
                    <span class="metric-label">Time Saved</span>
                </div>
                <div class="analytics-metric">
                    <span class="metric-number">${analytics.summary.costSavings}</span>
                    <span class="metric-label">Cost Savings</span>
                </div>
            </div>
        `;
    }
}

function startSupportChat() {
    alert('AI Support Chat would launch here. Enterprise feature with 24/7 intelligent assistance and human escalation.');
}

// Enterprise API Center
function showEnterpriseAPI() {
    console.log('Showing enterprise API center');
    const main = document.querySelector('main');
    if (!main) return;
    
    main.innerHTML = `
        <div class="api-interface">
            <div class="api-header">
                <h2>🔧 Enterprise API Center</h2>
                <p>Connect OmniCore to your existing tools and workflows</p>
                <button onclick="goBackToDashboard()" class="btn-secondary">← Back to Dashboard</button>
            </div>
            
            <div class="api-content">
                <div class="api-grid">
                    <div class="api-card">
                        <h3>🔑 API Keys</h3>
                        <div id="api-keys" class="api-section">
                            <div class="loading-spinner">Loading API keys...</div>
                        </div>
                    </div>
                    
                    <div class="api-card">
                        <h3>🔗 Integrations</h3>
                        <div id="integrations" class="api-section">
                            <div class="loading-spinner">Loading integrations...</div>
                        </div>
                    </div>
                    
                    <div class="api-card">
                        <h3>📚 Documentation</h3>
                        <div id="api-docs" class="api-section">
                            <div class="docs-link">
                                <a href="#" onclick="viewAPIDocumentation()">📖 View API Documentation</a>
                                <p>Complete OpenAPI 3.0 specification with examples</p>
                            </div>
                        </div>
                    </div>
                    
                    <div class="api-card">
                        <h3>🔗 Webhooks</h3>
                        <div id="webhooks" class="api-section">
                            <button class="create-webhook-btn" onclick="createWebhook()">+ Create Webhook</button>
                            <p>Get real-time notifications for automation events</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    loadEnterpriseAPIData();
}

async function loadEnterpriseAPIData() {
    try {
        const userId = getCurrentUserId();
        const response = await fetch(`/api/enterprise/api-keys?userId=${userId}`);
        const data = await response.json();
        
        if (data.success) {
            displayAPIData(data.data);
        }
    } catch (error) {
        console.error('Error loading API data:', error);
    }
}

function displayAPIData(apiData) {
    // Display API key
    const apiKeysContainer = document.getElementById('api-keys');
    if (apiKeysContainer && apiData.apiKey) {
        apiKeysContainer.innerHTML = `
            <div class="api-key-item">
                <div class="api-key-info">
                    <h4>${apiData.apiKey.name}</h4>
                    <div class="api-key-value">
                        <input type="password" value="${apiData.apiKey.key}" readonly id="api-key-input">
                        <button onclick="toggleAPIKeyVisibility()" class="toggle-btn">👁️</button>
                        <button onclick="copyAPIKey()" class="copy-btn">📋</button>
                    </div>
                    <p class="api-key-meta">Created: ${new Date(apiData.apiKey.createdAt).toLocaleDateString()}</p>
                </div>
            </div>
        `;
    }

    // Display integrations
    const integrationsContainer = document.getElementById('integrations');
    if (integrationsContainer && apiData.integrations) {
        let integrationsHtml = '';
        apiData.integrations.forEach(integration => {
            integrationsHtml += `
                <div class="integration-item">
                    <h4>${integration.name}</h4>
                    <p>${integration.description}</p>
                    <button class="integration-btn" onclick="setupIntegration('${integration.name}')">Setup Integration</button>
                </div>
            `;
        });
        integrationsContainer.innerHTML = integrationsHtml;
    }
}

function toggleAPIKeyVisibility() {
    const input = document.getElementById('api-key-input');
    if (input.type === 'password') {
        input.type = 'text';
    } else {
        input.type = 'password';
    }
}

function copyAPIKey() {
    const input = document.getElementById('api-key-input');
    input.select();
    document.execCommand('copy');
    alert('API key copied to clipboard!');
}

function viewAPIDocumentation() {
    alert('API Documentation would open here. Complete OpenAPI 3.0 spec with interactive examples and code samples.');
}

function createWebhook() {
    alert('Webhook creation wizard would launch here. Configure real-time notifications for automation events.');
}

function setupIntegration(integrationName) {
    alert(`${integrationName} integration setup would launch here. OAuth flow or API key configuration for seamless connectivity.`);
}

// OmniFlow Advisory - Service-to-SaaS Pipeline Interface
function showServiceToSaaSPipeline() {
    console.log('Showing service-to-SaaS pipeline');
    const main = document.querySelector('main');
    if (!main) return;
    
    main.innerHTML = `
        <div class="pipeline-interface">
            <div class="pipeline-header">
                <h2>🚀 OmniFlow Advisory Pipeline</h2>
                <p>Intelligent automation consulting that scales to self-service SaaS</p>
                <button onclick="goBackToDashboard()" class="btn-secondary">← Back to Dashboard</button>
            </div>
            
            <div class="pipeline-content">
                <div class="pipeline-stages">
                    <div class="stage active" data-stage="intake">
                        <div class="stage-number">1</div>
                        <h3>Business Intake</h3>
                        <p>Comprehensive business assessment</p>
                    </div>
                    <div class="stage" data-stage="audit">
                        <div class="stage-number">2</div>
                        <h3>Process Audit</h3>
                        <p>Identify automation opportunities</p>
                    </div>
                    <div class="stage" data-stage="analysis">
                        <div class="stage-number">3</div>
                        <h3>AI Analysis</h3>
                        <p>Deep ROI and strategy analysis</p>
                    </div>
                    <div class="stage" data-stage="report">
                        <div class="stage-number">4</div>
                        <h3>Strategy Report</h3>
                        <p>Comprehensive implementation plan</p>
                    </div>
                    <div class="stage" data-stage="action">
                        <div class="stage-number">5</div>
                        <h3>Implementation</h3>
                        <p>Consulting or SaaS transition</p>
                    </div>
                </div>
                
                <div class="pipeline-form">
                    <div class="form-section active" id="intake-form">
                        <h3>Start Your Automation Journey</h3>
                        <form onsubmit="startAutomationPipeline(event)">
                            <div class="form-group">
                                <label>Business Name</label>
                                <input type="text" name="businessName" required>
                            </div>
                            <div class="form-group">
                                <label>Industry</label>
                                <select name="industry" required>
                                    <option value="">Select Industry</option>
                                    <option value="technology">Technology</option>
                                    <option value="consulting">Consulting</option>
                                    <option value="ecommerce">E-commerce</option>
                                    <option value="manufacturing">Manufacturing</option>
                                    <option value="healthcare">Healthcare</option>
                                    <option value="finance">Finance</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label>Company Size</label>
                                <select name="size" required>
                                    <option value="">Select Size</option>
                                    <option value="startup">Startup (1-10 employees)</option>
                                    <option value="small">Small (11-50 employees)</option>
                                    <option value="medium">Medium (51-200 employees)</option>
                                    <option value="large">Large (200+ employees)</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label>Primary Business Challenges (select all that apply)</label>
                                <div class="checkbox-group">
                                    <label><input type="checkbox" name="challenges" value="manual_processes"> Manual processes taking too much time</label>
                                    <label><input type="checkbox" name="challenges" value="lead_management"> Lead qualification and management</label>
                                    <label><input type="checkbox" name="challenges" value="customer_onboarding"> Customer onboarding complexity</label>
                                    <label><input type="checkbox" name="challenges" value="reporting"> Reporting and analytics</label>
                                    <label><input type="checkbox" name="challenges" value="communication"> Internal communication inefficiencies</label>
                                    <label><input type="checkbox" name="challenges" value="scaling"> Difficulty scaling operations</label>
                                </div>
                            </div>
                            <div class="form-group">
                                <label>Current Tools (comma-separated)</label>
                                <input type="text" name="currentTools" placeholder="e.g., HubSpot, Slack, QuickBooks">
                            </div>
                            <div class="form-group">
                                <label>Automation Goals</label>
                                <div class="checkbox-group">
                                    <label><input type="checkbox" name="goals" value="save_time"> Save time on routine tasks</label>
                                    <label><input type="checkbox" name="goals" value="reduce_costs"> Reduce operational costs</label>
                                    <label><input type="checkbox" name="goals" value="improve_accuracy"> Improve process accuracy</label>
                                    <label><input type="checkbox" name="goals" value="scale_business"> Scale business operations</label>
                                    <label><input type="checkbox" name="goals" value="better_insights"> Get better business insights</label>
                                </div>
                            </div>
                            <button type="submit" class="pipeline-submit-btn">Start Automation Analysis</button>
                        </form>
                    </div>
                    
                    <div class="form-section" id="pipeline-progress" style="display: none;">
                        <h3>Pipeline Progress</h3>
                        <div class="progress-container">
                            <div class="progress-bar">
                                <div class="progress-fill" id="progress-fill"></div>
                            </div>
                            <div class="progress-text" id="progress-text">Initializing...</div>
                        </div>
                        <div class="pipeline-status" id="pipeline-status">
                            <p>Your automation analysis is in progress. This typically takes 45 minutes.</p>
                        </div>
                    </div>
                    
                    <div class="form-section" id="pipeline-results" style="display: none;">
                        <h3>Your Automation Strategy</h3>
                        <div class="results-container" id="results-container">
                            <!-- Results will be populated here -->
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

async function startAutomationPipeline(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const businessData = {
        businessProfile: {
            businessName: formData.get('businessName'),
            industry: formData.get('industry'),
            size: formData.get('size'),
            challenges: formData.getAll('challenges'),
            goals: formData.getAll('goals'),
            currentTools: formData.get('currentTools')?.split(',').map(t => t.trim()) || []
        }
    };
    
    try {
        // Hide form and show progress
        document.getElementById('intake-form').style.display = 'none';
        document.getElementById('pipeline-progress').style.display = 'block';
        
        // Start the automation pipeline
        const response = await fetch('/api/automation/pipeline/start', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                blueprintId: 'comprehensive_automation_audit',
                businessData,
                userId: getCurrentUserId()
            })
        });
        
        const result = await response.json();
        
        if (result.success) {
            // Monitor pipeline progress
            monitorPipelineProgress(result.data.executionId);
        } else {
            alert('Failed to start automation pipeline. Please try again.');
        }
        
    } catch (error) {
        console.error('Pipeline start error:', error);
        alert('Failed to start automation pipeline. Please try again.');
    }
}

async function monitorPipelineProgress(executionId) {
    const progressFill = document.getElementById('progress-fill');
    const progressText = document.getElementById('progress-text');
    const pipelineStatus = document.getElementById('pipeline-status');
    
    const stages = ['intake', 'audit', 'analysis', 'report', 'action'];
    let currentStageIndex = 0;
    
    const checkProgress = async () => {
        try {
            const response = await fetch(`/api/automation/pipeline/${executionId}/status`);
            const status = await response.json();
            
            if (status.success) {
                const data = status.data;
                currentStageIndex = Math.max(stages.indexOf(data.currentStage), currentStageIndex);
                
                // Update progress bar
                const progress = ((currentStageIndex + 1) / stages.length) * 100;
                progressFill.style.width = `${progress}%`;
                
                // Update stage indicators
                document.querySelectorAll('.stage').forEach((stage, index) => {
                    if (index <= currentStageIndex) {
                        stage.classList.add('completed');
                    }
                    if (index === currentStageIndex) {
                        stage.classList.add('active');
                    }
                });
                
                // Update status text
                progressText.textContent = `Stage ${currentStageIndex + 1}/5: ${stages[currentStageIndex].charAt(0).toUpperCase() + stages[currentStageIndex].slice(1)}`;
                
                if (data.status === 'completed') {
                    progressText.textContent = 'Analysis Complete!';
                    await loadPipelineResults(executionId);
                    return;
                } else if (data.status === 'failed') {
                    progressText.textContent = 'Analysis failed. Please contact support.';
                    return;
                }
            }
            
            // Continue monitoring
            setTimeout(checkProgress, 3000);
            
        } catch (error) {
            console.error('Progress monitoring error:', error);
            setTimeout(checkProgress, 5000);
        }
    };
    
    checkProgress();
}

async function loadPipelineResults(executionId) {
    try {
        const response = await fetch(`/api/automation/pipeline/${executionId}/results`);
        const results = await response.json();
        
        if (results.success) {
            displayPipelineResults(results.data);
        }
    } catch (error) {
        console.error('Results loading error:', error);
    }
}

function displayPipelineResults(results) {
    document.getElementById('pipeline-progress').style.display = 'none';
    document.getElementById('pipeline-results').style.display = 'block';
    
    const container = document.getElementById('results-container');
    
    let html = '';
    
    if (results.analysis) {
        html += `
            <div class="result-section">
                <h4>🎯 ROI Projections</h4>
                <div class="roi-highlight">
                    <span class="roi-amount">${results.analysis.roi_projections?.total || '$25,000/year'}</span>
                    <span class="roi-label">Estimated Annual Savings</span>
                </div>
                <p>Payback period: ${results.analysis.roi_projections?.payback_period || '3-6 months'}</p>
            </div>
        `;
    }
    
    if (results.report) {
        html += `
            <div class="result-section">
                <h4>📊 Executive Summary</h4>
                <div class="executive-summary">
                    ${results.report.executive_summary || 'Comprehensive automation strategy developed based on your business profile.'}
                </div>
            </div>
            
            <div class="result-section">
                <h4>✅ Next Steps</h4>
                <ul class="action-items">
                    ${(results.report.action_items || [
                        'Review automation recommendations',
                        'Schedule implementation consultation',
                        'Begin with highest-impact automation'
                    ]).map(item => `<li>${item}</li>`).join('')}
                </ul>
            </div>
        `;
    }
    
    html += `
        <div class="result-section">
            <h4>🚀 Ready for Next Phase?</h4>
            <div class="transition-options">
                <button onclick="scheduleConsultation()" class="consultation-btn">
                    📞 Schedule Consultation
                    <span>Work with our automation experts</span>
                </button>
                <button onclick="exploreSaasPlatform()" class="saas-btn">
                    ⚡ Explore OmniCore Platform
                    <span>Self-service automation tools</span>
                </button>
            </div>
        </div>
    `;
    
    container.innerHTML = html;
}

function scheduleConsultation() {
    alert('Consultation scheduling would open here. This transitions users to OmniFlow Advisory services.');
}

function exploreSaasPlatform() {
    alert('This would transition users to the OmniCore SaaS platform with appropriate tier recommendations.');
}

// Enhanced Chat with Context and Memory
async function sendEnhancedChatMessage() {
    const chatInput = document.getElementById('chat-input');
    const message = chatInput.value.trim();
    if (!message) return;

    const userId = getCurrentUserId();
    addMessageToChat('You', message);
    chatInput.value = '';
    
    addTypingIndicator();

    try {
        const response = await fetch('/api/chat/enhanced', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message, userId })
        });

        const data = await response.json();
        
        document.querySelector('.typing-indicator')?.remove();

        if (data.success) {
            addMessageToChat('OmniFlow Assistant', data.data.response);
            
            // Show contextual insights if available
            if (data.data.insights) {
                showContextualInsights(data.data.insights);
            }
            
            // Update usage display
            if (data.data.usage) {
                updateUsageDisplay(data.data.usage);
            }
        } else {
            if (data.upgradeRequired) {
                showUpgradePrompt(data);
            } else {
                addMessageToChat('System', 'Sorry, I encountered an error. Please try again.');
            }
        }
    } catch (error) {
        console.error('Enhanced chat error:', error);
        document.querySelector('.typing-indicator')?.remove();
        addMessageToChat('System', 'Connection error. Please check your internet and try again.');
    }
}

function showContextualInsights(insights) {
    const chatMessages = document.getElementById('chat-messages');
    
    const insightsHtml = `
        <div class="insights-card">
            <h4>💡 Automation Insights</h4>
            <div class="insight-item">
                <span class="insight-label">Automation Readiness:</span>
                <span class="insight-value">${insights.automationReadiness}%</span>
            </div>
            <div class="insight-item">
                <span class="insight-label">Potential ROI:</span>
                <span class="insight-value">${insights.potentialROI}</span>
            </div>
            <div class="next-steps">
                <h5>Recommended Next Steps:</h5>
                <ul>
                    ${insights.recommendedNextSteps.map(step => `<li>${step}</li>`).join('')}
                </ul>
            </div>
        </div>
    `;
    
    chatMessages.insertAdjacentHTML('beforeend', insightsHtml);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}