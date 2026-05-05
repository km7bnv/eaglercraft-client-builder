// builder.js - Complete Eaglercraft Client Builder (eaglercraft.com WASM 1.8 Optimized)
// Uses /public/base.html from eaglercraft.com WASM download

document.addEventListener('DOMContentLoaded', function() {
    const clientCountEl = document.getElementById('clientCount');
    let clientCount = parseInt(localStorage.getItem('clientCount') || '0');
    clientCountEl.textContent = clientCount;

    // Live preview
    const inputs = ['clientName', 'username', 'seed', 'fly', 'fullbright', 'xray', 'nofall', 'speed', 'killaura', 'killauraRange', 'bgColor', 'motd', 'texturePack'];
    inputs.forEach(id => {
        const el = document.getElementById(id);
        if (el) ['input', 'change'].forEach(event => el.addEventListener(event, updatePreview));
    });
    updatePreview();

    window.updatePreview = updatePreview;
    window.getEnabledHacks = getEnabledHacks;
    window.buildClient = buildClient;  // Ensure global
});

function updatePreview() {
    const name = document.getElementById('clientName')?.value || 'Custom Client';
    const hacks = getEnabledHacks();
    const servers = document.querySelectorAll('.server-entry').length;
    document.getElementById('size').textContent = `${name} | Hacks: ${hacks.join(', ') || 'None'} | Servers: ${servers}`;
}

function getEnabledHacks() {
    return ['fly', 'fullbright', 'xray', 'nofall', 'speed', 'killaura']
        .filter(id => document.getElementById(id)?.checked)
        .map(id => id.charAt(0).toUpperCase() + id.slice(1));
}

function addServer() {
    const serverList = document.getElementById('serverList');
    const entry = document.createElement('div');
    entry.className = 'server-entry';
    entry.innerHTML = `
        <input type="text" placeholder="Server name" style="flex:1">
        <input type="text" placeholder="wss://server.example.com" style="flex:2">
        <button type="button" onclick="removeServer(this)">Remove</button>
    `;
    serverList.appendChild(entry);
    updatePreview();
}

function removeServer(btn) {
    btn.parentElement.remove();
    updatePreview();
}

async function buildClient() {
    const output = document.getElementById('output');
    output.innerHTML = '🔄 Building client...';

    // Collect settings
    const clientName = (document.getElementById('clientName')?.value || 'Eaglercraft-WASM').replace(/[^a-zA-Z0-9]/g, '_');
    const username = document.getElementById('username')?.value || 'Player';
    const seed = parseInt(document.getElementById('seed')?.value) || 12345;
    const bgColor = document.getElementById('bgColor')?.value || '#1a1a1a';
    const motd = document.getElementById('motd')?.value || `${clientName} - WASM Edition`;
    const texturePack = document.getElementById('texturePack')?.value || 'default';

    // Hacks
    const hacks = {
        fly: !!document.getElementById('fly')?.checked,
        fullbright: !!document.getElementById('fullbright')?.checked,
        xray: !!document.getElementById('xray')?.checked,
        nofall: !!document.getElementById('nofall')?.checked,
        speed: !!document.getElementById('speed')?.checked,
        killaura: document.getElementById('killaura')?.checked ? (parseInt(document.getElementById('killauraRange')?.value) || 3) : 0
    };

    // Servers
    const servers = Array.from(document.querySelectorAll('.server-entry')).map(entry => {
        const name = entry.querySelector('input:nth-child(1)')?.value.trim();
        const url = entry.querySelector('input:nth-child(2)')?.value.trim();
        return name && url ? { name, url } : null;
    }).filter(Boolean);

    // eaglercraft.com WASM opts format
    const opts = {
        title: clientName,
        motd: motd,
        username: username,
        seed: seed,
        servers: servers,
        assets: texturePack,
        backgroundColor: bgColor,
        cheatsEnabled: Object.values(hacks).some(Boolean),
        cheats: hacks,
        wasm_gc: true,
        maxFps: 999
    };

    try {
        const response = await fetch('/base.html');
        if (!response.ok) throw new Error(`Base.html 404 - Upload your 16MB WASM file to /public/base.html`);
        
        let baseHTML = await response.text();
        const parser = new DOMParser();
        const doc = parser.parseFromString(baseHTML, 'text/html');

        // Patch title
        doc.title = clientName;

        // Inject custom opts (eaglercraft.com WASM compatible)
        const optsScript = doc.createElement('script');
        optsScript.textContent = `window.mc_opts = ${JSON.stringify(opts)};\nconsole.log('Custom WASM client loaded:', window.mc_opts);`;
        doc.head.appendChild(optsScript);

        // Background
        doc.body.style.backgroundColor = bgColor;
        Array.from(doc.querySelectorAll('canvas, #canvas')).forEach(el => {
            el.style.backgroundColor = 'transparent';
        });

        // Update any existing MOTD div
        Array.from(doc.querySelectorAll('[class*="motd"], [id*="motd"]')).forEach(el => {
            el.textContent = motd;
        });

        baseHTML = '<!DOCTYPE html>\n' + doc.documentElement.outerHTML;

        // Download
        const blob = new Blob([baseHTML], { type: 'text/html;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${clientName}.html`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        const sizeMB = (baseHTML.length / 1048576).toFixed(1);
        output.innerHTML = `
            <p>✅ <strong>${clientName}.html</strong> ready! (${sizeMB}MB)</p>
            <p>🎮 Fully playable WASM 1.8 offline<br>
            🌐 Servers: ${servers.length}<br>
            ⚡ Hacks: ${getEnabledHacks().join(', ') || 'None'}</p>
        `;

        // Stats
        clientCount++;
        document.getElementById('clientCount').textContent = clientCount;
        localStorage.setItem('clientCount', clientCount);

    } catch (error) {
        output.innerHTML = `<p>❌ ${error.message}</p><p>💡 Upload eaglercraft.com WASM as <code>/public/base.html</code></p>`;
        console.error('Builder error:', error);
    }
}