
/* ============ 启动 ============ */
(function(){
'use strict';
const App = window.App;

/* ---- 控制台口令：改这一行就能换口令（只在前端挡一下，不是真加密） ---- */
const CONSOLE_CODE = '2580';
let consoleOK = false;
/* 只给 DEV 面板用：跳过口令门直接看控制台（交付后 ?dev=1 才存在） */
App.__devUnlock = function(){ consoleOK = true; };

/* 控制台的口令门：不是学生视图，只用来挡「随便点进来」 */
App.Views.gate = {
  html: function(){
    return '<section class="section" style="padding-top:14vh;padding-bottom:16vh"><div class="wrap" style="max-width:560px">' +
      '<div class="gate anim-up">' +
        '<div class="gate__n"><span class="gate__r">CONSOLE</span><i>控制台</i></div>' +
        '<h2 class="gate__t">持有口令即可查看数据。</h2>' +
        '<div class="gate__row">' +
          '<input class="input gate__in" id="gateCode" maxlength="12" autocomplete="off" placeholder="输入口令">' +
          '<button class="btn btn--solid" id="gateGo">进入</button>' +
        '</div>' +
        '<p class="gate__hint">口令由任课教师持有。</p>' +
      '</div>' +
      '<div style="margin-top:28px"><button class="btn btn--sm btn--ghost" id="gateBack">← 回到学生端</button></div>' +
    '</div></section>';
  },
  mount: function(){
    const inp = document.getElementById('gateCode');
    function submit(){
      if(inp.value.trim() === CONSOLE_CODE){
        consoleOK = true;
        App.track('nav', { to:'console' });
        App.go('teacher');
      } else {
        inp.value = '';
        inp.setAttribute('data-bad','');
        setTimeout(function(){ inp.removeAttribute('data-bad'); }, 900);
        App.toast('口令错误。');
        inp.focus();
      }
    }
    document.getElementById('gateGo').addEventListener('click', submit);
    inp.addEventListener('keydown', function(e){ if(e.key === 'Enter') submit(); });
    document.getElementById('gateBack').addEventListener('click', function(){ App.go('enter'); });
    inp.focus();
  }
};

function wire(){
  document.getElementById('btnConcept').addEventListener('click', function(){
    if(App.state.student.id) App.track('nav', {to:'concept'});
    App.go('concept');
  });
  document.getElementById('btnTeacher').addEventListener('click', function(){
    if(consoleOK) App.go('teacher'); else App.go('gate');
  });
  document.getElementById('brandHome').addEventListener('click', function(e){ e.preventDefault(); App.go('enter'); });
  document.getElementById('stepper').addEventListener('click', function(e){
    const b = e.target.closest('.step-dot'); if(!b) return;
    const k = b.getAttribute('data-step');
    if(k === 'enter' || App.state.student.id){ App.go(k); }
    else App.toast('请先填写学号与姓名。');
  });
  const fab = document.getElementById('tutorFab');
  fab.addEventListener('click', function(){ window.Tutor && window.Tutor.open(); });
  document.getElementById('tutorClose').addEventListener('click', function(){ window.Tutor.close(); });
  document.getElementById('scrim').addEventListener('click', function(){ window.Tutor.close(); });
  document.getElementById('tutorClear').addEventListener('click', function(){ window.Tutor.clear(); });
  document.getElementById('askSend').addEventListener('click', function(){ window.Tutor.send(); });
  document.getElementById('ask').addEventListener('keydown', function(e){
    if(e.key === 'Enter' && !e.shiftKey){ e.preventDefault(); window.Tutor.send(); }
  });
  window.addEventListener('hashchange', function(){
    const k = location.hash.replace('#','');
    if(k && k !== App.state.step) App.go(k);
  });
}

const origGo = App.go;
App.go = function(step, opts){
  /* 深链接（#teacher）和任何直接 App.go('teacher') 都先过口令门 */
  if(step === 'teacher' && !consoleOK){ step = 'gate'; opts = Object.assign({}, opts, { hash:false }); }
  (App.loops||[]).forEach(function(f){ try{ f(); }catch(e){} });
  App.loops = [];
  origGo(step, opts);
  if(window.Tutor) window.Tutor.syncSuggests();
  App.syncChrome();
};

document.addEventListener('DOMContentLoaded', function(){
  wire();
  let start = 'enter';
  try{
    const cur = localStorage.getItem('yds.v1.current');
    const all = App.readAll();
    if(cur && all[cur]){
      App.state = all[cur];
      if(App.state.step && App.state.step !== 'enter') start = App.state.step;
    }
  }catch(e){}
  const hash = location.hash.replace('#','');
  if(hash && App.Views[hash]) start = hash;
  App.go(start);
  if(window.Tutor) window.Tutor.init();
});
})();
