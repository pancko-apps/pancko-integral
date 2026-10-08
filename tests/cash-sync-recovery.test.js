const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const html=fs.readFileSync(path.resolve(__dirname,'../index.html'),'utf8');
function source(name){let start=html.indexOf('function '+name+'(');assert(start>0,name);if(html.slice(start-6,start)==='async ')start-=6;let open=html.indexOf('){',start)+1,depth=0;for(let i=open;i<html.length;i++){if(html[i]==='{')depth++;if(html[i]==='}'&&!--depth)return html.slice(start,i+1);}throw Error(name);}
const date='2026-10-08',move=(id,detail)=>({id,detail,amount_cents:10000}),day=(moves)=>({date,state:'open',opening_cents:0,movements:moves,close_draft:{},deleted_ids:[]});
const local=day([move('mov_a','PC pintu')]),central=day([move('mov_a','PC pintu'),move('mov_b','Celular')]);
const initial={schema_version:1,revision:1,days:[local],sync_pending:[],sync_versions:{[date]:5}};
const db=new Map([['pk_cash_daily_v1',JSON.stringify(initial)]]);
let applyResult,getResult,rendered=0;
const ctx={console,JSON,Date,Set,Map,localStorage:{getItem:k=>db.get(k)||null,setItem:(k,v)=>db.set(k,v)},navigator:{onLine:true},document:{},cashBook:JSON.parse(db.get('pk_cash_daily_v1')),cashRaw:db.get('pk_cash_daily_v1'),cashSelectedDate:date,cashSyncBusy:false,cashSyncConflict:'',cashSyncError:'',cashSyncInFlightId:null,cashLastSync:null,cashDiagData:{last:{},remote:{},acks:{}},cashDiagLog(){},cashConflictNotice(msg){ctx.cashSyncConflict=msg;},cashIdentity:()=>({name:'PC',id:'dev_1'}),cashSyncEnabled:()=>true,cashRenderSyncStatus(){},panckoSafeMessage:e=>String(e?.message||e),cashApi:async path=>path==='/cash/apply'?applyResult:getResult,cashReadBook:raw=>JSON.parse(raw),cashValidateBook:b=>b,cashInteger:n=>n,cashCountDirtyDates:new Set(),cashCountFieldActive:()=>false,cashCloseInputs:new Map(),renderCashModule(){rendered++;},renderCashHome(){},cashDateLabel:x=>x,cashRemoteDayCopy:x=>x,cashOp:()=>{},CASH_KEY:'pk_cash_daily_v1',CASH_SYNC_TIME_KEY:'pk_cash_sync_time_v1',setTimeout,clearTimeout};
vm.createContext(ctx);vm.runInContext(['cashSame','cashSyncWrite','cashRemoteDiffers','cashPendingMerge','cashSyncDate'].map(source).join('\n'),ctx);
(async()=>{
 // Revisión idéntica con contenido local viejo: recibe el movimiento que faltaba.
 getResult={ok:true,date,revision:5,day:central};
 assert.equal(await vm.runInContext('cashSyncDate(cashSelectedDate,{refreshOnly:true})',ctx),true);
 assert.deepEqual(ctx.cashBook.days[0].movements.map(x=>x.id),['mov_a','mov_b']);
 assert.ok(rendered>0);
 // La consulta sólo de lectura incorpora nuevos movimientos sin quitar un alta pendiente.
 const op={op_id:'op_local',date,kind:'add',data:{movement:move('mov_c','Pendiente')}};
 ctx.cashBook.days[0].movements.push(op.data.movement);ctx.cashBook.sync_pending.push(op);
 ctx.cashRaw=JSON.stringify(ctx.cashBook);db.set('pk_cash_daily_v1',ctx.cashRaw);
 getResult={ok:true,date,revision:6,day:day([...central.movements,move('mov_d','Depto')])};
 assert.equal(await vm.runInContext('cashSyncDate(cashSelectedDate,{refreshOnly:true})',ctx),true);
 assert.deepEqual(ctx.cashBook.days[0].movements.map(x=>x.id),['mov_a','mov_b','mov_c','mov_d']);
 assert.equal(ctx.cashBook.sync_pending.length,1);
 // Un HTTP 200 sin confirmación de op_id nunca vacía la cola; reintento idempotente sí.
 applyResult={ok:true,revision:7,day:{...getResult.day,applied_ops:[]}};
 assert.equal(await vm.runInContext('cashSyncDate(cashSelectedDate)',ctx),false);
 assert.equal(ctx.cashBook.sync_pending.length,1);
 applyResult={ok:true,revision:7,day:{...ctx.cashBook.days[0],applied_ops:['op_local']}};
 getResult={ok:true,date,revision:7,day:JSON.parse(JSON.stringify(applyResult.day))};
 assert.equal(await vm.runInContext('cashSyncDate(cashSelectedDate)',ctx),true);
 assert.equal(ctx.cashBook.sync_pending.length,0);
 assert.deepEqual(ctx.cashBook.days[0].movements.map(x=>x.id),['mov_a','mov_b','mov_c','mov_d']);
 // Si un dispositivo conserva un movimiento sin cola y el central no lo tiene, no lo reemplaza.
 ctx.cashBook.days[0].movements.push(move('mov_orphan','Rescate local'));
 ctx.cashRaw=JSON.stringify(ctx.cashBook);db.set('pk_cash_daily_v1',ctx.cashRaw);
 getResult={ok:true,date,revision:8,day:day([...central.movements,move('mov_c','Pendiente'),move('mov_d','Depto')])};
 assert.equal(await vm.runInContext('cashSyncDate(cashSelectedDate,{refreshOnly:true})',ctx),false);
 assert.equal(ctx.cashBook.days[0].movements.at(-1).id,'mov_orphan');
 assert.match(ctx.cashSyncConflict,/Exportá la caja local/);
 console.log('OK Caja: revisión igual recuperada, recepción con pendiente, ACK inválido conserva cola, reintento confirma una sola vez.');
})().catch(e=>{console.error(e);process.exitCode=1});
