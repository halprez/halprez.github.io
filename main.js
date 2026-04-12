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

        if (data.softSkills && data.softSkills.length > 0) {
            const softSkillsSection = {
                id: 'softSkills',
                title: i18n.t('ui.softSkills'),
                type: 'tags',
                items: data.softSkills
            };
            this.container.insertAdjacentHTML('beforeend', this.renderSection(softSkillsSection));
        }

        if (data.languages && data.languages.length > 0) {
            const langSection = {
                id: 'languages',
                title: i18n.t('ui.languages'),
                type: 'tags',
                items: data.languages.map(l => `${l.name}: ${l.level}`)
            };
            this.container.insertAdjacentHTML('beforeend', this.renderSection(langSection));
        }

        if (data.certifications && data.certifications.length > 0) {
            const certSection = {
                id: 'certifications',
                title: i18n.t('ui.certifications'),
                type: 'tags',
                items: data.certifications
            };
            this.container.insertAdjacentHTML('beforeend', this.renderSection(certSection));
        }

        if (data.publications && data.publications.length > 0) {
            this.container.insertAdjacentHTML('beforeend', this.renderPublications(data.publications));
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

    renderPublications(publications) {
        const t = (k) => i18n.t(k);
        const items = publications.map(pub => `
            <div class="item publication">
                <p class="item-description">${pub.text}</p>
                <p class="item-subtitle"><em>${pub.source}</em>
                ${pub.url ? ` — <a href="${pub.url}" target="_blank" class="pub-link">IATTC.org</a>` : ''}</p>
            </div>
        `).join('');

        return `
            <div class="window site-window">
                <div class="title-bar">
                    <button aria-label="${t('ui.close')}" class="close"></button>
                    <h1 class="title">${t('ui.publications')}</h1>
                    <button aria-label="${t('ui.resize')}" class="resize"></button>
                </div>
                <div class="separator"></div>
                <div class="window-pane">
                    <section class="section" id="publications">
                        <h2 class="section-title">${t('ui.publications')}</h2>
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
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF({ unit: 'mm', format: 'a4' });
        const data = i18n.data;
        const W = 210, M = 15, CW = W - 2 * M;
        const LH = 3.8; // line height in mm
        let y = M;

        const color = (r, g, b) => doc.setTextColor(r, g, b);
        const font = (style, size) => { doc.setFont('helvetica', style); doc.setFontSize(size); };

        const checkPage = (needed) => {
            if (y + needed > 282) { doc.addPage(); y = M; }
        };

        const wrapped = (str, x, maxW, size, style = 'normal', rgb = [68, 68, 68], justify = false) => {
            font(style, size);
            color(...rgb);
            const lines = doc.splitTextToSize(str, maxW);
            if (justify) {
                doc.text(lines, x, y, { maxWidth: maxW, align: 'justify' });
            } else {
                doc.text(lines, x, y);
            }
            y += lines.length * LH;
        };

        const link = (label, url, x, size, style = 'normal', rgb = [40, 80, 160]) => {
            font(style, size);
            color(...rgb);
            doc.textWithLink(label, x, y, { url });
        };

        const sectionTitle = (title) => {
            checkPage(14);
            y += 5;
            font('bold', 11); color(34, 34, 34);
            doc.text(title.toUpperCase(), M, y);
            y += 1.5;
            doc.setDrawColor(34, 34, 34);
            doc.setLineWidth(0.4);
            doc.line(M, y, M + CW, y);
            y += 5;
        };

        // --- Header ---
        font('bold', 22); color(17, 17, 17);
        doc.text(data.personal.name, M, y);
        y += 6;
        font('normal', 10); color(100, 100, 100);
        doc.text(data.personal.title.toUpperCase(), M, y);
        y += 5;

        // Contact line with links
        let cx = M;
        font('normal', 7.5);
        const sep = () => { color(160, 160, 160); doc.text('  |  ', cx, y); cx += doc.getTextWidth('  |  '); };

        // Website first
        color(40, 80, 160);
        doc.textWithLink('Site', cx, y, { url: 'https://halprez.github.io' });
        cx += doc.getTextWidth('Site');

        data.personal.contact?.forEach(c => {
            sep();
            color(40, 80, 160);
            doc.textWithLink(c.label, cx, y, { url: c.url });
            cx += doc.getTextWidth(c.label);
        });
        y += 5;

        // Divider
        doc.setDrawColor(200, 200, 200);
        doc.setLineWidth(0.2);
        doc.line(M, y, M + CW, y);
        y += 4;

        // --- Bio ---
        wrapped(data.personal.bio, M, CW, 9, 'normal', [60, 60, 60], true);
        y += 2;

        // --- Experience ---
        if (data.experience?.length) {
            sectionTitle(i18n.t('ui.experience'));
            data.experience.forEach(item => {
                checkPage(25);

                // Title
                font('bold', 10); color(17, 17, 17);
                doc.text(item.title, M, y);

                // Duration (right-aligned)
                if (item.duration) {
                    font('normal', 8); color(100, 100, 100);
                    doc.text(item.duration, M + CW - doc.getTextWidth(item.duration), y);
                }
                y += 4;

                // Company as link + location
                if (item.url) {
                    link(item.subtitle, item.url, M, 8.5);
                    const sw = doc.getTextWidth(item.subtitle);
                    font('normal', 8.5); color(80, 80, 80);
                    doc.text(`  •  ${item.location}`, M + sw, y);
                } else {
                    font('normal', 8.5); color(80, 80, 80);
                    doc.text(`${item.subtitle}  •  ${item.location}`, M, y);
                }
                y += 5;

                // Description
                if (item.description) {
                    wrapped(item.description, M, CW, 8.5, 'normal', [60, 60, 60]);
                    y += 1;
                }

                // Details as proper bullet list
                if (item.details?.length) {
                    item.details.forEach(d => {
                        checkPage(10);
                        font('normal', 8); color(120, 120, 120);
                        doc.text('•', M + 3, y);
                        font('normal', 8); color(70, 70, 70);
                        const lines = doc.splitTextToSize(d, CW - 10);
                        doc.text(lines, M + 7, y);
                        y += lines.length * LH + 0.5;
                    });
                    y += 1;
                }

                // Tags
                if (item.tags?.length) {
                    font('normal', 7); color(130, 130, 130);
                    const tagsText = item.tags.join('   |   ');
                    const tagLines = doc.splitTextToSize(tagsText, CW);
                    doc.text(tagLines, M, y);
                    y += tagLines.length * 3 + 1;
                }
                y += 3;
            });
        }

        // --- Education ---
        if (data.education?.length) {
            sectionTitle(i18n.t('ui.education'));
            data.education.forEach(item => {
                checkPage(18);
                font('bold', 10); color(17, 17, 17);
                doc.text(item.title, M, y);
                if (item.duration) {
                    font('normal', 8); color(100, 100, 100);
                    doc.text(item.duration, M + CW - doc.getTextWidth(item.duration), y);
                }
                y += 4;
                if (item.url) {
                    link(item.subtitle, item.url, M, 8.5);
                    const sw = doc.getTextWidth(item.subtitle);
                    font('normal', 8.5); color(80, 80, 80);
                    doc.text(`  •  ${item.location}`, M + sw, y);
                } else {
                    font('normal', 8.5); color(80, 80, 80);
                    doc.text(`${item.subtitle}  •  ${item.location}`, M, y);
                }
                y += 4;
                if (item.description) { wrapped(item.description, M, CW, 8.5, 'normal', [60, 60, 60]); }
                y += 4;
            });
        }

        // --- Skills ---
        if (data.skills?.length) {
            sectionTitle(i18n.t('ui.skills'));
            font('normal', 8.5); color(60, 60, 60);
            const skillsText = data.skills.join('   |   ');
            const skillLines = doc.splitTextToSize(skillsText, CW);
            doc.text(skillLines, M, y);
            y += skillLines.length * LH + 2;
        }

        // --- Soft Skills ---
        if (data.softSkills?.length) {
            sectionTitle(i18n.t('ui.softSkills'));
            font('normal', 8.5); color(60, 60, 60);
            doc.text(data.softSkills.join('   |   '), M, y);
            y += LH + 2;
        }

        // --- Languages ---
        if (data.languages?.length) {
            sectionTitle(i18n.t('ui.languages'));
            font('normal', 8.5); color(60, 60, 60);
            doc.text(data.languages.map(l => `${l.name}: ${l.level}`).join('   |   '), M, y);
            y += LH + 2;
        }

        // --- Certifications ---
        if (data.certifications?.length) {
            sectionTitle(i18n.t('ui.certifications'));
            font('normal', 8.5); color(60, 60, 60);
            doc.text(data.certifications.join('   |   '), M, y);
            y += LH + 2;
        }

        // --- Publications ---
        if (data.publications?.length) {
            sectionTitle(i18n.t('ui.publications'));
            data.publications.forEach(pub => {
                checkPage(15);
                wrapped(pub.text, M, CW, 8, 'normal', [50, 50, 50]);
                font('italic', 7.5); color(100, 100, 100);
                doc.text(pub.source, M, y);
                if (pub.url) {
                    const sw = doc.getTextWidth(pub.source + '  ');
                    link('View publication', pub.url, M + sw, 7.5, 'normal');
                }
                y += LH + 3;
            });
        }

        // --- Projects ---
        if (data.projects?.length) {
            sectionTitle(i18n.t('ui.sideProjects'));
            data.projects.forEach(item => {
                checkPage(15);
                if (item.url) {
                    link(item.title, item.url, M, 9.5, 'bold');
                } else {
                    font('bold', 9.5); color(17, 17, 17);
                    doc.text(item.title, M, y);
                }
                y += 4;
                if (item.subtitle) {
                    font('normal', 8); color(100, 100, 100);
                    doc.text(item.subtitle, M, y);
                    y += 3.5;
                }
                if (item.description) { wrapped(item.description, M, CW, 8, 'normal', [70, 70, 70]); }
                y += 4;
            });
        }

        doc.save(`${data.personal.name.replace(/\s+/g, '_')}_CV.pdf`);
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
