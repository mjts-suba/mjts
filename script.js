// Mobile Menu Toggle
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');

if (hamburger) {
    hamburger.addEventListener('click', () => {
        navMenu.classList.toggle('active');
    });

    // Close menu when clicking on a link
    document.querySelectorAll('.nav-menu a').forEach(link => {
        link.addEventListener('click', () => {
            navMenu.classList.remove('active');
        });
    });
}

// Smooth scrolling for navigation links
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

// Contact Form Handling
const contactForm = document.getElementById('contact-form');
const formMessage = document.getElementById('form-message');

if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // Get form data
        const formData = new FormData(contactForm);
        const name = formData.get('name');
        const email = formData.get('email');
        const phone = formData.get('phone') || 'N/A';
        const message = formData.get('message');
        
        // Get Turnstile token
        let turnstileToken = null;
        
        // Method 1: Check for hidden input by name attribute
        const turnstileTokenInput = document.querySelector('input[name="cf-turnstile-response"]');
        if (turnstileTokenInput && turnstileTokenInput.value) {
            turnstileToken = turnstileTokenInput.value;
        }
        
        // Method 2: Check by ID pattern (fallback)
        if (!turnstileToken) {
            const turnstileInputById = document.querySelector('input[id^="cf-chl-widget"][id$="_response"]');
            if (turnstileInputById && turnstileInputById.value) {
                turnstileToken = turnstileInputById.value;
            }
        }
        
        // Method 3: Try Turnstile API if available
        if (!turnstileToken) {
            const turnstileWidget = document.querySelector('.cf-turnstile');
            if (turnstileWidget && window.turnstile) {
                try {
                    // Get widget ID from data attribute or find it
                    let widgetId = turnstileWidget.getAttribute('data-widget-id');
                    if (!widgetId) {
                        // Try to find widget ID from the input ID
                        const inputId = turnstileTokenInput?.id;
                        if (inputId) {
                            widgetId = inputId.replace('_response', '');
                        }
                    }
                    if (widgetId) {
                        const response = window.turnstile.getResponse(widgetId);
                        if (response) {
                            turnstileToken = response;
                        }
                    }
                } catch (e) {
                    console.log('Turnstile getResponse error:', e);
                }
            }
        }
        
        // Debug log
        console.log('Turnstile token found:', !!turnstileToken, turnstileToken ? turnstileToken.substring(0, 20) + '...' : 'none');
        
        if (!turnstileToken || turnstileToken.trim().length === 0) {
            showMessage('Please complete the security verification.', 'error');
            return;
        }
        
        // Disable submit button
        const submitButton = contactForm.querySelector('button[type="submit"]');
        const originalButtonText = submitButton.textContent;
        submitButton.disabled = true;
        submitButton.textContent = 'Sending...';
        
        try {
            // Replace with your Google Apps Script Web App URL
            const scriptURL = 'https://script.google.com/macros/s/AKfycbw7vA8X0VWaXy_VyRPlDcSV-h79qBXYrcZUwLB78iTRRafJLc1pGH2sLiN9cYKbWSNHtA/exec';
            
            // Prepare data for Google Sheets
            const data = {
                name: name,
                email: email,
                phone: phone,
                message: message,
                timestamp: new Date().toISOString(),
                turnstileToken: turnstileToken
            };
            
            // Send to Google Apps Script
            // Note: Using no-cors mode for cross-origin requests
            // The Google Apps Script will handle the response server-side
            await fetch(scriptURL, {
                method: 'POST',
                mode: 'no-cors',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            });
            
            // Show success message (we can't verify response in no-cors mode,
            // but if no error was thrown, assume success)
            showMessage('Thank you! Your message has been sent successfully. We\'ll get back to you soon.', 'success');
            contactForm.reset();
            
            // Reset Turnstile widget
            const turnstileWidget = document.querySelector('.cf-turnstile');
            if (window.turnstile && turnstileWidget) {
                const widgetId = turnstileWidget.getAttribute('data-widget-id');
                if (widgetId) {
                    window.turnstile.reset(widgetId);
                }
            }
            
        } catch (error) {
            console.error('Error:', error);
            showMessage('Sorry, there was an error sending your message. Please try again later.', 'error');
        } finally {
            submitButton.disabled = false;
            submitButton.textContent = originalButtonText;
        }
    });
}

function showMessage(text, type) {
    formMessage.textContent = text;
    formMessage.className = `form-message ${type}`;
    formMessage.style.display = 'block';
    
    // Scroll to message
    formMessage.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    
    // Hide message after 5 seconds
    setTimeout(() => {
        formMessage.style.display = 'none';
    }, 5000);
}

// Navbar background on scroll
window.addEventListener('scroll', () => {
    const navbar = document.querySelector('.navbar');
    const hero = document.querySelector('.hero');
    const heroHeight = hero ? hero.offsetHeight : 0;
    
    if (window.scrollY > heroHeight - 100) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
});

