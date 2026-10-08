const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const js=fs.readFileSync(path.resolve(__dirname,'../assets/shared-recipes.js'),'utf8');
function device(){
 const db=new Map(),ctx={console,Date,JSON,Number,crypto:require('node:crypto').webcrypto,localStorage:{getItem:k=>db.get(k)||null,setItem:(k,v)=>db.set(k,v)},navigator:{onLine:true},document:{visibilityState:'visible',getElementById:()=>null},window:{addEventListener(){}},setInterval(){},PANCKO_API_URL:'https://example.test',panckoAppToken:()=> 'x'.repeat(32),panckoSafeMessage:e=>String(e?.message||e),manualRecipeKey:r=>'NORMAL|'+r.base+'|'+r.idcolor,panckoFetch:null,tintRecipes:[],buildTintIndex(){},renderTintStatus(){}};
 vm.createContext(ctx);vm.runInContext(js,ctx);return {db,ctx};
}
const central=new Map();let revision=0;
async function fetcher(url,opts={}){
 const pathname=new URL(url).pathname;
 if(pathname==='/recipe'){
  const p=JSON.parse(opts.body),old=central.get(p.key);
  if(old?.ops.includes(p.op_id))return {ok:true,json:async()=>({ok:true,op_id:p.op_id,key:p.key,row:old.row,revision:old.revision})};
  if((old?.revision||0)!==p.revision)return {ok:false,json:async()=>({ok:false,conflict:true,error:'Revisión desactualizada'})};
  const next={row:p.row,revision:++revision,ops:[...(old?.ops||[]),p.op_id]};central.set(p.key,next);
  return {ok:true,json:async()=>({ok:true,op_id:p.op_id,key:p.key,row:next.row,revision:next.revision})};
 }
 return {ok:true,json:async()=>({ok:true,recipes:[...central].map(([key,v])=>({key,row:v.row,revision:v.revision}))})};
}
(async()=>{
 const a=device(),b=device();a.ctx.panckoFetch=fetcher;b.ctx.panckoFetch=fetcher;
 const row={tipo_receta:'NORMAL',base:'PASTEL',idcolor:'T100',codigo_formula:'T100',descripcion:'Gris',formula_1l:'B=2'};
 a.ctx.queueSharedRecipe(row);assert.equal(a.ctx.sharedRecipeBook().pending.length,1);
 assert.equal(await a.ctx.syncSharedRecipes(),true);assert.equal(a.ctx.sharedRecipeBook().pending.length,0);
 assert.equal(await b.ctx.syncSharedRecipes(),true);assert.equal(b.ctx.tintRecipes.find(r=>r.idcolor==='T100').formula_1l,'B=2');
 // Edición concurrente: la segunda queda pendiente y no pisa la primera.
 a.ctx.queueSharedRecipe({...row,formula_1l:'B=3'},'NORMAL|PASTEL|T100');
 b.ctx.queueSharedRecipe({...row,formula_1l:'B=4'},'NORMAL|PASTEL|T100');
 assert.equal(await a.ctx.syncSharedRecipes(),true);
 assert.equal(await b.ctx.syncSharedRecipes(),false);
 assert.equal(b.ctx.sharedRecipeBook().pending.length,1);
 assert.equal(central.get('NORMAL|PASTEL|T100').row.formula_1l,'B=3');
 console.log('OK recetas cliente: PC A publica, B recibe, conflicto conserva el pendiente B.');
})().catch(e=>{console.error(e);process.exitCode=1});
