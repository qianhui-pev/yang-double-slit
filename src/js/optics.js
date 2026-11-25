
/* ============ 光场渲染引擎 ============ */
(function(){
'use strict';
const P = window.Phys;
const App = window.App;

const LAMBDA_PX_MIN = 7.0, LAMBDA_PX_MAX = 11.5;

function lamPxOf(lam){ return LAMBDA_PX_MIN + (lam-380)/(780-380)*(LAMBDA_PX_MAX-LAMBDA_PX_MIN); }

function dispUnits(p, lamShow){
  const lam = (lamShow === undefined || lamShow === null) ? p.lam : lamShow;
  const lamPx = lamPxOf(lam);
  const dN = App.clamp((p.d-0.05)/(1.20-0.05),0,1);
  const sPx = 74 + dN*232;
  return { lamPx, sPx };
}

function Bench(canvas, opts){
  this.cv = canvas;
  this.ctx = canvas.getContext('2d');
  this.opts = Object.assign({ interactive:false, showScreen:true, mode:'wave', animate:true }, opts||{});
  this.p = Object.assign({ d:0.30, L:1.20, lam:632.8, b:0, R:0.60, dLam:0 }, opts&&opts.params||{});
  this.probe = null;
  this.t = 0;
  this.photonSeed = [];
  this.photonCount = 0;
  this.raf = null;
  this.stopFns = [];
  this.lamShow = this.p.lam;   /* 显示 λ：朝目标 120ms 缓动（读数仍用真值） */
  this._pacc = null; this._phDrawn = 0;   /* 单光子累积层（曝光式堆叠） */
  this.ghost = null;           /* 幽灵条纹：参数变化前一帧的残影 */
  this._ghostAt = 0;
  this.resize();
  this.bindEvents();
  this.start();
  const self = this;
  (App.loops = App.loops || []).push(function(){ self.destroy(); });
}

Bench.prototype.destroy = function(){
  if(this.raf) cancelAnimationFrame(this.raf);
  this.raf = null;
  if(this._onResize) window.removeEventListener('resize', this._onResize);
};

Bench.prototype.resize = function(){
  const r = this.cv.getBoundingClientRect();
  const dpr = Math.min(window.devicePixelRatio||1, 2);
  this.W = Math.max(320, r.width);
  this.H = Math.max(220, r.height);
  this.cv.width = Math.round(this.W*dpr);
  this.cv.height = Math.round(this.H*dpr);
  this.ctx.setTransform(dpr,0,0,dpr,0,0);
  this.geom();
};

Bench.prototype.geom = function(){
  const W=this.W, H=this.H;
  const G = this.opts.geo || {s0:0.045, p:0.30, s:0.945};
  this.xS0 = W*G.s0;
  this.xP  = W*G.p;
  this.xS  = W*G.s;
  this.cy  = H*0.5;
  this.Hs  = H*0.46;
  const u = dispUnits(this.p, this.lamShow);
  this.lamPx = u.lamPx;
  this.sPx = u.sPx;
  this.Dpx = this.xS - this.xP;
  this.dyPx = this.lamPx * this.Dpx / this.sPx;
};

Bench.prototype.bindEvents = function(){
  const self = this;
  this._onResize = function(){ if(self.raf!==null||true){ self.resize(); } };
  window.addEventListener('resize', this._onResize);
  if(this.opts.interactive){
    this.cv.style.cursor = 'crosshair';
    this.cv.addEventListener('click', function(e){
      const r = self.cv.getBoundingClientRect();
      const x = e.clientX-r.left, y = e.clientY-r.top;
      if(x > (self.xP-6)){
        self.probe = App.clamp(y, self.cy-self.Hs, self.cy+self.Hs);
        /* 磁吸：落在亮纹/暗纹中心 8px 内就归到正中（手机上画布小，点不准也能读到整数级） */
        self.snapped = false;
        if(self.dyPx > 5){
          const m = (self.probe - self.cy)/self.dyPx;
          const near = Math.round(m*2)/2;      /* 0.5 步长：整数=亮纹，半整数=暗纹 */
          const ySnap = self.cy + near*self.dyPx;
          /* 吸附半径随条纹间距自适应：手机上条纹密，吸附范围收窄 */
          const mag = Math.min(8, self.dyPx*0.35);
          if(Math.abs(self.probe - ySnap) <= mag){ self.probe = ySnap; self.snapped = true; }
        }
        if(self.opts.onProbe) self.opts.onProbe(self.probeInfo());
      }
    });
  }
};

Bench.prototype.set = function(p, silent){
  var key = false, self = this;
  if(p) Object.keys(p).forEach(function(k){
    if((k==='d' || k==='lam' || k==='L') && Math.abs(Number(p[k]) - Number(self.p[k])) > 1e-9) key = true;
  });
  if(key && !silent && !this.fxOff() && this.opts.mode !== 'photon') this.captureGhost();
  if(key){ this._pacc = null; this._phDrawn = 0; }   /* 条纹图案变了，旧的累积不再是这个参数下的证据 */
  this.p = Object.assign({}, this.p, p);
  this.geom();
  if(!silent) this.dirty = true;
};

/* 特效总开关：?fx=0 / body[data-fx=off] / 系统「减少动效」 */
Bench.prototype.fxOff = function(){
  if(document.body && document.body.getAttribute('data-fx') === 'off') return true;
  return !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
};

/* V3 幽灵条纹：把变化前最后一帧留成 35% 残影，1.2s 内淡出 */
Bench.prototype.captureGhost = function(){
  var now = Date.now();
  if(now - this._ghostAt < 120) return;      /* 节流：磁吸与快速拖动不逐帧抓图 */
  this._ghostAt = now;
  if(!this.cv.width || !this.cv.height) return;
  if(!this._gcv || this._gcv.width !== this.cv.width || this._gcv.height !== this.cv.height){
    this._gcv = document.createElement('canvas');
    this._gcv.width = this.cv.width; this._gcv.height = this.cv.height;
    this._gctx = this._gcv.getContext('2d');
  }
  this._gctx.clearRect(0, 0, this._gcv.width, this._gcv.height);
  this._gctx.drawImage(this.cv, 0, 0);
  this.ghost = { cv: this._gcv, life: 1 };
};
Bench.prototype.setMode = function(m){
  this.opts.mode = m;
  if(m==='photon'){ this.photonSeed = []; this.photonCount = 0; this._pacc = null; this._phDrawn = 0; }
};
Bench.prototype.setProbe = function(yPx){ this.probe = yPx; };

Bench.prototype.phaseAt = function(yPx, apPx){
  const dy = yPx - this.cy;
  const kd = 2*Math.PI*this.sPx*dy/(this.lamPx*this.Dpx);
  return kd;
};

Bench.prototype.probeInfo = function(){
  if(this.probe==null) return null;
  const yPx = this.probe;
  const dy = yPx - this.cy;
  const mFringe = this.sPx*dy/(this.lamPx*this.Dpx);
  const lamEff = this.p.lam;
  const deltaNm = mFringe * lamEff;
  const deltaEff = lamEff * mFringe;
  const phi = 2*Math.PI*(deltaEff/lamEff);
  const Vis = this.visibilityAt(yPx);
  const I = 0.5*(1 + Vis*Math.cos(phi));
  const frac = deltaEff/lamEff;
  const isBright = I > 0.78;
  return {
    yPx:yPx, dy:dy,
    delta: deltaEff*1e-9,
    phi: phi, m: frac, V: Vis, I: I,
    kind: isBright ? 'bright' : (I < 0.22 ? 'dark' : 'mid'),
    snapped: !!this.snapped,
    yReal: dy * -1e-3
  };
};

Bench.prototype.visibilityAt = function(yPx){
  const real = P.toSI(this.p);
  const Vsp = P.visibilitySp(real.b, real.d, real.R, real.lam);
  const dy = yPx - this.cy;
  const mFringe = this.sPx*dy/(this.lamPx*this.Dpx);
  const deltaEff = real.lam * mFringe;
  const Vt = P.visibilityTemporal(deltaEff, real.lam, real.dLam);
  return Vsp*Vt;
};

Bench.prototype.screenI = function(yPx){
  const dy = yPx - this.cy;
  const mFringe = this.sPx*dy/(this.lamPx*this.Dpx);
  const V = this.visibilityAt(yPx);
  return 0.5*(1 + V*Math.cos(2*Math.PI*mFringe));
};

Bench.prototype.start = function(){
  const self = this;
  const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let last = 0;
  function frame(ts){
    self.raf = requestAnimationFrame(frame);
    if(last && ts-last < (reduce?200:33)) return;
    const dt = last ? Math.min(120, ts-last) : 16;
    last = ts;
    if(!document.hidden) self.step(dt);
  }
  this.raf = requestAnimationFrame(frame);
};

Bench.prototype.step = function(dt){
  this.t += dt;
  /* V2：λ 换色 120ms 缓动（磁吸跳到某个波长时不再硬切） */
  var target = this.p.lam;
  if(this.fxOff()){
    if(this.lamShow !== target){ this.lamShow = target; this.geom(); }
  } else if(Math.abs(this.lamShow - target) > 1e-4){
    this.lamShow += (target - this.lamShow)*(1 - Math.exp(-dt/80));   /* 时间常数 80ms：约 240ms 收敛 */
    if(Math.abs(this.lamShow - target) < 0.02) this.lamShow = target;
    this.geom();
  }
  /* V3：残影 1.2s 线性淡出 */
  if(this.ghost){
    this.ghost.life -= dt/1200;
    if(this.ghost.life <= 0.002) this.ghost = null;
  }
  this.draw();
  if(this.opts.mode==='photon') this.addPhotons(8);   /* 曝光速率：约 240 个/秒，十几秒能看出条纹 */
};

/* ---------- 主绘制 ---------- */
Bench.prototype.draw = function(){
  const g = this.ctx, W=this.W, H=this.H;
  g.clearRect(0,0,W,H);

  /* 背景：暗室 + 台面 + 空气 */
  const bg = g.createRadialGradient(this.xP, this.cy, 10, this.xP, this.cy, Math.max(W,H)*1.05);
  bg.addColorStop(0,'#0B1016'); bg.addColorStop(.45,'#070A0E'); bg.addColorStop(1,'#030507');
  g.fillStyle = bg; g.fillRect(0,0,W,H);

  /* 缝周围的空气雾（把光晕散到整幅画面，避免左右割裂） */
  const haze = g.createRadialGradient(this.xP, this.cy, 0, this.xP, this.cy, Math.max(this.Dpx*1.15, W*0.42));
  haze.addColorStop(0,'rgba(255,236,214,.055)');
  haze.addColorStop(.35,'rgba(255,150,110,.035)');
  haze.addColorStop(1,'rgba(0,0,0,0)');
  g.save(); g.globalCompositeOperation='lighter'; g.fillStyle=haze; g.fillRect(0,0,W,H); g.restore();

  this.drawGrid(g);
  if(this.opts.mode==='wave'){
    this.drawField(g);
  } else {
    this.drawFieldDim(g);
  }
  this.drawOptics(g);
  this.drawScreenStrip(g);
  if(this.opts.mode==='photon') this.drawPhotons(g);
  this.drawAnnotations(g);
  if(this.ghost && this.ghost.life > 0.002 && !this.fxOff()){
    g.save();
    g.globalAlpha = 0.42*this.ghost.life;
    g.drawImage(this.ghost.cv, 0, 0, this.W, this.H);
    g.restore();
  }
  this.drawVignette(g);
};

Bench.prototype.drawVignette = function(g){
  const W=this.W,H=this.H;
  const v = g.createRadialGradient(W*0.5,H*0.5,Math.min(W,H)*0.35,W*0.5,H*0.5,Math.max(W,H)*0.78);
  v.addColorStop(0,'rgba(0,0,0,0)');
  v.addColorStop(1,'rgba(2,4,6,.55)');
  g.fillStyle = v; g.fillRect(0,0,W,H);
};

Bench.prototype.drawGrid = function(g){
  const H=this.H, W=this.W;
  g.save();
  /* 细网格 */
  g.strokeStyle = 'rgba(158,197,216,.030)';
  g.lineWidth = 1;
  const step = 26;
  g.beginPath();
  for(let x=0;x<W;x+=step){ g.moveTo(x+.5,0); g.lineTo(x+.5,H); }
  for(let y=0;y<H;y+=step){ g.moveTo(0,y+.5); g.lineTo(W,y+.5); }
  g.stroke();
  /* 粗网格：每 5 格一条，长刻度 */
  g.strokeStyle = 'rgba(158,197,216,.075)';
  g.beginPath();
  for(let x=0;x<W;x+=step*5){ g.moveTo(x+.5,0); g.lineTo(x+.5,H); }
  for(let y=0;y<H;y+=step*5){ g.moveTo(0,y+.5); g.lineTo(W,y+.5); }
  g.stroke();
  /* 光轴 */
  g.strokeStyle = 'rgba(158,197,216,.16)';
  g.beginPath(); g.moveTo(0,this.cy+.5); g.lineTo(W,this.cy+.5); g.stroke();
  g.restore();
};

Bench.prototype.fieldBuf = function(w,h){
  if(!this._buf || this._buf.width!==w){
    this._buf = document.createElement('canvas');
    this._buf.width = w; this._buf.height = h;
    this._bctx = this._buf.getContext('2d');
    this._img = this._bctx.createImageData(w,h);
  }
  return this._img;
};

/* 场强 → 颜色：胶片式的高光压缩 + 中心发白 */
function toneColor(col, I, out){
  const t = I<=0 ? 0 : 190*(1-Math.exp(-I*0.86));
  const hot = Math.pow(Math.min(1,I),2.2);          /* 亮核偏白，像激光 */
  const w = hot*0.10;
  out[0] = col[0]*(1-w)+255*w;
  out[1] = col[1]*(1-w)+250*w;
  out[2] = col[2]*(1-w)+242*w;
  return t;
}

Bench.prototype.drawField = function(g){
  const x0 = Math.max(0, this.xP-2), x1 = this.xS;
  const W = this.W, H = this.H;
  const bw = Math.max(190, Math.min(420, Math.round((x1-x0)/2.2)));
  const bh = Math.max(60, Math.round(bw*H/(x1-x0)));
  const img = this.fieldBuf(bw,bh);
  const data = img.data;
  const lamPx = this.lamPx, sPx = this.sPx;
  const cy = this.cy, Hs = this.Hs;
  const wt = this.t*0.0042;
  const sx1 = cy - sPx/2, sx2 = cy + sPx/2;
  const scaleX = (x1-x0)/bw, scaleY = H/bh;
  const lamD = this.lamShow;                       /* 显示 λ（缓动中） */
  const broad = this.p.dLam > 0 ? Math.min(3, this.p.dLam) : 0;
  const lamSet = broad ? [lamD - broad*28, lamD, lamD + broad*28] : [lamD];
  const rgb = [0,0,0];
  let i = 0;
  for(let by=0; by<bh; by++){
    const py = by*scaleY;
    for(let bx=0; bx<bw; bx++){
      const px = x0 + bx*scaleX;
      const dx = Math.max(2, px - this.xP);
      const d1 = Math.sqrt(dx*dx + (py-sx1)*(py-sx1));
      const d2 = Math.sqrt(dx*dx + (py-sx2)*(py-sx2));
      const near = Math.min(1, Math.max(0, (dx-4)/90));             /* 缝口极近处柔和起手 */
      const fade = near*(1 - 0.30*Math.abs(py-cy)/(Hs*1.7));
      let sum = 0, r=0, G=0, b=0;
      for(let s=0; s<lamSet.length; s++){
        const lamS = lamSet[s];
        const kk = 2*Math.PI/(LAMBDA_PX_MIN + (lamS-380)/(780-380)*(LAMBDA_PX_MAX-LAMBDA_PX_MIN));
        const a1 = Math.cos(kk*d1 - wt)/Math.sqrt(d1+58);
        const a2 = Math.cos(kk*d2 - wt)/Math.sqrt(d2+58);
        let v = a1+a2; v = v*v*110*fade;
        let II = v;
        const t = toneColor(P.wavelengthColor(lamS), II, rgb);
        r += rgb[0]*t/255; G += rgb[1]*t/255; b += rgb[2]*t/255;
        sum += t;
      }
      const n = lamSet.length;
      data[i]   = r/n;
      data[i+1] = G/n;
      data[i+2] = b/n;
      data[i+3] = 255;
      i += 4;
    }
  }
  this._bctx.putImageData(img,0,0);
  g.save();
  g.globalCompositeOperation = 'lighter';
  /* 三层光晕：近核清晰、中层柔、外层大气（alpha 压在 1 以内，避免叠加漂白） */
  g.globalAlpha = 0.10;
  if('filter' in g) g.filter = 'blur(16px)';
  g.drawImage(this._buf, x0-24, -20, x1-x0+48, H+40);
  g.globalAlpha = 0.30;
  g.filter = 'blur(5px)';
  g.drawImage(this._buf, x0-10, -8, x1-x0+20, H+16);
  g.globalAlpha = 0.92;
  g.filter = 'blur(1.6px)';
  g.drawImage(this._buf, x0, 0, x1-x0, H);
  g.filter = 'none';
  g.restore();
};

Bench.prototype.drawFieldDim = function(g){
  g.save();
  g.globalAlpha = 0.14;
  this.drawField(g);
  g.restore();
};

Bench.prototype.drawOptics = function(g){
  const cy=this.cy, Hs=this.Hs, xP=this.xP, sPx=this.sPx;
  g.save();
  const col = P.wavelengthColor(this.lamShow);
  const cstr = col.join(',');
  const puls = 0.78 + 0.22*Math.sin(this.t*0.0048);

  /* 激光器机壳 */
  const bw0 = Math.max(46, Math.min(120, this.xP-this.xS0-40));
  const ly0 = cy-11;
  g.fillStyle = 'rgba(14,18,24,.92)';
  g.strokeStyle = 'rgba(158,197,216,.30)';
  g.lineWidth = 1;
  g.beginPath(); g.roundRect(this.xS0, ly0, bw0, 22, 2); g.fill(); g.stroke();
  /* 机壳刻度与散热缝 */
  g.strokeStyle = 'rgba(158,197,216,.12)';
  for(let i=1;i<=4;i++){
    const xx = this.xS0 + bw0 - 14 - i*7;
    g.beginPath(); g.moveTo(xx, ly0+4); g.lineTo(xx, ly0+18); g.stroke();
  }
  g.fillStyle = 'rgba(158,197,216,.55)';
  g.fillRect(this.xS0+9, cy-2.5, 13, 5);
  /* 出光口 */
  const ox = this.xS0 + bw0;
  const ap = g.createRadialGradient(ox, cy, 0, ox, cy, 16);
  ap.addColorStop(0,'rgba(255,255,255,'+(0.85*puls)+')');
  ap.addColorStop(.30,'rgba('+cstr+','+(0.55*puls)+')');
  ap.addColorStop(1,'rgba('+cstr+',0)');
  g.fillStyle = ap; g.beginPath(); g.arc(ox, cy, 16, 0, 7); g.fill();

  /* 光束：外层色 + 内核白 */
  const x1 = xP;
  const beam = g.createLinearGradient(ox, cy, x1, cy);
  beam.addColorStop(0,'rgba('+cstr+','+(0.20*puls)+')');
  beam.addColorStop(.55,'rgba('+cstr+','+(0.55*puls)+')');
  beam.addColorStop(1,'rgba(255,246,236,'+(0.80*puls)+')');
  g.fillStyle = beam;
  g.fillRect(ox, cy-1.6, x1-ox, 3.2);
  g.save();
  g.shadowColor = 'rgba('+cstr+',.9)'; g.shadowBlur = 22;
  g.fillStyle = 'rgba(255,248,240,'+(0.55*puls)+')';
  g.fillRect(ox, cy-0.7, x1-ox, 1.4);
  g.restore();

  /* 挡板 + 双缝 */
  const pw = 5;
  const gap = Math.max(4.5, sPx*0.16);
  g.fillStyle = '#04070B';
  g.strokeStyle = 'rgba(158,197,216,.22)';
  g.lineWidth = 1;
  [[cy-Hs*1.22, cy-sPx/2-gap/2],[cy+sPx/2+gap/2, cy+Hs*1.22]].forEach(function(seg){
    g.beginPath(); g.rect(xP-pw/2, seg[0], pw, seg[1]-seg[0]); g.fill(); g.stroke();
    g.beginPath(); g.moveTo(xP-pw/2+0.5, seg[0]); g.lineTo(xP-pw/2+0.5, seg[1]);
    g.strokeStyle='rgba(158,197,216,.10)'; g.stroke(); g.strokeStyle='rgba(158,197,216,.22)';
  });
  /* 缝口辉光 */
  [cy-sPx/2, cy+sPx/2].forEach(function(sy){
    const gg = g.createRadialGradient(xP, sy, 0, xP, sy, 26);
    gg.addColorStop(0,'rgba(255,255,255,.72)');
    gg.addColorStop(.16,'rgba('+cstr+',.55)');
    gg.addColorStop(.45,'rgba('+cstr+',.16)');
    gg.addColorStop(1,'rgba('+cstr+',0)');
    g.fillStyle = gg; g.beginPath(); g.arc(xP, sy, 22, 0, 7); g.fill();
  });

  /* 屏（薄板） */
  const sg = g.createLinearGradient(this.xS-2, 0, this.xS+10, 0);
  sg.addColorStop(0,'rgba(158,197,216,.14)');
  sg.addColorStop(.35,'rgba(158,197,216,.06)');
  sg.addColorStop(1,'rgba(158,197,216,.012)');
  g.fillStyle = sg; g.fillRect(this.xS-1, 0, 11, this.H);
  g.fillStyle = 'rgba(158,197,216,.34)';
  g.fillRect(this.xS-1, 0, 1, this.H);
  g.restore();
};

Bench.prototype.stripRect = function(){
  const w = this.opts.mode === 'photon' ? Math.min(104, this.W*0.13) : Math.min(34, this.W*0.045);
  const x = this.W - w - 12;
  return { x:x, w:Math.max(6,w) };
};
Bench.prototype.stripWidth = function(){ return this.stripRect().w; };

Bench.prototype.drawScreenStrip = function(g){
  const H = this.H;
  const sr = this.stripRect();
  const x = sr.x, w = sr.w;
  if(w <= 4) return;
  const SW = 26;
  if(!this._scr || this._scr.height !== H || this._scr.width !== SW){
    this._scr = document.createElement('canvas');
    this._scr.width = SW; this._scr.height = H;
    this._scx = this._scr.getContext('2d');
    this._simg = this._scx.createImageData(SW, H);
  }
  const img = this._simg, data = img.data;
  const col = P.wavelengthColor(this.lamShow);
  for(let y=0; y<H; y++){
    const I = this.screenI(y);
    const a = I <= 0.002 ? 0 : Math.pow(I, 1.05)*255;
    const o = y*SW*4;
    for(let k=0;k<SW;k++){
      const hot = Math.pow(Math.min(1,I),3)*0.75;
      const u = (k+0.5)/SW*2-1;                        /* -1..1 横向 */
      const edge = Math.pow(Math.cos(u*Math.PI/2), 1.4); /* 余弦软边，去掉硬块 */
      data[o+k*4]   = col[0]*(1-hot)+255*hot;
      data[o+k*4+1] = col[1]*(1-hot)+236*hot;
      data[o+k*4+2] = col[2]*(1-hot)+214*hot;
      data[o+k*4+3] = a*edge;
    }
  }
  this._scx.putImageData(img, 0, 0);
  g.save();
  g.globalCompositeOperation = 'lighter';
  const dim = this.opts.mode === 'photon';
  /* 光带外溢 */
  if('filter' in g) g.filter = 'blur(9px)';
  g.globalAlpha = dim ? 0.10 : 0.22;
  g.drawImage(this._scr, this.xS-40, 0, w+64, H);
  g.filter = 'none';
  g.globalAlpha = dim ? 0.10 : 0.34;
  g.drawImage(this._scr, x-4, 0, w+8, H);
  g.globalAlpha = dim ? 0.13 : 0.96;
  g.drawImage(this._scr, x, 0, w, H);
  g.restore();
};

Bench.prototype.addPhotons = function(n){
  const self = this;
  for(let j=0;j<n;j++){
    let y = null, tries = 0;
    while(y===null && tries<40){
      const cand = this.cy + (Math.random()*2-1)*this.Hs*1.15;
      if(Math.random() < this.screenI(cand)) y = cand;
      tries++;
    }
    if(y!==null){
      this.photonSeed.push({ y:y, x: Math.random(), born: this.t });
      this.photonCount++;
    }
  }
  if(this.photonSeed.length > 2600) this.photonSeed.splice(0, this.photonSeed.length-2600);
};

/* 单光子：两层曝光 —— 累积层（每个光子只画一次、极淡，长期堆出条纹）+ 活跃层（最近 1.5s，按 e^-t/0.6 衰减） */
Bench.prototype.phAcc = function(){
  const sr = this.stripRect();
  const dpr = Math.min(window.devicePixelRatio||1, 2);
  const w = Math.max(6, sr.w);
  if(!this._pacc || this._paccW !== w || this._paccH !== this.H){
    this._pacc = document.createElement('canvas');
    this._paccW = w; this._paccH = this.H;
    this._pacc.width = Math.round(w*dpr); this._pacc.height = Math.round(this.H*dpr);
    this._pacx = this._pacc.getContext('2d');
    this._pacx.setTransform(dpr,0,0,dpr,0,0);
    this._phDrawn = 0;
  }
  return this._pacc;
};

Bench.prototype.drawPhotons = function(g){
  const col = P.wavelengthColor(this.lamShow);
  const sr = this.stripRect();
  const x0 = sr.x, w = Math.max(6, sr.w);
  const acc = this.phAcc();
  const pac = this._pacx;

  /* 1) 把新到的光子补进累积层（每个只画一次；alpha 极低 → 越堆越亮） */
  const pending = Math.min(this.photonSeed.length, Math.max(0, this.photonCount - this._phDrawn));
  if(pending > 0){
    const fresh = this.photonSeed.slice(this.photonSeed.length - pending);
    pac.save();
    pac.globalCompositeOperation = 'lighter';
    pac.fillStyle = 'rgba('+col.join(',')+',1)';
    for(let i=0;i<fresh.length;i++){
      const ph = fresh[i];
      pac.globalAlpha = 0.14;   /* 每个光子落一次；叠够数量后亮纹自己浮出来 */
      pac.beginPath();
      pac.arc(1 + ph.x*(w-2), ph.y, 1.7, 0, 7);
      pac.fill();
    }
    pac.restore();
    this._phDrawn = this.photonCount;
  }

  g.save();
  g.globalCompositeOperation = 'lighter';
  /* 2) 累积层：本身已经很淡，整层叠加（不加额外透明度） */
  g.globalAlpha = 1;
  g.drawImage(acc, x0, 0, w, this.H);
  /* 3) 活跃层：最近 1.5s 的光子，亮度按 e^-t/0.6 衰减，能看见「曝光正在进行」 */
  const TAU = 600, LIFE = 1500;
  for(let i=this.photonSeed.length-1; i>=0; i--){
    const ph = this.photonSeed[i];
    const age = this.t - ph.born;
    if(age > LIFE) break;                       /* 数组按时间递增，越界即可停 */
    const a = 0.80*Math.exp(-age/TAU);
    if(a < 0.02) continue;
    const k = 2.2 + 3.2*Math.exp(-age/TAU);     /* 新到的点略大，像刚落到屏上 */
    const px = x0 + 1 + ph.x*(w-2);
    g.fillStyle = 'rgba(255,250,244,'+(a*0.75).toFixed(3)+')';
    g.beginPath(); g.arc(px, ph.y, k, 0, 7); g.fill();
    g.fillStyle = 'rgba('+col.join(',')+','+a.toFixed(3)+')';
    g.beginPath(); g.arc(px, ph.y, k*1.9, 0, 7); g.fill();
  }
  g.restore();
};

Bench.prototype.drawAnnotations = function(g){
  const cy=this.cy, Hs=this.Hs, xP=this.xP, xS=this.xS;
  g.save();
  g.font = '9px "Cascadia Mono", Consolas, monospace';
  g.fillStyle = 'rgba(242,244,245,.34)';
  g.textAlign = 'left';

  // 缝距标注
  if(this.sPx > 26){
    const sx1 = cy-this.sPx/2, sx2 = cy+this.sPx/2;
    g.strokeStyle = 'rgba(255,176,58,.55)';
    g.beginPath(); g.moveTo(xP-16, sx1); g.lineTo(xP-16, sx2); g.stroke();
    g.beginPath(); g.moveTo(xP-20, sx1); g.lineTo(xP-12, sx1); g.moveTo(xP-20, sx2); g.lineTo(xP-12, sx2); g.stroke();
    g.fillStyle = 'rgba(255,176,58,.8)';
    g.textAlign='right';
    g.fillText('d', xP-23, (sx1+sx2)/2+3);
  }

  // 屏轴刻度
  g.textAlign='left';
  g.fillStyle='rgba(242,244,245,.3)';
  g.textAlign='right'; g.fillText('SCREEN', xS-12, 16); g.textAlign='left';

  // 探针
  if(this.probe!=null){
    const y = this.probe;
    g.setLineDash([3,4]);
    g.strokeStyle='rgba(255,59,46,.8)';
    g.beginPath(); g.moveTo(xP, y); g.lineTo(xS, y); g.stroke();
    g.setLineDash([]);
    g.fillStyle='#FF3B2E';
    g.beginPath(); g.arc(xS, y, 3.2, 0, 7); g.fill();
    g.beginPath(); g.arc(xS, y, 8, 0, 7); g.strokeStyle='rgba(255,59,46,.35)'; g.stroke();
  }
  g.restore();
};

/* ============ 辅助小图 ============ */
function miniStrip(canvas, p, opts){
  const dpr = Math.min(window.devicePixelRatio||1,2);
  const r = canvas.getBoundingClientRect();
  const W = Math.max(120, r.width), H = Math.max(60, r.height);
  canvas.width = W*dpr; canvas.height = H*dpr;
  const g = canvas.getContext('2d');
  g.setTransform(dpr,0,0,dpr,0,0);
  g.clearRect(0,0,W,H);
  const real = P.toSI(p);
  const dyM = P.fringeSpacing(real.lam, real.L, real.d);
  const half = (opts&&opts.half) || dyM*6;
  const col = P.wavelengthColor(p.lam);
  g.strokeStyle='rgba(242,244,245,.07)'; g.lineWidth=1;
  g.beginPath(); g.moveTo(.5,0); g.lineTo(.5,H); g.stroke();
  g.beginPath(); g.moveTo(0,H-1.5); g.lineTo(W,H-1.5); g.stroke();
  const N = Math.max(80, Math.floor(W));
  let first = true;
  for(let i=0;i<=N;i++){
    const y = -half + 2*half*i/N;
    const pt = P.intensityAt(y, real);
    const x = i/N*W;
    const yy = H - (H-8)*pt.I - 2;
    if(first){ g.beginPath(); g.moveTo(x,yy); first=false; }
    else g.lineTo(x,yy);
  }
  g.strokeStyle = 'rgba('+col.join(',')+',.95)';
  g.lineWidth = 1.4; g.stroke();
  g.lineTo(W,H); g.lineTo(0,H); g.closePath();
  g.fillStyle = 'rgba('+col.join(',')+',.10)'; g.fill();
  /* 图上不再写任何文字：标题在卡片头部（屏上强度 I(y)），刻度在卡片脚下。
     以前这里用 9px 字在画布上写了个 'I(y)'，缩放后就是几个来路不明的小字。 */
  return { dyM:dyM };
}

window.Optics = { Bench: Bench, miniStrip: miniStrip, dispUnits: dispUnits };
})();
