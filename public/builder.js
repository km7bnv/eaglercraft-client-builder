// ======================================
// STANDALONE builder.js - Drop-in ready
// Save as /public/builder.js & <script src="/builder.js"></script>
// Uses your /public/base.html - 100% modifies it
// ======================================

(function() {
'use strict';

// ===== INIT =====
document.addEventListener('DOMContentLoaded', init);
function init() {
    updateStats();
    bindEvents();
    updatePreview();
    window.buildClient = buildClient;  // Global
}

// Stats
function updateStats() {
    const el = document.getElementById('clientCount');
    if (el) {
        let count = parseInt(localStorage.getItem('clientCount') || '0');
        el.textContent = count;
    }
}

// Events
function bindEvents() {
    ['clientName','username','seed','fly','fullbright','xray','nofall','speed','killaura','killauraRange','bgColor','motd','texturePack','splashText']
    .forEach(id => {
        const el = document.getElementById(id);
        if (el) el.addEventListener('input', updatePreview);
    });
    document.getElementById('addServer')?.addEventListener('click', addServer);
}

// Preview
function updatePreview() {
    const name = geid('clientName')?.value || 'Client';
    const hacks = getHacks();
    const servers = document.querySelectorAll('.server-entry').length;
    const el = document.getElementById('size');
    if (el) el.textContent = `${name} | ${hacks.join(', ') || 'No hacks'} | ${servers} servers`;
}

// Utils
function geid(id) { return document.getElementById(id); }
function getHacks() {
    return ['fly','fullbright','xray','nofall','speed','killaura']
        .filter(id => geid(id)?.checked)
        .map(id => id.toUpperCase());
}

// Servers
function addServer() {
    const list = geid('serverList');
    if (!list) return;
    const div = document.createElement('div');
    div.className = 'server-entry p-2 mb-2 bg-gray-800 rounded';
    div.innerHTML = `
        <input placeholder="Name" class="p-1 mr-2 w-24">
        <input placeholder="wss://..." class="p-1 mr-2 flex-1">
        <button onclick="this.parentElement.remove();updatePreview()" class="bg-red-500 px-2 py-1 text-white rounded">X</button>
    `;
    list.appendChild(div);
    updatePreview();
}

// ===== BUILDER CORE =====
async function buildClient() {
    const out = geid('output');
    if (!out) return alert('Missing #output');
    out.innerHTML = '🔄 Building...';

    try {
        // Settings
        const name = (geid('clientName')?.value || 'Client').replace(/[^a-z0-9_-]/gi, '_');
        const opts = {
            title: name,
            username: geid('username')?.value || 'Player',
            worldSeed: +geid('seed')?.value || 0,
            wssServers: Array.from(document.querySelectorAll('.server-entry input'))
                .reduce((acc, el, i) => {
                    if (i%2===0 && acc.length) {
                        const srv = acc.pop();
                        if (srv.name && el.value) acc.push({...srv, url: el.value});
                    } else if (el.value) {
                        acc.push({name: el.value});
                    }
                    return acc;
                }, []),
            backgroundColor: geid('bgColor')?.value || '#000',
            motd: geid('motd')?.value || `${name} Client`,
            splash: geid('splashText')?.value || 'Custom Build',
            assets: geid('texturePack')?.value || 'default',
            cheats: {
                fly: !!geid('fly')?.checked,
                fullbright: !!geid('fullbright')?.checked,
                xray: !!geid('xray')?.checked,
                nofall: !!geid('nofall')?.checked,
                speed: !!geid('speed')?.checked,
                killaura: geid('killaura')?.checked ? {range: +geid('killauraRange')?.value || 4} : false
            }
        };

        // Fetch base.html
        const res = await fetch('/base.html');
        if (!res.ok) throw new Error('No /public/base.html - download from eaglercraft.com');
        let html = await res.text();
        const doc = new DOMParser().parseFromString(html, 'text/html');

        // Inject
        const script = doc.createElement('script');
        script.textContent = `window.mc_opts=${JSON.stringify(opts)};console.log('✅ HACKS:',${JSON.stringify(opts.cheats)});`;
        doc.head.appendChild(script);

        // Patch
        doc.title = opts.title + ' - ' + opts.splash;
        doc.body.style.backgroundColor = opts.backgroundColor;

        html = '<!DOCTYPE html>\n' + doc.documentElement.outerHTML;

        // Download
        const blob = new Blob([html], {type:'text/html'});
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = name + '.html';
        a.click();

        // Update
        const hacks = getHacks();
        out.innerHTML = `✅ **${name}.html** BUILT!\n\nHacks: ${hacks.join(', ') || 'none'}\nServers: ${opts.wssServers.length}\nSplash: ${opts.splash}`;
        
        const count = parseInt(localStorage.getItem('clientCount') || '0') + 1;
        localStorage.setItem('clientCount', count);
        geid('clientCount').textContent = count;

    } catch(e) {
        out.innerHTML = '❌ ' + e.message;
        console.error(e);
    }
}

})();