/* 首頁：一次搜尋所有手冊（藥物＋段落） */
(function(){
  const box = document.getElementById('gq');
  if (!box || !window.HOPE_INDEX) return;
  const res = document.getElementById('gsRes'), hint = document.getElementById('gsHint');
  const esc = s => String(s).replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
  const norm = s => String(s).toLowerCase().replace(/[\s　]+/g, ' ');
  const TYPE = {sec:'段落', acc:'照顧方法', seg:'重點', drug:'藥物'};

  // 攤平成一份清單
  const all = [];
  HOPE_INDEX.forEach(bk => {
    bk.items.forEach(it => all.push({bk, type:it.t, title:it.title, sub:it.sec||'', text:it.text,
      href: bk.s + '/index.html#' + it.id}));
    bk.drugs.forEach(d => {
      const key = (d.n.split(/[；;／/・（(]/)[0] || d.e).trim();
      all.push({bk, type:'drug', title:d.n, sub:d.e, text:d.x,
        href: bk.s + '/index.html?q=' + encodeURIComponent(key)});
    });
  });
  all.forEach(a => { a._t = norm(a.title); a._s = norm(a.sub); a._x = norm(a.text); });

  function snippet(text, term){
    const i = norm(text).indexOf(term);
    if (i < 0) return esc(text.slice(0, 60)) + (text.length > 60 ? '…' : '');
    const a = Math.max(0, i - 22), b = Math.min(text.length, i + term.length + 40);
    return (a ? '…' : '') + esc(text.slice(a, i)) + '<mark>' + esc(text.slice(i, i + term.length)) + '</mark>'
      + esc(text.slice(i + term.length, b)) + (b < text.length ? '…' : '');
  }
  function hl(s, term){
    const i = norm(s).indexOf(term);
    return i < 0 ? esc(s) : esc(s.slice(0,i)) + '<mark>' + esc(s.slice(i, i+term.length)) + '</mark>' + esc(s.slice(i+term.length));
  }

  let limit = 12, filter = '';
  function run(){
    const q = norm(box.value).trim();
    if (!q){ res.innerHTML = ''; hint.textContent = ''; return; }
    const terms = q.split(' ').filter(Boolean);
    const hits = [];
    all.forEach(a => {
      let score = 0;
      for (const t of terms){
        let s = 0;
        if (a._t.includes(t)) s = a.type === 'drug' ? 60 : 40;
        else if (a._s.includes(t)) s = a.type === 'drug' ? 50 : 15;
        else if (a._x.includes(t)) s = a.type === 'drug' ? 8 : 10;
        if (!s) return;
        score += s;
      }
      if (a.type === 'sec') score -= 3;
      hits.push([score, a]);
    });
    hits.sort((x, y) => y[0] - x[0]);
    // 同一本書裡標題相同的只留一筆
    const seen = new Set();
    const uniq = hits.filter(([, a]) => { const k = a.bk.s + '|' + a._t; if (seen.has(k)) return false; seen.add(k); return true; });
    hits.length = 0; uniq.forEach(h => hits.push(h));
    if (!hits.length){
      hint.textContent = '';
      res.innerHTML = '<div class="empty">找不到「' + esc(box.value.trim()) + '」。換個說法試試，或直接問你的醫療團隊。</div>';
      return;
    }
    // 依手冊篩選
    const books = [];
    hits.forEach(([, a]) => { let b = books.find(x => x.bk === a.bk); if (!b) books.push(b = {bk:a.bk, n:0}); b.n++; });
    if (filter && !books.some(b => b.bk.s === filter)) filter = '';
    const shown = filter ? hits.filter(([, a]) => a.bk.s === filter) : hits;
    hint.innerHTML = '找到 <b>' + hits.length + '</b> 筆' + (books.length > 1 ? '，可以先選手冊：' : '');
    const chips = books.length > 1 ? '<div class="gs-chips">'
      + '<button type="button" data-f=""' + (filter ? '' : ' class="on"') + '>全部 ' + hits.length + '</button>'
      + books.map(b => '<button type="button" data-f="' + b.bk.s + '"' + (filter === b.bk.s ? ' class="on"' : '') + '><i style="background:' + b.bk.c + '"></i>' + esc(b.bk.b.replace(/^面對|治療$/g, '')) + ' ' + b.n + '</button>').join('')
      + '</div>' : '';
    const t0 = terms[0];
    res.innerHTML = chips + shown.slice(0, limit).map(([, a]) => {
      const inTitle = a._t.includes(t0) || a._s.includes(t0);
      const sn = a.type === 'drug' ? esc(a.sub) : (inTitle ? esc(a.text.slice(0, 60)) + (a.text.length > 60 ? '…' : '') : snippet(a.text, t0));
      return '<a href="' + a.href + '">'
        + '<span class="bk"><i style="background:' + a.bk.c + '"></i>' + esc(a.bk.b)
        + '<span class="ty' + (a.type === 'drug' ? ' drug' : '') + '">' + TYPE[a.type] + '</span></span>'
        + '<b>' + hl(a.title, t0) + '</b><span class="sn">' + sn + '</span><span class="go" aria-hidden="true">›</span></a>';
    }).join('') + (shown.length > limit ? '<button class="gs-more" type="button">顯示更多（還有 ' + (shown.length - limit) + ' 筆）</button>' : '');
    res.querySelectorAll('.gs-chips button').forEach(btn => btn.onclick = () => { filter = btn.dataset.f; limit = 12; run(); });
    const more = res.querySelector('.gs-more');
    if (more) more.onclick = () => { limit += 20; run(); };
  }
  let tm;
  box.addEventListener('input', () => { limit = 12; filter = ''; clearTimeout(tm); tm = setTimeout(run, 120); });
  box.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); box.blur(); } });
})();
