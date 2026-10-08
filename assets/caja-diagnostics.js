/* Caja diaria v0.12.30: diagnóstico local, sin credenciales ni cambios de backend. */
'use strict';
const CASH_DIAG_KEY='pk_cash_sync_diag_v1';
let cashDiagData;
try{cashDiagData=JSON.parse(localStorage.getItem(CASH_DIAG_KEY)||'null')||{};}catch{cashDiagData={};}
cashDiagData={log:[],last:{},remote:{},acks:{},localIds:{},workerVersion:'Sin consultar',scriptVersion:'Sin consultar',...cashDiagData};
function cashDiagSave(){try{localStorage.setItem(CASH_DIAG_KEY,JSON.stringify(cashDiagData));}catch{}}
function cashDiagLog(event,detail=''){
 const entry={at:new Date().toISOString(),event:String(event).slice(0,100),detail:detail?panckoSafeMessage(detail).slice(0,300):'',date:cashSelectedDate};
 cashDiagData.log.push(entry);cashDiagData.log=cashDiagData.log.slice(-100);cashDiagSave();cashDiagRender();
}
function cashDiagTrackLocalMutation(previous,next,date){
 const before=new Map((previous.days.find(d=>d.date===date)?.movements||[]).map(m=>[m.id,m]));
 for(const m of next.days.find(d=>d.date===date)?.movements||[]){
  if(!before.has(m.id)){cashDiagData.localIds[m.id]=true;cashDiagLog('Movimiento creado local',m.id+' · '+m.detail+' · '+cashMoney(m.amount_cents));}
  else if(JSON.stringify(before.get(m.id))!==JSON.stringify(m))cashDiagLog(m.voided_at&&!before.get(m.id).voided_at?'Movimiento anulado local':'Movimiento editado local',m.id);
 }
 for(const id of before.keys())if(!(next.days.find(d=>d.date===date)?.movements||[]).some(m=>m.id===id))cashDiagLog('Movimiento eliminado local',id);
 cashDiagSave();
}
function cashDiagPendingForMovement(m,date){return (cashBook.sync_pending||[]).filter(op=>op.date===date&&(
  op.data?.movement?.id===m.id||op.data?.id===m.id||op.kind==='create'&&op.data?.day?.movements?.some(x=>x.id===m.id)
));}
function cashDiagMovementState(m,date){
 const pending=cashDiagPendingForMovement(m,date);
 if(pending.length){if(cashSyncConflict)return 'CONFLICTO';if(cashSyncError)return 'ERROR_SYNC';return 'PENDIENTE_SUBIR';}
 if(m.voided_at)return 'ANULADO';
 const remote=cashDiagData.remote[date];
 if(remote?.ids?.includes(m.id))return cashDiagData.localIds[m.id]||cashDiagData.acks[m.id]?'CONFIRMADO_CENTRAL':'RECIBIDO_CENTRAL';
 if(cashDiagData.acks[m.id])return 'SUBIDO';
 return 'LOCAL_ONLY';
}
function cashDiagSnapshot(){
 const date=cashSelectedDate,day=cashDay(date),pending=(cashBook.sync_pending||[]).filter(x=>x.date===date),remote=cashDiagData.remote[date]||null,identity=cashIdentity();
 return {
  fecha_caja_abierta:date,fecha_local_actual:cashToday(),device_id:identity.id,dispositivo:identity.name||'Sin nombre',version_app:'0.12.30',
  version_worker:cashDiagData.workerVersion,version_apps_script:cashDiagData.scriptVersion,
  conexion:navigator.onLine===false?'OFFLINE':'ONLINE',token_configurado:!!panckoAppToken(),endpoint:PANCKO_API_URL+'/cash/',
  ultimo_sync_iniciado:cashDiagData.last.started||null,ultimo_sync_terminado:cashDiagData.last.finished||null,
  resultado_ultimo_sync:cashDiagData.last.result||'Sin registrar',error_ultimo_sync:cashDiagData.last.error||cashSyncError||cashSyncConflict||'',
  sync_en_curso:cashSyncBusy,estado_libro_local:cashStorageError||'OK',
  movimientos_locales:day?.movements.length||0,movimientos_anulados:day?.movements.filter(m=>!!m.voided_at).length||0,
  operaciones_pendientes:pending.length,pendientes_otras_fechas:(cashBook.sync_pending||[]).filter(x=>x.date!==date).length,
  cola_pendiente:pending.map(op=>({op_id:op.op_id,tipo:op.kind,fecha:op.date,movimiento_id:op.data?.movement?.id||op.data?.id||null,creada:op.created_at})),
  movimientos:day?.movements.map(m=>({id:m.id,detalle:m.detail,importe_cents:m.amount_cents,estado:cashDiagMovementState(m,date)}))||[],
  central:{ultima_consulta:remote?.at||null,revision:remote?.revision??cashBook.sync_versions?.[date]??null,movimientos_recibidos:remote?.ids?.length??null,ids:remote?.ids||[]},
  log:cashDiagData.log.slice(-50)
 };
}
function cashDiagRender(){
 const pre=document.getElementById('cashDiagView');if(!pre)return;
 pre.textContent=JSON.stringify(cashDiagSnapshot(),null,2);
}
async function cashDiagProbe(){
 cashDiagLog('Diagnóstico', 'Consultando versiones de backend');
 try{const res=await fetch(PANCKO_API_URL+'/ping',{cache:'no-store'}),data=await res.json();cashDiagData.workerVersion=data.ok?String(data.version||'No informada'):'Error HTTP '+res.status;}
 catch(e){cashDiagData.workerVersion='No disponible: '+panckoSafeMessage(e);}
 if(panckoAppToken())try{const res=await panckoFetch(PANCKO_API_URL+'/auth/check',{cache:'no-store'}),data=await res.json();cashDiagData.scriptVersion=data.ok?String(data.version||'No informada'):'Error HTTP '+res.status;
  if(data.worker_version)cashDiagData.workerVersion=String(data.worker_version);
 }catch(e){cashDiagData.scriptVersion='No disponible: '+panckoSafeMessage(e);}
 else cashDiagData.scriptVersion='Sin clave configurada';
 cashDiagSave();cashDiagRender();
}
async function cashDiagCopy(){const text=JSON.stringify(cashDiagSnapshot(),null,2);try{await navigator.clipboard.writeText(text);showToast('Diagnóstico de Caja copiado.');}catch{cashDownload('Pancko_Caja_diagnostico_'+cashSelectedDate+'.json',text,'application/json;charset=utf-8');showToast('Se descargó el diagnóstico.');}}
function cashExportLocalDayJSON(){
 const date=cashSelectedDate,day=cashDay(date),raw=localStorage.getItem(CASH_KEY),value={app:'Pancko Gestión',version:'0.12.30',exportado_en:new Date().toISOString(),fecha:date,device_id:cashIdentity().id,dispositivo:cashIdentity().name,
  dia:day?JSON.parse(JSON.stringify(day)):null,pendientes:(cashBook.sync_pending||[]).filter(x=>x.date===date),revision_local:cashBook.revision,revision_central_conocida:cashBook.sync_versions?.[date]??null,
  conteo:day?.close_draft||null,cierre:day?.closing||null,...(cashStorageError?{libro_crudo:raw,error_lectura:cashStorageError}:{})};
 cashDownload('Pancko_Caja_LOCAL_'+date+'.json',JSON.stringify(value,null,2),'application/json;charset=utf-8');cashDiagLog('Respaldo local exportado',date);
}
async function cashCopyLocalDaySummary(){
 const d=cashDay(),pending=(cashBook.sync_pending||[]).filter(x=>x.date===cashSelectedDate);
 const text=['Caja local '+cashSelectedDate,'Dispositivo: '+(cashIdentity().name||'Sin nombre'),'Movimientos: '+(d?.movements.length||0),'Pendientes: '+pending.length,'',...(d?.movements||[]).map(m=>cashStamp(m.created_at,true)+' · '+m.detail+' · '+cashMoney(m.amount_cents)+(m.voided_at?' · ANULADO':''))].join('\n');
 try{await navigator.clipboard.writeText(text);showToast('Resumen local copiado.');}catch{cashDownload('Pancko_Caja_resumen_local_'+cashSelectedDate+'.txt',text);}
}
function cashDiagShowPending(){const panel=document.getElementById('cashDiagPanel');panel.open=true;cashDiagRender();const pending=cashDiagSnapshot().cola_pendiente;showToast(pending.length?pending.length+' operación(es) pendientes. Detalle en diagnóstico.':'No hay pendientes de esta fecha.');document.getElementById('cashDiagView').scrollIntoView({block:'nearest'});}
async function cashRetryPending(){cashDiagLog('Reintento manual',cashSelectedDate);await cashSyncDate(cashSelectedDate);cashDiagRender();}
async function cashForceReloadDay(){cashDiagLog('Recarga central solicitada',cashSelectedDate);await cashSyncDate(cashSelectedDate,{refreshOnly:true,force:true});cashDiagRender();}
document.getElementById('cashDiagPanel')?.addEventListener('toggle',event=>{if(event.target.open){cashDiagRender();cashDiagProbe();}});
