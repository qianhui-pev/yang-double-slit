
/* ============ AI 助教（离线知识库 · 苏格拉底式） ============ */
(function(){
'use strict';
const App = window.App, esc = App.esc;

const KB = [
  { id:'spacing', keys:['间距','变宽','变窄','变密','条纹数','条纹怎么','△y','Δy','dy'],
    a:'<span class="k">Δy = λL / d</span>：λ、L 在分子，d 在分母。<br>' +
      '<b>波长增大、屏距增大、缝距减小，条纹间距随之增大</b>；d 加倍则 Δy 减半。<br>' +
      '在实验台读数栏改 d，可直接核验 Δy 的变化。' },
  { id:'bright', keys:['亮','暗','明暗','抵消','加强','kλ','半波'],
    a:'判据为<b>光程差</b>：<br>' +
      '<span class="k">δ = kλ</span> → 亮；<span class="k">δ = (k+½)λ</span> → 暗。<br>' +
      '相位差 Δφ = 2πδ/λ：δ 增加 λ 对应相位转 2π，峰位重合；增加 λ/2 对应 π，峰谷重合。' },
  { id:'phase', keys:['相位','2π','φ','换算'],
    a:'换算关系 <span class="k">Δφ = 2πδ / λ</span>。<br>' +
      'δ = λ/2 → Δφ = π（反相，暗）；δ = λ → 2π（同相，亮）；δ = 1.5λ → 3π（反相，暗）。<br>' +
      '量纲：δ 为长度，Δφ 为弧度，不可混用。' },
  { id:'coherence', keys:['相干','相干性','为什么能干涉','相干条件'],
    a:'相干条件：<b>频率相同</b>、<b>相位差在观测时间内保持不变</b>（偏振不垂直为附加条件）。<br>' +
      '实际光源受两项限制：<br>· 时间相干 → 谱宽 Δλ（波列长度有限）<br>· 空间相干 → 光源宽度 b（各点相位独立）<br>' +
      '两者都降低可见度，机制不同。' },
  { id:'lcoh', keys:['相干长度','lc','L_c','波列','谱宽','Δλ','单色性'],
    a:'<span class="k">L_c = λ² / Δλ</span>（矩形谱近似）。<br>' +
      '光程差超过 L_c 时，两束光来自不同波列，互不相干，该处只剩平均亮度。<br>' +
      '可观察条纹级数约为 λ/Δλ。钠双线 λ = 589 nm、Δλ = 0.6 nm → L_c ≈ 0.58 mm。' },
  { id:'spcoh', keys:['光源宽度','扩展光源','b','空间相干','太阳'],
    a:'扩展光源可分解为多个点源，各点各成一套条纹，位置错开半格即互相填平。<br>' +
      '临界宽度 <span class="k">b = λR / d</span>（R 为源到缝距）。超过该值，两缝光场不再同源。<br>' +
      '杨氏用针孔限制光源尺寸，即为此。' },
  { id:'vis', keys:['可见度','对比度','模糊','不清楚','v=','包络'],
    a:'<span class="k">V = (I<sub>max</sub> − I<sub>min</sub>) / (I<sub>max</sub> + I<sub>min</sub>)</span>。<br>' +
      'V 下降时光强未必降低，只是两束光不再同步。观察包络：包络下降处仍亮，但无明暗周期。' },
  { id:'opath', keys:['光程','光程差是什么','n·','折射率','为什么是光程'],
    a:'光程 = n·s：几何长度按折射率折算为真空等效长度。<br>' +
      '相位由行进波数决定，介质中波长缩短，故须折算为光程，相位与光程才线性对应。<br>' +
      '本实验在空气中 n ≈ 1，光程差数值等于几何路程差；这是条件成立的结果，不是定义。' },
  { id:'approx', keys:['小角','近似','d sinθ','不等间距','边界','什么时候不成立'],
    a:'δ = d sinθ 为严格式；δ ≈ d·y/L 仅在小角、d ≪ L 时成立。<br>' +
      'd/L 超过百分之几后 sinθ ≈ tanθ 失真，条纹不等间距，Δy = λL/d 出现偏差。<br>' +
      '实验台边界标签会实时给出余量。' },
  { id:'photon', keys:['单光子','一个光子','量子','概率','为什么不选一条缝'],
    a:'单光子落点随机，但<b>落点概率分布</b>由两条路径的光程差决定，即 cos²(πδ/λ)。<br>' +
      '「通过哪条缝」不存在确定答案：两路径振幅叠加给出分布，累积结果即条纹。' +
      '经典粒子图像无法解释该现象。' },
  { id:'measure', keys:['怎么测','测量','读数据','记录什么','数据不够'],
    a:'单一变量，其余锁定；每组参数记录一次。<br>' +
      '建立因果关系至少需两组数据及其比值：d 加倍时 Δy 减半即可说明，无需更多组。' },
  { id:'stuck', keys:['不会','卡住','怎么办','看不懂','没思路'],
    a:'按三步判断：<br>1）该点<b>光程差</b> δ 为多少；<br>2）δ 是 λ 的整数倍还是半整数奇数倍；<br>3）所改参数进入 δ 还是进入 λ。' }
];

const SUGGEST = {
  enter: ['这套实验我该按什么顺序做？','光程差到底是什么？'],
  pre: ['凭直觉答错会被记下来吗？','「相干」到底要求什么？'],
  concept: ['Δy = λL/d 为什么是反比？','相干长度怎么算？'],
  lab: ['为什么条纹会变密？','可见度掉下来是什么意思？','单光子也能干涉？'],
  post: ['1.5λ 的光程差是亮还是暗？','太阳照双缝为什么没有条纹？'],
  review: ['我这个错因该怎么补？','分层 A/B/C 是怎么判的？'],
  teacher: ['导出的 CSV 里各列什么意思？']
};

const FALLBACK = [
  '离线知识库中没有对应条目。',
  '可将问题归结为：某点<b>光程差</b>为多少、由哪个参数决定。',
  '也可描述当前参数与屏上现象（条纹变宽还是变密、边缘变糊还是整体变暗），据此对照。'
];

let online = false;

function setOnline(v){ online = v; }

function match(q){
  const s = (q||'').toLowerCase();
  let best = null, score = 0;
  KB.forEach(function(t){
    let n = 0;
    t.keys.forEach(function(k){ if(s.indexOf(String(k).toLowerCase()) >= 0) n += k.length > 1 ? 2 : 1; });
    if(n > score){ score = n; best = t; }
  });
  return score >= 2 ? best : null;
}

function stepName(){ 
  const m = { enter:'入口', pre:'前测', concept:'概念', lab:'实验', post:'后测', review:'复盘', teacher:'控制台' };
  return m[App.state.step] || '实验';
}

function render(){
  const body = document.getElementById('drawerBody');
  if(!body) return;
  const msgs = App.state.tutor || [];
  if(!msgs.length){
    body.innerHTML = '<div class="msgs">' +
      '<div class="msg" data-who="a"><div class="msg__hd">助教</div>' +
      '<p>本模块助教。<b>不直接给答案</b>，只补充缺失的环节。</p>' +
      '<p>可询问光程、条纹间距、相干性、可见度、单光子等概念，或描述屏上现象。</p>' +
      '<p class="dimmer" style="font-size:12px">当前步骤：'+stepName()+'。对话仅存本机。</p></div>' +
      '</div>';
  } else {
    body.innerHTML = '<div class="msgs">' + msgs.map(function(m){
      if(m.who === 'u') return '<div class="msg" data-who="u">'+esc(m.txt)+'</div>';
      return '<div class="msg" data-who="a"><div class="msg__hd">助教</div>' + m.txt + '</div>';
    }).join('') + '</div>';
  }
  body.scrollTop = body.scrollHeight;
}

function syncSuggests(){
  const host = document.getElementById('sugg');
  if(!host) return;
  const list = SUGGEST[App.state.step] || SUGGEST.lab;
  host.innerHTML = list.map(function(s){ return '<button data-q="'+esc(s)+'">'+esc(s)+'</button>'; }).join('');
}

function answer(q){
  if(online){ return answerOnline(q); }
  const hit = match(q);
  if(hit) return Promise.resolve('<p>'+hit.a+'</p>');
  return Promise.resolve(FALLBACK.map(function(x){ return '<p>'+x+'</p>'; }).join(''));
}

function answerOnline(q){
  const key = localStorage.getItem('yds.apikey');
  if(!key) return Promise.resolve('<p>在线模型未配置。可在「配置」中填入 OpenAI 兼容 key。</p>');
  const ctx = '当前学生在做「杨氏双缝干涉 / 光程与相干性」探究，处在「'+stepName()+'」环节。' +
    '请用中文、简短（不超过 140 字）、苏格拉底式回答：只补概念，不直接给作业答案。';
  return fetch('https://api.deepseek.com/chat/completions', {
    method:'POST',
    headers:{ 'Content-Type':'application/json', 'Authorization':'Bearer '+key },
    body: JSON.stringify({ model:'deepseek-chat', temperature:0.6,
      messages:[{ role:'system', content: ctx }, { role:'user', content: q }] })
  }).then(function(r){ return r.json(); }).then(function(j){
    const t = j.choices && j.choices[0] && j.choices[0].message.content;
    return '<p>'+esc(t||'（模型没有返回内容）')+'</p>';
  }).catch(function(){
    return '<p>在线模型调用失败，已退回离线知识库。</p>';
  });
}

function syncMode(){
  const el = document.getElementById('tutorMode');
  const btn = document.getElementById('tutorKey');
  const has = !!localStorage.getItem('yds.apikey');
  if(el) el.textContent = has ? '在线模型 · 已配置（仅本机保存）' : '离线知识库 · 不联网';
  if(btn) btn.textContent = has ? '清除密钥' : '接入在线模型';
}

window.Tutor = {
  init: function(){
    render(); syncSuggests(); syncMode();
    const b = document.getElementById('tutorKey');
    if(b) b.addEventListener('click', function(){
      if(localStorage.getItem('yds.apikey')){
        localStorage.removeItem('yds.apikey');
        App.toast('已清除密钥，回到离线知识库');
      } else {
        const k = prompt('填入 DeepSeek（或兼容 OpenAI 协议）的 API Key。\n只保存在本机浏览器，不会上传到任何服务器。');
        if(k && k.trim()){ localStorage.setItem('yds.apikey', k.trim()); App.toast('已接入在线模型'); }
      }
      syncMode();
    });
  },
  syncMode: syncMode,
  open: function(){
    document.getElementById('drawer').setAttribute('data-open','');
    document.getElementById('scrim').setAttribute('data-open','');
    render();
    setTimeout(function(){ const a = document.getElementById('ask'); a && a.focus(); }, 320);
  },
  close: function(){
    document.getElementById('drawer').removeAttribute('data-open');
    document.getElementById('scrim').removeAttribute('data-open');
  },
  clear: function(){
    App.state.tutor = [];
    App.save();
    render();
  },
  syncSuggests: syncSuggests,
  send: function(prefix){
    online = !!localStorage.getItem('yds.apikey');
    const ta = document.getElementById('ask');
    const q = (typeof prefix === 'string' ? prefix : ta.value || '').trim();
    if(!q) return;
    if(ta && typeof prefix !== 'string') ta.value = '';
    App.state.tutor = App.state.tutor || [];
    App.state.tutor.push({ who:'u', txt:q, t:App.now() });
    App.track('ask', { q:q });
    render();
    const body = document.getElementById('drawerBody');
    const thinking = document.createElement('div');
    thinking.className = 'msg'; thinking.setAttribute('data-who','a');
    thinking.innerHTML = '<div class="msg__hd">助教</div><p class="dimmer">…</p>';
    body.appendChild(thinking);
    body.scrollTop = body.scrollHeight;
    answer(q).then(function(html){
      thinking.remove();
      App.state.tutor.push({ who:'a', txt:html, t:App.now() });
      App.saveSoon();
      render();
    });
  }
};

document.addEventListener('click', function(e){
  const b = e.target.closest('#sugg button');
  if(b){ window.Tutor.send(b.getAttribute('data-q')); }
});
})();
