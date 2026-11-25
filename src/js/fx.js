
/* ============ FX：光、颗粒、动效层（不改任何业务逻辑） ============ */
(function(){
'use strict';
var App = window.App;
if(!App) return;
var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
/* 特效总开关：地址带 ?fx=0 或 body[data-fx=off] 时全部关掉（便于 A/B 对比与回退） */
var FXOFF = /[?&]fx=0(&|$|#)/.test(location.search) || /[?&]fx=off/.test(location.search);
if(FXOFF && document.body) document.body.setAttribute('data-fx','off');
var B = window.Optics && window.Optics.Bench;

/* ---------- 1. 全局颗粒与暗角 ---------- */
function overlays(){
  if(!document.getElementById('fxGrain')){
    var g = document.createElement('div'); g.id='fxGrain'; document.body.appendChild(g);
    var v = document.createElement('div'); v.id='fxVig'; document.body.appendChild(v);
  }
}

/* ---------- 2. 换页：一道光扫过 ---------- */
function pageFx(){
  var host = document.getElementById('view');
  if(!host) return;
  host.classList.remove('view-in');
  void host.offsetWidth;
  host.classList.add('view-in');
  var old = host.querySelector('.beam-wipe');
  if(old) old.remove();
  if(!reduce){
    var w = document.createElement('div'); w.className='beam-wipe';
    host.insertBefore(w, host.firstChild);
    setTimeout(function(){ if(w.parentNode) w.remove(); }, 420);
  }
  document.body.dataset.step && document.body.setAttribute('data-step', document.body.dataset.step);
}

/* ---------- 3. 面板聚光：光跟着指针走 ---------- */
function spotlights(){
  Array.prototype.forEach.call(document.querySelectorAll('.bench,.taskcard,.panel,.pathcard,.qcard'), function(el){
    el.classList.add('spot');
    if(el.__spot) return;
    el.__spot = true;
    el.addEventListener('pointermove', function(e){
      var r = el.getBoundingClientRect();
      el.style.setProperty('--mx', ((e.clientX-r.left)/r.width*100)+'%');
      el.style.setProperty('--my', ((e.clientY-r.top)/r.height*100)+'%');
    }, {passive:true});
  });
}

/* ---------- 4. 滑杆：亮起来的那一段填充 ---------- */
/* 真实光谱渐变：380–780 nm 每 20 nm 一个色标，取值与光场同源（wavelengthColor） */
function specGradient(){
  if(window.__specGrad) return window.__specGrad;
  var P = window.Phys, stops = [];
  if(!P) return 'transparent';
  for(var nm=380; nm<=780; nm+=20){
    stops.push('rgb('+P.wavelengthColor(nm).join(',')+') '+(((nm-380)/400)*100).toFixed(2)+'%');
  }
  window.__specGrad = 'linear-gradient(90deg,'+stops.join(',')+')';
  return window.__specGrad;
}

function sliders(){
  Array.prototype.forEach.call(document.querySelectorAll('input[type=range]'), function(r){
    if(r.__fill) return; r.__fill = true;
    var paint = function(){
      var mn = Number(r.min||0), mx = Number(r.max||100), v = Number(r.value);
      var pct = mx===mn ? 0 : (v-mn)/(mx-mn)*100;
      pct = Math.max(0, Math.min(100, pct));
      if(r.dataset.k === 'lam'){
        /* λ 轨道换成真实光谱：拇指停在哪，那里的颜色就是当前波长。
           光谱条上不叠等距刻度梳（那些刻度不对应任何数值，只会把彩虹切碎）。 */
        r.style.backgroundImage = specGradient();
        r.style.backgroundSize = '100% 7px';
        r.style.backgroundPosition = 'center';
        r.style.backgroundRepeat = 'no-repeat';
        var c = window.Phys ? window.Phys.wavelengthColor(v) : [255,59,46];
        r.style.setProperty('--lam-col', 'rgb(' + c.join(',') + ')');
        r.style.setProperty('--lam-glow', '0 0 16px 3px rgba(' + c.join(',') + ',.55)');
      } else {
        /* 轨道只保留「已走段」这一层：不再压每 10% 一根的等距刻度梳，
           那些刻度不对应任何数值，只会把一根细线切成一段段小短杠。 */
        r.style.backgroundImage =
          'linear-gradient(90deg,var(--laser) 0 '+pct+'%,rgba(158,197,216,.30) '+pct+'% 100%)';
        r.style.backgroundSize = '100% 1px';
        r.style.backgroundPosition = 'center';
        r.style.backgroundRepeat = 'no-repeat';
      }
    };
    paint();
    if(r.dataset.k === 'lam' && !r.__drag){
      r.__drag = true;
      r.addEventListener('pointerdown', function(){ r.parentNode.setAttribute('data-drag',''); });
      window.addEventListener('pointerup', function(){
        clearTimeout(r.__dragT);
        r.__dragT = setTimeout(function(){ r.parentNode.removeAttribute('data-drag'); }, 700);
      });
    }
    r.addEventListener('input', paint);
    r.addEventListener('change', paint);
  });
}

/* ---------- 5. 光谱条：λ 落在哪儿 ---------- */
function spectrum(){
  var bar = document.getElementById('specBar');
  if(!bar) return;
  var mk = bar.querySelector('i'); if(!mk){ mk = document.createElement('i'); bar.appendChild(mk); }
  mk.style.transform='none';
  var paint = function(){
    var lam = (App.state && App.state.lab && App.state.lab.params) ? App.state.lab.params.lam : 632.8;
    var dLam = (App.state && App.state.lab && App.state.lab.params) ? App.state.lab.params.dLam : 0;
    var pct = (lam-380)/(780-380)*100;
    var wpx = Math.max(2, (dLam/400)*100);
    mk.style.left = Math.max(0,Math.min(99.4, pct - wpx/2)) + '%';
    mk.style.width = Math.min(wpx, 100-Math.max(0,Math.min(99.4,pct-wpx/2))) + '%';
    var col = window.Phys && window.Phys.wavelengthColor ? window.Phys.wavelengthColor(lam) : [255,59,46];
    mk.style.background = 'rgb('+col.join(',')+')';
    mk.style.boxShadow = '0 0 12px 2px rgba('+col.join(',')+',.85)';
  };
  paint();
  if(bar.__t) clearInterval(bar.__t);
  bar.__t = setInterval(paint, 260);
}

/* ---------- 6. 入口舞台：指针牵引的一盏灯 ---------- */
function heroLight(){
  var cv = document.querySelector('.stage__canvas');
  var stage = document.querySelector('.stage');
  if(!cv || !stage || stage.__lit) return;
  stage.__lit = true;
  var d = document.createElement('div');
  d.className = 'hero-light';
  cv.appendChild(d);
  /* V1 手电照字：一层暗纱，只有光斑那一小块是透的 —— 光斑里的字被「照」出来，其余压暗 */
  if(!stage.__veil){
    stage.__veil = true;
    var veil = document.createElement('div');
    veil.className = 'hero-veil';
    stage.appendChild(veil);
    var glow = document.createElement('div');
    glow.className = 'hero-glow';
    stage.appendChild(glow);
  }
  /* 光斑坐标按「文字栏」（.hero-veil 的框）算，不是按整个舞台算：
     暗纱只盖文字栏，光斑落在文字栏里才和指针对得上。 */
  var veilEl = stage.querySelector('.hero-veil');
  var tx = 52, ty = 44, cx = 52, cy = 44;   /* 默认光斑停在标题上：静止时也像一束打在字上的光 */
  stage.addEventListener('pointermove', function(e){
    var r = (veilEl || stage).getBoundingClientRect();
    tx = Math.max(-15, Math.min(115, ((e.clientX-r.left)/Math.max(1,r.width))*100));
    ty = Math.max(-10, Math.min(110, ((e.clientY-r.top)/Math.max(1,r.height))*100));
  }, {passive:true});
  stage.addEventListener('pointerleave', function(){ tx = 52; ty = 44; });
  if(reduce){
    stage.style.setProperty('--lx', tx+'%'); stage.style.setProperty('--ly', ty+'%');
    return;
  }
  (function tick(){
    cx += (tx-cx)*0.09; cy += (ty-cy)*0.09;
    stage.style.setProperty('--lx', cx.toFixed(2)+'%');
    stage.style.setProperty('--ly', cy.toFixed(2)+'%');
    requestAnimationFrame(tick);
  })();
}

/* ---------- 6.5 前测 / 后测：答题进度光轨（答一题亮一格，亮起时一道光扫过） ---------- */
function qaRail(){
  var host = document.getElementById('qhost');
  if(!host || host.__rail) return;
  var cards = host.querySelectorAll('.qcard');
  if(!cards.length) return;
  host.__rail = true;
  var wrap = document.createElement('div'); wrap.className = 'qa-wrap';
  var rail = document.createElement('div'); rail.className = 'qa-rail';
  for(var i=0;i<cards.length;i++){ var d = document.createElement('div'); d.className = 'qa-seg'; rail.appendChild(d); }
  var meta = document.createElement('div'); meta.className = 'qa-rail__m';
  wrap.appendChild(rail); wrap.appendChild(meta);
  host.parentNode.insertBefore(wrap, host);
  var sweep = function(seg){
    seg.classList.remove('qa-flash');
    void seg.offsetWidth;
    seg.classList.add('qa-flash');
    setTimeout(function(){ seg.classList.remove('qa-flash'); }, 760);
  };
  var upd = function(){
    var done = 0;
    for(var i=0;i<cards.length;i++){
      var seg = rail.children[i];
      var on = !!cards[i].querySelector('.opt[data-sel]');
      if(on && !seg.hasAttribute('data-on')){ seg.setAttribute('data-on', ''); sweep(seg); }
      if(!on && seg.hasAttribute('data-on')) seg.removeAttribute('data-on');
      if(on) done++;
    }
    meta.textContent = done + '/' + cards.length;
  };
  new MutationObserver(upd).observe(host, {subtree:true, attributes:true, attributeFilter:['data-sel']});
  upd();
}

/* ---------- 6.55 读数条：数字滚动（拖滑杆/点探针时数值滚过去，不是硬跳） ---------- */
function rollReads(){
  var host = document.getElementById('reads');
  if(!host || host.__roll) return;
  host.__roll = true;
  var shown = {}, anims = {};
  var rollTo = function(key, el, from, to, dec, suffix){
    if(anims[key]) cancelAnimationFrame(anims[key]);
    var t0 = performance.now(), dur = 150;
    var step = function(){
      var k = Math.min(1, (performance.now()-t0)/dur);
      var v = from + (to-from)*(1-Math.pow(1-k,3));
      shown[key] = v;
      el.textContent = v.toFixed(dec) + suffix;
      if(k < 1) anims[key] = requestAnimationFrame(step);
      else { anims[key] = null; shown[key] = to; el.textContent = to.toFixed(dec) + suffix; }
    };
    step();
  };
  var sync = function(){
    var els = host.querySelectorAll('.read__v');
    var ks  = host.querySelectorAll('.read__k');
    for(var i=0;i<els.length;i++){
      var el = els[i], key = ks[i] ? ks[i].textContent : ('i'+i);
      var txt = (el.textContent || '').trim();
      var m = txt.match(/^([\d.]+)([^\d]*)$/);      /* 数字开头 + 单位后缀 */
      if(!m){ shown[key] = null; continue; }
      var target = parseFloat(m[1]), suffix = m[2];
      var dec = (m[1].split('.')[1] || '').length;
      var unit = Math.pow(10, -dec);
      if(shown[key] !== null && shown[key] !== undefined && Math.abs(shown[key]-target) > unit/2){
        rollTo(key, el, shown[key], target, dec, suffix);
      } else {
        shown[key] = target;
      }
    }
  };
  new MutationObserver(sync).observe(host, {childList:true, subtree:true});
  sync();
}

/* ---------- 6.6 进场揭示：分节线展开 / 图卡扫一遍 / 题卡落定（都只做一次） ---------- */
function reveals(){
  if(!('IntersectionObserver' in window)) return;
  if(!window.__io){
    window.__io = new IntersectionObserver(function(es){
      es.forEach(function(e){
        if(e.isIntersecting){ e.target.setAttribute('data-in',''); window.__io.unobserve(e.target); }
      });
    }, {threshold: 0.12});
  }
  Array.prototype.forEach.call(
    document.querySelectorAll('.sec-rule:not([data-in]), .figwrap:not([data-in]), .qcard:not([data-in])'),
    function(el){ window.__io.observe(el); });
}

/* ---------- 7. 每次视图重绘后把它们挂回去 ---------- */
function hydrate(){
  overlays(); spotlights(); sliders(); spectrum(); heroLight(); qaRail(); rollReads(); reveals();
}
hydrate();

var host = document.getElementById('view');
if(host){
  var mo = new MutationObserver(function(){ hydrate(); });
  mo.observe(host, {childList:true, subtree:true});
}
new MutationObserver(function(){ overlays(); heroLight(); })
  .observe(document.body, {childList:true, subtree:false});

/* 路由包装：光扫 + 视图入场 */
if(App && typeof App.go === 'function'){
  var go0 = App.go;
  App.__go = go0;
  App.go = function(step, opts){
    var r = go0(step, opts);
    pageFx();
    return r;
  };
}
setTimeout(pageFx, 60);
window.FX = { hydrate:hydrate };
})();
