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
@media (max-width:640px){.u-ust{top:62px}}
`;
document.head.insertAdjacentHTML('beforeend', `<style>${css}</style>`);
const kok = document.getElementById('uyelik');
kok.innerHTML = `
<div class="u-ust">
  <div class="u-sayac" id="uSayac"><i></i><span id="uCanli">0</span> kişi şu an statta · <span id="uUye">0</span> üye</div>
  <div style="display:flex;gap:6px"><button id="uSohbetBtn">💬 Sohbet</button><button id="uGirisBtn" class="ana">Kayıt ol / Giriş</button></div>
</div>
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

/* ---------------- taraftar figürleri (yalnız dolu koltuklar) ---------------- */
const figGeo = (() => {
  const govde = new THREE.CylinderGeometry(0.17, 0.2, 0.62, 7); govde.translate(0, 0.78, 0.02);
  const bas = new THREE.SphereGeometry(0.13, 8, 6); bas.translate(0, 1.22, 0.02);
  const g = new THREE.BufferGeometry(); const parca = [govde, bas];
  const birles = (THREE.BufferGeometryUtils || null);
  // basit birleştirme (aynı öznitelikler)
  const pos = [], nor = [], idx = []; let o = 0;
  for (const p of parca) { const q = p.index ? p.toNonIndexed() : p; pos.push(...q.attributes.position.array); nor.push(...q.attributes.normal.array); }
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3));
  return g;
})();
const canliAtt = new THREE.InstancedBufferAttribute(new Float32Array(KOLTUK_SAY), 1);
figGeo.setAttribute('aCanli', canliAtt);
const figMat = new THREE.MeshStandardMaterial({color: 0xffffff, roughness: 0.7});
const zaman = {value: 0};
figMat.onBeforeCompile = sh => {
  sh.uniforms.uZaman = zaman;
  sh.vertexShader = 'attribute float aCanli;\nuniform float uZaman;\n' + sh.vertexShader.replace('#include <begin_vertex>',
    '#include <begin_vertex>\n float faz = float(gl_InstanceID)*1.7;\n transformed.y += aCanli * 0.09 * abs(sin(uZaman*3.2 + faz));\n transformed.x += aCanli * 0.03 * sin(uZaman*1.6 + faz) * (position.y - 0.5);');
};
const FIG = new THREE.InstancedMesh(figGeo, figMat, KOLTUK_SAY); FIG.count = 0; FIG.frustumCulled = false;
FIG.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
S.statGrubu.add(FIG);
const nokta = new THREE.InstancedMesh(new THREE.SphereGeometry(0.11, 8, 6), new THREE.MeshBasicMaterial({color: 0x20e36a}), 4000); nokta.count = 0; nokta.frustumCulled = false;
S.statGrubu.add(nokta);
S.KM.castShadow = false; FIG.castShadow = false;
window.__KARE.push(t => { zaman.value = t / 1000; });

/* ---------------- durum ---------------- */
const koltuk = new Map();   // n → {u,a}
const uidN = new Map();     // uid → n
const cevrimici = new Set();// uid
let ben = null, benN = null, benAd = null, yonetici = false;
const figSira = [];         // FIG içindeki sıra → n
const nFig = new Map();     // n → FIG sırası
const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), e3 = new THREE.Euler(), v3 = new THREE.Vector3(), s3 = new THREE.Vector3(1, 1, 1), renk = new THREE.Color();
const FORMA = [0xf2f2ef, 0x1a1a1c, 0xf2f2ef, 0x1a1a1c, 0xd8d8d4];
function figRengi(n, canli) {
  if (n === benN) return renk.setHex(0xe30a17);
  if (!canli) return renk.setHex(0x6b6b6b);
  return renk.setHex(FORMA[n % FORMA.length]);
}
function figEkle(n) {
  if (nFig.has(n)) return; const i = nIndeks(n); if (i === undefined) return; const k = S.koltuklar[i];
  const j = FIG.count; FIG.count++; figSira[j] = n; nFig.set(n, j);
  e3.set(0, k.ry, 0); q.setFromEuler(e3); m4.compose(v3.set(k.x, k.y, k.z), q, s3); FIG.setMatrixAt(j, m4);
  figGuncelle(n);
  FIG.instanceMatrix.needsUpdate = true;
}
function figSil(n) {
  const j = nFig.get(n); if (j === undefined) return; const son = FIG.count - 1, sn = figSira[son];
  if (j !== son) { FIG.getMatrixAt(son, m4); FIG.setMatrixAt(j, m4); FIG.getColorAt(son, renk); FIG.setColorAt(j, renk); canliAtt.array[j] = canliAtt.array[son]; figSira[j] = sn; nFig.set(sn, j); }
  nFig.delete(n); FIG.count--; FIG.instanceMatrix.needsUpdate = true; if (FIG.instanceColor) FIG.instanceColor.needsUpdate = true; canliAtt.needsUpdate = true;
}
function figGuncelle(n) {
  const j = nFig.get(n); if (j === undefined) return; const kk = koltuk.get(n); const canli = !!(kk && cevrimici.has(kk.u));
  FIG.setColorAt(j, figRengi(n, canli)); canliAtt.array[j] = canli ? 1 : 0;
  FIG.instanceColor.needsUpdate = true; canliAtt.needsUpdate = true;
}
let noktaZ = null;
function noktalariCiz() { // çevrimiçi olanların başında yeşil nokta
  clearTimeout(noktaZ); noktaZ = setTimeout(() => {
    let c = 0;
    for (const uid of cevrimici) { const n = uidN.get(uid); if (!n || c >= 4000) continue; const k = S.koltuklar[nIndeks(n)];
      m4.makeTranslation(k.x, k.y + 1.62, k.z); nokta.setMatrixAt(c++, m4); }
    nokta.count = c; nokta.instanceMatrix.needsUpdate = true;
    $('uCanli').textContent = cevrimici.size.toLocaleString('tr-TR');
  }, 120);
}
function sayaclar() { $('uUye').textContent = koltuk.size.toLocaleString('tr-TR'); }

/* ---------------- koltuk kartına sahip bilgisi ---------------- */
window.__BILET_EK = i => {
  const n = indeksN[i], kk = koltuk.get(n);
  if (!kk) return `<div style="margin-top:6px;font:700 12px system-ui;opacity:.8">Boş koltuk · no ${n.toLocaleString('tr-TR')}</div>`;
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

/* ---------------- çevrimiçi durumu ---------------- */
let varlikDinle = null;
function varlikBaslat() {
  if (varlikDinle) varlikDinle();
  varlikDinle = onValue(ref(db, '.info/connected'), async s => {
    if (!s.val() || !ben || !benN) return;
    const r = ref(db, 'cevrimici/' + ben.uid);
    try { await onDisconnect(r).remove(); await set(r, serverTimestamp()); } catch (e) { console.warn('varlık', e); }
  });
}
async function varlikBitir() { if (varlikDinle) { varlikDinle(); varlikDinle = null; } if (ben) { try { await remove(ref(db, 'cevrimici/' + ben.uid)); } catch (e) {} } }

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
  ben = u; benN = null; benAd = null;
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
  figGuncelle(benN); varlikBaslat(); yazmaDurumu();
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
onChildAdded(sRef, s => { const v = s.val(); if (!v || !v.m) return; mesajlar.set(s.key, v); const alt = kutu.scrollHeight - kutu.scrollTop - kutu.clientHeight < 60; kutu.appendChild(mesajDiv(s.key, v)); while (kutu.children.length > 60) kutu.firstChild.remove(); if (alt) kaydir(); });
onChildRemoved(sRef, s => { mesajlar.delete(s.key); $('m_' + s.key)?.remove(); });
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
