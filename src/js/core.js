
/* ============ 核心：状态 / 存储 / 轨迹 / 路由 ============ */
(function(){
'use strict';

const KEY_ALL = 'yds.v1.students';
const KEY_CUR = 'yds.v1.current';

const $  = (s,r)=> (r||document).querySelector(s);
const $$ = (s,r)=> Array.from((r||document).querySelectorAll(s));
const esc = s => String(s==null?'':s).replace(/[&<>"']/g, m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const clamp = (v,a,b)=>Math.min(b,Math.max(a,v));
const now = ()=>Date.now();
const uid = ()=> Math.random().toString(36).slice(2,9);

function readAll(){
  try{ return JSON.parse(localStorage.getItem(KEY_ALL))||{}; }catch(e){ return {}; }
}
function writeAll(o){
  try{ localStorage.setItem(KEY_ALL, JSON.stringify(o)); return true; }
  catch(e){ toast('本地存储写入失败：浏览器可能处于隐私模式或空间不足'); return false; }
}

const STEPS = [
  {k:'enter',   n:'入口',   label:'START'},
  {k:'pre',     n:'前测',   label:'PRE-TEST'},
  {k:'concept', n:'概念',   label:'THEORY'},
  {k:'lab',     n:'实验',   label:'LAB'},
  {k:'post',    n:'后测',   label:'POST-TEST'},
  {k:'review',  n:'复盘',   label:'REVIEW'}
];

function blankState(){
  return {
    v:1, created: now(), updated: now(),
    student:{ id:'', name:'', group:'' },
    step:'enter',
    visited:{},
    pre:{}, post:{},
    lab:{
      task:0,
      params:{ d:0.30, L:1.20, lam:632.8, b:0.00, R:0.60, dLam:0.00 },
      answers:{},      /* taskKey -> {pred, ans, why, at} */
      records:[],      /* {i, at, task, params, dy, V, N} */
      mode:'wave'
    },
    track:[], tutor:[], eval:{ self:null, peer:null },
    dwell:{}, flags:{}
  };
}

let S = blankState();

function save(){
  S.updated = now();
  if(!S.student.id) return;
  const all = readAll(); all[S.student.id] = S; writeAll(all);
  try{ localStorage.setItem(KEY_CUR, S.student.id); }catch(e){}
}

let saveT = null;
function saveSoon(){ clearTimeout(saveT); saveT = setTimeout(save, 320); }

/* ---------- 轨迹 ---------- */
function track(k, d){
  const rec = { t: now(), k:k, d: d||{} };
  S.track.push(rec);
  if(S.track.length > 1600) S.track.splice(0, 200);
  stallTick();
  saveSoon();
  return rec;
}

let lastAct = now(), stallArmed = false;
function stallTick(){ lastAct = now(); stallArmed = false; }
setInterval(function(){
  if(!S.student.id) return;
  if(document.hidden) return;
  if(now() - lastAct > 120000 && !stallArmed){
    stallArmed = true;
    S.track.push({ t: now(), k:'stall', d:{ step:S.step, sec:Math.round((now()-lastAct)/1000) } });
    saveSoon();
  }
}, 15000);

/* 停留计时 */
let stepEnter = now();
function dwellOut(){
  const sec = Math.round((now()-stepEnter)/1000);
  if(sec >= 3){ S.dwell[S.step] = (S.dwell[S.step]||0) + sec; }
  S.track.push({ t:now(), k:'dwell', d:{ step:S.step, sec:sec } });
  stepEnter = now();
}

/* ---------- 路由 ---------- */
const Views = window.Views = window.Views || {};
let curStep = null;

function go(step, opts){
  opts = opts || {};
  if(curStep){ dwellOut(); }
  curStep = step; S.step = step; S.visited[step] = true;
  stepEnter = now();
  if(step !== 'enter') track('step', { to: step });

  document.body.dataset.step = step;
  const view = Views[step] || Views.enter;
  const host = $('#view');
  host.innerHTML = view.html();
  if(view.mount) view.mount();
  renderStepper();
  window.scrollTo({ top:0, behavior: opts.instant ? 'auto' : 'auto' });
  saveSoon();
  if(opts.hash !== false){ try{ history.replaceState(null,'','#'+step); }catch(e){} }
}

function renderStepper(){
  const host = $('#stepper'); if(!host) return;
  host.innerHTML = STEPS.map(function(s){
    const on = s.k === curStep;
    const done = !on && S.visited[s.k] && s.k !== 'teacher';
    return '<button class="step-dot" data-step="'+s.k+'"'+(on?' data-on':'')+(done?' data-done':'')+'>'+
      '<i></i>'+esc(s.label)+'</button>';
  }).join('');
}

/* ---------- 顶栏主题 ---------- */
function syncChrome(){
  const tb = $('#topbar'); if(!tb) return;
  const paper = curStep === 'concept';
  tb.style.background = paper ? 'rgba(243,240,233,.9)' : '';
  tb.style.color = paper ? 'var(--paper-ink)' : '';
  tb.style.borderBottomColor = paper ? 'rgba(22,21,26,.14)' : '';
  $$('.step-dot', tb).forEach(function(b){
    b.style.color = paper
      ? (b.hasAttribute('data-on') ? 'var(--paper-ink)' : 'rgba(22,21,26,.45)')
      : '';
    b.style.borderColor = paper ? (b.hasAttribute('data-on') ? 'rgba(22,21,26,.3)' : 'transparent') : '';
  });
}

/* ---------- toast ---------- */
let toastT = null;
function toast(msg, ms){
  let el = $('#toast');
  if(!el){ el = document.createElement('div'); el.id='toast'; el.className='toast'; document.body.appendChild(el); }
  el.textContent = msg;
  el.setAttribute('data-on','');
  clearTimeout(toastT);
  toastT = setTimeout(function(){ el.removeAttribute('data-on'); }, ms||2600);
}

/* ---------- 导出 ---------- */
function download(name, text, mime){
  const blob = new Blob([text], { type: (mime||'text/plain')+';charset=utf-8' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = name;
  document.body.appendChild(a); a.click();
  setTimeout(function(){ URL.revokeObjectURL(a.href); a.remove(); }, 800);
}

function csvCell(v){
  const s = String(v==null?'':v);
  return /[",\n]/.test(s) ? '"'+s.replace(/"/g,'""')+'"' : s;
}

window.App = {
  $:$, $$:$$, esc:esc, clamp:clamp, now:now, uid:uid,
  STEPS:STEPS, Views:Views,
  get state(){ return S; },
  set state(v){ S = v; },
  blank: blankState, save:save, saveSoon:saveSoon, readAll:readAll, writeAll:writeAll,
  track:track, go:go, toast:toast, download:download, csvCell:csvCell, syncChrome:syncChrome,
  renderStepper:renderStepper,
  KEY_ALL:KEY_ALL
};
})();
