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
        const turnstileResponse = document.querySelector('.cf-turnstile');
        const turnstileToken = turnstileResponse?.querySelector('textarea[name="cf-turnstile-response"]')?.value;
        
        if (!turnstileToken) {
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
            const scriptURL = 'YOUR_GOOGLE_APPS_SCRIPT_URL';
            
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
            if (window.turnstile) {
                const widgetId = turnstileResponse?.getAttribute('data-widget-id');
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

