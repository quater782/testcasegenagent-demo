/* 轻量的应用内弹窗 / 提示组件，替代浏览器原生 alert/confirm/prompt。
   API：UI.toast(msg,type) / UI.alert(msg,opt) / UI.confirm(msg,opt) / UI.prompt(msg,opt) */
(function(){
  const NS='__ui_layer__';
  function ensureStyle(){
    if(document.getElementById('ui-style'))return;
    const css=`
    .ui-mask{position:fixed;inset:0;background:rgba(0,0,0,.45);display:flex;align-items:center;justify-content:center;z-index:9999;animation:ui-fade .12s ease}
    .ui-card{background:var(--card,#fff);color:var(--tx,#1f2430);border:1px solid var(--bd,#e2e6ec);border-radius:12px;min-width:300px;max-width:440px;box-shadow:0 12px 40px rgba(0,0,0,.3);overflow:hidden;animation:ui-pop .14s cubic-bezier(.2,.9,.3,1.2)}
    .ui-card .ui-hd{padding:13px 16px 4px;font-size:15px;font-weight:600}
    .ui-card .ui-bd{padding:6px 16px 14px;font-size:13.5px;line-height:1.6;white-space:pre-wrap;word-break:break-word}
    .ui-card .ui-in{width:100%;margin-top:8px;border:1px solid var(--bd,#e2e6ec);background:var(--bg,#f5f6f8);color:var(--tx,#1f2430);border-radius:8px;padding:8px 10px;font-size:13px;font-family:inherit;resize:vertical;min-height:38px}
    .ui-card .ui-ft{display:flex;gap:8px;justify-content:flex-end;padding:10px 14px;border-top:1px solid var(--bd,#e2e6ec);background:#6b72800a}
    .ui-btn{border:1px solid var(--bd,#e2e6ec);background:var(--card,#fff);color:var(--tx,#1f2430);border-radius:8px;padding:7px 16px;cursor:pointer;font-size:13px}
    .ui-btn.primary{background:var(--ac,#2563eb);color:#fff;border-color:var(--ac,#2563eb)}
    .ui-btn.danger{background:var(--bad,#dc2626);color:#fff;border-color:var(--bad,#dc2626)}
    .ui-toasts{position:fixed;right:18px;bottom:18px;display:flex;flex-direction:column;gap:8px;z-index:10000}
    .ui-toast{background:var(--card,#fff);color:var(--tx,#1f2430);border:1px solid var(--bd,#e2e6ec);border-left:3px solid var(--ac,#2563eb);border-radius:8px;padding:9px 14px;font-size:13px;box-shadow:0 6px 20px rgba(0,0,0,.18);animation:ui-slide .18s ease;max-width:360px}
    .ui-toast.ok{border-left-color:var(--ac2,#0e9f6e)}
    .ui-toast.err{border-left-color:var(--bad,#dc2626)}
    .ui-toast.warn{border-left-color:var(--warn,#d97706)}
    @keyframes ui-fade{from{opacity:0}to{opacity:1}}
    @keyframes ui-pop{from{transform:scale(.95);opacity:.5}to{transform:scale(1);opacity:1}}
    @keyframes ui-slide{from{transform:translateX(20px);opacity:0}to{transform:translateX(0);opacity:1}}`;
    const s=document.createElement('style');s.id='ui-style';s.textContent=css;document.head.appendChild(s);
  }
  function esc(v){return String(v==null?'':v).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));}

  function modal({title,body,buttons,input}){
    ensureStyle();
    return new Promise(resolve=>{
      const mask=document.createElement('div');mask.className='ui-mask';
      const inputHtml=input?`<textarea class="ui-in" placeholder="${esc(input.placeholder||'')}">${esc(input.value||'')}</textarea>`:'';
      mask.innerHTML=`<div class="ui-card" role="dialog" aria-modal="true">
        ${title?`<div class="ui-hd">${esc(title)}</div>`:''}
        <div class="ui-bd">${body||''}${inputHtml}</div>
        <div class="ui-ft"></div></div>`;
      const ft=mask.querySelector('.ui-ft');
      const ta=mask.querySelector('.ui-in');
      function close(val){document.removeEventListener('keydown',onKey);mask.remove();resolve(val);}
      buttons.forEach(b=>{
        const el=document.createElement('button');
        el.className='ui-btn'+(b.kind?' '+b.kind:'');
        el.textContent=b.label;
        el.onclick=()=>close(typeof b.value==='function'?b.value(ta?ta.value:undefined):b.value);
        ft.appendChild(el);
      });
      function onKey(e){
        if(e.key==='Escape')close(buttons.find(b=>b.esc)?.value ?? null);
        if(e.key==='Enter'&&(!ta||e.ctrlKey||e.metaKey)){const d=buttons.find(b=>b.enter);if(d)close(typeof d.value==='function'?d.value(ta?ta.value:undefined):d.value);}
      }
      document.addEventListener('keydown',onKey);
      mask.addEventListener('mousedown',e=>{if(e.target===mask)close(buttons.find(b=>b.esc)?.value ?? null);});
      document.body.appendChild(mask);
      if(ta){ta.focus();ta.select&&ta.select();}else{const p=ft.querySelector('.primary')||ft.lastChild;p&&p.focus();}
    });
  }

  const UI={
    toast(msg,type){
      ensureStyle();
      let wrap=document.querySelector('.ui-toasts');
      if(!wrap){wrap=document.createElement('div');wrap.className='ui-toasts';document.body.appendChild(wrap);}
      const t=document.createElement('div');t.className='ui-toast'+(type?' '+type:'');t.textContent=msg;
      wrap.appendChild(t);
      setTimeout(()=>{t.style.transition='opacity .3s';t.style.opacity='0';setTimeout(()=>t.remove(),300);},type==='err'?4200:2600);
    },
    alert(msg,opt){opt=opt||{};return modal({title:opt.title||'提示',body:esc(msg),
      buttons:[{label:opt.okText||'知道了',kind:'primary',value:true,enter:true,esc:true}]});},
    confirm(msg,opt){opt=opt||{};return modal({title:opt.title||'确认',body:esc(msg),
      buttons:[{label:opt.cancelText||'取消',value:false,esc:true},
               {label:opt.okText||'确定',kind:opt.danger?'danger':'primary',value:true,enter:true}]});},
    prompt(msg,opt){opt=opt||{};return modal({title:opt.title||'请输入',body:esc(msg),
      input:{placeholder:opt.placeholder,value:opt.value},
      buttons:[{label:'取消',value:null,esc:true},
               {label:opt.okText||'确定',kind:'primary',enter:true,value:v=>(v==null?null:v.trim())}]});},
  };
  window.UI=UI;
})();
