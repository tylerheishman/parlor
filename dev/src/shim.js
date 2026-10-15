/* Family Games standalone runtime.
   The games were written for claude.ai's window.claude.use('db'|'user').
   On the standalone site this file provides the same small API, backed by
   Firebase Realtime Database. Each game stores its documents under
   r/<table code>/<game>/<path>. Bodies are stored as JSON text so arrays
   with nulls and empty arrays come back exactly as written. */
(function () {
  'use strict';
  if (window.claude && window.claude.use) return; // running inside claude.ai: use the real runtime
  var CFG = window.FAMILY_CONFIG || {};
  var GAME = (document.currentScript && document.currentScript.getAttribute('data-game')) || CFG.game || 'game';
  var qs = new URLSearchParams(location.search);

  function store(k, v) {
    for (var s of ['localStorage', 'sessionStorage']) {
      try { if (v === undefined) { var x = window[s].getItem(k); if (x) return x; } else window[s].setItem(k, v); } catch (e) {}
    }
    return null;
  }
  function clean(code) { return String(code || '').toLowerCase().replace(/[^a-z0-9-]/g, '').slice(0, 24); }

  // Table code: everyone with the same code shares the same online tables.
  var room = clean(qs.get('table'));
  if (room) store('fg_table', room);
  room = room || clean(store('fg_table')) || clean(CFG.table) || 'home';

  // Device id: one player per device. ?dev= is for automated tests only.
  var dev = clean(qs.get('dev')) || clean(store('fg_dev'));
  if (!dev) { dev = Math.random().toString(36).slice(2, 12); store('fg_dev', dev); }

  var ready = null;
  function load(src) {
    return new Promise(function (res, rej) {
      var s = document.createElement('script'); s.src = src; s.onload = res; s.onerror = rej; document.head.appendChild(s);
    });
  }
  function database() {
    if (ready) return ready;
    var fb = CFG.firebase;
    if (!fb || !fb.databaseURL) { ready = Promise.resolve(null); return ready; }
    var base = CFG.lib || '../lib/';
    ready = new Promise(function (resolve) {
      var t = setTimeout(function () { resolve(null); }, 15000);
      (window.firebase ? Promise.resolve() : load(base + 'firebase-app-compat.js'))
        .then(function () { return window.firebase.database ? null : load(base + 'firebase-database-compat.js'); })
        .then(function () {
          var app = window.firebase.apps.length ? window.firebase.app() : window.firebase.initializeApp(fb);
          var db = app.database();
          if (CFG.emulator) db.useEmulator(CFG.emulator.host, CFG.emulator.port);
          var offset = 0;
          db.ref('.info/serverTimeOffset').on('value', function (s) { offset = s.val() || 0; });
          clearTimeout(t);
          resolve({ db: db, now: function () { return Date.now() + offset; } });
        })
        .catch(function () { clearTimeout(t); resolve(null); });
    });
    return ready;
  }

  function freeze(o) { return o; }
  function snap(id, s) {
    var v = s && s.val();
    var body = null;
    if (v && typeof v.j === 'string') { try { body = JSON.parse(v.j); } catch (e) { body = null; } }
    return { id: id, exists: !!body, data: function () { return body ? freeze(body) : undefined; }, metadata: { fromCache: false, hasPendingWrites: false } };
  }
  function err(code, message) { var e = new Error(message || code); e.code = code; return e; }

  function docRef(F, path) {
    if (!/^[A-Za-z0-9_\-.~:@+]+(\/[A-Za-z0-9_\-.~:@+]+)*$/.test(path)) throw err('invalid_argument', 'bad path ' + path);
    var id = path.split('/').pop();
    var key = path.replace(/[.~:@+]/g, '_');
    var node = F.db.ref('r/' + room + '/' + GAME + '/' + key);
    var body = node.child('v');
    function write(obj) {
      if (!obj || typeof obj !== 'object') return Promise.reject(err('invalid_argument', 'data must be an object'));
      return body.set({ j: JSON.stringify(obj), t: window.firebase.database.ServerValue.TIMESTAMP })
        .catch(function (e) { throw err('unavailable', e && e.message); });
    }
    function merge(a, b) {
      var out = Object.assign({}, a);
      for (var k in b) {
        var x = b[k];
        if (x && typeof x === 'object' && !Array.isArray(x) && a[k] && typeof a[k] === 'object' && !Array.isArray(a[k])) out[k] = merge(a[k], x);
        else out[k] = x;
      }
      return out;
    }
    return {
      id: id, path: path,
      get: function () { return body.get().then(function (s) { return snap(id, s); }, function (e) { throw err('unavailable', e && e.message); }); },
      set: function (d) { return write(d); },
      update: function (d) {
        return body.get().then(function (s) {
          var cur = snap(id, s);
          if (!cur.exists) throw err('invalid_argument', 'document does not exist');
          return write(merge(cur.data(), d || {}));
        });
      },
      delete: function () { return body.remove(); },
      onSnapshot: function (next, onError) {
        var stopped = false;
        var cb = function (s) { if (!stopped) next(snap(id, s)); };
        var eb = function (e) { if (!stopped && onError) onError(err('unavailable', e && e.message)); };
        body.on('value', cb, eb);
        return function () { stopped = true; body.off('value', cb); };
      },
      acquire: function (o) {
        o = o || {};
        var holder = String(o.holder || dev);
        var ttl = Math.min(600000, Math.max(1000, o.ttlMs || 30000));
        var until = 0;
        return node.child('lease').transaction(function (cur) {
          var now = F.now();
          if (cur && cur.u > now && cur.h !== holder) return; // busy: abort
          until = now + ttl;
          return { h: holder, u: until };
        }, null, false).then(function (r) {
          var ok = !!(r && r.committed);
          var lease = r && r.snapshot && r.snapshot.val();
          var res = { acquired: ok, expiresAt: new Date((lease && lease.u) || until).toISOString() };
          if (ok) res.holder = holder;
          if (ok && o.data) {
            return body.get().then(function (s) { var c = snap(id, s); return write(c.exists ? merge(c.data(), o.data) : o.data); }).then(function () { return res; });
          }
          return res;
        }, function (e) { throw err('unavailable', e && e.message); });
      }
    };
  }

  var userNS = {
    id: function () { return Promise.resolve('d_' + dev); },
    me: function () { return Promise.resolve({ id: 'd_' + dev, name: '', guest: false }); },
    isOwner: function () { return false; },
    canEdit: function () { return true; },
    can: function () { return Promise.resolve(true); },
    profiles: function () { return Promise.resolve({}); }
  };

  var shim = {
    use: function (name) {
      if (name === 'user') return Promise.resolve(userNS);
      if (name === 'db') return database().then(function (F) {
        if (!F) return null;
        return { doc: function (p) { return docRef(F, p); } };
      });
      return Promise.resolve(null);
    }
  };
  window.claude = shim;
  window.FAMILY = { table: room, device: dev, game: GAME };
})();
