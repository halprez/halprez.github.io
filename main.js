// Simple, clean implementation - KISS principle
class PersonalSite {
    constructor() {
        this.container = document.querySelector('.container');
    }

    async init() {
        try {
            this.showLoading();
            await i18n.load(i18n.locale);
            this.render(i18n.data);
            this.initEffects();

            i18n.onChange((data) => {
                this.render(data);
                this.updateNavLabels();
                this.initEffects();
            });
        } catch (error) {
            console.error('Site initialization failed:', error);
            this.showError();
        }
    }

    showLoading() {
        const text = i18n.t('ui.loading') || 'Loading...';
        this.container.innerHTML = `<div class="loading">${text}</div>`;
    }

    showError() {
        const text = i18n.t('ui.error') || 'Error loading site';
        this.container.innerHTML = `<div class="loading">${text}</div>`;
    }

    updateNavLabels() {
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.dataset.i18n;
            const val = i18n.t(key);
            if (val) el.textContent = val;
        });
        document.documentElement.lang = i18n.locale;
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
                title: i18n.t('ui.experience'),
                type: 'timeline',
                items: data.experience
            };
            this.container.insertAdjacentHTML('beforeend', this.renderSection(experienceSection));
        }
        if (data.education && data.education.length > 0) {
            const educationSection = {
                id: 'education',
                title: i18n.t('ui.education'),
                type: 'timeline',
                items: data.education
            };
            this.container.insertAdjacentHTML('beforeend', this.renderSection(educationSection));

            if (data.skills && data.skills.length > 0) {
                const skillsSection = {
                    id: 'skills',
                    title: i18n.t('ui.skills'),
                    type: 'tags',
                    items: data.skills
                };
                this.container.insertAdjacentHTML('beforeend', this.renderSection(skillsSection));
            }
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
                title: i18n.t('ui.sideProjects'),
                type: 'timeline',
                items: data.projects
            };
            this.container.insertAdjacentHTML('beforeend', this.renderSection(projectsSection));
        }

        if (data.games && data.games.length > 0) {
            const gamesSection = {
                id: 'games',
                title: i18n.t('ui.games'),
                type: 'timeline',
                items: data.games
            };
            this.container.insertAdjacentHTML('beforeend', this.renderSection(gamesSection));
        }

        this.updateNavLabels();
    }

    renderPersonal(personal) {
        const t = (k) => i18n.t(k);
        return `
            <div class="window site-window">
                <div class="title-bar">
                    <button aria-label="${t('ui.close')}" class="close"></button>
                    <h1 class="title">${t('ui.about')}</h1>
                    <button aria-label="${t('ui.resize')}" class="resize"></button>
                </div>
                <div class="separator"></div>
                <div class="window-pane">
                    <section id="personal">
                        <header>
                        <h1 class="name">${personal.name}</h1>
                        <p class="role">${personal.title}</p>
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
                            <a href="#" class="contact-link" id="btn-download-cv">
                            <div class="contact-item">
                                <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24'%3E%3Cpath d='M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z'/%3E%3C/svg%3E" alt="${t('ui.downloadCV')}" class="contact-icon" />
                            </div>
                            </a>
                        </div>
                        ` : ''}
                        </main>
                    </section>
                </div>
            </div>
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
        const t = (k) => i18n.t(k);
        const tags = section.items.map(item => `<span class="tag">${item}</span>`).join('');
        const titleContent = section.link
            ? `<a href="#${section.link}" class="section-title-link">${section.title}</a>`
            : section.title;

        return `
            <div class="window site-window">
                <div class="title-bar">
                    <button aria-label="${t('ui.close')}" class="close"></button>
                    <h1 class="title">${section.title}</h1>
                    <button aria-label="${t('ui.resize')}" class="resize"></button>
                </div>
                <div class="separator"></div>
                <div class="window-pane">
                    <section class="section tags" id="${section.id}">
                        <h2 class="section-title">${titleContent}</h2>
                        <div class="section-content">${tags}</div>
                    </section>
                </div>
            </div>
        `;
    }

    renderTimelineSection(section) {
        const t = (k) => i18n.t(k);
        const items = section.items.map(item => {
            const href = item.url || '#';
            const actionAttr = item.action ? `data-action="${item.action}"` : '';
            return `
            <a href="${href}" class="item-link" ${actionAttr}>
                <div class="item">
                    <div class="item-header">
                        <div>
                            <h3 class="item-title">${item.title}</h3>
                            <span class="item-subtitle">${item.subtitle || ''}</span>
                            ${item.location ? `<span class="item-location"> • ${item.location}</span>` : ''}
                        </div>
                        ${item.duration ? `<span class="item-duration">${item.duration}</span>` : ''}
                    </div>
                    ${item.description ? `<p class="item-description">${item.description}</p>` : ''}
                    ${item.details ? this.renderDetails(item.details) : ''}
                    ${item.tags ? this.renderTags(item.tags) : ''}
                </div>
            </a>`;
        }).join('');

        const titleContent = section.link
            ? `<a href="#${section.link}" class="section-title-link">${section.title}</a>`
            : section.title;

        return `
            <div class="window site-window">
                <div class="title-bar">
                    <button aria-label="${t('ui.close')}" class="close"></button>
                    <h1 class="title">${section.title}</h1>
                    <button aria-label="${t('ui.resize')}" class="resize"></button>
                </div>
                <div class="separator"></div>
                <div class="window-pane">
                    <section class="section timeline" id="${section.id}">
                        <h2 class="section-title">${titleContent}</h2>
                        <div class="section-content">${items}</div>
                    </section>
                </div>
            </div>
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
        this.initParallax();
        this.initScroll();
        this.initHover();
        this.initFloatingMenu();
        this.initDockAutoHide();
        this.initThemeSwitcher();
        this.initLangSwitcher();
        this.initGames();
        this.initDownloadCV();
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

        menuLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = link.getAttribute('href').substring(1);
                const targetSection = document.getElementById(targetId);

                if (targetSection) {
                    const isMobile = window.innerWidth <= 1024;
                    const offset = isMobile ? 100 : 50;

                    const elementPosition = targetSection.getBoundingClientRect().top;
                    const offsetPosition = elementPosition + window.pageYOffset - offset;

                    window.scrollTo({
                        top: offsetPosition,
                        behavior: 'smooth'
                    });
                }
            });
        });

        const isMobile = window.innerWidth <= 1024;
        const observerOptions = {
            root: null,
            rootMargin: isMobile ? '-100px 0px -200px 0px' : '-50px 0px -50% 0px',
            threshold: [0, 0.1, 0.5, 0.9]
        };

        const observer = new IntersectionObserver((entries) => {
            let mostVisibleSection = null;
            let highestRatio = 0;

            entries.forEach(entry => {
                if (entry.isIntersecting && entry.intersectionRatio > highestRatio) {
                    mostVisibleSection = entry.target;
                    highestRatio = entry.intersectionRatio;
                }
            });

            if (mostVisibleSection) {
                menuLinks.forEach(link => link.classList.remove('active'));

                const targetLink = document.querySelector(`[data-section="${mostVisibleSection.id}"]`);
                if (targetLink) {
                    targetLink.classList.add('active');
                }
            }
        }, observerOptions);

        sections.forEach(section => {
            observer.observe(section);
        });

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

    initDockAutoHide() {
        if (window.innerWidth <= 1024) return;

        const menu = document.querySelector('.floating-menu');
        if (!menu) return;

        let hideTimeout;
        let isMenuVisible = false;

        const showMenu = () => {
            clearTimeout(hideTimeout);
            if (!isMenuVisible) {
                menu.classList.add('show');
                isMenuVisible = true;
            }
        };

        const hideMenu = () => {
            hideTimeout = setTimeout(() => {
                menu.classList.remove('show');
                isMenuVisible = false;
            }, 1000);
        };

        document.addEventListener('mousemove', (e) => {
            const bottomThreshold = window.innerHeight - 150;

            if (e.clientY > bottomThreshold) {
                showMenu();
            } else {
                hideMenu();
            }
        });

        menu.addEventListener('mouseenter', () => {
            clearTimeout(hideTimeout);
            showMenu();
        });

        menu.addEventListener('mouseleave', () => {
            hideMenu();
        });

        window.addEventListener('resize', () => {
            if (window.innerWidth <= 1024) {
                menu.classList.remove('show');
                isMenuVisible = false;
            }
        });
    }

    initThemeSwitcher() {
        const themeButtons = document.querySelectorAll('.theme-button');
        const validThemes = ['light', 'dark', 'retro', 'system'];

        let savedTheme = localStorage.getItem('selectedTheme') || 'light';
        if (!validThemes.includes(savedTheme)) savedTheme = 'light';

        this.setTheme(savedTheme);

        themeButtons.forEach(button => {
            const theme = button.dataset.theme;
            if (theme === savedTheme) button.classList.add('active');

            button.addEventListener('click', () => {
                themeButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
                this.setTheme(theme);
                localStorage.setItem('selectedTheme', theme);
            });
        });
    }

    setTheme(theme) {
        document.body.setAttribute('data-theme', theme);
    }

    initLangSwitcher() {
        const langButtons = document.querySelectorAll('.lang-button');

        langButtons.forEach(btn => {
            if (btn.dataset.lang === i18n.locale) btn.classList.add('active');
            else btn.classList.remove('active');

            btn.addEventListener('click', () => {
                const lang = btn.dataset.lang;
                if (lang === i18n.locale) return;

                langButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                i18n.load(lang);
            });
        });
    }

    initDownloadCV() {
        const btn = document.getElementById('btn-download-cv');
        if (!btn) return;
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            this.generatePDF();
        });
    }

    generatePDF() {
        const container = this.container;
        const name = i18n.t('personal.name') || 'CV';

        const clone = document.createElement('div');
        clone.style.cssText = 'position:absolute;top:0;left:0;width:700px;background:#fff;padding:1rem;z-index:10000;font-family:Helvetica Neue,Arial,sans-serif;font-size:10pt;line-height:1.5;color:#222;';
        clone.innerHTML = container.innerHTML;

        // Remove games section and download button
        clone.querySelectorAll('#games, #btn-download-cv').forEach(el => {
            const parent = el.closest('.site-window') || el.closest('.contact-link') || el;
            parent.remove();
        });

        // Hide window chrome
        clone.querySelectorAll('.title-bar, .separator').forEach(el => el.remove());

        // Force all text visible with inline styles (beats any theme CSS)
        clone.querySelectorAll('*').forEach(el => {
            el.style.color = '#222';
            el.style.webkitTextFillColor = '#222';
            el.style.background = 'transparent';
            el.style.boxShadow = 'none';
            el.style.textShadow = 'none';
            el.style.animation = 'none';
            el.style.opacity = '1';
            el.style.visibility = 'visible';
        });

        // Style specific elements
        clone.style.background = '#fff';
        clone.querySelectorAll('.site-window').forEach(el => { el.style.border = 'none'; el.style.marginBottom = '0.3rem'; });
        clone.querySelectorAll('.window-pane').forEach(el => { el.style.padding = '0'; el.style.overflow = 'visible'; el.style.maxHeight = 'none'; });
        clone.querySelectorAll('.section-title').forEach(el => { el.style.fontSize = '13pt'; el.style.fontWeight = '700'; el.style.borderBottom = '2px solid #222'; el.style.paddingBottom = '2px'; el.style.marginBottom = '6px'; el.style.textTransform = 'uppercase'; el.style.letterSpacing = '1px'; });
        clone.querySelectorAll('.section-title::after, .section-title:after').forEach(el => el.remove());
        clone.querySelectorAll('.item').forEach(el => { el.style.border = 'none'; el.style.borderLeft = '2px solid #ddd'; el.style.padding = '2px 0 2px 10px'; el.style.marginBottom = '4px'; el.style.borderRadius = '0'; });
        clone.querySelectorAll('.tag').forEach(el => { el.style.border = '1px solid #ccc'; el.style.fontSize = '8pt'; el.style.padding = '1px 5px'; el.style.borderRadius = '2px'; el.style.color = '#555'; el.style.webkitTextFillColor = '#555'; });

        const nameEl = clone.querySelector('.name');
        if (nameEl) { nameEl.style.fontSize = '24pt'; nameEl.style.fontWeight = '700'; nameEl.style.backgroundClip = 'unset'; nameEl.style.webkitBackgroundClip = 'unset'; }

        const roleEl = clone.querySelector('.role');
        if (roleEl) { roleEl.style.fontSize = '11pt'; roleEl.style.color = '#555'; roleEl.style.webkitTextFillColor = '#555'; roleEl.style.textTransform = 'uppercase'; roleEl.style.letterSpacing = '0.5px'; }

        document.body.appendChild(clone);
        window.scrollTo(0, 0);

        html2pdf().set({
            margin: [10, 12, 10, 12],
            filename: `${name.replace(/\s+/g, '_')}_CV.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2, useCORS: true, backgroundColor: '#ffffff', scrollY: 0 },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
            pagebreak: { mode: ['avoid-all', 'css', 'legacy'] },
        }).from(clone).save().then(() => {
            clone.remove();
        });
    }

    initGames() {
        document.querySelectorAll('[data-action="arkanoid"]').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                this.game = new ArkanoidGame(this.container);
                this.game.start();
            });
        });

        document.addEventListener('arkanoid-exit', () => {
            this.initEffects();
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new PersonalSite().init();
});
