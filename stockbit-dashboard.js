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

    // 2. BUILD OVERLAY & MODAL CONTAINER (SAMA DENGAN CONTOH REFERENSI)
    const overlay = document.createElement('div');
    overlay.id = 'sb-full-dashboard';
    
    // Backdrop gelap semu transparan & posisi terpusat
    overlay.style = `
        position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
        background: rgba(0, 0, 0, 0.75); backdrop-filter: blur(3px); -webkit-backdrop-filter: blur(3px);
        z-index: 999999; color: #e2e8f0; font-family: 'Inter', system-ui, sans-serif;
        display: flex; justify-content: center; align-items: center; padding: 20px; box-sizing: border-box;
    `;

    // Modal Box Terpusat
    overlay.innerHTML = `
        <div style="width: 100%; max-width: 800px; max-height: 90vh; background: #0f172a; border: 1px solid #1e293b; border-radius: 16px; display: flex; flex-direction: column; overflow: hidden; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.7);">
            
            <!-- HEADER MODAL -->
            <div style="background: #020617; border-bottom: 1px solid #1e293b; padding: 16px 20px; display: flex; justify-content: space-between; align-items: center;">
                <div style="display: flex; align-items: center; gap: 10px;">
                    <div style="background: #059669; padding: 6px; border-radius: 8px; display: flex; align-items: center; justify-content: center;">⚡</div>
                    <div>
                        <h1 style="margin: 0; font-size: 16px; font-weight: 700; color: #fff;">STOCKBIT TOOLS <span style="font-size: 11px; font-weight: normal; color: #10b981; background: rgba(16,185,129,0.15); padding: 2px 6px; border-radius: 12px; margin-left: 6px;">v5.0 Centered Modal</span></h1>
                    </div>
                </div>
                <button onclick="document.getElementById('sb-full-dashboard').remove()" style="background: #1e293b; color: #94a3b8; border: 1px solid #334155; width: 32px; height: 32px; border-radius: 8px; font-weight: 600; cursor: pointer; display: flex; align-items: center; justify-content: center;" onmouseover="this.style.color='#fff'" onmouseout="this.style.color='#94a3b8'">✕</button>
            </div>

            <!-- BODY CONTENT (SCROLLABLE IF NEEDED) -->
            <div style="padding: 20px; overflow-y: auto; display: flex; flex-direction: column; gap: 20px;">
                
                <!-- CARDS GRID -->
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(230px, 1fr)); gap: 15px;">
                    
                    <!-- CARD 1: SCREENER AUTOMATION -->
                    <div class="dash-card">
                        <div class="card-header">
                            <span class="card-title">SCREENER AUTOMATION</span>
                            <span class="card-badge">01</span>
                        </div>
                        <p class="card-desc">Modul penarik data 5 preset Screener ke GSheets.</p>
                        <div style="display: flex; flex-direction: column; gap: 6px; margin-top: 10px;">
                            <button class="action-btn" onclick="runScreenerAutomation('FINAL BPJS - ONE DAY TRADE')">🔥 FINAL BPJS</button>
                            <button class="action-btn" onclick="runScreenerAutomation('BD SANGKUT')">⚡ BD SANGKUT</button>
                            <button class="action-btn" onclick="runScreenerAutomation('REMORA')">🦈 REMORA</button>
                            <button class="action-btn" onclick="runScreenerAutomation('SIDEWAYS 1')">📈 SIDEWAYS 1</button>
                            <button class="action-btn" onclick="runScreenerAutomation('SIDEWAYS 2')">📉 SIDEWAYS 2</button>
                        </div>
                    </div>

                    <!-- CARD 2: BROKER ANALYSIS -->
                    <div class="dash-card">
                        <div class="card-header">
                            <span class="card-title">BROKER ANALYSIS</span>
                            <span class="card-badge">02</span>
                        </div>
                        <p class="card-desc">Automasi pencarian kode saham & akum/distribusi Top Broker.</p>
                        <div style="margin-top: 10px; display: flex; flex-direction: column; gap: 8px;">
                            <input type="text" placeholder="Kode Saham (cth: BBCA)" class="dash-input">
                            <button class="action-btn-primary" onclick="updateLog('Modul 02 belum diaktifkan', 'warning')">🚀 Scrape Analysis</button>
                        </div>
                    </div>

                    <!-- CARD 3: BROKER ACTIVITY -->
                    <div class="dash-card">
                        <div class="card-header">
                            <span class="card-title">BROKER ACTIVITY</span>
                            <span class="card-badge">03</span>
                        </div>
                        <p class="card-desc">Fetch data transaksi broker berdasarkan Date Range.</p>
                        <div style="margin-top: 10px; display: flex; flex-direction: column; gap: 6px;">
                            <input type="date" class="dash-input">
                            <input type="date" class="dash-input">
                            <button class="action-btn-primary" style="background: #f59e0b;" onclick="updateLog('Modul 03 belum diaktifkan', 'warning')">🚀 Fetch Activity</button>
                        </div>
                    </div>

                </div>

                <!-- STATUS LOG -->
                <div id="dash-log" style="background: #020617; border: 1px solid #1e293b; padding: 12px 15px; border-radius: 10px; color: #10b981; font-size: 12px; font-family: monospace;">
                    Status: Modal terpusat aktif. Siap dijalankan.
                </div>

                <!-- PREVIEW TABLE CONTAINER -->
                <div id="preview-container" style="background: #020617; border: 1px solid #1e293b; border-radius: 12px; padding: 15px; display: none;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; border-bottom: 1px solid #1e293b; padding-bottom: 8px;">
                        <div>
                            <h3 id="preview-title" style="margin: 0; color: #fff; font-size: 14px;">Hasil Screener</h3>
                            <span id="preview-count" style="font-size: 11px; color: #64748b;">0 Data Ditemukan</span>
                        </div>
                        <button id="btn-export" onclick="exportDataToGAS()" style="background: #10b981; color: #fff; border: none; padding: 6px 14px; border-radius: 6px; font-weight: 700; font-size: 12px; cursor: pointer;">
                            EXPORT TO GSHEETS
                        </button>
                    </div>

                    <div style="overflow-x: auto; max-height: 250px; overflow-y: auto;">
                        <table id="preview-table" style="width: 100%; border-collapse: collapse; font-size: 12px; text-align: left; color: #cbd5e1;">
                            <thead id="preview-thead" style="position: sticky; top: 0; background: #1e293b; color: #10b981;"></thead>
                            <tbody id="preview-tbody"></tbody>
                        </table>
                    </div>
                </div>

            </div>
        </div>
    `;

    document.body.appendChild(overlay);

    // CSS STYLES UNTUK KOMPONEN DI DALAM MODAL
    const style = document.createElement('style');
    style.innerHTML = `
        .dash-card { background: #020617; border: 1px solid #1e293b; border-radius: 12px; padding: 14px; display: flex; flex-direction: column; justify-content: space-between; }
        .card-header { display: flex; justify-content: space-between; align-items: center; }
        .card-title { margin: 0; font-size: 12px; font-weight: 700; color: #f1f5f9; }
        .card-badge { font-size: 10px; color: #38bdf8; background: rgba(56,189,248,0.1); padding: 1px 6px; border-radius: 8px; font-weight: bold; }
        .card-desc { font-size: 11px; color: #64748b; margin-top: 6px; line-height: 1.3; }
        .dash-input { width: 100%; padding: 8px; background: #0f172a; border: 1px solid #334155; border-radius: 6px; color: #fff; font-size: 12px; box-sizing: border-box; }
        .action-btn { width: 100%; padding: 8px; background: #0f172a; border: 1px solid #334155; color: #cbd5e1; border-radius: 6px; text-align: left; cursor: pointer; font-size: 11px; font-weight: 600; }
        .action-btn:hover { background: #1e293b; border-color: #38bdf8; color: #fff; }
        .action-btn-primary { width: 100%; padding: 8px; background: #10b981; color: #fff; border: none; border-radius: 6px; font-weight: bold; font-size: 11px; cursor: pointer; }
        #preview-table td, #preview-table th { padding: 8px 10px; border-bottom: 1px solid #1e293b; white-space: nowrap; }
        #preview-table tbody tr:hover { background: rgba(255,255,255,0.03); }
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
