/**
 * AMEER SUHAIL PORTFOLIO — Premium Scroll Animations
 * Phase 1: Lenis Smooth Scroll
 * Phase 2: Floating Role Pills
 * Phase 3: Kinetic Horizontal Work Scroller
 * Phase 4: Scroll-triggered reveal animations
 */

(function() {
  'use strict';

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

        // Continuous floating animation
        gsap.to(pill, {
          y: i % 2 === 0 ? -6 : 6,
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
