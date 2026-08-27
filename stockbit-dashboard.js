(function() {
    // 1. MAPPING KONFIGURASI SCREENER & DELEGASI GAS
    const SCREENER_CONFIGS = {
        "FINAL BPJS - ONE DAY TRADE": {
            targetName: "FINAL BPJS - ONE DAY TR...",
            sheet: "SC",
            startCol: "T",
            gasUrl: "https://script.google.com/macros/s/AKfycbz_GANTI_DENGAN_URL_GAS_LU/exec"
        },
        "BD SANGKUT": {
            targetName: "BD - SANGKUT & AKUM",
            sheet: "SC",
            startCol: "AA",
            gasUrl: "https://script.google.com/macros/s/AKfycbz_GANTI_DENGAN_URL_GAS_LU/exec"
        },
        "REMORA": {
            targetName: "REMORA - SIAP NAIK CEPAT",
            sheet: "SC",
            startCol: "AH",
            gasUrl: "https://script.google.com/macros/s/AKfycbz_GANTI_DENGAN_URL_GAS_LU/exec"
        },
        "SIDEWAYS 1": {
            targetName: "SIDEWAYS SCREENER V1",
            sheet: "SC",
            startCol: "AO",
            gasUrl: "https://script.google.com/macros/s/AKfycbz_GANTI_DENGAN_URL_GAS_LU/exec"
        },
        "SIDEWAYS 2": {
            targetName: "SIDEWAYS SCREENER V2",
            sheet: "SC",
            startCol: "AV",
            gasUrl: "https://script.google.com/macros/s/AKfycbz_GANTI_DENGAN_URL_GAS_LU/exec"
        }
    };

    // Buffer Sementara Data Scraped Sebelum Didelegasikan/Export
    window.currentScrapedData = null;
    window.currentPresetKey = null;

    // Toggle Dashboard UI Overlay
    if (document.getElementById('sb-full-dashboard')) {
        document.getElementById('sb-full-dashboard').remove();
        return;
    }

    // 2. BUILD OVERLAY UI
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
            
            <!-- HEADER -->
            <div style="background: #111827; border: 1px solid #1f2937; border-radius: 16px; padding: 24px; display: flex; justify-content: space-between; align-items: center; box-shadow: 0 10px 30px rgba(0,0,0,0.5);">
                <div>
                    <div style="display: flex; align-items: center; gap: 12px;">
                        <div style="background: #059669; padding: 8px; border-radius: 10px; display: flex;">⚡</div>
                        <h1 style="margin: 0; font-size: 22px; font-weight: 700; color: #fff;">STOCKBIT TOOLS <span style="font-size: 12px; font-weight: normal; color: #10b981; background: rgba(16,185,129,0.1); padding: 4px 8px; border-radius: 20px;">v3.2 Interactive Preview</span></h1>
                    </div>
                    <p style="margin: 8px 0 0 0; color: #9ca3af; font-size: 13px;">Stockbit Scraper & Automation Management Dashboard Overlay</p>
                </div>
                <button onclick="document.getElementById('sb-full-dashboard').remove()" style="background: #ef4444; color: #fff; border: none; padding: 10px 20px; border-radius: 10px; font-weight: 600; cursor: pointer;">✕ Tutup Dashboard</button>
            </div>

            <!-- CARDS GRID -->
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
                    <p class="card-desc">Pilih preset screener untuk mengambil data dan menampilkannya pada tabel preview di bawah.</p>
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
                        <input type="text" placeholder="Kode Saham (cth: BBCA, BMRI)" class="dash-input">
                        <button class="action-btn-primary" style="margin-top: 10px;" onclick="updateLog('Modul 02 belum diaktifkan', 'warning')">🚀 Scrape Broker Analysis</button>
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
                        <input type="date" class="dash-input" style="margin-bottom: 8px;">
                        <input type="date" class="dash-input">
                        <button class="action-btn-primary" style="margin-top: 10px; background: #f59e0b;" onclick="updateLog('Modul 03 belum diaktifkan', 'warning')">🚀 Fetch Broker Activity</button>
                    </div>
                </div>

            </div>

            <!-- STATUS LOG -->
            <div id="dash-log" style="margin-top: 25px; background: #111827; border: 1px solid #1f2937; padding: 15px; border-radius: 12px; color: #10b981; font-size: 13px; font-family: monospace;">
                System Status: Dashboard Ready. Pilih preset screener.
            </div>

            <!-- AREA PREVIEW TABEL & ACTION BUTTONS -->
            <div id="preview-container" style="margin-top: 20px; background: #111827; border: 1px solid #1f2937; border-radius: 16px; padding: 20px; display: none;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; border-bottom: 1px solid #1f2937; padding-bottom: 12px;">
                    <div>
                        <h3 id="preview-title" style="margin: 0; color: #fff; font-size: 16px;">Hasil Screener</h3>
                        <span id="preview-count" style="font-size: 12px; color: #9ca3af;">0 Data Ditemukan</span>
                    </div>
                    <div style="display: flex; gap: 10px; align-items: center;">
                        <div style="background: rgba(16,185,129,0.15); border: 1px solid #10b981; color: #10b981; padding: 6px 14px; border-radius: 8px; font-weight: 600; font-size: 13px; display: flex; align-items: center; gap: 6px;">
                            <span>✓</span> Google Sheets
                        </div>
                        <button id="btn-export" onclick="exportDataToGAS()" style="background: #10b981; color: #fff; border: none; padding: 8px 18px; border-radius: 8px; font-weight: 700; cursor: pointer; transition: 0.2s;">
                            EXPORT
                        </button>
                    </div>
                </div>

                <!-- TABLE AREA -->
                <div style="overflow-x: auto; max-height: 400px; overflow-y: auto;">
                    <table id="preview-table" style="width: 100%; border-collapse: collapse; font-size: 13px; text-align: left; color: #e2e8f0;">
                        <thead id="preview-thead" style="position: sticky; top: 0; background: #1f2937; color: #10b981;"></thead>
                        <tbody id="preview-tbody"></tbody>
                    </table>
                </div>
            </div>

        </div>
    `;

    document.body.appendChild(overlay);

    // CSS STYLES
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
        .action-btn-primary { width: 100%; padding: 10px; background: #10b981; color: #fff; border: none; border-radius: 8px; font-weight: bold; cursor: pointer; }
        #preview-table td, #preview-table th { padding: 10px 12px; border-bottom: 1px solid #1f2937; white-space: nowrap; }
        #preview-table tbody tr:hover { background: rgba(255,255,255,0.03); }
    `;
    document.head.appendChild(style);

    // LOG UTILITY
    window.updateLog = function(msg, type = 'info') {
        const log = document.getElementById('dash-log');
        if (!log) return;
        const colors = { info: '#10b981', warning: '#f59e0b', error: '#ef4444' };
        log.style.color = colors[type] || '#10b981';
        log.innerText = `[${new Date().toLocaleTimeString()}] -> ${msg}`;
    };

    const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

    // 3. LOGIKA AUTOMATED NAVIGATION & SCRAPING TABEL
    window.runScreenerAutomation = async function(btnKey) {
        const cfg = SCREENER_CONFIGS[btnKey];
        if (!cfg) {
            updateLog(`Konfigurasi "${btnKey}" tidak ditemukan.`, 'error');
            return;
        }

        if (!window.location.href.includes('/screener')) {
            updateLog(`Buka halaman https://stockbit.com/screener terlebih dahulu!`, 'warning');
            return;
        }

        try {
            updateLog(`Memulai perpindahan ke screener: "${cfg.targetName}"...`, 'info');

            // STEP A: KLIK DROPDOWN FAVORITES
            let favDropdown = Array.from(document.querySelectorAll('p, div, button')).find(el => 
                el.innerText && el.innerText.trim() === 'Favorites'
            );

            if (!favDropdown) {
                favDropdown = document.querySelector('.icon-toolbar_down') || document.querySelector('button[class*="ant-btn"]');
            }

            if (favDropdown) {
                favDropdown.click();
                await sleep(500);
            } else {
                updateLog(`Tombol 'Favorites' tidak ditemukan.`, 'error');
                return;
            }

            // STEP B: KLIK ITEM MENU
            const menuItems = Array.from(document.querySelectorAll('.ant-popover-inner-content div, .ant-popover-inner-content p'));
            const targetMenuItem = menuItems.find(el => el.innerText && (el.innerText.trim().toUpperCase().includes(btnKey.toUpperCase()) || el.innerText.trim().includes(cfg.targetName)));

            if (targetMenuItem) {
                targetMenuItem.click();
                updateLog(`Preset "${cfg.targetName}" diklik. Menunggu pemuatan data...`, 'info');
                await sleep(1500);
            } else {
                updateLog(`Pilihan "${cfg.targetName}" tidak ditemukan di daftar Favorites.`, 'error');
                return;
            }

            // STEP C: VERIFIKASI SCREEN NAME
            const screenNameInput = document.querySelector('input[name="screenName"]');
            if (screenNameInput) {
                updateLog(`Screen Name Aktif: "${screenNameInput.value}"`, 'info');
            }

            // STEP D: AMBIL HEADER & BODY TABEL STOCKBIT
            const tableEl = document.querySelector('table');
            const tbody = document.querySelector('tbody.ant-table-tbody');
            const thead = document.querySelector('thead.ant-table-thead');

            if (!tbody) {
                updateLog(`Tabel screener belum siap atau tidak ditemukan.`, 'error');
                return;
            }

            // Ekstraksi Header
            let headers = [];
            if (thead) {
                headers = Array.from(thead.querySelectorAll('th')).map(th => th.innerText.trim().replace(/\n/g, ' '));
            }

            // Ekstraksi Data Rows
            const rowElements = Array.from(tbody.querySelectorAll('tr'));
            const scrapedData = [];

            rowElements.forEach(tr => {
                const cells = Array.from(tr.querySelectorAll('td')).map(td => td.innerText.trim().replace(/\n/g, ' '));
                if (cells.length > 0) {
                    scrapedData.push(cells);
                }
            });

            if (scrapedData.length === 0) {
                updateLog(`Data tabel kosong / belum dimuat oleh Stockbit.`, 'warning');
                return;
            }

            // SIMPAN DATA KE BUFFER
            window.currentScrapedData = scrapedData;
            window.currentPresetKey = btnKey;

            // DISPLAY DATA KE PREVIEW DASHBOARD
            renderPreviewTable(btnKey, headers, scrapedData);
            updateLog(`Tabel [${btnKey}] berhasil dipratinjau (${scrapedData.length} baris). Siap Di-export!`, 'info');

        } catch (err) {
            updateLog(`❌ Terjadi Kesalahan: ${err.message}`, 'error');
        }
    };

    // 4. RENDER TABEL PREVIEW
    function renderPreviewTable(presetKey, headers, rows) {
        const container = document.getElementById('preview-container');
        const title = document.getElementById('preview-title');
        const count = document.getElementById('preview-count');
        const thead = document.getElementById('preview-thead');
        const tbody = document.getElementById('preview-tbody');

        title.innerText = `Pratinjau Hasil: ${presetKey}`;
        count.innerText = `${rows.length} Data Ditampilkan`;

        // Render Header
        thead.innerHTML = '';
        if (headers.length > 0) {
            const tr = document.createElement('tr');
            headers.forEach(h => {
                const th = document.createElement('th');
                th.innerText = h;
                tr.appendChild(th);
            });
            thead.appendChild(tr);
        }

        // Render Body Rows
        tbody.innerHTML = '';
        rows.forEach(rData => {
            const tr = document.createElement('tr');
            rData.forEach(cellText => {
                const td = document.createElement('td');
                td.innerText = cellText;
                tr.appendChild(td);
            });
            tbody.appendChild(tr);
        });

        // Tampilkan Container
        container.style.display = 'block';
        container.scrollIntoView({ behavior: 'smooth' });
    }

    // 5. EKSPORT DATA KE GOOGLE SHEETS VIA GAS
    window.exportDataToGAS = async function() {
        const btnExport = document.getElementById('btn-export');
        const data = window.currentScrapedData;
        const btnKey = window.currentPresetKey;

        if (!data || !btnKey) {
            updateLog(`Tidak ada data untuk di-export!`, 'warning');
            return;
        }

        const cfg = SCREENER_CONFIGS[btnKey];
        if (!cfg) return;

        try {
            btnExport.innerText = "EXPORTING...";
            btnExport.style.opacity = "0.6";
            btnExport.disabled = true;

            updateLog(`Mengirim ${data.length} baris data [${btnKey}] ke Google Sheets...`, 'info');

            const payload = {
                presetName: btnKey,
                sheetName: cfg.sheet,
                startColumn: cfg.startCol,
                data: data
            };

            await fetch(cfg.gasUrl, {
                method: 'POST',
                mode: 'no-cors',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            updateLog(`✅ EXPORT SUKSES! ${data.length} baris data [${btnKey}] terkirim ke Sheet: ${cfg.sheet} (Kolom ${cfg.startCol}).`, 'info');

        } catch (err) {
            updateLog(`❌ Gagal Export: ${err.message}`, 'error');
        } finally {
            btnExport.innerText = "EXPORT";
            btnExport.style.opacity = "1";
            btnExport.disabled = false;
        }
    };

})();
