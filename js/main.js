// SOLID Principles Applied:
// S - Single Responsibility: Each class has one clear purpose
// O - Open/Closed: Easy to extend with new renderers without modifying existing code
// L - Liskov Substitution: All renderers implement the same interface
// I - Interface Segregation: Small, focused interfaces
// D - Dependency Inversion: High-level modules don't depend on low-level modules

// Data Access Layer - Single Responsibility
class DataRepository {
    async loadSiteData() {
        try {
            const response = await fetch('files/data.json');
            return await response.json();
        } catch (error) {
            console.error('Failed to load site data:', error);
            return null;
        }
    }
}

// DOM Utility - Single Responsibility
class DOMManager {
    static createElement(tag, className = '', content = '') {
        const element = document.createElement(tag);
        if (className) element.className = className;
        if (content) element.innerHTML = content;
        return element;
    }

    static findElement(selector) {
        return document.querySelector(selector);
    }

    static setContent(selector, content) {
        const element = this.findElement(selector);
        if (element) element.innerHTML = content;
    }

    static setTitle(title) {
        document.title = title;
    }
}

// Template Engine - Single Responsibility
class TemplateEngine {
    static renderPersonalSection(personal) {
        return `
            <header>
                <div class="profile-image-container">
                    <img src="images/me.png" alt="${personal.name}" class="profile-image">
                </div>
                <h1 class="name">${personal.name}</h1>
                <p class="title">${personal.title}</p>
            </header>
            <main>
                <p class="bio">${personal.bio}</p>
            </main>
        `;
    }

    static renderInterests(interests) {
        if (!interests || interests.length === 0) return '';
        
        const tags = interests.map(interest => 
            `<span class="interest-tag">${interest}</span>`
        ).join('');
        
        return `<div class="interests">${tags}</div>`;
    }

    static renderExperience(experiences) {
        if (!experiences || experiences.length === 0) {
            return '<div class="loading">No experience data available</div>';
        }

        const items = experiences.map(exp => `
            <div class="experience-item">
                <div class="experience-header">
                    <div>
                        <h3 class="job-title">${exp.title}</h3>
                        <span class="company">${exp.company}</span>
                        ${exp.location ? `<span class="location"> • ${exp.location}</span>` : ''}
                    </div>
                    <span class="duration">${exp.duration}</span>
                </div>
                <p class="job-description">${exp.description}</p>
                ${this.renderAchievements(exp.achievements)}
                ${this.renderSkills(exp.skills)}
            </div>
        `).join('');

        return `
            <section class="resume">
                <h2 class="section-title">Experience</h2>
                <div class="experience-container">${items}</div>
            </section>
        `;
    }

    static renderEducation(educations) {
        if (!educations || educations.length === 0) {
            return '<div class="loading">No education data available</div>';
        }

        const items = educations.map(edu => `
            <div class="education-item">
                <div class="education-header">
                    <div>
                        <h3 class="degree">${edu.degree}</h3>
                        <span class="university">${edu.university}</span>
                        ${edu.location ? `<span class="location"> • ${edu.location}</span>` : ''}
                    </div>
                    <div>
                        <span class="year">${edu.year}</span>
                        ${edu.specialization ? `<span class="gpa">${edu.specialization}</span>` : ''}
                    </div>
                </div>
                <p class="education-description">${edu.description}</p>
            </div>
        `).join('');

        return `
            <h2 class="section-title">Education</h2>
            <div class="education-container">${items}</div>
        `;
    }

    static renderContact(contacts) {
        if (!contacts || contacts.length === 0) {
            return '<div class="loading">No contact information available</div>';
        }

        const links = contacts.map(contact => `
            <a href="${contact.url}" class="contact-link" 
               ${contact.url.startsWith('http') || contact.url.endsWith('.pdf') ? 'target="_blank"' : ''}>
                <span>${contact.icon}</span>
                ${contact.label}
            </a>
        `).join('');

        return `
            <h2 class="section-title">Contact</h2>
            <div class="contact">
                <div class="contact-links">${links}</div>
            </div>
        `;
    }

    static renderAchievements(achievements) {
        if (!achievements || achievements.length === 0) return '';
        
        const items = achievements.map(achievement => `<li>${achievement}</li>`).join('');
        return `
            <div class="achievements">
                <h4 class="achievements-title">Key Achievements:</h4>
                <ul class="achievements-list">${items}</ul>
            </div>
        `;
    }

    static renderSkills(skills) {
        if (!skills || skills.length === 0) return '';
        
        const tags = skills.map(skill => `<span class="skill-tag">${skill}</span>`).join('');
        return `<div class="skills">${tags}</div>`;
    }
}

// Renderer Interface - Interface Segregation
class BaseRenderer {
    constructor(container) {
        this.container = container;
    }

    render(data) {
        throw new Error('render() must be implemented by subclass');
    }
}

// Concrete Renderers - Open/Closed Principle
class PersonalInfoRenderer extends BaseRenderer {
    render(data) {
        if (!data.personal) return;
        
        DOMManager.setTitle(data.personal.name);
        const personalHTML = TemplateEngine.renderPersonalSection(data.personal);
        const interestsHTML = TemplateEngine.renderInterests(data.interests);
        
        this.container.innerHTML = personalHTML;
        
        if (interestsHTML) {
            const main = this.container.querySelector('main');
            main.insertAdjacentHTML('beforeend', interestsHTML);
        }
    }
}

class ExperienceRenderer extends BaseRenderer {
    render(data) {
        if (!data.experience) return;
        
        const experienceHTML = TemplateEngine.renderExperience(data.experience);
        this.container.insertAdjacentHTML('beforeend', experienceHTML);
    }
}

class EducationRenderer extends BaseRenderer {
    render(data) {
        if (!data.education) return;
        
        const educationHTML = TemplateEngine.renderEducation(data.education);
        const resumeSection = this.container.querySelector('.resume');
        if (resumeSection) {
            resumeSection.insertAdjacentHTML('beforeend', educationHTML);
        }
    }
}

class ContactRenderer extends BaseRenderer {
    render(data) {
        if (!data.contact) return;
        
        const contactHTML = TemplateEngine.renderContact(data.contact);
        this.container.insertAdjacentHTML('beforeend', contactHTML);
    }
}

// Effects Management - Single Responsibility
class EffectsManager {
    static initializeCursor() {
        const cursorDot = DOMManager.findElement('.cursor-dot');
        let mouseX = 0, mouseY = 0, dotX = 0, dotY = 0;

        document.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
            if (cursorDot) cursorDot.style.opacity = '0.6';
        });

        document.addEventListener('mouseleave', () => {
            cursorDot.style.opacity = '0';
        });

        const animateCursor = () => {
            dotX += (mouseX - dotX) * 0.1;
            dotY += (mouseY - dotY) * 0.1;
            
            if (cursorDot) {
                cursorDot.style.left = dotX + 'px';
                cursorDot.style.top = dotY + 'px';
            }
            
            requestAnimationFrame(animateCursor);
        };
        animateCursor();
    }

    static initializeParallax() {
        window.addEventListener('mousemove', (e) => {
            const shapes = document.querySelectorAll('.floating-shape');
            const x = e.clientX / window.innerWidth;
            const y = e.clientY / window.innerHeight;

            shapes.forEach((shape, index) => {
                const speed = (index + 1) * 0.5;
                const xOffset = (x - 0.5) * speed * 20;
                const yOffset = (y - 0.5) * speed * 20;
                
                shape.style.transform = `translate(${xOffset}px, ${yOffset}px)`;
            });
        });
    }

    static initializeHoverEffects() {
        document.querySelectorAll('.interest-tag, .contact-link').forEach(element => {
            element.addEventListener('mouseenter', function() {
                this.style.transform = 'translateY(-3px) scale(1.02)';
            });
            
            element.addEventListener('mouseleave', function() {
                this.style.transform = 'translateY(0) scale(1)';
            });
        });
    }

    static initializeScrollIndicator() {
        window.addEventListener('scroll', () => {
            const scrollIndicator = DOMManager.findElement('.scroll-indicator');
            const scrollPercent = window.scrollY / (document.documentElement.scrollHeight - window.innerHeight);
            
            scrollIndicator.style.opacity = scrollPercent > 0.1 ? '0' : '0.6';
        });
    }

    static initializeTypingEffect() {
        setTimeout(() => {
            const nameElement = DOMManager.findElement('.name');
            if (!nameElement) return;
            
            if (!nameElement) return;
            const originalText = nameElement.textContent;
            nameElement.textContent = '';
            
            let i = 0;
            const typeWriter = () => {
                if (i < originalText.length) {
                    nameElement.textContent += originalText.charAt(i);
                    i++;
                    setTimeout(typeWriter, 100);
                }
            };
            typeWriter();
        }, 1000);
    }
}

// Main Application Controller - Dependency Inversion
class PersonalSiteApp {
    constructor() {
        this.dataRepository = new DataRepository();
        this.container = DOMManager.findElement('.container');
        
        // Renderer pipeline - Open/Closed Principle
        this.renderers = [
            new PersonalInfoRenderer(this.container),
            new ExperienceRenderer(this.container),
            new EducationRenderer(this.container),
            new ContactRenderer(this.container)
        ];
    }

    async initialize() {
        try {
            // Show loading state
            this.container.innerHTML = '<div class="loading">Loading...</div>';
            
            // Load data
            const data = await this.dataRepository.loadSiteData();
            if (!data) {
                this.container.innerHTML = '<div class="loading">Failed to load site data</div>';
                return;
            }

            // Clear loading state
            this.container.innerHTML = '';

            // Render all sections using the pipeline
            this.renderers.forEach(renderer => renderer.render(data));

            // Initialize effects
            this.initializeEffects();

        } catch (error) {
            console.error('Failed to initialize site:', error);
            this.container.innerHTML = '<div class="loading">Error loading site</div>';
        }
    }

    initializeEffects() {
        EffectsManager.initializeCursor();
        EffectsManager.initializeParallax();
        EffectsManager.initializeScrollIndicator();
        EffectsManager.initializeTypingEffect();
        
        // Initialize hover effects after DOM is ready
        setTimeout(() => EffectsManager.initializeHoverEffects(), 100);
    }
}

// Application Bootstrap
document.addEventListener('DOMContentLoaded', () => {
    const app = new PersonalSiteApp();
    app.initialize();
});

// Initialize resume data loading
async function initializeResume() {
    // Show loading state
    const expContainer = document.getElementById('experience-container');
    const eduContainer = document.getElementById('education-container');
    
    if (expContainer) expContainer.innerHTML = '<div class="loading">Loading experience...</div>';
    if (eduContainer) eduContainer.innerHTML = '<div class="loading">Loading education...</div>';

    // Load and render data
    const dataRepository = new DataRepository();
    const data = await dataRepository.loadSiteData();
    if (expContainer) new ExperienceRenderer(expContainer).render(data);
    if (eduContainer) new EducationRenderer(eduContainer).render(data);
}

// Custom cursor effect
function initializeCursor() {
    const cursorDot = document.getElementById('cursorDot');
    let mouseX = 0;
    let mouseY = 0;
    let dotX = 0;
    let dotY = 0;

    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        if (cursorDot) cursorDot.style.opacity = '0.6';
    });

    document.addEventListener('mouseleave', () => {
        if (cursorDot) cursorDot.style.opacity = '0';
    });

    function animateCursor() {
        dotX += (mouseX - dotX) * 0.1;
        dotY += (mouseY - dotY) * 0.1;
        
        if (cursorDot) {
            cursorDot.style.left = dotX + 'px';
            cursorDot.style.top = dotY + 'px';
        }
        
        requestAnimationFrame(animateCursor);
    }
    animateCursor();
}

// Smooth parallax effect for floating shapes
function initializeParallax() {
    window.addEventListener('mousemove', (e) => {
        const shapes = document.querySelectorAll('.floating-shape');
        const x = e.clientX / window.innerWidth;
        const y = e.clientY / window.innerHeight;

        shapes.forEach((shape, index) => {
            const speed = (index + 1) * 0.5;
            const xOffset = (x - 0.5) * speed * 20;
            const yOffset = (y - 0.5) * speed * 20;
            
            shape.style.transform = `translate(${xOffset}px, ${yOffset}px)`;
        });
    });
}

// Add hover effects to interactive elements
function initializeHoverEffects() {
    // Set up hover effects for existing elements
    document.querySelectorAll('.interest-tag, .contact-link').forEach(element => {
        element.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-3px) scale(1.02)';
        });
        
        element.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
        });
    });
}

// Smooth scroll reveal effect
function initializeScrollEffects() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);
}

// Add typing effect to name
function initializeTypingEffect() {
    const nameElement = document.querySelector('.name');
    if (!nameElement) return;
    
    const originalText = nameElement.textContent;
    nameElement.textContent = '';
    
    setTimeout(() => {
        let i = 0;
        const typeWriter = () => {
            if (i < originalText.length) {
                nameElement.textContent += originalText.charAt(i);
                i++;
                setTimeout(typeWriter, 100);
            }
        };
        typeWriter();
    }, 500);
}

// Hide scroll indicator when scrolling
function initializeScrollIndicator() {
    window.addEventListener('scroll', () => {
        const scrollIndicator = document.querySelector('.scroll-indicator');
        const scrollPercent = window.scrollY / (document.documentElement.scrollHeight - window.innerHeight);
        
        if (scrollPercent > 0.1) {
            scrollIndicator.style.opacity = '0';
        } else {
            scrollIndicator.style.opacity = '0.6';
        }
    });
}

// Initialize all functionality when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    initializeResume();
    initializeCursor();
    initializeParallax();
    initializeHoverEffects();
    initializeScrollEffects();
    initializeTypingEffect();
    initializeScrollIndicator();
    console.log('Alex personal site initialized successfully... do not forget to get in touch! ;)');
});