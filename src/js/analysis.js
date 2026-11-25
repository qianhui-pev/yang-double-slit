
/* ============ 学情分析（复盘 / 教师端共用） ============ */
(function(){
'use strict';
const P = window.Phys, B = window.Bank;

const PATH_LIB = {
  RATIO_DIRECTION:'回概念第 II 节，用 Δy = λL/d 计算 d 与 λ 各加倍的两种情形，再回任务 01 记录两组数据',
  RATIO_LAMBDA:'任务 01 中仅调 λ（400→700 nm），记录 Δy 变化，写出 Δy 与 λ 的关系',
  IGNORE_D:'任务 01 中把 d 由 0.30 mm 调至 0.90 mm，观察条纹数变化，并用公式核对两组 Δy 之比',
  IGNORE_LAMBDA:'任务 01 中仅改波长，分别记录红光与紫光的 Δy',
  DARK_BRIGHT:'回概念第 II 节明暗条件：由峰位重合与峰谷重合判定，勿只记结论',
  VIS_COHERENCE:'任务 02、03 中观察「光强高但无条纹」的状态：亮度与可见度相互独立',
  POLARIZATION:'偏振为相干附加条件；先掌握「同频率 + 相位差恒定」（概念第 III 节）',
  SOURCE_CONFUSION:'任务 03：同一光源在足够宽时，两缝光场互不相关',
  SPATIAL_CONFUSION:'任务 03 中把 b 推至 λR/d 附近，观察可见度趋于 0',
  PHASE_PATH:'回概念第 I 节做 3 个 δ→Δφ 换算（λ/2、λ、1.5λ）',
  UNIT_ERROR:'先统一到 SI 再代公式（nm→1e-9 m，mm→1e-3 m），结果再换算回原位',
  HALF_ERROR:'逐步代入 Δy = λL/d 并检查量纲',
  COHERENCE_CALC:'回概念第 III 节用 L_c = λ²/Δλ 计算钠双线：589² ≈ 3.47e5 nm²',
  SINGLE_PHOTON:'任务 04 再看散点累积：落点服从概率分布，不存在「选定某缝」'
};

function of(S){
  const preTotal = B.PRE.length, postTotal = B.POST.length;
  let preOk = 0, postOk = 0, preN = 0, postN = 0;
  const tags = {};
  const push = function(tag, where){
    if(!tag) return;
    tags[tag] = tags[tag] || { tag:tag, n:0, where:[] };
    tags[tag].n++; tags[tag].where.push(where);
  };
  B.PRE.forEach(function(it){
    const a = S.pre[it.k];
    if(!a || a.ans === undefined) return;
    preN++;
    if(it.opts[a.ans].correct) preOk++;
    else push(it.opts[a.ans].tag, '前测' + it.k.toUpperCase());
  });
  B.POST.forEach(function(it){
    const a = S.post[it.k];
    if(!a || a.ans === undefined) return;
    postN++;
    if(it.opts[a.ans].correct) postOk++;
    else push(it.opts[a.ans].tag, '后测' + it.k.toUpperCase());
  });
  (window.LAB_TASKS||[]).forEach(function(t){
    const a = S.lab.answers[t.key];
    if(!a) return;
    if(a.pred !== undefined && !t.predict.opts[a.pred].correct) push(t.predict.opts[a.pred].tag, t.n+'预测');
    if(a.ans !== undefined && !t.check.opts[a.ans].correct) push(t.check.opts[a.ans].tag, t.n+'结论');
  });

  const labDone = (window.LAB_TASKS||[]).filter(function(t){
    const a = S.lab.answers[t.key]; return a && a.submitted;
  }).length;
  const recCount = (S.lab.records||[]).length;
  const askCount = (S.track||[]).filter(function(e){ return e.k === 'ask'; }).length;
  const stallCount = (S.track||[]).filter(function(e){ return e.k === 'stall'; }).length;
  const paramCount = (S.track||[]).filter(function(e){ return e.k === 'param'; }).length;
  const spans = (S.track||[]).filter(function(e){ return e.k === 'dwell'; });

  let totalSec = 0;
  const dwell = {};
  spans.forEach(function(e){ totalSec += e.d.sec||0; dwell[e.d.step] = (dwell[e.d.step]||0)+(e.d.sec||0); });

  const whyCount = B.POST.filter(function(it){ const a = S.post[it.k]; return a && (a.why||'').trim().length >= 10; }).length;

  let tier = 'C', tierWhy = '';
  if(preN + postN + labDone + recCount === 0){
    tier = '—'; tierWhy = '尚无作答与实验记录，暂不评级。';
  } else if(postOk >= 4 && labDone >= 3 && recCount >= 3 && whyCount >= 2){
    tier = 'A'; tierWhy = '后测 ' + postOk + '/5，实验提交 ' + labDone + '/4，记录 ' + recCount + ' 组，结论附有理由：判定为方法级。';
  } else if(postOk >= 3 || (labDone >= 2 && recCount >= 2)){
    tier = 'B'; tierWhy = '后测 ' + postOk + '/5，实验提交 ' + labDone + '/4，记录 ' + recCount + ' 组：判定为了解级，结论基本正确，证据链不完整。';
  } else {
    tier = 'C'; tierWhy = '后测 ' + postOk + '/5，实验提交 ' + labDone + '/4，记录 ' + recCount + ' 组：判定为需关注，关键概念尚未分清，按下列路径重做。';
  }

  const mastery = Math.max(0, Math.min(1, 0.35*preOk/preTotal + 0.45*postOk/postTotal + 0.2*Math.min(1, recCount/4)));

  const tagList = Object.keys(tags).map(function(k){ return tags[k]; }).sort(function(a,b){ return b.n-a.n; });
  const path = [];
  tagList.slice(0,4).forEach(function(t, i){
    path.push({ n:'0'+(i+1), t: PATH_LIB[t.tag] || ('复习「'+B.TAGS[t.tag]+'」相关内容') });
  });
  (window.LAB_TASKS||[]).forEach(function(t){
    const a = S.lab.answers[t.key];
    if(!a || !a.submitted) path.push({ n:'→', t:'任务「'+t.name.split('：')[0]+'」尚未提交结论，请补做并记录至少两组数据' });
  });
  if(askCount === 0) path.push({ n:'', t:'全程未向助教提问。卡顿时可先描述现象再提问' });
  if(!path.length) path.push({ n:'', t:'无明显短板。可在自由探索中把 d 推至与 L 可比，观察条纹失效' });

  return {
    preOk:preOk, preTotal:preTotal, postOk:postOk, postTotal:postTotal,
    labDone:labDone, recCount:recCount, askCount:askCount, stallCount:stallCount,
    paramCount:paramCount, whyCount:whyCount, totalSec:totalSec, dwell:dwell,
    tags:tagList, tier:tier, tierWhy:tierWhy, mastery:mastery, answered:{ pre:preN, post:postN },
    path:path.slice(0,5).map(function(p,i){ return { n:'0'+(i+1), t:p.t }; })
  };
}

window.Analysis = { of: of, PATH_LIB: PATH_LIB };
})();
