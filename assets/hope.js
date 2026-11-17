/* ============================================================
   希望之路 · 互動衛教手冊 — 全站共用互動
   ============================================================ */
(function(){
  const $ = (s, r=document) => r.querySelector(s);
  const $$ = (s, r=document) => [...r.querySelectorAll(s)];

  /* ---------- 大字模式（記在這台裝置上） ---------- */
  const fsBtn = $('#fsBtn');
  function setBig(on){
    document.documentElement.classList.toggle('big', on);
    if (fsBtn) fsBtn.setAttribute('aria-pressed', on ? 'true' : 'false');
    try { localStorage.setItem('hope-big', on ? '1' : '0'); } catch(e){}
  }
  if (fsBtn){
    fsBtn.setAttribute('aria-pressed', document.documentElement.classList.contains('big') ? 'true' : 'false');
    fsBtn.addEventListener('click', () => setBig(!document.documentElement.classList.contains('big')));
  }

  /* ---------- 浮層共用：開啟時鎖住背景捲動 ---------- */
  function openLayer(el){ el.classList.add('open'); document.body.classList.add('locked'); }
  function closeLayer(el){ el.classList.remove('open');
    if (!$('.toc.open') && !$('.sos-modal.open')) document.body.classList.remove('locked'); }

  /* ---------- 目錄抽屜 ---------- */
  const toc = $('#toc');
  if (toc){
    $('#tocBtn').addEventListener('click', () => openLayer(toc));
    $('#tocClose').addEventListener('click', () => closeLayer(toc));
    toc.addEventListener('click', e => { if (e.target === toc) closeLayer(toc); });
    $$('.toc-panel a', toc).forEach(a => a.addEventListener('click', () => closeLayer(toc)));
  }

  /* ---------- 分段切換 ---------- */
  function activateSeg(group, key){
    $$('.seg button', group).forEach(b => {
      const on = b.dataset.seg === key;
      b.classList.toggle('on', on);
      b.setAttribute('aria-selected', on ? 'true' : 'false');
    });
    $$('.seg-pane', group).forEach(p => p.classList.toggle('on', p.dataset.seg === key));
  }
  $$('.seg-group').forEach(g => {
    $$('.seg button', g).forEach(b => {
      b.setAttribute('role', 'tab');
      b.addEventListener('click', () => activateSeg(g, b.dataset.seg));
    });
    const first = $('.seg button', g);
    if (first) activateSeg(g, ($('.seg button.on', g) || first).dataset.seg);
  });

  /* ---------- 跳到某段（症狀快選、部位快選）並自動展開 ---------- */
  function goTo(id){
    const el = document.getElementById(id);
    if (!el) return;
    if (el.id === 'sosBtn') { el.click(); return; }
    let target = el;
    if (el.classList.contains('acc')) {
      el.classList.add('open', 'hit');
      setTimeout(() => el.classList.remove('hit'), 2200);
    } else if (el.classList.contains('seg-pane')) {
      const g = el.closest('.seg-group');
      activateSeg(g, el.dataset.seg);
      target = g;
    }
    target.scrollIntoView({behavior:'smooth', block:'start'});
  }
  $$('[data-go]').forEach(b => b.addEventListener('click', e => { e.preventDefault(); goTo(b.dataset.go); }));

  /* ---------- 手風琴 ---------- */
  $$('.acc-h').forEach(h => {
    h.setAttribute('aria-expanded', 'false');
    h.addEventListener('click', () => {
      const open = h.parentElement.classList.toggle('open');
      h.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  });

  /* ---------- 勾選清單（提問單） ---------- */
  $$('[data-checklist]').forEach(list => {
    const boxes = $$('input', list);
    const note = document.getElementById(list.dataset.checklist);
    const done = list.dataset.done || '都問到了。把答案記下來，之後回診都用得上。';
    function upd(){
      const n = boxes.filter(b => b.checked).length;
      note.innerHTML = n === boxes.length
        ? '<b>' + done + '</b>'
        : `已問到 <b>${n} / ${boxes.length}</b> 題。沒問到的下次補問就好，不必一次問完。`;
    }
    boxes.forEach(b => b.addEventListener('change', upd));
    upd();
  });

  /* ---------- 藥物查詢（資料放在 window.DRUGS） ---------- */
  const dq = $('#drugQ');
  if (dq && window.DRUGS){
    const listEl = $('#drugList'), countEl = $('#drugCount');
    let cat = 'all';
    const esc = s => String(s).replace(/[&<>]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;'}[c]));
    function render(){
      const q = dq.value.trim().toLowerCase();
      const rows = window.DRUGS.filter(d => {
        if (cat !== 'all' && d.c !== cat) return false;
        if (!q) return true;
        return [d.n, d.e, d.r, ...(d.f||[]).map(x => x[1])].join(' ').toLowerCase().includes(q);
      });
      countEl.textContent = q ? `找到 ${rows.length} 筆` : `共 ${rows.length} 筆`;
      if (!rows.length){
        listEl.innerHTML = '<div class="empty">找不到符合的藥物。<br>換個關鍵字試試，或直接問你的醫師與藥師。</div>';
        return;
      }
      listEl.innerHTML = rows.map(d => `
        <div class="drug">
          <div class="nm">${esc(d.n)}</div>
          <div class="en">${esc(d.e)}</div>
          ${d.r ? `<span class="rt">${esc(d.r)}</span>` : ''}
          <dl>${(d.f||[]).filter(x => x[1]).map(x => `<dt>${esc(x[0])}</dt><dd${x[2] ? ' class="'+x[2]+'"' : ''}>${esc(x[1])}</dd>`).join('')}</dl>
        </div>`).join('');
    }
    dq.addEventListener('input', render);
    $$('.drug-tabs button').forEach(b => b.addEventListener('click', () => {
      $$('.drug-tabs button').forEach(x => x.classList.remove('on'));
      b.classList.add('on'); cat = b.dataset.cat; render();
    }));
    render();
  }

  /* ---------- 通知醫護 / 就醫面板 ---------- */
  const sos = $('#sosModal');
  if (sos){
    $('#sosBtn').addEventListener('click', () => openLayer(sos));
    $('#sosClose').addEventListener('click', () => closeLayer(sos));
    sos.addEventListener('click', e => { if (e.target === sos) closeLayer(sos); });
  }
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') { if (sos) closeLayer(sos); if (toc) closeLayer(toc); }
  });
})();
