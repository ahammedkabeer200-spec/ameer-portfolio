/**
 * AMEER SUHAIL PORTFOLIO — Premium Scroll Animations
 * Phase 1: Lenis Smooth Scroll
 * Phase 2: Floating Role Pills
 * Phase 3: Kinetic Horizontal Work Scroller
 * Phase 4: Scroll-triggered reveal animations
 */

(function() {
  'use strict';

  // ====== PHASE 0: ADAPTIVE HQ BACKGROUND ENGINE (PC & MOBILE: SEQUENCE / VIDEO / IMAGE) ======
  initBackgroundScrollCanvas();

  function initBackgroundScrollCanvas() {
    const canvas = document.getElementById('bgPortraitCanvas');
    const videoEl = document.getElementById('bgPortraitVideo');
    const staticImgEl = document.getElementById('bgPortraitStaticImg');
    const bgWrap = document.querySelector('.bg-scroll-canvas-wrap');
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    const DEFAULT_FRAMES = 240;
    const defaultDesktopImages = new Array(DEFAULT_FRAMES);
    const defaultMobileImages = new Array(DEFAULT_FRAMES);
    const loadedDefaultDesktop = new Set();
    const loadedDefaultMobile = new Set();

    // Custom admin-configured backgrounds cached per device
    let heroBackgroundConfig = window.__heroBackgroundConfig || null;
    const customCache = {
      pc: { key: null, mode: 'default', frames: [], loaded: new Set(), images: [], objectUrl: null, totalFrames: 0, config: {} },
      mobile: { key: null, mode: 'default', frames: [], loaded: new Set(), images: [], objectUrl: null, totalFrames: 0, config: {} }
    };

    let targetProgress = 0;
    let currentProgress = 0;
    let lastDrawnIdx = -1;
    let lastDrawnImg = null;
    let forceRedraw = false;
    let lastIsMobile = null;
    let activeRenderMode = 'sequence'; // 'sequence' | 'video-loop' | 'video-scroll' | 'image'
    let activeVideoConfig = {};
    let defaultQueueGen = 0;
    let defaultBootTimer = null;

    function isMobileMode() {
      return window.innerWidth < 768 || window.innerHeight > window.innerWidth;
    }

    function resolveUrl(url) {
      if (!url) return '';
      if (typeof window.resolveAssetUrl === 'function') {
        const resolved = window.resolveAssetUrl(url);
        // For images uploaded to GitHub, fallback if relative doesn't exist locally yet
        if (url.startsWith('assets/uploads/') && resolved === url && location.hostname !== 'localhost' && location.hostname !== '127.0.0.1') {
          return url;
        }
        return resolved;
      }
      return url;
    }

    function getDefaultFrameUrl(idx, mobile) {
      const num = String(idx + 1).padStart(3, '0');
      return mobile
        ? `assets/portrait-frames-mobile/frame-${num}.jpg?v=1`
        : `assets/portrait-frames/ezgif-frame-${num}.jpg?v=2`;
    }

    function getBestAvailableImage(targetIdx, mobile) {
      const state = customCache[mobile ? 'mobile' : 'pc'];
      if (state.mode === 'sequence' && state.images.length > 0) {
        if (state.loaded.has(targetIdx)) return state.images[targetIdx];
        for (let offset = 1; offset < state.totalFrames; offset++) {
          const prev = targetIdx - offset;
          if (prev >= 0 && state.loaded.has(prev)) return state.images[prev];
          const next = targetIdx + offset;
          if (next < state.totalFrames && state.loaded.has(next)) return state.images[next];
        }
        return state.images[0] || null;
      }

      const loaded = mobile ? loadedDefaultMobile : loadedDefaultDesktop;
      const images = mobile ? defaultMobileImages : defaultDesktopImages;
      if (loaded.has(targetIdx)) return images[targetIdx];
      for (let offset = 1; offset < DEFAULT_FRAMES; offset++) {
        const prev = targetIdx - offset;
        if (prev >= 0 && loaded.has(prev)) return images[prev];
        const next = targetIdx + offset;
        if (next < DEFAULT_FRAMES && loaded.has(next)) return images[next];
      }
      return images[0] || null;
    }

    function drawSourceToCanvas(source, iw, ih, opts) {
      if (!source || !iw || !ih) return;

      const cw = canvas.width;
      const ch = canvas.height;
      const dpr = Math.min(window.devicePixelRatio || 1, 3);
      const isMobile = isMobileMode();

      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, cw, ch);

      const fit = (opts && opts.fit) || 'smart';
      const posX = (opts && opts.posX !== undefined ? opts.posX : 50) / 100;
      const posY = (opts && opts.posY !== undefined ? opts.posY : 50) / 100;

      let nw, nh, nx, ny;

      if (fit === 'cover') {
        const scale = Math.max(cw / iw, ch / ih);
        nw = iw * scale;
        nh = ih * scale;
        nx = (cw - nw) * posX;
        ny = (ch - nh) * posY;
      } else if (fit === 'contain') {
        const scale = Math.min(cw / iw, ch / ih);
        nw = iw * scale;
        nh = ih * scale;
        nx = (cw - nw) * posX;
        ny = (ch - nh) * posY;
      } else if (fit === 'actual') {
        const scale = dpr;
        nw = iw * scale;
        nh = ih * scale;
        nx = (cw - nw) * posX;
        ny = (ch - nh) * posY;
      } else {
        // Smart default framing
        if (isMobile) {
          const scale = Math.max(cw / iw, ch / ih);
          nw = iw * scale;
          nh = ih * scale;
          nx = (cw - nw) * posX;
          ny = (ch - nh) * posY;
        } else {
          const customSeq = customCache.pc.mode !== 'default';
          if (customSeq) {
            const scale = Math.max(cw / iw, ch / ih);
            nw = iw * scale;
            nh = ih * scale;
            nx = (cw - nw) * posX;
            ny = (ch - nh) * posY;
          } else {
            const cssScale = Math.min(1.35, Math.max(0.70, (window.innerHeight * 0.92) / ih));
            const scale = cssScale * dpr;
            nw = iw * scale;
            nh = ih * scale;
            nx = (cw - nw) / 2;
            ny = Math.round((ch - nh) / 2);
          }
        }
      }

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(source, 0, 0, iw, ih, nx, ny, nw, nh);

      // Subtle border feather only on default desktop frame if smaller than canvas
      if (!isMobile && customCache.pc.mode === 'default' && fit === 'smart') {
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
      const mobile = isMobileMode();
      const devKey = mobile ? 'mobile' : 'pc';
      const customState = customCache[devKey];

      if (activeRenderMode === 'video-loop' || activeRenderMode === 'image') {
        return;
      }

      if (activeRenderMode === 'video-scroll') {
        if (videoEl && videoEl.readyState >= 2) {
          drawSourceToCanvas(videoEl, videoEl.videoWidth, videoEl.videoHeight, activeVideoConfig);
        }
        return;
      }

      if (customState.mode === 'pending' || customState.mode === 'loading') {
        return;
      }

      const total = customState.mode === 'sequence' && customState.totalFrames > 0
        ? customState.totalFrames
        : DEFAULT_FRAMES;

      const idx = Math.max(0, Math.min(total - 1, Math.round(currentProgress * (total - 1))));
      const img = getBestAvailableImage(idx, mobile);
      if (img && img.complete && img.naturalWidth > 0 && (force || img !== lastDrawnImg)) {
        drawSourceToCanvas(img, img.naturalWidth, img.naturalHeight, customState.config);
        lastDrawnIdx = idx;
        lastDrawnImg = img;
      }
    }

    function updateScrollDimming() {
      if (!bgWrap) return;
      const y = window.scrollY || 0;
      const vh = window.innerHeight || 800;
      // Keep hero vivid (0 dim); gently dim up to 0.45 as user reads scrolled clean text sections
      const dim = Math.min(0.45, Math.max(0, (y - vh * 0.15) / (vh * 0.7)) * 0.45);
      bgWrap.style.setProperty('--bg-scroll-dim', dim.toFixed(3));
    }

    function setLayerVisibility(mode, cfg) {
      activeRenderMode = mode;
      activeVideoConfig = cfg || {};
      const posX = (cfg && cfg.posX !== undefined) ? cfg.posX : 50;
      const posY = (cfg && cfg.posY !== undefined) ? cfg.posY : 50;
      const fit = (cfg && cfg.fit === 'contain') ? 'contain' : 'cover';

      if (mode === 'video-loop') {
        canvas.style.display = 'none';
        if (staticImgEl) staticImgEl.style.display = 'none';
        if (videoEl) {
          videoEl.style.display = 'block';
          videoEl.style.objectFit = fit;
          videoEl.style.objectPosition = `${posX}% ${posY}%`;
        }
      } else if (mode === 'image') {
        canvas.style.display = 'none';
        if (videoEl) {
          videoEl.pause();
          videoEl.style.display = 'none';
        }
        if (staticImgEl) {
          staticImgEl.style.display = 'block';
          staticImgEl.style.objectFit = fit;
          staticImgEl.style.objectPosition = `${posX}% ${posY}%`;
        }
      } else {
        // 'sequence' or 'video-scroll' rendered onto crisp Retina Canvas
        canvas.style.display = 'block';
        if (staticImgEl) staticImgEl.style.display = 'none';
        if (videoEl) {
          videoEl.pause();
          videoEl.style.display = 'none';
        }
      }
    }

    // Reconstruct Firestore chunked assets reliably (with per-chunk retry)
    async function loadFirestoreChunkedAsset(prefix, count, mimeType) {
      const db = typeof window.initFirebase === 'function' ? window.initFirebase() : null;
      if (!db || !prefix || !count) return null;

      async function fetchChunkWithRetry(i, retries = 2) {
        for (let attempt = 0; attempt <= retries; attempt++) {
          try {
            return await db.collection('content').doc(`${prefix}_${i}`).get();
          } catch (err) {
            if (attempt === retries) throw err;
            await new Promise(r => setTimeout(r, 300 * (attempt + 1)));
          }
        }
      }

      const docs = await Promise.all(
        Array.from({ length: count }, (_, i) => fetchChunkWithRetry(i))
      );

      // Case 1: Sequence chunks ({ frames: [...] })
      const firstData = docs[0] && docs[0].exists ? docs[0].data() : null;
      if (firstData && Array.isArray(firstData.frames)) {
        const allFrames = [];
        docs.forEach(d => {
          if (d.exists && Array.isArray(d.data().frames)) {
            allFrames.push(...d.data().frames);
          }
        });
        return { type: 'sequence', frames: allFrames };
      }

      // Case 2: Base64 file chunks ({ data: "..." })
      let combinedBase64 = '';
      docs.forEach(d => {
        if (d.exists && d.data().data) {
          combinedBase64 += d.data().data;
        }
      });
      if (!combinedBase64) return null;

      const byteChars = atob(combinedBase64);
      const byteNums = new Uint8Array(byteChars.length);
      for (let i = 0; i < byteChars.length; i++) {
        byteNums[i] = byteChars.charCodeAt(i);
      }
      const blob = new Blob([byteNums], { type: mimeType || 'application/octet-stream' });
      return { type: 'blobUrl', url: URL.createObjectURL(blob) };
    }

    async function applyDeviceConfig(mobile) {
      const devKey = mobile ? 'mobile' : 'pc';
      const state = customCache[devKey];
      const activeRoot = heroBackgroundConfig || window.__heroBackgroundConfig;
      const cfg = activeRoot && activeRoot[devKey];

      if (defaultBootTimer) {
        clearTimeout(defaultBootTimer);
        defaultBootTimer = null;
      }

      if (!activeRoot) {
        // Check cached custom frame 0 so repeat opens draw the exact custom photo at 0ms without flashing old defaults!
        try {
          const cachedRaw = localStorage.getItem(`ameer_cached_bg_frame0_${devKey}`);
          const cachedCfgRaw = localStorage.getItem('ameer_cached_hero_bg_cfg');
          const cachedCfg = cachedCfgRaw ? JSON.parse(cachedCfgRaw) : null;
          const devCachedCfg = cachedCfg && cachedCfg[devKey];
          if (!window.location.search.includes('preview=') && cachedRaw && devCachedCfg && devCachedCfg.mode && devCachedCfg.mode !== 'default') {
            const parsed = JSON.parse(cachedRaw);
            if (parsed && parsed.frame0) {
              state.mode = 'sequence';
              state.config = devCachedCfg;
              state.frames = [parsed.frame0];
              state.totalFrames = 1;
              state.images = [null];
              state.loaded = new Set();
              setLayerVisibility('sequence', devCachedCfg);
              loadCustomFrame(0, devKey, function () { renderBgCurrent(true); });
              return;
            }
          }
        } catch (e) {}

        // Otherwise hold clean black canvas silently until Cloud Firestore resolves (never flash old default frames!)
        state.mode = 'pending';
        state.config = {};
        setLayerVisibility('sequence', {});
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        const pendingGen = defaultQueueGen;
        defaultBootTimer = setTimeout(() => {
          if (pendingGen === defaultQueueGen && !(heroBackgroundConfig || window.__heroBackgroundConfig)) {
            state.mode = 'default';
            loadDefaultFrame(0, mobile, function () {
              renderBgCurrent(true);
              startDefaultQueue(mobile);
            });
          }
        }, 3500);
        return;
      }

      if (!cfg || !cfg.mode || cfg.mode === 'default') {
        try { localStorage.removeItem(`ameer_cached_bg_frame0_${devKey}`); } catch (e) {}
        state.mode = 'default';
        state.config = cfg || {};
        setLayerVisibility('sequence', state.config);
        loadDefaultFrame(0, mobile, function () {
          renderBgCurrent(true);
          startDefaultQueue(mobile);
        });
        return;
      }

      // Cancel any background default frame queue immediately for custom media
      defaultQueueGen++;
      const cfgKey = JSON.stringify({ m: cfg.mode, u: cfg.url, p: cfg.chunkPrefix, c: cfg.chunkCount, vp: cfg.videoPlayback, f: cfg.frames ? cfg.frames.length : 0 });
      state.config = cfg;

      if (cfg.mode === 'image') {
        setLayerVisibility('image', cfg);
        let srcUrl = cfg.url ? resolveUrl(cfg.url) : '';
        if (!srcUrl && cfg.chunkPrefix && state.key !== cfgKey) {
          const loaded = await loadFirestoreChunkedAsset(cfg.chunkPrefix, cfg.chunkCount || 1, cfg.mimeType || 'image/webp');
          if (loaded && loaded.url) {
            if (state.objectUrl) try { URL.revokeObjectURL(state.objectUrl); } catch (e) {}
            state.objectUrl = loaded.url;
            srcUrl = loaded.url;
          }
        } else if (state.objectUrl && state.key === cfgKey) {
          srcUrl = state.objectUrl;
        }
        state.mode = 'image';
        state.key = cfgKey;
        if (staticImgEl && srcUrl) {
          staticImgEl.src = srcUrl;
        }
        return;
      }

      if (cfg.mode === 'video') {
        const playback = cfg.videoPlayback === 'scroll' ? 'video-scroll' : 'video-loop';
        setLayerVisibility(playback, cfg);
        let vidUrl = cfg.url ? resolveUrl(cfg.url) : '';
        if (!vidUrl && cfg.chunkPrefix && state.key !== cfgKey) {
          const loaded = await loadFirestoreChunkedAsset(cfg.chunkPrefix, cfg.chunkCount || 1, cfg.mimeType || 'video/mp4');
          if (loaded && loaded.url) {
            if (state.objectUrl) try { URL.revokeObjectURL(state.objectUrl); } catch (e) {}
            state.objectUrl = loaded.url;
            vidUrl = loaded.url;
          }
        } else if (state.objectUrl && state.key === cfgKey) {
          vidUrl = state.objectUrl;
        }
        state.mode = 'video';
        state.key = cfgKey;
        if (videoEl && vidUrl) {
          videoEl.muted = true;
          videoEl.playsInline = true;
          videoEl.setAttribute('muted', '');
          videoEl.setAttribute('playsinline', '');
          if (videoEl.getAttribute('src') !== vidUrl) {
            videoEl.pause();
            videoEl.src = vidUrl;
            videoEl.load();
          }
          if (playback === 'video-loop') {
            videoEl.loop = true;
            const p = videoEl.play();
            if (p && typeof p.catch === 'function') {
              p.catch(() => {
                const kick = () => {
                  videoEl.play().catch(() => {});
                  window.removeEventListener('touchstart', kick);
                  window.removeEventListener('pointerdown', kick);
                };
                window.addEventListener('touchstart', kick, { once: true, passive: true });
                window.addEventListener('pointerdown', kick, { once: true, passive: true });
              });
            }
          } else {
            videoEl.loop = false;
            videoEl.pause();
            videoEl.onloadeddata = () => renderBgCurrent(true);
            videoEl.onseeked = () => renderBgCurrent(true);
          }
        }
        return;
      }

      if (cfg.mode === 'sequence') {
        setLayerVisibility('sequence', cfg);
        if (state.key !== cfgKey) {
          state.mode = 'loading';
          state.frames = [];
          state.images = [];
          state.loaded = new Set();
          lastDrawnImg = null;
          lastDrawnIdx = -1;

          const directFrames = Array.isArray(cfg.frames) ? cfg.frames.map(resolveUrl) : [];
          if (directFrames.length > 0) {
            state.mode = 'sequence';
            state.frames = directFrames;
            state.totalFrames = directFrames.length;
            state.images = new Array(directFrames.length);
            state.loaded = new Set();
            state.key = cfgKey;
            loadCustomFrame(0, devKey, function () {
              renderBgCurrent(true);
              startCustomQueue(devKey);
            });
          } else if (cfg.chunkPrefix) {
            const db = typeof window.initFirebase === 'function' ? window.initFirebase() : null;
            const totalChunks = cfg.chunkCount || 1;
            const prefix = cfg.chunkPrefix;
            if (!db) return;

            async function fetchDocRetry(idx, retries = 2) {
              for (let a = 0; a <= retries; a++) {
                try {
                  return await db.collection('content').doc(`${prefix}_${idx}`).get();
                } catch (err) {
                  if (a === retries) throw err;
                  await new Promise(r => setTimeout(r, 300 * (a + 1)));
                }
              }
            }

            try {
              const doc0 = await fetchDocRetry(0);
              const d0 = doc0 && doc0.exists ? doc0.data() : null;
              if (!d0 || !Array.isArray(d0.frames) || d0.frames.length === 0) {
                throw new Error('Chunk 0 missing frames');
              }

              const expectedTotal = d0.totalSequenceFrames || cfg.totalFrames || d0.frames.length;
              state.mode = 'sequence';
              state.frames = new Array(expectedTotal);
              state.totalFrames = expectedTotal;
              state.images = new Array(expectedTotal);
              state.loaded = new Set();
              state.key = cfgKey;

              d0.frames.forEach((f, idx) => { state.frames[idx] = f; });
              try {
                if (d0.frames[0] && d0.frames[0].length < 250000) {
                  localStorage.setItem(`ameer_cached_bg_frame0_${devKey}`, JSON.stringify({ key: cfgKey, frame0: d0.frames[0] }));
                }
              } catch (e) {}
              loadCustomFrame(0, devKey, function () {
                renderBgCurrent(true);
                for (let k = 1; k < d0.frames.length; k++) loadCustomFrame(k, devKey);
              });

              if (totalChunks > 1) {
                let cursorChunk = 1;
                let sequentialOffset = d0.frames.length;
                const chunkDocs = new Array(totalChunks);
                chunkDocs[0] = doc0;

                async function streamWorker() {
                  while (cursorChunk < totalChunks) {
                    const c = cursorChunk++;
                    if (state.key !== cfgKey) return;
                    const snap = await fetchDocRetry(c);
                    chunkDocs[c] = snap;
                    if (snap && snap.exists && Array.isArray(snap.data().frames) && state.key === cfgKey) {
                      const data = snap.data();
                      const startIdx = typeof data.startFrameIndex === 'number' ? data.startFrameIndex : null;
                      if (startIdx !== null) {
                        data.frames.forEach((f, idx) => { state.frames[startIdx + idx] = f; });
                        for (let k = 0; k < data.frames.length; k += 2) {
                          loadCustomFrame(startIdx + k, devKey);
                        }
                      }
                    }
                  }
                }
                const workers = Array.from({ length: Math.min(6, totalChunks - 1) }, () => streamWorker());
                await Promise.all(workers);

                if (state.key === cfgKey) {
                  // Finalize sequential fallback chunks (if old chunk format without startFrameIndex)
                  let pos = sequentialOffset;
                  for (let c = 1; c < totalChunks; c++) {
                    const snap = chunkDocs[c];
                    if (snap && snap.exists && Array.isArray(snap.data().frames)) {
                      const data = snap.data();
                      if (typeof data.startFrameIndex !== 'number') {
                        data.frames.forEach((f, idx) => { state.frames[pos + idx] = f; });
                        pos += data.frames.length;
                      }
                    }
                  }
                  const validLen = state.frames.filter(Boolean).length;
                  if (validLen > 0 && validLen !== state.totalFrames && state.frames.some(x => !x)) {
                    state.frames = state.frames.filter(Boolean);
                    state.totalFrames = state.frames.length;
                  }
                  startCustomQueue(devKey);
                }
              }
            } catch (seqErr) {
              console.warn('Sequence load fallback:', seqErr);
              state.mode = 'default';
              loadDefaultFrame(0, mobile, function () {
                renderBgCurrent(true);
                startDefaultQueue(mobile);
              });
            }
          } else {
            state.mode = 'default';
            loadDefaultFrame(0, mobile, function () {
              renderBgCurrent(true);
              startDefaultQueue(mobile);
            });
          }
        } else {
          state.mode = 'sequence';
          renderBgCurrent(true);
        }
      }
    }

    function resizeBgCanvas() {
      const dpr = Math.min(window.devicePixelRatio || 1, 3);
      canvas.width = Math.round(window.innerWidth * dpr);
      canvas.height = Math.round(window.innerHeight * dpr);
      const currentMobile = isMobileMode();
      if (lastIsMobile !== currentMobile) {
        lastIsMobile = currentMobile;
        applyDeviceConfig(currentMobile);
      } else {
        renderBgCurrent(true);
      }
    }

    window.addEventListener('resize', resizeBgCanvas, { passive: true });
    window.addEventListener('heroBackgroundUpdated', function (e) {
      heroBackgroundConfig = e.detail || null;
      applyDeviceConfig(isMobileMode());
    });

    function bgAnimationLoop() {
      updateScrollDimming();

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

        if (activeRenderMode === 'video-scroll' && videoEl && videoEl.duration && !videoEl.seeking) {
          const targetTime = Math.max(0, Math.min(videoEl.duration - 0.02, currentProgress * videoEl.duration));
          if (Math.abs(videoEl.currentTime - targetTime) > 0.025) {
            videoEl.currentTime = targetTime;
          }
        } else {
          renderBgCurrent(false);
        }
      }

      requestAnimationFrame(bgAnimationLoop);
    }

    // Default sequence loader
    function loadDefaultFrame(idx, mobile, onDone) {
      const devState = customCache[mobile ? 'mobile' : 'pc'];
      if (devState && devState.mode !== 'default') return;
      const loaded = mobile ? loadedDefaultMobile : loadedDefaultDesktop;
      const images = mobile ? defaultMobileImages : defaultDesktopImages;

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
      img.onerror = function () { if (onDone) onDone(); };
      img.src = getDefaultFrameUrl(idx, mobile);
    }

    function startDefaultQueue(mobile) {
      const gen = defaultQueueGen;
      const queue = [];
      for (let i = 6; i < DEFAULT_FRAMES; i += 6) queue.push(i);
      if (!queue.includes(DEFAULT_FRAMES - 1)) queue.push(DEFAULT_FRAMES - 1);
      for (let i = 1; i < DEFAULT_FRAMES; i++) {
        if (i % 6 !== 0 && i !== DEFAULT_FRAMES - 1) queue.push(i);
      }
      let cursor = 0;
      const WORKERS = 10;
      function nextWorker() {
        if (gen !== defaultQueueGen) return;
        const devState = customCache[mobile ? 'mobile' : 'pc'];
        if (devState && devState.mode !== 'default') return;
        if (cursor >= queue.length) return;
        loadDefaultFrame(queue[cursor++], mobile, nextWorker);
      }
      for (let w = 0; w < WORKERS; w++) nextWorker();
    }

    // Custom uploaded sequence loader
    function loadCustomFrame(idx, devKey, onDone) {
      const state = customCache[devKey];
      if (!state || state.loaded.has(idx) || !state.frames[idx]) {
        if (onDone) onDone();
        return;
      }
      const img = new Image();
      function onReady() {
        state.images[idx] = img;
        state.loaded.add(idx);
        const curKey = isMobileMode() ? 'mobile' : 'pc';
        if (Math.abs(idx - lastDrawnIdx) <= 8 && curKey === devKey) {
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
      img.onerror = function () { if (onDone) onDone(); };
      img.src = state.frames[idx];
    }

    function startCustomQueue(devKey) {
      const state = customCache[devKey];
      const total = state.totalFrames;
      if (!total) return;
      const queue = [];
      for (let i = 4; i < total; i += 4) queue.push(i);
      if (!queue.includes(total - 1)) queue.push(total - 1);
      for (let i = 1; i < total; i++) {
        if (i % 4 !== 0 && i !== total - 1) queue.push(i);
      }
      let cursor = 0;
      const WORKERS = 10;
      function nextWorker() {
        if (cursor >= queue.length) return;
        loadCustomFrame(queue[cursor++], devKey, nextWorker);
      }
      for (let w = 0; w < WORKERS; w++) nextWorker();
    }

    resizeBgCanvas();
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
