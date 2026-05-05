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

function buildClient() {
    const clientName = document.getElementById('clientName').value || 'Custom Eaglercraft Client';
    const username = document.getElementById('username').value;
    const seed = document.getElementById('seed').value;
    const bgColor = document.getElementById('bgColor').value;
    const motd = document.getElementById('motd').value;
    const texturePack = document.getElementById('texturePack').value;

    // Hacks config
    const hacks = {
        fly: document.getElementById('fly').checked,
        fullbright: document.getElementById('fullbright').checked,
        xray: document.getElementById('xray').checked,
        nofall: document.getElementById('nofall').checked,
        speed: document.getElementById('speed').checked,
        killaura: document.getElementById('killaura').checked ? parseInt(document.getElementById('killauraRange').value) : 0
    };

    // Servers
    const servers = [];
    document.querySelectorAll('.server-entry').forEach(entry => {
        const name = entry.querySelector('input[type="text"]:nth-child(1)').value;
        const url = entry.querySelector('input[type="text"]:nth-child(2)').value;
        if (name && url) servers.push({ name, url });
    });

    // Eaglercraft opts
    const opts = {
        aset: texturePack || 'default',
        servers: servers,
        defaultServer: servers[0]?.url || '',
        motd: motd,
        username: username,
        seed: seed || 0,
        hacks: hacks,
        style: { backgroundColor: bgColor }
    };

    // Generate HTML client
    const clientHTML = `<!DOCTYPE html>
<html>
<head>
    <title>${clientName}</title>
    <style>body { background-color: ${bgColor}; }</style>
</head>
<body>
    <div id="motd" style="color: white; text-align: center;">${motd || 'Welcome to ${clientName}'}</div>
    <script>
        window.eaglercraftXOpts = ${JSON.stringify(opts)};
        // Add Eaglercraft 1.8 JS here (e.g., from 3kh0/eaglercraft-builds)
        alert('Client ready! Add Eaglercraft assets for full play.');
    <\/script>
</body>
</html>`;

    // Download
    const blob = new Blob([clientHTML], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${clientName}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    // Stats
    let count = parseInt(document.getElementById('clientCount').textContent) + 1;
    document.getElementById('clientCount').textContent = count;
    localStorage.setItem('clientCount', count);

    document.getElementById('output').innerHTML = `<p>Downloaded ${clientName}.html (${new Blob([clientHTML]).size} bytes)</p>`;
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