// builder.js - Perfect match for your index.html
// Fetches /base.html → Mods copy → Downloads → Base stays pristine

document.addEventListener('DOMContentLoaded', function() {
    // Live preview
    ['clientName', 'username', 'seed', 'fly', 'fullbright', 'xray', 'nofall', 'speed', 'killaura', 'killauraRange', 
     'bgColor', 'motd', 'texturePack'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.addEventListener('input', updatePreview);
    });
    
    // Buttons
    document.getElementById('download').textContent = 'Generate Client File';
    updatePreview();
    
    // Global functions
    window.addServer = addServer;
    window.removeServer = removeServer;
    window.buildClient = buildClient;
});

function updatePreview() {
    const name = document.getElementById('clientName').value || 'Custom Client';
    const hacks = getEnabledHacks();
    const servers = document.querySelectorAll('.server-entry').length;
    document.getElementById('preview-content').innerHTML = `
        ${name}<br>
        <small>${hacks.join(', ') || 'No hacks'} | ${servers} server${servers !== 1 ? 's' : ''}</small>
    `;
}

function getEnabledHacks() {
    return ['fly', 'fullbright', 'xray', 'nofall', 'speed', 'killaura']
        .filter(id => document.getElementById(id).checked)
        .map(id => id.charAt(0).toUpperCase() + id.slice(1));
}

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

function removeServer(button) {
    button.parentElement.remove();
    updatePreview();
}

// 🔥 MAIN BUILD FUNCTION
async function buildClient() {
    const output = document.getElementById('output');
    const downloadBtn = document.getElementById('download');
    
    output.innerHTML = '<div style="color: #ffa500;">🔄 Building custom client...</div>';
    downloadBtn.disabled = true;
    downloadBtn.textContent = 'Building...';

    try {
        // Collect ALL settings
        const clientName = (document.getElementById('clientName').value || 'Eaglercraft').replace(/[^a-zA-Z0-9_-]/g, '');
        const username = document.getElementById('username').value || 'Player';
        const seed = parseInt(document.getElementById('seed').value) || 12345;
        const bgColor = document.getElementById('bgColor').value;
        const motd = document.getElementById('motd').value || `${clientName} Client`;
        const texturePack = document.getElementById('texturePack').value || '';
        const killauraRange = parseInt(document.getElementById('killauraRange').value) || 3;

        const hacks = {
            fly: document.getElementById('fly').checked,
            fullbright: document.getElementById('fullbright').checked,
            xray: document.getElementById('xray').checked,
            nofall: document.getElementById('nofall').checked,
            speed: document.getElementById('speed').checked,
            killaura: document.getElementById('killaura').checked ? killauraRange : 0
        };

        const servers = Array.from(document.querySelectorAll('.server-entry')).map(entry => {
            const inputs = entry.querySelectorAll('input');
            const name = inputs[0]?.value.trim();
            const url = inputs[1]?.value.trim();
            