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
        this.container.innerHTML = '<div class="loading">Loading...</div>';
    }

    showError() {
        this.container.innerHTML = '<div class="loading">Error loading site</div>';
    }

    render(data) {
        // Limpiar el contenedor
        this.container.innerHTML = '';
        
        // Establecer el título de la página
        if (data.personal && data.personal.name) {
            document.title = data.personal.name;
            // Renderizar la sección personal
            this.container.insertAdjacentHTML('beforeend', this.renderPersonal(data.personal));
        }

        // Renderizar la sección de experiencia
        if (data.experience && data.experience.length > 0) {
            const experienceSection = {
                id: 'experience',
                title: 'Experience',
                type: 'timeline',
                items: data.experience
            };
            this.container.insertAdjacentHTML('beforeend', this.renderSection(experienceSection));
        }

        // Renderizar la sección de educación
        if (data.education && data.education.length > 0) {
            const educationSection = {
                id: 'education',
                title: 'Education',
                type: 'timeline',
                items: data.education
            };
            this.container.insertAdjacentHTML('beforeend', this.renderSection(educationSection));
        }

        // Renderizar la sección de intereses (extraída de 'personal')
        if (data.personal && data.personal.interests && data.personal.interests.length > 0) {
            const interestsSection = {
                id: 'interests',
                title: 'Interests',
                type: 'tags',
                items: data.personal.interests
            };
            this.container.insertAdjacentHTML('beforeend', this.renderSection(interestsSection));
        }

        // Renderizar la sección de contacto (ahora desde personal.contact)
        if (data.personal && data.personal.contact && data.personal.contact.length > 0) {
            const contactSection = {
                id: 'contact',
                title: 'Contact',
                type: 'links',
                items: data.personal.contact
            };
            this.container.insertAdjacentHTML('beforeend', this.renderSection(contactSection));
        }
    }

    renderPersonal(personal) {
        return `
            <header>
                <img src="${personal.image}" alt="${personal.name}" class="profile-image">
                <h1 class="name">${personal.name}</h1>
                <p class="title">${personal.title}</p>
            </header>
            <main>
                <p class="bio">${personal.bio}</p>
            </main>
        `;
    }

    renderSection(section) {
        if (section.type === 'tags') {
            return this.renderTagsSection(section);
        } else if (section.type === 'links') {
            return this.renderContactSection(section);
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

    renderContactSection(section) {
        const links = section.items.map(item => {
            const target = item.url.startsWith('http') || item.url.endsWith('.pdf') ? 'target="_blank"' : '';
            return `
                <a href="${item.url}" class="contact-link" ${target}>
                    <span>${item.icon}</span>
                    ${item.label}
                </a>
            `;
        }).join('');

        const titleContent = section.link 
            ? `<a href="#${section.link}" class="section-title-link">${section.title}</a>`
            : section.title;

        return `
            <section class="contact" id="${section.id}">
                <h2 class="section-title">${titleContent}</h2>
                <div class="contact-links">${links}</div>
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
        this.initCursor();
        this.initParallax();
        this.initScroll();
        this.initHover();
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

    initCursor() {
        const dot = document.querySelector('.cursor-dot');
        if (!dot) return;

        let mouseX = 0, mouseY = 0, dotX = 0, dotY = 0;

        document.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
            dot.style.opacity = '0.6';
        });

        const animate = () => {
            dotX += (mouseX - dotX) * 0.1;
            dotY += (mouseY - dotY) * 0.1;
            dot.style.left = dotX + 'px';
            dot.style.top = dotY + 'px';
            requestAnimationFrame(animate);
        };
        animate();
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
}

document.addEventListener('DOMContentLoaded', () => {
    new PersonalSite().init();
});