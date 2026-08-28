
    // --- STATE ---
    let projectsData = [];
    let siteContent = {
      profile: { url: '', zoom: 100, x: 50, y: 50 },
      text: {}
    };
    
    const DB_KEY_PROJ = 'ameer_portfolio_projects';
    const DB_KEY_CONT = 'ameer_portfolio_content';
    const GH_CONF_KEY = 'ameer_github_config';
    const AUTH_KEY = 'ameer_admin_password';
    const DEFAULT_PASS = 'ameer2026';

    // --- 1. AUTHENTICATION & SECURITY ---
    const STORAGE_PASS = 'ameer_admin_password';
    const getMasterPassword = () => localStorage.getItem(STORAGE_PASS) || 'ameer2026';

    function initAuth() {
      if (sessionStorage.getItem('ameer_admin_auth') === 'true') {
        document.getElementById('authScreen').classList.remove('active');
        bootstrapData();
      }
      document.getElementById('btnUnlock').addEventListener('click', attemptUnlock);
      document.getElementById('loginPassInput').addEventListener('keydown', (e) => {
        if (e.key === 'Enter') { e.preventDefault(); attemptUnlock(); }
      });
    }

    function attemptUnlock() {
      const input = document.getElementById('loginPassInput');
      const err = document.getElementById('loginError');
      const val = (input.value || '').trim();
      const normalized = val.replace(/\s+/g, '').toLowerCase();

      if (normalized === 'ameer2026' || val === 'ameer 2026' || val === getMasterPassword()) {
        sessionStorage.setItem('ameer_admin_auth', 'true');
        document.getElementById('authScreen').classList.remove('active');
        err.style.display = 'none';
        bootstrapData();
      } else {
        err.style.display = 'block';
        input.value = '';
        input.focus();
      }
    }

    function updateMasterPassword() {
      const cur = document.getElementById('passCurrent').value.trim();
      const nxt = document.getElementById('passNew').value.trim();
      const conf = document.getElementById('passConfirm').value.trim();

      if (cur !== getMasterPassword() && cur !== 'ameer2026') {
        return alert('Current password is incorrect.');
      }
      if (nxt !== conf) {
        return alert('New passwords do not match.');
      }
      if (nxt.length < 4) {
        return alert('New password must be at least 4 characters.');
      }

      localStorage.setItem(STORAGE_PASS, nxt);
      alert('Master password updated successfully!');
      document.getElementById('passCurrent').value = '';
      document.getElementById('passNew').value = '';
      document.getElementById('passConfirm').value = '';
    }

    function resetPasswordToDefault() {
      if (confirm('Reset password to default ("ameer2026")?')) {
        localStorage.removeItem(STORAGE_PASS);
        alert('Password reset to: ameer2026');
      }
    }

    function lockWorkspace() {
      sessionStorage.removeItem('ameer_admin_auth');
      document.getElementById('authScreen').classList.add('active');
      document.getElementById('loginPassInput').value = '';
    }

    function resolveAssetUrl(url) {
      if (!url) return '';
      if (url.startsWith('assets/uploads/')) {
        try {
          const conf = JSON.parse(localStorage.getItem(GH_CONF_KEY) || '{}');
          if (conf.owner && conf.repo) {
            return `https://raw.githubusercontent.com/${conf.owner}/${conf.repo}/${conf.branch || 'main'}/${url}`;
          }
        } catch (e) {}
      }
      return url;
    }

    function updateCoverTunerPreview() {
      const url = document.getElementById('inpCover').value.trim();
      const zoom = parseInt(document.getElementById('inpCoverZoom').value, 10) || 100;
      const x = parseInt(document.getElementById('inpCoverX').value, 10) || 50;
      const y = parseInt(document.getElementById('inpCoverY').value, 10) || 50;

      document.getElementById('coverZoomVal').textContent = zoom;
      document.getElementById('coverXVal').textContent = x;
      document.getElementById('coverYVal').textContent = y;

      const img = document.getElementById('coverPreviewImage');
      const container = document.getElementById('coverPreviewContainer');

      if (url) {
        img.src = resolveAssetUrl(url);
        const scale = zoom / 100;
        const offsetX = (x - 50) * 1.0;
        const offsetY = (y - 50) * 1.0;
        img.style.objectFit = 'cover';
        img.style.transformOrigin = 'center center';
        img.style.objectPosition = 'center';
        img.style.transform = `translate(${offsetX}%, ${offsetY}%) scale(${scale})`;
        container.style.display = 'block';
      } else {
        img.src = '';
        container.style.display = 'none';
      }
    }

    function toggleModalFields() {
      const type = document.getElementById('inpType').value;
      const groupPdf = document.getElementById('groupPdf');
      const groupGallery = document.getElementById('groupGallery');
      
      if (type === 'pdf') {
        groupPdf.style.display = 'block';
        groupGallery.style.display = 'none';
      } else {
        groupPdf.style.display = 'none';
        groupGallery.style.display = 'block';
      }
    }

    async function handleProjectFileUpload(inputEl, targetInputId, progressElId) {
      const file = inputEl.files[0];
      if (!file) return;

      const progressEl = document.getElementById(progressElId);
      const btnSave = document.getElementById('btnSaveProject');
      progressEl.textContent = "Uploading to GitHub...";
      progressEl.style.color = "var(--gold)";
      btnSave.disabled = true;
      btnSave.style.opacity = "0.5";

      const conf = JSON.parse(localStorage.getItem(GH_CONF_KEY) || '{}');
      if (!conf.token || !conf.owner || !conf.repo) {
        alert("Please configure your GitHub API settings under the 'Settings & Security' tab first so files can be uploaded to your repository.");
        progressEl.textContent = "Upload failed (Config missing)";
        progressEl.style.color = "var(--danger)";
        btnSave.disabled = false;
        btnSave.style.opacity = "1";
        return;
      }

      const maxSizeBytes = 25 * 1024 * 1024; // 25MB
      if (file.size > maxSizeBytes) {
        alert(`File is too large. Keep uploads under 25MB.`);
        progressEl.textContent = "File too large";
        progressEl.style.color = "var(--danger)";
        btnSave.disabled = false;
        btnSave.style.opacity = "1";
        return;
      }

      try {
        const cleanName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
        const filename = `${Date.now()}-${cleanName}`;
        const path = `assets/uploads/${filename}`;
        const apiUrl = `https://api.github.com/repos/${conf.owner}/${conf.repo}/contents/${path}`;

        const reader = new FileReader();
        const base64Promise = new Promise((resolve, reject) => {
          reader.onload = () => resolve(reader.result.split(',')[1]);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
        const base64Content = await base64Promise;

        const bodyPayload = {
          message: `Upload project asset: ${filename}`,
          content: base64Content,
          branch: conf.branch || 'main'
        };

        const res = await fetch(apiUrl, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${conf.token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(bodyPayload)
        });

        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.message || "GitHub API returned error");
        }

        document.getElementById(targetInputId).value = path;
        progressEl.textContent = "✓ Uploaded!";
        progressEl.style.color = "var(--success)";
        if (targetInputId === 'inpCover') {
          updateCoverTunerPreview();
        }
      } catch (err) {
        alert("Failed to upload: " + err.message);
        progressEl.textContent = "Upload failed";
        progressEl.style.color = "var(--danger)";
      } finally {
        btnSave.disabled = false;
        btnSave.style.opacity = "1";
      }
    }

    async function handleProjectGalleryUpload(inputEl, targetTextareaId, progressElId) {
      const files = inputEl.files;
      if (!files || files.length === 0) return;

      const progressEl = document.getElementById(progressElId);
      const btnSave = document.getElementById('btnSaveProject');
      const conf = JSON.parse(localStorage.getItem(GH_CONF_KEY) || '{}');
      if (!conf.token || !conf.owner || !conf.repo) {
        alert("Please configure your GitHub API settings under the 'Settings & Security' tab first so files can be uploaded to your repository.");
        return;
      }

      progressEl.style.color = "var(--gold)";
      btnSave.disabled = true;
      btnSave.style.opacity = "0.5";
      const textarea = document.getElementById(targetTextareaId);

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        progressEl.textContent = `Uploading file ${i + 1} of ${files.length}...`;

        try {
          const cleanName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
          const filename = `${Date.now()}-${cleanName}`;
          const path = `assets/uploads/${filename}`;
          const apiUrl = `https://api.github.com/repos/${conf.owner}/${conf.repo}/contents/${path}`;

          const reader = new FileReader();
          const base64Promise = new Promise((resolve, reject) => {
            reader.onload = () => resolve(reader.result.split(',')[1]);
            reader.onerror = reject;
            reader.readAsDataURL(file);
          });
          const base64Content = await base64Promise;

          const bodyPayload = {
            message: `Upload project gallery asset: ${filename}`,
            content: base64Content,
            branch: conf.branch || 'main'
          };

          const res = await fetch(apiUrl, {
            method: 'PUT',
            headers: {
              'Authorization': `Bearer ${conf.token}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(bodyPayload)
          });

          if (!res.ok) {
            const err = await res.json();
            throw new Error(err.message || "GitHub API returned error");
          }

          const curVal = textarea.value.trim();
          textarea.value = curVal ? `${curVal}\n${path}` : path;
        } catch (err) {
          alert(`Failed to upload ${file.name}: ${err.message}`);
        }
      }

      progressEl.textContent = `✓ Uploaded ${files.length} photos!`;
      progressEl.style.color = "var(--success)";
      btnSave.disabled = false;
      btnSave.style.opacity = "1";
    }

    // --- 2. BOOTSTRAP DATA ---
    async function bootstrapData() {
      // 1. Load local draft data from localStorage first
      try {
        const localProj = JSON.parse(localStorage.getItem(DB_KEY_PROJ));
        if (localProj && Array.isArray(localProj) && localProj.length > 0) {
          projectsData = localProj;
        }
      } catch (e) {}

      try {
        const localCont = JSON.parse(localStorage.getItem(DB_KEY_CONT) || localStorage.getItem('ameer_portfolio_site_content'));
        if (localCont && (localCont.about || localCont.profile)) {
          siteContent = localCont;
        }
      } catch (e) {}

      // 2. Only if local storage is completely empty, fetch initial data from server
      if (!projectsData || projectsData.length === 0) {
        try {
          const projRes = await fetch(`data/projects.json?t=${Date.now()}`, { cache: 'no-store' });
          if (projRes.ok) {
            const remoteProj = await projRes.json();
            if (remoteProj && Array.isArray(remoteProj)) {
              projectsData = remoteProj;
              localStorage.setItem(DB_KEY_PROJ, JSON.stringify(projectsData));
            }
          }
        } catch (err) {
          console.warn("Could not load projects from server", err);
        }
      }

      if (!siteContent || (!siteContent.about && !siteContent.profile)) {
        try {
          const contRes = await fetch(`data/siteContent.json?t=${Date.now()}`, { cache: 'no-store' });
          if (contRes.ok) {
            const remoteCont = await contRes.json();
            if (remoteCont) {
              siteContent = remoteCont;
              localStorage.setItem(DB_KEY_CONT, JSON.stringify(siteContent));
              localStorage.setItem('ameer_portfolio_site_content', JSON.stringify(siteContent));
            }
          }
        } catch (err) {
          console.warn("Could not load content from server", err);
        }
      }

      // Enforce structure
      if (!siteContent) siteContent = {};
      if (!siteContent.profile) siteContent.profile = { url: '', zoom: 100, x: 50, y: 50 };
      if (!siteContent.about) siteContent.about = {};

      loadGitHubConfig();
      renderProjectsGrid();
      populateTuner();
      populateContentForm();
    }

    async function forceSyncFromGitHub() {
      if (!confirm("Overwrite local cache and force download live data from the server?")) return;
      
      const btn = document.querySelector('[onclick="forceSyncFromGitHub()"]');
      const originalText = btn.innerHTML;
      btn.innerHTML = 'Syncing...';
      btn.disabled = true;

      try {
        const projRes = await fetch(`data/projects.json?t=${Date.now()}`, { cache: 'no-store' });
        if (projRes.ok) {
          projectsData = await projRes.json();
          localStorage.setItem(DB_KEY_PROJ, JSON.stringify(projectsData));
        } else {
          throw new Error("Failed to load projects.json");
        }

        const contRes = await fetch(`data/siteContent.json?t=${Date.now()}`, { cache: 'no-store' });
        if (contRes.ok) {
          siteContent = await contRes.json();
          localStorage.setItem(DB_KEY_CONT, JSON.stringify(siteContent));
        } else {
          throw new Error("Failed to load siteContent.json");
        }

        renderProjectsGrid();
        populateTuner();
        populateContentForm();
        alert("✓ Auto-sync complete! All columns successfully updated with live data.");
      } catch (err) {
        alert("Sync failed: " + err.message);
      } finally {
        btn.innerHTML = originalText;
        btn.disabled = false;
      }
    }

    // --- 3. PROJECT MANAGER ---
    function renderProjectsGrid() {
      const container = document.getElementById('projectsContainer');
      if (!container) return;

      if (projectsData.length === 0) {
        container.innerHTML = `
          <div style="grid-column: 1/-1; text-align: center; padding: 4rem 1rem; background: var(--card-bg); border: 1px dashed var(--border); border-radius: 12px;">
            <h3 style="color: #fff; margin-bottom: 0.5rem;">No Projects Found</h3>
            <p style="color: var(--muted); margin-bottom: 1.5rem;">Your portfolio is currently empty.</p>
            <button type="button" class="btn btn-gold" onclick="openProjectModal()">+ Add Your First Project</button>
          </div>
        `;
        return;
      }

      container.innerHTML = projectsData.map((proj, idx) => {
        const cover = proj.coverImage || 'https://placehold.co/600x375/141414/d4af37?text=No+Cover';
        const isPdf = proj.type === 'pdf' || proj.pdfUrl;
        const badge = isPdf ? 'PDF Deck' : 'Slides';
        
        const scale = (proj.coverZoom || 100) / 100;
        const x = proj.coverX !== undefined ? proj.coverX : 50;
        const y = proj.coverY !== undefined ? proj.coverY : 50;
        const offsetX = (x - 50) * 1.0;
        const offsetY = (y - 50) * 1.0;
        
        return `
          <div class="project-card">
            <div class="card-thumb" style="overflow: hidden; position: relative;">
              <img src="${resolveAssetUrl(cover)}" alt="${proj.title || ''}" style="width: 100%; height: 100%; object-fit: cover; object-position: center; transform-origin: center center; transform: translate(${offsetX}%, ${offsetY}%) scale(${scale}); transition: transform 0.2s;" onerror="this.src='https://placehold.co/600x375/141414/d4af37?text=Image+Error'" />
              <div class="card-badge">${badge}</div>
            </div>
            <div class="card-body">
              <div class="card-meta">${proj.client || 'Client'} &bull; ${proj.year || '2026'}</div>
              <div class="card-title">${proj.title || 'Untitled'}</div>
              <p style="color: var(--muted); font-size: 0.8rem; margin-bottom: 0.5rem;">${proj.category || 'Design'}</p>
              <div class="card-actions">
                <button type="button" class="btn btn-secondary" style="flex:1;" onclick="editProject(${idx})">Edit</button>
                <button type="button" class="btn btn-danger" onclick="deleteProject(${idx})">Delete</button>
              </div>
            </div>
          </div>
        `;
      }).join('');
    }

    function openProjectModal(index = -1) {
      document.getElementById('editProjectIndex').value = index;
      document.getElementById('projectForm').reset();

      // Reset progress indicators
      document.getElementById('uploadProgressCover').textContent = '';
      document.getElementById('uploadProgressPdf').textContent = '';
      document.getElementById('uploadProgressGallery').textContent = '';

      if (index >= 0) {
        const p = projectsData[index];
        document.getElementById('modalTitle').textContent = 'Edit Project';
        document.getElementById('inpTitle').value = p.title || '';
        document.getElementById('inpClient').value = p.client || '';
        document.getElementById('inpCategory').value = p.category || '';
        document.getElementById('inpYear').value = p.year || '2026';
        document.getElementById('inpCover').value = p.coverImage || '';
        document.getElementById('inpType').value = p.type || 'slides';
        document.getElementById('inpPdf').value = p.pdfUrl || '';
        document.getElementById('inpGallery').value = (p.images && Array.isArray(p.images)) ? p.images.join('\n') : '';
        
        document.getElementById('inpCoverZoom').value = p.coverZoom || 100;
        document.getElementById('inpCoverX').value = p.coverX || 50;
        document.getElementById('inpCoverY').value = p.coverY || 50;
      } else {
        document.getElementById('modalTitle').textContent = 'Add New Project';
        document.getElementById('inpCoverZoom').value = 100;
        document.getElementById('inpCoverX').value = 50;
        document.getElementById('inpCoverY').value = 50;
      }
      toggleModalFields();
      updateCoverTunerPreview();
      document.getElementById('projectModal').classList.add('active');
    }

    function closeProjectModal() {
      document.getElementById('projectModal').classList.remove('active');
    }

    function saveProjectForm() {
      const idx = parseInt(document.getElementById('editProjectIndex').value, 10);
      
      const galleryText = document.getElementById('inpGallery').value.trim();
      const imagesArray = galleryText ? galleryText.split('\n').map(l => l.trim()).filter(l => l !== '') : [];

      const projectObj = {
        title: document.getElementById('inpTitle').value.trim() || 'Untitled Project',
        client: document.getElementById('inpClient').value.trim() || 'Client',
        category: document.getElementById('inpCategory').value.trim() || 'General',
        year: document.getElementById('inpYear').value.trim() || '2026',
        coverImage: document.getElementById('inpCover').value.trim(),
        type: document.getElementById('inpType').value,
        pdfUrl: document.getElementById('inpPdf').value.trim(),
        images: imagesArray,
        coverZoom: parseInt(document.getElementById('inpCoverZoom').value, 10),
        coverX: parseInt(document.getElementById('inpCoverX').value, 10),
        coverY: parseInt(document.getElementById('inpCoverY').value, 10)
      };

      if (idx >= 0) {
        projectsData[idx] = { ...projectsData[idx], ...projectObj };
      } else {
        projectsData.unshift(projectObj);
      }

      localStorage.setItem(DB_KEY_PROJ, JSON.stringify(projectsData));
      renderProjectsGrid();
      closeProjectModal();
    }

    function editProject(idx) { openProjectModal(idx); }
    function deleteProject(idx) {
      if (confirm('Delete this project permanently?')) {
        projectsData.splice(idx, 1);
        localStorage.setItem(DB_KEY_PROJ, JSON.stringify(projectsData));
        renderProjectsGrid();
      }
    }

    // --- 4. HERO PROFILE TUNER ---
    function populateTuner() {
      const ab = siteContent.about || {};
      const pos = ab.heroPhotoPosition || { scale: 1, posX: 50, posY: 50 };
      document.getElementById('tunerUrl').value = ab.heroPortrait || '';
      document.getElementById('tunerZoom').value = Math.round(pos.scale * 100);
      document.getElementById('tunerX').value = pos.posX;
      document.getElementById('tunerY').value = pos.posY;
      updateTunerPreview();
    }

    function updateTunerPreview() {
      const url = document.getElementById('tunerUrl').value.trim();
      const zoom = document.getElementById('tunerZoom').value;
      const x = document.getElementById('tunerX').value;
      const y = document.getElementById('tunerY').value;

      document.getElementById('zoomVal').textContent = zoom;
      document.getElementById('xVal').textContent = x;
      document.getElementById('yVal').textContent = y;

      const img = document.getElementById('avatarPreview');
      if (url) {
        img.src = url;
        const offsetX = (x - 50) * 1.5;
        const offsetY = (y - 50) * 1.5;
        img.style.objectFit = 'cover';
        img.style.transformOrigin = 'center center';
        img.style.objectPosition = 'center';
        img.style.transform = `translate(${offsetX}%, ${offsetY}%) scale(${zoom / 100})`;
      } else {
        img.src = '';
      }
    }

    function saveProfileTuner() {
      if (!siteContent.about) siteContent.about = {};
      siteContent.about.heroPortrait = document.getElementById('tunerUrl').value.trim();
      siteContent.about.heroPhotoPosition = {
        scale: parseInt(document.getElementById('tunerZoom').value, 10) / 100,
        posX: parseInt(document.getElementById('tunerX').value, 10),
        posY: parseInt(document.getElementById('tunerY').value, 10)
      };
      localStorage.setItem(DB_KEY_CONT, JSON.stringify(siteContent));
      localStorage.setItem('ameer_portfolio_site_content', JSON.stringify(siteContent));
      alert("Hero profile avatar saved! Click '👀 Preview Site' to preview or 'PUBLISH LIVE' to deploy.");
    }

    function handleTunerUpload(event) {
      const file = event.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = function(e) {
        const img = new Image();
        img.onload = function() {
          const maxDim = 1600;
          let w = img.width;
          let h = img.height;
          if (w > maxDim || h > maxDim) {
            if (w > h) {
              h = Math.round((h * maxDim) / w);
              w = maxDim;
            } else {
              w = Math.round((w * maxDim) / h);
              h = maxDim;
            }
          }
          const canvas = document.createElement('canvas');
          canvas.width = w;
          canvas.height = h;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, w, h);
          
          const isPng = file.type === 'image/png';
          const optimizedDataUrl = isPng ? canvas.toDataURL('image/png') : canvas.toDataURL('image/jpeg', 0.92);
          
          document.getElementById('tunerUrl').value = optimizedDataUrl;
          updateTunerPreview();
        };
        img.onerror = function() {
          alert('Could not read image file. Please try another image format (PNG, JPG, WebP).');
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    }

    // --- 5. GLOBAL TEXT EDITOR ---
    const editablePaths = [
      { path: 'about.brandName', label: 'Brand Name', type: 'text' },
      { path: 'about.brandRole', label: 'Brand Role / Subtitle', type: 'text' },
      { path: 'about.heroHeadline', label: 'Hero Headline (Use <br> for new lines)', type: 'text' },
      { path: 'about.heroLead', label: 'Hero Lead Text', type: 'textarea' },
      { path: 'about.tagline', label: 'Tagline', type: 'text' },
      { path: 'about.locationBadge', label: 'Location Badge', type: 'text' },
      { path: 'about.signatureScript', label: 'Signature Text', type: 'text' },
      { path: 'about.bioP1', label: 'Bio Paragraph 1', type: 'textarea' },
      { path: 'about.bioP2', label: 'Bio Paragraph 2', type: 'textarea' },
      { path: 'about.quote', label: 'Quote', type: 'textarea' },
      { path: 'contact.email', label: 'Contact Email', type: 'text' },
      { path: 'contact.phone', label: 'Contact Phone / CTA', type: 'text' },
      { path: 'contact.website', label: 'Location / Website', type: 'text' },
      { path: 'contact.socials.behance', label: 'Behance URL', type: 'text' },
      { path: 'contact.socials.linkedin', label: 'LinkedIn URL', type: 'text' },
      { path: 'contact.socials.instagram', label: 'Instagram URL', type: 'text' },
      { path: 'contact.copyright', label: 'Footer Copyright', type: 'text' }
    ];

    function getNestedValue(obj, path) {
      return path.split('.').reduce((o, i) => o ? o[i] : '', obj);
    }

    function setNestedValue(obj, path, value) {
      const parts = path.split('.');
      let current = obj;
      for (let i = 0; i < parts.length - 1; i++) {
        if (!current[parts[i]]) current[parts[i]] = {};
        current = current[parts[i]];
      }
      current[parts[parts.length - 1]] = value;
    }

    function populateContentForm() {
      const container = document.getElementById('dynamicContentForm');
      container.innerHTML = '';
      
      editablePaths.forEach((field, i) => {
        const val = getNestedValue(siteContent, field.path);
        
        const wrap = document.createElement('div');
        wrap.className = 'form-group';
        wrap.style.marginBottom = '1rem';
        
        const label = document.createElement('label');
        label.innerText = field.label;
        wrap.appendChild(label);
        
        if (field.type === 'textarea') {
          const input = document.createElement('textarea');
          input.className = 'form-textarea';
          input.id = `dynFld_${i}`;
          input.value = val || '';
          input.style.minHeight = '100px';
          wrap.appendChild(input);
        } else {
          const input = document.createElement('input');
          input.type = 'text';
          input.className = 'form-input';
          input.id = `dynFld_${i}`;
          input.value = val || '';
          wrap.appendChild(input);
        }
        
        container.appendChild(wrap);
      });
    }

    function saveSiteContent() {
      editablePaths.forEach((field, i) => {
        const input = document.getElementById(`dynFld_${i}`);
        if (input) {
          setNestedValue(siteContent, field.path, input.value.trim());
        }
      });
      localStorage.setItem(DB_KEY_CONT, JSON.stringify(siteContent));
      localStorage.setItem('ameer_portfolio_site_content', JSON.stringify(siteContent));
      alert('All global text content saved! Click PUBLISH LIVE to update the website.');
    }

    // --- 6. GITHUB REST API SYNC ---
    function loadGitHubConfig() {
      const conf = JSON.parse(localStorage.getItem(GH_CONF_KEY) || '{}');
      if (conf.token) document.getElementById('ghToken').value = conf.token;
      if (conf.owner) document.getElementById('ghOwner').value = conf.owner;
      if (conf.repo) document.getElementById('ghRepo').value = conf.repo;
      if (conf.branch) document.getElementById('ghBranch').value = conf.branch;
    }

    function saveGitHubConfig() {
      const conf = {
        token: document.getElementById('ghToken').value.trim(),
        owner: document.getElementById('ghOwner').value.trim(),
        repo: document.getElementById('ghRepo').value.trim(),
        branch: document.getElementById('ghBranch').value.trim() || 'main'
      };
      localStorage.setItem(GH_CONF_KEY, JSON.stringify(conf));
      alert("GitHub API Configuration saved locally!");
    }

    function encodeBase64Unicode(str) {
      return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, function(match, p1) {
          return String.fromCharCode('0x' + p1);
      }));
    }

    async function _commitFile(path, contentObj, conf) {
      const apiUrl = `https://api.github.com/repos/${conf.owner}/${conf.repo}/contents/${path}`;
      const base64Content = encodeBase64Unicode(JSON.stringify(contentObj, null, 2));
      let sha = null;
      
      try {
        const branchRes = await fetch(`https://api.github.com/repos/${conf.owner}/${conf.repo}/branches/${conf.branch}`, { headers: { 'Authorization': `Bearer ${conf.token}` } });
        if(branchRes.ok) {
          const bData = await branchRes.json();
          const treeSha = bData.commit.commit.tree.sha;
          const treeRes = await fetch(`https://api.github.com/repos/${conf.owner}/${conf.repo}/git/trees/${treeSha}?recursive=1`, { headers: { 'Authorization': `Bearer ${conf.token}` } });
          if(treeRes.ok) {
            const tData = await treeRes.json();
            const fileNode = tData.tree.find(t => t.path === path);
            if(fileNode) sha = fileNode.sha;
          }
        }
      } catch(e) { console.warn("Could not fetch SHA"); }

      const bodyPayload = { message: "Auto-Publish: Studio OS Admin Update", content: base64Content, branch: conf.branch };
      if (sha) bodyPayload.sha = sha;

      const putRes = await fetch(apiUrl, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${conf.token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyPayload)
      });
      if (!putRes.ok) throw new Error((await putRes.json()).message || `Failed to upload ${path}`);
    }

    async function publishToGitHub() {
      const conf = JSON.parse(localStorage.getItem(GH_CONF_KEY) || '{}');
      if (!conf.token || !conf.owner || !conf.repo) return alert("Configure GitHub settings in Settings tab first.");
      if (!confirm("Are you sure you want to publish these changes directly to your live website?")) return;

      const btn = document.querySelector('.btn-publish');
      const originalText = btn.innerHTML;
      btn.innerHTML = 'PUBLISHING...';
      btn.style.opacity = '0.5';

      try {
        await _commitFile('data/projects.json', projectsData, conf);
        await _commitFile('data/siteContent.json', siteContent, conf);
        alert("Successfully published live! Allow a minute for GitHub Pages/Netlify to deploy.");
      } catch (err) {
        alert("Publish failed: " + err.message);
      } finally {
        btn.innerHTML = originalText;
        btn.style.opacity = '1';
      }
    }

    // --- 7. BACKUP & RESTORE ---
    function exportFullBackup() {
      const backupData = {
        projects: projectsData,
        siteContent: siteContent,
        timestamp: new Date().toISOString()
      };
      const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `studio-backup-${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(a.href);
    }

    function handleRestoreFile(event) {
      const file = event.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target.result);
          
          if (data.projects && Array.isArray(data.projects)) {
            projectsData = data.projects;
            localStorage.setItem(DB_KEY_PROJ, JSON.stringify(projectsData));
          } else if (Array.isArray(data)) {
            projectsData = data;
            localStorage.setItem(DB_KEY_PROJ, JSON.stringify(projectsData));
          }

          if (data.siteContent) {
            siteContent = data.siteContent;
            localStorage.setItem(DB_KEY_CONT, JSON.stringify(siteContent));
          }

          renderProjectsGrid();
          populateContentForm();
          populateTuner();
          alert('Backup successfully restored!');
        } catch (err) {
          alert('Invalid backup JSON file.');
        }
      };
      reader.readAsText(file);
    }

    // --- 8. UTILS ---
    function switchTab(tabId) {
      document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
      document.querySelectorAll('.nav-btn').forEach(el => el.classList.remove('active'));
      document.getElementById(tabId).classList.add('active');
      event.currentTarget.classList.add('active');
    }

    // Startup Init
    document.addEventListener('DOMContentLoaded', initAuth);
  
