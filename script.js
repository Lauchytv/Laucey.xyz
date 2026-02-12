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
                this.vx = (Math.random() - 0.5) * 0.2;
                this.vy = (Math.random() - 0.5) * 0.2;
                this.size = Math.random() * 1.5 + 0.5;
                this.color = `rgba(150, 220, 255, ${Math.random() * 0.5 + 0.3})`;
                this.friction = 0.98;
                this.ease = 0.05;
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

                if (Math.random() > 0.98) {
                    ctx.shadowBlur = 10;
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
    }

    const spotlightCards = document.querySelectorAll('.about-card, .visual-card, .bento-card, .contact-wrapper');
    if (spotlightCards.length > 0) {
        spotlightCards.forEach(card => {
            card.addEventListener('mousemove', (e) => {
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;

                card.style.setProperty('--mouse-x', `${x}px`);
                card.style.setProperty('--mouse-y', `${y}px`);
            });
        });
    }

    const navLinks = document.querySelectorAll('.nav-links a');
    const sections = document.querySelectorAll('section');

    const updateActiveLink = () => {
        let currentSectionId = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            if (window.scrollY >= sectionTop - 150) {
                currentSectionId = section.getAttribute('id');
            }
        });

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
});
