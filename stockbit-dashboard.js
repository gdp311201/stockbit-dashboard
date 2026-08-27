(function() {
    if (document.getElementById('sb-full-dashboard')) {
        document.getElementById('sb-full-dashboard').remove();
        return;
    }

    // CREATE FULLSCREEN OVERLAY
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
            <div style="background: #111827; border: 1px solid #1f2937; border-radius: 16px; padding: 24px; display: flex; justify-content: space-between; align-align: center; box-shadow: 0 10px 30px rgba(0,0,0,0.5);">
                <div>
                    <div style="display: flex; align-items: center; gap: 12px;">
                        <div style="background: #059669; padding: 8px; border-radius: 10px; display: flex;">⚡</div>
                        <h1 style="margin: 0; font-size: 22px; font-weight: 700; color: #fff;">STOCKBIT TOOLS <span style="font-size: 12px; font-weight: normal; color: #10b981; background: rgba(16,185,129,0.1); padding: 4px 8px; border-radius: 20px;">v2.0 Injected</span></h1>
                    </div>
                    <p style="margin: 8px 0 0 0; color: #9ca3af; font-size: 13px;">Stockbit Scraper & Automation Management Dashboard Overlay</p>
                </div>
                <button onclick="document.getElementById('sb-full-dashboard').remove()" style="background: #ef4444; color: #fff; border: none; padding: 10px 20px; border-radius: 10px; font-weight: 600; cursor: pointer; transition: 0.2s;">✕ Tutup Dashboard</button>
            </div>

            <!-- DASHBOARD CARDS GRID (3 UTAMA) -->
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 20px; margin-top: 30px;">
                
                <!-- CARD 1: SCREENER -->
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
                        <button class="action-btn" onclick="runPreset('FINAL BPJS')">🔥 FINAL BPJS - ONE DAY TRADE</button>
                        <button class="action-btn" onclick="runPreset('BD SANGKUT')">⚡ BD SANGKUT</button>
                        <button class="action-btn" onclick="runPreset('REMORA')">🦈 REMORA</button>
                        <button class="action-btn" onclick="runPreset('SIDEWAYS 1')">📈 SIDEWAYS 1</button>
                        <button class="action-btn" onclick="runPreset('SIDEWAYS 2')">📉 SIDEWAYS 2</button>
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
                        <button class="action-btn-primary" style="margin-top: 10px; width: 100%;" onclick="startBrokerAnalysis()">🚀 Scrape Broker Analysis</button>
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
                        <button class="action-btn-primary" style="margin-top: 10px; width: 100%; background: #f59e0b;" onclick="startBrokerActivity()">🚀 Fetch Broker Activity</button>
                    </div>
                </div>

            </div>

            <!-- STATUS BAR -->
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

    // HANDLER FUNCTIONS
    window.runPreset = function(name) {
        document.getElementById('dash-log').innerText = "Status: Running Screener Automation [" + name + "]...";
    };
    window.startBrokerAnalysis = function() {
        const stocks = document.getElementById('ba-input').value;
        document.getElementById('dash-log').innerText = "Status: Scraping Broker Analysis for: " + stocks;
    };
    window.startBrokerActivity = function() {
        document.getElementById('dash-log').innerText = "Status: Fetching Broker Activity...";
    };
})();
