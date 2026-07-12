import React, { useState, useRef, useEffect } from "react";

/* ============================================================
   StoryLoom v2 — yarım kalan hikâyeleri devam ettiren platform
   Yeni: yaşayan hafıza (geri yazma), panel editörü, retcon,
         karakterle konuşma, novel→webtoon, lore muhafızı
   ============================================================ */

const T = {
  void: "#0A0711", panel: "#150E1E", panel2: "#1D1429", line: "#2E2140",
  violet: "#8B5CF6", violetDim: "#6D3FD4", gold: "#F0B429", hanko: "#E5484D",
  paper: "#EDE6F2", muted: "#8F82A3",
};

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Unbounded:wght@400;700;900&family=Manrope:wght@400;500;700;800&family=JetBrains+Mono:wght@400;700&display=swap');
*{box-sizing:border-box;-webkit-tap-highlight-color:transparent}
.sl{background:${T.void};color:${T.paper};font-family:'Manrope',system-ui,sans-serif;min-height:100vh;max-width:480px;margin:0 auto;position:relative;overflow-x:hidden}
.sl h1,.sl h2,.sl h3,.sl .disp{font-family:'Unbounded',sans-serif;letter-spacing:-.02em}
.mono{font-family:'JetBrains Mono',monospace}
.sl button{font-family:inherit;cursor:pointer;border:none;background:none;color:inherit}
.sl button:focus-visible,.sl input:focus-visible,.sl textarea:focus-visible{outline:2px solid ${T.violet};outline-offset:2px}
.scroll-x{overflow-x:auto;scrollbar-width:none}
.scroll-x::-webkit-scrollbar{display:none}
.card{background:${T.panel};border:1px solid ${T.line};border-radius:14px}
.pill{display:inline-flex;align-items:center;gap:6px;padding:4px 10px;border-radius:999px;font-size:11px;font-weight:700}
.btn{background:${T.violet};color:#fff;font-weight:800;padding:13px 18px;border-radius:12px;font-size:14px;width:100%;transition:transform .12s}
.btn:active{transform:scale(.97)}
.btn-ghost{background:transparent;border:1px solid ${T.line};color:${T.paper};font-weight:700;padding:11px 16px;border-radius:12px;font-size:13px}
.inp{width:100%;background:${T.panel2};border:1px solid ${T.line};border-radius:10px;padding:11px 12px;color:${T.paper};font-size:14px;font-family:inherit}
.spine{position:absolute;left:15px;top:0;bottom:0;width:2px;background:linear-gradient(180deg,${T.line},${T.line} 55%,transparent 55%,transparent 100%);background-size:2px 10px}
.node{width:12px;height:12px;border-radius:50%;flex:0 0 12px;margin-top:6px;z-index:1}
.branch-arm{position:absolute;left:-19px;top:12px;width:19px;height:2px;background:${T.violetDim}}
.hanko{border:2px solid ${T.hanko};color:${T.hanko};border-radius:6px;padding:6px 10px;font-weight:900;font-size:11px;letter-spacing:.14em;transform:rotate(-4deg);display:inline-block;font-family:'JetBrains Mono',monospace}
.pulse{animation:pl 1.4s ease-in-out infinite}
@keyframes pl{0%,100%{opacity:.35}50%{opacity:1}}
.fade{animation:fd .35s ease both}
@keyframes fd{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}
.bub{position:absolute;background:#fff;color:#111;font-weight:700;padding:8px 11px;border-radius:14px;font-size:12px;line-height:1.35;text-align:center;touch-action:none;user-select:none}
.bub-tail:after{content:'';position:absolute;bottom:-8px;left:50%;margin-left:-6px;border:6px solid transparent;border-top-color:#fff}
@media (prefers-reduced-motion:reduce){*{animation:none!important;transition:none!important}}
`;

/* ---------------- veri ---------------- */
const uid = () => Math.random().toString(36).slice(2, 9);

const SEED = [
  {
    id: "s1", title: "Kanlı Fener", type: "Manhwa", year: 2019, chapters: 84,
    hue: 268, tags: ["Aksiyon", "Doğaüstü"], followers: "12.4B", reason: "Stüdyo kapandı",
    synopsis: "Fener taşıyıcıları ölülerin borcunu toplar. Jin borcunu ödeyemeyince fener onu seçti.",
    lore: {
      chars: [
        { id: "c1", n: "Jin Haru", r: "Ana karakter", d: "17. fener taşıyıcısı. Ağrı eşiği yok, bu yüzden fener onu seçti.", src: "canon" },
        { id: "c2", n: "Usta Bora", r: "Mentor", d: "Eski taşıyıcı. Sol eli mürekkepten. 62. bölümde ihanet etti.", src: "canon" },
        { id: "c3", n: "Nara", r: "Rakip", d: "Fener Konseyi'nin kızı. Jin'e karşı borçlu.", src: "canon" },
      ],
      rules: [
        { id: "r1", t: "Fener sadece ödenmemiş borç yakınında yanar.", src: "canon" },
        { id: "r2", t: "Taşıyıcı bir borcu affederse ömründen bir yıl gider.", src: "canon" },
        { id: "r3", t: "Konsey'in 9 üyesi vardır; 3'ü 60. bölümde öldü.", src: "canon" },
      ],
      threads: [
        { id: "t1", t: "Bora'nın ihanetinin sebebi açıklanmadı", open: true },
        { id: "t2", t: "Jin'in annesi hâlâ kayıp", open: true },
        { id: "t3", t: "10. fener kimde?", open: true },
      ],
      log: [{ id: "l0", t: "84 bölüm okundu, hafıza çekirdeği kuruldu.", src: "canon", when: "başlangıç" }],
    },
    branches: [
      {
        id: "b1", by: "@mürekkepruhu", title: "Bora'nın Borcu", ch: 12, fid: 94, votes: 2140,
        aiAxes: { sadakat: 96, karakter: 92, tempo: 78, diyalog: 85, ozgunluk: 71 },
        reviews: [
          { id: "rv1", by: "@nairo", axes: { sadakat: 5, karakter: 5, tempo: 3, diyalog: 4, ozgunluk: 3 }, text: "Bora'nın gerekçesi nihayet oturdu. Ortada biraz sarkıyor ama final panelini iki kere okudum.", when: "3 gün önce" },
          { id: "rv2", by: "@selin", axes: { sadakat: 5, karakter: 4, tempo: 4, diyalog: 5, ozgunluk: 3 }, text: "Diyaloglar orijinalden ayırt edilemiyor. Sürpriz yok ama zaten istediğim o değildi.", when: "1 hafta önce" },
        ],
      },
      {
        id: "b2", by: "Klan: Gece Dokuması", title: "Konsey Düşüşü", ch: 7, fid: 88, votes: 1310,
        aiAxes: { sadakat: 88, karakter: 84, tempo: 90, diyalog: 79, ozgunluk: 86 },
        reviews: [{ id: "rv3", by: "@kenan", axes: { sadakat: 4, karakter: 4, tempo: 5, diyalog: 4, ozgunluk: 5 }, text: "Tempo canavarı. Konsey'in 9 üyesi kuralına da sadık kalmışlar.", when: "5 gün önce" }],
      },
      {
        id: "b3", by: "@nairo", title: "Fenersiz Yol", ch: 3, fid: 61, votes: 402,
        aiAxes: { sadakat: 61, karakter: 70, tempo: 66, diyalog: 62, ozgunluk: 94 },
        reviews: [{ id: "rv4", by: "@zeyno", axes: { sadakat: 2, karakter: 3, tempo: 3, diyalog: 3, ozgunluk: 5 }, text: "Jin'i fenersiz bırakmak cesur ama artık başka bir hikâye okuyorum gibi.", when: "2 gün önce" }],
      },
    ],
  },
  {
    id: "s2", title: "Sessiz Bahçıvan", type: "Novel", year: 2021, chapters: 210,
    hue: 160, tags: ["Fantezi", "Politik"], followers: "8.1B", reason: "Yazar bıraktı",
    synopsis: "İmparatorluğun her bahçesi bir hafıza saklar. Bahçıvan hepsini biliyor ve konuşmuyor.",
    lore: {
      chars: [{ id: "c4", n: "Elian", r: "Bahçıvan", d: "Konuşmaz. Bitkilerle hatıra takas eder.", src: "canon" }],
      rules: [{ id: "r4", t: "Hatıra takası geri alınamaz.", src: "canon" }],
      threads: [{ id: "t4", t: "Kraliçenin bahçesi neden kurudu?", open: true }],
      log: [{ id: "l1", t: "210 bölüm okundu, hafıza çekirdeği kuruldu.", src: "canon", when: "başlangıç" }],
    },
    branches: [{
      id: "b4", by: "@sessizkalem", title: "Kurumuş Taht", ch: 21, fid: 90, votes: 3020,
      aiAxes: { sadakat: 93, karakter: 89, tempo: 72, diyalog: 88, ozgunluk: 80 }, reviews: [],
    }],
  },
  {
    id: "s3", title: "Beton Tanrılar", type: "Webtoon", year: 2020, chapters: 47,
    hue: 20, tags: ["Distopya"], followers: "5.7B", reason: "Düşük gelir",
    synopsis: "Şehir yaşıyor ve kirasını ruhla alıyor.",
    lore: {
      chars: [{ id: "c5", n: "Dara", r: "Tahsildar", d: "Şehrin ruh borcunu toplar, kendi borcunu unuttu.", src: "canon" }],
      rules: [{ id: "r5", t: "Şehir 40 yılda bir aç kalır.", src: "canon" }],
      threads: [{ id: "t5", t: "Dara'nın kardeşi kirada mı?", open: true }],
      log: [{ id: "l2", t: "47 bölüm okundu, hafıza çekirdeği kuruldu.", src: "canon", when: "başlangıç" }],
    },
    branches: [],
  },
];

const QUESTS = {
  daily: [{ id: "d1", t: "3 bölüm oku", p: 2, g: 3, c: 15 }, { id: "d2", t: "Bir dala oy ver", p: 1, g: 1, c: 10, done: true }, { id: "d3", t: "Bir bölüm üret", p: 0, g: 1, c: 40 }],
  weekly: [{ id: "w1", t: "5 gün üst üste gir", p: 3, g: 5, c: 120 }, { id: "w2", t: "Klan görevine katıl", p: 1, g: 2, c: 90 }],
  monthly: [{ id: "m1", t: "Bir dalı 10 bölüme taşı", p: 4, g: 10, c: 600 }, { id: "m2", t: "Marketten iş ver veya al", p: 0, g: 1, c: 400 }],
};

const CREATORS = [
  { n: "Selin Aydın", j: "Çizer", s: "Manhwa lineart", p: 1200, r: 4.9, jobs: 84, hue: 300 },
  { n: "Mert Kaya", j: "Renklendirici", s: "Webtoon flat + gölge", p: 450, r: 4.7, jobs: 210, hue: 200 },
  { n: "Ada Yılmaz", j: "Yazar", s: "Bölüm senaryosu", p: 800, r: 5.0, jobs: 41, hue: 40 },
  { n: "Kenan Ok", j: "Editör", s: "Tutarlılık / lore kontrol", p: 300, r: 4.8, jobs: 152, hue: 120 },
  { n: "Zeyno", j: "Letterer", s: "Balon + efekt", p: 250, r: 4.6, jobs: 320, hue: 340 },
];

const GUILDS = [
  { n: "Gece Dokuması", m: 42, lv: 7, proj: "Kanlı Fener — Konsey Düşüşü", pool: 12400, hue: 268 },
  { n: "Kırık Kalem", m: 18, lv: 4, proj: "Sessiz Bahçıvan — Kurumuş Taht", pool: 4100, hue: 160 },
  { n: "Son Panel", m: 91, lv: 9, proj: "3 aktif dal", pool: 31200, hue: 20 },
];

const TIERS = [
  { n: "Okur", p: "Ücretsiz", f: ["Günlük 1 üretim", "Sadece hızlı mod", "Klan üyeliği"], c: T.muted },
  { n: "Kâtip", p: "₺79/ay", f: ["Günlük 15 üretim", "Gelişmiş mod", "Reklamsız"], c: T.violet },
  { n: "Yazar", p: "₺189/ay", f: ["Sınırsız üretim", "Panel editörü", "Karakterle konuş", "Stil kütüphanesi"], c: T.gold },
  { n: "Mürekkep Lordu", p: "₺449/ay", f: ["Öncelikli kuyruk", "Özel klan alanı", "Ticari lisans", "Gelir paylaşımı"], c: T.hanko },
];

/* ---------------- stil kütüphanesi + çizim ---------------- */
const STYLES = [
  { id: "noir", n: "Mürekkep Noir", d: "Sert siyah-beyaz", p: "yüksek kontrastlı siyah-beyaz mürekkep çizim, kalın konturlar, sert gölgeler, tarama (hatching) dokusu, tek vurgu rengi kırmızı" },
  { id: "pastel", n: "Pastel Webtoon", d: "Yumuşak, sıcak", p: "yumuşak pastel palet, ince temiz kontur, düz renk alanları, sıcak yumuşak ışık, sakin webtoon estetiği" },
  { id: "manhwa", n: "Sert Manhwa", d: "Sinematik, karanlık", p: "koyu doygun tonlar, dramatik yandan ışık, keskin diagonal kadrajlar, sinematik derinlik, mor-siyah palet" },
  { id: "suluboya", n: "Suluboya", d: "Akışkan, gevşek", p: "suluboya lekeleri, yumuşak renk geçişleri, gevşek düzensiz kontur, kâğıt dokusu hissi" },
];

async function drawPanel(desc, style) {
  const r = await ask(`Bir webtoon paneli için SVG illüstrasyon üret.

SAHNE: ${desc}
SANAT STİLİ: ${style.p}

KURALLAR:
- Sadece SVG kodu döndür. Açıklama, markdown, backtick yok.
- <svg viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg"> ile başla.
- Kompozisyon kur: arka plan, orta katman, ön plan. Siluetler, figürler, mimari, gökyüzü, ışık.
- Gradient, path, polygon, circle kullan. Filtre kullanma.
- İçine hiç yazı/metin koyma.
- Kadrajı doldur, boş bırakma. 30-60 element arası, zengin olsun.`);
  const m = r.match(/<svg[\s\S]*<\/svg>/);
  return m ? m[0] : null;
}

/* ---------------- puanlama: AI + okur ---------------- */
const AXES = [
  { k: "sadakat", l: "Canon sadakati", d: "Kurallara ve olan bitene sadık mı?" },
  { k: "karakter", l: "Karakter tutarlılığı", d: "Herkes kendi gibi mi konuşuyor?" },
  { k: "tempo", l: "Tempo", d: "Sürükledi mi, sarktı mı?" },
  { k: "diyalog", l: "Diyalog", d: "Replikler tutuyor mu?" },
  { k: "ozgunluk", l: "Özgünlük", d: "Sürpriz var mı, klişe mi?" },
];
const aiOf = (b) => b.aiAxes || AXES.reduce((o, a) => (o[a.k] = b.ai || b.fid || 80, o), {});
const humanOf = (b) => {
  const rs = b.reviews || [];
  if (!rs.length) return null;
  return AXES.reduce((o, a) => (o[a.k] = Math.round((rs.reduce((s, r) => s + r.axes[a.k], 0) / rs.length) * 20), o), {});
};
const scoreOf = (b) => {
  const ai = aiOf(b), h = humanOf(b), n = (b.reviews || []).length;
  const wH = Math.min(0.8, n / (n + 3)); // okur sayısı arttıkça okur ağır basar
  const o = {};
  AXES.forEach((a) => { o[a.k] = h ? Math.round(ai[a.k] * (1 - wH) + h[a.k] * wH) : ai[a.k]; });
  o.total = Math.round(AXES.reduce((s, a) => s + o[a.k], 0) / AXES.length);
  o.n = n; o.wH = wH;
  return o;
};
const scoreColor = (v) => (v >= 85 ? T.violet : v >= 70 ? T.gold : T.hanko);

const cover = (hue, h = 150) => ({
  background: `linear-gradient(150deg, hsl(${hue} 55% 22%), hsl(${hue + 40} 60% 10%))`, height: h,
});

/* ---------------- API ---------------- */
async function ask(prompt) {
  const res = await fetch("/.netlify/functions/ai", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages: [{ role: "user", content: prompt }] }),
  });
  const d = await res.json();
  return d.content.map((i) => i.text || "").join("\n");
}

/* ---------------- kalıcı depolama ---------------- */
const KEY = "storyloom:save";
async function loadSave() {
  try { const v = localStorage.getItem(KEY); return v ? JSON.parse(v) : null; }
  catch { return null; }
}
async function writeSave(d) {
  try { localStorage.setItem(KEY, JSON.stringify(d)); } catch (e) { console.error(e); }
}
async function wipeSave() {
  try { localStorage.removeItem(KEY); } catch (e) { console.error(e); }
}

const loreText = (s) =>
  `KARAKTERLER:\n${s.lore.chars.map((c) => `- ${c.n} (${c.r}): ${c.d}`).join("\n")}\n` +
  `DÜNYA KURALLARI:\n${s.lore.rules.map((r) => `- ${r.t}`).join("\n")}\n` +
  `AÇIK İPLİKLER:\n${s.lore.threads.filter((t) => t.open).map((t) => `- ${t.t}`).join("\n") || "- yok"}`;

/* ---------------- küçük parçalar ---------------- */
const Coin = ({ n, size = 12 }) => (
  <span className="mono" style={{ color: T.gold, fontSize: size, fontWeight: 700 }}>◈ {n.toLocaleString("tr-TR")}</span>
);
const Bar = ({ v, g, c = T.violet }) => (
  <div style={{ height: 5, background: T.panel2, borderRadius: 99, overflow: "hidden" }}>
    <div style={{ width: `${Math.min(100, (v / g) * 100)}%`, height: "100%", background: c, borderRadius: 99, transition: "width .4s" }} />
  </div>
);
const Head = ({ k, t, right }) => (
  <div className="flex items-end justify-between mb-3 mt-6">
    <div>
      <div className="mono" style={{ fontSize: 10, color: T.violet, letterSpacing: ".18em" }}>{k}</div>
      <h2 style={{ fontSize: 17, fontWeight: 700, marginTop: 2 }}>{t}</h2>
    </div>
    {right}
  </div>
);
const Lbl = ({ children, hint }) => (
  <div style={{ margin: "18px 0 8px" }}>
    <div className="mono" style={{ fontSize: 10, color: T.muted, letterSpacing: ".14em" }}>{children}</div>
    {hint && <div style={{ fontSize: 11, color: T.muted, opacity: .7, marginTop: 3 }}>{hint}</div>}
  </div>
);
function Chips({ opts, val, set, accent, multi }) {
  const on = (o) => (multi ? val.includes(o) : val === o);
  const tap = (o) => (multi ? set(val.includes(o) ? val.filter((x) => x !== o) : [...val, o]) : set(o));
  return (
    <div className="flex flex-wrap gap-2">
      {opts.map((o) => (
        <button key={o} onClick={() => tap(o)} className="pill" style={{
          padding: "8px 12px", fontSize: 11, textAlign: "left",
          background: on(o) ? accent : T.panel2, color: on(o) ? "#fff" : T.muted,
          border: `1px solid ${on(o) ? accent : T.line}`,
        }}>{o}</button>
      ))}
    </div>
  );
}
function Slider({ v, set, a, b, accent }) {
  return (
    <div>
      <input type="range" min="0" max="100" value={v} onChange={(e) => set(+e.target.value)} style={{ width: "100%", accentColor: accent }} />
      <div className="flex justify-between mono" style={{ fontSize: 9, color: T.muted, marginTop: 2 }}>
        <span>{a}</span><span style={{ color: accent }}>{v}</span><span>{b}</span>
      </div>
    </div>
  );
}
function TagAdd({ items, set, ph, accent, color }) {
  const [v, setV] = useState("");
  const c = color || accent;
  const add = () => { const t = v.trim(); if (!t) return; set([...items, t]); setV(""); };
  return (
    <div>
      {items.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-2">
          {items.map((x, i) => (
            <button key={i} onClick={() => set(items.filter((_, j) => j !== i))} className="pill"
              style={{ background: T.panel2, color: c, border: `1px solid ${c}`, padding: "7px 10px", fontSize: 11 }}>
              {x} <span style={{ opacity: .6 }}>×</span>
            </button>
          ))}
        </div>
      )}
      <div className="flex gap-2">
        <input className="inp" value={v} onChange={(e) => setV(e.target.value)} onKeyDown={(e) => e.key === "Enter" && add()} placeholder={ph} />
        <button onClick={add} className="btn-ghost" style={{ width: "auto", padding: "0 16px", borderColor: c, color: c }}>Ekle</button>
      </div>
    </div>
  );
}
function Sheet({ children, close, accent }) {
  return (
    <div className="fixed inset-0 z-40 flex items-end" style={{ background: "rgba(0,0,0,.7)" }} onClick={close}>
      <div onClick={(e) => e.stopPropagation()} className="fade w-full" style={{
        maxWidth: 480, margin: "0 auto", background: T.panel, borderTop: `1px solid ${accent}`,
        borderRadius: "20px 20px 0 0", padding: 20, maxHeight: "90vh", overflowY: "auto",
      }}>
        <div style={{ width: 36, height: 4, background: T.line, borderRadius: 99, margin: "0 auto 16px" }} />
        {children}
      </div>
    </div>
  );
}

/* ---------------- çizilmiş panel ---------------- */
function Art({ svg, hue, h, w = "100%", note, children }) {
  if (svg) return (
    <div className="relative overflow-hidden" style={{ width: w, height: h, borderRadius: 10, background: "#000" }}>
      <div style={{ position: "absolute", inset: 0 }} dangerouslySetInnerHTML={{ __html: svg }} />
      {children}
    </div>
  );
  return (
    <div className="relative overflow-hidden" style={{ ...cover(hue, h), width: w, borderRadius: 10, display: "grid", placeItems: "center", padding: 16 }}>
      {note && <span className="mono" style={{ fontSize: 10, color: "rgba(255,255,255,.4)", textAlign: "center", lineHeight: 1.6 }}>{note}</span>}
      {children}
    </div>
  );
}

/* ---------------- İMZA: Dal Ağacı ---------------- */
function BranchTree({ s, onOpen, onFork }) {
  return (
    <div className="relative pl-9 pt-1">
      <div className="spine" />
      <div className="flex gap-3 mb-4 relative">
        <div className="node" style={{ background: T.paper, marginLeft: -30 }} />
        <div style={{ marginLeft: -6 }}>
          <div style={{ fontWeight: 800, fontSize: 14 }}>Canon · 1–{s.chapters}. bölüm</div>
          <div style={{ fontSize: 12, color: T.muted }}>Orijinal ekip · {s.year}</div>
        </div>
      </div>
      <div className="flex gap-3 mb-5 relative">
        <div className="node" style={{ background: T.hanko, marginLeft: -30, boxShadow: `0 0 12px ${T.hanko}` }} />
        <div style={{ marginLeft: -6 }}>
          <span className="hanko">BURADA BIRAKILDI</span>
          <div style={{ fontSize: 12, color: T.muted, marginTop: 6 }}>{s.reason} · {s.year}</div>
        </div>
      </div>
      {s.branches.map((b) => {
        const sc = scoreOf(b), ai = aiOf(b), h = humanOf(b);
        return (
          <button key={b.id} onClick={() => onOpen(b)} className="card fade block w-full text-left relative"
            style={{ marginLeft: 14, marginBottom: 10, padding: 12, borderColor: b.mine ? T.violet : T.line }}>
            <div className="branch-arm" />
            <div className="flex justify-between items-start gap-2">
              <div style={{ minWidth: 0 }}>
                <div style={{ fontWeight: 800, fontSize: 14 }}>
                  {b.title} {b.mine && <span className="pill" style={{ background: T.panel2, color: T.violet, fontSize: 9 }}>SENİN</span>}
                </div>
                <div style={{ fontSize: 11, color: T.muted, marginTop: 2 }}>
                  {b.by} · {b.ch} bölüm{b.from ? ` · ${b.from}. bölümden sapma` : ""}
                </div>
              </div>
              <div style={{ textAlign: "right", flexShrink: 0 }}>
                <div className="mono" style={{ fontSize: 18, fontWeight: 700, color: scoreColor(sc.total) }}>{sc.total}</div>
                <div className="mono" style={{ fontSize: 9, color: T.muted }}>ORTAK</div>
              </div>
            </div>
            <div className="flex gap-3 mt-2 mono" style={{ fontSize: 10, color: T.muted }}>
              <span>◆ AI {Math.round(AXES.reduce((x, a) => x + ai[a.k], 0) / AXES.length)}</span>
              <span style={{ color: h ? T.gold : T.muted }}>
                ▲ Okur {h ? Math.round(AXES.reduce((x, a) => x + h[a.k], 0) / AXES.length) : "—"} ({sc.n})
              </span>
            </div>
          </button>
        );
      })}
      <button onClick={onFork} className="flex gap-3 relative items-center" style={{ marginTop: 4 }}>
        <div className="node pulse" style={{ background: T.violet, marginLeft: -30 }} />
        <div style={{ fontSize: 12, color: T.violet, fontWeight: 700, marginLeft: -6 }}>Kendi dalını aç →</div>
      </button>
    </div>
  );
}

/* ================= ANA ================= */
export default function StoryLoom() {
  const [tab, setTab] = useState("home");
  const [series, setSeries] = useState(SEED);
  const [coins, setCoins] = useState(1240);
  const [claimed, setClaimed] = useState({ d2: true });
  const [openId, setOpenId] = useState(null);
  const [reader, setReader] = useState(null);
  const [editor, setEditor] = useState(null);
  const [conv, setConv] = useState(false);
  const [adding, setAdding] = useState(false);
  const [styleLib, setStyleLib] = useState(false);
  const [styles, setStyles] = useState(STYLES);
  const [styleId, setStyleId] = useState("manhwa");
  const [accent, setAccent] = useState(T.violet);
  const [toast, setToast] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    (async () => {
      const d = await loadSave();
      if (d) {
        if (d.series) setSeries(d.series);
        if (typeof d.coins === "number") setCoins(d.coins);
        if (d.claimed) setClaimed(d.claimed);
        if (d.accent) setAccent(d.accent);
        if (d.styles) setStyles(d.styles);
        if (d.styleId) setStyleId(d.styleId);
      }
      setReady(true);
    })();
  }, []);

  useEffect(() => {
    if (!ready) return;
    writeSave({ series, coins, claimed, accent, styles, styleId });
  }, [series, coins, claimed, accent, styles, styleId, ready]);

  const s = series.find((x) => x.id === openId);
  const rSeries = reader && series.find((x) => x.id === reader.sid);
  const rBranch = rSeries && reader.bid ? rSeries.branches.find((b) => b.id === reader.bid) : null;
  const say = (m) => { setToast(m); setTimeout(() => setToast(null), 2400); };

  const addSeries = (x) => setSeries((p) => [x, ...p]);
  const style = styles.find((x) => x.id === styleId) || styles[0];

  /* mevcut dala yeni bölüm ekle */
  const appendChapter = (sid, bid, payload) => {
    setSeries((prev) => prev.map((x) => {
      if (x.id !== sid) return x;
      const b0 = x.branches.find((b) => b.id === bid);
      const chNo = (b0.chapters?.[b0.chapters.length - 1]?.n || x.chapters) + 1;
      const src = `bl.${chNo}`;
      const chars = [...x.lore.chars, ...(payload.chars || []).map((c) => ({ id: uid(), n: c.split("—")[0].trim(), r: "Dal", d: (c.split("—")[1] || "").trim() || c, src }))];
      const rules = [...x.lore.rules, ...(payload.rules || []).map((r) => ({ id: uid(), t: r, src }))];
      const threads = x.lore.threads.map((t) => (payload.resolved || []).includes(t.t) ? { ...t, open: false, closedIn: chNo } : t);
      const log = [
        ...(payload.note ? [{ id: uid(), t: payload.note, src, when: "az önce" }] : []),
        ...(payload.chars || []).map((c) => ({ id: uid(), t: `Yeni karakter: ${c}`, src, when: "az önce" })),
        ...(payload.rules || []).map((r) => ({ id: uid(), t: `Yeni kural: ${r}`, src, when: "az önce" })),
        ...(payload.resolved || []).map((r) => ({ id: uid(), t: `İplik kapandı: ${r}`, src, when: "az önce" })),
        ...x.lore.log,
      ];
      return {
        ...x,
        branches: x.branches.map((b) => b.id !== bid ? b : {
          ...b, ch: (b.chapters?.length || 0) + 1,
          chapters: [...(b.chapters || []), { n: chNo, title: payload.title, fid: payload.fid, scenes: payload.scenes || [] }],
        }),
        lore: { chars, rules, threads, log },
      };
    }));
  };

  /* panel çizimini kaydet */
  const saveArt = (sid, bid, chIdx, scIdx, svg) => {
    setSeries((prev) => prev.map((x) => x.id !== sid ? x : {
      ...x,
      branches: x.branches.map((b) => b.id !== bid ? b : {
        ...b,
        chapters: b.chapters.map((c, i) => i !== chIdx ? c : {
          ...c, scenes: c.scenes.map((s, j) => j !== scIdx ? s : { ...s, art: svg }),
        }),
      }),
    }));
  };

  /* okur puanı + yorum */
  const rate = (sid, bid, review) => {
    setSeries((prev) => prev.map((x) => x.id !== sid ? x : {
      ...x,
      branches: x.branches.map((b) => b.id !== bid ? b : {
        ...b,
        votes: (b.votes || 0) + 1,
        reviews: [{ id: uid(), by: "Kadir", when: "az önce", ...review }, ...(b.reviews || [])],
      }),
    }));
    setCoins((c) => c + 10);
    say("Puanın kaydedildi · +10 coin");
  };
  const reset = async () => {
    await wipeSave();
    setSeries(SEED); setCoins(1240); setClaimed({ d2: true }); setAccent(T.violet);
    say("Her şey sıfırlandı");
  };

  const claim = (q) => {
    if (claimed[q.id] || q.p < q.g) return;
    setClaimed({ ...claimed, [q.id]: true });
    setCoins((c) => c + q.c);
    say(`+${q.c} coin alındı`);
  };

  /* HAFIZAYA GERİ YAZMA */
  const commit = (sid, payload) => {
    setSeries((prev) => prev.map((x) => {
      if (x.id !== sid) return x;
      const chNo = x.chapters + 1;
      const src = `bl.${chNo}`;
      const chars = [...x.lore.chars, ...payload.chars.map((c) => ({ id: uid(), n: c.split("—")[0].trim(), r: "Dal", d: (c.split("—")[1] || "").trim() || c, src }))];
      const rules = [...x.lore.rules, ...payload.rules.map((r) => ({ id: uid(), t: r, src }))];
      const threads = x.lore.threads.map((t) => payload.resolved.includes(t.t) ? { ...t, open: false, closedIn: chNo } : t);
      const log = [
        ...(payload.note ? [{ id: uid(), t: payload.note, src, when: "az önce" }] : []),
        ...payload.chars.map((c) => ({ id: uid(), t: `Yeni karakter: ${c}`, src, when: "az önce" })),
        ...payload.rules.map((r) => ({ id: uid(), t: `Yeni kural: ${r}`, src, when: "az önce" })),
        ...payload.resolved.map((r) => ({ id: uid(), t: `İplik kapandı: ${r}`, src, when: "az önce" })),
        ...x.lore.log,
      ];
      const branch = {
        id: uid(), by: "Kadir", title: payload.title, ch: 1, fid: payload.fid,
        votes: 0, ai: payload.fid, mine: true, from: payload.from,
        aiAxes: payload.aiAxes,
        reviews: [],
        chapters: [{ n: payload.from || chNo, title: payload.title, fid: payload.fid, scenes: payload.scenes || [] }],
      };
      return { ...x, branches: [branch, ...x.branches], lore: { chars, rules, threads, log } };
    }));
  };

  const go = (t) => { setOpenId(null); setReader(null); setEditor(null); setTab(t); window.scrollTo(0, 0); };

  if (!ready) return (
    <div className="sl" style={{ display: "grid", placeItems: "center", minHeight: "100vh" }}>
      <style>{CSS}</style>
      <div className="pulse mono" style={{ fontSize: 11, color: T.violet, letterSpacing: ".2em" }}>HAFIZA AÇILIYOR…</div>
    </div>
  );

  return (
    <div className="sl" style={{ paddingBottom: 88 }}>
      <style>{CSS}</style>

      <div className="flex items-center justify-between px-4 py-3 sticky top-0 z-30"
        style={{ background: "rgba(10,7,17,.88)", backdropFilter: "blur(14px)", borderBottom: `1px solid ${T.line}` }}>
        <button onClick={() => go("home")} className="flex items-center gap-2">
          <div style={{ width: 22, height: 22, borderRadius: 6, background: accent, display: "grid", placeItems: "center", fontSize: 12, fontWeight: 900, color: "#fff" }}>丿</div>
          <span className="disp" style={{ fontWeight: 900, fontSize: 15 }}>StoryLoom</span>
        </button>
        <div className="flex items-center gap-2">
          <div className="pill" style={{ background: T.panel2, border: `1px solid ${T.line}` }}><Coin n={coins} /></div>
          <div className="pill" style={{ background: "rgba(240,180,41,.12)", color: T.gold }}>Yazar</div>
        </div>
      </div>

      <div className="px-4">
        {s ? <SeriesView s={s} back={() => setOpenId(null)} read={setReader} coins={coins} setCoins={setCoins}
          say={say} accent={accent} commit={commit} appendChapter={appendChapter} openEditor={setEditor} style={style} />
          : tab === "home" ? <Home go={go} series={series} open={setOpenId} claimed={claimed} accent={accent}
            openEditor={setEditor} openConv={() => setConv(true)} openAdd={() => setAdding(true)}
            openStyles={() => setStyleLib(true)} style={style} />
            : tab === "quests" ? <Quests claimed={claimed} claim={claim} accent={accent} />
              : tab === "guilds" ? <Guilds say={say} accent={accent} />
                : tab === "market" ? <Market coins={coins} setCoins={setCoins} say={say} accent={accent} />
                  : <Profile accent={accent} setAccent={setAccent} coins={coins} say={say} series={series} reset={reset} />}
      </div>

      {rSeries && <Reader s={rSeries} ch={reader.ch} branch={rBranch} rate={rate} style={style}
        saveArt={(ci, si, svg) => saveArt(rSeries.id, rBranch.id, ci, si, svg)}
        onClose={() => setReader(null)} accent={accent} />}
      {editor && <PanelEditor init={editor} close={() => setEditor(null)} say={say} accent={accent} style={style} />}
      {conv && <Converter close={() => setConv(false)} accent={accent} toEditor={(d) => { setConv(false); setEditor(d); }} />}
      {adding && <AddSeries close={() => setAdding(false)} accent={accent} add={addSeries} say={say} />}
      {styleLib && <StyleLib close={() => setStyleLib(false)} accent={accent} styles={styles}
        setStyles={setStyles} styleId={styleId} setStyleId={setStyleId} say={say} />}

      <nav className="fixed bottom-0 left-0 right-0 z-30 flex" style={{
        maxWidth: 480, margin: "0 auto", background: "rgba(10,7,17,.94)", backdropFilter: "blur(14px)",
        borderTop: `1px solid ${T.line}`, padding: "8px 0 20px",
      }}>
        {[["home", "Keşfet", "◈"], ["quests", "Görev", "✦"], ["guilds", "Klan", "⛨"], ["market", "Market", "⬗"], ["me", "Profil", "◉"]].map(([k, l, i]) => (
          <button key={k} onClick={() => go(k)} className="flex-1 flex flex-col items-center gap-1"
            style={{ color: tab === k && !s ? accent : T.muted }}>
            <span style={{ fontSize: 17 }}>{i}</span>
            <span style={{ fontSize: 10, fontWeight: 700 }}>{l}</span>
          </button>
        ))}
      </nav>

      {toast && (
        <div className="fade fixed z-50" style={{
          bottom: 96, left: "50%", transform: "translateX(-50%)", background: T.panel2,
          border: `1px solid ${accent}`, padding: "10px 18px", borderRadius: 999, fontSize: 13, fontWeight: 700, whiteSpace: "nowrap",
        }}>{toast}</div>
      )}
    </div>
  );
}

/* ---------------- KEŞFET ---------------- */
function Home({ go, series, open, claimed, accent, openEditor, openConv, openAdd, openStyles, style }) {
  const done = QUESTS.daily.filter((q) => claimed[q.id]).length;
  const [q, setQ] = useState("");
  const found = series.filter((x) =>
    !q.trim() || (x.title + x.type + x.tags.join(" ")).toLowerCase().includes(q.trim().toLowerCase()));
  const blank = () => openEditor({
    title: "Yeni sayfa", hue: 268,
    panels: [{ id: uid(), h: 260, hue: 268, note: "", els: [] }],
  });
  const tools = [
    ["Novel → Webtoon", "Metni panele çevir", openConv],
    ["Panel editörü", "Balon, efekt, kadraj", blank],
    ["Stil kütüphanesi", style.n, openStyles],
    ["Poster üretici", "Sosyal medya görseli", null],
  ];
  return (
    <div className="fade">
      <div className="mt-5">
        <div className="hanko" style={{ marginBottom: 14 }}>3.412 SERİ TERK EDİLDİ</div>
        <h1 style={{ fontSize: 30, lineHeight: 1.12, fontWeight: 900 }}>
          Yarım kalan<br />hikâyeler bitmeyi<br /><span style={{ color: accent }}>hak ediyor.</span>
        </h1>
        <p style={{ color: T.muted, fontSize: 14, marginTop: 12, lineHeight: 1.5 }}>
          Bıraktığın yerden devam et. StoryLoom seriyi okur, karakterleri ve dünyayı ezberler, senin dalını yazar.
        </p>
      </div>

      <button onClick={() => go("quests")} className="card w-full text-left mt-5 p-4">
        <div className="flex justify-between items-center mb-2">
          <span style={{ fontSize: 13, fontWeight: 800 }}>Bugünün görevleri</span>
          <span className="mono" style={{ fontSize: 11, color: T.muted }}>{done}/3</span>
        </div>
        <Bar v={done} g={3} c={accent} />
        <div style={{ fontSize: 11, color: T.muted, marginTop: 8 }}>Tamamla, <Coin n={65} size={11} /> kazan</div>
      </button>

      <Head k="TERK EDİLDİ" t="Devam bekleyenler" right={
        <button onClick={openAdd} className="pill" style={{ background: T.panel2, color: accent, border: `1px solid ${accent}`, padding: "8px 12px" }}>+ Seri ekle</button>
      } />
      <input className="inp mb-3" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Seri ara — isim, tür, etiket…" />
      {found.length === 0 && (
        <div className="card p-4" style={{ fontSize: 12, color: T.muted, lineHeight: 1.5 }}>
          "{q}" bulunamadı. Yukarıdan ekleyebilirsin — StoryLoom hafızasını kurar.
        </div>
      )}
      <div className="scroll-x flex gap-3 pb-1" style={{ margin: "0 -16px", padding: "0 16px" }}>
        {found.map((x) => (
          <button key={x.id} onClick={() => open(x.id)} className="text-left" style={{ flex: "0 0 150px" }}>
            <div className="card overflow-hidden" style={{ ...cover(x.hue, 190), position: "relative", display: "flex", alignItems: "flex-end", padding: 10 }}>
              <div className="pill" style={{ position: "absolute", top: 8, right: 8, background: "rgba(229,72,77,.9)", color: "#fff", fontSize: 9 }}>{x.year}</div>
              <div>
                <div className="disp" style={{ fontSize: 15, fontWeight: 700, lineHeight: 1.2 }}>{x.title}</div>
                <div className="mono" style={{ fontSize: 10, color: "rgba(255,255,255,.6)", marginTop: 3 }}>{x.type} · {x.chapters} bl.</div>
              </div>
            </div>
            <div style={{ fontSize: 11, color: T.muted, marginTop: 6 }}>{x.branches.length} dal · {x.followers} takip</div>
          </button>
        ))}
      </div>

      <Head k="TALEP PANOSU" t="Ortak kesenin dolduğu seriler" />
      <div className="card p-4">
        <div style={{ fontSize: 14, fontWeight: 800 }}>Kanlı Fener — 85. bölüm</div>
        <div style={{ fontSize: 12, color: T.muted, margin: "4px 0 10px" }}>318 okur ödül havuzuna katıldı</div>
        <Bar v={8400} g={12000} c={T.gold} />
        <div className="flex justify-between mt-2" style={{ fontSize: 11 }}>
          <Coin n={8400} size={11} /><span className="mono" style={{ color: T.muted }}>hedef 12.000</span>
        </div>
        <button className="btn-ghost mt-3 w-full" style={{ borderColor: T.gold, color: T.gold }}>Havuza katıl</button>
      </div>

      <Head k="STÜDYO" t="Araçlar" />
      <div className="grid grid-cols-2 gap-3">
        {tools.map(([t, d, fn]) => (
          <button key={t} onClick={fn || undefined} disabled={!fn} className="card p-3 text-left"
            style={{ opacity: fn ? 1 : .5, borderColor: fn ? accent : T.line }}>
            <div style={{ fontSize: 13, fontWeight: 800 }}>{t}</div>
            <div style={{ fontSize: 11, color: T.muted, marginTop: 3 }}>{fn ? d : "yakında"}</div>
          </button>
        ))}
      </div>
      <div style={{ height: 24 }} />
    </div>
  );
}

/* ---------------- SERİ ---------------- */
function SeriesView({ s, back, read, coins, setCoins, say, accent, commit, appendChapter, openEditor, style }) {
  const [t, setT] = useState("dallar");
  const [forge, setForge] = useState(null); // {from} | {branch} | {}
  const mine = s.branches.filter((b) => b.mine);
  return (
    <div className="fade">
      <button onClick={back} className="btn-ghost mt-4" style={{ width: "auto", padding: "7px 14px" }}>← Geri</button>

      <div className="card overflow-hidden mt-3" style={{ ...cover(s.hue, 170), display: "flex", alignItems: "flex-end", padding: 14 }}>
        <div>
          <div className="flex gap-1.5 mb-2">{s.tags.map((x) => <span key={x} className="pill" style={{ background: "rgba(0,0,0,.4)", fontSize: 9 }}>{x}</span>)}</div>
          <h1 style={{ fontSize: 24, fontWeight: 900 }}>{s.title}</h1>
          <div className="mono" style={{ fontSize: 11, color: "rgba(255,255,255,.65)", marginTop: 4 }}>{s.type} · {s.chapters} bölüm · {s.followers}</div>
        </div>
      </div>

      <p style={{ fontSize: 13, color: T.muted, lineHeight: 1.6, marginTop: 12 }}>{s.synopsis}</p>

      <div className="flex gap-2 mt-4">
        <button onClick={() => read({ sid: s.id, ch: 1 })} className="btn-ghost" style={{ flex: 1 }}>Oku</button>
        <button onClick={() => setForge({})} className="btn" style={{ flex: 1.4, background: accent }}>Devam ettir</button>
      </div>

      <div className="flex gap-1 mt-6 p-1 card" style={{ borderRadius: 12 }}>
        {[["dallar", "Dallar"], ["hafiza", "Hafıza"], ["bolumler", "Bölümler"]].map(([k, l]) => (
          <button key={k} onClick={() => setT(k)} className="flex-1 py-2" style={{
            fontSize: 12, fontWeight: 800, borderRadius: 9,
            background: t === k ? accent : "transparent", color: t === k ? "#fff" : T.muted,
          }}>{l}</button>
        ))}
      </div>

      <div className="mt-5">
        {t === "dallar" && (
          <>
            {mine.length > 0 && (
              <div className="card p-3 mb-4" style={{ borderColor: accent }}>
                <div className="mono" style={{ fontSize: 9, color: accent, letterSpacing: ".14em", marginBottom: 8 }}>DALLARINI SÜRDÜR</div>
                {mine.map((b) => (
                  <div key={b.id} className="flex justify-between items-center gap-2" style={{ marginBottom: 6 }}>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 700 }}>{b.title}</div>
                      <div className="mono" style={{ fontSize: 10, color: T.muted }}>{b.chapters?.length || 0} bölüm</div>
                    </div>
                    <button onClick={() => setForge({ branch: b })} className="pill"
                      style={{ background: accent, color: "#fff", padding: "8px 12px", fontSize: 11, flexShrink: 0 }}>
                      + Bölüm ekle
                    </button>
                  </div>
                ))}
              </div>
            )}
            <BranchTree s={s} onOpen={(b) => read({ sid: s.id, bid: b.id })} onFork={() => setForge({})} />
          </>
        )}
        {t === "hafiza" && <Memory s={s} accent={accent} />}
        {t === "bolumler" && (
          <>
            <div className="card p-3 mb-3" style={{ fontSize: 12, color: T.muted, lineHeight: 1.5, borderLeft: `3px solid ${T.hanko}` }}>
              Gidişatı beğenmediğin bölümü seç, oradan itibaren hikâyeyi yeniden dokut.
            </div>
            {Array.from({ length: 10 }).map((_, i) => {
              const n = s.chapters - i;
              return (
                <div key={n} className="card p-3 mb-2 flex justify-between items-center">
                  <button onClick={() => read({ sid: s.id, ch: n })} className="text-left" style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 700 }}>Bölüm {n}</div>
                    <div className="mono" style={{ fontSize: 10, color: T.muted, marginTop: 2 }}>{s.year}</div>
                  </button>
                  <button onClick={() => setForge({ from: n })} className="pill"
                    style={{ background: T.panel2, color: T.hanko, border: `1px solid ${T.hanko}`, padding: "7px 11px", fontSize: 10 }}>
                    ⟲ Buradan sap
                  </button>
                </div>
              );
            })}
          </>
        )}
      </div>

      {forge && <Forge s={s} from={forge.from} branch={forge.branch} close={() => setForge(null)} coins={coins} setCoins={setCoins}
        say={say} accent={accent} commit={commit} appendChapter={appendChapter} openEditor={openEditor} style={style} />}
      <div style={{ height: 24 }} />
    </div>
  );
}

/* ---------------- HAFIZA (yaşayan lore) ---------------- */
function Memory({ s, accent }) {
  const [chat, setChat] = useState(null);
  const open = s.lore.threads.filter((t) => t.open);
  const closed = s.lore.threads.filter((t) => !t.open);
  const Src = ({ src }) => (
    <span className="pill" style={{
      fontSize: 8, padding: "2px 7px",
      background: src === "canon" ? T.panel2 : "rgba(139,92,246,.15)",
      color: src === "canon" ? T.muted : accent,
    }}>{src === "canon" ? "CANON" : src.toUpperCase()}</span>
  );

  return (
    <div className="fade">
      <div className="card p-4 mb-4" style={{ borderColor: accent }}>
        <div className="flex justify-between items-center">
          <span style={{ fontSize: 13, fontWeight: 800 }}>Hafıza çekirdeği</span>
          <span className="mono pulse" style={{ fontSize: 10, color: accent }}>● CANLI</span>
        </div>
        <div style={{ fontSize: 12, color: T.muted, marginTop: 6 }}>
          {s.lore.chars.length} karakter · {s.lore.rules.length} kural · {open.length} açık iplik · {closed.length} kapanmış
        </div>
        <div style={{ fontSize: 11, color: T.muted, marginTop: 8, lineHeight: 1.5 }}>
          Yayımladığın her bölüm buraya işlenir. Sonraki üretimler bu bilgiyi hatırlar.
        </div>
      </div>

      <div className="mono" style={{ fontSize: 10, color: accent, letterSpacing: ".16em", marginBottom: 8 }}>KARAKTERLER · dokun, konuş</div>
      {s.lore.chars.map((c) => (
        <button key={c.id} onClick={() => setChat(c)} className="card p-3 mb-2 flex gap-3 w-full text-left">
          <div style={{ width: 38, height: 38, borderRadius: 10, flexShrink: 0, background: `linear-gradient(135deg,hsl(${s.hue} 50% 30%),hsl(${s.hue + 60} 50% 18%))` }} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="flex items-center gap-2">
              <span style={{ fontSize: 13, fontWeight: 800 }}>{c.n}</span><Src src={c.src} />
            </div>
            <div style={{ fontSize: 12, color: T.muted, marginTop: 2, lineHeight: 1.45 }}>{c.d}</div>
          </div>
          <span style={{ color: accent, fontSize: 14, flexShrink: 0 }}>💬</span>
        </button>
      ))}

      <div className="mono" style={{ fontSize: 10, color: accent, letterSpacing: ".16em", margin: "16px 0 8px" }}>DÜNYA KURALLARI</div>
      {s.lore.rules.map((r, i) => (
        <div key={r.id} className="card p-3 mb-2 flex gap-3 items-start" style={{ fontSize: 12 }}>
          <span className="mono" style={{ color: accent, flexShrink: 0 }}>{String(i + 1).padStart(2, "0")}</span>
          <span style={{ lineHeight: 1.45, flex: 1 }}>{r.t}</span>
          <Src src={r.src} />
        </div>
      ))}

      <div className="mono" style={{ fontSize: 10, color: T.hanko, letterSpacing: ".16em", margin: "16px 0 8px" }}>İPLİKLER</div>
      {open.map((x) => (
        <div key={x.id} className="card p-3 mb-2" style={{ fontSize: 12, borderLeft: `3px solid ${T.hanko}`, lineHeight: 1.45 }}>{x.t}</div>
      ))}
      {closed.map((x) => (
        <div key={x.id} className="card p-3 mb-2 flex justify-between items-center gap-2" style={{ fontSize: 12, borderLeft: `3px solid ${accent}`, opacity: .65 }}>
          <span style={{ textDecoration: "line-through", lineHeight: 1.45 }}>{x.t}</span>
          <span className="mono" style={{ fontSize: 9, color: accent, flexShrink: 0 }}>BL.{x.closedIn}</span>
        </div>
      ))}

      <div className="mono" style={{ fontSize: 10, color: T.muted, letterSpacing: ".16em", margin: "16px 0 8px" }}>HAFIZA GÜNLÜĞÜ</div>
      <div className="relative pl-6">
        <div style={{ position: "absolute", left: 4, top: 6, bottom: 6, width: 1, background: T.line }} />
        {s.lore.log.map((l) => (
          <div key={l.id} className="relative mb-3">
            <div style={{ position: "absolute", left: -25, top: 5, width: 9, height: 9, borderRadius: 99, background: l.src === "canon" ? T.line : accent }} />
            <div style={{ fontSize: 12, lineHeight: 1.45 }}>{l.t}</div>
            <div className="mono" style={{ fontSize: 9, color: T.muted, marginTop: 2 }}>{l.src.toUpperCase()} · {l.when}</div>
          </div>
        ))}
      </div>

      {chat && <CharChat s={s} c={chat} close={() => setChat(null)} accent={accent} />}
      <div style={{ height: 16 }} />
    </div>
  );
}

/* ---------------- KARAKTERLE KONUŞ ---------------- */
function CharChat({ s, c, close, accent }) {
  const [msgs, setMsgs] = useState([{ r: "a", t: `…${c.n} sana bakıyor.` }]);
  const [v, setV] = useState("");
  const [busy, setBusy] = useState(false);

  const send = async () => {
    const q = v.trim(); if (!q || busy) return;
    const next = [...msgs, { r: "u", t: q }];
    setMsgs(next); setV(""); setBusy(true);
    try {
      const hist = next.slice(1).map((m) => `${m.r === "u" ? "Okur" : c.n}: ${m.t}`).join("\n");
      const r = await ask(`Sen "${s.title}" adlı ${s.type} serisindeki ${c.n} karakterisin.
ROLÜN: ${c.r}. KİMLİĞİN: ${c.d}
SERİ ÖZETİ: ${s.synopsis}
${loreText(s)}

Karakterin ağzından, birinci şahıs, Türkçe cevap ver. Kısa konuş (en fazla 3 cümle). Karakterin bilmediği şeyi bilme. Dünya kurallarını çiğneme. Rolden çıkma, AI olduğunu söyleme.

KONUŞMA:
${hist}
${c.n}:`);
      setMsgs([...next, { r: "a", t: r.trim() }]);
    } catch { setMsgs([...next, { r: "a", t: "…sessizlik. Tekrar dene." }]); }
    setBusy(false);
  };

  return (
    <Sheet close={close} accent={accent}>
      <div className="flex items-center gap-3 mb-4">
        <div style={{ width: 42, height: 42, borderRadius: 12, background: `linear-gradient(135deg,hsl(${s.hue} 50% 30%),hsl(${s.hue + 60} 50% 18%))` }} />
        <div>
          <div style={{ fontSize: 16, fontWeight: 900 }}>{c.n}</div>
          <div style={{ fontSize: 11, color: T.muted }}>{c.r} · hafızadan konuşuyor</div>
        </div>
      </div>

      <div style={{ maxHeight: "45vh", overflowY: "auto", marginBottom: 12 }}>
        {msgs.map((m, i) => (
          <div key={i} className="fade" style={{ display: "flex", justifyContent: m.r === "u" ? "flex-end" : "flex-start", marginBottom: 8 }}>
            <div style={{
              maxWidth: "82%", padding: "10px 13px", borderRadius: 14, fontSize: 13, lineHeight: 1.5,
              background: m.r === "u" ? accent : T.panel2, color: m.r === "u" ? "#fff" : T.paper,
              fontStyle: i === 0 ? "italic" : "normal",
            }}>{m.t}</div>
          </div>
        ))}
        {busy && <div className="pulse mono" style={{ fontSize: 11, color: T.muted }}>{c.n} düşünüyor…</div>}
      </div>

      <div className="flex gap-2">
        <input className="inp" value={v} onChange={(e) => setV(e.target.value)} onKeyDown={(e) => e.key === "Enter" && send()}
          placeholder={`${c.n}'a bir şey sor…`} />
        <button onClick={send} className="btn" style={{ width: "auto", padding: "0 18px", background: accent }}>→</button>
      </div>
    </Sheet>
  );
}

/* ---------------- FORGE: iki modlu üretim ---------------- */
function Forge({ s, from, branch, close, coins, setCoins, say, accent, commit, appendChapter, openEditor, style }) {
  const [mode, setMode] = useState("basic");
  const [tone, setTone] = useState("Canon'a sadık");
  const [len, setLen] = useState("Orta");
  const [note, setNote] = useState("");

  const [tones, setTones] = useState(["Karanlık"]);
  const [pov, setPov] = useState("3. şahıs");
  const [pace, setPace] = useState(55);
  const [dialog, setDialog] = useState(50);
  const [fid, setFid] = useState(80);
  const [rating, setRating] = useState("16+");
  const [focus, setFocus] = useState([]);
  const [threads, setThreads] = useState([]);
  const [panels, setPanels] = useState(6);
  const [cliff, setCliff] = useState(true);
  const [newChars, setNewChars] = useState([]);
  const [newRules, setNewRules] = useState([]);
  const [forbid, setForbid] = useState([]);
  const [custom, setCustom] = useState([]);
  const [ck, setCk] = useState(""); const [cv, setCv] = useState("");
  const [adv, setAdv] = useState("");

  const [busy, setBusy] = useState(false);
  const [out, setOut] = useState(null);
  const [err, setErr] = useState(null);
  const [posted, setPosted] = useState(false);
  const [drawing, setDrawing] = useState(-1);

  const openThreads = s.lore.threads.filter((t) => t.open);
  const prev = branch && branch.chapters?.[branch.chapters.length - 1];
  const nextNo = branch ? (prev?.n || s.chapters) + 1 : s.chapters + 1;
  const cost = mode === "basic" ? 50 : Math.min(400,
    100 + panels * 8 + focus.length * 10 + threads.length * 15 + newChars.length * 20 + newRules.length * 20 + custom.length * 15);

  const addCustom = () => {
    if (!ck.trim() || !cv.trim()) return;
    setCustom([...custom, { k: ck.trim(), v: cv.trim() }]); setCk(""); setCv("");
  };

  const target = branch
    ? `Bu senin "${branch.title}" adlı dalın. ${nextNo}. bölümü yaz.

ÖNCEKİ BÖLÜM (${prev?.n} — "${prev?.title}"):
${(prev?.scenes || []).map((x) => x.metin).join(" ")}

Kaldığın yerden devam et, kopukluk olmasın.`
    : from
      ? `${from}. bölümden itibaren hikâyeyi YENİDEN YAZ (retcon). Orijinal ${from}. bölümdeki olaylar geçersiz.`
      : `${s.chapters + 1}. bölümü yaz (seri ${s.chapters}. bölümde yarım bırakıldı).`;

  const spec = () => mode === "basic"
    ? `Ton: ${tone}\nUzunluk: ${len}\nOkur notu: ${note || "yok"}\nPanel sayısı: 4`
    : [
      `Ton: ${tones.join(" + ") || "nötr"}`, `Anlatıcı: ${pov}`,
      `Tempo (0 yavaş / 100 hızlı): ${pace}`, `Diyalog yoğunluğu (0 az / 100 çok): ${dialog}`,
      `Canon sadakati (0 serbest / 100 kilitli): ${fid}`, `Olgunluk: ${rating}`,
      `Panel sayısı: ${panels}`, cliff ? "Cliffhanger ile bitsin." : "Kapanışlı bitsin.",
      focus.length ? `Odak karakterler: ${focus.join(", ")}` : "",
      threads.length ? `Şu iplikler bu bölümde çözülsün: ${threads.join(" | ")}` : "",
      newChars.length ? `Yeni karakterler (kanona ekle): ${newChars.join(" | ")}` : "",
      newRules.length ? `Yeni dünya kuralları (kanona ekle): ${newRules.join(" | ")}` : "",
      forbid.length ? `KESİNLİKLE OLMASIN: ${forbid.join(", ")}` : "",
      custom.length ? `Özel parametreler:\n${custom.map((c) => `- ${c.k}: ${c.v}`).join("\n")}` : "",
      adv ? `Yazar notu: ${adv}` : "",
    ].filter(Boolean).join("\n");

  const run = async () => {
    if (coins < cost) return say("Coin yetersiz");
    setBusy(true); setErr(null); setOut(null);
    try {
      const txt = await ask(`Sen bir ${s.type} yazarısın. "${s.title}" serisi için ${target}
Türkçe yaz.

ÖZET: ${s.synopsis}
${loreText(s)}

ÜRETİM AYARLARI:
${spec()}

SADECE şu JSON'u döndür, markdown backtick kullanma:
{"baslik":"bölüm başlığı","sahneler":[{"panel":"kadraj yönergesi tek cümle","replik":"panelde geçen kısa diyalog veya boş","metin":"anlatı, 2-3 cümle"}],"puanlar":{"sadakat":0-100,"karakter":0-100,"tempo":0-100,"diyalog":0-100,"ozgunluk":0-100},"gerekce":"puanların tek cümlelik gerekçesi","ihlal":["çiğnenen dünya kuralı varsa listele, yoksa boş dizi"],"not":"kanona eklenen kalıcı bilgi tek cümle, yoksa boş string"}
Puanları dürüst ver, kendi işini kayırma; zayıf yanı varsa düşük puanla.
sahneler dizisinde tam ${mode === "basic" ? 4 : panels} öğe olsun.`);
      const o = asJSON(txt);
      o.puanlar = o.puanlar || { sadakat: 80, karakter: 80, tempo: 80, diyalog: 80, ozgunluk: 80 };
      o.total = Math.round(AXES.reduce((x, a) => x + (o.puanlar[a.k] || 0), 0) / AXES.length);
      setOut(o);
      setCoins((c) => c - cost);
    } catch { setErr("Üretim tamamlanamadı. Tekrar dene."); }
    setBusy(false);
  };

  const publish = () => {
    const payload = {
      title: out.baslik, fid: out.puanlar.sadakat, aiAxes: out.puanlar, from,
      chars: mode === "adv" ? newChars : [],
      rules: mode === "adv" ? newRules : [],
      resolved: mode === "adv" ? threads : [],
      note: out.not || "",
      scenes: out.sahneler,
    };
    if (branch) { appendChapter(s.id, branch.id, payload); say(`${nextNo}. bölüm dala eklendi`); }
    else { commit(s.id, payload); say("Dal yayımlandı, hafıza güncellendi"); }
    setPosted(true);
  };

  /* panelleri çiz */
  const drawAll = async () => {
    for (let i = 0; i < out.sahneler.length; i++) {
      if (out.sahneler[i].art) continue;
      setDrawing(i);
      try {
        const svg = await drawPanel(out.sahneler[i].panel, style);
        if (svg) setOut((o) => ({ ...o, sahneler: o.sahneler.map((x, j) => j === i ? { ...x, art: svg } : x) }));
      } catch { /* sessiz geç */ }
    }
    setDrawing(-1);
    say("Paneller çizildi");
  };

  const toPanels = () => openEditor({
    title: out.baslik, hue: s.hue,
    panels: out.sahneler.map((p, i) => ({
      id: uid(), h: 240 + (i % 3) * 60, hue: s.hue + i * 22, note: p.panel,
      els: p.replik ? [{ id: uid(), type: "bubble", text: p.replik, x: 50, y: 22, w: 55, fs: 12 }] : [],
    })),
  });

  return (
    <Sheet close={close} accent={accent}>
      {out ? (
        <div className="fade">
          <div className="flex justify-between items-start gap-3">
            <div>
              <div className="mono" style={{ fontSize: 10, color: from ? T.hanko : accent, letterSpacing: ".14em" }}>
                {from ? `RETCON · BÖLÜM ${from}` : `BÖLÜM ${nextNo}`}
              </div>
              <h2 style={{ fontSize: 20, fontWeight: 900, marginTop: 4 }}>{out.baslik}</h2>
            </div>
            <div style={{ textAlign: "center", flexShrink: 0 }}>
              <div className="mono" style={{ fontSize: 24, fontWeight: 700, color: scoreColor(out.total) }}>{out.total}</div>
              <div className="mono" style={{ fontSize: 9, color: T.muted }}>AI PUANI</div>
            </div>
          </div>

          <div className="card p-3 mt-3">
            {AXES.map((a) => (
              <div key={a.k} className="mb-2">
                <div className="flex justify-between mono" style={{ fontSize: 10, color: T.muted, marginBottom: 3 }}>
                  <span>{a.l}</span><span style={{ color: scoreColor(out.puanlar[a.k]) }}>{out.puanlar[a.k]}</span>
                </div>
                <Bar v={out.puanlar[a.k]} g={100} c={scoreColor(out.puanlar[a.k])} />
              </div>
            ))}
            <div style={{ fontSize: 11, color: T.muted, lineHeight: 1.5, marginTop: 8 }}>{out.gerekce}</div>
            <div className="mono" style={{ fontSize: 9, color: T.muted, marginTop: 6 }}>
              YAYIMLAYINCA OKUR PUANLARI BUNUNLA HARMANLANIR
            </div>
          </div>

          {out.ihlal && out.ihlal.length > 0 && (
            <div className="card p-3 mt-2" style={{ borderColor: T.hanko }}>
              <span className="mono" style={{ fontSize: 9, color: T.hanko, letterSpacing: ".14em" }}>LORE MUHAFIZI · {out.ihlal.length} UYARI</span>
              {out.ihlal.map((x, i) => <div key={i} style={{ fontSize: 12, marginTop: 5, lineHeight: 1.45 }}>⚠ {x}</div>)}
            </div>
          )}
          {out.not && (
            <div className="card p-3 mt-2" style={{ borderLeft: `3px solid ${accent}` }}>
              <span className="mono" style={{ fontSize: 9, color: accent, letterSpacing: ".14em" }}>HAFIZAYA YAZILACAK</span>
              <div style={{ fontSize: 12, marginTop: 4, lineHeight: 1.5 }}>{out.not}</div>
            </div>
          )}

          <button onClick={drawAll} disabled={drawing >= 0} className="btn-ghost w-full mt-4"
            style={{ borderColor: T.gold, color: T.gold }}>
            {drawing >= 0
              ? `Panel ${drawing + 1}/${out.sahneler.length} çiziliyor…`
              : out.sahneler.every((x) => x.art) ? "Yeniden çiz" : `Panelleri çiz · ${style.n}`}
          </button>

          <div className="mt-4">
            {out.sahneler.map((p, i) => (
              <div key={i} className="mb-4">
                <Art svg={p.art} hue={s.hue + i * 22} h={150} note={p.panel}>
                  {drawing === i && (
                    <div className="pulse" style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", background: "rgba(0,0,0,.5)" }}>
                      <span className="mono" style={{ fontSize: 10, color: T.gold }}>ÇİZİLİYOR…</span>
                    </div>
                  )}
                  {p.replik && (
                    <div style={{ position: "absolute", bottom: 10, left: 12, right: 12, background: "#fff", color: "#111", fontSize: 11, fontWeight: 700, padding: "7px 10px", borderRadius: 12, textAlign: "center" }}>{p.replik}</div>
                  )}
                </Art>
                <p style={{ fontSize: 14, lineHeight: 1.65, marginTop: 8 }}>{p.metin}</p>
              </div>
            ))}
          </div>

          {posted ? (
            <>
              <div className="card p-3 mb-2" style={{ borderColor: accent, fontSize: 12, lineHeight: 1.5 }}>
                {branch ? "Bölüm dala eklendi." : "Dal yayımlandı."} {(mode === "adv" ? newChars.length + newRules.length : 0) + (out.not ? 1 : 0)} yeni bilgi hafızaya işlendi
                {threads.length > 0 && mode === "adv" ? `, ${threads.length} iplik kapandı` : ""}.
              </div>
              <button onClick={toPanels} className="btn" style={{ background: accent }}>Panel editörüne aktar →</button>
              <button onClick={close} className="btn-ghost mt-2 w-full">Kapat</button>
            </>
          ) : (
            <>
              <div className="flex gap-2 mt-2">
                <button onClick={() => setOut(null)} className="btn-ghost" style={{ flex: 1 }}>Ayarlar</button>
                <button onClick={publish} className="btn" style={{ flex: 1.4, background: accent }}>
                  {branch ? "Dala ekle" : "Yayımla ve hafızaya yaz"}
                </button>
              </div>
              <button onClick={toPanels} className="btn-ghost mt-2 w-full" style={{ borderColor: T.gold, color: T.gold }}>Önce panele dök</button>
            </>
          )}
        </div>
      ) : (
        <>
          {from && <div className="hanko" style={{ marginBottom: 12 }}>RETCON · {from}. BÖLÜMDEN SAPMA</div>}
          {branch && <div className="hanko" style={{ marginBottom: 12, borderColor: accent, color: accent }}>DAL: {branch.title.toUpperCase()}</div>}
          <h2 style={{ fontSize: 19, fontWeight: 900 }}>
            {from ? `${from}. bölümü yeniden dokut` : `${nextNo}. bölümü yaz`}
          </h2>
          <div style={{ fontSize: 12, color: T.muted, marginTop: 4, marginBottom: 14 }}>
            {branch ? `"${prev?.title}" bölümünden devam · ` : ""}
            Hafıza yüklü · {s.lore.chars.length} karakter, {s.lore.rules.length} kural, {openThreads.length} açık iplik
          </div>

          <div className="flex gap-1 p-1 card" style={{ borderRadius: 12 }}>
            {[["basic", "Hızlı", "3 ayar, tek dokunuş"], ["adv", "Gelişmiş", "Her şeyi sen kur"]].map(([k, l, d]) => (
              <button key={k} onClick={() => setMode(k)} className="flex-1 py-2.5" style={{
                borderRadius: 9, background: mode === k ? accent : "transparent", color: mode === k ? "#fff" : T.muted,
              }}>
                <div style={{ fontSize: 13, fontWeight: 800 }}>{l}</div>
                <div style={{ fontSize: 9, opacity: .8, marginTop: 1 }}>{d}</div>
              </button>
            ))}
          </div>

          {mode === "basic" ? (
            <>
              <Lbl>TON</Lbl>
              <Chips opts={["Canon'a sadık", "Karanlık", "Cesur sapma"]} val={tone} set={setTone} accent={accent} />
              <Lbl>UZUNLUK</Lbl>
              <Chips opts={["Kısa", "Orta", "Uzun"]} val={len} set={setLen} accent={accent} />
              <Lbl>NOTUN</Lbl>
              <textarea className="inp" rows={3} value={note} onChange={(e) => setNote(e.target.value)}
                placeholder="Bora'nın ihanetinin sebebi açıklansın." style={{ resize: "none" }} />
              <button onClick={() => setMode("adv")} className="btn-ghost mt-4 w-full" style={{ color: T.muted, fontSize: 12 }}>
                Daha fazla kontrol istiyorum →
              </button>
            </>
          ) : (
            <>
              <div className="hanko" style={{ marginTop: 16, borderColor: accent, color: accent }}>YAZAR KONTROLÜ</div>

              <Lbl hint="Birden fazla seçebilirsin, harmanlanır.">TON</Lbl>
              <Chips multi opts={["Canon'a sadık", "Karanlık", "Trajik", "Gerilim", "Mizahi", "Romantik", "Epik", "Melankolik"]} val={tones} set={setTones} accent={accent} />
              <Lbl>ANLATICI</Lbl>
              <Chips opts={["1. şahıs", "3. şahıs", "Çoklu bakış", "Belgesel"]} val={pov} set={setPov} accent={accent} />
              <Lbl>OLGUNLUK</Lbl>
              <Chips opts={["Genel", "13+", "16+", "18+"]} val={rating} set={setRating} accent={accent} />
              <Lbl>TEMPO</Lbl>
              <Slider v={pace} set={setPace} a="Yavaş yanma" b="Tam gaz" accent={accent} />
              <Lbl>DİYALOG YOĞUNLUĞU</Lbl>
              <Slider v={dialog} set={setDialog} a="Sessiz" b="Konuşkan" accent={accent} />
              <Lbl hint="Düşük = kuralları esnetebilir. Yüksek = hiçbir kural çiğnenmez.">CANON SADAKATİ</Lbl>
              <Slider v={fid} set={setFid} a="Serbest" b="Kilitli" accent={accent} />

              <Lbl>PANEL SAYISI</Lbl>
              <div className="flex items-center gap-3">
                <button onClick={() => setPanels(Math.max(4, panels - 1))} className="btn-ghost" style={{ width: 44, padding: "10px 0" }}>−</button>
                <span className="mono" style={{ fontSize: 20, fontWeight: 700, minWidth: 30, textAlign: "center" }}>{panels}</span>
                <button onClick={() => setPanels(Math.min(10, panels + 1))} className="btn-ghost" style={{ width: 44, padding: "10px 0" }}>+</button>
                <button onClick={() => setCliff(!cliff)} className="pill" style={{
                  marginLeft: "auto", padding: "9px 14px", fontSize: 11,
                  background: cliff ? accent : T.panel2, color: cliff ? "#fff" : T.muted, border: `1px solid ${cliff ? accent : T.line}`,
                }}>Cliffhanger</button>
              </div>

              <Lbl hint="Bu bölüm kimin etrafında dönsün?">ODAK KARAKTERLER</Lbl>
              <Chips multi opts={s.lore.chars.map((c) => c.n)} val={focus} set={setFocus} accent={accent} />

              <Lbl hint="Seçtiklerin bu bölümde kapanır ve hafızada işaretlenir.">ÇÖZÜLECEK İPLİKLER</Lbl>
              {openThreads.length ? <Chips multi opts={openThreads.map((t) => t.t)} val={threads} set={setThreads} accent={accent} />
                : <div style={{ fontSize: 12, color: T.muted }}>Açık iplik kalmadı.</div>}

              <Lbl hint="Format: İsim — açıklama. Yayımlayınca hafızaya kalıcı işlenir.">KENDİ KARAKTERİNİ EKLE</Lbl>
              <TagAdd items={newChars} set={setNewChars} accent={accent} ph="Sena — Jin'in kayıp kız kardeşi" />
              <Lbl hint="Yayımlayınca dünya kuralı olur.">KENDİ DÜNYA KURALINI EKLE</Lbl>
              <TagAdd items={newRules} set={setNewRules} accent={accent} ph="Fener su altında sönmez" />
              <Lbl hint="Bu bölümde asla olmayacak şeyler.">YASAKLAR</Lbl>
              <TagAdd items={forbid} set={setForbid} accent={accent} color={T.hanko} ph="Nara ölmesin" />

              <Lbl hint="Kendi etiketini yaz, değerini gir. Sınırsız.">ÖZEL PARAMETRE</Lbl>
              {custom.map((c, i) => (
                <div key={i} className="card p-3 mb-2 flex justify-between items-center gap-3">
                  <div style={{ minWidth: 0 }}>
                    <div className="mono" style={{ fontSize: 10, color: accent, letterSpacing: ".1em" }}>{c.k.toUpperCase()}</div>
                    <div style={{ fontSize: 12, marginTop: 2 }}>{c.v}</div>
                  </div>
                  <button onClick={() => setCustom(custom.filter((_, j) => j !== i))} style={{ color: T.muted, fontSize: 18 }}>×</button>
                </div>
              ))}
              <div className="flex gap-2">
                <input className="inp" value={ck} onChange={(e) => setCk(e.target.value)} placeholder="Mekân" style={{ flex: 1 }} />
                <input className="inp" value={cv} onChange={(e) => setCv(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addCustom()} placeholder="Yağmurlu liman" style={{ flex: 1.4 }} />
                <button onClick={addCustom} className="btn-ghost" style={{ width: "auto", padding: "0 14px" }}>+</button>
              </div>

              <Lbl>YAZAR NOTU</Lbl>
              <textarea className="inp" rows={3} value={adv} onChange={(e) => setAdv(e.target.value)}
                placeholder="Bora geri dönsün ama pişman olmasın. Jin ilk kez feneri reddetsin." style={{ resize: "none" }} />

              <div className="card p-3 mt-4" style={{ fontSize: 11, color: T.muted, lineHeight: 1.5 }}>
                {focus.length + threads.length + newChars.length + newRules.length + custom.length} ek parametre · sadakat hedefi {fid} · {panels} panel
              </div>
            </>
          )}

          {err && <div style={{ fontSize: 12, color: T.hanko, marginTop: 12 }}>{err}</div>}
          <button onClick={run} disabled={busy} className="btn" style={{ marginTop: 16, background: busy ? T.panel2 : accent, opacity: busy ? .7 : 1 }}>
            {busy ? "Hafıza okunuyor, bölüm dokunuyor…" : `Bölümü üret · ◈ ${cost}`}
          </button>
          <div style={{ fontSize: 11, color: T.muted, textAlign: "center", marginTop: 10 }}>Bakiye: <Coin n={coins} size={11} /></div>
        </>
      )}
    </Sheet>
  );
}

/* ---------------- PANEL EDİTÖRÜ ---------------- */
const EL_TYPES = [
  { k: "bubble", l: "Balon", ico: "💬" },
  { k: "thought", l: "Düşünce", ico: "💭" },
  { k: "narr", l: "Anlatı", ico: "▤" },
  { k: "sfx", l: "Efekt", ico: "✷" },
];

function PanelEditor({ init, close, say, accent, style }) {
  const [panels, setPanels] = useState(init.panels);
  const [sel, setSel] = useState(null); // {p, e}
  const [drawing, setDrawing] = useState(-1);
  const drag = useRef(null);

  const draw = async (i) => {
    const p = panels[i];
    if (!p.note) return say("Bu panelde sahne tarifi yok");
    setDrawing(i);
    try {
      const svg = await drawPanel(p.note, style);
      if (svg) setPanels((ps) => ps.map((x, j) => (j === i ? { ...x, art: svg } : x)));
      else say("Çizilemedi");
    } catch { say("Çizilemedi"); }
    setDrawing(-1);
  };

  const setP = (i, fn) => setPanels((ps) => ps.map((p, j) => (j === i ? fn(p) : p)));
  const cur = sel ? panels[sel.p]?.els.find((e) => e.id === sel.e) : null;

  const addEl = (type) => {
    const i = sel ? sel.p : 0;
    const el = {
      id: uid(), type, x: 50, y: 45, w: type === "sfx" ? 40 : 55, fs: type === "sfx" ? 22 : 12,
      text: type === "bubble" ? "Konuş…" : type === "thought" ? "Düşün…" : type === "narr" ? "O gece…" : "BAM!",
    };
    setP(i, (p) => ({ ...p, els: [...p.els, el] }));
    setSel({ p: i, e: el.id });
  };
  const upd = (k, v) => sel && setP(sel.p, (p) => ({ ...p, els: p.els.map((e) => (e.id === sel.e ? { ...e, [k]: v } : e)) }));
  const del = () => { if (!sel) return; setP(sel.p, (p) => ({ ...p, els: p.els.filter((e) => e.id !== sel.e) })); setSel(null); };

  const down = (e, pi, el) => {
    e.stopPropagation();
    setSel({ p: pi, e: el.id });
    const box = e.currentTarget.parentElement.getBoundingClientRect();
    drag.current = { pi, id: el.id, box };
    e.currentTarget.setPointerCapture(e.pointerId);
  };
  const move = (e) => {
    const d = drag.current; if (!d) return;
    const x = Math.max(6, Math.min(94, ((e.clientX - d.box.left) / d.box.width) * 100));
    const y = Math.max(6, Math.min(94, ((e.clientY - d.box.top) / d.box.height) * 100));
    setP(d.pi, (p) => ({ ...p, els: p.els.map((el) => (el.id === d.id ? { ...el, x, y } : el)) }));
  };
  const up = () => { drag.current = null; };

  const elStyle = (el) => {
    const base = {
      left: `${el.x}%`, top: `${el.y}%`, width: `${el.w}%`, fontSize: el.fs,
      transform: "translate(-50%,-50%)",
      boxShadow: sel && sel.e === el.id ? `0 0 0 2px ${accent}` : "none",
    };
    if (el.type === "thought") return { ...base, borderRadius: 22, background: "#fff", color: "#111" };
    if (el.type === "narr") return { ...base, borderRadius: 4, background: "#FDF6E3", color: "#111", textAlign: "left", fontWeight: 500 };
    if (el.type === "sfx") return {
      ...base, background: "transparent", color: "#fff", fontWeight: 900, letterSpacing: ".04em",
      textShadow: `0 0 1px #000, 2px 2px 0 ${T.hanko}`, fontFamily: "'Unbounded',sans-serif",
    };
    return base;
  };

  return (
    <div className="fixed inset-0 z-40" style={{ background: T.void, maxWidth: 480, margin: "0 auto", display: "flex", flexDirection: "column" }}>
      <div className="flex items-center gap-3 px-4 py-3" style={{ borderBottom: `1px solid ${T.line}` }}>
        <button onClick={close} style={{ fontSize: 18 }}>←</button>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 800, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{init.title}</div>
          <div className="mono" style={{ fontSize: 10, color: T.muted }}>PANEL EDİTÖRÜ · {panels.length} panel</div>
        </div>
        <button onClick={() => { say("Bölüme kaydedildi"); close(); }} className="btn" style={{ width: "auto", padding: "9px 14px", background: accent, fontSize: 12 }}>Kaydet</button>
      </div>

      {/* tuval */}
      <div style={{ flex: 1, overflowY: "auto", padding: 12 }} onPointerUp={up} onPointerMove={move}>
        {panels.map((p, pi) => (
          <div key={p.id} className="mb-3">
            <div className="flex justify-between items-center mb-1">
              <span className="mono" style={{ fontSize: 9, color: sel?.p === pi ? accent : T.muted }}>PANEL {pi + 1}</span>
              <div className="flex gap-1">
                <button onClick={() => setP(pi, (x) => ({ ...x, h: Math.max(140, x.h - 40) }))} className="pill" style={{ background: T.panel2, color: T.muted, fontSize: 10, padding: "3px 8px" }}>▲</button>
                <button onClick={() => setP(pi, (x) => ({ ...x, h: Math.min(460, x.h + 40) }))} className="pill" style={{ background: T.panel2, color: T.muted, fontSize: 10, padding: "3px 8px" }}>▼</button>
                <button onClick={() => setP(pi, (x) => ({ ...x, hue: (x.hue + 40) % 360 }))} className="pill" style={{ background: T.panel2, color: T.muted, fontSize: 10, padding: "3px 8px" }}>◐</button>
                <button onClick={() => draw(pi)} disabled={drawing >= 0} className="pill"
                  style={{ background: T.panel2, color: T.gold, fontSize: 10, padding: "3px 8px" }}>
                  {drawing === pi ? "…" : "✎ çiz"}
                </button>
                <button onClick={() => { setPanels(panels.filter((_, j) => j !== pi)); setSel(null); }} className="pill" style={{ background: T.panel2, color: T.hanko, fontSize: 10, padding: "3px 8px" }}>×</button>
              </div>
            </div>
            <div onClick={() => setSel({ p: pi, e: null })} className="relative overflow-hidden"
              style={{
                ...(p.art ? { background: "#000", height: p.h } : cover(p.hue, p.h)),
                borderRadius: 10, border: `2px solid ${sel?.p === pi ? accent : "transparent"}`, touchAction: "none",
              }}>
              {p.art && <div style={{ position: "absolute", inset: 0 }} dangerouslySetInnerHTML={{ __html: p.art }} />}
              {p.note && !p.els.length && !p.art && (
                <span className="mono" style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", padding: 16, fontSize: 10, color: "rgba(255,255,255,.4)", textAlign: "center", lineHeight: 1.5 }}>{p.note}</span>
              )}
              {drawing === pi && (
                <div className="pulse" style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", background: "rgba(0,0,0,.55)" }}>
                  <span className="mono" style={{ fontSize: 10, color: T.gold }}>ÇİZİLİYOR…</span>
                </div>
              )}
              {p.els.map((el) => (
                <div key={el.id} className={el.type === "bubble" ? "bub bub-tail" : "bub"}
                  style={elStyle(el)} onPointerDown={(e) => down(e, pi, el)}>{el.text}</div>
              ))}
            </div>
          </div>
        ))}
        <button onClick={() => setPanels([...panels, { id: uid(), h: 240, hue: init.hue, note: "", els: [] }])}
          className="btn-ghost w-full" style={{ borderStyle: "dashed" }}>+ Panel ekle</button>
        <div style={{ height: 12 }} />
      </div>

      {/* araç çubuğu */}
      <div style={{ borderTop: `1px solid ${T.line}`, background: T.panel, padding: "12px 14px 22px" }}>
        {cur ? (
          <div className="fade">
            <div className="flex justify-between items-center mb-2">
              <span className="mono" style={{ fontSize: 10, color: accent, letterSpacing: ".14em" }}>
                {EL_TYPES.find((t) => t.k === cur.type)?.l.toUpperCase()} SEÇİLİ
              </span>
              <button onClick={del} className="pill" style={{ background: T.panel2, color: T.hanko, fontSize: 10 }}>Sil</button>
            </div>
            <input className="inp mb-2" value={cur.text} onChange={(e) => upd("text", e.target.value)} placeholder="Metin" />
            <div className="flex items-center gap-3 mb-1">
              <span className="mono" style={{ fontSize: 9, color: T.muted, width: 44 }}>GENİŞ</span>
              <input type="range" min="20" max="90" value={cur.w} onChange={(e) => upd("w", +e.target.value)} style={{ flex: 1, accentColor: accent }} />
            </div>
            <div className="flex items-center gap-3 mb-2">
              <span className="mono" style={{ fontSize: 9, color: T.muted, width: 44 }}>PUNTO</span>
              <input type="range" min="9" max="34" value={cur.fs} onChange={(e) => upd("fs", +e.target.value)} style={{ flex: 1, accentColor: accent }} />
            </div>
            <button onClick={() => setSel({ p: sel.p, e: null })} className="btn-ghost w-full" style={{ fontSize: 12 }}>Bitti</button>
          </div>
        ) : (
          <>
            <div className="mono" style={{ fontSize: 9, color: T.muted, letterSpacing: ".14em", marginBottom: 8 }}>
              {sel ? `PANEL ${sel.p + 1}` : "PANEL 1"}'E EKLE · sürükleyerek yerleştir
            </div>
            <div className="flex gap-2">
              {EL_TYPES.map((t) => (
                <button key={t.k} onClick={() => addEl(t.k)} className="card flex-1 py-3" style={{ borderColor: T.line }}>
                  <div style={{ fontSize: 16 }}>{t.ico}</div>
                  <div style={{ fontSize: 10, fontWeight: 700, marginTop: 3 }}>{t.l}</div>
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

/* ---------------- NOVEL → WEBTOON ---------------- */
function Converter({ close, accent, toEditor }) {
  const [txt, setTxt] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState(null);

  const run = async () => {
    if (txt.trim().length < 40) return setErr("Biraz daha metin gerek.");
    setBusy(true); setErr(null);
    try {
      const r = await ask(`Aşağıdaki düzyazıyı webtoon paneline böl. Her panel için kadraj yönergesi ve varsa tek replik ver.

METİN:
${txt}

SADECE şu JSON'u döndür, markdown backtick kullanma:
{"baslik":"kısa başlık","paneller":[{"kadraj":"kamera ve sahne tarifi tek cümle","replik":"kısa diyalog veya boş string","boy":"kisa|orta|uzun"}]}
4-8 panel üret.`);
      const d = asJSON(r);
      const H = { kisa: 180, orta: 260, uzun: 360 };
      toEditor({
        title: d.baslik, hue: 268,
        panels: d.paneller.map((p, i) => ({
          id: uid(), h: H[p.boy] || 240, hue: 268 + i * 18, note: p.kadraj,
          els: p.replik ? [{ id: uid(), type: "bubble", text: p.replik, x: 50, y: 24, w: 55, fs: 12 }] : [],
        })),
      });
    } catch { setErr("Dönüştürülemedi. Tekrar dene."); }
    setBusy(false);
  };

  return (
    <Sheet close={close} accent={accent}>
      <h2 style={{ fontSize: 19, fontWeight: 900 }}>Novel → Webtoon</h2>
      <div style={{ fontSize: 12, color: T.muted, marginTop: 4, marginBottom: 14 }}>
        Düzyazıyı yapıştır. Panellere bölüp editöre açalım.
      </div>
      <textarea className="inp" rows={8} value={txt} onChange={(e) => setTxt(e.target.value)}
        placeholder="Fener, Jin'in avucunda titredi. Sokak boştu ama borç kokusu her yerdeydi…" style={{ resize: "none" }} />
      {err && <div style={{ fontSize: 12, color: T.hanko, marginTop: 10 }}>{err}</div>}
      <button onClick={run} disabled={busy} className="btn" style={{ marginTop: 14, background: busy ? T.panel2 : accent }}>
        {busy ? "Paneller kuruluyor…" : "Panellere böl · ◈ 30"}
      </button>
    </Sheet>
  );
}

/* ---------------- OKUYUCU ---------------- */
function Reader({ s, ch: chNo, branch, rate, style, saveArt, onClose, accent }) {
  const [ui, setUi] = useState(true);
  const [gap, setGap] = useState(0);
  const [w, setW] = useState(100);
  const [rating, setRating] = useState(false);
  const [ci, setCi] = useState(0);
  const [drawing, setDrawing] = useState(-1);
  const chs = (branch && branch.chapters) || [];
  const ch = chs[Math.min(ci, chs.length - 1)];

  const drawAll = async () => {
    for (let i = 0; i < ch.scenes.length; i++) {
      if (ch.scenes[i].art) continue;
      setDrawing(i);
      try { const svg = await drawPanel(ch.scenes[i].panel, style); if (svg) saveArt(ci, i, svg); }
      catch { /* geç */ }
    }
    setDrawing(-1);
  };
  return (
    <div className="fixed inset-0 z-40" style={{ background: "#050308", overflowY: "auto", maxWidth: 480, margin: "0 auto" }}>
      {ui && (
        <div className="fixed top-0 left-0 right-0 z-10 flex items-center gap-3 px-4 py-3"
          style={{ maxWidth: 480, margin: "0 auto", background: "rgba(5,3,8,.92)", borderBottom: `1px solid ${T.line}` }}>
          <button onClick={onClose} style={{ fontSize: 18 }}>←</button>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 800, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{s.title}</div>
            <div className="mono" style={{ fontSize: 10, color: branch ? accent : T.muted }}>
              {branch ? `DAL · ${branch.title}` : `CANON · Bölüm ${chNo}`}
            </div>
          </div>
        </div>
      )}
      <div onClick={() => setUi(!ui)} style={{ paddingTop: ui ? 62 : 0, paddingBottom: ui ? 110 : 0 }}>
        {ch ? (
          <>
            <div style={{ padding: "18px 18px 6px" }} onClick={(e) => e.stopPropagation()}>
              <div className="mono" style={{ fontSize: 10, color: accent, letterSpacing: ".16em" }}>
                BÖLÜM {ch.n} · SADAKAT {ch.fid}
              </div>
              <h1 style={{ fontSize: 22, fontWeight: 900, marginTop: 5 }}>{ch.title}</h1>

              {chs.length > 1 && (
                <div className="scroll-x flex gap-2 mt-3">
                  {chs.map((c, i) => (
                    <button key={i} onClick={() => setCi(i)} className="pill mono" style={{
                      flexShrink: 0, padding: "6px 11px", fontSize: 10,
                      background: i === ci ? accent : T.panel2, color: i === ci ? "#fff" : T.muted,
                      border: `1px solid ${i === ci ? accent : T.line}`,
                    }}>BL. {c.n}</button>
                  ))}
                </div>
              )}

              {!ch.scenes.every((x) => x.art) && (
                <button onClick={drawAll} disabled={drawing >= 0} className="btn-ghost w-full mt-3"
                  style={{ borderColor: T.gold, color: T.gold, fontSize: 12 }}>
                  {drawing >= 0 ? `Panel ${drawing + 1}/${ch.scenes.length} çiziliyor…` : `Panelleri çiz · ${style.n}`}
                </button>
              )}
            </div>

            {ch.scenes.map((p, i) => (
              <div key={i} style={{ marginBottom: gap + 16 }}>
                <div style={{ width: `${w}%`, margin: "0 auto" }}>
                  <Art svg={p.art} hue={s.hue + i * 18} h={p.art ? 280 : 260 + (i % 3) * 70} note={p.panel}>
                    {drawing === i && (
                      <div className="pulse" style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", background: "rgba(0,0,0,.55)" }}>
                        <span className="mono" style={{ fontSize: 10, color: T.gold }}>ÇİZİLİYOR…</span>
                      </div>
                    )}
                    {p.replik && (
                      <div style={{
                        position: "absolute", bottom: 14, left: 18, right: 18, background: "#fff", color: "#111",
                        fontSize: 12, fontWeight: 700, padding: "8px 11px", borderRadius: 13, textAlign: "center", lineHeight: 1.4,
                      }}>{p.replik}</div>
                    )}
                  </Art>
                </div>
                <p style={{ fontSize: 14, lineHeight: 1.75, padding: "12px 20px 0" }}>{p.metin}</p>
              </div>
            ))}
          </>
        ) : (
          Array.from({ length: 7 }).map((_, i) => (
            <div key={i} style={{ ...cover(s.hue + i * 12, 300 + (i % 3) * 90), width: `${w}%`, margin: `0 auto ${gap}px`, display: "grid", placeItems: "center" }}>
              <span className="mono" style={{ fontSize: 10, color: "rgba(255,255,255,.25)" }}>PANEL {i + 1}</span>
            </div>
          ))
        )}
        {branch ? (
          <div onClick={(e) => e.stopPropagation()} style={{ padding: "8px 16px 40px" }}>
            <div style={{ fontSize: 13, color: T.muted, textAlign: "center", margin: "12px 0 20px" }}>Bölüm bitti.</div>
            <ScorePanel b={branch} accent={accent} onRate={() => setRating(true)} />
          </div>
        ) : (
          <div className="p-6 text-center">
            <div style={{ fontSize: 13, color: T.muted, marginBottom: 12 }}>Bölüm bitti.</div>
            <button className="btn" style={{ background: accent }}>Sonraki bölüm →</button>
          </div>
        )}
      </div>

      {rating && <RateSheet b={branch} accent={accent} close={() => setRating(false)}
        submit={(rv) => { rate(s.id, branch.id, rv); setRating(false); }} />}
      {ui && (
        <div className="fixed bottom-0 left-0 right-0 z-10 px-4 pt-3 pb-6"
          style={{ maxWidth: 480, margin: "0 auto", background: "rgba(5,3,8,.94)", borderTop: `1px solid ${T.line}` }}>
          <div className="flex items-center gap-3 mb-2">
            <span className="mono" style={{ fontSize: 10, color: T.muted, width: 52 }}>GENİŞLİK</span>
            <input type="range" min="60" max="100" value={w} onChange={(e) => setW(+e.target.value)} style={{ flex: 1, accentColor: accent }} />
          </div>
          <div className="flex items-center gap-3">
            <span className="mono" style={{ fontSize: 10, color: T.muted, width: 52 }}>BOŞLUK</span>
            <input type="range" min="0" max="24" value={gap} onChange={(e) => setGap(+e.target.value)} style={{ flex: 1, accentColor: accent }} />
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------------- GÖREVLER ---------------- */
function Quests({ claimed, claim, accent }) {
  const groups = [["daily", "GÜNLÜK", "24 saat"], ["weekly", "HAFTALIK", "6 gün"], ["monthly", "AYLIK", "19 gün"]];
  return (
    <div className="fade">
      <h1 style={{ fontSize: 26, fontWeight: 900, marginTop: 20 }}>Görevler</h1>
      <div style={{ fontSize: 13, color: T.muted, marginTop: 4 }}>Oku, oy ver, üret. Coin biriktir.</div>
      <div className="card p-4 mt-5 flex justify-between items-center" style={{ borderColor: T.gold }}>
        <div>
          <div style={{ fontSize: 12, color: T.muted }}>Seri giriş</div>
          <div style={{ fontSize: 18, fontWeight: 900 }}>4 gün 🔥</div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 11, color: T.muted }}>7. günde</div>
          <Coin n={300} size={15} />
        </div>
      </div>
      {groups.map(([k, l, left]) => (
        <div key={k}>
          <Head k={l} t={k === "daily" ? "Bugün" : k === "weekly" ? "Bu hafta" : "Bu ay"}
            right={<span className="mono" style={{ fontSize: 10, color: T.muted }}>{left}</span>} />
          {QUESTS[k].map((q) => {
            const ok = claimed[q.id] || q.done;
            const ready = q.p >= q.g && !ok;
            return (
              <div key={q.id} className="card p-3 mb-2">
                <div className="flex justify-between items-center mb-2">
                  <span style={{ fontSize: 13, fontWeight: 700, opacity: ok ? .45 : 1 }}>{q.t}</span>
                  {ok ? <span className="mono" style={{ fontSize: 11, color: accent }}>✓ ALINDI</span>
                    : ready ? <button onClick={() => claim(q)} className="pill" style={{ background: T.gold, color: "#000" }}>◈ {q.c} AL</button>
                      : <Coin n={q.c} size={11} />}
                </div>
                <Bar v={ok ? q.g : q.p} g={q.g} c={ok ? accent : T.gold} />
                <div className="mono" style={{ fontSize: 10, color: T.muted, marginTop: 5 }}>{ok ? q.g : q.p}/{q.g}</div>
              </div>
            );
          })}
        </div>
      ))}
      <div style={{ height: 24 }} />
    </div>
  );
}

/* ---------------- KLANLAR ---------------- */
function Guilds({ say, accent }) {
  const [tab, setTab] = useState("benim");
  return (
    <div className="fade">
      <h1 style={{ fontSize: 26, fontWeight: 900, marginTop: 20 }}>Klanlar</h1>
      <div style={{ fontSize: 13, color: T.muted, marginTop: 4 }}>Birlikte dokuyun. Coin havuzunu paylaşın.</div>
      <div className="flex gap-1 mt-5 p-1 card" style={{ borderRadius: 12 }}>
        {[["benim", "Klanım"], ["kesfet", "Keşfet"], ["lig", "Lig"]].map(([k, l]) => (
          <button key={k} onClick={() => setTab(k)} className="flex-1 py-2" style={{
            fontSize: 12, fontWeight: 800, borderRadius: 9,
            background: tab === k ? accent : "transparent", color: tab === k ? "#fff" : T.muted,
          }}>{l}</button>
        ))}
      </div>

      {tab === "benim" && (
        <div className="mt-5">
          <div className="card overflow-hidden">
            <div style={{ ...cover(268, 90), display: "flex", alignItems: "flex-end", padding: 14 }}>
              <div>
                <h2 style={{ fontSize: 19, fontWeight: 900 }}>Gece Dokuması</h2>
                <div className="mono" style={{ fontSize: 10, color: "rgba(255,255,255,.6)" }}>SEVİYE 7 · 42 ÜYE</div>
              </div>
            </div>
            <div className="p-4">
              <div style={{ fontSize: 12, color: T.muted }}>Ortak kese</div>
              <div style={{ marginBottom: 12 }}><Coin n={12400} size={20} /></div>
              <div style={{ fontSize: 12, color: T.muted, marginBottom: 4 }}>Aktif proje</div>
              <div style={{ fontSize: 14, fontWeight: 800, marginBottom: 10 }}>Kanlı Fener — Konsey Düşüşü</div>
              <Bar v={7} g={12} c={accent} />
              <div className="mono" style={{ fontSize: 10, color: T.muted, marginTop: 6 }}>7/12 BÖLÜM</div>
            </div>
          </div>
          <Head k="KLAN GÖREVİ" t="Bu hafta" />
          <div className="card p-4">
            <div style={{ fontSize: 13, fontWeight: 800 }}>Klanca 20 bölüm üret</div>
            <div style={{ margin: "10px 0 6px" }}><Bar v={14} g={20} c={T.gold} /></div>
            <div className="flex justify-between mono" style={{ fontSize: 10, color: T.muted }}>
              <span>14/20</span><span>ÖDÜL ◈ 2.000 (havuza)</span>
            </div>
          </div>
          <Head k="ÜYELER" t="Roller" />
          {[["Kadir", "Lider", "12 bölüm"], ["@nairo", "Yazar", "8 bölüm"], ["@selin", "Çizer", "34 panel"], ["@kenan", "Editör", "19 kontrol"]].map(([n, r, x]) => (
            <div key={n} className="card p-3 mb-2 flex items-center gap-3">
              <div style={{ width: 34, height: 34, borderRadius: 99, background: `linear-gradient(135deg,${accent},${T.violetDim})`, display: "grid", placeItems: "center", fontWeight: 900, fontSize: 13 }}>
                {n[n[0] === "@" ? 1 : 0].toUpperCase()}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 700 }}>{n}</div>
                <div style={{ fontSize: 11, color: T.muted }}>{r} · {x}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === "kesfet" && (
        <div className="mt-5">
          {GUILDS.map((g) => (
            <div key={g.n} className="card p-4 mb-3 flex justify-between items-start">
              <div>
                <div style={{ fontSize: 15, fontWeight: 800 }}>{g.n}</div>
                <div style={{ fontSize: 11, color: T.muted, marginTop: 3 }}>Lv.{g.lv} · {g.m} üye</div>
                <div style={{ fontSize: 12, marginTop: 8 }}>{g.proj}</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <Coin n={g.pool} size={12} />
                <button onClick={() => say("Başvuru gönderildi")} className="btn-ghost mt-2" style={{ padding: "6px 12px", fontSize: 11, borderColor: accent, color: accent }}>Katıl</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === "lig" && (
        <div className="mt-5">
          <div className="hanko" style={{ marginBottom: 14 }}>SEZON 3 · 12 GÜN KALDI</div>
          {GUILDS.map((g, i) => (
            <div key={g.n} className="card p-3 mb-2 flex items-center gap-3">
              <span className="mono" style={{ fontSize: 18, fontWeight: 700, color: i === 0 ? T.gold : T.muted, width: 26 }}>{i + 1}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 800 }}>{g.n}</div>
                <div style={{ fontSize: 11, color: T.muted }}>{(g.pool / 100).toFixed(0)} puan</div>
              </div>
              {i === 0 && <span className="pill" style={{ background: "rgba(240,180,41,.15)", color: T.gold }}>Lider</span>}
            </div>
          ))}
        </div>
      )}
      <div style={{ height: 24 }} />
    </div>
  );
}

/* ---------------- MARKET ---------------- */
function Market({ coins, setCoins, say, accent }) {
  const [f, setF] = useState("Tümü");
  const [sel, setSel] = useState(null);
  const jobs = ["Tümü", "Çizer", "Yazar", "Renklendirici", "Editör", "Letterer"];
  const list = f === "Tümü" ? CREATORS : CREATORS.filter((c) => c.j === f);
  const hire = (c) => {
    const fee = Math.round(c.p * 0.12);
    if (coins < c.p + fee) return say("Coin yetersiz");
    setCoins((x) => x - c.p - fee); setSel(null); say(`${c.n} ile iş açıldı`);
  };
  return (
    <div className="fade">
      <h1 style={{ fontSize: 26, fontWeight: 900, marginTop: 20 }}>Market</h1>
      <div style={{ fontSize: 13, color: T.muted, marginTop: 4 }}>Çizer, yazar, editör tut. Ödeme teslimde serbest kalır.</div>
      <div className="scroll-x flex gap-2" style={{ margin: "20px -16px 0", padding: "0 16px" }}>
        {jobs.map((j) => (
          <button key={j} onClick={() => setF(j)} className="pill" style={{
            flexShrink: 0, padding: "8px 14px", fontSize: 12,
            background: f === j ? accent : T.panel, color: f === j ? "#fff" : T.muted,
            border: `1px solid ${f === j ? accent : T.line}`,
          }}>{j}</button>
        ))}
      </div>
      <div className="mt-4">
        {list.map((c) => (
          <button key={c.n} onClick={() => setSel(c)} className="card p-3 mb-3 w-full text-left flex gap-3 items-center">
            <div style={{ width: 48, height: 48, borderRadius: 12, flexShrink: 0, background: `linear-gradient(135deg,hsl(${c.hue} 55% 35%),hsl(${c.hue + 50} 55% 20%))` }} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="flex items-center gap-2">
                <span style={{ fontSize: 14, fontWeight: 800 }}>{c.n}</span>
                <span className="pill" style={{ background: T.panel2, color: accent, fontSize: 9 }}>{c.j}</span>
              </div>
              <div style={{ fontSize: 12, color: T.muted, marginTop: 2 }}>{c.s}</div>
              <div className="mono" style={{ fontSize: 10, color: T.muted, marginTop: 4 }}>★ {c.r} · {c.jobs} iş</div>
            </div>
            <div style={{ textAlign: "right" }}>
              <Coin n={c.p} size={13} />
              <div className="mono" style={{ fontSize: 9, color: T.muted }}>/ İŞ</div>
            </div>
          </button>
        ))}
      </div>
      <div className="card p-4">
        <div style={{ fontSize: 13, fontWeight: 800 }}>Komisyon nasıl işliyor?</div>
        <div style={{ fontSize: 12, color: T.muted, marginTop: 8, lineHeight: 1.6 }}>
          Coin, iş açıldığında emanete alınır. Teslim onaylanınca üreticiye geçer.
          Platform payı <span style={{ color: accent, fontWeight: 700 }}>%12</span> — işveren öder, üretici tam ücretini alır.
          Anlaşmazlıkta arabuluculuk 72 saat sürer.
        </div>
      </div>
      {sel && (
        <Sheet close={() => setSel(null)} accent={accent}>
          <h2 style={{ fontSize: 19, fontWeight: 900 }}>{sel.n}</h2>
          <div style={{ fontSize: 12, color: T.muted, marginBottom: 16 }}>{sel.j} · {sel.s}</div>
          <textarea className="inp" rows={3} placeholder="İş tanımı: 12 panel lineart, Kanlı Fener 85. bölüm…" style={{ resize: "none", marginBottom: 14 }} />
          {[["Ücret", sel.p], ["Platform payı (%12)", Math.round(sel.p * 0.12)]].map(([l, v]) => (
            <div key={l} className="flex justify-between mb-2" style={{ fontSize: 13 }}>
              <span style={{ color: T.muted }}>{l}</span><Coin n={v} size={13} />
            </div>
          ))}
          <div className="flex justify-between mb-4 pt-2" style={{ fontSize: 14, fontWeight: 800, borderTop: `1px solid ${T.line}` }}>
            <span>Toplam</span><Coin n={sel.p + Math.round(sel.p * 0.12)} size={14} />
          </div>
          <button onClick={() => hire(sel)} className="btn" style={{ background: accent }}>Emanete al ve iş aç</button>
        </Sheet>
      )}
      <div style={{ height: 24 }} />
    </div>
  );
}

/* ---------------- PROFİL ---------------- */
function Profile({ accent, setAccent, coins, say, series, reset }) {
  const [title, setTitle] = useState("Fener Taşıyıcısı");
  const [frame, setFrame] = useState(0);
  const accents = [T.violet, "#22C55E", "#F0B429", "#E5484D", "#38BDF8", "#EC4899"];
  const titles = ["Fener Taşıyıcısı", "Dal Açan", "Mürekkep Lordu", "Sessiz Bahçıvan"];
  const frames = ["Yok", "Mürekkep", "Altın", "Hanko"];
  const fstyle = [{}, { boxShadow: `0 0 0 3px ${accent}` },
  { boxShadow: `0 0 0 3px ${T.gold}, 0 0 18px rgba(240,180,41,.5)` },
  { boxShadow: `0 0 0 3px ${T.hanko}`, borderRadius: 14 }][frame];
  const mine = series.flatMap((s) => s.branches.filter((b) => b.mine).map((b) => ({ s, b })));
  const rated = mine.filter(({ b }) => (b.reviews || []).length > 0);
  const authorScore = mine.length
    ? Math.round(mine.reduce((x, { b }) => x + scoreOf(b).total, 0) / mine.length) : null;
  const authorAxes = mine.length
    ? AXES.reduce((o, a) => (o[a.k] = Math.round(mine.reduce((x, { b }) => x + scoreOf(b)[a.k], 0) / mine.length), o), {}) : null;
  const totalReviews = mine.reduce((x, { b }) => x + (b.reviews || []).length, 0);

  return (
    <div className="fade">
      <div className="card overflow-hidden mt-5">
        <div style={{ height: 84, background: `linear-gradient(120deg,${accent},${T.panel2})` }} />
        <div className="px-4 pb-4" style={{ marginTop: -30 }}>
          <div style={{
            width: 64, height: 64, borderRadius: 99, background: T.panel2, display: "grid", placeItems: "center",
            fontSize: 24, fontWeight: 900, border: `3px solid ${T.panel}`, ...fstyle,
          }}>K</div>
          <div className="flex items-center gap-2" style={{ marginTop: 10 }}>
            <span style={{ fontSize: 20, fontWeight: 900 }}>Kadir</span>
            {authorScore !== null && (
              <span className="pill mono" style={{
                background: T.panel2, color: scoreColor(authorScore),
                border: `1px solid ${scoreColor(authorScore)}`, fontSize: 11,
              }}>★ {authorScore}</span>
            )}
          </div>
          <span className="pill mt-1" style={{ background: T.panel2, color: accent }}>{title}</span>
          <div className="flex gap-5 mt-4">
            {[["Dal", String(mine.length)], ["Seri", String(series.length)], ["Okur", "3.2B"]].map(([l, v]) => (
              <div key={l}>
                <div className="mono" style={{ fontSize: 17, fontWeight: 700 }}>{v}</div>
                <div style={{ fontSize: 10, color: T.muted }}>{l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {authorScore !== null && (
        <>
          <Head k="YAZAR PUANI" t="Dallarının ortalaması" />
          <div className="card p-4">
            <div className="flex items-end gap-3 mb-4">
              <div className="mono" style={{ fontSize: 40, fontWeight: 700, color: scoreColor(authorScore), lineHeight: 1 }}>{authorScore}</div>
              <div style={{ fontSize: 11, color: T.muted, paddingBottom: 4, lineHeight: 1.4 }}>
                {mine.length} dal · {totalReviews} okur puanı<br />
                {rated.length ? `${rated.length} dal okur puanı aldı` : "henüz okur puanı yok, AI puanı geçerli"}
              </div>
            </div>
            {AXES.map((a) => (
              <div key={a.k} className="mb-2">
                <div className="flex justify-between mono" style={{ fontSize: 10, color: T.muted, marginBottom: 3 }}>
                  <span>{a.l}</span><span style={{ color: scoreColor(authorAxes[a.k]) }}>{authorAxes[a.k]}</span>
                </div>
                <Bar v={authorAxes[a.k]} g={100} c={scoreColor(authorAxes[a.k])} />
              </div>
            ))}
          </div>
        </>
      )}

      <Head k="ÖZELLEŞTİR" t="Görünüm" />
      <div className="card p-4">
        <div className="mono" style={{ fontSize: 10, color: T.muted, letterSpacing: ".14em", marginBottom: 8 }}>VURGU RENGİ</div>
        <div className="flex gap-2 mb-5">
          {accents.map((a) => (
            <button key={a} onClick={() => setAccent(a)} aria-label={a} style={{
              width: 32, height: 32, borderRadius: 99, background: a,
              boxShadow: accent === a ? `0 0 0 2px ${T.void}, 0 0 0 4px ${a}` : "none",
            }} />
          ))}
        </div>
        <div className="mono" style={{ fontSize: 10, color: T.muted, letterSpacing: ".14em", marginBottom: 8 }}>ÇERÇEVE</div>
        <div className="flex gap-2 mb-5">
          {frames.map((f, i) => (
            <button key={f} onClick={() => setFrame(i)} className="flex-1 py-2" style={{
              fontSize: 11, fontWeight: 700, borderRadius: 9,
              background: frame === i ? accent : T.panel2, color: frame === i ? "#fff" : T.muted,
              border: `1px solid ${frame === i ? accent : T.line}`,
            }}>{f}</button>
          ))}
        </div>
        <div className="mono" style={{ fontSize: 10, color: T.muted, letterSpacing: ".14em", marginBottom: 8 }}>UNVAN</div>
        <div className="flex flex-wrap gap-2">
          {titles.map((t) => (
            <button key={t} onClick={() => setTitle(t)} className="pill" style={{
              padding: "7px 12px", fontSize: 11,
              background: title === t ? accent : T.panel2, color: title === t ? "#fff" : T.muted,
              border: `1px solid ${title === t ? accent : T.line}`,
            }}>{t}</button>
          ))}
        </div>
      </div>

      <Head k="ÜYELİK" t="Planlar" />
      {TIERS.map((t, i) => (
        <div key={t.n} className="card p-4 mb-2" style={{ borderColor: i === 2 ? T.gold : T.line }}>
          <div className="flex justify-between items-center">
            <div>
              <div style={{ fontSize: 15, fontWeight: 800, color: t.c }}>{t.n}</div>
              <div className="mono" style={{ fontSize: 12, color: T.muted, marginTop: 2 }}>{t.p}</div>
            </div>
            {i === 2 ? <span className="pill" style={{ background: "rgba(240,180,41,.15)", color: T.gold }}>Mevcut</span>
              : <button onClick={() => say(`${t.n} seçildi`)} className="btn-ghost" style={{ padding: "7px 14px", fontSize: 11 }}>Geç</button>}
          </div>
          <div className="mt-3" style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {t.f.map((f) => <span key={f} className="pill" style={{ background: T.panel2, color: T.muted, fontSize: 10, fontWeight: 500 }}>{f}</span>)}
          </div>
        </div>
      ))}

      <Head k="COIN" t="Kese" />
      <div className="card p-4 flex justify-between items-center">
        <div>
          <Coin n={coins} size={22} />
          <div style={{ fontSize: 11, color: T.muted, marginTop: 2 }}>Görevlerden kazan veya satın al</div>
        </div>
        <button onClick={() => say("Mağaza yakında")} className="btn" style={{ width: "auto", padding: "10px 16px", background: T.gold, color: "#000" }}>Coin al</button>
      </div>

      <Head k="KİTAPLIK" t="Dallarım" />
      {mine.length ? mine.map(({ s, b }) => (
        <div key={b.id} className="card p-3 mb-2 flex items-center gap-3">
          <div style={{ width: 40, height: 52, borderRadius: 8, flexShrink: 0, ...cover(s.hue, 52) }} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 800 }}>{b.title}</div>
            <div style={{ fontSize: 11, color: T.muted, marginTop: 2 }}>
              {s.title} · {b.from ? `${b.from}. bölümden sapma` : `${b.chapters?.[0]?.n || "?"}. bölüm`}
            </div>
          </div>
          <div className="mono" style={{ fontSize: 14, fontWeight: 700, color: b.fid > 80 ? accent : T.gold }}>{b.fid}</div>
        </div>
      )) : (
        <div className="card p-4" style={{ fontSize: 12, color: T.muted, lineHeight: 1.5 }}>
          Henüz dal açmadın. Bir seriye gir, "Devam ettir" de.
        </div>
      )}

      <Head k="VERİ" t="Kayıt" />
      <div className="card p-4">
        <div style={{ fontSize: 12, color: T.muted, lineHeight: 1.6 }}>
          Serilerin, dalların, hafıza kayıtların ve coinlerin bu cihazda saklanıyor. Sekmeyi kapatsan da duruyor.
        </div>
        <button onClick={reset} className="btn-ghost mt-3 w-full" style={{ borderColor: T.hanko, color: T.hanko }}>Her şeyi sıfırla</button>
      </div>
      <div style={{ height: 24 }} />
    </div>
  );
}

/* ---------------- SERİ EKLE (hafıza kurulumu) ---------------- */
function AddSeries({ close, accent, add, say }) {
  const [title, setTitle] = useState("");
  const [type, setType] = useState("Manhwa");
  const [chs, setChs] = useState("50");
  const [year, setYear] = useState("2020");
  const [txt, setTxt] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState(null);

  const run = async () => {
    if (!title.trim()) return setErr("Serinin adını yaz.");
    if (txt.trim().length < 40) return setErr("Biraz daha anlat — birkaç cümle özet yeter.");
    setBusy(true); setErr(null);
    try {
      const d = asJSON(await ask(`Bir okur, "${title.trim()}" adlı ${type} serisini StoryLoom'a ekliyor. Seri ${chs}. bölümde yarım kalmış.

OKURUN ANLATTIĞI:
${txt}

Bu bilgiden bir hafıza çekirdeği kur. Boşlukları makul biçimde tamamla ama uydurmayı abartma.
SADECE şu JSON'u döndür, markdown backtick kullanma:
{"ozet":"serinin tek cümlelik özeti","etiketler":["tür1","tür2"],"sebep":"neden yarım kaldığına dair kısa tahmin","karakterler":[{"isim":"","rol":"","aciklama":"tek cümle"}],"kurallar":["dünyanın işleyiş kuralı"],"iplikler":["cevaplanmamış soru"]}
2-5 karakter, 2-4 kural, 2-4 iplik üret. Türkçe.`));

      add({
        id: uid(), title: title.trim(), type, year: +year || 2020, chapters: +chs || 50,
        hue: Math.floor(Math.random() * 360), tags: (d.etiketler || []).slice(0, 2),
        followers: "yeni", reason: d.sebep || "Bilinmiyor", synopsis: d.ozet,
        lore: {
          chars: (d.karakterler || []).map((c) => ({ id: uid(), n: c.isim, r: c.rol, d: c.aciklama, src: "canon" })),
          rules: (d.kurallar || []).map((t) => ({ id: uid(), t, src: "canon" })),
          threads: (d.iplikler || []).map((t) => ({ id: uid(), t, open: true })),
          log: [{ id: uid(), t: `${chs} bölüm işlendi, hafıza çekirdeği kuruldu.`, src: "canon", when: "az önce" }],
        },
        branches: [],
      });
      say("Seri eklendi, hafıza kuruldu");
      close();
    } catch { setErr("Hafıza kurulamadı. Tekrar dene."); }
    setBusy(false);
  };

  return (
    <Sheet close={close} accent={accent}>
      <h2 style={{ fontSize: 19, fontWeight: 900 }}>Seri ekle</h2>
      <div style={{ fontSize: 12, color: T.muted, marginTop: 4, marginBottom: 4 }}>
        Yarım kalan seriyi anlat. StoryLoom karakterleri, dünya kurallarını ve açık iplikleri çıkarıp hafızasına kursun.
      </div>

      <Lbl>SERİNİN ADI</Lbl>
      <input className="inp" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Kanlı Fener" />

      <Lbl>TÜR</Lbl>
      <Chips opts={["Manga", "Manhwa", "Webtoon", "Novel"]} val={type} set={setType} accent={accent} />

      <Lbl>NEREDE KALDI</Lbl>
      <div className="flex gap-2">
        <input className="inp mono" value={chs} onChange={(e) => setChs(e.target.value.replace(/\D/g, ""))} placeholder="84" />
        <input className="inp mono" value={year} onChange={(e) => setYear(e.target.value.replace(/\D/g, ""))} placeholder="2019" />
      </div>
      <div className="mono" style={{ fontSize: 9, color: T.muted, marginTop: 4 }}>SON BÖLÜM · YIL</div>

      <Lbl hint="Ne kadar yazarsan hafıza o kadar iyi kurulur. Karakterleri, kuralları, çözülmeden kalan soruları yaz.">
        HİKÂYEYİ ANLAT
      </Lbl>
      <textarea className="inp" rows={7} value={txt} onChange={(e) => setTxt(e.target.value)}
        placeholder="Jin adında bir çocuk fener taşıyıcısı olur, ölülerin borcunu toplar. Ustası Bora 62. bölümde ihanet eder ve sebebi hiç açıklanmaz. Jin'in annesi kayıp…"
        style={{ resize: "none" }} />

      {err && <div style={{ fontSize: 12, color: T.hanko, marginTop: 10 }}>{err}</div>}
      <button onClick={run} disabled={busy} className="btn" style={{ marginTop: 14, background: busy ? T.panel2 : accent }}>
        {busy ? "Seri okunuyor, hafıza kuruluyor…" : "Hafızayı kur · ücretsiz"}
      </button>
    </Sheet>
  );
}

/* ---------------- PUAN PANELİ (dal sonu) ---------------- */
function ScorePanel({ b, accent, onRate }) {
  const sc = scoreOf(b), ai = aiOf(b), h = humanOf(b);
  const revs = b.reviews || [];
  const mine = revs.find((r) => r.by === "Kadir");

  return (
    <div className="fade">
      <div className="card p-4">
        <div className="flex items-end gap-3">
          <div className="mono" style={{ fontSize: 42, fontWeight: 700, color: scoreColor(sc.total), lineHeight: 1 }}>{sc.total}</div>
          <div style={{ paddingBottom: 4 }}>
            <div className="mono" style={{ fontSize: 10, color: T.muted, letterSpacing: ".14em" }}>ORTAK PUAN</div>
            <div style={{ fontSize: 11, color: T.muted, marginTop: 2 }}>
              {sc.n ? `AI %${Math.round((1 - sc.wH) * 100)} · okur %${Math.round(sc.wH * 100)}` : "henüz okur yok, AI puanı geçerli"}
            </div>
          </div>
        </div>

        <div className="flex gap-4 mt-4 mb-3 mono" style={{ fontSize: 10 }}>
          <span style={{ color: accent }}>◆ AI</span>
          <span style={{ color: h ? T.gold : T.muted }}>▲ Okur ({sc.n})</span>
        </div>

        {AXES.map((a) => (
          <div key={a.k} className="mb-3">
            <div className="flex justify-between mono" style={{ fontSize: 10, color: T.muted, marginBottom: 4 }}>
              <span>{a.l}</span>
              <span><span style={{ color: accent }}>{ai[a.k]}</span> / <span style={{ color: h ? T.gold : T.muted }}>{h ? h[a.k] : "—"}</span></span>
            </div>
            <div style={{ marginBottom: 3 }}><Bar v={ai[a.k]} g={100} c={accent} /></div>
            <Bar v={h ? h[a.k] : 0} g={100} c={T.gold} />
          </div>
        ))}
      </div>

      {mine ? (
        <div className="card p-3 mt-3" style={{ borderColor: accent }}>
          <div className="mono" style={{ fontSize: 9, color: accent, letterSpacing: ".14em" }}>PUANIN KAYDEDİLDİ</div>
          <div style={{ fontSize: 12, marginTop: 5, lineHeight: 1.5 }}>{mine.text || "Yorum yazmadın."}</div>
        </div>
      ) : (
        <button onClick={onRate} className="btn mt-3" style={{ background: accent }}>Bu dalı puanla · +◈ 10</button>
      )}

      <div className="mono" style={{ fontSize: 10, color: T.muted, letterSpacing: ".16em", margin: "22px 0 10px" }}>
        YORUMLAR · {revs.length}
      </div>
      {revs.length === 0 && (
        <div className="card p-4" style={{ fontSize: 12, color: T.muted }}>Henüz yorum yok. İlk sen yaz.</div>
      )}
      {revs.map((r) => {
        const avg = Math.round((AXES.reduce((x, a) => x + r.axes[a.k], 0) / AXES.length) * 20);
        return (
          <div key={r.id} className="card p-3 mb-2">
            <div className="flex justify-between items-center mb-2">
              <span style={{ fontSize: 12, fontWeight: 800 }}>{r.by}</span>
              <div className="flex items-center gap-2">
                <span className="mono" style={{ fontSize: 12, fontWeight: 700, color: scoreColor(avg) }}>{avg}</span>
                <span className="mono" style={{ fontSize: 9, color: T.muted }}>{r.when}</span>
              </div>
            </div>
            {r.text && <div style={{ fontSize: 13, lineHeight: 1.55, marginBottom: 8 }}>{r.text}</div>}
            <div className="flex flex-wrap gap-1.5">
              {AXES.map((a) => (
                <span key={a.k} className="pill mono" style={{ background: T.panel2, color: T.muted, fontSize: 9, padding: "3px 7px" }}>
                  {a.l.split(" ")[0]} {r.axes[a.k]}/5
                </span>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ---------------- PUANLAMA FORMU ---------------- */
function RateSheet({ b, close, accent, submit }) {
  const [axes, setAxes] = useState(AXES.reduce((o, a) => (o[a.k] = 0, o), {}));
  const [text, setText] = useState("");
  const done = AXES.every((a) => axes[a.k] > 0);
  const avg = done ? Math.round((AXES.reduce((x, a) => x + axes[a.k], 0) / AXES.length) * 20) : null;

  return (
    <Sheet close={close} accent={accent}>
      <h2 style={{ fontSize: 19, fontWeight: 900 }}>{b.title}</h2>
      <div style={{ fontSize: 12, color: T.muted, marginTop: 4, marginBottom: 6 }}>
        Beş kriter. Puanın AI'ın puanıyla harmanlanır.
      </div>

      {AXES.map((a) => (
        <div key={a.k} style={{ marginTop: 18 }}>
          <div className="flex justify-between items-center mb-1">
            <div>
              <div style={{ fontSize: 13, fontWeight: 800 }}>{a.l}</div>
              <div style={{ fontSize: 11, color: T.muted, marginTop: 1 }}>{a.d}</div>
            </div>
            <span className="mono" style={{ fontSize: 12, color: axes[a.k] ? accent : T.muted }}>
              {axes[a.k] ? `${axes[a.k]}/5` : "—"}
            </span>
          </div>
          <div className="flex gap-2 mt-2">
            {[1, 2, 3, 4, 5].map((n) => (
              <button key={n} onClick={() => setAxes({ ...axes, [a.k]: n })} className="flex-1 py-2.5" style={{
                borderRadius: 10, fontSize: 13, fontWeight: 800,
                background: axes[a.k] >= n ? accent : T.panel2,
                color: axes[a.k] >= n ? "#fff" : T.muted,
                border: `1px solid ${axes[a.k] >= n ? accent : T.line}`,
              }}>{n}</button>
            ))}
          </div>
        </div>
      ))}

      <Lbl>YORUMUN</Lbl>
      <textarea className="inp" rows={4} value={text} onChange={(e) => setText(e.target.value)}
        placeholder="Neyi tuttu, neyi kaçırdı? Bora'nın gerekçesi ikna etti mi?" style={{ resize: "none" }} />

      {avg !== null && (
        <div className="card p-3 mt-4 flex justify-between items-center">
          <span style={{ fontSize: 12, color: T.muted }}>Verdiğin puan</span>
          <span className="mono" style={{ fontSize: 20, fontWeight: 700, color: scoreColor(avg) }}>{avg}</span>
        </div>
      )}

      <button onClick={() => submit({ axes, text: text.trim() })} disabled={!done} className="btn"
        style={{ marginTop: 14, background: done ? accent : T.panel2, opacity: done ? 1 : .6 }}>
        {done ? "Puanı gönder · +◈ 10" : "Beş kriteri de puanla"}
      </button>
    </Sheet>
  );
}

/* ---------------- STİL KÜTÜPHANESİ ---------------- */
function StyleLib({ close, accent, styles, setStyles, styleId, setStyleId, say }) {
  const [mk, setMk] = useState(false);
  const [n, setN] = useState("");
  const [p, setP] = useState("");
  const [prev, setPrev] = useState(null);
  const [busy, setBusy] = useState(false);

  const create = () => {
    if (!n.trim() || p.trim().length < 15) return say("İsim ve stil tarifi gerek");
    const st = { id: uid(), n: n.trim(), d: "Senin stilin", p: p.trim(), mine: true };
    setStyles([...styles, st]);
    setStyleId(st.id);
    setN(""); setP(""); setMk(false);
    say("Stil kaydedildi ve seçildi");
  };

  const test = async (st) => {
    setBusy(true); setPrev(null);
    try { setPrev(await drawPanel("Yağmurlu bir sokakta, elinde titreyen bir fener tutan yalnız bir figür, arkadan gelen ışık", st)); }
    catch { say("Deneme çizilemedi"); }
    setBusy(false);
  };

  const cur = styles.find((x) => x.id === styleId);

  return (
    <Sheet close={close} accent={accent}>
      <h2 style={{ fontSize: 19, fontWeight: 900 }}>Stil kütüphanesi</h2>
      <div style={{ fontSize: 12, color: T.muted, marginTop: 4, marginBottom: 4 }}>
        Seçtiğin stil, çizilen tüm panellere uygulanır. Kendi stilini de yazabilirsin.
      </div>

      <Lbl>STİLLER</Lbl>
      {styles.map((st) => (
        <div key={st.id} className="card p-3 mb-2" style={{ borderColor: st.id === styleId ? accent : T.line }}>
          <div className="flex justify-between items-center">
            <button onClick={() => setStyleId(st.id)} className="text-left" style={{ flex: 1 }}>
              <div className="flex items-center gap-2">
                <span style={{ fontSize: 13, fontWeight: 800 }}>{st.n}</span>
                {st.mine && <span className="pill" style={{ background: T.panel2, color: accent, fontSize: 8 }}>SENİN</span>}
                {st.id === styleId && <span className="mono" style={{ fontSize: 9, color: accent }}>● SEÇİLİ</span>}
              </div>
              <div style={{ fontSize: 11, color: T.muted, marginTop: 2 }}>{st.d}</div>
            </button>
            <button onClick={() => test(st)} disabled={busy} className="pill"
              style={{ background: T.panel2, color: T.gold, fontSize: 10, padding: "6px 10px" }}>
              {busy ? "…" : "dene"}
            </button>
          </div>
          <div style={{ fontSize: 11, color: T.muted, marginTop: 6, lineHeight: 1.45, opacity: .8 }}>{st.p}</div>
          {st.mine && (
            <button onClick={() => { setStyles(styles.filter((x) => x.id !== st.id)); if (styleId === st.id) setStyleId(styles[0].id); }}
              className="pill mt-2" style={{ background: T.panel2, color: T.hanko, fontSize: 10 }}>Sil</button>
          )}
        </div>
      ))}

      {(busy || prev) && (
        <>
          <Lbl>DENEME PANELİ</Lbl>
          {busy ? (
            <div className="card pulse" style={{ height: 180, display: "grid", placeItems: "center" }}>
              <span className="mono" style={{ fontSize: 10, color: T.gold }}>ÇİZİLİYOR…</span>
            </div>
          ) : <Art svg={prev} hue={268} h={200} />}
        </>
      )}

      {mk ? (
        <>
          <Lbl>STİL ADI</Lbl>
          <input className="inp" value={n} onChange={(e) => setN(e.target.value)} placeholder="Kömür ve Kan" />
          <Lbl hint="Renk, çizgi, ışık, atmosfer — ne kadar tarif edersen o kadar tutarlı çizer.">STİLİ TARİF ET</Lbl>
          <textarea className="inp" rows={4} value={p} onChange={(e) => setP(e.target.value)}
            placeholder="kömür karası zemin, tek kırmızı vurgu, titrek elle çizilmiş kontur, geniş boş alanlar, soğuk ay ışığı"
            style={{ resize: "none" }} />
          <div className="flex gap-2 mt-3">
            <button onClick={() => setMk(false)} className="btn-ghost" style={{ flex: 1 }}>Vazgeç</button>
            <button onClick={create} className="btn" style={{ flex: 1.4, background: accent }}>Stili kaydet</button>
          </div>
        </>
      ) : (
        <button onClick={() => setMk(true)} className="btn-ghost w-full mt-4" style={{ borderStyle: "dashed", borderColor: accent, color: accent }}>
          + Kendi stilini yaz
        </button>
      )}

      <div className="card p-3 mt-4" style={{ fontSize: 11, color: T.muted, lineHeight: 1.5 }}>
        Aktif stil: <span style={{ color: accent, fontWeight: 700 }}>{cur?.n}</span>. Panel çizimleri şu an SVG olarak üretiliyor —
        gerçek çizim modeline geçince aynı stil tarifi oraya gider.
      </div>
    </Sheet>
  );
}
