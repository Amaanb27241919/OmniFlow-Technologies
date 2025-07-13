// Smooth Page Transitions for OmniFlow Tech
document.addEventListener('DOMContentLoaded', function() {
    // Initialize page transitions
    initPageTransitions();
    
    // Initialize scroll-triggered animations
    initScrollAnimations();
    
    // Initialize smooth navigation
    initSmoothNavigation();
    
    // Initialize intersection observer for animations
    initIntersectionObserver();
});

// Page transition initialization
function initPageTransitions() {
    // Add page transition class to body
    document.body.classList.add('page-transition');
    
    // Trigger page load animation
    setTimeout(() => {
        document.body.classList.add('loaded');
        
        // Trigger individual element animations
        triggerElementAnimations();
    }, 100);
}

// Trigger animations for elements with animation classes
function triggerElementAnimations() {
    const animatedElements = document.querySelectorAll('.fade-in, .slide-in-left, .slide-in-right, .slide-in-up, .scale-in');
    
    animatedElements.forEach((element, index) => {
        setTimeout(() => {
            element.style.animationDelay = `${index * 0.1}s`;
            element.style.animationFillMode = 'both';
        }, index * 100);
    });
}

// Initialize scroll-triggered animations
function initScrollAnimations() {
    const sections = document.querySelectorAll('section');
    
    sections.forEach(section => {
        section.style.opacity = '0';
        section.style.transform = 'translateY(30px)';
        section.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    });
    
    // Animate hero section immediately
    const heroSection = document.querySelector('.hero-section');
    if (heroSection) {
        setTimeout(() => {
            heroSection.style.opacity = '1';
            heroSection.style.transform = 'translateY(0)';
        }, 200);
    }
}

// Initialize intersection observer for scroll animations
function initIntersectionObserver() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -100px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
                
                // Animate child elements with stagger
                const childElements = entry.target.querySelectorAll('.step-card, .about-stat, .stat');
                childElements.forEach((child, index) => {
                    setTimeout(() => {
                        child.style.transform = 'translateY(0)';
                        child.style.opacity = '1';
                    }, index * 150);
                });
            }
        });
    }, observerOptions);
    
    // Observe all sections except hero
    const sections = document.querySelectorAll('section:not(.hero-section)');
    sections.forEach(section => {
        observer.observe(section);
    });
}

// Initialize smooth navigation
function initSmoothNavigation() {
    const navLinks = document.querySelectorAll('a[href^="#"]');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href').substring(1);
            const targetSection = document.getElementById(targetId);
            
            if (targetSection) {
                // Add loading animation
                showTransitionLoader();
                
                // Smooth scroll to section
                targetSection.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
                
                // Update active nav link
                updateActiveNavLink(this);
                
                // Hide loading animation
                setTimeout(() => {
                    hideTransitionLoader();
                }, 800);
            }
        });
    });
}

// Update active navigation link
function updateActiveNavLink(activeLink) {
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.classList.remove('active');
    });
    activeLink.classList.add('active');
}

// Show transition loader
function showTransitionLoader() {
    const loader = document.createElement('div');
    loader.id = 'transition-loader';
    loader.innerHTML = '<div class="loading-spinner"></div>';
    loader.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        z-index: 10000;
        background: rgba(255, 255, 255, 0.9);
        padding: 20px;
        border-radius: 50%;
        backdrop-filter: blur(10px);
    `;
    
    document.body.appendChild(loader);
}

// Hide transition loader
function hideTransitionLoader() {
    const loader = document.getElementById('transition-loader');
    if (loader) {
        loader.remove();
    }
}

// Enhanced button animations
document.addEventListener('DOMContentLoaded', function() {
    const buttons = document.querySelectorAll('.primary-cta, .primary-cta-large, .cta-button');
    
    buttons.forEach(button => {
        button.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-2px)';
            this.style.boxShadow = '0 10px 30px rgba(59, 130, 246, 0.3)';
        });
        
        button.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
            this.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.1)';
        });
        
        button.addEventListener('click', function() {
            // Add click animation
            this.style.transform = 'translateY(0) scale(0.98)';
            
            setTimeout(() => {
                this.style.transform = 'translateY(-2px) scale(1)';
            }, 150);
        });
    });
});

// Page transition effects for navigation
function navigateWithTransition(url) {
    // Add exit animation
    document.body.style.opacity = '0';
    document.body.style.transform = 'translateY(-20px)';
    
    setTimeout(() => {
        window.location.href = url;
    }, 300);
}

// Enhanced card animations
document.addEventListener('DOMContentLoaded', function() {
    const cards = document.querySelectorAll('.step-card, .about-stat, .resource-category');
    
    cards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-5px)';
            this.style.boxShadow = '0 15px 40px rgba(0, 0, 0, 0.15)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
            this.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.08)';
        });
    });
});

// Initialize staggered animations for multiple elements
function initStaggeredAnimations() {
    const staggerGroups = document.querySelectorAll('.steps-grid, .about-stats, .hero-stats');
    
    staggerGroups.forEach(group => {
        const children = group.children;
        
        Array.from(children).forEach((child, index) => {
            child.style.animationDelay = `${index * 0.2}s`;
            child.classList.add('slide-in-up');
        });
    });
}

// Call staggered animations after page load
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(initStaggeredAnimations, 500);
});