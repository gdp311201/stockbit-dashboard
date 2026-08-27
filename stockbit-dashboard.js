(function() {
    // 1. MAPPING KONFIGURASI SCREENER
    const SCREENER_CONFIGS = {
        "FINAL BPJS - ONE DAY TRADE": {
            targetKeywords: ["FINAL BPJS - ONE DAY TRADE", "FINAL BPJS", "ONE DAY TRADE"],
            id: "14ryEGNhvwm9XCuw-lo6tSfwDqRmGAK_ZlUpuKd0Pm8M",
            sheet: "SC",
            startCol: "T",
            gasUrl: "https://script.google.com/macros/s/AKfycby867iVRm0RlVnipq4obh9vaxfzy6nyIJ9DkENATabCCb4Af8G4ylQvxcWPgJWpg3OnRw/exec"
        },
        "BD SANGKUT": {
            targetKeywords: ["BD - SANGKUT & AKUM", "BD SANGKUT", "BD - SANGKUT"],
            id: "1U71XJEUU-HrHCkEeqAegKCtbXrSvVKApRpanlY-oW5s",
            sheet: "SC",
            startCol: "K",
            gasUrl: "https://script.google.com/macros/s/AKfycbz8HY3ETVtKgXh20MEJVaxbuXWdDZ_KFYE1MCgi32MnSKHMtqtIWzHib4UddM3ARzIOlQ/exec"
        },
        "REMORA": {
            targetKeywords: ["REMORA - SIAP NAIK CEPAT", "REMORA", "SIAP NAIK CEPAT"],
            id: "1Tsf_o8-hRa4fBg96Xwlayeiz--ngpm6iZ5M_ZOxGFSU",
            sheet: "SC",
            startCol: "K",
            gasUrl: "https://script.google.com/macros/s/AKfycbw3aj5cYW8pxqySQ_OsLPBAStBqm1DDUBEkBdphN4EF9JeNGhYAgZza8hfy0H1RLAKSkQ/exec"
        },
        "SIDEWAYS 1": {
            targetKeywords: ["SIDEWAYS SCREENER V1", "SIDEWAYS 1", "SIDEWAYS V1"],
            id: "1k1yFDcq0hy1OPsnk3nPrrEN-oyRMqZc8D4bC9S-ENEE",
            sheet: "SC",
            startCol: "N",
            gasUrl: "https://script.google.com/macros/s/AKfycbz21YHHZ1IBLJGHczs-YK43CyONm996uPw7ltzsHWxZORmb8YkpxIKK18SQSPluCqSd/exec"
        },
        "SIDEWAYS 2": {
            targetKeywords: ["SIDEWAYS SCREENER V2", "SIDEWAYS 2", "SIDEWAYS V2"],
            id: "1k1yFDcq0hy1OPsnk3nPrrEN-oyRMqZc8D4bC9S-ENEE",
            sheet: "SC",
            startCol: "AB",
            gasUrl: "https://script.google.com/macros/s/AKfycbz21YHHZ1IBLJGHczs-YK43CyONm996uPw7ltzsHWxZORmb8YkpxIKK18SQSPluCqSd/exec"
        }
    };

    window.currentScrapedData = null;
    window.currentPresetKey = null;

    if (document.getElementById('sb-full-dashboard')) {
        document.getElementById('sb-full-dashboard').remove();
        return;
    }

    const formatDateStr = (isoDate) => {
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const d = new Date(isoDate);
        return `${String(d.getDate()).padStart(2, '0')} ${months[d.getMonth()]} ${String(d.getFullYear()).slice(-2)}`;
    };

    const todayIso = new Date().toISOString().split('T')[0];

    // 2. OVERLAY UTAMA (BACKDROP BLUR & SEMI-TRANSPARENT)
    const overlay = document.createElement('div');
    overlay.id = 'sb-full-dashboard';
    
    overlay.style = `
        position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
        background: rgba(2, 6, 13, 0.45); backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px);
        z-index: 999999; color: #e2e8f0; font-family: 'Inter', system-ui, -apple-system, sans-serif;
        display: flex; justify-content: center; align-items: center; padding: 20px; box-sizing: border-box;
    `;

    overlay.innerHTML = `
        <div style="width: 100%; max-width: 860px; max-height: 94vh; display: flex; flex-direction: column; gap: 16px; overflow-y: auto; padding-right: 4px;">
            
            <!-- 1. FLOATING HEADER BUBBLE -->
            <div class="floating-bubble-card" style="padding: 14px 20px; display: flex; justify-content: space-between; align-items: center;">
                <div style="display: flex; align-items: center; gap: 12px;">
                    <div style="background: rgba(16, 185, 129, 0.15); border: 1px solid rgba(16, 185, 129, 0.3); width: 38px; height: 38px; border-radius: 12px; display: flex; align-items: center; justify-content: center; box-shadow: 0 0 15px rgba(16, 185, 129, 0.15);">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                            <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
                        </svg>
                    </div>
                    <div style="display: flex; align-items: center; gap: 10px;">
                        <h1 style="margin: 0; font-size: 16px; font-weight: 800; color: #fff; letter-spacing: 0.5px;">STOCKBIT<span style="color: #10b981;">TOOLS</span></h1>
                        <span style="font-size: 11px; font-weight: 600; color: #38bdf8; background: rgba(56, 189, 248, 0.12); border: 1px solid rgba(56, 189, 248, 0.25); padding: 3px 12px; border-radius: 20px; letter-spacing: 0.3px;">by Julyo Sechar</span>
                    </div>
                </div>
                <button onclick="document.getElementById('sb-full-dashboard').remove()" style="background: rgba(239, 68, 68, 0.12); color: #f87171; border: 1px solid rgba(239, 68, 68, 0.3); padding: 6px 16px; border-radius: 20px; font-weight: 700; font-size: 12px; cursor: pointer; display: flex; align-items: center; gap: 6px; transition: all 0.2s;" onmouseover="this.style.background='rgba(239, 68, 68, 0.25)';" onmouseout="this.style.background='rgba(239, 68, 68, 0.12)';">
                    ⏻ Keluar
                </button>
            </div>

            <!-- 2. FLOATING CARDS GRID -->
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 16px;">
                
                <!-- CARD 1: SCREENER AUTOMATION -->
                <div class="floating-bubble-card" style="padding: 18px;">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <span style="font-size: 12px; font-weight: 800; color: #f1f5f9; letter-spacing: 0.5px;">SCREENER AUTOMATION</span>
                        <span style="font-size: 10px; color: #38bdf8; background: rgba(56, 189, 248, 0.12); padding: 2px 8px; border-radius: 12px; font-weight: 700;">01</span>
                    </div>
                    <p style="font-size: 11px; color: #94a3b8; margin: 8px 0 12px 0; line-height: 1.4;">Pilih preset screener untuk memuat data secara otomatis.</p>
                    <div style="display: flex; flex-direction: column; gap: 7px;">
                        <button class="action-btn" onclick="runScreenerAutomation('FINAL BPJS - ONE DAY TRADE')">🔥 FINAL BPJS</button>
                        <button class="action-btn" onclick="runScreenerAutomation('BD SANGKUT')">⚡ BD SANGKUT</button>
                        <button class="action-btn" onclick="runScreenerAutomation('REMORA')">🦈 REMORA</button>
                        <button class="action-btn" onclick="runScreenerAutomation('SIDEWAYS 1')">📈 SIDEWAYS 1</button>
                        <button class="action-btn" onclick="runScreenerAutomation('SIDEWAYS 2')">📉 SIDEWAYS 2</button>
                    </div>
                </div>

                <!-- CARD 2: BROKER ANALYSIS -->
                <div class="floating-bubble-card" style="padding: 18px; display: flex; flex-direction: column; justify-content: space-between;">
                    <div>
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <span style="font-size: 12px; font-weight: 800; color: #f1f5f9; letter-spacing: 0.5px;">BROKER ANALYSIS</span>
                            <span style="font-size: 10px; color: #38bdf8; background: rgba(56, 189, 248, 0.12); padding: 2px 8px; border-radius: 12px; font-weight: 700;">02</span>
                        </div>
                        <p style="font-size: 11px; color: #94a3b8; margin: 8px 0 12px 0; line-height: 1.4;">Automasi pencarian kode saham & akum/distribusi Top Broker.</p>
                    </div>
                    <div style="display: flex; flex-direction: column; gap: 10px;">
                        <input type="text" placeholder="Kode Saham (cth: BBCA)" class="dash-input">
                        <button class="action-btn-primary" onclick="updateLog('Modul 02 belum diaktifkan', 'warning')">🚀 Scrape Analysis</button>
                    </div>
                </div>

                <!-- CARD 3: BROKER ACTIVITY -->
                <div class="floating-bubble-card" style="padding: 18px; display: flex; flex-direction: column; justify-content: space-between;">
                    <div>
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <span style="font-size: 12px; font-weight: 800; color: #f1f5f9; letter-spacing: 0.5px;">BROKER ACTIVITY</span>
                            <span style="font-size: 10px; color: #38bdf8; background: rgba(56, 189, 248, 0.12); padding: 2px 8px; border-radius: 12px; font-weight: 700;">03</span>
                        </div>
                        <p style="font-size: 11px; color: #94a3b8; margin: 8px 0 12px 0; line-height: 1.4;">Fetch data transaksi broker berdasarkan Date Range.</p>
                    </div>
                    <div style="display: flex; flex-direction: column; gap: 8px;">
                        <input type="date" class="dash-input">
                        <input type="date" class="dash-input">
                        <button class="action-btn-primary" style="background: linear-gradient(135deg, #f59e0b, #d97706);" onclick="updateLog('Modul 03 belum diaktifkan', 'warning')">🚀 Fetch Activity</button>
                    </div>
                </div>

            </div>

            <!-- 3. FLOATING STATUS LOG BUBBLE -->
            <div id="dash-log" class="floating-bubble-card" style="padding: 12px 18px; color: #10b981; font-size: 12px; font-family: 'JetBrains Mono', monospace; letter-spacing: 0.2px;">
                Status: Siap dijalankan.
            </div>

            <!-- 4. FLOATING PREVIEW TABLE BUBBLE -->
            <div id="preview-container" class="floating-bubble-card" style="padding: 18px; display: none;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; padding-bottom: 10px; border-bottom: 1px solid rgba(255, 255, 255, 0.08); flex-wrap: wrap; gap: 10px;">
                    <div>
                        <h3 id="preview-title" style="margin: 0; color: #fff; font-size: 14px; font-weight: 700;">Hasil Screener</h3>
                        <span id="preview-count" style="font-size: 11px; color: #94a3b8;">0 Data Ditemukan</span>
                    </div>

                    <div style="display: flex; align-items: center; gap: 10px;">
                        <div style="display: flex; align-items: center; gap: 6px;">
                            <label style="font-size: 11px; color: #94a3b8; font-weight: 600;">Tanggal:</label>
                            <input type="date" id="export-date" value="${todayIso}" class="dash-input" style="padding: 5px 10px; width: auto;">
                        </div>
                        <button id="btn-export" onclick="exportDataToGAS()" style="background: linear-gradient(135deg, #10b981, #059669); color: #fff; border: none; padding: 8px 18px; border-radius: 20px; font-weight: 700; font-size: 12px; cursor: pointer; box-shadow: 0 4px 12px rgba(16, 185, 129, 0.2); transition: all 0.2s;">
                            EXPORT TO GSHEETS
                        </button>
                    </div>
                </div>

                <div style="overflow-x: auto; max-height: 250px; overflow-y: auto;">
                    <table id="preview-table" style="width: 100%; border-collapse: collapse; font-size: 12px; text-align: left; color: #cbd5e1;">
                        <thead id="preview-thead" style="position: sticky; top: 0; background: rgba(15, 23, 42, 0.95); color: #10b981;"></thead>
                        <tbody id="preview-tbody"></tbody>
                    </table>
                </div>
            </div>

        </div>
    `;

    document.body.appendChild(overlay);

    // CSS STYLING DENGAN KARTU SEMI-TRANSPARAN (GLASSMORPHISM LAMPIRAN 2)
    const style = document.createElement('style');
    style.innerHTML = `
        .floating-bubble-card {
            background: rgba(10, 16, 28, 0.55);
            backdrop-filter: blur(14px);
            -webkit-backdrop-filter: blur(14px);
            border-radius: 18px;
            border: 1px solid rgba(255, 255, 255, 0.08);
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.35);
            transition: all 0.2s ease;
        }
        
        .dash-input { 
            width: 100%; 
            padding: 9px 12px; 
            background: rgba(5, 10, 20, 0.5); 
            border: 1px solid rgba(255, 255, 255, 0.08); 
            border-radius: 10px; 
            color: #fff; 
            font-size: 12px; 
            box-sizing: border-box; 
            outline: none;
            transition: border 0.2s;
        }
        .dash-input:focus { border-color: rgba(16, 185, 129, 0.5); }
        
        .action-btn { 
            width: 100%; 
            padding: 9px 12px; 
            background: rgba(255, 255, 255, 0.03); 
            border: 1px solid rgba(255, 255, 255, 0.06); 
            color: #cbd5e1; 
            border-radius: 10px; 
            text-align: left; 
            cursor: pointer; 
            font-size: 11px; 
            font-weight: 600; 
            transition: all 0.2s;
        }
        .action-btn:hover { 
            background: rgba(16, 185, 129, 0.15); 
            border-color: rgba(16, 185, 129, 0.35); 
            color: #fff; 
            transform: translateY(-1px);
        }
        
        .action-btn-primary { 
            width: 100%; 
            padding: 10px; 
            background: linear-gradient(135deg, #10b981, #059669); 
            color: #fff; 
            border: none; 
            border-radius: 10px; 
            font-weight: 700; 
            font-size: 11px; 
            cursor: pointer; 
            box-shadow: 0 4px 12px rgba(16, 185, 129, 0.2);
            transition: all 0.2s;
        }
        .action-btn-primary:hover {
            opacity: 0.9;
            transform: translateY(-1px);
        }

        #preview-table td, #preview-table th { padding: 9px 12px; border-bottom: 1px solid rgba(255, 255, 255, 0.05); white-space: nowrap; }
        #preview-table tbody tr:hover { background: rgba(255, 255, 255, 0.03); }
        .dash-input::-webkit-calendar-picker-indicator { filter: invert(1); cursor: pointer; }
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

    function triggerFullClick(element) {
        if (!element) return;
        ['pointerdown', 'mousedown', 'pointerup', 'mouseup', 'click'].forEach(evt => {
            element.dispatchEvent(new PointerEvent(evt, { bubbles: true, cancelable: true, view: window }));
        });
    }

    // 3. AUTOMATED SCREENER EXECUTOR
    window.runScreenerAutomation = async function(btnKey) {
        const cfg = SCREENER_CONFIGS[btnKey];
        if (!cfg) return;

        try {
            updateLog(`Mencari preset [${btnKey}]...`);

            const initialFirstRowText = document.querySelector('tbody.ant-table-tbody tr')?.innerText || '';
            let targetClicked = false;

            const allElements = Array.from(document.querySelectorAll('button, div, span, a, li'));
            for (let el of allElements) {
                if (el.closest('#sb-full-dashboard')) continue;

                const text = (el.innerText || '').trim().toUpperCase();
                if (text.startsWith('FAVORITES')) continue;

                if (cfg.targetKeywords.some(kw => text === kw.toUpperCase())) {
                    updateLog(`Mengklik Tab Preset: ${text}...`);
                    triggerFullClick(el);
                    targetClicked = true;
                    break;
                }
            }

            if (!targetClicked) {
                const favoritesBtn = Array.from(document.querySelectorAll('div, button, span')).find(el => {
                    if (el.closest('#sb-full-dashboard')) return false;
                    const txt = (el.innerText || '').trim();
                    return txt === 'Favorites' || txt.startsWith('Favorites');
                });

                if (favoritesBtn) {
                    updateLog(`Preset tidak ada di Tab, membuka menu Favorites...`);
                    triggerFullClick(favoritesBtn);
                    await sleep(500);

                    const menuItems = Array.from(document.querySelectorAll('.ant-dropdown-menu-item, .ant-select-item-option, div[role="option"], li'));
                    for (let item of menuItems) {
                        const itemText = (item.innerText || '').trim().toUpperCase();
                        if (cfg.targetKeywords.some(kw => itemText.includes(kw.toUpperCase()))) {
                            triggerFullClick(item);
                            targetClicked = true;
                            break;
                        }
                    }
                }
            }

            if (!targetClicked) {
                updateLog(`Gagal: Preset "${btnKey}" tidak ditemukan.`, 'error');
                return;
            }

            updateLog(`Memuat data [${btnKey}]... Harap tunggu.`);
            let checkRetry = 0;

            while (checkRetry < 10) {
                await sleep(500);
                const currentFirstRowText = document.querySelector('tbody.ant-table-tbody tr')?.innerText || '';
                
                if (currentFirstRowText !== initialFirstRowText && currentFirstRowText !== '') {
                    break;
                }
                checkRetry++;
            }

            await sleep(1000);

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
        const dateInput = document.getElementById('export-date').value;
        const rawRows = window.currentScrapedData;
        const btnKey = window.currentPresetKey;

        if (!rawRows || !btnKey) {
            updateLog(`Tidak ada data untuk di-export!`, 'warning');
            return;
        }

        if (!dateInput) {
            updateLog(`Pilih tanggal data terlebih dahulu!`, 'warning');
            return;
        }

        const cfg = SCREENER_CONFIGS[btnKey];
        if (!cfg || !cfg.gasUrl) {
            updateLog(`Konfigurasi GAS URL tidak ditemukan untuk [${btnKey}].`, 'error');
            return;
        }

        try {
            btnExport.innerText = "MENGIRIM...";
            btnExport.disabled = true;

            const dateStr = formatDateStr(dateInput);
            const finalRows = rawRows.map(row => [dateStr, ...row]);

            updateLog(`Mengirim ${finalRows.length} baris ke Sheet '${cfg.sheet}' Kolom ${cfg.startCol}...`);

            const payload = {
                spreadsheetId: cfg.id,
                sheetName: cfg.sheet,
                startCol: cfg.startCol,
                rows: finalRows
            };

            await fetch(cfg.gasUrl, {
                method: 'POST',
                mode: 'no-cors',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            updateLog(`✅ Berhasil! Data ${finalRows.length} saham [${btnKey}] dikirim ke Sheet '${cfg.sheet}' Kolom ${cfg.startCol}.`, 'info');

        } catch (err) {
            updateLog(`Gagal Export: ${err.message}`, 'error');
        } finally {
            btnExport.innerText = "EXPORT TO GSHEETS";
            btnExport.disabled = false;
        }
    };

})();
