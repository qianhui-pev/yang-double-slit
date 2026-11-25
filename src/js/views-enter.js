
/* ============ Views: 入口 ============ */
(function(){
'use strict';
const App = window.App, esc = App.esc, Views = App.Views;

Views.enter = {
  html: function(){
    const S = App.state;
    const all = App.readAll();
    const has = Object.keys(all).length > 0;
    const last = S.student && S.student.id ? S.student : null;
    return '' +
    '<section class="stage">' +
      '<div class="stage__canvas"><canvas id="heroCv"></canvas></div>' +
      '<div class="stage__scrim"></div>' +
      '<div class="stage__txt">' +
        '<div class="hr-rule anim-up"><span>YDS-01 / 干涉与相干性</span></div>' +
        '<div class="anim-up d1">' +
          '<div class="eyebrow" style="margin-bottom:16px">杨氏双缝 · 光程 · 相干性</div>' +
          '<h1 class="display">光程差<br>决定屏上亮暗。</h1>' +
        '</div>' +
        '<p class="lead anim-up d2">' +
          '两条缝到屏上同一点的光程不等。' +
          'δ 为 λ 的整数倍时干涉加强，为 λ/2 的奇数倍时相消。' +
          '缝距、屏距、波长改变的都只是 <span style="color:var(--ink-0)">δ</span> 本身。' +
        '</p>' +
        '<div class="anim-up d3">' +
          '<div class="enter-form">' +
            '<div class="field"><label class="field__lb" for="sid">学号 <span>*</span></label>' +
              '<input class="input" id="sid" name="sid" inputmode="numeric" placeholder="例如 21376001" value="'+esc(last?last.id:'')+'"></div>' +
            '<div class="field"><label class="field__lb" for="sname">姓名 <span>*</span></label>' +
              '<input class="input" id="sname" name="sname" placeholder="真实姓名" value="'+esc(last?last.name:'')+'"></div>' +
            '<div class="field field--wide"><label class="field__lb" for="sgroup">班级 / 小组</label>' +
              '<input class="input" id="sgroup" name="sgroup" placeholder="选填，便于教师端归档" value="'+esc(last?last.group:'')+'"></div>' +
          '</div>' +
        '</div>' +
        '<div class="enter-cta anim-up d4">' +
          '<button class="btn btn--solid" id="btnStart">开始探究 <span class="btn__arrow">→</span></button>' +
          (has ? '<button class="btn btn--ghost" id="btnResume">载入上次档案</button>' : '') +
        '</div>' +
        '<p class="enter-meta anim-up d5">' +
          '记录仅保存于本机浏览器，是否导出由使用者决定。不排名，不计成绩。' +
        '</p>' +
      '</div>' +
      '<span class="stage__rail" aria-hidden="true">OPTICAL BENCH · YDS-01 · 380—780 nm · 光程与相干性</span>' +
      '<div class="stage__hud" aria-hidden="true">' +
        '<div><span>λ</span><b id="hudLam">632.8</b><i>nm</i></div>' +
        '<div><span>d</span><b id="hudD">'+S.lab.params.d.toFixed(2)+'</b><i>mm</i></div>' +
        '<div><span>L</span><b id="hudL">'+S.lab.params.L.toFixed(2)+'</b><i>m</i></div>' +
        '<div><span>Δy</span><b id="hudDy">2.53</b><i>mm</i></div>' +
      '</div>' +
      '<div class="stage__tag" aria-hidden="true"><b></b><span>READY · 光路就绪</span></div>' +
    '</section>' +
    '<section class="section" style="border-top:1px solid var(--line-2)">' +
      '<div class="wrap">' +
        '<div class="grid g-3" style="gap:0">' +
          feature('01','条纹实时计算','屏上条纹由两列球面波叠加计算；点击屏上任意一点可读出该点光程差与相对强度。') +
          feature('02','参数可至边界','缝距、屏距、波长、光源宽度、谱宽均可调节，可推到模型失效的边界。') +
          feature('03','过程留档','预测、参数改动、停留时长全部记录，可复盘，可整份导出。') +
        '</div>' +
      '</div>' +
    '</section>';
  },
  mount: function(){
    const S = App.state;
    const cv = document.getElementById('heroCv');
    const b = new window.Optics.Bench(cv, { interactive:false, mode:'wave',
      geo:{ s0:0.44, p:0.605, s:0.975 },
      params:{ d: S.lab.params.d, L:S.lab.params.L, lam:S.lab.params.lam, b:0, R:0.6, dLam:0 } });
    let t0 = performance.now();
    const rd = null;
    function drift(ts){
      const k = (ts-t0)/1000;
      const lam = 622 + 62*Math.sin(k*0.15);
      b.set({ lam: lam });
      const L1 = document.getElementById('hudLam');
      if(L1) L1.textContent = lam.toFixed(1);
      const dyEl = document.getElementById('hudDy');
      if(dyEl && window.Phys){
        const real = window.Phys.toSI(b.p);
        dyEl.textContent = (window.Phys.fringeSpacing(real.lam, real.L, real.d)*1000).toFixed(2);
      }
      b._driftRaf = requestAnimationFrame(drift);
    }
    if(!window.matchMedia('(prefers-reduced-motion: reduce)').matches){
      b._driftRaf = requestAnimationFrame(drift);
    }
    (App.loops = App.loops||[]).push(function(){ cancelAnimationFrame(b._driftRaf); });

    document.getElementById('btnStart').addEventListener('click', function(){
      const id = (document.getElementById('sid').value||'').trim();
      const nm = (document.getElementById('sname').value||'').trim();
      const gp = (document.getElementById('sgroup').value||'').trim();
      if(!id || !nm){ App.toast('学号与姓名必填，用于归档。'); return; }
      const all = App.readAll();
      if(all[id] && all[id].student && all[id].student.name && all[id].student.name !== nm){
        App.toast('学号已被「'+all[id].student.name+'」占用，请更换。'); return;
      }
      if(all[id] && all[id].v === 1 && all[id].student.name === nm && all[id].track.length > 2){
        if(!confirm('该学号已有 '+all[id].track.length+' 条记录。确定＝继续，取消＝新建档案。')){
          App.state = App.blank();
        } else { App.state = all[id]; }
      }
      S.student.id = id; S.student.name = nm; S.student.group = gp;
      App.state.student = { id:id, name:nm, group:gp };
      App.save();
      App.track('enter', { id:id });
      App.go('pre');
    });

    const br = document.getElementById('btnResume');
    if(br) br.addEventListener('click', function(){
      const all = App.readAll();
      const keys = Object.keys(all);
      let cur = null;
      try{ cur = localStorage.getItem('yds.v1.current'); }catch(e){}
      const resumeTo = function(st){
        const k = st && st.step;
        return (k && k !== 'enter') ? k : 'pre';
      };
      if(cur && all[cur]){
        App.state = all[cur];
        App.toast('已载入 ' + all[cur].student.name + ' 的档案');
        App.go(resumeTo(all[cur]));
        return;
      }
      if(keys.length === 1){
        App.state = all[keys[0]];
        App.toast('已载入 ' + all[keys[0]].student.name + ' 的档案');
        App.go(resumeTo(all[keys[0]]));
      } else {
        App.go('gate');
      }
    });
  }
};

function feature(n, t, d){
  return '<div style="padding:26px 0 26px 0;border-left:1px solid var(--line-2);padding-left:22px;margin-right:22px">' +
    '<div class="eyebrow" style="color:var(--laser)">'+n+'</div>' +
    '<h3 class="h-sub" style="margin:12px 0 8px">'+t+'</h3>' +
    '<p class="dim" style="font-size:13.5px;margin:0;line-height:1.7">'+d+'</p></div>';
}
})();
