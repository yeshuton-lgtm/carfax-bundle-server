      <p class="note" data-i18n="storageNote">Your records are saved on the server and stay available from this customer link.</p>
      <button id="useNextButton" type="button" data-i18n="useNext">Use next available report</button>
    </section>
    <section class="table-wrap">
      <table>
        <thead><tr><th data-i18n="slot">Slot</th><th data-i18n="status">Status</th><th data-i18n="vehicle">Vehicle note</th><th data-i18n="opened">Opened</th><th data-i18n="actions">Actions</th></tr></thead>
        <tbody id="reportRows"></tbody>
      </table>
    </section>
    <p class="footer" data-i18n="footer">Tip: after the report page shows the vehicle, type a short label such as "2006 BMW 3 Series" in the vehicle note field.</p>
  </main>
  <script>
    const TOKEN = ${JSON.stringify(token)};
    const LANGUAGE_KEY = 'vehicle-report-bundle-language-v2';
    const translations = {
      en:{title:'Vehicle Report Bundle',subtitle:'Track your purchased reports, open unused reports, and keep vehicle details in one place.',language:'Language',total:'Total reports',used:'Used reports',remaining:'Remaining reports',storageNote:'Your records are saved on the server and stay available from this customer link.',useNext:'Use next available report',slot:'Slot',status:'Status',vehicle:'Vehicle note',opened:'Opened',actions:'Actions',available:'Available',usedStatus:'Used',open:'Use Report',reopen:'Open Again',vehiclePlaceholder:'Auto-filled after opening, or type a note',never:'Not opened yet',footer:'Vehicle details are filled automatically when possible, with the vehicle name on the first line and the full 17-character VIN on the second line. You can still edit the note if needed.',noReports:'All reports have already been used.'},
      es:{title:'Paquete de reportes de vehículos',subtitle:'Controle sus reportes comprados, abra reportes disponibles y guarde notas simples del vehículo en un solo lugar.',language:'Idioma',total:'Reportes totales',used:'Reportes usados',remaining:'Reportes restantes',storageNote:'Sus registros se guardan en el servidor y quedan disponibles desde este enlace.',useNext:'Usar el siguiente reporte',slot:'Espacio',status:'Estado',vehicle:'Nota del vehículo',opened:'Abierto',actions:'Acciones',available:'Disponible',usedStatus:'Usado',open:'Usar reporte',reopen:'Abrir otra vez',vehiclePlaceholder:'Ejemplo: 2006 BMW 3 Series',never:'No abierto todavía',footer:'Consejo: cuando la página muestre el vehículo, escriba una etiqueta corta como "2006 BMW 3 Series".',noReports:'Todos los reportes ya fueron usados.'},
      fr:{title:'Ensemble de rapports véhicule',subtitle:'Suivez vos rapports achetés, ouvrez les rapports inutilisés et gardez de simples notes véhicule au même endroit.',language:'Langue',total:'Rapports au total',used:'Rapports utilisés',remaining:'Rapports restants',storageNote:'Vos données sont enregistrées sur le serveur et restent disponibles depuis ce lien client.',useNext:'Utiliser le prochain rapport',slot:'Ligne',status:'Statut',vehicle:'Note véhicule',opened:'Ouvert',actions:'Actions',available:'Disponible',usedStatus:'Utilisé',open:'Utiliser',reopen:'Rouvrir',vehiclePlaceholder:'Exemple : 2006 BMW 3 Series',never:'Pas encore ouvert',footer:'Astuce : quand la page affiche le véhicule, entrez une courte note comme "2006 BMW 3 Series".',noReports:'Tous les rapports ont déjà été utilisés.'},
      zh:{title:'车辆报告套餐',subtitle:'在一个页面里追踪已购买的报告、打开未使用报告，并保存简单车辆备注。',language:'语言',total:'报告总数',used:'已使用',remaining:'剩余',storageNote:'记录保存在服务器上，客户用这个链接换设备也能继续查看。',useNext:'使用下一个可用报告',slot:'序号',status:'状态',vehicle:'车辆备注',opened:'打开时间',actions:'操作',available:'可用',usedStatus:'已使用',open:'使用报告',reopen:'再次打开',vehiclePlaceholder:'例如：2006 BMW 3 Series',never:'尚未打开',footer:'提示：报告页面显示车辆后，可以在车辆备注里输入类似 “2006 BMW 3 Series” 的短标签。',noReports:'所有报告都已经使用。'}
    };
    let currentLanguage = loadLanguage();
    let bundle = null;
    function loadLanguage(){ const saved = localStorage.getItem(LANGUAGE_KEY); if(saved && translations[saved]) return saved; const browserLanguage = (navigator.language || 'en').slice(0,2).toLowerCase(); return translations[browserLanguage] ? browserLanguage : 'en'; }
    function t(key){ return translations[currentLanguage][key] || translations.en[key] || key; }
    function formatDate(value){ if(!value) return t('never'); return new Intl.DateTimeFormat(currentLanguage,{year:'numeric',month:'short',day:'2-digit',hour:'2-digit',minute:'2-digit'}).format(new Date(value)); }
    async function api(path, options = {}){ const response = await fetch(path, { headers:{'content-type':'application/json'}, ...options }); if(!response.ok) throw new Error('Request failed'); return response.json(); }
    async function loadBundle(){ bundle = await api('/api/bundle/' + TOKEN); render(); }
    async function openReport(index){ const reportWindow = window.open('about:blank', '_blank'); try { const result = await api('/api/bundle/' + TOKEN + '/open/' + index, { method:'POST' }); bundle = result.bundle; render(); if(reportWindow){ reportWindow.location.href = result.url; } else { location.href = result.url; } } catch(error) { if(reportWindow) reportWindow.close(); alert('Unable to open this report. Please try again.'); } }
    async function openNextReport(){ const nextIndex = bundle.reports.findIndex(report => !report.used); if(nextIndex === -1){ alert(t('noReports')); return; } await openReport(nextIndex); }
    async function updateVehicle(index, value){ await api('/api/bundle/' + TOKEN + '/vehicle/' + index, { method:'POST', body: JSON.stringify({ vehicle: value }) }); }
    function renderTranslations(){ document.documentElement.lang = currentLanguage; document.querySelectorAll('[data-i18n]').forEach(element => { element.textContent = t(element.dataset.i18n); }); document.getElementById('languageSelect').value = currentLanguage; }
    function render(){ renderTranslations(); if(!bundle) return; document.getElementById('totalCount').textContent = bundle.total; document.getElementById('usedCount').textContent = bundle.used; document.getElementById('remainingCount').textContent = bundle.remaining; document.getElementById('useNextButton').disabled = bundle.remaining === 0; const rows = document.getElementById('reportRows'); rows.innerHTML = ''; bundle.reports.forEach((report, index) => { const row = document.createElement('tr'); const slot = document.createElement('td'); slot.className='slot'; slot.dataset.label=t('slot'); slot.textContent='#' + report.id; const status = document.createElement('td'); status.dataset.label=t('status'); const badge = document.createElement('span'); badge.className='status ' + (report.used ? 'used' : 'available'); badge.textContent = report.used ? t('usedStatus') : t('available'); status.appendChild(badge); const vehicle = document.createElement('td'); vehicle.dataset.label=t('vehicle'); const input = document.createElement('textarea'); input.className='vehicle-input'; input.rows=2; input.value=report.vehicle || ''; input.placeholder=t('vehiclePlaceholder'); input.addEventListener('change', event => updateVehicle(index, event.target.value)); vehicle.appendChild(input); const opened = document.createElement('td'); opened.className='time'; opened.dataset.label=t('opened'); opened.textContent=formatDate(report.openedAt); const actions = document.createElement('td'); actions.dataset.label=t('actions'); const wrap = document.createElement('div'); wrap.className='actions'; const button = document.createElement('button'); button.type='button'; button.className=report.used ? 'secondary' : ''; button.textContent=report.used ? t('reopen') : t('open'); button.addEventListener('click', () => openReport(index)); wrap.appendChild(button); actions.appendChild(wrap); row.append(slot,status,vehicle,opened,actions); rows.appendChild(row); }); }
    document.getElementById('languageSelect').addEventListener('change', event => { currentLanguage = event.target.value; localStorage.setItem(LANGUAGE_KEY, currentLanguage); render(); });
    document.getElementById('useNextButton').addEventListener('click', openNextReport);
    loadBundle();
  </script>
</body>
</html>`;
}

function adminHtml() {
  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8" /><meta name="viewport" content="width=device-width, initial-scale=1" /><title>Create Bundle</title>
<style>body{font-family:Arial,Helvetica,sans-serif;margin:0;background:#f4f6f8;color:#18212f}.shell{width:min(860px,calc(100% - 32px));margin:0 auto;padding:28px 0}label{display:block;font-weight:700;margin:16px 0 8px}input,textarea{width:100%;border:1px solid #d9dee7;border-radius:6px;padding:10px;font:inherit}textarea{min-height:180px}button{margin-top:16px;border:0;border-radius:6px;background:#1463ff;color:#fff;padding:11px 14px;font-weight:700;cursor:pointer}.box{background:#fff;border:1px solid #d9dee7;border-radius:8px;padding:16px;margin-top:16px}.muted{color:#667085}</style></head>
<body><main class="shell"><h1>Create Customer Bundle</h1><p class="muted">Paste one report link per line. This simple admin page is for setup/testing. Add password protection before real sales use.</p><div class="box"><label>Customer name</label><input id="name" value="Customer" /><label>Report links</label><textarea id="links">https://carfax.codes/RSRK1NH9DP
https://carfax.codes/HUP7OCNYL6
https://carfax.codes/UK6TUOORZI
https://carfax.codes/UWDHXKWROC
https://carfax.codes/L0JOK0VVJ4</textarea><button id="create">Create bundle</button><p id="result"></p></div></main>
<script>document.getElementById('create').addEventListener('click', async () => { const customerName = document.getElementById('name').value.trim(); const links = document.getElementById('links').value.split('\\n').map(x => x.trim()).filter(Boolean); const password = new URLSearchParams(location.search).get('password') || ''; const response = await fetch('/api/bundle?password=' + encodeURIComponent(password), { method:'POST', headers:{'content-type':'application/json'}, body: JSON.stringify({ customerName, links }) }); const data = await response.json(); const url = location.origin + '/r/' + data.token; document.getElementById('result').innerHTML = response.ok ? 'Customer link: <a href="' + url + '">' + url + '</a>' : data.error; });</script></body></html>`;
}

async function handleApi(req, res, pathname) {
  const data = readData();

  if (req.method === 'POST' && pathname === '/api/bundle') {
    const requestUrl = new URL(req.url, `http://${req.headers.host}`);
    if (!isAdmin(req, requestUrl)) return sendJson(res, 401, { error: 'Admin password required.' });
    const body = await readBody(req);
    const links = Array.isArray(body.links) ? body.links.filter(Boolean) : [];
    if (!links.length) return sendJson(res, 400, { error: 'At least one report link is required.' });

    const token = crypto.randomBytes(5).toString('hex');
    data.bundles[token] = {
      token,
      customerName: body.customerName || 'Customer',
      createdAt: new Date().toISOString(),
      reports: links.map((url, index) => ({
        id: index + 1,
        url,
        used: false,
        vehicle: '',
        openedAt: ''
      }))
    };
    writeData(data);
    return sendJson(res, 201, { token, bundle: publicBundle(data.bundles[token]) });
  }

  const bundleMatch = pathname.match(/^\/api\/bundle\/([^/]+)$/);
  if (req.method === 'GET' && bundleMatch) {
    const bundle = data.bundles[bundleMatch[1]];
    if (!bundle) return notFound(res);
    return sendJson(res, 200, publicBundle(bundle));
  }

  const openMatch = pathname.match(/^\/api\/bundle\/([^/]+)\/open\/(\d+)$/);
  if (req.method === 'POST' && openMatch) {
    const bundle = data.bundles[openMatch[1]];
    const index = Number(openMatch[2]);
    if (!bundle || !bundle.reports[index]) return notFound(res);
    const report = bundle.reports[index];
    report.used = true;
    if (!report.openedAt) report.openedAt = new Date().toISOString();
    await fillVehicleFromReport(report);
    writeData(data);
    return sendJson(res, 200, { url: report.url, bundle: publicBundle(bundle) });
  }

  const vehicleMatch = pathname.match(/^\/api\/bundle\/([^/]+)\/vehicle\/(\d+)$/);
  if (req.method === 'POST' && vehicleMatch) {
    const bundle = data.bundles[vehicleMatch[1]];
    const index = Number(vehicleMatch[2]);
    if (!bundle || !bundle.reports[index]) return notFound(res);
    const body = await readBody(req);
    bundle.reports[index].vehicle = String(body.vehicle || '').slice(0, 160);
    writeData(data);
    return sendJson(res, 200, { ok: true });
  }

  return notFound(res);
}

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, `http://${req.headers.host}`);
    const pathname = url.pathname;

    if (pathname === '/') {
      res.writeHead(302, { location: '/r/demo5' });
      return res.end();
    }

    if (pathname === '/admin') {
      if (!isAdmin(req, url)) {
        sendHtml(res, '<!doctype html><meta charset="utf-8"><title>Admin Login</title><body style="font-family:Arial;padding:32px"><h1>Admin Login</h1><form><input name="password" type="password" placeholder="Password" style="padding:10px"><button style="padding:10px;margin-left:8px">Open</button></form></body>');
        return;
      }
      return sendHtml(res, adminHtml());
    }

    const pageMatch = pathname.match(/^\/r\/([^/]+)$/);
    if (req.method === 'GET' && pageMatch) {
      const data = readData();
      if (!data.bundles[pageMatch[1]]) return notFound(res);
      return sendHtml(res, pageHtml(pageMatch[1]));
    }

    if (pathname.startsWith('/api/')) {
      return handleApi(req, res, pathname);
    }

    return notFound(res);
  } catch (error) {
    sendJson(res, 500, { error: 'Server error' });
  }
});

ensureData();
server.listen(PORT, HOST, () => {
      console.log(`Report bundle server running at http://${HOST}:${PORT}/r/demo5`);
  console.log(`Admin page: http://${HOST}:${PORT}/admin`);
});
