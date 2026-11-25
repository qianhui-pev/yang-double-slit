/* ============ Views: 概念导读（纸面 · 档案版） ============ */
(function(){
'use strict';
const App = window.App, esc = App.esc, Views = App.Views, P = window.Phys;

/* SVG 内吃不到 CSS 变量，这里写死纸面四色 */
const FIG_INK = '#16151A', FIG_INK2 = '#4A4750', FIG_INK3 = '#8A8578', FIG_ACCENT = '#C2341F';
const FIG_DIN = 'Bahnschrift SemiCondensed,Bahnschrift,sans-serif';
const FIG_SERIF = 'Georgia,Noto Serif SC,serif';

function geomSVG(){
  return '' +
  '<svg viewBox="0 0 780 412" width="100%" style="display:block;overflow:visible" role="img" aria-label="双缝干涉几何：光程差 delta = d sin theta">' +
    '<defs>' +
      '<marker id="ah" markerWidth="8" markerHeight="8" refX="6.4" refY="3" orient="auto">' +
        '<path d="M0,0 L7,3 L0,6" fill="none" stroke="' + FIG_ACCENT + '" stroke-width="1.2"/></marker>' +
      '<marker id="ahk" markerWidth="8" markerHeight="8" refX="6.4" refY="3" orient="auto">' +
        '<path d="M0,0 L7,3 L0,6" fill="none" stroke="' + FIG_INK2 + '" stroke-width="1.2"/></marker>' +
    '</defs>' +

    /* 光轴 */
    '<line x1="150" y1="204" x2="164" y2="204" stroke="' + FIG_INK + '" stroke-opacity=".3" stroke-width="1.5" stroke-dasharray="3 5"/>' +
    '<line x1="192" y1="204" x2="706" y2="204" stroke="' + FIG_INK + '" stroke-opacity=".3" stroke-width="1.5" stroke-dasharray="3 5"/>' +
    /* 缝板实体 */
    '<line x1="220" y1="46" x2="220" y2="170" stroke="' + FIG_INK + '" stroke-width="2.4"/>' +
    '<line x1="220" y1="238" x2="220" y2="358" stroke="' + FIG_INK + '" stroke-width="2.4"/>' +
    '<rect x="212" y="46" width="8" height="124" fill="' + FIG_INK + '" fill-opacity=".1"/>' +
    '<rect x="212" y="238" width="8" height="120" fill="' + FIG_INK + '" fill-opacity=".1"/>' +
    /* 屏 */
    '<line x1="672" y1="30" x2="672" y2="372" stroke="' + FIG_INK + '" stroke-width="1.6"/>' +
    '<g stroke="' + FIG_INK2 + '" stroke-width="1.5" stroke-opacity=".55">' +
      '<line x1="672" y1="72" x2="680" y2="72"/><line x1="672" y1="132" x2="680" y2="132"/>' +
      '<line x1="672" y1="204" x2="680" y2="204"/><line x1="672" y1="274" x2="680" y2="274"/>' +
      '<line x1="672" y1="334" x2="680" y2="334"/></g>' +

    /* 两条光线 */
    '<line x1="220" y1="180" x2="672" y2="120" stroke="' + FIG_ACCENT + '" stroke-width="1.6"/>' +
    '<line x1="220" y1="228" x2="672" y2="120" stroke="' + FIG_ACCENT + '" stroke-width="1.6" stroke-dasharray="5 4"/>' +
    '<line x1="220" y1="204" x2="672" y2="204" stroke="' + FIG_INK + '" stroke-opacity=".26" stroke-width="1.5"/>' +

    /* 垂足 */
    '<line x1="220" y1="228" x2="252.1" y2="213.1" stroke="' + FIG_INK2 + '" stroke-width="1.5" stroke-dasharray="2 3" stroke-opacity=".8"/>' +
    '<rect x="245" y="207" width="9" height="9" fill="none" stroke="' + FIG_INK2 + '" stroke-width="1.2" stroke-opacity=".7" transform="rotate(-13 249 211)"/>' +

    /* 关键点 */
    '<circle cx="220" cy="180" r="3.6" fill="' + FIG_INK + '"/>' +
    '<circle cx="220" cy="228" r="3.6" fill="' + FIG_INK + '"/>' +
    '<circle cx="672" cy="120" r="4" fill="' + FIG_ACCENT + '"/>' +
    '<line x1="220" y1="170" x2="220" y2="180" stroke="' + FIG_ACCENT + '" stroke-width="2"/>' +
    '<line x1="220" y1="228" x2="220" y2="238" stroke="' + FIG_ACCENT + '" stroke-width="2"/>' +

    /* d 尺寸线 */
    '<line x1="196" y1="180" x2="196" y2="228" stroke="' + FIG_INK2 + '" stroke-width="1.5" marker-start="url(#ahk)" marker-end="url(#ahk)"/>' +
    /* L 尺寸线 */
    '<line x1="220" y1="390" x2="672" y2="390" stroke="' + FIG_INK2 + '" stroke-width="1.5" marker-start="url(#ahk)" marker-end="url(#ahk)"/>' +
    '<line x1="220" y1="364" x2="220" y2="396" stroke="' + FIG_INK2 + '" stroke-width="1.2" stroke-opacity=".55"/>' +
    '<line x1="672" y1="364" x2="672" y2="396" stroke="' + FIG_INK2 + '" stroke-width="1.2" stroke-opacity=".55"/>' +
    /* y 尺寸线（轴心 → P） */
    '<line x1="714" y1="204" x2="714" y2="120" stroke="' + FIG_INK2 + '" stroke-width="1.5" stroke-dasharray="3 3" marker-start="url(#ahk)" marker-end="url(#ahk)"/>' +
    '<line x1="672" y1="120" x2="720" y2="120" stroke="' + FIG_INK2 + '" stroke-width="1.2" stroke-opacity=".35"/>' +
    '<line x1="672" y1="204" x2="720" y2="204" stroke="' + FIG_INK2 + '" stroke-width="1.2" stroke-opacity=".35"/>' +

    /* θ 角弧 */
    '<path d="M 268 204 A 48 48 0 0 0 265.9 192.6" fill="none" stroke="' + FIG_INK2 + '" stroke-width="1.2" stroke-opacity=".7"/>' +

    /* 术语（衬线） */
    '<g font-family="' + FIG_SERIF + '" font-size="22" fill="' + FIG_INK + '">' +
      '<text x="204" y="174" text-anchor="end">S<tspan font-size="16" dy="6">1</tspan></text>' +
      '<text x="204" y="248" text-anchor="end">S<tspan font-size="16" dy="6">2</tspan></text>' +
      '<text x="686" y="108">P</text>' +
    '</g>' +
    /* 关键量：DIN 大写 + 字距 */
    '<g font-family="' + FIG_DIN + '" font-size="17" fill="' + FIG_INK2 + '">' +
      '<text x="180" y="211" text-anchor="end" letter-spacing="3">d</text>' +
      '<text x="446" y="384" text-anchor="middle" letter-spacing="3">L</text>' +
      '<text x="726" y="170" letter-spacing="3">y</text>' +
      '<text x="476" y="193" text-anchor="middle" letter-spacing="2.4">d sin θ</text>' +
      '<text x="282" y="196" letter-spacing="2.4">θ</text>' +
    '</g>' +
    /* δ 强调 */
    '<g font-family="' + FIG_SERIF + '" font-size="19" fill="' + FIG_ACCENT + '">' +
      '<text x="262" y="242" font-style="italic">δ</text></g>' +
    /* 装置名 */
    '<g font-family="' + FIG_DIN + '" font-size="16" fill="' + FIG_INK2 + '" letter-spacing="3.2">' +
      '<text x="220" y="30" text-anchor="middle">SLIT PLANE</text>' +
      '<text x="672" y="22" text-anchor="middle">SCREEN</text>' +
      '<text x="152" y="196" text-anchor="end" letter-spacing="1.6">O</text>' +
    '</g>' +
  '</svg>';
}

Views.concept = {
  html: function(){
    const S = App.state;
    const p = S.lab.params;
    return '' +
    '<div class="paper">' +
    '<div class="paper__rail" aria-hidden="true">YDS-01 · 概念导读 · 光程 · 相干性 · 档案 ARCHIVE</div>' +
    '<div class="paper__stamp" aria-hidden="true"><b>YDS-01</b><span>概念导读</span><i>CONCEPT / THEORY</i></div>' +
    '<section class="section wrap" style="max-width:1180px">' +

      /* ---- 档案头 ---- */
      '<div class="paper__strip anim-up">' +
        '<span><b>YDS-01</b><i class="paper__strip-dot"></i>THEORY · 概念导读</span>' +
        '<span class="paper__strip-r">档案 <b>003</b> / 008<i class="paper__strip-dot"></i>第二校次</span>' +
      '</div>' +

      '<div class="sec-hd anim-up" style="margin-bottom:18px">' +
        '<div>' +
          '<div class="sec-hd__n"><b>03</b> / THEORY · 概念导读</div>' +
          '<h2 class="h-sec" style="margin-top:14px;font-size:clamp(28px,4vw,52px)">光程：<br>几何长度<br>折算为相位。</h2>' +
        '</div>' +
        '<div class="dimmer mono" style="font-size:10px;letter-spacing:.16em;text-align:right;line-height:1.9">' +
          '四节<br>约 8 分钟</div>' +
      '</div>' +
      '<p class="lead dim anim-up d1" style="max-width:70ch">' +
        '屏上每点亮度只由<b style="color:var(--paper-ink)">光程差 δ</b> 决定；δ 能否稳定存在，由相干性决定。' +
        '条纹、可见度与条纹消失均为这两条的直接推论。' +
      '</p>' +

      /* ---- I ---- */
      '<div class="sec-rule">' +
        '<span class="sec-rule__n">I.</span>' +
        '<span class="sec-rule__t"><i></i>光程与光程差<i></i></span>' +
        '<span class="sec-rule__f">006 / 024</span>' +
      '</div>' +
      '<div class="grid g-2" style="align-items:start;gap:44px">' +
        '<div>' +
          '<h3 class="h-sub" style="font-size:22px;margin:0 0 14px;font-family:var(--serif);font-weight:600">光程与几何长度的区别</h3>' +
          '<p class="dim" style="font-size:14.5px;line-height:1.85;margin:0 0 14px">' +
            '相位由光行进的周期数决定。介质中光速较低，同样的几何长度对应更多波长。' +
            '几何长度乘折射率 <i>n</i> 即得<b style="color:var(--paper-ink)">光程</b>，光程直接决定相位。' +
          '</p>' +
          '<div class="eq"><span>光程</span><span class="v">=</span><span><i>n</i> · <i>s</i></span>' +
            '<span style="margin-left:auto;color:var(--paper-ink-3);font-size:12px">s 为几何长度</span></div>' +
          '<div class="eq" style="margin-top:8px"><span>两根光线的<b>光程差</b></span><span class="v">δ</span><span class="v">⇒</span>' +
            '<span>相位差 Δφ = 2πδ / λ</span></div>' +
          '<p class="dim" style="font-size:14.5px;line-height:1.85;margin:16px 0 0">' +
            '本实验在空气中进行（<i>n</i> ≈ 1），光程差数值等于几何路程差；该等价仅在 <i>n</i> = 1 时成立。' +
          '</p>' +
          '<div class="note" style="margin-top:18px">' +
            '<span class="note__k">陷阱</span>' +
            '<span>光程差与相位差相差因子 2π/λ，单位不同：前者为长度，后者为弧度（rad）。' +
            '此处换算错误将直接使明暗判据失效。' +
          '</div>' +
        '</div>' +
        '<div>' +
          '<div class="panel figwrap" style="padding:0">' +
            '<div class="figcap">' +
              '<span class="figcap__n">FIG. 1</span>' +
              '<span class="figcap__t">双缝几何 · 光程差构造</span>' +
              '<span class="figcap__s">示意 · 非等比</span>' +
            '</div>' +
            '<div class="figbody">' + geomSVG() + '</div>' +
            '<div class="figfoot">' +
              '在 S₁P 上截取等于 S₂P 的长度，余量即 δ。' +
              'δ 为缝距 d 在观察方向 θ 上的投影：<span class="mono">δ = d sinθ</span>。' +
            '</div>' +
          '</div>' +
        '</div>' +
      '</div>' +

      /* ---- II ---- */
      '<div class="sec-rule">' +
        '<span class="sec-rule__n">II.</span>' +
        '<span class="sec-rule__t"><i></i>明暗条件 · 条纹间距<i></i></span>' +
        '<span class="sec-rule__f">010 / 024</span>' +
      '</div>' +
      '<div class="grid g-2" style="gap:44px;align-items:start">' +
        '<div>' +
          '<h3 class="h-sub" style="font-size:22px;margin:0 0 16px;font-family:var(--serif);font-weight:600">相干叠加的明暗条件</h3>' +
          '<p class="dim" style="font-size:14.5px;line-height:1.85;margin:0 0 16px">' +
            '两波叠加：相位差为 2π 整数倍时峰位重合，干涉加强；为 π 奇数倍时峰谷重合，干涉相消。' +
            '按光程差写出即：</p>' +
          '<div class="eq"><span>亮纹</span><span class="v">δ = k λ</span>' +
            '<span style="margin-left:auto;color:var(--paper-ink-3)">k = 0, ±1, ±2 …</span></div>' +
          '<div class="eq" style="margin-top:8px"><span>暗纹</span><span class="v">δ = (k + ½) λ</span></div>' +
          '<p class="dim" style="font-size:14.5px;line-height:1.85;margin:16px 0 0">' +
            '小角近似（<span class="mono">θ ≈ y/L</span>）下，δ = d·y/L。代入亮纹条件可得相邻亮纹间距：</p>' +
          '<div class="eq eq--key" style="margin-top:14px;font-size:20px">' +
            '<span style="margin:0 auto">Δ<i>y</i> = λ<i>L</i> / <i>d</i></span></div>' +
          '<div class="note note--quiet" style="margin-top:16px">' +
            '<span class="note__k">边界</span>' +
            '<span>上式仅在 <span class="mono">d ≪ L</span>、θ 很小条件下成立。d 接近 L 时须改用 <span class="mono">δ = d sinθ</span>，' +
            '条纹间距不再均匀；实验台会给出提示。</span>' +
          '</div>' +
        '</div>' +
        '<div>' +
          '<div class="panel" style="padding:16px">' +
            '<div class="panel__hd" style="border:0;padding:0 0 10px"><span class="dot"></span>屏上强度 I(y)</div>' +
            '<canvas id="cStrip" style="width:100%;height:150px;display:block"></canvas>' +
            '<div style="display:flex;justify-content:space-between;font-family:var(--mono);font-size:9.5px;color:var(--paper-ink-3);letter-spacing:.1em;margin-top:8px">' +
              '<span>−6Δy</span><span>0</span><span>+6Δy</span></div>' +
            '<div class="tbl-wrap" style="margin-top:16px">' +
              '<table class="tbl"><tbody>' +
              '<tr><td>当前 λ / d / L</td><td class="num" id="cPd" style="text-align:right"></td></tr>' +
              '<tr><td>条纹间距 Δy</td><td class="num" id="cDy" style="text-align:right"></td></tr>' +
              '</tbody></table>' +
            '</div>' +
            '<div class="dimmer" style="font-size:11.5px;margin-top:10px;line-height:1.65">曲线由实验台当前参数计算，随参数变化。</div>' +
          '</div>' +
        '</div>' +
      '</div>' +

      /* ---- III ---- */
      '<div class="sec-rule">' +
        '<span class="sec-rule__n">III.</span>' +
        '<span class="sec-rule__t"><i></i>相干条件 · 可见度<i></i></span>' +
        '<span class="sec-rule__f">014 / 024</span>' +
      '</div>' +
      '<h3 class="h-sub" style="font-size:22px;margin:0 0 12px;font-family:var(--serif);font-weight:600">相干性与可见度</h3>' +
      '<p class="dim" style="font-size:14.5px;line-height:1.85;max-width:74ch;margin:0 0 24px">' +
        '两束光须在观测时间内保持固定相位差。破坏该条件有两种情形：<b style="color:var(--paper-ink)">谱线不纯</b>使波列过短，' +
        '<b style="color:var(--paper-ink)">光源过宽</b>使缝上各点互不相关。两者在屏上表现一致：' +
        '<b style="color:var(--paper-ink)">可见度 V</b> 下降，条纹变糊并最终消失。' +
      '</p>' +
      '<div class="grid g-2" style="gap:40px;align-items:start">' +
        '<div>' +
          '<div class="eyebrow" style="color:var(--paper-ink-2)">A · 时间相干</div>' +
          '<p class="dim" style="font-size:14.5px;line-height:1.82;margin:11px 0">' +
            '谱宽 Δλ 决定波列长度，即<b style="color:var(--paper-ink)">相干长度</b>：</p>' +
          '<div class="eq"><span>L<sub>c</sub> = λ² / Δλ</span><span style="margin-left:auto;font-size:12px;color:var(--paper-ink-3)">矩形谱近似</span></div>' +
          '<p class="dim" style="font-size:14.5px;line-height:1.82;margin:11px 0 0">' +
            '光程差超过 L_c 时，两束光来自不同波列，互不相干，该处呈平均亮度，条纹消失。' +
            '可观察的条纹级数约为 <span class="mono">λ/Δλ</span>。</p>' +
          '<div class="eyebrow" style="color:var(--paper-ink-2);margin-top:28px">B · 空间相干</div>' +
          '<p class="dim" style="font-size:14.5px;line-height:1.82;margin:11px 0">' +
            '光源宽度 b 使缝上各点接收的相位不同。b 超过临界值时两缝光场互不相关：</p>' +
          '<div class="eq"><span>b<sub>临界</sub> = λ R / d</span><span style="margin-left:auto;font-size:12px;color:var(--paper-ink-3)">R 为源到缝距</span></div>' +
          '<p class="dim" style="font-size:14.5px;line-height:1.82;margin:11px 0 0">' +
            '杨氏原实验用针孔限制光源尺寸，即针对这一情形。' +
        '</div>' +
        '<div class="panel" style="padding:16px">' +
          '<div class="panel__hd" style="border:0;padding:0 0 12px"><span class="dot"></span>相干性调节</div>' +
          '<div class="sld" style="border-top:1px solid rgba(22,21,26,.1);border-bottom:0">' +
            '<div class="sld__top"><span class="sld__nm">光谱宽度 <i>Δλ</i></span>' +
              '<span class="sld__val" id="vDlam">0.00<u>nm</u></span></div>' +
            '<div class="sld__track"><input type="range" id="rDlam" min="0" max="150" step="0.5" value="0">' +
            (window.Snap ? window.Snap.ticks('dLam', 0, 150) : '') + '</div>' +
            '<div class="sld__scale"><span>0 单色</span><span>150 nm 宽带</span></div>' +
          '</div>' +
          '<div class="sld" style="border-bottom:0">' +
            '<div class="sld__top"><span class="sld__nm">光源宽度 <i>b</i></span>' +
              '<span class="sld__val" id="vB">0.000<u>mm</u></span></div>' +
            '<div class="sld__track"><input type="range" id="rB" min="0" max="1.5" step="0.01" value="0">' +
            (window.Snap ? window.Snap.ticks('b', 0, 1.5) : '') + '</div>' +
            '<div class="sld__scale"><span>0 点源</span><span>1.50 mm</span></div>' +
          '</div>' +
          '<canvas id="cVis" style="width:100%;height:170px;display:block;margin-top:6px"></canvas>' +
          '<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:12px">' +
            '<div><div class="eyebrow" style="font-size:9px;color:var(--paper-ink-2)">可见度 V</div><div class="mono" id="vV" style="font-size:18px">1.00</div></div>' +
            '<div><div class="eyebrow" style="font-size:9px;color:var(--paper-ink-2)">相干长度 L_c</div><div class="mono" id="vLc" style="font-size:18px">∞</div></div>' +
          '</div>' +
          '<div class="dimmer" style="font-size:11.5px;margin-top:10px;line-height:1.65">' +
            '看的是条纹的「包络」。包络塌下去的地方，光还是亮的，只是两条光不再相干。' +
        '</div>' +
      '</div>' +

      /* ---- IV ---- */
      '<div class="sec-rule">' +
        '<span class="sec-rule__n">IV.</span>' +
        '<span class="sec-rule__t"><i></i>模型的适用边界<i></i></span>' +
        '<span class="sec-rule__f">018 / 024</span>' +
      '</div>' +
      '<div class="grid g-3" style="gap:26px">' +
        boundaryCell('小角近似', '要求 d ≪ L、θ 很小。d 与 L 可比时 sinθ 不能近似为 y/L，条纹间距不再均匀。') +
        boundaryCell('标量波近似', '仅计算强度叠加，忽略偏振。两束光偏振方向垂直时无干涉项，故偏振一致属相干条件之一。') +
        boundaryCell('单色 + 线性', 'Δy = λL/d 假定单色、线性介质与理想缝。实际缝有宽度，条纹受单缝衍射包络调制。') +
      '</div>' +

      '<div class="paper__end" style="display:flex;align-items:center;gap:18px;margin-top:56px;flex-wrap:wrap">' +
        '<button class="btn btn--solid" id="toLab">进入实验台 <span class="btn__arrow">→</span></button>' +
        '<span class="dimmer" style="font-size:12.5px;max-width:44ch;line-height:1.7">' +
          '进入实验台前先做一次预测：缝距加倍后，条纹间距变为原来的几分之一。先说，再量。</span>' +
        '<span class="paper__endfolio" aria-hidden="true">— 003 / 008 —</span>' +
      '</div>' +
    '</section>' +
    '</div>';
  },

  mount: function(){
    const S = App.state;
    const real = P.toSI(S.lab.params);
    const c1 = document.getElementById('cStrip');
    if(c1){
      const info = window.Optics.miniStrip(c1, S.lab.params, {});
      document.getElementById('cDy').textContent = P.fmtLen(info.dyM);
      document.getElementById('cPd').textContent = S.lab.params.lam.toFixed(1)+' nm · '+
        S.lab.params.d.toFixed(2)+' mm · '+S.lab.params.L.toFixed(2)+' m';
    }

    const tmp = { d:S.lab.params.d, L:S.lab.params.L, lam:S.lab.params.lam, b:0, R:S.lab.params.R, dLam:0 };
    const cv = document.getElementById('cVis');
    const rD = document.getElementById('rDlam'), rB = document.getElementById('rB');
    let snapD = null, snapB = null;
    function paint(){
      /* 磁吸：Δλ 与光源宽度也吸附到有意义的刻度 */
      if(window.Snap){
        const a = window.Snap.value('dLam', Number(rD.value), snapD);
        const c2 = window.Snap.value('b', Number(rB.value), snapB);
        if(a.snapped){ rD.value = a.v; snapD = a.detent; rD.parentNode.setAttribute('data-snap',''); }
        else { snapD = null; rD.parentNode.removeAttribute('data-snap'); }
        if(c2.snapped){ rB.value = c2.v; snapB = c2.detent; rB.parentNode.setAttribute('data-snap',''); }
        else { snapB = null; rB.parentNode.removeAttribute('data-snap'); }
      }
      tmp.dLam = Number(rD.value); tmp.b = Number(rB.value);
      document.getElementById('vDlam').innerHTML = tmp.dLam.toFixed(2)+'<u>nm</u>';
      document.getElementById('vB').innerHTML = tmp.b.toFixed(3)+'<u>mm</u>';
      const re = P.toSI(tmp);
      const V = P.visibilityEdge(re, 7);
      document.getElementById('vV').textContent = V.toFixed(2);
      document.getElementById('vV').style.color = V < 0.35 ? '#C2341F' : '';
      const Lc = P.coherenceLength(re.lam, re.dLam);
      document.getElementById('vLc').textContent = isFinite(Lc) ? P.fmtLen(Lc) : '∞';
      drawVis(cv, re, P.fringeSpacing(re.lam,re.L,re.d)*7);
    }
    [rD, rB].forEach(function(r){ r.addEventListener('input', paint); });
    paint();

    document.getElementById('toLab').addEventListener('click', function(){
      App.track('nav', { to:'lab' });
      App.go('lab');
    });
  }
};

function drawVis(canvas, real, half){
  const dpr = Math.min(window.devicePixelRatio||1,2);
  const r = canvas.getBoundingClientRect();
  const W = Math.max(160,r.width), H = Math.max(90,r.height);
  canvas.width = W*dpr; canvas.height = H*dpr;
  const g = canvas.getContext('2d'); g.setTransform(dpr,0,0,dpr,0,0);
  g.clearRect(0,0,W,H);
  const base = H*0.78;
  g.strokeStyle = 'rgba(22,21,26,.16)'; g.beginPath(); g.moveTo(0,base+.5); g.lineTo(W,base+.5); g.stroke();
  const N = Math.max(200, Math.floor(W*1.6));
  const amp = H*0.62;
  for(let i=0;i<=N;i++){
    const y = -half + 2*half*i/N;
    const pt = P.intensityAt(y, real);
    const V = pt.V;
    const I = 0.5*(1 + V*Math.cos(2*Math.PI*pt.delta/real.lam));
    const x = i/N*W;
    const h = I*amp;
    g.fillStyle = V > 0.02 ? 'rgba(194,52,31,.92)' : 'rgba(22,21,26,.12)';
    g.fillRect(x, base-h, Math.max(1, W/N+0.6), h);
  }
  /* 可见度已经在画布下方用大字号标了，画布上不再重复写一行 9px 小字 */
}

function boundaryCell(t, d){
  return '<div class="bound">' +
    '<div class="bound__hd">' +
      '<span class="bound__k">LIMIT</span>' +
      '<h4 class="bound__t">'+t+'</h4></div>' +
    '<p class="bound__p">'+d+'</p></div>';
}
})();
