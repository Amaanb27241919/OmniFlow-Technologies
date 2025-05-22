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
    const mainContent = document.querySelector('.main-content');
    
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
    const mainContent = document.querySelector('.main-content');
    
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