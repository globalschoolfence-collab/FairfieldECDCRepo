// ==========================================
// FAIRFIELD EDUCATION CENTER
// Main JavaScript File
// ==========================================

// Mobile Menu Toggle
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');

if (hamburger) {
    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        navMenu.classList.toggle('active');
    });

    // Close menu when a link is clicked
    document.querySelectorAll('.nav-menu a').forEach(link => {
        link.addEventListener('click', () => {
            hamburger.classList.remove('active');
            navMenu.classList.remove('active');
        });
    });
}

// Set active nav link based on current page
function setActiveNavLink() {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.nav-menu a').forEach(link => {
        const href = link.getAttribute('href');
        if (href === currentPage || (currentPage === '' && href === 'index.html')) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
}

// Call on page load
document.addEventListener('DOMContentLoaded', setActiveNavLink);

// Form Validation
const contactForm = document.querySelector('.contact-form');
const careersForm = document.querySelector('.careers-form');

if (contactForm) {
    contactForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        if (!contactForm.checkValidity()) {
            alert('Please fill in all required fields');
            return;
        }

        const emailEl = contactForm.querySelector('input[type="email"]');
        if (emailEl && !isValidEmail(emailEl.value.trim())) {
            alert('Please enter a valid email address');
            return;
        }

        const phoneEl = contactForm.querySelector('input[name="phone"]');
        if (phoneEl && phoneEl.value.trim() && !isValidPhone(phoneEl.value.trim())) {
            alert('Please enter a valid phone number');
            return;
        }

        await submitFormData(contactForm, 'Thank you for your message! We will get back to you soon.');
    });
}

if (careersForm) {
    careersForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        if (!careersForm.checkValidity()) {
            alert('Please fill in all required fields');
            return;
        }

        const emailEl = careersForm.querySelector('input[type="email"]');
        if (emailEl && !isValidEmail(emailEl.value.trim())) {
            alert('Please enter a valid email address');
            return;
        }

        const phoneEl = careersForm.querySelector('input[name="phone"]');
        if (phoneEl && !isValidPhone(phoneEl.value.trim())) {
            alert('Please enter a valid phone number');
            return;
        }

        await submitFormData(careersForm, 'Thank you for your application! Our hiring team will contact you shortly.');
    });
}

async function submitFormData(form, successMessage) {
    const formData = new FormData(form);
    const actionUrl = form.getAttribute('action');

    if (!actionUrl) {
        alert('Form action is not configured. Please contact the site administrator.');
        return;
    }

    try {
        const response = await fetch(actionUrl, {
            method: 'POST',
            body: formData
        });

        if (response.ok) {
            alert(successMessage);
            form.reset();
            return;
        }

        const json = await response.json();
        alert(json?.error || 'Unable to send your message. Please try again later.');
    } catch (error) {
        console.error('Form submission error:', error);
        alert('Unable to send your message. Please try again later.');
    }
}

// Email validation
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function isValidPhone(phone) {
    const digits = phone.replace(/\D/g, '');
    if (digits.length !== 10) return false;
    if (/^(\d)\1{9}$/.test(digits)) return false;
    return true;
}

// Admissions form validation
const admissionsForm = document.querySelector('.admissions-form');
if (admissionsForm) {
    admissionsForm.addEventListener('submit', function(e) {
        e.preventDefault();
        if (!admissionsForm.checkValidity()) {
            alert('Please fill in all required fields');
            return;
        }

        const emailEl = admissionsForm.querySelector('input[type="email"]');
        if (emailEl && !isValidEmail(emailEl.value.trim())) {
            alert('Please enter a valid email address');
            return;
        }

        alert('Thank you for submitting your application! Our admissions team will contact you shortly.');
        admissionsForm.reset();
    });
}

// Smooth scrolling for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
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

// Scroll animation - fade in elements
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
};

const observer = new IntersectionObserver(function(entries) {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.animation = 'fadeIn 0.6s ease forwards';
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

// Observe all cards and sections
document.querySelectorAll('.card, .program-card, .feature-box, .location-card, .testimonial-card').forEach(el => {
    el.style.opacity = '0';
    observer.observe(el);
});

// Counter animation for stats
function animateCounter(element, target, duration = 2000) {
    let current = 0;
    const increment = target / (duration / 16);
    const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
            element.textContent = target + '+';
            clearInterval(timer);
        } else {
            element.textContent = Math.floor(current) + '+';
        }
    }, 16);
}

// Testimonials carousel (if needed)
let testimonialIndex = 0;

function showTestimonial(n) {
    const testimonials = document.querySelectorAll('.testimonial-card');
    if (testimonials.length === 0) return;
    
    if (n >= testimonials.length) testimonialIndex = 0;
    if (n < 0) testimonialIndex = testimonials.length - 1;
    
    testimonials.forEach(t => t.style.display = 'none');
    testimonials[testimonialIndex].style.display = 'block';
}

// Age calculator for admission
function calculateAge() {
    const dobInput = document.querySelector('#child-dob');
    const ageInput = document.querySelector('#child-age');
    
    if (dobInput && ageInput) {
        dobInput.addEventListener('change', function() {
            const dob = new Date(this.value);
            const today = new Date();
            let age = today.getFullYear() - dob.getFullYear();
            const monthDiff = today.getMonth() - dob.getMonth();
            
            if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
                age--;
            }
            
            ageInput.value = age;
        });
    }
}

document.addEventListener('DOMContentLoaded', calculateAge);

// Simple image gallery
function setupGallery() {
    const galleryItems = document.querySelectorAll('.gallery-item');
    
    galleryItems.forEach(item => {
        item.addEventListener('click', function() {
            // Add lightbox effect or modal if needed
            console.log('Gallery item clicked');
        });
    });
}

setupGallery();

// Lazy loading for images
if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.classList.remove('lazy');
                imageObserver.unobserve(img);
            }
        });
    });
    
    document.querySelectorAll('img.lazy').forEach(img => imageObserver.observe(img));
}

// Scroll to top button
const scrollTopBtn = document.querySelector('.scroll-top-btn');

if (scrollTopBtn) {
    window.addEventListener('scroll', () => {
        if (window.scrollY > 300) {
            scrollTopBtn.style.display = 'block';
        } else {
            scrollTopBtn.style.display = 'none';
        }
    });
    
    scrollTopBtn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}

console.log('Fairfield Education Center - Website loaded successfully!');

// ===== Location selector/filter for locations page =====
function setupLocationFilter() {
    const select = document.getElementById('locationSelect');
    if (!select) return;

    // Use all location cards on the page to be robust against markup nesting
    const cards = Array.from(document.querySelectorAll('.location-detail-card'));
    const container = document.getElementById('locationsContainer') || document.body;

    // Populate select options if not provided in markup
    // Populate options from card data-location values (skip empty option)
    const existing = Array.from(select.options).map(o => o.value).filter(v => v);
    if (existing.length === 0) {
        const names = [...new Set(cards.map(c => (c.dataset.location||'').trim()).filter(Boolean))];
        names.forEach(name => {
            const opt = document.createElement('option');
            opt.value = name;
            opt.textContent = name;
            select.appendChild(opt);
        });
    }

    // Always attach handler
    select.addEventListener('change', function() {
        const val = (this.value || '').trim();
        if (!val) {
            cards.forEach(c => { c.classList.remove('hidden'); c.style.display = ''; });
            return;
        }

        const lower = val.toLowerCase();
        cards.forEach(c => {
            const name = (c.dataset.location || '').trim().toLowerCase();
            if (name === lower) {
                c.classList.remove('hidden');
                c.style.display = '';
            } else {
                c.classList.add('hidden');
                c.style.display = 'none';
            }
        });

        // Scroll selected into view
        const target = cards.find(el => (el.dataset.location||'').trim().toLowerCase() === lower);
        if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setupLocationFilter);
} else {
    setupLocationFilter();
}
