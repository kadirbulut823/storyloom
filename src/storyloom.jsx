import React, { useState, useRef, useEffect, createContext, useContext } from "react";

/* ============================================================
   StoryLoom — finish the stories that were abandoned
   English by default · Turkish available · mobile + desktop
   ============================================================ */

const T = {
  void: "#0A0711", panel: "#150E1E", panel2: "#1D1429", line: "#2E2140",
  violet: "#8B5CF6", violetDim: "#6D3FD4", gold: "#F0B429", hanko: "#E5484D",
  paper: "#EDE6F2", muted: "#8F82A3",
};

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Unbounded:wght@400;700;900&family=Manrope:wght@400;500;700;800&family=JetBrains+Mono:wght@400;700&display=swap');
*{box-sizing:border-box;-webkit-tap-highlight-color:transparent}
.page{background:${T.void};color:${T.paper};font-family:'Manrope',system-ui,sans-serif;min-height:100vh}
.page h1,.page h2,.page h3,.page .disp{font-family:'Unbounded',sans-serif;letter-spacing:-.02em}
.mono{font-family:'JetBrains Mono',monospace}
.page button{font-family:inherit;cursor:pointer;border:none;background:none;color:inherit}
.page button:focus-visible,.page input:focus-visible,.page textarea:focus-visible{outline:2px solid ${T.violet};outline-offset:2px}
.scroll-x{overflow-x:auto;scrollbar-width:none}
.scroll-x::-webkit-scrollbar{display:none}

.topbar{position:sticky;top:0;z-index:30;background:rgba(10,7,17,.9);backdrop-filter:blur(14px);border-bottom:1px solid ${T.line}}
.topbar-in{max-width:480px;margin:0 auto;display:flex;align-items:center;justify-content:space-between;padding:12px 16px}
.shell{max-width:480px;margin:0 auto}
.side{display:none}
.main{padding:0 16px 90px}
.bottomnav{position:fixed;bottom:0;left:0;right:0;z-index:30;display:flex;max-width:480px;margin:0 auto;background:rgba(10,7,17,.95);backdrop-filter:blur(14px);border-top:1px solid ${T.line};padding:8px 0 20px}

.card{background:${T.panel};border:1px solid ${T.line};border-radius:14px}
.pill{display:inline-flex;align-items:center;gap:6px;padding:4px 10px;border-radius:999px;font-size:11px;font-weight:700}
.btn{background:${T.violet};color:#fff;font-weight:800;padding:13px 18px;border-radius:12px;font-size:14px;width:100%;transition:transform .12s}
.btn:active{transform:scale(.97)}
.btn-ghost{background:transparent;border:1px solid ${T.line};color:${T.paper};font-weight:700;padding:11px 16px;border-radius:12px;font-size:13px}
.inp{width:100%;background:${T.panel2};border:1px solid ${T.line};border-radius:10px;padding:11px 12px;color:${T.paper};font-size:14px;font-family:inherit}

.sheet-wrap{position:fixed;inset:0;z-index:45;display:flex;align-items:flex-end;background:rgba(0,0,0,.7)}
.sheet{width:100%;max-width:480px;margin:0 auto;background:${T.panel};border-top:1px solid ${T.violet};border-radius:20px 20px 0 0;padding:20px;max-height:90vh;overflow-y:auto}
.grab{width:36px;height:4px;background:${T.line};border-radius:99px;margin:0 auto 16px}
.full{position:fixed;inset:0;z-index:44;background:${T.void};overflow-y:auto}
.full-in{max-width:480px;margin:0 auto}

.spine{position:absolute;left:15px;top:0;bottom:0;width:2px;background:linear-gradient(180deg,${T.line},${T.line} 55%,transparent 55%,transparent 100%);background-size:2px 10px}
.node{width:12px;height:12px;border-radius:50%;flex:0 0 12px;margin-top:6px;z-index:1}
.branch-arm{position:absolute;left:-19px;top:12px;width:19px;height:2px;background:${T.violetDim}}
.hanko{border:2px solid ${T.hanko};color:${T.hanko};border-radius:6px;padding:6px 10px;font-weight:900;font-size:11px;letter-spacing:.14em;transform:rotate(-4deg);display:inline-block;font-family:'JetBrains Mono',monospace}
.bub{position:absolute;background:#fff;color:#111;font-weight:700;padding:8px 11px;border-radius:14px;font-size:12px;line-height:1.35;text-align:center;touch-action:none;user-select:none}
.bub-tail:after{content:'';position:absolute;bottom:-8px;left:50%;margin-left:-6px;border:6px solid transparent;border-top-color:#fff}
.pulse{animation:pl 1.4s ease-in-out infinite}
@keyframes pl{0%,100%{opacity:.35}50%{opacity:1}}
.fade{animation:fd .35s ease both}
@keyframes fd{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}

/* ---- desktop ---- */
@media (min-width:920px){
  .topbar-in{max-width:1020px;padding:14px 24px}
  .shell{max-width:1020px;display:flex;gap:32px;padding:0 24px}
  .side{display:flex;flex-direction:column;gap:4px;width:200px;flex-shrink:0;position:sticky;top:74px;height:fit-content;padding-top:24px}
  .side-item{display:flex;align-items:center;gap:12px;padding:11px 14px;border-radius:11px;font-size:14px;font-weight:700;text-align:left;width:100%}
  .bottomnav{display:none}
  .main{flex:1;min-width:0;max-width:700px;padding:0 0 60px}
  .sheet-wrap{align-items:center}
  .sheet{border-radius:18px;border:1px solid ${T.violet};max-width:540px;max-height:84vh}
  .full-in{max-width:760px;padding-bottom:40px}
}
@media (prefers-reduced-motion:reduce){*{animation:none!important;transition:none!important}}
`;

/* ---------------- i18n ---------------- */
const STR = {
  en: {
    lang: "English", nav_home: "Discover", nav_quests: "Quests", nav_guilds: "Guilds", nav_market: "Market", nav_me: "Profile",
    back: "Back", close: "Close", cancel: "Cancel", save: "Save", del: "Delete", done: "Done", next: "Next", retry: "Try again",
    balance: "Balance", insufficient: "Not enough coins", search_ph: "Search series — title, genre, tag, plot…",
    hero_kick: "3,412 SERIES ABANDONED", hero_1: "Half-finished", hero_2: "stories deserve", hero_3: "an ending.",
    hero_sub: "Pick up where it stopped. StoryLoom reads the series, memorizes the characters and the world, then writes your branch.",
    today_quests: "Today's quests", earn_c: "Finish them, earn", continue_k: "CONTINUE", continue_t: "Where you left off",
    ch_left: "left off at ch.", abandoned_k: "ABANDONED", abandoned_t: "Waiting to continue", add_series: "+ Add series",
    demand_k: "DEMAND BOARD", demand_t: "Series the crowd is funding", readers_pooled: "readers joined the bounty",
    goal: "goal", join_pool: "Join the pool", studio_k: "STUDIO", studio_t: "Tools",
    t_novel: "Novel → Webtoon", t_novel_d: "Turn prose into panels", t_editor: "Panel editor", t_editor_d: "Bubbles, SFX, framing",
    t_style: "Style library", t_poster: "Poster maker", t_poster_d: "Something to share", soon: "soon",
    tab_branches: "Branches", tab_memory: "Memory", tab_chapters: "Chapters", read: "Read", continue_it: "Continue it",
    canon_line: "Canon · ch. 1–", orig_team: "Original team", dropped_stamp: "DROPPED HERE", open_branch: "Open your own branch →",
    yours: "YOURS", canon_badge: "CANON", fidelity: "JOINT", ai_s: "AI", reader_s: "Readers", chapters_w: "chapters",
    branched_from: "branched from ch.", continue_yours_k: "CONTINUE YOUR BRANCHES", add_ch: "+ Add chapter",
    retcon_hint: "Pick the chapter where it went wrong. The story gets rewoven from there.", retcon_btn: "⟲ Branch here",
    mem_core: "Memory core", live: "LIVE", mem_sub_c: "characters", mem_sub_r: "rules", mem_sub_o: "open threads", mem_sub_x: "closed",
    mem_note: "Every chapter you publish is written back here. Future generations remember it.",
    style_ref_t: "Original Art Reference", style_ref_learned: "LEARNED",
    style_ref_note: "Upload 1-3 images from the original series. The AI studies them once and reuses that exact style for every future panel.",
    style_ref_pick: "Choose images", style_ref_replace: "Upload different reference art",
    style_ref_busy: "Studying the style…", style_ref_go: "Learn this style",
    chars_k: "CHARACTERS · tap to talk", rules_k: "WORLD RULES", threads_k: "THREADS", memlog_k: "MEMORY LOG",
    draw_it: "✎ draw", talk: "💬 TALK", canon_src: "CANON", speak_ph: "Ask something…", thinking: "is thinking…",
    silence: "…silence. Try again.", looks_at_you: "looks at you.",
  },
  tr: {
    lang: "Türkçe", nav_home: "Keşfet", nav_quests: "Görev", nav_guilds: "Klan", nav_market: "Market", nav_me: "Profil",
    back: "Geri", close: "Kapat", cancel: "Vazgeç", save: "Kaydet", del: "Sil", done: "Bitti", next: "Devam", retry: "Tekrar dene",
    balance: "Bakiye", insufficient: "Coin yetersiz", search_ph: "Seri ara — isim, tür, etiket, konu…",
    hero_kick: "3.412 SERİ TERK EDİLDİ", hero_1: "Yarım kalan", hero_2: "hikâyeler bitmeyi", hero_3: "hak ediyor.",
    hero_sub: "Bıraktığı yerden devam et. StoryLoom seriyi okur, karakterleri ve dünyayı ezberler, senin dalını yazar.",
    today_quests: "Bugünün görevleri", earn_c: "Tamamla, kazan", continue_k: "DEVAM ET", continue_t: "Kaldığın yer",
    ch_left: "bölümde kaldın", abandoned_k: "TERK EDİLDİ", abandoned_t: "Devam bekleyenler", add_series: "+ Seri ekle",
    demand_k: "TALEP PANOSU", demand_t: "Ortak kesenin dolduğu seriler", readers_pooled: "okur ödül havuzuna katıldı",
    goal: "hedef", join_pool: "Havuza katıl", studio_k: "STÜDYO", studio_t: "Araçlar",
    t_novel: "Novel → Webtoon", t_novel_d: "Metni panele çevir", t_editor: "Panel editörü", t_editor_d: "Balon, efekt, kadraj",
    t_style: "Stil kütüphanesi", t_poster: "Poster üretici", t_poster_d: "Paylaşılacak görsel", soon: "yakında",
    tab_branches: "Dallar", tab_memory: "Hafıza", tab_chapters: "Bölümler", read: "Oku", continue_it: "Devam ettir",
    canon_line: "Canon · 1–", orig_team: "Orijinal ekip", dropped_stamp: "BURADA BIRAKILDI", open_branch: "Kendi dalını aç →",
    yours: "SENİN", canon_badge: "CANON", fidelity: "ORTAK", ai_s: "AI", reader_s: "Okur", chapters_w: "bölüm",
    branched_from: "bölümden sapma", continue_yours_k: "DALLARINI SÜRDÜR", add_ch: "+ Bölüm ekle",
    retcon_hint: "Gidişatı beğenmediğin bölümü seç, oradan itibaren hikâye yeniden dokunsun.", retcon_btn: "⟲ Buradan sap",
    mem_core: "Hafıza çekirdeği", live: "CANLI", mem_sub_c: "karakter", mem_sub_r: "kural", mem_sub_o: "açık iplik", mem_sub_x: "kapanmış",
    mem_note: "Yayımladığın her bölüm buraya işlenir. Sonraki üretimler bunu hatırlar.",
    style_ref_t: "Orijinal Çizim Referansı", style_ref_learned: "ÖĞRENİLDİ",
    style_ref_note: "Orijinal seriden 1-3 görsel yükle. Yapay zeka bunları bir kez inceler ve bundan sonraki tüm panellerde aynı stili kullanır.",
    style_ref_pick: "Görsel seç", style_ref_replace: "Farklı referans görsel yükle",
    style_ref_busy: "Stil inceleniyor…", style_ref_go: "Bu stili öğren",
    chars_k: "KARAKTERLER · dokun, konuş", rules_k: "DÜNYA KURALLARI", threads_k: "İPLİKLER", memlog_k: "HAFIZA GÜNLÜĞÜ",
    draw_it: "✎ çiz", talk: "💬 KONUŞ", canon_src: "CANON", speak_ph: "Bir şey sor…", thinking: "düşünüyor…",
    silence: "…sessizlik. Tekrar dene.", looks_at_you: "sana bakıyor.",
  },
};

/* second half of the string table */
Object.assign(STR.en, {
  forge_quick: "Quick", forge_quick_d: "3 settings, one tap", forge_adv: "Advanced", forge_adv_d: "You control everything",
  write_ch: "Write chapter", reweave_ch: "Reweave chapter", mem_loaded: "Memory loaded",
  tone: "TONE", length: "LENGTH", your_note: "YOUR NOTE", want_more: "I want more control →",
  narrator: "NARRATOR", maturity: "MATURITY", pace: "PACE", dialogue: "DIALOGUE DENSITY", fidelity_l: "CANON FIDELITY",
  panels_l: "PANEL COUNT", cliff: "Cliffhanger", focus_l: "FOCUS CHARACTERS", focus_h: "Who should this chapter revolve around?",
  threads_l: "THREADS TO RESOLVE", threads_h: "The ones you pick get closed and marked in memory.",
  newchar_l: "ADD YOUR OWN CHARACTER", newchar_h: "Format: Name — description. Written into memory permanently on publish.",
  newrule_l: "ADD YOUR OWN WORLD RULE", forbid_l: "FORBIDDEN", forbid_h: "Things that must never happen in this chapter.",
  custom_l: "CUSTOM PARAMETER", custom_h: "Write your own label, give it a value. Unlimited.",
  author_note: "AUTHOR NOTE", extra_params: "extra parameters", target_fid: "fidelity target",
  generate: "Generate chapter", generating: "Reading memory, weaving the chapter…", gen_failed: "Generation failed. Try again.",
  guild_pay: "Pay from guild vault", vault: "vault", ai_score: "AI SCORE",
  blend_note: "READER SCORES BLEND WITH THIS ONCE PUBLISHED", guard: "LORE GUARD", warnings: "WARNINGS",
  to_memory: "WILL BE WRITTEN TO MEMORY", draw_panels: "Draw the panels", redraw: "Redraw", drawing_p: "Drawing panel",
  settings_b: "Settings", publish: "Publish & write to memory", add_to_branch: "Add to branch", to_panels: "Send to panel editor →",
  published: "Branch published.", ch_added: "Chapter added to branch.", facts_written: "new facts written to memory",
  threads_closed: "threads closed",
  chapter_over: "Chapter over.", next_ch: "Next chapter →", follow: "+ Follow", following: "✓ Following",
  joint_score: "JOINT SCORE", no_readers: "no readers yet, AI score stands", votes_w: "VOTES",
  canon_vote: "CANON VOTE", canon_sealed: "⛩ COMMUNITY CANON",
  canon_sealed_d: "The community accepted this as the official continuation.",
  canon_need: "Needs {p}% support and at least {m} votes to be sealed.",
  vote_no: "Not canon", vote_yes: "Make it canon", your_vote: "YOUR VOTE",
  rate_this: "Rate this branch", rated_ok: "YOUR RATING IS IN", no_comment: "You didn't leave a comment.",
  comments: "COMMENTS", no_comments: "No comments yet. Be the first.",
  reply: "Reply", reply_ph: "Write a reply…", replies: "replies", author_tag: "AUTHOR",
  rate_sub: "Five criteria. Your score blends with the AI's.", your_comment: "YOUR COMMENT",
  comment_ph: "What worked, what missed?", your_score: "Your score", rate_all: "Rate all five", send_rating: "Send rating",
  ax_fid: "Canon fidelity", ax_fid_d: "True to the rules and events?",
  ax_char: "Character consistency", ax_char_d: "Does everyone sound like themselves?",
  ax_pace: "Pacing", ax_pace_d: "Did it pull you, or sag?",
  ax_dial: "Dialogue", ax_dial_d: "Do the lines land?",
  ax_orig: "Originality", ax_orig_d: "Any surprise, or all cliché?",
});
Object.assign(STR.tr, {
  forge_quick: "Hızlı", forge_quick_d: "3 ayar, tek dokunuş", forge_adv: "Gelişmiş", forge_adv_d: "Her şeyi sen kur",
  write_ch: "Bölümü yaz", reweave_ch: "Bölümü yeniden dokut", mem_loaded: "Hafıza yüklü",
  tone: "TON", length: "UZUNLUK", your_note: "NOTUN", want_more: "Daha fazla kontrol istiyorum →",
  narrator: "ANLATICI", maturity: "OLGUNLUK", pace: "TEMPO", dialogue: "DİYALOG YOĞUNLUĞU", fidelity_l: "CANON SADAKATİ",
  panels_l: "PANEL SAYISI", cliff: "Cliffhanger", focus_l: "ODAK KARAKTERLER", focus_h: "Bu bölüm kimin etrafında dönsün?",
  threads_l: "ÇÖZÜLECEK İPLİKLER", threads_h: "Seçtiklerin kapanır ve hafızada işaretlenir.",
  newchar_l: "KENDİ KARAKTERİNİ EKLE", newchar_h: "Format: İsim — açıklama. Yayımlayınca hafızaya kalıcı işlenir.",
  newrule_l: "KENDİ DÜNYA KURALINI EKLE", forbid_l: "YASAKLAR", forbid_h: "Bu bölümde asla olmayacak şeyler.",
  custom_l: "ÖZEL PARAMETRE", custom_h: "Kendi etiketini yaz, değerini gir. Sınırsız.",
  author_note: "YAZAR NOTU", extra_params: "ek parametre", target_fid: "sadakat hedefi",
  generate: "Bölümü üret", generating: "Hafıza okunuyor, bölüm dokunuyor…", gen_failed: "Üretim tamamlanamadı. Tekrar dene.",
  guild_pay: "Klan kesesinden öde", vault: "kese", ai_score: "AI PUANI",
  blend_note: "YAYIMLAYINCA OKUR PUANLARI BUNUNLA HARMANLANIR", guard: "LORE MUHAFIZI", warnings: "UYARI",
  to_memory: "HAFIZAYA YAZILACAK", draw_panels: "Panelleri çiz", redraw: "Yeniden çiz", drawing_p: "Panel çiziliyor",
  settings_b: "Ayarlar", publish: "Yayımla ve hafızaya yaz", add_to_branch: "Dala ekle", to_panels: "Panel editörüne aktar →",
  published: "Dal yayımlandı.", ch_added: "Bölüm dala eklendi.", facts_written: "yeni bilgi hafızaya işlendi",
  threads_closed: "iplik kapandı",
  chapter_over: "Bölüm bitti.", next_ch: "Sonraki bölüm →", follow: "+ Takip", following: "✓ Takipte",
  joint_score: "ORTAK PUAN", no_readers: "henüz okur yok, AI puanı geçerli", votes_w: "OY",
  canon_vote: "CANON OYLAMASI", canon_sealed: "⛩ TOPLULUK CANONU",
  canon_sealed_d: "Bu dal topluluk tarafından resmî devam kabul edildi.",
  canon_need: "Mühür için %{p} destek ve en az {m} oy gerekiyor.",
  vote_no: "Olmasın", vote_yes: "Canon olsun", your_vote: "OYUN",
  rate_this: "Bu dalı puanla", rated_ok: "PUANIN KAYDEDİLDİ", no_comment: "Yorum yazmadın.",
  comments: "YORUMLAR", no_comments: "Henüz yorum yok. İlk sen yaz.",
  reply: "Yanıtla", reply_ph: "Yanıt yaz…", replies: "yanıt", author_tag: "YAZAR",
  rate_sub: "Beş kriter. Puanın AI'ın puanıyla harmanlanır.", your_comment: "YORUMUN",
  comment_ph: "Neyi tuttu, neyi kaçırdı?", your_score: "Verdiğin puan", rate_all: "Beş kriteri de puanla", send_rating: "Puanı gönder",
  ax_fid: "Canon sadakati", ax_fid_d: "Kurallara ve olan bitene sadık mı?",
  ax_char: "Karakter tutarlılığı", ax_char_d: "Herkes kendi gibi mi konuşuyor?",
  ax_pace: "Tempo", ax_pace_d: "Sürükledi mi, sarktı mı?",
  ax_dial: "Diyalog", ax_dial_d: "Replikler tutuyor mu?",
  ax_orig: "Özgünlük", ax_orig_d: "Sürpriz var mı, klişe mi?",
});
Object.assign(STR.en, {
  quests_t: "Quests", quests_sub: "Read, vote, create. Stack coins.",
  streak: "Login streak", days: "days", on_day7: "on day 7", claimed: "✓ CLAIMED", claim: "CLAIM",
  q_daily: "DAILY", q_weekly: "WEEKLY", q_monthly: "MONTHLY", q_today: "Today", q_week: "This week", q_month: "This month",
  guilds_t: "Guilds", guilds_sub: "Weave together. Create from a shared vault.",
  g_mine: "My guild", g_browse: "Browse", g_league: "League",
  g_none: "You have no guild", g_none_d: "A guild is a shared vault and a shared project. Spend guild coins on generation — yours stay put.",
  g_find: "Find a guild", g_create: "Create your own guild", g_create_t: "Create a guild", g_create_d: "500 coins. You become the leader.",
  g_name: "GUILD NAME", g_tag: "TAG", g_tag_h: "3 letters. Shown next to member names.", g_create_btn: "Create",
  g_vault: "Shared vault", g_vault_d: "Tick \"pay from guild vault\" when generating — your own coins stay put.",
  g_donate: "Donate to vault", g_proj: "GUILD PROJECT", g_proj_none: "Not set",
  g_proj_d: "Pick which branch the guild finishes. Everyone works on the same story.",
  g_proj_pick: "Pick a project", g_proj_change: "Change project", g_proj_none_d: "You have no branches yet. Open one first.",
  g_quest: "GUILD QUEST", g_quest_d: "Every chapter you publish moves this bar. Fill it and the vault grows, the guild levels up.",
  g_reward: "REWARD", to_vault: "to vault", g_feed: "FEED", g_feed_t: "What's happening", g_leave: "Leave guild",
  g_member: "● MEMBER", g_have: "You have a guild", g_join: "Join", g_season: "SEASON 3 · 12 DAYS LEFT",
  g_pts: "pts", g_leader: "Leader", g_pts_d: "Points = vault ÷ 100 + level × 10. Top three guilds get a coin prize at season end.",
});
Object.assign(STR.tr, {
  quests_t: "Görevler", quests_sub: "Oku, oy ver, üret. Coin biriktir.",
  streak: "Seri giriş", days: "gün", on_day7: "7. günde", claimed: "✓ ALINDI", claim: "AL",
  q_daily: "GÜNLÜK", q_weekly: "HAFTALIK", q_monthly: "AYLIK", q_today: "Bugün", q_week: "Bu hafta", q_month: "Bu ay",
  guilds_t: "Klanlar", guilds_sub: "Birlikte dokuyun. Ortak keseden üretin.",
  g_mine: "Klanım", g_browse: "Keşfet", g_league: "Lig",
  g_none: "Klanın yok", g_none_d: "Klan = ortak kese + ortak proje. Kesedeki coinle üretim yaparsın, kendi coinin durur.",
  g_find: "Klan bul", g_create: "Kendi klanını kur", g_create_t: "Klan kur", g_create_d: "500 coin. Lider sen olursun.",
  g_name: "KLAN ADI", g_tag: "ETİKET", g_tag_h: "3 harf. Üye isimlerinin yanında görünür.", g_create_btn: "Kur",
  g_vault: "Ortak kese", g_vault_d: "Bölüm üretirken \"klan kesesinden öde\" seçeneğini işaretle — kendi coinin gitmez.",
  g_donate: "Keseye bağışla", g_proj: "KLAN PROJESİ", g_proj_none: "Belirlenmedi",
  g_proj_d: "Klanın hangi dalı bitireceğini seçin. Herkes aynı hikâyeye çalışır.",
  g_proj_pick: "Proje seç", g_proj_change: "Projeyi değiştir", g_proj_none_d: "Henüz dalın yok. Önce bir dal aç.",
  g_quest: "KLAN GÖREVİ", g_quest_d: "Her yayımladığın bölüm bu sayacı ilerletir. Dolunca kese şişer, klan seviye atlar.",
  g_reward: "ÖDÜL", to_vault: "keseye", g_feed: "AKIŞ", g_feed_t: "Klanda ne oluyor", g_leave: "Klandan ayrıl",
  g_member: "● ÜYESİN", g_have: "Klanın var", g_join: "Katıl", g_season: "SEZON 3 · 12 GÜN KALDI",
  g_pts: "puan", g_leader: "Lider", g_pts_d: "Puan = kese ÷ 100 + seviye × 10. Sezon sonunda ilk üç klan coin ödülü alır.",
});
Object.assign(STR.en, {
  market_t: "Market", market_sub: "Hire artists, writers, editors. Payment is held in escrow until delivery.",
  m_browse: "Creators", m_jobs: "My jobs", m_sell: "Sell",
  all: "All", per_job: "/ JOB", jobs_w: "jobs",
  hire_t: "Open a job", brief_l: "BRIEF", brief_ph: "12 panels of lineart, Blood Lantern ch. 85…",
  budget_l: "BUDGET", fee_l: "Platform fee (12%)", total: "Total", hire_btn: "Hold in escrow & open job",
  escrow_d: "Coins are held in escrow when the job opens. They go to the creator once you approve delivery. Platform takes 12% — paid by you, the creator gets their full rate. Disputes are mediated within 72 hours.",
  j_open: "IN PROGRESS", j_delivered: "DELIVERED", j_done: "COMPLETED", j_revision: "REVISION REQUESTED",
  no_jobs: "No jobs yet. Hire someone from the Creators tab.",
  working: "is working…", delivered_by: "Delivered by", approve: "Approve & release payment", request_rev: "Request revision",
  rev_ph: "What needs to change?", released: "Payment released", rev_sent: "Revision requested", escrowed: "In escrow",
  sell_t: "Sell your work", sell_d: "List yourself. Readers with coins are looking for artists right now.",
  sell_role: "ROLE", sell_skill: "WHAT YOU DO", sell_skill_ph: "Manhwa lineart, 12 panels per job", sell_rate: "RATE PER JOB",
  sell_btn: "Publish listing", sell_live: "Your listing is live", sell_live_d: "You appear in the Creators tab. You keep 100% of your rate — the client pays the fee.",
  sell_edit: "Edit listing", sell_off: "Take listing down",
  get_delivery: "Get the delivery", your_name: "YOUR NAME",
  cap_hit: "Daily earning cap reached — come back tomorrow",
  earned_today: "Earned today", econ_k: "ECONOMY", econ_t: "Where your coins go",
  econ_note: "Every AI action burns real compute, so it costs coins. Earning is capped at {c}/day — that keeps the economy from inflating and keeps generation affordable for everyone.",
  price_chapter: "Generate a chapter", price_panel: "Draw a panel", price_chat: "Message a character",
  price_portrait: "Character portrait", price_poster: "Poster", price_convert: "Novel → Webtoon",
  price_add: "Add a series", free_w: "FREE", each_w: "each",
  cost_line: "This costs", per_msg: "per message",
});
Object.assign(STR.tr, {
  market_t: "Market", market_sub: "Çizer, yazar, editör tut. Ödeme teslimde serbest kalır.",
  m_browse: "Üreticiler", m_jobs: "İşlerim", m_sell: "Sat",
  all: "Tümü", per_job: "/ İŞ", jobs_w: "iş",
  hire_t: "İş aç", brief_l: "İŞ TANIMI", brief_ph: "12 panel lineart, Kanlı Fener 85. bölüm…",
  budget_l: "BÜTÇE", fee_l: "Platform payı (%12)", total: "Toplam", hire_btn: "Emanete al ve iş aç",
  escrow_d: "Coin, iş açıldığında emanete alınır. Teslimi onaylayınca üreticiye geçer. Platform payı %12 — işveren öder, üretici tam ücretini alır. Anlaşmazlıkta arabuluculuk 72 saat sürer.",
  j_open: "DEVAM EDİYOR", j_delivered: "TESLİM EDİLDİ", j_done: "TAMAMLANDI", j_revision: "REVİZYON İSTENDİ",
  no_jobs: "Henüz iş yok. Üreticiler sekmesinden birini tut.",
  working: "çalışıyor…", delivered_by: "Teslim eden", approve: "Onayla ve ödemeyi serbest bırak", request_rev: "Revizyon iste",
  rev_ph: "Ne değişmeli?", released: "Ödeme serbest bırakıldı", rev_sent: "Revizyon istendi", escrowed: "Emanette",
  sell_t: "İşini sat", sell_d: "Kendini listele. Coini olan okurlar şu an çizer arıyor.",
  sell_role: "MESLEK", sell_skill: "NE YAPIYORSUN", sell_skill_ph: "Manhwa lineart, iş başına 12 panel", sell_rate: "İŞ BAŞINA ÜCRET",
  sell_btn: "İlanı yayımla", sell_live: "İlanın yayında", sell_live_d: "Üreticiler sekmesinde görünüyorsun. Ücretinin %100'ünü alırsın — payı müşteri öder.",
  sell_edit: "İlanı düzenle", sell_off: "İlanı kaldır",
  get_delivery: "Teslimi al", your_name: "ADIN",
  cap_hit: "Günlük kazanç limiti doldu — yarın gel",
  earned_today: "Bugün kazanılan", econ_k: "EKONOMİ", econ_t: "Coinlerin nereye gidiyor",
  econ_note: "Her AI işlemi gerçek işlem gücü yakar, o yüzden coin tutar. Kazanç günde {c} ile sınırlı — bu, ekonominin şişmesini önler ve üretimi herkes için ucuz tutar.",
  price_chapter: "Bölüm üret", price_panel: "Panel çiz", price_chat: "Karakterle konuş",
  price_portrait: "Karakter portresi", price_poster: "Poster", price_convert: "Novel → Webtoon",
  price_add: "Seri ekle", free_w: "ÜCRETSİZ", each_w: "adet",
  cost_line: "Ücret", per_msg: "mesaj başına",
});
Object.assign(STR.en, {
  prof_canon_k: "⛩ CANON", prof_canon_t: "Branches the community chose", sealed_w: "⛩ SEALED", support: "support",
  canon_prize: "Canon prize (total)", weekly_cut: "Weekly revenue share",
  canon_note: "Your canon branches keep earning as they're read. \"⛩ Canon Author\" title unlocked.",
  author_k: "AUTHOR SCORE", author_t: "Average across your branches", branches_w: "branches", reader_scores: "reader scores",
  rated_n: "branches have reader scores", no_reader_scores: "no reader scores yet, AI score stands",
  custom_k: "CUSTOMIZE", custom_t: "Appearance", accent_l: "ACCENT COLOR", frame_l: "FRAME", title_l: "TITLE",
  f_none: "None", f_ink: "Ink", f_gold: "Gold", f_hanko: "Hanko",
  plans_k: "MEMBERSHIP", plans_t: "Plans", current: "Current", upgrade: "Switch",
  wallet_k: "COINS", wallet_t: "Wallet", wallet_d: "Earn from quests or buy", buy_coins: "Buy coins", shop_soon: "Shop coming soon",
  lib_k: "LIBRARY", lib_t: "My branches", lib_none: "No branches yet. Open a series and hit \"Continue it\".",
  data_k: "DATA", data_t: "Saved", data_d: "Your series, branches, memory and coins are stored on this device. Close the tab, they stay.",
  wipe: "Reset everything", wiped: "Everything reset",
  lang_k: "LANGUAGE", lang_t: "Interface language",
  add_t: "Add a series", add_d: "Tell us about the abandoned series. StoryLoom will extract the characters, world rules and open threads into its memory.",
  add_name: "SERIES TITLE", add_type: "TYPE", add_where: "WHERE IT STOPPED", add_where_h: "LAST CHAPTER · YEAR",
  add_tell: "TELL THE STORY", add_tell_h: "The more you write, the better the memory. Characters, rules, unanswered questions.",
  add_tell_ph: "A boy named Jin becomes a lantern bearer, collecting the debts of the dead. His master Bora betrays him in ch. 62 and the reason is never explained. Jin's mother is missing…",
  add_btn: "Build the memory · free", add_busy: "Reading the series, building memory…", add_err: "Couldn't build it. Try again.",
  add_need: "Title and a few sentences needed.", add_ok: "Series added, memory built.",
  ob_kick: "3,412 SERIES ABANDONED", ob_h1: "Did your", ob_h2: "favourite series die?",
  ob_sub: "StoryLoom reads it. Memorizes the characters, the world rules, the unresolved secrets. Then continues it",
  ob_sub_hi: "exactly how you want.",
  ob_f1: "Pick up where it stopped", ob_f1d: "Ended at chapter 84? You write 85.",
  ob_f2: "Change what you hated", ob_f2d: "That betrayal in ch. 62 was nonsense — rewind, reweave it.",
  ob_f3: "Let the community pick canon", ob_f3d: "The best branch gets sealed. The author gets paid.",
  ob_start: "Start", ob_taste: "What do you read?", ob_taste_d: "So we know what to show you. Pick as many as you like.",
  ob_taste_n: "genres picked. Discover will shape around this.", ob_skip: "Skip for now",
  ob_first: "Your first move", ob_coins: "We dropped 500 coins in your account. Enough for one chapter.",
  ob_add: "Add my own series", ob_add_d: "Tell us about the series that stopped. Start here if one's already on your mind.",
  ob_recommended: "RECOMMENDED →", ob_look: "Let me look around first",
  ob_look_d: "Browse the ready-made series. \"Blood Lantern\" is a good start — full memory, 3 branches.",
  welcome_coins: "+500 welcome coins",
  notifs_t: "Notifications", notifs_none: "Quiet. Follow a branch, publish a chapter — this fills up.", clear: "Clear",
  poster_t: "Poster maker", poster_d: "A vertical image to share. Style:", poster_series: "SERIES", poster_line: "TAGLINE",
  poster_line_h: "Leave it empty and the AI writes one.", poster_make: "Make poster", poster_again: "Make another",
  poster_busy: "Weaving the poster…", poster_dl: "Download as SVG", poster_dl_ok: "Poster downloaded",
  poster_dl_err: "Couldn't download — take a screenshot instead", poster_foot: "STORYLOOM · YOUR TURN",
  style_t: "Style library", style_d: "The style you pick is applied to every panel drawn. You can write your own.",
  styles_l: "STYLES", style_try: "try", style_mine: "YOURS", style_sel: "● ACTIVE", style_test: "TEST PANEL",
  style_new: "+ Write your own style", style_name: "STYLE NAME", style_desc: "DESCRIBE THE STYLE",
  style_desc_h: "Colour, line, light, mood — the more you describe, the more consistent it draws.",
  style_save: "Save style", style_saved: "Style saved and selected", style_active: "Active style:",
  style_note: "Panels are drawn as SVG for now — the same style description carries over to a real image model.",
  conv_t: "Novel → Webtoon", conv_d: "Paste prose. We'll cut it into panels and open the editor.",
  conv_ph: "The lantern trembled in Jin's palm. The street was empty but the smell of debt was everywhere…",
  conv_btn: "Cut into panels", conv_busy: "Building panels…", conv_err: "Couldn't convert. Try again.", conv_short: "Need a bit more text.",
  ed_t: "PANEL EDITOR", ed_add: "+ Add panel", ed_saved: "Saved to chapter", ed_sel: "SELECTED",
  ed_text: "Text", ed_wide: "WIDTH", ed_size: "SIZE", ed_hint: "drag to place",
  el_bubble: "Bubble", el_thought: "Thought", el_narr: "Caption", el_sfx: "SFX",
  ed_nonote: "This panel has no scene description", ed_nodraw: "Couldn't draw", drawing_u: "DRAWING…",
  results: "RESULTS", filter: "FILTER", sort: "SORT", f_hascanon: "Has canon", f_nobranch: "Untouched", f_mine: "I have a branch",
  s_score: "Score", s_branches: "Branches", s_chapters: "Chapters",
  not_found: "Nothing found. If the series isn't here, add it from Discover — StoryLoom will build its memory.",
});
Object.assign(STR.tr, {
  prof_canon_k: "⛩ CANON", prof_canon_t: "Topluluğun seçtiği dallar", sealed_w: "⛩ MÜHÜRLÜ", support: "destek",
  canon_prize: "Canon ödülü (toplam)", weekly_cut: "Haftalık gelir payı",
  canon_note: "Canon dalların okundukça pay almaya devam eder. \"⛩ Canon Yazarı\" unvanı açıldı.",
  author_k: "YAZAR PUANI", author_t: "Dallarının ortalaması", branches_w: "dal", reader_scores: "okur puanı",
  rated_n: "dal okur puanı aldı", no_reader_scores: "henüz okur puanı yok, AI puanı geçerli",
  custom_k: "ÖZELLEŞTİR", custom_t: "Görünüm", accent_l: "VURGU RENGİ", frame_l: "ÇERÇEVE", title_l: "UNVAN",
  f_none: "Yok", f_ink: "Mürekkep", f_gold: "Altın", f_hanko: "Hanko",
  plans_k: "ÜYELİK", plans_t: "Planlar", current: "Mevcut", upgrade: "Geç",
  wallet_k: "COIN", wallet_t: "Kese", wallet_d: "Görevlerden kazan veya satın al", buy_coins: "Coin al", shop_soon: "Mağaza yakında",
  lib_k: "KİTAPLIK", lib_t: "Dallarım", lib_none: "Henüz dal açmadın. Bir seriye gir, \"Devam ettir\" de.",
  data_k: "VERİ", data_t: "Kayıt", data_d: "Serilerin, dalların, hafızan ve coinlerin bu cihazda saklanıyor. Sekmeyi kapatsan da duruyor.",
  wipe: "Her şeyi sıfırla", wiped: "Her şey sıfırlandı",
  lang_k: "DİL", lang_t: "Arayüz dili",
  add_t: "Seri ekle", add_d: "Yarım kalan seriyi anlat. StoryLoom karakterleri, dünya kurallarını ve açık iplikleri çıkarıp hafızasına kursun.",
  add_name: "SERİNİN ADI", add_type: "TÜR", add_where: "NEREDE KALDI", add_where_h: "SON BÖLÜM · YIL",
  add_tell: "HİKÂYEYİ ANLAT", add_tell_h: "Ne kadar yazarsan hafıza o kadar iyi kurulur. Karakterler, kurallar, çözülmemiş sorular.",
  add_tell_ph: "Jin adında bir çocuk fener taşıyıcısı olur, ölülerin borcunu toplar. Ustası Bora 62. bölümde ihanet eder ve sebebi hiç açıklanmaz. Jin'in annesi kayıp…",
  add_btn: "Hafızayı kur · ücretsiz", add_busy: "Seri okunuyor, hafıza kuruluyor…", add_err: "Hafıza kurulamadı. Tekrar dene.",
  add_need: "Başlık ve birkaç cümle gerek.", add_ok: "Seri eklendi, hafıza kuruldu.",
  ob_kick: "3.412 SERİ TERK EDİLDİ", ob_h1: "Sevdiğin seri", ob_h2: "yarım mı kaldı?",
  ob_sub: "StoryLoom seriyi okur. Karakterleri, dünya kurallarını, çözülmemiş sırları ezberler. Sonra",
  ob_sub_hi: "senin istediğin gibi devam ettirir.",
  ob_f1: "Kaldığı yerden devam et", ob_f1d: "84. bölümde bitti mi? 85'i sen yaz.",
  ob_f2: "Beğenmediğin yeri değiştir", ob_f2d: "62. bölümdeki ihanet saçmaydı — geri sar, yeniden dokut.",
  ob_f3: "Topluluk canon'u seçsin", ob_f3d: "En iyi dal mühür alır. Yazan ödül kazanır.",
  ob_start: "Başla", ob_taste: "Ne okursun?", ob_taste_d: "Sana ne önereceğimizi bilelim. İstediğin kadar seç.",
  ob_taste_n: "tür seçildi. Keşfet buna göre şekillenecek.", ob_skip: "Şimdilik geç",
  ob_first: "İlk hamlen", ob_coins: "Hesabına 500 coin yatırdık. Bir bölüm üretmeye yeter.",
  ob_add: "Kendi serimi ekle", ob_add_d: "Yarım kalan seriyi anlat. Aklında bir seri varsa buradan başla.",
  ob_recommended: "ÖNERİLEN →", ob_look: "Önce etrafa bakayım",
  ob_look_d: "Hazır serilerle gez. \"Kanlı Fener\" iyi bir başlangıç — hafızası dolu, 3 dalı var.",
  welcome_coins: "+500 hoş geldin coini",
  notifs_t: "Bildirimler", notifs_none: "Sessiz. Bir dal takip et, bölüm yayımla — burası dolar.", clear: "Temizle",
  poster_t: "Poster üretici", poster_d: "Paylaşılacak dikey görsel. Stil:", poster_series: "SERİ", poster_line: "SLOGAN",
  poster_line_h: "Boş bırakırsan AI slogan yazar.", poster_make: "Poster üret", poster_again: "Yeniden üret",
  poster_busy: "Poster dokunuyor…", poster_dl: "SVG olarak indir", poster_dl_ok: "Poster indirildi",
  poster_dl_err: "İndirilemedi — ekran görüntüsü alabilirsin", poster_foot: "STORYLOOM · DEVAMI SENDE",
  style_t: "Stil kütüphanesi", style_d: "Seçtiğin stil, çizilen tüm panellere uygulanır. Kendi stilini de yazabilirsin.",
  styles_l: "STİLLER", style_try: "dene", style_mine: "SENİN", style_sel: "● SEÇİLİ", style_test: "DENEME PANELİ",
  style_new: "+ Kendi stilini yaz", style_name: "STİL ADI", style_desc: "STİLİ TARİF ET",
  style_desc_h: "Renk, çizgi, ışık, atmosfer — ne kadar tarif edersen o kadar tutarlı çizer.",
  style_save: "Stili kaydet", style_saved: "Stil kaydedildi ve seçildi", style_active: "Aktif stil:",
  style_note: "Panel çizimleri şu an SVG olarak üretiliyor — aynı stil tarifi gerçek çizim modeline de gider.",
  conv_t: "Novel → Webtoon", conv_d: "Düzyazıyı yapıştır. Panellere bölüp editöre açalım.",
  conv_ph: "Fener, Jin'in avucunda titredi. Sokak boştu ama borç kokusu her yerdeydi…",
  conv_btn: "Panellere böl", conv_busy: "Paneller kuruluyor…", conv_err: "Dönüştürülemedi. Tekrar dene.", conv_short: "Biraz daha metin gerek.",
  ed_t: "PANEL EDİTÖRÜ", ed_add: "+ Panel ekle", ed_saved: "Bölüme kaydedildi", ed_sel: "SEÇİLİ",
  ed_text: "Metin", ed_wide: "GENİŞ", ed_size: "PUNTO", ed_hint: "sürükleyerek yerleştir",
  el_bubble: "Balon", el_thought: "Düşünce", el_narr: "Anlatı", el_sfx: "Efekt",
  ed_nonote: "Bu panelde sahne tarifi yok", ed_nodraw: "Çizilemedi", drawing_u: "ÇİZİLİYOR…",
  results: "SONUÇ", filter: "FİLTRE", sort: "SIRALA", f_hascanon: "Canon'u var", f_nobranch: "Dalsız", f_mine: "Benim dalım var",
  s_score: "Puan", s_branches: "Dal", s_chapters: "Bölüm",
  not_found: "Bulunamadı. Aradığın seri yoksa Keşfet'ten ekleyebilirsin — StoryLoom hafızasını kurar.",
});

const I18n = createContext({ t: (k) => k, lang: "en" });
const useT = () => useContext(I18n);

/* ---------------- data ---------------- */
const uid = () => Math.random().toString(36).slice(2, 9);

const SEED = [
  {
    id: "s1", title: "Blood Lantern", type: "Manhwa", year: 2019, chapters: 84,
    hue: 268, tags: ["Action", "Supernatural"], followers: "12.4k", reason: "Studio shut down",
    synopsis: "Lantern bearers collect the debts of the dead. When Jin couldn't pay his, the lantern chose him.",
    lore: {
      chars: [
        { id: "c1", n: "Jin Haru", r: "Protagonist", d: "The 17th lantern bearer. Feels no pain — that's why the lantern picked him.", src: "canon" },
        { id: "c2", n: "Master Bora", r: "Mentor", d: "A former bearer. His left hand is made of ink. Betrayed Jin in chapter 62.", src: "canon" },
        { id: "c3", n: "Nara", r: "Rival", d: "Daughter of the Lantern Council. She owes Jin a debt.", src: "canon" },
      ],
      rules: [
        { id: "r1", t: "A lantern only burns near an unpaid debt.", src: "canon" },
        { id: "r2", t: "If a bearer forgives a debt, one year is taken from their life.", src: "canon" },
        { id: "r3", t: "The Council has 9 members; 3 died in chapter 60.", src: "canon" },
      ],
      threads: [
        { id: "t1", t: "Bora's reason for betraying Jin was never revealed", open: true },
        { id: "t2", t: "Jin's mother is still missing", open: true },
        { id: "t3", t: "Who holds the 10th lantern?", open: true },
      ],
      log: [{ id: "l0", t: "84 chapters ingested, memory core built.", src: "canon", when: "start" }],
    },
    branches: [
      {
        id: "b1", by: "@inkspirit", title: "Bora's Debt", ch: 12, fid: 94, votes: 2140,
        aiAxes: { fid: 96, char: 92, pace: 78, dial: 85, orig: 71 }, canonYes: 1840, canonNo: 300,
        reviews: [
          { id: "rv1", by: "@nairo", axes: { fid: 5, char: 5, pace: 3, dial: 4, orig: 3 }, likes: 34, replies: [{ id: "rp1", by: "@inkspirit", author: true, t: "The sag is on me — ch. 9 needed cutting.", when: "2 days ago" }], t: "Bora's motive finally lands. Sags a bit in the middle, but I read the final panel twice.", when: "3 days ago" },
          { id: "rv2", by: "@selin", axes: { fid: 5, char: 4, pace: 4, dial: 5, orig: 3 }, likes: 12, replies: [], t: "The dialogue is indistinguishable from the original. No surprises — but that wasn't what I wanted anyway.", when: "1 week ago" },
        ],
      },
      {
        id: "b2", by: "Guild: Nightweave", title: "Fall of the Council", ch: 7, fid: 88, votes: 1310,
        aiAxes: { fid: 88, char: 84, pace: 90, dial: 79, orig: 86 }, canonYes: 810, canonNo: 500,
        reviews: [{ id: "rv3", by: "@kenan", axes: { fid: 4, char: 4, pace: 5, dial: 4, orig: 5 }, likes: 21, replies: [], t: "A pacing monster. And they kept the 9-member Council rule intact.", when: "5 days ago" }],
      },
      {
        id: "b3", by: "@nairo", title: "The Lanternless Road", ch: 3, fid: 61, votes: 402,
        aiAxes: { fid: 61, char: 70, pace: 66, dial: 62, orig: 94 }, canonYes: 120, canonNo: 282,
        reviews: [{ id: "rv4", by: "@zeyno", axes: { fid: 2, char: 3, pace: 3, dial: 3, orig: 5 }, likes: 8, replies: [], t: "Stripping Jin of the lantern is bold, but now I'm reading a different story.", when: "2 days ago" }],
      },
    ],
  },
  {
    id: "s2", title: "The Silent Gardener", type: "Novel", year: 2021, chapters: 210,
    hue: 160, tags: ["Fantasy", "Political"], followers: "8.1k", reason: "Author quit",
    synopsis: "Every garden in the empire holds a memory. The gardener knows them all, and says nothing.",
    lore: {
      chars: [{ id: "c4", n: "Elian", r: "Gardener", d: "Never speaks. Trades memories with plants.", src: "canon" }],
      rules: [{ id: "r4", t: "A memory trade cannot be undone.", src: "canon" }],
      threads: [{ id: "t4", t: "Why did the queen's garden wither?", open: true }],
      log: [{ id: "l1", t: "210 chapters ingested, memory core built.", src: "canon", when: "start" }],
    },
    branches: [{
      id: "b4", by: "@quietquill", title: "The Withered Throne", ch: 21, fid: 90, votes: 3020,
      aiAxes: { fid: 93, char: 89, pace: 72, dial: 88, orig: 80 }, reviews: [], canonYes: 2600, canonNo: 420,
    }],
  },
  {
    id: "s3", title: "Concrete Gods", type: "Webtoon", year: 2020, chapters: 47,
    hue: 20, tags: ["Dystopia"], followers: "5.7k", reason: "Low revenue",
    synopsis: "The city is alive, and it collects rent in souls.",
    lore: {
      chars: [{ id: "c5", n: "Dara", r: "Collector", d: "Collects the city's soul-rent. Forgot her own debt.", src: "canon" }],
      rules: [{ id: "r5", t: "The city goes hungry once every 40 years.", src: "canon" }],
      threads: [{ id: "t5", t: "Is Dara's brother behind on rent?", open: true }],
      log: [{ id: "l2", t: "47 chapters ingested, memory core built.", src: "canon", when: "start" }],
    },
    branches: [],
  },
];

/* Quest payouts are deliberately small. Daily quests count against the daily
   cap; weekly/monthly are naturally bounded so they bypass it (big: true).
   Free-user ceiling ≈ 2,500 coins/month ≈ 50 quick chapters. */
const QUESTS = {
  daily: [
    { id: "d1", en: "Read 3 chapters", tr: "3 bölüm oku", p: 2, g: 3, c: 10 },
    { id: "d2", en: "Rate a branch", tr: "Bir dala oy ver", p: 1, g: 1, c: 10, done: true },
    { id: "d3", en: "Generate a chapter", tr: "Bir bölüm üret", p: 0, g: 1, c: 20 },
  ],
  weekly: [
    { id: "w1", en: "Log in 5 days straight", tr: "5 gün üst üste gir", p: 3, g: 5, c: 60, big: true },
    { id: "w2", en: "Join a guild quest", tr: "Klan görevine katıl", p: 1, g: 2, c: 50, big: true },
  ],
  monthly: [
    { id: "m1", en: "Take a branch to 10 chapters", tr: "Bir dalı 10 bölüme taşı", p: 4, g: 10, c: 300, big: true },
    { id: "m2", en: "Hire or get hired on the Market", tr: "Marketten iş ver veya al", p: 0, g: 1, c: 200, big: true },
  ],
};

const ROLES = {
  en: ["Artist", "Colorist", "Writer", "Editor", "Letterer"],
  tr: ["Çizer", "Renklendirici", "Yazar", "Editör", "Letterer"],
};
const SEED_CREATORS = [
  { id: "cr1", n: "Selin Aydın", role: 0, s: { en: "Manhwa lineart", tr: "Manhwa lineart" }, p: 1200, r: 4.9, jobs: 84, hue: 300 },
  { id: "cr2", n: "Mert Kaya", role: 1, s: { en: "Webtoon flats + shading", tr: "Webtoon flat + gölge" }, p: 450, r: 4.7, jobs: 210, hue: 200 },
  { id: "cr3", n: "Ada Yılmaz", role: 2, s: { en: "Chapter scripts", tr: "Bölüm senaryosu" }, p: 800, r: 5.0, jobs: 41, hue: 40 },
  { id: "cr4", n: "Kenan Ok", role: 3, s: { en: "Continuity / lore check", tr: "Tutarlılık / lore kontrol" }, p: 300, r: 4.8, jobs: 152, hue: 120 },
  { id: "cr5", n: "Zeyno", role: 4, s: { en: "Bubbles + SFX", tr: "Balon + efekt" }, p: 250, r: 4.6, jobs: 320, hue: 340 },
];

const SEED_GUILDS = [
  {
    id: "g1", n: "Nightweave", tag: "NW", hue: 268, lv: 7, members: 42, pool: 12400, proj: null,
    quest: { en: "Publish 20 chapters as a guild", tr: "Klanca 20 bölüm üret", p: 14, g: 20, c: 2000 },
    log: [{ id: "gl1", t: "@nairo published chapter 8", when: "2 days ago" }, { id: "gl2", t: "@selin donated 600 coins", when: "4 days ago" }],
  },
  {
    id: "g2", n: "Broken Quill", tag: "BQ", hue: 160, lv: 4, members: 18, pool: 4100, proj: null,
    quest: { en: "Publish 10 chapters as a guild", tr: "Klanca 10 bölüm üret", p: 3, g: 10, c: 900 },
    log: [{ id: "gl3", t: "@quietquill founded the guild", when: "3 weeks ago" }],
  },
  {
    id: "g3", n: "Last Panel", tag: "LP", hue: 20, lv: 9, members: 91, pool: 31200, proj: null,
    quest: { en: "Publish 30 chapters as a guild", tr: "Klanca 30 bölüm üret", p: 27, g: 30, c: 3500 },
    log: [{ id: "gl4", t: "3 branches running at once", when: "1 day ago" }],
  },
];

const TIERS = [
  { n: { en: "Reader", tr: "Okur" }, p: { en: "Free", tr: "Ücretsiz" }, c: T.muted,
    f: { en: ["1 generation/day", "Quick mode only", "Guild membership"], tr: ["Günlük 1 üretim", "Sadece hızlı mod", "Klan üyeliği"] } },
  { n: { en: "Scribe", tr: "Kâtip" }, p: { en: "$4.99/mo", tr: "₺79/ay" }, c: T.violet,
    f: { en: ["15 generations/day", "Advanced mode", "Ad-free"], tr: ["Günlük 15 üretim", "Gelişmiş mod", "Reklamsız"] } },
  { n: { en: "Author", tr: "Yazar" }, p: { en: "$11.99/mo", tr: "₺189/ay" }, c: T.gold,
    f: { en: ["Unlimited generation", "Panel editor", "Talk to characters", "Style library"], tr: ["Sınırsız üretim", "Panel editörü", "Karakterle konuş", "Stil kütüphanesi"] } },
  { n: { en: "Ink Lord", tr: "Mürekkep Lordu" }, p: { en: "$28.99/mo", tr: "₺449/ay" }, c: T.hanko,
    f: { en: ["Priority queue", "Private guild space", "Commercial licence", "Revenue share"], tr: ["Öncelikli kuyruk", "Özel klan alanı", "Ticari lisans", "Gelir paylaşımı"] } },
];

const STYLES = [
  { id: "noir", n: { en: "Ink Noir", tr: "Mürekkep Noir" }, d: { en: "Harsh black & white", tr: "Sert siyah-beyaz" }, p: "high-contrast black and white ink drawing, heavy contours, hard shadows, hatching texture, single red accent" },
  { id: "pastel", n: { en: "Pastel Webtoon", tr: "Pastel Webtoon" }, d: { en: "Soft, warm", tr: "Yumuşak, sıcak" }, p: "soft pastel palette, thin clean contour, flat colour fields, warm soft light, calm webtoon aesthetic" },
  { id: "manhwa", n: { en: "Hard Manhwa", tr: "Sert Manhwa" }, d: { en: "Cinematic, dark", tr: "Sinematik, karanlık" }, p: "deep saturated tones, dramatic side lighting, sharp diagonal framing, cinematic depth, purple-black palette" },
  { id: "water", n: { en: "Watercolour", tr: "Suluboya" }, d: { en: "Fluid, loose", tr: "Akışkan, gevşek" }, p: "watercolour washes, soft colour bleeds, loose irregular contour, paper texture" },
];

const CANON_PCT = 70, CANON_MIN = 100, CANON_PRIZE = 1000, FEE = 0.12;

/* ---- ECONOMY ----
   Peg: 100 coins ≈ $1.00 retail. Every sink is priced above its true AI cost
   at the WORST effective coin value (Ink Lord: $0.0019/coin), so no action
   can ever lose money. See ekonomi.md for the full model. */
const P = {
  chapter: 50,      // quick generate (text only)
  advBase: 100,     // advanced base, scales with params, caps at 400
  panel: 5,         // draw one panel
  chat: 5,          // one message to a character
  portrait: 10,     // character portrait
  poster: 40,       // poster (text + key art)
  convert: 30,      // novel -> webtoon
  styleTest: 5,     // style library test render
  addSeries: 0,     // free on purpose: this is acquisition
};
/* Faucets. Hard daily cap so no one can farm coins forever. */
const EARN = { rate: 10, vote: 5, cap: 40 };
const today = () => new Date().toDateString();

const cover = (hue, h = 150) => ({
  background: `linear-gradient(150deg, hsl(${hue} 55% 22%), hsl(${hue + 40} 60% 10%))`, height: h,
});

/* ---------------- API ----------------
   Story text goes through the existing netlify/functions/ai.js proxy, which holds the
   real Anthropic API key server-side. The browser never sees the key. */
/* Reads a plain-text stream from netlify/functions/ai.mjs into a single string.
   Streaming (instead of one big blocking response) is what lets long generations
   (a full novel chapter) finish without the platform treating the request as hung. */
async function readAiStream(res) {
  if (!res.ok) throw new Error("ai function failed");
  if (!res.body) return await res.text();
  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let text = "";
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    text += decoder.decode(value, { stream: true });
  }
  return text;
}

async function ask(prompt) {
  const res = await fetch("/.netlify/functions/ai", {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages: [{ role: "user", content: prompt }] }),
  });
  return readAiStream(res);
}

/* Reads 1-3 uploaded reference images from an abandoned series' original art and turns them
   into a reusable text style-fingerprint, so every future panel keeps the same look. */
async function analyzeStyle(imageDataUrls) {
  const content = [
    ...imageDataUrls.map((durl) => {
      const m = durl.match(/^data:([^;]+);base64,(.+)$/);
      return { type: "image", source: { type: "base64", media_type: (m && m[1]) || "image/jpeg", data: (m && m[2]) || "" } };
    }),
    {
      type: "text",
      text: `You are analyzing reference art from a manga/manhwa/webtoon series so another AI illustrator can continue it in the exact same visual style.
Describe, in one dense paragraph (120-180 words), the precise visual style: line weight and inking, color palette and saturation, shading/screentone technique, panel framing conventions, character proportions, typical lighting, and overall mood. Write it as a direct instruction for an image-generation prompt (e.g. "clean thin black linework, muted pastel palette, soft cel-shading..."). Do not mention specific character names or scene content. Output only the style description, no preamble, no markdown.`,
    },
  ];
  const res = await fetch("/.netlify/functions/ai", {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages: [{ role: "user", content }] }),
  });
  return (await readAiStream(res)).trim();
}

/* Merges a series' learned style-fingerprint (from uploaded original art) into whatever
   generic art style is currently selected, so panels for THIS series stay on-model. */
function mergedStyle(s, style) {
  if (!s?.styleDescription) return style;
  return { ...style, p: `${s.styleDescription} ${style.p}` };
}
const asJSON = (t) => JSON.parse(t.replace(/```json|```/g, "").trim());
const langLine = (lang) => (lang === "tr" ? "Türkçe yaz." : "Write in English.");

/* ---------------- art rendering (supports both legacy SVG strings and real image URLs) ---------------- */
const isSvgArt = (a) => typeof a === "string" && a.trim().startsWith("<svg");
function ArtLayer({ art }) {
  if (!art) return null;
  if (isSvgArt(art)) return <div style={{ position: "absolute", inset: 0 }} dangerouslySetInnerHTML={{ __html: art }} />;
  return <img src={art} alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />;
}

/* Renders one scene: real webtoon/manga panels (edge-to-edge art, bubbles, tiny optional caption)
   for Manga/Manhwa/Webtoon series, or a classic illustrated-novel block (art + prose) for Novel series. */
function PanelBlock({ s, p, i, drawing, h }) {
  const isComic = s.type !== "Novel";
  const bubbles = p.bubbles || ((p.line || p.replik) ? [{ speaker: "", type: "speech", text: p.line || p.replik, pos: "bc" }] : []);
  const caption = (p.text || p.metin || "").trim();
  return (
    <div className={isComic ? "mb-1" : "mb-5"}>
      <Art svg={p.art} hue={s.hue + i * 20} h={h} note={p.panel} rounded={!isComic}>
        {drawing === i && (
          <div className="pulse" style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", background: "rgba(0,0,0,.55)", zIndex: 4 }}>
            <span className="mono" style={{ fontSize: 10, color: T.gold }}>…</span>
          </div>
        )}
        {isComic && caption && (
          <div style={{ position: "absolute", top: 10, left: 10, right: 10, background: "rgba(10,7,17,.82)", color: "#fff", fontSize: 11, fontWeight: 600, padding: "7px 10px", borderRadius: 6, lineHeight: 1.4, zIndex: 2 }}>{caption}</div>
        )}
        {bubbles.map((b, bi) => <Bubble key={bi} b={b} />)}
      </Art>
      {!isComic && caption && <p style={{ fontSize: 14, lineHeight: 1.65, marginTop: 8 }}>{caption}</p>}
    </div>
  );
}

/* ---------------- webtoon/manga bubbles: speech, thought, shout, sfx — overlaid on the panel art ---------------- */
const BUBBLE_POS = {
  tl: { top: 10, left: 10 }, tr: { top: 10, right: 10 },
  bl: { bottom: 10, left: 10 }, br: { bottom: 10, right: 10 },
  tc: { top: 10, left: "50%", transform: "translateX(-50%)" },
  bc: { bottom: 10, left: "50%", transform: "translateX(-50%)" },
  c: { top: "50%", left: "50%", transform: "translate(-50%,-50%)" },
};
function Bubble({ b }) {
  const pos = BUBBLE_POS[b.pos] || BUBBLE_POS.bc;
  const tailSide = (b.pos || "bc").includes("l") ? "left" : (b.pos || "bc").includes("r") ? "right" : "center";

  if (b.type === "sfx") {
    return (
      <div style={{
        position: "absolute", ...pos, maxWidth: "80%", zIndex: 3,
        fontFamily: "sans-serif", fontWeight: 900, fontSize: 26, fontStyle: "italic",
        letterSpacing: "0.02em", color: T.gold, transform: `${pos.transform || ""} rotate(-6deg)`.trim(),
        textShadow: "-2px -2px 0 #000,2px -2px 0 #000,-2px 2px 0 #000,2px 2px 0 #000,0 0 14px rgba(0,0,0,.5)",
        pointerEvents: "none", textAlign: "center",
      }}>{b.text}</div>
    );
  }

  const isThought = b.type === "thought";
  const isShout = b.type === "shout";

  return (
    <div style={{ position: "absolute", ...pos, maxWidth: "68%", zIndex: 3, textAlign: "center" }}>
      {b.speaker && (
        <div className="mono" style={{ fontSize: 8, color: T.gold, marginBottom: 3, letterSpacing: ".08em", fontWeight: 800 }}>{b.speaker.toUpperCase()}</div>
      )}
      <div style={{
        position: "relative",
        background: isShout ? T.gold : "#fff",
        color: "#111",
        fontWeight: isShout ? 900 : 700,
        fontStyle: isThought ? "italic" : "normal",
        fontSize: isShout ? 13 : 12,
        textTransform: isShout ? "uppercase" : "none",
        padding: "8px 13px",
        borderRadius: isThought ? 20 : isShout ? 4 : 14,
        border: isThought ? "2px dashed rgba(0,0,0,.35)" : isShout ? "2px solid #111" : "none",
        boxShadow: "0 3px 10px rgba(0,0,0,.35)",
        lineHeight: 1.35,
      }}>
        {b.text}
        {!isThought && (
          <div style={{
            position: "absolute", bottom: -7,
            left: tailSide === "left" ? 16 : tailSide === "right" ? undefined : "50%",
            right: tailSide === "right" ? 16 : undefined,
            transform: tailSide === "center" ? "translateX(-50%) rotate(45deg)" : "rotate(45deg)",
            width: 12, height: 12,
            background: isShout ? T.gold : "#fff",
            borderRight: isShout ? "2px solid #111" : "none",
            borderBottom: isShout ? "2px solid #111" : "none",
          }} />
        )}
        {isThought && (
          <>
            <div style={{ position: "absolute", bottom: -12, left: tailSide === "left" ? 20 : tailSide === "right" ? undefined : "50%", right: tailSide === "right" ? 20 : undefined, width: 9, height: 9, borderRadius: 99, background: "#fff", border: "2px dashed rgba(0,0,0,.35)" }} />
            <div style={{ position: "absolute", bottom: -20, left: tailSide === "left" ? 12 : tailSide === "right" ? undefined : "50%", right: tailSide === "right" ? 12 : undefined, width: 5, height: 5, borderRadius: 99, background: "#fff", border: "2px dashed rgba(0,0,0,.35)" }} />
          </>
        )}
      </div>
    </div>
  );
}

/* ---------------- real image generation (Replicate, via serverless proxy) ----------------
   refImageUrl: if provided, uses PuLID face-reference to keep the SAME character consistent
   across every panel it appears in. If omitted, generates a fresh (non-referenced) image —
   used the very first time a character is drawn, which then BECOMES their reference. */
async function pollPrediction(id) {
  for (let i = 0; i < 40; i++) {
    await new Promise((r) => setTimeout(r, 1500));
    const statusRes = await fetch(`/.netlify/functions/cizim-durum?id=${encodeURIComponent(id)}`);
    if (!statusRes.ok) continue;
    const s = await statusRes.json();
    if (s.status === "succeeded" && s.url) return s.url;
    if (s.status === "failed" || s.status === "canceled") return null;
  }
  return null;
}

/* styleRefImage: an uploaded original-art image for this series (see Memory tab). When present,
   the freshly drawn panel is passed through a second style-transfer pass so it genuinely matches
   that reference's look, not just a text description of it. */
async function drawPanel(desc, style, refImageUrl = null, styleRefImage = null) {
  try {
    // Step 1: start the base generation — returns immediately with a prediction id.
    const startRes = await fetch("/.netlify/functions/cizim", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ panel: desc, stil: style.p, refImage: refImageUrl || undefined }),
    });
    if (!startRes.ok) return null;
    const started = await startRes.json();
    if (!started.id) return null;

    const baseUrl = await pollPrediction(started.id);
    if (!baseUrl) return null;
    if (!styleRefImage) return baseUrl;

    // Step 2 (optional): restyle the base panel to match the uploaded reference art.
    const restyleRes = await fetch("/.netlify/functions/restyle", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ baseImageUrl: baseUrl, styleRefImage, prompt: `${desc}. ${style.p}` }),
    });
    if (!restyleRes.ok) return baseUrl; // fall back to the un-restyled panel rather than nothing
    const restyled = await restyleRes.json();
    if (!restyled.id) return baseUrl;
    const finalUrl = await pollPrediction(restyled.id);
    return finalUrl || baseUrl;
  } catch {
    return null;
  }
}

/* Finds a character in this series whose name appears in the scene text, and who already
   has a generated reference image — so new panels reuse their exact face/identity. */
function findRefForScene(s, desc) {
  if (!s?.lore?.chars || !desc) return null;
  const text = desc.toLowerCase();
  const match = s.lore.chars.find((c) => c.art && !isSvgArt(c.art) && text.includes(c.n.toLowerCase()));
  return match ? match.art : null;
}

/* ---------------- storage ---------------- */
const KEY = "storyloom:save";
async function loadSave() {
  try { const r = await window.storage.get(KEY); return r ? JSON.parse(r.value) : null; } catch { return null; }
}
async function writeSave(d) {
  try { await window.storage.set(KEY, JSON.stringify(d)); } catch (e) { console.error("save failed", e); }
}
async function wipeSave() {
  try { await window.storage.delete(KEY); } catch (e) { console.error(e); }
}

/* ---------------- scoring ---------------- */
const AXES = [
  { k: "fid", l: "ax_fid", d: "ax_fid_d" },
  { k: "char", l: "ax_char", d: "ax_char_d" },
  { k: "pace", l: "ax_pace", d: "ax_pace_d" },
  { k: "dial", l: "ax_dial", d: "ax_dial_d" },
  { k: "orig", l: "ax_orig", d: "ax_orig_d" },
];
const aiOf = (b) => b.aiAxes || AXES.reduce((o, a) => (o[a.k] = b.fid || 80, o), {});
const humanOf = (b) => {
  const rs = b.reviews || [];
  if (!rs.length) return null;
  return AXES.reduce((o, a) => (o[a.k] = Math.round((rs.reduce((s, r) => s + r.axes[a.k], 0) / rs.length) * 20), o), {});
};
const scoreOf = (b) => {
  const ai = aiOf(b), h = humanOf(b), n = (b.reviews || []).length;
  const wH = Math.min(0.8, n / (n + 3));
  const o = {};
  AXES.forEach((a) => { o[a.k] = h ? Math.round(ai[a.k] * (1 - wH) + h[a.k] * wH) : ai[a.k]; });
  o.total = Math.round(AXES.reduce((s, a) => s + o[a.k], 0) / AXES.length);
  o.n = n; o.wH = wH;
  return o;
};
const avgOf = (x) => Math.round(AXES.reduce((s, a) => s + x[a.k], 0) / AXES.length);
const scoreColor = (v) => (v >= 85 ? T.violet : v >= 70 ? T.gold : T.hanko);
const canonOf = (b) => {
  const y = b.canonYes || 0, n = b.canonNo || 0, t = y + n;
  const pct = t ? Math.round((y / t) * 100) : 0;
  return { y, n, t, pct, sealed: t >= CANON_MIN && pct >= CANON_PCT };
};
const loreText = (s) =>
  `CHARACTERS:\n${s.lore.chars.map((c) => `- ${c.n} (${c.r}): ${c.d}`).join("\n")}\n` +
  `WORLD RULES:\n${s.lore.rules.map((r) => `- ${r.t}`).join("\n")}\n` +
  `OPEN THREADS:\n${s.lore.threads.filter((t) => t.open).map((t) => `- ${t.t}`).join("\n") || "- none"}`;

/* ---------------- primitives ---------------- */
const Coin = ({ n, size = 12 }) => (
  <span className="mono" style={{ color: T.gold, fontSize: size, fontWeight: 700 }}>◈ {(n || 0).toLocaleString("en-US")}</span>
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
function Slider({ v, set, a, b, accent, min = 0, max = 100 }) {
  return (
    <div>
      <input type="range" min={min} max={max} value={v} onChange={(e) => set(+e.target.value)} style={{ width: "100%", accentColor: accent }} />
      <div className="flex justify-between mono" style={{ fontSize: 9, color: T.muted, marginTop: 2 }}>
        <span>{a}</span><span style={{ color: accent }}>{v}</span><span>{b}</span>
      </div>
    </div>
  );
}
function TagAdd({ items, set, ph, accent, color }) {
  const { t } = useT();
  const [v, setV] = useState("");
  const c = color || accent;
  const add = () => { const x = v.trim(); if (!x) return; set([...items, x]); setV(""); };
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
        <button onClick={add} className="btn-ghost" style={{ width: "auto", padding: "0 16px", borderColor: c, color: c }}>+</button>
      </div>
    </div>
  );
}
function Sheet({ children, close }) {
  return (
    <div className="sheet-wrap" onClick={close}>
      <div className="sheet" onClick={(e) => e.stopPropagation()}>
        <div className="grab" />
        {children}
      </div>
    </div>
  );
}
function Art({ svg, hue, h, note, children, rounded = true }) {
  if (svg) return (
    <div className="relative overflow-hidden" style={{ height: h, borderRadius: rounded ? 10 : 0, background: "#000" }}>
      <ArtLayer art={svg} />
      {children}
    </div>
  );
  return (
    <div className="relative overflow-hidden" style={{ ...cover(hue, h), borderRadius: rounded ? 10 : 0, display: "grid", placeItems: "center", padding: 16 }}>
      {note && <span className="mono" style={{ fontSize: 10, color: "rgba(255,255,255,.4)", textAlign: "center", lineHeight: 1.6 }}>{note}</span>}
      {children}
    </div>
  );
}

/* ---------------- signature: the branch tree ---------------- */
function BranchTree({ s, onOpen, onFork, accent }) {
  const { t } = useT();
  return (
    <div className="relative pl-9 pt-1">
      <div className="spine" />
      <div className="flex gap-3 mb-4 relative">
        <div className="node" style={{ background: T.paper, marginLeft: -30 }} />
        <div style={{ marginLeft: -6 }}>
          <div style={{ fontWeight: 800, fontSize: 14 }}>{t("canon_line")}{s.chapters}</div>
          <div style={{ fontSize: 12, color: T.muted }}>{t("orig_team")} · {s.year}</div>
        </div>
      </div>
      <div className="flex gap-3 mb-5 relative">
        <div className="node" style={{ background: T.hanko, marginLeft: -30, boxShadow: `0 0 12px ${T.hanko}` }} />
        <div style={{ marginLeft: -6 }}>
          <span className="hanko">{t("dropped_stamp")}</span>
          <div style={{ fontSize: 12, color: T.muted, marginTop: 6 }}>{s.reason} · {s.year}</div>
        </div>
      </div>
      {s.branches.map((b) => {
        const sc = scoreOf(b), ai = aiOf(b), h = humanOf(b), cn = canonOf(b);
        return (
          <button key={b.id} onClick={() => onOpen(b)} className="card fade block w-full text-left relative"
            style={{ marginLeft: 14, marginBottom: 10, padding: 12, borderColor: b.mine ? accent : T.line }}>
            <div className="branch-arm" />
            <div className="flex justify-between items-start gap-2">
              <div style={{ minWidth: 0 }}>
                <div style={{ fontWeight: 800, fontSize: 14 }}>
                  {b.title}
                  {b.mine && <span className="pill" style={{ background: T.panel2, color: accent, fontSize: 9, marginLeft: 6 }}>{t("yours")}</span>}
                  {cn.sealed && <span className="pill" style={{ background: "rgba(240,180,41,.16)", color: T.gold, fontSize: 9, marginLeft: 6 }}>⛩ {t("canon_badge")}</span>}
                </div>
                <div style={{ fontSize: 11, color: T.muted, marginTop: 2 }}>
                  {b.by} · {b.ch} {t("chapters_w")}{b.from ? ` · ${t("branched_from")} ${b.from}` : ""}
                </div>
              </div>
              <div style={{ textAlign: "right", flexShrink: 0 }}>
                <div className="mono" style={{ fontSize: 18, fontWeight: 700, color: scoreColor(sc.total) }}>{sc.total}</div>
                <div className="mono" style={{ fontSize: 9, color: T.muted }}>{t("fidelity")}</div>
              </div>
            </div>
            <div className="flex gap-3 mt-2 mono" style={{ fontSize: 10, color: T.muted }}>
              <span>◆ {t("ai_s")} {avgOf(ai)}</span>
              <span style={{ color: h ? T.gold : T.muted }}>▲ {t("reader_s")} {h ? avgOf(h) : "—"} ({sc.n})</span>
              <span style={{ color: cn.sealed ? T.gold : T.muted }}>⛩ {cn.pct}% ({cn.t})</span>
            </div>
          </button>
        );
      })}
      <button onClick={onFork} className="flex gap-3 relative items-center" style={{ marginTop: 4 }}>
        <div className="node pulse" style={{ background: accent, marginLeft: -30 }} />
        <div style={{ fontSize: 12, color: accent, fontWeight: 700, marginLeft: -6 }}>{t("open_branch")}</div>
      </button>
    </div>
  );
}

/* ================= APP ================= */
export default function StoryLoom() {
  const [lang, setLang] = useState("en");
  const t = (k) => (STR[lang] && STR[lang][k]) || STR.en[k] || k;

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
  const [poster, setPoster] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [searching, setSearching] = useState(false);
  const [styles, setStyles] = useState(STYLES);
  const [styleId, setStyleId] = useState("manhwa");
  const [accent, setAccent] = useState(T.violet);
  const [follows, setFollows] = useState({});
  const [progress, setProgress] = useState({});
  const [guilds, setGuilds] = useState(SEED_GUILDS);
  const [myGuild, setMyGuild] = useState(null);
  const [creators, setCreators] = useState(SEED_CREATORS);
  const [jobs, setJobs] = useState([]);
  const [listing, setListing] = useState(null);
  const [taste, setTaste] = useState([]);
  const [onboard, setOnboard] = useState(false);
  const [notifs, setNotifs] = useState([
    { id: "n1", t: "@nairo rated \"Bora's Debt\" 78.", k: "score", when: "3 days ago" },
    { id: "n2", t: "\"The Withered Throne\" became community canon — 86% support.", k: "canon", when: "1 week ago" },
  ]);
  const [earned, setEarned] = useState({ d: today(), n: 0 });
  const [seen, setSeen] = useState(false);
  const [toast, setToast] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    (async () => {
      const d = await loadSave();
      if (d) {
        if (d.lang) setLang(d.lang);
        if (d.series) setSeries(d.series);
        if (typeof d.coins === "number") setCoins(d.coins);
        if (d.claimed) setClaimed(d.claimed);
        if (d.accent) setAccent(d.accent);
        if (d.styles) setStyles(d.styles);
        if (d.styleId) setStyleId(d.styleId);
        if (d.follows) setFollows(d.follows);
        if (d.progress) setProgress(d.progress);
        if (d.notifs) setNotifs(d.notifs);
        if (d.guilds) setGuilds(d.guilds);
        if (d.myGuild !== undefined) setMyGuild(d.myGuild);
        if (d.creators) setCreators(d.creators);
        if (d.jobs) setJobs(d.jobs);
        if (d.listing !== undefined) setListing(d.listing);
        if (d.taste) setTaste(d.taste);
        if (d.earned) setEarned(d.earned.d === today() ? d.earned : { d: today(), n: 0 });
        if (!d.onboarded) setOnboard(true);
      } else setOnboard(true);
      setReady(true);
    })();
  }, []);

  useEffect(() => {
    if (!ready) return;
    writeSave({ lang, series, coins, claimed, accent, styles, styleId, follows, progress, notifs,
      guilds, myGuild, creators, jobs, listing, taste, earned, onboarded: !onboard });
  }, [lang, series, coins, claimed, accent, styles, styleId, follows, progress, notifs,
    guilds, myGuild, creators, jobs, listing, taste, earned, onboard, ready]);

  const say = (m) => { setToast(m); setTimeout(() => setToast(null), 2400); };

  /* the only way coins enter the wallet — capped per day */
  const earn = (n, quest) => {
    const e = earned.d === today() ? earned : { d: today(), n: 0 };
    if (quest) { setCoins((c) => c + n); say(`+${n} ◈`); return n; }
    const room = Math.max(0, EARN.cap - e.n);
    if (room <= 0) { say(t("cap_hit")); return 0; }
    const got = Math.min(n, room);
    setEarned({ d: e.d, n: e.n + got });
    setCoins((c) => c + got);
    say(`+${got} ◈ · ${e.n + got}/${EARN.cap}`);
    return got;
  };
  /* the only way coins leave the wallet */
  const spend = (n) => {
    if (coins < n) { say(t("insufficient")); return false; }
    setCoins((c) => c - n);
    return true;
  };
  const push = (txt, k = "system") => {
    setNotifs((p) => [{ id: uid(), t: txt, k, when: lang === "tr" ? "az önce" : "just now" }, ...p].slice(0, 30));
    setSeen(false);
  };

  const s = series.find((x) => x.id === openId);
  const rSeries = reader && series.find((x) => x.id === reader.sid);
  const rBranch = rSeries && reader.bid ? rSeries.branches.find((b) => b.id === reader.bid) : null;
  const style = styles.find((x) => x.id === styleId) || styles[0];
  const guild = guilds.find((g) => g.id === myGuild) || null;
  const unread = seen ? 0 : notifs.length;

  const claim = (q) => {
    if (claimed[q.id] || q.p < q.g) return;
    setClaimed({ ...claimed, [q.id]: true });
    earn(q.c, !!q.big);
  };

  /* memory write-back */
  const commit = (sid, p) => setSeries((prev) => prev.map((x) => {
    if (x.id !== sid) return x;
    const chNo = x.chapters + 1, src = `ch.${chNo}`;
    const chars = [...x.lore.chars, ...(p.chars || []).map((c) => ({ id: uid(), n: c.split("—")[0].trim(), r: "Branch", d: (c.split("—")[1] || "").trim() || c, src }))];
    const rules = [...x.lore.rules, ...(p.rules || []).map((r) => ({ id: uid(), t: r, src }))];
    const threads = x.lore.threads.map((th) => (p.resolved || []).includes(th.t) ? { ...th, open: false, closedIn: chNo } : th);
    const w = lang === "tr" ? "az önce" : "just now";
    const log = [
      ...(p.note ? [{ id: uid(), t: p.note, src, when: w }] : []),
      ...(p.chars || []).map((c) => ({ id: uid(), t: `+ ${c}`, src, when: w })),
      ...(p.rules || []).map((r) => ({ id: uid(), t: `+ ${r}`, src, when: w })),
      ...(p.resolved || []).map((r) => ({ id: uid(), t: `✓ ${r}`, src, when: w })),
      ...x.lore.log,
    ];
    const branch = {
      id: uid(), by: "You", title: p.title, ch: 1, fid: p.fid, aiAxes: p.aiAxes, votes: 0,
      mine: true, from: p.from, reviews: [], canonYes: 0, canonNo: 0,
      chapters: [{ n: p.from || chNo, title: p.title, fid: p.fid, scenes: p.scenes || [], content: p.content || "" }],
    };
    return { ...x, branches: [branch, ...x.branches], lore: { chars, rules, threads, log } };
  }));

  const appendChapter = (sid, bid, p) => setSeries((prev) => prev.map((x) => {
    if (x.id !== sid) return x;
    const b0 = x.branches.find((b) => b.id === bid);
    const chNo = (b0.chapters?.[b0.chapters.length - 1]?.n || x.chapters) + 1, src = `ch.${chNo}`;
    const w = lang === "tr" ? "az önce" : "just now";
    const chars = [...x.lore.chars, ...(p.chars || []).map((c) => ({ id: uid(), n: c.split("—")[0].trim(), r: "Branch", d: (c.split("—")[1] || "").trim() || c, src }))];
    const rules = [...x.lore.rules, ...(p.rules || []).map((r) => ({ id: uid(), t: r, src }))];
    const threads = x.lore.threads.map((th) => (p.resolved || []).includes(th.t) ? { ...th, open: false, closedIn: chNo } : th);
    const log = [
      ...(p.note ? [{ id: uid(), t: p.note, src, when: w }] : []),
      ...(p.chars || []).map((c) => ({ id: uid(), t: `+ ${c}`, src, when: w })),
      ...(p.rules || []).map((r) => ({ id: uid(), t: `+ ${r}`, src, when: w })),
      ...(p.resolved || []).map((r) => ({ id: uid(), t: `✓ ${r}`, src, when: w })),
      ...x.lore.log,
    ];
    return {
      ...x,
      branches: x.branches.map((b) => b.id !== bid ? b : {
        ...b, ch: (b.chapters?.length || 0) + 1,
        chapters: [...(b.chapters || []), { n: chNo, title: p.title, fid: p.fid, scenes: p.scenes || [], content: p.content || "" }],
      }),
      lore: { chars, rules, threads, log },
    };
  }));

  const saveArt = (sid, bid, ci, si, svg) => setSeries((prev) => prev.map((x) => x.id !== sid ? x : {
    ...x, branches: x.branches.map((b) => b.id !== bid ? b : {
      ...b, chapters: b.chapters.map((c, i) => i !== ci ? c : {
        ...c, scenes: c.scenes.map((sc, j) => j !== si ? sc : { ...sc, art: svg }),
      }),
    }),
  }));
  const saveCharArt = (sid, cid, svg) => setSeries((prev) => prev.map((x) => x.id !== sid ? x : {
    ...x, lore: { ...x.lore, chars: x.lore.chars.map((c) => c.id === cid ? { ...c, art: svg } : c) },
  }));
  const saveStyleDesc = (sid, desc, refImageUrl) => setSeries((prev) => prev.map((x) => x.id !== sid ? x : { ...x, styleDescription: desc, styleRefImage: refImageUrl || x.styleRefImage }));

  const rate = (sid, bid, rv) => {
    setSeries((prev) => prev.map((x) => x.id !== sid ? x : {
      ...x, branches: x.branches.map((b) => b.id !== bid ? b : {
        ...b, votes: (b.votes || 0) + 1,
        reviews: [{ id: uid(), by: "You", mine: true, likes: 0, replies: [], when: lang === "tr" ? "az önce" : "just now", ...rv }, ...(b.reviews || [])],
      }),
    }));
    earn(EARN.rate);
  };
  const likeReview = (sid, bid, rid) => setSeries((prev) => prev.map((x) => x.id !== sid ? x : {
    ...x, branches: x.branches.map((b) => b.id !== bid ? b : {
      ...b, reviews: b.reviews.map((r) => r.id !== rid ? r : { ...r, likes: (r.likes || 0) + (r.liked ? -1 : 1), liked: !r.liked }),
    }),
  }));
  const replyReview = (sid, bid, rid, txt, isAuthor) => setSeries((prev) => prev.map((x) => x.id !== sid ? x : {
    ...x, branches: x.branches.map((b) => b.id !== bid ? b : {
      ...b, reviews: b.reviews.map((r) => r.id !== rid ? r : {
        ...r, replies: [...(r.replies || []), { id: uid(), by: "You", author: isAuthor, t: txt, when: lang === "tr" ? "az önce" : "just now" }],
      }),
    }),
  }));

  const voteCanon = (sid, bid, yes) => {
    setSeries((prev) => prev.map((x) => x.id !== sid ? x : {
      ...x, branches: x.branches.map((b) => {
        if (b.id !== bid) return b;
        const nb = { ...b, canonYes: (b.canonYes || 0) + (yes ? 1 : 0), canonNo: (b.canonNo || 0) + (yes ? 0 : 1), myCanonVote: yes };
        if (!canonOf(b).sealed && canonOf(nb).sealed) {
          push(`"${b.title}" — ⛩ ${canonOf(nb).pct}%`, "canon");
          if (b.mine) { setCoins((c) => c + CANON_PRIZE); push(`⛩ +${CANON_PRIZE} ◈`, "canon"); }
        }
        return nb;
      }),
    }));
    earn(EARN.vote);
  };

  /* guilds */
  const gLog = (gid, txt) => setGuilds((gs) => gs.map((g) => g.id !== gid ? g : {
    ...g, log: [{ id: uid(), t: txt, when: lang === "tr" ? "az önce" : "just now" }, ...g.log].slice(0, 20),
  }));
  const joinGuild = (gid) => {
    setMyGuild(gid);
    setGuilds((gs) => gs.map((g) => g.id !== gid ? g : { ...g, members: g.members + 1 }));
    gLog(gid, "You joined");
    say("✓");
  };
  const leaveGuild = () => {
    if (!guild) return;
    setGuilds((gs) => gs.map((g) => g.id !== guild.id ? g : { ...g, members: Math.max(0, g.members - 1) }));
    setMyGuild(null);
  };
  const createGuild = (n, tag) => {
    if (coins < 500) return say(t("insufficient"));
    const g = {
      id: uid(), n, tag: tag.toUpperCase().slice(0, 3), hue: Math.floor(Math.random() * 360), lv: 1, members: 1, pool: 0, proj: null,
      quest: { en: "Publish 5 chapters as a guild", tr: "Klanca 5 bölüm üret", p: 0, g: 5, c: 400 },
      log: [{ id: uid(), t: "You founded the guild", when: lang === "tr" ? "az önce" : "just now" }], mine: true,
    };
    setGuilds((gs) => [g, ...gs]); setMyGuild(g.id); setCoins((c) => c - 500);
  };
  const donate = (n) => {
    if (!guild || coins < n) return say(t("insufficient"));
    setCoins((c) => c - n);
    setGuilds((gs) => gs.map((g) => g.id !== guild.id ? g : { ...g, pool: g.pool + n }));
    gLog(guild.id, `You donated ${n} ◈`);
  };
  const spendGuild = (n) => setGuilds((gs) => gs.map((g) => g.id !== myGuild ? g : { ...g, pool: Math.max(0, g.pool - n) }));
  const setProject = (p) => {
    if (!guild) return;
    setGuilds((gs) => gs.map((g) => g.id !== guild.id ? g : { ...g, proj: p }));
    gLog(guild.id, `Project: ${p.title}`);
  };
  const guildProgress = (title) => {
    if (!guild) return;
    setGuilds((gs) => gs.map((g) => {
      if (g.id !== guild.id) return g;
      const p = Math.min(g.quest.g, g.quest.p + 1);
      const done = p >= g.quest.g && g.quest.p < g.quest.g;
      if (done) push(`${g.n}: +${g.quest.c} ◈`, "system");
      return {
        ...g, quest: { ...g.quest, p }, pool: done ? g.pool + g.quest.c : g.pool, lv: done ? g.lv + 1 : g.lv,
        log: [{ id: uid(), t: `You published "${title}"`, when: lang === "tr" ? "az önce" : "just now" }, ...g.log].slice(0, 20),
      };
    }));
  };

  /* market */
  const hire = (creator, brief, budget) => {
    const fee = Math.round(budget * FEE);
    if (coins < budget + fee) return say(t("insufficient"));
    setCoins((c) => c - budget - fee);
    const j = { id: uid(), cid: creator.id, cname: creator.n, hue: creator.hue, role: creator.role,
      brief, budget, fee, status: "open", when: lang === "tr" ? "az önce" : "just now" };
    setJobs((p) => [j, ...p]);
    push(`${creator.n}: ${t("j_open")}`, "job");
    return j.id;
  };
  const deliverJob = (jid, msg, art) => {
    setJobs((p) => p.map((j) => j.id !== jid ? j : { ...j, status: "delivered", msg, art }));
    push(`${jobs.find((j) => j.id === jid)?.cname}: ${t("j_delivered")}`, "job");
  };
  const approveJob = (jid) => {
    const j = jobs.find((x) => x.id === jid);
    setJobs((p) => p.map((x) => x.id !== jid ? x : { ...x, status: "done" }));
    setCreators((cs) => cs.map((c) => c.id !== j.cid ? c : { ...c, jobs: c.jobs + 1 }));
    say(t("released"));
  };
  const reviseJob = (jid, note) => {
    setJobs((p) => p.map((j) => j.id !== jid ? j : { ...j, status: "revision", revNote: note }));
    say(t("rev_sent"));
  };

  const reset = async () => {
    await wipeSave();
    setSeries(SEED); setCoins(1240); setClaimed({ d2: true }); setAccent(T.violet);
    setGuilds(SEED_GUILDS); setMyGuild(null); setJobs([]); setListing(null);
    setCreators(SEED_CREATORS); setFollows({}); setProgress({}); setStyles(STYLES);
    say(t("wiped"));
  };

  const go = (k) => { setOpenId(null); setReader(null); setEditor(null); setTab(k); window.scrollTo(0, 0); };

  const NAV = [["home", t("nav_home"), "◈"], ["quests", t("nav_quests"), "✦"], ["guilds", t("nav_guilds"), "⛨"],
    ["market", t("nav_market"), "⬗"], ["me", t("nav_me"), "◉"]];

  if (!ready) return (
    <div className="page" style={{ display: "grid", placeItems: "center", minHeight: "100vh" }}>
      <style>{CSS}</style>
      <div className="pulse mono" style={{ fontSize: 11, color: T.violet, letterSpacing: ".2em" }}>OPENING MEMORY…</div>
    </div>
  );

  const body = s ? <SeriesView s={s} back={() => setOpenId(null)} read={setReader} coins={coins} spend={spend}
    say={say} accent={accent} commit={commit} appendChapter={appendChapter} openEditor={setEditor}
    style={style} saveCharArt={saveCharArt} saveStyleDesc={saveStyleDesc} guild={guild} spendGuild={spendGuild} guildProgress={guildProgress} />
    : tab === "home" ? <Home go={go} series={series} open={setOpenId} claimed={claimed} accent={accent}
      openEditor={setEditor} openConv={() => setConv(true)} openAdd={() => setAdding(true)}
      openStyles={() => setStyleLib(true)} openPoster={() => setPoster(true)} openSearch={() => setSearching(true)}
      style={style} progress={progress} />
      : tab === "quests" ? <Quests claimed={claimed} claim={claim} accent={accent} />
        : tab === "guilds" ? <Guilds accent={accent} guilds={guilds} guild={guild} coins={coins} series={series}
          join={joinGuild} leave={leaveGuild} create={createGuild} donate={donate} setProject={setProject} say={say} />
          : tab === "market" ? <Market accent={accent} coins={coins} creators={creators} jobs={jobs} listing={listing}
            setListing={setListing} hire={hire} deliverJob={deliverJob} approveJob={approveJob} reviseJob={reviseJob}
            style={style} say={say} />
            : <Profile accent={accent} setAccent={setAccent} coins={coins} say={say} series={series} reset={reset}
              guild={guild} lang={lang} setLang={setLang} earned={earned.d === today() ? earned : { d: today(), n: 0 }} />;

  return (
    <I18n.Provider value={{ t, lang }}>
      <div className="page">
        <style>{CSS}</style>

        <header className="topbar">
          <div className="topbar-in">
            <button onClick={() => go("home")} className="flex items-center gap-2">
              <div style={{ width: 22, height: 22, borderRadius: 6, background: accent, display: "grid", placeItems: "center", fontSize: 12, fontWeight: 900, color: "#fff" }}>丿</div>
              <span className="disp" style={{ fontWeight: 900, fontSize: 15 }}>StoryLoom</span>
            </button>
            <div className="flex items-center gap-2">
              <div className="pill" style={{ background: T.panel2, border: `1px solid ${T.line}` }}><Coin n={coins} /></div>
              <button onClick={() => { setNotifOpen(true); setSeen(true); }} className="relative pill"
                style={{ background: T.panel2, border: `1px solid ${T.line}`, padding: "6px 10px" }}>
                <span style={{ fontSize: 13 }}>🔔</span>
                {unread > 0 && (
                  <span className="mono" style={{
                    position: "absolute", top: -4, right: -4, background: T.hanko, color: "#fff", fontSize: 9,
                    fontWeight: 700, minWidth: 16, height: 16, borderRadius: 99, display: "grid", placeItems: "center", padding: "0 4px",
                  }}>{unread}</span>
                )}
              </button>
            </div>
          </div>
        </header>

        <div className="shell">
          <nav className="side">
            {NAV.map(([k, l, i]) => (
              <button key={k} onClick={() => go(k)} className="side-item" style={{
                background: tab === k && !s ? T.panel : "transparent",
                color: tab === k && !s ? accent : T.muted,
              }}>
                <span style={{ fontSize: 15 }}>{i}</span>{l}
              </button>
            ))}
            <button onClick={() => setSearching(true)} className="side-item" style={{ color: T.muted }}>
              <span style={{ fontSize: 15 }}>⌕</span>{t("search_ph").split("—")[0].trim()}
            </button>
          </nav>
          <main className="main">{body}</main>
        </div>

        <nav className="bottomnav">
          {NAV.map(([k, l, i]) => (
            <button key={k} onClick={() => go(k)} className="flex-1 flex flex-col items-center gap-1"
              style={{ color: tab === k && !s ? accent : T.muted }}>
              <span style={{ fontSize: 17 }}>{i}</span>
              <span style={{ fontSize: 10, fontWeight: 700 }}>{l}</span>
            </button>
          ))}
        </nav>

        {rSeries && <Reader s={rSeries} ch={reader.ch} branch={rBranch} rate={rate} style={style} spend={spend}
          saveArt={(ci, si, svg) => saveArt(rSeries.id, rBranch.id, ci, si, svg)}
          voteCanon={(y) => voteCanon(rSeries.id, rBranch.id, y)}
          likeReview={(rid) => likeReview(rSeries.id, rBranch.id, rid)}
          replyReview={(rid, txt) => replyReview(rSeries.id, rBranch.id, rid, txt, rBranch.mine)}
          following={rBranch ? !!follows[rBranch.id] : false}
          onFollow={() => rBranch && setFollows((f) => ({ ...f, [rBranch.id]: !f[rBranch.id] }))}
          onProgress={(ci) => rBranch && setProgress((p) => ({ ...p, [rSeries.id]: { sid: rSeries.id, bid: rBranch.id, ci, title: rBranch.title, series: rSeries.title, hue: rSeries.hue } }))}
          onClose={() => setReader(null)} accent={accent} />}
        {editor && <PanelEditor init={editor} close={() => setEditor(null)} say={say} accent={accent} style={style} spend={spend} />}
        {conv && <Converter close={() => setConv(false)} accent={accent} toEditor={(d) => { setConv(false); setEditor(d); }} say={say} spend={spend} />}
        {adding && <AddSeries close={() => setAdding(false)} accent={accent} add={(x) => setSeries((p) => [x, ...p])} say={say} />}
        {styleLib && <StyleLib close={() => setStyleLib(false)} accent={accent} styles={styles} setStyles={setStyles}
          styleId={styleId} setStyleId={setStyleId} say={say} spend={spend} />}
        {poster && <Poster close={() => setPoster(false)} accent={accent} series={series} style={style} say={say} spend={spend} />}
        {notifOpen && <Notifs close={() => setNotifOpen(false)} accent={accent} notifs={notifs}
          clear={() => setNotifs([])} />}
        {searching && <Search close={() => setSearching(false)} accent={accent} series={series}
          open={(id) => { setSearching(false); setOpenId(id); }} />}
        {onboard && <Onboard accent={accent} taste={taste} setTaste={setTaste} lang={lang} setLang={setLang}
          finish={() => { setOnboard(false); setCoins((c) => c + 500); say(t("welcome_coins")); }}
          addSeries={() => { setOnboard(false); setCoins((c) => c + 500); setAdding(true); }} />}

        {toast && (
          <div className="fade" style={{
            position: "fixed", bottom: 96, left: "50%", transform: "translateX(-50%)", zIndex: 50,
            background: T.panel2, border: `1px solid ${accent}`, padding: "10px 18px", borderRadius: 999,
            fontSize: 13, fontWeight: 700, whiteSpace: "nowrap",
          }}>{toast}</div>
        )}
      </div>
    </I18n.Provider>
  );
}

/* ---------------- DISCOVER ---------------- */
function Home({ go, series, open, claimed, accent, openEditor, openConv, openAdd, openStyles, openPoster, openSearch, style, progress }) {
  const { t, lang } = useT();
  const done = QUESTS.daily.filter((q) => claimed[q.id]).length;
  const blank = () => openEditor({ title: "Untitled", hue: 268, panels: [{ id: uid(), h: 260, hue: 268, note: "", els: [] }] });
  const tools = [
    [t("t_novel"), t("t_novel_d"), openConv],
    [t("t_editor"), t("t_editor_d"), blank],
    [t("t_style"), style.n[lang] || style.n.en, openStyles],
    [t("t_poster"), t("t_poster_d"), openPoster],
  ];
  const prog = Object.values(progress || {});

  return (
    <div className="fade">
      <div className="mt-5">
        <div className="hanko" style={{ marginBottom: 14 }}>{t("hero_kick")}</div>
        <h1 style={{ fontSize: 30, lineHeight: 1.12, fontWeight: 900 }}>
          {t("hero_1")}<br />{t("hero_2")}<br /><span style={{ color: accent }}>{t("hero_3")}</span>
        </h1>
        <p style={{ color: T.muted, fontSize: 14, marginTop: 12, lineHeight: 1.5, maxWidth: 520 }}>{t("hero_sub")}</p>
      </div>

      <button onClick={openSearch} className="inp mt-5 flex items-center gap-2 text-left" style={{ color: T.muted }}>
        <span style={{ fontSize: 13 }}>⌕</span><span style={{ fontSize: 13 }}>{t("search_ph")}</span>
      </button>

      {prog.length > 0 && (
        <>
          <Head k={t("continue_k")} t={t("continue_t")} />
          {prog.map((p) => (
            <button key={p.bid} onClick={() => open(p.sid)} className="card p-3 mb-2 w-full text-left flex items-center gap-3">
              <div style={{ width: 38, height: 50, borderRadius: 8, flexShrink: 0, ...cover(p.hue, 50) }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 800 }}>{p.title}</div>
                <div style={{ fontSize: 11, color: T.muted, marginTop: 2 }}>{p.series} · {t("ch_left")} {p.ci + 1}</div>
              </div>
              <span style={{ color: accent, fontSize: 16 }}>›</span>
            </button>
          ))}
        </>
      )}

      <button onClick={() => go("quests")} className="card w-full text-left mt-5 p-4">
        <div className="flex justify-between items-center mb-2">
          <span style={{ fontSize: 13, fontWeight: 800 }}>{t("today_quests")}</span>
          <span className="mono" style={{ fontSize: 11, color: T.muted }}>{done}/3</span>
        </div>
        <Bar v={done} g={3} c={accent} />
        <div style={{ fontSize: 11, color: T.muted, marginTop: 8 }}>{t("earn_c")} <Coin n={65} size={11} /></div>
      </button>

      <Head k={t("abandoned_k")} t={t("abandoned_t")} right={
        <button onClick={openAdd} className="pill" style={{ background: T.panel2, color: accent, border: `1px solid ${accent}`, padding: "8px 12px" }}>
          {t("add_series")}
        </button>} />
      <div className="scroll-x flex gap-3 pb-1">
        {series.map((x) => (
          <button key={x.id} onClick={() => open(x.id)} className="text-left" style={{ flex: "0 0 150px" }}>
            <div className="card overflow-hidden" style={{ ...cover(x.hue, 190), position: "relative", display: "flex", alignItems: "flex-end", padding: 10 }}>
              <div className="pill" style={{ position: "absolute", top: 8, right: 8, background: "rgba(229,72,77,.9)", color: "#fff", fontSize: 9 }}>{x.year}</div>
              <div>
                <div className="disp" style={{ fontSize: 15, fontWeight: 700, lineHeight: 1.2 }}>{x.title}</div>
                <div className="mono" style={{ fontSize: 10, color: "rgba(255,255,255,.6)", marginTop: 3 }}>{x.type} · {x.chapters}</div>
              </div>
            </div>
            <div style={{ fontSize: 11, color: T.muted, marginTop: 6 }}>{x.branches.length} {t("s_branches").toLowerCase()} · {x.followers}</div>
          </button>
        ))}
      </div>

      <Head k={t("demand_k")} t={t("demand_t")} />
      <div className="card p-4">
        <div style={{ fontSize: 14, fontWeight: 800 }}>Blood Lantern — ch. 85</div>
        <div style={{ fontSize: 12, color: T.muted, margin: "4px 0 10px" }}>318 {t("readers_pooled")}</div>
        <Bar v={8400} g={12000} c={T.gold} />
        <div className="flex justify-between mt-2" style={{ fontSize: 11 }}>
          <Coin n={8400} size={11} /><span className="mono" style={{ color: T.muted }}>{t("goal")} 12,000</span>
        </div>
        <button className="btn-ghost mt-3 w-full" style={{ borderColor: T.gold, color: T.gold }}>{t("join_pool")}</button>
      </div>

      <Head k={t("studio_k")} t={t("studio_t")} />
      <div className="grid grid-cols-2 gap-3">
        {tools.map(([a, b, fn]) => (
          <button key={a} onClick={fn} className="card p-3 text-left" style={{ borderColor: accent }}>
            <div style={{ fontSize: 13, fontWeight: 800 }}>{a}</div>
            <div style={{ fontSize: 11, color: T.muted, marginTop: 3 }}>{b}</div>
          </button>
        ))}
      </div>
      <div style={{ height: 24 }} />
    </div>
  );
}

/* ---------------- SEARCH ---------------- */
function Search({ close, accent, series, open }) {
  const { t } = useT();
  const [q, setQ] = useState("");
  const [type, setType] = useState(t("all"));
  const [sort, setSort] = useState(t("s_score"));
  const [only, setOnly] = useState([]);
  const types = [t("all"), "Manga", "Manhwa", "Webtoon", "Novel"];
  const bestOf = (s) => s.branches.length ? Math.max(...s.branches.map((b) => scoreOf(b).total)) : 0;
  const hasCanon = (s) => s.branches.some((b) => canonOf(b).sealed);

  let list = series.filter((s) => {
    const hay = (s.title + " " + s.type + " " + s.tags.join(" ") + " " + s.synopsis).toLowerCase();
    if (q.trim() && !hay.includes(q.trim().toLowerCase())) return false;
    if (type !== t("all") && s.type !== type) return false;
    if (only.includes(t("f_hascanon")) && !hasCanon(s)) return false;
    if (only.includes(t("f_nobranch")) && s.branches.length > 0) return false;
    if (only.includes(t("f_mine")) && !s.branches.some((b) => b.mine)) return false;
    return true;
  });
  list = [...list].sort((a, b) => sort === t("s_score") ? bestOf(b) - bestOf(a)
    : sort === t("s_branches") ? b.branches.length - a.branches.length : b.chapters - a.chapters);

  return (
    <div className="full">
      <div className="full-in">
        <div className="sticky top-0 z-10 px-4 py-3 flex items-center gap-3"
          style={{ background: "rgba(10,7,17,.95)", backdropFilter: "blur(14px)", borderBottom: `1px solid ${T.line}` }}>
          <button onClick={close} style={{ fontSize: 18 }}>←</button>
          <input className="inp" autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder={t("search_ph")} />
        </div>
        <div className="px-4 pt-4">
          <div className="scroll-x flex gap-2">
            {types.map((x) => (
              <button key={x} onClick={() => setType(x)} className="pill" style={{
                flexShrink: 0, padding: "8px 14px", fontSize: 12,
                background: type === x ? accent : T.panel, color: type === x ? "#fff" : T.muted,
                border: `1px solid ${type === x ? accent : T.line}`,
              }}>{x}</button>
            ))}
          </div>
          <Lbl>{t("filter")}</Lbl>
          <Chips multi opts={[t("f_hascanon"), t("f_nobranch"), t("f_mine")]} val={only} set={setOnly} accent={accent} />
          <Lbl>{t("sort")}</Lbl>
          <Chips opts={[t("s_score"), t("s_branches"), t("s_chapters")]} val={sort} set={setSort} accent={accent} />

          <div className="mono" style={{ fontSize: 9, color: T.muted, letterSpacing: ".14em", margin: "20px 0 10px" }}>
            {list.length} {t("results")}
          </div>
          {list.length === 0 && (
            <div className="card p-5" style={{ fontSize: 12, color: T.muted, lineHeight: 1.5, textAlign: "center" }}>{t("not_found")}</div>
          )}
          {list.map((s) => {
            const best = bestOf(s);
            return (
              <button key={s.id} onClick={() => open(s.id)} className="card p-3 mb-3 w-full text-left flex gap-3">
                <div style={{ width: 56, height: 74, borderRadius: 8, flexShrink: 0, ...cover(s.hue, 74) }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="flex items-center gap-2">
                    <span style={{ fontSize: 14, fontWeight: 800 }}>{s.title}</span>
                    {hasCanon(s) && <span className="pill" style={{ background: "rgba(240,180,41,.16)", color: T.gold, fontSize: 8 }}>⛩</span>}
                  </div>
                  <div className="mono" style={{ fontSize: 10, color: T.muted, marginTop: 3 }}>{s.type} · {s.chapters} · {s.year}</div>
                  <div style={{ fontSize: 11, color: T.muted, marginTop: 5, lineHeight: 1.4 }}>{s.synopsis.slice(0, 90)}…</div>
                  <div className="flex gap-3 mt-2 mono" style={{ fontSize: 10, color: T.muted }}>
                    <span>{s.branches.length} {t("s_branches").toLowerCase()}</span>
                    {best > 0 && <span style={{ color: scoreColor(best) }}>★ {best}</span>}
                  </div>
                </div>
              </button>
            );
          })}
          <div style={{ height: 40 }} />
        </div>
      </div>
    </div>
  );
}

/* ---------------- SERIES ---------------- */
function SeriesView({ s, back, read, coins, spend, say, accent, commit, appendChapter, openEditor, style, saveCharArt, saveStyleDesc, guild, spendGuild, guildProgress }) {
  const { t } = useT();
  const [tab, setTab] = useState("branches");
  const [forge, setForge] = useState(null);
  const mine = s.branches.filter((b) => b.mine);

  return (
    <div className="fade">
      <button onClick={back} className="btn-ghost mt-4" style={{ width: "auto", padding: "7px 14px" }}>← {t("back")}</button>
      <div className="card overflow-hidden mt-3" style={{ ...cover(s.hue, 170), display: "flex", alignItems: "flex-end", padding: 14 }}>
        <div>
          <div className="flex gap-1.5 mb-2">{s.tags.map((x) => <span key={x} className="pill" style={{ background: "rgba(0,0,0,.4)", fontSize: 9 }}>{x}</span>)}</div>
          <h1 style={{ fontSize: 24, fontWeight: 900 }}>{s.title}</h1>
          <div className="mono" style={{ fontSize: 11, color: "rgba(255,255,255,.65)", marginTop: 4 }}>{s.type} · {s.chapters} · {s.followers}</div>
        </div>
      </div>
      <p style={{ fontSize: 13, color: T.muted, lineHeight: 1.6, marginTop: 12 }}>{s.synopsis}</p>

      <div className="flex gap-2 mt-4">
        <button onClick={() => read({ sid: s.id, ch: 1 })} className="btn-ghost" style={{ flex: 1 }}>{t("read")}</button>
        <button onClick={() => setForge({})} className="btn" style={{ flex: 1.4, background: accent }}>{t("continue_it")}</button>
      </div>

      <div className="flex gap-1 mt-6 p-1 card" style={{ borderRadius: 12 }}>
        {[["branches", t("tab_branches")], ["memory", t("tab_memory")], ["chapters", t("tab_chapters")]].map(([k, l]) => (
          <button key={k} onClick={() => setTab(k)} className="flex-1 py-2" style={{
            fontSize: 12, fontWeight: 800, borderRadius: 9,
            background: tab === k ? accent : "transparent", color: tab === k ? "#fff" : T.muted,
          }}>{l}</button>
        ))}
      </div>

      <div className="mt-5">
        {tab === "branches" && (
          <>
            {mine.length > 0 && (
              <div className="card p-3 mb-4" style={{ borderColor: accent }}>
                <div className="mono" style={{ fontSize: 9, color: accent, letterSpacing: ".14em", marginBottom: 8 }}>{t("continue_yours_k")}</div>
                {mine.map((b) => (
                  <div key={b.id} className="flex justify-between items-center gap-2" style={{ marginBottom: 6 }}>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 700 }}>{b.title}</div>
                      <div className="mono" style={{ fontSize: 10, color: T.muted }}>{b.chapters?.length || 0} {t("chapters_w")}</div>
                    </div>
                    <button onClick={() => setForge({ branch: b })} className="pill"
                      style={{ background: accent, color: "#fff", padding: "8px 12px", fontSize: 11, flexShrink: 0 }}>{t("add_ch")}</button>
                  </div>
                ))}
              </div>
            )}
            <BranchTree s={s} accent={accent} onOpen={(b) => read({ sid: s.id, bid: b.id })} onFork={() => setForge({})} />
          </>
        )}
        {tab === "memory" && <Memory s={s} accent={accent} style={style} saveCharArt={saveCharArt} saveStyleDesc={saveStyleDesc} say={say} spend={spend} />}
        {tab === "chapters" && (
          <>
            <div className="card p-3 mb-3" style={{ fontSize: 12, color: T.muted, lineHeight: 1.5, borderLeft: `3px solid ${T.hanko}` }}>
              {t("retcon_hint")}
            </div>
            {Array.from({ length: 10 }).map((_, i) => {
              const n = s.chapters - i;
              return (
                <div key={n} className="card p-3 mb-2 flex justify-between items-center gap-2">
                  <button onClick={() => read({ sid: s.id, ch: n })} className="text-left" style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 700 }}>{t("tab_chapters").replace(/s$/, "")} {n}</div>
                    <div className="mono" style={{ fontSize: 10, color: T.muted, marginTop: 2 }}>{s.year}</div>
                  </button>
                  <button onClick={() => setForge({ from: n })} className="pill"
                    style={{ background: T.panel2, color: T.hanko, border: `1px solid ${T.hanko}`, padding: "7px 11px", fontSize: 10, flexShrink: 0 }}>
                    {t("retcon_btn")}
                  </button>
                </div>
              );
            })}
          </>
        )}
      </div>

      {forge && <Forge s={s} from={forge.from} branch={forge.branch} close={() => setForge(null)} coins={coins} spend={spend}
        say={say} accent={accent} commit={commit} appendChapter={appendChapter} openEditor={openEditor} style={style}
        guild={guild} spendGuild={spendGuild} guildProgress={guildProgress} />}
      <div style={{ height: 24 }} />
    </div>
  );
}

/* ---------------- MEMORY ---------------- */
function Memory({ s, accent, style, saveCharArt, saveStyleDesc, say, spend }) {
  const { t } = useT();
  const [chat, setChat] = useState(null);
  const [drawing, setDrawing] = useState(null);
  const [styleFiles, setStyleFiles] = useState([]);
  const [analyzing, setAnalyzing] = useState(false);
  const open = s.lore.threads.filter((x) => x.open);
  const closed = s.lore.threads.filter((x) => !x.open);

  const portrait = async (c) => {
    if (c.art) return;
    if (!spend(P.portrait)) return;
    setDrawing(c.id);
    try {
      const svg = await drawPanel(`Character portrait: ${c.n}. ${c.d} Chest-up, face in focus, dramatic lighting.`, mergedStyle(s, style), null, s.styleRefImage);
      if (svg) saveCharArt(s.id, c.id, svg); else say(t("ed_nodraw"));
    } catch { say(t("ed_nodraw")); }
    setDrawing(null);
  };

  const fileToDataUrl = (file) => new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result);
    r.onerror = reject;
    r.readAsDataURL(file);
  });

  const onPickStyleFiles = async (e) => {
    const files = Array.from(e.target.files || []).slice(0, 3);
    if (!files.length) return;
    const urls = await Promise.all(files.map(fileToDataUrl));
    setStyleFiles(urls);
  };

  const runStyleAnalysis = async () => {
    if (!styleFiles.length) return;
    setAnalyzing(true);
    try {
      const desc = await analyzeStyle(styleFiles);
      if (desc) { saveStyleDesc(s.id, desc, styleFiles[0]); setStyleFiles([]); }
      else say(t("ed_nodraw"));
    } catch { say(t("ed_nodraw")); }
    setAnalyzing(false);
  };

  const Src = ({ src }) => (
    <span className="pill" style={{
      fontSize: 8, padding: "2px 7px",
      background: src === "canon" ? T.panel2 : "rgba(139,92,246,.15)",
      color: src === "canon" ? T.muted : accent,
    }}>{src === "canon" ? t("canon_src") : src.toUpperCase()}</span>
  );

  return (
    <div className="fade">
      <div className="card p-4 mb-4" style={{ borderColor: accent }}>
        <div className="flex justify-between items-center">
          <span style={{ fontSize: 13, fontWeight: 800 }}>{t("style_ref_t")}</span>
          {s.styleDescription && <span className="mono" style={{ fontSize: 10, color: accent }}>● {t("style_ref_learned")}</span>}
        </div>
        {s.styleDescription ? (
          <>
            <div style={{ fontSize: 11, color: T.muted, marginTop: 8, lineHeight: 1.55 }}>{s.styleDescription}</div>
            <label className="btn-ghost mt-3" style={{ display: "inline-block", cursor: "pointer", fontSize: 11 }}>
              {t("style_ref_replace")}
              <input type="file" accept="image/*" multiple hidden onChange={onPickStyleFiles} />
            </label>
          </>
        ) : (
          <>
            <div style={{ fontSize: 11, color: T.muted, marginTop: 6, lineHeight: 1.55 }}>
              {t("style_ref_note")}
            </div>
            <label className="btn-ghost mt-3" style={{ display: "inline-block", cursor: "pointer", fontSize: 11 }}>
              {t("style_ref_pick")}
              <input type="file" accept="image/*" multiple hidden onChange={onPickStyleFiles} />
            </label>
          </>
        )}
        {styleFiles.length > 0 && (
          <div className="mt-3">
            <div className="flex gap-2 mb-2">
              {styleFiles.map((u, i) => (
                <img key={i} src={u} alt="" style={{ width: 52, height: 52, objectFit: "cover", borderRadius: 8 }} />
              ))}
            </div>
            <button onClick={runStyleAnalysis} disabled={analyzing} className="btn" style={{ background: analyzing ? T.panel2 : accent, opacity: analyzing ? .7 : 1, fontSize: 12 }}>
              {analyzing ? (t("style_ref_busy")) : (t("style_ref_go"))}
            </button>
          </div>
        )}
      </div>

      <div className="card p-4 mb-4" style={{ borderColor: accent }}>
        <div className="flex justify-between items-center">
          <span style={{ fontSize: 13, fontWeight: 800 }}>{t("mem_core")}</span>
          <span className="mono pulse" style={{ fontSize: 10, color: accent }}>● {t("live")}</span>
        </div>
        <div style={{ fontSize: 12, color: T.muted, marginTop: 6 }}>
          {s.lore.chars.length} {t("mem_sub_c")} · {s.lore.rules.length} {t("mem_sub_r")} · {open.length} {t("mem_sub_o")} · {closed.length} {t("mem_sub_x")}
        </div>
        <div style={{ fontSize: 11, color: T.muted, marginTop: 8, lineHeight: 1.5 }}>{t("mem_note")}</div>
      </div>

      <div className="mono" style={{ fontSize: 10, color: accent, letterSpacing: ".16em", marginBottom: 8 }}>{t("chars_k")}</div>
      {s.lore.chars.map((c) => (
        <div key={c.id} className="card p-3 mb-2 flex gap-3">
          <button onClick={() => portrait(c)} disabled={!!drawing} className="relative overflow-hidden"
            style={{ width: 52, height: 66, borderRadius: 10, flexShrink: 0, background: c.art ? "#000" : `linear-gradient(135deg,hsl(${s.hue} 50% 30%),hsl(${s.hue + 60} 50% 18%))` }}>
            <ArtLayer art={c.art} />
            {drawing === c.id ? (
              <span className="pulse mono" style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", fontSize: 8, color: T.gold, background: "rgba(0,0,0,.6)" }}>…</span>
            ) : !c.art && (
              <span className="mono" style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", fontSize: 8, color: "rgba(255,255,255,.55)", textAlign: "center", lineHeight: 1.4 }}>{t("draw_it")}<br />◈{P.portrait}</span>
            )}
          </button>
          <button onClick={() => setChat(c)} className="text-left" style={{ flex: 1, minWidth: 0 }}>
            <div className="flex items-center gap-2">
              <span style={{ fontSize: 13, fontWeight: 800 }}>{c.n}</span><Src src={c.src} />
            </div>
            <div style={{ fontSize: 12, color: T.muted, marginTop: 2, lineHeight: 1.45 }}>{c.d}</div>
            <div className="mono" style={{ fontSize: 9, color: accent, marginTop: 5 }}>{t("talk")}</div>
          </button>
        </div>
      ))}

      <div className="mono" style={{ fontSize: 10, color: accent, letterSpacing: ".16em", margin: "16px 0 8px" }}>{t("rules_k")}</div>
      {s.lore.rules.map((r, i) => (
        <div key={r.id} className="card p-3 mb-2 flex gap-3 items-start" style={{ fontSize: 12 }}>
          <span className="mono" style={{ color: accent, flexShrink: 0 }}>{String(i + 1).padStart(2, "0")}</span>
          <span style={{ lineHeight: 1.45, flex: 1 }}>{r.t}</span>
          <Src src={r.src} />
        </div>
      ))}

      <div className="mono" style={{ fontSize: 10, color: T.hanko, letterSpacing: ".16em", margin: "16px 0 8px" }}>{t("threads_k")}</div>
      {open.map((x) => (
        <div key={x.id} className="card p-3 mb-2" style={{ fontSize: 12, borderLeft: `3px solid ${T.hanko}`, lineHeight: 1.45 }}>{x.t}</div>
      ))}
      {closed.map((x) => (
        <div key={x.id} className="card p-3 mb-2 flex justify-between items-center gap-2" style={{ fontSize: 12, borderLeft: `3px solid ${accent}`, opacity: .65 }}>
          <span style={{ textDecoration: "line-through", lineHeight: 1.45 }}>{x.t}</span>
          <span className="mono" style={{ fontSize: 9, color: accent, flexShrink: 0 }}>CH.{x.closedIn}</span>
        </div>
      ))}

      <div className="mono" style={{ fontSize: 10, color: T.muted, letterSpacing: ".16em", margin: "16px 0 8px" }}>{t("memlog_k")}</div>
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

      {chat && <CharChat s={s} c={chat} close={() => setChat(null)} accent={accent} spend={spend} />}
      <div style={{ height: 16 }} />
    </div>
  );
}

/* ---------------- TALK TO A CHARACTER ---------------- */
function CharChat({ s, c, close, accent, spend }) {
  const { t, lang } = useT();
  const [msgs, setMsgs] = useState([{ r: "a", t: `…${c.n} ${t("looks_at_you")}` }]);
  const [v, setV] = useState("");
  const [busy, setBusy] = useState(false);

  const send = async () => {
    const q = v.trim(); if (!q || busy) return;
    if (!spend(P.chat)) return;
    const next = [...msgs, { r: "u", t: q }];
    setMsgs(next); setV(""); setBusy(true);
    try {
      const hist = next.slice(1).map((m) => `${m.r === "u" ? "Reader" : c.n}: ${m.t}`).join("\n");
      const r = await ask(`You are ${c.n}, a character in the ${s.type} series "${s.title}".
ROLE: ${c.r}. IDENTITY: ${c.d}
SYNOPSIS: ${s.synopsis}
${loreText(s)}

Answer in first person, in character. ${langLine(lang)} Keep it short (3 sentences max). Don't know things the character wouldn't know. Never break a world rule. Never break character, never say you're an AI.

CONVERSATION:
${hist}
${c.n}:`);
      setMsgs([...next, { r: "a", t: r.trim() }]);
    } catch { setMsgs([...next, { r: "a", t: t("silence") }]); }
    setBusy(false);
  };

  return (
    <Sheet close={close}>
      <div className="flex items-center gap-3 mb-4">
        <div className="relative overflow-hidden" style={{ width: 42, height: 42, borderRadius: 12, background: c.art ? "#000" : `linear-gradient(135deg,hsl(${s.hue} 50% 30%),hsl(${s.hue + 60} 50% 18%))` }}>
          <ArtLayer art={c.art} />
        </div>
        <div>
          <div style={{ fontSize: 16, fontWeight: 900 }}>{c.n}</div>
          <div style={{ fontSize: 11, color: T.muted }}>{c.r}</div>
        </div>
      </div>
      <div style={{ maxHeight: "44vh", overflowY: "auto", marginBottom: 12 }}>
        {msgs.map((m, i) => (
          <div key={i} className="fade" style={{ display: "flex", justifyContent: m.r === "u" ? "flex-end" : "flex-start", marginBottom: 8 }}>
            <div style={{
              maxWidth: "82%", padding: "10px 13px", borderRadius: 14, fontSize: 13, lineHeight: 1.5,
              background: m.r === "u" ? accent : T.panel2, color: m.r === "u" ? "#fff" : T.paper,
              fontStyle: i === 0 ? "italic" : "normal",
            }}>{m.t}</div>
          </div>
        ))}
        {busy && <div className="pulse mono" style={{ fontSize: 11, color: T.muted }}>{c.n} {t("thinking")}</div>}
      </div>
      <div className="flex gap-2">
        <input className="inp" value={v} onChange={(e) => setV(e.target.value)} onKeyDown={(e) => e.key === "Enter" && send()} placeholder={t("speak_ph")} />
        <button onClick={send} className="btn" style={{ width: "auto", padding: "0 18px", background: accent }}>→</button>
      </div>
      <div className="mono" style={{ fontSize: 9, color: T.muted, textAlign: "center", marginTop: 8 }}>
        {t("cost_line")}: ◈{P.chat} / {t("per_msg")}
      </div>
    </Sheet>
  );
}

/* ---------------- FORGE ---------------- */
function Forge({ s, from, branch, close, coins, spend, say, accent, commit, appendChapter, openEditor, style, guild, spendGuild, guildProgress }) {
  const { t, lang } = useT();
  const [mode, setMode] = useState("basic");
  const TONES = lang === "tr" ? ["Canon'a sadık", "Karanlık", "Cesur sapma"] : ["True to canon", "Darker", "Bold departure"];
  const TONES_A = lang === "tr" ? ["Canon'a sadık", "Karanlık", "Trajik", "Gerilim", "Mizahi", "Romantik", "Epik", "Melankolik"]
    : ["True to canon", "Dark", "Tragic", "Tense", "Funny", "Romantic", "Epic", "Melancholy"];
  const LENS = lang === "tr" ? ["Kısa", "Orta", "Uzun"] : ["Short", "Medium", "Long"];
  const POVS = lang === "tr" ? ["1. şahıs", "3. şahıs", "Çoklu bakış", "Belgesel"] : ["First person", "Third person", "Multi-POV", "Documentary"];
  const RATINGS = ["All ages", "13+", "16+", "18+"];

  const [tone, setTone] = useState(TONES[0]);
  const [len, setLen] = useState(LENS[1]);
  const [note, setNote] = useState("");
  const [tones, setTones] = useState([TONES_A[1]]);
  const [pov, setPov] = useState(POVS[1]);
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
  const [payGuild, setPayGuild] = useState(false);
  const [busy, setBusy] = useState(false);
  const [out, setOut] = useState(null);
  const [err, setErr] = useState(null);
  const [posted, setPosted] = useState(false);
  const [drawing, setDrawing] = useState(-1);

  const openThreads = s.lore.threads.filter((x) => x.open);
  const prev = branch && branch.chapters?.[branch.chapters.length - 1];
  const nextNo = branch ? (prev?.n || s.chapters) + 1 : s.chapters + 1;
  const cost = mode === "basic" ? P.chapter : Math.min(400,
    P.advBase + panels * 8 + focus.length * 10 + threads.length * 15 + newChars.length * 20 + newRules.length * 20 + custom.length * 15);
  const drawCost = () => (out?.scenes || []).filter((x) => !x.art).length * P.panel;
  const useGuild = payGuild && guild && guild.pool >= cost;

  const addCustom = () => {
    if (!ck.trim() || !cv.trim()) return;
    setCustom([...custom, { k: ck.trim(), v: cv.trim() }]); setCk(""); setCv("");
  };

  const target = branch
    ? `This is your branch "${branch.title}". Write chapter ${nextNo}.

PREVIOUS CHAPTER (${prev?.n} — "${prev?.title}"):
${prev?.content || (prev?.scenes || []).map((x) => x.metin || x.text).join(" ")}

Continue seamlessly from there.`
    : from
      ? `REWRITE the story from chapter ${from} onwards (retcon). The events of the original chapter ${from} are void.`
      : `Write chapter ${s.chapters + 1} (the series was abandoned at chapter ${s.chapters}).`;

  const spec = () => mode === "basic"
    ? `Tone: ${tone}\nLength: ${len}\nReader note: ${note || "none"}\nPanels: 4`
    : [
      `Tone: ${tones.join(" + ") || "neutral"}`, `Narrator: ${pov}`,
      `Pacing (0 slow / 100 fast): ${pace}`, `Dialogue density (0 sparse / 100 talky): ${dialog}`,
      `Canon fidelity (0 free / 100 locked): ${fid}`, `Maturity: ${rating}`, `Panels: ${panels}`,
      cliff ? "End on a cliffhanger." : "End on a resolution.",
      focus.length ? `Focus characters: ${focus.join(", ")}` : "",
      threads.length ? `Resolve these threads in this chapter: ${threads.join(" | ")}` : "",
      newChars.length ? `New characters (add to canon): ${newChars.join(" | ")}` : "",
      newRules.length ? `New world rules (add to canon): ${newRules.join(" | ")}` : "",
      forbid.length ? `MUST NOT HAPPEN: ${forbid.join(", ")}` : "",
      custom.length ? `Custom parameters:\n${custom.map((c) => `- ${c.k}: ${c.v}`).join("\n")}` : "",
      adv ? `Author note: ${adv}` : "",
    ].filter(Boolean).join("\n");

  const isComic = s.type !== "Novel";

  const run = async () => {
    if (useGuild) spendGuild(cost);
    else if (!spend(cost)) return;
    setBusy(true); setErr(null); setOut(null);
    try {
      const plotRule = `PLOT DISCIPLINE (mandatory):
Before writing, decide ONE concrete chapter goal: what specific thing changes, is revealed, or is won/lost by the end. Every scene must cause the next — no scene that could be deleted without breaking the chain, no generic "atmosphere" padding, no scene that exists only to show art. Reference specific named characters, open threads, or established rules from LORE below by name — vague, could-be-any-series writing is a failure. If this continues a previous chapter, the opening must pick up an unresolved thread from it, not restart the mood.`;
      const txt = await ask(isComic ? `You are a ${s.type} writer. For the series "${s.title}": ${target}
${langLine(lang)}

SYNOPSIS: ${s.synopsis}
${loreText(s)}

SETTINGS:
${spec()}

${plotRule}

Return ONLY this JSON, no markdown, no backticks:
{"title":"chapter title","scenes":[{"panel":"one-sentence framing direction","bubbles":[{"speaker":"character name, or empty for none","type":"speech | thought | shout | sfx","text":"dialogue, thought, or a short SFX word like CRASH / BOOM","pos":"tl | tr | bl | br | tc | bc | c"}],"text":"OPTIONAL short caption, max ONE short sentence, empty string if the panel speaks for itself through art+bubbles alone"}],"scores":{"fid":0-100,"char":0-100,"pace":0-100,"dial":0-100,"orig":0-100},"why":"one sentence justifying the scores","breaks":["any world rule you broke, else empty array"],"note":"one sentence of new permanent canon, or empty string"}
"bubbles" can be an empty array for a quiet panel, or several for a busy one. Use "sfx" sparingly for real impact moments (an impact, a door slam, a gasp) — short punchy words only, no speaker. Vary "pos" so bubbles don't stack on top of each other.
This is a ${s.type} — a VISUAL medium. Tell the story almost entirely through "panel" framing and "bubbles" (dialogue, thought, SFX). Keep "text" empty or near-empty on most panels — it is a rare caption, never a narration paragraph.
Exactly ${mode === "basic" ? 4 : panels} scenes, each one a distinct beat that advances the chapter goal. Score honestly — don't flatter yourself; mark weaknesses down, especially "pace" if any scene feels like filler.`
        : `You are a novelist. For the series "${s.title}": ${target}
${langLine(lang)}

SYNOPSIS: ${s.synopsis}
${loreText(s)}

SETTINGS:
${spec()}

${plotRule}

Return ONLY this JSON, no markdown, no backticks:
{"title":"chapter title","content":"the full chapter, written as continuous prose across several paragraphs (separate paragraphs with a blank line) — real novel writing, not a panel-by-panel breakdown, no stage directions","scores":{"fid":0-100,"char":0-100,"pace":0-100,"dial":0-100,"orig":0-100},"why":"one sentence justifying the scores","breaks":["any world rule you broke, else empty array"],"note":"one sentence of new permanent canon, or empty string"}
Write a real prose chapter matching the requested length. Score honestly — don't flatter yourself; mark weaknesses down.`);
      const o = asJSON(txt);
      o.scores = o.scores || { fid: 80, char: 80, pace: 80, dial: 80, orig: 80 };
      o.total = avgOf(o.scores);
      if (!isComic) o.scenes = [];
      setOut(o);
    } catch { setErr(t("gen_failed")); }
    setBusy(false);
  };

  const publish = () => {
    const payload = {
      title: out.title, fid: out.scores.fid, aiAxes: out.scores, from,
      chars: mode === "adv" ? newChars : [], rules: mode === "adv" ? newRules : [],
      resolved: mode === "adv" ? threads : [], note: out.note || "",
      content: isComic ? "" : (out.content || ""),
      scenes: isComic ? out.scenes.map((x) => ({ panel: x.panel, bubbles: x.bubbles || (x.line ? [{ speaker: "", type: "speech", text: x.line, pos: "bc" }] : []), metin: x.text, art: x.art })) : [],
    };
    if (branch) appendChapter(s.id, branch.id, payload); else commit(s.id, payload);
    if (guild && guildProgress) guildProgress(out.title);
    setPosted(true);
  };

  const toWebtoon = async () => {
    if (!out?.content) return;
    setBusy(true);
    try {
      const r = await ask(`Turn this prose into webtoon panels. ${langLine(lang)}

TEXT:
${out.content.slice(0, 2500)}

Return ONLY this JSON, no markdown:
{"panels":[{"note":"visual framing direction, one sentence","line":"the dialogue spoken in the panel, or empty string"}]}
Between 5 and 9 panels. Keep the mood of the text.`);
      const o = asJSON(r);
      openEditor({
        title: out.title, hue: s.hue,
        panels: o.panels.map((p, i) => ({
          id: uid(), h: 240 + (i % 3) * 60, hue: s.hue + i * 20, note: p.note,
          els: p.line ? [{ id: uid(), type: "bubble", text: p.line, x: 50, y: 25, w: 55, fs: 12 }] : [],
        })),
      });
    } catch { say(t("conv_err")); }
    setBusy(false);
  };

  const drawAll = async () => {
    const todo = out.scenes.map((x, i) => [x, i]).filter(([x]) => !x.art);
    if (!todo.length) return;
    if (!spend(todo.length * P.panel)) return;
    for (const [sc, i] of todo) {
      setDrawing(i);
      try {
        const svg = await drawPanel(sc.panel, mergedStyle(s, style), findRefForScene(s, sc.panel), s.styleRefImage);
        if (svg) setOut((o) => ({ ...o, scenes: o.scenes.map((x, j) => j === i ? { ...x, art: svg } : x) }));
      } catch { /* skip */ }
    }
    setDrawing(-1);
  };

  const toPanels = () => openEditor({
    title: out.title, hue: s.hue,
    panels: out.scenes.map((p, i) => {
      const firstLine = (p.bubbles && p.bubbles[0] && p.bubbles[0].text) || p.line || "";
      return {
        id: uid(), h: 240 + (i % 3) * 60, hue: s.hue + i * 22, note: p.panel, art: p.art,
        els: firstLine ? [{ id: uid(), type: "bubble", text: firstLine, x: 50, y: 22, w: 55, fs: 12 }] : [],
      };
    }),
  });

  return (
    <Sheet close={close}>
      {out ? (
        <div className="fade">
          <div className="flex justify-between items-start gap-3">
            <div>
              <div className="mono" style={{ fontSize: 10, color: from ? T.hanko : accent, letterSpacing: ".14em" }}>
                {from ? `RETCON · ${from}` : `CH. ${nextNo}`}
              </div>
              <h2 style={{ fontSize: 20, fontWeight: 900, marginTop: 4 }}>{out.title}</h2>
            </div>
            <div style={{ textAlign: "center", flexShrink: 0 }}>
              <div className="mono" style={{ fontSize: 24, fontWeight: 700, color: scoreColor(out.total) }}>{out.total}</div>
              <div className="mono" style={{ fontSize: 9, color: T.muted }}>{t("ai_score")}</div>
            </div>
          </div>

          <div className="card p-3 mt-3">
            {AXES.map((a) => (
              <div key={a.k} className="mb-2">
                <div className="flex justify-between mono" style={{ fontSize: 10, color: T.muted, marginBottom: 3 }}>
                  <span>{t(a.l)}</span><span style={{ color: scoreColor(out.scores[a.k]) }}>{out.scores[a.k]}</span>
                </div>
                <Bar v={out.scores[a.k]} g={100} c={scoreColor(out.scores[a.k])} />
              </div>
            ))}
            <div style={{ fontSize: 11, color: T.muted, lineHeight: 1.5, marginTop: 8 }}>{out.why}</div>
            <div className="mono" style={{ fontSize: 9, color: T.muted, marginTop: 6 }}>{t("blend_note")}</div>
          </div>

          {out.breaks?.length > 0 && (
            <div className="card p-3 mt-2" style={{ borderColor: T.hanko }}>
              <span className="mono" style={{ fontSize: 9, color: T.hanko, letterSpacing: ".14em" }}>{t("guard")} · {out.breaks.length} {t("warnings")}</span>
              {out.breaks.map((x, i) => <div key={i} style={{ fontSize: 12, marginTop: 5, lineHeight: 1.45 }}>⚠ {x}</div>)}
            </div>
          )}
          {out.note && (
            <div className="card p-3 mt-2" style={{ borderLeft: `3px solid ${accent}` }}>
              <span className="mono" style={{ fontSize: 9, color: accent, letterSpacing: ".14em" }}>{t("to_memory")}</span>
              <div style={{ fontSize: 12, marginTop: 4, lineHeight: 1.5 }}>{out.note}</div>
            </div>
          )}

          {isComic && (
            <button onClick={drawAll} disabled={drawing >= 0 || drawCost() === 0} className="btn-ghost w-full mt-4"
              style={{ borderColor: drawCost() ? T.gold : T.line, color: drawCost() ? T.gold : T.muted }}>
              {drawing >= 0 ? `${t("drawing_p")} ${drawing + 1}/${out.scenes.length}…`
                : drawCost() === 0 ? `✓ ${style.n[lang] || style.n.en}`
                  : `${t("draw_panels")} · ◈ ${drawCost()}`}
            </button>
          )}

          <div className="mt-4">
            {isComic
              ? out.scenes.map((p, i) => <PanelBlock key={i} s={s} p={p} i={i} drawing={drawing} h={420} />)
              : (out.content || "").split(/\n\s*\n/).map((para, i) => (
                <p key={i} style={{ fontSize: 15, lineHeight: 1.75, marginBottom: 14 }}>{para}</p>
              ))}
          </div>

          {posted ? (
            <>
              <div className="card p-3 mb-2" style={{ borderColor: accent, fontSize: 12, lineHeight: 1.5 }}>
                {branch ? t("ch_added") : t("published")}{" "}
                {(mode === "adv" ? newChars.length + newRules.length : 0) + (out.note ? 1 : 0)} {t("facts_written")}
                {mode === "adv" && threads.length > 0 ? `, ${threads.length} ${t("threads_closed")}` : ""}.
              </div>
              <button onClick={isComic ? toPanels : toWebtoon} disabled={busy} className="btn" style={{ background: accent, opacity: busy ? .7 : 1 }}>{busy ? t("conv_busy") : t("to_panels")}</button>
              <button onClick={close} className="btn-ghost mt-2 w-full">{t("close")}</button>
            </>
          ) : (
            <>
              <div className="flex gap-2 mt-2">
                <button onClick={() => setOut(null)} className="btn-ghost" style={{ flex: 1 }}>{t("settings_b")}</button>
                <button onClick={publish} className="btn" style={{ flex: 1.4, background: accent }}>
                  {branch ? t("add_to_branch") : t("publish")}
                </button>
              </div>
              <button onClick={isComic ? toPanels : toWebtoon} disabled={busy} className="btn-ghost mt-2 w-full" style={{ borderColor: T.gold, color: T.gold, opacity: busy ? .7 : 1 }}>{busy ? t("conv_busy") : t("to_panels")}</button>
            </>
          )}
        </div>
      ) : (
        <>
          {from && <div className="hanko" style={{ marginBottom: 12 }}>RETCON · {from}</div>}
          {branch && <div className="hanko" style={{ marginBottom: 12, borderColor: accent, color: accent }}>{branch.title.toUpperCase()}</div>}
          <h2 style={{ fontSize: 19, fontWeight: 900 }}>{from ? `${t("reweave_ch")} ${from}` : `${t("write_ch")} ${nextNo}`}</h2>
          <div style={{ fontSize: 12, color: T.muted, marginTop: 4, marginBottom: 14 }}>
            {t("mem_loaded")} · {s.lore.chars.length} {t("mem_sub_c")}, {s.lore.rules.length} {t("mem_sub_r")}, {openThreads.length} {t("mem_sub_o")}
          </div>

          <div className="flex gap-1 p-1 card" style={{ borderRadius: 12 }}>
            {[["basic", t("forge_quick"), t("forge_quick_d")], ["adv", t("forge_adv"), t("forge_adv_d")]].map(([k, l, d]) => (
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
              <Lbl>{t("tone")}</Lbl>
              <Chips opts={TONES} val={tone} set={setTone} accent={accent} />
              <Lbl>{t("length")}</Lbl>
              <Chips opts={LENS} val={len} set={setLen} accent={accent} />
              <Lbl>{t("your_note")}</Lbl>
              <textarea className="inp" rows={3} value={note} onChange={(e) => setNote(e.target.value)} style={{ resize: "none" }} />
              <button onClick={() => setMode("adv")} className="btn-ghost mt-4 w-full" style={{ color: T.muted, fontSize: 12 }}>{t("want_more")}</button>
            </>
          ) : (
            <>
              <Lbl hint="+">{t("tone")}</Lbl>
              <Chips multi opts={TONES_A} val={tones} set={setTones} accent={accent} />
              <Lbl>{t("narrator")}</Lbl>
              <Chips opts={POVS} val={pov} set={setPov} accent={accent} />
              <Lbl>{t("maturity")}</Lbl>
              <Chips opts={RATINGS} val={rating} set={setRating} accent={accent} />
              <Lbl>{t("pace")}</Lbl>
              <Slider v={pace} set={setPace} a="slow" b="fast" accent={accent} />
              <Lbl>{t("dialogue")}</Lbl>
              <Slider v={dialog} set={setDialog} a="sparse" b="talky" accent={accent} />
              <Lbl>{t("fidelity_l")}</Lbl>
              <Slider v={fid} set={setFid} a="free" b="locked" accent={accent} />

              <Lbl>{t("panels_l")}</Lbl>
              <div className="flex items-center gap-3">
                <button onClick={() => setPanels(Math.max(4, panels - 1))} className="btn-ghost" style={{ width: 44, padding: "10px 0" }}>−</button>
                <span className="mono" style={{ fontSize: 20, fontWeight: 700, minWidth: 30, textAlign: "center" }}>{panels}</span>
                <button onClick={() => setPanels(Math.min(10, panels + 1))} className="btn-ghost" style={{ width: 44, padding: "10px 0" }}>+</button>
                <button onClick={() => setCliff(!cliff)} className="pill" style={{
                  marginLeft: "auto", padding: "9px 14px", fontSize: 11,
                  background: cliff ? accent : T.panel2, color: cliff ? "#fff" : T.muted, border: `1px solid ${cliff ? accent : T.line}`,
                }}>{t("cliff")}</button>
              </div>

              <Lbl hint={t("focus_h")}>{t("focus_l")}</Lbl>
              <Chips multi opts={s.lore.chars.map((c) => c.n)} val={focus} set={setFocus} accent={accent} />
              <Lbl hint={t("threads_h")}>{t("threads_l")}</Lbl>
              {openThreads.length ? <Chips multi opts={openThreads.map((x) => x.t)} val={threads} set={setThreads} accent={accent} />
                : <div style={{ fontSize: 12, color: T.muted }}>—</div>}
              <Lbl hint={t("newchar_h")}>{t("newchar_l")}</Lbl>
              <TagAdd items={newChars} set={setNewChars} accent={accent} ph="Sena — Jin's lost sister" />
              <Lbl>{t("newrule_l")}</Lbl>
              <TagAdd items={newRules} set={setNewRules} accent={accent} ph="A lantern never dies underwater" />
              <Lbl hint={t("forbid_h")}>{t("forbid_l")}</Lbl>
              <TagAdd items={forbid} set={setForbid} accent={accent} color={T.hanko} ph="Nara must not die" />

              <Lbl hint={t("custom_h")}>{t("custom_l")}</Lbl>
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
                <input className="inp" value={ck} onChange={(e) => setCk(e.target.value)} placeholder="Setting" style={{ flex: 1 }} />
                <input className="inp" value={cv} onChange={(e) => setCv(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addCustom()} placeholder="Rain-soaked harbour" style={{ flex: 1.4 }} />
                <button onClick={addCustom} className="btn-ghost" style={{ width: "auto", padding: "0 14px" }}>+</button>
              </div>

              <Lbl>{t("author_note")}</Lbl>
              <textarea className="inp" rows={3} value={adv} onChange={(e) => setAdv(e.target.value)} style={{ resize: "none" }} />

              <div className="card p-3 mt-4 mono" style={{ fontSize: 10, color: T.muted, lineHeight: 1.5 }}>
                {focus.length + threads.length + newChars.length + newRules.length + custom.length} {t("extra_params")} · {t("target_fid")} {fid} · {panels}
              </div>
            </>
          )}

          {guild && (
            <button onClick={() => setPayGuild(!payGuild)} className="card p-3 mt-4 w-full text-left flex justify-between items-center"
              style={{ borderColor: payGuild ? accent : T.line, opacity: guild.pool >= cost ? 1 : .5 }}>
              <div>
                <div style={{ fontSize: 12, fontWeight: 800 }}>{t("guild_pay")}</div>
                <div style={{ fontSize: 11, color: T.muted, marginTop: 2 }}>{guild.n} · {t("vault")} <Coin n={guild.pool} size={11} /></div>
              </div>
              <div style={{
                width: 20, height: 20, borderRadius: 6, flexShrink: 0, border: `2px solid ${payGuild ? accent : T.line}`,
                background: payGuild ? accent : "transparent", display: "grid", placeItems: "center", fontSize: 11, color: "#fff",
              }}>{payGuild ? "✓" : ""}</div>
            </button>
          )}

          {err && <div style={{ fontSize: 12, color: T.hanko, marginTop: 12 }}>{err}</div>}
          <button onClick={run} disabled={busy} className="btn" style={{ marginTop: 16, background: busy ? T.panel2 : accent, opacity: busy ? .7 : 1 }}>
            {busy ? t("generating") : `${t("generate")} · ◈ ${cost}`}
          </button>
          <div style={{ fontSize: 11, color: T.muted, textAlign: "center", marginTop: 10 }}>
            {t("balance")}: <Coin n={useGuild ? guild.pool : coins} size={11} />
          </div>
        </>
      )}
    </Sheet>
  );
}

/* ---------------- READER ---------------- */
function Reader({ s, ch, branch, onClose, accent, rate, style, saveArt, voteCanon, likeReview, replyReview, following, onFollow, onProgress, spend }) {
  const { t } = useT();
  const [ci, setCi] = useState(0);
  const [rating, setRating] = useState(false);
  const [drawing, setDrawing] = useState(-1);
  const chapters = branch?.chapters || [];
  const c = chapters[ci];
  useEffect(() => { if (branch && onProgress) onProgress(ci); }, [ci, branch]);

  const cost = c ? c.scenes.filter((x) => !x.art).length * P.panel : 0;
  const drawAll = async () => {
    if (!c || !cost) return;
    if (!spend(cost)) return;
    for (let i = 0; i < c.scenes.length; i++) {
      if (c.scenes[i].art) continue;
      setDrawing(i);
      try { const svg = await drawPanel(c.scenes[i].panel, mergedStyle(s, style), findRefForScene(s, c.scenes[i].panel), s.styleRefImage); if (svg) saveArt(ci, i, svg); } catch { /* skip */ }
    }
    setDrawing(-1);
  };

  return (
    <div className="full">
      <div className="full-in">
        <div className="sticky top-0 z-10 flex items-center justify-between px-4 py-3"
          style={{ background: "rgba(10,7,17,.95)", backdropFilter: "blur(14px)", borderBottom: `1px solid ${T.line}` }}>
          <button onClick={onClose} style={{ fontSize: 18 }}>←</button>
          <div style={{ textAlign: "center", minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 800, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {branch ? branch.title : s.title}
            </div>
            <div className="mono" style={{ fontSize: 9, color: T.muted }}>{branch ? `CH. ${c?.n ?? "—"}` : `CH. ${ch}`}</div>
          </div>
          {branch ? (
            <button onClick={onFollow} className="pill" style={{
              background: following ? accent : T.panel2, color: following ? "#fff" : T.muted,
              border: `1px solid ${following ? accent : T.line}`, fontSize: 10, padding: "6px 10px",
            }}>{following ? t("following") : t("follow")}</button>
          ) : <span style={{ width: 18 }} />}
        </div>

        <div className="px-4 pt-5">
          {branch && chapters.length > 1 && (
            <div className="scroll-x flex gap-2 mb-4">
              {chapters.map((x, i) => (
                <button key={i} onClick={() => setCi(i)} className="pill" style={{
                  flexShrink: 0, padding: "7px 12px", fontSize: 11,
                  background: ci === i ? accent : T.panel, color: ci === i ? "#fff" : T.muted,
                  border: `1px solid ${ci === i ? accent : T.line}`,
                }}>{x.n}</button>
              ))}
            </div>
          )}

          {branch && c ? (
            <>
              <h1 style={{ fontSize: 22, fontWeight: 900, marginBottom: 14 }}>{c.title}</h1>
              {c.content ? (
                c.content.split(/\n\s*\n/).map((para, i) => (
                  <p key={i} style={{ fontSize: 15, lineHeight: 1.8, marginBottom: 16 }}>{para}</p>
                ))
              ) : (
                <>
                  {cost > 0 && (
                    <button onClick={drawAll} disabled={drawing >= 0} className="btn-ghost w-full mb-5" style={{ borderColor: T.gold, color: T.gold }}>
                      {drawing >= 0 ? `${t("drawing_p")} ${drawing + 1}/${c.scenes.length}…` : `${t("draw_panels")} · ◈ ${cost}`}
                    </button>
                  )}
                  {c.scenes.map((p, i) => <PanelBlock key={i} s={s} p={p} i={i} drawing={drawing} h={480} />)}
                </>
              )}
              {ci < chapters.length - 1 && (
                <button onClick={() => { setCi(ci + 1); window.scrollTo(0, 0); }} className="btn mb-4" style={{ background: accent }}>{t("next_ch")}</button>
              )}
            </>
          ) : (
            Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="mb-4" style={{ ...cover(s.hue + i * 15, 200 + (i % 3) * 60), borderRadius: 12, display: "grid", placeItems: "center" }}>
                <span className="mono" style={{ fontSize: 10, color: "rgba(255,255,255,.35)" }}>PANEL {i + 1}</span>
              </div>
            ))
          )}

          {branch && (
            <>
              <ScorePanel b={branch} accent={accent} onRate={() => setRating(true)} onVote={voteCanon}
                onLike={likeReview} onReply={replyReview} />
              {rating && <RateSheet close={() => setRating(false)} accent={accent}
                submit={(rv) => { rate(s.id, branch.id, rv); setRating(false); }} />}
            </>
          )}
          <div style={{ textAlign: "center", padding: "20px 0 50px" }}>
            <div className="hanko">{t("chapter_over")}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* --- score + canon vote + comments/replies --- */
function ScorePanel({ b, accent, onRate, onVote, onLike, onReply }) {
  const { t } = useT();
  const sc = scoreOf(b), ai = aiOf(b), h = humanOf(b), cn = canonOf(b);
  const mine = (b.reviews || []).find((r) => r.mine);
  const [open, setOpen] = useState(null);
  const [txt, setTxt] = useState("");

  const send = (rid) => {
    const v = txt.trim(); if (!v) return;
    onReply(rid, v); setTxt(""); setOpen(null);
  };

  return (
    <div className="mt-2">
      <div className="card p-4">
        <div className="flex justify-between items-start">
          <div>
            <div className="mono" style={{ fontSize: 10, color: T.muted, letterSpacing: ".14em" }}>{t("joint_score")}</div>
            <div className="mono" style={{ fontSize: 32, fontWeight: 700, color: scoreColor(sc.total), lineHeight: 1.1 }}>{sc.total}</div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div className="mono" style={{ fontSize: 10, color: T.muted }}>◆ AI {avgOf(ai)}</div>
            <div className="mono" style={{ fontSize: 10, color: h ? T.gold : T.muted, marginTop: 2 }}>▲ {avgOf(h || {})} ({sc.n})</div>
            <div className="mono" style={{ fontSize: 9, color: T.muted, marginTop: 4 }}>{h ? `${Math.round(sc.wH * 100)}% ▲` : t("no_readers")}</div>
          </div>
        </div>
        <div className="mt-3">
          {AXES.map((a) => (
            <div key={a.k} className="mb-2">
              <div className="flex justify-between mono" style={{ fontSize: 10, color: T.muted, marginBottom: 3 }}>
                <span>{t(a.l)}</span>
                <span>
                  <span style={{ color: T.muted }}>◆{ai[a.k]}</span>
                  {h && <span style={{ color: T.gold, marginLeft: 6 }}>▲{h[a.k]}</span>}
                  <span style={{ color: scoreColor(sc[a.k]), marginLeft: 6, fontWeight: 700 }}>{sc[a.k]}</span>
                </span>
              </div>
              <Bar v={sc[a.k]} g={100} c={scoreColor(sc[a.k])} />
            </div>
          ))}
        </div>
      </div>

      <div className="card p-4 mt-2" style={{ borderColor: cn.sealed ? T.gold : T.line }}>
        <div className="flex justify-between items-center">
          <span className="mono" style={{ fontSize: 10, color: cn.sealed ? T.gold : T.muted, letterSpacing: ".14em" }}>
            {cn.sealed ? t("canon_sealed") : t("canon_vote")}
          </span>
          <span className="mono" style={{ fontSize: 10, color: T.muted }}>{cn.t} {t("votes_w")}</span>
        </div>
        <div style={{ margin: "10px 0 6px" }}><Bar v={cn.pct} g={100} c={cn.sealed ? T.gold : accent} /></div>
        <div className="flex justify-between mono" style={{ fontSize: 10, color: T.muted }}>
          <span style={{ color: cn.sealed ? T.gold : T.paper, fontWeight: 700 }}>{cn.pct}%</span>
          <span>{CANON_PCT}% · {CANON_MIN}</span>
        </div>
        {cn.sealed ? (
          <div style={{ fontSize: 12, color: T.muted, marginTop: 10, lineHeight: 1.5 }}>{t("canon_sealed_d")}</div>
        ) : b.myCanonVote !== undefined ? (
          <div className="mono" style={{ fontSize: 11, color: accent, marginTop: 10 }}>
            {t("your_vote")}: {b.myCanonVote ? "⛩ " + t("vote_yes") : "✕ " + t("vote_no")}
          </div>
        ) : (
          <div className="flex gap-2 mt-3">
            <button onClick={() => onVote(false)} className="btn-ghost" style={{ flex: 1, fontSize: 12 }}>✕ {t("vote_no")}</button>
            <button onClick={() => onVote(true)} className="btn" style={{ flex: 1.3, background: T.gold, color: "#000", fontSize: 13 }}>⛩ {t("vote_yes")}</button>
          </div>
        )}
      </div>

      {mine ? (
        <div className="card p-3 mt-2" style={{ borderColor: accent }}>
          <div className="mono" style={{ fontSize: 9, color: accent, letterSpacing: ".14em" }}>{t("rated_ok")}</div>
          <div style={{ fontSize: 12, marginTop: 6, lineHeight: 1.5 }}>{mine.t || t("no_comment")}</div>
        </div>
      ) : (
        <button onClick={onRate} className="btn mt-2" style={{ background: accent }}>{t("rate_this")} · +10 ◈</button>
      )}

      <div className="mono" style={{ fontSize: 10, color: T.muted, letterSpacing: ".14em", margin: "20px 0 10px" }}>
        {t("comments")} · {(b.reviews || []).length}
      </div>
      {(b.reviews || []).length === 0 && (
        <div className="card p-4" style={{ fontSize: 12, color: T.muted, textAlign: "center" }}>{t("no_comments")}</div>
      )}
      {(b.reviews || []).map((r) => (
        <div key={r.id} className="card p-3 mb-2">
          <div className="flex justify-between items-center">
            <span style={{ fontSize: 12, fontWeight: 800 }}>{r.by}</span>
            <span className="mono" style={{ fontSize: 10, color: scoreColor(avgOf({ fid: r.axes.fid * 20, char: r.axes.char * 20, pace: r.axes.pace * 20, dial: r.axes.dial * 20, orig: r.axes.orig * 20 })) }}>
              ▲ {avgOf({ fid: r.axes.fid * 20, char: r.axes.char * 20, pace: r.axes.pace * 20, dial: r.axes.dial * 20, orig: r.axes.orig * 20 })}
            </span>
          </div>
          {r.t && <div style={{ fontSize: 12, marginTop: 6, lineHeight: 1.55 }}>{r.t}</div>}
          <div className="flex items-center gap-4 mt-3">
            <button onClick={() => onLike(r.id)} className="mono" style={{ fontSize: 10, color: r.liked ? accent : T.muted }}>
              {r.liked ? "♥" : "♡"} {r.likes || 0}
            </button>
            <button onClick={() => setOpen(open === r.id ? null : r.id)} className="mono" style={{ fontSize: 10, color: T.muted }}>
              ↳ {t("reply")}
            </button>
            <span className="mono" style={{ fontSize: 9, color: T.muted, marginLeft: "auto" }}>{r.when}</span>
          </div>

          {(r.replies || []).length > 0 && (
            <div style={{ marginTop: 10, paddingLeft: 12, borderLeft: `2px solid ${T.line}` }}>
              {r.replies.map((rp) => (
                <div key={rp.id} style={{ marginBottom: 8 }}>
                  <div className="flex items-center gap-2">
                    <span style={{ fontSize: 11, fontWeight: 800 }}>{rp.by}</span>
                    {rp.author && <span className="pill" style={{ background: "rgba(139,92,246,.16)", color: accent, fontSize: 8 }}>{t("author_tag")}</span>}
                    <span className="mono" style={{ fontSize: 9, color: T.muted, marginLeft: "auto" }}>{rp.when}</span>
                  </div>
                  <div style={{ fontSize: 12, marginTop: 3, lineHeight: 1.5, color: T.muted }}>{rp.t}</div>
                </div>
              ))}
            </div>
          )}

          {open === r.id && (
            <div className="flex gap-2 mt-3 fade">
              <input className="inp" autoFocus value={txt} onChange={(e) => setTxt(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && send(r.id)} placeholder={t("reply_ph")} />
              <button onClick={() => send(r.id)} className="btn" style={{ width: "auto", padding: "0 16px", background: accent }}>→</button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function RateSheet({ close, submit, accent }) {
  const { t } = useT();
  const [ax, setAx] = useState({ fid: 0, char: 0, pace: 0, dial: 0, orig: 0 });
  const [txt, setTxt] = useState("");
  const all = AXES.every((a) => ax[a.k] > 0);
  return (
    <Sheet close={close}>
      <h2 style={{ fontSize: 19, fontWeight: 900 }}>{t("rate_this")}</h2>
      <div style={{ fontSize: 12, color: T.muted, marginTop: 4, marginBottom: 16 }}>{t("rate_sub")}</div>
      {AXES.map((a) => (
        <div key={a.k} className="mb-4">
          <div style={{ fontSize: 13, fontWeight: 700 }}>{t(a.l)}</div>
          <div style={{ fontSize: 11, color: T.muted, marginTop: 2, marginBottom: 8 }}>{t(a.d)}</div>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((n) => (
              <button key={n} onClick={() => setAx({ ...ax, [a.k]: n })} className="flex-1"
                style={{
                  padding: "10px 0", borderRadius: 9, fontSize: 13, fontWeight: 700,
                  background: ax[a.k] >= n ? accent : T.panel2, color: ax[a.k] >= n ? "#fff" : T.muted,
                  border: `1px solid ${ax[a.k] >= n ? accent : T.line}`,
                }}>★</button>
            ))}
          </div>
        </div>
      ))}
      <Lbl>{t("your_comment")}</Lbl>
      <textarea className="inp" rows={3} value={txt} onChange={(e) => setTxt(e.target.value)} placeholder={t("comment_ph")} style={{ resize: "none" }} />
      {all && (
        <div className="card p-3 mt-4 flex justify-between items-center">
          <span style={{ fontSize: 12, color: T.muted }}>{t("your_score")}</span>
          <span className="mono" style={{ fontSize: 20, fontWeight: 700, color: scoreColor(avgOf(AXES.reduce((o, a) => (o[a.k] = ax[a.k] * 20, o), {}))) }}>
            {avgOf(AXES.reduce((o, a) => (o[a.k] = ax[a.k] * 20, o), {}))}
          </span>
        </div>
      )}
      <button onClick={() => submit({ axes: ax, t: txt.trim() })} disabled={!all} className="btn mt-4"
        style={{ background: all ? accent : T.panel2, color: all ? "#fff" : T.muted }}>
        {all ? `${t("send_rating")} · +10 ◈` : t("rate_all")}
      </button>
    </Sheet>
  );
}

/* ---------------- PANEL EDITOR ---------------- */
function PanelEditor({ init, close, say, accent, style, spend }) {
  const { t } = useT();
  const [panels, setPanels] = useState(init.panels);
  const [sel, setSel] = useState(null);
  const [drawing, setDrawing] = useState(null);
  const drag = useRef(null);

  const upd = (pid, fn) => setPanels((ps) => ps.map((p) => p.id === pid ? fn(p) : p));
  const addEl = (pid, type) => {
    const el = { id: uid(), type, text: type === "sfx" ? "BOOM" : t("ed_text"), x: 50, y: 40, w: 55, fs: type === "sfx" ? 26 : 12 };
    upd(pid, (p) => ({ ...p, els: [...p.els, el] }));
    setSel({ pid, eid: el.id });
  };
  const addPanel = () => setPanels((ps) => [...ps, { id: uid(), h: 240, hue: init.hue + ps.length * 20, note: "", els: [] }]);

  const draw = async (p) => {
    if (!p.note) return say(t("ed_nonote"));
    if (!spend(P.panel)) return;
    setDrawing(p.id);
    try { const svg = await drawPanel(p.note, style); if (svg) upd(p.id, (x) => ({ ...x, art: svg })); else say(t("ed_nodraw")); }
    catch { say(t("ed_nodraw")); }
    setDrawing(null);
  };

  const down = (e, pid, el) => {
    e.stopPropagation();
    const box = e.currentTarget.parentElement.getBoundingClientRect();
    drag.current = { pid, eid: el.id, box };
    setSel({ pid, eid: el.id });
  };
  const move = (e) => {
    if (!drag.current) return;
    const { pid, eid, box } = drag.current;
    const pt = e.touches ? e.touches[0] : e;
    const x = Math.max(4, Math.min(96, ((pt.clientX - box.left) / box.width) * 100));
    const y = Math.max(4, Math.min(94, ((pt.clientY - box.top) / box.height) * 100));
    upd(pid, (p) => ({ ...p, els: p.els.map((el) => el.id === eid ? { ...el, x, y } : el) }));
  };
  const up = () => { drag.current = null; };

  const selP = panels.find((p) => p.id === sel?.pid);
  const selE = selP?.els.find((e) => e.id === sel?.eid);
  const setE = (k, v) => upd(sel.pid, (p) => ({ ...p, els: p.els.map((e) => e.id === sel.eid ? { ...e, [k]: v } : e) }));

  const elStyle = (el) => {
    const base = { left: `${el.x}%`, top: `${el.y}%`, transform: "translate(-50%,-50%)", width: `${el.w}%`, fontSize: el.fs };
    if (el.type === "sfx") return { ...base, background: "transparent", color: "#fff", fontWeight: 900, fontStyle: "italic",
      textShadow: "2px 2px 0 #000,-2px -2px 0 #000,2px -2px 0 #000,-2px 2px 0 #000", fontFamily: "Unbounded" };
    if (el.type === "narr") return { ...base, background: "rgba(10,7,17,.9)", color: T.paper, borderRadius: 4, border: `1px solid ${T.line}`, textAlign: "left" };
    if (el.type === "thought") return { ...base, background: "#fff", color: "#111", borderRadius: 22, fontStyle: "italic" };
    return base;
  };

  return (
    <div className="full" onMouseMove={move} onMouseUp={up} onTouchMove={move} onTouchEnd={up}>
      <div className="full-in">
        <div className="sticky top-0 z-10 flex items-center justify-between px-4 py-3"
          style={{ background: "rgba(10,7,17,.95)", backdropFilter: "blur(14px)", borderBottom: `1px solid ${T.line}` }}>
          <button onClick={close} style={{ fontSize: 18 }}>←</button>
          <div className="mono" style={{ fontSize: 10, color: accent, letterSpacing: ".14em" }}>{t("ed_t")}</div>
          <button onClick={() => { say(t("ed_saved")); close(); }} className="pill"
            style={{ background: accent, color: "#fff", padding: "7px 14px", fontSize: 11 }}>{t("save")}</button>
        </div>

        <div className="px-4 pt-4">
          <h1 style={{ fontSize: 19, fontWeight: 900, marginBottom: 12 }}>{init.title}</h1>
          {panels.map((p, i) => (
            <div key={p.id} className="mb-3">
              <div className="flex justify-between items-center mb-1">
                <span className="mono" style={{ fontSize: 9, color: T.muted }}>PANEL {i + 1}</span>
                <div className="flex gap-2">
                  <button onClick={() => draw(p)} disabled={!!drawing} className="mono" style={{ fontSize: 10, color: T.gold }}>
                    {drawing === p.id ? t("drawing_u") : "✎"}
                  </button>
                  <button onClick={() => setPanels((ps) => ps.filter((x) => x.id !== p.id))} className="mono" style={{ fontSize: 10, color: T.muted }}>×</button>
                </div>
              </div>
              <div onClick={() => setSel({ pid: p.id })} className="relative overflow-hidden"
                style={{ height: p.h, borderRadius: 10, background: p.art ? "#000" : undefined,
                  ...(p.art ? {} : cover(p.hue, p.h)),
                  border: sel?.pid === p.id ? `2px solid ${accent}` : `1px solid ${T.line}`, touchAction: "none" }}>
                <ArtLayer art={p.art} />
                {!p.art && p.note && (
                  <span className="mono" style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", padding: 20,
                    fontSize: 10, color: "rgba(255,255,255,.4)", textAlign: "center", lineHeight: 1.6 }}>{p.note}</span>
                )}
                {drawing === p.id && (
                  <div className="pulse" style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", background: "rgba(0,0,0,.6)" }}>
                    <span className="mono" style={{ fontSize: 10, color: T.gold }}>{t("drawing_u")}</span>
                  </div>
                )}
                {p.els.map((el) => (
                  <div key={el.id} onMouseDown={(e) => down(e, p.id, el)} onTouchStart={(e) => down(e, p.id, el)}
                    className={el.type === "bubble" ? "bub bub-tail" : "bub"}
                    style={{ ...elStyle(el), position: "absolute", outline: sel?.eid === el.id ? `2px solid ${accent}` : "none", cursor: "grab" }}>
                    {el.text}
                  </div>
                ))}
              </div>
              {sel?.pid === p.id && (
                <div className="flex gap-2 mt-2 fade">
                  {[["bubble", t("el_bubble")], ["thought", t("el_thought")], ["narr", t("el_narr")], ["sfx", t("el_sfx")]].map(([k, l]) => (
                    <button key={k} onClick={() => addEl(p.id, k)} className="pill flex-1 justify-center"
                      style={{ background: T.panel2, color: accent, border: `1px solid ${T.line}`, padding: "8px 0", fontSize: 10 }}>+ {l}</button>
                  ))}
                </div>
              )}
            </div>
          ))}
          <button onClick={addPanel} className="btn-ghost w-full">{t("ed_add")}</button>
          <div style={{ height: selE ? 240 : 40 }} />
        </div>

        {selE && (
          <div className="fade" style={{
            position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 20, background: T.panel,
            borderTop: `1px solid ${accent}`, padding: 16, maxWidth: 760, margin: "0 auto",
          }}>
            <div className="flex justify-between items-center mb-2">
              <span className="mono" style={{ fontSize: 9, color: accent, letterSpacing: ".14em" }}>
                {t("ed_sel")} · {t("el_" + (selE.type === "narr" ? "narr" : selE.type))} · {t("ed_hint")}
              </span>
              <button onClick={() => { upd(sel.pid, (p) => ({ ...p, els: p.els.filter((e) => e.id !== sel.eid) })); setSel({ pid: sel.pid }); }}
                style={{ color: T.hanko, fontSize: 12 }}>{t("del")}</button>
            </div>
            <input className="inp" value={selE.text} onChange={(e) => setE("text", e.target.value)} />
            <div className="flex gap-3 mt-3">
              <div style={{ flex: 1 }}>
                <div className="mono" style={{ fontSize: 9, color: T.muted, marginBottom: 4 }}>{t("ed_wide")}</div>
                <Slider v={selE.w} set={(v) => setE("w", v)} a="" b="" accent={accent} min={20} max={90} />
              </div>
              <div style={{ flex: 1 }}>
                <div className="mono" style={{ fontSize: 9, color: T.muted, marginBottom: 4 }}>{t("ed_size")}</div>
                <Slider v={selE.fs} set={(v) => setE("fs", v)} a="" b="" accent={accent} min={9} max={40} />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ---------------- NOVEL → WEBTOON ---------------- */
function Converter({ close, accent, toEditor, say, spend }) {
  const { t, lang } = useT();
  const [txt, setTxt] = useState("");
  const [busy, setBusy] = useState(false);

  const run = async () => {
    if (txt.trim().length < 60) return say(t("conv_short"));
    if (!spend(P.convert)) return;
    setBusy(true);
    try {
      const r = await ask(`Turn this prose into webtoon panels. ${langLine(lang)}

TEXT:
${txt.slice(0, 2500)}

Return ONLY this JSON, no markdown:
{"title":"chapter title","panels":[{"note":"visual framing direction, one sentence","line":"the dialogue spoken in the panel, or empty string"}]}
Between 5 and 9 panels. Keep the mood of the text.`);
      const o = asJSON(r);
      toEditor({
        title: o.title, hue: 268,
        panels: o.panels.map((p, i) => ({
          id: uid(), h: 240 + (i % 3) * 60, hue: 268 + i * 20, note: p.note,
          els: p.line ? [{ id: uid(), type: "bubble", text: p.line, x: 50, y: 25, w: 55, fs: 12 }] : [],
        })),
      });
    } catch { say(t("conv_err")); }
    setBusy(false);
  };

  return (
    <Sheet close={close}>
      <h2 style={{ fontSize: 19, fontWeight: 900 }}>{t("conv_t")}</h2>
      <div style={{ fontSize: 12, color: T.muted, marginTop: 4, marginBottom: 14 }}>{t("conv_d")}</div>
      <textarea className="inp" rows={9} value={txt} onChange={(e) => setTxt(e.target.value)} placeholder={t("conv_ph")} style={{ resize: "none", lineHeight: 1.6 }} />
      <button onClick={run} disabled={busy} className="btn mt-4" style={{ background: busy ? T.panel2 : accent, opacity: busy ? .7 : 1 }}>
        {busy ? t("conv_busy") : `${t("conv_btn")} · ◈ ${P.convert}`}
      </button>
    </Sheet>
  );
}

/* ---------------- QUESTS ---------------- */
function Quests({ claimed, claim, accent }) {
  const { t, lang } = useT();
  const Row = ({ q, c }) => {
    const done = q.p >= q.g || claimed[q.id];
    return (
      <div className="card p-4 mb-2">
        <div className="flex justify-between items-start gap-3">
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 700 }}>{q[lang] || q.en}</div>
            <div className="mono" style={{ fontSize: 10, color: T.muted, marginTop: 3 }}>{Math.min(q.p, q.g)}/{q.g}</div>
          </div>
          {claimed[q.id] ? (
            <span className="pill" style={{ background: T.panel2, color: T.muted, fontSize: 10, flexShrink: 0 }}>{t("claimed")}</span>
          ) : (
            <button onClick={() => claim(q)} disabled={!done} className="pill" style={{
              flexShrink: 0, padding: "7px 12px", fontSize: 11,
              background: done ? c : T.panel2, color: done ? "#000" : T.muted, fontWeight: 800,
            }}>{done ? `${t("claim")} ◈${q.c}` : `◈ ${q.c}`}</button>
          )}
        </div>
        <div style={{ marginTop: 10 }}><Bar v={Math.min(q.p, q.g)} g={q.g} c={c} /></div>
      </div>
    );
  };
  return (
    <div className="fade">
      <h1 style={{ fontSize: 26, fontWeight: 900, marginTop: 20 }}>{t("quests_t")}</h1>
      <div style={{ fontSize: 13, color: T.muted, marginTop: 4 }}>{t("quests_sub")}</div>

      <div className="card p-4 mt-5" style={{ borderColor: T.gold }}>
        <div className="flex justify-between items-center mb-3">
          <span style={{ fontSize: 13, fontWeight: 800 }}>{t("streak")}</span>
          <span className="mono" style={{ fontSize: 12, color: T.gold }}>4 {t("days")}</span>
        </div>
        <div className="flex gap-1.5">
          {[1, 2, 3, 4, 5, 6, 7].map((d) => (
            <div key={d} style={{
              flex: 1, height: 30, borderRadius: 7, display: "grid", placeItems: "center",
              background: d <= 4 ? T.gold : T.panel2, color: d <= 4 ? "#000" : T.muted, fontSize: 10, fontWeight: 700,
            }}>{d === 7 ? "★" : d}</div>
          ))}
        </div>
        <div style={{ fontSize: 11, color: T.muted, marginTop: 8 }}>{t("on_day7")} <Coin n={100} size={11} /></div>
      </div>

      <Head k={t("q_daily")} t={t("q_today")} />
      {QUESTS.daily.map((q) => <Row key={q.id} q={q} c={accent} />)}
      <Head k={t("q_weekly")} t={t("q_week")} />
      {QUESTS.weekly.map((q) => <Row key={q.id} q={q} c={T.gold} />)}
      <Head k={t("q_monthly")} t={t("q_month")} />
      {QUESTS.monthly.map((q) => <Row key={q.id} q={q} c={T.hanko} />)}
      <div style={{ height: 24 }} />
    </div>
  );
}

/* ---------------- GUILDS ---------------- */
function Guilds({ accent, guilds, guild, coins, series, join, leave, create, donate, setProject, say }) {
  const { t, lang } = useT();
  const [tab, setTab] = useState(guild ? "mine" : "browse");
  const [mk, setMk] = useState(false);
  const [gn, setGn] = useState(""); const [gt, setGt] = useState("");
  const [amt, setAmt] = useState(100);
  const [pick, setPick] = useState(false);
  const mine = series.flatMap((s) => s.branches.filter((b) => b.mine).map((b) => ({ s, b })));

  return (
    <div className="fade">
      <h1 style={{ fontSize: 26, fontWeight: 900, marginTop: 20 }}>{t("guilds_t")}</h1>
      <div style={{ fontSize: 13, color: T.muted, marginTop: 4 }}>{t("guilds_sub")}</div>

      <div className="flex gap-1 mt-5 p-1 card" style={{ borderRadius: 12 }}>
        {[["mine", t("g_mine")], ["browse", t("g_browse")], ["league", t("g_league")]].map(([k, l]) => (
          <button key={k} onClick={() => setTab(k)} className="flex-1 py-2" style={{
            fontSize: 12, fontWeight: 800, borderRadius: 9,
            background: tab === k ? accent : "transparent", color: tab === k ? "#fff" : T.muted,
          }}>{l}</button>
        ))}
      </div>

      {tab === "mine" && (guild ? (
        <div className="mt-5">
          <div className="card overflow-hidden">
            <div style={{ ...cover(guild.hue, 90), display: "flex", alignItems: "flex-end", padding: 14 }}>
              <div>
                <div className="flex items-center gap-2">
                  <span className="pill mono" style={{ background: "rgba(0,0,0,.45)", fontSize: 10 }}>{guild.tag}</span>
                  <h2 style={{ fontSize: 19, fontWeight: 900 }}>{guild.n}</h2>
                </div>
                <div className="mono" style={{ fontSize: 10, color: "rgba(255,255,255,.6)", marginTop: 3 }}>LV {guild.lv} · {guild.members}</div>
              </div>
            </div>
            <div className="p-4">
              <div style={{ fontSize: 12, color: T.muted }}>{t("g_vault")}</div>
              <div style={{ marginBottom: 4 }}><Coin n={guild.pool} size={22} /></div>
              <div style={{ fontSize: 11, color: T.muted, lineHeight: 1.5 }}>{t("g_vault_d")}</div>
              <div className="flex gap-2 mt-4 items-center">
                {[100, 250, 500].map((n) => (
                  <button key={n} onClick={() => setAmt(n)} className="pill flex-1 justify-center" style={{
                    padding: "9px 0", fontSize: 11,
                    background: amt === n ? accent : T.panel2, color: amt === n ? "#fff" : T.muted,
                    border: `1px solid ${amt === n ? accent : T.line}`,
                  }}>◈ {n}</button>
                ))}
              </div>
              <button onClick={() => donate(amt)} disabled={coins < amt} className="btn mt-2"
                style={{ background: coins < amt ? T.panel2 : T.gold, color: coins < amt ? T.muted : "#000" }}>{t("g_donate")}</button>
            </div>
          </div>

          <Head k={t("g_proj")} t={guild.proj ? guild.proj.title : t("g_proj_none")} />
          <div className="card p-4">
            {guild.proj ? (
              <>
                <div style={{ fontSize: 12, color: T.muted }}>{guild.proj.series}</div>
                <button onClick={() => setPick(true)} className="btn-ghost mt-3 w-full" style={{ fontSize: 12 }}>{t("g_proj_change")}</button>
              </>
            ) : (
              <>
                <div style={{ fontSize: 12, color: T.muted, lineHeight: 1.5, marginBottom: 10 }}>{t("g_proj_d")}</div>
                <button onClick={() => setPick(true)} className="btn" style={{ background: accent }}>{t("g_proj_pick")}</button>
              </>
            )}
          </div>

          <Head k={t("g_quest")} t={t("q_week")} />
          <div className="card p-4">
            <div style={{ fontSize: 13, fontWeight: 800 }}>{guild.quest[lang] || guild.quest.en}</div>
            <div style={{ margin: "10px 0 6px" }}><Bar v={guild.quest.p} g={guild.quest.g} c={T.gold} /></div>
            <div className="flex justify-between mono" style={{ fontSize: 10, color: T.muted }}>
              <span>{guild.quest.p}/{guild.quest.g}</span>
              <span>{t("g_reward")} ◈ {guild.quest.c.toLocaleString("en-US")} · {t("to_vault")}</span>
            </div>
            <div style={{ fontSize: 11, color: T.muted, marginTop: 8, lineHeight: 1.5 }}>{t("g_quest_d")}</div>
          </div>

          <Head k={t("g_feed")} t={t("g_feed_t")} />
          {guild.log.map((l) => (
            <div key={l.id} className="card p-3 mb-2">
              <div style={{ fontSize: 12, lineHeight: 1.45 }}>{l.t}</div>
              <div className="mono" style={{ fontSize: 9, color: T.muted, marginTop: 4 }}>{l.when}</div>
            </div>
          ))}
          <button onClick={leave} className="btn-ghost mt-4 w-full" style={{ borderColor: T.hanko, color: T.hanko }}>{t("g_leave")}</button>

          {pick && (
            <Sheet close={() => setPick(false)}>
              <h2 style={{ fontSize: 19, fontWeight: 900, marginBottom: 14 }}>{t("g_proj_pick")}</h2>
              {mine.length ? mine.map(({ s, b }) => (
                <button key={b.id} onClick={() => { setProject({ title: b.title, series: s.title, sid: s.id, bid: b.id }); setPick(false); }}
                  className="card p-3 mb-2 w-full text-left flex items-center gap-3">
                  <div style={{ width: 36, height: 46, borderRadius: 8, flexShrink: 0, ...cover(s.hue, 46) }} />
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 800 }}>{b.title}</div>
                    <div style={{ fontSize: 11, color: T.muted, marginTop: 2 }}>{s.title} · {b.chapters?.length || 0}</div>
                  </div>
                </button>
              )) : <div className="card p-4" style={{ fontSize: 12, color: T.muted, lineHeight: 1.5 }}>{t("g_proj_none_d")}</div>}
            </Sheet>
          )}
        </div>
      ) : (
        <div className="mt-5">
          <div className="card p-5 text-center">
            <div style={{ fontSize: 15, fontWeight: 800 }}>{t("g_none")}</div>
            <div style={{ fontSize: 12, color: T.muted, marginTop: 6, lineHeight: 1.5 }}>{t("g_none_d")}</div>
            <button onClick={() => setTab("browse")} className="btn mt-4" style={{ background: accent }}>{t("g_find")}</button>
            <button onClick={() => setMk(true)} className="btn-ghost mt-2 w-full" style={{ fontSize: 12 }}>{t("g_create")} · ◈ 500</button>
          </div>
          {mk && (
            <Sheet close={() => setMk(false)}>
              <h2 style={{ fontSize: 19, fontWeight: 900 }}>{t("g_create_t")}</h2>
              <div style={{ fontSize: 12, color: T.muted, marginTop: 4 }}>{t("g_create_d")}</div>
              <Lbl>{t("g_name")}</Lbl>
              <input className="inp" value={gn} onChange={(e) => setGn(e.target.value)} placeholder="Nightweave" />
              <Lbl hint={t("g_tag_h")}>{t("g_tag")}</Lbl>
              <input className="inp mono" value={gt} onChange={(e) => setGt(e.target.value.slice(0, 3))} placeholder="NW" />
              <button onClick={() => { if (gn.trim() && gt.trim()) { create(gn.trim(), gt.trim()); setMk(false); setTab("mine"); } }}
                className="btn mt-4" style={{ background: accent }}>{t("g_create_btn")} · ◈ 500</button>
            </Sheet>
          )}
        </div>
      ))}

      {tab === "browse" && (
        <div className="mt-5">
          {guilds.map((g) => (
            <div key={g.id} className="card p-4 mb-3 flex justify-between items-start gap-3">
              <div style={{ minWidth: 0 }}>
                <div className="flex items-center gap-2">
                  <span className="pill mono" style={{ background: T.panel2, color: T.muted, fontSize: 9 }}>{g.tag}</span>
                  <span style={{ fontSize: 15, fontWeight: 800 }}>{g.n}</span>
                </div>
                <div style={{ fontSize: 11, color: T.muted, marginTop: 4 }}>Lv.{g.lv} · {g.members}</div>
                <div style={{ fontSize: 12, marginTop: 8 }}>{g.proj ? g.proj.title : t("g_proj_none")}</div>
              </div>
              <div style={{ textAlign: "right", flexShrink: 0 }}>
                <Coin n={g.pool} size={12} />
                {guild?.id === g.id ? (
                  <div className="mono mt-2" style={{ fontSize: 10, color: accent }}>{t("g_member")}</div>
                ) : (
                  <button onClick={() => { join(g.id); setTab("mine"); }} disabled={!!guild} className="btn-ghost mt-2"
                    style={{ padding: "6px 12px", fontSize: 11, borderColor: guild ? T.line : accent, color: guild ? T.muted : accent }}>
                    {guild ? t("g_have") : t("g_join")}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === "league" && (
        <div className="mt-5">
          <div className="hanko" style={{ marginBottom: 14 }}>{t("g_season")}</div>
          {[...guilds].sort((a, b) => (b.pool + b.lv * 1000) - (a.pool + a.lv * 1000)).map((g, i) => (
            <div key={g.id} className="card p-3 mb-2 flex items-center gap-3" style={{ borderColor: guild?.id === g.id ? accent : T.line }}>
              <span className="mono" style={{ fontSize: 18, fontWeight: 700, color: i === 0 ? T.gold : T.muted, width: 26 }}>{i + 1}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 800 }}>{g.n}</div>
                <div className="mono" style={{ fontSize: 10, color: T.muted, marginTop: 2 }}>
                  {Math.round(g.pool / 100) + g.lv * 10} {t("g_pts")} · Lv.{g.lv}
                </div>
              </div>
              {i === 0 && <span className="pill" style={{ background: "rgba(240,180,41,.15)", color: T.gold }}>{t("g_leader")}</span>}
            </div>
          ))}
          <div className="card p-3 mt-3" style={{ fontSize: 11, color: T.muted, lineHeight: 1.5 }}>{t("g_pts_d")}</div>
        </div>
      )}
      <div style={{ height: 24 }} />
    </div>
  );
}

/* ---------------- MARKET (real escrow jobs) ---------------- */
function Market({ accent, coins, creators, jobs, listing, setListing, hire, deliverJob, approveJob, reviseJob, style, say }) {
  const { t, lang } = useT();
  const [tab, setTab] = useState("browse");
  const [filter, setFilter] = useState(t("all"));
  const [hiring, setHiring] = useState(null);
  const [brief, setBrief] = useState("");
  const [budget, setBudget] = useState(0);
  const [rev, setRev] = useState(null);
  const [revNote, setRevNote] = useState("");
  const [working, setWorking] = useState(null);

  const [ln, setLn] = useState(""); const [lr, setLr] = useState(0); const [lp, setLp] = useState(400);
  const [lsk, setLsk] = useState("");
  const roles = ROLES[lang] || ROLES.en;
  const open = jobs.filter((j) => j.status !== "done");
  const all = listing ? [listing, ...creators] : creators;
  const list = filter === t("all") ? all : all.filter((c) => roles[c.role] === filter);

  /* the creator "works" — AI writes a delivery note and draws the panel */
  const doWork = async (job) => {
    setWorking(job.id);
    try {
      const msg = await ask(`You are ${job.cname}, a professional ${(ROLES.en[job.role] || "creator").toLowerCase()} on a webtoon marketplace.
A client hired you for: "${job.brief}"
${langLine(lang)}
Write a short delivery note to the client (2-3 sentences). Describe what you made and one choice you made on purpose. Confident, warm, professional. Plain text only.`);
      const art = await drawPanel(job.brief, style);
      deliverJob(job.id, msg.trim(), art);
    } catch { say(t("gen_failed")); }
    setWorking(null);
  };

  const fee = Math.round(budget * FEE);

  return (
    <div className="fade">
      <h1 style={{ fontSize: 26, fontWeight: 900, marginTop: 20 }}>{t("market_t")}</h1>
      <div style={{ fontSize: 13, color: T.muted, marginTop: 4, lineHeight: 1.5 }}>{t("market_sub")}</div>

      <div className="flex gap-1 mt-5 p-1 card" style={{ borderRadius: 12 }}>
        {[["browse", t("m_browse")], ["jobs", `${t("m_jobs")}${open.length ? ` (${open.length})` : ""}`], ["sell", t("m_sell")]].map(([k, l]) => (
          <button key={k} onClick={() => setTab(k)} className="flex-1 py-2" style={{
            fontSize: 12, fontWeight: 800, borderRadius: 9,
            background: tab === k ? accent : "transparent", color: tab === k ? "#fff" : T.muted,
          }}>{l}</button>
        ))}
      </div>

      {tab === "browse" && (
        <div className="mt-5">
          <div className="scroll-x flex gap-2 mb-4">
            {[t("all"), ...roles].map((r) => (
              <button key={r} onClick={() => setFilter(r)} className="pill" style={{
                flexShrink: 0, padding: "8px 14px", fontSize: 12,
                background: filter === r ? accent : T.panel, color: filter === r ? "#fff" : T.muted,
                border: `1px solid ${filter === r ? accent : T.line}`,
              }}>{r}</button>
            ))}
          </div>
          {list.map((c) => (
            <div key={c.id} className="card p-4 mb-3 flex gap-3">
              <div style={{ width: 46, height: 46, borderRadius: 12, flexShrink: 0, ...cover(c.hue, 46) }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="flex justify-between items-start gap-2">
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 800 }}>{c.n}{c.mine && <span className="pill" style={{ background: T.panel2, color: accent, fontSize: 8, marginLeft: 6 }}>{t("style_mine")}</span>}</div>
                    <div className="mono" style={{ fontSize: 10, color: accent, marginTop: 2 }}>{roles[c.role]}</div>
                  </div>
                  <div style={{ textAlign: "right", flexShrink: 0 }}>
                    <Coin n={c.p} size={13} />
                    <div className="mono" style={{ fontSize: 9, color: T.muted }}>{t("per_job")}</div>
                  </div>
                </div>
                <div style={{ fontSize: 12, color: T.muted, marginTop: 6 }}>{c.s[lang] || c.s.en}</div>
                <div className="flex justify-between items-center mt-3">
                  <span className="mono" style={{ fontSize: 10, color: T.gold }}>★ {c.r} · {c.jobs} {t("jobs_w")}</span>
                  {!c.mine && (
                    <button onClick={() => { setHiring(c); setBudget(c.p); setBrief(""); }} className="pill"
                      style={{ background: accent, color: "#fff", padding: "7px 14px", fontSize: 11 }}>{t("hire_t")}</button>
                  )}
                </div>
              </div>
            </div>
          ))}
          <div className="card p-3 mt-2" style={{ fontSize: 11, color: T.muted, lineHeight: 1.55 }}>{t("escrow_d")}</div>
        </div>
      )}

      {tab === "jobs" && (
        <div className="mt-5">
          {jobs.length === 0 && <div className="card p-5 text-center" style={{ fontSize: 12, color: T.muted, lineHeight: 1.5 }}>{t("no_jobs")}</div>}
          {jobs.map((j) => {
            const col = j.status === "done" ? T.violet : j.status === "delivered" ? T.gold : j.status === "revision" ? T.hanko : T.muted;
            return (
              <div key={j.id} className="card p-4 mb-3" style={{ borderColor: j.status === "delivered" ? T.gold : T.line }}>
                <div className="flex justify-between items-start gap-3">
                  <div className="flex gap-3" style={{ minWidth: 0 }}>
                    <div style={{ width: 38, height: 38, borderRadius: 10, flexShrink: 0, ...cover(j.hue, 38) }} />
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 800 }}>{j.cname}</div>
                      <div className="mono" style={{ fontSize: 9, color: col, letterSpacing: ".1em", marginTop: 3 }}>
                        ● {t("j_" + j.status)}
                      </div>
                    </div>
                  </div>
                  <div style={{ textAlign: "right", flexShrink: 0 }}>
                    <Coin n={j.budget} size={12} />
                    <div className="mono" style={{ fontSize: 9, color: T.muted, marginTop: 2 }}>
                      {j.status === "done" ? t("released") : t("escrowed")}
                    </div>
                  </div>
                </div>

                <div style={{ fontSize: 12, color: T.muted, marginTop: 10, lineHeight: 1.5 }}>{j.brief}</div>
                {j.revNote && <div style={{ fontSize: 11, color: T.hanko, marginTop: 6 }}>⟲ {j.revNote}</div>}

                {(j.status === "open" || j.status === "revision") && (
                  <button onClick={() => doWork(j)} disabled={working === j.id} className="btn-ghost w-full mt-3"
                    style={{ fontSize: 12, borderColor: working === j.id ? T.line : T.gold, color: working === j.id ? T.muted : T.gold }}>
                    {working === j.id ? `⟳ ${j.cname} ${t("working")}` : t("get_delivery")}
                  </button>
                )}

                {(j.status === "delivered" || j.status === "done") && (
                  <>
                    {j.art && (
                      <div className="relative overflow-hidden mt-3" style={{ height: 180, borderRadius: 10, background: "#000" }}>
                        <ArtLayer art={j.art} />
                      </div>
                    )}
                    {j.msg && (
                      <div className="card p-3 mt-2" style={{ background: T.panel2, borderColor: T.line }}>
                        <div className="mono" style={{ fontSize: 9, color: T.muted, letterSpacing: ".12em" }}>{t("delivered_by")} {j.cname}</div>
                        <div style={{ fontSize: 12, marginTop: 5, lineHeight: 1.55 }}>{j.msg}</div>
                      </div>
                    )}
                  </>
                )}

                {j.status === "delivered" && (
                  <div className="flex gap-2 mt-3">
                    <button onClick={() => { setRev(j.id); setRevNote(""); }} className="btn-ghost" style={{ flex: 1, fontSize: 12, borderColor: T.hanko, color: T.hanko }}>
                      {t("request_rev")}
                    </button>
                    <button onClick={() => approveJob(j.id)} className="btn" style={{ flex: 1.4, background: accent, fontSize: 13 }}>{t("approve")}</button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {tab === "sell" && (
        <div className="mt-5">
          {listing ? (
            <div className="card p-4" style={{ borderColor: accent }}>
              <div className="mono" style={{ fontSize: 9, color: accent, letterSpacing: ".14em" }}>● {t("sell_live")}</div>
              <div style={{ fontSize: 16, fontWeight: 900, marginTop: 8 }}>{listing.n}</div>
              <div className="mono" style={{ fontSize: 11, color: accent, marginTop: 2 }}>{roles[listing.role]}</div>
              <div style={{ fontSize: 12, color: T.muted, marginTop: 6 }}>{listing.s.en}</div>
              <div style={{ marginTop: 8 }}><Coin n={listing.p} size={16} /> <span className="mono" style={{ fontSize: 10, color: T.muted }}>{t("per_job")}</span></div>
              <div style={{ fontSize: 11, color: T.muted, marginTop: 10, lineHeight: 1.5 }}>{t("sell_live_d")}</div>
              <button onClick={() => setListing(null)} className="btn-ghost mt-4 w-full" style={{ borderColor: T.hanko, color: T.hanko, fontSize: 12 }}>
                {t("sell_off")}
              </button>
            </div>
          ) : (
            <>
              <div className="card p-4">
                <div style={{ fontSize: 15, fontWeight: 800 }}>{t("sell_t")}</div>
                <div style={{ fontSize: 12, color: T.muted, marginTop: 6, lineHeight: 1.5 }}>{t("sell_d")}</div>
              </div>
              <Lbl>{t("your_name")}</Lbl>
              <input className="inp" value={ln} onChange={(e) => setLn(e.target.value)} placeholder="Kadir" />
              <Lbl>{t("sell_role")}</Lbl>
              <Chips opts={roles} val={roles[lr]} set={(v) => setLr(roles.indexOf(v))} accent={accent} />
              <Lbl>{t("sell_skill")}</Lbl>
              <input className="inp" value={lsk} onChange={(e) => setLsk(e.target.value)} placeholder={t("sell_skill_ph")} />
              <Lbl>{t("sell_rate")}</Lbl>
              <Slider v={lp} set={setLp} a="◈ 50" b="◈ 2000" accent={accent} min={50} max={2000} />
              <button onClick={() => {
                if (!ln.trim() || !lsk.trim()) return say(t("add_need"));
                setListing({ id: uid(), n: ln.trim(), role: lr, s: { en: lsk.trim(), tr: lsk.trim() }, p: lp, r: 5.0, jobs: 0, hue: 268, mine: true });
                say(t("sell_live"));
              }} className="btn mt-5" style={{ background: accent }}>{t("sell_btn")}</button>
            </>
          )}
        </div>
      )}

      {hiring && (
        <Sheet close={() => setHiring(null)}>
          <div className="flex items-center gap-3 mb-4">
            <div style={{ width: 42, height: 42, borderRadius: 12, ...cover(hiring.hue, 42) }} />
            <div>
              <div style={{ fontSize: 16, fontWeight: 900 }}>{hiring.n}</div>
              <div className="mono" style={{ fontSize: 10, color: accent }}>{roles[hiring.role]} · ★ {hiring.r}</div>
            </div>
          </div>
          <Lbl>{t("brief_l")}</Lbl>
          <textarea className="inp" rows={4} value={brief} onChange={(e) => setBrief(e.target.value)} placeholder={t("brief_ph")} style={{ resize: "none" }} />
          <Lbl>{t("budget_l")}</Lbl>
          <Slider v={budget} set={setBudget} a={`◈ ${hiring.p}`} b={`◈ ${hiring.p * 3}`} accent={accent} min={hiring.p} max={hiring.p * 3} />
          <div className="card p-3 mt-4">
            <div className="flex justify-between" style={{ fontSize: 12, marginBottom: 6 }}>
              <span style={{ color: T.muted }}>{roles[hiring.role]}</span><Coin n={budget} size={12} />
            </div>
            <div className="flex justify-between" style={{ fontSize: 12, marginBottom: 6 }}>
              <span style={{ color: T.muted }}>{t("fee_l")}</span><Coin n={fee} size={12} />
            </div>
            <div className="flex justify-between items-center" style={{ borderTop: `1px solid ${T.line}`, paddingTop: 8 }}>
              <span style={{ fontSize: 13, fontWeight: 800 }}>{t("total")}</span><Coin n={budget + fee} size={16} />
            </div>
          </div>
          <button onClick={() => {
            if (brief.trim().length < 8) return say(t("add_need"));
            if (coins < budget + fee) return say(t("insufficient"));
            hire(hiring, brief.trim(), budget);
            setHiring(null); setTab("jobs");
          }} className="btn mt-4" style={{ background: accent }}>{t("hire_btn")}</button>
          <div style={{ fontSize: 11, color: T.muted, marginTop: 10, lineHeight: 1.5 }}>{t("escrow_d")}</div>
        </Sheet>
      )}

      {rev && (
        <Sheet close={() => setRev(null)}>
          <h2 style={{ fontSize: 19, fontWeight: 900, marginBottom: 12 }}>{t("request_rev")}</h2>
          <textarea className="inp" rows={4} value={revNote} onChange={(e) => setRevNote(e.target.value)} placeholder={t("rev_ph")} style={{ resize: "none" }} />
          <button onClick={() => { reviseJob(rev, revNote.trim() || "—"); setRev(null); }} className="btn mt-4"
            style={{ background: T.hanko }}>{t("request_rev")}</button>
        </Sheet>
      )}
      <div style={{ height: 24 }} />
    </div>
  );
}

/* ---------------- PROFILE ---------------- */
function Profile({ accent, setAccent, coins, say, series, reset, guild, lang, setLang, earned }) {
  const { t } = useT();
  const [frame, setFrame] = useState(t("f_ink"));
  const mine = series.flatMap((s) => s.branches.filter((b) => b.mine).map((b) => ({ s, b })));
  const canons = mine.filter(({ b }) => canonOf(b).sealed);
  const titles = ["Lantern Bearer", "Branch Opener", "Ink Lord", ...(canons.length ? ["⛩ Canon Author"] : [])];
  const [title, setTitle] = useState(titles[0]);
  const rated = mine.filter(({ b }) => (b.reviews || []).length > 0);
  const authorScore = mine.length ? Math.round(mine.reduce((s, { b }) => s + scoreOf(b).total, 0) / mine.length) : null;
  const colors = [T.violet, T.gold, T.hanko, "#22C55E", "#0EA5E9"];
  const frames = [t("f_none"), t("f_ink"), t("f_gold"), t("f_hanko")];
  const fc = frame === t("f_gold") ? T.gold : frame === t("f_hanko") ? T.hanko : frame === t("f_ink") ? accent : "transparent";

  return (
    <div className="fade">
      <div className="flex items-center gap-4 mt-6">
        <div style={{
          width: 74, height: 74, borderRadius: 22, flexShrink: 0,
          background: `linear-gradient(135deg,${accent},${T.panel2})`, display: "grid", placeItems: "center",
          fontSize: 26, fontWeight: 900, border: fc === "transparent" ? "none" : `3px solid ${fc}`,
        }}>K</div>
        <div style={{ minWidth: 0 }}>
          <h1 style={{ fontSize: 21, fontWeight: 900 }}>Kadir</h1>
          <div className="flex flex-wrap gap-2 mt-1">
            <span className="pill" style={{ background: T.panel2, color: accent }}>{title}</span>
            {guild && <span className="pill mono" style={{ background: T.panel2, color: T.muted }}>{guild.tag}</span>}
          </div>
          <div className="flex gap-5 mt-3">
            {[[t("s_branches"), String(mine.length)], ["Canon", String(canons.length)], ["Series", String(series.length)]].map(([l, v]) => (
              <div key={l}>
                <div className="mono" style={{ fontSize: 15, fontWeight: 700 }}>{v}</div>
                <div style={{ fontSize: 10, color: T.muted }}>{l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {canons.length > 0 && (
        <>
          <Head k={t("prof_canon_k")} t={t("prof_canon_t")} />
          <div className="card p-4" style={{ borderColor: T.gold }}>
            {canons.map(({ s, b }) => (
              <div key={b.id} className="flex justify-between items-center mb-3 gap-2">
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 800 }}>{b.title}</div>
                  <div style={{ fontSize: 11, color: T.muted, marginTop: 2 }}>{s.title} · {canonOf(b).pct}% {t("support")}</div>
                </div>
                <span className="pill" style={{ background: "rgba(240,180,41,.15)", color: T.gold, fontSize: 10, flexShrink: 0 }}>{t("sealed_w")}</span>
              </div>
            ))}
            <div style={{ borderTop: `1px solid ${T.line}`, paddingTop: 12, marginTop: 4 }}>
              <div className="flex justify-between items-center">
                <span style={{ fontSize: 12, color: T.muted }}>{t("canon_prize")}</span><Coin n={canons.length * CANON_PRIZE} size={15} />
              </div>
              <div className="flex justify-between items-center mt-2">
                <span style={{ fontSize: 12, color: T.muted }}>{t("weekly_cut")}</span><Coin n={canons.length * 60} size={15} />
              </div>
              <div style={{ fontSize: 11, color: T.muted, marginTop: 8, lineHeight: 1.5 }}>{t("canon_note")}</div>
            </div>
          </div>
        </>
      )}

      {authorScore !== null && (
        <>
          <Head k={t("author_k")} t={t("author_t")} />
          <div className="card p-4">
            <div className="flex items-center gap-4">
              <div className="mono" style={{ fontSize: 34, fontWeight: 700, color: scoreColor(authorScore) }}>{authorScore}</div>
              <div style={{ fontSize: 11, color: T.muted, lineHeight: 1.5 }}>
                {mine.length} {t("branches_w")} · {rated.length} {t("rated_n")}
                {rated.length === 0 && <><br />{t("no_reader_scores")}</>}
              </div>
            </div>
          </div>
        </>
      )}

      <Head k={t("econ_k")} t={t("econ_t")} />
      <div className="card p-4">
        <div className="flex justify-between items-center mb-3">
          <span style={{ fontSize: 12, color: T.muted }}>{t("earned_today")}</span>
          <span className="mono" style={{ fontSize: 13, fontWeight: 700, color: earned.n >= EARN.cap ? T.hanko : T.gold }}>
            {earned.n} / {EARN.cap}
          </span>
        </div>
        <Bar v={earned.n} g={EARN.cap} c={earned.n >= EARN.cap ? T.hanko : T.gold} />
        <div style={{ borderTop: `1px solid ${T.line}`, marginTop: 14, paddingTop: 12 }}>
          {[[t("price_chapter"), `◈ ${P.chapter}–400`], [t("price_panel"), `◈ ${P.panel} ${t("each_w")}`],
            [t("price_chat"), `◈ ${P.chat}`], [t("price_portrait"), `◈ ${P.portrait}`],
            [t("price_convert"), `◈ ${P.convert}`], [t("price_poster"), `◈ ${P.poster}`],
            [t("price_add"), t("free_w")]].map(([a, b]) => (
            <div key={a} className="flex justify-between items-center" style={{ marginBottom: 7 }}>
              <span style={{ fontSize: 12, color: T.muted }}>{a}</span>
              <span className="mono" style={{ fontSize: 11, fontWeight: 700, color: b === t("free_w") ? accent : T.gold }}>{b}</span>
            </div>
          ))}
        </div>
        <div style={{ fontSize: 11, color: T.muted, marginTop: 8, lineHeight: 1.55 }}>
          {t("econ_note").replace("{c}", String(EARN.cap))}
        </div>
      </div>

      <Head k={t("lang_k")} t={t("lang_t")} />
      <div className="flex gap-2">
        {[["en", "English"], ["tr", "Türkçe"]].map(([k, l]) => (
          <button key={k} onClick={() => setLang(k)} className="card p-3 flex-1 text-left" style={{ borderColor: lang === k ? accent : T.line }}>
            <div style={{ fontSize: 14, fontWeight: 800, color: lang === k ? accent : T.paper }}>{l}</div>
            <div className="mono" style={{ fontSize: 9, color: T.muted, marginTop: 2 }}>{k.toUpperCase()}</div>
          </button>
        ))}
      </div>

      <Head k={t("custom_k")} t={t("custom_t")} />
      <div className="card p-4">
        <Lbl>{t("accent_l")}</Lbl>
        <div className="flex gap-3">
          {colors.map((c) => (
            <button key={c} onClick={() => setAccent(c)} style={{
              width: 34, height: 34, borderRadius: 10, background: c,
              border: accent === c ? "3px solid #fff" : "none",
            }} />
          ))}
        </div>
        <Lbl>{t("frame_l")}</Lbl>
        <Chips opts={frames} val={frame} set={setFrame} accent={accent} />
        <Lbl>{t("title_l")}</Lbl>
        <Chips opts={titles} val={title} set={setTitle} accent={accent} />
      </div>

      <Head k={t("plans_k")} t={t("plans_t")} />
      {TIERS.map((x, i) => (
        <div key={i} className="card p-4 mb-2" style={{ borderColor: i === 0 ? accent : T.line }}>
          <div className="flex justify-between items-center">
            <div>
              <div style={{ fontSize: 15, fontWeight: 800, color: x.c }}>{x.n[lang] || x.n.en}</div>
              <div className="mono" style={{ fontSize: 11, color: T.muted, marginTop: 2 }}>{x.p[lang] || x.p.en}</div>
            </div>
            {i === 0 ? (
              <span className="pill" style={{ background: T.panel2, color: accent, fontSize: 10 }}>{t("current")}</span>
            ) : (
              <button onClick={() => say(t("shop_soon"))} className="pill"
                style={{ background: x.c, color: i === 2 ? "#000" : "#fff", padding: "7px 14px", fontSize: 11 }}>{t("upgrade")}</button>
            )}
          </div>
          <div style={{ marginTop: 10 }}>
            {(x.f[lang] || x.f.en).map((f) => (
              <div key={f} style={{ fontSize: 12, color: T.muted, marginBottom: 3 }}>· {f}</div>
            ))}
          </div>
        </div>
      ))}

      <Head k={t("wallet_k")} t={t("wallet_t")} />
      <div className="card p-4 flex justify-between items-center">
        <div>
          <Coin n={coins} size={22} />
          <div style={{ fontSize: 11, color: T.muted, marginTop: 2 }}>{t("wallet_d")}</div>
        </div>
        <button onClick={() => say(t("shop_soon"))} className="pill"
          style={{ background: T.gold, color: "#000", padding: "9px 16px", fontSize: 12 }}>{t("buy_coins")}</button>
      </div>

      <Head k={t("lib_k")} t={t("lib_t")} />
      {mine.length === 0 ? (
        <div className="card p-4" style={{ fontSize: 12, color: T.muted, lineHeight: 1.5 }}>{t("lib_none")}</div>
      ) : mine.map(({ s, b }) => {
        const sc = scoreOf(b);
        return (
          <div key={b.id} className="card p-3 mb-2 flex justify-between items-center gap-3">
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 800 }}>{b.title}</div>
              <div style={{ fontSize: 11, color: T.muted, marginTop: 2 }}>{s.title} · {b.chapters?.length || 0} {t("chapters_w")}</div>
            </div>
            <div className="mono" style={{ fontSize: 16, fontWeight: 700, color: scoreColor(sc.total), flexShrink: 0 }}>{sc.total}</div>
          </div>
        );
      })}

      <Head k={t("data_k")} t={t("data_t")} />
      <div className="card p-4">
        <div style={{ fontSize: 12, color: T.muted, lineHeight: 1.5 }}>{t("data_d")}</div>
        <button onClick={reset} className="btn-ghost mt-3 w-full" style={{ borderColor: T.hanko, color: T.hanko, fontSize: 12 }}>{t("wipe")}</button>
      </div>
      <div style={{ height: 24 }} />
    </div>
  );
}

/* ---------------- ADD SERIES ---------------- */
function AddSeries({ close, accent, add, say }) {
  const { t, lang } = useT();
  const [n, setN] = useState(""); const [type, setType] = useState("Manhwa");
  const [ch, setCh] = useState(""); const [yr, setYr] = useState("");
  const [desc, setDesc] = useState(""); const [busy, setBusy] = useState(false);

  const run = async () => {
    if (!n.trim() || desc.trim().length < 30) return say(t("add_need"));
    setBusy(true);
    try {
      const r = await ask(`Read this abandoned ${type} series and build a memory core. ${langLine(lang)}

TITLE: ${n}
LAST CHAPTER: ${ch || "?"} · YEAR: ${yr || "?"}
DESCRIPTION: ${desc}

Return ONLY this JSON, no markdown:
{"synopsis":"one sentence","tags":["2 genre tags"],"reason":"short reason it was dropped","chars":[{"n":"name","r":"role","d":"one-sentence identity"}],"rules":["world rule"],"threads":["unresolved question"]}
3-6 characters, 3-5 rules, 3-5 threads. Infer sensibly from the description; don't invent wildly.`);
      const o = asJSON(r);
      const w = lang === "tr" ? "az önce" : "just now";
      add({
        id: uid(), title: n.trim(), type, year: +yr || new Date().getFullYear(), chapters: +ch || 1,
        hue: Math.floor(Math.random() * 360), tags: o.tags || [type], followers: "—",
        reason: o.reason || "—", synopsis: o.synopsis || desc.slice(0, 90),
        lore: {
          chars: (o.chars || []).map((c) => ({ id: uid(), n: c.n, r: c.r, d: c.d, src: "canon" })),
          rules: (o.rules || []).map((x) => ({ id: uid(), t: x, src: "canon" })),
          threads: (o.threads || []).map((x) => ({ id: uid(), t: x, open: true })),
          log: [{ id: uid(), t: `${ch || "?"} chapters ingested, memory core built.`, src: "canon", when: w }],
        },
        branches: [],
      });
      say(t("add_ok"));
      close();
    } catch { say(t("add_err")); }
    setBusy(false);
  };

  return (
    <Sheet close={close}>
      <h2 style={{ fontSize: 19, fontWeight: 900 }}>{t("add_t")}</h2>
      <div style={{ fontSize: 12, color: T.muted, marginTop: 4, lineHeight: 1.5 }}>{t("add_d")}</div>
      <Lbl>{t("add_name")}</Lbl>
      <input className="inp" value={n} onChange={(e) => setN(e.target.value)} placeholder="Blood Lantern" />
      <Lbl>{t("add_type")}</Lbl>
      <Chips opts={["Manga", "Manhwa", "Webtoon", "Novel"]} val={type} set={setType} accent={accent} />
      <Lbl hint={t("add_where_h")}>{t("add_where")}</Lbl>
      <div className="flex gap-2">
        <input className="inp mono" value={ch} onChange={(e) => setCh(e.target.value)} placeholder="84" />
        <input className="inp mono" value={yr} onChange={(e) => setYr(e.target.value)} placeholder="2019" />
      </div>
      <Lbl hint={t("add_tell_h")}>{t("add_tell")}</Lbl>
      <textarea className="inp" rows={7} value={desc} onChange={(e) => setDesc(e.target.value)} placeholder={t("add_tell_ph")} style={{ resize: "none", lineHeight: 1.6 }} />
      <button onClick={run} disabled={busy} className="btn mt-4" style={{ background: busy ? T.panel2 : accent, opacity: busy ? .7 : 1 }}>
        {busy ? t("add_busy") : t("add_btn")}
      </button>
    </Sheet>
  );
}

/* ---------------- STYLE LIBRARY ---------------- */
function StyleLib({ close, accent, styles, setStyles, styleId, setStyleId, say, spend }) {
  const { t, lang } = useT();
  const [mk, setMk] = useState(false);
  const [n, setN] = useState(""); const [d, setD] = useState("");
  const [prev, setPrev] = useState({});
  const [busy, setBusy] = useState(null);

  const test = async (s) => {
    if (!spend(P.styleTest)) return;
    setBusy(s.id);
    try {
      const svg = await drawPanel("A lone figure on a rooftop at night, a lantern in hand, city below.", s);
      if (svg) setPrev((p) => ({ ...p, [s.id]: svg }));
    } catch { say(t("ed_nodraw")); }
    setBusy(null);
  };

  return (
    <Sheet close={close}>
      <h2 style={{ fontSize: 19, fontWeight: 900 }}>{t("style_t")}</h2>
      <div style={{ fontSize: 12, color: T.muted, marginTop: 4, lineHeight: 1.5 }}>{t("style_d")}</div>

      {mk ? (
        <div className="fade">
          <Lbl>{t("style_name")}</Lbl>
          <input className="inp" value={n} onChange={(e) => setN(e.target.value)} placeholder="Ash & Neon" />
          <Lbl hint={t("style_desc_h")}>{t("style_desc")}</Lbl>
          <textarea className="inp" rows={5} value={d} onChange={(e) => setD(e.target.value)}
            placeholder="Cold neon light, ash-grey palette, thick contour, rain-soaked reflections, cyberpunk mood" style={{ resize: "none" }} />
          <button onClick={() => {
            if (!n.trim() || d.trim().length < 15) return say(t("add_need"));
            const s = { id: uid(), n: { en: n.trim(), tr: n.trim() }, d: { en: "Yours", tr: "Senin" }, p: d.trim(), mine: true };
            setStyles([...styles, s]); setStyleId(s.id); setMk(false); setN(""); setD("");
            say(t("style_saved"));
          }} className="btn mt-4" style={{ background: accent }}>{t("style_save")}</button>
          <button onClick={() => setMk(false)} className="btn-ghost mt-2 w-full">{t("cancel")}</button>
        </div>
      ) : (
        <>
          <Lbl>{t("styles_l")}</Lbl>
          {styles.map((s) => (
            <div key={s.id} className="card p-3 mb-2" style={{ borderColor: styleId === s.id ? accent : T.line }}>
              <div className="flex justify-between items-start gap-3">
                <button onClick={() => setStyleId(s.id)} className="text-left" style={{ flex: 1, minWidth: 0 }}>
                  <div className="flex items-center gap-2">
                    <span style={{ fontSize: 14, fontWeight: 800 }}>{s.n[lang] || s.n.en}</span>
                    {s.mine && <span className="pill" style={{ background: T.panel2, color: accent, fontSize: 8 }}>{t("style_mine")}</span>}
                  </div>
                  <div style={{ fontSize: 11, color: T.muted, marginTop: 2 }}>{s.d[lang] || s.d.en}</div>
                </button>
                <div className="flex gap-2 items-center" style={{ flexShrink: 0 }}>
                  <button onClick={() => test(s)} disabled={!!busy} className="mono" style={{ fontSize: 10, color: T.gold }}>
                    {busy === s.id ? "…" : `${t("style_try")} ◈${P.styleTest}`}
                  </button>
                  {styleId === s.id && <span className="mono" style={{ fontSize: 9, color: accent }}>{t("style_sel")}</span>}
                </div>
              </div>
              {prev[s.id] && (
                <div className="relative overflow-hidden mt-3" style={{ height: 130, borderRadius: 8, background: "#000" }}>
                  <ArtLayer art={prev[s.id]} />
                  <span className="mono" style={{ position: "absolute", top: 6, left: 8, fontSize: 8, color: "rgba(255,255,255,.6)" }}>{t("style_test")}</span>
                </div>
              )}
            </div>
          ))}
          <button onClick={() => setMk(true)} className="btn-ghost w-full mt-2" style={{ borderColor: accent, color: accent }}>{t("style_new")}</button>
          <div className="card p-3 mt-4" style={{ fontSize: 11, color: T.muted, lineHeight: 1.5 }}>{t("style_note")}</div>
        </>
      )}
    </Sheet>
  );
}

/* ---------------- POSTER ---------------- */
function Poster({ close, accent, series, style, say, spend }) {
  const { t, lang } = useT();
  const [sid, setSid] = useState(series[0]?.id);
  const [line, setLine] = useState("");
  const [busy, setBusy] = useState(false);
  const [out, setOut] = useState(null);
  const s = series.find((x) => x.id === sid);

  const run = async () => {
    if (!spend(P.poster)) return;
    setBusy(true);
    try {
      let tag = line.trim();
      if (!tag) {
        const r = await ask(`Write a single short poster tagline for the ${s.type} series "${s.title}" (${s.synopsis}). ${langLine(lang)} Max 8 words. Return only the tagline.`);
        tag = r.trim().replace(/^["']|["']$/g, "");
      }
      const desc = `Poster key art for "${s.title}": ${s.synopsis} Dramatic, striking, vertical composition, main character in focus.`;
      const art = await drawPanel(desc, mergedStyle(s, style), findRefForScene(s, desc) || s.lore.chars.find((c) => c.art && !isSvgArt(c.art))?.art || null, s.styleRefImage);
      setOut({ art, tag });
    } catch { say(t("gen_failed")); }
    setBusy(false);
  };

  const download = async () => {
    // Real photo/illustration art: composite onto a canvas so title+tagline render on top of it.
    if (out.art && !isSvgArt(out.art)) {
      try {
        const img = new Image();
        img.crossOrigin = "anonymous";
        await new Promise((resolve, reject) => { img.onload = resolve; img.onerror = reject; img.src = out.art; });
        const W = 800, H = 1200, artH = 880;
        const canvas = document.createElement("canvas");
        canvas.width = W; canvas.height = H;
        const ctx = canvas.getContext("2d");
        ctx.fillStyle = T.void; ctx.fillRect(0, 0, W, H);
        const scale = Math.max(W / img.width, artH / img.height);
        const iw = img.width * scale, ih = img.height * scale;
        ctx.drawImage(img, (W - iw) / 2, (artH - ih) / 2, iw, ih);
        const grad = ctx.createLinearGradient(0, artH - 200, 0, artH);
        grad.addColorStop(0, "rgba(10,7,17,0)"); grad.addColorStop(1, "rgba(10,7,17,0.96)");
        ctx.fillStyle = grad; ctx.fillRect(0, artH - 200, W, 200);
        ctx.fillStyle = T.void; ctx.fillRect(0, artH, W, H - artH);
        ctx.fillStyle = T.paper; ctx.font = "900 44px sans-serif";
        ctx.fillText(s.title, 36, artH + 90);
        ctx.fillStyle = accent; ctx.font = "700 24px sans-serif";
        ctx.fillText(out.tag, 36, artH + 132);
        ctx.fillStyle = T.muted; ctx.font = "16px monospace";
        ctx.fillText(t("poster_foot"), 36, artH + 190);
        canvas.toBlob((blob) => {
          if (!blob) { say(t("poster_dl_err")); return; }
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url; a.download = `${s.title}-poster.png`; a.click();
          URL.revokeObjectURL(url);
          say(t("poster_dl_ok"));
        }, "image/png");
      } catch { say(t("poster_dl_err")); }
      return;
    }
    // Legacy path: art field still holds an old hand-drawn SVG string.
    try {
      const svg = `<svg viewBox="0 0 400 600" xmlns="http://www.w3.org/2000/svg">
<rect width="400" height="600" fill="${T.void}"/>
<g transform="translate(0,60)">${(out.art || "").replace(/<\/?svg[^>]*>/g, "")}</g>
<rect y="440" width="400" height="160" fill="${T.void}" opacity="0.92"/>
<text x="30" y="490" fill="${T.paper}" font-family="sans-serif" font-size="30" font-weight="900">${s.title.replace(/&/g, "&amp;")}</text>
<text x="30" y="520" fill="${accent}" font-family="sans-serif" font-size="14">${tagEsc(out.tag)}</text>
<text x="30" y="560" fill="${T.muted}" font-family="monospace" font-size="10">${t("poster_foot")}</text>
</svg>`;
      const url = URL.createObjectURL(new Blob([svg], { type: "image/svg+xml" }));
      const a = document.createElement("a");
      a.href = url; a.download = `${s.title}-poster.svg`; a.click();
      URL.revokeObjectURL(url);
      say(t("poster_dl_ok"));
    } catch { say(t("poster_dl_err")); }
  };

  return (
    <Sheet close={close}>
      <h2 style={{ fontSize: 19, fontWeight: 900 }}>{t("poster_t")}</h2>
      <div style={{ fontSize: 12, color: T.muted, marginTop: 4 }}>{t("poster_d")} {style.n[lang] || style.n.en}</div>

      {out ? (
        <div className="fade mt-4">
          <div className="relative overflow-hidden" style={{ borderRadius: 14, background: T.void, border: `1px solid ${T.line}` }}>
            <div style={{ height: 300, position: "relative", background: "#000" }}>
              <ArtLayer art={out.art} />
              <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg,transparent 45%,rgba(10,7,17,.95))" }} />
            </div>
            <div style={{ padding: 16, marginTop: -60, position: "relative" }}>
              <div className="disp" style={{ fontSize: 24, fontWeight: 900, lineHeight: 1.1 }}>{s.title}</div>
              <div style={{ fontSize: 13, color: accent, marginTop: 6, fontWeight: 700 }}>{out.tag}</div>
              <div className="mono" style={{ fontSize: 9, color: T.muted, marginTop: 12, letterSpacing: ".14em" }}>{t("poster_foot")}</div>
            </div>
          </div>
          <button onClick={download} className="btn mt-4" style={{ background: accent }}>{t("poster_dl")}</button>
          <button onClick={() => setOut(null)} className="btn-ghost mt-2 w-full">{t("poster_again")}</button>
        </div>
      ) : (
        <>
          <Lbl>{t("poster_series")}</Lbl>
          <Chips opts={series.map((x) => x.title)} val={s?.title} set={(v) => setSid(series.find((x) => x.title === v).id)} accent={accent} />
          <Lbl hint={t("poster_line_h")}>{t("poster_line")}</Lbl>
          <input className="inp" value={line} onChange={(e) => setLine(e.target.value)} placeholder="The debt is never forgotten." />
          <button onClick={run} disabled={busy} className="btn mt-4" style={{ background: busy ? T.panel2 : accent, opacity: busy ? .7 : 1 }}>
            {busy ? t("poster_busy") : `${t("poster_make")} · ◈ ${P.poster}`}
          </button>
        </>
      )}
    </Sheet>
  );
}
const tagEsc = (x) => (x || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/* ---------------- NOTIFICATIONS ---------------- */
function Notifs({ close, accent, notifs, clear }) {
  const { t } = useT();
  const ico = (k) => (k === "canon" ? "⛩" : k === "score" ? "★" : k === "job" ? "⬗" : "◈");
  const col = (k) => (k === "canon" ? T.gold : k === "score" ? accent : k === "job" ? T.violet : T.muted);
  return (
    <Sheet close={close}>
      <div className="flex justify-between items-center mb-4">
        <h2 style={{ fontSize: 19, fontWeight: 900 }}>{t("notifs_t")}</h2>
        {notifs.length > 0 && <button onClick={clear} className="mono" style={{ fontSize: 11, color: T.muted }}>{t("clear")}</button>}
      </div>
      {notifs.length === 0 ? (
        <div className="card p-5 text-center" style={{ fontSize: 12, color: T.muted, lineHeight: 1.5 }}>{t("notifs_none")}</div>
      ) : notifs.map((n) => (
        <div key={n.id} className="card p-3 mb-2 flex gap-3">
          <span style={{ fontSize: 15, color: col(n.k), flexShrink: 0 }}>{ico(n.k)}</span>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 12, lineHeight: 1.45 }}>{n.t}</div>
            <div className="mono" style={{ fontSize: 9, color: T.muted, marginTop: 4 }}>{n.when}</div>
          </div>
        </div>
      ))}
    </Sheet>
  );
}

/* ---------------- ONBOARDING ---------------- */
function Onboard({ accent, taste, setTaste, finish, addSeries, lang, setLang }) {
  const { t } = useT();
  const [step, setStep] = useState(0);
  const genres = lang === "tr"
    ? ["Aksiyon", "Fantezi", "Romantik", "Gerilim", "Distopya", "Doğaüstü", "Politik", "Komedi"]
    : ["Action", "Fantasy", "Romance", "Thriller", "Dystopia", "Supernatural", "Political", "Comedy"];

  return (
    <div className="full" style={{ zIndex: 60 }}>
      <div className="full-in" style={{ padding: "0 20px 30px", minHeight: "100vh", display: "flex", flexDirection: "column" }}>
        <div className="flex items-center gap-2 pt-6 pb-6">
          <div className="flex gap-1" style={{ flex: 1 }}>
            {[0, 1, 2].map((i) => (
              <div key={i} style={{ flex: 1, height: 3, borderRadius: 99, background: i <= step ? accent : T.line }} />
            ))}
          </div>
          <button onClick={() => setLang(lang === "en" ? "tr" : "en")} className="pill mono"
            style={{ background: T.panel2, color: T.muted, border: `1px solid ${T.line}`, fontSize: 10, padding: "6px 10px" }}>
            {lang === "en" ? "TR" : "EN"}
          </button>
        </div>

        {step === 0 && (
          <div className="fade" style={{ flex: 1 }}>
            <div className="hanko" style={{ marginBottom: 20 }}>{t("ob_kick")}</div>
            <h1 style={{ fontSize: 32, lineHeight: 1.12, fontWeight: 900 }}>{t("ob_h1")}<br />{t("ob_h2")}</h1>
            <p style={{ color: T.muted, fontSize: 15, marginTop: 16, lineHeight: 1.6 }}>
              {t("ob_sub")} <span style={{ color: accent, fontWeight: 700 }}>{t("ob_sub_hi")}</span>
            </p>
            <div className="mt-8">
              {[["⛓", t("ob_f1"), t("ob_f1d")], ["⟲", t("ob_f2"), t("ob_f2d")], ["⛩", t("ob_f3"), t("ob_f3d")]].map(([i, a, b]) => (
                <div key={a} className="flex gap-3 mb-4">
                  <span style={{ fontSize: 18, color: accent, width: 24, flexShrink: 0 }}>{i}</span>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 800 }}>{a}</div>
                    <div style={{ fontSize: 12, color: T.muted, marginTop: 2, lineHeight: 1.45 }}>{b}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="fade" style={{ flex: 1 }}>
            <h1 style={{ fontSize: 26, fontWeight: 900 }}>{t("ob_taste")}</h1>
            <p style={{ color: T.muted, fontSize: 13, marginTop: 8, marginBottom: 24, lineHeight: 1.5 }}>{t("ob_taste_d")}</p>
            <Chips multi opts={genres} val={taste} set={setTaste} accent={accent} />
            {taste.length > 0 && (
              <div className="card p-3 mt-6 fade" style={{ fontSize: 12, color: T.muted }}>{taste.length} {t("ob_taste_n")}</div>
            )}
          </div>
        )}

        {step === 2 && (
          <div className="fade" style={{ flex: 1 }}>
            <h1 style={{ fontSize: 26, fontWeight: 900 }}>{t("ob_first")}</h1>
            <p style={{ color: T.muted, fontSize: 13, marginTop: 8, marginBottom: 24, lineHeight: 1.5 }}>{t("ob_coins")}</p>
            <button onClick={addSeries} className="card p-4 w-full text-left mb-3" style={{ borderColor: accent }}>
              <div style={{ fontSize: 15, fontWeight: 800 }}>{t("ob_add")}</div>
              <div style={{ fontSize: 12, color: T.muted, marginTop: 4, lineHeight: 1.5 }}>{t("ob_add_d")}</div>
              <div className="mono mt-3" style={{ fontSize: 10, color: accent }}>{t("ob_recommended")}</div>
            </button>
            <button onClick={finish} className="card p-4 w-full text-left">
              <div style={{ fontSize: 15, fontWeight: 800 }}>{t("ob_look")}</div>
              <div style={{ fontSize: 12, color: T.muted, marginTop: 4, lineHeight: 1.5 }}>{t("ob_look_d")}</div>
            </button>
          </div>
        )}

        {step < 2 && (
          <div className="flex gap-2" style={{ marginTop: 24 }}>
            {step > 0 && <button onClick={() => setStep(step - 1)} className="btn-ghost" style={{ width: 90 }}>{t("back")}</button>}
            <button onClick={() => setStep(step + 1)} className="btn" style={{ flex: 1, background: accent }}>
              {step === 0 ? t("ob_start") : taste.length ? t("next") : t("ob_skip")}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
