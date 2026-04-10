import { mutedSvg, unmutedSvg, testimonials } from './config.js';
import { initBackground } from './three-bg.js';
import { initSoftwareCubes } from './three-software.js';

    /* ── Video player controls ── */
            let currentVideo = null;

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
            v.pause();
            v.parentElement.querySelector('.video-overlay').classList.remove('hidden');
            const pb = v.parentElement.querySelector('.vid-play');
            pb.innerHTML = '<svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor"><polygon points="5,3 17,10 5,17"/></svg>';
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
          overlay.classList.add('hidden');
          playBtn.innerHTML = '<svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor"><rect x="4" y="3" width="4" height="14"/><rect x="12" y="3" width="4" height="14"/></svg>';
          playBtn.setAttribute('aria-label', 'Pause video');
        } else {
          video.pause();
          currentVideo = null;
          overlay.classList.remove('hidden');
          playBtn.innerHTML = '<svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor"><polygon points="5,3 17,10 5,17"/></svg>';
          playBtn.setAttribute('aria-label', 'Play video');
        }
      });

      wrapper.addEventListener('click', e => {
        if (e.target.closest('.vid-mute') || e.target.closest('.vid-play') || e.target.closest('.vid-progress')) return;
        if (!video.paused) {
          video.pause();
          currentVideo = null;
          overlay.classList.remove('hidden');
          playBtn.innerHTML = '<svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor"><polygon points="5,3 17,10 5,17"/></svg>';
          playBtn.setAttribute('aria-label', 'Play video');
        }
      });

      muteBtn.addEventListener('click', e => {
        e.stopPropagation();
        video.muted = !video.muted;
        muteBtn.innerHTML = video.muted ? mutedSvg : unmutedSvg;
        muteBtn.title = video.muted ? 'Unmute' : 'Mute';
        muteBtn.setAttribute('aria-label', video.muted ? 'Unmute video' : 'Mute video');
      });

      video.addEventListener('ended', () => {
        currentVideo = null;
        overlay.classList.remove('hidden');
        playBtn.innerHTML = '<svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor"><polygon points="5,3 17,10 5,17"/></svg>';
        playBtn.setAttribute('aria-label', 'Play video');
      });
    });

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
      entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); } else { e.target.classList.remove('visible'); } });
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
    document.getElementById('menu-btn').addEventListener('click', () => {
      document.getElementById('nav').classList.toggle('open');
    });
    document.querySelectorAll('#nav a').forEach(a => a.addEventListener('click', () => {
      document.getElementById('nav').classList.remove('open');
    }));


initBackground();
initSoftwareCubes();
