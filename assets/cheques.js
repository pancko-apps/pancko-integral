/* Pancko Gestión v0.12.37 · Agenda local de cheques y valores. */
'use strict';
const CHECKS_KEY='pk_values_checks_v1';
const CHECKS_STATES=['Pendiente','En cartera','Aceptado','Depositado','Cobrado / acreditado','Entregado / endosado','Rechazado','Anulado'];
const CHECKS_CLOSED=new Set(['Cobrado / acreditado','Rechazado','Anulado']);
let checksEditingId='';

function checksRead(){
  const raw=localStorage.getItem(CHECKS_KEY);
  if(raw===null)return [];
  try{const data=JSON.parse(raw);if(Array.isArray(data))return data;}
  catch{}
  throw new Error('No se pudo leer la agenda local. Conservá los datos de este navegador y revisá el almacenamiento antes de guardar.');
}
function checksWrite(items){localStorage.setItem(CHECKS_KEY,JSON.stringify(items));}
function checksCents(text){return cashParseMoney(text,{nonnegative:true});}
function checksMoney(cents){return '$ '+(cents/100).toLocaleString('es-AR',{minimumFractionDigits:cents%100?2:0,maximumFractionDigits:2});}
function checksDate(date){if(!date)return '—';const [y,m,d]=date.split('-');return `${d}/${m}/${y}`;}
function checksDay(date){return Math.floor(Date.parse(date+'T12:00:00Z')/86400000);}
function checksDaysUntil(date){return checksDay(date)-checksDay(cashToday());}
function checksOpen(item){return !CHECKS_CLOSED.has(item.estado);}
function checksInitialStatus(type,direction){return direction==='entregado'?'Entregado / endosado':type==='echeq'?'Pendiente':'En cartera';}
function checksNotice(message){const box=document.getElementById('checksNotice');if(box)box.textContent=message;}
function checksField(id){return document.getElementById(id).value.trim();}
function checksDefaultState(){document.getElementById('checksStatus').value=checksInitialStatus(checksField('checksType'),checksField('checksDirection'));}
function checksOpenForm(id=''){
  const item=id?checksRead().find(x=>x.id===id):null;if(id&&!item)return;
  checksEditingId=id;
  const fields={checksContact:item?.cliente_proveedor||'',checksAmount:item?checksMoney(item.importe_cents).replace(/^\$ /,''):'',checksDue:item?.fecha_vencimiento||'',checksType:item?.tipo_valor||'fisico',checksDirection:item?.movimiento||'recibido',checksStatus:item?.estado||'En cartera',checksBank:item?.banco||'',checksNumber:item?.numero_o_id||'',checksIssued:item?.fecha_emision||'',checksHolder:item?.titular||'',checksIssuerCuit:item?.cuit_emisor||'',checksReceiverCuit:item?.cuit_receptor||'',checksNote:item?.observacion||''};
  for(const [key,value] of Object.entries(fields))document.getElementById(key).value=value;
  const origin=document.getElementById('checksOrigin');origin.textContent=item?.origen==='Cuenta Corriente'?`Origen: Cuenta Corriente · ${item.cliente_proveedor} · Pago ${checksDate(item.cc_fecha_pago)} · ${checksMoney(item.importe_cents)} · Movimiento ${item.cc_movement_id}`:'Origen: manual · guardado sólo en este dispositivo.';
  document.getElementById('checksFormTitle').textContent=item?'Editar valor':'Nuevo valor';
  document.getElementById('checksFormPanel').hidden=false;
  document.getElementById('checksContact').focus({preventScroll:true});
}
function checksCloseForm(){checksEditingId='';document.getElementById('checksFormPanel').hidden=true;}
function checksSaveForm(){
  try{
    const contact=checksField('checksContact'),amount=checksCents(checksField('checksAmount')),due=checksField('checksDue'),issued=checksField('checksIssued');
    if(!contact||contact.length>160||!Number.isSafeInteger(amount)||amount<=0||!cashValidDate(due))throw new Error('Completá contacto, importe positivo y fecha de vencimiento.');
    if(issued&&!cashValidDate(issued))throw new Error('Revisá la fecha de emisión.');
    const status=checksField('checksStatus');if(!CHECKS_STATES.includes(status))throw new Error('Estado inválido.');
    const items=checksRead(),idx=items.findIndex(x=>x.id===checksEditingId),old=idx>=0?items[idx]:null,now=new Date().toISOString();
    if(checksEditingId&&!old)throw new Error('El valor ya no está disponible.');
    const item={...(old||{}),id:old?.id||'chk_'+crypto.randomUUID(),tipo_valor:checksField('checksType'),movimiento:checksField('checksDirection'),estado:status,cliente_proveedor:contact,importe_cents:amount,fecha_emision:issued,fecha_vencimiento:due,banco:checksField('checksBank'),numero_o_id:checksField('checksNumber'),titular:checksField('checksHolder'),cuit_emisor:checksField('checksIssuerCuit'),cuit_receptor:checksField('checksReceiverCuit'),observacion:checksField('checksNote'),origen:old?.origen||'Manual',cc_client_id:old?.cc_client_id||'',cc_movement_id:old?.cc_movement_id||'',cc_fecha_pago:old?.cc_fecha_pago||'',forma_pago:old?.forma_pago||'',created_at:old?.created_at||now,updated_at:now,device_id:old?.device_id||cashIdentity().id,anulado_at:status==='Anulado'?(old?.anulado_at||now):null};
    if(!['fisico','echeq'].includes(item.tipo_valor)||!['recibido','entregado'].includes(item.movimiento))throw new Error('Tipo o movimiento inválido.');
    if(idx>=0)items[idx]=item;else items.push(item);checksWrite(items);checksCloseForm();checksNotice('Valor guardado en este dispositivo.');checksRender();
  }catch(e){checksNotice(e.message);}
}
function checksSetStatus(id,status){
  if(!CHECKS_STATES.includes(status))return;
  try{const items=checksRead(),item=items.find(x=>x.id===id);if(!item)return;
    if(status==='Anulado'&&!confirm('¿Anular este valor? La ficha quedará en la agenda.')){checksRender();return;}
    item.estado=status;item.anulado_at=status==='Anulado'?(item.anulado_at||new Date().toISOString()):null;item.updated_at=new Date().toISOString();checksWrite(items);checksNotice('Estado actualizado. No modifica Cuenta Corriente ni Caja.');checksRender();
  }catch(e){checksNotice(e.message);checksRender();}
}
function checksDelete(id){if(!confirm('¿Eliminar definitivamente este valor de la agenda local? No elimina el pago de Cuenta Corriente.'))return;
  try{checksWrite(checksRead().filter(x=>x.id!==id));if(checksEditingId===id)checksCloseForm();checksNotice('Valor eliminado de la agenda local.');checksRender();}catch(e){checksNotice(e.message);}
}
function checksAlert(item){if(item.estado==='Anulado')return 'void';if(item.estado==='Rechazado')return 'rejected';if(item.estado==='Cobrado / acreditado')return 'paid';if(!checksOpen(item))return 'normal';const n=checksDaysUntil(item.fecha_vencimiento);return n<0?'overdue':n===0?'today':n<=7?'soon':'normal';}
function checksMatch(item){
  const search=(document.getElementById('checksSearch')?.value||'').trim().toLocaleLowerCase('es');
  if(search&&!['cliente_proveedor','banco','numero_o_id','observacion','estado','fecha_vencimiento','fecha_emision','titular'].some(k=>String(item[k]||'').toLocaleLowerCase('es').includes(search))&&!checksMoney(item.importe_cents).includes(search))return false;
  const dateFilter=document.getElementById('checksDateFilter')?.value||'all',n=checksDaysUntil(item.fecha_vencimiento);
  if(dateFilter==='today'&&(!checksOpen(item)||n!==0)||dateFilter==='next7'&&(!checksOpen(item)||n<0||n>7)||dateFilter==='overdue'&&(!checksOpen(item)||n>=0)||dateFilter==='month'&&item.fecha_vencimiento.slice(0,7)!==cashToday().slice(0,7))return false;
  const state=document.getElementById('checksStateFilter')?.value||'all';if(state==='active'&&!checksOpen(item)||state!=='all'&&state!=='active'&&item.estado!==state)return false;
  const type=document.getElementById('checksTypeFilter')?.value||'all';if(type==='received'&&item.movimiento!=='recibido'||type==='delivered'&&item.movimiento!=='entregado'||['fisico','echeq'].includes(type)&&item.tipo_valor!==type)return false;
  return true;
}
function checksShowQuick(filter){document.getElementById('checksDateFilter').value=filter;checksRender();}
function checksRender(){
  const list=document.getElementById('checksList'),metrics=document.getElementById('checksMetrics');if(!list||!metrics)return;
  let items;try{items=checksRead();}catch(e){checksNotice(e.message);list.textContent='Agenda no disponible';metrics.textContent='';return;}
  const sum=filter=>items.filter(filter).reduce((n,x)=>n+x.importe_cents,0);
  const figures=[['En cartera',sum(x=>x.movimiento==='recibido'&&checksOpen(x))],['Próximos 7 días',sum(x=>checksOpen(x)&&checksDaysUntil(x.fecha_vencimiento)>=0&&checksDaysUntil(x.fecha_vencimiento)<=7)],['Vencidos pendientes',sum(x=>checksOpen(x)&&checksDaysUntil(x.fecha_vencimiento)<0)],['Cobrados / acreditados',sum(x=>x.estado==='Cobrado / acreditado')],['Rechazados',sum(x=>x.estado==='Rechazado')]];
  metrics.innerHTML=figures.map(([name,amount])=>`<div><small>${esc(name)}</small><strong>${esc(checksMoney(amount))}</strong></div>`).join('');
  const visible=items.filter(checksMatch).sort((a,b)=>Number(checksOpen(b))-Number(checksOpen(a))||a.fecha_vencimiento.localeCompare(b.fecha_vencimiento)||b.created_at.localeCompare(a.created_at));
  list.innerHTML=visible.map(x=>`<article class="checks-row" data-alert="${checksAlert(x)}"><div class="checks-row-main"><strong>${esc(checksDate(x.fecha_vencimiento))} · ${esc(checksMoney(x.importe_cents))}</strong><small>${esc(x.estado)}</small></div><div class="checks-row-sub">${esc(x.cliente_proveedor)}${x.banco?' · '+esc(x.banco):''}${x.numero_o_id?' · '+esc(x.numero_o_id):''}</div><div><span class="checks-row-tag">${x.tipo_valor==='echeq'?'eCheq':'Físico'}</span><span class="checks-row-tag">${esc(x.movimiento)}</span>${x.origen==='Cuenta Corriente'?'<span class="checks-row-tag">Cuenta Corriente</span>':''}</div><div class="checks-row-actions"><button type="button" class="btn btn-back" onclick="checksOpenForm('${esc(x.id)}')">Editar</button><select aria-label="Estado de ${esc(x.cliente_proveedor)}" onchange="checksSetStatus('${esc(x.id)}',this.value)">${CHECKS_STATES.map(st=>`<option value="${esc(st)}" ${st===x.estado?'selected':''}>${esc(st)}</option>`).join('')}</select><button type="button" class="btn btn-back" onclick="checksCopyOne('${esc(x.id)}')">Copiar</button><button type="button" class="btn btn-back" onclick="checksSetStatus('${esc(x.id)}','Anulado')">Anular</button><button type="button" class="btn btn-back" onclick="checksDelete('${esc(x.id)}')">Eliminar</button></div></article>`).join('')||'<p class="gestion-help">No hay valores para estos filtros.</p>';
}
function checksLine(item){return `${checksDate(item.fecha_vencimiento)} · ${checksMoney(item.importe_cents)} · ${item.cliente_proveedor}${item.banco?' · '+item.banco:''} · ${item.tipo_valor==='echeq'?'eCheq':'Físico'} · ${item.estado}`;}
function checksSummary(){const items=checksRead(),up=items.filter(x=>checksOpen(x)&&checksDaysUntil(x.fecha_vencimiento)>=0&&checksDaysUntil(x.fecha_vencimiento)<=7).sort((a,b)=>a.fecha_vencimiento.localeCompare(b.fecha_vencimiento)),over=items.filter(x=>checksOpen(x)&&checksDaysUntil(x.fecha_vencimiento)<0).sort((a,b)=>a.fecha_vencimiento.localeCompare(b.fecha_vencimiento));return ['Agenda de cheques y valores','',`Vencen próximos 7 días:`,...(up.length?up.map(checksLine):['Sin valores']),'',`Vencidos pendientes:`,...(over.length?over.map(checksLine):['Sin valores'])].join('\n');}
async function checksCopy(text){try{await navigator.clipboard.writeText(text);checksNotice('Resumen copiado.');}catch{checksNotice('No se pudo copiar. Revisá el permiso del portapapeles.');}}
function checksCopySummary(){checksCopy(checksSummary());}
function checksCopyOne(id){const x=checksRead().find(x=>x.id===id);if(x)checksCopy(checksLine(x));}

// La vinculación es local e idempotente por ID del movimiento de Cuenta Corriente.
function checksFromCC(movement,client,draft){
  const items=checksRead(),idx=items.findIndex(x=>x.origen==='Cuenta Corriente'&&x.cc_movement_id===movement.id),old=idx>=0?items[idx]:null,now=new Date().toISOString();
  const item={...(old||{}),id:old?.id||'chk_'+crypto.randomUUID(),tipo_valor:draft.tipo, movimiento:'recibido',estado:old?.estado||checksInitialStatus(draft.tipo,'recibido'),cliente_proveedor:client.cliente,importe_cents:movement.amount_cents,fecha_emision:old?.fecha_emision||'',fecha_vencimiento:draft.fecha,banco:draft.banco,numero_o_id:draft.numero,titular:draft.titular,cuit_emisor:old?.cuit_emisor||'',cuit_receptor:old?.cuit_receptor||'',observacion:draft.observacion,origen:'Cuenta Corriente',cc_client_id:String(movement.client_id),cc_movement_id:movement.id,cc_fecha_pago:movement.date,forma_pago:'Cheque',created_at:old?.created_at||now,updated_at:now,device_id:old?.device_id||cashIdentity().id,anulado_at:old?.anulado_at||null};
  if(idx>=0)items[idx]=item;else items.push(item);checksWrite(items);return item;
}
function checksCCVisible(){const panel=document.getElementById('ccChequePanel');if(panel)panel.hidden=document.getElementById('ccKind')?.value!=='payment'||document.getElementById('ccMethod')?.value!=='Cheque';}
function checksCCAttach(){const grid=document.querySelector('#ccMovementForm .cc-entry-grid');if(!grid)return;
  if(document.getElementById('ccChequePanel'))return;
  grid.insertAdjacentHTML('afterend',`<section id="ccChequePanel" hidden><h4>Datos del cheque / valor</h4><div class="checks-cc-grid"><label>Tipo<select id="ccChequeTipo"><option value="fisico">Cheque físico</option><option value="echeq">eCheq</option></select></label><label>Fecha de pago / vencimiento *<input id="ccChequeFecha" type="date"></label><label>Banco<input id="ccChequeBanco" maxlength="100"></label><label>Número / ID eCheq<input id="ccChequeNumero" maxlength="120"></label><label>Titular<input id="ccChequeTitular" maxlength="160"></label><label>Observación<input id="ccChequeObs" maxlength="500"></label></div><label class="checks-cc-option"><input id="ccChequeAgendar" type="checkbox" checked> Agendar en Cheques y valores (local en este dispositivo)</label><p class="gestion-help">El pago de Cuenta Corriente se registra como siempre. El cheque no afecta Caja ni bancos.</p></section>`);
  document.getElementById('ccMethod').addEventListener('change',checksCCVisible);checksCCVisible();
}
const checksPreviousOpenForm=ccOpenForm;
ccOpenForm=function(kind){checksPreviousOpenForm(kind);checksCCAttach();};
const checksPreviousSwitchKind=ccSwitchKind;
ccSwitchKind=function(){checksPreviousSwitchKind();checksCCVisible();};
const checksPreviousEdit=ccEditMovement;
ccEditMovement=function(id){checksPreviousEdit(id);const m=ccBook.movements.find(x=>x.id===id);let item=null;try{item=checksRead().find(x=>x.cc_movement_id===id&&x.origen==='Cuenta Corriente');}catch(e){ccNotice(e.message);}if(!m||!document.getElementById('ccChequePanel'))return;
  checksCCVisible();if(item){for(const [key,value] of Object.entries({ccChequeTipo:item.tipo_valor,ccChequeFecha:item.fecha_vencimiento,ccChequeBanco:item.banco,ccChequeNumero:item.numero_o_id,ccChequeTitular:item.titular,ccChequeObs:item.observacion}))document.getElementById(key).value=value;document.getElementById('ccChequeAgendar').checked=true;}
};
const checksPreviousSaveMovement=ccSaveMovement;
ccSaveMovement=function(){
  const active=document.getElementById('ccKind')?.value==='payment'&&document.getElementById('ccMethod')?.value==='Cheque'&&document.getElementById('ccChequeAgendar')?.checked;
  let draft=null;
  if(active){draft={tipo:checksField('ccChequeTipo'),fecha:checksField('ccChequeFecha'),banco:checksField('ccChequeBanco'),numero:checksField('ccChequeNumero'),titular:checksField('ccChequeTitular'),observacion:checksField('ccChequeObs')};
    if(!['fisico','echeq'].includes(draft.tipo)||!cashValidDate(draft.fecha)){ccNotice('Para agendar el cheque, ingresá una fecha de pago / vencimiento válida.');return;}}
  const before=new Set(ccBook.movements.map(x=>x.id)),editId=ccEditingId,revision=ccBook.revision,client=ccClient();
  checksPreviousSaveMovement();
  if(!active||ccBook.revision===revision)return;
  const movement=editId?ccBook.movements.find(x=>x.id===editId):ccBook.movements.find(x=>!before.has(x.id)&&x.type==='payment');
  if(!movement||movement.voided_at||movement.payment_method!=='Cheque')return;
  try{checksFromCC(movement,client,draft);ccNotice('Pago guardado en Cuenta Corriente. Cheque agendado localmente en este dispositivo.');checksRender();}
  catch(e){ccNotice('El pago quedó guardado en Cuenta Corriente, pero no se pudo agendar el cheque: '+e.message+'. Editá el pago para reintentar.');}
};
const checksPreviousShowScreen=showScreen;
showScreen=function(id,options){checksPreviousShowScreen(id,options);if(id==='chequesScreen')checksRender();};
