
/* ============ Views: 教师端 ============ */
(function(){
'use strict';
const App = window.App, esc = App.esc, Views = App.Views, B = window.Bank;

function allRows(){
  const all = App.readAll();
  return Object.keys(all).map(function(k){ return all[k]; })
    .filter(function(s){ return s && s.student && s.student.id; })
    .sort(function(a,b){ return (b.updated||0)-(a.updated||0); });
}

function tierOf(S){
  try{ return window.Analysis.of(S).tier; }catch(e){ return '—'; }
}

Views.teacher = {
  html: function(){
    const rows = allRows();
    const dist = {A:0,B:0,C:0,'—':0};
    rows.forEach(function(s){ const k = tierOf(s); dist[k] = (dist[k]||0)+1; });

    return '<section class="section" style="padding-top:34px"><div class="wrap" style="max-width:1440px">' +
      '<div class="sec-hd anim-up">' +
        '<div>' +
          '<div class="sec-hd__n"><b>07</b> / CONSOLE · 控制台</div>' +
          '<h2 class="h-sec" style="margin-top:14px">学生档案与<br>卡点分布。</h2>' +
        '</div>' +
        '<div class="dimmer mono" style="font-size:10px;letter-spacing:.16em;text-align:right;line-height:1.9">' +
          '本机存档 · ' + rows.length + ' 份<br>可导出、可导入</div>' +
      '</div>' +

      '<div class="arc anim-up d1" style="margin-top:20px">' +
        '<div class="arc__main">' +
          '<div class="arc__eyebrow"><span class="arc__n">I.</span><i>班级分布</i><span class="arc__tag">COHORT</span></div>' +
          '<div class="arc__lead"><b>'+rows.length+'</b><span>份档案</span></div>' +
          '<div class="arc__dist">' +
            distCell('A','方法级',dist.A,'var(--jade)') +
            distCell('B','了解级',dist.B,'var(--amber)') +
            distCell('C','需关注',dist.C,'var(--laser-soft)') +
          '</div>' +
        '</div>' +
        '<div class="arc__side">' +
          '<div class="arc__sideh">存档信息 · ARCHIVE</div>' +
          arcRow('最近更新', rows.length ? new Date(rows[0].updated).toLocaleDateString('zh-CN') : '—') +
          arcRow('分布', 'A '+dist.A+' · B '+dist.B+' · C '+dist.C + (dist['—'] ? ' · 未评级 '+dist['—'] : '')) +
          arcRow('导出格式', 'CSV · JSON') +
          arcRow('存放位置', '本机浏览器') +
        '</div>' +
      '</div>' +

      '<div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:18px" class="anim-up d2">' +
        '<button class="btn btn--sm" id="tCsv">导出汇总 CSV</button>' +
        '<button class="btn btn--sm" id="tJson">导出全部 JSON</button>' +
        '<button class="btn btn--sm btn--ghost" id="tImport">导入学生档案…</button>' +
        '<button class="btn btn--sm btn--ghost" id="tDemo">载入示例数据</button>' +
        '<button class="btn btn--sm btn--ghost" id="tPrint">打印</button>' +
        '<input type="file" id="tFile" accept=".json,application/json" multiple hidden>' +
      '</div>' +

      (rows.length ? '<div class="tblwrap anim-up d3" style="margin-top:20px">' +
        '<div style="overflow-x:auto"><table class="tbl tbl--arc" id="tTable">' +
          '<thead><tr><th>学号</th><th>姓名</th><th>班级</th><th>层级</th><th class="al-r">后测</th><th class="al-r">前测</th>' +
          '<th class="al-r">实验</th><th class="al-r">记录</th><th class="al-r">提问</th><th class="al-r">卡点</th><th class="al-r">用时</th><th>更新</th><th></th></tr></thead>' +
          '<tbody>' + rows.map(function(s){
            const A = window.Analysis.of(s);
            const t = A.tier;
            return '<tr data-id="'+esc(s.student.id)+'">' +
              '<td class="numc">'+esc(s.student.id)+'</td>' +
              '<td>'+esc(s.student.name)+'</td>' +
              '<td class="dimmer">'+esc(s.student.group||'—')+'</td>' +
              '<td><span class="tier" data-t="'+t+'" style="font-size:9.5px;padding:3px 8px">'+t+'</span></td>' +
              '<td class="num">'+A.postOk+'/'+A.postTotal+'</td>' +
              '<td class="num dimmer">'+A.preOk+'/'+A.preTotal+'</td>' +
              '<td class="num">'+A.labDone+'/4</td>' +
              '<td class="num">'+A.recCount+'</td>' +
              '<td class="num">'+A.askCount+'</td>' +
              '<td class="num" style="'+(A.stallCount?'color:var(--amber)':'')+'">'+A.stallCount+'</td>' +
              '<td class="num dimmer">'+Math.round(A.totalSec/60)+'m</td>' +
              '<td class="dimmer" style="white-space:nowrap">'+new Date(s.updated).toLocaleDateString('zh-CN')+'</td>' +
              '<td style="text-align:right;white-space:nowrap">' +
                '<button class="btn btn--sm btn--ghost" data-open="'+esc(s.student.id)+'">详情</button>' +
                '<button class="btn btn--sm btn--ghost" data-exp="'+esc(s.student.id)+'">导出</button>' +
              '</td></tr>' +
              '<tr data-detail="'+esc(s.student.id)+'" hidden><td colspan="13" style="background:rgba(255,255,255,.018);padding:16px 18px">' +
                detail(s, A) + '</td></tr>';
          }).join('') + '</tbody>' +
        '</table></div>' +
      '</div>' : emptyState()) +

      '<div class="note note--quiet" style="margin-top:20px">' +
        '<span class="note__k">隐私</span>' +
        '<span>数据仅存于本机浏览器，不上传任何内容。' +
        '学生导出的 JSON 可经「导入学生档案」合并，形成班级视图。</span>' +
      '</div>' +
    '</div></section>';
  },

  mount: function(){
    const t = document.getElementById('tTable');
    if(t){
      t.addEventListener('click', function(e){
        const o = e.target.closest('[data-open]');
        const x = e.target.closest('[data-exp]');
        if(o){
          const tr = t.querySelector('tr[data-detail="'+o.dataset.open+'"]');
          if(tr) tr.hidden = !tr.hidden;
        }
        if(x){
          const all = App.readAll();
          const s = all[x.dataset.exp];
          if(s) App.download('yds-'+s.student.id+'-'+s.student.name+'.json', JSON.stringify(s,null,2), 'application/json');
        }
      });
    }

    document.getElementById('tCsv').addEventListener('click', function(){
      const rows = allRows();
      if(!rows.length){ App.toast('暂无档案。'); return; }
      const head = ['学号','姓名','班级','层级','后测','前测','实验提交','记录数','参数改动','提问','卡点','总用时(min)','错因标签','后测理由','实验理由','更新时间'];
      const lines = rows.map(function(s){
        const A = window.Analysis.of(s);
        return [s.student.id, s.student.name, s.student.group, A.tier,
          A.postOk+'/'+A.postTotal, A.preOk+'/'+A.preTotal, A.labDone+'/4', A.recCount, A.paramCount, A.askCount, A.stallCount,
          Math.round(A.totalSec/60), A.tags.map(function(g){ return B.TAGS[g.tag]||g.tag; }).join('；'),
          B.POST.map(function(it,i){ const a = s.post[it.k]||{}; return (a.why||'').trim() ? 'R'+(i+1)+' '+a.why.trim() : ''; }).filter(Boolean).join(' / '),
          (window.LAB_TASKS||[]).map(function(t){ const a = s.lab.answers[t.key]; return (a && a.why2 && a.why2.trim()) ? t.name.split('：')[0]+' '+a.why2.trim() : ''; }).filter(Boolean).join(' / '),
          new Date(s.updated).toLocaleString('zh-CN')];
      });
      const csv = '\ufeff' + [head].concat(lines).map(function(r){ return r.map(App.csvCell).join(','); }).join('\r\n');
      App.download('yds-class-'+new Date().toISOString().slice(0,10)+'.csv', csv, 'text/csv');
      App.track('export', { fmt:'teacher-csv', n:rows.length });
    });

    document.getElementById('tJson').addEventListener('click', function(){
      const all = App.readAll();
      App.download('yds-class-'+new Date().toISOString().slice(0,10)+'.json', JSON.stringify(all,null,2), 'application/json');
    });

    document.getElementById('tImport').addEventListener('click', function(){
      document.getElementById('tFile').click();
    });
    document.getElementById('tFile').addEventListener('change', function(e){
      const files = Array.from(e.target.files||[]);
      let n = 0;
      let pending = files.length;
      files.forEach(function(f){
        const r = new FileReader();
        r.onload = function(){
          try{
            const o = JSON.parse(r.result);
            const map = o && o.student ? { } : o;
            if(o && o.student){ map[o.student.id] = o; }
            const all = App.readAll();
            Object.keys(map).forEach(function(k){
              if(map[k] && map[k].student){ all[k] = map[k]; n++; }
            });
            App.writeAll(all);
          }catch(err){ App.toast('有一个文件解析失败：' + f.name); }
          if(--pending === 0){ App.toast('已合并 ' + n + ' 份档案'); App.go('teacher'); }
        };
        r.readAsText(f, 'utf-8');
      });
    });

    var loadDemo = function(){
      const demo = window.makeDemo();
      const all = App.readAll();
      Object.keys(demo).forEach(function(k){ all[k] = demo[k]; });
      App.writeAll(all);
      App.toast('已载入 4 份示例档案');
      App.go('teacher');
    };
    ['tDemo','tDemo2'].forEach(function(id){
      var b = document.getElementById(id);
      if(b) b.addEventListener('click', loadDemo);
    });

    document.getElementById('tPrint').addEventListener('click', function(){ window.print(); });
  }
};

function reasons(s){
  const T = window.LAB_TASKS || [];
  const qs = B.PRE.map(function(it,i){
    const a = s.pre[it.k] || {};
    return a.why && a.why.trim() ? '前测 Q'+(i+1)+'：'+a.why.trim() : '';
  }).concat(B.POST.map(function(it,i){
    const a = s.post[it.k] || {};
    return a.why && a.why.trim() ? '后测 R'+(i+1)+'：'+a.why.trim() : '';
  })).filter(Boolean);
  const rows = T.map(function(t){
    const a = s.lab.answers[t.key];
    if(!a || !a.submitted) return '';
    const res = a.ans !== undefined ? t.check.opts[a.ans].t : '未作答';
    const why = (a.why2||'').trim() || '（未填写理由）';
    return '<div style="margin-bottom:10px;font-size:12px;line-height:1.7">' +
      '<b style="color:var(--ink-1)">'+esc(t.name.split('：')[0])+'</b> · '+esc(res)+
      '<div class="dimmer" style="margin-top:2px">依据：'+esc(why)+'</div></div>';
  }).join('');
  if(!rows && !qs.length) return '<p class="dim" style="font-size:12.5px">暂无书面理由。</p>';
  return (rows ? '<div>'+rows+'</div>' : '') +
    (qs.length ? '<div class="dimmer" style="font-size:11.5px;line-height:1.75;margin-top:4px">'+esc(qs.join('　/　'))+'</div>' : '');
}

function detail(s, A){
  const pre = B.PRE.map(function(it,i){
    const a = s.pre[it.k];
    const ok = a && a.ans !== undefined ? it.opts[a.ans].correct : null;
    return '<span class="tg" style="border-color:'+(ok?'rgba(99,230,168,.4)':'rgba(255,59,46,.3)')+'">' +
      'Q'+(i+1)+' '+(ok===null?'—':(ok?'✓':'✗'))+'</span>';
  }).join(' ');
  const post = B.POST.map(function(it,i){
    const a = s.post[it.k];
    const ok = a && a.ans !== undefined ? it.opts[a.ans].correct : null;
    return '<span class="tg" style="border-color:'+(ok?'rgba(99,230,168,.4)':'rgba(255,59,46,.3)')+'">' +
      'R'+(i+1)+' '+(ok===null?'—':(ok?'✓':'✗'))+'</span>';
  }).join(' ');
  return '<div style="display:grid;grid-template-columns:1fr 1fr;gap:24px">' +
    '<div>' +
      '<div class="arc-note" style="margin-top:0"><span class="arc-note__k">分层依据</span><div class="arc-note__x">'+esc(A.tierWhy)+'</div></div>' +
      '<div class="eyebrow" style="margin-bottom:8px">前测 / 后测</div>' +
      '<div style="font-size:10px;margin-bottom:10px">'+pre+'</div>' +
      '<div style="font-size:10px">'+post+'</div>' +
    '</div>' +
    '<div>' +
      '<div class="eyebrow" style="margin-bottom:8px">错因与建议路径</div>' +
      (A.tags.length ? '<div class="taglist">'+A.tags.map(function(g){
          return '<span class="tg"><span class="tg__n">×'+g.n+'</span>'+esc(B.TAGS[g.tag]||g.tag)+'</span>';
        }).join('')+'</div>' : '<p class="dim" style="font-size:12.5px">无明显错因。</p>') +
      '<div style="margin-top:12px;font-size:12px;line-height:1.75;color:var(--ink-2)">' +
        A.path.map(function(p){ return '<div style="padding:4px 0">'+esc(p.n)+' · '+esc(p.t)+'</div>'; }).join('') +
      '</div>' +
      '<div class="eyebrow" style="margin:14px 0 8px">任务结论与书面理由</div>' +
      reasons(s) +
      '<div class="eyebrow" style="margin:14px 0 8px">各步骤停留</div>' +
      '<div class="mono dimmer" style="font-size:11px">' +
        Object.keys(A.dwell).map(function(k){ return k+' '+A.dwell[k]+'s'; }).join(' · ') || '—' +
      '</div>' +
    '</div>' +
  '</div>';
}

function distCell(k, word, n, color){
  return '<div class="arc__d"><b style="color:'+color+'">'+k+'</b><i>'+word+'</i><span>'+n+'</span></div>';
}

function arcRow(k, v){
  return '<div class="arc__row"><span class="arc__row-k">'+k+'</span><span class="arc__row-v">'+v+'</span></div>';
}

function emptyState(){
  return '<div class="panel empty--arc anim-up d3" style="margin-top:20px;padding:52px 24px;text-align:center">' +
    '<div class="eyebrow" style="color:var(--ink-3)">NO RECORDS</div>' +
    '<h3 class="h-sub" style="margin:14px 0 8px;font-size:19px">本机暂无学生档案</h3>' +
    '<p class="dim" style="font-size:13.5px;max-width:46ch;margin:0 auto;line-height:1.75">' +
      '学生在本机完成流程后，档案会自动出现在此。' +
      '可载入 4 份示例数据查看版式。</p>' +
    '<div style="margin-top:20px"><button class="btn btn--sm" id="tDemo2">载入示例数据</button></div>' +
  '</div>';
}

/* 示例档案是在原始选项顺序下写的，选项轮转后要跟着换算索引（2026-11-24） */
function fixDemoRot(st){
  const BR = window.BankRot, LR = window.LabRot;
  if(BR && window.Bank){
    (window.Bank.PRE||[]).forEach(function(it,i){
      const a = st.pre && st.pre[it.k];
      if(a && a.ans !== undefined) a.ans = (a.ans - BR.PRE[i] + it.opts.length) % it.opts.length;
    });
    (window.Bank.POST||[]).forEach(function(it,i){
      const a = st.post && st.post[it.k];
      if(a && a.ans !== undefined) a.ans = (a.ans - BR.POST[i] + it.opts.length) % it.opts.length;
    });
  }
  if(LR){
    (window.LAB_TASKS||[]).forEach(function(t,i){
      const a = st.lab && st.lab.answers && st.lab.answers[t.key];
      if(!a) return;
      if(a.pred !== undefined) a.pred = (a.pred - LR.predict[i] + t.predict.opts.length) % t.predict.opts.length;
      if(a.ans !== undefined) a.ans = (a.ans - LR.check[i] + t.check.opts.length) % t.check.opts.length;
    });
  }
  return st;
}

/* 示例档案 */
window.makeDemo = function(){
  const base = function(id, name, grp, t){
    const S = App.blank();
    S.student = { id:id, name:name, group:grp };
    S.created = Date.now() - t*60000;
    S.updated = Date.now() - t*20000;
    return S;
  };
  const out = {};

  const a = base('22376011','王子航','第 1 组', 62);
  a.pre = { q1:{ans:0,conf:2,why:'缝开大了光更多，应该更宽'}, q2:{ans:1,conf:4,why:'抵消'},
    q3:{ans:1,conf:3,why:'紫光波长短'}, q4:{ans:1,conf:3,why:'频率一样'}, q5:{ans:1,conf:2,why:'太宽就糊了'} };
  a.post = { r1:{ans:0,conf:4,why:'600e-9*1.5/0.2e-3=4.5mm'}, r2:{ans:0,conf:4,why:'1.5λ→3π，暗'},
    r3:{ans:0,conf:3,why:'589^2/0.6'}, r4:{ans:1,conf:4,why:'空间相干宽度太小'}, r5:{ans:1,conf:5,why:'概率由光程差定'} };
  a.lab.answers = { t1:{pred:1,locked:true,ans:0,why2:'d 0.3→0.6 时 Δy 由 2.5mm 变 1.27mm，因为 δ=d y/L 变大',submitted:true},
    t2:{pred:1,locked:true,ans:0,why2:'中央干涉级次低，边缘先超相干长度',submitted:true},
    t3:{pred:1,locked:true,ans:0,why2:'各点条纹错位叠加',submitted:true} };
  a.lab.records = [1,2,3,4].map(function(i){ return { at:Date.now()-i*60000, task:'t1',
    params:{d:0.3+i*0.1,L:1.2,lam:632.8,b:0,R:0.6,dLam:0}, dy: (632.8e-9*1.2/((0.3+i*0.1)*1e-3)), V:1, N:Infinity }; });
  a.track = [{t:Date.now()-3600000,k:'step',d:{to:'pre'}},{t:Date.now()-3500000,k:'submit',d:{scope:'pre'}},
    {t:Date.now()-3000000,k:'record',d:{task:'t1'}},{t:Date.now()-2400000,k:'ask',d:{q:'为什么条纹会变密'}},
    {t:Date.now()-2000000,k:'submit',d:{task:'t1'}},{t:Date.now()-1200000,k:'submit',d:{scope:'post'}}];
  out[a.student.id] = a;

  const b = base('22376012','李思远','第 1 组', 48);
  b.pre = { q1:{ans:1,conf:3,why:''}, q2:{ans:1,conf:3,why:''}, q3:{ans:1,conf:2,why:''}, q4:{ans:3,conf:2,why:'同一个光源'}, q5:{ans:1,conf:1,why:''} };
  b.post = { r1:{ans:1,conf:3,why:'0.45mm'}, r2:{ans:1,conf:3,why:''}, r3:{ans:1,conf:2,why:''}, r4:{ans:0,conf:2,why:'缝细就行'}, r5:{ans:3,conf:2,why:'一个光子不能干涉'} };
  b.lab.answers = { t1:{pred:0,locked:true,ans:1,why2:'好像变密了',submitted:true} };
  b.lab.records = [{ at:Date.now()-600000, task:'t1', params:{d:0.3,L:1.2,lam:632.8,b:0,R:0.6,dLam:0}, dy:2.53e-3, V:1, N:Infinity }];
  b.track = [{t:Date.now()-2000000,k:'step',d:{to:'pre'}},{t:Date.now()-900000,k:'stall',d:{step:'lab',sec:412}},
    {t:Date.now()-700000,k:'ask',d:{q:'Δy 单位怎么换'}}];
  out[b.student.id] = b;

  const c = base('22376013','陈语桐','第 2 组', 71);
  c.pre = { q1:{ans:1,conf:4,why:''}, q2:{ans:1,conf:5,why:''}, q3:{ans:1,conf:4,why:''}, q4:{ans:1,conf:4,why:''}, q5:{ans:1,conf:3,why:''} };
  c.post = { r1:{ans:0,conf:5,why:'λL/d 代入，单位换成米'}, r2:{ans:0,conf:5,why:'1.5λ 对应 3π，半整数级是暗纹'},
    r3:{ans:0,conf:4,why:'589 的平方除以 0.6'}, r4:{ans:1,conf:5,why:'太阳角径太大，空间相干宽度只有几十微米'}, r5:{ans:1,conf:5,why:'概率幅叠加'} };
  c.lab.answers = { t1:{pred:1,locked:true,ans:0,why2:'实测两组 Δy 与 d 成反比',submitted:true},
    t2:{pred:1,locked:true,ans:0,why2:'相干长度限制级数',submitted:true},
    t3:{pred:1,locked:true,ans:0,why2:'b 推到 1.27mm 时可见度归零',submitted:true},
    t4:{pred:1,locked:true,ans:1,why2:'单光子概率分布',submitted:true} };
  c.lab.records = [1,2,3,4,5].map(function(i){ return { at:Date.now()-i*40000, task:'t1',
    params:{d:0.2+i*0.15,L:1.2,lam:632.8,b:0,R:0.6,dLam:0}, dy: 632.8e-9*1.2/((0.2+i*0.15)*1e-3), V:1, N:Infinity }; });
  c.track = [];
  for(let i=0;i<9;i++){ c.track.push({t:Date.now()-(9-i)*180000, k:'param', d:{k:'d',v:0.2+i*0.1}}); }
  c.track.push({t:Date.now()-60000,k:'submit',d:{scope:'post'}});
  out[c.student.id] = c;

  const d = base('22376014','赵一鸣','第 2 组', 33);
  d.pre = { q1:{ans:0,conf:1,why:''}, q2:{ans:0,conf:1,why:''} };
  d.post = { r1:{ans:2,conf:1,why:''}, r2:{ans:1,conf:1,why:''} };
  d.lab.records = [];
  d.track = [{t:Date.now()-1500000,k:'step',d:{to:'pre'}},{t:Date.now()-800000,k:'stall',d:{step:'pre',sec:680}}];
  out[d.student.id] = d;

  Object.keys(out).forEach(function(k){ out[k] = fixDemoRot(out[k]); });
  return out;
};
})();
