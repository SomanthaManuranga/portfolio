// Mobile Menu Toggle
const hamburger = document.getElementById('hamburger');
const navMenu = document.getElementById('nav-menu');

hamburger.addEventListener('click', () => {
    navMenu.classList.toggle('active');
    hamburger.classList.toggle('active');
});

// Close mobile menu when clicking on a link
document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
        navMenu.classList.remove('active');
        hamburger.classList.remove('active');
    });
});

// Navbar scroll effect
const navbar = document.getElementById('navbar');
let lastScroll = 0;

window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;
    
    if (currentScroll > 100) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
    
    lastScroll = currentScroll;
});

// Smooth scroll for all anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        
        if (target) {
            const offsetTop = target.offsetTop - 80; // Account for fixed navbar
            window.scrollTo({
                top: offsetTop,
                behavior: 'smooth'
            });
        }
    });
});

let lastScrollTop = 0;
let scrollDirection = 'down';

// 1. Detect Scroll Direction
window.addEventListener('scroll', () => {
    let st = window.pageYOffset || document.documentElement.scrollTop;
    if (st > lastScrollTop) {
        scrollDirection = 'down';
    } else {
        scrollDirection = 'up';
    }
    lastScrollTop = st <= 0 ? 0 : st;
}, false);

// 2. Updated Observer for Directional Animations
const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            // Remove any old direction classes first
            entry.target.classList.remove('from-down', 'from-up');
            
            // Add the current direction class + active
            if (scrollDirection === 'down') {
                entry.target.classList.add('from-down');
            } else {
                entry.target.classList.add('from-up');
            }
            entry.target.classList.add('active');
        } else {
            // Reset when leaving screen
            entry.target.classList.remove('active', 'from-down', 'from-up');
        }
    });
}, {
    threshold: 0.1,
    rootMargin: "0px 0px -50px 0px"
});

// 3. Include the new 'reveal-dynamic' class in the search
const allAnimatedElements = document.querySelectorAll('.reveal, .reveal-zoom, .reveal-left, .reveal-right, .reveal-dynamic');

allAnimatedElements.forEach(el => {
    revealObserver.observe(el);
});

// Active navigation link on scroll
const sections = document.querySelectorAll('section');
const navLinks = document.querySelectorAll('.nav-link');

window.addEventListener('scroll', () => {
    let current = '';
    
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        
        if (window.pageYOffset >= sectionTop - 200) {
            current = section.getAttribute('id');
        }
    });
    
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${current}`) {
            link.classList.add('active');
        }
    });
});

// FIXED Typing effect that preserves HTML/Colors
const heroTitle = document.querySelector('.hero-title');
if (heroTitle) {
    const nameHighlight = document.querySelector('.name-highlight');
    const nameText = nameHighlight.textContent;
    const greetingText = "Hey, I'm ";
    
    // Clear the title
    heroTitle.innerHTML = '';
    
    let i = 0;
    function typeGreeting() {
        if (i < greetingText.length) {
            heroTitle.innerHTML += greetingText.charAt(i);
            i++;
            setTimeout(typeGreeting, 50);
        } else {
            // After greeting is done, create the colored span
            const span = document.createElement('span');
            span.className = 'name-highlight';
            heroTitle.appendChild(span);
            typeName(span);
        }
    }

    let j = 0;
    function typeName(spanElement) {
        if (j < nameText.length) {
            spanElement.innerHTML += nameText.charAt(j);
            j++;
            setTimeout(() => typeName(spanElement), 50);
        }
    }

    window.addEventListener('load', () => {
        setTimeout(typeGreeting, 500);
    });
}

// Parallax effect for hero section
window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    const hero = document.querySelector('.hero');
    
    if (hero) {
        hero.style.transform = `translateY(${scrolled * 0.5}px)`;
    }
});

// Add cursor pointer effect on project cards
const projectCards = document.querySelectorAll('.project-card');
projectCards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        
        const rotateX = (y - centerY) / 20;
        const rotateY = (centerX - x) / 20;
        
        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-10px)`;
    });
    
    card.addEventListener('mouseleave', () => {
        card.style.transform = '';
    });
});

// Skills animation on hover
const skillItems = document.querySelectorAll('.skill-item');
skillItems.forEach(item => {
    item.addEventListener('mouseenter', () => {
        const icon = item.querySelector('i');
        icon.style.transform = 'scale(1.3) rotate(10deg)';
        icon.style.transition = 'transform 0.3s ease';
    });
    
    item.addEventListener('mouseleave', () => {
        const icon = item.querySelector('i');
        icon.style.transform = 'scale(1) rotate(0deg)';
    });
});

// Add loading animation
window.addEventListener('load', () => {
    document.body.classList.add('loaded');
    
    // Remove preloader if you add one
    const preloader = document.querySelector('.preloader');
    if (preloader) {
        preloader.style.opacity = '0';
        setTimeout(() => {
            preloader.style.display = 'none';
        }, 500);
    }
});

// Console message for developers
console.log('%c🚀 Welcome to my portfolio!', 'color: #3b82f6; font-size: 20px; font-weight: bold;');
console.log('%cBuilt with ❤️ using HTML, CSS & JavaScript', 'color: #8b5cf6; font-size: 14px;');
console.log('%cInterested in the code? Check out my GitHub!', 'color: #06b6d4; font-size: 14px;');

// Easter egg - Konami code
let konamiCode = [];
const konamiPattern = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];

document.addEventListener('keydown', (e) => {
    konamiCode.push(e.key);
    konamiCode = konamiCode.slice(-konamiPattern.length);
    
    if (konamiCode.join('') === konamiPattern.join('')) {
        document.body.style.animation = 'rainbow 2s linear infinite';
        setTimeout(() => {
            document.body.style.animation = '';
        }, 5000);
    }
});

// Form validation (if you add a contact form)
const contactForm = document.querySelector('.contact-form');
if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const name = contactForm.querySelector('input[name="name"]').value;
        const email = contactForm.querySelector('input[name="email"]').value;
        const message = contactForm.querySelector('textarea[name="message"]').value;
        
        if (name && email && message) {
            alert('Thank you for your message! I will get back to you soon.');
            contactForm.reset();
        } else {
            alert('Please fill in all fields.');
        }
    });
}

// Back to top button
const backToTopButton = document.createElement('button');
backToTopButton.innerHTML = '<i class="fas fa-arrow-up"></i>';
backToTopButton.className = 'back-to-top';
backToTopButton.style.cssText = `
    position: fixed;
    bottom: 30px;
    right: 30px;
    width: 50px;
    height: 50px;
    background: linear-gradient(135deg, #3b82f6, #8b5cf6);
    color: white;
    border: none;
    border-radius: 50%;
    cursor: pointer;
    opacity: 0;
    transition: opacity 0.3s ease, transform 0.3s ease;
    z-index: 999;
    font-size: 1.2rem;
    box-shadow: 0 4px 15px rgba(59, 130, 246, 0.4);
`;

document.body.appendChild(backToTopButton);

window.addEventListener('scroll', () => {
    if (window.pageYOffset > 500) {
        backToTopButton.style.opacity = '1';
        backToTopButton.style.transform = 'scale(1)';
    } else {
        backToTopButton.style.opacity = '0';
        backToTopButton.style.transform = 'scale(0.8)';
    }
});

backToTopButton.addEventListener('click', () => {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
});

backToTopButton.addEventListener('mouseenter', () => {
    backToTopButton.style.transform = 'scale(1.1)';
});

backToTopButton.addEventListener('mouseleave', () => {
    backToTopButton.style.transform = 'scale(1)';
});


// ===== MANUAL CERTIFICATION SLIDER WITH OPTIONAL AUTO-PLAY =====
const slides = document.querySelectorAll('.cert-slide');
const progressFill = document.querySelector('.progress-fill');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const dotsContainer = document.getElementById('sliderDots');

let currentSlide = 0;
const slideDuration = 10000; // 10 seconds (increase if you want longer auto-play)
let autoPlayInterval;
const AUTO_PLAY = false; // Set to true if you want auto-play, false for manual only

// Create dots dynamically
function createDots() {
    slides.forEach((_, index) => {
        const dot = document.createElement('span');
        dot.classList.add('dot');
        if (index === 0) dot.classList.add('active');
        dot.addEventListener('click', () => goToSlide(index));
        dotsContainer.appendChild(dot);
    });
}

// Show specific slide
function showSlide(index) {
    slides.forEach(slide => slide.classList.remove('active'));
    slides[index].classList.add('active');
    
    // Update dots
    document.querySelectorAll('.dot').forEach((dot, i) => {
        dot.classList.toggle('active', i === index);
    });
    
    // Update button states
    updateButtons();
    
    // Reset progress bar
    if (AUTO_PLAY && progressFill) {
        progressFill.style.transition = 'none';
        progressFill.style.width = '0%';
        setTimeout(() => {
            progressFill.style.transition = `width ${slideDuration}ms linear`;
            progressFill.style.width = '100%';
        }, 50);
    }
}

// Go to specific slide
function goToSlide(index) {
    currentSlide = index;
    showSlide(currentSlide);
    
    // Reset auto-play timer
    if (AUTO_PLAY) {
        clearInterval(autoPlayInterval);
        startAutoPlay();
    }
}

// Next slide
function nextSlide() {
    currentSlide = (currentSlide + 1) % slides.length;
    showSlide(currentSlide);
}

// Previous slide
function prevSlide() {
    currentSlide = (currentSlide - 1 + slides.length) % slides.length;
    showSlide(currentSlide);
}

// Update button states (optional: disable at first/last slide)
function updateButtons() {
    // Uncomment these lines if you want to disable buttons at ends
    // prevBtn.disabled = currentSlide === 0;
    // nextBtn.disabled = currentSlide === slides.length - 1;
}

// Auto-play functionality
function startAutoPlay() {
    if (AUTO_PLAY) {
        autoPlayInterval = setInterval(nextSlide, slideDuration);
    }
}

// Initialize slider
if (slides.length > 0) {
    createDots();
    showSlide(0);
    
    // Add event listeners
    if (prevBtn) prevBtn.addEventListener('click', prevSlide);
    if (nextBtn) nextBtn.addEventListener('click', nextSlide);
    
    // Start auto-play if enabled
    if (AUTO_PLAY) {
        startAutoPlay();
        
        // Pause auto-play on hover
        const sliderContainer = document.querySelector('.cert-slider-container');
        if (sliderContainer) {
            sliderContainer.addEventListener('mouseenter', () => {
                clearInterval(autoPlayInterval);
            });
            sliderContainer.addEventListener('mouseleave', () => {
                startAutoPlay();
            });
        }
    }
    
    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft') prevSlide();
        if (e.key === 'ArrowRight') nextSlide();
    });
}


// --- STRIPE-INSPIRED NEURAL NETWORK ANIMATION ---
const canvas = document.getElementById('neural-canvas');
const ctx = canvas.getContext('2d');

let particles = [];
const particleCount = 80; // Adjust for density
const connectionDistance = 150;
const mouse = { x: null, y: null, radius: 150 };

// Resize Canvas
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

// Track Mouse
window.addEventListener('mousemove', (event) => {
    mouse.x = event.x;
    mouse.y = event.y;
});

class Particle {
    constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 2 + 1;
        this.baseX = this.x;
        this.baseY = this.y;
        this.density = (Math.random() * 30) + 1;
        this.speedX = (Math.random() * 1) - 0.5;
        this.speedY = (Math.random() * 1) - 0.5;
    }

    draw() {
        ctx.fillStyle = 'rgba(59, 130, 246, 0.8)'; // Blue dots
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.closePath();
        ctx.fill();
    }

    update() {
        // Natural drift
        this.x += this.speedX;
        this.y += this.speedY;

        // Bounce off walls
        if (this.x > canvas.width || this.x < 0) this.speedX *= -1;
        if (this.y > canvas.height || this.y < 0) this.speedY *= -1;

        // Mouse interaction (push effect)
        let dx = mouse.x - this.x;
        let dy = mouse.y - this.y;
        let distance = Math.sqrt(dx * dx + dy * dy);
        if (distance < mouse.radius) {
            this.x -= dx / 20;
            this.y -= dy / 20;
        }
    }
}

function init() {
    particles = [];
    for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle());
    }
}

function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    for (let i = 0; i < particles.length; i++) {
        particles[i].draw();
        particles[i].update();
        
        // Connect lines
        for (let j = i; j < particles.length; j++) {
            const dx = particles[i].x - particles[j].x;
            const dy = particles[i].y - particles[j].y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < connectionDistance) {
                // Create Gradient for the line (Stripe Orange to Blue)
                const opacity = 1 - (distance / connectionDistance);
                ctx.strokeStyle = `rgba(59, 130, 246, ${opacity * 0.5})`; // Blue lines
                
                // If particles are near the bottom, make them orange/amber
                if (particles[i].y > canvas.height * 0.6) {
                    ctx.strokeStyle = `rgba(245, 158, 11, ${opacity * 0.5})`; // Amber lines
                }

                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.moveTo(particles[i].x, particles[i].y);
                ctx.lineTo(particles[j].x, particles[j].y);
                ctx.stroke();
            }
        }
    }
    requestAnimationFrame(animate);
}

init();
animate();

// Typewriter effect — works with inner <span>
window.addEventListener('load', () => {
    const nameEl = document.querySelector('.hero-title');
    if (!nameEl) return;

    const staticText = "Hey, I'm ";
    const highlightText = "Somantha Manuranga";

    nameEl.style.opacity = '1';
    nameEl.style.animation = 'none';
    nameEl.style.transform = 'none';
    nameEl.innerHTML = '';

    let i = 0;

    function type() {
        if (i <= staticText.length) {
            nameEl.innerHTML = staticText.slice(0, i) +
                '<span class="name-highlight"></span>';
            i++;
            setTimeout(type, 50);
        } else {
            const j = i - staticText.length;
            if (j <= highlightText.length) {
                nameEl.innerHTML = staticText +
                    '<span class="name-highlight">' +
                    highlightText.slice(0, j) + '</span>';
                i++;
                setTimeout(type, 50);
            }
        }
    }

    setTimeout(type, 300);
});