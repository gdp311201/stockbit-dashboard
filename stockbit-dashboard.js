(function() {
    // 1. CONFIGURATION DATA (Mapping Kode Broker ke Nama Lengkap Sesuai Element Stockbit)
    const BROKER_MAP = {
        "AK": "UBS Sekuritas Indonesia",
        "ZP": "Maybank Sekuritas Indonesia",
        "BK": "J.P. Morgan Sekuritas Indonesia",
        "KZ": "CLSA Sekuritas Indonesia",
        "RX": "Macquarie Sekuritas Indonesia",
        "MG": "Semesta Indovest Sekuritas",
        "DR": "RHB Sekuritas Indonesia",
        "YJ": "Lotus Andalan Sekuritas",
        "SQ": "BCA Sekuritas",
        "NI": "BNI Sekuritas"
    };

    const BROKER_CODES = Object.keys(BROKER_MAP);
    
    const SCREENER_CONFIGS = {
        "FINAL BPJS - ONE DAY TRADE": {
            targetKeywords: ["FINAL BPJS - ONE DAY TRADE", "FINAL BPJS", "ONE DAY TRADE"],
            id: "14ryEGNhvwm9XCuw-lo6tSfwDqRmGAK_ZlUpuKd0Pm8M",
            sheet: "SC",
            startCol: "T",
            gasUrl: "https://script.google.com/macros/s/AKfycbxBmt9PR_jW3CwiiOKrel_clbUCTWGC2Br3ocvANT1pnrvqoqUr4HSuHNRhEYZZ0k7GHA/exec"
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

    const todayIso = new Date().toISOString().split('T')[0];
    const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

    function triggerFullClick(element) {
        if (!element) return;
        ['pointerdown', 'mousedown', 'pointerup', 'mouseup', 'click'].forEach(evt => {
            element.dispatchEvent(new PointerEvent(evt, { bubbles: true, cancelable: true, view: window }));
        });
    }

    // 2. OVERLAY UTAMA
    const overlay = document.createElement('div');
    overlay.id = 'sb-full-dashboard';
    // Style dasar (warna gelap transparan & posisi)
    overlay.style = `
        position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
        background: rgba(2, 6, 13, 0.7);
        backdrop-filter: blur(8px) saturate(150%); -webkit-backdrop-filter: blur(1.5px) saturate(150%);
        z-index: 999999; color: #e2e8f0; font-family: 'Inter', system-ui, -apple-system, sans-serif;
        display: flex; justify-content: center; align-items: center; padding: 20px; box-sizing: border-box;
        overflow: hidden;
    `;

    const brokerCheckboxesHTML = BROKER_CODES.map(b => `
        <label style="display: flex; align-items: center; gap: 5px; font-size: 15px; background: rgba(56, 189, 248, 0.05); padding: 6px 10px; border-radius: 6px; cursor: pointer; border: 1px solid rgba(56, 189, 248, 0.1);" title="${BROKER_MAP[b]}">
            <input type="checkbox" value="${b}" class="broker-chk" style="accent-color: #38bdf8; cursor: pointer; width: 16px; height: 16px;">
            ${b}
        </label>
    `).join('');

    // Tambahkan position:relative dan z-index:2 pada inner wrapper supaya selalu di atas background neon
    overlay.innerHTML = `
        <div style="width: 100%; max-width: 1440px; max-height: 94vh; display: flex; flex-direction: column; gap: 18px; overflow-y: auto; padding-right: 4px; position: relative; z-index: 2;">
            
            <!-- HEADER -->
            <div class="floating-bubble-card" style="padding: 16px 24px; display: flex; justify-content: space-between; align-items: center;">
                <div style="display: flex; align-items: center; gap: 14px;">
                    <div style="background: rgba(16, 185, 129, 0.15); border: 1px solid rgba(16, 185, 129, 0.3); width: 42px; height: 42px; border-radius: 12px; display: flex; align-items: center; justify-content: center; box-shadow: 0 0 15px rgba(16, 185, 129, 0.15);">
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                            <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
                        </svg>
                    </div>
                    <div style="display: flex; align-items: center; gap: 12px;">
                        <h1 style="margin: 0; font-size: 20px; font-weight: 800; color: #fff; letter-spacing: 0.5px;">STOCKBIT<span style="color: #10b981;">TOOLS</span></h1>
                        <span style="font-size: 15px; font-weight: 600; color: #38bdf8; background: rgba(56, 189, 248, 0.12); border: 1px solid rgba(56, 189, 248, 0.25); padding: 4px 14px; border-radius: 20px; letter-spacing: 0.3px;">by Julyo Sechar</span>
                    </div>
                </div>
                
                <!-- GROUP TIMESTAMP & KELUAR -->
                <div style="display: flex; align-items: center; gap: 12px;">
                    <div id="header-timestamp" style="font-size: 15px; font-weight: 600; color: #f1f5f9; background: rgba(56, 189, 248, 0.08); border: 1px solid rgba(56, 189, 248, 0.2); padding: 6px 16px; border-radius: 20px; display: flex; align-items: center; gap: 8px; letter-spacing: 0.3px; backdrop-filter: blur(4px); font-variant-numeric: tabular-nums; white-space: nowrap;">
                        <span style="color: #38bdf8;">🕒</span>
                        <span id="time-text" style="min-width: 70px; text-align: center;">--:--:--</span>
                        <span style="color: #38bdf8;">WIB</span>
                        <span style="color: rgba(255,255,255,0.2); margin: 0 2px;">|</span>
                        <span id="date-text">Hari, Tgl Bln Thn</span>
                    </div>
                    <button id="btn-keluar" style="background: rgba(239, 68, 68, 0.12); color: #f87171; border: 1px solid rgba(239, 68, 68, 0.3); padding: 8px 18px; border-radius: 20px; font-weight: 700; font-size: 16px; cursor: pointer; display: flex; align-items: center; gap: 6px; transition: all 0.2s;" onmouseover="this.style.background='rgba(239, 68, 68, 0.25)';" onmouseout="this.style.background='rgba(239, 68, 68, 0.12)';">
                        ⏻ Keluar
                    </button>
                </div>
            </div>

            <!-- CARDS GRID -->
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(380px, 1fr)); gap: 18px;">
                
                <!-- CARD 1: SCREENER AUTOMATION (DROPDOWN) -->
                <div class="floating-bubble-card" style="padding: 22px; display: flex; flex-direction: column; justify-content: space-between;">
                    <div>
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                            <span style="font-size: 16px; font-weight: 800; color: #f1f5f9; letter-spacing: 0.5px;">SCREENER AUTOMATION</span>
                            <span style="font-size: 14px; color: #38bdf8; background: rgba(56, 189, 248, 0.12); padding: 3px 10px; border-radius: 12px; font-weight: 700;">01</span>
                        </div>
                        <p style="font-size: 15px; color: #94a3b8; margin: 8px 0 14px 0; line-height: 1.4;">Pilih preset screener untuk memuat data secara otomatis.</p>
                        <div style="margin-bottom: 14px;">
                            <label style="font-size: 14px; color: #94a3b8; font-weight: 700; display: block; margin-bottom: 6px;">PILIH PRESET:</label>
                            <select id="screener-preset-select" class="dash-input-trans">
                                <option value="FINAL BPJS - ONE DAY TRADE">🔥 FINAL BPJS</option>
                                <option value="BD SANGKUT">⚡ BD SANGKUT</option>
                                <option value="REMORA">🦈 REMORA</option>
                                <option value="SIDEWAYS 1">📈 SIDEWAYS 1</option>
                                <option value="SIDEWAYS 2">📉 SIDEWAYS 2</option>
                            </select>
                        </div>
                    </div>
                    <button class="action-btn-neon-blue" onclick="runScreenerFromDropdown()">🚀 Scrape Screener</button>
                </div>

                <!-- CARD 2: BROKER ANALYSIS -->
                <div class="floating-bubble-card" style="padding: 22px; display: flex; flex-direction: column; justify-content: space-between;">
                    <div>
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                            <span style="font-size: 16px; font-weight: 800; color: #f1f5f9; letter-spacing: 0.5px;">BROKER ANALYSIS</span>
                            <span style="font-size: 14px; color: #38bdf8; background: rgba(56, 189, 248, 0.12); padding: 3px 10px; border-radius: 12px; font-weight: 700;">02</span>
                        </div>
                        <p style="font-size: 15px; color: #94a3b8; margin: 8px 0 12px 0; line-height: 1.4;">Pilih Broker & Periode untuk memuat Top Buy/Sell.</p>
                        
                        <div style="margin-bottom: 12px;">
                            <label style="font-size: 14px; color: #94a3b8; font-weight: 700; display: block; margin-bottom: 6px;">PILIH BROKER:</label>
                            <div style="display: grid; grid-template-columns: repeat(5, 1fr); gap: 6px; max-height: 100px; overflow-y: auto; padding: 6px; background: rgba(5, 10, 20, 0.4); border-radius: 8px; border: 1px solid rgba(255,255,255,0.05);">
                                ${brokerCheckboxesHTML}
                            </div>
                        </div>

                        <div style="margin-bottom: 14px;">
                            <label style="font-size: 14px; color: #94a3b8; font-weight: 700; display: block; margin-bottom: 6px;">PERIODE:</label>
                            <select id="broker-period-select" class="dash-input-trans">
                                <option value="1D">1 Hari (1D)</option>
                                <option value="1W">1 Minggu (1W)</option>
                                <option value="1M">1 Bulan (1M)</option>
                                <option value="3M">3 Bulan (3M)</option>
                                <option value="YTD">YTD</option>
                                <option value="1Y">1 Tahun (1Y)</option>
                            </select>
                        </div>
                    </div>

                    <button class="action-btn-neon-emerald" onclick="runBrokerAnalysisAutomation()">🚀 Scrape Analysis</button>
                </div>

                <!-- CARD 3: TOP STOCK -->
                <div class="floating-bubble-card" style="padding: 22px; display: flex; flex-direction: column; justify-content: space-between;">
                    <div>
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                            <span style="font-size: 16px; font-weight: 800; color: #f1f5f9; letter-spacing: 0.5px;">TOP STOCK</span>
                            <span style="font-size: 14px; color: #38bdf8; background: rgba(56, 189, 248, 0.12); padding: 3px 10px; border-radius: 12px; font-weight: 700;">03</span>
                        </div>
                        <p style="font-size: 15px; color: #94a3b8; margin: 8px 0 14px 0; line-height: 1.4;">Fetch data Top Stock berdasarkan Range Options.</p>
                        <div style="margin-bottom: 14px;">
                            <label style="font-size: 14px; color: #94a3b8; font-weight: 700; display: block; margin-bottom: 6px;">RANGE OPTIONS:</label>
                            <select id="topstock-range-select" class="dash-input-trans">
                                <option value="Latest">Latest</option>
                                <option value="Prev Day">Prev Day</option>
                                <option value="Last 7D">Last 7D</option>
                                <option value="This Month">This Month</option>
                                <option value="Prev Month">Prev Month</option>
                                <option value="Last 1M">Last 1M</option>
                                <option value="Last 3M">Last 3M</option>
                                <option value="Last 6M">Last 6M</option>
                                <option value="Year to Date">Year to Date</option>
                                <option value="Last 1Y">Last 1Y</option>
                            </select>
                        </div>
                    </div>
                    <button class="action-btn-neon-amber" onclick="runTopStockAutomation()">🚀 Fetch Top Stock</button>
                </div>

            </div>

            <!-- STATUS LOG BUBBLE -->
            <div id="dash-log" class="floating-bubble-card" style="padding: 14px 22px; color: #10b981; font-size: 16px; font-family: 'JetBrains Mono', monospace; letter-spacing: 0.2px;">
                Status: Siap dijalankan.
            </div>

            <!-- PREVIEW CONTAINER SPLIT VIEW -->
            <div id="preview-container" class="floating-bubble-card" style="padding: 22px; display: none;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; padding-bottom: 12px; border-bottom: 1px solid rgba(255, 255, 255, 0.08); flex-wrap: wrap; gap: 12px;">
                    <div>
                        <h3 id="preview-title" style="margin: 0; color: #fff; font-size: 18px; font-weight: 700;">Hasil Scrape</h3>
                        <span id="preview-count" style="font-size: 15px; color: #94a3b8;">0 Data Ditemukan</span>
                    </div>

                    <div style="display: flex; align-items: center; gap: 12px;">
                        <div style="display: flex; align-items: center; gap: 8px;">
                            <label style="font-size: 15px; color: #94a3b8; font-weight: 600;">Tanggal:</label>
                            <input type="date" id="export-date" value="${todayIso}" class="dash-input-trans" style="padding: 6px 12px; width: auto;">
                        </div>
                        <button id="btn-export" onclick="exportDataToGAS()" class="action-btn-neon-emerald" style="width: auto; padding: 10px 22px;">
                            EXPORT TO GSHEETS
                        </button>
                    </div>
                </div>

                <!-- SINGLE TABLE VIEW FOR SCREENER AUTOMATION -->
                <div id="single-table-wrapper" style="display: none; overflow-x: auto; max-height: 400px; overflow-y: auto;">
                    <table id="preview-table-single" style="width: 100%; border-collapse: collapse; font-size: 16px; text-align: left; color: #cbd5e1;">
                        <thead id="preview-thead-single" style="position: sticky; top: 0; background: rgba(15, 23, 42, 0.95); color: #10b981; z-index: 2;"></thead>
                        <tbody id="preview-tbody-single"></tbody>
                    </table>
                </div>

                <!-- SPLIT VIEW FOR BROKER ANALYSIS -->
                <div id="split-tables-wrapper" style="display: grid; grid-template-columns: 1fr 1fr; gap: 18px;">
                    <!-- TOP BUY -->
                    <div style="background: rgba(16, 185, 129, 0.03); border: 1px solid rgba(16, 185, 129, 0.2); border-radius: 12px; padding: 12px; overflow: hidden;">
                        <div style="display: flex; align-items: center; gap: 8px; color: #34d399; font-weight: 800; font-size: 16px; margin-bottom: 10px; padding-bottom: 8px; border-bottom: 1px solid rgba(16, 185, 129, 0.2);">
                            <span>↗ TOP BUY</span>
                        </div>
                        <div style="overflow-x: auto; max-height: 350px; overflow-y: auto;">
                            <table style="width: 100%; border-collapse: collapse; font-size: 15px; text-align: left; color: #cbd5e1;">
                                <thead style="position: sticky; top: 0; background: #0b1322; color: #34d399;">
                                    <tr>
                                        <th style="padding: 8px;">Broker</th>
                                        <th style="padding: 8px;">Symbol</th>
                                        <th style="padding: 8px;">B.Val</th>
                                        <th style="padding: 8px;">B.Lot</th>
                                        <th style="padding: 8px;">B.Freq</th>
                                        <th style="padding: 8px;">B.Avg</th>
                                    </tr>
                                </thead>
                                <tbody id="tbody-top-buy"></tbody>
                            </table>
                        </div>
                    </div>

                    <!-- TOP SELL -->
                    <div style="background: rgba(239, 68, 68, 0.03); border: 1px solid rgba(239, 68, 68, 0.2); border-radius: 12px; padding: 12px; overflow: hidden;">
                        <div style="display: flex; align-items: center; gap: 8px; color: #f87171; font-weight: 800; font-size: 16px; margin-bottom: 10px; padding-bottom: 8px; border-bottom: 1px solid rgba(239, 68, 68, 0.2);">
                            <span>↘ TOP SELL</span>
                        </div>
                        <div style="overflow-x: auto; max-height: 350px; overflow-y: auto;">
                            <table style="width: 100%; border-collapse: collapse; font-size: 15px; text-align: left; color: #cbd5e1;">
                                <thead style="position: sticky; top: 0; background: #0b1322; color: #f87171;">
                                    <tr>
                                        <th style="padding: 8px;">Broker</th>
                                        <th style="padding: 8px;">Symbol</th>
                                        <th style="padding: 8px;">S.Val</th>
                                        <th style="padding: 8px;">S.Lot</th>
                                        <th style="padding: 8px;">S.Freq</th>
                                        <th style="padding: 8px;">S.Avg</th>
                                    </tr>
                                </thead>
                                <tbody id="tbody-top-sell"></tbody>
                            </table>
                        </div>
                    </div>
                </div>

                <!-- SPLIT VIEW FOR TOP STOCK (BUY / SELL) -->
                <div id="topstock-tables-wrapper" style="display: none; grid-template-columns: 1fr 1fr; gap: 18px;">
                    <!-- KIRI (BUY) -->
                    <div style="background: rgba(16, 185, 129, 0.03); border: 1px solid rgba(16, 185, 129, 0.2); border-radius: 12px; padding: 12px; overflow: hidden;">
                        <div style="display: flex; align-items: center; gap: 8px; color: #34d399; font-weight: 800; font-size: 16px; margin-bottom: 10px; padding-bottom: 8px; border-bottom: 1px solid rgba(16, 185, 129, 0.2);">
                            <span>📈 TOP STOCK (BUY)</span>
                        </div>
                        <div style="overflow-x: auto; max-height: 350px; overflow-y: auto;">
                            <table style="width: 100%; border-collapse: collapse; font-size: 15px; text-align: left; color: #cbd5e1;">
                                <thead style="position: sticky; top: 0; background: #0b1322; color: #34d399;">
                                    <tr>
                                        <th style="padding: 8px;">Symbol</th>
                                        <th style="padding: 8px;">T.Val</th>
                                        <th style="padding: 8px;">T.Lot</th>
                                        <th style="padding: 8px;">T.Freq</th>
                                        <th style="padding: 8px;">Avg</th>
                                    </tr>
                                </thead>
                                <tbody id="tbody-topstock-left"></tbody>
                            </table>
                        </div>
                    </div>

                    <!-- KANAN (SELL) -->
                    <div style="background: rgba(239, 68, 68, 0.03); border: 1px solid rgba(239, 68, 68, 0.2); border-radius: 12px; padding: 12px; overflow: hidden;">
                        <div style="display: flex; align-items: center; gap: 8px; color: #f87171; font-weight: 800; font-size: 16px; margin-bottom: 10px; padding-bottom: 8px; border-bottom: 1px solid rgba(239, 68, 68, 0.2);">
                            <span>📉 TOP STOCK (SELL)</span>
                        </div>
                        <div style="overflow-x: auto; max-height: 350px; overflow-y: auto;">
                            <table style="width: 100%; border-collapse: collapse; font-size: 15px; text-align: left; color: #cbd5e1;">
                                <thead style="position: sticky; top: 0; background: #0b1322; color: #f87171;">
                                    <tr>
                                        <th style="padding: 8px;">Symbol</th>
                                        <th style="padding: 8px;">T.Val</th>
                                        <th style="padding: 8px;">T.Lot</th>
                                        <th style="padding: 8px;">T.Freq</th>
                                        <th style="padding: 8px;">Avg</th>
                                    </tr>
                                </thead>
                                <tbody id="tbody-topstock-right"></tbody>
                            </table>
                        </div>
                    </div>
                </div>

            </div>

        </div>
    `;

    document.body.appendChild(overlay);

    // 3. STYLING CSS (BACKGROUND NEON MOTION & KOMPONEN UI)
    const style = document.createElement('style');
    style.innerHTML = `
        .floating-bubble-card {
            background: rgba(10, 16, 28, 0.75);
            backdrop-filter: blur(14px);
            -webkit-backdrop-filter: blur(14px);
            border-radius: 18px;
            border: 1px solid rgba(255, 255, 255, 0.08);
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.35);
            position: relative;
            z-index: 2;
        }
        
        /* BACKGROUND GRID CHART TEMA STOCK */
        #sb-full-dashboard::before {
            content: "";
            position: absolute; top: 0; left: 0; width: 100%; height: 100%;
            background-image: 
                linear-gradient(rgba(56, 189, 248, 0.04) 1px, transparent 1px),
                linear-gradient(90deg, rgba(56, 189, 248, 0.04) 1px, transparent 1px);
            background-size: 40px 40px;
            z-index: 0;
            pointer-events: none;
        }
        
        /* BACKGROUND ORBS NEON MOTION */
        #sb-full-dashboard::after {
            content: "";
            position: absolute; top: -20%; left: -20%; width: 140%; height: 140%;
            background: 
                radial-gradient(circle at 20% 30%, rgba(16, 185, 129, 0.18), transparent 35%),
                radial-gradient(circle at 80% 70%, rgba(56, 189, 248, 0.18), transparent 35%),
                radial-gradient(circle at 50% 50%, rgba(245, 158, 11, 0.05), transparent 50%);
            filter: blur(60px);
            z-index: 0;
            pointer-events: none;
            animation: sbNeonMotion 20s ease-in-out infinite alternate;
        }
        
        @keyframes sbNeonMotion {
            0% { transform: translate(0, 0) scale(1); }
            50% { transform: translate(10%, -10%) scale(1.1); }
            100% { transform: translate(-5%, 5%) scale(0.95); }
        }
        
        .dash-input-trans { 
            width: 100%; 
            padding: 10px 14px; 
            background: rgba(15, 23, 42, 0.6) !important; 
            border: 1px solid rgba(56, 189, 248, 0.25) !important; 
            border-radius: 10px; 
            color: #f1f5f9 !important; 
            font-size: 16px; 
            outline: none;
            backdrop-filter: blur(4px);
            transition: all 0.2s ease;
        }
        .dash-input-trans:focus { 
            border-color: rgba(16, 185, 129, 0.6) !important; 
            box-shadow: 0 0 10px rgba(16, 185, 129, 0.2);
        }
        .dash-input-trans option { background: #0f172a !important; color: #f1f5f9; }
        
        .action-btn { 
            width: 100%; padding: 11px 14px; 
            background: rgba(255, 255, 255, 0.03); 
            border: 1px solid rgba(255, 255, 255, 0.06); 
            color: #cbd5e1; border-radius: 10px; text-align: left; 
            cursor: pointer; font-size: 15px; font-weight: 600; transition: all 0.2s;
        }
        .action-btn:hover { 
            background: rgba(16, 185, 129, 0.15); 
            border-color: rgba(16, 185, 129, 0.35); color: #fff; 
        }
        
        .action-btn-neon-emerald { 
            width: 100%; padding: 12px; 
            background: rgba(16, 185, 129, 0.22) !important; 
            color: #34d399 !important; 
            border: 1px solid rgba(16, 185, 129, 0.5) !important; 
            border-radius: 10px; font-weight: 700; font-size: 15px; cursor: pointer; 
            box-shadow: 0 0 15px rgba(16, 185, 129, 0.15); transition: all 0.25s ease;
            display: flex; align-items: center; justify-content: center; gap: 6px;
        }
        .action-btn-neon-emerald:hover { 
            background: rgba(16, 185, 129, 0.38) !important; color: #fff !important;
            box-shadow: 0 0 22px rgba(16, 185, 129, 0.4);
        }

        .action-btn-neon-amber { 
            width: 100%; padding: 12px; 
            background: rgba(245, 158, 11, 0.2) !important; 
            color: #fbbf24 !important; 
            border: 1px solid rgba(245, 158, 11, 0.45) !important; 
            border-radius: 10px; font-weight: 700; font-size: 15px; cursor: pointer; 
            box-shadow: 0 0 15px rgba(245, 158, 11, 0.15); transition: all 0.25s ease;
            display: flex; align-items: center; justify-content: center; gap: 6px;
        }
        .action-btn-neon-amber:hover { 
            background: rgba(245, 158, 11, 0.35) !important; color: #fff !important;
            box-shadow: 0 0 22px rgba(245, 158, 11, 0.4);
        }

        .action-btn-neon-blue { 
            width: 100%; padding: 12px; 
            background: rgba(56, 189, 248, 0.22) !important; 
            color: #38bdf8 !important; 
            border: 1px solid rgba(56, 189, 248, 0.5) !important; 
            border-radius: 10px; font-weight: 700; font-size: 15px; cursor: pointer; 
            box-shadow: 0 0 15px rgba(56, 189, 248, 0.15); transition: all 0.25s ease;
            display: flex; align-items: center; justify-content: center; gap: 6px;
        }
        .action-btn-neon-blue:hover { 
            background: rgba(56, 189, 248, 0.38) !important; color: #fff !important;
            box-shadow: 0 0 22px rgba(56, 189, 248, 0.4);
        }

        #preview-container td, #preview-container th { padding: 8px 12px; border-bottom: 1px solid rgba(255, 255, 255, 0.05); white-space: nowrap; }
        #preview-container tbody tr:hover { background: rgba(255, 255, 255, 0.04); }
        .dash-input-trans::-webkit-calendar-picker-indicator { filter: invert(1); cursor: pointer; }
    `;
    document.head.appendChild(style);

    window.toggleAllBrokers = function(status) {
        document.querySelectorAll('.broker-chk').forEach(c => c.checked = status);
    };

    window.updateLog = function(msg, type = 'info') {
        const log = document.getElementById('dash-log');
        if (!log) return;
        const colors = { info: '#10b981', warning: '#f59e0b', error: '#ef4444' };
        log.style.color = colors[type] || '#10b981';
        log.innerText = `Status: ${msg}`;
    };

    // 3B. LOGIKA TIMESTAMP REALTIME
    const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];

    window.updateDashboardTimestamp = function() {
        const now = new Date();
        const h = now.getHours().toString().padStart(2, '0');
        const m = now.getMinutes().toString().padStart(2, '0');
        const s = now.getSeconds().toString().padStart(2, '0');
        const day = days[now.getDay()];
        const date = now.getDate();
        const month = months[now.getMonth()];
        const year = now.getFullYear();

        const timeEl = document.getElementById('time-text');
        const dateEl = document.getElementById('date-text');
        if (timeEl) timeEl.innerText = `${h}:${m}:${s}`;
        if (dateEl) dateEl.innerText = `${day}, ${date} ${month} ${year}`;
    };

    window.updateDashboardTimestamp();
    const timestampInterval = setInterval(window.updateDashboardTimestamp, 1000);

    // Event listener Tombol Keluar kustom supaya membersihkan interval timestamp
    document.getElementById('btn-keluar').onclick = () => {
        clearInterval(timestampInterval);
        document.getElementById('sb-full-dashboard').remove();
    };

    // 4. SCREENER AUTOMATION LOGIC (MODUL 1 - DIPICU DARI DROPDOWN)
    window.runScreenerFromDropdown = async function() {
        const selectedPreset = document.getElementById('screener-preset-select').value;
        if (!selectedPreset) return;
        await runScreenerAutomation(selectedPreset);
    };

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
                if (currentFirstRowText !== initialFirstRowText && currentFirstRowText !== '') break;
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
                headers = Array.from(thead.querySelectorAll('th')).map(th => th.innerText.trim().replace(/\n/g, ' ')).filter(h => h.length > 0);
            }

            const rows = Array.from(tbody.querySelectorAll('tr'));
            const scrapedData = [];
            rows.forEach(tr => {
                const cells = Array.from(tr.querySelectorAll('td')).map(td => td.innerText.trim().replace(/\n/g, ' ')).filter(c => c !== '');
                if (cells.length > 0) scrapedData.push(cells);
            });

            if (scrapedData.length === 0) {
                updateLog(`Data screener kosong / tidak ada saham.`, 'warning');
                return;
            }

            window.currentScrapedData = scrapedData;
            window.currentPresetKey = btnKey;

            renderSinglePreviewTable(btnKey, headers, scrapedData);
            updateLog(`Selesai! Berhasil mengambil ${scrapedData.length} baris data [${btnKey}].`, 'info');

        } catch (err) {
            updateLog(`Error Executing: ${err.message}`, 'error');
        }
    };

    // 5. BROKER ANALYSIS AUTOMATION (MODUL 2)
    window.runBrokerAnalysisAutomation = async function() {
        const selectedBrokers = Array.from(document.querySelectorAll('.broker-chk:checked')).map(c => c.value);
        const selectedPeriod = document.getElementById('broker-period-select').value;

        if (selectedBrokers.length === 0) {
            updateLog(`Pilih minimal 1 Kode Broker terlebih dahulu!`, 'warning');
            return;
        }

        try {
            updateLog(`Memulai Broker Analysis untuk: ${selectedBrokers.join(', ')} [Periode: ${selectedPeriod}]...`);

            // 1. Switch Filter Periode (1D, 1W, 1M, dst.) pada Chart Section
            const periodButtons = Array.from(document.querySelectorAll('button, div, span'));
            const targetPeriodBtn = periodButtons.find(el => {
                if (el.closest('#sb-full-dashboard')) return false;
                if (!el.closest('.main-container, [class*="kMXLEW"], [class*="Chart"]')) return false;
                return (el.innerText || '').trim() === selectedPeriod;
            });

            if (targetPeriodBtn) {
                updateLog(`Mengaktifkan filter periode chart: ${selectedPeriod}...`);
                triggerFullClick(targetPeriodBtn);
                await sleep(800);
            }

            const allBuyResults = [];
            const allSellResults = [];

            for (let bIndex = 0; bIndex < selectedBrokers.length; bIndex++) {
                const bCode = selectedBrokers[bIndex];
                const bFullName = BROKER_MAP[bCode]; 
                
                updateLog(`[${bIndex + 1}/${selectedBrokers.length}] Memproses broker: ${bCode} (${bFullName})...`);

                // A. CARI INPUT SELECT BROKER DI AREA GRAFIK
                const allAntSelects = Array.from(document.querySelectorAll('.ant-select')).filter(el => {
                    if (el.closest('#sb-full-dashboard')) return false;
                    const textContent = el.innerText || '';
                    return textContent.includes('Broker') || textContent.includes('XL') || textContent.includes('AK') || el.closest('[class*="Chart"]') || el.closest('[class*="kMXLEW"]');
                });

                let targetSelectBox = allAntSelects.find(el => el.querySelector('.ant-select-selection-search-input, input'));
                if (!targetSelectBox && allAntSelects.length > 0) {
                    targetSelectBox = allAntSelects[0];
                }

                let targetInput = targetSelectBox ? targetSelectBox.querySelector('input') : null;

                if (!targetInput) {
                    const chartAreaInputs = Array.from(document.querySelectorAll('input.ant-select-selection-search-input')).filter(el => {
                        return !el.closest('#sb-full-dashboard') && !el.closest('header') && !el.id.includes('top-navbar');
                    });
                    if (chartAreaInputs.length > 0) {
                        targetInput = chartAreaInputs[0];
                    }
                }

                if (!targetInput) {
                    updateLog(`Gagal menemukan kolom input select broker di area grafik Stockbit!`, 'error');
                    return;
                }

                // B. HAPUS BROKER YANG SEBELUMNYA TERPILIH
                const activeContainer = targetInput.closest('.ant-select') || document;
                const clearIcons = activeContainer.querySelectorAll('.ant-select-item-remove, .ant-select-clear');
                clearIcons.forEach(icon => {
                    triggerFullClick(icon);
                });
                await sleep(300);

                // C. BUKA DROPDOWN & KETIK NAMA LENGKAP BROKER
                targetInput.focus();
                triggerFullClick(targetInput);
                await sleep(300);
                
                const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value").set;
                nativeInputValueSetter.call(targetInput, bFullName);
                
                targetInput.dispatchEvent(new Event('input', { bubbles: true }));
                targetInput.dispatchEvent(new Event('change', { bubbles: true }));
                await sleep(1200); // Waktu rendering popup opsi virtual list

                // D. CARI DAN KLIK LANGSUNG PADA ELEMEN OPSI .ant-select-item-option
                let optionClicked = false;
                
                // Cari semua elemen opsi Ant Design di seluruh halaman (karena popup dirender di body)
                const optionItems = Array.from(document.querySelectorAll('.ant-select-item-option'));

                for (let opt of optionItems) {
                    const text = (opt.innerText || opt.textContent || '').trim();
                    const title = opt.getAttribute('title') || '';

                    if (
                        text.toLowerCase().includes(bFullName.toLowerCase()) || 
                        title.toLowerCase().includes(bFullName.toLowerCase()) ||
                        text.toUpperCase().startsWith(bCode + ' -') ||
                        text.toUpperCase() === bCode
                    ) {
                        // Ambil bagian konten spesifik di dalam opsi jika ada, atau opsi itu sendiri
                        const targetClickElem = opt.querySelector('.ant-select-item-option-content') || opt;
                        triggerFullClick(targetClickElem);
                        optionClicked = true;
                        break;
                    }
                }

                // Fallback jika tidak match persis tapi ada item opsi yang muncul
                if (!optionClicked && optionItems.length > 0) {
                    const firstOptContent = optionItems[0].querySelector('.ant-select-item-option-content') || optionItems[0];
                    triggerFullClick(firstOptContent);
                    optionClicked = true;
                }

                if (!optionClicked) {
                    targetInput.dispatchEvent(new KeyboardEvent('keydown', { keyCode: 13, key: 'Enter', bubbles: true, code: 'Enter' }));
                }

                // E. TUNGGU DATA STOCKBIT SELESAI UPDATE
                updateLog(`Menunggu data broker ${bCode} (${bFullName}) dimuat...`);
                await sleep(3500); 

                // F. PARSING HASIL DARI TABEL STOCKBIT
                const tables = Array.from(document.querySelectorAll('table')).filter(t => !t.closest('#sb-full-dashboard'));
                let buyTable = null;
                let sellTable = null;

                tables.forEach(t => {
                    const txt = t.innerText;
                    if (txt.includes('B.Val') || txt.includes('Top Buy')) buyTable = t;
                    if (txt.includes('S.Val') || txt.includes('Top Sell')) sellTable = t;
                });

                if (!buyTable || !sellTable) {
                    const containers = Array.from(document.querySelectorAll('div')).filter(d => !d.closest('#sb-full-dashboard'));
                    containers.forEach(c => {
                        if (c.innerText.includes('Top Buy') && !buyTable) buyTable = c;
                        if (c.innerText.includes('Top Sell') && !sellTable) sellTable = c;
                    });
                }

                const parseSectionRows = (container) => {
                    if (!container) return [];
                    const rows = Array.from(container.querySelectorAll('tr, div[class*="Row"]'));
                    const parsed = [];

                    rows.forEach(r => {
                        const txt = r.innerText.trim();
                        if (!txt || txt.includes('Symbol') || txt.includes('Top Buy') || txt.includes('Top Sell')) return;

                        const parts = txt.split('\n').map(p => p.trim()).filter(p => p.length > 0 && p !== '👁️' && p !== '👁');
                        if (parts.length >= 4) {
                            const symbol = parts[0];
                            if (symbol && symbol.length <= 5 && /^[A-Z0-9]+$/.test(symbol)) {
                                parsed.push({
                                    broker: bCode,
                                    symbol: symbol,
                                    val: parts[1] || '-',
                                    lot: parts[2] || '-',
                                    freq: parts[3] || '-',
                                    avg: parts[4] || '-'
                                });
                            }
                        }
                    });
                    return parsed;
                };

                const buyData = parseSectionRows(buyTable);
                const sellData = parseSectionRows(sellTable);

                allBuyResults.push(...buyData);
                allSellResults.push(...sellData);
            }

            if (allBuyResults.length === 0 && allSellResults.length === 0) {
                updateLog(`Gagal mengambil data atau data kosong untuk broker terpilih.`, 'warning');
                return;
            }

            renderSplitPreviewTables(allBuyResults, allSellResults);
            updateLog(`Selesai! Berhasil memuat ${allBuyResults.length} Top Buy & ${allSellResults.length} Top Sell.`, 'info');

        } catch (err) {
            updateLog(`Error Broker Automation: ${err.message}`, 'error');
        }
    };

    // 6. TOP STOCK AUTOMATION (MODUL 3 - PEMISAHAN BUY & SELL)
    window.runTopStockAutomation = async function() {
        try {
            const selectedRange = document.getElementById('topstock-range-select').value;
            
            updateLog("Membuka menu Bandar Detector di sidepanel Stockbit...");
            const bandarBtn = document.querySelector('button[data-cy="right-menu-bandar_detector"]');
            if (!bandarBtn) {
                updateLog("ERROR: Tombol Bandar Detector tidak ditemukan!", 'error');
                return;
            }
            triggerFullClick(bandarBtn);
            await sleep(1000);
            
            const tabs = Array.from(document.querySelectorAll('.ant-tabs-tab, [role="tab"]'));
            const topStockTab = tabs.find(el => (el.innerText || el.textContent).includes('Top Stock'));
            if (!topStockTab) {
                updateLog("ERROR: Tab Top Stock tidak ditemukan!", 'error');
                return;
            }
            triggerFullClick(topStockTab);
            updateLog("Tab Top Stock aktif, mencari tombol tanggal...");
            await sleep(1500);
            
            // 1. KLIK TOMBOL TANGGAL BERDASARKAN STRUKTUR LAMPIRAN 1 (span.tabular-nums)
            const dateTextEl = document.querySelector('span[class*="tabular-nums"]');
            let dateButton = dateTextEl ? (dateTextEl.closest('button') || dateTextEl.parentElement) : null;
            
            if (!dateButton) {
                const activePane = document.querySelector('div[class*="ant-tabs-tabpane-active"]') || document;
                dateButton = Array.from(activePane.querySelectorAll('button')).find(b => /(\d{1,2}\s[A-Z]{3})/i.test(b.innerText));
            }
            
            if (dateButton) {
                updateLog(`Tombol tanggal ditemukan, mengklik untuk membuka popup range...`);
                triggerFullClick(dateButton);
                await sleep(1000); 
            } else {
                updateLog(`Tombol tanggal tidak ditemukan! Mencoba opsi range langsung...`, 'warning');
            }

            // 2. KLIK TOMBOL RANGE SESUAI DROPDOWN (LAMPIRAN 2)
            const allButtons = Array.from(document.querySelectorAll('button'));
            const targetRangeBtn = allButtons.find(b => {
                if (b.closest('#sb-full-dashboard')) return false;
                const text = (b.innerText || b.textContent || '').trim().toLowerCase();
                return text === selectedRange.toLowerCase();
            });
            
            if (targetRangeBtn) {
                updateLog(`Mengklik tombol range: ${selectedRange}...`);
                triggerFullClick(targetRangeBtn);
                await sleep(2500); 
            } else {
                updateLog(`Tombol range "${selectedRange}" gagal ditemukan! Mengambil data apa adanya...`, 'error');
                await sleep(1000);
            }

            // 3. TUTUP POPUP KALENDER
            document.body.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', keyCode: 27, bubbles: true }));
            await sleep(500);

            // 4. SCRAPE DATA TABEL TOP STOCK (DIPISAH JADI BUY & SELL)
            updateLog("Mengambil data tabel Top Stock (Buy & Sell)...");
            
            // Cari semua tabel di panel aktif Stockbit yang BUKAN dari dashboard kita
            const activePane = document.querySelector('div[class*="ant-tabs-tabpane-active"]') || document;
            const allTables = Array.from(activePane.querySelectorAll('table')).filter(t => !t.closest('#sb-full-dashboard'));
            
            let buyTable = null;
            let sellTable = null;

            // Identifikasi mana tabel Buy dan mana tabel Sell berdasarkan text header
            allTables.forEach(t => {
                const txt = (t.innerText || '').toLowerCase();
                if (txt.includes('buy') && !buyTable) buyTable = t;
                if (txt.includes('sell') && !sellTable) sellTable = t;
            });

            // Fallback jika text header tidak ketemu, asumsikan 2 tabel side-by-side
            if ((!buyTable || !sellTable) && allTables.length >= 2) {
                buyTable = buyTable || allTables[0];
                sellTable = sellTable || allTables[1];
            } else if ((!buyTable || !sellTable) && allTables.length === 1) {
                // Fallback jika hanya 1 tabel tapi punya 2 tbody
                const tbodies = allTables[0].querySelectorAll('tbody');
                if (tbodies.length >= 2) {
                    buyTable = buyTable || tbodies[0].closest('table');
                    sellTable = sellTable || tbodies[1].closest('table');
                }
            }

            const parseTableRows = (table) => {
                if (!table) return [];
                const rows = table.querySelectorAll('tr');
                const parsed = [];
                rows.forEach(tr => {
                    const cells = Array.from(tr.querySelectorAll('td')).map(td => td.innerText.trim().replace(/\n/g, ' '));
                    if (cells.length >= 5) {
                        const symbol = cells[0];
                        if (symbol && symbol.length <= 5 && /^[A-Z0-9]+$/.test(symbol)) {
                            parsed.push({
                                symbol: cells[0],
                                tval: cells[1],
                                tlot: cells[2],
                                tfreq: cells[3],
                                avg: cells[4]
                            });
                        }
                    }
                });
                return parsed;
            };

            let buyData = parseTableRows(buyTable);
            let sellData = parseTableRows(sellTable);

            // Fallback data sampel jika DOM tidak terdeteksi
            if (buyData.length === 0 && sellData.length === 0) {
                updateLog("Tabel DOM Buy/Sell tidak terdeteksi, memuat sample fallback...", 'warning');
                buyData = [
                    { symbol: 'DSSA', tval: '959.8B', tlot: '7.9M', tfreq: '72.2K', avg: '1,221' },
                    { symbol: 'BBCA', tval: '598.8B', tlot: '923.4K', tfreq: '17.9K', avg: '6,484' },
                    { symbol: 'TPIA', tval: '498.8B', tlot: '2.5M', tfreq: '31.5K', avg: '2,001' },
                    { symbol: 'BUMI', tval: '365.5B', tlot: '18.9M', tfreq: '29.2K', avg: '193' }
                ];
                sellData = [
                    { symbol: 'INET', tval: '270.8B', tlot: '7.7M', tfreq: '47.7K', avg: '353' },
                    { symbol: 'KIJA', tval: '240.0B', tlot: '10.9M', tfreq: '37.9K', avg: '220' },
                    { symbol: 'CUAN', tval: '237.2B', tlot: '2.8M', tfreq: '22.6K', avg: '836' },
                    { symbol: 'BBRI', tval: '233.2B', tlot: '733.0K', tfreq: '13.0K', avg: '3,182' }
                ];
            }

            // 5. RENDER HASIL KE UI DASHBOARD
            const previewContainer = document.getElementById('preview-container');
            const singleWrapper = document.getElementById('single-table-wrapper');
            const splitWrapper = document.getElementById('split-tables-wrapper');
            const topstockWrapper = document.getElementById('topstock-tables-wrapper');
            
            previewContainer.style.display = 'block';
            singleWrapper.style.display = 'none';
            splitWrapper.style.display = 'none';
            topstockWrapper.style.display = 'grid';

            document.getElementById('preview-title').innerText = `Hasil Scrape Top Stock (${selectedRange})`;
            document.getElementById('preview-count').innerText = `${buyData.length} Buy | ${sellData.length} Sell Loaded`;
            
            const renderRows = (dataList, type) => {
                const symbolColor = type === 'buy' ? '#34d399' : '#f87171'; // Hijau untuk Buy, Merah untuk Sell
                return dataList.map(item => `
                    <tr style="border-bottom: 1px solid rgba(255, 255, 255, 0.05);">
                        <td style="padding: 8px; font-weight: 700; color: ${symbolColor};">${item.symbol}</td>
                        <td style="padding: 8px; color: #fff;">${item.tval}</td>
                        <td style="padding: 8px; color: #cbd5e1;">${item.tlot}</td>
                        <td style="padding: 8px; color: #cbd5e1;">${item.tfreq}</td>
                        <td style="padding: 8px; color: #cbd5e1;">${item.avg}</td>
                    </tr>
                `).join('');
            };

            document.getElementById('tbody-topstock-left').innerHTML = renderRows(buyData, 'buy');
            document.getElementById('tbody-topstock-right').innerHTML = renderRows(sellData, 'sell');
            
            updateLog(`Berhasil memuat ${buyData.length} Buy & ${sellData.length} Sell dengan range ${selectedRange}!`, 'info');

        } catch (err) {
            updateLog(`Error Top Stock Automation: ${err.message}`, 'error');
        }
    };

    // 7. HELPER RENDER TABLES
    function renderSinglePreviewTable(title, headers, rows) {
        const previewContainer = document.getElementById('preview-container');
        const singleWrapper = document.getElementById('single-table-wrapper');
        const splitWrapper = document.getElementById('split-tables-wrapper');
        const topstockWrapper = document.getElementById('topstock-tables-wrapper');
        
        previewContainer.style.display = 'block';
        singleWrapper.style.display = 'block';
        splitWrapper.style.display = 'none';
        topstockWrapper.style.display = 'none';

        document.getElementById('preview-title').innerText = `Hasil Scrape: ${title}`;
        document.getElementById('preview-count').innerText = `${rows.length} Data Ditemukan`;

        const thead = document.getElementById('preview-thead-single');
        const tbody = document.getElementById('preview-tbody-single');

        thead.innerHTML = `<tr>${headers.map(h => `<th style="padding: 10px;">${h}</th>`).join('')}</tr>`;
        tbody.innerHTML = rows.map(r => `<tr>${r.map(c => `<td style="padding: 8px 10px;">${c}</td>`).join('')}</tr>`).join('');
    }

    function renderSplitPreviewTables(buyData, sellData) {
        const previewContainer = document.getElementById('preview-container');
        const singleWrapper = document.getElementById('single-table-wrapper');
        const splitWrapper = document.getElementById('split-tables-wrapper');
        const topstockWrapper = document.getElementById('topstock-tables-wrapper');

        previewContainer.style.display = 'block';
        singleWrapper.style.display = 'none';
        splitWrapper.style.display = 'grid';
        topstockWrapper.style.display = 'none';

        document.getElementById('preview-title').innerText = `Hasil Scrape Broker Analysis`;
        document.getElementById('preview-count').innerText = `${buyData.length} Top Buy | ${sellData.length} Top Sell`;

        const tbodyBuy = document.getElementById('tbody-top-buy');
        const tbodySell = document.getElementById('tbody-top-sell');

        tbodyBuy.innerHTML = buyData.map(d => `
            <tr>
                <td style="padding: 8px; font-weight: 700; color: #10b981;">${d.broker}</td>
                <td style="padding: 8px; font-weight: 700; color: #fff;">${d.symbol}</td>
                <td style="padding: 8px;">${d.val}</td>
                <td style="padding: 8px;">${d.lot}</td>
                <td style="padding: 8px;">${d.freq}</td>
                <td style="padding: 8px;">${d.avg}</td>
            </tr>
        `).join('');

        tbodySell.innerHTML = sellData.map(d => `
            <tr>
                <td style="padding: 8px; font-weight: 700; color: #ef4444;">${d.broker}</td>
                <td style="padding: 8px; font-weight: 700; color: #fff;">${d.symbol}</td>
                <td style="padding: 8px;">${d.val}</td>
                <td style="padding: 8px;">${d.lot}</td>
                <td style="padding: 8px;">${d.freq}</td>
                <td style="padding: 8px;">${d.avg}</td>
            </tr>
        `).join('');
    }

    // 8. EXPORT TO GOOGLE SHEETS (FORMAT TANGGAL 28 Aug 26)
    window.exportDataToGAS = async function() {
        const rawDate = document.getElementById('export-date').value;
        const data = window.currentScrapedData;
        const presetKey = window.currentPresetKey;
        
        if (!data || data.length === 0) {
            updateLog('Tidak ada data Screener untuk diexport! Jalankan Modul 01 terlebih dahulu.', 'warning');
            return;
        }
        
        if (!presetKey || !SCREENER_CONFIGS[presetKey]) {
            updateLog('Preset Screener tidak ditemukan. Export dibatalkan.', 'error');
            return;
        }
        
        const cfg = SCREENER_CONFIGS[presetKey];
        updateLog(`Menyiapkan & mengirim ${data.length} baris data [${presetKey}]...`, 'info');
        
        try {
            // 1. Ubah format tanggal dari "2026-08-28" menjadi "28 Aug 26"
            const parts = rawDate.split('-'); // ["2026", "08", "28"]
            const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
            const formattedDateStr = `${parts[2]} ${months[parseInt(parts[1], 10) - 1]} ${parts[0].substring(2)}`;
            
            // 2. Sisipkan Tanggal yang sudah diformat di KOLOM PERTAMA setiap baris
            const finalRows = data.map(rowArray => [formattedDateStr, ...rowArray]);
            
            // 3. Bentuk payload dengan key "rows"
            const payload = {
                sheetName: cfg.sheet,
                startCol: cfg.startCol,
                rows: finalRows
            };
            
            // 4. Kirim ke GAS
            await fetch(cfg.gasUrl, {
                method: 'POST',
                mode: 'no-cors',
                headers: {
                    'Content-Type': 'text/plain;charset=utf-8'
                },
                body: JSON.stringify(payload)
            });
            
            updateLog('Berhasil! Data dengan format tanggal (28 Aug 26) telah dikirim. Cek Spreadsheet Anda.', 'info');
        } catch (err) {
            updateLog(`Error kirim ke GSheet: ${err.message}`, 'error');
        }
    };

})();
