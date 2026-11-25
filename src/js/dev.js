
/* ============ DEV 调试通道 ============ */
(function(){
'use strict';
const App = window.App, P = window.Phys, B = window.Bank;

const DKEY = 'yds.dev';
let on = false;

function shouldOn(){
  try{
    if(/[?&]dev=1/.test(location.search)) return true;
    if(/dev/.test(location.hash)) return true;
    return localStorage.getItem(DKEY) === '1';
  }catch(e){ return false; }
}

function ensureStudent(){
  const S = App.state;
  if(!S.student || !S.student.id){
    S.student = { id:'DEV0001', name:'调试账号', group:'DEV' };
  }
  App.save();
}

function fillQuiz(store, bank, mode){
  bank.forEach(function(it, qi){
    let idx = 0;
    if(mode === 'correct') idx = it.opts.findIndex(function(o){ return o.correct; });
    else if(mode === 'wrong') idx = it.opts.findIndex(function(o){ return !o.correct; });
    else idx = (qi % 3 === 2) ? Math.max(0, it.opts.findIndex(function(o){ return !o.correct; }))
                              : it.opts.findIndex(function(o){ return o.correct; });
    store[it.k] = { ans: idx, conf: 3 + (qi%3), why: '调试填充：' + (mode==='correct'?'按公式推导':'凭印象'), at: App.now() };
  });
}

function makeRecords(n){
  const S = App.state, T = window.LAB_TASKS || [];
  const t = T[S.lab.task] || T[0];
  if(!t) return;
  n = n || 4;
  for(let i=0;i<n;i++){
    const d = 0.20 + i*0.15;
    const p = Object.assign({}, S.lab.params, { d: d });
    const real = P.toSI(p);
    S.lab.records.push({
      at: App.now(), task: t.key, params: p,
      dy: P.fringeSpacing(real.lam, real.L, real.d),
      V: P.visibilityEdge(real, 6),
      N: P.visibleFringes(real)
    });
  }
  App.track('record', { dev:true, n:n });
}

function submitAll(mode){
  const S = App.state, T = window.LAB_TASKS || [];
  T.forEach(function(t, ti){
    const correctPred = t.predict.opts.findIndex(function(o){ return o.correct; });
    const correctAns = t.check.opts.findIndex(function(o){ return o.correct; });
    const wrongPred = t.predict.opts.findIndex(function(o){ return !o.correct; });
    const wrongAns = t.check.opts.findIndex(function(o){ return !o.correct; });
    const useWrong = (mode === 'wrong') || (mode === 'mixed' && ti === 1);
    S.lab.answers[t.key] = {
      pred: useWrong ? wrongPred : correctPred,
      locked: true, lockedAt: App.now(),
      ans: useWrong ? wrongAns : correctAns,
      why2: useWrong ? '调试填充：这一条是故意选错的，用来验证错因分析。'
                     : '调试填充：Δy = λL/d，改一个量、其余锁住，用两组数据的比值说话。',
      submitted: true, submittedAt: App.now()
    };
    const real = P.toSI(t.preset);
    if(!S.lab.records.some(function(r){ return r.task === t.key; })){
      S.lab.records.push({ at: App.now(), task: t.key,
        params: Object.assign({}, t.preset, S.lab.params, { d: t.preset.d }),
        dy: P.fringeSpacing(real.lam, real.L, real.d),
        V: P.visibilityEdge(real, 6), N: P.visibleFringes(real) });
    }
  });
  S.flags.freeExplore = true;
  App.track('submit', { dev:true, scope:'all-tasks' });
}

function ev(cls, label, fn, hint){
  const b = document.createElement('button');
  b.className = 'dev-btn ' + (cls||'');
  b.textContent = label;
  if(hint) b.title = hint;
  b.addEventListener('click', function(e){ e.stopPropagation(); fn(); panel.refresh(); });
  return b;
}

const panel = {
  el: null,
  build: function(){
    if(this.el) return this.el;
    const el = document.createElement('div');
    el.id = 'devPanel';
    el.innerHTML =
      '<div class="dev-hd"><span>DEV · 调试通道</span>' +
        '<button class="dev-x" id="devOff" title="关闭（Ctrl+Shift+D 可再开）">×</button></div>' +
      '<div class="dev-sec" id="devSteps"></div>' +
      '<div class="dev-sec" id="devFill"></div>' +
      '<div class="dev-sec" id="devData"></div>' +
      '<div class="dev-ft" id="devFoot"></div>';
    document.body.appendChild(el);
    this.el = el;

    document.getElementById('devOff').addEventListener('click', function(){
      localStorage.setItem(DKEY,'0'); on = false; el.remove(); panel.el = null;
      const chip = document.getElementById('devChip'); if(chip) chip.remove();
      App.toast('调试面板已关闭。重新开启：地址后加 ?dev=1');
    });

    const steps = document.getElementById('devSteps');
    App.STEPS.forEach(function(s){
      steps.appendChild(ev('dev-step', s.n, function(){
        ensureStudent(); App.go(s.k);
      }, '跳到「'+s.n+'」，不需要任何前置条件'));
    });
    /* 控制台/口令门不在 STEPS 里（要先过口令），调试时单给一个入口 */
    steps.appendChild(ev('dev-step', '控制台', function(){
      ensureStudent(); App.go('teacher');
    }, '进口令门 / 控制台（口令 2580）'));

    const fill = document.getElementById('devFill');
    fill.appendChild(ev('', '填前测✓', function(){ ensureStudent(); fillQuiz(App.state.pre, B.PRE, 'correct'); }));
    fill.appendChild(ev('', '填后测✓', function(){ ensureStudent(); fillQuiz(App.state.post, B.POST, 'correct'); }));
    fill.appendChild(ev('', '混合错误', function(){
      ensureStudent(); fillQuiz(App.state.pre, B.PRE, 'mixed'); fillQuiz(App.state.post, B.POST, 'mixed');
    }, '前测后测按 1/3 错填，用来验证错因标签与分层'));
    fill.appendChild(ev('', '完成 4 任务', function(){ ensureStudent(); submitAll('correct'); }, '四个实验任务全部提交，解锁台阶'));
    fill.appendChild(ev('', '含一处错', function(){ ensureStudent(); submitAll('mixed'); }));
    fill.appendChild(ev('', '造 4 组记录', function(){ ensureStudent(); makeRecords(4); }));


    const data = document.getElementById('devData');
    data.appendChild(ev('', '一键完整档案', function(){
      ensureStudent();
      const S = App.state;
      fillQuiz(S.pre, B.PRE, 'correct');
      fillQuiz(S.post, B.POST, 'correct');
      submitAll('correct');
      makeRecords(4);
      S.track.push({t:App.now(),k:'dev',d:{seed:'full'}});
      App.save();
      App.toast('已生成「全部完成」档案');
    }, '一次填满：前测+后测+四任务+记录，直接看复盘/教师端'));
    data.appendChild(ev('', '示例学生×4', function(){
      if(App.__devUnlock) App.__devUnlock();
      const demo = window.makeDemo();
      const all = App.readAll();
      Object.keys(demo).forEach(function(k){ all[k] = demo[k]; });
      App.writeAll(all);
      App.go('teacher');
    }, '载入 4 份不同层级的示例档案，看教师端'));
    data.appendChild(ev('', '切到示例学生', function(){
      if(App.__devUnlock) App.__devUnlock();
      const demo = window.makeDemo();
      const all = App.readAll();
      Object.keys(demo).forEach(function(k){ all[k] = demo[k]; });
      App.writeAll(all);
      App.state = demo['22376011'];
      App.save();
      App.toast('当前档案 → 王子航（示例档案 · B 级）');
      App.go('review');
    }, '把「当前档案」换成示例学生，复盘/评价/导出立刻有内容'));
    data.appendChild(ev('danger', '清空本机', function(){
      if(confirm('清空这台浏览器里的全部档案？（不可撤销）')){
        localStorage.clear();
        App.state = App.blank();
        App.go('enter');
        setTimeout(function(){ if(on) panel.build().attach(); }, 120);
      }
    }));
    data.appendChild(ev('', '导出 state', function(){
      App.download('dev-state.json', JSON.stringify(App.state,null,2), 'application/json');
    }));
    data.appendChild(ev('', '复制 state', function(){
      try{ navigator.clipboard.writeText(JSON.stringify(App.state)); App.toast('已复制到剪贴板'); }
      catch(e){ App.toast('复制失败'); }
    }));
    this.refresh();
    if(!this._tick){
      this._tick = setInterval(function(){ if(on) panel.refresh(); }, 1000);
    }
    return el;
  },
  attach: function(){
    this.build();
    this.el.style.display = '';
    this.refresh();
  },
  refresh: function(){
    const f = document.getElementById('devFoot');
    if(!f) return;
    const S = App.state;
    const A = window.Analysis ? window.Analysis.of(S) : null;
    f.innerHTML = 'step=<b>'+S.step+'</b> · id=<b>'+(S.student.id||'—')+'</b>' +
      (A ? ' · 后测<b>'+A.postOk+'</b>/5 · 记录<b>'+A.recCount+'</b> · 层级<b>'+A.tier+'</b>' : '');
  }
};

function chip(){
  if(document.getElementById('devChip')) return;
  const tb = document.getElementById('topbar');
  if(!tb) return;
  const c = document.createElement('span');
  c.id = 'devChip';
  c.className = 'chip chip--amber';
  c.style.cssText = 'margin-left:8px;font-size:9px';
  c.textContent = 'DEV';
  c.title = '调试模式已开启（Ctrl+Shift+D 开关）';
  tb.querySelector('.topact').prepend(c);
}

function enable(persist){
  on = true;
  if(persist !== false) localStorage.setItem(DKEY,'1');
  try{
    const e = localStorage.getItem('yds.devExpanded');
    const S = App.state;
  }catch(err){}
  ensureStudent();
  panel.attach();
  chip();
  App.toast('调试通道已开：左上角面板可跳任意页面');
}

function disable(){
  on = false;
  localStorage.setItem(DKEY,'0');
  if(panel.el) panel.el.remove();
  panel.el = null;
  const c = document.getElementById('devChip'); if(c) c.remove();
}

document.addEventListener('keydown', function(e){
  if(e.ctrlKey && e.shiftKey && (e.key === 'D' || e.key === 'd')){
    e.preventDefault();
    on ? disable() : enable();
  }
});

function boot(){
  if(!shouldOn()) return;
  /* 用 ?dev=1 / #dev 打开的：只这一次生效，不写进 localStorage，
     免得以后正常打开也一直挂着 DEV 面板；手动 Ctrl+Shift+D 开关才持久化。 */
  const byUrl = /[?&]dev=1/.test(location.search) || /dev/.test(location.hash);
  enable(byUrl ? false : true);
}
if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
else setTimeout(boot, 0);

window.Dev = { enable:enable, disable:disable, fillQuiz:fillQuiz, submitAll:submitAll, makeRecords:makeRecords, ensureStudent:ensureStudent };
})();
