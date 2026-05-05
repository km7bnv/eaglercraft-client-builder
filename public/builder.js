// builder.js - Eaglercraft Client Builder JavaScript
// Handles preview updates, server management, and client generation

document.addEventListener('DOMContentLoaded', function() {
    const clientCount = document.getElementById('clientCount');
    let count = localStorage.getItem('clientCount') || 0;
    clientCount.textContent = count;

    // Update preview live
    const inputs = ['clientName', 'username', 'seed', 'fly', 'fullbright', 'xray', 'nofall', 'speed', 'killaura', 'killauraRange', 'bgColor', 'motd', 'texturePack'];
    inputs.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.addEventListener('input', updatePreview);
            if (el.type === 'checkbox') el.addEventListener('change', updatePreview);
        }
    });
    updatePreview();

    function updatePreview() {
        const name = document.getElementById('clientName').value || 'Custom Client';
        const sizeEl = document.getElementById('size');
        sizeEl.textContent = `${name} | Hacks: ${getEnabledHacks().join(', ')} | Servers: ${document.querySelectorAll('.server-entry').length}`;
    }

    function getEnabledHacks() {
        const hacks = [];
        if (document.getElementById('fly').checked) hacks.push('Fly');
        if (document.getElementById('fullbright').checked) hacks.push('Fullbright');
        if (document.getElementById('xray').checked) hacks.push('X-Ray');
        if (document.getElementById('nofall').checked) hacks.push('NoFall');
        if (document.getElementById('speed').checked) hacks.push('Speed');
        if (document.getElementById('killaura').checked) hacks.push('KillAura');
        return hacks;
    }
});

// Global functions for buttons
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
    updatePreview();  // Assuming updatePreview is accessible
}

function removeServer(btn) {
    btn.parentElement.remove();
    updatePreview();
}

async function buildClient() {
    // Collect settings (keep existing: opts, clientName, username, etc.)

    try {
        const response = await fetch('/base.html');  // Local static file
        let baseHTML = await response.text();

        // Patch with your config
        baseHTML = baseHTML
            .replace(/<title>.*?<\/title>/, `<title>${clientName}</title>`)
            .replace(/window\.eaglercraftXOpts\s*=\s*\{[\s\S]*?\};?/i, `window.eaglercraftXOpts = ${JSON.stringify(opts)};`)
            .replace(/"motd"\s*:\s*"[^"]*"/i, `"motd": "${motd.replace(/"/g, '\\"')}"`)
            .replace(/<body\b[^>]*>/i, `<body style="background-color: ${bgColor};">`)
            .replace(/("username"\s*:\s*)"[^"]*"/i, `$1"${username}"`)
            .replace(/("worldSeed"\s*:\s*)[0-9]*/i, `$1${seed || 0}`);

        // Download full modded client
        const blob = new Blob([baseHTML], { type: 'text/html;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${clientName.replace(/[^a-z0-9]/gi, '_')}.html`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        const sizeMB = (baseHTML.length / 1e6).toFixed(1);
        document.getElementById('output').innerHTML = `<p>✅ ${clientName}.html downloaded (${sizeMB}MB) – Full offline Eaglercraft 1.8 with your settings!</p>`;
        // Update clientCount...
    } catch (e) {
        document.getElementById('output').innerHTML = `<p>❌ Error loading base: ${e.message}. Ensure /base.html exists.</p>`;
    }
}
function updatePreview() {
    const name = document.getElementById('clientName').value || 'Custom Client';
    const sizeEl = document.getElementById('size');
    sizeEl.textContent = `${name} | Hacks: ${getEnabledHacks().join(', ')} | Servers: ${document.querySelectorAll('.server-entry').length}`;
}

function getEnabledHacks() {
    const hacks = [];
    if (document.getElementById('fly').checked) hacks.push('Fly');
    if (document.getElementById('fullbright').checked) hacks.push('Fullbright');
    if (document.getElementById('xray').checked) hacks.push('X-Ray');
    if (document.getElementById('nofall').checked) hacks.push('NoFall');
    if (document.getElementById('speed').checked) hacks.push('Speed');
    if (document.getElementById('killaura').checked) hacks.push('KillAura');
    return hacks;
}