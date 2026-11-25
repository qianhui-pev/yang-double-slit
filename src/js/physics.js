
/* ============ 物理模型 ============ */
window.Phys = (function(){
  const C = 299792458;

  function fringeSpacing(lamM, L, d){ return lamM * L / d; }

  function pathDiff(d, y, L){ return d * Math.sin(Math.atan2(y, L)); }

  function visibilitySp(sourceWidth, d, R, lam){
    if(sourceWidth <= 0) return 1;
    const x = Math.PI * sourceWidth * d / (lam * R);
    return Math.abs(x < 1e-9 ? 1 : Math.sin(x)/x);
  }

  function visibilityTemporal(delta, lam, dLam){
    if(dLam <= 0) return 1;
    return Math.abs(Math.cos(Math.PI * dLam * delta / (lam*lam)));
  }

  function coherenceLength(lam, dLam){ return dLam > 0 ? lam*lam/dLam : Infinity; }
  function coherenceTime(lam, dLam){ return coherenceLength(lam,dLam)/C; }

  function criticalSourceWidth(lam, R, d){ return lam * R / d; }

  function intensityAt(y, p){
    const delta = pathDiff(p.d, y, p.L);
    const Vsp = visibilitySp(p.b, p.d, p.R, p.lam);
    const Vt  = visibilityTemporal(delta, p.lam, p.dLam);
    const V = Vsp * Vt;
    const phase = 2*Math.PI*delta/p.lam;
    return { I: 0.5*(1 + V*Math.cos(phase)), delta, V, Vsp, Vt };
  }

  function measureVisibility(p, yHalf){
    let mx = -1e9, mn = 1e9, lim = yHalf || fringeSpacing(p.lam,p.L,p.d)*6;
    for(let i=0;i<=400;i++){
      const y = -lim + 2*lim*i/400;
      const v = intensityAt(y,p).I;
      if(v>mx) mx=v; if(v<mn) mn=v;
    }
    return (mx-mn)/(mx+mn+1e-12);
  }

  function visibilityEdge(p, nOrders){
    const dyM = fringeSpacing(p.lam, p.L, p.d);
    const y = (nOrders||6) * dyM;
    const delta = p.d * Math.sin(Math.atan2(y, p.L));
    return visibilitySp(p.b,p.d,p.R,p.lam) * visibilityTemporal(delta, p.lam, p.dLam);
  }

  function visibleFringes(p){
    if(p.dLam <= 0) return Infinity;
    return Math.max(0, Math.floor(p.lam/(2*p.dLam)));
  }

  function sinc(x){ return Math.abs(x)<1e-9?1:Math.sin(x)/x; }

  const models = {
    d:{ def:0.30, min:0.05, max:1.20, step:0.01, unit:'mm', k:1e-3, label:'缝距 d', sym:'d' },
    L:{ def:1.20, min:0.30, max:3.00, step:0.01, unit:'m',  k:1,    label:'屏距 L',  sym:'L' },
    lam:{ def:632.8, min:380, max:780, step:0.1, unit:'nm', k:1e-9, label:'波长 λ', sym:'λ' },
    b:{ def:0.00, min:0, max:1.50, step:0.01, unit:'mm', k:1e-3, label:'光源宽度 b', sym:'b' },
    R:{ def:0.60, min:0.20, max:1.50, step:0.01, unit:'m', k:1, label:'源到缝距 R', sym:'R' },
    dLam:{ def:0.00, min:0, max:150, step:0.5, unit:'nm', k:1e-9, label:'谱宽 Δλ', sym:'Δλ' }
  };

  function toSI(p){
    return { d:p.d*1e-3, L:p.L, lam:p.lam*1e-9, b:p.b*1e-3, R:p.R, dLam:p.dLam*1e-9 };
  }

  function fmt(v, digits){
    if(!isFinite(v)) return '∞';
    const a = Math.abs(v);
    if(a === 0) return '0';
    if(a >= 100) return v.toFixed(digits===undefined?1: Math.max(0,digits-2));
    if(a >= 1) return v.toFixed(digits===undefined?3:digits);
    if(a >= 1e-3) return v.toFixed(4);
    return v.toExponential(2);
  }

  function fmtLen(m){
    const mm = m*1e3;
    if(Math.abs(mm) >= 10) return mm.toFixed(1)+' mm';
    if(Math.abs(mm) >= 1) return mm.toFixed(2)+' mm';
    return (mm*1e3).toFixed(1)+' μm';
  }

  function wavelengthColor(nm){
    let r=0,g=0,b=0;
    if(nm>=380&&nm<440){ r=-(nm-440)/60; b=1; }
    else if(nm<490){ g=(nm-440)/50; b=1; }
    else if(nm<510){ g=1; b=-(nm-510)/20; }
    else if(nm<580){ r=(nm-510)/70; g=1; }
    else if(nm<645){ r=1; g=-(nm-645)/65; }
    else { r=1; }
    let f=1;
    if(nm>=380&&nm<420) f=0.3+0.7*(nm-380)/40;
    else if(nm>700&&nm<=780) f=0.3+0.7*(780-nm)/80;
    const g8=x=>Math.round(255*Math.pow(Math.max(0,Math.min(1,x))*f,0.8));
    return [g8(r),g8(g),g8(b)];
  }

  return { C, fringeSpacing, pathDiff, visibilitySp, visibilityTemporal, coherenceLength,
           coherenceTime, criticalSourceWidth, intensityAt, measureVisibility, visibleFringes, visibilityEdge,
           sinc, models, toSI, fmt, fmtLen, wavelengthColor };
})();

/* ============ 滑杆刻度与磁吸（2026-11-24） ============ */
/* 有意义的档位：任务预设 + 常见波长 + 整数档。拖动时靠近这些值会「粘住」一小段，松手就是精确值。 */
const DETENTS = {
  d:   [0.05, 0.10, 0.20, 0.30, 0.60, 0.90, 1.20],
  L:   [0.30, 0.60, 1.00, 1.20, 1.50, 2.00, 3.00],
  lam: [380, 405, 436, 532, 589, 632.8, 660, 700, 780],
  b:   [0, 0.20, 0.60, 1.00, 1.27, 1.50],
  R:   [0.20, 0.40, 0.60, 0.80, 1.00, 1.50],
  dLam:[0, 1, 5, 20, 40, 60, 100, 150]
};
/* 吸附窗口（单位同参数），以及粘住后放宽的倍数（磁滞） */
const SNAP_WIN = { d:0.025, L:0.040, lam:4.0, b:0.025, R:0.030, dLam:2.0 };
const SNAP_STICK = 1.4;

function snapValue(k, v, prevSnap){
  const list = DETENTS[k];
  if(!list) return { v:v, snapped:false, detent:null };
  const win = SNAP_WIN[k] || 0;
  if(prevSnap != null && prevSnap != undefined && Math.abs(v - prevSnap) < win*SNAP_STICK){
    return { v:prevSnap, snapped:true, detent:prevSnap };
  }
  let best = null, bd = 1e9;
  for(let i=0;i<list.length;i++){
    const d = Math.abs(v - list[i]);
    if(d < bd){ bd = d; best = list[i]; }
  }
  if(best != null && bd <= win) return { v:best, snapped:true, detent:best };
  return { v:v, snapped:false, detent:null };
}

/* 刻度小标记的 HTML（画在滑杆轨道上，纯装饰，不接事件） */
function detentTicks(k, min, max){
  const list = DETENTS[k];
  if(!list) return '';
  /* λ 不加刻度：光谱条本身就是连续的色标，再加竖线只会把彩虹切碎；
     当前位置由滑块与下方 380/780 表示，吸附反馈靠滑块辉光。 */
  if(k === 'lam') return '';
  const span = max - min;
  /* 端点档位不画：滑杆两端下方已经印着 min / max，再画一根刻度就是重复。 */
  return '<div class="sld__det">' + list.filter(function(d){
    return d > min + span*1e-6 && d < max - span*1e-6;
  }).map(function(d){
    const pct = (d-min)/(max-min)*100;
    return '<i style="left:'+pct.toFixed(2)+'%" title="'+d+'"></i>';
  }).join('') + '</div>';
}

window.Snap = { list:DETENTS, win:SNAP_WIN, value:snapValue, ticks:detentTicks };
