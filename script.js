document.addEventListener('DOMContentLoaded', () => {

  /* ===========================
     LOADER
  =========================== */
  const loader = document.getElementById('loader');
  const loaderLine = document.getElementById('loaderLine');
  const loaderMsg = document.getElementById('loaderMsg');
  const loaderPct = document.getElementById('loaderPct');
  const loaderParticles = document.getElementById('loaderParticles');

  // Create high-intensity particles across the full screen
  if (loaderParticles) {
    for (let i = 0; i < 150; i++) {
      const p = document.createElement('div');
      p.className = 'loader-particle';
      const size = Math.random() * 2 + 1;
      p.style.setProperty('--p-size', size + 'px');
      p.style.left = Math.random() * 100 + '%';
      p.style.top = Math.random() * 100 + '%';
      p.style.opacity = (Math.random() * 0.4 + 0.6).toString(); // Bright: 0.6 - 1.0
      loaderParticles.appendChild(p);
    }
  }

  const loadSteps = [
    { pct: 20, text: 'Loading Assets' },
    { pct: 50, text: 'Building Core' },
    { pct: 80, text: 'Shaping UI' },
    { pct: 100, text: 'Complete' },
  ];

  // Start music on first user interaction (browser policy)
  const bgMusic = document.getElementById('bgMusic');
  let musicStarted = false;

  function startMusic() {
    if (musicStarted || !bgMusic) return;
    musicStarted = true;
    bgMusic.volume = 0;
    bgMusic.play().then(() => {
      let vol = 0;
      const fadeIn = setInterval(() => {
        vol = Math.min(vol + 0.002, 0.01);
        bgMusic.volume = vol;
        if (vol >= 0.01) clearInterval(fadeIn);
      }, 100);
    }).catch(() => {});
  }

  // Fire on any first interaction
  ['click', 'keydown', 'touchstart', 'pointerdown'].forEach(evt => {
    document.addEventListener(evt, startMusic, { once: true });
  });

  const loaderEnter = document.getElementById('loaderEnter');

  let stepIndex = 0;
  const loaderInterval = setInterval(() => {
    if (stepIndex >= loadSteps.length) {
      clearInterval(loaderInterval);
      // Show the click-to-enter button
      if (loaderMsg) loaderMsg.textContent = 'Ready';
      setTimeout(() => {
        loaderReady = true;
        loader.style.cursor = 'pointer';
        if (loaderEnter) loaderEnter.classList.add('visible');
      }, 400);
      return;
    }
    const step = loadSteps[stepIndex];
    if (loaderLine) loaderLine.style.width = step.pct + '%';
    if (loaderPct) loaderPct.textContent = String(step.pct).padStart(2, '0');
    if (loaderMsg) loaderMsg.textContent = step.text;
    stepIndex++;
  }, 450);

  // Click anywhere on the loader to enter
  let loaderReady = false;
  loader.addEventListener('click', () => {
    if (!loaderReady) return;
    startMusic();
    loader.classList.add('hidden');
    document.body.style.overflow = '';
    document.body.classList.add('loaded');
    startReveal();
    setTimeout(showSongToast, 600);
  });

  function showSongToast() {
    const toast = document.createElement('div');
    toast.id = 'songToast';
    toast.innerHTML = `
      <div class="song-toast-icon"><i class="fas fa-music"></i></div>
      <div class="song-toast-info">
        <span class="song-toast-label">Now Playing</span>
        <span class="song-toast-title">Clouds — Pastel Ghost</span>
      </div>`;
    document.body.appendChild(toast);
    // Trigger open
    requestAnimationFrame(() => {
      requestAnimationFrame(() => toast.classList.add('visible'));
    });
    // Auto-hide after 5s
    setTimeout(() => {
      toast.classList.remove('visible');
      setTimeout(() => toast.remove(), 600);
    }, 5000);
  }

  document.body.style.overflow = 'hidden';


  /* ===========================
     CANVAS BACKGROUND
  =========================== */
  const canvas = document.getElementById('bgCanvas');
  const ctx = canvas.getContext('2d');
  let particles = [];
  let w, h;
  let mouse = { x: -9999, y: -9999 };

  function resize() {
    w = canvas.width = window.innerWidth;
    h = canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  window.addEventListener('mousemove', e => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  });

  const COLORS = [
    { h: 0, s: 0, l: 90 },
    { h: 0, s: 0, l: 70 },
    { h: 0, s: 0, l: 55 },
    { h: 0, s: 0, l: 40 },
    { h: 0, s: 0, l: 80 },
  ];

  class Particle {
    constructor() {
      this.reset(true);
    }
    reset(initial) {
      this.x = initial ? Math.random() * w : Math.random() > 0.5 ? 0 : w;
      this.y = initial ? Math.random() * h : Math.random() * h;
      this.size = Math.random() * 1.5 + 0.4;
      this.speedX = (Math.random() - 0.5) * 0.22;
      this.speedY = (Math.random() - 0.5) * 0.22;
      const col = COLORS[Math.floor(Math.random() * COLORS.length)];
      this.hue = col.h;
      this.sat = col.s;
      this.lit = col.l;
      this.alpha = Math.random() * 0.35 + 0.05;
      this.baseAlpha = this.alpha;
    }
    update() {
      const dx = this.x - mouse.x;
      const dy = this.y - mouse.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const repel = 80;
      if (dist < repel) {
        const force = (repel - dist) / repel;
        this.x += (dx / dist) * force * 1.5;
        this.y += (dy / dist) * force * 1.5;
        this.alpha = Math.min(this.baseAlpha * 2.5, 0.6);
      } else {
        this.alpha += (this.baseAlpha - this.alpha) * 0.05;
      }
      this.x += this.speedX;
      this.y += this.speedY;
      if (this.x < -10) this.x = w + 10;
      if (this.x > w + 10) this.x = -10;
      if (this.y < -10) this.y = h + 10;
      if (this.y > h + 10) this.y = -10;
    }
    draw() {
      const isLight = document.body.classList.contains('light');
      const lit = isLight ? 100 - this.lit : this.lit;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fillStyle = `hsla(${this.hue}, ${this.sat}%, ${lit}%, ${this.alpha})`;
      ctx.fill();
    }
  }

  const COUNT = Math.min(80, Math.floor((window.innerWidth * window.innerHeight) / 16000));
  for (let i = 0; i < COUNT; i++) particles.push(new Particle());

  function drawConnections() {
    const maxDist = 110;
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const d = Math.sqrt(dx * dx + dy * dy);
        if (d < maxDist) {
          const opacity = (1 - d / maxDist) * 0.045;
          const isLight = document.body.classList.contains('light');
          ctx.beginPath();
          ctx.strokeStyle = isLight ? `rgba(0,0,0,${opacity})` : `rgba(255,255,255,${opacity})`;
          ctx.lineWidth = 0.6;
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.stroke();
        }
      }
    }
  }

  let animFrame;
  function loop() {
    ctx.clearRect(0, 0, w, h);
    particles.forEach(p => { p.update(); p.draw(); });
    drawConnections();
    animFrame = requestAnimationFrame(loop);
  }
  loop();

  /* ===========================
     THEME TOGGLE
  =========================== */
  const themeToggle = document.getElementById('themeToggle');
  const themeIcon = document.getElementById('themeIcon');

  function applyTheme(isLight) {
    document.body.classList.toggle('light', isLight);
    themeIcon.className = isLight ? 'fas fa-moon' : 'fas fa-sun';
    localStorage.setItem('theme', isLight ? 'light' : 'dark');
  }

  const savedTheme = localStorage.getItem('theme');
  if (savedTheme === 'light') applyTheme(true);

  themeToggle.addEventListener('click', () => {
    applyTheme(!document.body.classList.contains('light'));
  });

  /* ===========================
     CURSOR SPOTLIGHT
  =========================== */
  const spotlight = document.getElementById('cursorSpotlight');
  document.addEventListener('mousemove', e => {
    const isLight = document.body.classList.contains('light');
    const color = isLight ? 'rgba(0,0,0,0.018)' : 'rgba(255,255,255,0.022)';
    spotlight.style.background = `radial-gradient(500px circle at ${e.clientX}px ${e.clientY}px, ${color}, transparent 70%)`;
  });

  /* ===========================
     CUSTOM CURSOR (desktop only)
  =========================== */
  const isTouch = window.matchMedia('(hover: none)').matches;
  if (!isTouch) {
    const cursorDot = document.getElementById('cursorDot');
    let cursorX = 0, cursorY = 0;
    let particleTimer = 0;

    document.addEventListener('mousemove', e => {
      cursorX = e.clientX;
      cursorY = e.clientY;
      cursorDot.style.left = cursorX + 'px';
      cursorDot.style.top = cursorY + 'px';

      // Cursor particle trail
      const now = Date.now();
      if (now - particleTimer > 15) {
        particleTimer = now;
        const p = document.createElement('div');
        p.className = 'cursor-trail';
        p.style.left = cursorX + 'px';
        p.style.top = cursorY + 'px';
        const size = Math.random() * 5 + 2;
        p.style.width = size + 'px';
        p.style.height = size + 'px';
        const tx = (Math.random() - 0.5) * 30;
        const ty = (Math.random() - 0.5) * 30;
        p.style.setProperty('--tx', tx + 'px');
        p.style.setProperty('--ty', ty + 'px');
        document.body.appendChild(p);
        setTimeout(() => p.remove(), 600);
      }
    });
  }

  /* ===========================
     SCROLL PROGRESS
  =========================== */
  const progressBar = document.getElementById('scrollProgress');
  window.addEventListener('scroll', () => {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const pct = (scrollTop / docHeight) * 100;
    progressBar.style.width = pct + '%';
  }, { passive: true });

  /* ===========================
     NAVBAR SCROLL + ACTIVE
  =========================== */
  const nav = document.getElementById('navbar');
  const sections = document.querySelectorAll('.hero, .section');
  const navLinks = document.querySelectorAll('.nav-link');

  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 60);
    let current = '';
    sections.forEach(sec => {
      if (window.scrollY >= sec.offsetTop - 220) current = sec.id;
    });
    navLinks.forEach(link => {
      link.classList.toggle('active', link.dataset.section === current);
    });
  }, { passive: true });

  /* ===========================
     TYPEWRITER
  =========================== */
  const typeTarget = document.getElementById('typewriter');
  const phrases = [
    'Developer & Designer',
    'AI Native Coder',
    'Discord Specialist',
    'Building the Future',
  ];
  let phraseIndex = 0;
  let charIndex = 0;
  let isDeleting = false;

  function typeLoop() {
    const phrase = phrases[phraseIndex];
    if (!isDeleting) {
      typeTarget.textContent = phrase.slice(0, charIndex + 1);
      charIndex++;
      if (charIndex === phrase.length) {
        setTimeout(() => { isDeleting = true; typeLoop(); }, 2200);
        return;
      }
      setTimeout(typeLoop, 65);
    } else {
      typeTarget.textContent = phrase.slice(0, charIndex - 1);
      charIndex--;
      if (charIndex === 0) {
        isDeleting = false;
        phraseIndex = (phraseIndex + 1) % phrases.length;
        setTimeout(typeLoop, 400);
        return;
      }
      setTimeout(typeLoop, 35);
    }
  }
  setTimeout(typeLoop, 1800);

  /* ===========================
     REVEAL ANIMATIONS
  =========================== */
  function startReveal() {
    const reveals = document.querySelectorAll('.reveal-up, .reveal-left, .reveal-right, .reveal-scale');
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry, i) => {
        if (entry.isIntersecting) {
          const parent = entry.target.closest('.projects-grid, .connect-list, .bento-grid');
          const delay = parent
            ? Array.from(entry.target.parentElement.children).indexOf(entry.target) * 100
            : i * 80;
          setTimeout(() => entry.target.classList.add('visible'), delay);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.07, rootMargin: '0px 0px -20px 0px' });
    reveals.forEach(el => observer.observe(el));
  }

  /* ===========================
     STAT COUNTER
  =========================== */
  const statNums = document.querySelectorAll('.h-stat-num');
  let statsDone = false;

  function countUp(el, target) {
    let current = 0;
    const duration = 1400;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      current = Math.min(current + step, target);
      el.textContent = Math.floor(current);
      if (current >= target) clearInterval(timer);
    }, 16);
  }

  const statsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !statsDone) {
        statsDone = true;
        statNums.forEach(num => countUp(num, parseInt(num.dataset.count)));
      }
    });
  }, { threshold: 0.5 });

  const statsRow = document.querySelector('.hero-stats');
  if (statsRow) statsObserver.observe(statsRow);

  /* ===========================
     SKILL BAR ANIMATION
  =========================== */
  const skillObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const fills = entry.target.querySelectorAll('.skill-fill');
        fills.forEach((fill, i) => {
          setTimeout(() => {
            fill.style.width = fill.dataset.width + '%';
          }, i * 120);
        });
        skillObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.2 });

  const bentoGrid = document.querySelector('.bento-grid');
  if (bentoGrid) skillObserver.observe(bentoGrid);

  // loadSiteSettings() removed to prevent overwriting local data with API content.


  // loadSiteSettings() removed to prevent overwriting local data with API content.

  /* ===========================
     PROJECT MODAL
  =========================== */
  const projectModal   = document.getElementById('projectModal');
  const modalBackdrop  = document.getElementById('modalBackdrop');
  const modalClose     = document.getElementById('modalClose');

  // Add drag handle on mobile
  if (projectModal) {
    const handle = document.createElement('div');
    handle.className = 'modal-drag-handle';
    projectModal.querySelector('.modal-panel').prepend(handle);
  }

  function openProjectModal(p) {
    const iconEl = document.getElementById('modalIcon');
    if (p.image) {
      iconEl.outerHTML = `<img src="${p.image}" id="modalIcon" class="modal-project-img">`;
    } else {
      const currentIcon = document.getElementById('modalIcon');
      if (currentIcon.tagName === 'IMG') {
          currentIcon.outerHTML = `<i class="${p.icon || 'fas fa-code'}" id="modalIcon"></i>`;
      } else {
          currentIcon.className = p.icon || 'fas fa-code';
      }
    }
    document.getElementById('modalTitle').textContent = p.name;
    const statusEl = document.getElementById('modalStatus');
    statusEl.textContent = p.statusLabel;
    statusEl.className = 'modal-status project-status ' + p.status;
    document.getElementById('modalDesc').textContent = p.desc;
    document.getElementById('modalTags').innerHTML =
      (p.tags || []).map(t => `<span class="p-tag">${t}</span>`).join('');
    const linkEl = document.getElementById('modalLink');
    if (p.link) {
      linkEl.href = p.link;
      linkEl.classList.remove('hidden');
    } else {
      linkEl.classList.add('hidden');
    }
    projectModal.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeProjectModal() {
    projectModal.classList.remove('open');
    document.body.style.overflow = '';
  }

  if (modalBackdrop) modalBackdrop.addEventListener('click', closeProjectModal);
  if (modalClose)   modalClose.addEventListener('click', closeProjectModal);
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeProjectModal(); });

  /* ===========================
     DYNAMIC PROJECTS
  =========================== */
  function buildProjectCard(p, index) {
    const tagsHtml = (p.tags || []).map(t => `<span class="p-tag">${t}</span>`).join('');
    const card = document.createElement('div');
    card.className = 'project-card reveal-up';
    card.setAttribute('data-project-id', p.id);

    const iconContent = p.image 
      ? `<img src="${p.image}" alt="${p.name}" class="project-logo-img" referrerpolicy="no-referrer">`
      : `<i class="${p.icon || 'fas fa-code'}"></i>`;

    card.innerHTML = `
      <div class="project-row-left">
        <div class="project-icon-box">
          ${iconContent}
        </div>
        <div class="project-row-info">
          <span class="project-name">${p.name}</span>
          <div class="project-tags">${tagsHtml}</div>
        </div>
      </div>
      <div class="project-row-right">
        <span class="project-status ${p.status}">${p.statusLabel}</span>
        <i class="fas fa-arrow-right project-arrow"></i>
      </div>`;
    return card;
  }

  async function loadProjects() {
    const grid = document.getElementById('projectsGrid');
    if (!grid) return;
    try {
      // Use local config if available, otherwise try to fetch
      let projects = [];
      if (window.portfolioConfig && window.portfolioConfig.pastWorks) {
        projects = window.portfolioConfig.pastWorks.map(p => ({
          id: p.id,
          name: p.title,
          desc: p.type || p.category,
          status: p.status === 'active' ? 'status-dev' : 'status-discontinued',
          statusLabel: p.status === 'active' ? 'Active' : 'Closed',
          tags: [p.category, p.year],
          link: p.link || '',
          icon: p.category === 'FIVEM' ? 'fas fa-gamepad' : 'fab fa-discord',
          num: String(p.id).padStart(2, '0'),
          image: p.image || ''
        }));
      } else {
        const res = await fetch((window.API_BASE||'') + '/api/projects');
        projects = await res.json();
      }

      grid.innerHTML = '';
      projects.forEach((p, i) => {
        const card = buildProjectCard(p, i);
        grid.appendChild(card);
        card.addEventListener('click', () => {
          if (p.link) {
            window.open(p.link, '_blank');
          } else {
            openProjectModal(p);
          }
        });
      });
      
      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry, i) => {
          if (entry.isIntersecting) {
            const delay = Array.from(entry.target.parentElement.children).indexOf(entry.target) * 90;
            setTimeout(() => entry.target.classList.add('visible'), delay);
            observer.unobserve(entry.target);
          }
        });
      }, { threshold: 0.08, rootMargin: '0px 0px -30px 0px' });
      grid.querySelectorAll('.reveal-up').forEach(el => observer.observe(el));
    } catch (err) {
      if (grid) grid.innerHTML = '<p style="color:var(--text-3);text-align:center;padding:40px;font-family:var(--mono);font-size:0.75rem;">Failed to load projects.</p>';
      console.error('Projects load error:', err);
    }
  }

  loadProjects();

  /* ===========================
     3D CARD TILT
  =========================== */
  document.querySelectorAll('[data-tilt]').forEach(card => {
    card.addEventListener('mousemove', e => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const cx = rect.width / 2;
      const cy = rect.height / 2;
      const rotY = ((x - cx) / cx) * 8;
      const rotX = ((cy - y) / cy) * 8;
      card.style.transform = `perspective(800px) rotateX(${rotX}deg) rotateY(${rotY}deg) translateZ(6px)`;
      const glow = card.querySelector('.card-glow');
      if (glow) {
        const percentX = (x / rect.width) * 100;
        const percentY = (y / rect.height) * 100;
        glow.style.background = `radial-gradient(circle at ${percentX}% ${percentY}%, rgba(167, 139, 250, 0.1), transparent 65%)`;
      }
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(800px) rotateX(0deg) rotateY(0deg) translateZ(0)';
      card.style.transition = 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)';
      setTimeout(() => card.style.transition = '', 500);
    });
    card.addEventListener('mouseenter', () => {
      card.style.transition = 'none';
    });
  });

  /* ===========================
     MAGNETIC BUTTONS
  =========================== */
  document.querySelectorAll('.magnetic').forEach(el => {
    el.addEventListener('mousemove', e => {
      const rect = el.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      el.style.transform = `translate(${x * 0.25}px, ${y * 0.25}px)`;
    });
    el.addEventListener('mouseleave', () => {
      el.style.transform = 'translate(0, 0)';
      el.style.transition = 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)';
    });
    el.addEventListener('mouseenter', () => {
      el.style.transition = 'transform 0.2s ease';
    });
  });

  /* ===========================
     MUSIC PLAYER
  =========================== */
  const music = document.getElementById('bgMusic');
  const musicBtn = document.getElementById('musicToggle');
  let isPlaying = false;
  if (music) music.volume = 0.01;

  if (musicBtn) {
    musicBtn.addEventListener('click', async () => {
      if (!music) return;
      try {
        if (isPlaying) {
          music.pause();
          musicBtn.classList.remove('playing');
        } else {
          await music.play();
          musicBtn.classList.add('playing');
        }
        isPlaying = !isPlaying;
      } catch (err) {
        console.warn('Audio error:', err);
      }
    });
  }

  /* ===========================
     HAMBURGER MENU
  =========================== */
  const hamburger = document.getElementById('hamburger');
  const navLinksEl = document.getElementById('navLinks');

  if (hamburger && navLinksEl) {
    hamburger.addEventListener('click', () => {
      hamburger.classList.toggle('active');
      navLinksEl.classList.toggle('open');
    });

    navLinksEl.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', () => {
        hamburger.classList.remove('active');
        navLinksEl.classList.remove('open');
      });
    });
  }

  /* ===========================
     SMOOTH SCROLL
  =========================== */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });

  /* ===========================
     SPOTIFY (LAST.FM)
  =========================== */
  async function updateSpotify() {
    const apiKey = 'acf1b39cb2180613f2a02834602e18cf';
    const user = 'laucey';
    const trackEl = document.getElementById('spotifyTrack');
    const artistEl = document.getElementById('spotifyArtist');
    const cardEl = document.getElementById('spotifyCard');
    const labelEl = document.querySelector('.spotify-status-label');
    const waveEl = document.querySelector('.spotify-wave');

    if (!trackEl || !artistEl) return;

    try {
      const res = await fetch(`https://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&user=${user}&api_key=${apiKey}&format=json&limit=1`);
      const data = await res.json();
      const track = data.recenttracks.track[0];

      if (track) {
        const isPlaying = track['@attr'] && track['@attr'].nowplaying === 'true';
        trackEl.textContent = track.name;
        artistEl.textContent = track.artist['#text'];
        
        if (isPlaying) {
          labelEl.textContent = 'Currently Listening';
          waveEl.style.display = 'flex';
          cardEl.classList.add('playing');
        } else {
          labelEl.textContent = 'Last Played';
          waveEl.style.display = 'none';
          cardEl.classList.remove('playing');
        }
      }
    } catch (err) {
      console.error('Spotify fetch error:', err);
      trackEl.textContent = 'Offline';
      artistEl.textContent = 'Not listening right now';
    }
  }

  updateSpotify();
  setInterval(updateSpotify, 30000); // 30s update

});
