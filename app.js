// 투기장 추천 덱 공유 페이지 — 번호 폴더(1/, 2/ …)의 data.json 하나를 그린다. 엔진 없이 구워 둔 값만.
const IMG = 'https://peilvwrqgauwlaqojttq.supabase.co/storage/v1/object/public/para-data/char/';
const $ = (id) => document.getElementById(id);
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const pct = (x) => (100 * x).toFixed(1) + '%';
// 게임 카드 그림(../img · Characters 236)이 없으면 전신 그림을 빌린다: 기본형 → 같은 계열 순
function alts(u) { const k = u.t, a = []; if (/AltSR$/.test(k)) a.push(k.replace(/AltSR$/, 'AltR'), k.replace(/AltSR$/, 'R')); if (/SR$/.test(k)) a.push(k.replace(/SR$/, '')); if (/SR\d$/.test(k)) a.push(k.replace(/SR\d$/, 'R')); return [...new Set([...a, ...(u.alt || [])])].filter((x) => x !== k); }
window.imgErr = (img) => { const a = (img.dataset.alt || '').split(',').filter(Boolean); if (a.length) { img.dataset.alt = a.slice(1).join(','); img.src = IMG + a[0] + '.jpg'; } else img.style.visibility = 'hidden'; };
const pic = (u) => (u.f ? `<img class="face" src="../img/${u.t}.jpg" alt="" loading="lazy">` : `<img src="${IMG}${u.t}.jpg" alt="" loading="lazy" data-alt="${alts(u).join(',')}" onerror="imgErr(this)">`);
const card = (u, moved = '') => `<div class="card ${u.r} ${u.e} ${moved ? 'moved' : ''}" title="${esc(u.n)} · ${u.r} · Lv${u.lv}">
  ${pic(u)}
  <span class="rar">${u.r}</span><span class="el"></span><span class="n">${esc(u.n)}</span>
  ${u.s ? `<span class="st">${'★'.repeat(u.s)}</span>` : ''}<span class="lv">Lv.${u.lv}${moved}</span></div>`;
const rows = (cells) => [0, 1, 2, 3].map((p) => `<div class="plt-row"><b>${p + 1}반</b>${cells.slice(p * 6, p * 6 + 6).join('')}</div>`).join('');

async function boot() {
  let X;
  try { X = await (await fetch('data.json', { cache: 'no-cache' })).json(); }
  catch { $('lede').textContent = '자료를 못 읽었습니다.'; return; }
  document.title = `${X.me.name} → ${X.opp.name} 투기장 추천 덱`;
  $('h1').textContent = `${X.me.name} → ${X.opp.name} 추천 덱`;
  $('lede').textContent = `랭킹에서 읽은 ${X.opp.name} 님의 덱(${X.read}) 상대로, ${X.me.name} 님의 지금 24명을 그대로 두고 자리만 바꾼 순서입니다. 캐릭터를 새로 넣거나 빼지 않습니다.`;
  $('wins').innerHTML = X.matches.slice().sort((a, b) => b.atk - a.atk).map((m) => {
    const d = m.proposed - m.current;
    return `<div class="win"><p class="k">${m.atk ? `${esc(X.opp.name)} 님을 공격할 때` : `${esc(X.opp.name)} 님이 공격해 올 때`}</p>
      <div class="v"><s>${pct(m.current)} →</s><b>${pct(m.proposed)}</b><i class="${d < 0 ? 'down' : ''}">${d >= 0 ? '+' : ''}${(100 * d).toFixed(1)}%p</i></div>
      <div class="bar"><span class="c" style="width:${100 * m.current}%"></span><span class="p" style="width:${100 * m.proposed}%"></span></div></div>`;
  }).join('');
  $('pro-h').textContent = `${X.me.name} 님 추천 덱`;
  $('pro').innerHTML = rows(X.proposed.map((t, pos) => { const was = X.current.indexOf(t); return card(X.units[t], was !== pos ? ` ←${Math.floor(was / 6) + 1}-${was % 6 + 1}` : ''); }));
  const n = X.proposed.filter((t, pos) => X.current.indexOf(t) !== pos).length;
  $('legend').textContent = `보라 테두리 = 자리가 바뀐 캐릭터 ${n}명 · «←2-3» = 지금 덱에서 2반 3번째에 있던 캐릭터`;
  $('cur-h').textContent = `${X.me.name} 님 지금 덱 (통솔 ${X.me.rank})`;
  $('cur').innerHTML = rows(X.current.map((t) => card(X.units[t])));
  $('opp-h').textContent = `${X.opp.name} 님 덱 (통솔 ${X.opp.rank})`;
  $('opp').innerHTML = rows(X.opp.deck.map((u) => card(u)));
  $('notes').innerHTML = [
    `승률은 각 ${X.seeds.toLocaleString()}판 시뮬레이션 결과입니다(게임과 같은 무작위 규칙).`,
    `${esc(X.opp.name)} 님이 덱 순서를 바꾸면 결과가 달라집니다. 이 덱은 ${X.read}에 랭킹에서 읽은 순서 기준입니다.`,
    `투귀공명·캠퍼스 보너스는 랭킹에 안 나와서 두 분이 나온 가장 최근 투기장 기록의 값을 썼습니다(그 뒤로 올랐다면 조금 다를 수 있습니다). 통솔은 ${esc(X.me.name)} ${X.me.rank} · ${esc(X.opp.name)} ${X.opp.rank}.`,
    `이 순서는 ${esc(X.opp.name)} 님 상대로만 계산했습니다. 투기장 덱과 유적 덱은 같은 페이지를 쓰니, 다른 상대나 유적에서는 지금 덱이 나을 수 있습니다.`,
    `같은 덱끼리라도 공격과 방어 승률이 다릅니다 — 공격하는 쪽이 자리마다 조금 먼저 들어와 먼저 행동하기 때문입니다. 그게 유리한지는 덱마다 다릅니다.`,
  ].map((t) => `<li>${t}</li>`).join('');
}
boot();
