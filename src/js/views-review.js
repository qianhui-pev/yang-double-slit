
/* ============ Views: 复盘 ============ */
(function(){
'use strict';
const App = window.App, esc = App.esc, Views = App.Views, B = window.Bank, P = window.Phys;

function fmtMin(sec){ const m = Math.floor(sec/60); return m < 1 ? (sec+' 秒') : (m+' 分 ' + (sec%60) + ' 秒'); }

function cmpRow(preItem, postItem, pre, post){
  const pa = pre[preItem.k], qa = post[postItem.k];
  const pOk = pa && pa.ans !== undefined ? preItem.opts[pa.ans].correct : null;
  const qOk = qa && qa.ans !== undefined ? postItem.opts[qa.ans].correct : null;
  const pick = function(it, a){ return a && a.ans !== undefined ? it.opts[a.ans].t : '未作答'; };
  return '<div class="cmp" data-'+(qOk?'ok':'bad')+'>' +
    '<div class="cmp__hd">'+esc(preItem.tag)+'</div>' +
    '<div class="cmp__q">'+esc(preItem.q)+'</div>' +
    '<div class="cmp__a">前测：<b>'+(pOk===null?'—':(pOk?'✓ ':'✗ '))+esc(pick(preItem,pa))+'</b></div>' +
    '<div class="cmp__a">后测：<b>'+(qOk===null?'—':(qOk?'✓ ':'✗ '))+esc(pick(postItem,qa))+'</b></div>' +
  '</div>';
}

Views.review = {
  html: function(){
    const S = App.state;
    const A = window.Analysis.of(S);
    const tierName = {A:'A · 方法级', B:'B · 了解级', C:'C · 需关注', '—':'— · 未评级'}[A.tier];
    const tierWord = {A:'方法级', B:'了解级', C:'需关注', '—':'未评级'}[A.tier];

    const rows = B.PRE.map(function(p, i){ return cmpRow(p, B.POST[i], S.pre, S.post); }).join('');

    const TASKS = window.LAB_TASKS || [];
    const labRows = TASKS.map(function(t){
      const a = (S.lab.answers||{})[t.key];
      if(!a) return '';
      const predTxt = a.pred !== undefined ? t.predict.opts[a.pred].t : '—';
      const predOk = a.pred !== undefined ? t.predict.opts[a.pred].correct : null;
      const recs = (S.lab.records||[]).filter(function(r){ return r.task === t.key; });
      const meas = recs.length
        ? recs.map(function(r){ return 'Δy ' + P.fmtLen(r.dy) + '（d ' + r.params.d.toFixed(2) + ' mm）'; }).join('<br>')
        : (recs.length === 0 && t.key === 't4' ? '光子散点累积（定性）' : '未记录');
      const resTxt = a.ans !== undefined ? t.check.opts[a.ans].t : '—';
      const resWhy = (a.why2||'').trim();
      const resOk = a.ans !== undefined ? t.check.opts[a.ans].correct : null;
      const self = predOk === null && resOk === null ? '—' : (predOk && resOk ? '✓' : (predOk === false && resOk ? '预测错·已修正' : '✗'));
      return '<tr><td style="white-space:nowrap">' + esc(t.name.split('：')[0]) + '</td>' +
        '<td style="max-width:220px">' + esc(predTxt) + '</td>' +
        '<td class="num" style="font-size:11.5px">' + meas + '</td>' +
        '<td style="max-width:260px">' + esc(resTxt) + (resWhy ? '<div class="dimmer" style="font-size:11px;margin-top:4px;line-height:1.6">依据：'+esc(resWhy)+'</div>' : '') + '</td>' +
        '<td style="white-space:nowrap;font-size:11px" class="' + (self.indexOf('✓')>=0?'':'dimmer') + '">' + self + '</td></tr>';
    }).join('');

    const events = (S.track||[]).filter(function(e){ return e.k !== 'param'; }).slice(-16).reverse();
    const KIND = { step:'进入步骤', answer:'作答', submit:'提交', stall:'无操作', ask:'提问',
      record:'记录数据', dwell:'停留', task:'切换任务', nav:'跳转', enter:'进入', mode:'切换视图', export:'导出' };

    return '<section class="section" style="padding-top:34px"><div class="wrap" style="max-width:1320px">' +

      '<div class="sec-hd anim-up">' +
        '<div>' +
          '<div class="sec-hd__n"><b>06</b> / REVIEW · 复盘</div>' +
          '<h2 class="h-sec" style="margin-top:14px">本次实验的<br>记录与判定。</h2>' +
        '</div>' +
        '<div style="text-align:right"><span class="tier" data-t="'+A.tier+'">'+tierName+'</span>' +
          '<div class="dimmer" style="font-size:11.5px;margin-top:10px;max-width:34ch;line-height:1.65;text-align:right">' +
          '层级仅用于教学干预建议，不计入成绩。</div></div>' +
      '</div>' +

      '<div class="arc anim-up d1">' +
        '<div class="arc__main">' +
          '<div class="arc__eyebrow"><span class="arc__n">I.</span><i>分层判定</i><span class="arc__tag">TIER</span></div>' +
          '<div class="arc__lead"><b>'+A.tier+'</b><span>'+tierWord+'</span></div>' +
          '<div class="stamp" data-t="'+A.tier+'" aria-hidden="true"><b>'+A.tier+'</b><span>'+tierWord+'</span></div>' +
          '<p class="arc__sub">层级仅用于教学干预建议，不计入成绩。</p>' +
          '<div class="arc-note anim-up d2">' +
            '<span class="arc-note__k">判定依据</span>' +
            '<div class="arc-note__x">'+esc(A.tierWhy)+
            ' 另有一项内部掌握度指标（当前 '+A.mastery.toFixed(2)+'），仅用于调整下次进入时的提示顺序；' +
            '不参与层级判定，不计入成绩。</div>' +
          '</div>' +
        '</div>' +
        '<div class="arc__side">' +
          '<div class="arc__sideh">支撑数据 · EVIDENCE</div>' +
          sideRow('前测', A.preOk+' / '+A.preTotal) +
          sideRow('后测', A.postOk+' / '+A.postTotal, true) +
          sideRow('实验记录', A.recCount+' 组') +
          sideRow('参数改动', A.paramCount+' 次') +
          sideRow('求助提问', A.askCount+' 次') +
          sideRow('卡点', A.stallCount+' 处', A.stallCount > 0) +
          sideRow('总用时', fmtMin(A.totalSec)) +
        '</div>' +
      '</div>' +

      '<div class="grid g-2 anim-up d3" style="margin-top:40px;align-items:start;gap:40px">' +
        '<div>' +
          '<div class="eyebrow" style="margin-bottom:12px">前测 → 后测 · 同一维度对照</div>' +
          '<div class="compare compare--arc">' + rows + '</div>' +
        '</div>' +
        '<div>' +
          '<div class="eyebrow" style="margin-bottom:12px">错因标签</div>' +
          (A.tags.length
            ? '<div class="taglist">' + A.tags.map(function(t){
                return '<span class="tg"><span class="tg__n">×'+t.n+'</span>'+esc(B.TAGS[t.tag]||t.tag)+
                  '<span class="dimmer" style="font-size:10px">'+esc(t.where.slice(0,3).join(' / '))+'</span></span>';
              }).join('') + '</div>'
            : '<div class="note note--quiet"><span class="note__k">—</span><span>无错因标签：前测与后测均命中正确选项。</span></div>') +
          '<div class="eyebrow" style="margin:26px 0 12px">个性化路径</div>' +
          '<div class="pathcard">' + A.path.map(function(p){
            return '<div class="pathstep"><span class="pathstep__n">'+p.n+'</span><span class="pathstep__t">'+esc(p.t)+'</span></div>';
          }).join('') + '</div>' +
        '</div>' +
      '</div>' +


      '<div class="anim-up d3" style="margin-top:40px">' +
        '<div class="eyebrow" style="margin-bottom:12px">预测 · 实测 · 结论</div>' +
        (labRows.length ? '<div class="tblwrap"><div style="overflow-x:auto"><table class="tbl tbl--arc">' +
          '<thead><tr><th>任务</th><th>预测</th><th>实测数据</th><th>结论</th><th>自洽</th></tr></thead><tbody>' +
          labRows + '</tbody></table></div></div>'
        : '<div class="note note--quiet"><span class="note__k">—</span><span>尚无已提交任务，无对照数据。</span></div>') +
      '</div>' +
      '<div class="grid g-2 anim-up d4" style="margin-top:40px;align-items:start;gap:40px">' +
        '<div>' +
          '<div class="eyebrow" style="margin-bottom:12px">操作记录 · 最近 16 条</div>' +
          '<div class="tl">' + events.map(function(e){
            const when = new Date(e.t);
            const hh = String(when.getHours()).padStart(2,'0')+':'+String(when.getMinutes()).padStart(2,'0')+':'+String(when.getSeconds()).padStart(2,'0');
            let txt = KIND[e.k] || e.k;
            if(e.k==='step') txt += ' · ' + e.d.to;
            if(e.k==='dwell') txt += ' · ' + e.d.step + ' ' + e.d.sec + 's';
            if(e.k==='stall') txt += ' · ' + e.d.step + ' 停了 ' + Math.round(e.d.sec/60) + ' 分钟';
            if(e.k==='param') txt += ' · ' + e.d.k + ' = ' + e.d.v;
            if(e.k==='ask') txt += ' · ' + (e.d.q||'').slice(0,18);
            if(e.k==='record') txt += ' · Δy';
            return '<div class="tl__i" data-k="'+e.k+'"><div class="tl__t">'+hh+'</div><div class="tl__x">'+esc(txt)+'</div></div>';
          }).join('') + '</div>' +
        '</div>' +
        '<div>' +
          '<div class="eyebrow" style="margin-bottom:12px">档案导出</div>' +
          '<div class="panel" style="padding:18px">' +
            '<p class="dim" style="font-size:13.5px;line-height:1.7;margin:0 0 14px">' +
              '完整档案（参数改动、停留时长、卡点、提问、理由）保存在本机。' +
              '导出 JSON 交教师；导出 CSV 可直接进表格。</p>' +
            '<div style="display:flex;gap:8px;flex-wrap:wrap">' +
              '<button class="btn btn--sm" id="expJson">导出 JSON</button>' +
              '<button class="btn btn--sm" id="expCsv">导出 CSV</button>' +
            '</div>' +
            '<hr class="hair hair--soft" style="margin:18px 0">' +
            '<div class="mono dimmer" style="font-size:10px;letter-spacing:.14em;line-height:2">' +
              '学号 '+esc(S.student.id||'—')+'<br>' +
              '姓名 '+esc(S.student.name||'—')+'<br>' +
              '班级 '+esc(S.student.group||'—')+'<br>' +
              '档案生成 '+new Date(S.updated).toLocaleString('zh-CN') +
            '</div>' +
          '</div>' +
          '<div style="display:flex;gap:12px;margin-top:18px;flex-wrap:wrap">' +
            '<button class="btn btn--solid" id="toPrintBtn">打印 / 存 PDF <span class="btn__arrow">→</span></button>' +
            '<button class="btn" id="toLab">返回实验台</button>' +
          '</div>' +
        '</div>' +
      '</div>' +
    '</div></section>';
  },
  mount: function(){
    const S = App.state;
    document.getElementById('expJson').addEventListener('click', function(){
      App.track('export', { fmt:'json' });
      App.download('yds-'+S.student.id+'-'+S.student.name+'.json', JSON.stringify(S,null,2), 'application/json');
    });
    document.getElementById('expCsv').addEventListener('click', function(){
      App.track('export', { fmt:'csv' });
      const A = window.Analysis.of(S);
      const head = ['学号','姓名','班级','后测','前测','实验提交','记录数','参数改动','提问','卡点','总用时(min)','层级','错因标签','更新时间'];
      const row = [S.student.id, S.student.name, S.student.group, A.postOk+'/'+A.postTotal, A.preOk+'/'+A.preTotal,
        A.labDone+'/4', A.recCount, A.paramCount, A.askCount, A.stallCount, Math.round(A.totalSec/60),
        A.tier, A.tags.map(function(t){ return B.TAGS[t.tag]||t.tag; }).join('；'),
        new Date(S.updated).toLocaleString('zh-CN')];
      const csv = '\ufeff' + [head, row].map(function(r){ return r.map(App.csvCell).join(','); }).join('\r\n');
      App.download('yds-'+S.student.id+'.csv', csv, 'text/csv');
    });
    document.getElementById('toPrintBtn').addEventListener('click', function(){ window.print(); });
    document.getElementById('toLab').addEventListener('click', function(){ App.go('lab'); });
  }
};

function sideRow(k, v, hi){
  return '<div class="arc__row'+(hi ? ' arc__row--hi' : '')+'">' +
    '<span class="arc__row-k">'+k+'</span><span class="arc__row-v">'+v+'</span></div>';
}

function stat(k, v, hi){
  return '<div class="stat'+(hi?' stat--hi':'')+'"><div class="stat__k">'+k+'</div><div class="stat__v">'+v+'</div></div>';
}
})();
