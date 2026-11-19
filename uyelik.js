// 12. Adam — üyelik, koltuk, çevrimiçi göstergesi ve canlı sohbet (Firebase Realtime Database + Authentication)
// Yapı ve kurallar: isler/bjk_stadyum/firebase/ (database.rules.json). ?emu=1 → yerel emülatör.
import {initializeApp} from 'https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js';
import {getAuth, onAuthStateChanged, GoogleAuthProvider, signInWithPopup, signInWithRedirect, getRedirectResult,
  createUserWithEmailAndPassword, signInWithEmailAndPassword, sendPasswordResetEmail, signOut, deleteUser,
  connectAuthEmulator, browserLocalPersistence, setPersistence} from 'https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js';
import {getDatabase, ref, onValue, onChildAdded, onChildRemoved, onChildChanged, get, update, set, remove, push,
  runTransaction, onDisconnect, serverTimestamp, query, orderByChild, limitToLast, connectDatabaseEmulator} from 'https://www.gstatic.com/firebasejs/10.14.1/firebase-database.js';

const firebaseConfig = {
  "apiKey": "AIzaSyDwe7gEkFZIqedb95KfKQmCFE6fWggWjEs",
  "authDomain": "onikinciadam.firebaseapp.com",
  "databaseURL": "https://onikinciadam-default-rtdb.europe-west1.firebasedatabase.app",
  "projectId": "onikinciadam",
  "storageBucket": "onikinciadam.firebasestorage.app",
  "messagingSenderId": "678761783635",
  "appId": "1:678761783635:web:bc26e6b8defdfc8a0a41a6"
};
const YONETICI_EPOSTA = 'baranyenenofficial@gmail.com';

/* ---------------- stil + arayüz ---------------- */
const css = `
#uyelik{position:fixed;inset:0;pointer-events:none;z-index:8;font-family:system-ui,-apple-system,"Segoe UI",Roboto,sans-serif}
#uyelik button{font:800 13px system-ui;border-radius:10px;border:1px solid #444;background:rgba(12,12,13,.92);color:#fff;padding:9px 12px;cursor:pointer}
#uyelik button.ana{background:#f5f5f2;color:#0c0c0d;border-color:#f5f5f2}
#uyelik button.kirmizi{background:#e30a17;border-color:#e30a17}
.u-ust{position:absolute;right:12px;top:34px;display:flex;flex-direction:column;align-items:flex-end;gap:6px;pointer-events:auto}
.u-sayac{background:rgba(12,12,13,.86);border:1px solid #3a3a3a;border-radius:12px;padding:6px 10px;font:700 12px system-ui;color:#fff}
.u-sayac i{display:inline-block;width:8px;height:8px;border-radius:50%;background:#20c35a;margin-right:5px;box-shadow:0 0 6px #20c35a}
.u-modal{position:absolute;inset:0;background:rgba(0,0,0,.55);display:none;align-items:center;justify-content:center;pointer-events:auto;padding:16px}
.u-modal.ac{display:flex}
.u-kutu{background:#121214;border:1px solid #333;border-radius:16px;padding:18px;max-width:360px;width:100%;color:#f5f5f2;max-height:86vh;overflow:auto}
.u-kutu h3{margin:0 0 4px;font:900 19px system-ui}.u-kutu p{margin:6px 0 12px;font-size:13px;opacity:.85;line-height:1.4}
.u-kutu input{width:100%;box-sizing:border-box;font:600 16px system-ui;padding:11px 12px;border-radius:10px;border:1px solid #444;background:#1d1d20;color:#fff;margin:5px 0}
.u-kutu .satir{display:flex;gap:8px;margin-top:10px}.u-kutu .satir button{flex:1}
.u-kutu label{display:flex;gap:8px;align-items:flex-start;font-size:12px;margin:10px 0;opacity:.9}
.u-kutu .hata{color:#ff6b6b;font:700 12px system-ui;min-height:16px}
.u-kutu a{color:#9cc8ff}
.u-ayrac{display:flex;align-items:center;gap:8px;margin:12px 0;font-size:11px;opacity:.6}.u-ayrac:before,.u-ayrac:after{content:"";flex:1;height:1px;background:#444}
.u-sohbet{position:absolute;right:12px;bottom:62px;width:min(360px,calc(100vw - 24px));height:min(52vh,460px);background:rgba(12,12,13,.94);border:1px solid #333;border-radius:14px;display:none;flex-direction:column;pointer-events:auto;overflow:hidden}
.u-sohbet.ac{display:flex}
.u-sbas{display:flex;align-items:center;justify-content:space-between;padding:9px 12px;border-bottom:1px solid #2a2a2a;font:800 14px system-ui;color:#fff}
.u-mesajlar{flex:1;overflow-y:auto;padding:8px 10px;display:flex;flex-direction:column;gap:6px}
.u-m{font-size:13px;line-height:1.35;color:#eee;word-wrap:break-word}
.u-m b{color:#fff;cursor:pointer}.u-m small{opacity:.55;font-size:10px;margin-left:4px}
.u-m .ic{opacity:.5;cursor:pointer;margin-left:6px;font-size:11px}
.u-m.ben b{color:#ff4d57}
.u-yaz{display:flex;gap:6px;padding:8px;border-top:1px solid #2a2a2a}
.u-yaz input{flex:1;min-width:0;font:600 15px system-ui;padding:9px 10px;border-radius:10px;border:1px solid #444;background:#1d1d20;color:#fff}
.u-bilgi{font:600 12px system-ui;color:#bbb;padding:6px 12px}
.u-toast{position:absolute;left:50%;top:70px;transform:translateX(-50%);background:#f5f5f2;color:#111;font:800 13px system-ui;padding:8px 14px;border-radius:10px;display:none;pointer-events:none}
.u-isim{position:fixed;transform:translate(-50%,-100%);pointer-events:none;background:rgba(12,12,13,.82);color:#fff;font:700 11px system-ui;padding:2px 7px;border-radius:7px;white-space:nowrap;display:none;z-index:4;border-left:3px solid #20c35a}
.u-isim.kapali{border-left-color:#777;color:#bbb}.u-isim.ben{background:#e30a17;border-left-color:#fff;font-weight:900}
.u-balon{position:fixed;transform:translate(-50%,-100%);pointer-events:none;background:#fff;color:#111;font:700 12.5px/1.3 system-ui;padding:6px 10px;border-radius:12px;max-width:190px;width:max-content;text-align:left;display:none;z-index:5;box-shadow:0 3px 10px rgba(0,0,0,.45);overflow-wrap:anywhere}
.u-balon span{display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden}
.u-balon:after{content:'';position:absolute;left:50%;bottom:-7px;margin-left:-7px;border:7px solid transparent;border-bottom:0;border-top-color:#fff}
.u-balon.ben{background:#e30a17;color:#fff}.u-balon.ben:after{border-top-color:#e30a17}
.u-emoji{position:fixed;transform:translate(-50%,-100%);pointer-events:none;font-size:26px;display:none;z-index:4;filter:drop-shadow(0 2px 3px #000)}
.u-hareket{position:absolute;left:68px;bottom:62px;display:none;gap:5px;pointer-events:auto;flex-wrap:wrap;max-width:calc(100vw - 150px)}
.u-hareket.ac{display:flex}.u-hareket button{padding:7px 9px!important;font-size:17px!important}
.u-dolap{position:absolute;left:0;right:0;bottom:0;background:rgba(18,18,20,.97);border-top:2px solid #e30a17;border-radius:16px 16px 0 0;padding:14px 14px 18px;transform:translateY(105%);transition:transform .25s;max-height:56vh;overflow:auto;pointer-events:auto;color:#fff}
.u-dolap.ac{transform:none}.u-dolap h3{margin:0 0 4px;font:900 17px system-ui}.u-dolap h4{margin:10px 0 6px;font:800 11px system-ui;opacity:.75;letter-spacing:.6px}
.u-secenek{display:flex;gap:7px;flex-wrap:wrap}.u-secenek button{min-width:42px;height:38px;padding:0 10px!important;border:2px solid #333!important}
.u-secenek button.sec{border-color:#e30a17!important;box-shadow:0 0 0 2px #e30a17}
@media (max-width:640px){.u-ust{top:62px}.u-dolap h4{margin:7px 0 4px}.u-secenek button{height:34px}}
`;
document.head.insertAdjacentHTML('beforeend', `<style>${css}</style>`);
const kok = document.getElementById('uyelik');
kok.innerHTML = `
<div class="u-ust">
  <div class="u-sayac" id="uSayac"><i></i><span id="uCanli">0</span> kişi şu an statta · <span id="uUye">0</span> üye</div>
  <div style="display:flex;gap:6px"><button id="uGiydirBtn" style="display:none">👕</button><button id="uSohbetBtn">💬 Sohbet</button><button id="uGirisBtn" class="ana">Kayıt ol / Giriş</button></div>
</div>
<div class="u-hareket" id="uHareket"></div>
<div class="u-dolap" id="uDolap"><h3>👕 Karakterini giydir</h3><div style="font:600 12px system-ui;opacity:.75">Herkes seni böyle görür. Çevrimiçiyken renklisin, çıkınca gri.</div>
  <h4>FORMA</h4><div class="u-secenek" id="uS_f"></div><h4>TEN</h4><div class="u-secenek" id="uS_t"></div>
  <h4>SAÇ</h4><div class="u-secenek" id="uS_s"></div><h4>AKSESUAR</h4><div class="u-secenek" id="uS_x"></div>
  <div class="satir" style="display:flex;gap:8px;margin-top:12px"><button id="uDolapKapat" class="ana" style="flex:1">Tamam</button><button id="uKoltukDegis" style="flex:1">🪑 Koltuk değiştir</button></div></div>
<div class="u-sohbet" id="uSohbet">
  <div class="u-sbas"><span>💬 Canlı sohbet</span><button id="uSohbetKapat" style="padding:4px 9px">✕</button></div>
  <div class="u-mesajlar" id="uMesajlar"></div>
  <div class="u-yaz" id="uYaz"><input id="uMesaj" maxlength="200" placeholder="Mesaj yaz…" autocomplete="off"><button id="uGonder" class="ana">Gönder</button></div>
</div>
<div class="u-modal" id="uGiris"><div class="u-kutu">
  <h3>12. Adam'a katıl</h3><p>Kayıt ol, stattaki koltuğun adınla dolsun. Sitedeyken tribünde parlarsın, sohbete yazabilirsin.</p>
  <button id="uGoogle" class="ana" style="width:100%">Google ile devam et</button>
  <div class="u-ayrac">ya da e-posta</div>
  <input id="uEposta" type="email" placeholder="E-posta" autocomplete="email">
  <input id="uSifre" type="password" placeholder="Şifre (en az 6 karakter)" autocomplete="current-password">
  <div class="hata" id="uGirisHata"></div>
  <div class="satir"><button id="uEGiris">Giriş yap</button><button id="uEKayit" class="ana">Kayıt ol</button></div>
  <p style="margin-top:10px"><a href="#" id="uSifreUnut">Şifremi unuttum</a> · <a href="#" class="uKvkkAc">Gizlilik / KVKK</a></p>
  <button id="uGirisKapat" style="width:100%;margin-top:4px">Vazgeç</button>
</div></div>
<div class="u-modal" id="uKoltuk"><div class="u-kutu">
  <h3>Koltuğunu al</h3><p>Tribünde ve sohbette görünecek adını yaz. Koltuğun otomatik verilir: önce Kapalı'nın alt katı dolar.</p>
  <input id="uAd" maxlength="20" placeholder="Görünen ad (3–20 harf)" autocomplete="nickname">
  <label><input type="checkbox" id="uKvkkOnay" style="width:auto;margin-top:2px"> <span><a href="#" class="uKvkkAc">Aydınlatma metnini</a> okudum; adımın sitede herkese görünmesini kabul ediyorum.</span></label>
  <div class="hata" id="uKoltukHata"></div>
  <div class="satir"><button id="uKoltukVazgec">Sonra</button><button id="uKoltukAl" class="kirmizi">Koltuğumu al</button></div>
</div></div>
<div class="u-modal" id="uHesap"><div class="u-kutu">
  <h3 id="uHesapAd">Hesabım</h3><p id="uHesapKoltuk"></p>
  <div class="satir"><button id="uKoltugumaGit" class="ana">Koltuğuma git</button></div>
  <div class="satir"><button id="uCikis">Çıkış yap</button><button id="uHesapKapat">Kapat</button></div>
  <div class="u-ayrac">tehlikeli bölge</div>
  <button id="uHesapSil" style="width:100%;border-color:#e30a17;color:#ff6b6b">Hesabımı ve koltuğumu sil</button>
  <div class="hata" id="uHesapHata"></div>
</div></div>
<div class="u-modal" id="uKvkk"><div class="u-kutu">
  <h3>Aydınlatma metni (KVKK)</h3>
  <p><b>Ne topluyoruz?</b> Giriş için e-posta adresin (Google ile girersen Google hesabının e-postası) ve senin yazdığın görünen ad. Sohbete yazdığın mesajlar ve sitede olup olmadığın bilgisi.</p>
  <p><b>Ne için?</b> Sana bir koltuk vermek, adını tribünde ve sohbette göstermek, sohbeti küfür/spam'den korumak. E-posta adresin sitede kimseye gösterilmez.</p>
  <p><b>Nerede?</b> Google Firebase (Avrupa sunucuları). Üçüncü kişilerle paylaşılmaz, satılmaz, reklam için kullanılmaz.</p>
  <p><b>Haklarının hepsi sende:</b> "Hesabım → Hesabımı ve koltuğumu sil" ile adın, koltuğun ve hesabın anında silinir. Sorular: Instagram'da @12.adam sayfasına mesaj.</p>
  <p style="opacity:.6">Bu site Beşiktaş JK'nın resmî sitesi değildir; 12. Adam taraftar sayfasının projesidir.</p>
  <button id="uKvkkKapat" class="ana" style="width:100%">Tamam</button>
</div></div>
<div class="u-toast" id="uToast"></div>`;
const $ = id => document.getElementById(id);
const ac = (id, a = true) => $(id).classList.toggle('ac', a);
function toast(m, ms = 2600) { const t = $('uToast'); t.textContent = m; t.style.display = 'block'; clearTimeout(toast.z); toast.z = setTimeout(() => t.style.display = 'none', ms); }
const kacis = s => String(s).replace(/[&<>"']/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[c]));

/* ---------------- küfür / bahis / bağlantı filtresi ---------------- */
const YASAK = ['amk','aq','amq','amına','amina','aminakoy','amcık','amcik','orospu','orosbu','piç','pic','siktir','sikik','sikim','sikiş','sikis','sikerim','sikeyim','yarrak','yarak','yarrağ','oç','göt','got','gavat','pezevenk','kahpe','ibne','yavşak','yavsak','şerefsiz','serefsiz','puşt','pust','dalyarak','ananı','anani','bacını','bacini',
  'bahis','betting','casino','kumar','iddaa','bonus','freespin','deneme bonusu','promosyon kodu','t.me','telegram','whatsapp','http','www.','.com','.net'];
function normal(s) { return s.toLocaleLowerCase('tr').replace(/[1!|]/g, 'i').replace(/3/g, 'e').replace(/0/g, 'o').replace(/@/g, 'a').replace(/\$/g, 's').replace(/[\s._*\-]+/g, ''); }
function temizMi(s) {
  const n = normal(s), kelimeler = s.toLocaleLowerCase('tr').split(/[^a-zçğıöşü0-9.]+/);
  for (const y of YASAK) {
    const yn = normal(y);
    if (y.length <= 3 ? (kelimeler.some(k => normal(k) === yn) || n === yn || n.startsWith(yn + '') && n.length <= yn.length + 2) : n.includes(yn)) return false;
  }
  return true;
}

/* ---------------- Firebase ---------------- */
const emu = new URLSearchParams(location.search).get('emu') === '1';
const app = initializeApp(firebaseConfig);
const auth = getAuth(app); setPersistence(auth, browserLocalPersistence).catch(() => {});
const db = getDatabase(app);
if (emu) { connectAuthEmulator(auth, 'http://127.0.0.1:9099', {disableWarnings: true}); connectDatabaseEmulator(db, '127.0.0.1', 9000); }

/* ---------------- stat hazır olunca ---------------- */
await new Promise(r => { const b = () => window.__STAT ? r() : setTimeout(b, 100); b(); });
const S = window.__STAT, THREE = S.THREE;
const KOLTUK_SAY = S.koltuklar.length; // 42.684

// Atama sırası (sabit!): önce Kapalı alt, Numaralı alt, Yeni Açık alt, Eski Açık alt, köşeler alt; sonra üst kat aynı sırayla.
// Her bölümde önden arkaya sıra sıra, sıra içinde tribünün ortasından kenarlara. Koltuk numarası n = 1..42.684.
const ONCELIK = {'Kapalı': 0, 'Numaralı': 1, 'Yeni Açık': 2, 'Eski Açık': 3};
const MERKEZ = {'Kapalı': 90, 'Numaralı': 270, 'Yeni Açık': 0, 'Eski Açık': 180};
const sira = S.koltuklar.map((k, i) => {
  const dl = S.dilim(k.t), kose = !!dl.kose, ad = dl.ad;
  let a = (k.t * 180 / Math.PI + 360) % 360, m = MERKEZ[ad], fark = Math.abs(((a - m + 540) % 360) - 180);
  return {i, anahtar: [k.kat, kose ? 4 : ONCELIK[ad], k.r, fark]};
}).sort((x, y) => { for (let j = 0; j < 4; j++) if (x.anahtar[j] !== y.anahtar[j]) return x.anahtar[j] - y.anahtar[j]; return x.i - y.i; }).map(o => o.i);
const nIndeks = n => sira[n - 1];                       // koltuk no → sahnedeki koltuk
const indeksN = new Int32Array(KOLTUK_SAY); sira.forEach((idx, j) => indeksN[idx] = j + 1);

/* ---------------- taraftar figürleri (5. Tribün karakteri; yalnız dolu koltuklar) ----------------
   govde = forma + kollar (örnek rengi = forma), kafa = pantolon, eller, yüz, saç, gözler (köşe renkli; örnek rengi = ten).
   Uzakta sade model (LOD). Çevrimiçi olan hafifçe sallanır (gölgelendirici), çevrimdışı gri. Kendi karakterin ayrıca detaylı çizilir. */
const {mergeGeometries} = await import('three/addons/utils/BufferGeometryUtils.js');
const _kb = (w, h, d, x, y, z, rx = 0) => { const g = new THREE.BoxGeometry(w, h, d); if (rx) g.rotateX(rx); return g.translate(x, y, z); };
const _boya = (g, c) => { const n = g.attributes.position.count, a = new Float32Array(n * 3), k = new THREE.Color(c); for (let i = 0; i < n; i++) { a[i * 3] = k.r; a[i * 3 + 1] = k.g; a[i * 3 + 2] = k.b; } g.setAttribute('color', new THREE.BufferAttribute(a, 3)); return g; };
const _bel = (g, alt = 0.84) => { const p = g.attributes.position; g.computeBoundingBox(); const b = g.boundingBox; for (let i = 0; i < p.count; i++) { const t = (p.getY(i) - b.min.y) / (b.max.y - b.min.y); p.setX(i, p.getX(i) * (alt + (1 - alt) * t)); } return g; };
const YS = 0.21, PANT = '#2a2f3a', SAC = '#1d1611';
const govdeG = mergeGeometries([_bel(_kb(0.36, 0.46, 0.22, 0, YS + 0.27, -0.05)), _kb(0.1, 0.36, 0.11, -0.235, YS + 0.29, 0.02, -0.55), _kb(0.1, 0.36, 0.11, 0.235, YS + 0.29, 0.02, -0.55)]);
const kafaG = mergeGeometries([_boya(_kb(0.34, 0.14, 0.42, 0, YS + 0.07, 0.15), PANT), _boya(_kb(0.3, 0.4, 0.12, 0, YS - 0.13, 0.37), PANT),
  _boya(_kb(0.09, 0.09, 0.1, -0.22, YS + 0.13, 0.2), '#ffffff'), _boya(_kb(0.09, 0.09, 0.1, 0.22, YS + 0.13, 0.2), '#ffffff'),
  _boya(_kb(0.24, 0.27, 0.24, 0, YS + 0.66, -0.04), '#ffffff'), _boya(_kb(0.26, 0.08, 0.26, 0, YS + 0.81, -0.05), SAC), _boya(_kb(0.26, 0.15, 0.06, 0, YS + 0.72, -0.165), SAC),
  _boya(_kb(0.045, 0.05, 0.02, -0.06, YS + 0.68, 0.085), '#15100c'), _boya(_kb(0.045, 0.05, 0.02, 0.06, YS + 0.68, 0.085), '#15100c')]);
const govdeSadeG = _kb(0.38, 0.5, 0.28, 0, YS + 0.29, -0.03), kafaSadeG = _boya(_kb(0.25, 0.27, 0.25, 0, YS + 0.67, -0.04), '#ffffff');
const canliAtt = new THREE.InstancedBufferAttribute(new Float32Array(KOLTUK_SAY), 1);   // 1 = çevrimiçi (sallanır)
const ziplaAtt = new THREE.InstancedBufferAttribute(new Float32Array(KOLTUK_SAY).fill(-99), 1); // zıplama başlangıcı (sn)
for (const g of [govdeG, kafaG, govdeSadeG, kafaSadeG]) { g.setAttribute('aCanli', canliAtt); g.setAttribute('aZipla', ziplaAtt); }
const zaman = {value: 0};
const hareketli = m => { m.onBeforeCompile = sh => { sh.uniforms.uZaman = zaman;
  sh.vertexShader = 'attribute float aCanli;\nattribute float aZipla;\nuniform float uZaman;\n' + sh.vertexShader.replace('#include <begin_vertex>',
    `#include <begin_vertex>
     float faz = float(gl_InstanceID)*1.7;
     transformed.x += aCanli * 0.035 * sin(uZaman*1.8 + faz) * max(position.y - 0.2, 0.0);
     float zt = uZaman - aZipla; if (zt > 0.0 && zt < 1.6) transformed.y += 0.55 * abs(sin(zt*5.9)) * (1.0 - zt/1.6);`); }; return m; };
const govdeMat = hareketli(new THREE.MeshStandardMaterial({roughness: 0.8}));
const kafaMat = hareketli(new THREE.MeshStandardMaterial({roughness: 0.8, vertexColors: true}));
const yap = g => { const m = new THREE.InstancedMesh(g, g === kafaG || g === kafaSadeG ? kafaMat : govdeMat, KOLTUK_SAY); m.count = 0; m.frustumCulled = false; m.instanceMatrix.setUsage(THREE.DynamicDrawUsage); S.statGrubu.add(m); return m; };
const GOVDE = yap(govdeG), KAFA = yap(kafaG), GOVDE_S = yap(govdeSadeG), KAFA_S = yap(kafaSadeG);
GOVDE.setColorAt(0, new THREE.Color()); KAFA.setColorAt(0, new THREE.Color());
GOVDE_S.instanceMatrix = GOVDE.instanceMatrix; KAFA_S.instanceMatrix = KAFA.instanceMatrix; GOVDE_S.instanceColor = GOVDE.instanceColor; KAFA_S.instanceColor = KAFA.instanceColor;
const FIG = GOVDE; // geriye dönük
window.__KARE.push(t => { zaman.value = t / 1000;
  const uzak = S.cam.position.distanceTo(S.ctl.target) > 150;
  GOVDE.visible = KAFA.visible = !uzak; GOVDE_S.visible = KAFA_S.visible = uzak; GOVDE_S.count = KAFA_S.count = GOVDE.count; });
const nokta = new THREE.InstancedMesh(new THREE.SphereGeometry(0.1, 8, 6), new THREE.MeshBasicMaterial({color: 0x20e36a}), 4000); nokta.count = 0; nokta.frustumCulled = false;
S.statGrubu.add(nokta);

/* ---------------- dolap: forma, ten, saç, aksesuar (herkes görür: gorunum/{uid}) ---------------- */
const DOLAP = {
  f: [['siyah', 'Siyah', '#151517'], ['beyaz', 'Beyaz', '#f2f2ef'], ['cubuk', 'Çubuklu', '#f2f2ef'], ['kirmizi', 'Kırmızı', '#c8102e'], ['gri', 'Antrasit', '#4a4d52'], ['lacivert', 'Lacivert', '#1b2440']],
  t: [['1', '', '#f0c8a0'], ['2', '', '#e0b08a'], ['3', '', '#c98f63'], ['4', '', '#a8714a'], ['5', '', '#7a4f32']],
  s: [['kel', 'Kel', null], ['kisa', 'Kısa siyah', '#1b1410'], ['kahve', 'Kısa kahve', '#5a3720'], ['sari', 'Kısa sarı', '#d8b45a'], ['uzun', 'Uzun siyah', '#1b1410'], ['kizil', 'Uzun kızıl', '#7a3a1c']],
  x: [['atki', 'Atkı', null], ['yok', 'Yok', null], ['bere', 'Bere', null], ['bayrak', 'Bayrak', null], ['kollar', 'Kollar havada', null]],
};
const renkOf = (tur, k) => (DOLAP[tur].find(o => o[0] === k) || DOLAP[tur][0])[2];
const VARSAYILAN = {f: 'siyah', t: '2', s: 'kisa', x: 'atki'};
const gorunum = new Map(); // uid → {f,t,s,x}
const gorunumAl = uid => Object.assign({}, VARSAYILAN, gorunum.get(uid) || {});

/* ---------------- kendi karakterin (detaylı, hareketli) ---------------- */
const benAvatar = new THREE.Group(); benAvatar.visible = false; S.statGrubu.add(benAvatar);
const parcalar = {}; // animasyon için: kolL, kolR, govde, kafa, bayrak
const cubukDoku = (() => { const c = document.createElement('canvas'); c.width = 64; c.height = 64; const x = c.getContext('2d');
  for (let i = 0; i < 8; i++) { x.fillStyle = i % 2 ? '#f2f2ef' : '#151517'; x.fillRect(i * 8, 0, 8, 64); } const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t; })();
const bayrakDoku = (() => { const c = document.createElement('canvas'); c.width = 128; c.height = 80; const x = c.getContext('2d');
  for (let i = 0; i < 8; i++) { x.fillStyle = i % 2 ? '#f2f2ef' : '#151517'; x.fillRect(i * 16, 0, 16, 80); }
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace;
  const a = new Image(); a.onload = () => { x.drawImage(a, 64 - 22, 40 - 36, 44, 72); t.needsUpdate = true; }; a.src = 'arma.png'; return t; })();
function avatarKur() {
  benAvatar.clear(); for (const k in parcalar) delete parcalar[k];
  const G = gorunumAl(ben?.uid), forma = renkOf('f', G.f), ten = renkOf('t', G.t), sac = renkOf('s', G.s);
  const mat = c => new THREE.MeshStandardMaterial({color: c, roughness: 0.75});
  const formaMat = G.f === 'cubuk' ? new THREE.MeshStandardMaterial({map: cubukDoku, roughness: 0.75}) : mat(forma);
  const kutu = (w, h, d, m, x, y, z, ust = benAvatar) => { const o = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), typeof m === 'string' ? mat(m) : m); o.position.set(x, y, z); ust.add(o); return o; };
  const govde = new THREE.Group(); benAvatar.add(govde); parcalar.govde = govde;
  kutu(0.34, 0.14, 0.42, PANT, 0, YS + 0.07, 0.15, govde); kutu(0.3, 0.4, 0.12, PANT, 0, YS - 0.13, 0.37, govde);    // bacaklar
  kutu(0.11, 0.08, 0.2, '#111', -0.08, YS - 0.32, 0.42, govde); kutu(0.11, 0.08, 0.2, '#111', 0.08, YS - 0.32, 0.42, govde); // ayakkabılar
  kutu(0.38, 0.48, 0.24, formaMat, 0, YS + 0.37, -0.04, govde);                                                     // forma
  if (G.f !== 'cubuk') kutu(0.39, 0.06, 0.25, G.f === 'siyah' ? '#f2f2ef' : '#151517', 0, YS + 0.5, -0.04, govde); // göğüs şeridi
  const kafa = new THREE.Group(); kafa.position.set(0, YS + 0.68, -0.04); govde.add(kafa); parcalar.kafa = kafa;
  kutu(0.26, 0.28, 0.26, ten, 0, 0, 0, kafa); kutu(0.045, 0.05, 0.02, '#15100c', -0.06, 0.02, 0.131, kafa); kutu(0.045, 0.05, 0.02, '#15100c', 0.06, 0.02, 0.131, kafa);
  kutu(0.08, 0.02, 0.02, '#8a3b30', 0, -0.07, 0.131, kafa);                                                       // ağız
  if (sac) { kutu(0.28, 0.08, 0.28, sac, 0, 0.15, -0.01, kafa); if (G.s === 'uzun' || G.s === 'kizil') kutu(0.28, 0.32, 0.07, sac, 0, -0.02, -0.15, kafa); else kutu(0.28, 0.14, 0.06, sac, 0, 0.07, -0.13, kafa); }
  if (G.x === 'bere') { kutu(0.29, 0.13, 0.29, '#151517', 0, 0.17, 0, kafa); kutu(0.3, 0.05, 0.3, '#f2f2ef', 0, 0.11, 0, kafa); kutu(0.09, 0.09, 0.09, '#f2f2ef', 0, 0.28, 0, kafa); }
  if (G.x === 'atki') { kutu(0.36, 0.09, 0.3, '#151517', 0, YS + 0.6, -0.03, govde); kutu(0.1, 0.32, 0.04, '#f2f2ef', 0.1, YS + 0.4, 0.1, govde); kutu(0.1, 0.08, 0.05, '#151517', 0.1, YS + 0.22, 0.1, govde); }
  for (const sx of [-1, 1]) { // kollar: omuzdan döner
    const kol = new THREE.Group(); kol.position.set(sx * 0.25, YS + 0.55, -0.02); govde.add(kol);
    kutu(0.11, 0.34, 0.12, formaMat, 0, -0.16, 0, kol); kutu(0.1, 0.1, 0.1, ten, 0, -0.36, 0, kol);
    kol.rotation.x = -0.55; parcalar[sx < 0 ? 'kolL' : 'kolR'] = kol; }
  if (G.x === 'bayrak') { const sap = new THREE.Group(); sap.position.set(0, -0.36, 0); parcalar.kolR.add(sap);
    kutu(0.03, 1.5, 0.03, '#2a2f40', 0, 0.7, 0, sap);
    const b = new THREE.Mesh(new THREE.PlaneGeometry(0.9, 0.56, 8, 1), new THREE.MeshStandardMaterial({map: bayrakDoku, side: THREE.DoubleSide, roughness: 0.8})); b.position.set(0.47, 1.18, 0); sap.add(b); parcalar.bayrak = b; }
  { const isik = new THREE.PointLight(0xfff1d6, 6, 6, 1.6); isik.position.set(0, 1.6, 1.4); benAvatar.add(isik); }
}
function benAvatarYerlestir() {
  benAvatar.visible = !!benN;
  if (!benN) return; const k = S.koltuklar[nIndeks(benN)];
  benAvatar.position.set(k.x, k.y + 0.25, k.z); benAvatar.rotation.set(0, k.ry, 0);
}
// hareketler (kendi karakterin) — süre sn
let hareket = null; const HAREKET = {selam: ['👋', 'El salla'], alkis: ['👏', 'Alkış'], zipla: ['🦘', 'Zıpla'], gol: ['🙌', 'Gol!'], atki: ['🧣', 'Atkı salla'], otur: ['🪑', 'Otur']};
function hareketBaslat(h) { hareket = {h, t0: performance.now() / 1000}; }
window.__KARE.push(t => {
  if (!benAvatar.visible) return; const s = t / 1000, P = parcalar; if (!P.kolL) return;
  const G = gorunumAl(ben?.uid), varsayilanKol = G.x === 'kollar' ? -2.6 : -0.55;
  let kL = varsayilanKol, kR = G.x === 'bayrak' ? -2.4 : varsayilanKol, zL = 0, zR = 0, y = 0, egim = 0;
  if (hareket) { const d = s - hareket.t0, h = hareket.h;
    if (d > 3.2) hareket = null;
    else if (h === 'selam') { kR = -2.7; zR = -0.35 + 0.45 * Math.sin(d * 11); }
    else if (h === 'alkis') { kL = kR = -1.25; zL = 0.55 + 0.35 * Math.sin(d * 18); zR = -zL; }
    else if (h === 'zipla') { y = 0.55 * Math.abs(Math.sin(d * 5.9)) * Math.max(0, 1 - d / 3.2); kL = kR = -2.5; }
    else if (h === 'gol') { kL = kR = -2.9; zL = 0.35; zR = -0.35; y = 0.35 * Math.abs(Math.sin(d * 4)); egim = -0.15; }
    else if (h === 'atki') { kL = kR = -2.75; zL = 0.25 + 0.3 * Math.sin(d * 9); zR = -0.25 + 0.3 * Math.sin(d * 9); } }
  else { y = 0.02 * Math.sin(s * 2.1); }
  P.kolL.rotation.x = kL; P.kolR.rotation.x = kR; P.kolL.rotation.z = zL; P.kolR.rotation.z = zR; P.govde.position.y = y; P.govde.rotation.x = egim;
  if (P.bayrak) { const pa = P.bayrak.geometry.attributes.position; for (let j = 0; j < pa.count; j++) { const x = pa.getX(j); pa.setZ(j, Math.sin(s * 5.5 + x * 4) * 0.07 * (x + 0.45)); } pa.needsUpdate = true; }
});

/* ---------------- durum ---------------- */
const koltuk = new Map();   // n → {u,a}
const uidN = new Map();     // uid → n
const cevrimici = new Set();// uid
let ben = null, benN = null, benAd = null, yonetici = false;
const figSira = [];         // figür sırası → n
const nFig = new Map();     // n → figür sırası
const SIFIR = new THREE.Vector3(0, 0, 0), m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), e3 = new THREE.Euler(), v3 = new THREE.Vector3(), s3 = new THREE.Vector3(1, 1, 1), renk = new THREE.Color(), renk2 = new THREE.Color();
function figMatris(n, j) {
  const k = S.koltuklar[nIndeks(n)], gizli = n === benN;
  e3.set(0, k.ry, 0); q.setFromEuler(e3); m4.compose(v3.set(k.x, k.y + 0.25, k.z), q, gizli ? SIFIR : s3);
  GOVDE.setMatrixAt(j, m4); KAFA.setMatrixAt(j, m4);
}
function figEkle(n) {
  if (nFig.has(n)) return; if (nIndeks(n) === undefined) return;
  const j = GOVDE.count; GOVDE.count++; KAFA.count++; figSira[j] = n; nFig.set(n, j);
  figMatris(n, j); figGuncelle(n); GOVDE.instanceMatrix.needsUpdate = KAFA.instanceMatrix.needsUpdate = true;
}
function figSil(n) {
  const j = nFig.get(n); if (j === undefined) return; const son = GOVDE.count - 1, sn = figSira[son];
  if (j !== son) { for (const M of [GOVDE, KAFA]) { M.getMatrixAt(son, m4); M.setMatrixAt(j, m4); M.getColorAt(son, renk); M.setColorAt(j, renk); }
    canliAtt.array[j] = canliAtt.array[son]; ziplaAtt.array[j] = ziplaAtt.array[son]; figSira[j] = sn; nFig.set(sn, j); }
  nFig.delete(n); GOVDE.count--; KAFA.count--;
  GOVDE.instanceMatrix.needsUpdate = KAFA.instanceMatrix.needsUpdate = true; GOVDE.instanceColor.needsUpdate = KAFA.instanceColor.needsUpdate = true; canliAtt.needsUpdate = ziplaAtt.needsUpdate = true;
}
function figGuncelle(n) {
  const j = nFig.get(n); if (j === undefined) return; const kk = koltuk.get(n); const canli = !!(kk && cevrimici.has(kk.u));
  const G = gorunumAl(kk?.u);
  if (canli) { renk.set(renkOf('f', G.f)); renk2.set(renkOf('t', G.t)); } else { renk.set(0x5d5f63); renk2.set(0x8b8b8b); }
  GOVDE.setColorAt(j, renk); KAFA.setColorAt(j, renk2); canliAtt.array[j] = canli ? 1 : 0;
  GOVDE.instanceColor.needsUpdate = KAFA.instanceColor.needsUpdate = true; canliAtt.needsUpdate = true;
}
function ziplat(n) { const j = nFig.get(n); if (j === undefined) return; ziplaAtt.array[j] = zaman.value; ziplaAtt.needsUpdate = true; }
let noktaZ = null;
function noktalariCiz() { // çevrimiçi olanların başında yeşil nokta
  clearTimeout(noktaZ); noktaZ = setTimeout(() => {
    let c = 0;
    for (const uid of cevrimici) { const n = uidN.get(uid); if (!n || c >= 4000) continue; const k = S.koltuklar[nIndeks(n)];
      m4.makeTranslation(k.x, k.y + 1.55, k.z); nokta.setMatrixAt(c++, m4); }
    nokta.count = c; nokta.instanceMatrix.needsUpdate = true;
    $('uCanli').textContent = cevrimici.size.toLocaleString('tr-TR');
  }, 120);
}
function sayaclar() { $('uUye').textContent = koltuk.size.toLocaleString('tr-TR'); }

/* ---------------- isim ve hareket etiketleri (yakındakiler) ---------------- */
const ISIM_N = 14, isimEl = [], etiketKap = document.createElement('div'); etiketKap.id = 'uIsimler'; document.body.appendChild(etiketKap);
for (let j = 0; j < ISIM_N; j++) { const d = document.createElement('div'); d.className = 'u-isim'; etiketKap.appendChild(d); isimEl.push(d); }
const emojiler = new Map(); // n → {el, t0}
let isimListe = [], isimZ = 0; const _p = new THREE.Vector3();
const dunya = n => { const k = S.koltuklar[nIndeks(n)]; return _p.set(k.x, k.y + S.statGrubu.position.y, k.z); };
function isimleriSec() {
  isimListe = []; const cp = S.cam.position; if (!S.fp && cp.distanceTo(S.ctl.target) > 160) { if (benN) isimListe.push(benN); return; }
  const aday = []; for (const n of koltuk.keys()) { const d = dunya(n).distanceToSquared(cp); if (d < 70 * 70) aday.push([d - (cevrimici.has(koltuk.get(n).u) ? 900 : 0), n]); }
  aday.sort((a, b) => a[0] - b[0]); if (S.fp) { const i = aday.findIndex(a => a[1] === benN); if (i >= 0) aday.splice(i, 1); } else if (benN && !aday.some(a => a[1] === benN)) isimListe.push(benN);
  const tut = [];
  for (const [, n] of aday) { if (isimListe.length >= ISIM_N) break; dunya(n).y += 1.4; _p.project(S.cam); if (_p.z > 1 || Math.abs(_p.x) > 1 || Math.abs(_p.y) > 1) continue;
    const sx = (_p.x + 1) / 2 * innerWidth, sy = (1 - _p.y) / 2 * innerHeight; if (sy < 120 || sy > innerHeight - 90) continue;
    if (tut.some(([x, y]) => Math.abs(x - sx) < 90 && Math.abs(y - sy) < 20)) continue; tut.push([sx, sy]); isimListe.push(n); }
}
window.__KARE.push(t => {
  if (t - isimZ > 250) { isimZ = t; isimleriSec(); }
  for (let j = 0; j < ISIM_N; j++) { const d = isimEl[j], n = isimListe[j];
    if (n === undefined) { d.style.display = 'none'; continue; }
    dunya(n).y += (n === benN ? 2.0 : 1.45); _p.project(S.cam); if (_p.z > 1) { d.style.display = 'none'; continue; }
    const kk = koltuk.get(n); if (!kk) { d.style.display = 'none'; continue; }
    d.style.display = 'block'; d.style.left = ((_p.x + 1) / 2 * innerWidth) + 'px'; d.style.top = ((1 - _p.y) / 2 * innerHeight) + 'px';
    const ad = kk.a + (n === benN ? ' · SEN' : ''); if (d.textContent !== ad) d.textContent = ad;
    d.classList.toggle('ben', n === benN); d.classList.toggle('kapali', !cevrimici.has(kk.u) && n !== benN); }
  for (const [n, o] of emojiler) { const yas = (t - o.t0) / 1000; if (yas > 3 || !koltuk.has(n)) { o.el.remove(); emojiler.delete(n); continue; }
    dunya(n).y += 2.0 + yas * 0.5; _p.project(S.cam); if (_p.z > 1) { o.el.style.display = 'none'; continue; }
    o.el.style.display = 'block'; o.el.style.left = ((_p.x + 1) / 2 * innerWidth) + 'px'; o.el.style.top = ((1 - _p.y) / 2 * innerHeight) + 'px'; o.el.style.opacity = String(Math.min(1, 3 - yas)); }
});
/* sohbet baloncuğu: mesaj yazanın kafasının üstünde birkaç saniye (en fazla 8 tane) */
const balonlar = new Map(); // mesaj id → {n, el, t0, sure}
const BALON_N = 8, BALON_UZAT = +(new URLSearchParams(location.search).get('balon') || 1); // ?balon=10: test için uzun süre
let balonHazir = false; // ilk yüklenen eski mesajlar baloncuk açmaz
function balonGoster(id, v) {
  const n = +v.k; if (!n || !koltuk.has(n) || balonlar.has(id)) return;
  for (const [bid, o] of balonlar) if (o.n === n) { o.el.remove(); balonlar.delete(bid); } // kişi başı tek balon
  while (balonlar.size >= BALON_N) { const [bid, o] = balonlar.entries().next().value; o.el.remove(); balonlar.delete(bid); }
  const el = document.createElement('div'); el.className = 'u-balon' + (n === benN ? ' ben' : ''); const sp = document.createElement('span'); sp.textContent = v.m; el.appendChild(sp); etiketKap.appendChild(el);
  balonlar.set(id, {n, el, t0: null, sure: Math.min(9, 4 + v.m.length / 18) * BALON_UZAT});
}
function balonSil(id) { const o = balonlar.get(id); if (o) { o.el.remove(); balonlar.delete(id); } }
window.__KARE.push(t => {
  for (const [id, o] of balonlar) { if (o.t0 === null) o.t0 = t; if (S.fp && o.n === benN) { o.el.style.display = 'none'; continue; } const yas = (t - o.t0) / 1000; if (yas > o.sure || !koltuk.has(o.n)) { o.el.remove(); balonlar.delete(id); continue; }
    dunya(o.n).y += (o.n === benN ? 2.0 : 1.45); const uz = _p.distanceTo(S.cam.position); _p.project(S.cam);
    if (_p.z > 1 || Math.abs(_p.x) > 1.05 || Math.abs(_p.y) > 1.05 || uz > 220) { o.el.style.display = 'none'; continue; }
    o.el.style.display = 'block'; o.el.style.left = ((_p.x + 1) / 2 * innerWidth) + 'px'; o.el.style.top = ((1 - _p.y) / 2 * innerHeight - 26) + 'px';
    o.el.style.opacity = String(Math.min(1, (o.sure - yas) * 2, yas * 6)); o.el.style.zIndex = String(5 + Math.round(1000 - uz)); }
});
function emojiGoster(n, h) { const e = HAREKET[h]; if (!e) return; emojiler.get(n)?.el.remove(); const el = document.createElement('div'); el.className = 'u-emoji'; el.textContent = e[0]; etiketKap.appendChild(el); emojiler.set(n, {el, t0: performance.now()}); }

/* ---------------- koltuk kartına sahip bilgisi ---------------- */
window.__BILET_EK = i => {
  const n = indeksN[i], kk = koltuk.get(n);
  if (!kk) return `<div style="margin-top:6px;font:700 12px system-ui;opacity:.8">Boş koltuk · no ${n.toLocaleString('tr-TR')}</div>` +
    (benN ? `<button data-gec="${n}" style="margin-top:8px;width:100%;font:800 13px system-ui;padding:9px;border-radius:9px;border:0;background:#e30a17;color:#fff;pointer-events:auto;cursor:pointer">🪑 Buraya geç</button>`
          : ben ? '' : `<div style="font:600 11px system-ui;opacity:.7;margin-top:4px">Kayıt olunca buraya oturabilirsin.</div>`);
  const canli = cevrimici.has(kk.u) || n === benN;
  return `<div style="margin-top:8px;font:800 15px system-ui">${kacis(kk.a)}${n === benN ? ' (sen)' : ''}</div>
    <div style="font:700 12px system-ui;color:${canli ? '#20e36a' : '#999'}">${canli ? '● Şu an statta' : '○ Çevrimdışı'}</div>`;
};

/* ---------------- veritabanı dinleyicileri ---------------- */
const kRef = ref(db, 'koltuk');
onChildAdded(kRef, s => { const n = +s.key, v = s.val(); koltuk.set(n, v); uidN.set(v.u, n); figEkle(n); sayaclar(); if (cevrimici.has(v.u)) noktalariCiz(); });
onChildRemoved(kRef, s => { const n = +s.key, v = s.val(); koltuk.delete(n); if (uidN.get(v.u) === n) uidN.delete(v.u); figSil(n); sayaclar(); noktalariCiz(); });
const cRef = ref(db, 'cevrimici');
onChildAdded(cRef, s => { cevrimici.add(s.key); const n = uidN.get(s.key); if (n) figGuncelle(n); noktalariCiz(); });
onChildRemoved(cRef, s => { cevrimici.delete(s.key); const n = uidN.get(s.key); if (n) figGuncelle(n); noktalariCiz(); });
const susturulan = new Set();
onValue(ref(db, 'susturulan'), s => { susturulan.clear(); s.forEach(c => { susturulan.add(c.key); }); yazmaDurumu(); });


/* ---------------- görünüm (giydirme) ve hareketler: herkes görür ---------------- */
const gRef = ref(db, 'gorunum');
const gorunumYaz = s => { gorunum.set(s.key, s.val() || {}); const n = uidN.get(s.key); if (n) figGuncelle(n); if (ben && s.key === ben.uid) { avatarKur(); benAvatarYerlestir(); } };
onChildAdded(gRef, gorunumYaz); onChildChanged(gRef, gorunumYaz);
const hRef = ref(db, 'hareket');
const hareketAl = s => { const v = s.val(); if (!v || !v.h) return; if (Math.abs(Date.now() - v.t) > 8000) return; const n = uidN.get(s.key); if (!n) return;
  emojiGoster(n, v.h); if (ben && s.key === ben.uid) return; if (['zipla', 'gol', 'selam', 'atki', 'alkis'].includes(v.h)) ziplat(n); };
onChildAdded(hRef, hareketAl); onChildChanged(hRef, hareketAl);

/* ---------------- kendi koltuğun değişince ---------------- */
let oncekiBenN = null;
function benYenile() {
  for (const n of [oncekiBenN, benN]) { if (n == null) continue; const j = nFig.get(n); if (j !== undefined) { figMatris(n, j); figGuncelle(n); } }
  GOVDE.instanceMatrix.needsUpdate = KAFA.instanceMatrix.needsUpdate = true; oncekiBenN = benN;
  avatarKur(); benAvatarYerlestir();
  $('uGiydirBtn').style.display = benN ? 'block' : 'none';
  $('uHareket').classList.toggle('ac', !!benN);
  // üyeye özel kameralar: kendi yerin (çevrendeki 10–15 kişiyle) ve kendi gözünden
  if (benN) {
    S.kameraEkle('kamGoz', '👀 Gözümden', () => S.gozumden(nIndeks(benN), gir => { benAvatar.visible = !gir && !!benN; }));
    S.kameraEkle('kamYer', '🙋 Yerim', () => S.yerim(nIndeks(benN)));
    if (!ilkYerim && !S.kameraOynadi) { ilkYerim = true; setTimeout(() => { if (!S.kameraOynadi && benN) S.yerim(nIndeks(benN)); }, 600); }
  } else { S.kameraSil('kamYer'); S.kameraSil('kamGoz'); }
}
let ilkYerim = false; // giriş yapmış kullanıcı siteyi açınca kamera bir kez kendi yerine uçar
// hareket çubuğu
$('uHareket').innerHTML = Object.entries(HAREKET).filter(([h]) => h !== 'otur').map(([h, [e, ad]]) => `<button data-h="${h}" title="${ad}">${e}</button>`).join('');
let sonHareket = 0;
$('uHareket').onclick = async e => { const h = e.target.closest('button')?.dataset.h; if (!h || !benN) return;
  hareketBaslat(h); emojiGoster(benN, h);
  if (Date.now() - sonHareket < 2500) return; sonHareket = Date.now();
  try { await set(ref(db, 'hareket/' + ben.uid), {h, t: serverTimestamp()}); } catch (er) {} };
// dolap
function dolapCiz() {
  const G = gorunumAl(ben?.uid);
  for (const tur of ['f', 't', 's', 'x']) { const el = $('uS_' + tur); el.innerHTML = '';
    for (const [deger, ad, c] of DOLAP[tur]) { const b = document.createElement('button');
      if (tur === 'f' || tur === 't') { b.style.background = deger === 'cubuk' ? 'repeating-linear-gradient(90deg,#151517 0 6px,#f2f2ef 6px 12px)' : c; b.title = ad; }
      else { b.textContent = ad; if (c) { b.style.background = c; b.style.color = '#fff'; } }
      b.classList.toggle('sec', G[tur] === deger);
      b.onclick = async () => { const yeni = Object.assign({}, G, {[tur]: deger}); gorunum.set(ben.uid, yeni); avatarKur(); benAvatarYerlestir(); figGuncelle(benN); dolapCiz();
        try { await set(ref(db, 'gorunum/' + ben.uid), yeni); } catch (er) { toast('Kaydedilemedi.'); } };
      el.appendChild(b); } }
}
$('uGiydirBtn').onclick = () => { if (!benN) return; dolapCiz(); ac('uDolap'); ac('uSohbet', false); S.koltugaYakin(nIndeks(benN)); };
$('uDolapKapat').onclick = () => ac('uDolap', false);
$('uKoltukDegis').onclick = () => { ac('uDolap', false); toast('Boş bir koltuğa dokun, kartta "Buraya geç"e bas.', 4500); S.ucusGit(new THREE.Vector3(0, -6, 0), new THREE.Vector3(0, 70, -110), 1800, 20); };

/* ---------------- koltuk değiştirme (yalnız boş koltuk) ---------------- */
async function koltugaGec(n) {
  if (!benN || !ben) return; if (koltuk.has(n)) { toast('Bu koltuk dolu.'); return; } if (n === benN) return;
  const eski = benN;
  try { await update(ref(db), {['koltuk/' + eski]: null, ['koltuk/' + n]: {u: ben.uid, a: benAd}, ['uye/' + ben.uid]: String(n)}); }
  catch (e) { toast('Geçilemedi: koltuk az önce dolmuş olabilir.'); return; }
  benN = n; benYenile(); varlikBaslat(); toast('Yeni koltuğun hazır 🪑'); S.koltugaUc(nIndeks(n));
}
document.getElementById('bilet').addEventListener('click', e => { const b = e.target.closest('[data-gec]'); if (b) koltugaGec(+b.dataset.gec); });

/* ---------------- figüre dokununca koltuk kartı ---------------- */
{ const ray = new THREE.Raycaster(), m = new THREE.Vector2(); let bas = null; const cv = document.getElementById('c');
  cv.addEventListener('pointerdown', e => bas = [e.clientX, e.clientY]);
  cv.addEventListener('pointerup', e => { if (!bas || Math.hypot(e.clientX - bas[0], e.clientY - bas[1]) > 6) return;
    m.set(e.clientX / innerWidth * 2 - 1, -(e.clientY / innerHeight) * 2 + 1); ray.setFromCamera(m, S.cam);
    const hedef = GOVDE.visible ? [GOVDE, KAFA] : [GOVDE_S, KAFA_S]; const h = ray.intersectObjects(hedef)[0];
    const hb = benAvatar.visible ? ray.intersectObject(benAvatar, true)[0] : null;
    if (hb && (!h || hb.distance < h.distance)) { S.biletGoster(nIndeks(benN)); return; }
    if (h) { const n = figSira[h.instanceId]; if (n) S.biletGoster(nIndeks(n)); } }); }

/* ---------------- çevrimiçi durumu ---------------- */
let varlikDinle = null, varlikKendi = null, bagli = false, varlikYaziyor = false;
let varlikDeneme = 0, varlikZ = null;
async function varlikYaz() { // "statta" kaydını (yeniden) yaz; bağlantı kopunca sunucu siler
  if (!bagli || !ben || !benN || varlikYaziyor) return; varlikYaziyor = true; clearTimeout(varlikZ);
  const r = ref(db, 'cevrimici/' + ben.uid);
  try { await onDisconnect(r).remove(); await set(r, serverTimestamp()); varlikDeneme = 0; }
  catch (e) { // v0.16 düzeltme: giriş bilgisi bağlantıya ulaşmadan yazınca reddediliyordu ve bir daha denenmiyordu → artan aralıkla yeniden dene
    console.warn('varlık', e); varlikDeneme++; varlikZ = setTimeout(varlikYaz, Math.min(30000, 800 * 2 ** Math.min(varlikDeneme, 6))); }
  varlikYaziyor = false;
}
function varlikBaslat() {
  if (varlikDinle) varlikDinle(); if (varlikKendi) varlikKendi();
  varlikDinle = onValue(ref(db, '.info/connected'), s => { bagli = !!s.val(); if (bagli) varlikYaz(); });
  // v0.16 düzeltme: yenilenen/kapanan ESKİ sekmenin gecikmeli "çıktı" kaydı bu sekmenin kaydını silebiliyordu → silinirse hemen yeniden yaz
  varlikKendi = onValue(ref(db, 'cevrimici/' + ben.uid), s => { if (!s.exists()) { clearTimeout(varlikZ); varlikZ = setTimeout(varlikYaz, 400); } });
}
async function varlikBitir() { clearTimeout(varlikZ); varlikDeneme = 0; if (varlikDinle) { varlikDinle(); varlikDinle = null; } if (varlikKendi) { varlikKendi(); varlikKendi = null; } bagli = false; if (ben) { try { await remove(ref(db, 'cevrimici/' + ben.uid)); } catch (e) {} } }

/* ---------------- giriş ---------------- */
$('uGirisBtn').onclick = () => { if (ben) { hesapAc(); } else ac('uGiris'); };
$('uGirisKapat').onclick = () => ac('uGiris', false);
document.querySelectorAll('.uKvkkAc').forEach(a => a.onclick = e => { e.preventDefault(); ac('uKvkk'); });
$('uKvkkKapat').onclick = () => ac('uKvkk', false);
const HATA = {'auth/invalid-email': 'E-posta geçersiz.', 'auth/missing-password': 'Şifre yaz.', 'auth/weak-password': 'Şifre en az 6 karakter olmalı.',
  'auth/email-already-in-use': 'Bu e-posta zaten kayıtlı; Giriş yap\'a bas.', 'auth/invalid-credential': 'E-posta ya da şifre yanlış.', 'auth/user-not-found': 'Bu e-postayla kayıt yok.',
  'auth/wrong-password': 'Şifre yanlış.', 'auth/too-many-requests': 'Çok deneme oldu, biraz bekle.', 'auth/popup-closed-by-user': 'Pencere kapandı.', 'auth/network-request-failed': 'Bağlantı yok.'};
const hataYaz = (id, e) => { $(id).textContent = HATA[e?.code] || (e?.message || String(e)).replace('Firebase: ', ''); };
$('uGoogle').onclick = async () => {
  $('uGirisHata').textContent = '';
  const p = new GoogleAuthProvider(); p.setCustomParameters({prompt: 'select_account'});
  try { await signInWithPopup(auth, p); }
  catch (e) {
    if (['auth/popup-blocked', 'auth/operation-not-supported-in-this-environment', 'auth/cancelled-popup-request'].includes(e.code)) { await signInWithRedirect(auth, p); return; }
    hataYaz('uGirisHata', e);
  }
};
getRedirectResult(auth).catch(e => hataYaz('uGirisHata', e));
$('uEGiris').onclick = async () => { $('uGirisHata').textContent = ''; try { await signInWithEmailAndPassword(auth, $('uEposta').value.trim(), $('uSifre').value); } catch (e) { hataYaz('uGirisHata', e); } };
$('uEKayit').onclick = async () => { $('uGirisHata').textContent = ''; try { await createUserWithEmailAndPassword(auth, $('uEposta').value.trim(), $('uSifre').value); } catch (e) { hataYaz('uGirisHata', e); } };
$('uSifreUnut').onclick = async e => { e.preventDefault(); const em = $('uEposta').value.trim(); if (!em) { $('uGirisHata').textContent = 'Önce e-postanı yaz.'; return; }
  try { await sendPasswordResetEmail(auth, em); $('uGirisHata').textContent = 'Şifre sıfırlama bağlantısı gönderildi.'; } catch (er) { hataYaz('uGirisHata', er); } };

onAuthStateChanged(auth, async u => {
  await varlikBitir();
  ben = u; benN = null; benAd = null; benYenile();
  yonetici = !!(u && u.email === YONETICI_EPOSTA && u.emailVerified);
  if (!u) { $('uGirisBtn').textContent = 'Kayıt ol / Giriş'; yazmaDurumu(); mesajlariYenidenCiz(); return; }
  ac('uGiris', false);
  const s = await get(ref(db, 'uye/' + u.uid)).catch(() => null);
  if (s && s.exists()) { benN = +s.val(); const kk = koltuk.get(benN) || (await get(ref(db, 'koltuk/' + benN))).val(); benAd = kk?.a; koltugumOldu(); }
  else { $('uGirisBtn').textContent = 'Koltuğunu al'; ac('uKoltuk'); setTimeout(() => $('uAd').focus(), 50); }
  yazmaDurumu(); mesajlariYenidenCiz();
});
function koltugumOldu() {
  $('uGirisBtn').textContent = '👤 ' + (benAd || 'Hesabım');
  benYenile(); varlikBaslat(); yazmaDurumu();
}

/* ---------------- koltuk alma ---------------- */
$('uKoltukVazgec').onclick = () => ac('uKoltuk', false);
$('uKoltukAl').onclick = async () => {
  const ad = $('uAd').value.trim().replace(/\s+/g, ' '), h = $('uKoltukHata'); h.textContent = '';
  if (!/^[A-Za-z0-9_.ÇĞİÖŞÜçğıöşü ]{3,20}$/.test(ad)) { h.textContent = 'Ad 3–20 karakter olmalı; harf, rakam, boşluk, nokta ve _ olabilir.'; return; }
  if (!temizMi(ad)) { h.textContent = 'Bu ad kullanılamaz.'; return; }
  if (!$('uKvkkOnay').checked) { h.textContent = 'Aydınlatma metnini onaylaman gerekiyor.'; return; }
  $('uKoltukAl').disabled = true;
  try {
    let n = ((await get(ref(db, 'sayac'))).val() || 0) + 1, alindi = false;
    for (let deneme = 0; deneme < 60 && n <= KOLTUK_SAY; deneme++, n++) {
      if (koltuk.has(n)) continue;
      try { await update(ref(db), {['koltuk/' + n]: {u: ben.uid, a: ad}, ['uye/' + ben.uid]: String(n)}); alindi = true; break; }
      catch (e) { if (!String(e).includes('PERMISSION_DENIED')) throw e; }
    }
    if (!alindi) throw new Error('Boş koltuk bulunamadı, biraz sonra tekrar dene.');
    benN = n; benAd = ad;
    // sayacı ilerlet (yalnız +1 adımlarla; diğer üyeler de ilerletir)
    for (let i = 0; i < 80; i++) { const r = await runTransaction(ref(db, 'sayac'), c => ((c || 0) < n ? (c || 0) + 1 : undefined)).catch(() => null); if (!r || !r.committed) break; }
    ac('uKoltuk', false); koltugumOldu();
    toast('Koltuğun hazır: ' + ad + ' 🦅');
    S.koltugaUc(nIndeks(n));
  } catch (e) { h.textContent = String(e.message || e).replace('Firebase: ', ''); }
  finally { $('uKoltukAl').disabled = false; }
};

/* ---------------- hesap ---------------- */
function hesapAc() {
  if (!benN) { ac('uKoltuk'); return; }
  const k = S.koltuklar[nIndeks(benN)], dl = S.dilim(k.t);
  $('uHesapAd').textContent = benAd || 'Hesabım';
  $('uHesapKoltuk').innerHTML = `${dl.ad} Tribünü · ${k.kat === 1 ? 'Alt' : 'Üst'} kat<br><b>Blok ${k.blok} · Sıra ${k.sira} · Koltuk ${k.no}</b><br><span style="opacity:.6">Koltuk no ${benN.toLocaleString('tr-TR')} / 42.684</span>`;
  $('uHesapHata').textContent = ''; ac('uHesap');
}
$('uHesapKapat').onclick = () => ac('uHesap', false);
$('uKoltugumaGit').onclick = () => { ac('uHesap', false); if (benN) S.koltugaUc(nIndeks(benN)); };
$('uCikis').onclick = async () => { ac('uHesap', false); await varlikBitir(); await signOut(auth); toast('Çıkış yapıldı. Koltuğun seni bekliyor.'); };
$('uHesapSil').onclick = async () => {
  if (!confirm('Adın, koltuğun ve hesabın kalıcı olarak silinecek. Emin misin?')) return;
  try {
    await varlikBitir();
    const g = {['uye/' + ben.uid]: null}; if (benN) g['koltuk/' + benN] = null;
    await update(ref(db), g);
    await remove(ref(db, 'gorunum/' + ben.uid)).catch(() => {}); await remove(ref(db, 'hareket/' + ben.uid)).catch(() => {});
    await deleteUser(ben);
    ac('uHesap', false); toast('Hesabın silindi.');
  } catch (e) {
    if (e.code === 'auth/requires-recent-login') { $('uHesapHata').textContent = 'Güvenlik için çıkış yapıp tekrar giriş yap, sonra yeniden dene.'; }
    else hataYaz('uHesapHata', e);
  }
};

/* ---------------- sohbet ---------------- */
$('uSohbetBtn').onclick = () => { ac('uSohbet', !$('uSohbet').classList.contains('ac')); kaydir(); };
$('uSohbetKapat').onclick = () => ac('uSohbet', false);
const mesajlar = new Map(); // id → v
const kutu = $('uMesajlar');
function kaydir() { kutu.scrollTop = kutu.scrollHeight; }
function koltukEtiket(n) { const i = nIndeks(+n); if (i === undefined) return ''; const k = S.koltuklar[i]; return `Blok ${k.blok}`; }
function mesajDiv(id, v) {
  const d = document.createElement('div'); d.className = 'u-m' + (ben && v.u === ben.uid ? ' ben' : ''); d.id = 'm_' + id;
  const saat = new Date(v.t).toLocaleTimeString('tr-TR', {hour: '2-digit', minute: '2-digit'});
  d.innerHTML = `<b data-n="${kacis(v.k || '')}">${kacis(v.a)}</b><small>${koltukEtiket(v.k)} · ${saat}</small><br>${kacis(v.m)}` +
    (ben && benN && v.u !== ben.uid ? `<span class="ic" data-sik="${id}" title="Şikâyet et">⚑</span>` : '') +
    (yonetici ? `<span class="ic" data-sil="${id}" title="Sil">🗑</span><span class="ic" data-sus="${kacis(v.u)}" title="Sustur">🔇</span>` : '');
  return d;
}
function mesajlariYenidenCiz() { kutu.innerHTML = ''; [...mesajlar.entries()].sort((a, b) => a[1].t - b[1].t).forEach(([id, v]) => kutu.appendChild(mesajDiv(id, v))); kaydir(); }
const sRef = query(ref(db, 'sohbet'), orderByChild('t'), limitToLast(50));
onChildAdded(sRef, s => { const v = s.val(); if (!v || !v.m) return; mesajlar.set(s.key, v); if (balonHazir) balonGoster(s.key, v); const alt = kutu.scrollHeight - kutu.scrollTop - kutu.clientHeight < 60; kutu.appendChild(mesajDiv(s.key, v)); while (kutu.children.length > 60) kutu.firstChild.remove(); if (alt) kaydir(); });
get(sRef).catch(() => {}).finally(() => { setTimeout(() => { balonHazir = true; }, 300); });
onChildRemoved(sRef, s => { mesajlar.delete(s.key); balonSil(s.key); $('m_' + s.key)?.remove(); });
kutu.onclick = async e => {
  const t = e.target;
  if (t.dataset.n) { const i = nIndeks(+t.dataset.n); if (i !== undefined) S.koltugaUc(i); return; }
  if (t.dataset.sik) { const v = mesajlar.get(t.dataset.sik); if (!v || !confirm('Bu mesajı şikâyet et?')) return;
    try { await set(push(ref(db, 'sikayet')), {kimden: ben.uid, mesaj: {id: t.dataset.sik, u: v.u, a: v.a, m: v.m}, t: serverTimestamp()}); toast('Şikâyetin iletildi, teşekkürler.'); } catch (er) { toast('Şikâyet gönderilemedi.'); } return; }
  if (t.dataset.sil) { try { await remove(ref(db, 'sohbet/' + t.dataset.sil)); } catch (er) { toast('Silinemedi.'); } return; }
  if (t.dataset.sus) { if (!confirm('Bu kişi susturulsun mu?')) return; try { await set(ref(db, 'susturulan/' + t.dataset.sus), true); toast('Susturuldu.'); } catch (er) { toast('Susturulamadı.'); } }
};
function yazmaDurumu() {
  const inp = $('uMesaj'), btn = $('uGonder');
  let not = '';
  if (!ben) not = 'Yazmak için kayıt ol / giriş yap.'; else if (!benN) not = 'Yazmak için önce koltuğunu al.'; else if (susturulan.has(ben.uid)) not = 'Sohbette susturuldun.';
  inp.disabled = btn.disabled = !!not; inp.placeholder = not || 'Mesaj yaz… (Enter)';
}
let sonGonder = 0;
async function gonder() {
  const inp = $('uMesaj'), m = inp.value.trim().replace(/\s+/g, ' ');
  if (!m || !ben || !benN) return;
  if (Date.now() - sonGonder < 3000) { toast('Biraz yavaş: 3 saniyede bir mesaj.'); return; }
  if (!temizMi(m)) { toast('Mesajda küfür, bahis ya da bağlantı var; gönderilmedi.'); return; }
  const id = push(ref(db, 'sohbet')).key;
  try { await update(ref(db), {['sohbet/' + id]: {u: ben.uid, a: benAd, k: String(benN), m: m.slice(0, 200), t: serverTimestamp()}, ['sonMesaj/' + ben.uid]: serverTimestamp()}); inp.value = ''; sonGonder = Date.now(); }
  catch (e) { toast(susturulan.has(ben.uid) ? 'Susturuldun.' : 'Gönderilemedi (çok hızlı olabilir).'); }
}
$('uGonder').onclick = gonder;
$('uMesaj').addEventListener('keydown', e => { if (e.key === 'Enter') gonder(); });
yazmaDurumu();

window.__UYELIK = {db, auth, koltuk, cevrimici, nIndeks, indeksN, get ben() { return ben; }, get benN() { return benN; }, FIG};
window.__UYELIK_HAZIR = true;
