// Form validation and submission
document.addEventListener('DOMContentLoaded', () => {
    // Form handling
    const form = document.getElementById('contact-form');
    if (form) {
        form.addEventListener('submit', handleFormSubmit);
    }

    // Mobile menu handling
    const mobileMenuButton = document.querySelector('[data-testid="mobile-menu-button"]');
    const nav = document.getElementById('mainNav');
    if (mobileMenuButton && nav) {
        mobileMenuButton.addEventListener('click', () => {
            mobileMenuButton.classList.toggle('active');
            nav.classList.toggle('active');
        });

        // Close mobile menu when clicking a link
        nav.addEventListener('click', (e) => {
            if (e.target.tagName === 'A') {
                mobileMenuButton.classList.remove('active');
                nav.classList.remove('active');
            }
        });
    }

    // Handle hash changes
    window.addEventListener('hashchange', () => {
        const hash = window.location.hash;
        if (hash) {
            const targetElement = document.querySelector(hash);
            if (targetElement) {
                targetElement.scrollIntoView({ behavior: 'smooth' });
                updateActiveNavLink(document.querySelector(`nav a[href="${hash}"]`));
            }
        }
    });

    // Navigation handling
    const navLinks = document.querySelectorAll('nav a');
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            if (link.getAttribute('href').startsWith('#')) {
                e.preventDefault();
                const targetId = link.getAttribute('href').substring(1);
                const targetElement = document.getElementById(targetId);
                if (targetElement) {
                    targetElement.scrollIntoView({ behavior: 'smooth' });
                    updateActiveNavLink(link);
                    // Update URL hash without triggering scroll
                    history.pushState(null, '', link.getAttribute('href'));
                }
            }
        });
    });

    // Handle initial hash
    if (window.location.hash) {
        const targetElement = document.querySelector(window.location.hash);
        if (targetElement) {
            targetElement.scrollIntoView({ behavior: 'smooth' });
            updateActiveNavLink(document.querySelector(`nav a[href="${window.location.hash}"]`));
        }
    }
});

// Form submission handler
async function handleFormSubmit(event) {
    event.preventDefault();
    
    const form = event.target;
    const formData = new FormData(form);
    clearErrors();

    // Validate form
    const errors = validateForm(formData);
    if (Object.keys(errors).length > 0) {
        displayErrors(errors);
        return;
    }

    // Prepare submission data
    const data = {
        name: formData.get('name'),
        email: formData.get('email'),
        message: formData.get('message')
    };

    try {
        const response = await submitForm(data);
        if (response.ok) {
            showSuccessMessage('Message sent successfully');
            form.reset();
        } else {
            throw new Error('Server error');
        }
    } catch (error) {
        handleSubmissionError(error);
        // Store form data for retry
        localStorage.setItem('pendingFormData', JSON.stringify(data));
    }
}

// Form validation
function validateForm(formData) {
    const errors = {};
    
    if (!formData.get('name')) {
        errors.name = 'Name is required';
    }
    
    const email = formData.get('email');
    if (!email) {
        errors.email = 'Email is required';
    } else if (!isValidEmail(email)) {
        errors.email = 'Please enter a valid email address';
    }
    
    if (!formData.get('message')) {
        errors.message = 'Message is required';
    }
    
    return errors;
}

// Email validation
function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// Display form errors
function displayErrors(errors) {
    Object.keys(errors).forEach(field => {
        const errorElement = document.querySelector(`[data-testid="${field}-error"]`);
        if (errorElement) {
            errorElement.textContent = errors[field];
            errorElement.style.display = 'block';
        }
    });
}

// Clear form errors
function clearErrors() {
    const errorElements = document.querySelectorAll('.error-message');
    errorElements.forEach(element => {
        element.textContent = '';
        element.style.display = 'none';
    });
}

// Submit form data
async function submitForm(data) {
    return fetch('/api/contact', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    });
}

// Handle submission error
function handleSubmissionError(error) {
    const errorMessage = document.querySelector('[data-testid="error-message"]');
    const retryButton = document.querySelector('[data-testid="retry-button"]');
    
    if (errorMessage) {
        errorMessage.textContent = 'An error occurred while sending your message';
        errorMessage.style.display = 'block';
    }
    
    if (retryButton) {
        retryButton.style.display = 'block';
        retryButton.onclick = retrySubmission;
    }
}

// Show success message
function showSuccessMessage(message) {
    const successMessage = document.querySelector('[data-testid="success-message"]');
    if (successMessage) {
        successMessage.textContent = message;
        successMessage.style.display = 'block';
    }
}

// Retry form submission
async function retrySubmission() {
    const pendingData = localStorage.getItem('pendingFormData');
    if (!pendingData) return;

    try {
        const data = JSON.parse(pendingData);
        const response = await submitForm(data);
        
        if (response.ok) {
            showSuccessMessage('Message sent successfully');
            localStorage.removeItem('pendingFormData');
            
            const retryButton = document.querySelector('[data-testid="retry-button"]');
            const errorMessage = document.querySelector('[data-testid="error-message"]');
            
            if (retryButton) retryButton.style.display = 'none';
            if (errorMessage) errorMessage.style.display = 'none';
        } else {
            throw new Error('Server error');
        }
    } catch (error) {
        handleSubmissionError(error);
    }
}

// Update active navigation link
function updateActiveNavLink(activeLink) {
    document.querySelectorAll('nav a').forEach(link => {
        link.classList.remove('active');
    });
    activeLink.classList.add('active');
}

// Offline status handling
window.addEventListener('online', handleOnlineStatus);
window.addEventListener('offline', handleOnlineStatus);

function handleOnlineStatus() {
    const offlineIndicator = document.querySelector('[data-testid="offline-indicator"]');
    if (offlineIndicator) {
        offlineIndicator.style.display = navigator.onLine ? 'none' : 'block';
    }
}
