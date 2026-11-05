const CFG=window.LANCHONETE_CFG||{}; // valores em config.js
const COLS=[["fundo", "#0d0b0a", null], ["c_nome", "#ffb020", "cor2"], ["c_titulo", "#f7f3ef", null], ["c_sub", "#a39a93", null], ["c_cats_bg", "#ff5a1f", "cor1"], ["c_cats_tx", "#ffffff", null], ["c_cat_bg", "#1c1816", null], ["c_cat_tx", "#a39a93", null], ["c_cat_bd", "#2e2926", null], ["c_card_bg", "#161211", null], ["c_card_bd", "#2e2926", null], ["c_card_hv", "#ff5a1f", "cor1"], ["c_img_bg", "#3a2214", null], ["c_pnome", "#f7f3ef", null], ["c_pdesc", "#a39a93", null], ["c_preco", "#ffb020", "cor2"], ["c_add_bg", "#ff5a1f", "cor1"], ["c_add_tx", "#ffffff", null], ["c_qty_bg", "#ff5a1f", "cor1"], ["c_qty_tx", "#ffffff", null], ["c_qty_n", "#f7f3ef", null], ["c_fab_bg", "#ff5a1f", "cor1"], ["c_fab_tx", "#ffffff", null], ["c_modal_bg", "#15110f", null], ["c_modal_tx", "#f7f3ef", null], ["c_send_bg", "#ff5a1f", "cor1"], ["c_send_tx", "#ffffff", null], ["c_ok_bg", "#ff5a1f", "cor1"], ["c_ok_tx", "#ffffff", null], ["c_rec_bd", "#ff5a1f", "cor1"], ["c_rec_hb", "#ffffff", null], ["c_rec_ht", "#111111", null], ["c_rec_ckb", "#ff5a1f", "cor1"], ["c_rec_ckt", "#ffffff", null], ["c_rec_bg", "#ffffff", null], ["c_rec_tx", "#222222", null], ["c_rec_tt", "#111111", null], ["c_rec_pb", "#ff5a1f", "cor1"], ["c_rec_pt", "#ffffff", null], ["c_rec_ft", "#555555", null]]; // [chave, padrão, chave antiga]
const sb=(CFG.SUPABASE_URL&&CFG.SUPABASE_ANON_KEY&&window.supabase)?supabase.createClient(CFG.SUPABASE_URL,CFG.SUPABASE_ANON_KEY):null;
const $=s=>document.querySelector(s),brl=n=>Number(n||0).toLocaleString('pt-BR',{style:'currency',currency:'BRL'});
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let S={nome:'Lanchonete',logo:'🍔',logo_img:'',fundo_img:'',fundo_t:'50',titulo:'Cardápio',subtitulo:'',btn:'Enviar pedido',msg_ok:'Pedido enviado!'},cats=[],P=[],cat='all',cart={};
let menuChannel=null,menuRefreshTimer=0,menuFallbackTimer=0,menuRefreshRunning=false,menuRefreshQueued=false;

function theme(){
  const r=document.documentElement.style;
  COLS.forEach(([k,d,l])=>r.setProperty('--'+k,S[k]||(l&&S[l])||d));
  $('#lg').innerHTML=S.logo_img?`<img src="${esc(S.logo_img)}" alt="${esc(S.nome)}" class="logo-image">`:esc(S.logo);
  const bg=$('#bg');bg.style.backgroundImage=S.fundo_img?`url("${S.fundo_img}")`:'none';bg.style.opacity=1-(Number(S.fundo_t)||0)/100;
  $('#nm').textContent=S.nome;$('#ti').textContent=S.titulo;$('#su').textContent=S.subtitulo;document.title=S.nome+' · Cardápio';
}
async function init(){
  theme();
  if(!sb){$('#grid').innerHTML='<p class="em">Cardápio ainda não configurado: preencha SUPABASE_URL e SUPABASE_ANON_KEY no arquivo config.js.</p>';return}
  await refreshMenu();
  subscribeMenu();
}
async function refreshMenu(){
  let s,c,p;
  try{
    [s,c,p]=await Promise.all([sb.from('settings').select('*'),sb.from('categories').select('*').order('name'),sb.from('products').select('*').eq('active',true).order('name')]);
  }catch(e){$('#grid').innerHTML=`<p class="em">Falha ao conectar ao Supabase: ${esc(e?.message||String(e))}</p>`;return false}
  const er=[s,c,p].find(r=>r.error);
  if(er){$('#grid').innerHTML=`<p class="em">Erro ao carregar dados do Supabase: ${esc(er.error.message)}</p>`;return false}
  (s.data||[]).forEach(r=>S[r.key]=r.value);
  cats=c.data||[];P=p.data||[];
  for(const id of Object.keys(cart))if(!P.some(product=>product.id==id))delete cart[id];
  if(cat!=='all'&&!cats.some(category=>category.id==cat))cat='all';
  theme();render();return true;
}
function scheduleMenuRefresh(){
  clearTimeout(menuRefreshTimer);
  menuRefreshTimer=setTimeout(async()=>{
    if(menuRefreshRunning){menuRefreshQueued=true;return}
    menuRefreshRunning=true;
    do{menuRefreshQueued=false;await refreshMenu()}while(menuRefreshQueued);
    menuRefreshRunning=false;
  },120);
}
function subscribeMenu(){
  menuChannel=sb.channel('menu-live-updates')
    .on('postgres_changes',{event:'*',schema:'public',table:'products'},scheduleMenuRefresh)
    .on('postgres_changes',{event:'*',schema:'public',table:'categories'},scheduleMenuRefresh)
    .on('postgres_changes',{event:'*',schema:'public',table:'settings'},scheduleMenuRefresh)
    .subscribe(status=>{
      if(status==='SUBSCRIBED'){
        clearInterval(menuFallbackTimer);menuFallbackTimer=0;
        scheduleMenuRefresh();
      }else if(!menuFallbackTimer){
        menuFallbackTimer=setInterval(scheduleMenuRefresh,15000);
      }
    });
}
function render(){
  $('#chips').innerHTML=[{id:'all',name:'Todos'},...cats.filter(c=>P.some(p=>p.category_id==c.id))].map(c=>`<button class="chip ${c.id==cat?'on':''}" data-c="${c.id}">${esc(c.name)}</button>`).join('');
  const l=P.filter(p=>cat==='all'||p.category_id==cat);
  $('#grid').innerHTML=l.length?l.map(p=>{const q=cart[p.id]||0;return`<div class="pc"><div class="im">${p.image_url?`<img src="${esc(p.image_url)}" alt="" loading="lazy">`:'🍽️'}</div><div class="bd"><h3>${esc(p.name)}</h3><p>${esc(p.description||'')}</p><div class="pr"><b>${brl(p.price)}</b>${q?`<div class="st"><button data-m="${p.id}">−</button><b>${q}</b><button data-p="${p.id}">+</button></div>`:`<button class="add" data-p="${p.id}">Adicionar</button>`}</div></div></div>`}).join(''):'<p class="em">Nenhum item nesta categoria ainda.</p>';
  const n=Object.values(cart).reduce((a,b)=>a+b,0),t=total();$('#fab').classList.toggle('on',n>0);$('#fab').textContent=`🛒 Ver pedido · ${n} ${n>1?'itens':'item'} · ${brl(t)}`;
}
const total=()=>Object.entries(cart).reduce((s,[id,q])=>s+Number(P.find(p=>p.id==id).price)*q,0);
const chg=(id,d)=>{cart[id]=(cart[id]||0)+d;if(cart[id]<=0)delete cart[id];render()};
document.addEventListener('click',e=>{
  const t=e.target.dataset;
  if(t.c){cat=t.c;render()}if(t.p)chg(t.p,1);if(t.m)chg(t.m,-1);
  if(e.target.id==='ov'||t.x!==undefined)$('#ov').classList.remove('on');
  if(e.target.id==='fab')openCart();
  if(t.send!==undefined)send(e.target);
});
function openCart(){
  const es=Object.entries(cart);
  $('#mb').innerHTML=`<h3>Seu pedido</h3>${es.map(([id,q])=>{const p=P.find(x=>x.id==id);return`<div class="it"><span>${q}× ${esc(p.name)}</span><b>${brl(p.price*q)}</b></div>`}).join('')}<div class="tot"><span>Total</span><span>${brl(total())}</span></div>
  <input class="in" id="cn" placeholder="Seu nome" maxlength="60" autocomplete="name"><input class="in" id="cm" placeholder="Mesa ou observação (opcional)" maxlength="120">
  <button class="go" data-send>${esc(S.btn)}</button><button class="lk" data-x>Continuar escolhendo</button>`;
  $('#ov').classList.add('on');
}
async function send(b){
  const name=$('#cn').value.trim();if(!name){$('#cn').focus();$('#cn').style.borderColor='#ff5d6c';return}
  b.disabled=true;b.textContent='Enviando...';
  try{
    const r=await sb.from('orders').insert({customer:name,table_no:$('#cm').value.trim()||null,status:'pendente',items:Object.entries(cart).map(([id,q])=>({id:+id,qty:q}))});
    if(r.error)throw r.error;
  }catch(e){b.disabled=false;b.textContent=S.btn;return alert(`Não foi possível enviar o pedido: ${e?.message||String(e)}`)}
  cart={};render();
  $('#mb').innerHTML=`<div class="ok"><div>✓</div><p>${esc(S.msg_ok)}</p></div><button class="go" data-x>Fechar</button>`;
}
document.addEventListener('visibilitychange',()=>{if(!document.hidden)scheduleMenuRefresh()});
init();
