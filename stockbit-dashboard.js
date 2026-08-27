(function() {
    // 1. KONFIGURASI TARGET SCREENER & GOOGLE APPS SCRIPT (GAS)
    const SCREENER_CONFIGS = {
        "FINAL BPJS - ONE DAY TRADE": {
            sheet: "SC",
            startCol: "T",
            gasUrl: "https://script.google.com/macros/s/AKfycbz_GANTI_DENGAN_URL_GAS_LU/exec"
        },
        "BD SANGKUT": {
            sheet: "SC",
            startCol: "AA",
            gasUrl: "https://script.google.com/macros/s/AKfycbz_GANTI_DENGAN_URL_GAS_LU/exec"
        },
        "REMORA": {
            sheet: "SC",
            startCol: "AH",
            gasUrl: "https://script.google.com/macros/s/AKfycbz_GANTI_DENGAN_URL_GAS_LU/exec"
        },
        "SIDEWAYS 1": {
            sheet: "SC",
            startCol: "AO",
            gasUrl: "https://script.google.com/macros/s/AKfycbz_GANTI_DENGAN_URL_GAS_LU/exec"
        },
        "SIDEWAYS 2": {
            sheet: "SC",
            startCol: "AV",
            gasUrl: "https://script.google.com/macros/s/AKfycbz_GANTI_DENGAN_URL_GAS_LU/exec"
        }
    };

    // Toggle Dashboard Overlay
    if (document.getElementById('sb-full-dashboard')) {
        document.getElementById('sb-full-dashboard').remove();
        return;
    }

    // 2. CREATE FULLSCREEN OVERLAY UI
    const overlay = document.createElement('div');
    overlay.id = 'sb-full-dashboard';
    overlay.style = `
        position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
        background: rgba(10, 14, 23, 0.95); backdrop-filter: blur(10px);
        z-index: 999999; color: #e2e8f0; font-family: 'Inter', system-ui, sans-serif;
        overflow-y: auto; padding: 40px 20px; box-sizing: border-box;
    `;

    overlay.innerHTML = `
        <div style="max-width: 1100px; margin: 0 auto;">
            
            <!-- HEADER SECTION -->
            <div style="background: #111827; border: 1px solid #1f2937; border-radius: 16px; padding: 24px; display: flex; justify-content: space-between; align-items: center; box-shadow: 0 10px 30px rgba(0,0,0,0.5);">
                <div>
                    <div style="display: flex; align-items: center; gap: 12px;">
                        <div style="background: #059669; padding: 8px; border-radius: 10px; display: flex;">⚡</div>
                        <h1 style="margin: 0; font-size: 22px; font-weight: 700; color: #fff;">STOCKBIT TOOLS <span style="font-size: 12px; font-weight: normal; color: #10b981; background: rgba(16,185,129,0.1); padding: 4px 8px; border-radius: 20px;">v2.0 Injected</span></h1>
                    </div>
                    <p style="margin: 8px 0 0 0; color: #9ca3af; font-size: 13px;">Stockbit Scraper & Automation Management Dashboard Overlay</p>
                </div>
                <button onclick="document.getElementById('sb-full-dashboard').remove()" style="background: #ef4444; color: #fff; border: none; padding: 10px 20px; border-radius: 10px; font-weight: 600; cursor: pointer; transition: 0.2s;">✕ Tutup Dashboard</button>
            </div>

            <!-- DASHBOARD CARDS GRID -->
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 20px; margin-top: 30px;">
                
                <!-- CARD 1: SCREENER AUTOMATION -->
                <div class="dash-card">
                    <div class="card-header">
                        <span class="card-icon">📊</span>
                        <div>
                            <h3 class="card-title">SCREENER AUTOMATION</h3>
                            <span class="card-badge">01</span>
                        </div>
                    </div>
                    <p class="card-desc">Modul penarik data 5 preset Screener Stockbit secara otomatis & dispatch ke GSheets.</p>
                    <div style="display: flex; flex-direction: column; gap: 8px; margin-top: 15px;">
                        <button class="action-btn" onclick="runScreenerAutomation('FINAL BPJS - ONE DAY TRADE')">🔥 FINAL BPJS - ONE DAY TRADE</button>
                        <button class="action-btn" onclick="runScreenerAutomation('BD SANGKUT')">⚡ BD SANGKUT</button>
                        <button class="action-btn" onclick="runScreenerAutomation('REMORA')">🦈 REMORA</button>
                        <button class="action-btn" onclick="runScreenerAutomation('SIDEWAYS 1')">📈 SIDEWAYS 1</button>
                        <button class="action-btn" onclick="runScreenerAutomation('SIDEWAYS 2')">📉 SIDEWAYS 2</button>
                    </div>
                </div>

                <!-- CARD 2: BROKER ANALYSIS -->
                <div class="dash-card">
                    <div class="card-header">
                        <span class="card-icon">🔍</span>
                        <div>
                            <h3 class="card-title">BROKER ANALYSIS</h3>
                            <span class="card-badge">02</span>
                        </div>
                    </div>
                    <p class="card-desc">Automasi pencarian kode saham & scraping akum/distribusi Top Broker.</p>
                    <div style="margin-top: 15px;">
                        <input type="text" id="ba-input" placeholder="Kode Saham (cth: BBCA, BMRI)" class="dash-input">
                        <button class="action-btn-primary" style="margin-top: 10px; width: 100%;" onclick="updateLog('Modul 02 belum diaktifkan', 'warning')">🚀 Scrape Broker Analysis</button>
                    </div>
                </div>

                <!-- CARD 3: BROKER ACTIVITY -->
                <div class="dash-card">
                    <div class="card-header">
                        <span class="card-icon">📅</span>
                        <div>
                            <h3 class="card-title">BROKER ACTIVITY</h3>
                            <span class="card-badge">03</span>
                        </div>
                    </div>
                    <p class="card-desc">Fetch data transaksi broker berdasarkan Date Range yang ditentukan.</p>
                    <div style="margin-top: 15px;">
                        <label style="font-size: 11px; color: #9ca3af;">Start Date:</label>
                        <input type="date" id="act-start" class="dash-input" style="margin-bottom: 8px;">
                        <label style="font-size: 11px; color: #9ca3af;">End Date:</label>
                        <input type="date" id="act-end" class="dash-input">
                        <button class="action-btn-primary" style="margin-top: 10px; width: 100%; background: #f59e0b;" onclick="updateLog('Modul 03 belum diaktifkan', 'warning')">🚀 Fetch Broker Activity</button>
                    </div>
                </div>

            </div>

            <!-- STATUS LOG -->
            <div id="dash-log" style="margin-top: 25px; background: #111827; border: 1px solid #1f2937; padding: 15px; border-radius: 12px; color: #10b981; font-size: 13px;">
                System Status: Dashboard Ready.
            </div>

        </div>
    `;

    document.body.appendChild(overlay);

    // INJECT STYLES
    const style = document.createElement('style');
    style.innerHTML = `
        .dash-card { background: #111827; border: 1px solid #1f2937; border-radius: 16px; padding: 20px; display: flex; flex-direction: column; justify-content: space-between; }
        .card-header { display: flex; justify-content: space-between; align-items: center; }
        .card-icon { font-size: 24px; background: #1f2937; padding: 8px; border-radius: 10px; }
        .card-title { margin: 0; font-size: 15px; font-weight: 700; color: #f3f4f6; }
        .card-badge { font-size: 11px; color: #3b82f6; background: rgba(59,130,246,0.1); padding: 2px 8px; border-radius: 10px; font-weight: bold; }
        .card-desc { font-size: 12px; color: #9ca3af; margin-top: 10px; line-height: 1.4; }
        .dash-input { width: 100%; padding: 10px; background: #1f2937; border: 1px solid #374151; border-radius: 8px; color: #fff; box-sizing: border-box; }
        .action-btn { width: 100%; padding: 10px; background: #1f2937; border: 1px solid #374151; color: #e5e7eb; border-radius: 8px; text-align: left; cursor: pointer; font-size: 12px; font-weight: 600; }
        .action-btn:hover { background: #374151; border-color: #3b82f6; color: #fff; }
        .action-btn-primary { padding: 10px; background: #10b981; color: #fff; border: none; border-radius: 8px; font-weight: bold; cursor: pointer; }
    `;
    document.head.appendChild(style);

    // 3. LOG HELPER
    window.updateLog = function(message, type = 'info') {
        const logEl = document.getElementById('dash-log');
        if (!logEl) return;
        
        let color = '#10b981'; // Green (Success/Info)
        if (type === 'warning') color = '#f59e0b';
        if (type === 'error') color = '#ef4444';

        logEl.style.color = color;
        logEl.innerText = `[${new Date().toLocaleTimeString()}] Status: ${message}`;
    };

    // 4. LOGIKA SCRAPING & AUTOMATION SCREENER (MODUL 01)
    window.runScreenerAutomation = async function(presetName) {
        const config = SCREENER_CONFIGS[presetName];
        if (!config) {
            updateLog(`Konfigurasi untuk preset "${presetName}" tidak ditemukan!`, 'error');
            return;
        }

        updateLog(`Mulai proses scraping untuk preset: ${presetName}...`, 'info');

        // Buka temporary overlay agar user bisa melihat animasi tabel dibaca
        document.getElementById('sb-full-dashboard').style.display = 'none';

        try {
            // A. Ambil tabel dari DOM Stockbit Screener
            const tableContainer = document.querySelector('.ant-table-content table') || document.querySelector('table');
            if (!tableContainer) {
                document.getElementById('sb-full-dashboard').style.display = 'block';
                updateLog("Tabel Stockbit tidak ditemukan pada halaman ini. Pastikan lu sedang di menu Screener!", 'error');
                return;
            }

            // B. Scraping Headers & Rows Data
            const rows = Array.from(tableContainer.querySelectorAll('tr'));
            if (rows.length === 0) {
                document.getElementById('sb-full-dashboard').style.display = 'block';
                updateLog("Tabel screener kosong / data belum di-load oleh Stockbit.", 'warning');
                return;
            }

            const scrapedData = [];
            rows.forEach((row) => {
                const cells = Array.from(row.querySelectorAll('th, td')).map(c => c.innerText.trim());
                if (cells.length > 0) {
                    scrapedData.push(cells);
                }
            });

            // Tampilkan kembali overlay
            document.getElementById('sb-full-dashboard').style.display = 'block';
            updateLog(`Data berhasil di-scrape (${scrapedData.length} baris). Mengirim ke Google Sheets...`, 'info');

            // C. Dispatch Data ke Google Apps Script (GAS)
            const payload = {
                presetName: presetName,
                sheetName: config.sheet,
                startColumn: config.startCol,
                data: scrapedData
            };

            const response = await fetch(config.gasUrl, {
                method: 'POST',
                mode: 'no-cors', // Mencegah terblokir CORS pada Webhook GAS
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            updateLog(`✅ Berhasil! Data preset [${presetName}] telah dikirim ke Sheet: ${config.sheet} (Kolom ${config.startCol}).`, 'info');

        } catch (err) {
            document.getElementById('sb-full-dashboard').style.display = 'block';
            updateLog(`❌ Gagal mengeksekusi automation: ${err.message}`, 'error');
        }
    };

})();
