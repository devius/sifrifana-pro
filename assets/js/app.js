import { mutedSvg, unmutedSvg, fullscreenSvg, exitFullscreenSvg, testimonials } from './config.js';
import { initBackground, pauseBackground, resumeBackground } from './three-bg.js';
import { initSoftwareCubes } from './three-software.js';
import { initGlobe } from './three-globe.js';

    /* ── Video player controls ── */
            let currentVideo = null;
            let fullscreenWrapper = null;

    function syncBackground() {
      const anyPlaying = Array.from(document.querySelectorAll('video')).some(v => !v.paused);
      if (anyPlaying || fullscreenWrapper) pauseBackground(); else resumeBackground();
    }

    let fullscreenPlaceholder = null;

    function exitFullscreen(wrapper, andPause) {
      if (!wrapper) return;
      const video = wrapper.querySelector('video');
      const fsBtn = wrapper.querySelector('.vid-fullscreen');
      wrapper.classList.remove('video-fullscreen-active');
      document.body.style.overflow = '';
      if (fsBtn) {
        fsBtn.innerHTML = fullscreenSvg;
        fsBtn.setAttribute('aria-label', 'Enter fullscreen');
      }
      // Restore wrapper to its original DOM position
      if (fullscreenPlaceholder && fullscreenPlaceholder.parentElement) {
        fullscreenPlaceholder.parentElement.replaceChild(wrapper, fullscreenPlaceholder);
        fullscreenPlaceholder = null;
      }
      fullscreenWrapper = null;
      if (andPause && video && !video.paused) {
        video.pause();
        currentVideo = null;
        const overlay = wrapper.querySelector('.video-overlay');
        const playBtn = wrapper.querySelector('.vid-play');
        if (overlay) overlay.classList.remove('hidden');
        if (playBtn) {
          playBtn.innerHTML = '<svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor"><polygon points="5,3 17,10 5,17"/></svg>';
          playBtn.setAttribute('aria-label', 'Play video');
        }
      }
      syncBackground();
    }

    function enterFullscreen(wrapper) {
      if (fullscreenWrapper && fullscreenWrapper !== wrapper) {
        exitFullscreen(fullscreenWrapper, true);
      }
      const fsBtn = wrapper.querySelector('.vid-fullscreen');
      // Move wrapper to body so position:fixed escapes transform containing blocks
      fullscreenPlaceholder = document.createComment('fullscreen-placeholder');
      wrapper.parentElement.replaceChild(fullscreenPlaceholder, wrapper);
      document.body.appendChild(wrapper);
      wrapper.classList.add('video-fullscreen-active');
      document.body.style.overflow = 'hidden';
      if (fsBtn) {
        fsBtn.innerHTML = exitFullscreenSvg;
        fsBtn.setAttribute('aria-label', 'Exit fullscreen');
      }
      fullscreenWrapper = wrapper;
      syncBackground();
    }

    // ESC key exits fullscreen and pauses
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && fullscreenWrapper) {
        exitFullscreen(fullscreenWrapper, true);
      }
    });

    // Scroll (wheel) exits fullscreen and pauses — accumulate delta with decay
    let wheelAccum = 0;
    let wheelTimer = null;
    document.addEventListener('wheel', e => {
      if (!fullscreenWrapper) return;
      e.preventDefault();
      wheelAccum += Math.abs(e.deltaY);
      if (wheelAccum > 150) {
        wheelAccum = 0;
        clearTimeout(wheelTimer);
        exitFullscreen(fullscreenWrapper, true);
        return;
      }
      clearTimeout(wheelTimer);
      wheelTimer = setTimeout(() => { wheelAccum = 0; }, 400);
    }, { passive: false });

    // Swipe up/down exits fullscreen and pauses
    let touchStartY = null;
    document.addEventListener('touchstart', e => {
      if (fullscreenWrapper) touchStartY = e.touches[0].clientY;
    }, { passive: true });
    document.addEventListener('touchmove', e => {
      if (fullscreenWrapper && touchStartY !== null) {
        const dy = Math.abs(e.touches[0].clientY - touchStartY);
        if (dy > 80) {
          touchStartY = null;
          exitFullscreen(fullscreenWrapper, true);
        }
      }
    }, { passive: true });

    document.querySelectorAll('.video-overlay').forEach(overlay => {
      const wrapper = overlay.parentElement;
      const video = wrapper.querySelector('video');
      const playBtn = overlay.querySelector('.vid-play');
      const muteBtn = overlay.querySelector('.vid-mute');
      playBtn.setAttribute('aria-label', 'Play video');
      muteBtn.setAttribute('aria-label', 'Unmute video');

      // Progress bar
      const progress = document.createElement('div');
      progress.className = 'vid-progress';
      const progressFill = document.createElement('div');
      progressFill.className = 'vid-progress-fill';
      progress.appendChild(progressFill);
      wrapper.appendChild(progress);

      // Fullscreen button
      const fsBtn = document.createElement('button');
      fsBtn.className = 'vid-fullscreen';
      fsBtn.title = 'Fullscreen';
      fsBtn.setAttribute('aria-label', 'Enter fullscreen');
      fsBtn.innerHTML = fullscreenSvg;
      overlay.appendChild(fsBtn);

      fsBtn.addEventListener('click', e => {
        e.stopPropagation();
        if (wrapper.classList.contains('video-fullscreen-active')) {
          exitFullscreen(wrapper, false);
        } else {
          enterFullscreen(wrapper);
        }
      });

      video.addEventListener('timeupdate', () => {
        if (video.duration) {
          progressFill.style.width = (video.currentTime / video.duration * 100) + '%';
        }
      });

      let seeking = false;
      function seek(e) {
        const rect = progress.getBoundingClientRect();
        const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
        if (video.duration) video.currentTime = ratio * video.duration;
      }
      progress.addEventListener('mousedown', e => { e.stopPropagation(); seeking = true; seek(e); });
      progress.addEventListener('touchstart', e => { e.stopPropagation(); seeking = true; seek(e.touches[0]); }, { passive: true });
      progress.addEventListener('click', e => { e.stopPropagation(); });
      window.addEventListener('mousemove', e => { if (seeking) seek(e); });
      window.addEventListener('touchmove', e => { if (seeking) seek(e.touches[0]); }, { passive: true });
      window.addEventListener('mouseup', () => { seeking = false; });
      window.addEventListener('touchend', () => { seeking = false; });

      function stopOthers() {
        document.querySelectorAll('video').forEach(v => {
          if (v !== video && !v.paused) {
            const w = v.parentElement;
            if (w.classList.contains('video-fullscreen-active')) {
              exitFullscreen(w, true);
            } else {
              v.pause();
              w.querySelector('.video-overlay').classList.remove('hidden');
              const pb = w.querySelector('.vid-play');
              pb.innerHTML = '<svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor"><polygon points="5,3 17,10 5,17"/></svg>';
            }
          }
        });
      }

      playBtn.addEventListener('click', e => {
        e.stopPropagation();
        if (video.paused) {
          stopOthers();
          video.muted = false;
          muteBtn.innerHTML = unmutedSvg;
          muteBtn.title = 'Mute';
          video.play();
          currentVideo = video;
          syncBackground();
          overlay.classList.add('hidden');
          playBtn.innerHTML = '<svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor"><rect x="4" y="3" width="4" height="14"/><rect x="12" y="3" width="4" height="14"/></svg>';
          playBtn.setAttribute('aria-label', 'Pause video');
        } else {
          video.pause();
          currentVideo = null;
          syncBackground();
          overlay.classList.remove('hidden');
          playBtn.innerHTML = '<svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor"><polygon points="5,3 17,10 5,17"/></svg>';
          playBtn.setAttribute('aria-label', 'Play video');
        }
      });

      wrapper.addEventListener('click', e => {
        if (e.target.closest('.vid-mute') || e.target.closest('.vid-play') || e.target.closest('.vid-progress') || e.target.closest('.vid-fullscreen')) return;
        clearTimeout(clickPauseTimer);
        clickPauseTimer = setTimeout(() => {
          if (video.paused) {
            playBtn.click();
          } else {
            video.pause();
            currentVideo = null;
            syncBackground();
            overlay.classList.remove('hidden');
            playBtn.innerHTML = '<svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor"><polygon points="5,3 17,10 5,17"/></svg>';
            playBtn.setAttribute('aria-label', 'Play video');
          }
        }, 250);
      });

      muteBtn.addEventListener('click', e => {
        e.stopPropagation();
        video.muted = !video.muted;
        muteBtn.innerHTML = video.muted ? mutedSvg : unmutedSvg;
        muteBtn.title = video.muted ? 'Unmute' : 'Mute';
        muteBtn.setAttribute('aria-label', video.muted ? 'Unmute video' : 'Mute video');
      });

      // Auto-hide controls while playing
      let idleTimer = null;
      function scheduleHide() {
        clearTimeout(idleTimer);
        if (video.paused) return;
        idleTimer = setTimeout(() => { wrapper.classList.add('controls-idle'); }, 2500);
      }
      function showControls() {
        wrapper.classList.remove('controls-idle');
        scheduleHide();
      }
      video.addEventListener('play', () => {
        wrapper.classList.add('has-played');
        scheduleHide();
      });
      video.addEventListener('pause', () => {
        clearTimeout(idleTimer);
        wrapper.classList.remove('controls-idle');
      });
      wrapper.addEventListener('mousemove', showControls);
      wrapper.addEventListener('touchstart', showControls, { passive: true });

      // Double-click toggles fullscreen; defer single-click pause so it doesn't fire first
      let clickPauseTimer = null;
      wrapper.addEventListener('dblclick', e => {
        if (e.target.closest('.vid-mute') || e.target.closest('.vid-play') || e.target.closest('.vid-progress') || e.target.closest('.vid-fullscreen')) return;
        clearTimeout(clickPauseTimer);
        clickPauseTimer = null;
        if (wrapper.classList.contains('video-fullscreen-active')) {
          exitFullscreen(wrapper, false);
        } else {
          enterFullscreen(wrapper);
        }
      });

      video.addEventListener('ended', () => {
        if (wrapper.classList.contains('video-fullscreen-active')) {
          exitFullscreen(wrapper, false);
        }
        currentVideo = null;
        syncBackground();
        overlay.classList.remove('hidden');
        playBtn.innerHTML = '<svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor"><polygon points="5,3 17,10 5,17"/></svg>';
        playBtn.setAttribute('aria-label', 'Play video');
      });
    });

    /* ── Auto-pause videos when scrolled under the header or out of viewport ── */
    let videoObs = null;
    function handleVideoIntersect(entries) {
      entries.forEach(e => {
        if (e.isIntersecting) return;
        const wrapper = e.target.closest('.video-item, .short-item, .testimonial-item') || e.target.parentElement;
        const video = e.target;
        if (video.paused) return;
        if (wrapper.classList.contains('video-fullscreen-active')) return;
        video.pause();
        currentVideo = null;
        syncBackground();
        const overlay = wrapper.querySelector('.video-overlay');
        const playBtn = wrapper.querySelector('.vid-play');
        if (overlay) overlay.classList.remove('hidden');
        if (playBtn) {
          playBtn.innerHTML = '<svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor"><polygon points="5,3 17,10 5,17"/></svg>';
          playBtn.setAttribute('aria-label', 'Play video');
        }
      });
    }
    function buildVideoObs() {
      if (videoObs) videoObs.disconnect();
      const headerEl = document.getElementById('header');
      const h = headerEl ? headerEl.offsetHeight : 0;
      videoObs = new IntersectionObserver(handleVideoIntersect, {
        threshold: 0,
        rootMargin: `-${h}px 0px 0px 0px`
      });
      document.querySelectorAll('video').forEach(v => videoObs.observe(v));
    }
    buildVideoObs();
    let resizeTimer = null;
    addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(buildVideoObs, 150);
    }, { passive: true });

    /* ── Scroll handling ── */
    function onScroll() {
      const sy = scrollY;

      // Header
      document.getElementById('header').classList.toggle('scrolled', sy > 50);
    }
    addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    /* ── Scroll reveal (IntersectionObserver) ── */
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('visible');
          obs.unobserve(e.target);
        }
      });
    }, { threshold: 0.15 });
    document.querySelectorAll('.reveal').forEach(el => obs.observe(el));

    /* ── Counter animation ── */
    const counterObs = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (!e.isIntersecting) return;
        const el = e.target;
        const target = parseInt(el.dataset.target);
        const dur = 2000;
        const start = performance.now();
        function tick(now) {
          const p = Math.min((now - start) / dur, 1);
          const ease = 1 - Math.pow(1 - p, 3);
          const v = Math.floor(target * ease);
          el.textContent = (target >= 1000 ? v.toLocaleString() : v) + '+';
          if (p < 1) requestAnimationFrame(tick);
        }
        requestAnimationFrame(tick);
        counterObs.unobserve(el);
      });
    }, { threshold: 0.5 });
    document.querySelectorAll('.stat-number').forEach(el => counterObs.observe(el));

    /* ── Testimonials (dynamic) ── */

    const grid = document.getElementById('testimonials-grid');
    testimonials.forEach((t, i) => {
      const div = document.createElement('div');
      div.className = 'testimonial reveal';
      div.style.transitionDelay = (i % 2) * 0.15 + 's';
      const hue = 190 + (i / (testimonials.length - 1)) * 140;
      div.style.setProperty('--accent', `hsl(${hue}, 100%, 65%)`);
      div.innerHTML = `
    <div class="testimonial-header">
      <div class="testimonial-num"><span>${i + 1}</span></div>
      <div class="testimonial-line"></div>
    </div>
    <q>${t.q}</q>
    <div class="testimonial-author">
      <div class="testimonial-dash"></div>
      <div>
        <p class="testimonial-name">${t.n}</p>
        ${t.c ? `<p class="testimonial-company">${t.c}</p>` : ''}
      </div>
    </div>`;
      grid.appendChild(div);
      obs.observe(div);
    });

    /* ── Mobile menu ── */
    const menuBtn = document.getElementById('menu-btn');
    const nav = document.getElementById('nav');
    menuBtn.addEventListener('click', () => {
      nav.classList.toggle('open');
      menuBtn.classList.toggle('open');
      document.body.classList.toggle('menu-open');
    });
    document.querySelectorAll('#nav a').forEach(a => a.addEventListener('click', () => {
      nav.classList.remove('open');
      menuBtn.classList.remove('open');
      document.body.classList.remove('menu-open');
    }));


    /* ── Stats parallax (heading moves with world map) ── */
    const statsSection = document.getElementById('stats');
    const statsGlobe = statsSection?.querySelector('.stats-globe');
    const statsHeading = statsSection?.querySelector('.heading');
    if (statsSection && statsGlobe && statsHeading) {
      let ticking = false;
      const updateStatsParallax = () => {
        const rect = statsSection.getBoundingClientRect();
        const vh = window.innerHeight;
        const progress = (vh - rect.top) / (vh + rect.height);
        const offset = (progress - 0.5) * 120;
        statsGlobe.style.transform = `translateY(${offset}px)`;
        statsHeading.style.transform = `translateY(${offset}px)`;
        ticking = false;
      };
      window.addEventListener('scroll', () => {
        if (!ticking) { requestAnimationFrame(updateStatsParallax); ticking = true; }
      }, { passive: true });
      updateStatsParallax();
    }

initBackground();
initSoftwareCubes();
initGlobe();
