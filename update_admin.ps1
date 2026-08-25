$content = Get-Content admin.html -Raw

$oldLoad = '(?s)async function loadLocalData\(\) \{.*?function saveLocalData\(\) \{'
$newLoad = 'async function loadLocalData() {
  try {
    let fetchedProjects = false;
    let fetchedContent = false;
    
    // 1. Always attempt to fetch LIVE remote data first (Cache-busted)
    try {
        const resP = await fetch(''data/projects.json?v='' + Date.now(), { cache: ''no-store'' });
        if (resP.ok) {
            const remoteProjects = await resP.json();
            if (Array.isArray(remoteProjects)) {
                allProjects = remoteProjects;
                fetchedProjects = true;
            }
        }
    } catch(e) { console.error("Failed to fetch live projects", e); }
    
    try {
        const resC = await fetch(''data/siteContent.json?v='' + Date.now(), { cache: ''no-store'' });
        if (resC.ok) {
            const remoteContent = await resC.json();
            if (remoteContent) {
                siteContent = remoteContent;
                fetchedContent = true;
            }
        }
    } catch(e) { console.error("Failed to fetch live content", e); }
    
    // 2. If fetch failed (offline/error), fallback to localStorage
    if (!fetchedProjects) {
        const pData = localStorage.getItem(''ameer_portfolio_projects'');
        if (pData) allProjects = JSON.parse(pData);
    }
    
    if (!fetchedContent) {
        const cData = localStorage.getItem(''ameer_portfolio_site_content'');
        if (cData) siteContent = JSON.parse(cData);
    }
    
    // 3. Save the single source of truth to localStorage
    saveLocalData();
    
  } catch (e) {
    console.error("Critical error loading data", e);
  }
  
  if(!siteContent.about) siteContent = {
    about: { brandName: "AHAMMED", brandRole: "CREATIVE DIRECTOR", heroHeadline: "VISUALIZING <span style=''color:#DFBD69''>FUTURES</span>", heroLead: "Crafting digital experiences.", heroImage: "assets/hero-portrait.png" },
    contact: { email: "hello@example.com" }
  };

  allProjects.sort((a,b) => (a.order||0) - (b.order||0));
  renderProjects();
  renderContentForm();
}

function saveLocalData() {'

$content = $content -replace $oldLoad, $newLoad

$syncButtons = '
      <div class="flex gap-2 mt-2">
        <button onclick="forceSyncFromGitHub()" class="bg-surface border border-border text-xs py-1 px-3 rounded-lg hover:bg-neutral-800 transition-all text-neutral-300">
          <i class="ph ph-arrows-clockwise"></i> Force Sync
        </button>
        <button onclick="clearLocalCache()" class="bg-red-900/30 border border-red-900/50 text-xs py-1 px-3 rounded-lg hover:bg-red-900/50 transition-all text-red-300">
          <i class="ph ph-trash"></i> Clear Cache
        </button>
      </div>'

$oldHeader = '(?s)<div class="p-4 md:p-8 border-b border-border flex justify-between items-center md:items-start md:flex-col">.*?<button onclick="publishAllToGitHub\(\)"'
$newHeader = '<div class="p-4 md:p-8 border-b border-border flex justify-between items-center md:items-start md:flex-col">
      <div>
        <h1 class="text-xl md:text-2xl font-bold text-brand tracking-widest uppercase flex items-center gap-3">
          <i class="ph ph-command"></i> STUDIO OS
        </h1>
        <p class="text-[10px] md:text-xs text-neutral-500 mt-1 md:mt-2 font-mono hidden md:block" id="syncStatus">? Local Sync Active</p>
        ' + $syncButtons + '
      </div>
      <button onclick="publishAllToGitHub()"'

$content = $content -replace $oldHeader, $newHeader

$functionsToAdd = '
    async function forceSyncFromGitHub() {
      try {
        const repo = document.getElementById(''githubRepo'').value;
        const token = document.getElementById(''githubToken'').value;
        if (!repo || !token) {
          showToast("Configure GitHub Repo & Token in Data Backup tab first.", true);
          return;
        }
        
        showToast("Force syncing from GitHub...");
        
        // Fetch Projects
        const pRes = await fetch(https://api.github.com/repos/ + repo + /contents/data/projects.json, {
          headers: { "Authorization": 	oken  + token, "Accept": "application/vnd.github.v3+json", "Cache-Control": "no-cache" }
        });
        if (pRes.ok) {
            const pData = await pRes.json();
            const decoded = decodeURIComponent(escape(atob(pData.content)));
            allProjects = JSON.parse(decoded);
        }
        
        // Fetch Site Content
        const cRes = await fetch(https://api.github.com/repos/ + repo + /contents/data/siteContent.json, {
          headers: { "Authorization": 	oken  + token, "Accept": "application/vnd.github.v3+json", "Cache-Control": "no-cache" }
        });
        if (cRes.ok) {
            const cData = await cRes.json();
            const decoded = decodeURIComponent(escape(atob(cData.content)));
            siteContent = JSON.parse(decoded);
        }
        
        saveLocalData();
        renderProjects();
        renderContentForm();
        showToast("Force Sync Complete! Loaded exact GitHub state.");
      } catch (err) {
        console.error(err);
        showToast("Failed to force sync from GitHub.", true);
      }
    }

    function clearLocalCache() {
      if (confirm("Are you sure you want to clear all local browser cache for this panel? Unsaved changes will be lost.")) {
        localStorage.removeItem(''ameer_portfolio_projects'');
        localStorage.removeItem(''ameer_portfolio_site_content'');
        allProjects = [];
        siteContent = {};
        renderProjects();
        showToast("Local Cache Cleared. Empty state.");
      }
    }
'

$content = $content -replace '</script>\s*</body>', "$functionsToAdd
</script>
</body>"

Set-Content admin.html -Value $content -Encoding UTF8
