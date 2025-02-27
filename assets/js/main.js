/**
 * Work at SARP - Commercial Leasing Website
 * Main JavaScript File
 * www.workatsarp.com
 */

document.addEventListener('DOMContentLoaded', function() {
    // Mobile Menu Toggle
    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    const mainNav = document.querySelector('.main-nav');
    
    if (mobileMenuToggle && mainNav) {
        mobileMenuToggle.addEventListener('click', function() {
            mainNav.classList.toggle('active');
            document.body.classList.toggle('menu-open');
        });
    }
    
    // Close mobile menu when clicking outside
    document.addEventListener('click', function(event) {
        if (mainNav && mainNav.classList.contains('active') && 
            !event.target.closest('.main-nav') && 
            !event.target.closest('.mobile-menu-toggle')) {
            mainNav.classList.remove('active');
            document.body.classList.remove('menu-open');
        }
    });
    
    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const targetId = this.getAttribute('href');
            
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                e.preventDefault();
                
                // Close mobile menu if open
                if (mainNav && mainNav.classList.contains('active')) {
                    mainNav.classList.remove('active');
                    document.body.classList.remove('menu-open');
                }
                
                window.scrollTo({
                    top: targetElement.offsetTop - 100,
                    behavior: 'smooth'
                });
            }
        });
    });
    
    // Form validation
    const forms = document.querySelectorAll('form');
    
    forms.forEach(form => {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            let isValid = true;
            const requiredFields = form.querySelectorAll('[required]');
            
            requiredFields.forEach(field => {
                if (!field.value.trim()) {
                    isValid = false;
                    field.classList.add('error');
                } else {
                    field.classList.remove('error');
                }
                
                // Email validation
                if (field.type === 'email' && field.value.trim()) {
                    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                    if (!emailPattern.test(field.value.trim())) {
                        isValid = false;
                        field.classList.add('error');
                    }
                }
            });
            
            if (isValid) {
                // In a real implementation, this would submit the form data
                // For now, we'll just show a success message
                const formContainer = form.closest('.contact-form-container, .contact-form-preview');
                
                if (formContainer) {
                    const originalContent = formContainer.innerHTML;
                    formContainer.innerHTML = `
                        <div class="form-success">
                            <div class="success-icon">
                                <i class="fas fa-check-circle"></i>
                            </div>
                            <h3>Thank You!</h3>
                            <p>Your message has been sent successfully. A member of our leasing team will contact you shortly.</p>
                        </div>
                    `;
                    
                    // For demo purposes, reset the form after 5 seconds
                    setTimeout(() => {
                        formContainer.innerHTML = originalContent;
                        initFormListeners();
                    }, 5000);
                }
            }
        });
        
        // Real-time validation
        const requiredFields = form.querySelectorAll('[required]');
        
        requiredFields.forEach(field => {
            field.addEventListener('blur', function() {
                if (!field.value.trim()) {
                    field.classList.add('error');
                } else {
                    field.classList.remove('error');
                    
                    // Email validation
                    if (field.type === 'email') {
                        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                        if (!emailPattern.test(field.value.trim())) {
                            field.classList.add('error');
                        }
                    }
                }
            });
            
            field.addEventListener('input', function() {
                if (field.value.trim()) {
                    field.classList.remove('error');
                }
            });
        });
    });
    
    function initFormListeners() {
        // Re-initialize form event listeners after form reset
        const forms = document.querySelectorAll('form');
        
        forms.forEach(form => {
            form.addEventListener('submit', function(e) {
                e.preventDefault();
                
                // Form validation logic (same as above)
                // ...
            });
        });
    }
    
    // Add active class to current page in navigation
    const currentPage = window.location.pathname.split('/').pop();
    const navLinks = document.querySelectorAll('.main-nav a');
    
    navLinks.forEach(link => {
        const linkPage = link.getAttribute('href');
        
        if (currentPage === linkPage || 
            (currentPage === '' && linkPage === 'index.html') || 
            (currentPage === '/' && linkPage === 'index.html')) {
            link.classList.add('active');
        }
    });
    
    // Placeholder for map integration
    // In a real implementation, this would initialize a map service like Google Maps
    const mapPlaceholders = document.querySelectorAll('.map-placeholder');
    
    mapPlaceholders.forEach(placeholder => {
        // Add a click event to simulate map interaction
        placeholder.addEventListener('click', function() {
            alert('Map integration would be implemented here in the final version.');
        });
    });
    
    // Placeholder for image gallery functionality
    // In a real implementation, this would initialize a lightbox or gallery plugin
    const galleryItems = document.querySelectorAll('.gallery-item');
    
    galleryItems.forEach(item => {
        item.addEventListener('click', function() {
            const imgSrc = this.querySelector('img').getAttribute('src');
            const imgAlt = this.querySelector('img').getAttribute('alt');
            
            // Simple lightbox effect
            const lightbox = document.createElement('div');
            lightbox.classList.add('lightbox');
            lightbox.innerHTML = `
                <div class="lightbox-content">
                    <span class="lightbox-close">&times;</span>
                    <img src="${imgSrc}" alt="${imgAlt}">
                    <p>${imgAlt}</p>
                </div>
            `;
            
            document.body.appendChild(lightbox);
            document.body.style.overflow = 'hidden';
            
            // Close lightbox when clicking on it
            lightbox.addEventListener('click', function() {
                document.body.removeChild(lightbox);
                document.body.style.overflow = '';
            });
        });
    });
    
    // Add CSS for lightbox
    const style = document.createElement('style');
    style.textContent = `
        .lightbox {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0, 0, 0, 0.9);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 2000;
            cursor: pointer;
        }
        
        .lightbox-content {
            position: relative;
            max-width: 90%;
            max-height: 90%;
        }
        
        .lightbox-content img {
            max-width: 100%;
            max-height: 80vh;
            display: block;
            margin: 0 auto;
        }
        
        .lightbox-content p {
            color: white;
            text-align: center;
            margin-top: 1rem;
        }
        
        .lightbox-close {
            position: absolute;
            top: -40px;
            right: 0;
            color: white;
            font-size: 2rem;
            cursor: pointer;
        }
        
        .form-success {
            text-align: center;
            padding: 2rem;
        }
        
        .success-icon {
            font-size: 4rem;
            color: #28a745;
            margin-bottom: 1rem;
        }
        
        .error {
            border-color: #dc3545 !important;
        }
    `;
    
    document.head.appendChild(style);
});
