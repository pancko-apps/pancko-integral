/* Pancko Gestión v0.12.31 · Recetas propias compartidas, separadas del historial de laboratorio. */
'use strict';
const SHARED_RECIPE_KEY='pk_shared_recipes_v1';
let sharedRecipeBusy=false,sharedRecipeLastError='';
function sharedRecipeBook(){
 try{const b=JSON.parse(localStorage.getItem(SHARED_RECIPE_KEY)||'null');if(b?.schema===1&&Array.isArray(b.items)&&Array.isArray(b.pending))return b;}catch{}
 return {schema:1,items:[],pending:[],revisions:{}};
}
function sharedRecipeWrite(book){localStorage.setItem(SHARED_RECIPE_KEY,JSON.stringify(book));}
function applySharedRecipes(base){
 const rows=sharedRecipeBook().items;
 const keys=new Set(rows.map(manualRecipeKey));
 return base.filter(r=>!keys.has(manualRecipeKey(r))).concat(rows);
}
function queueSharedRecipe(row,oldKey=''){
 const key=manualRecipeKey(row);
 if(oldKey&&oldKey!==key)throw new Error('Para cambiar código, base, familia o patrón creá otra fórmula. La anterior no se borra del central.');
 const b=sharedRecipeBook();
 b.items=b.items.filter(r=>manualRecipeKey(r)!==key).concat(row);
 b.pending.push({op_id:'recipe_'+crypto.randomUUID(),key,row,created_at:new Date().toISOString()});
 sharedRecipeWrite(b);
 renderSharedRecipeStatus();
}
function renderSharedRecipeStatus(){
 const el=document.getElementById('sharedRecipeStatus');if(!el)return;
 const b=sharedRecipeBook();el.textContent=`Recetas propias locales: ${b.items.length} · Pendientes: ${b.pending.length}`+(!panckoAppToken()?' · Configurá la Clave operativa para compartir':'')+(sharedRecipeLastError?' · '+sharedRecipeLastError:'');
}
async function sharedRecipeRequest(path,body=null){
 const res=await panckoFetch(PANCKO_API_URL+path,body?{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)}:{cache:'no-store'});
 const data=await res.json();if(!res.ok||!data.ok)throw new Error(panckoSafeMessage(data.error||'Central de recetas sin respuesta.'));return data;
}
async function syncSharedRecipes(){
 if(sharedRecipeBusy)return false;
 if(!panckoAppToken()||navigator.onLine===false){sharedRecipeLastError=!panckoAppToken()?'Sin clave operativa; cambios sólo locales.':'Sin red; cambios pendientes locales.';renderSharedRecipeStatus();return false;}
 sharedRecipeBusy=true;sharedRecipeLastError='';renderSharedRecipeStatus();
 try{
  let b=sharedRecipeBook();
  // Cada op conserva su ID. El servidor registra el ID y la revisión de forma atómica.
  for(let i=0;i<100&&b.pending.length;i++){
   const op=b.pending[0],revision=b.revisions?.[op.key]||0;
   const result=await sharedRecipeRequest('/recipe',{...op,revision});
   if(result.op_id!==op.op_id||result.key!==op.key||!Number.isSafeInteger(result.revision)||result.revision<1||manualRecipeKey(result.row)!==op.key)throw new Error('El central no confirmó la operación. Sigue pendiente para reintentar.');
   b=sharedRecipeBook();
   if(b.pending[0]?.op_id!==op.op_id)throw new Error('La cola cambió en otra pestaña. Reintentá.');
   b.pending.shift();b.revisions=b.revisions||{};b.revisions[op.key]=result.revision;
   sharedRecipeWrite(b);
  }
  if(b.pending.length)throw new Error('Quedan más de 100 recetas pendientes; reintentá.');
  const result=await sharedRecipeRequest('/recipes');b=sharedRecipeBook();b.revisions=b.revisions||{};
  for(const item of result.recipes||[]){
   if(!item?.row||!item.key||!Number.isSafeInteger(item.revision)||manualRecipeKey(item.row)!==item.key)continue;
   if(b.pending.some(op=>op.key===item.key))continue;
   b.items=b.items.filter(r=>manualRecipeKey(r)!==item.key).concat(item.row);b.revisions[item.key]=item.revision;
  }
  sharedRecipeWrite(b);
  tintRecipes=applySharedRecipes(tintRecipes);
  buildTintIndex();renderTintStatus();if(typeof renderManualRecipeList==='function')renderManualRecipeList();
  sharedRecipeLastError='';renderSharedRecipeStatus();return true;
 }catch(e){sharedRecipeLastError=panckoSafeMessage(e);renderSharedRecipeStatus();return false;}
 finally{sharedRecipeBusy=false;}
}
window.addEventListener('online',()=>syncSharedRecipes());
setInterval(()=>{if(document.visibilityState==='visible'&&(document.getElementById('labScreen')?.classList.contains('active')||document.getElementById('cartScreen')?.classList.contains('active')))syncSharedRecipes();},60000);
