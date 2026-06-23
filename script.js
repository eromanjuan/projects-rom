
        // ===== LOADING 1-100% =====
        const loadingOverlay = document.getElementById('loadingOverlay');
        const mainContent = document.getElementById('mainContent');
        const binaryDisplay = document.getElementById('binaryPercentDisplay');
        const progressFill = document.getElementById('simpleProgressFill');
        const statusText = document.getElementById('binaryStatusText');

        let percent = 0;
        const messages = ["FETCHING DATA", "PARSING BINARY", "LOADING MODULES", "OPTIMIZING", "ALMOST DONE", "COMPLETING"];
        let msgIndex = 0;

        function toBinary8bit(num) {
            return num.toString(2).padStart(8, '0');
        }

        const interval = setInterval(() => {
            if (percent < 100) {
                percent += Math.floor(Math.random() * 6) + 2;
                if (percent > 100) percent = 100;
                binaryDisplay.textContent = toBinary8bit(percent);
                progressFill.style.width = percent + '%';
                if (percent % 25 === 0 && percent < 100) {
                    statusText.textContent = messages[msgIndex % messages.length];
                    msgIndex++;
                }
                if (percent === 100) {
                    statusText.textContent = "SYSTEM READY";
                    clearInterval(interval);
                    setTimeout(hideLoader, 400);
                }
            } else {
                clearInterval(interval);
            }
        }, 70);

        function hideLoader() {
            if (loadingOverlay && !loadingOverlay.classList.contains('hidden-overlay')) {
                loadingOverlay.classList.add('hidden-overlay');
                if (mainContent) mainContent.style.opacity = '1';
                setTimeout(() => {
                    if (loadingOverlay) loadingOverlay.style.display = 'none';
                }, 500);
            }
        }
        // fallback
        setTimeout(() => {
            if (percent < 100) {
                percent = 100;
                binaryDisplay.textContent = toBinary8bit(100);
                progressFill.style.width = '100%';
                statusText.textContent = "SYSTEM READY";
                clearInterval(interval);
                hideLoader();
            }
        }, 4200);
        window.addEventListener('load', () => setTimeout(() => {
            if (percent < 100) { percent = 100;
                binaryDisplay.textContent = toBinary8bit(100);
                progressFill.style.width = '100%';
                hideLoader(); }
        }, 3000));

        // ===== DROPLET SOUND =====
        let audioCtx = null,
            audioInitialized = false;

        function initAudio() {
            if (audioCtx) return Promise.resolve(audioCtx);
            audioCtx = new(window.AudioContext || window.webkitAudioContext)();
            return audioCtx.resume();
        }

        function playDroplet() {
            if (!audioCtx) { initAudio().then(() => playDroplet()).catch(() => {}); return; }
            if (audioCtx.state === 'suspended') audioCtx.resume().then(() => genSound());
            else genSound();
        }

        function genSound() {
            if (!audioCtx) return;
            const now = audioCtx.currentTime;
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            const filter = audioCtx.createBiquadFilter();
            filter.type = "lowpass";
            filter.frequency.value = 3000;
            osc.type = "sine";
            osc.frequency.value = 950;
            osc.connect(filter);
            filter.connect(gain);
            gain.connect(audioCtx.destination);
            gain.gain.setValueAtTime(0.25, now);
            gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.3);
            osc.frequency.exponentialRampToValueAtTime(380, now + 0.14);
            const osc2 = audioCtx.createOscillator();
            const gain2 = audioCtx.createGain();
            osc2.type = "triangle";
            osc2.frequency.value = 1450;
            gain2.gain.setValueAtTime(0.12, now);
            gain2.gain.exponentialRampToValueAtTime(0.0001, now + 0.18);
            osc2.connect(gain2);
            gain2.connect(audioCtx.destination);
            osc2.frequency.exponentialRampToValueAtTime(620, now + 0.1);
            osc.start();
            osc2.start();
            osc.stop(now + 0.35);
            osc2.stop(now + 0.25);
        }
        document.addEventListener('click', (e) => {
            if (!audioInitialized) { initAudio().then(() => { audioInitialized = true;
                    playDroplet(); }).catch(() => {}); } else playDroplet();
        });
        document.addEventListener('touchstart', () => {
            if (!audioInitialized) { initAudio().then(() => { audioInitialized = true;
                    playDroplet(); }).catch(() => {}); } else playDroplet();
        });

        // ===== DOWNLOAD CV =====
        function downloadCV() {
            const a = document.createElement('a');
            a.href = 'file/EUGENIO_ROMANJUAN_CV.pdf';
            a.download = 'EUGENIO_ROMANJUAN_CV.pdf';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        }
        document.getElementById('downloadCVBtnNav')?.addEventListener('click', downloadCV);

        // ===== LIGHTBOX =====
        const lightboxModal = document.getElementById('lightboxModal'),
            lightboxContentDiv = document.getElementById('lightboxContent');

        function openLightbox(src, type) {
            lightboxContentDiv.innerHTML = '';
            if (type === 'facebook') {
                const iframe = document.createElement('iframe');
                iframe.src = src;
                iframe.allow = "autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share";
                iframe.allowFullscreen = true;
                iframe.style.width = 'min(85vw, 800px)';
                iframe.style.height = 'min(85vh, 600px)';
                iframe.style.border = 'none';
                lightboxContentDiv.appendChild(iframe);
            } else {
                const img = document.createElement('img');
                img.src = src;
                img.alt = 'Expanded';
                lightboxContentDiv.appendChild(img);
            }
            lightboxModal.classList.add('show');
        }

        function closeLightbox() {
            lightboxModal.classList.remove('show');
        }
        window.closeLightbox = closeLightbox;

        function bindMediaThumbs() {
            document.querySelectorAll('.media-thumb').forEach(thumb => {
                thumb.style.cursor = 'pointer';
                thumb.removeEventListener('click', thumb.clickHandler);
                const handler = (e) => {
                    e.stopPropagation();
                    const src = thumb.getAttribute('data-src');
                    const type = thumb.getAttribute('data-type');
                    if (src) openLightbox(src, type);
                };
                thumb.addEventListener('click', handler);
                thumb.clickHandler = handler;
            });
        }

        // ===== COLLAPSIBLE =====
        document.querySelectorAll('.collapsible-section').forEach(section => {
            const header = section.querySelector('.section-header');
            const content = section.querySelector('.collapsible-content');
            const icon = header.querySelector('i:last-child');
            header.addEventListener('click', (e) => {
                e.stopPropagation();
                if (content.classList.contains('collapsed')) {
                    content.classList.remove('collapsed');
                    icon.classList.remove('fa-chevron-down');
                    icon.classList.add('fa-chevron-up');
                } else {
                    content.classList.add('collapsed');
                    icon.classList.remove('fa-chevron-up');
                    icon.classList.add('fa-chevron-down');
                }
            });
        });

        // ===== EXPANDABLE MEDIA =====
        function setupExpandable(selector, attr) {
            document.querySelectorAll(selector).forEach(card => {
                const target = card.getAttribute(attr);
                if (target) {
                    const expandDiv = document.getElementById(target);
                    const iconSpan = card.querySelector('.expand-icon i');
                    card.addEventListener('click', (e) => {
                        if (e.target.closest('.media-thumb') || e.target.closest('.project-link')) return;
                        e.stopPropagation();
                        if (expandDiv) {
                            expandDiv.classList.toggle('show');
                            if (iconSpan) {
                                if (expandDiv.classList.contains('show')) {
                                    iconSpan.classList.remove('fa-chevron-down');
                                    iconSpan.classList.add('fa-chevron-up');
                                } else {
                                    iconSpan.classList.remove('fa-chevron-up');
                                    iconSpan.classList.add('fa-chevron-down');
                                }
                            }
                            bindMediaThumbs();
                        }
                    });
                }
            });
        }
        setupExpandable('.hobby-card', 'data-expand');
        setupExpandable('.gallery-item', 'data-expand');

        // ===== PHONE CLICK =====
        document.getElementById('phoneCard')?.addEventListener('click', () => {
            if (confirm("📞 Call +63 956 597 0762?")) window.location.href = "tel:+639565970762";
        });

        // ===== CURSOR =====
        const cursorDiv = document.getElementById('cursorFollower');
        if (cursorDiv) {
            document.addEventListener('mousemove', (e) => {
                cursorDiv.style.left = e.clientX + 'px';
                cursorDiv.style.top = e.clientY + 'px';
            });
            const interact = document.querySelectorAll('button, .card, .gallery-item, .section-header, .hobby-card, .contact-card, .media-thumb, .nav-links a, .nav-btn');
            interact.forEach(el => {
                el.addEventListener('mouseenter', () => {
                    cursorDiv.style.width = '48px';
                    cursorDiv.style.height = '48px';
                    cursorDiv.style.backgroundColor = 'rgba(59,130,246,0.35)';
                });
                el.addEventListener('mouseleave', () => {
                    cursorDiv.style.width = '32px';
                    cursorDiv.style.height = '32px';
                    cursorDiv.style.backgroundColor = 'rgba(59,130,246,0.25)';
                });
            });
        }

        // ===== RIPPLE =====
        function createRipple(x, y) {
            const rip = document.createElement('div');
            rip.classList.add('water-ripple');
            rip.style.left = x + 'px';
            rip.style.top = y + 'px';
            rip.style.width = '40px';
            rip.style.height = '40px';
            rip.style.marginLeft = '-20px';
            rip.style.marginTop = '-20px';
            document.getElementById('rippleContainer').appendChild(rip);
            rip.addEventListener('animationend', () => rip.remove());
        }
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.lightbox-modal')) createRipple(e.clientX, e.clientY);
        });

        // ===== TYPEWRITER =====
        const fullNameForType = "ROMAN JUAN G. EUGENIO I";
        let charIdx = 0;
        const nameSpanEl = document.getElementById('dynamicName');
        const cursorSpanEl = document.getElementById('cursor');

        function typeWriter() {
            if (charIdx < fullNameForType.length) {
                nameSpanEl.textContent += fullNameForType.charAt(charIdx);
                charIdx++;
                setTimeout(typeWriter, 200);
            } else {
                if (cursorSpanEl) cursorSpanEl.style.animation = 'blinkGlow 0.9s step-end infinite';
            }
        }
        setTimeout(typeWriter, 300);

        // ===== PARTICLES =====
        function createParticles() {
            const container = document.getElementById('particles');
            if (!container) return;
            for (let i = 0; i < 40; i++) {
                const p = document.createElement('div');
                p.classList.add('particle');
                const sz = Math.random() * 8 + 3;
                p.style.cssText =
                    `width:${sz}px; height:${sz}px; left:${Math.random()*100}%; top:${Math.random()*100}%; animation-delay:${Math.random()*10}s; animation-duration:${Math.random()*10+8}s; opacity:${Math.random()*0.4+0.1};`;
                container.appendChild(p);
            }
        }
        createParticles();

        // ===== THEME =====
        const themeBtn = document.getElementById('themeToggleNav');
        const bodyEl = document.body;

        function setTheme(theme) {
            if (theme === 'dark') {
                bodyEl.classList.add('dark');
                localStorage.setItem('theme', 'dark');
                themeBtn.innerHTML = '<i class="fas fa-sun"></i> Light';
            } else {
                bodyEl.classList.remove('dark');
                localStorage.setItem('theme', 'light');
                themeBtn.innerHTML = '<i class="fas fa-moon"></i> Dark';
            }
        }
        const storedTheme = localStorage.getItem('theme');
        if (storedTheme === 'light') setTheme('light');
        else setTheme('dark');
        themeBtn.addEventListener('click', () => {
            bodyEl.classList.contains('dark') ? setTheme('light') : setTheme('dark');
        });

        // ===== FADE IN ON SCROLL =====
        const faders = document.querySelectorAll('.fade-up, .card, .gallery-item, .ref-card, .hobby-card, .contact-card');
        const obs = new IntersectionObserver((entries) => {
            entries.forEach(e => {
                if (e.isIntersecting) {
                    e.target.style.animation = 'fadeUp 0.5s forwards';
                    obs.unobserve(e.target);
                }
            });
        }, { threshold: 0.1 });
        faders.forEach(el => {
            el.style.opacity = '0';
            el.style.animation = 'none';
            obs.observe(el);
        });

        // ===== NAV SMOOTH SCROLL =====
        document.querySelectorAll('.nav-links a').forEach(anchor => {
            anchor.addEventListener('click', function(e) {
                e.preventDefault();
                const target = this.getAttribute('href').substring(1);
                const targetEl = document.getElementById(target);
                if (targetEl) {
                    const offset = 80;
                    window.scrollTo({
                        top: targetEl.getBoundingClientRect().top + window.pageYOffset - offset,
                        behavior: 'smooth'
                    });
                }
            });
        });

        // ===== INIT MEDIA THUMBS =====
        bindMediaThumbs();