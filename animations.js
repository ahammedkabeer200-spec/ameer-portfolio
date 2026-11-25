/**
 * AMEER SUHAIL PORTFOLIO — Premium Scroll Animations
 * Phase 1: Lenis Smooth Scroll
 * Phase 2: Floating Role Pills
 * Phase 3: Kinetic Horizontal Work Scroller
 * Phase 4: Scroll-triggered reveal animations
 */

(function() {
  'use strict';

  // ====== PHASE 0: FULL-PAGE BACKGROUND PORTRAIT SCROLL CANVAS ======
  initBackgroundScrollCanvas();

  function initBackgroundScrollCanvas() {
    const canvas = document.getElementById('bgPortraitCanvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    const TOTAL_FRAMES = 240;
    const desktopImages = new Array(TOTAL_FRAMES);
    const mobileImages = new Array(TOTAL_FRAMES);
    const loadedDesktop = new Set();
    const loadedMobile = new Set();

    let targetProgress = 0;
    let currentProgress = 0;
    let lastDrawnIdx = -1;
    let lastDrawnImg = null;
    let forceRedraw = false;
    let lastMode = null;

    function isMobileMode() {
      return window.innerWidth < 768 || window.innerHeight > window.innerWidth;
    }

    function getFrameUrl(idx, mobile) {
      const num = String(idx + 1).padStart(3, '0');
      if (mobile) {
        return `assets/portrait-frames-mobile/frame-${num}.jpg?v=1`;
      }
      return `assets/portrait-frames/ezgif-frame-${num}.jpg?v=2`;
    }

    function getBestAvailableImage(targetIdx, mobile) {
      const loaded = mobile ? loadedMobile : loadedDesktop;
      const images = mobile ? mobileImages : desktopImages;

      if (loaded.has(targetIdx)) return images[targetIdx];
      for (let offset = 1; offset < TOTAL_FRAMES; offset++) {
        const prev = targetIdx - offset;
        if (prev >= 0 && loaded.has(prev)) return images[prev];
        const next = targetIdx + offset;
        if (next < TOTAL_FRAMES && loaded.has(next)) return images[next];
      }
      return images[0] || null;
    }

    function drawBgImage(img) {
      if (!img || !img.complete || img.naturalWidth === 0) return;

      const cw = canvas.width;
      const ch = canvas.height;
      const iw = img.naturalWidth;
      const ih = img.naturalHeight;

      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, cw, ch);

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const isMobile = isMobileMode();

      let nw, nh, nx, ny;

      if (isMobile) {
        // Mobile 9:16 portrait mode (matches user sample 576x1024):
        // Scale to cleanly fill viewport height and center, positioning headroom & subject with 100% natural presence
        const scale = Math.max(cw / iw, ch / ih);
        nw = iw * scale;
        nh = ih * scale;
        nx = (cw - nw) / 2;
        ny = (ch - nh) / 2;
      } else {
        // Desktop / landscape viewports (1280x720 frames):
        // Fit cleanly to 92% of viewport height (capped at 1.35x), showing full head & shoulders in crisp clarity.
        const cssScale = Math.min(1.35, Math.max(0.70, (window.innerHeight * 0.92) / ih));
        const scale = cssScale * dpr;
        nw = iw * scale;
        nh = ih * scale;
        nx = (cw - nw) / 2;
        ny = Math.round((ch - nh) / 2);
      }

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, 0, 0, iw, ih, nx, ny, nw, nh);

      // Feather outer edges only on desktop where frame does not span beyond canvas borders
      if (!isMobile) {
        const fadeX = Math.min(48 * dpr, nw * 0.06);
        const fadeY = Math.min(24 * dpr, nh * 0.04);

        if (nx > 0) {
          const leftGrad = ctx.createLinearGradient(nx, 0, nx + fadeX, 0);
          leftGrad.addColorStop(0, '#000000');
          leftGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
          ctx.fillStyle = leftGrad;
          ctx.fillRect(nx - 1, ny, fadeX + 1, nh);

          const rightGrad = ctx.createLinearGradient(nx + nw - fadeX, 0, nx + nw, 0);
          rightGrad.addColorStop(0, 'rgba(0, 0, 0, 0)');
          rightGrad.addColorStop(1, '#000000');
          ctx.fillStyle = rightGrad;
          ctx.fillRect(nx + nw - fadeX - 1, ny, fadeX + 2, nh);
        }

        if (ny > 0) {
          const topGrad = ctx.createLinearGradient(0, ny, 0, ny + fadeY);
          topGrad.addColorStop(0, '#000000');
          topGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
          ctx.fillStyle = topGrad;
          ctx.fillRect(nx, ny - 1, nw, fadeY + 1);

          const botGrad = ctx.createLinearGradient(0, ny + nh - fadeY, 0, ny + nh);
          botGrad.addColorStop(0, 'rgba(0, 0, 0, 0)');
          botGrad.addColorStop(1, '#000000');
          ctx.fillStyle = botGrad;
          ctx.fillRect(nx, ny + nh - fadeY - 1, nw, fadeY + 2);
        }
      }
    }

    function renderBgCurrent(force) {
      const idx = Math.max(0, Math.min(TOTAL_FRAMES - 1, Math.round(currentProgress * (TOTAL_FRAMES - 1))));
      const mobile = isMobileMode();
      const img = getBestAvailableImage(idx, mobile);
      if (img && (force || img !== lastDrawnImg)) {
        drawBgImage(img);
        lastDrawnIdx = idx;
        lastDrawnImg = img;
      }
    }

    function resizeBgCanvas() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(window.innerWidth * dpr);
      canvas.height = Math.round(window.innerHeight * dpr);
      const currentMode = isMobileMode();
      if (lastMode !== currentMode) {
        lastMode = currentMode;
        loadFrame(0, currentMode, function () {
          renderBgCurrent(true);
          startRemainingQueue(currentMode);
        });
      } else {
        renderBgCurrent(true);
      }
    }

    window.addEventListener('resize', resizeBgCanvas, { passive: true });

    function bgAnimationLoop() {
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      if (maxScroll > 0) {
        targetProgress = Math.max(0, Math.min(1, window.scrollY / maxScroll));
      }

      const diff = targetProgress - currentProgress;
      if (Math.abs(diff) > 0.0001 || forceRedraw) {
        if (Math.abs(diff) > 0.0001) {
          currentProgress += diff * 0.09;
        } else {
          currentProgress = targetProgress;
        }
        forceRedraw = false;
        renderBgCurrent(false);
      }

      requestAnimationFrame(bgAnimationLoop);
    }

    // High-performance preloader with off-thread decode
    function loadFrame(idx, mobile, onDone) {
      const loaded = mobile ? loadedMobile : loadedDesktop;
      const images = mobile ? mobileImages : desktopImages;

      if (loaded.has(idx)) {
        if (onDone) onDone();
        return;
      }
      const img = new Image();
      function onReady() {
        images[idx] = img;
        loaded.add(idx);
        if (Math.abs(idx - lastDrawnIdx) <= 8 && isMobileMode() === mobile) {
          forceRedraw = true;
        }
        if (onDone) onDone();
      }

      img.onload = function () {
        if (img.decode) {
          img.decode().then(onReady).catch(onReady);
        } else {
          onReady();
        }
      };
      img.onerror = function () {
        if (onDone) onDone();
      };
      img.src = getFrameUrl(idx, mobile);
    }

    function startRemainingQueue(mobile) {
      const queue = [];
      // Keyframes first (every 6th frame) for immediate scrub coverage across entire timeline
      for (let i = 6; i < TOTAL_FRAMES; i += 6) {
        queue.push(i);
      }
      if (!queue.includes(TOTAL_FRAMES - 1)) queue.push(TOTAL_FRAMES - 1);
      // Intermediate frames next
      for (let i = 1; i < TOTAL_FRAMES; i++) {
        if (i % 6 !== 0 && i !== TOTAL_FRAMES - 1) {
          queue.push(i);
        }
      }

      let cursor = 0;
      const WORKERS = 10;

      function nextWorker() {
        if (cursor >= queue.length) return;
        const idx = queue[cursor++];
        loadFrame(idx, mobile, nextWorker);
      }

      for (let w = 0; w < WORKERS; w++) {
        nextWorker();
      }
    }

    resizeBgCanvas();
    const initMobile = isMobileMode();
    lastMode = initMobile;
    loadFrame(0, initMobile, function () {
      renderBgCurrent(true);
      startRemainingQueue(initMobile);
    });
    requestAnimationFrame(bgAnimationLoop);
  }

  // Wait for all libraries to load
  function waitForLibs(cb) {
    const check = setInterval(() => {
      if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined' && typeof Lenis !== 'undefined') {
        clearInterval(check);
        cb();
      }
    }, 100);
    // Safety timeout: proceed without libs after 5s
    setTimeout(() => { clearInterval(check); cb(); }, 5000);
  }

  waitForLibs(initAllAnimations);

  function initAllAnimations() {
    // ====== PHASE 1: LENIS SMOOTH SCROLL ======
    if (typeof Lenis !== 'undefined') {
      const lenis = new Lenis({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        orientation: 'vertical',
        gestureOrientation: 'vertical',
        smoothWheel: true,
        wheelMultiplier: 1,
        touchMultiplier: 2,
        infinite: false,
      });

      // Connect Lenis to GSAP's ticker for perfect sync
      if (typeof gsap !== 'undefined') {
        gsap.ticker.add((time) => {
          lenis.raf(time * 1000);
        });
        gsap.ticker.lagSmoothing(0);
      } else {
        // Fallback RAF loop
        function raf(time) {
          lenis.raf(time);
          requestAnimationFrame(raf);
        }
        requestAnimationFrame(raf);
      }

      // Make Lenis work with anchor links
      document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', (e) => {
          const target = document.querySelector(anchor.getAttribute('href'));
          if (target) {
            e.preventDefault();
            lenis.scrollTo(target, { offset: -80 });
          }
        });
      });
    }

    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;
    gsap.registerPlugin(ScrollTrigger);

    // ====== PHASE 2: FLOATING ROLE PILLS ======
    const pills = document.querySelectorAll('.role-pill');
    if (pills.length) {
      pills.forEach((pill, i) => {
        // Entrance animation
        gsap.fromTo(pill, {
          opacity: 0,
          y: 20,
          scale: 0.8
        }, {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.6,
          delay: 0.8 + i * 0.15,
          ease: 'back.out(1.7)'
        });

        // Subtle continuous floating animation (bounded to avoid row overlap)
        gsap.to(pill, {
          y: i % 2 === 0 ? -3 : 3,
          duration: 2 + i * 0.4,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
          delay: i * 0.3
        });
      });
    }

    // ====== PHASE 3: HERO ENTRANCE ANIMATIONS ======
    const heroHeadline = document.getElementById('heroHeadlineText');
    const heroLead = document.getElementById('heroLeadText');
    const heroBg = document.querySelector('.hero-backdrop-word');
    const heroImg = document.getElementById('heroPortraitImg');
    const heroSig = document.querySelector('.signature-wrapper');

    if (heroHeadline) {
      gsap.fromTo(heroHeadline, { opacity: 0, x: -60 }, { opacity: 1, x: 0, duration: 1, ease: 'power3.out', delay: 0.2 });
    }
    if (heroLead) {
      gsap.fromTo(heroLead, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.8, ease: 'power2.out', delay: 0.5 });
    }
    if (heroBg) {
      gsap.fromTo(heroBg, { opacity: 0, scale: 0.9 }, { opacity: 1, scale: 1, duration: 1.2, ease: 'power2.out', delay: 0.1 });
      // Parallax on scroll
      gsap.to(heroBg, {
        yPercent: -30,
        ease: 'none',
        scrollTrigger: {
          trigger: '.hero-section',
          start: 'top top',
          end: 'bottom top',
          scrub: true
        }
      });
    }
    if (heroImg) {
      gsap.fromTo(heroImg, { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 1, ease: 'power2.out', delay: 0.3 });
    }
    if (heroSig) {
      gsap.fromTo(heroSig, { opacity: 0, x: -30 }, { opacity: 1, x: 0, duration: 0.8, ease: 'power2.out', delay: 0.7 });
    }

    // ====== PHASE 4: KINETIC HORIZONTAL WORK SCROLLER ======
    const trackWrapper = document.querySelector('.kinetic-track-wrapper');
    const track = document.querySelector('.kinetic-track');
    const kineticSection = document.querySelector('.kinetic-work-section');
    let kineticTween = null;

    function initKineticTrack() {
      if (!trackWrapper || !track || !kineticSection) return;
      const cards = track.querySelectorAll('.project-card-mini, .modal-project-card');
      if (cards.length === 0) return;

      if (kineticTween) {
        if (kineticTween.scrollTrigger) kineticTween.scrollTrigger.kill();
        kineticTween.kill();
        kineticTween = null;
      }

      // On mobile (<768px), let cards flow natively vertically
      if (window.innerWidth <= 768) {
        gsap.set(track, { clearProps: 'all' });
        return;
      }

      const totalScroll = track.scrollWidth - trackWrapper.offsetWidth;
      if (totalScroll > 0) {
        kineticTween = gsap.to(track, {
          x: () => -totalScroll,
          ease: 'none',
          scrollTrigger: {
            id: 'horizontalScroll',
            trigger: kineticSection,
            start: 'top 12%',
            end: () => '+=' + (totalScroll * 1.2),
            scrub: 1,
            pin: true,
            anticipatePin: 1,
            invalidateOnRefresh: true
          }
        });

        // Stagger entrance for each card
        cards.forEach((card, i) => {
          gsap.fromTo(card, {
            opacity: 0,
            y: 30
          }, {
            opacity: 1,
            y: 0,
            duration: 0.6,
            delay: i * 0.1,
            ease: 'power2.out'
          });
        });

        ScrollTrigger.refresh();
      }
    }
    window.initKineticTrack = initKineticTrack;

    // Initial run with fallback timeout
    setTimeout(initKineticTrack, 600);
    setTimeout(initKineticTrack, 1500);

    // ====== PHASE 5: GENERAL SCROLL REVEAL ANIMATIONS ======
    // Animate all .reveal-up sections
    document.querySelectorAll('.reveal-up').forEach(el => {
      gsap.fromTo(el, { opacity: 0, y: 50 }, {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: el,
          start: 'top 85%',
          toggleActions: 'play none none reverse'
        }
      });
    });

    // Animate metric numbers
    document.querySelectorAll('.about-metric-item').forEach((item, i) => {
      gsap.fromTo(item, { opacity: 0, x: 30 }, {
        opacity: 1,
        x: 0,
        duration: 0.6,
        delay: i * 0.1,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: item,
          start: 'top 88%',
          toggleActions: 'play none none reverse'
        }
      });
    });

    // Animate TOC items
    document.querySelectorAll('.toc-dir-item').forEach((item, i) => {
      gsap.fromTo(item, { opacity: 0, y: 20 }, {
        opacity: 1,
        y: 0,
        duration: 0.5,
        delay: i * 0.1,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: item,
          start: 'top 90%',
          toggleActions: 'play none none reverse'
        }
      });
    });

    // Animate service items
    document.querySelectorAll('.service-item-mini').forEach((item, i) => {
      gsap.fromTo(item, { opacity: 0, x: -20 }, {
        opacity: 1,
        x: 0,
        duration: 0.5,
        delay: i * 0.08,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: item,
          start: 'top 90%',
          toggleActions: 'play none none reverse'
        }
      });
    });

    // Watermark parallax
    const watermark = document.querySelector('.kinetic-watermark');
    if (watermark) {
      gsap.to(watermark, {
        xPercent: -15,
        ease: 'none',
        scrollTrigger: {
          trigger: kineticSection,
          start: 'top bottom',
          end: 'bottom top',
          scrub: true
        }
      });
    }

    console.log('✦ Premium animations initialized (Lenis + GSAP + ScrollTrigger)');
  }
})();
