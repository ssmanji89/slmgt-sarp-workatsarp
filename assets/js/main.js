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
    
    // Hero Carousel
    const heroSlides = document.querySelectorAll('.hero-slide');
    const heroDots = document.querySelectorAll('.hero-dot');
    const heroPrev = document.querySelector('.hero-prev');
    const heroNext = document.querySelector('.hero-next');
    let currentSlide = 0;
    let slideInterval;
    
    // Initialize carousel
    function initCarousel() {
        if (heroSlides.length > 0) {
            // Start automatic slideshow
            startSlideshow();
            
            // Add event listeners for controls
            if (heroPrev) {
                heroPrev.addEventListener('click', prevSlide);
            }
            
            if (heroNext) {
                heroNext.addEventListener('click', nextSlide);
            }
            
            // Add event listeners for dots
            heroDots.forEach((dot, index) => {
                dot.addEventListener('click', () => {
                    goToSlide(index);
                });
            });
            
            // Pause slideshow on hover
            const heroSection = document.querySelector('.hero');
            if (heroSection) {
                heroSection.addEventListener('mouseenter', () => {
                    clearInterval(slideInterval);
                });
                
                heroSection.addEventListener('mouseleave', () => {
                    startSlideshow();
                });
                
                // Touch swipe support for mobile
                let touchStartX = 0;
                let touchEndX = 0;
                
                heroSection.addEventListener('touchstart', (e) => {
                    touchStartX = e.changedTouches[0].screenX;
                    // Pause slideshow on touch
                    clearInterval(slideInterval);
                }, { passive: true });
                
                heroSection.addEventListener('touchend', (e) => {
                    touchEndX = e.changedTouches[0].screenX;
                    handleSwipe();
                    // Resume slideshow after touch
                    startSlideshow();
                }, { passive: true });
                
                function handleSwipe() {
                    const swipeThreshold = 50; // Minimum distance to be considered a swipe
                    if (touchEndX < touchStartX - swipeThreshold) {
                        // Swipe left, go to next slide
                        nextSlide();
                    } else if (touchEndX > touchStartX + swipeThreshold) {
                        // Swipe right, go to previous slide
                        prevSlide();
                    }
                }
            }
            
            // Keyboard navigation for accessibility
            document.addEventListener('keydown', (e) => {
                if (e.key === 'ArrowLeft') {
                    prevSlide();
                } else if (e.key === 'ArrowRight') {
                    nextSlide();
                }
            });
            
            // Add ARIA attributes for accessibility
            heroSlides.forEach((slide, index) => {
                slide.setAttribute('aria-hidden', index === currentSlide ? 'false' : 'true');
                slide.setAttribute('role', 'tabpanel');
                slide.setAttribute('id', `slide-${index}`);
            });
            
            heroDots.forEach((dot, index) => {
                dot.setAttribute('aria-label', `Go to slide ${index + 1}`);
                dot.setAttribute('role', 'tab');
                dot.setAttribute('aria-controls', `slide-${index}`);
                dot.setAttribute('aria-selected', index === currentSlide ? 'true' : 'false');
            });
            
            if (heroPrev) {
                heroPrev.setAttribute('aria-label', 'Previous slide');
            }
            
            if (heroNext) {
                heroNext.setAttribute('aria-label', 'Next slide');
            }
        }
    }
    
    // Go to specific slide
    function goToSlide(index) {
        // Remove active class from all slides and dots
        heroSlides.forEach((slide, i) => {
            slide.classList.remove('active');
            // Update ARIA attributes
            slide.setAttribute('aria-hidden', 'true');
        });
        
        heroDots.forEach((dot, i) => {
            dot.classList.remove('active');
            // Update ARIA attributes
            dot.setAttribute('aria-selected', 'false');
        });
        
        // Add active class to current slide and dot
        heroSlides[index].classList.add('active');
        heroDots[index].classList.add('active');
        
        // Update ARIA attributes for the active slide and dot
        heroSlides[index].setAttribute('aria-hidden', 'false');
        heroDots[index].setAttribute('aria-selected', 'true');
        
        // Update current slide index
        currentSlide = index;
        
        // Announce slide change to screen readers
        const liveRegion = document.getElementById('carousel-live-region') || createLiveRegion();
        liveRegion.textContent = `Slide ${index + 1} of ${heroSlides.length}`;
    }
    
    // Create a live region for screen reader announcements
    function createLiveRegion() {
        const liveRegion = document.createElement('div');
        liveRegion.id = 'carousel-live-region';
        liveRegion.setAttribute('aria-live', 'polite');
        liveRegion.setAttribute('aria-atomic', 'true');
        liveRegion.className = 'sr-only';
        document.body.appendChild(liveRegion);
        return liveRegion;
    }
    
    // Go to next slide
    function nextSlide() {
        let nextIndex = currentSlide + 1;
        if (nextIndex >= heroSlides.length) {
            nextIndex = 0;
        }
        goToSlide(nextIndex);
    }
    
    // Go to previous slide
    function prevSlide() {
        let prevIndex = currentSlide - 1;
        if (prevIndex < 0) {
            prevIndex = heroSlides.length - 1;
        }
        goToSlide(prevIndex);
    }
    
    // Start automatic slideshow
    function startSlideshow() {
        clearInterval(slideInterval);
        slideInterval = setInterval(() => {
            nextSlide();
        }, 5000); // Change slide every 5 seconds
    }
    
    // Initialize carousel
    initCarousel();
    
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
                // Get form data
                const formData = new FormData(form);
                const formDataObj = {};
                formData.forEach((value, key) => {
                    formDataObj[key] = value;
                });
                
                // Get form container for showing success/error messages
                const formContainer = form.closest('.contact-form-container, .contact-form-preview');
                const originalContent = formContainer ? formContainer.innerHTML : '';
                
                // Show loading state
                const submitButton = form.querySelector('button[type="submit"]');
                const originalButtonText = submitButton.textContent;
                submitButton.disabled = true;
                submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
                
                // In a real implementation, this would be an actual API endpoint
                // For demonstration purposes, we're simulating an API call
                setTimeout(() => {
                    // Simulate successful form submission
                    console.log('Form data submitted:', formDataObj);
                    
                    // Show success message
                    if (formContainer) {
                        formContainer.innerHTML = `
                            <div class="form-success">
                                <div class="success-icon">
                                    <i class="fas fa-check-circle"></i>
                                </div>
                                <h3>Thank You!</h3>
                                <p>Your message has been sent successfully. A member of our leasing team will contact you shortly.</p>
                                <button class="btn btn-primary mt-4 reset-form">Send Another Message</button>
                            </div>
                        `;
                        
                        // Add event listener to the "Send Another Message" button
                        const resetButton = formContainer.querySelector('.reset-form');
                        if (resetButton) {
                            resetButton.addEventListener('click', () => {
                                formContainer.innerHTML = originalContent;
                                initFormListeners();
                            });
                        }
                    } else {
                        // Reset form if no container is found
                        form.reset();
                        submitButton.disabled = false;
                        submitButton.textContent = originalButtonText;
                        
                        // Show alert if no container is available
                        alert('Thank you! Your message has been sent successfully.');
                    }
                }, 1500); // Simulate network delay
                
                // In a real implementation, you would use fetch or XMLHttpRequest:
                /*
                fetch('https://api.workatsarp.com/submit-inquiry', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(formDataObj),
                })
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Network response was not ok');
                    }
                    return response.json();
                })
                .then(data => {
                    // Show success message
                    if (formContainer) {
                        formContainer.innerHTML = `
                            <div class="form-success">
                                <div class="success-icon">
                                    <i class="fas fa-check-circle"></i>
                                </div>
                                <h3>Thank You!</h3>
                                <p>Your message has been sent successfully. A member of our leasing team will contact you shortly.</p>
                                <button class="btn btn-primary mt-4 reset-form">Send Another Message</button>
                            </div>
                        `;
                        
                        // Add event listener to the "Send Another Message" button
                        const resetButton = formContainer.querySelector('.reset-form');
                        if (resetButton) {
                            resetButton.addEventListener('click', () => {
                                formContainer.innerHTML = originalContent;
                                initFormListeners();
                            });
                        }
                    } else {
                        // Reset form if no container is found
                        form.reset();
                        submitButton.disabled = false;
                        submitButton.textContent = originalButtonText;
                    }
                })
                .catch(error => {
                    console.error('Error:', error);
                    
                    // Show error message
                    if (formContainer) {
                        formContainer.innerHTML = `
                            <div class="form-error">
                                <div class="error-icon">
                                    <i class="fas fa-exclamation-circle"></i>
                                </div>
                                <h3>Oops!</h3>
                                <p>Something went wrong while sending your message. Please try again later or contact us directly.</p>
                                <button class="btn btn-primary mt-4 reset-form">Try Again</button>
                            </div>
                        `;
                        
                        // Add event listener to the "Try Again" button
                        const resetButton = formContainer.querySelector('.reset-form');
                        if (resetButton) {
                            resetButton.addEventListener('click', () => {
                                formContainer.innerHTML = originalContent;
                                initFormListeners();
                            });
                        }
                    } else {
                        // Reset form if no container is found
                        submitButton.disabled = false;
                        submitButton.textContent = originalButtonText;
                        
                        // Show alert if no container is available
                        alert('Error: Something went wrong while sending your message. Please try again later.');
                    }
                });
                */
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
    
    // Google Maps integration
    // The map is now embedded directly in the HTML using an iframe
    // This function can be used to add additional map functionality if needed
    function initMap() {
        // Get all map embed containers
        const mapEmbeds = document.querySelectorAll('.map-embed');
        
        if (mapEmbeds.length > 0) {
            // Add click event to open Google Maps in a new tab when clicked
            mapEmbeds.forEach(mapEmbed => {
                mapEmbed.addEventListener('click', function(e) {
                    // Only open if clicking on the map itself, not on controls
                    if (e.target.tagName !== 'BUTTON' && !e.target.closest('button')) {
                        // Get the iframe src
                        const iframe = this.querySelector('iframe');
                        if (iframe) {
                            const src = iframe.getAttribute('src');
                            // Extract the location from the src
                            const locationMatch = src.match(/!1m2!1s([^!]+)/);
                            if (locationMatch && locationMatch[1]) {
                                // Open Google Maps in a new tab
                                window.open(`https://www.google.com/maps/place/${locationMatch[1]}`, '_blank');
                            } else {
                                // Fallback to a direct Google Maps search
                                window.open('https://www.google.com/maps/search/12121+Greenspoint+Dr,+Houston,+TX+77064', '_blank');
                            }
                        }
                    }
                });
            });
        }
    }
    
    // Initialize map functionality
    initMap();
    
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
