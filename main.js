// Simple, clean implementation - KISS principle
class PersonalSite {
    constructor() {
        this.container = document.querySelector('.container');
    }

    async init() {
        try {
            this.showLoading();
            const data = await this.loadData();
            if (!data) {
                this.showError();
                return;
            }
            this.render(data);
            this.initEffects();
        } catch (error) {
            console.error('Site initialization failed:', error);
            this.showError();
        }
    }

    async loadData() {
        try {
            const response = await fetch('data/data.json');
            return await response.json();
        } catch (error) {
            console.error('Failed to load data:', error);
            return null;
        }
    }

    showLoading() {
        this.container.innerHTML = '<div class="loading"><img src="/images/loading.gif" alt="Loading...">Loading...</div>';
    }

    showError() {
        this.container.innerHTML = '<div class="loading">Error loading site</div>';
    }

    render(data) {
  
        this.container.innerHTML = '';
        
        if (data.personal && data.personal.name) {
            document.title = data.personal.name;
            this.container.insertAdjacentHTML('beforeend', this.renderPersonal(data.personal));
        }

        if (data.experience && data.experience.length > 0) {
            const experienceSection = {
                id: 'experience',
                title: 'Experience',
                type: 'timeline',
                items: data.experience
            };
            this.container.insertAdjacentHTML('beforeend', this.renderSection(experienceSection));
        }
        if (data.education && data.education.length > 0) {
            const educationSection = {
                id: 'education',
                title: 'Education',
                type: 'timeline',
                items: data.education
            };
            this.container.insertAdjacentHTML('beforeend', this.renderSection(educationSection));
        }

        if (data.thoughts && data.thoughts.length > 0) {
            const thoughtsSection = {
                id: 'thoughts',
                title: 'Thoughts',
                type: 'timeline',
                items: data.thoughts
            };
            this.container.insertAdjacentHTML('beforeend', this.renderSection(thoughtsSection));
        }

        if (data.projects && data.projects.length > 0) {
            const projectsSection = {
                id: 'projects',
                title: 'Projects',
                type: 'timeline',
                items: data.projects
            };
            this.container.insertAdjacentHTML('beforeend', this.renderSection(projectsSection));
        }
    }

    renderPersonal(personal) {
        return `
            <section id="personal">
                <header>
                <img class="profile-image" src="${personal.image}" alt="${personal.name}" />
                <h1 class="name">${personal.name}</h1>
                <p class="title">${personal.title}</p>
                </header>
                <main>
                <p class="bio">${personal.bio}</p>
                ${personal.contact ? `
                <div class="contact-links">
                    ${personal.contact.map(item => `
                    <a href="${item.url}" class="contact-link" ${item.url ? 'target="_blank"' : ''}>
                    <div class="contact-item">
                        <img src="${item.icon}" alt="${item.label}" class="contact-icon" />
                    </div>
                    </a>
                    `).join('')}
                </div>
                ` : ''}
                </main>
            </section>
        `;
    }


    renderSection(section) {
        if (section.type === 'tags') {
            return this.renderTagsSection(section);
        } else {
            return this.renderTimelineSection(section);
        }
    }

    renderTagsSection(section) {
        const tags = section.items.map(item => `<span class="tag">${item}</span>`).join('');
        const titleContent = section.link 
            ? `<a href="#${section.link}" class="section-title-link">${section.title}</a>`
            : section.title;
        
        return `
            <section class="section tags" id="${section.id}">
                <h2 class="section-title">${titleContent}</h2>
                <div class="section-content">${tags}</div>
            </section>
        `;
    }

    renderTimelineSection(section) {
        const items = section.items.map(item => `
            <div class="item">
                <div class="item-header">
                    <div>
                        <h3 class="item-title">${item.title}</h3>
                        <span class="item-subtitle">${item.subtitle}</span>
                        ${item.location ? `<span class="item-location"> • ${item.location}</span>` : ''}
                    </div>
                    ${item.duration ? `<span class="item-duration">${item.duration}</span>` : ''}
                </div>
                ${item.description ? `<p class="item-description">${item.description}</p>` : ''}
                ${item.details ? this.renderDetails(item.details) : ''}
                ${item.tags ? this.renderTags(item.tags) : ''}
            </div>
        `).join('');

        const titleContent = section.link 
            ? `<a href="#${section.link}" class="section-title-link">${section.title}</a>`
            : section.title;

        return `
            <section class="section timeline" id="${section.id}">
                <h2 class="section-title">${titleContent}</h2>
                <div class="section-content">${items}</div>
            </section>
        `;
    }

    renderDetails(details) {
        const items = details.map(detail => `<li>${detail}</li>`).join('');
        return `<ul class="item-details">${items}</ul>`;
    }

    renderTags(tags) {
        const tagElements = tags.map(tag => `<span class="tag">${tag}</span>`).join('');
        return `<div class="item-tags">${tagElements}</div>`;
    }

    initEffects() {
        this.initTyping();
        // this.initCursor();
        this.initParallax();
        this.initScroll();
        this.initHover();
        this.initFloatingMenu();
    }

    initTyping() {
        setTimeout(() => {
            const nameEl = document.querySelector('.name');
            if (!nameEl) return;

            const text = nameEl.textContent;
            nameEl.textContent = '';

            let i = 0;
            const type = () => {
                if (i < text.length) {
                    nameEl.textContent += text.charAt(i++);
                    setTimeout(type, 100);
                }
            };
            type();
        }, 1000);
    }

    initParallax() {
        document.addEventListener('mousemove', (e) => {
            const shapes = document.querySelectorAll('.floating-shape');
            const x = e.clientX / window.innerWidth;
            const y = e.clientY / window.innerHeight;

            shapes.forEach((shape, i) => {
                const speed = (i + 1) * 0.5;
                const xOffset = (x - 0.5) * speed * 20;
                const yOffset = (y - 0.5) * speed * 20;
                shape.style.transform = `translate(${xOffset}px, ${yOffset}px)`;
            });
        });
    }

    initScroll() {
        const indicator = document.querySelector('.scroll-indicator');
        if (!indicator) return;

        window.addEventListener('scroll', () => {
            const percent = window.scrollY / (document.documentElement.scrollHeight - window.innerHeight);
            indicator.style.opacity = percent > 0.1 ? '0' : '0.6';
        });
    }

    initHover() {
        setTimeout(() => {
            document.querySelectorAll('.tag, .contact-link').forEach(el => {
                el.addEventListener('mouseenter', () => {
                    el.style.transform = 'translateY(-3px) scale(1.02)';
                });
                el.addEventListener('mouseleave', () => {
                    el.style.transform = 'translateY(0) scale(1)';
                });
            });
        }, 200);
    }

    initFloatingMenu() {
        const menuLinks = document.querySelectorAll('.menu-link');
        const sections = document.querySelectorAll('section[id]');
        
        // Smooth scroll for menu links
        menuLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = link.getAttribute('href').substring(1);
                const targetSection = document.getElementById(targetId);
                
                if (targetSection) {
                    targetSection.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });

        // Intersection Observer for active section highlighting
        const observerOptions = {
            root: null,
            rootMargin: '-20% 0px -60% 0px',
            threshold: 0
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    // Remove active class from all menu links
                    menuLinks.forEach(link => link.classList.remove('active'));
                    
                    // Add active class to current section's menu link
                    const targetLink = document.querySelector(`[data-section="${entry.target.id}"]`);
                    if (targetLink) {
                        targetLink.classList.add('active');
                    }
                }
            });
        }, observerOptions);

        // Observe all sections
        sections.forEach(section => {
            observer.observe(section);
        });

        // Set initial active state
        setTimeout(() => {
            const firstVisibleSection = document.querySelector('section[id]');
            if (firstVisibleSection) {
                const firstLink = document.querySelector(`[data-section="${firstVisibleSection.id}"]`);
                if (firstLink) {
                    firstLink.classList.add('active');
                }
            }
        }, 1000);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new PersonalSite().init();
});