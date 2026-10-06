// Pancko Gestión v0.12.18. Secrets are configured in Cloudflare, never in this file.
const VERSION='0.12.18';
const GAS_URL='https://script.google.com/macros/s/AKfycbwyFVFa54Ruue2-4UoIuvnYzbjyqmyEwiwuozl7Zz01zVD0KJSXMKnHdDtCwrAzg2VT/exec';
const GET={'/colors':'list_colors','/budgets':'list_budgets','/articles':'list_articles','/articles/meta':'articles_meta','/auth/check':'auth_check'};
const POST={'/color':'save_color','/budget':'save_budget','/budget/delete':'delete_budget','/articles':'save_articles','/cash/get':'cash_get','/cash/apply':'cash_apply','/cc/get':'cc_get','/cc/apply':'cc_apply'};
function clean(value){if(Array.isArray(value))return value.map(clean);if(value&&typeof value==='object'){const out={};for(const [k,v]of Object.entries(value))if(!/^(token|.*_token|authorization|x-pancko-token|secret|password)$/i.test(k))out[k]=clean(v);return out;}return value;}
function equals(a,b){if(typeof a!=='string'||typeof b!=='string')return false;let diff=a.length^b.length;for(let i=0;i<Math.max(a.length,b.length);i++)diff|=(a.charCodeAt(i)||0)^(b.charCodeAt(i)||0);return diff===0;}
export default {async fetch(request,env){
 const origin=request.headers.get('Origin');
 const allowed=new Set(['https://pancko-apps.github.io',...(env.PANCKO_ALLOWED_ORIGINS||'').split(',').map(s=>s.trim()).filter(s=>/^https?:\/\/[^/]+$/.test(s)&&s!=='*')]);
 const headers={'Content-Type':'application/json;charset=utf-8','Cache-Control':'no-store','Vary':'Origin','Access-Control-Allow-Methods':'GET, POST, OPTIONS','Access-Control-Allow-Headers':'Content-Type, Authorization, X-Pancko-Token'};
 if(origin&&allowed.has(origin))headers['Access-Control-Allow-Origin']=origin;
 const reply=(body,status=200)=>new Response(JSON.stringify(body),{status,headers});
 if(origin&&!allowed.has(origin))return reply({ok:false,error:'Origen no permitido.'},403);
 if(request.method==='OPTIONS')return new Response(null,{status:204,headers});
 const path=new URL(request.url).pathname;
 if(request.method==='GET'&&(path==='/'||path==='/ping'))return reply({ok:true,service:'pancko-integral-api',version:VERSION});
 const action=request.method==='GET'?GET[path]:request.method==='POST'?POST[path]:null;
 if(!action)return reply({ok:false,error:'Ruta no encontrada.'},404);
 const canonical=env.PANCKO_APP_TOKEN;
 if(typeof canonical!=='string'||canonical.length<32)return reply({ok:false,error:'Servicio no configurado: PANCKO_APP_TOKEN.'},503);
 let body={};try{if(request.method==='POST'){body=await request.json();if(!body||typeof body!=='object'||Array.isArray(body))throw new Error();}}catch{return reply({ok:false,error:'JSON inválido.'},400);}
 const authorization=request.headers.get('Authorization');
 const supplied=authorization?authorization.replace(/^Bearer\s+/i,''):request.headers.get('X-Pancko-Token')||body.token||'';
 const until=Date.parse(env.PANCKO_LEGACY_UNTIL||'');
 const compat=env.PANCKO_SECURITY_MODE==='compat'&&Number.isFinite(until)&&Date.now()<until;
 let authorized=equals(supplied,canonical),legacy=false;
 if(!authorized&&compat&&path!=='/auth/check'){
  const old=path.startsWith('/cash/')?env.PANCKO_CASH_TOKEN:path.startsWith('/cc/')?env.PANCKO_CC_TOKEN:path==='/articles'&&request.method==='POST'?env.PANCKO_ARTICLES_TOKEN:null;
  if(supplied&&old&&equals(supplied,old)){authorized=true;legacy=true;}
  if(!supplied&&origin&&allowed.has(origin)&&['/budgets','/budget','/budget/delete','/colors','/color','/articles','/articles/meta'].includes(path)&&!(path==='/articles'&&request.method==='POST')){authorized=true;legacy=true;}
 }
 if(!authorized)return reply({ok:false,code:'AUTH_REQUIRED',error:'Clave operativa Pancko inválida o ausente.'},401);
 // Compat never forwards an old credential. GAS is always strict with the canonical key.
 const payload=path==='/color'?{action,data:clean(body),token:canonical}:{...clean(body),action,token:canonical};
 const ctrl=new AbortController(),timer=setTimeout(()=>ctrl.abort(),55000);
 try{
  const res=await fetch(env.PANCKO_GAS_URL||GAS_URL,{method:'POST',headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify(payload),signal:ctrl.signal});
  let data;try{data=await res.json();}catch{return reply({ok:false,error:'Respuesta de Apps Script no válida. Revisá despliegue.'},502);}
  // During deployment only: an old GAS still expects its former module token.
  // Retry only its exact legacy authentication errors; new GAS never emits them.
  const oldUpstreamKey=path.startsWith('/cash/')?env.PANCKO_CASH_TOKEN:path.startsWith('/cc/')?env.PANCKO_CC_TOKEN:path==='/articles'&&request.method==='POST'?env.PANCKO_ARTICLES_TOKEN:null;
  if(compat&&oldUpstreamKey&&!data.ok&&/^Error: (Clave de Caja inválida\. Revisá la configuración del dispositivo\.|Clave de Cuenta corriente inválida\.|Clave de publicación no válida o no configurada\.)$/.test(String(data.error))){
   const retry=await fetch(env.PANCKO_GAS_URL||GAS_URL,{method:'POST',headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify({...payload,token:oldUpstreamKey}),signal:ctrl.signal});
   data=await retry.json();legacy=true;
  }
  if(legacy){console.warn('PANCKO_LEGACY',request.method,path,new Date().toISOString());data={...data,legacy:true,legacy_until:env.PANCKO_LEGACY_UNTIL};}
  if(action==='auth_check')data={...data,worker_version:VERSION};
  return reply(data,data.ok?200:/AUTH_REQUIRED/.test(String(data.error))?401:400);
 }catch{return reply({ok:false,error:'Sincronización demorada. Los cambios siguen guardados localmente.'},502);}finally{clearTimeout(timer);}
}};
