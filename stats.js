/* Lygames – anonymní statistiky návštěv.
   Neukládá cookies ani IP adresy. Každá záložka dostane náhodné ID, které zmizí po jejím zavření.
   Sbírá jen: kterou stránku/hru někdo otevřel, kolik sekund na ní aktivně byl, z jakého webu přišel,
   typ zařízení a jazyk prohlížeče. Vypnutí měření pro vlastní prohlížeč: lygames.cz/?nesledovat
   (zapnutí zpět: ?sledovat). */
(function () {
  try {
    var host = location.hostname;
    if (host !== 'lygames.cz' && host !== 'www.lygames.cz') return;
    if (navigator.webdriver) return;

    var q = location.search;
    try {
      if (/[?&]nesledovat\b/.test(q)) localStorage.setItem('lyg_nesledovat', '1');
      if (/[?&]sledovat\b/.test(q)) localStorage.removeItem('lyg_nesledovat');
      if (localStorage.getItem('lyg_nesledovat') === '1') return;
    } catch (e) {}

    var ENDPOINT = 'https://ttgjzbpglgerxvbmaqdt.supabase.co/rest/v1/rpc/lyg_track?apikey=' +
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR0Z2p6YnBnbGdlcnh2Ym1hcWR0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTIwOTgxNTksImV4cCI6MjEwNzY3NDE1OX0.7ptBAWJdyZFkXz02ZLAYIuID4GmxuYvrHJCZPQkTNCk';

    var m = location.pathname.match(/\/hry\/([a-z0-9-]+)/);
    var page = m ? m[1] : 'home';

    var sid;
    try {
      sid = sessionStorage.getItem('lyg_sid');
      if (!sid) { sid = Math.random().toString(36).slice(2, 12) + Date.now().toString(36).slice(-4); sessionStorage.setItem('lyg_sid', sid); }
    } catch (e) { sid = Math.random().toString(36).slice(2, 14); }

    function send(obj) {
      obj.s = sid; obj.p = page;
      var body = JSON.stringify(obj);
      try {
        if (navigator.sendBeacon && navigator.sendBeacon(ENDPOINT, body)) return;
      } catch (e) {}
      try { fetch(ENDPOINT, { method: 'POST', body: body, mode: 'no-cors', keepalive: true }); } catch (e) {}
    }

    var ref = '';
    try {
      if (document.referrer) {
        var rh = new URL(document.referrer).hostname.replace(/^www\./, '');
        if (rh && rh !== 'lygames.cz') ref = rh;
      }
    } catch (e) {}
    var w = Math.min(screen.width || innerWidth, innerWidth || 9999);
    var coarse = window.matchMedia && matchMedia('(pointer: coarse)').matches;
    var device = w < 768 ? 'mobil' : (coarse && w < 1300 ? 'tablet' : 'pocitac');

    send({ k: 'view', r: ref, d: device, l: (navigator.language || '').slice(0, 12) });

    // Aktivní čas: počítá se jen když je stránka vidět.
    var since = document.visibilityState === 'visible' ? Date.now() : 0;
    var acc = 0;
    function flush() {
      if (since) { acc += Date.now() - since; since = document.visibilityState === 'visible' ? Date.now() : 0; }
      var secs = Math.round(acc / 1000);
      if (secs >= 1) { acc = 0; send({ k: 'time', t: Math.min(secs, 1800) }); }
    }
    document.addEventListener('visibilitychange', function () {
      if (document.visibilityState === 'visible') { if (!since) since = Date.now(); }
      else flush();
    });
    addEventListener('pagehide', flush);
    setInterval(function () { if (document.visibilityState === 'visible') flush(); }, 120000);
  } catch (e) {}
})();
