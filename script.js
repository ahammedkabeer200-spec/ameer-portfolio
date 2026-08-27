/**
 * AMEER SUHAIL â€” SENIOR GRAPHIC DESIGNER & BRAND STRATEGIST
 * JavaScript Engine: Dynamic Site Content Hydration & Universal Case Study Engine
 */

// Global State
let projectsData = [];
let siteContent = null;
let currentProjectIndex = 0;
let toastTimeout = null;

function resolveAssetUrl(url) {
  if (!url) return '';
  if (url.startsWith('assets/uploads/')) {
    try {
      const conf = JSON.parse(localStorage.getItem('ameer_github_config') || '{}');
      if (conf.owner && conf.repo) {
        return `https://raw.githubusercontent.com/${conf.owner}/${conf.repo}/${conf.branch || 'main'}/${url}`;
      }
    } catch (e) {}
  }
  return url;
}

// Default Site Content for Sections (01 About, 02 Services, 03 Selected Work, 04 Contact)
const defaultSiteContent = {
  about: {
    brandName: "AMEER SUHAIL",
    brandRole: "SENIOR GRAPHIC DESIGNER & BRAND SPECIALIST",
    yearPill: "UAE \u2022 3 YRS EXP",
    heroHeadline: "BRAND & VISUAL<br>COMMUNICATION",
    heroLead: "Senior Graphic Designer with 4 years of experience (3 years in UAE) delivering high-impact visual design, branding, and campaign solutions across government, tourism, and corporate sectors.",
    heroPortrait: "assets/hero-portrait.png",
    signatureScript: "Ameer Suhail",
    signatureSub: "AMEER SUHAIL",
    tagline: "DESIGN THAT RESONATES.<br>CAMPAIGNS THAT DELIVER.",
    locationBadge: "\ud83d\udccd UMM AL QUWAIN, UAE \u2022 AVAILABLE GLOBALLY",
    tocTitle: "TABLE OF<br>CONTENTS",
    tocDesc: "Explore career milestones, government tourism case studies, AI creative workflows, and direct contact details.",
    tocLabels: {
      l1: "ABOUT ME",
      l2: "SERVICES",
      l3: "SELECTED WORK",
      l4: "CONTACT"
    },
    sectionTitle: "01 ABOUT ME & CAREER",
    headline: "DELIVERING STRATEGIC, MARKET-DRIVEN DESIGNS ACROSS UAE & BEYOND",
    bioP1: "Senior Graphic Designer with 4 years of experience delivering high-impact visual design, branding, and campaign solutions across government, tourism, and corporate sectors. Skilled in brand identity, digital and print design, and campaign execution.",
    bioP2: "Proven ability to lead creative projects, collaborate with cross-functional teams, and produce visually compelling, strategic, and market-driven designs that command audience attention and achieve commercial objectives.",
    quote: "A great design is where visual aesthetics meet strategic precision, delivering enduring value across government and commercial realms.",
    metrics: [
      { num: "4+", title: "YEARS TOTAL EXPERIENCE", desc: "Government, tourism, and corporate visual design" },
      { num: "3 YRS", title: "UAE INDUSTRY LEADERSHIP", desc: "Leading creative campaigns at UAQ Next & Tourism" },
      { num: "100%", title: "AI-POWERED ACCELERATION", desc: "Rapid prototyping with Midjourney, Firefly & ChatGPT" },
      { num: "5 YRS", title: "ADOBE CC MASTERY", desc: "Photoshop, Illustrator, After Effects & InDesign" }
    ]
  },
  services: {
    title: "CORE DISCIPLINES & EXPERTISE",
    items: [
      {
        title: "BRAND IDENTITY & ARCHITECTURE",
        sub: "Logo architecture, corporate identity systems, typography & brand guidelines"
      },
      {
        title: "GOVERNMENT & TOURISM CAMPAIGNS",
        sub: "Strategic visual communication, city tourism branding & promotional initiatives"
      },
      {
        title: "DIGITAL PROMOTIONS & ADVERTISING",
        sub: "Multi-channel social campaigns, marketing collateral & visual communication"
      },
      {
        title: "MOTION GRAPHICS & VIDEO CREATIVE",
        sub: "After Effects animation, Premiere video editing & AI-driven motion storytelling"
      },
      {
        title: "PRINT, PACKAGING & OFFSET PRODUCTION",
        sub: "Structural dielines, Swiss grid publications, luxury packaging & large-format signage"
      }
    ]
  },
  selectedWork: {
    title: "SELECTED PROJECTS",
    viewAllText: "VIEW ALL PROJECTS \u2192"
  },
  contact: {
    ctaHeading: "LET'S CREATE<br>SOMETHING AMAZING",
    email: "ameersuhail4729@gmail.com",
    phone: "Direct WhatsApp Chat",
    website: "Umm Al Quwain, UAE",
    location: "Umm Al Quwain, UAE",
    socials: {
      whatsapp: "https://wa.me/971561480139",
      email: "mailto:ameersuhail4729@gmail.com",
      linkedin: "https://www.linkedin.com/in/ameersuhail2/"
    },
    copyright: " 2026 AMEER SUHAIL. ALL RIGHTS RESERVED."
  }
};



// Initialize on DOM Ready
document.addEventListener('DOMContentLoaded', async () => {
  initCursorGlow();
  initScrollReveal();
  await loadAndApplySiteContent();
  await loadProjectsData();
  renderProjectsGrid();
  handleUrlRouting();

  window.addEventListener('hashchange', handleUrlRouting);
  window.addEventListener('popstate', handleUrlRouting);

  // Keyboard navigation
  document.addEventListener('keydown', (e) => {
    const csModal = document.getElementById('caseStudyModal');
    const allModal = document.getElementById('allProjectsModal');
    if (csModal && csModal.classList.contains('active')) {
      if (e.key === 'Escape') closeCaseStudy();
      if (e.key === 'ArrowRight') navigateCaseStudy(1);
      if (e.key === 'ArrowLeft') navigateCaseStudy(-1);
    } else if (allModal && allModal.classList.contains('active')) {
      if (e.key === 'Escape') closeAllProjectsModal();
    }
  });
});

/**
 * Dynamic Experience Calculator:
 * Automatically computes total career experience, UAE tenure, and company working status
 * based on authentic start dates so the counts advance automatically as time passes!
 */
function calculateCareerMilestones() {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth(); // 0-indexed (0 = Jan, 7 = Aug)

  // 1. Total Professional Experience (Started career in June 2022)
  const careerStartYear = 2022;
  const careerStartMonth = 5; // June
  let totalYears = currentYear - careerStartYear;
  if (currentMonth < careerStartMonth) totalYears--;
  totalYears = Math.max(4, totalYears);

  // 2. UAE & Current Company Experience (UAQ Next â€” Started in August 2023)
  const uaeStartYear = 2023;
  const uaeStartMonth = 7; // August
  let uaeYears = currentYear - uaeStartYear;
  if (currentMonth < uaeStartMonth) uaeYears--;
  uaeYears = Math.max(3, uaeYears);

  // 3. Adobe CC Software Mastery (Started 2021)
  const adobeYears = Math.max(5, currentYear - 2021);
  const aeYears = Math.max(3, currentYear - 2023);
  const idYears = Math.max(2, currentYear - 2024);
  const prYears = Math.max(1, currentYear - 2025);

  return {
    totalYears,
    totalYearsText: `${totalYears}+`,
    uaeYears,
    uaeYearsText: `${uaeYears} YRS`,
    uaePillText: `UAE \u2022 ${uaeYears} YRS EXP`,
    uaqPeriodText: `2023 - PRESENT (${uaeYears} YRS)`,
    adobeYears,
    aeYears,
    idYears,
    prYears
  };
}

// Load & Apply Custom Page Content (01 About, 02 Services, 03 Selected Work, 04 Contact)
async function loadAndApplySiteContent() {
  const isPreview = window.location.search.includes('preview=');
  let loaded = false;
  if (isPreview) {
    const local = localStorage.getItem('ameer_portfolio_site_content');
    if (local) {
      try { siteContent = JSON.parse(local); loaded = true; } catch (e) {}
    }
  }

  if (!loaded) {
    try {
      const res = await fetch('data/siteContent.json?v=' + Date.now(), { cache: 'no-store' });
      if (res.ok) {
        siteContent = await res.json();
        loaded = true;
      }
    } catch(e) {}
  }
  
  if (!siteContent) siteContent = defaultSiteContent;

  const milestones = calculateCareerMilestones();

  // 01 About Section & Hero
  const ab = siteContent.about || defaultSiteContent.about;
  setElementText('siteBrandName', ab.brandName);
  setElementText('siteBrandRole', ab.brandRole);
  
  setElementHtml('heroHeadlineText', ab.heroHeadline);
  setElementText('heroLeadText', ab.heroLead);

  // Dynamic Hero Portrait Image
  const heroImg = document.getElementById('heroPortraitImg');
  if (heroImg) {
    if (ab.heroPortrait && ab.heroPortrait.trim() !== '') {
      heroImg.src = ab.heroPortrait;
      heroImg.style.display = 'block';
      
      if (ab.heroPhotoPosition) {
        const offsetX = (ab.heroPhotoPosition.posX - 50) * 1.5;
        const offsetY = (ab.heroPhotoPosition.posY - 50) * 1.5;
        heroImg.style.objectFit = 'cover';
        heroImg.style.transformOrigin = 'center center';
        heroImg.style.objectPosition = 'center';
        heroImg.style.transform = `translate(${offsetX}%, ${offsetY}%) scale(${ab.heroPhotoPosition.scale})`;
      } else {
        heroImg.style.objectFit = 'contain';
        heroImg.style.transformOrigin = 'bottom center';
        heroImg.style.objectPosition = 'bottom center';
        heroImg.style.transform = 'scale(1)';
      }
    } else {
      heroImg.style.display = 'none';
    }
  }

  setElementText('signatureScriptText', ab.signatureScript);
  setElementHtml('heroTaglineText', ab.tagline);
  setElementText('locationBadgeText', ab.locationBadge);
  setElementHtml('tocTitleText', ab.tocTitle);
  setElementText('tocDescText', ab.tocDesc);

  if (ab.tocLabels) {
    setElementText('tocLabel1', ab.tocLabels.l1);
    setElementText('tocLabel2', ab.tocLabels.l2);
    setElementText('tocLabel3', ab.tocLabels.l3);
    setElementText('tocLabel4', ab.tocLabels.l4);
  }

  // Dedicated 01 About Me Section
  setElementText('aboutSectionTitle', ab.sectionTitle || '01 ABOUT ME & CAREER');
  setElementText('aboutHeadlineText', ab.headline || 'DELIVERING STRATEGIC, MARKET-DRIVEN DESIGNS ACROSS UAE & BEYOND');
  setElementText('aboutBioP1', ab.bioP1 || `Senior Graphic Designer with ${milestones.totalYears} years of experience (${milestones.uaeYears} years in UAE) delivering high-impact visual design...`);
  setElementText('aboutBioP2', ab.bioP2 || 'Proven ability to lead creative projects, collaborate with cross-functional teams, and produce visually compelling, strategic, and market-driven designs...');
  setElementText('aboutQuoteText', ab.quote || "A great design is where visual aesthetics meet strategic precision, delivering enduring value across government and commercial realms.");

  // Dynamic UAQ Career Period (Automatically updates as years at current company increase)
  setElementText('uaqCareerPeriod', milestones.uaqPeriodText);

  // Dynamic Technical Skill Proficiencies (Advances automatically with experience)
  setElementText('skillExpPs', `${milestones.adobeYears} Years`);
  setElementText('skillExpAi', `${milestones.adobeYears} Years`);
  setElementText('skillExpAe', `${milestones.aeYears} Years`);
  setElementText('skillExpId', `${milestones.idYears} Years`);
  setElementText('skillExpPr', `${milestones.prYears} ${milestones.prYears > 1 ? 'Years' : 'Year'}`);

  const metrics = ab.metrics || defaultSiteContent.about.metrics;
  if (metrics && metrics.length >= 4) {
    // If not manually customized, keep synchronized with automated milestone counts
    const m1Num = (metrics[0].num && !metrics[0].num.includes("+")) ? metrics[0].num : milestones.totalYearsText;
    const m2Num = (metrics[1].num && !metrics[1].num.includes("YRS")) ? metrics[1].num : milestones.uaeYearsText;
    const m4Num = (metrics[3].num && !metrics[3].num.includes("YRS")) ? metrics[3].num : `${milestones.adobeYears} YRS`;

    setElementText('aboutMetricNum1', m1Num);
    setElementText('aboutMetricTitle1', metrics[0].title);
    setElementText('aboutMetricDesc1', metrics[0].desc);

    setElementText('aboutMetricNum2', m2Num);
    setElementText('aboutMetricTitle2', metrics[1].title);
    setElementText('aboutMetricDesc2', metrics[1].desc);

    setElementText('aboutMetricNum3', metrics[2].num);
    setElementText('aboutMetricTitle3', metrics[2].title);
    setElementText('aboutMetricDesc3', metrics[2].desc);

    setElementText('aboutMetricNum4', m4Num);
    setElementText('aboutMetricTitle4', metrics[3].title);
    setElementText('aboutMetricDesc4', metrics[3].desc);
  }

  // 02 Services Section
  const sv = siteContent.services || defaultSiteContent.services;
  setElementText('servicesSectionTitle', sv.title);
  const sList = document.getElementById('servicesListContainer');
  if (sList && sv.items && sv.items.length > 0) {
    const iconSvgs = [
      `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="3" y1="9" x2="21" y2="9"></line><line x1="9" y1="21" x2="9" y2="9"></line></svg>`,
      `<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>`,
      `<path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>`,
      `<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>`
    ];

    sList.innerHTML = sv.items.map((item, idx) => `
      <li class="service-item-mini">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
          ${iconSvgs[idx % iconSvgs.length]}
        </svg>
        <div class="service-item-body">
          <span class="service-item-title">${item.title}</span>
          <span class="service-item-sub">${item.sub}</span>
        </div>
      </li>
    `).join('');
  }

  // 03 Selected Work Section
  const sw = siteContent.selectedWork || defaultSiteContent.selectedWork;
  setElementText('selectedWorkSectionTitle', sw.title);

  // 04 Contact Section
  const ct = siteContent.contact || defaultSiteContent.contact;
  setElementHtml('ctaHeadingText', ct.ctaHeading);
  setElementText('contactEmailText', ct.email);
  const phoneDisplay = (ct.phone && !ct.phone.includes('+971') && !/\d{5,}/.test(ct.phone)) ? ct.phone : 'Direct WhatsApp Chat';
  setElementText('contactPhoneText', phoneDisplay);
  setElementText('contactWebsiteText', ct.website);
  setElementText('contactLocationText', ct.location);
  setElementText('siteFooterCopyright', ct.copyright);
  setElementText('contactEmailText', ct.email);

  if (ct.socials) {
    setLinkHref('socialLinkIn', ct.socials.linkedin);
    setLinkHref('btnLinkedinLink', ct.socials.linkedin);
    setLinkHref('socialLinkBe', ct.socials.behance);
    setLinkHref('socialLinkDr', ct.socials.dribbble);
    setLinkHref('socialLinkIg', ct.socials.instagram);
    
    if (ct.socials.whatsapp) {
      setLinkHref('btnWhatsappLink', ct.socials.whatsapp);
      setLinkHref('socialLinkWa', ct.socials.whatsapp);
    }
  }
  
  if (ct.email) {
    const mailto = ct.email.startsWith('mailto:') ? ct.email : `mailto:${ct.email}`;
    setLinkHref('btnEmailLink', mailto);
    setLinkHref('contactEmailLink', mailto);
    setLinkHref('socialLinkEmail', mailto);
  }
}

function setElementText(id, text) {
  const el = document.getElementById(id);
  if (el && text !== undefined) el.textContent = text;
}

function setElementHtml(id, html) {
  const el = document.getElementById(id);
  if (el && html !== undefined) el.innerHTML = html;
}

function setLinkHref(id, href) {
  const el = document.getElementById(id);
  if (el && href) el.href = href;
}

// Ambient Cursor Glow Tracker
function initCursorGlow() {
  const glow = document.getElementById('cursorGlow');
  if (!glow) return;

  window.addEventListener('pointermove', (e) => {
    glow.style.transform = `translate(${e.clientX}px, ${e.clientY}px) translate(-50%, -50%)`;
  });
}

// Load Projects Data
async function loadProjectsData() {
  const isPreview = window.location.search.includes('preview=');
  if (isPreview) {
    const localData = localStorage.getItem('ameer_portfolio_projects');
    if (localData) {
      try {
        projectsData = JSON.parse(localData);
        if (Array.isArray(projectsData) && projectsData.length > 0) return;
      } catch (e) {}
    }
  }

  try {
    const res = await fetch('data/projects.json?v=' + Date.now(), { cache: 'no-store' });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        projectsData = data;
        return;
      }
    }
  } catch(e) {}
  
  // Fallback to local
  const localData = localStorage.getItem('ameer_portfolio_projects');
  if (localData) {
    try { projectsData = JSON.parse(localData); } catch (e) {}
  }
  
  if (!projectsData || projectsData.length === 0) {
    projectsData = [];
  }
}

function getCategoryDisplayName(catId) {
  try {
    const saved = localStorage.getItem('ameer_portfolio_categories');
    if (saved) {
      const cats = JSON.parse(saved);
      const found = cats.find(c => c.id === catId);
      if (found) return found.name;
    }
  } catch (e) {}
  return (catId || 'Brand Identity').replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
}

// =========================================================================
// ALL PROJECTS ARCHIVE POPUP MODAL ENGINE
// =========================================================================
let currentModalFilterCat = 'all';

function openAllProjectsModal(e) {
  if (e) e.preventDefault();
  const modal = document.getElementById('allProjectsModal');
  if (!modal) return;

  const countMeta = document.getElementById('allProjectsCountMeta');
  if (countMeta) {
    countMeta.textContent = `PORTFOLIO ARCHIVE (${projectsData.length} PROJECTS)`;
  }

  currentModalFilterCat = 'all';
  renderModalCategoryFilters();
  renderModalProjectsGrid('all');

  modal.classList.add('active');
  document.body.style.overflow = 'hidden';
}
window.openAllProjectsModal = openAllProjectsModal;

function closeAllProjectsModal(e) {
  if (e && e.target && e.target.classList.contains('presentation-modal-card')) return;
  const modal = document.getElementById('allProjectsModal');
  if (modal) {
    modal.classList.remove('active');
    
    const csModal = document.getElementById('caseStudyModal');
    if (!csModal || !csModal.classList.contains('active')) {
      document.body.style.overflow = '';
    }
  }
}window.closeAllProjectsModal = closeAllProjectsModal;

function renderModalCategoryFilters() {
  const container = document.getElementById('modalCategoryFilters');
  if (!container) return;

  const usedCatIds = new Set(projectsData.map(p => p.category).filter(Boolean));
  let customCats = [];
  try {
    const saved = localStorage.getItem('ameer_portfolio_categories');
    if (saved) customCats = JSON.parse(saved);
  } catch (err) {}

  const catList = [{ id: 'all', name: 'All Projects' }];
  usedCatIds.forEach(id => {
    const found = customCats.find(c => c.id === id);
    catList.push({ id: id, name: found ? found.name : getCategoryDisplayName(id) });
  });

  container.innerHTML = catList.map(cat => `
    <button type="button" class="modal-cat-pill ${cat.id === currentModalFilterCat ? 'active' : ''}" onclick="filterModalProjects('${cat.id}')">
      ${cat.name}
    </button>
  `).join('');
}

function filterModalProjects(catId) {
  currentModalFilterCat = catId;
  renderModalCategoryFilters();
  renderModalProjectsGrid(catId);
}
window.filterModalProjects = filterModalProjects;

function renderModalProjectsGrid(filterCat = 'all') {
  const container = document.getElementById('modalAllProjectsGrid');
  if (!container) return;

  const filtered = filterCat === 'all' 
    ? projectsData 
    : projectsData.filter(p => p.category === filterCat);

  if (filtered.length === 0) {
    container.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 40px; color: var(--text-muted);">
        <p style="font-size: 1rem; margin-bottom: 8px;">No projects found in this category.</p>
        <button type="button" class="nav-pill-btn gold" onclick="filterModalProjects('all')">View All Projects</button>
      </div>
    `;
    return;
  }

  container.innerHTML = filtered.map((p, idx) => {
    const numStr = (idx + 1).toString().padStart(2, '0');
    const catName = getCategoryDisplayName(p.category);
    const isPdf = p.presentationType === 'pdf' || (p.pdfUrl && p.pdfUrl.length > 0);

    return `
      <article class="modal-project-card" onclick="openCaseStudyFromModal('${p.slug || p.id}')" tabindex="0" role="button" aria-label="Open Project: ${p.title}">
        <div style="position: relative; width: 100%; aspect-ratio: 16/10; overflow: hidden; background: #000; flex-shrink: 0; border-radius: 12px 12px 0 0;">
          <img src="${resolveAssetUrl(p.coverImage)}" alt="${p.title}" class="modal-project-thumb" style="width: 100%; height: 100%; object-fit: cover; display: block; object-position: ${p.coverX || 50}% ${p.coverY || 50}%; transform: scale(${(p.coverZoom || 100)/100}); transition: transform 0.2s;" onerror="this.onerror=null; this.src='data:image/svg+xml;utf8,<svg xmlns=\\'http://www.w3.org/2000/svg\\' fill=\\'%231a1a1a\\'><rect width=\\'100%\\' height=\\'100%\\'/></svg>';">
          <span class="modal-project-format" style="position: absolute; top: 10px; right: 10px; font-size: 0.65rem; background: rgba(0,0,0,0.85); backdrop-filter: blur(4px); padding: 4px 8px; border-radius: 6px; border: 1px solid rgba(255,255,255,0.15); color: #fff; font-weight: 600; z-index: 2; display: flex; align-items: center;">
            ${isPdf ? '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right:4px;"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>PDF Deck' : '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right:4px;"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>Slides'}
          </span>
        </div>

        <div class="modal-project-info" style="padding: 14px 16px; display: flex; flex-direction: column; gap: 6px; background: #141414; border-top: 1px solid #242424; flex: 1;">
          <h3 class="modal-project-title" style="margin: 0; font-size: 1.05rem; color: #ffffff; font-weight: 700; line-height: 1.35; display: flex; align-items: flex-start; gap: 8px;">
            <span class="modal-project-num" style="color: #d4af37; font-family: monospace; font-size: 0.85rem; font-weight: 700; flex-shrink: 0; margin-top: 2px;">${numStr}</span>
            <span style="color: #ffffff; font-weight: 700; word-break: break-word;">${p.title}</span>
          </h3>

          <div style="font-size: 0.78rem; color: #a3a3a3; display: flex; align-items: center; gap: 6px; flex-wrap: wrap; margin-top: 2px;">
            <span class="modal-project-client" style="color: #e5e5e5; font-weight: 500;">${p.client || 'Client'}</span>
            <span style="color: #d4af37;">&bull;</span>
            <span>${p.year || '2026'}</span>
            <span style="color: #d4af37;">&bull;</span>
            <span class="modal-project-cat" style="color: #d4af37; font-weight: 600; text-transform: uppercase; font-size: 0.72rem;">${catName}</span>
          </div>
        </div>
      </article>
    `;
  }).join('');
}

let originalBodyOverflow = '';

function openCaseStudyFromModal(identifier) {
  openCaseStudy(identifier);
}
window.openCaseStudyFromModal = openCaseStudyFromModal;

// Render Projects Grid on Homepage
function renderProjectsGrid() {
  const grid = document.getElementById('selectedProjectsGrid');
  if (!grid) return;

  const total = projectsData.length;
  
  // Filter for featured projects
  let displayList = projectsData.filter(p => p.featured === true);
  
  // Ensure we display a minimum of 4 projects by padding with non-featured ones
  if (displayList.length < 4) {
    const nonFeatured = projectsData.filter(p => !p.featured);
    const needed = 4 - displayList.length;
    displayList = [...displayList, ...nonFeatured.slice(0, needed)];
  }
  
  // Cap at a maximum of 6 projects
  displayList = displayList.slice(0, 6);

  // Update Top Link (Optional, if we want to change text dynamically)
  const topBtn = document.getElementById('viewAllProjectsLinkText');
  if (topBtn) {
    topBtn.innerHTML = `VIEW ALL PROJECTS (${total}) &rarr;`;
  }

  grid.innerHTML = displayList.map((p, idx) => {
    const numStr = (idx + 1).toString().padStart(2, '0');
    const isPdf = p.presentationType === 'pdf' || (p.pdfUrl && p.pdfUrl.length > 0);
    const catSubtitle = (p.categories && p.categories[0]) || (typeof getCategoryDisplayName === 'function' ? getCategoryDisplayName(p.category) : p.category) || 'Category';

    return `
      <article class="modal-project-card" onclick="openCaseStudy('${p.slug || p.id}')" tabindex="0" role="button" aria-label="Open Project: ${p.title || 'Untitled'}">
        <div style="position: relative; width: 100%; aspect-ratio: 16/10; overflow: hidden; background: #000; flex-shrink: 0; border-radius: 12px 12px 0 0;">
          <img src="${resolveAssetUrl(p.coverImage || '')}" alt="${p.title || 'Untitled'}" class="modal-project-thumb" style="width: 100%; height: 100%; object-fit: cover; display: block; object-position: ${p.coverX || 50}% ${p.coverY || 50}%; transform: scale(${(p.coverZoom || 100)/100}); transition: transform 0.2s;" onerror="this.onerror=null; this.src='data:image/svg+xml;utf8,<svg xmlns=\\'http://www.w3.org/2000/svg\\' fill=\\'%231a1a1a\\'><rect width=\\'100%\\' height=\\'100%\\'/></svg>';">
          <span class="modal-project-format" style="position: absolute; top: 10px; right: 10px; font-size: 0.65rem; background: rgba(0,0,0,0.85); backdrop-filter: blur(4px); padding: 4px 8px; border-radius: 6px; border: 1px solid rgba(255,255,255,0.15); color: #fff; font-weight: 600; z-index: 2; display: flex; align-items: center;">
            ${isPdf ? '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right:4px;"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>PDF Deck' : '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right:4px;"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>Slides'}
          </span>
        </div>

        <div class="modal-project-info" style="padding: 14px 16px; display: flex; flex-direction: column; gap: 6px; background: #141414; border-top: 1px solid #242424; flex: 1;">
          <h3 class="modal-project-title" style="margin: 0; font-size: 1.05rem; color: #ffffff; font-weight: 700; line-height: 1.35; display: flex; align-items: flex-start; gap: 8px;">
            <span class="modal-project-num" style="color: #d4af37; font-family: monospace; font-size: 0.85rem; font-weight: 700; flex-shrink: 0; margin-top: 2px;">${numStr}</span>
            <span style="color: #ffffff; font-weight: 700; word-break: break-word;">${p.title || 'Untitled'}</span>
          </h3>

          <div style="font-size: 0.78rem; color: #a3a3a3; display: flex; align-items: center; gap: 6px; flex-wrap: wrap; margin-top: 2px;">
            <span class="modal-project-client" style="color: #e5e5e5; font-weight: 500;">${p.client || 'Client'}</span>
            <span style="color: #d4af37;">&bull;</span>
            <span>${p.year || '2026'}</span>
            <span style="color: #d4af37;">&bull;</span>
            <span class="modal-project-cat" style="color: #d4af37; font-weight: 600; text-transform: uppercase; font-size: 0.72rem;">${catSubtitle}</span>
          </div>
        </div>
      </article>
    `;
  }).join('');
}

// Open Universal Presentation Modal (PDF Document or Pure Vertical Image Gallery)
function openCaseStudy(identifier) {
  const project = projectsData.find(p => p.id === identifier || p.slug === identifier) ;
  if (!project) return;

  currentProjectIndex = projectsData.findIndex(p => p.id === project.id);

  // Set Top Header Info
  const clientEl = document.getElementById('csClientName');
  const titleEl = document.getElementById('csProjectTitle');

  if (clientEl) clientEl.innerHTML = `${project.client || 'CREATIVE PROJECT'} &bull; ${project.year || '2026'}`;
  if (titleEl) titleEl.textContent = project.title || 'PROJECT PRESENTATION';

  const presBody = document.getElementById('csPresBody');
  if (presBody) {
    const pdfUrl = project.pdfUrl || (project.documents && project.documents.find(d => (d.url && d.url.endsWith('.pdf')) || (d.file && d.file.endsWith('.pdf')) || d.type === 'PDF'))?.url || '';
    const isPdfProject = (project.presentationType === 'pdf') || Boolean(pdfUrl && project.presentationType !== 'photos' && pdfUrl.toLowerCase().includes('.pdf'));

    if (isPdfProject && pdfUrl) {
      // 1. Render PDF Deck Viewer
      let finalPdfUrl = resolveAssetUrl(pdfUrl);
      
      // Accurately resolve relative URLs against the current path (crucial for GitHub Pages /subpaths/)
      if (!finalPdfUrl.startsWith('http')) {
        const baseHref = window.location.href.split('#')[0].split('?')[0];
        const baseDir = baseHref.substring(0, baseHref.lastIndexOf('/') + 1);
        finalPdfUrl = baseDir + finalPdfUrl.replace(/^\.?\//, '');
      }
      
      const renderIframe = () => {
        let iframeSrc = '';
        if (finalPdfUrl.includes('drive.google.com')) {
          iframeSrc = finalPdfUrl.replace(/\/view.*$/, '/preview').replace(/\/edit.*$/, '/preview');
        } else {
          // Use Google Docs Viewer universally for standard PDFs to guarantee rendering
          if (finalPdfUrl.toLowerCase().includes('.pdf')) {
            iframeSrc = `https://docs.google.com/viewer?url=${encodeURIComponent(finalPdfUrl)}&embedded=true`;
          } else {
            iframeSrc = finalPdfUrl;
          }
        }

        presBody.innerHTML = `
          <div style="padding: 1rem 5%; background: var(--surface); border-bottom: 1px solid var(--border); display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px;">
            <span style="color: #a3a3a3; font-size: 0.9rem; font-weight: 600;">PDF Case Study Deck</span>
            <a href="${finalPdfUrl}" target="_blank" rel="noopener noreferrer" style="background: rgba(223, 189, 105, 0.15); border: 1px solid var(--gold-primary); color: var(--gold-primary); padding: 8px 16px; border-radius: 6px; font-size: 0.85rem; font-weight: 600; text-decoration: none;">Download / Open Fullscreen &#x2197;</a>
          </div>
          <div style="width: 100%; height: calc(100vh - 140px); background: #111;">
            <iframe src="${iframeSrc}" style="width: 100%; height: 100%; border: none;" title="${project.title} PDF Deck"></iframe>
          </div>
        `;
      };

      const renderFallback = () => {
        presBody.innerHTML = `
          <div style="padding: 4rem 2rem; max-width: 600px; margin: 0 auto; text-align: center;">
            <div style="background: #1a1a1a; border: 1px solid #333; padding: 3rem 2rem; border-radius: 12px;">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#555" stroke-width="2" style="margin-bottom: 1rem; display: inline-block;"><path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path><polyline points="13 2 13 9 20 9"></polyline></svg>
              <h3 style="color: #d4af37; margin-bottom: 1rem;">Document Unavailable</h3>
              <p style="color: #a3a3a3; margin-bottom: 2rem;">The requested case study document could not be loaded or may have been moved.</p>
              <a href="${finalPdfUrl}" target="_blank" rel="noopener noreferrer" style="background: rgba(223, 189, 105, 0.15); border: 1px solid var(--gold-primary); color: var(--gold-primary); padding: 10px 20px; border-radius: 6px; font-weight: 600; text-decoration: none; display: inline-block;">Download / View Direct File &#x2197;</a>
            </div>
          </div>
        `;
      };

      // Always render iframe directly (Google Docs viewer handles 404s gracefully with its own UI)
      renderIframe();
    } else {
      // 2. Render Image Gallery (Slides)
      const allImages = [];
      if (project.coverImage) allImages.push(project.coverImage);
      
      // Legacy gallery support (array of objects)
      if (project.gallery) {
        project.gallery.forEach(g => {
          const imgUrl = g.image || g.url;
          if (imgUrl && imgUrl !== project.coverImage) allImages.push(imgUrl);
        });
      }
      
      // New images support (array of strings)
      if (project.images && Array.isArray(project.images)) {
        project.images.forEach(imgUrl => {
          if (imgUrl && imgUrl !== project.coverImage && !allImages.includes(imgUrl)) {
            allImages.push(imgUrl);
          }
        });
      }

      const galleryHtml = allImages.map(url => `
        <div style="width: 100%; border-radius: 12px; overflow: hidden; background: #111; margin-bottom: 1.5rem;">
          <img src="${resolveAssetUrl(url)}" alt="${project.title}" style="width: 100%; height: auto; display: block; object-fit: cover;" onerror="this.onerror=null; this.src='data:image/svg+xml;utf8,<svg xmlns=\\'http://www.w3.org/2000/svg\\' fill=\\'%231a1a1a\\'><rect width=\\'100%\\' height=\\'100%\\'/></svg>';" />
        </div>
      `).join('');

      let externalBtnHtml = '';
      const externalLink = project.externalUrl || (pdfUrl && !pdfUrl.toLowerCase().includes('.pdf') ? pdfUrl : null);
      if (externalLink && externalLink.startsWith('http')) {
        externalBtnHtml = `<div style="margin-bottom: 2rem;"><a href="${externalLink}" target="_blank" rel="noopener noreferrer" style="display: inline-block; background: rgba(223, 189, 105, 0.15); border: 1px solid var(--gold-primary); color: var(--gold-primary); padding: 10px 20px; border-radius: 6px; font-size: 0.9rem; font-weight: 600; text-decoration: none;">Visit Live Site &#x2197;</a></div>`;
      }

      const descHtml = project.description || project.summary ? `<div style="color: #d4d4d4; line-height: 1.6; font-size: 0.95rem; margin-bottom: 2rem;"><p>${project.description || project.summary}</p></div>` : '';

      presBody.innerHTML = `
        <div style="padding: 2rem 5%; max-width: 1200px; margin: 0 auto;">
          ${externalBtnHtml}
          ${descHtml}
          ${galleryHtml}
        </div>
      `;
    }
    presBody.scrollTop = 0;
  }

  // URL Hash
  const targetHash = `#project=${project.slug || project.id}`;
  if (window.location.hash !== targetHash) {
    history.pushState(null, null, targetHash);
  }

  const modal = document.getElementById('caseStudyModal');
  if (modal) {
    modal.classList.add('active');
    modal.setAttribute('aria-hidden', 'false');
    
    // 1. Lock background scrolling when modal mounts
    originalBodyOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
  }
}

// Interactive Behance Appreciate Button Reaction
let hasAppreciated = false;
function handleBehanceAppreciate() {
  const countEl = document.getElementById('behanceLikeCount');
  const btn = document.getElementById('behanceAppreciateBtn');
  if (!countEl || !btn) return;

  if (!hasAppreciated) {
    let current = parseInt(countEl.textContent, 10) || 148;
    countEl.textContent = current + 1;
    btn.style.background = '#003db3';
    btn.style.transform = 'scale(1.12)';
    hasAppreciated = true;
    showToast('\ud83d\udc99 Project Appreciated! Thank you.');
    setTimeout(() => { btn.style.transform = 'scale(1)'; }, 300);
  } else {
    showToast('You have already appreciated this project!');
  }
}

// Scroll Reveal Animations
function initScrollReveal() {
  const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.15
  };

  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  document.querySelectorAll('.reveal-up, .reveal-fade').forEach(el => {
    revealObserver.observe(el);
  });
}

// Copy Permalink
function copyCaseStudyLink() {
  const url = window.location.href;
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(url).then(() => showToast('\ud83d\udd17 Project permalink copied to clipboard!')).catch(() => showToast('Copied!'));
  } else {
    showToast('\ud83d\udd17 Permalink copied!');
  }
}

// Native Contact Form Submission
document.addEventListener('DOMContentLoaded', () => {
  const contactForm = document.getElementById('contactForm');
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('contactName').value.trim();
      const message = document.getElementById('contactMessage').value.trim();
      
      if (!name || !message) return;
      
      const submitBtn = contactForm.querySelector('button[type="submit"]');
      const submitBtnText = submitBtn.querySelector('span');
      const originalText = submitBtnText ? submitBtnText.textContent : "Send Message";
      
      submitBtn.disabled = true;
      if (submitBtnText) submitBtnText.textContent = "SENDING...";
      submitBtn.style.opacity = "0.7";
      
      fetch("https://formsubmit.co/ajax/ameersuhail4729@gmail.com", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify({
          name: name,
          message: message,
          _subject: `New Portfolio Inquiry from ${name}`
        })
      })
      .then(response => {
        if (response.ok) {
          showToast("✓ Message sent! I will get back to you soon.");
          contactForm.reset();
        } else {
          throw new Error("FormSubmit response not OK");
        }
      })
      .catch(error => {
        console.warn("FormSubmit failed, falling back to mailto client:", error);
        const email = "ameersuhail4729@gmail.com";
        const subject = encodeURIComponent(`New Inquiry from ${name}`);
        const body = encodeURIComponent(`Hello Ameer,\n\n${message}\n\nBest regards,\n${name}`);
        window.location.href = `mailto:${email}?subject=${subject}&body=${body}`;
        showToast("Opening email client...");
        contactForm.reset();
      })
      .finally(() => {
        submitBtn.disabled = false;
        if (submitBtnText) submitBtnText.textContent = originalText;
        submitBtn.style.opacity = "1";
      });
    });
  }
});

// Close Case Study
function closeCaseStudy(e) {
  if (e && e.target && e.target !== e.currentTarget && !e.target.classList.contains('behance-close-btn')) {
    return;
  }

  const modal = document.getElementById('caseStudyModal');
  if (modal) {
    modal.classList.remove('active');
    modal.setAttribute('aria-hidden', 'true');
    
    // 2. Unlock background scrolling when modal unmounts / closes
    document.body.style.overflow = originalBodyOverflow || '';
  }

  if (window.location.hash.startsWith('#project=')) {
    history.pushState(null, null, window.location.pathname + window.location.search);
  }
}

// Cycle Projects
function navigateCaseStudy(direction) {
  if (!projectsData || projectsData.length === 0) return;
  const total = projectsData.length;
  currentProjectIndex = (currentProjectIndex + direction + total) % total;
  const nextProj = projectsData[currentProjectIndex];
  if (nextProj) {
    openCaseStudy(nextProj.slug || nextProj.id);
  }
}

// Theme Switcher for Logo Deck
function setLogoDeckTheme(theme, btnElement) {
  const card = document.getElementById('csLogoDeck');
  if (!card) return;

  card.className = `logo-deck-card theme-${theme}`;
  document.querySelectorAll('.logo-theme-toggles .theme-toggle-btn').forEach(btn => {
    btn.classList.remove('active');
  });
  if (btnElement) btnElement.classList.add('active');
}

// URL Routing
function handleUrlRouting() {
  const hash = window.location.hash;
  if (hash && hash.startsWith('#project=')) {
    const slug = hash.replace('#project=', '').trim();
    if (slug) openCaseStudy(slug);
  } else {
    const modal = document.getElementById('caseStudyModal');
    if (modal && modal.classList.contains('active')) {
      closeCaseStudy();
    }
  }
}

// Copy Text
function copyContactText(text, successMsg = 'Copied to clipboard!') {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(() => showToast(successMsg)).catch(() => fallbackCopy(text, successMsg));
  } else {
    fallbackCopy(text, successMsg);
  }
}

function fallbackCopy(text, msg) {
  const ta = document.createElement('textarea');
  ta.value = text;
  ta.style.position = 'fixed';
  ta.style.opacity = '0';
  document.body.appendChild(ta);
  ta.select();
  try { document.execCommand('copy'); showToast(msg); } catch (e) { showToast(`Value: ${text}`); }
  document.body.removeChild(ta);
}

// Global Toast
function showToast(msg) {
  const toast = document.getElementById('globalToast');
  const text = document.getElementById('toastMessageText');
  if (!toast || !text) return;

  text.textContent = msg;
  toast.classList.add('show');
  if (toastTimeout) clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => toast.classList.remove('show'), 3500);
}

// =========================================================================
// ARCHIVE VIEW MODE (GRID VS LIST)
// =========================================================================
function setArchiveViewMode(mode) {
  const container = document.getElementById('modalAllProjectsGrid');
  const btnGrid = document.getElementById('btnGridView');
  const btnList = document.getElementById('btnListView');
  
  if (!container || !btnGrid || !btnList) return;
  
  if (mode === 'list') {
    container.classList.remove('archive-container--grid');
    container.classList.add('archive-container--list');
    btnGrid.classList.remove('active');
    btnList.classList.add('active');
  } else {
    container.classList.remove('archive-container--list');
    container.classList.add('archive-container--grid');
    btnList.classList.remove('active');
    btnGrid.classList.add('active');
  }
  
  localStorage.setItem('portfolio_view_mode', mode);
}

// Initialize View Mode on Load
document.addEventListener('DOMContentLoaded', () => {
  const savedMode = localStorage.getItem('portfolio_view_mode') || 'grid';
  setArchiveViewMode(savedMode);
});








