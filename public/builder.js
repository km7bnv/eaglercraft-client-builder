// builder.js - Eaglercraft Client Builder (v2.0 - Read-Only Base + Local Splash)
// Features: Safe base.html handling, Local image embedding, Robust error handling.

document.addEventListener('DOMContentLoaded', function() {
    // 1. Initialize Live Preview Listeners
    const previewIds = [
        'clientName', 'username', 'seed', 'fly', 'fullbright', 'xray', 
        'nofall', 'speed', 'killaura', 'killauraRange', 'bgColor', 
        'motd', 'splashText', 'texturePack', 'splashImage'
    ];

    previewIds.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            if (id === 'killauraRange') {
                el.addEventListener('input', () => {
                    const display = document.getElementById('rangeDisplay');
                    if (display) display.textContent = el.value;
                    updatePreview();
                });
            } else {
                el.addEventListener('input', updatePreview);
            }
        }
    });

    // 2. Expose global functions
    window.addServer = addServer;
    window.removeServer = removeServer;
    window.buildClient = buildClient;

    // 3. Initial Setup
    updatePreview();
    updateStats();
    
    const btn = document.getElementById('download');
    if (btn) btn.textContent = '🚀 Generate & Download Client File';
});

/**
 * Updates the live preview pane
 */
function updatePreview() {
    const nameEl = document.getElementById('clientName');
    const motdEl = document.getElementById('motd');
    const previewContent = document.getElementById('preview-content');

    if (!nameEl || !previewContent) return;

    const name = nameEl.value || 'Custom Client';
    const hacks = getEnabledHacks();
    const servers = document.querySelectorAll('.server-entry').length;
    
    let motd = motdEl ? motdEl.value : 'Custom Eaglercraft';
    if (motd.length > 30) motd = motd.substring(0, 30) + '...';

    previewContent.innerHTML = `
        <strong>${escapeHtml(name)}</strong><br>
        <small>
            ${hacks.length > 0 ? hacks.join(', ') : 'No hacks enabled'} • 
            ${servers} server${servers !== 1 ? 's' : ''} • 
            ${escapeHtml(motd)}
        </small>
    `;
}

/**
 * Returns an array of enabled hack names
 */
function getEnabledHacks() {
    const hackIds = ['fly', 'fullbright', 'xray', 'nofall', 'speed', 'killaura'];
    return hackIds
        .filter(id => {
            const el = document.getElementById(id);
            return el && el.checked;
        })
        .map(id => id.charAt(0).toUpperCase() + id.slice(1));
}

/**
 * Adds a new server entry
 */
function addServer() {
    const serverList = document.getElementById('serverList');
    if (!serverList) return;

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

/**
 * Removes a server entry
 */
function removeServer(btn) {
    if (btn && btn.parentElement) {
        btn.parentElement.remove();
        updatePreview();
    }
}

/**
 * Updates the client count stat
 */
function updateStats() {
    const count = parseInt(localStorage.getItem('clientCount') || 0);
    const el = document.getElementById('clientCount');
    if (el) el.textContent = count;
}

/**
 * Helper to escape HTML to prevent XSS in preview
 */
function escapeHtml(text) {
    if (!text) return '';
    return text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

/**
 * Converts a local file input to Base64 string
 */
function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
        reader.readAsDataURL(file);
    });
}

// 🔥 MAIN BUILD FUNCTION (Read-Only Base + Local Splash)
async function buildClient() {
    const output = document.getElementById('output');
    const downloadBtn = document.getElementById('download');
    
    output.style.display = 'block';
    output.className = '';
    downloadBtn.disabled = true;
    downloadBtn.textContent = 'Building...';
    output.innerHTML = '🔄 Initializing build process...';

    try {
        // 1. Collect Settings
        const clientName = document.getElementById('clientName').value.replace(/[^a-zA-Z0-9_-]/g, '') || 'Client';
        const username = document.getElementById('username').value || 'Player';
        const seed = parseInt(document.getElementById('seed').value) || 12345;
        const bgColor = document.getElementById('bgColor').value;
        const motd = document.getElementById('motd').value || 'Custom Client';
        const splashText = document.getElementById('splashText').value || 'Ready!';
        const texturePack = document.getElementById('texturePack').value;
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
            return {
                name: inputs[0].value.trim(),
                url: inputs[1].value.trim()
            };
        }).filter(s => s.name && s.url);

        // 2. Handle Local Splash Image
        let splashImageBase64 = null;
        const splashFileInput = document.getElementById('splashImage');
        if (splashFileInput && splashFileInput.files.length > 0) {
            output.innerHTML += '\n🖼️ Processing local splash image...';
            try {
                splashImageBase64 = await fileToBase64(splashFileInput.files[0]);
                output.innerHTML += '✅ Image embedded.';
            } catch (err) {
                console.warn('Failed to load image:', err);
                output.innerHTML += '\n⚠️ Warning: Could not load image, proceeding without it.';
            }
        }

        const config = {
            title: clientName,
            motd: motd,
            username: username,
            seed: seed,
            servers: servers,
            assets: texturePack,
            backgroundColor: bgColor,
            splash: splashText,
            splashImage: splashImageBase64, // New field for embedded image
            cheatsEnabled: true,
            cheats: hacks
        };

        output.innerHTML += '\n✅ Settings collected.';

        // 3. Fetch base.html (READ ONLY)
        // Try root first, then /public
        let baseUrl = '/base.html';
        let res = await fetch(baseUrl);
        
        if (!res.ok) {
            baseUrl = '/public/base.html';
            res = await fetch(baseUrl);
        }

        if (!res.ok) {
            throw new Error(`Could not find base.html at ${baseUrl}. \nEnsure 'base.html' exists in your 'public' folder and you are running a local server.`);
        }

        let html = await res.text();
        output.innerHTML += '\n✅ base.html loaded (Read-Only).';

        // 4. Parse and Inject
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');

        // Create the config script
        const script = doc.createElement('script');
        script.type = 'text/javascript';
        script.textContent = `
            // Eaglercraft Config Injection
            window.eaglerConfig = ${JSON.stringify(config)};
            console.log("🎮 ${clientName} Config Loaded:", window.eaglerConfig);
            
            // Force background color immediately
            document.addEventListener('DOMContentLoaded', () => {
                setTimeout(() => {
                    document.body.style.backgroundColor = '${bgColor}';
                }, 100);
            });
        `;

        // Inject at the VERY TOP of head to ensure config is ready before game init
        if (doc.head) {
            doc.head.insertBefore(script, doc.head.firstChild);
        } else {
            const newHead = doc.createElement('head');
            newHead.appendChild(script);
            doc.documentElement.prepend(newHead);
        }

        // Update Title
        doc.title = `${clientName} - ${splashText}`;

        // Reconstruct HTML
        const finalHtml = '<!DOCTYPE html>\n' + doc.documentElement.outerHTML;

        // 5. Download
        const blob = new Blob([finalHtml], {type: 'text/html;charset=utf-8'});
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${clientName}_Eagler18.html`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        // 6. Success Message
        output.className = 'success';
        const hacksList = getEnabledHacks().join(', ') || 'None';
        const imgStatus = splashImageBase64 ? '✅ Custom Splash' : '❌ Default Splash';
        
        output.innerHTML = `
            <strong>✅ Build Successful!</strong><br><br>
            📄 File: <code>${clientName}_Eagler18.html</code><br>
            🛠️ Size: ${(finalHtml.length / 1024).toFixed(0)} KB<br>
            ⚡ Hacks: ${hacksList}<br>
            🌐 Servers: ${servers.length}<br>
            🖼️ Splash: ${imgStatus}<br><br>
            <em>Original base.html is UNTOUCHED.<br>
            Open the downloaded file in a browser to test.</em>
        `;

        // Update Stats
        const count = (parseInt(localStorage.getItem('clientCount') || 0) + 1);
        localStorage.setItem('clientCount', count);
        document.getElementById('clientCount').textContent = count;
        document.getElementById('stats').innerHTML = `Clients built: <strong>${count}</strong>`;

    } catch (e) {
        console.error(e);
        output.className = 'error';
        output.innerHTML = `❌ <strong>Error:</strong> ${e.message}`;
    } finally {
        downloadBtn.disabled = false;
        downloadBtn.textContent = '🚀 Generate & Download Client File';
    }
}