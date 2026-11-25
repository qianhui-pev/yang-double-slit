
/* ============ Views: 实验台 ============ */
(function(){
'use strict';
const App = window.App, esc = App.esc, Views = App.Views, P = window.Phys;
const M = P.models;

const TASKS = [
  { key:'t1', n:'任务 01', name:'光程差：条纹从哪来',
    brief:'仅 d 可变（L、λ 锁定）。观察条纹变宽或变密，并用记录数据说明原因。',
    unlock:['d'], preset:{ d:0.30, L:1.20, lam:632.8, b:0, R:0.60, dLam:0 },
    hint:'单一变量。d 改变后，同一 y 处光程差随之改变，亮纹须落在新的 δ = kλ 处。',
    predict:{ q:'d 由 0.30 mm 增至 0.60 mm（2 倍），条纹间距 Δy 变为原来的：',
      opts:[{t:'2 倍：缝距增大，条纹变宽',tag:'RATIO_DIRECTION'},
            {t:'1/2：缝距增大，条纹变密',tag:'',correct:true},
            {t:'不变：Δy 仅由 λ、L 决定',tag:'IGNORE_D'},
            {t:'1/4',tag:'RATIO_DIRECTION'}]},
    check:{ q:'用记录的两组数据说明：d 增大时条纹为何变密？',
      opts:[{t:'d 增大使同一 y 处 δ = d·y/L 增大，亮纹条件在更小的 y 上即满足',tag:'',correct:true},
            {t:'d 增大使单缝出射光减弱，条纹被压缩',tag:'VIS_COHERENCE'},
            {t:'d 增大使波长被压缩',tag:'RATIO_LAMBDA'},
            {t:'d 增大使光程差减小，条纹变密',tag:'PHASE_PATH'}]}
  },
  { key:'t2', n:'任务 02', name:'谱线宽度：时间相干',
    brief:'仅 Δλ 可变。相干长度 L_c = λ²/Δλ；Δλ 增至数十纳米（白光量级）时条纹在数十级内消失。',
    unlock:['dLam'], preset:{ d:0.30, L:1.20, lam:632.8, b:0, R:0.60, dLam:0 },
    hint:'将 Δλ 推至 60 nm 附近：中央条纹位置基本不变，两侧先变糊。0.1 nm 窄线光源相干长度达数十厘米，可见上千级。',
    predict:{ q:'Δλ 由 0 增至数十 nm（白光量级），屏上条纹：',
      opts:[{t:'整体变暗，条纹数不变',tag:'VIS_COHERENCE'},
            {t:'两侧先消失：离中央越远越糊，可见条纹数减少',tag:'',correct:true},
            {t:'条纹间距变大',tag:'RATIO_LAMBDA'},
            {t:'无影响，谱宽仅改变颜色',tag:'VIS_COHERENCE'}]},
    check:{ q:'为何离中央远处先失去条纹，而非整片同时变糊？',
      opts:[{t:'离中央越远光程差越大，更早超出 L_c',tag:'',correct:true},
            {t:'屏边缘光强本低',tag:'VIS_COHERENCE'},
            {t:'宽谱光在边缘发生色散',tag:'RATIO_LAMBDA'},
            {t:'谱宽增大会改变波长',tag:'VIS_COHERENCE'}]}
  },
  { key:'t3', n:'任务 03', name:'光源宽度：空间相干',
    brief:'仅 b 可变。b 决定两缝处光场的空间相干性，临界值 b = λR/d；推至该值附近可观察到可见度归零。',
    unlock:['b'], preset:{ d:0.30, L:1.20, lam:632.8, b:0, R:0.60, dLam:0 },
    hint:'当前参数下临界宽度 b = λR/d ≈ 1.27 mm。推至该值附近，可见度趋近 0。',
    predict:{ q:'b 由 0 增至临界值附近，屏上条纹：',
      opts:[{t:'更清晰，光强更大',tag:'VIS_COHERENCE'},
            {t:'对比度持续下降，b ≈ λR/d 时条纹消失',tag:'',correct:true},
            {t:'条纹间距逐渐增大',tag:'SPATIAL_CONFUSION'},
            {t:'波长改变，颜色偏移',tag:'RATIO_LAMBDA'}]},
    check:{ q:'光源宽度增大后条纹为何消失？',
      opts:[{t:'光源各点各自形成一套条纹，位置错开，叠加后亮暗互相填平',tag:'',correct:true},
            {t:'宽光源光强过大，条纹被冲白',tag:'VIS_COHERENCE'},
            {t:'宽光源波长范围更大',tag:'SPATIAL_CONFUSION'},
            {t:'缝被照亮更充分，条纹被平均',tag:'SPATIAL_CONFUSION'}]}
  },
  { key:'t4', n:'任务 04', name:'一次一个光子',
    brief:'光强降至单光子水平。本任务无参数实验，仅观察散点累积成条纹。',
    unlock:[], preset:{ d:0.30, L:1.20, lam:632.8, b:0, R:0.60, dLam:0 }, photon:true,
    hint:'落点位置随机，抽样概率由 cos²(πδ/λ) 决定，需等待累积。',
    predict:{ q:'单光子逐个通过双缝时，从哪条缝通过？',
      opts:[{t:'每个光子随机选择一条缝，屏上应出现两条亮线',tag:'SINGLE_PHOTON'},
            {t:'每个光子同时经过两条缝，落点概率由光程差决定',tag:'',correct:true},
            {t:'光子互相碰撞，聚集于中央',tag:'SINGLE_PHOTON'},
            {t:'单光子不产生干涉，分布均匀',tag:'SINGLE_PHOTON'}]},
    check:{ q:'单光子逐个到达，累积后为何仍出现条纹？',
      opts:[{t:'大量光子之间存在相互作用',tag:'SINGLE_PHOTON'},
            {t:'每个光子落点概率由两条路径的光程差决定，条纹即概率分布',tag:'',correct:true},
            {t:'探测器存在规律性抖动',tag:'SINGLE_PHOTON'},
            {t:'光子实为连续波，仅表现为粒子',tag:'SINGLE_PHOTON'}]}
  }
];
const ROMAN = ['I.','II.','III.','IV.'];
/* ---- 选项轮转：正确答案不再固定在同一位置（2026-11-24） ---- */
const ROT_PREDICT = [3,0,2,1], ROT_CHECK = [1,2,0,3];
function __rot(arr, k){ if(!k) return arr; const n = arr.length; const o = arr.slice(); return o.map(function(_,i){ return o[(i+k)%n]; }); }
TASKS.forEach(function(t,i){
  t.predict.opts = __rot(t.predict.opts, ROT_PREDICT[i]);
  t.check.opts = __rot(t.check.opts, ROT_CHECK[i]);
});
window.LabRot = { predict:ROT_PREDICT, check:ROT_CHECK };
window.LAB_TASKS = TASKS;

function sliders(p, unlockArr, free){
  return Object.keys(M).map(function(k){
    const m = M[k];
    const locked = !free && unlockArr.indexOf(k) < 0;
    const v = p[k];
    const dec = (m.step < 0.01) ? 2 : (m.step < 0.1 ? 3 : 2);
    return '<div class="sld" data-p="'+k+'"'+(locked?' data-locked':'')+'>' +
      '<div class="sld__top">' +
        '<span class="sld__nm">'+m.label+(locked?' <span class="dimmer mono" style="font-size:9px">🔒</span>':'')+'</span>' +
        '<span class="sld__val" id="val-'+k+'">'+(k==='dLam'?v.toFixed(2):(k==='lam'?v.toFixed(1):(k==='b'?v.toFixed(2):v.toFixed(2))))+'<u>'+m.unit+'</u></span>' +
      '</div>' +
      '<div class="sld__track">' +
        '<input type="range" data-k="'+k+'" min="'+m.min+'" max="'+m.max+'" step="'+m.step+'" value="'+v+'"'+(locked?' disabled':'')+
          ' aria-label="'+m.label+'">' +
        (window.Snap ? window.Snap.ticks(k, m.min, m.max) : '') +
      '</div>' +
      '<div class="sld__scale"><span>'+m.min+'</span><span>'+m.max+'</span></div>' +
    '</div>';
  }).join('');
}

Views.lab = {
  html: function(){
    const S = App.state;
    const free = !!S.flags.freeExplore;
    const ti = S.lab.task || 0;
    const T = TASKS[ti] || null;
    const p = S.lab.params;
    const ans = T ? (S.lab.answers[T.key] || {}) : {};
    const recs = S.lab.records || [];

    return '<section class="section" style="padding-top:34px">' +
    '<div class="wrap" style="max-width:1500px">' +

      /* 头部 */
      '<div class="labrail" id="labrail" aria-hidden="true">' +
        '<span class="labrail__n">04</span>' +
        '<span class="labrail__t">LAB · 单一变量实验</span>' +
        '<span class="labrail__task" id="labrailTask">' + (T ? esc(T.n + ' · ' + T.name.split('：')[0]) : '自由探索') + '</span>' +
      '</div>' +
      '<div class="sec-hd labhead anim-up" id="labhead" style="margin-bottom:22px">' +
        '<div>' +
          '<div class="sec-hd__n"><b>04</b> / LAB · 控制变量实验</div>' +
          '<h2 class="h-sec" style="margin-top:12px">单一变量，<br>数据判定。</h2>' +
        '</div>' +
        '<div style="text-align:right">' +
          '<div class="dimmer mono" style="font-size:10px;letter-spacing:.16em;line-height:1.9">' +
            '线性标量波模型 · 理想双缝<br>参数与停留全程记录</div>' +
        '</div>' +
      '</div>' +

      /* 任务切换 */
      '<div class="taskbar" id="taskbar">' +
        TASKS.map(function(t, i){
          const done = !!(S.lab.answers[t.key] && S.lab.answers[t.key].submitted);
          return '<button class="tasktab" data-i="'+i+'"'+((i===ti&&!free)?' data-on':'')+(done?' data-done':'')+'>' +
            '<span class="tasktab__n"><b class="tasktab__r">'+ROMAN[i]+'</b><i>'+('0'+(i+1)).slice(-2)+'</i></span>' +
            '<span class="tasktab__t">'+esc(t.name.split('：')[0])+'</span>' +
            (done?'<span class="tasktab__ok">✓</span>':'') +
          '</button>';
        }).join('') +
        '<button class="tasktab" data-free="1"'+(free?' data-on':'')+'><span class="tasktab__n"><b class="tasktab__r">✦</b><i>FREE</i></span><span class="tasktab__t">自由探索</span></button>' +
      '</div>' +

      /* 台面 */
      '<div class="bench anim-up d1" style="margin-top:16px">' +
        '<div class="bench__stage crop crop--in" id="stageHost">' +
          '<div class="stage-tools">' +
            '<div class="modes" id="modeBar">' +
              '<button data-mode="wave" data-on>光场</button>' +
              '<button data-mode="photon">单光子</button>' +
              '<button data-mode="fringe">曲线</button>' +
            '</div>' +
            '<div class="chip chip--quiet" id="modelChip">理想双缝 · 线性标量波</div>' +
          '</div>' +
          '<canvas id="benchCv"></canvas>' +
          '<span class="crop-b"></span>' +
          '<div class="probe" id="probeBox" hidden></div>' +
          '<div class="reads" id="reads"></div>' +
        '</div>' +
        '<aside class="bench__ctrl">' +
          '<div class="ctrl-hd"><span>参数面板</span><span class="mono" id="lockNote" style="font-size:9px;color:var(--ink-3)">'+(free?'全部解锁':'锁定 '+ (6 - (T?T.unlock.length:0)) +' 项')+'</span></div>' +
          '<div class="specbar" id="specBar" title="可见光谱 380—780 nm，白线是当前 λ"><i></i><b>SPECTRUM</b></div>' +
          '<div class="ctrl-bd" id="sldHost">' + sliders(p, T?T.unlock:Object.keys(M), free) + '</div>' +
          '<div style="padding:14px 16px;border-top:1px solid var(--line-2);margin-top:auto">' +
            '<button class="btn btn--wide btn--sm" id="btnRecord">＋ 记录这一组数据</button>' +
            '<div class="dimmer mono" style="font-size:9px;letter-spacing:.14em;margin-top:9px;text-align:center">已记录 <b id="recN" style="color:var(--ink-1)">'+recs.length+'</b> 组</div>' +
            '<button class="btn btn--wide btn--sm btn--ghost" id="btnTutor" style="margin-top:10px">问助教</button>' +
          '</div>' +
        '</aside>' +
      '</div>' +

      '<div class="boundary" id="boundary" style="margin-top:10px"></div>' +
      (free ? '<div class="note note--quiet" style="margin-top:14px"><span class="note__k">FREE</span><span>自由探索：六项参数全部解锁，结论不进入任务档案，记录与轨迹照常保存。</span></div>' : '') +

      /* 任务卡：自由探索下不渲染（2026-11-24 修） */
      (!free && T ? '<div class="taskcard anim-up d2" id="taskcard" style="margin-top:28px">' +
        '<div class="taskcard__hd">' +
          '<div><div class="eyebrow"><b>'+T.n+'</b> / TASK</div>' +
          '<h3 class="h-sub" style="font-size:21px;margin-top:9px;font-family:var(--serif);font-weight:600">'+esc(T.name)+'</h3></div>' +
          '<p class="dim" style="font-size:13.5px;max-width:52ch;line-height:1.7;margin:0">'+esc(T.brief)+'</p>' +
        '</div>' +
        '<div class="taskcard__bd">' +
          '<div class="tstep" data-st="A"><div class="tstep__k">A · 预测</div>' +
            '<p style="font-size:14px;margin:0 0 12px;line-height:1.6">'+esc(T.predict.q)+'</p>' +
            '<div class="opts" id="predOpts">' + T.predict.opts.map(function(o,i){
              const sel = ans.pred === i;
              return '<div class="opt"'+(sel?' data-sel':'')+' data-p="'+i+'"><span class="opt__key">'+'ABCD'[i]+'</span><span class="opt__txt">'+esc(o.t)+'</span></div>';
            }).join('') + '</div>' +
            '<div style="margin-top:14px" id="predLock">' +
              (ans.locked
                ? '<div class="chip chip--jade">预测已锁定 · 开始调节参数</div>'
                : '<button class="btn btn--sm" id="btnLockPred">锁定预测</button>') +
            '</div>' +
          '</div>' +
          '<div class="tstep" data-st="B"><div class="tstep__k">B · 测量</div>' +
            '<p class="dim" style="font-size:13.5px;margin:0;line-height:1.7">'+esc(T.hint)+'</p>' +
            '<div class="recbox" id="recbox"></div>' +
          '</div>' +
          '<div class="tstep" data-st="C"><div class="tstep__k">C · 结论与依据</div>' +
            '<p style="font-size:14px;margin:0 0 12px;line-height:1.6">'+esc(T.check.q)+'</p>' +
            '<div class="opts" id="chkOpts">' + T.check.opts.map(function(o,i){
              const sel = ans.ans === i;
              return '<div class="opt"'+(sel?' data-sel':'')+' data-c="'+i+'"><span class="opt__key">'+'ABCD'[i]+'</span><span class="opt__txt">'+esc(o.t)+'</span></div>';
            }).join('') + '</div>' +
            '<textarea class="textarea" id="chkWhy" placeholder="写出依据：引用记录到的数值或曲线变化。" style="margin-top:12px;min-height:78px">'+esc(ans.why2||'')+'</textarea>' +
            '<div style="display:flex;gap:12px;align-items:center;margin-top:14px;flex-wrap:wrap">' +
              '<button class="btn btn--solid btn--sm" id="btnSubmit">提交结论 →</button>' +
              '<span class="dimmer mono" style="font-size:9.5px;letter-spacing:.14em" id="subState">'+(ans.submitted?'已提交':'')+'</span>' +
            '</div>' +
          '</div>' +
        '</div>' +
      '</div>' : '') +

      (free ? '' : '<div style="display:flex;justify-content:flex-end;margin-top:28px">' +
        '<button class="btn" id="btnNextTask">下一个任务 <span class="btn__arrow">→</span></button></div>') +

    '</div></section>';
  },

  mount: function(){
    const S = App.state;
    const ti = S.lab.task || 0;
    const T = TASKS[ti] || null;
    const free = !!S.flags.freeExplore;
    const p = S.lab.params;

    const cv = document.getElementById('benchCv');
    const bench = new window.Optics.Bench(cv, {
      interactive:true, mode: S.lab.mode || 'wave', params: p,
      onProbe: function(info){ renderProbe(info); updateReads(); }
    });
    bench.resize();
    if(T && T.photon) bench.setMode('photon');
    window.__bench = bench;

    /* ---- 标题收缩：滚出首屏后，大标题收起、顶栏下方压出一条标头 ---- */
    const labhead = document.getElementById('labhead');
    const labrail = document.getElementById('labrail');
    if(labhead && labrail && 'IntersectionObserver' in window){
      const io = new IntersectionObserver(function(entries){
        const e = entries[0];
        const gone = !e.isIntersecting && e.boundingClientRect.bottom <= 66;
        labrail.toggleAttribute('data-on', gone);
        labhead.toggleAttribute('data-compact', gone);
      }, { rootMargin: '-66px 0px 0px 0px', threshold: 0 });
      io.observe(labhead);
    }

    /* ---- 读数 ---- */
    function updateReads(){
      const real = P.toSI(S.lab.params);
      const dy = P.fringeSpacing(real.lam, real.L, real.d);
      const V = P.visibilityEdge(real, 6);
      const N = P.visibleFringes(real);
      const Lc = P.coherenceLength(real.lam, real.dLam);
      const bcr = P.criticalSourceWidth(real.lam, real.R, real.d);
      const pr = bench.probeInfo();
      const host = document.getElementById('reads');
      if(!host) return;
      host.innerHTML =
        read('条纹间距 Δy', P.fmtLen(dy)) +
        read('可见度 V（边缘）', V.toFixed(2), V < 0.3) +
        read('可观察条纹级数', N === Infinity ? '∞' : N, false) +
        read('相干长度 L_c', isFinite(Lc) ? P.fmtLen(Lc) : '∞') +
        (S.lab.mode === 'photon' ? read('到达光子数', bench.photonCount + ' 个')
          : (pr ? read('该点 δ', P.fmtLen(Math.abs(pr.delta))) : read('该点 δ', '点击屏幕', false, true)));
      renderBoundary(real, dy, V, N, Lc, bcr);
    }

    function read(k, v, hi, dim){
      return '<div class="read'+(hi?' read--hi':'')+'"><div class="read__k">'+k+'</div>' +
        '<div class="read__v" style="'+(dim?'color:var(--ink-4);font-size:12px':'')+'">'+v+'</div></div>';
    }

    function renderProbe(info){
      const box = document.getElementById('probeBox');
      if(!box) return;
      if(!info){ box.hidden = true; return; }
      box.hidden = false;
      const m = info.m;
      const order = Math.abs(m);
      const near = Math.round(m);
      const kind = info.kind;
      box.innerHTML =
        '<div class="probe__hd">探测点 P</div>' +
        '<div class="probe__row"><span>光程差 δ</span><b>'+P.fmtLen(Math.abs(info.delta))+'</b></div>' +
        '<div class="probe__row"><span>相位差 Δφ</span><b>'+(info.phi/Math.PI).toFixed(2)+' π</b></div>' +
        '<div class="probe__row"><span>折算级数 m</span><b>'+m.toFixed(2)+' λ</b></div>' +
        '<div class="probe__row"><span>相对强度 I/I<sub>max</sub></span><b>'+(info.I).toFixed(2)+'</b></div>' +
        '<div class="probe__res" data-k="'+kind+'">'+
          (info.snapped
            ? (kind==='bright' ? '已吸附亮纹中心 · m = '+(near>=0?'+':'')+near+' λ'
               : kind==='dark' ? '已吸附暗纹中心 · m = '+(Math.round(m*2)/2>=0?'+':'')+(Math.round(m*2)/2)+' λ'
               : '明暗之间 · 相位连续')
            : (kind==='bright' ? '亮纹附近 · δ ≈ '+near+'λ'
               : kind==='dark' ? '暗纹附近 · δ ≈ ('+Math.round(m-Math.sign(m)*0.5)+'±½)λ'
               : '明暗之间 · 相位连续'))+'</div>' +
        '<button class="probe__x" id="probeX">×</button>';
      const x = document.getElementById('probeX');
      if(x) x.addEventListener('click', function(){ box.hidden = true; bench.probe = null; updateReads(); });
    }

    function renderBoundary(real, dy, V, N, Lc, bcr){
      const host = document.getElementById('boundary');
      if(!host) return;
      const items = [];
      const ratio = real.d/real.L;
      if(ratio > 0.02) items.push(['warn','小角近似失效：d/L = '+(ratio*100).toFixed(2)+'%，条纹不等间距']);
      else items.push(['ok','小角近似成立：d/L = '+(ratio*100).toFixed(2)+'% ≪ 1']);
      if(dy*1e3 < 0.02) items.push(['warn','条纹间距小于 20 μm，低于常规观察分辨率']);
      if(V < 0.15) items.push(['warn','可见度 V = '+V.toFixed(2)+'，条纹不可见']);
      if(real.b > 0 && bcr) items.push([real.b >= bcr ? 'warn' : 'ok',
        '光源宽度 b / b临界 = '+(real.b/bcr).toFixed(2)]);
      if(real.dLam > 0) items.push([Lc < real.d*0.02 ? 'warn':'ok',
        '相干长度 '+(isFinite(Lc)?P.fmtLen(Lc):'∞')+' vs 屏上最大光程差 '+P.fmtLen(real.d*Math.sin(Math.atan2(0.006,real.L)))]);
      host.innerHTML = items.map(function(it){
        return '<span class="bchip" data-k="'+it[0]+'">'+esc(it[1])+'</span>';
      }).join('');
    }

    /* ---- 滑杆 ---- */
    const host = document.getElementById('sldHost');
    const snapState = {};   /* 每个滑杆当前的吸附值（磁滞用） */
    host.addEventListener('input', function(e){
      const r = e.target;
      if(r.tagName !== 'INPUT' || !r.dataset.k) return;
      const k = r.dataset.k;
      let v = Number(r.value);
      /* 磁吸：靠近刻度值（任务预设 / 常见波长 / 整数档）时粘住，小幅移动不脱离 */
      if(window.Snap){
        const key = 'snap_' + k;
        const sn = window.Snap.value(k, v, snapState[key]);
        if(sn.snapped){
          v = sn.v; r.value = v; snapState[key] = sn.detent;
          r.parentNode.setAttribute('data-snap','');
          clearTimeout(r.__snapT);
          r.__snapT = setTimeout(function(){ r.parentNode.removeAttribute('data-snap'); }, 620);
        } else {
          snapState[key] = null;
        }
      }
      S.lab.params[k] = v;
      const m = M[k];
      const el = document.getElementById('val-'+k);
      if(el){
        el.innerHTML = (k==='lam'? v.toFixed(1) : (k==='dLam'? v.toFixed(2) : v.toFixed(2)))+'<u>'+m.unit+'</u>';
        el.setAttribute('data-flash','');
        if(r.parentNode.hasAttribute('data-snap')) el.setAttribute('data-snap','');
        setTimeout(function(){ el.removeAttribute('data-flash'); }, 500);
      }
      bench.set(S.lab.params);
      App.track('param', { k:k, v:v, task: T?T.key:'free' });
      App.saveSoon();
      updateReads();
    });

    /* ---- 助教入口（实验台内 FAB 隐藏，改由面板按钮打开） ---- */
    const bt = document.getElementById('btnTutor');
    if(bt) bt.addEventListener('click', function(){ window.Tutor && window.Tutor.open(); });

    /* ---- 模式 ---- */
    document.getElementById('modeBar').addEventListener('click', function(e){
      const b = e.target.closest('button[data-mode]'); if(!b) return;
      const m = b.getAttribute('data-mode');
      S.lab.mode = m;
      document.querySelectorAll('#modeBar button').forEach(function(x){ x.removeAttribute('data-on'); });
      b.setAttribute('data-on','');
      bench.setMode(m);
      App.track('mode', { m:m });
    });

    /* ---- 记录 ---- */
    document.getElementById('btnRecord').addEventListener('click', function(){
      const real = P.toSI(S.lab.params);
      const dy = P.fringeSpacing(real.lam, real.L, real.d);
      const V = P.visibilityEdge(real, 6);
      const rec = {
        at: App.now(), task: T?T.key:'free',
        params: JSON.parse(JSON.stringify(S.lab.params)),
        dy: dy, V: V, N: P.visibleFringes(real)
      };
      S.lab.records.push(rec);
      App.track('record', { task: rec.task, dy: dy });
      App.save();
      document.getElementById('recN').textContent = S.lab.records.length;
      renderRecs();
      App.toast('已记录 ' + S.lab.records.length + ' 组数据。');
    });

    function renderRecs(){
      const box = document.getElementById('recbox');
      if(!box) return;
      const rs = S.lab.records;
      if(!rs.length){
        box.innerHTML = '<div class="reclist__empty">暂无数据。调参后点击「＋ 记录这一组数据」。</div>';
        return;
      }
      box.innerHTML = '<table class="tbl" style="margin-top:12px"><thead><tr>' +
        '<th>#</th><th>d / mm</th><th>λ / nm</th><th>Δλ / nm</th><th>b / mm</th><th>Δy</th><th>V</th>' +
        '</tr></thead><tbody>' + rs.map(function(r,i){
          return '<tr><td class="num">'+(i+1)+'</td><td class="num">'+r.params.d.toFixed(2)+'</td>' +
            '<td class="num">'+r.params.lam.toFixed(1)+'</td><td class="num">'+r.params.dLam.toFixed(2)+'</td>' +
            '<td class="num">'+r.params.b.toFixed(2)+'</td>' +
            '<td class="num">'+P.fmtLen(r.dy)+'</td><td class="num">'+r.V.toFixed(2)+'</td></tr>';
        }).join('') + '</tbody></table>';
    }

    /* ---- 任务交互 ---- */
    let predSel = S.lab.answers[T?T.key:''] ? (S.lab.answers[T?T.key:''].pred) : null;
    const predOpts = document.getElementById('predOpts');
    if(predOpts){
      predOpts.addEventListener('click', function(e){
        const o = e.target.closest('.opt'); if(!o) return;
        if(S.lab.answers[T.key] && S.lab.answers[T.key].locked){ App.toast('预测已锁定，不可修改。'); return; }
        predOpts.querySelectorAll('.opt').forEach(function(x){ x.removeAttribute('data-sel'); });
        o.setAttribute('data-sel','');
        const i = Number(o.getAttribute('data-p'));
        S.lab.answers[T.key] = Object.assign({}, S.lab.answers[T.key]||{}, { pred:i });
        App.track('answer', { task:T.key, q:'predict', i:i });
        App.saveSoon();
      });
    }
    const btnLock = document.getElementById('btnLockPred');
    if(btnLock) btnLock.addEventListener('click', function(){
      const a = S.lab.answers[T.key] || {};
      if(a.pred === undefined){ App.toast('请先选择预测。'); return; }
      S.lab.answers[T.key] = Object.assign({}, a, { locked:true, lockedAt: App.now() });
      App.track('submit', { task:T.key, q:'predict' });
      App.save();
      document.getElementById('predLock').innerHTML = '<div class="chip chip--jade">预测已锁定 · 开始调节参数</div>';
      App.toast('预测已锁定，开始调节参数。');
    });

    const chkOpts = document.getElementById('chkOpts');
    if(chkOpts){
      chkOpts.addEventListener('click', function(e){
        const o = e.target.closest('.opt'); if(!o) return;
        chkOpts.querySelectorAll('.opt').forEach(function(x){ x.removeAttribute('data-sel'); });
        o.setAttribute('data-sel','');
        const i = Number(o.getAttribute('data-c'));
        S.lab.answers[T.key] = Object.assign({}, S.lab.answers[T.key]||{}, { ans:i });
        App.track('answer', { task:T.key, q:'check', i:i });
        App.saveSoon();
      });
    }
    const why = document.getElementById('chkWhy');
    if(why) why.addEventListener('input', function(){
      S.lab.answers[T.key] = Object.assign({}, S.lab.answers[T.key]||{}, { why2: why.value });
      App.saveSoon();
    });

    const btnSub = document.getElementById('btnSubmit');
    if(btnSub) btnSub.addEventListener('click', function(){
      const a = S.lab.answers[T.key] || {};
      if(a.ans === undefined){ App.toast('请先选择结论。'); return; }
      if((a.why2||'').trim().length < 6){ App.toast('理由过短，请写出记录到的数值。'); return; }
      S.lab.answers[T.key] = Object.assign({}, a, { submitted:true, submittedAt: App.now() });
      App.track('submit', { task:T.key, q:'check' });
      App.save();
      document.getElementById('subState').textContent = '已提交';
      App.toast('已提交。' + (ti < TASKS.length-1 ? '可进入下一任务。' : '四个任务已完成。'));
    });

    const btnNext = document.getElementById('btnNextTask');
    if(btnNext) btnNext.addEventListener('click', function(){
      if(ti >= TASKS.length-1){ App.go('post'); return; }
      const cur = S.lab.answers[TASKS[ti].key];
      if(!cur || !cur.submitted){ App.toast('本任务尚未提交结论。'); return; }
      switchTask(ti+1);
    });

    function switchTask(i){
      S.lab.task = i;
      const nt = TASKS[i];
      Object.keys(nt.preset).forEach(function(k){ S.lab.params[k] = nt.preset[k]; });
      if(nt.photon) bench.setMode('photon');
      App.track('task', { i:i, key:nt.key });
      App.save();
      App.go('lab');
    }

    document.getElementById('taskbar').addEventListener('click', function(e){
      const b = e.target.closest('.tasktab'); if(!b) return;
      if(b.dataset.free){ S.flags.freeExplore = true; App.track('task', { free:true }); App.save(); App.go('lab'); return; }
      const i = Number(b.dataset.i);
      const prev = TASKS[i-1];
      if(i > 0 && !(S.lab.answers[prev.key] && S.lab.answers[prev.key].submitted)){
        App.toast('请先提交「'+prev.name.split('：')[0]+'」。'); return;
      }
      S.flags.freeExplore = false;
      switchTask(i);
    });

    updateReads();
    renderRecs();
    const tick = setInterval(function(){
      if(App.state.step !== 'lab'){ clearInterval(tick); return; }
      if(S.lab.mode === 'photon') updateReads();
    }, 1200);
    (App.loops = App.loops || []).push(function(){ clearInterval(tick); });
    App.saveSoon();
  }
};
})();
