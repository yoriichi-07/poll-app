// API Configuration
const API_BASE_URL = process.env.NODE_ENV === 'production' 
    ? '/api'  // In production, backend is served from same domain
    : 'http://localhost:3000/api';  // For local development

// Application State
let polls = [];
let isLoading = false;

// DOM Elements
const pollForm = document.getElementById('pollForm');
const pollsContainer = document.getElementById('pollsContainer');
const addOptionBtn = document.getElementById('addOption');
const optionsContainer = document.getElementById('options');

// Initialize Application
document.addEventListener('DOMContentLoaded', () => {
    setupEventListeners();
    loadPolls();
});

// Event Listeners Setup
function setupEventListeners() {
    pollForm.addEventListener('submit', handleCreatePoll);
    addOptionBtn.addEventListener('click', addOptionInput);
}

// Add new option input field
function addOptionInput() {
    const optionInput = document.createElement('input');
    optionInput.type = 'text';
    optionInput.className = 'option-input';
    optionInput.placeholder = `Option ${optionsContainer.children.length + 1}`;
    optionInput.required = true;
    
    optionsContainer.appendChild(optionInput);
}

// Handle poll creation
async function handleCreatePoll(e) {
    e.preventDefault();
    
    const title = document.getElementById('pollTitle').value.trim();
    const optionInputs = document.querySelectorAll('.option-input');
    const options = Array.from(optionInputs)
        .map(input => input.value.trim())
        .filter(option => option.length > 0);
    
    if (options.length < 2) {
        showMessage('Please provide at least 2 options', 'error');
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}/polls`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ title, options })
        });
        
        if (!response.ok) {
            throw new Error('Failed to create poll');
        }
        
        const newPoll = await response.json();
        showMessage('Poll created successfully!', 'success');
        pollForm.reset();
        
        // Reset to 2 option inputs
        optionsContainer.innerHTML = `
            <input type="text" class="option-input" placeholder="Option 1" required>
            <input type="text" class="option-input" placeholder="Option 2" required>
        `;
        
        // Refresh polls list
        loadPolls();
        
    } catch (error) {
        console.error('Error creating poll:', error);
        showMessage('Failed to create poll. Please try again.', 'error');
    }
}

// Load all polls from the API
async function loadPolls() {
    try {
        setLoading(true);
        
        const response = await fetch(`${API_BASE_URL}/polls`);
        
        if (!response.ok) {
            throw new Error('Failed to load polls');
        }
        
        polls = await response.json();
        renderPolls();
        
    } catch (error) {
        console.error('Error loading polls:', error);
        pollsContainer.innerHTML = `
            <div class="error-message">
                Failed to load polls. Please check your connection and try again.
            </div>
        `;
    } finally {
        setLoading(false);
    }
}

// Render polls in the UI
function renderPolls() {
    if (polls.length === 0) {
        pollsContainer.innerHTML = `
            <div class="empty-state">
                <h3>No polls yet</h3>
                <p>Create the first poll to get started!</p>
            </div>
        `;
        return;
    }
    
    const pollsHTML = polls.map(poll => createPollHTML(poll)).join('');
    pollsContainer.innerHTML = pollsHTML;
    
    // Add click listeners for voting
    document.querySelectorAll('.poll-option').forEach(option => {
        option.addEventListener('click', handleVote);
    });
}

// Create HTML for a single poll
function createPollHTML(poll) {
    const totalVotes = poll.options.reduce((sum, option) => sum + option.votes, 0);
    
    const optionsHTML = poll.options.map((option, index) => {
        const percentage = totalVotes > 0 ? (option.votes / totalVotes) * 100 : 0;
        
        return `
            <div class="poll-option" data-poll-id="${poll._id}" data-option-index="${index}">
                <div class="option-text">${option.text}</div>
                <div class="vote-count">${option.votes}</div>
                <div class="vote-bar">
                    <div class="vote-fill" style="width: ${percentage}%"></div>
                </div>
            </div>
        `;
    }).join('');
    
    return `
        <div class="poll-card">
            <div class="poll-title">${poll.title}</div>
            <div class="poll-meta">
                <small>Total votes: ${totalVotes} • Created: ${new Date(poll.createdAt).toLocaleDateString()}</small>
            </div>
            <div class="poll-options">
                ${optionsHTML}
            </div>
        </div>
    `;
}

// Handle voting on a poll option
async function handleVote(e) {
    const pollId = e.currentTarget.dataset.pollId;
    const optionIndex = parseInt(e.currentTarget.dataset.optionIndex);
    
    try {
        const response = await fetch(`${API_BASE_URL}/polls/${pollId}/vote`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ optionIndex })
        });
        
        if (!response.ok) {
            throw new Error('Failed to vote');
        }
        
        const updatedPoll = await response.json();
        
        // Update the poll in our local state
        const pollIndex = polls.findIndex(p => p._id === pollId);
        if (pollIndex !== -1) {
            polls[pollIndex] = updatedPoll;
            renderPolls();
        }
        
        showMessage('Vote recorded successfully!', 'success');
        
    } catch (error) {
        console.error('Error voting:', error);
        showMessage('Failed to record vote. Please try again.', 'error');
    }
}

// Show success/error messages
function showMessage(text, type) {
    const existingMessage = document.querySelector('.success-message, .error-message');
    if (existingMessage) {
        existingMessage.remove();
    }
    
    const message = document.createElement('div');
    message.className = type === 'success' ? 'success-message' : 'error-message';
    message.textContent = text;
    
    const firstSection = document.querySelector('section');
    firstSection.insertBefore(message, firstSection.firstChild);
    
    // Remove message after 3 seconds
    setTimeout(() => {
        message.remove();
    }, 3000);
}

// Set loading state
function setLoading(loading) {
    isLoading = loading;
    if (loading) {
        pollsContainer.innerHTML = '<div class="loading">Loading polls...</div>';
    }
}

// Utility function to format dates
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
}

// Auto-refresh polls every 30 seconds
setInterval(() => {
    if (!isLoading) {
        loadPolls();
    }
}, 30000);

// Add some demo data for development/testing
if (process.env.NODE_ENV !== 'production') {
    // Mock data for development when backend is not available
    window.addEventListener('load', () => {
        setTimeout(() => {
            if (polls.length === 0 && !isLoading) {
                // If no polls loaded and we're not loading, show demo data
                polls = [
                    {
                        _id: 'demo1',
                        title: 'What\'s your favorite blockchain network?',
                        options: [
                            { text: 'Ethereum', votes: 45 },
                            { text: 'Akash Network', votes: 67 },
                            { text: 'Solana', votes: 23 },
                            { text: 'Cosmos', votes: 34 }
                        ],
                        createdAt: new Date().toISOString()
                    },
                    {
                        _id: 'demo2',
                        title: 'Best deployment platform for dApps?',
                        options: [
                            { text: 'Traditional Cloud (AWS, GCP)', votes: 12 },
                            { text: 'Akash Network', votes: 89 },
                            { text: 'Self-hosted', votes: 8 }
                        ],
                        createdAt: new Date().toISOString()
                    }
                ];
                renderPolls();
            }
        }, 2000);
    });
}
