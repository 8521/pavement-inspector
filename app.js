// App State
let state = {
    currentView: 'mainMenu', // mainMenu, newReport, pavementType, distressMenu, addDistress, viewReports
    reports: JSON.parse(localStorage.getItem('reports')) || [],
    currentReport: null,
    currentDistressData: null,
};

// Utils: Toast Notifications
function showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `<i class="fas fa-${type === 'success' ? 'check-circle' : 'info-circle'}"></i> <span>${message}</span>`;
    container.appendChild(toast);
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transition = 'opacity 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Save Data
function saveReports() {
    localStorage.setItem('reports', JSON.stringify(state.reports));
}

// Router
function navigateTo(view, params = {}) {
    state.currentView = view;
    render();
}

// Component Main Menu
function renderMainMenu() {
    return `
        <div class="view" style="justify-content: center;">
            <div class="glass-panel text-center">
                <div style="font-size: 48px; color: var(--accent-blue); margin-bottom: 16px;">
                    <i class="fas fa-road"></i>
                </div>
                <h1>ASTM D6433 Pavement Inspector</h1>
                <p style="margin-bottom: 32px;">Record inspections securely on device.</p>
                <button class="btn btn-primary" onclick="startNewReport()">
                    <i class="fas fa-plus"></i> Add New Report
                </button>
                <button class="btn btn-secondary" onclick="navigateTo('viewReports')">
                    <i class="fas fa-list"></i> See Existing Reports
                </button>
                <div style="margin-top: 16px;">
                    <button class="btn btn-outline" id="installBtn" style="display: none; background: rgba(16, 185, 129, 0.2); border-color: var(--accent-green); color: var(--accent-green);">
                        <i class="fas fa-download"></i> Install App
                    </button>
                    <button class="btn btn-outline" onclick="checkPwaStatus()" style="font-size: 12px; padding: 8px;">
                        <i class="fas fa-bug"></i> Run PWA Diagnostics
                    </button>
                </div>
            </div>
        </div>
    `;
}

// Actions
window.startNewReport = () => {
    state.currentReport = {
        id: Date.now().toString(),
        date: new Date().toISOString().split('T')[0],
        project: 'N/A',
        pavementType: null,
        distresses: []
    };
    navigateTo('newReport');
};

function renderNewReport() {
    return `
        <div class="view">
            <header class="app-header">
                <button class="back-btn" onclick="navigateTo('mainMenu')"><i class="fas fa-chevron-left"></i></button>
                <div class="header-title">New Report details</div>
            </header>
            <div class="glass-panel">
                <div class="form-group">
                    <label class="form-label">Date</label>
                    <input type="date" id="reportDate" class="form-control" value="${state.currentReport.date}">
                </div>
                <div class="form-group">
                    <label class="form-label">Project</label>
                    <input type="text" id="reportProject" class="form-control" value="${state.currentReport.project}">
                </div>
                
                <h2 style="margin-top: 32px; font-size: 16px;">Select Pavement Type</h2>
                <button class="btn btn-outline" onclick="selectPavement('Flexible')">
                    <i class="fas fa-layer-group"></i> Flexible Pavement (Asphalt)
                </button>
                <button class="btn btn-outline" onclick="selectPavement('Rigid')">
                    <i class="fas fa-th-large"></i> Rigid Pavement (Concrete)
                </button>
                <button class="btn btn-outline" onclick="selectPavement('Composite')">
                    <i class="fas fa-layer-group"></i> Composite Pavement
                </button>
            </div>
        </div>
    `;
}

window.selectPavement = (type) => {
    state.currentReport.date = document.getElementById('reportDate').value;
    state.currentReport.project = document.getElementById('reportProject').value;
    state.currentReport.pavementType = type;

    // Check if new report or not
    const existingIndex = state.reports.findIndex(r => r.id === state.currentReport.id);
    if (existingIndex === -1) {
        state.reports.push(state.currentReport);
    } else {
        state.reports[existingIndex] = state.currentReport;
    }
    saveReports();
    navigateTo('distressMenu');
};

function renderDistressMenu() {
    return `
        <div class="view">
            <header class="app-header">
                <button class="back-btn" onclick="navigateTo('newReport')"><i class="fas fa-chevron-left"></i></button>
                <div class="header-title">${state.currentReport.pavementType} Pavement</div>
            </header>
            <div class="glass-panel">
                <div style="margin-bottom: 24px;">
                    <h2 style="font-size: 18px; margin-bottom: 4px;">Project: ${state.currentReport.project}</h2>
                    <p>Total Distresses Recorded: ${state.currentReport.distresses.length}</p>
                </div>
                <button class="btn btn-primary" onclick="initAddDistress()">
                    <i class="fas fa-plus"></i> Add Distress
                </button>
                <button class="btn btn-secondary" onclick="navigateTo('viewDistresses')">
                    <i class="fas fa-edit"></i> Edit Recorded Distresses
                </button>
                <button class="btn btn-outline" style="margin-top: 24px;" onclick="finishReport()">
                    <i class="fas fa-check"></i> Finish Report
                </button>
            </div>
        </div>
    `;
}

window.finishReport = () => {
    showToast('Report saved successfully', 'success');
    navigateTo('mainMenu');
};

window.initAddDistress = () => {
    state.currentDistressData = {
        id: Date.now().toString(),
        type: '',
        severity: 'Low',
        density: '',
        deductValue: '',
        location: '',
        comments: '',
        photoUrl: null,
        timestamp: null,
        coords: null,
        bearing: null
    };
    navigateTo('addDistress');
};

function renderAddDistress() {
    const dTypes = (state.currentReport.pavementType === 'Flexible' || state.currentReport.pavementType === 'Composite') ?
        ['Alligator Cracking', 'Bleeding', 'Block Cracking', 'Bumps and Sags', 'Corrugation', 'Depression', 'Edge Cracking', 'Joint Reflection Cracking', 'Lane/Shoulder Drop-Off', 'Longitudinal and Transverse Cracking', 'Patching and Utility Cut Patching', 'Polished Aggregate', 'Potholes', 'Rutting', 'Shoving', 'Slippage Cracking', 'Swell', 'Weathering and Raveling'] :
        ['Blowup/Buckling', 'Corner Break', 'Divided Slab', 'Durability ("D") Cracking', 'Faulting', 'Joint Seal Damage', 'Lane/Shoulder Drop-Off', 'Linear Cracking', 'Patching, Large and Utility Cuts', 'Patching, Small', 'Polished Aggregate', 'Popouts', 'Pumping', 'Punchout', 'Railroad Crossing', 'Scaling, Map Cracking, and Crazing', 'Shrinkage Cracks', 'Spalling, Corner', 'Spalling, Joint'];

    return `
        <div class="view">
            <header class="app-header">
                <button class="back-btn" onclick="navigateTo('distressMenu')"><i class="fas fa-chevron-left"></i></button>
                <div class="header-title">Add Distress</div>
            </header>
            <div class="glass-panel">
                <div class="form-group">
                    <label class="form-label">Distress Type</label>
                    <select id="dType" class="form-control">
                        ${dTypes.map(t => `<option value="${t}">${t}</option>`).join('')}
                    </select>
                </div>
                <div class="form-group">
                    <label class="form-label">Severity</label>
                    <select id="dSeverity" class="form-control">
                        <option value="Low">Low (L)</option>
                        <option value="Medium">Medium (M)</option>
                        <option value="High">High (H)</option>
                    </select>
                </div>
                <div style="display: flex; gap: 12px;">
                    <div class="form-group" style="flex: 1;">
                        <label class="form-label">Density</label>
                        <input type="number" id="dDensity" class="form-control" placeholder="Qty">
                    </div>
                    <div class="form-group" style="flex: 1;">
                        <label class="form-label">Deduct Value</label>
                        <input type="number" id="dDV" class="form-control" placeholder="DV">
                    </div>
                </div>

                <div class="form-group">
                    <label class="form-label">Location</label>
                    <input type="text" id="dLocation" class="form-control" placeholder="Optional location detail">
                </div>
                
                <div class="form-group">
                    <label class="form-label">Other Comments</label>
                    <textarea id="dComments" class="form-control" rows="2" placeholder="Additional notes..."></textarea>
                </div>

                <div class="form-group">
                    <label class="form-label">Photo Evidence</label>
                    <input type="file" accept="image/*" capture="environment" id="cameraInput" style="display: none;" onchange="handlePhotoCapture(event)">
                    <div class="camera-container" id="photoPreview" onclick="document.getElementById('cameraInput').click()">
                        ${state.currentDistressData.photoUrl ? `<img src="${state.currentDistressData.photoUrl}" />` : '<i class="fas fa-camera" style="font-size: 40px; color: rgba(255,255,255,0.2);"></i>'}
                        <div class="camera-btn-overlay">
                            <i class="fas fa-camera"></i> ${state.currentDistressData.photoUrl ? 'Retake Photo' : 'Take Photo'}
                        </div>
                    </div>
                    <div id="photoMetadata" style="font-size: 12px; color: var(--text-secondary); margin-top: 8px;">
                        ${state.currentDistressData.coords ? `
                            <div>Lat: ${state.currentDistressData.coords.latitude.toFixed(6)} | Lon: ${state.currentDistressData.coords.longitude.toFixed(6)}</div>
                            <div>Bearing: ${state.currentDistressData.bearing !== null ? state.currentDistressData.bearing.toFixed(0) + '°' : 'N/A'}</div>
                            <div>Time: ${new Date(state.currentDistressData.timestamp).toLocaleTimeString()}</div>
                        ` : 'Take a photo to record GPS & Bearing.'}
                    </div>
                </div>

                <button class="btn btn-primary" onclick="saveDistress()">
                    <i class="fas fa-save"></i> Save Distress
                </button>
            </div>
        </div>
    `;
}

window.handlePhotoCapture = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    showToast('Processing photo...', 'info');

    const reader = new FileReader();
    reader.onload = (event) => {
        state.currentDistressData.photoUrl = event.target.result;
        state.currentDistressData.timestamp = new Date().toISOString();

        // Secure context check. Browsers block Sensor APIs on non-localhost HTTP
        if (window.isSecureContext === false && location.hostname !== 'localhost') {
            showToast('GPS/Bearing error: App must be accessed via HTTPS.', 'info');
            finishPhotoCapture();
            return;
        }

        // Try getting GPS
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    const { latitude, longitude } = pos.coords;
                    state.currentDistressData.coords = { latitude, longitude };

                    // Bearing requires HTTPS
                    if (window.DeviceOrientationEvent && typeof window.DeviceOrientationEvent.requestPermission === 'function') {
                        DeviceOrientationEvent.requestPermission()
                            .then(permissionState => {
                                if (permissionState === 'granted') {
                                    window.addEventListener('deviceorientation', setBearing, { once: true });
                                    setTimeout(() => { if (state.currentDistressData.bearing === null) finishPhotoCapture(); }, 2000);
                                } else {
                                    showToast('Compass permission denied.', 'info');
                                    finishPhotoCapture();
                                }
                            })
                            .catch((err) => {
                                console.error('Device orientation error', err);
                                finishPhotoCapture();
                            });
                    } else if ('ondeviceorientationabsolute' in window) {
                        window.addEventListener('deviceorientationabsolute', function absListener(e) {
                            window.removeEventListener('deviceorientationabsolute', absListener);
                            state.currentDistressData.bearing = e.alpha ? Math.abs(360 - e.alpha) : 0;
                            finishPhotoCapture();
                        });
                        setTimeout(() => { if (state.currentDistressData.bearing === null) finishPhotoCapture(); }, 2000);
                    } else {
                        window.addEventListener('deviceorientation', setBearing, { once: true });
                        setTimeout(() => { if (state.currentDistressData.bearing === null) finishPhotoCapture(); }, 2000);
                    }
                },
                (err) => {
                    console.error('GPS Error', err);
                    showToast('GPS Error: Please enable location access.', 'info');
                    finishPhotoCapture();
                },
                { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
            );
        } else {
            showToast('Geolocation not supported.', 'info');
            finishPhotoCapture();
        }
    };
    reader.readAsDataURL(file);
};

const setBearing = (e) => {
    let compassHeading = e.webkitCompassHeading; // iOS
    if (!compassHeading && e.alpha !== null && e.alpha !== undefined) {
        compassHeading = Math.abs(e.alpha - 360); // Android fallback
    }
    state.currentDistressData.bearing = compassHeading ? Math.round(compassHeading) : 0;
    finishPhotoCapture();
};

const finishPhotoCapture = () => {
    // Re-render to show image and metadata
    // We shouldn't wipe out form inputs, so we manually update DOM instead of full render if possible
    // For simplicity of this basic architecture, I'll update the specific DOM elements
    document.getElementById('photoPreview').innerHTML = `
        <img src="${state.currentDistressData.photoUrl}" />
        <div class="camera-btn-overlay">
            <i class="fas fa-camera"></i> Retake Photo
        </div>
    `;

    let metaHtml = `<div>Time: ${new Date(state.currentDistressData.timestamp).toLocaleTimeString()}</div>`;
    if (state.currentDistressData.coords) {
        metaHtml += `<div>Lat: ${state.currentDistressData.coords.latitude.toFixed(6)} | Lon: ${state.currentDistressData.coords.longitude.toFixed(6)}</div>`;
    }
    if (state.currentDistressData.bearing !== null) {
        metaHtml += `<div>Bearing: ${state.currentDistressData.bearing.toFixed(0)}°</div>`;
    }
    document.getElementById('photoMetadata').innerHTML = metaHtml;

    showToast('Photo captured successfully', 'success');
};

window.saveDistress = () => {
    state.currentDistressData.type = document.getElementById('dType').value;
    state.currentDistressData.severity = document.getElementById('dSeverity').value;
    state.currentDistressData.density = document.getElementById('dDensity').value;
    state.currentDistressData.deductValue = document.getElementById('dDV').value;
    state.currentDistressData.location = document.getElementById('dLocation').value;
    state.currentDistressData.comments = document.getElementById('dComments').value;

    state.currentReport.distresses.push(state.currentDistressData);

    // Save to local storage
    const existingIndex = state.reports.findIndex(r => r.id === state.currentReport.id);
    if (existingIndex !== -1) {
        state.reports[existingIndex] = state.currentReport;
    }
    saveReports();

    showToast('Distress saved');
    navigateTo('distressMenu');
};

function renderViewReports() {
    return `
        <div class="view">
            <header class="app-header">
                <button class="back-btn" onclick="navigateTo('mainMenu')"><i class="fas fa-chevron-left"></i></button>
                <div class="header-title">Existing Reports</div>
            </header>
            <div class="glass-panel" style="padding: 16px;">
                ${state.reports.length === 0 ? '<p class="text-center" style="text-align:center; padding: 24px;">No reports yet.</p>' : ''}
                ${state.reports.map(r => `
                    <div class="report-item" onclick="openReport('${r.id}')">
                        <div>
                            <div style="font-weight: 600; font-size: 16px;">${r.project || 'Unnamed Project'}</div>
                            <div style="font-size: 12px; color: var(--text-secondary); margin-top: 4px;">
                                ${r.date} &bull; ${r.pavementType} &bull; ${r.distresses.length} Distresses
                            </div>
                        </div>
                        <i class="fas fa-chevron-right" style="color: var(--text-secondary);"></i>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}

window.openReport = (id) => {
    state.currentReport = state.reports.find(r => r.id === id);
    navigateTo('distressMenu');
};

function renderViewDistresses() {
    return `
        <div class="view">
            <header class="app-header">
                <button class="back-btn" onclick="navigateTo('distressMenu')"><i class="fas fa-chevron-left"></i></button>
                <div class="header-title">Edit Distresses</div>
            </header>
            <div class="glass-panel" style="padding: 16px;">
                ${state.currentReport.distresses.length === 0 ? '<p class="text-center" style="text-align:center; padding: 24px;">No distresses recorded yet.</p>' : ''}
                ${state.currentReport.distresses.map((d, index) => `
                    <div class="report-item" style="flex-direction: column; align-items: flex-start;">
                        <div style="display: flex; justify-content: space-between; width: 100%; margin-bottom: 8px;">
                            <div style="font-weight: 600;">${d.type}</div>
                            <button style="background: none; border:none; color: var(--accent-red); cursor:pointer;" onclick="deleteDistress(${index})">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                        <div style="font-size: 13px; color: var(--text-secondary);">
                            Sev: ${d.severity} &bull; Den: ${d.density} &bull; DV: ${d.deductValue}
                            ${d.location ? `<br><i class="fas fa-map-marker-alt" style="font-size: 11px;"></i> Location: ${d.location}` : ''}
                            ${d.comments ? `<br><i class="fas fa-comment-alt" style="font-size: 11px;"></i> Comments: ${d.comments}` : ''}
                        </div>
                        ${d.photoUrl ? `
                            <div style="margin-top: 12px; display:flex; gap: 12px; align-items: center;">
                                <img src="${d.photoUrl}" style="width: 60px; height: 60px; border-radius: 8px; object-fit: cover;" />
                                <div style="font-size: 11px; color: var(--text-secondary);">
                                    ${d.coords ? `Lat: ${d.coords.latitude.toFixed(6)} Lon: ${d.coords.longitude.toFixed(6)}<br>` : ''}
                                    ${d.bearing !== null ? `Brg: ${d.bearing.toFixed(0)}°<br>` : ''}
                                    Time: ${d.timestamp ? new Date(d.timestamp).toLocaleTimeString() : 'N/A'}
                                </div>
                            </div>
                        ` : ''}
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}

window.deleteDistress = (index) => {
    if (confirm('Delete this distress record?')) {
        state.currentReport.distresses.splice(index, 1);
        saveReports();
        render(); // re-render list
        showToast('Distress deleted');
    }
};

// Main Render Logic
function render() {
    const app = document.getElementById('app');
    switch (state.currentView) {
        case 'mainMenu': app.innerHTML = renderMainMenu(); break;
        case 'newReport': app.innerHTML = renderNewReport(); break;
        case 'distressMenu': app.innerHTML = renderDistressMenu(); break;
        case 'addDistress': app.innerHTML = renderAddDistress(); break;
        case 'viewReports': app.innerHTML = renderViewReports(); break;
        case 'viewDistresses': app.innerHTML = renderViewDistresses(); break;
        default: app.innerHTML = renderMainMenu();
    }
}

// --- PWA Installation & Diagnostic Logic ---
let deferredPrompt;

window.addEventListener('beforeinstallprompt', (e) => {
    // Prevent the mini-infobar from appearing on mobile
    e.preventDefault();
    // Stash the event so it can be triggered later.
    deferredPrompt = e;

    // Show our custom install button
    const installBtn = document.getElementById('installBtn');
    if (installBtn) {
        installBtn.style.display = 'flex';
        installBtn.onclick = async () => {
            if (deferredPrompt !== null) {
                deferredPrompt.prompt();
                const { outcome } = await deferredPrompt.userChoice;
                if (outcome === 'accepted') {
                    console.log('User accepted the install prompt');
                }
                deferredPrompt = null;
                installBtn.style.display = 'none';
            }
        };
    }
});

window.checkPwaStatus = () => {
    let msg = "Diagnostics:\\n";
    if (window.isSecureContext) msg += "✅ Secure Context (HTTPS/localhost)\\n";
    else msg += "❌ NOT Secure Context (HTTPS required)\\n";

    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) msg += "✅ Service Worker Active\\n";
    else msg += "❌ Service Worker NOT Active\\n";

    msg += deferredPrompt ? "✅ Install Prompt ready" : "❌ Install Prompt NOT ready (either already installed or manifest failed)";

    alert(msg);
};

// Init
window.addEventListener('DOMContentLoaded', () => {
    // If returning app logic
    render();
});
