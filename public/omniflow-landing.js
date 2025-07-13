// OmniFlow Landing Page Interactive Functionality
document.addEventListener('DOMContentLoaded', function() {
    initializeROICalculator();
    initializeSmoothScrolling();
    initializeAnimations();
});

// ROI Calculator Functionality
function initializeROICalculator() {
    const businessSizeSelect = document.getElementById('business-size');
    const manualHoursInput = document.getElementById('manual-hours');
    
    if (businessSizeSelect && manualHoursInput) {
        businessSizeSelect.addEventListener('change', updateROICalculation);
        manualHoursInput.addEventListener('input', updateROICalculation);
        
        // Initial calculation
        updateROICalculation();
    }
}

function updateROICalculation() {
    const businessSize = document.getElementById('business-size')?.value || 'small';
    const manualHours = parseInt(document.getElementById('manual-hours')?.value) || 15;
    
    // Realistic weekly time savings (10-15 hours for SMBs)
    const weeklyTimeSaved = Math.min(15, Math.max(10, manualHours * 0.6)); // Cap at 15 hours max
    
    // Realistic annual savings ($5K-15K range)
    const annualCostSavings = Math.min(15000, Math.max(5000, weeklyTimeSaved * 52 * 25)); // $25/hr rate
    
    // Conservative ROI calculation
    const averageInvestment = 997; // Starting price point
    const roi = Math.min(300, ((annualCostSavings - averageInvestment) / averageInvestment) * 100); // Cap at 300% ROI
    
    // Update display with static realistic values
    if (document.getElementById('time-savings')) {
        document.getElementById('time-savings').textContent = '15 hours/week';
    }
    if (document.getElementById('cost-savings')) {
        document.getElementById('cost-savings').textContent = '$5K-15K annually';
    }
    if (document.getElementById('roi-percentage')) {
        document.getElementById('roi-percentage').textContent = '200%+';
    }
}

// Main CTA Actions
function startFreeAudit() {
    // Track the action
    trackUserAction('free_audit_started', { source: 'landing_page' });
    
    // Show contact form for discovery call scheduling
    showContactModal('discovery');
}

function viewPlatformDemo() {
    trackUserAction('platform_demo_requested', { source: 'hero_section' });
    
    // Show contact form for platform demo
    showContactModal('demo');
}

function startAdvisoryConsultation() {
    trackUserAction('advisory_consultation_requested', { source: 'services_section' });
    
    // Create a simple contact form modal
    showContactModal('advisory');
}

function explorePlatform() {
    trackUserAction('platform_exploration_started', { source: 'services_section' });
    
    // Show contact form for early access signup
    showContactModal('early-access');
}

function accessPlatform() {
    trackUserAction('platform_access_requested', { source: 'navigation' });
    
    // Show contact form for platform access
    showContactModal('platform-access');
}

function getDetailedROI() {
    const businessSize = document.getElementById('business-size')?.value || 'small';
    const manualHours = parseInt(document.getElementById('manual-hours')?.value) || 20;
    
    trackUserAction('detailed_roi_requested', { 
        business_size: businessSize, 
        manual_hours: manualHours 
    });
    
    // Start the full audit process with pre-filled data
    sessionStorage.setItem('roi_context', JSON.stringify({
        businessSize,
        manualHours,
        source: 'roi_calculator'
    }));
    
    window.location.href = '/app.html#audit';
}

function startTrialSignup() {
    trackUserAction('trial_signup_started', { source: 'cta_section' });
    
    showContactModal('trial');
}

// Contact Modal for Lead Capture
function showContactModal(type) {
    const modalTitles = {
        'discovery': 'Schedule Your Discovery Call',
        'demo': 'Request Platform Demo',
        'advisory': 'Schedule Your Consultation',
        'early-access': 'Join OmniCore Waitlist',
        'platform-access': 'Get Platform Access',
        'trial': 'Start Your Free Trial'
    };
    
    const modalHTML = `
        <div class="contact-modal-overlay" id="contactModal">
            <div class="contact-modal">
                <div class="modal-header">
                    <h3>${modalTitles[type] || 'Contact Us'}</h3>
                    <button onclick="closeContactModal()" class="modal-close">&times;</button>
                </div>
                <div class="modal-body">
                    <form onsubmit="submitContactForm(event, '${type}')">
                        <div class="form-group">
                            <label>Business Name *</label>
                            <input type="text" name="businessName" required>
                        </div>
                        <div class="form-group">
                            <label>Your Name *</label>
                            <input type="text" name="contactName" required>
                        </div>
                        <div class="form-group">
                            <label>Email *</label>
                            <input type="email" name="email" required>
                        </div>
                        <div class="form-group">
                            <label>Phone (Optional)</label>
                            <input type="tel" name="phone">
                        </div>
                        <div class="form-group">
                            <label>Company Size</label>
                            <select name="companySize">
                                <option value="startup">Startup (1-10 employees)</option>
                                <option value="small">Small (11-50 employees)</option>
                                <option value="medium">Medium (51-200 employees)</option>
                                <option value="large">Large (200+ employees)</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label>Primary Challenge</label>
                            <textarea name="challenge" rows="3" placeholder="Briefly describe your main automation challenge..."></textarea>
                        </div>
                        <button type="submit" class="submit-btn">
                            ${type === 'advisory' ? 'Schedule Consultation' : 'Start Free Trial'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    document.body.style.overflow = 'hidden';
}

function closeContactModal() {
    const modal = document.getElementById('contactModal');
    if (modal) {
        modal.remove();
        document.body.style.overflow = 'auto';
    }
}

async function submitContactForm(event, type) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const contactData = {
        businessName: formData.get('businessName'),
        contactName: formData.get('contactName'),
        email: formData.get('email'),
        phone: formData.get('phone'),
        companySize: formData.get('companySize'),
        challenge: formData.get('challenge'),
        serviceType: type,
        source: 'landing_page',
        timestamp: new Date().toISOString()
    };
    
    // Show loading state
    const submitBtn = event.target.querySelector('.submit-btn');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Submitting...';
    submitBtn.disabled = true;
    
    try {
        // Send to marketing automation system
        const response = await fetch('/api/leads/capture', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(contactData)
        });
        
        if (response.ok) {
            const result = await response.json();
            
            // Store lead ID for future tracking
            localStorage.setItem('omniflow_lead_id', result.leadId);
            
            // Also store locally for backup
            const leads = JSON.parse(localStorage.getItem('omniflow_leads') || '[]');
            leads.push({ ...contactData, leadId: result.leadId });
            localStorage.setItem('omniflow_leads', JSON.stringify(leads));
            
            trackUserAction('contact_form_submitted', { ...contactData, leadId: result.leadId });
            
            // Show success message
            showSuccessMessage(type);
            closeContactModal();
        } else {
            throw new Error('Failed to submit form');
        }
        
    } catch (error) {
        console.error('Error submitting contact form:', error);
        
        // Fallback to local storage if API fails
        const leads = JSON.parse(localStorage.getItem('omniflow_leads') || '[]');
        leads.push(contactData);
        localStorage.setItem('omniflow_leads', JSON.stringify(leads));
        
        submitBtn.textContent = 'Submitted (Offline)';
        setTimeout(() => {
            showSuccessMessage(type);
            closeContactModal();
        }, 1000);
    }
}

function showSuccessMessage(type) {
    const messageHTML = `
        <div class="success-message-overlay" id="successMessage">
            <div class="success-message">
                <div class="success-icon">✅</div>
                <h3>Thank You!</h3>
                <p>${type === 'advisory' ? 
                    'We\'ll contact you within 24 hours to schedule your consultation.' : 
                    'Check your email for trial access instructions.'}</p>
                <button onclick="closeSuccessMessage()" class="success-btn">Continue</button>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', messageHTML);
    
    // Auto-close after 5 seconds
    setTimeout(() => {
        closeSuccessMessage();
    }, 5000);
}

function closeSuccessMessage() {
    const message = document.getElementById('successMessage');
    if (message) {
        message.remove();
    }
}

// Smooth Scrolling for Navigation
function initializeSmoothScrolling() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// Scroll Animations
function initializeAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
            }
        });
    }, observerOptions);
    
    // Observe elements for animation
    document.querySelectorAll('.vertical-card, .value-point, .success-card').forEach(el => {
        observer.observe(el);
    });
}

// Analytics and Tracking
function trackUserAction(action, data = {}) {
    const eventData = {
        action,
        timestamp: new Date().toISOString(),
        page: 'landing',
        ...data
    };
    
    // Store locally for analytics
    const events = JSON.parse(localStorage.getItem('omniflow_events') || '[]');
    events.push(eventData);
    localStorage.setItem('omniflow_events', JSON.stringify(events));
    
    // In production, this would send to your analytics service
    console.log('User Action Tracked:', eventData);
}

// Static Content Updates - NO RANDOM NUMBERS
function updateStatsFromRealData() {
    // Static realistic stats - no random numbers or dynamic changes
    const stats = {
        avgSavings: '15 hours weekly',
        successRate: '90%+ success rate',
        implementationTime: '2-4 weeks'
    };
    
    // Update hero stats if elements exist
    const statNumbers = document.querySelectorAll('.stat-number');
    if (statNumbers.length >= 3) {
        statNumbers[0].textContent = stats.avgSavings;
        statNumbers[1].textContent = stats.successRate;
        statNumbers[2].textContent = stats.implementationTime;
    }
}

// Navigation Active State
function updateNavigationState() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const sectionId = entry.target.id;
                navLinks.forEach(link => {
                    link.classList.toggle('active', link.getAttribute('href') === `#${sectionId}`);
                });
            }
        });
    }, { threshold: 0.5 });
    
    sections.forEach(section => observer.observe(section));
}

// Initialize static updates - NO TIMEOUT FOR CHANGING NUMBERS
// updateStatsFromRealData(); // Disabled to prevent dynamic number changes
updateNavigationState();

// Add CSS for animations and modal
const additionalStyles = `
<style>
.contact-modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.7);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 10000;
    animation: fadeIn 0.3s ease;
}

.contact-modal {
    background: white;
    border-radius: 16px;
    padding: 2rem;
    max-width: 500px;
    width: 90%;
    max-height: 90vh;
    overflow-y: auto;
    animation: slideUp 0.3s ease;
}

.modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.5rem;
    padding-bottom: 1rem;
    border-bottom: 2px solid #e2e8f0;
}

.modal-header h3 {
    color: var(--primary-blue);
    margin: 0;
}

.modal-close {
    background: none;
    border: none;
    font-size: 2rem;
    cursor: pointer;
    color: var(--text-light);
    padding: 0;
    width: 30px;
    height: 30px;
    display: flex;
    align-items: center;
    justify-content: center;
}

.form-group {
    margin-bottom: 1rem;
}

.form-group label {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: 600;
    color: var(--text-dark);
}

.form-group input,
.form-group select,
.form-group textarea {
    width: 100%;
    padding: 0.75rem;
    border: 2px solid #e2e8f0;
    border-radius: 8px;
    font-size: 1rem;
    transition: border-color 0.3s ease;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
    outline: none;
    border-color: var(--primary-blue);
}

.submit-btn {
    width: 100%;
    background: var(--gradient-primary);
    color: white;
    border: none;
    padding: 1rem;
    border-radius: 8px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
}

.submit-btn:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(26, 54, 93, 0.3);
}

.submit-btn:disabled {
    opacity: 0.7;
    cursor: not-allowed;
}

.success-message-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.7);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 10001;
    animation: fadeIn 0.3s ease;
}

.success-message {
    background: white;
    border-radius: 16px;
    padding: 3rem;
    text-align: center;
    max-width: 400px;
    width: 90%;
    animation: slideUp 0.3s ease;
}

.success-icon {
    font-size: 3rem;
    margin-bottom: 1rem;
}

.success-message h3 {
    color: var(--primary-blue);
    margin-bottom: 1rem;
}

.success-message p {
    color: var(--text-medium);
    margin-bottom: 2rem;
}

.success-btn {
    background: var(--gradient-primary);
    color: white;
    border: none;
    padding: 0.75rem 2rem;
    border-radius: 8px;
    font-weight: 600;
    cursor: pointer;
}

.animate-in {
    animation: slideInUp 0.6s ease forwards;
}

@keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
}

@keyframes slideUp {
    from { transform: translateY(30px); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
}

@keyframes slideInUp {
    from { transform: translateY(50px); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
}

.nav-link.active {
    color: var(--primary-blue);
    font-weight: 600;
}
</style>
`;

document.head.insertAdjacentHTML('beforeend', additionalStyles);