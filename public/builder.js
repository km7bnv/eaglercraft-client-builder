// builder.js - Complete Eaglercraft Client Builder (WASM/JS Compatible)
// Uses /public/base.html (your 16MB WASM or standard 1.8 offline) as template

document.addEventListener('DOMContentLoaded', function() {
    const clientCountEl = document.getElementById('clientCount');
    let clientCount = parseInt(localStorage.getItem('clientCount') || '0');
    clientCountEl.textContent = clientCount;

    // Live preview updates
    const inputs = ['clientName', 'username', 'seed', 'fly', 'fullbright', 'xray', 'nofall', 'speed', 'killaura', 'killauraRange', 'bgColor', 'motd', 'texturePack'];
    inputs.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            ['input', 'change'].forEach(event => el.addEventListener(event, updatePreview));
        }
    });
    updatePreview();

    window.updatePreview = updatePreview;  // Global for buttons
    window.getEnabledHacks = getEnabledHacks;
});

function updatePreview() {
    const name = document.getElementById('clientName')?.value || 'Custom Client';
    const hacks = getEnabledHacks();
    const serverCount = document.querySelectorAll('.server-entry').length;
    document.getElementById('size').textContent = `${name} | Hacks: ${hacks.join(', ') || 'None'} | Servers: ${serverCount}`;
}

function getEnabledHacks() {
    const hacks = [];
    ['fly', 'fullbright', 'xray', 'nofall', 'speed', 'killaura'].forEach(id => {
        if (document.getElementById(id)?.checked) hacks.push(id.charAt(0).toUpperCase() + id.slice(1));
    });
    return hacks;
}

// Server management
function addServer() {
    const serverList = document.getElementById('serverList');
    const entry = document.createElement('div');
    entry.className = 'server-entry';
    entry.innerHTML = `
        <input type="text" placeholder="Server name">
        <input type="text" placeholder="wss://server.example.com">
        <button type="button" onclick="removeServer(this)">Remove</button>
    `;
    serverList.appendChild(entry);
    updatePreview();
}

function removeServer(btn) {
    btn.parentElement.remove();
    updatePreview();
}

// Generate full client from base.html
async function buildClient() {
    const output = document.getElementById('output');
    output.innerHTML = '<p>Building client...</p>';

    const clientName = (document.getElementById('clientName')?.value || 'Custom Eaglercraft').replace(/[^a-zA-Z0-9]/g, '_');
    const username = document.getElementById('username')?.value || '';
    const seed = parseInt(document.getElementById('seed')?.value) || 0;
    const bgColor = document.getElementById('bgColor')?.value || '#000000';
    const motd = document.getElementById('motd')?.value || `Welcome to ${clientName}`;
    const texturePack = document.getElementById('texturePack')?.value || 'default';

    // Hacks config
    const hacks = {
        fly: document.getElementById('fly')?.checked || false,
        fullbright: document.getElementById('fullbright')?.checked || false,
        xray: document.getElementById('xray')?.checked || false,
        nofall: document.getElementById('nofall')?.checked || false,
        speed: document.getElementById('speed')?.checked || false,
        killauraRange: document.getElementById('killaura')?.checked ? parseInt(document.getElementById('killauraRange')?.value) || 3 : 0
    };

    // Servers
    const servers = [];
    document.querySelectorAll('.server-entry').forEach(entry => {
        const nameEl = entry.querySelector('input[type="text"]:nth-of-type(1)');
        const urlEl = entry.querySelector('input[type="text"]:nth-of-type(2)');
        const name = nameEl?.value.trim();
        const url = urlEl?.value.trim();
        if (name && url) servers.push({ name, url });
    });

    // EaglercraftX opts (WASM/JS compatible)
    const opts = {
        aset: texturePack,
        servers: servers.length ? servers : undefined,
        motd: motd,
        online_enable: servers.length > 0,
        fakeSplashScreen: `Custom ${clientName}`,
        // Hacks (require modded base.html for full effect)
        hacks: hacks,
        // WASM optimizations
        wasm_gc: true,
        // User settings
        username: username,
        worldSeed: seed,
        style: { backgroundColor: bgColor }
    };

    try {
        const response = await fetch('/base.html');
        if (!response.ok) throw new Error(`Base not found: ${response.status}`);
        let baseHTML = await response.text();

        // Patch template
        baseHTML = baseHTML
            .replace(/<title>.*?<\/title>/i, `<title>${clientName}</title>`)
            .replace(/window\.eaglercraftXOpts\s*=\s*\{[\s\S]*?\}/i, `window.eaglercraftXOpts = ${JSON.stringify(opts, null, 2)};`)
            .replace(/"motd"\s*:\s*"[^"]*"/i, `"motd": "${motd.replace(/"/g, '\\"').replace(/\n/g, '\\n')}"`)
            .replace(/<body\b[^>]*>/i, `<body style="background-color: ${bgColor} !important;">`)
            .replace(/(["']username["']\s*:\s*)"[^"]*"/i, `$1"${username}"`)
            .replace(/(["']worldSeed["']\s*:\s*)[0-9]+/i, `$1${seed}`)
            .replace(/(["']fpsLimit["']\s*:\s*)[0-9]+/i, '$1 999')  // Max FPS
            .replace(/<canvas/i, `<canvas style="background: transparent;"`);

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
        output.innerHTML = `✅ <strong>${clientName}.html</strong> downloaded (${sizeMB}MB)<br>Fully playable offline Eaglercraft 1.8 (WASM/JS) with your servers, hacks & settings!`;

        // Stats
        clientCount++;
        document.getElementById('clientCount').textContent = clientCount;
        localStorage.setItem('clientCount', clientCount);
    } catch (error) {
        output.innerHTML = `❌ Error: ${error.message}<br>Ensure <code>/base.html</code> (your 16MB WASM file) is in <code>/public/</code>`;
    }
}