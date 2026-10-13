(function(){
const $=id=>document.getElementById(id),esc=s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const DEMO=new URLSearchParams(location.search).has('demo');let D=[],F='all',timers={};
const money=n=>'$'+Math.round(n).toLocaleString();
function api(body){if(DEMO)return Promise.resolve(demo(body));
 return fetch(window.DONORS_API,{method:'POST',headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify(Object.assign({passcode:sessionStorage.donorPass||''},body)),cache:'no-store'}).then(r=>r.json())}
function demo(b){if(!window._demo){const f=['Sample Donor A','Test Family B','Example Co C','Demo Person D','Fake Donor E','Sample Store F','Test Donor G','Example H'];
 window._demo=f.map((n,i)=>({num:i+1,name:n,pledged:[1000,2500,5000,750,10000,3000,1500,500][i],paid:i%3==0,paidDate:i%3==0?'2026-10-10':'',comments:i==1?'Will pay in Nov':''}))}
 const x=window._demo.find(d=>d.num==b.num);if(b.action=='paid'&&x){x.paid=b.paid;x.paidDate=b.paid?'2026-10-13':''}if(b.action=='comment'&&x)x.comments=b.comments;return{donors:window._demo}}
function lock(msg){sessionStorage.removeItem('donorPass');$('dLocked').style.display='block';$('dOpen').style.display='none';$('dMsg').textContent=msg||''}
function show(r){if(r.error){lock(r.error=='wrong passcode'?'That passcode did not work.':'Error: '+r.error);return}D=r.donors;$('dLocked').style.display='none';$('dOpen').style.display='block';draw()}
function draw(){const t=D.reduce((a,d)=>{a.p+=d.pledged;if(d.paid){a.pd+=d.pledged;a.c++}return a},{p:0,pd:0,c:0});
 $('dTot').innerHTML=`<div><b>${money(t.p)}</b><span>Pledged</span></div><div><b>${money(t.pd)}</b><span>Paid</span></div><div><b>${money(t.p-t.pd)}</b><span>Outstanding</span></div><div><b>${t.c} of ${D.length}</b><span>Donors paid</span></div>`;
 const q=$('dQ').value.toLowerCase();
 $('dList').innerHTML=D.filter(d=>(F=='all'||(F=='paid')==d.paid)&&(!q||d.name.toLowerCase().includes(q)||String(d.num)==q)).map(d=>`<div class="drow"><div class="dn">#${d.num}</div><div class="dm"><b>${esc(d.name)}</b><span class="muted">${money(d.pledged)}${d.paid&&d.paidDate?' · paid '+esc(d.paidDate):''}</span>
 <textarea data-n="${d.num}" placeholder="Comments (saves automatically)">${esc(d.comments)}</textarea><small class="muted" id="s${d.num}"></small></div>
 <button class="tog ${d.paid?'on':''}" data-n="${d.num}">${d.paid?'✓ Paid':'Not paid'}</button></div>`).join('')||'<p class="muted">No donors match.</p>'}
document.addEventListener('DOMContentLoaded',()=>{if(!$('donors'))return;
 if(!window.DONORS_API&&!DEMO){$('dMsg').textContent='Not connected yet: the private donor service still needs to be set up.'}
 $('dGo').onclick=()=>{sessionStorage.donorPass=$('dPass').value;$('dPass').value='';$('dMsg').textContent='Checking…';api({action:'list'}).then(show).catch(()=>lock('Could not reach the donor service.'))};
 $('dPass').onkeydown=e=>{if(e.key=='Enter')$('dGo').click()};
 $('dLock').onclick=()=>{D=[];$('dList').innerHTML='';lock('Locked.')};
 $('dQ').oninput=draw;document.querySelectorAll('.dF').forEach(b=>b.onclick=()=>{F=b.dataset.f;document.querySelectorAll('.dF').forEach(x=>x.classList.toggle('p',x==b));draw()});
 $('dList').addEventListener('click',e=>{const b=e.target.closest('.tog');if(!b)return;const d=D.find(x=>x.num==b.dataset.n);b.disabled=true;
  api({action:'paid',num:d.num,paid:!d.paid}).then(r=>{if(r.error)return lock(r.error);D=r.donors;draw()})});
 $('dList').addEventListener('input',e=>{if(e.target.tagName!='TEXTAREA')return;const n=e.target.dataset.n,v=e.target.value;$('s'+n).textContent='Saving…';clearTimeout(timers[n]);
  timers[n]=setTimeout(()=>api({action:'comment',num:+n,comments:v}).then(r=>{if(r.error)return lock(r.error);const d=D.find(x=>x.num==n);d.comments=v;$('s'+n).textContent='Saved ✓'}),900)});
 if(sessionStorage.donorPass||DEMO)api({action:'list'}).then(show).catch(()=>lock())});
})();
