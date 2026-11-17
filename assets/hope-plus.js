/* ============================================================
   希望之路 · 互動衛教手冊 — 記住勾選、段落連結、帶入搜尋
   放在每頁最後載入（在 hope.js 或頁面本身的程式之後）
   ============================================================ */
(function(){
  const $$ = (s, r=document) => [...r.querySelectorAll(s)];

  // 化療頁使用自己的樣式表，補上這裡需要的樣式
  if (!document.getElementById('hope-plus-css')) {
    const st = document.createElement('style'); st.id = 'hope-plus-css';
    st.textContent = '.saved-bar{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-top:14px;padding-top:12px;border-top:1px dashed #EDE3D0;font-size:.8em;color:#8F8574;line-height:1.5}.saved-bar button{flex:none;border:1.5px solid #EDE3D0;background:#fff;border-radius:999px;min-height:38px;padding:4px 16px;font:inherit;font-weight:700;color:#5F574D;cursor:pointer}';
    document.head.appendChild(st);
  }

  /* ---------- 1) 記住勾選與輸入（只存在這支手機／這台電腦） ---------- */
  const KEY = 'hope-saved:' + location.pathname.replace(/index\.html$/, '');
  let store = {};
  try { store = JSON.parse(localStorage.getItem(KEY) || '{}'); } catch(e) {}
  function save(){ try { localStorage.setItem(KEY, JSON.stringify(store)); } catch(e) {} }

  // 要記住的：勾選框、數字輸入（不含搜尋框）
  const inputs = $$('main input[type=checkbox], input[type=checkbox], input[type=number]')
    .filter((el, i, arr) => arr.indexOf(el) === i);
  inputs.forEach((el, i) => {
    const k = 'i' + i;
    if (k in store) {
      if (el.type === 'checkbox') el.checked = !!store[k];
      else el.value = store[k];
      el.dispatchEvent(new Event(el.type === 'checkbox' ? 'change' : 'input', {bubbles:true}));
    }
    el.addEventListener(el.type === 'checkbox' ? 'change' : 'input', () => {
      store[k] = el.type === 'checkbox' ? el.checked : el.value;
      save();
    });
  });

  // 化療頁的疲憊量尺（按鈕）
  const scale = document.getElementById('scale');
  if (scale) {
    const btns = [...scale.querySelectorAll('button')];
    if (store.scale != null && btns[store.scale]) btns[store.scale].click();
    btns.forEach((b, i) => b.addEventListener('click', () => { store.scale = i; save(); }));
  }

  // 每張有記錄的卡片，加一顆「清除」
  const cards = new Set(inputs.map(el => el.closest('.card')).filter(Boolean));
  cards.forEach(card => {
    const wrap = document.createElement('div');
    wrap.className = 'saved-bar';
    wrap.innerHTML = '<span>勾選和輸入會自動記在這支手機上，不會上傳到網路。</span><button type="button">清除</button>';
    wrap.querySelector('button').addEventListener('click', () => {
      inputs.forEach((el, i) => {
        if (card.contains(el)) {
          if (el.type === 'checkbox') el.checked = false; else el.value = '';
          delete store['i' + i];
          el.dispatchEvent(new Event(el.type === 'checkbox' ? 'change' : 'input', {bubbles:true}));
        }
      });
      if (scale && card.contains(scale)) {
        delete store.scale;
        scale.querySelectorAll('button').forEach(b => b.classList.remove('sel'));
        const out = document.getElementById('scaleOut');
        if (out) { out.className = 'scale-out'; out.innerHTML = '還沒選擇。'; }
      }
      save();
    });
    card.appendChild(wrap);
  });

  /* ---------- 2) 段落連結：網址 #某一段 → 直接展開並捲過去 ---------- */
  function openTarget(id){
    const el = id && document.getElementById(id);
    if (!el) return false;
    let target = el;
    if (el.classList.contains('acc')) {
      el.classList.add('open', 'hit');
      const h = el.querySelector('.acc-h'); if (h) h.setAttribute('aria-expanded', 'true');
      setTimeout(() => el.classList.remove('hit'), 2400);
    } else if (el.classList.contains('seg-pane')) {
      const g = el.closest('.seg-group');
      const btn = g && g.querySelector('.seg button[data-seg="' + el.dataset.seg + '"]');
      if (btn) btn.click();
      target = g || el;
    }
    // 若在收合的手風琴裡，也一併打開
    const parentAcc = target.parentElement && target.parentElement.closest('.acc');
    if (parentAcc) parentAcc.classList.add('open');
    setTimeout(() => target.scrollIntoView({block:'start'}), 60);
    return true;
  }

  /* ---------- 3) 從首頁搜尋帶入藥名：?q=吉舒達 ---------- */
  const params = new URLSearchParams(location.search);
  const q = params.get('q');
  const dq = document.getElementById('drugQ');
  if (q && dq) {
    dq.value = q;
    dq.dispatchEvent(new Event('input', {bubbles:true}));
    if (!location.hash) setTimeout(() => dq.scrollIntoView({block:'center'}), 60);
  }

  if (location.hash) openTarget(decodeURIComponent(location.hash.slice(1)));
  window.addEventListener('hashchange', () => openTarget(decodeURIComponent(location.hash.slice(1))));
})();
