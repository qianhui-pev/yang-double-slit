
/* ============ 题库：前测 / 后测 ============ */
(function(){
'use strict';
const App = window.App;

const PRE = [
  { k:'q1', tag:'条纹间距',
    q:'缝距 d 增大，其余参数不变，屏上条纹如何变化？',
    sub:'判断 · 缝距',
    opts:[
      {t:'条纹变宽，间距变大', tag:'RATIO_DIRECTION'},
      {t:'条纹变窄，间距变小', tag:'', correct:true},
      {t:'条纹间距不变，只是变暗', tag:'IGNORE_D'},
      {t:'先变宽，调多了又变窄', tag:'RATIO_DIRECTION'}
    ]},
  { k:'q2', tag:'明暗判据',
    q:'屏上某点光程差为 λ/2，该点为亮纹还是暗纹？',
    sub:'判断 · 明暗',
    opts:[
      {t:'亮：两束光均已到达', tag:'DARK_BRIGHT'},
      {t:'暗：相位相反，互相抵消', tag:'', correct:true},
      {t:'半明半暗', tag:'DARK_BRIGHT'},
      {t:'取决于两束光强度', tag:'VIS_COHERENCE'}
    ]},
  { k:'q3', tag:'波长依赖',
    q:'光源由红光换为紫光（波长更短），条纹间距如何变化？',
    sub:'判断 · 波长',
    opts:[
      {t:'变宽', tag:'RATIO_LAMBDA'},
      {t:'变窄', tag:'', correct:true},
      {t:'不变，仅由缝距决定', tag:'IGNORE_LAMBDA'},
      {t:'完全消失', tag:'VIS_COHERENCE'}
    ]},
  { k:'q4', tag:'相干的含义',
    q:'两束光相干的首要条件是什么？',
    sub:'判断 · 相干',
    opts:[
      {t:'两束光强度尽量相同', tag:'VIS_COHERENCE'},
      {t:'频率相同，且相位差在观测时间内保持不变', tag:'', correct:true},
      {t:'偏振方向必须一致', tag:'POLARIZATION'},
      {t:'同源即相干', tag:'SOURCE_CONFUSION'}
    ]},
  { k:'q5', tag:'空间相干',
    q:'光源为宽度 b 的扩展光源而非点光源，条纹如何变化？',
    sub:'判断 · 光源宽度',
    opts:[
      {t:'更亮更清晰，光强更大', tag:'VIS_COHERENCE'},
      {t:'对比度下降，b 增大到临界值时条纹消失', tag:'', correct:true},
      {t:'条纹间距变大，对比度不变', tag:'SPATIAL_CONFUSION'},
      {t:'条纹间距变小', tag:'SPATIAL_CONFUSION'}
    ]}
];

const POST = [
  { k:'r1', tag:'定量计算',
    q:'λ = 600 nm，d = 0.20 mm，L = 1.5 m。相邻两条亮纹的间距约为：',
    sub:'迁移 · 算一算',
    opts:[
      {t:'4.5 mm', tag:'', correct:true},
      {t:'0.45 mm', tag:'UNIT_ERROR'},
      {t:'45 mm', tag:'UNIT_ERROR'},
      {t:'2.25 mm', tag:'HALF_ERROR'}
    ]},
  { k:'r2', tag:'相位差',
    q:'某点两条光路的光程差为 1.5λ，这一点的相位差和明暗是：',
    sub:'迁移 · 相位',
    opts:[
      {t:'Δφ = 3π，暗纹', tag:'', correct:true},
      {t:'Δφ = 3π，亮纹', tag:'PHASE_PATH'},
      {t:'Δφ = 1.5π，亮纹', tag:'PHASE_PATH'},
      {t:'Δφ = 2π，亮纹', tag:'PHASE_PATH'}
    ]},
  { k:'r3', tag:'相干长度',
    q:'钠黄光双线 λ ≈ 589 nm，Δλ ≈ 0.6 nm。它的相干长度 L_c = λ²/Δλ 大约是：',
    sub:'迁移 · 时间相干',
    opts:[
      {t:'约 0.58 mm', tag:'', correct:true},
      {t:'约 5.8 mm', tag:'COHERENCE_CALC'},
      {t:'约 0.58 m', tag:'COHERENCE_CALC'},
      {t:'与 Δλ 无关，无法计算', tag:'VIS_COHERENCE'}
    ]},
  { k:'r4', tag:'空间相干迁移',
    q:'用太阳光（极大的扩展光源）直接照双缝，屏上会出现干涉条纹吗？',
    sub:'迁移 · 空间相干',
    opts:[
      {t:'会，只要缝足够细', tag:'SPATIAL_CONFUSION'},
      {t:'不会：太阳的空间相干宽度远小于缝距', tag:'', correct:true},
      {t:'会，但只有中央一条亮纹', tag:'SPATIAL_CONFUSION'},
      {t:'会，条纹间距更大', tag:'SPATIAL_CONFUSION'}
    ]},
  { k:'r5', tag:'单光子',
    q:'把光强降到一次只有一个光子通过双缝。累计足够长时间后，屏上的分布是：',
    sub:'迁移 · 量子',
    opts:[
      {t:'两条亮线，对应两个缝', tag:'SINGLE_PHOTON'},
      {t:'逐渐累积出干涉条纹', tag:'', correct:true},
      {t:'均匀铺满，没有结构', tag:'SINGLE_PHOTON'},
      {t:'一个光子不会干涉，所以没有条纹', tag:'SINGLE_PHOTON'}
    ]}
];

const TAGS = {
  RATIO_DIRECTION:'正比、反比关系记反',
  RATIO_LAMBDA:'波长与条纹间距的关系记反',
  IGNORE_D:'忽略缝距对条纹间距的影响',
  IGNORE_LAMBDA:'忽略波长对条纹间距的影响',
  DARK_BRIGHT:'明暗判据（δ = kλ 亮 / (k+½)λ 暗）记反',
  VIS_COHERENCE:'只看光强，忽略相干性对可见度的影响',
  POLARIZATION:'将偏振条件误作相干首要条件',
  SOURCE_CONFUSION:'误认为同一光源必然相干',
  SPATIAL_CONFUSION:'未建立光源宽度与空间相干的关系',
  PHASE_PATH:'光程差与相位差换算错误（Δφ = 2πδ/λ）',
  UNIT_ERROR:'单位换算错误',
  HALF_ERROR:'系数 2 用错（多乘或少除）',
  COHERENCE_CALC:'相干长度量级估算错误',
  SINGLE_PHOTON:'误认为单光子不发生自干涉'
};

/* ---- 选项轮转：正确答案不再固定在同一位置（2026-11-24） ---- */
function __rot(arr, k){ if(!k) return arr; const n = arr.length; const o = arr.slice(); return o.map(function(_,i){ return o[(i+k)%n]; }); }
const ROT_PRE = [1,2,3,0,3], ROT_POST = [2,3,1,2,3];
PRE.forEach(function(q,i){ q.opts = __rot(q.opts, ROT_PRE[i]); });
POST.forEach(function(q,i){ q.opts = __rot(q.opts, ROT_POST[i]); });
window.BankRot = { PRE:ROT_PRE, POST:ROT_POST, rot:__rot };

window.Bank = { PRE:PRE, POST:POST, TAGS:TAGS };

function qBlock(item, store){
  const cur = store[item.k] || {};
  const keys = 'ABCD';
  return '<div class="qcard" data-q="'+item.k+'" style="padding:22px 0;border-bottom:1px solid var(--line-2)">' +
    '<div class="eyebrow" style="margin-bottom:9px">'+App.esc(item.k.toUpperCase())+' · '+App.esc(item.tag)+'</div>' +
    '<div class="h-sub" style="font-size:15.5px;line-height:1.55;margin-bottom:4px">'+App.esc(item.q)+'</div>' +
    (item.sub ? '<div class="dimmer" style="font-size:12px;margin-bottom:13px">'+App.esc(item.sub)+'</div>' : '<div style="height:11px"></div>') +
    '<div class="opts">' + item.opts.map(function(o,i){
        const sel = cur.ans === i;
        return '<label class="opt"'+(sel?' data-sel':'')+' data-i="'+i+'">' +
          '<span class="opt__key">'+keys[i]+'</span><span class="opt__txt">'+App.esc(o.t)+'</span></label>';
      }).join('') + '</div>' +
    '<div class="conf"><span class="conf__lb">把握程度</span><div class="conf__pips" data-conf="'+item.k+'">' +
      [1,2,3,4,5].map(function(n){
        return '<button type="button" data-n="'+n+'"'+((cur.conf||0)>=n?' data-on':'')+' aria-label="把握 '+n+'"></button>';
      }).join('') +
    '</div></div>' +
    '<textarea class="textarea" data-why="'+item.k+'" placeholder="写出判断依据（一句话即可）" style="margin-top:12px;min-height:64px">'+App.esc(cur.why||'')+'</textarea>' +
  '</div>';
}

function bindQ(host, item, store, onChange){
  const card = host.querySelector('[data-q="'+item.k+'"]');
  if(!card) return;
  card.querySelectorAll('.opt').forEach(function(el){
    el.addEventListener('click', function(){
      card.querySelectorAll('.opt').forEach(function(x){ x.removeAttribute('data-sel'); });
      el.setAttribute('data-sel','');
      store[item.k] = Object.assign({}, store[item.k]||{}, { ans: Number(el.getAttribute('data-i')), at: App.now() });
      App.track('answer', { q:item.k, i:Number(el.getAttribute('data-i')) });
      App.saveSoon();
      onChange && onChange();
    });
  });
  card.querySelectorAll('[data-conf] button').forEach(function(b){
    b.addEventListener('click', function(){
      const n = Number(b.getAttribute('data-n'));
      card.querySelectorAll('[data-conf] button').forEach(function(x){
        x.toggleAttribute('data-on', Number(x.getAttribute('data-n')) <= n);
      });
      store[item.k] = Object.assign({}, store[item.k]||{}, { conf:n });
      App.saveSoon();
      onChange && onChange();
    });
  });
  const ta = card.querySelector('[data-why]');
  ta.addEventListener('input', function(){
    store[item.k] = Object.assign({}, store[item.k]||{}, { why: ta.value });
    App.saveSoon();
  });
}

window.QBank = { qBlock:qBlock, bindQ:bindQ };
})();

/* ============ Views: 前测 ============ */
(function(){
'use strict';
const App = window.App, esc = App.esc, Views = App.Views;

Views.pre = {
  html: function(){
    const S = App.state, Q = window.Bank.PRE;
    return '<section class="section"><div class="wrap" style="max-width:940px">' +
      '<div class="sec-hd anim-up">' +
        '<div>' +
          '<div class="sec-hd__n"><b>02</b> / PRE-TEST · 前测</div>' +
          '<h2 class="h-sec" style="margin-top:14px">先记录判断，<br>再进实验室。</h2>' +
        '</div>' +
        '<div class="dimmer mono" style="font-size:10px;letter-spacing:.16em;text-align:right;line-height:1.9">' +
          '不计分，不排名<br>5 题 · 约 3 分钟</div>' +
      '</div>' +
      '<p class="lead anim-up d1" style="margin-bottom:8px">' +
        '5 题为判断题，只需给出结论；结果与实验数据对照，用于定位判断偏差。' +
      '</p>' +
      '<div class="anim-up d2" id="qhost">' + Q.map(function(it){ return window.QBank.qBlock(it, S.pre); }).join('') + '</div>' +
      '<div style="display:flex;align-items:center;gap:18px;margin-top:40px;flex-wrap:wrap">' +
        '<button class="btn btn--solid" id="preNext">保存判断，进入概念 <span class="btn__arrow">→</span></button>' +
        '<span class="dimmer mono" id="preProg" style="font-size:11px;letter-spacing:.14em"></span>' +
      '</div>' +
    '</div></section>';
  },
  mount: function(){
    const S = App.state, host = document.getElementById('qhost');
    const upd = function(){
      const done = window.Bank.PRE.filter(function(it){ return S.pre[it.k] && S.pre[it.k].ans !== undefined; }).length;
      const el = document.getElementById('preProg');
      if(el) el.textContent = '已回答 ' + done + ' / 5';
      const b = document.getElementById('preNext');
      if(b) b.style.opacity = done ? 1 : .5;
    };
    window.Bank.PRE.forEach(function(it){ window.QBank.bindQ(host, it, S.pre, upd); });
    upd();
    document.getElementById('preNext').addEventListener('click', function(){
      const done = window.Bank.PRE.filter(function(it){ return S.pre[it.k] && S.pre[it.k].ans !== undefined; }).length;
      if(done < 5){ App.toast('还有 ' + (5-done) + ' 题未作答。'); return; }
      App.track('submit', { scope:'pre' });
      App.save(); App.go('concept');
    });
  }
};
})();
