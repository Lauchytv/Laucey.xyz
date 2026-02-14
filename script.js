document.addEventListener('DOMContentLoaded', () => {

    const mouse = { x: 0, y: 0 };
    window.addEventListener('mousemove', (e) => {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
    });

    const lenis = new Lenis({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smooth: true,
        direction: 'vertical',
        gestureDirection: 'vertical',
        smoothTouch: false,
    });

    function raf(time) {
        lenis.raf(time);
        ScrollTrigger.update(); 
        requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    if (typeof ScrollTrigger !== 'undefined') {
        gsap.registerPlugin(ScrollTrigger);
    }

    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            lenis.scrollTo(targetId, {
                duration: 1.5,
                easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            });
        });
    });

    function updateSpotlight(e) {
        const card = e.currentTarget;
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        card.style.setProperty('--mouse-x', `${x}px`);
        card.style.setProperty('--mouse-y', `${y}px`);
    }

    function renderPastWorks() {
        const grid = document.getElementById('works-grid');
        if (!grid || !window.portfolioConfig) return;

        grid.innerHTML = window.portfolioConfig.pastWorks.map(project => `
            <div class="work-card" data-id="${project.id}" ${project.link ? `data-link="${project.link}" style="cursor: pointer;"` : ''}>
                <div class="work-image-wrapper">
                    <span class="work-year-badge">${project.year}</span>
                    ${project.image ? `
                        <img src="${project.image}" alt="${project.title}" style="width: 100%; height: 100%; object-fit: cover; transition: transform 0.6s ease;">
                    ` : `
                        <div class="work-placeholder" 
                            style="background: ${project.gradient}; width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; font-size: 2rem; font-weight: 900; color: ${project.color}; opacity: 0.8; text-align: center; padding: 1rem;">
                            ${project.placeholderText}
                        </div>
                    `}
                    ${project.link ? `
                        <div class="work-link-icon" style="position: absolute; top: 1rem; right: 1rem; background: rgba(0,0,0,0.5); padding: 8px; border-radius: 50%; display: flex; align-items: center; justify-content: center; backdrop-filter: blur(4px); z-index: 3;">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
                                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                                <polyline points="15 3 21 3 21 9" />
                                <line x1="10" y1="14" x2="21" y2="3" />
                            </svg>
                        </div>
                    ` : ''}
                </div>
                <div class="work-content">
                    <span class="work-category">${project.category}</span>
                    <h3 class="work-title">${project.title}</h3>
                    <p class="work-type">${project.type}</p>
                    <div class="work-footer">
                        <div class="work-meta-item">${project.location}</div>
                        <div class="work-meta-item">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                                <circle cx="9" cy="7" r="4" />
                                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                            </svg>
                            <span>${project.users}</span>
                        </div>
                        <div class="work-status status-${project.status}">
                            <div class="status-dot"></div>
                            ${project.status.toUpperCase()}
                        </div>
                    </div>
                </div>
            </div>
        `).join('');

        const cards = grid.querySelectorAll('.work-card');
        cards.forEach(card => {
            card.addEventListener('mousemove', updateSpotlight);

            card.addEventListener('click', () => {
                const url = card.getAttribute('data-link');
                if (url) {
                    window.open(url, '_blank', 'noopener,noreferrer');
                }
            });
        });
    }

    renderPastWorks();

    function setupTypingEffect(elementId, textsToType, options = {}) {
        const element = document.getElementById(elementId);
        if (!element) return;

        let textIndex = 0;
        let charIndex = 0;
        let isDeleting = false;
        let typeSpeed = options.typeSpeed || 150;

        function type() {
            const currentText = textsToType[textIndex];

            if (isDeleting) {
                element.textContent = currentText.substring(0, charIndex - 1);
                charIndex--;
                typeSpeed = options.deleteSpeed || 75;
            } else {
                element.textContent = currentText.substring(0, charIndex + 1);
                charIndex++;
                typeSpeed = options.typeSpeed || 150;
            }

            if (!isDeleting && charIndex === currentText.length) {
                isDeleting = true;
                typeSpeed = options.pauseTime || 2000;
                element.classList.add('typing-complete');
            } else if (isDeleting && charIndex === 0) {
                isDeleting = false;
                textIndex = (textIndex + 1) % textsToType.length;
                typeSpeed = 500;
            } else if (isDeleting) {
                element.classList.remove('typing-complete');
            }

            setTimeout(type, typeSpeed);
        }
        setTimeout(type, options.delay || 1000);
    }

    setupTypingEffect('typing-text', ["AI DRIVEN DEVELOPMENT"], {
        typeSpeed: 80,
        deleteSpeed: 50,
        pauseTime: 10000
    });

    setupTypingEffect('hero-typing-text', ["Laucey"], {
        typeSpeed: 200,
        deleteSpeed: 100,
        pauseTime: 5000,
        delay: 1500
    });

    const canvas = document.getElementById('bg-canvas');
    const cursorCanvas = document.getElementById('cursor-canvas');

    if (canvas && cursorCanvas) {
        const ctx = canvas.getContext('2d');
        const cursorCtx = cursorCanvas.getContext('2d');
        let width, height;

        window.addEventListener('mousemove', () => {
            if (trailParticles) {
                for (let i = 0; i < 4; i++) {
                    trailParticles.push(new TrailParticle(mouse.x, mouse.y));
                }
            }
        });

        let particles = [];
        let trailParticles = [];

        const resize = () => {
            const dpr = window.devicePixelRatio || 1;
            width = window.innerWidth;
            height = window.innerHeight;

            canvas.width = width * dpr;
            canvas.height = height * dpr;
            cursorCanvas.width = width * dpr;
            cursorCanvas.height = height * dpr;

            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
            cursorCtx.setTransform(dpr, 0, 0, dpr, 0, 0);

            initParticles();
        };

        class Particle {
            constructor() {
                this.originX = Math.random() * width;
                this.originY = Math.random() * height;
                this.x = this.originX;
                this.y = this.originY;
                this.offX = 0;
                this.offY = 0;
                this.vx = (Math.random() - 0.5) * 0.15;
                this.vy = (Math.random() - 0.5) * 0.15;
                this.size = Math.random() * 1.5 + 0.5;
                this.color = `rgba(255, 255, 255, ${Math.random() * 0.3 + 0.2})`;
                this.friction = 0.95;
                this.ease = 0.03;
                this.parallaxFactor = Math.random() * 0.3 + 0.05;
            }

            update() {
                this.originX += this.vx;
                this.originY += this.vy;

                if (this.originX < 0) this.originX = width;
                if (this.originX > width) this.originX = 0;
                if (this.originY < 0) this.originY = height;
                if (this.originY > height) this.originY = 0;

                const scrollOffset = window.scrollY * this.parallaxFactor;
                const baseY = (this.originY - scrollOffset % height + height) % height;
                const baseX = this.originX;

                this.offX += (0 - this.offX) * this.ease;
                this.offY += (0 - this.offY) * this.ease;

                this.x = baseX + this.offX;
                this.y = baseY + this.offY;
            }

            draw() {
                ctx.fillStyle = this.color;
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fill();

                if (Math.random() > 0.99) {
                    ctx.shadowBlur = 8;
                    ctx.shadowColor = 'white';
                    ctx.fill();
                    ctx.shadowBlur = 0;
                }
            }
        }

        class TrailParticle {
            constructor(x, y) {
                this.x = x;
                this.y = y;
                this.vx = (Math.random() - 0.5) * 2;
                this.vy = (Math.random() - 0.5) * 2;
                this.size = Math.random() * 2 + 0.5;
                this.life = 1;
                this.decay = Math.random() * 0.02 + 0.01;
                this.color = `0, 212, 255`;
            }

            update() {
                this.x += this.vx;
                this.y += this.vy;
                this.life -= this.decay;
                this.size -= 0.05;
                if (this.size < 0) this.size = 0;
            }

            draw(context) {
                context.shadowBlur = 8;
                context.shadowColor = `rgba(${this.color}, ${this.life})`;
                context.fillStyle = `rgba(${this.color}, ${this.life})`;
                context.beginPath();
                context.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                context.fill();
                context.shadowBlur = 0;
            }
        }

        function initParticles() {
            particles = [];
            const particleCount = window.innerWidth < 768 ? 80 : 250;
            for (let i = 0; i < particleCount; i++) {
                particles.push(new Particle());
            }
        }

        function animateParticles() {
            ctx.clearRect(0, 0, width, height);
            cursorCtx.clearRect(0, 0, width, height);

            particles.forEach(p => {
                p.update();
                p.draw();
            });

            particles.forEach((a, i) => {
                for (let j = i + 1; j < particles.length; j++) {
                    const b = particles[j];
                    const dx = a.x - b.x;
                    const dy = a.y - b.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);

                    if (dist < 180) {
                        ctx.strokeStyle = `rgba(100, 200, 255, ${0.12 - dist / 1500})`;
                        ctx.lineWidth = 0.4;
                        ctx.beginPath();
                        ctx.moveTo(a.x, a.y);
                        ctx.lineTo(b.x, b.y);
                        ctx.stroke();
                    }
                }
            });

            for (let i = trailParticles.length - 1; i >= 0; i--) {
                const p = trailParticles[i];
                p.draw(cursorCtx);
                p.update();
                if (p.life <= 0 || p.size <= 0) {
                    trailParticles.splice(i, 1);
                }
            }

            requestAnimationFrame(animateParticles);
        }

        window.addEventListener('resize', resize);
        resize();
        animateParticles();
    }

    const cursor = document.querySelector('.cursor');
    const follower = document.querySelector('.cursor-follower');

    if (cursor && follower) {
        let posX = 0, posY = 0;

        gsap.to({}, 0.016, {
            repeat: -1,
            onRepeat: function () {
                posX += (mouse.x - posX) / 6;
                posY += (mouse.y - posY) / 6;

                gsap.set(follower, {
                    css: {
                        left: posX,
                        top: posY
                    }
                });

                gsap.set(cursor, {
                    css: {
                        left: mouse.x - 4,
                        top: mouse.y
                    }
                });
            }
        });

        const links = document.querySelectorAll('a, button, .about-card, .btn-primary, .btn-secondary, .nav-links a');
        links.forEach(link => {
            link.addEventListener('mouseenter', () => {
                document.body.classList.add('cursor-hover');
            });
            link.addEventListener('mouseleave', () => {
                document.body.classList.remove('cursor-hover');
            });
        });
    }

    const entryTl = gsap.timeline({
        onComplete: () => {
            gsap.set(['main', '.navbar'], { clearProps: "all" });
            ScrollTrigger.refresh();
        }
    });

    entryTl.from(['main', '.navbar'], {
        scale: 1.15,
        opacity: 0,
        filter: "blur(40px)",
        duration: 2.2,
        ease: "power3.out"
    });

    const clearEntryOnScroll = () => {
        if (window.scrollY > 10) {
            entryTl.progress(1);
            gsap.set(['main', '.navbar'], { clearProps: "all" });
            ScrollTrigger.refresh();
            window.removeEventListener('scroll', clearEntryOnScroll);
        }
    };
    window.addEventListener('scroll', clearEntryOnScroll);

    const heroTitle = document.querySelector('.hero-text h1');
    if (heroTitle) {
        entryTl.from(heroTitle, {
            x: -150,
            opacity: 0,
            duration: 1.8,
            ease: "power4.out"
        }, "-=1.3");
    }

    const heroVisual = document.querySelector('.hero-visual-card');
    if (heroVisual) {
        entryTl.from(heroVisual, {
            scale: 0.8,
            rotationY: -15,
            opacity: 0,
            duration: 2,
            ease: "back.out(1.2)"
        }, "-=1.5");
    }

    entryTl.from(['.subtitle', '.hero-description', '.hero-buttons'], {
        y: 40,
        opacity: 0,
        duration: 1.4,
        stagger: 0.2,
        ease: "power2.out"
    }, "-=1.4");

    if (typeof ScrollTrigger !== 'undefined') {
        gsap.to('.hero-visual', {
            scrollTrigger: {
                trigger: '.hero-section',
                start: 'top top',
                end: 'bottom top',
                scrub: true
            },
            y: 200,
            scale: 0.8
        });

        gsap.from('.about-card', {
            scrollTrigger: {
                trigger: '.about-grid',
                start: 'top 80%',
            },
            y: 100,
            opacity: 0,
            duration: 0.8,
            stagger: 0.2,
            ease: "power2.out"
        });

        const marquee = document.querySelector('.marquee-content');
        if (marquee) {
            ScrollTrigger.create({
                trigger: '.stack-section',
                start: 'top bottom',
                end: 'bottom top',
                onUpdate: (self) => {
                    const velocity = self.getVelocity();
                }
            });
        }
        const serviceSection = document.querySelector('.services-section');
        const slides = gsap.utils.toArray('.service-slide');
        const dots = document.querySelectorAll('.dot');

        if (serviceSection && slides.length > 0) {
            slides.forEach((slide, i) => {
                const zIndex = 10 + i;
                const content = slide.querySelector('.slide-content');
                const card = slide.querySelector('.visual-card');

                gsap.set(slide, { autoAlpha: i === 0 ? 1 : 0, zIndex: zIndex });

                if (i !== 0) {
                    gsap.set(content, { x: 100, opacity: 0 });
                    gsap.set(card, { rotationY: -110, rotationZ: -10, z: -500, opacity: 0 });
                }
            });

            const tl = gsap.timeline({
                scrollTrigger: {
                    trigger: '.services-section',
                    start: 'top top',
                    end: `+=${slides.length * 200}%`,
                    pin: true,
                    scrub: 1.2,
                    anticipatePin: 1,
                    snap: {
                        snapTo: 1 / (slides.length - 1),
                        duration: { min: 0.2, max: 0.6 },
                        delay: 0.05,
                        ease: "power1.inOut"
                    },
                    onUpdate: (self) => {
                        const progress = self.progress;
                        const index = Math.min(Math.round(progress * (slides.length - 1)), slides.length - 1);
                        dots.forEach((dot, m) => dot.classList.toggle('active', m === index));
                    }
                }
            });

            slides.forEach((slide, i) => {
                if (i === 0) return;
                const prevSlide = slides[i - 1];
                const prevContent = prevSlide.querySelector('.slide-content');
                const prevCard = prevSlide.querySelector('.visual-card');
                const currentContent = slide.querySelector('.slide-content');
                const currentCard = slide.querySelector('.visual-card');

                tl.to(prevContent, { x: -100, opacity: 0, duration: 1, ease: "power2.inOut" })
                    .to(prevCard, { rotationY: 110, rotationZ: 10, z: -500, opacity: 0, duration: 1, ease: "power2.inOut" }, "<")
                    .set(prevSlide, { autoAlpha: 0 })
                    .set(slide, { autoAlpha: 1 })
                    .fromTo(currentContent, { x: 100, opacity: 0 }, { x: 0, opacity: 1, duration: 1, ease: "power2.out" })
                    .fromTo(currentCard, { rotationY: -110, rotationZ: -10, z: -500, opacity: 0 },
                        { rotationY: 0, rotationZ: 0, z: 0, opacity: 1, duration: 1, ease: "back.out(1.2)" }, "<")
                    .to({}, { duration: 0.8 });
            });
        }

        const skillsTrack = document.querySelector('.skills-track');
        const skillSlides = gsap.utils.toArray('.skill-slide');

        if (skillsTrack && skillSlides.length > 0) {
            const getScrollDistance = () => skillsTrack.scrollWidth - window.innerWidth;

            gsap.to(skillsTrack, {
                x: () => -getScrollDistance(),
                ease: "none",
                scrollTrigger: {
                    trigger: ".skills-section",
                    pin: true,
                    scrub: 0.5,
                    start: "top top",
                    end: () => `+=${getScrollDistance()}`,
                    invalidateOnRefresh: true,
                    anticipatePin: 1,
                    onUpdate: (self) => {
                        skillSlides.forEach((slide) => {
                            const slideRect = slide.getBoundingClientRect();
                            const slideCenter = slideRect.left + slideRect.width / 2;
                            if (slideCenter < window.innerWidth && slideCenter > 0) {
                                const bar = slide.querySelector('.skill-progress-bar');
                                if (bar && !bar.classList.contains('animated')) {
                                    bar.style.width = bar.getAttribute('data-width');
                                    bar.classList.add('animated');
                                }
                            }
                        });
                    }
                }
            });
        }

        ScrollTrigger.refresh();
    }

    const staticSpotlightCards = document.querySelectorAll('.about-card, .visual-card, .bento-card, .contact-wrapper');
    staticSpotlightCards.forEach(card => {
        card.addEventListener('mousemove', updateSpotlight);

        if (card.classList.contains('visual-card')) {
            card.addEventListener('mousemove', (e) => {
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;

                const centerX = rect.width / 2;
                const centerY = rect.height / 2;

                const rotateX = (y - centerY) / 10;
                const rotateY = (centerX - x) / 10;

                card.style.transform = `perspective(1200px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
            });

            card.addEventListener('mouseleave', () => {
                card.style.transform = `perspective(1200px) rotateX(0deg) rotateY(0deg)`;
            });
        }
    });

    const navLinks = document.querySelectorAll('.nav-links a');
    const sections = document.querySelectorAll('section');

    const updateActiveLink = () => {
        let currentSectionId = 'home';

        if (window.scrollY < 100) {
            currentSectionId = 'home';
        }
        else if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 100) {
            currentSectionId = 'contact';
        }
        else {
            const viewportCenter = window.innerHeight / 2;
            let minDistance = Infinity;

            const linkedSections = Array.from(sections).filter(section => {
                const id = section.getAttribute('id');
                return id && document.querySelector(`.nav-links a[href="#${id}"]`);
            });

            linkedSections.forEach(section => {
                const rect = section.getBoundingClientRect();
                const sectionCenter = rect.top + rect.height / 2;
                const distance = Math.abs(sectionCenter - viewportCenter);

                if (distance < minDistance) {
                    minDistance = distance;
                    currentSectionId = section.getAttribute('id');
                }
            });
        }

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${currentSectionId}`) {
                link.classList.add('active');
            }
        });
    };

    window.addEventListener('scroll', updateActiveLink);
    updateActiveLink();

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href');
            const targetSector = document.querySelector(targetId);

            if (targetSector) {
                gsap.to(link, { scale: 0.9, duration: 0.1, yoyo: true, repeat: 1 });

                lenis.scrollTo(targetSector, {
                    offset: 0,
                    duration: 1.5,
                    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t))
                });
            }
        });
    });

    const startNowBtn = document.getElementById('start-now-btn');
    if (startNowBtn) {
        let isTransformed = false;

        startNowBtn.addEventListener('click', function (e) {
            if (!isTransformed) {
                e.preventDefault();
                isTransformed = true;

                const btnText = this.querySelector('.btn-text');
                const discordContent = this.querySelector('.discord-content');

                const tl = gsap.timeline();

                tl.to(this, {
                    scaleX: 1.1,
                    scaleY: 0.9,
                    duration: 0.15,
                    ease: "power2.inOut"
                })
                    .to(this, {
                        scaleX: 1,
                        scaleY: 1,
                        width: "280px",
                        backgroundColor: "#5865F2",
                        borderColor: "transparent",
                        boxShadow: "0 0 40px rgba(88, 101, 242, 0.7)",
                        duration: 0.4,
                        ease: "back.out(2)"
                    })
                    .to(btnText, {
                        opacity: 0,
                        y: -10,
                        duration: 0.2,
                        onComplete: () => {
                            btnText.style.display = 'none';
                            discordContent.style.display = 'flex';
                            gsap.set(discordContent, { y: 10, opacity: 0 });
                        }
                    }, "-=0.4")
                    .to(discordContent, {
                        opacity: 1,
                        y: 0,
                        duration: 0.3,
                        ease: "power2.out"
                    });
            } else {
                gsap.to(this, { scale: 0.95, duration: 0.1, yoyo: true, repeat: 1 });
                const url = this.getAttribute('data-link');
                if (url) {
                    const newWindow = window.open(url, '_blank', 'noopener,noreferrer');
                    if (newWindow) newWindow.focus();
                }
            }
        });
    }

    const magnets = document.querySelectorAll('.btn-primary, .nav-links a, .btn-discord, #start-now-btn');
    magnets.forEach(magnet => {
        magnet.addEventListener('mousemove', (e) => {
            const rect = magnet.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;

            gsap.to(magnet, {
                x: x * 0.3,
                y: y * 0.3,
                duration: 0.3,
                ease: 'power2.out'
            });
        });

        magnet.addEventListener('mouseleave', () => {
            gsap.to(magnet, {
                x: 0,
                y: 0,
                duration: 0.5,
                ease: 'elastic.out(1, 0.3)'
            });
        });
    });

    document.querySelectorAll('[data-link]:not(#start-now-btn)').forEach(el => {
        el.style.cursor = 'pointer';
        el.addEventListener('click', (e) => {
            e.preventDefault();
            const url = el.getAttribute('data-link');
            if (url) {
                window.open(url, '_blank', 'noopener,noreferrer');
            }
        });
    });

    window.addEventListener('load', () => {
        if (typeof ScrollTrigger !== 'undefined') {
            ScrollTrigger.refresh();
        }
    });
});
