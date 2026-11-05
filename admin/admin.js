const CFG=window.LANCHONETE_CFG||{};CFG.BUCKET=CFG.BUCKET||'produtos'; // valores em config.js
const authTimeoutFetch=async(input,init={})=>{
  const url=typeof input==='string'?input:input?.url||'';
  if(!url.includes('/auth/v1/'))return fetch(input,init);
  const controller=new AbortController(),sourceSignal=init.signal||input?.signal;
  const abort=()=>controller.abort(sourceSignal?.reason);
  if(sourceSignal?.aborted)abort();
  else sourceSignal?.addEventListener('abort',abort,{once:true});
  const timeout=setTimeout(()=>controller.abort(new DOMException('Tempo limite de autenticação excedido','TimeoutError')),20000);
  try{return await fetch(input,{...init,signal:controller.signal})}
  finally{clearTimeout(timeout);sourceSignal?.removeEventListener('abort',abort)}
};
const sb=(CFG.SUPABASE_URL&&CFG.SUPABASE_ANON_KEY&&window.supabase)?supabase.createClient(CFG.SUPABASE_URL,CFG.SUPABASE_ANON_KEY,{global:{fetch:authTimeoutFetch}}):null;
const authRedirectUrl=()=>/^https?:$/.test(location.protocol)?new URL('./admin.html',location.href).href:null;
const $=s=>document.querySelector(s),brl=n=>Number(n||0).toLocaleString('pt-BR',{style:'currency',currency:'BRL'});
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const toast=t=>{const e=$('#toast');e.textContent=t;e.classList.add('on');setTimeout(()=>e.classList.remove('on'),2600)};
const sum=(a,k)=>a.reduce((s,x)=>s+Number(x[k]||0),0),ym=d=>{d=new Date(d);return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')},dateKey=v=>{if(/^\d{4}-\d{2}-\d{2}$/.test(v))return v;const d=new Date(v);return Number.isNaN(d.getTime())?'':`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`},todayKey=()=>dateKey(new Date());
const DEF={nome:'Minha Lanchonete',logo:'🍔',logo_img:'',fundo_img:'',fundo_t:'50',titulo:'Fome de quê?',subtitulo:'Escolha seus itens e envie o pedido direto para a cozinha.',btn:'Enviar pedido',msg_ok:'Pedido enviado! Já estamos preparando. 🍔',titulo_recibo:'Pedido fechado',msg_recibo:'Obrigado pela preferência! Volte sempre.',cor1:'#ff5a1f',cor2:'#ffb020',fundo:'#0d0b0a'};
const FT=[['nome','Nome da lanchonete'],['titulo','Título da página inicial'],['subtitulo','Subtítulo'],['btn','Texto do botão de enviar pedido'],['msg_ok','Mensagem após enviar pedido'],['titulo_recibo','Título do recibo (pedido fechado)'],['msg_recibo','Mensagem do recibo']],FC=[['cor1','Cor principal'],['cor2','Cor de destaque'],['fundo','Cor de fundo da loja']];
const COLS=[["Loja", "fundo", "Fundo da página", "#0d0b0a", null], ["Loja", "c_nome", "Nome da lanchonete (acima do título)", "#ffb020", "cor2"], ["Loja", "c_titulo", "Título principal", "#f7f3ef", null], ["Loja", "c_sub", "Subtítulo", "#a39a93", null], ["Categorias", "c_cats_bg", "Botão selecionado – fundo", "#ff5a1f", "cor1"], ["Categorias", "c_cats_tx", "Botão selecionado – texto", "#ffffff", null], ["Categorias", "c_cat_bg", "Botão não selecionado – fundo", "#1c1816", null], ["Categorias", "c_cat_tx", "Botão não selecionado – texto", "#a39a93", null], ["Categorias", "c_cat_bd", "Botão não selecionado – borda", "#2e2926", null], ["Produtos", "c_card_bg", "Fundo do card", "#161211", null], ["Produtos", "c_card_bd", "Borda do card", "#2e2926", null], ["Produtos", "c_card_hv", "Borda ao passar o mouse", "#ff5a1f", "cor1"], ["Produtos", "c_img_bg", "Fundo da foto (produto sem foto)", "#3a2214", null], ["Produtos", "c_pnome", "Nome do produto", "#f7f3ef", null], ["Produtos", "c_pdesc", "Descrição do produto", "#a39a93", null], ["Produtos", "c_preco", "Valor (preço)", "#ffb020", "cor2"], ["Botão adicionar", "c_add_bg", "Botão \"Adicionar\" – fundo", "#ff5a1f", "cor1"], ["Botão adicionar", "c_add_tx", "Botão \"Adicionar\" – texto", "#ffffff", null], ["Botão adicionar", "c_qty_bg", "Botões + e − – fundo", "#ff5a1f", "cor1"], ["Botão adicionar", "c_qty_tx", "Botões + e − – símbolo", "#ffffff", null], ["Botão adicionar", "c_qty_n", "Número da quantidade", "#f7f3ef", null], ["Pedido", "c_fab_bg", "Botão \"Ver pedido\" – fundo", "#ff5a1f", "cor1"], ["Pedido", "c_fab_tx", "Botão \"Ver pedido\" – texto", "#ffffff", null], ["Pedido", "c_modal_bg", "Janela do pedido – fundo", "#15110f", null], ["Pedido", "c_modal_tx", "Janela do pedido – texto", "#f7f3ef", null], ["Pedido", "c_send_bg", "Botão enviar pedido – fundo", "#ff5a1f", "cor1"], ["Pedido", "c_send_tx", "Botão enviar pedido – texto", "#ffffff", null], ["Pedido", "c_ok_bg", "Mensagem de sucesso – círculo", "#ff5a1f", "cor1"], ["Pedido", "c_ok_tx", "Mensagem de sucesso – símbolo", "#ffffff", null], ["Recibo", "c_rec_bd", "Borda", "#ff5a1f", "cor1"], ["Recibo", "c_rec_hb", "Cabeçalho – fundo", "#ffffff", null], ["Recibo", "c_rec_ht", "Cabeçalho – texto", "#111111", null], ["Recibo", "c_rec_ckb", "Círculo do check – fundo", "#ff5a1f", "cor1"], ["Recibo", "c_rec_ckt", "Círculo do check – símbolo", "#ffffff", null], ["Recibo", "c_rec_bg", "Corpo – fundo", "#ffffff", null], ["Recibo", "c_rec_tx", "Corpo – texto (itens)", "#222222", null], ["Recibo", "c_rec_tt", "Total", "#111111", null], ["Recibo", "c_rec_pb", "Forma de pagamento – fundo", "#ff5a1f", "cor1"], ["Recibo", "c_rec_pt", "Forma de pagamento – texto", "#ffffff", null], ["Recibo", "c_rec_ft", "Mensagem final e data", "#555555", null]];
const EX=['logo_img','fundo_img','fundo_t'],KEYS=()=>[...new Set([...FT.map(([k])=>k),'cor1','cor2','fundo',...EX,'logo',...COLS.map(c=>c[1])])];
const cvS=(s,k)=>{const c=COLS.find(x=>x[1]===k);return s[k]||(c[4]&&s[c[4]])||c[3]};
const logoH=(s,h)=>s.logo_img?`<img src="${esc(s.logo_img)}" alt="" style="height:${h}px;max-width:100%;object-fit:contain;border-radius:${Math.round(h/5)}px">`:esc(s.logo);
const PAY=['Dinheiro','Pix','Cartão de crédito','Cartão de débito'];
let cats=[],prods=[],orders=[],exps=[],accessRequests=[],adminProfiles=[],accountUser=null,accountAvatarPath='',accountAvatarExpiresAt=0,set={...DEF},mon=ym(new Date()),selectedDay=todayKey(),of='pendente',lastP=null;
let adminRealtimeChannel=null,adminRefreshTimer=0,adminFallbackTimer=0,adminRefreshRunning=false,adminRefreshQueued=false;
const adminAvatarUrlCache=new Map();

const accountStatus=text=>{$('#account-status').textContent=text};
const supabaseErrorMessage=(error,operation)=>{
  const message=error?.message||String(error),status=Number(error?.status||error?.context?.status||0),prefix=operation?`${operation}: `:'';
  if(status===504||/\b504\b|gateway timeout/i.test(message))
    return `${prefix}o Supabase respondeu HTTP 504 (tempo esgotado). Confira o status do projeto e tente novamente. Se era um cadastro, verifique Authentication > Users antes de reenviar.`;
  if(error?.name==='TimeoutError'||error?.name==='AbortError'||/timed?\s*out|timeout|aborted/i.test(message))
    return `${prefix}a conexão com o Supabase excedeu 30 segundos. Confira sua conexão e o status do projeto antes de tentar novamente.`;
  return `${prefix}${message}`;
};
const authErrorMessage=(error,operation)=>{
  const message=error?.message||String(error),status=Number(error?.status||error?.context?.status||0);
  if(/invalid login credentials/i.test(message))
    return `${operation}: e-mail ou senha incorretos. Se ainda não confirmou o e-mail, use "Reenviar confirmação"; se esqueceu a senha, use "Esqueci a senha".`;
  if(/email not confirmed/i.test(message))
    return `${operation}: confirme seu e-mail pelo link recebido ou use "Reenviar confirmação".`;
  if(/user already registered|already been registered/i.test(message))
    return 'Este e-mail já possui cadastro. Entre na conta ou solicite um link para redefinir a senha.';
  if(/error sending confirmation email|failed to send.*email|smtp|email provider/i.test(message))
    return `${operation}: o Supabase não conseguiu enviar o e-mail. A conta pode não ter sido criada. Confira Authentication → Logs e configure SMTP próprio em Project Settings → Authentication → SMTP Settings; depois tente novamente.`;
  if(status===429||/rate limit|too many requests/i.test(message))
    return `${operation}: o Supabase limitou temporariamente o envio. Aguarde alguns minutos antes de tentar novamente.`;
  return supabaseErrorMessage(error,operation);
};
const accountStorageError=error=>error?.message==='Bucket not found'
  ?'O bucket privado "admin-avatars" não existe neste projeto. No Supabase configurado em config.js, abra SQL Editor e execute novamente o arquivo setup.sql.'
  :error?.message||String(error);
function updateAccountAvatar(url=''){
  const initial=(accountUser?.user_metadata?.display_name||accountUser?.email||'?').trim().charAt(0).toUpperCase()||'?';
  for(const id of ['account-avatar-small','account-avatar-large']){
    const el=$('#'+id);el.replaceChildren();
    if(url){const img=document.createElement('img');img.alt='Foto de perfil';img.onerror=()=>{accountAvatarExpiresAt=0;updateAccountAvatar();accountStatus('A foto não pôde ser exibida. Confira o bucket privado admin-avatars no Supabase.')};img.src=url;el.append(img)}
    else el.textContent=initial;
  }
}
async function loadAccount(user){
  accountUser=user;
  const name=user.user_metadata?.display_name||user.email?.split('@')[0]||'Administrador';
  $('#account-name-input').value=name;
  $('#account-display-name').textContent=name;
  $('#account-email').textContent=user.email||'';
  accountAvatarPath=user.user_metadata?.avatar_path||'';
  accountAvatarExpiresAt=0;
  if(accountAvatarPath)await refreshAccountAvatar();
  else updateAccountAvatar();
}
async function refreshAccountAvatar(){
  if(!accountAvatarPath||accountAvatarExpiresAt>Date.now())return true;
  const {data,error}=await sb.storage.from('admin-avatars').createSignedUrl(accountAvatarPath,3600);
  if(error){updateAccountAvatar();accountStatus(`Não foi possível carregar a foto: ${accountStorageError(error)}`);return false}
  updateAccountAvatar(data.signedUrl);
  accountAvatarExpiresAt=Date.now()+55*60*1000;
  return true;
}
async function uploadAccountPhoto(file){
  if(!['image/jpeg','image/png','image/webp'].includes(file.type))return accountStatus('Escolha uma imagem PNG, JPG ou WebP.');
  if(file.size>3*1024*1024)return accountStatus('A imagem deve ter no máximo 3 MB.');
  if(!accountUser?.id)return accountStatus('Não foi possível identificar a conta conectada. Saia e entre novamente.');
  const button=$('#account-photo-select');button.disabled=true;button.textContent='Enviando foto...';button.setAttribute('aria-busy','true');
  const ext={'image/jpeg':'jpg','image/png':'png','image/webp':'webp'}[file.type],path=`${accountUser.id}/${Date.now()}.${ext}`;
  try{
    const uploaded=await sb.storage.from('admin-avatars').upload(path,file,{contentType:file.type,upsert:false});
    if(uploaded.error)throw uploaded.error;
    const oldPath=accountAvatarPath;
    const updated=await sb.auth.updateUser({data:{avatar_path:path}});
    if(updated.error){
      const cleanup=await sb.storage.from('admin-avatars').remove([path]);
      throw new Error(cleanup.error?`${updated.error.message}. Falha ao remover o arquivo novo: ${cleanup.error.message}`:updated.error.message);
    }
    if(!updated.data.user)throw new Error('O Supabase não retornou os dados atualizados da conta.');
    accountUser=updated.data.user;
    accountAvatarPath=path;
    accountAvatarExpiresAt=0;
    const avatarLoaded=await refreshAccountAvatar();
    if(oldPath&&oldPath!==path){
      const removed=await sb.storage.from('admin-avatars').remove([oldPath]);
      if(removed.error){accountStatus(`Foto salva, mas não foi possível remover a anterior: ${removed.error.message}`);return}
    }
    if(avatarLoaded)accountStatus('Foto de perfil atualizada.');
  }catch(error){accountStatus(`Não foi possível trocar a foto: ${accountStorageError(error)}`)}
  finally{button.disabled=false;button.textContent='📷 Alterar foto de perfil';button.removeAttribute('aria-busy')}
}
$('#account-photo-select').addEventListener('click',()=>{$('#account-photo-input').value='';$('#account-photo-input').click()});
$('#account-toggle').addEventListener('click',async()=>{
  const open=$('#account-popover').classList.toggle('hide')===false;
  $('#account-toggle').setAttribute('aria-expanded',String(open));
  if(open)await refreshAccountAvatar();
});
document.addEventListener('click',e=>{
  if(!e.target.closest('.account-area')){$('#account-popover').classList.add('hide');$('#account-toggle').setAttribute('aria-expanded','false')}
});
document.addEventListener('keydown',e=>{
  if(e.key==='Escape'){$('#account-popover').classList.add('hide');$('#account-toggle').setAttribute('aria-expanded','false')}
});
$('#account-profile-form').addEventListener('submit',async e=>{
  e.preventDefault();
  const button=$('#account-save'),name=$('#account-name-input').value.trim();
  if(!name)return accountStatus('Informe seu nome.');
  button.disabled=true;
  try{
    const {data,error}=await sb.auth.updateUser({data:{display_name:name}});
    if(error)throw error;
    await loadAccount(data.user);
    accountStatus('Nome atualizado.');
  }catch(error){accountStatus(error?.message||String(error))}
  finally{button.disabled=false}
});
$('#account-remove-photo').addEventListener('click',async()=>{
  if(!accountAvatarPath)return accountStatus('Sua conta não tem foto de perfil.');
  const path=accountAvatarPath,button=$('#account-remove-photo');button.disabled=true;
  try{
    const {data,error}=await sb.auth.updateUser({data:{avatar_path:null}});
    if(error)throw error;
    await loadAccount(data.user);
    const removed=await sb.storage.from('admin-avatars').remove([path]);
    if(removed.error)throw removed.error;
    accountStatus('Foto de perfil removida.');
  }catch(error){accountStatus(error?.message||String(error))}
  finally{button.disabled=false}
});
$('#account-password-toggle').addEventListener('click',()=>{
  const form=$('#account-password-form'),open=form.classList.toggle('hide')===false;
  $('#account-password-toggle').setAttribute('aria-expanded',String(open));
});
$('#account-password-form').addEventListener('submit',async e=>{
  e.preventDefault();
  const current=$('#account-current-password').value,next=$('#account-new-password').value;
  if(next!==$('#account-confirm-password').value)return accountStatus('As novas senhas não conferem.');
  if(next===current)return accountStatus('A nova senha precisa ser diferente da atual.');
  const button=$('#account-password-save');button.disabled=true;
  try{
    const reauth=await sb.auth.signInWithPassword({email:accountUser.email,password:current});
    if(reauth.error)throw new Error(`Não foi possível confirmar a senha atual: ${reauth.error.message}`);
    const {data,error}=await sb.auth.updateUser({password:next});
    if(error)throw error;
    await loadAccount(data.user);
    $('#account-password-form').reset();
    $('#account-password-form').classList.add('hide');
    $('#account-password-toggle').setAttribute('aria-expanded','false');
    accountStatus('Senha atualizada com sucesso.');
  }catch(error){accountStatus(error?.message||String(error))}
  finally{button.disabled=false}
});
$('#account-logout').addEventListener('click',async()=>{
  const button=$('#account-logout');button.disabled=true;
  try{
    const {error}=await sb.auth.signOut({scope:'local'});
    if(error)throw error;
    location.reload();
  }catch(error){accountStatus(`Não foi possível sair da conta: ${error?.message||String(error)}`);button.disabled=false}
});

const authMessage=text=>{const e=$('#auth-message');e.textContent=text;e.classList.remove('hide')};
$('#show-signup').addEventListener('click',()=>{$('#login-form').classList.add('hide');$('#signup-form').classList.remove('hide');$('#show-signup').classList.add('hide');$('#show-login').classList.remove('hide');$('#auth-message').classList.add('hide')});
$('#show-login').addEventListener('click',()=>{$('#signup-form').classList.add('hide');$('#login-form').classList.remove('hide');$('#show-login').classList.add('hide');$('#show-signup').classList.remove('hide');$('#auth-message').classList.add('hide')});

async function sendAuthEmail(type){
  if(!sb)return authMessage('Preencha SUPABASE_URL e SUPABASE_ANON_KEY no arquivo config.js.');
  const email=$('#login-form').classList.contains('hide')?$('#sM').value.trim():$('#lM').value.trim();
  if(!email){authMessage('Informe seu e-mail primeiro.');$('#login-form').classList.contains('hide')?$('#sM').focus():$('#lM').focus();return}
  const button=type==='signup'?$('#auth-resend'):$('#auth-reset');button.disabled=true;
  authMessage(type==='signup'?'Solicitando novo e-mail de confirmação...':'Enviando link para redefinir a senha...');
  try{
    const options={},redirectTo=authRedirectUrl();
    if(redirectTo)options.emailRedirectTo=redirectTo;
    const result=type==='signup'
      ?await sb.auth.resend({type:'signup',email,options})
      :await sb.auth.resetPasswordForEmail(email,options);
    if(result.error)throw result.error;
    authMessage(type==='signup'
      ?'Se o endereço estiver cadastrado e ainda precisar de confirmação, o Supabase enviará um novo link. Confira também spam/lixo eletrônico.'
      :'Se o endereço estiver cadastrado, o Supabase enviará um link para redefinir a senha. Confira também spam/lixo eletrônico.');
  }catch(error){authMessage(authErrorMessage(error,type==='signup'?'Não foi possível reenviar a confirmação':'Não foi possível solicitar a redefinição'))}
  finally{button.disabled=false}
}
$('#auth-resend').addEventListener('click',()=>sendAuthEmail('signup'));
$('#auth-reset').addEventListener('click',()=>sendAuthEmail('recovery'));

$('#login-form').addEventListener('submit',async e=>{
  e.preventDefault();
  if(!sb)return authMessage('Preencha SUPABASE_URL e SUPABASE_ANON_KEY no arquivo config.js.');
  const b=$('#login-submit');b.disabled=true;
  authMessage('Verificando acesso...');
  try{
    const r=await sb.auth.signInWithPassword({email:$('#lM').value.trim(),password:$('#lP').value});
    if(r.error){authMessage(authErrorMessage(r.error,'Não foi possível entrar'));return}
    await enter();
  }catch(error){authMessage(authErrorMessage(error,'Não foi possível entrar'))}
  finally{b.disabled=false}
});

$('#signup-form').addEventListener('submit',async e=>{
  e.preventDefault();
  if(!sb)return authMessage('Preencha SUPABASE_URL e SUPABASE_ANON_KEY no arquivo config.js.');
  const password=$('#sP').value,email=$('#sM').value.trim(),name=$('#sN').value.trim();
  if(password!==$('#sPC').value)return authMessage('As senhas não conferem.');
  if(!name)return authMessage('Informe seu nome.');
  const b=$('#signup-submit');b.disabled=true;
  authMessage('Enviando seu cadastro ao Supabase… aguarde a resposta antes de tentar novamente.');
  const progressTimer=setTimeout(()=>{
    authMessage('O Supabase ainda está processando o cadastro. A solicitação será interrompida em até 20 segundos; se houver erro de envio, confira a configuração SMTP do projeto.');
  },7000);
  try{
    const options={data:{request_admin_access:true,display_name:name}},redirectTo=authRedirectUrl();
    if(redirectTo)options.emailRedirectTo=redirectTo;
    const r=await sb.auth.signUp({email,password,options});
    if(r.error){authMessage(authErrorMessage(r.error,'Não foi possível criar a conta'));return}
    if(!r.data.user){
      authMessage('O Supabase não confirmou a criação da conta. Confira a conexão e tente entrar ou reenviar a confirmação antes de tentar novamente.');
      return;
    }
    if(r.data.user.identities?.length===0){
      authMessage('Este e-mail já está cadastrado. Volte para entrar; se necessário, solicite a redefinição da senha ou reenvie a confirmação.');
      return;
    }
    const confirmationRequired=!r.data.session;
    if(r.data.session){
      const signedOut=await sb.auth.signOut({scope:'local'});
      if(signedOut.error){authMessage(`Conta criada, mas não foi possível encerrar a sessão: ${supabaseErrorMessage(signedOut.error,'')}`);return}
    }
    $('#sP').value='';
    $('#sPC').value='';
    authMessage(confirmationRequired
      ?'Cadastro enviado para Acessos. O Supabase deve enviar um link de confirmação; confira spam/lixo eletrônico. Se não chegar, use "Reenviar confirmação".'
      :'Conta criada sem exigir confirmação por e-mail neste projeto. Se o endereço foi aprovado, o acesso Admin será aplicado; entre com o e-mail e a senha cadastrados.');
  }catch(error){authMessage(authErrorMessage(error,'Não foi possível criar a conta'))}
  finally{clearTimeout(progressTimer);b.disabled=false}
});

async function load(){
  try{
    const q=(t,o)=>sb.from(t).select('*').order(o,{ascending:t==='categories'||t==='products'});
    const [c,p,o,e,s]=await Promise.all([q('categories','name'),q('products','name'),sb.from('orders').select('*').order('created_at',{ascending:false}).limit(600),q('expenses','spent_at'),sb.from('settings').select('*')]);
    const er=[c,p,o,e,s].find(r=>r.error);if(er)throw er.error;
    cats=c.data;prods=p.data;orders=o.data;exps=e.data;set={...DEF};s.data.forEach(r=>set[r.key]=r.value);
    const np=orders.filter(x=>x.status==='pendente').length;if(lastP!==null&&np>lastP)toast('🔔 Novo pedido pendente!');lastP=np;
    render();
    return true;
  }catch(error){
    const message=supabaseErrorMessage(error,'Não foi possível carregar os dados do painel');
    $('#vD').innerHTML=`<div class="empty-note">${esc(message)}<div style="margin-top:12px"><button class="btn" data-a="retryLoad">Tentar novamente</button></div></div>`;
    return false;
  }
}
async function refreshAdminData(){
  const formState=[...document.querySelectorAll('main input[id],main textarea[id],main select[id]')]
    .map(element=>({id:element.id,value:element.value,checked:element.checked}));
  const refreshed=await load();
  if(refreshed)for(const state of formState){
    const element=document.getElementById(state.id);
    if(!element)continue;
    element.value=state.value;
    if('checked'in element)element.checked=state.checked;
  }
  if(document.querySelector('.tab.on')?.dataset.i==='A')await loadAccessRequests();
}
function scheduleAdminRefresh(){
  clearTimeout(adminRefreshTimer);
  adminRefreshTimer=setTimeout(async()=>{
    if(adminRefreshRunning){adminRefreshQueued=true;return}
    adminRefreshRunning=true;
    do{adminRefreshQueued=false;await refreshAdminData()}while(adminRefreshQueued);
    adminRefreshRunning=false;
  },120);
}
function subscribeAdminUpdates(){
  if(adminRealtimeChannel)return;
  const channel=sb.channel('admin-live-updates');
  for(const table of ['orders','products','categories','settings','expenses','admin_access_requests','admin_profiles']){
    channel.on('postgres_changes',{event:'*',schema:'public',table},scheduleAdminRefresh);
  }
  adminRealtimeChannel=channel.subscribe(status=>{
    if(status==='SUBSCRIBED'){
      clearInterval(adminFallbackTimer);adminFallbackTimer=0;
      scheduleAdminRefresh();
    }else if(!adminFallbackTimer){
      adminFallbackTimer=setInterval(scheduleAdminRefresh,20000);
    }
  });
}
const W=async p=>{const r=await p;if(r.error){toast(r.error.message);return false}return true};
const catN=id=>(cats.find(c=>c.id==id)||{}).name||'—';
const itemsOf=o=>o.status==='fechado'?o.items:(o.items||[]).map(i=>{const p=prods.find(x=>x.id==i.id);return{id:i.id,name:p?p.name:'Item removido',price:p?Number(p.price):0,qty:i.qty}});
const totOf=o=>itemsOf(o).reduce((s,i)=>s+i.price*i.qty,0);

/* ---------- renders ---------- */
function render(){rDash();rDay();rOrd();rProd();rCat();rSet();rCor();$('#hN').innerHTML=logoH(set,24)+'<span>'+esc(String(set.nome).toUpperCase())+'</span>';const n=orders.filter(x=>x.status==='pendente').length;$('#pc').textContent=n||'';}
async function loadAccessRequests(){
  try{
    const [requests,profiles]=await Promise.all([
      sb.from('admin_access_requests').select('user_id,email,created_at,status').order('created_at',{ascending:true}),
      sb.from('admin_profiles').select('user_id,email,display_name,avatar_path,created_at,email_confirmed_at').order('created_at',{ascending:false})
    ]);
    if(requests.error)throw requests.error;
    if(profiles.error)throw profiles.error;
    const allAccessRequests=requests.data||[];
    accessRequests=allAccessRequests.filter(request=>request.status==='pending');
    adminProfiles=await Promise.all((profiles.data||[]).map(async profile=>{
      if(!profile.avatar_path)return {...profile,avatar_url:'',avatar_error:''};
      const cached=adminAvatarUrlCache.get(profile.avatar_path);
      if(cached&&cached.expiresAt>Date.now())return {...profile,avatar_url:cached.url,avatar_error:''};
      const {data,error}=await sb.storage.from('admin-avatars').createSignedUrl(profile.avatar_path,3600);
      if(data?.signedUrl)adminAvatarUrlCache.set(profile.avatar_path,{url:data.signedUrl,expiresAt:Date.now()+55*60*1000});
      return {...profile,avatar_url:data?.signedUrl||'',avatar_error:error?.message||''};
    }));
    const pendingRows=accessRequests.length
      ?`<div class="tbl"><table><thead><tr><th>Perfil</th><th>Solicitado em</th><th></th></tr></thead><tbody>${accessRequests.map(request=>{
        const profile=adminProfiles.find(item=>item.user_id===request.user_id),email=request.email||profile?.email||'';
        return `<tr><td><div class="profile-cell">${profile?.avatar_url?`<img class="profile-avatar" src="${esc(profile.avatar_url)}" alt="">`:`<span class="profile-avatar">${esc((profile?.display_name||email||'?').charAt(0).toUpperCase())}</span>`}<div><b>${esc(profile?.display_name||'Nome não informado')}</b><small>${esc(email||'E-mail indisponível')}</small></div></div></td><td>${new Date(request.created_at).toLocaleString('pt-BR')}</td><td><div class="act"><button class="btn s" data-a="openApproveAccess" data-email="${esc(email)}">Aprovar</button><button class="btn r s" data-a="rejectAccess" data-i="${esc(request.user_id)}">Recusar</button></div></td></tr>`;
      }).join('')}</tbody></table></div>`
      :'<p class="empty-note">Nenhuma solicitação pendente.</p>';
    const profileRows=adminProfiles.length
      ?`<div class="tbl"><table><thead><tr><th>Perfil</th><th>Cadastro</th><th>E-mail</th><th>Confirmação</th><th>Acesso</th></tr></thead><tbody>${adminProfiles.map(profile=>{
        const email=profile.email||'',name=profile.display_name||email.split('@')[0]||'Nome não informado',request=allAccessRequests.find(item=>item.user_id===profile.user_id);
        const accessStatus=request?.status==='pending'?'Aguardando aprovação':request?.status==='approved'?'Aprovado':request?.status==='rejected'?'Recusado':'Sem solicitação';
        const action=request?.status==='pending'?`<button class="btn s" data-a="openApproveAccess" data-email="${esc(email)}">Aprovar acesso</button>`:`<span class="pill ${request?.status==='approved'?'on':''}">${accessStatus}</span>`;
        return `<tr><td><div class="profile-cell">${profile.avatar_url?`<img class="profile-avatar" src="${esc(profile.avatar_url)}" alt="Foto de ${esc(name)}">`:`<span class="profile-avatar">${esc(name.charAt(0).toUpperCase())}</span>`}<div><b>${esc(name)}</b>${profile.avatar_error?`<small class="profile-error">Foto indisponível: ${esc(profile.avatar_error)}</small>`:''}</div></div></td><td>${new Date(profile.created_at).toLocaleDateString('pt-BR')}</td><td>${esc(email||'—')}</td><td><span class="pill ${profile.email_confirmed_at?'on':''}">${profile.email_confirmed_at?'Confirmado':'Pendente'}</span></td><td>${action}</td></tr>`;
      }).join('')}</tbody></table></div>`
      :'<p class="empty-note">Nenhum perfil cadastrado.</p>';
    $('#vA').innerHTML=`<div class="access-header"><div><h2 style="margin-bottom:6px">Solicitações de acesso</h2><p class="m">Aprove solicitações ou autorize um e-mail diretamente.</p></div><button class="btn" data-a="openApproveAccess">Aprovar acesso admin</button></div>${pendingRows}<h2 style="margin:22px 0 10px">Todos os perfis (${adminProfiles.length})</h2>${profileRows}`;
  }catch(error){$('#vA').innerHTML=`<p class="m">Erro ao carregar solicitações e perfis: ${esc(error?.message||String(error))}. Execute admin-access-requests.sql atualizado no Supabase e confira as políticas do bucket admin-avatars.</p>`}
}
function rDash(){
  const cl=orders.filter(o=>o.status==='fechado'&&ym(o.closed_at)===mon),ex=exps.filter(e=>e.spent_at.slice(0,7)===mon);
  const ent=sum(cl,'total'),sai=sum(ex,'amount');
  const by=PAY.map(p=>[p,sum(cl.filter(o=>o.payment_method===p),'total')]);
  $('#vD').innerHTML=`<div class="bar"><label class="date-control month-control"><span>📅</span><input class="in" type="month" id="mon" value="${mon}" aria-label="Selecionar mês"></label><b class="section-title">Resumo do mês</b></div>
  <div class="grid"><div class="st"><span>Entradas (vendas)</span><b class="pos">${brl(ent)}</b></div><div class="st"><span>Saídas (gastos)</span><b class="neg">${brl(sai)}</b></div><div class="st"><span>Saldo do mês</span><b class="${ent-sai<0?'neg':'pos'}">${brl(ent-sai)}</b></div><div class="st"><span>Pedidos fechados</span><b>${cl.length}</b></div><div class="st"><span>Ticket médio</span><b>${brl(cl.length?ent/cl.length:0)}</b></div></div>
  <h4 style="margin-bottom:8px">Por forma de pagamento</h4><div class="grid">${by.map(([p,v])=>`<div class="st"><span>${p}</span><b>${brl(v)}</b></div>`).join('')}</div>
  <h4 style="margin:6px 0 8px">Saídas / gastos</h4><div class="bar"><input class="in" id="eD" placeholder="Descrição (ex: gás, carne, aluguel)"><input class="in" id="eV" type="number" step="0.01" min="0" placeholder="Valor" style="max-width:130px"><label class="date-control"><span>📅</span><input class="in" id="eT" type="date" aria-label="Data do gasto"></label><button class="btn" data-a="addExp">+ Adicionar</button></div>
  <div class="tbl"><table><tbody>${ex.length?ex.map(e=>`<tr><td>${e.spent_at.split('-').reverse().join('/')}</td><td>${esc(e.description)}</td><td class="neg">${brl(e.amount)}</td><td class="act"><button class="btn r s" data-a="delExp" data-i="${e.id}">Excluir</button></td></tr>`).join(''):'<tr><td style="color:var(--mu)">Nenhum gasto neste mês.</td></tr>'}</tbody></table></div>`;
  $('#eT').value=todayKey();
}
function rDay(){
  const cl=orders.filter(o=>o.status==='fechado'&&ym(o.closed_at)===mon),ex=exps.filter(e=>e.spent_at.slice(0,7)===mon);
  const dayOrders=cl.filter(o=>dateKey(o.closed_at)===selectedDay),dayExpenses=ex.filter(e=>e.spent_at===selectedDay),daySales=sum(dayOrders,'total'),daySpent=sum(dayExpenses,'amount');
  const [y,m]=mon.split('-').map(Number),nd=new Date(y,m,0).getDate(),offset=(new Date(y,m-1,1).getDay()+6)%7;
  const salesByDay=Array.from({length:nd},(_,i)=>cl.filter(o=>dateKey(o.closed_at)===`${mon}-${String(i+1).padStart(2,'0')}`));
  $('#vDay').innerHTML=`<div class="day-summary-head"><div><span class="eyebrow">RESUMO DIÁRIO</span><h2>${new Date(`${selectedDay}T12:00:00`).toLocaleDateString('pt-BR',{weekday:'long',day:'numeric',month:'long',year:'numeric'})}</h2></div><label class="date-control"><span>🗓️</span><input class="in" type="date" id="selected-day" value="${selectedDay}" aria-label="Selecionar dia"></label></div>
  <div class="grid day-stats"><div class="st"><span>Vendas do dia</span><b class="pos">${brl(daySales)}</b></div><div class="st"><span>Gastos do dia</span><b class="neg">${brl(daySpent)}</b></div><div class="st"><span>Saldo do dia</span><b class="${daySales-daySpent<0?'neg':'pos'}">${brl(daySales-daySpent)}</b></div><div class="st"><span>Pedidos fechados</span><b>${dayOrders.length}</b></div><div class="st"><span>Ticket médio</span><b>${brl(dayOrders.length?daySales/dayOrders.length:0)}</b></div></div>
  <div class="calendar-card"><div class="calendar-heading"><div><h4>Calendário de vendas</h4><p>Selecione um dia para ver o resumo</p></div><span class="calendar-legend"><i></i> Dia com vendas</span></div><div class="calendar-grid calendar-weekdays">${['Seg','Ter','Qua','Qui','Sex','Sáb','Dom'].map(d=>`<span>${d}</span>`).join('')}</div><div class="calendar-grid">${Array.from({length:offset},()=>'<span class="calendar-empty"></span>').join('')}${salesByDay.map((rows,i)=>{const day=String(i+1).padStart(2,'0'),key=`${mon}-${day}`,amount=sum(rows,'total');return`<button class="calendar-day ${key===selectedDay?'selected':''} ${rows.length?'has-sales':''}" data-a="selectDay" data-i="${key}" aria-label="${day}: ${brl(amount)}, ${rows.length} pedidos"><span>${i+1}</span><b>${amount?brl(amount):'—'}</b><small>${rows.length?`${rows.length} ${rows.length===1?'pedido':'pedidos'}`:' '}</small></button>`}).join('')}</div></div>
  <div class="day-orders"><h3>Pedidos do dia</h3>${dayOrders.length?`<div class="tbl"><table><thead><tr><th>Horário</th><th>Cliente</th><th>Pagamento</th><th>Valor</th></tr></thead><tbody>${dayOrders.map(o=>`<tr><td>${new Date(o.closed_at).toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'})}</td><td>${esc(o.customer)}</td><td>${esc(o.payment_method||'—')}</td><td><b>${brl(o.total)}</b></td></tr>`).join('')}</tbody></table></div>`:'<p class="empty-note">Nenhum pedido fechado neste dia.</p>'}</div>`;
}
function rOrd(){
  const l=orders.filter(o=>o.status===of);
  $('#vO').innerHTML=`<div class="bar"><button class="btn ${of==='pendente'?'':'g'}" data-a="flt" data-i="pendente">Pendentes</button><button class="btn ${of==='fechado'?'':'g'}" data-a="flt" data-i="fechado">Fechados</button><span style="flex:1"></span><button class="btn" data-a="cmd">+ Nova comanda</button></div>
  <div class="cards">${l.length?l.map(o=>{const it=itemsOf(o),t=o.status==='fechado'?o.total:totOf(o);return`<div class="cmd"><h4>${esc(o.customer)}</h4><small>${o.table_no?esc(o.table_no)+' · ':''}${new Date(o.status==='fechado'?o.closed_at:o.created_at).toLocaleString('pt-BR',{dateStyle:'short',timeStyle:'short'})}${o.status==='fechado'?' · '+esc(o.payment_method):''}</small>
  <ul>${it.map(i=>`<li>${i.qty}× ${esc(i.name)}</li>`).join('')||'<li>Sem itens</li>'}</ul>${o.notes?`<small>Obs: ${esc(o.notes)}</small>`:''}
  <div class="ft"><b style="font-size:18px">${brl(t)}</b><div class="act">${o.status==='pendente'?`<button class="btn g s" data-a="cmd" data-i="${o.id}">Editar</button><button class="btn s" data-a="close" data-i="${o.id}">Fechar</button>`:`<button class="btn g s" data-a="rcp" data-i="${o.id}">Recibo</button>`}<button class="btn r s" data-a="delOrd" data-i="${o.id}">✕</button></div></div></div>`}).join(''):'<p style="color:var(--mu)">Nenhum pedido aqui.</p>'}</div>`;
}
function rProd(){
  $('#vP').innerHTML=`<div class="bar"><input class="in" id="q" placeholder="Buscar produto..." value="${esc(window._q||'')}"><button class="btn" data-a="prod">+ Novo produto</button></div>
  <div class="tbl"><table><thead><tr><th></th><th>Produto</th><th>Categoria</th><th>Preço</th><th>Status</th><th></th></tr></thead><tbody>${prods.filter(p=>p.name.toLowerCase().includes((window._q||'').toLowerCase())).map(p=>`<tr><td>${p.image_url?`<img class="th" src="${esc(p.image_url)}" alt="">`:'<div class="th">🍽️</div>'}</td><td><b>${esc(p.name)}</b><br><small style="color:var(--mu)">${esc(p.description||'')}</small></td><td>${esc(catN(p.category_id))}</td><td>${brl(p.price)}</td><td><span class="pill ${p.active?'on':''}">${p.active?'Disponível':'Oculto'}</span></td><td><div class="act"><button class="btn g s" data-a="prod" data-i="${p.id}">Editar</button><button class="btn r s" data-a="delProd" data-i="${p.id}">Excluir</button></div></td></tr>`).join('')||'<tr><td colspan="6" style="color:var(--mu);text-align:center;padding:26px">Nenhum produto cadastrado.</td></tr>'}</tbody></table></div>`;
}
function rCat(){
  $('#vC').innerHTML=`<div class="bar"><input class="in" id="cn" placeholder="Nome da nova categoria (ex: Bebidas, Lanches)"><button class="btn" data-a="addCat">Adicionar</button></div><div class="tbl">${cats.map(c=>`<div class="cat"><span>${esc(c.name)} <small style="color:var(--mu)">(${prods.filter(p=>p.category_id==c.id).length})</small></span><div class="act"><button class="btn g s" data-a="renCat" data-i="${c.id}">Renomear</button><button class="btn r s" data-a="delCat" data-i="${c.id}">Excluir</button></div></div>`).join('')||'<div class="cat" style="color:var(--mu)">Nenhuma categoria.</div>'}</div>`;
}
const rcp=(o,s)=>{const it=itemsOf(o),v=k=>esc(cvS(s,k));return`<div class="rc" style="--bd:${v('c_rec_bd')};--hb:${v('c_rec_hb')};--ht:${v('c_rec_ht')};--ckb:${v('c_rec_ckb')};--ckt:${v('c_rec_ckt')};--bg:${v('c_rec_bg')};--tx:${v('c_rec_tx')};--tt:${v('c_rec_tt')};--pb:${v('c_rec_pb')};--pt:${v('c_rec_pt')};--ft:${v('c_rec_ft')}"><div class="rh"><div style="font-size:34px">${logoH(s,48)}</div><b style="font-size:19px">${esc(s.nome)}</b><small>${esc(s.titulo_recibo)}</small></div><div class="ck">✓</div><div class="rb"><div class="rw"><span>Cliente</span><b>${esc(o.customer)}</b></div>${o.table_no?`<div class="rw"><span>Mesa/obs</span><b>${esc(o.table_no)}</b></div>`:''}<hr>${it.map(i=>`<div class="rw"><span>${i.qty}× ${esc(i.name)}</span><span>${brl(i.price*i.qty)}</span></div>`).join('')}<div class="rw big"><span>Total</span><span>${brl(o.total)}</span></div><div class="rw"><span>Pagamento</span><span class="pm">${esc(o.payment_method)}</span></div></div><div class="rf">${esc(s.msg_recibo)}<br><small>${new Date(o.closed_at||Date.now()).toLocaleString('pt-BR',{dateStyle:'short',timeStyle:'short'})}</small></div></div>`};
const SAMPLE={customer:'João',table_no:'Mesa 4',items:[{id:0,name:'X-Burger',price:24,qty:2},{id:0,name:'Refrigerante',price:7,qty:2}],total:62,payment_method:'Pix',status:'fechado'};
const pvStore=()=>{const c=k=>esc(cvS(set,k));return`<div class="mini" style="background:${c('fundo')};display:block"><div class="mbg" style="background-image:${set.fundo_img?`url('${esc(set.fundo_img)}')`:'none'};opacity:${1-(+set.fundo_t||0)/100}"></div><div style="position:relative;text-align:center">
<div>${logoH(set,44)}</div><small style="color:${c('c_nome')};letter-spacing:.2em;font-weight:700">${esc(String(set.nome).toUpperCase())}</small><div style="font-size:24px;font-weight:800;color:${c('c_titulo')}">${esc(set.titulo)}</div><div style="font-size:12px;color:${c('c_sub')};margin-bottom:12px">${esc(set.subtitulo)}</div>
<div style="display:flex;gap:6px;justify-content:center;margin-bottom:12px"><span class="pp" style="background:${c('c_cats_bg')};color:${c('c_cats_tx')};border:1px solid ${c('c_cats_bg')}">Todos</span><span class="pp" style="background:${c('c_cat_bg')};color:${c('c_cat_tx')};border:1px solid ${c('c_cat_bd')}">Lanches</span><span class="pp" style="background:${c('c_cat_bg')};color:${c('c_cat_tx')};border:1px solid ${c('c_cat_bd')}">Bebidas</span></div>
<div style="max-width:220px;margin:auto;text-align:left;background:${c('c_card_bg')};border:1px solid ${c('c_card_bd')};border-radius:16px;overflow:hidden"><div style="height:70px;background:${c('c_img_bg')};display:grid;place-items:center;font-size:30px">🍔</div><div style="padding:12px"><b style="color:${c('c_pnome')}">X-Burger</b><div style="font-size:12px;color:${c('c_pdesc')}">Pão, carne e queijo</div><div style="display:flex;justify-content:space-between;align-items:center;margin-top:8px"><b style="color:${c('c_preco')};font-size:16px">R$ 24,00</b><span class="pp" style="background:${c('c_add_bg')};color:${c('c_add_tx')}">Adicionar</span></div></div></div>
<div style="display:flex;gap:8px;justify-content:center;align-items:center;margin-top:12px;flex-wrap:wrap"><span style="display:inline-flex;align-items:center;gap:8px;background:#ffffff14;border-radius:99px;padding:3px"><span class="pp" style="background:${c('c_qty_bg')};color:${c('c_qty_tx')};padding:4px 10px">−</span><b style="color:${c('c_qty_n')}">2</b><span class="pp" style="background:${c('c_qty_bg')};color:${c('c_qty_tx')};padding:4px 10px">+</span></span><span class="pp" style="background:${c('c_fab_bg')};color:${c('c_fab_tx')}">🛒 Ver pedido</span></div>
<div style="max-width:240px;margin:12px auto 0;background:${c('c_modal_bg')};color:${c('c_modal_tx')};border:1px solid #ffffff1a;border-radius:14px;padding:12px;text-align:left;font-size:13px"><b>Seu pedido</b><div style="display:flex;justify-content:space-between;margin:6px 0"><span>2× X-Burger</span><b>R$ 48,00</b></div><div style="text-align:center"><span class="pp" style="background:${c('c_send_bg')};color:${c('c_send_tx')};display:block">${esc(set.btn)}</span></div><div style="text-align:center;margin-top:8px"><span style="display:inline-grid;place-items:center;width:34px;height:34px;border-radius:50%;background:${c('c_ok_bg')};color:${c('c_ok_tx')};font-weight:800">✓</span></div></div>
</div></div>`};
const prev=()=>`<h4 style="margin-bottom:10px">Pré-visualização da loja</h4>${pvStore()}<h4 style="margin:18px 0 10px">Pré-visualização do recibo</h4>${rcp({...SAMPLE,closed_at:Date.now()},set)}`;
let cg='Loja';const GROUPS=[...new Set(COLS.map(c=>c[0]))];
const pvK=()=>pvStore()+'<h4 style="margin:18px 0 10px">Recibo</h4>'+rcp({...SAMPLE,closed_at:Date.now()},set);
function rCor(){
  $('#vK').innerHTML=`<div class="kgrid"><div><div class="bar" style="gap:6px">${GROUPS.map(g=>`<button class="chipk ${g===cg?'on':''}" data-a="grp" data-i="${g}">${g}</button>`).join('')}</div>
  <div class="tbl" style="padding:4px 16px">${COLS.filter(c=>c[0]===cg).map(([g,k,l])=>{const v=cvS(set,k);return`<div class="cr"><span>${l}</span><input type="color" class="sf2" data-k="${k}" value="${v}"><input class="hex sf2" data-k="${k}" value="${v}" maxlength="7"><button class="btn g s" data-a="colRes" data-i="${k}" title="Voltar ao padrão">↺</button></div>`}).join('')}</div>
  <div class="bar"><button class="btn" data-a="saveSet">Salvar cores</button><button class="btn g" data-a="colResAll">Restaurar todas as cores</button></div></div><div id="pvk">${pvK()}</div></div>`;
}
function rSet(){
  const f=document.activeElement&&document.activeElement.id;
  $('#vS').innerHTML=`<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:22px"><div><h4 style="margin-bottom:12px">Textos, imagens e cores (loja e recibo)</h4>${FT.map(([k,l])=>`<label>${l}</label><input class="in sf" id="s_${k}" value="${esc(set[k])}">`).join('')}
  <label>Logo</label><div class="ib"><div class="ibp">${logoH(set,44)}</div><button class="btn g s" data-a="pick" data-i="fL">Alterar logo</button><button class="btn g s" data-a="logoRes">Restaurar logo original</button><input type="file" id="fL" accept="image/*" class="hide"></div>
  <label>Imagem de fundo da loja</label><div class="ib"><div class="ibp">${set.fundo_img?`<img src="${esc(set.fundo_img)}" alt="">`:'—'}</div><button class="btn g s" data-a="pick" data-i="fB">Alterar imagem de fundo</button><button class="btn g s" data-a="bgRes">Restaurar imagem de fundo</button><input type="file" id="fB" accept="image/*" class="hide"></div>
  <label>Transparência da imagem de fundo: <b id="ftv" style="color:var(--tx)">${esc(set.fundo_t)}%</b></label><input type="range" id="s_fundo_t" class="sf" min="0" max="95" value="${esc(set.fundo_t)}" style="width:100%;margin-bottom:14px;accent-color:var(--ac)">
  <button class="btn" data-a="saveSet" style="width:100%;padding:13px">Salvar personalização</button>
  <h4 style="margin:28px 0 6px">Backup</h4><p class="m" style="margin-bottom:10px">Guarda produtos, categorias e configurações em um arquivo.</p><div class="ib"><button class="btn g" data-a="bkSave">Salvar backup</button><button class="btn g" data-a="pick" data-i="fR">Restaurar backup</button><input type="file" id="fR" accept=".json,application/json" class="hide"></div></div>
  <div id="pv">${prev()}</div></div>`;
  if(f&&$('#'+f)&&f.startsWith('s_'))$('#'+f).focus();
}
document.addEventListener('input',e=>{
  if(e.target.id==='mon'){mon=e.target.value||mon;if(!selectedDay.startsWith(mon))selectedDay=mon===ym(new Date())?todayKey():`${mon}-01`;rDash();rDay()}
  if(e.target.id==='selected-day'&&e.target.value){selectedDay=e.target.value;mon=selectedDay.slice(0,7);rDash();rDay()}
  if(e.target.id==='q'){window._q=e.target.value;rProd();$('#q').focus();$('#q').setSelectionRange(99,99)}
  if(e.target.classList.contains('sf2')){const k=e.target.dataset.k;let v=e.target.value.trim();if(e.target.classList.contains('hex')&&!/^#[0-9a-fA-F]{6}$/.test(v))return;set[k]=v;document.querySelectorAll('.sf2[data-k="'+k+'"]').forEach(x=>{if(x!==e.target)x.value=v});$('#pvk').innerHTML=pvK()}
  if(e.target.classList.contains('sf')){const k=e.target.id.slice(2);set[k]=e.target.value;if(k==='fundo_t')$('#ftv').textContent=e.target.value+'%';$('#pv').innerHTML=prev()}
  if(e.target.classList.contains('qn'))calc();
});

/* ---------- modais ---------- */
const show=h=>{$('#mb').innerHTML=h;$('#ov').classList.add('on')},hide=()=>$('#ov').classList.remove('on');
function openApproveAccess(email=''){
  show(`<span class="eyebrow">ACESSO PROTEGIDO</span><h3>Aprovar acesso ao painel admin</h3><p class="m">Autoriza este e-mail no painel. Se a conta ainda não existir, a aprovação fica salva e será aplicada depois que a pessoa criar a conta e confirmar o e-mail.</p><form id="approve-access-form"><label for="approve-access-email">E-mail da conta</label><input class="in" id="approve-access-email" type="email" autocomplete="email" maxlength="255" value="${esc(email)}" required><p class="account-status" id="approve-access-status" role="status" aria-live="polite"></p><div class="mf"><button class="btn g" type="button" data-a="x">Voltar</button><button class="btn" id="approve-access-submit" type="submit">Aprovar acesso admin</button></div></form>`);
  $('#approve-access-email').focus();
}
async function approveAccessByEmail(){
  const input=$('#approve-access-email'),button=$('#approve-access-submit'),status=$('#approve-access-status'),email=input.value.trim();
  if(!email){input.focus();return}
  button.disabled=true;input.disabled=true;status.textContent='Salvando a aprovação para este e-mail...';
  try{
    const {data,error}=await sb.rpc('approve_admin_access_by_email',{requested_email:email});
    if(error)throw error;
    if(data==='granted'){
      hide();toast(`Acesso administrativo liberado para ${email}.`);await loadAccessRequests();
    }else if(data==='awaiting_signup'){
      hide();toast(`E-mail ${email} aprovado. O acesso será ativado quando a conta for criada e o e-mail confirmado.`);await loadAccessRequests();
    }else if(data==='awaiting_email_confirmation'){
      hide();toast(`E-mail ${email} aprovado. O acesso será ativado após a confirmação do e-mail.`);await loadAccessRequests();
    }else{
      throw new Error('O banco não retornou um estado de aprovação reconhecido.');
    }
  }catch(error){
    const message=error?.message||String(error);
    if(/approve_admin_access_by_email|schema cache|PGRST202/i.test(message)){
      status.textContent=`A função de aprovação por e-mail não foi encontrada: ${message}. Execute a versão atualizada de admin-access-requests.sql no mesmo projeto Supabase.`;
    }else{
      status.textContent=`Não foi possível aprovar: ${message}`;
    }
  }
  finally{
    if($('#approve-access-submit')){$('#approve-access-submit').disabled=false;$('#approve-access-email').disabled=false}
  }
}
document.addEventListener('submit',event=>{
  if(event.target.id==='approve-access-form'){event.preventDefault();approveAccessByEmail()}
});
const calc=()=>{let t=0;document.querySelectorAll('.qn').forEach(i=>{const p=prods.find(x=>x.id==i.dataset.p);t+=(p?p.price:0)*(+i.value||0)});const e=$('#cT');if(e)e.textContent=brl(t)};
function openCmd(id){
  const o=orders.find(x=>x.id==id)||{customer:'',table_no:'',items:[]},q={};(o.items||[]).forEach(i=>q[i.id]=i.qty);
  show(`<h3>${id?'Editar':'Nova'} comanda</h3><input class="in" id="cC" placeholder="Nome do cliente" value="${esc(o.customer)}"><input class="in" id="cM" placeholder="Mesa / observação" value="${esc(o.table_no||'')}"><div class="plist">${prods.filter(p=>p.active||q[p.id]).map(p=>`<div class="pl"><span>${esc(p.name)} <small style="color:var(--mu)">${brl(p.price)}</small></span><input class="in qn" type="number" min="0" data-p="${p.id}" value="${q[p.id]||0}"></div>`).join('')||'<p style="color:var(--mu)">Cadastre produtos primeiro.</p>'}</div><div class="tot"><span>Total</span><b id="cT"></b></div><div class="mf"><button class="btn g" data-a="x">Cancelar</button><button class="btn" data-a="saveCmd" data-i="${id||''}">Salvar</button></div>`);calc();
}
const acts={
  x:hide,
  retryLoad(){load()},
  async logout(){await sb.auth.signOut();location.reload()},
  selectDay(day){selectedDay=day;rDay()},
  tab(i){document.querySelectorAll('.tab').forEach(b=>b.classList.toggle('on',b.dataset.i===i));const views={D:'vD',Y:'vDay',O:'vO',P:'vP',C:'vC',S:'vS',K:'vK',A:'vA'};Object.entries(views).forEach(([key,id])=>$('#'+id).classList.toggle('hide',key!==i));if(i==='Y')rDay();if(i==='A')loadAccessRequests()},
  openApproveAccess(id,button){openApproveAccess(button.dataset.email||'')},
  async rejectAccess(id){if(!confirm('Recusar a solicitação? A conta continuará sem acesso ao painel.'))return;const {data,error}=await sb.from('admin_access_requests').update({status:'rejected'}).eq('user_id',id).eq('status','pending').select('user_id').maybeSingle();if(error)return toast(error.message);if(!data)return toast('A solicitação não está mais pendente');toast('Solicitação recusada');await loadAccessRequests()},
  flt(i){of=i;rOrd()},cmd:openCmd,
  async saveCmd(id){const c=$('#cC').value.trim();if(!c)return toast('Informe o nome do cliente');const it=[...document.querySelectorAll('.qn')].filter(i=>+i.value>0).map(i=>({id:+i.dataset.p,qty:+i.value}));if(!it.length)return toast('Adicione ao menos um item');
    const o={customer:c,table_no:$('#cM').value.trim()||null,items:it};if(await W(id?sb.from('orders').update(o).eq('id',id):sb.from('orders').insert({...o,status:'pendente'}))){hide();toast('Comanda salva');load()}},
  close(id){const o=orders.find(x=>x.id==id),it=itemsOf(o),t=totOf(o);if(!it.length)return toast('Comanda sem itens');
    show(`<h3>Fechar comanda · ${esc(o.customer)}</h3>${it.map(i=>`<div class="pl"><span>${i.qty}× ${esc(i.name)}</span><span>${brl(i.price*i.qty)}</span></div>`).join('')}<div class="tot"><span>Total a pagar</span><b>${brl(t)}</b></div><label>Forma de pagamento</label><select class="in" id="pm">${PAY.map(p=>`<option>${p}</option>`).join('')}</select><div class="mf"><button class="btn g" data-a="x">Voltar</button><button class="btn" data-a="doClose" data-i="${id}">Confirmar pagamento</button></div>`)},
  async doClose(id){const o=orders.find(x=>x.id==id),it=itemsOf(o),n={status:'fechado',total:totOf(o),payment_method:$('#pm').value,closed_at:new Date().toISOString(),items:it};
    if(await W(sb.from('orders').update(n).eq('id',id))){await load();show(rcp({...o,...n},set)+'<div class="mf"><button class="btn g" data-a="x">Fechar</button></div>')}},
  rcp(id){show(rcp(orders.find(x=>x.id==id),set)+'<div class="mf"><button class="btn g" data-a="x">Fechar</button></div>')},
  async delOrd(id){if(confirm('Excluir este pedido?')&&await W(sb.from('orders').delete().eq('id',id)))load()},
  async addExp(){const d=$('#eD').value.trim(),v=parseFloat($('#eV').value);if(!d||isNaN(v))return toast('Informe descrição e valor');if(await W(sb.from('expenses').insert({description:d,amount:v,spent_at:$('#eT').value})))load()},
  async delExp(id){if(confirm('Excluir este gasto?')&&await W(sb.from('expenses').delete().eq('id',id)))load()},
  async addCat(){const n=$('#cn').value.trim();if(n&&await W(sb.from('categories').insert({name:n})))load()},
  async renCat(id){const c=cats.find(x=>x.id==id),n=prompt('Novo nome:',c.name);if(n&&n.trim()&&await W(sb.from('categories').update({name:n.trim()}).eq('id',id)))load()},
  async delCat(id){if(confirm('Excluir categoria? Os produtos ficarão sem categoria.')&&await W(sb.from('categories').delete().eq('id',id)))load()},
  prod(id){const p=prods.find(x=>x.id==id)||{active:true};window._img=p.image_url||'';
    show(`<h3>${id?'Editar':'Novo'} produto</h3>${p.image_url?`<img class="prev" id="pi" src="${esc(p.image_url)}">`:'<div class="prev" id="pi">Sem foto</div>'}<div class="upload-row"><input type="file" id="pf" accept="image/*" class="file-input"><label class="upload-button" for="pf"><span>📷</span> Escolher imagem</label><span class="file-name" id="file-name">${p.image_url?'Imagem atual':'Nenhuma imagem selecionada'}</span></div><label>ou URL da foto</label><input class="in" id="pu" value="${esc(p.image_url&&!p.image_url.startsWith('data:')?p.image_url:'')}"><label>Nome</label><input class="in" id="pn" value="${esc(p.name||'')}"><label>Descrição</label><textarea class="in" id="pd" rows="2">${esc(p.description||'')}</textarea><div class="row"><div><label>Preço (R$)</label><input class="in" id="pp" type="number" step="0.01" min="0" value="${p.price??''}"></div><div><label>Categoria</label><select class="in" id="pc2"><option value="">Sem categoria</option>${cats.map(c=>`<option value="${c.id}" ${c.id==p.category_id?'selected':''}>${esc(c.name)}</option>`).join('')}</select></div></div><label style="display:flex;gap:8px;align-items:center;text-transform:none;font-size:14px;color:var(--tx)"><input type="checkbox" id="pa" ${p.active?'checked':''}> Disponível na loja</label><div class="mf"><button class="btn g" data-a="x">Cancelar</button><button class="btn" data-a="saveProd" data-i="${id||''}">Salvar</button></div>`);
    $('#pf').onchange=async e=>{const f=e.target.files[0];if(!f)return;$('#file-name').textContent=f.name;toast('Enviando foto...');const path=Date.now()+'-'+f.name.replace(/[^\w.-]/g,'_'),r=await sb.storage.from(CFG.BUCKET).upload(path,f);if(r.error)return toast(r.error.message);window._img=sb.storage.from(CFG.BUCKET).getPublicUrl(path).data.publicUrl;$('#pu').value='';$('#pi').outerHTML=`<img class="prev" id="pi" src="${window._img}">`};
    $('#pu').oninput=e=>window._img=e.target.value.trim()},
  async saveProd(id){const n=$('#pn').value.trim(),p=parseFloat($('#pp').value);if(!n||isNaN(p))return toast('Informe nome e preço');
    const o={name:n,description:$('#pd').value.trim(),price:p,category_id:$('#pc2').value?+$('#pc2').value:null,image_url:window._img||null,active:$('#pa').checked};
    if(await W(id?sb.from('products').update(o).eq('id',id):sb.from('products').insert(o))){hide();toast('Produto salvo');load()}},
  async delProd(id){if(confirm('Excluir produto?')&&await W(sb.from('products').delete().eq('id',id)))load()},
  pick(i){$('#'+i).click()},
  grp(g){cg=g;rCor()},
  colRes(k){set[k]='';rCor()},
  colResAll(){COLS.forEach(c=>set[c[1]]='');set.cor1='';set.cor2='';rCor();toast('Todas as cores voltaram ao padrão. Clique em "Salvar cores".')},
  logoRes(){set.logo_img='';rSet();toast('Logo original restaurado. Clique em "Salvar personalização".')},
  bgRes(){set.fundo_img='';rSet();toast('Fundo original restaurado. Clique em "Salvar personalização".')},
  bkSave(){const b={app:'lanchonete',versao:1,data:new Date().toISOString(),categorias:cats.map(c=>c.name),
    produtos:prods.map(p=>({name:p.name,description:p.description,price:p.price,category:(cats.find(c=>c.id==p.category_id)||{}).name||null,image_url:p.image_url,active:p.active})),
    config:Object.fromEntries(KEYS().map(k=>[k,set[k]]))};
    const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([JSON.stringify(b,null,1)],{type:'application/json'}));a.download='backup-lanchonete-'+new Date().toISOString().slice(0,10)+'.json';document.body.appendChild(a);a.click();a.remove();toast('Backup salvo')},
  async saveSet(){const rows=KEYS().map(k=>({key:k,value:String(set[k]??'')}));if(await W(sb.from('settings').upsert(rows))){toast('Personalização salva!');load()}}
};
document.addEventListener('click',e=>{const b=e.target.closest('[data-a]');if(b&&acts[b.dataset.a])acts[b.dataset.a](b.dataset.i,b)});
async function upImg(f){const path=Date.now()+'-'+f.name.replace(/[^\w.-]/g,'_'),r=await sb.storage.from(CFG.BUCKET).upload(path,f);if(r.error){toast(r.error.message);return null}return sb.storage.from(CFG.BUCKET).getPublicUrl(path).data.publicUrl}
document.addEventListener('change',async e=>{
  const id=e.target.id,f=e.target.files&&e.target.files[0];if(!f)return;
  if(id==='account-photo-input'){await uploadAccountPhoto(f);e.target.value='';return}
  if(id==='fL'||id==='fB'){toast('Enviando imagem...');const u=await upImg(f);if(u){set[id==='fL'?'logo_img':'fundo_img']=u;rSet();toast('Imagem carregada. Clique em "Salvar personalização".')}}
  if(id==='fR')await restoreBk(f);
  e.target.value='';
});
async function restoreBk(f){
  let b;try{b=JSON.parse(await f.text())}catch(e){return toast('Arquivo de backup inválido')}
  if(b.app!=='lanchonete'||!Array.isArray(b.produtos)||!Array.isArray(b.categorias))return toast('Este arquivo não é um backup da lanchonete');
  if(!confirm('Restaurar este backup?\n\nISSO SUBSTITUI todos os produtos, categorias e configurações atuais por '+b.produtos.length+' produtos e '+b.categorias.length+' categorias do arquivo.'))return;
  toast('Restaurando...');
  await Promise.all(prods.map(p=>sb.from('products').delete().eq('id',p.id)));
  await Promise.all(cats.map(c=>sb.from('categories').delete().eq('id',c.id)));
  if(b.categorias.length&&!await W(sb.from('categories').insert(b.categorias.map(name=>({name:String(name)})))))return;
  const nc=(await sb.from('categories').select('*')).data||[],idOf=n=>(nc.find(c=>c.name===n)||{}).id||null;
  if(b.produtos.length&&!await W(sb.from('products').insert(b.produtos.map(p=>({name:String(p.name),description:p.description||null,price:+p.price||0,category_id:p.category?idOf(p.category):null,image_url:p.image_url||null,active:p.active!==false})))))return;
  const ok=KEYS(),rows=Object.entries(b.config||{}).filter(([k])=>ok.includes(k)).map(([key,value])=>({key,value:String(value??'')}));
  if(rows.length&&!await W(sb.from('settings').upsert(rows)))return;
  toast('Backup restaurado!');await load();
}
const showLogin=()=>$('#login').classList.remove('hide');
async function enter(){
  const {data:{user},error:userError}=await sb.auth.getUser();
  if(userError){showLogin();authMessage(supabaseErrorMessage(userError,'Não foi possível verificar a sessão'));return}
  if(!user){showLogin();authMessage('Nenhuma sessão ativa. Entre novamente.');return}
  const a=await sb.from('admins').select('user_id').eq('user_id',user.id).maybeSingle();
  if(a.error){showLogin();authMessage(supabaseErrorMessage(a.error,'Não foi possível verificar as permissões'));return}
  if(!a.data){
    const ensured=await sb.rpc('ensure_admin_access_request',{requested_user_id:user.id});
    if(ensured.error){
      showLogin();
      authMessage(`Não foi possível enviar sua solicitação para o painel: ${supabaseErrorMessage(ensured.error,'')}. Confirme que a versão atualizada de admin-access-requests.sql foi executada no Supabase.`);
      return;
    }
    const request=await sb.from('admin_access_requests').select('status').eq('user_id',user.id).maybeSingle();
    const signedOut=await sb.auth.signOut();showLogin();
    if(signedOut.error)return authMessage(supabaseErrorMessage(signedOut.error,'Sem acesso administrativo; falha ao encerrar a sessão'));
    if(request.error)return authMessage(supabaseErrorMessage(request.error,'Não foi possível verificar sua solicitação'));
    if(request.data?.status==='pending')return authMessage('Sua solicitação foi recebida e aguarda aprovação de um administrador.');
    if(request.data?.status==='rejected')return authMessage('Sua solicitação de acesso foi recusada.');
    return authMessage('Esta conta não tem permissão de administrador.');
  }
  $('#auth-message').classList.add('hide');
  $('#login').classList.add('hide');$('#app').classList.remove('hide');
  await loadAccount(user);
  await load();
  subscribeAdminUpdates();
}
if(sb)sb.auth.getSession().then(({data,error})=>{
  if(error){showLogin();return authMessage(supabaseErrorMessage(error,'Não foi possível recuperar a sessão'))}
  if(data.session)return enter();
  showLogin();
}).catch(error=>{showLogin();authMessage(supabaseErrorMessage(error,'Não foi possível conectar ao Supabase'))});else showLogin();
document.addEventListener('visibilitychange',()=>{
  if(!document.hidden&&$('#app')&&!$('#app').classList.contains('hide'))scheduleAdminRefresh();
});
