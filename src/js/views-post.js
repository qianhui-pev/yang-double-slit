
/* ============ Views: 后测 ============ */
(function(){
'use strict';
const App = window.App, esc = App.esc, Views = App.Views;

function page(store, items, cfg){
  return '<section class="section"><div class="wrap" style="max-width:940px">' +
    '<div class="sec-hd anim-up">' +
      '<div>' +
        '<div class="sec-hd__n"><b>05</b> / POST-TEST · 后测</div>' +
        '<h2 class="h-sec" style="margin-top:14px">'+cfg.title+'</h2>' +
      '</div>' +
      '<div class="dimmer mono" style="font-size:10px;letter-spacing:.16em;text-align:right;line-height:1.9">' +
        '与前测同维度 · 5 题<br>含迁移题</div>' +
    '</div>' +
    '<p class="lead anim-up d1" style="margin-bottom:8px">'+cfg.lead+'</p>' +
    '<div class="anim-up d2" id="qhost">' + items.map(function(it){ return window.QBank.qBlock(it, store); }).join('') + '</div>' +
    '<div style="display:flex;align-items:center;gap:18px;margin-top:40px;flex-wrap:wrap">' +
      '<button class="btn btn--solid" id="postNext">'+cfg.cta+' <span class="btn__arrow">→</span></button>' +
      '<span class="dimmer mono" id="postProg" style="font-size:11px;letter-spacing:.14em"></span>' +
    '</div>' +
  '</div></section>';
}

Views.post = {
  html: function(){
    const S = App.state;
    return page(S.post, window.Bank.POST, {
      title:'再答一次，<br>与实验前对照。',
      lead:'与前测同维度，另含迁移题。提交后生成前测—后测对照表，该表不计分。',
      cta:'提交并查看复盘'
    });
  },
  mount: function(){
    const S = App.state, host = document.getElementById('qhost');
    const upd = function(){
      const done = window.Bank.POST.filter(function(it){ return S.post[it.k] && S.post[it.k].ans !== undefined; }).length;
      document.getElementById('postProg').textContent = '已回答 ' + done + ' / ' + window.Bank.POST.length;
    };
    window.Bank.POST.forEach(function(it){ window.QBank.bindQ(host, it, S.post, upd); });
    upd();
    document.getElementById('postNext').addEventListener('click', function(){
      const n = window.Bank.POST.length;
      const done = window.Bank.POST.filter(function(it){ return S.post[it.k] && S.post[it.k].ans !== undefined; }).length;
      if(done < n){ App.toast('还有 ' + (n-done) + ' 题未作答。'); return; }
      App.track('submit', { scope:'post' });
      App.save(); App.go('review');
    });
  }
};
})();
