(function () {
  'use strict';
  var FAV_KEY = 'launcher.favs';
  var INPUTS = [
    { id: 'com.webos.app.hdmi1', title: 'HDMI 1' },
    { id: 'com.webos.app.hdmi2', title: 'HDMI 2' },
    { id: 'com.webos.app.hdmi3', title: 'HDMI 3' },
    { id: 'com.webos.app.hdmi4', title: 'HDMI 4' },
    { id: 'com.webos.app.livetv', title: 'TV en vivo' }
  ];
  var apps = [], favs = load(), tiles = [], idx = 0;

  function load() { try { return JSON.parse(localStorage.getItem(FAV_KEY)) || []; } catch (e) { return []; } }
  function save() { try { localStorage.setItem(FAV_KEY, JSON.stringify(favs)); } catch (e) {} }
  function $(id) { return document.getElementById(id); }
  function setStatus(t) { $('status').textContent = t || ''; }

  // Llamada a servicios Luna (en el TV usa PalmServiceBridge; en navegador, simulacion)
  function luna(uri, params, ok, fail) {
    if (typeof PalmServiceBridge === 'undefined') {
      return (fail || function () {})({ errorText: 'sin PalmServiceBridge (navegador)' });
    }
    var b = new PalmServiceBridge();
    b.onservicecallback = function (msg) {
      var r; try { r = JSON.parse(msg); } catch (e) { r = {}; }
      var cb = (r.returnValue === false) ? fail : ok;
      if (cb) cb(r);
    };
    b.call(uri, JSON.stringify(params || {}));
  }

  function launch(id) {
    setStatus('Abriendo ' + id + '...');
    luna('luna://com.webos.applicationManager/launch', { id: id }, function () { setStatus(''); },
      function (e) { setStatus('Error: ' + (e.errorText || 'no se pudo abrir')); });
  }

  function tile(a, container) {
    var d = document.createElement('div');
    d.className = 'tile';
    d.setAttribute('data-id', a.id);
    if (a.icon) { var im = document.createElement('img'); im.src = a.icon; im.onerror = function () { im.remove(); }; d.appendChild(im); }
    d.appendChild(document.createTextNode(a.title));
    d.onclick = function () { launch(a.id); };
    container.appendChild(d);
  }

  function render() {
    var favsEl = $('favs'), inEl = $('inputs'), allEl = $('all');
    favsEl.innerHTML = inEl.innerHTML = allEl.innerHTML = '';
    var byId = {}; apps.forEach(function (a) { byId[a.id] = a; });
    favs.forEach(function (id) { if (byId[id]) tile(byId[id], favsEl); });
    INPUTS.forEach(function (a) { tile(a, inEl); });
    apps.forEach(function (a) { tile(a, allEl); });
    tiles = Array.prototype.slice.call(document.querySelectorAll('.tile'));
    idx = Math.min(idx, tiles.length - 1);
    focus(idx);
  }

  function focus(i) {
    if (!tiles.length) return;
    tiles.forEach(function (t) { t.classList.remove('focus'); });
    idx = Math.max(0, Math.min(tiles.length - 1, i));
    tiles[idx].classList.add('focus');
    tiles[idx].scrollIntoView({ block: 'nearest' });
  }

  // Navegacion espacial por geometria (flechas del control)
  function move(dx, dy) {
    var cur = tiles[idx].getBoundingClientRect(), best = -1, bestD = 1e9;
    var cx = cur.left + cur.width / 2, cy = cur.top + cur.height / 2;
    tiles.forEach(function (t, i) {
      if (i === idx) return;
      var r = t.getBoundingClientRect(), x = r.left + r.width / 2, y = r.top + r.height / 2;
      var ox = x - cx, oy = y - cy;
      if (dx && (ox * dx <= 0 || Math.abs(oy) > Math.abs(ox))) return;
      if (dy && (oy * dy <= 0 || Math.abs(ox) > Math.abs(oy) * 2)) return;
      var d = ox * ox + oy * oy;
      if (d < bestD) { bestD = d; best = i; }
    });
    if (best >= 0) focus(best);
  }

  function toggleFav() {
    var id = tiles[idx].getAttribute('data-id');
    if (!apps.some(function (a) { return a.id === id; })) return;
    var p = favs.indexOf(id);
    if (p >= 0) favs.splice(p, 1); else favs.push(id);
    save(); render();
  }

  document.addEventListener('keydown', function (e) {
    switch (e.keyCode) {
      case 37: move(-1, 0); break;
      case 38: move(0, -1); break;
      case 39: move(1, 0); break;
      case 40: move(0, 1); break;
      case 13: tiles[idx] && launch(tiles[idx].getAttribute('data-id')); break;
      case 405: toggleFav(); break;            // boton amarillo
      case 461: case 27: if (window.webOS && webOS.platformBack) webOS.platformBack(); else window.close(); break; // atras
    }
  });

  function clock() {
    var d = new Date(), p = function (n) { return (n < 10 ? '0' : '') + n; };
    $('clock').textContent = p(d.getHours()) + ':' + p(d.getMinutes());
    $('date').textContent = d.toLocaleDateString('es', { weekday: 'long', day: 'numeric', month: 'long' });
  }
  setInterval(clock, 15000); clock();

  function loadApps() {
    luna('luna://com.webos.applicationManager/listApps', {}, function (r) {
      apps = (r.apps || []).filter(function (a) { return a.visible !== false && a.id !== 'com.mega.launcher'; })
        .map(function (a) { return { id: a.id, title: a.title, icon: a.icon }; })
        .sort(function (a, b) { return a.title.localeCompare(b.title); });
      render();
    }, function (e) {
      setStatus('No se pudo listar apps: ' + (e.errorText || ''));
      apps = [{ id: 'netflix', title: 'Netflix' }, { id: 'youtube.leanback.v4', title: 'YouTube' }];
      render();
    });
  }
  render(); loadApps();
})();
