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

  let limit = 12;
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
    if (!hits.length){
      hint.textContent = '';
      res.innerHTML = '<div class="empty">找不到「' + esc(box.value.trim()) + '」。換個說法試試，或直接問你的醫療團隊。</div>';
      return;
    }
    hint.textContent = '找到 ' + hits.length + ' 筆';
    const t0 = terms[0];
    res.innerHTML = hits.slice(0, limit).map(([, a]) => {
      const inTitle = a._t.includes(t0) || a._s.includes(t0);
      const sn = a.type === 'drug' ? esc(a.sub) : (inTitle ? esc(a.text.slice(0, 60)) + (a.text.length > 60 ? '…' : '') : snippet(a.text, t0));
      return '<a href="' + a.href + '">'
        + '<span class="bk"><i style="background:' + a.bk.c + '"></i>' + esc(a.bk.b)
        + '<span class="ty' + (a.type === 'drug' ? ' drug' : '') + '">' + TYPE[a.type] + '</span></span>'
        + '<b>' + hl(a.title, t0) + '</b><span class="sn">' + sn + '</span></a>';
    }).join('') + (hits.length > limit ? '<button class="gs-more" type="button" style="border:none;background:none;cursor:pointer;width:100%">顯示更多（還有 ' + (hits.length - limit) + ' 筆）</button>' : '');
    const more = res.querySelector('.gs-more');
    if (more) more.onclick = () => { limit += 20; run(); };
  }
  let tm;
  box.addEventListener('input', () => { limit = 12; clearTimeout(tm); tm = setTimeout(run, 120); });
})();
