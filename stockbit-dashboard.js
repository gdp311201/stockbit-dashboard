(function() {
    // 1. MAPPING KONFIGURASI SCREENER & DELEGASI GAS
    const SCREENER_CONFIGS = {
        "FINAL BPJS - ONE DAY TRADE": {
            targetKeywords: ["FINAL BPJS", "ONE DAY TRADE", "BPJS"],
            sheet: "SC",
            startCol: "T",
            gasUrl: "https://script.google.com/macros/s/AKfycbz_GANTI_DENGAN_URL_GAS_LU/exec"
        },
        "BD SANGKUT": {
            targetKeywords: ["BD - SANGKUT", "BD SANGKUT", "SANGKUT"],
            sheet: "SC",
            startCol: "AA",
            gasUrl: "https://script.google.com/macros/s/AKfycbz_GANTI_DENGAN_URL_GAS_LU/exec"
        },
        "REMORA": {
            targetKeywords: ["REMORA", "SIAP NAIK"],
            sheet: "SC",
            startCol: "AH",
            gasUrl: "https://script.google.com/macros/s/AKfycbz_GANTI_DENGAN_URL_GAS_LU/exec"
        },
        "SIDEWAYS 1": {
            targetKeywords: ["SIDEWAYS SCREENER V1", "SIDEWAYS 1", "SIDEWAYS V1"],
            sheet: "SC",
            startCol: "AO",
            gasUrl: "https://script.google.com/macros/s/AKfycbz_GANTI_DENGAN_URL_GAS_LU/exec"
        },
        "SIDEWAYS 2": {
            targetKeywords: ["SIDEWAYS SCREENER V2", "SIDEWAYS 2", "SIDEWAYS V2"],
            sheet: "SC",
            startCol: "AV",
            gasUrl: "https://script.google.com/macros/s/AKfycbz_GANTI_DENGAN_URL_GAS_LU/exec"
        }
    };

    window.currentScrapedData = null;
    window.currentPresetKey = null;

    if (document.getElementById('sb-full-dashboard')) {
        document.getElementById('sb-full-dashboard').remove();
        return;
    }

    // 2. BUILD OVERLAY UI (BACKGROUND TRANSPARAN + BLUR)
    const overlay = document.createElement('div');
    overlay.id = 'sb-full-dashboard';
    overlay.style = `
        position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
        background: rgba(10, 14, 23, 0.45); backdrop-filter: blur(5px); -webkit-backdrop-filter: blur(5px);
        z-index: 999999; color: #e2e8f0; font-family: 'Inter', system-ui, sans-serif;
        overflow-y: auto; padding: 40px 20px; box-sizing: border-box;
        transition: opacity 0.3s ease; pointer-events: none;
    `;

    overlay.innerHTML = `
        <div style="max-width: 1100px; margin: 0 auto; pointer-events: auto;">
            
            <!-- HEADER -->
            <div style="background: rgba(17, 24, 39, 0.85); backdrop-filter: blur(10px); border: 1px solid rgba(255,255,255,0.1); border-radius: 16px; padding: 24px; display: flex; justify-content: space-between; align-items: center; box-shadow: 0 10px 30px rgba(0,0,0,0.3);">
                <div>
                    <div style="display: flex; align-items: center; gap: 12px;">
                        <div style="background: #059669; padding: 8px; border-radius: 10px; display: flex;">⚡</div>
                        <h1 style="margin: 0; font-size: 22px; font-weight: 700; color: #fff;">STOCKBIT TOOLS <span style="font-size: 12px; font-weight: normal; color: #10b981; background: rgba(16,185,129,0.2); padding: 4px 8px; border-radius: 20px;">v4.2 Transparent UI</span></h1>
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
            <div id="dash-log" style="margin-top: 25px; background: rgba(17, 24, 39, 0.85); backdrop-filter: blur(10px); border: 1px solid rgba(255,255,255,0.1); padding: 15px; border-radius: 12px; color: #10b981; font-size: 13px; font-family: monospace;">
                Status: System Ready. Dashboard transparan aktif.
            </div>

            <!-- AREA PREVIEW TABEL & ACTION BUTTONS -->
            <div id="preview-container" style="margin-top: 20px; background: rgba(17, 24, 39, 0.9); backdrop-filter: blur(10px); border: 1px solid rgba(255,255,255,0.1); border-radius: 16px; padding: 20px; display: none;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 12px;">
                    <div>
                        <h3 id="preview-title" style="margin: 0; color: #fff; font-size: 16px;">Hasil Screener</h3>
                        <span id="preview-count" style="font-size: 12px; color: #9ca3af;">0 Data Ditemukan</span>
                    </div>
                    <div style="display: flex; gap: 10px; align-items: center;">
                        <button id="btn-export" onclick="exportDataToGAS()" style="background: #10b981; color: #fff; border: none; padding: 8px 18px; border-radius: 8px; font-weight: 700; cursor: pointer; transition: 0.2s;">
                            EXPORT TO GSHEETS
                        </button>
                    </div>
                </div>

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

    // STYLES SEMI-TRANSPARAN
    const style = document.createElement('style');
    style.innerHTML = `
        .dash-card { background: rgba(17, 24, 39, 0.85); backdrop-filter: blur(10px); border: 1px solid rgba(255,255,255,0.1); border-radius: 16px; padding: 20px; display: flex; flex-direction: column; justify-content: space-between; }
        .card-header { display: flex; justify-content: space-between; align-items: center; }
        .card-icon { font-size: 24px; background: rgba(31, 41, 55, 0.8); padding: 8px; border-radius: 10px; }
        .card-title { margin: 0; font-size: 15px; font-weight: 700; color: #f3f4f6; }
        .card-badge { font-size: 11px; color: #3b82f6; background: rgba(59,130,246,0.2); padding: 2px 8px; border-radius: 10px; font-weight: bold; }
        .card-desc { font-size: 12px; color: #9ca3af; margin-top: 10px; line-height: 1.4; }
        .dash-input { width: 100%; padding: 10px; background: rgba(31, 41, 55, 0.8); border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; color: #fff; box-sizing: border-box; }
        .action-btn { width: 100%; padding: 10px; background: rgba(31, 41, 55, 0.8); border: 1px solid rgba(255,255,255,0.1); color: #e5e7eb; border-radius: 8px; text-align: left; cursor: pointer; font-size: 12px; font-weight: 600; }
        .action-btn:hover { background: rgba(55, 65, 81, 0.9); border-color: #3b82f6; color: #fff; }
        .action-btn-primary { width: 100%; padding: 10px; background: #10b981; color: #fff; border: none; border-radius: 8px; font-weight: bold; cursor: pointer; }
        #preview-table td, #preview-table th { padding: 10px 12px; border-bottom: 1px solid rgba(255,255,255,0.08); white-space: nowrap; }
        #preview-table tbody tr:hover { background: rgba(255,255,255,0.05); }
    `;
    document.head.appendChild(style);

    window.updateLog = function(msg, type = 'info') {
        const log = document.getElementById('dash-log');
        if (!log) return;
        const colors = { info: '#10b981', warning: '#f59e0b', error: '#ef4444' };
        log.style.color = colors[type] || '#10b981';
        log.innerText = `Status: ${msg}`;
    };

    const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

    function triggerReactClick(element) {
        if (!element) return;
        const opts = { bubbles: true, cancelable: true, view: window };
        element.dispatchEvent(new MouseEvent('mousedown', opts));
        element.dispatchEvent(new MouseEvent('mouseup', opts));
        element.dispatchEvent(new MouseEvent('click', opts));
    }

    // 3. AUTOMATED SCREENER EXECUTOR
    window.runScreenerAutomation = async function(btnKey) {
        const cfg = SCREENER_CONFIGS[btnKey];
        if (!cfg) return;

        try {
            updateLog(`Running Screener Automation [${btnKey}]...`);

            // STEP A: CARI DROPDOWN PRESET / FAVORITES STOCKBIT
            let dropdown = Array.from(document.querySelectorAll('*')).find(el => {
                const text = el.innerText ? el.innerText.trim() : '';
                return (text === 'Favorites' || text.includes('My Preset')) && el.children.length === 0;
            });

            if (!dropdown) {
                dropdown = document.querySelector('.ant-select-selector') || 
                           document.querySelector('[class*="screener-dropdown"]') ||
                           document.querySelector('.ant-dropdown-trigger');
            }

            if (dropdown) {
                triggerReactClick(dropdown.parentElement || dropdown);
                await sleep(800);
            } else {
                updateLog(`Gagal: Menu dropdown Preset/Favorites tidak ditemukan di Stockbit.`, 'error');
                return;
            }

            // STEP B: MENCARI DAN MEMILIH ITEM PRESET
            let items = Array.from(document.querySelectorAll('.ant-dropdown-menu-item, .ant-popover-inner-content div, .ant-select-item-option'));
            let targetItem = null;

            for (let item of items) {
                const itemText = (item.innerText || '').toUpperCase();
                if (cfg.targetKeywords.some(kw => itemText.includes(kw.toUpperCase()))) {
                    targetItem = item;
                    break;
                }
            }

            if (targetItem) {
                triggerReactClick(targetItem);
                await sleep(2500);
            } else {
                updateLog(`Gagal: Preset "${btnKey}" tidak ditemukan di daftar dropdown Stockbit.`, 'error');
                return;
            }

            // STEP C: SCRAPE DATA TABEL HASIL
            const table = document.querySelector('table');
            const tbody = document.querySelector('tbody.ant-table-tbody') || (table ? table.querySelector('tbody') : null);
            const thead = document.querySelector('thead.ant-table-thead') || (table ? table.querySelector('thead') : null);

            if (!tbody) {
                updateLog(`Gagal: Tabel hasil screener tidak ditemukan.`, 'error');
                return;
            }

            let headers = [];
            if (thead) {
                headers = Array.from(thead.querySelectorAll('th'))
                    .map(th => th.innerText.trim().replace(/\n/g, ' '))
                    .filter(h => h.length > 0);
            }

            const rows = Array.from(tbody.querySelectorAll('tr'));
            const scrapedData = [];

            rows.forEach(tr => {
                const cells = Array.from(tr.querySelectorAll('td'))
                    .map(td => td.innerText.trim().replace(/\n/g, ' '))
                    .filter(c => c !== '');
                if (cells.length > 0) {
                    scrapedData.push(cells);
                }
            });

            if (scrapedData.length === 0) {
                updateLog(`Data screener kosong / tidak ada saham yang lolos kriteria.`, 'warning');
                return;
            }

            window.currentScrapedData = scrapedData;
            window.currentPresetKey = btnKey;

            renderPreviewTable(btnKey, headers, scrapedData);
            updateLog(`Selesai! Berhasil mengambil ${scrapedData.length} baris data [${btnKey}].`, 'info');

        } catch (err) {
            updateLog(`Error Executing: ${err.message}`, 'error');
        }
    };

    // 4. RENDER PREVIEW TABEL
    function renderPreviewTable(presetKey, headers, rows) {
        const container = document.getElementById('preview-container');
        const title = document.getElementById('preview-title');
        const count = document.getElementById('preview-count');
        const thead = document.getElementById('preview-thead');
        const tbody = document.getElementById('preview-tbody');

        title.innerText = `Pratinjau Hasil Screener: ${presetKey}`;
        count.innerText = `${rows.length} Saham Ditemukan`;

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

        container.style.display = 'block';
        container.scrollIntoView({ behavior: 'smooth' });
    }

    // 5. EXPORT KE GSHEETS
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
            btnExport.innerText = "SENDING TO GSHEETS...";
            btnExport.disabled = true;

            updateLog(`Mengirim ${data.length} baris ke Google Sheets (Sheet: ${cfg.sheet}, Col: ${cfg.startCol})...`);

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

            updateLog(`✅ Berhasil! Data [${btnKey}] berhasil dikirim ke Google Sheets.`, 'info');

        } catch (err) {
            updateLog(`Gagal Export: ${err.message}`, 'error');
        } finally {
            btnExport.innerText = "EXPORT TO GSHEETS";
            btnExport.disabled = false;
        }
    };

})();
