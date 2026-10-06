/* Pancko Gestión · Comandas v0.12.27. Operación local, aislada de caja/ventas/sync. */
'use strict';
const COMANDAS_HISTORY_KEY='pk_comandas_history_v1';
const COMANDAS_MODELS_KEY='pk_comandas_models_v1';
const COMANDAS_DRAFT_KEY='pk_comandas_draft_v1';
const comandasRead=(key,fallback)=>{try{const value=JSON.parse(localStorage.getItem(key));return value===null?fallback:value;}catch(e){return fallback;}};
const comandasClone=value=>JSON.parse(JSON.stringify(value));
const comandasId=()=>typeof crypto!=='undefined'&&crypto.randomUUID?crypto.randomUUID():'cmd_'+Date.now()+'_'+Math.random().toString(36).slice(2);
const comandasEmpty=()=>({id:null,createdAt:new Date().toISOString(),to:'Depósito / hermano',note:'',lines:[]});
let comandasDraft=(()=>{const value=comandasRead(COMANDAS_DRAFT_KEY,null);return value&&Array.isArray(value.lines)?value:comandasEmpty();})();
let comandasView='draft';
let comandasExpandedId=null;
let comandasSelectedArticle=null;
function comandasNotice(text){const el=document.getElementById('comandasNotice');if(el)el.textContent=text||'';}
function comandasWrite(key,value){try{localStorage.setItem(key,JSON.stringify(value));return true;}catch(e){comandasNotice('No se pudo guardar en este dispositivo. Revisá el espacio disponible.');return false;}}
function comandasHistoryData(){const rows=comandasRead(COMANDAS_HISTORY_KEY,[]);return Array.isArray(rows)?rows:[];}
function comandasModelsData(){const rows=comandasRead(COMANDAS_MODELS_KEY,[]);return Array.isArray(rows)?rows:[];}
function comandasPersistDraft(){return comandasWrite(COMANDAS_DRAFT_KEY,comandasDraft);}
function comandasDate(iso){const d=new Date(iso);return Number.isNaN(d.getTime())?'Fecha no disponible':d.toLocaleString('es-AR',{day:'2-digit',month:'2-digit',year:'numeric',hour:'2-digit',minute:'2-digit',hourCycle:'h23'}).replace(',','');}
function comandasFormatNumber(value){return String(value).replace('.',',');}
function comandasClean(text){return String(text||'').trim().replace(/\s+/g,' ');}
function comandasPresentation(name){
  const match=String(name||'').match(/(?:^|\s)(\d+(?:[.,]\d+)?)\s*(LTS?|LT|L|KGS?|KG|GRS?|GR|G)\s*$/i);
  if(!match)return null;
  const raw=match[2].toUpperCase(),unit=/^L/.test(raw)?'L':/^K/.test(raw)?'kg':'g';
  return {size:Number(match[1].replace(',','.')),unit,label:comandasFormatNumber(match[1])+' '+unit,family:comandasClean(name.slice(0,match.index))};
}
function comandasQueryWords(value){
  return normKey(value).replace(/\bREC\b/g,'RECUPLAST').replace(/\bBL\b/g,'BLANCO').split(' ').filter(Boolean);
}
function comandasFamilyMatches(query,family){
  const words=comandasQueryWords(query),candidate=normKey(family).split(' ');
  return words.length>0&&words.every(w=>candidate.some(c=>c===w||c.startsWith(w)&&w.length>=3));
}
function comandasResolve(query,requests,catalog){
  const groups=new Map();
  for(const article of catalog||[]){
    const name=String(article.ARTIC||'');const pres=comandasPresentation(name);
    if(!pres||!comandasFamilyMatches(query,pres.family))continue;
    const family=normKey(pres.family);
    if(!groups.has(family))groups.set(family,[]);
    groups.get(family).push({article,pres});
  }
  if(groups.size!==1)return null;
  const group=[...groups.values()][0],lines=[];
  for(const request of requests){
    const found=group.filter(x=>x.pres.unit.toUpperCase()===request.unit.toUpperCase()&&Math.abs(x.pres.size-request.size)<0.00001);
    if(found.length!==1)return null;
    lines.push({id:comandasId(),cod:String(found[0].article.COD||''),product:found[0].pres.family,presentation:found[0].pres.label,qty:request.qty,request:'',obs:'',implicit:!!request.implicit});
  }
  return lines;
}
function comandasParseQuick(value,catalog){
  const text=comandasClean(value);if(!text)return [];
  const matches=[...text.matchAll(/(\d+)\s*[x×]\s*(\d+(?:[.,]\d+)?)\s*(LTS?|LT|L|KGS?|KG|GRS?|GR|G)?\b/gi)];
  if(matches.length){
    const query=text.slice(0,matches[0].index).trim();
    let pos=matches[0].index;const requests=[];
    for(const m of matches){
      if(m.index!==pos&&!/^[\s+;,y]+$/i.test(text.slice(pos,m.index)))return [comandasFreeLine(text)];
      const qty=Number(m[1]),size=Number(m[2].replace(',','.'));
      if(!qty||!size)return [comandasFreeLine(text)];
      requests.push({qty,size,unit:m[3]?(/^(L)/i.test(m[3])?'L':/^(K)/i.test(m[3])?'kg':'g'):'L'});pos=m.index+m[0].length;
    }
    if(query&&!text.slice(pos).trim())return comandasResolve(query,requests,catalog)||[comandasFreeLine(text)];
  }
  const list=text.match(/^(.*?)\s+((?:\d+(?:[.,]\d+)?\s*(?:y|\+)\s*)+\d+(?:[.,]\d+)?)\s*(kg|kgs?|l|lts?|grs?|g)\s*$/i);
  if(list){
    const sizes=list[2].split(/\s*(?:y|\+)\s*/i).map(x=>Number(x.replace(',','.')));
    const unit=/^l/i.test(list[3])?'L':/^k/i.test(list[3])?'kg':'g';
    if(sizes.every(n=>n>0))return comandasResolve(list[1],sizes.map(size=>({size,unit,qty:1,implicit:true})),catalog)||[comandasFreeLine(text)];
  }
  const generic=text.match(/^(.*?)\s+(traer los que haya|los que haya|traer surtido|traer algunos|surtido|algunos|traer|libre)\s*$/i);
  if(generic&&generic[1]){
    if(normKey(generic[1])==='TRAER')return [{...comandasFreeLine('Pedido general'),request:text}];
    const matches=(catalog||[]).filter(p=>comandasFamilyMatches(generic[1],comandasPresentation(p.ARTIC)?.family||p.ARTIC));
    const families=new Set(matches.map(p=>normKey(comandasPresentation(p.ARTIC)?.family||p.ARTIC)));
    const name=families.size===1&&matches.length?comandasPresentation(matches[0].ARTIC)?.family||matches[0].ARTIC:comandasClean(generic[1]);
    return [{...comandasFreeLine(name),request:generic[2]}];
  }
  return [comandasFreeLine(text)];
}
function comandasFreeLine(text=''){return {id:comandasId(),cod:'',product:comandasClean(text),presentation:'',qty:'',request:'traer',obs:'',implicit:false};}
function comandasDraftField(){comandasDraft.to=document.getElementById('comandasTo').value.trim();comandasDraft.note=document.getElementById('comandasNote').value.trim();comandasPersistDraft();}
// El primer nivel replica la coincidencia por texto completo de la carga rápida de Presupuestos.
// El segundo encuentra palabras abreviadas ("int mate bl") sin exigir prefijos de cada palabra.
function comandasCatalogMatches(query,catalog){
  const q=normKey(query),words=q.split(' ').filter(Boolean);
  if(q.length<2)return [];
  return (catalog||[]).map((p,index)=>{
    const name=normKey(p.ARTIC),cod=normKey(p.COD),tokens=name.split(' ');
    const score=cod===q?1000:cod.startsWith(q)?900:name.startsWith(q)?800:name.includes(q)?700:
      words.every(w=>tokens.some(t=>t.includes(w)))?500+words.reduce((n,w)=>n+(tokens.some(t=>t.startsWith(w))?10:0),0):0;
    return {p,index,score};
  }).filter(x=>x.score).sort((a,b)=>b.score-a.score||a.index-b.index).slice(0,24).map(x=>x.p);
}
function comandasSearch(){
  const input=document.getElementById('comandasProduct'),box=document.getElementById('comandasMatches');
  comandasSelectedArticle=null;
  const rows=comandasCatalogMatches(comandasClean(input.value),typeof products!=='undefined'?products:[]);
  box.innerHTML=rows.length?rows.map(p=>`<button type="button" data-cod="${esc(p.COD)}" onclick="comandasSelectArticle(this.dataset.cod)"><strong>${esc(p.ARTIC)}</strong><small>${esc(p.COD)}</small></button>`).join(''):'';
  document.getElementById('comandasClearProduct').hidden=!input.value;
}
function comandasSelectArticle(cod){
  const p=(typeof products!=='undefined'?products:[]).find(x=>String(x.COD)===String(cod));if(!p)return;
  comandasSelectedArticle=p;
  document.getElementById('comandasProduct').value=String(p.ARTIC);
  document.getElementById('comandasClearProduct').hidden=false;
  document.getElementById('comandasMatches').innerHTML='';
  document.getElementById('comandasQuantity').focus();
}
function comandasClearProduct(){
  comandasSelectedArticle=null;
  document.getElementById('comandasProduct').value='';
  document.getElementById('comandasMatches').innerHTML='';
  document.getElementById('comandasClearProduct').hidden=true;
  document.getElementById('comandasProduct').focus();
}
function comandasEntryLine(product,quantity,selected,catalog){
  const raw=comandasClean(product),text=/^TINTA\s+([A-Z])$/i.test(raw)?'TINTE '+raw.slice(-1).toUpperCase():raw,amount=comandasClean(quantity);
  if(!text||!amount)return null;
  const pres=selected&&comandasPresentation(selected.ARTIC),family=pres?.family||text;
  const line={...comandasFreeLine(family),cod:selected?String(selected.COD||''):'',presentation:pres?.label||'',request:''};
  if(/^\d+$/.test(amount)&&Number(amount)>0){line.qty=Number(amount);return line;}
  const exact=amount.match(/^(\d+)\s*[x×*]\s*(\d+(?:[.,]\d+)?)\s*(LTS?|LT|L|KGS?|KG|GRS?|GR|G)?$/i);
  if(exact&&Number(exact[1])>0&&Number(exact[2].replace(',','.'))>0){
    const unit=exact[3]?/^L/i.test(exact[3])?'L':/^K/i.test(exact[3])?'kg':'g':pres?.unit||'L';
    const size=Number(exact[2].replace(',','.'));
    line.qty=Number(exact[1]);line.presentation=comandasFormatNumber(size)+' '+unit;
    if(selected&&(!pres||pres.size!==size||pres.unit!==unit)){
      const peers=(catalog||[]).filter(p=>{
        const x=comandasPresentation(p.ARTIC);
        return x&&normKey(x.family)===normKey(family)&&x.size===size&&x.unit===unit;
      });
      line.cod=peers.length===1?String(peers[0].COD||''):'';
    }
    return line;
  }
  line.request=amount;return line;
}
function comandasAddQuick(){
  const product=document.getElementById('comandasProduct'),quantity=document.getElementById('comandasQuantity');
  const line=comandasEntryLine(product.value,quantity.value,comandasSelectedArticle,typeof products!=='undefined'?products:[]);
  if(!line){comandasNotice('Completá producto y cantidad o pedido.');return;}
  comandasDraft.lines.push(line);
  if(!comandasPersistDraft()){comandasDraft.lines.pop();return;}
  comandasSelectedArticle=null;product.value='';quantity.value='';
  document.getElementById('comandasClearProduct').hidden=true;
  document.getElementById('comandasMatches').innerHTML='';
  comandasExpandedId=null;comandasRenderLines();comandasNotice('Agregado a la comanda.');product.focus();
}
function comandasAddBlank(){const line=comandasFreeLine();comandasDraft.lines.push(line);comandasExpandedId=line.id;comandasPersistDraft();comandasRenderLines();}
function comandasLineSummary(line){
  const qty=Number(line.qty),presentation=comandasClean(line.presentation);
  const detail=line.qty!==''&&Number.isInteger(qty)&&qty>0?(line.implicit&&qty===1&&presentation?presentation:presentation?`${qty} × ${presentation}`:`${qty} ${qty===1?'unidad':'unidades'}`):comandasClean(line.request)||'Cantidad a definir';
  return detail+(line.obs?' · Con observación':'');
}
function comandasToggle(index){
  const line=comandasDraft.lines[index];if(!line)return;
  comandasExpandedId=comandasExpandedId===line.id?null:line.id;
  comandasRenderLines();
  if(comandasExpandedId)document.getElementById('comandasLineToggle'+index)?.scrollIntoView?.({block:'nearest'});
}
function comandasChange(index,field,value){
  const line=comandasDraft.lines[index];if(!line)return;
  if(field==='qty'){
    line.qty=value===''?'':(/^\d+$/.test(value)&&Number(value)>0?Number(value):value);line.implicit=false;
    if(value!==''&&(!/^\d+$/.test(value)||Number(value)<1))comandasNotice('La cantidad debe ser un número entero positivo.');
    if(value!==''){line.request='';document.querySelector(`#comandasLine${index} [data-field="request"]`).value='';}
  }else if(field==='request'){
    line.request=value.slice(0,100);
    if(value.trim()){line.qty='';document.querySelector(`#comandasLine${index} [data-field="qty"]`).value='';}
  }else{line[field]=value.slice(0,field==='obs'?350:160);if(field==='product'||field==='presentation')line.cod='';}
  comandasPersistDraft();
  const title=document.getElementById('comandasLineTitle'+index),summary=document.getElementById('comandasLineSummary'+index);
  if(title)title.textContent=comandasClean(line.product)||'Ítem sin nombre';
  if(summary)summary.textContent=comandasLineSummary(line);
}
function comandasRemove(index){const [removed]=comandasDraft.lines.splice(index,1);if(removed?.id===comandasExpandedId)comandasExpandedId=null;comandasPersistDraft();comandasRenderLines();}
function comandasRenderLines(){
  const box=document.getElementById('comandasLines');if(!box)return;
  const count=document.getElementById('comandasLineCount');if(count)count.textContent=`${comandasDraft.lines.length} ${comandasDraft.lines.length===1?'ítem':'ítems'}`;
  box.innerHTML=comandasDraft.lines.length?comandasDraft.lines.map((x,i)=>`<div class="comandas-line ${comandasExpandedId===x.id?'is-open':''}" id="comandasLine${i}">
    <button type="button" class="comandas-line-toggle" id="comandasLineToggle${i}" aria-expanded="${comandasExpandedId===x.id}" aria-controls="comandasLineEditor${i}" onclick="comandasToggle(${i})"><span class="comandas-line-title" id="comandasLineTitle${i}">${esc(comandasClean(x.product)||'Ítem sin nombre')}</span><span class="comandas-line-summary" id="comandasLineSummary${i}">${esc(comandasLineSummary(x))}</span><span class="comandas-line-chevron" aria-hidden="true">⌄</span></button>
    <div class="comandas-line-editor" id="comandasLineEditor${i}"><div class="comandas-line-head"><strong>Ítem ${i+1}${x.cod?' · COD '+esc(x.cod):' · texto libre'}</strong><button class="btn btn-back" onclick="comandasRemove(${i})" aria-label="Eliminar ítem ${i+1}">Eliminar</button></div>
    <div class="comandas-line-grid"><label>Producto<input value="${esc(x.product)}" oninput="comandasChange(${i},'product',this.value)"></label><label>Presentación<input value="${esc(x.presentation)}" placeholder="Ej. 4 L / 5 kg" oninput="comandasChange(${i},'presentation',this.value)"></label><label>Cantidad exacta<input data-field="qty" type="number" min="1" step="1" value="${esc(x.qty)}" placeholder="Sin cantidad" oninput="comandasChange(${i},'qty',this.value)"></label><label>Pedido genérico<input data-field="request" list="comandasRequests" value="${esc(x.request)}" placeholder="Traer / surtido / los que haya" oninput="comandasChange(${i},'request',this.value)"></label><label class="comandas-line-note">Observación<input value="${esc(x.obs)}" placeholder="Opcional" oninput="comandasChange(${i},'obs',this.value)"></label></div>
    </div></div>`).join(''):'<p class="gestion-help">Todavía no hay productos. Escribí una frase o buscá en el catálogo.</p>';
}
function comandasTab(view){comandasView=view;comandasRender();}
function comandasRender(){
  const to=document.getElementById('comandasTo');if(!to)return;
  for(const view of ['draft','history','models']){
    document.getElementById('comandas'+view[0].toUpperCase()+view.slice(1)+'Panel').hidden=view!==comandasView;
    document.getElementById('comandasTab'+view[0].toUpperCase()+view.slice(1)).classList.toggle('btn-primary',view===comandasView);
  }
  to.value=comandasDraft.to;document.getElementById('comandasNote').value=comandasDraft.note;
  document.getElementById('comandasDate').textContent=comandasDate(comandasDraft.createdAt);
  comandasRenderLines();comandasRenderHistory();comandasRenderModels();
}
function comandasNew(){
  if(comandasDraft.lines.length&&!comandasDraft.id&&!confirm('¿Descartar la comanda en curso sin guardar?'))return;
  comandasDraft=comandasEmpty();comandasExpandedId=null;comandasPersistDraft();comandasTab('draft');comandasNotice('Nueva comanda lista.');
}
function comandasValidated(){
  const lines=comandasDraft.lines.map(x=>({...x,product:comandasClean(x.product),presentation:comandasClean(x.presentation),request:comandasClean(x.request),obs:comandasClean(x.obs)}));
  if(!lines.length){comandasNotice('Agregá al menos un ítem.');return null;}
  if(lines.some(x=>!x.product||x.qty!==''&&(!Number.isInteger(Number(x.qty))||Number(x.qty)<1))){comandasNotice('Revisá los productos y las cantidades.');return null;}
  return lines;
}
function comandasSave(){
  comandasDraftField();const lines=comandasValidated();if(!lines)return null;
  const history=comandasHistoryData(),id=comandasDraft.id||comandasId();
  const old=history.find(x=>x.id===id);
  if(old&&old.status!=='pending'){comandasNotice('Esta comanda ya está cerrada. Duplicala para preparar otra.');return null;}
  const item={id,createdAt:old?.createdAt||comandasDraft.createdAt,to:comandasDraft.to||'Depósito / hermano',note:comandasDraft.note,lines:comandasClone(lines),status:'pending',updatedAt:new Date().toISOString()};
  const next=[item,...history.filter(x=>x.id!==id)];
  if(!comandasWrite(COMANDAS_HISTORY_KEY,next))return null;
  comandasDraft.id=id;comandasPersistDraft();comandasRenderHistory();comandasNotice('Comanda guardada en este dispositivo.');return item;
}
function comandasMessage(record){
  const date=comandasDate(record.createdAt),groups=new Map();
  for(const line of record.lines||[]){
    const key=comandasClean(line.product).toLocaleUpperCase('es-AR');
    if(!groups.has(key))groups.set(key,[]);
    const quantity=Number(line.qty),presentation=comandasClean(line.presentation);
    let detail=line.qty!==''&&quantity>0?(line.implicit&&quantity===1&&presentation?presentation:presentation?`${quantity} x ${presentation}`:`${quantity} ${quantity===1?'unidad':'unidades'}`):comandasClean(line.request)||'traer';
    if(line.obs)detail+=` — ${comandasClean(line.obs)}`;
    groups.get(key).push('• '+detail);
  }
  const body=[`Comanda depósito - Pancko`,`Fecha: ${date}`,`Para: ${comandasClean(record.to)||'Depósito / hermano'}`,''];
  for(const [name,details] of groups)body.push(name,...details,'');
  if(record.note)body.push('Observación:',comandasClean(record.note));
  return body.join('\n').trim();
}
function comandasWhatsApp(record){window.open('https://wa.me/?text='+encodeURIComponent(comandasMessage(record)),'_blank');}
function comandasSend(){const record=comandasSave();if(record)comandasWhatsApp(record);}
function comandasHistoryAction(id,action){
  const history=comandasHistoryData(),item=history.find(x=>x.id===id);if(!item)return;
  if(action==='send'){comandasWhatsApp(item);return;}
  if(action==='duplicate'){comandasDraft={...comandasEmpty(),to:item.to,note:item.note,lines:comandasClone(item.lines).map(x=>({...x,id:comandasId()}))};comandasExpandedId=null;comandasPersistDraft();comandasTab('draft');comandasNotice('Copia creada como nueva comanda.');return;}
  if(action==='model'){comandasStoreModel(item);return;}
  if(item.status!=='pending')return;
  if(action==='annul'&&!confirm('¿Anular esta comanda? Quedará en el historial.'))return;
  if(action==='received'||action==='annul'){
    item.status=action==='received'?'received':'annulled';item.closedAt=new Date().toISOString();
    if(!comandasWrite(COMANDAS_HISTORY_KEY,history))return;
    if(comandasDraft.id===item.id){comandasDraft=comandasEmpty();comandasExpandedId=null;comandasPersistDraft();}
    comandasRenderHistory();comandasNotice(action==='received'?'Comanda marcada como recibida.':'Comanda anulada.');
  }
}
function comandasRenderHistory(){
  const box=document.getElementById('comandasHistory');if(!box)return;
  const rows=comandasHistoryData();box.innerHTML=rows.length?rows.map(item=>`<div class="card comandas-history-item"><div class="comandas-line-head"><strong>${esc(comandasDate(item.createdAt))} · ${esc(item.to)}</strong><span class="comandas-status">${item.status==='received'?'Recibida':item.status==='annulled'?'Anulada':'Pendiente'}</span></div><details><summary>Ver comanda (${(item.lines||[]).length} ítems)</summary><pre>${esc(comandasMessage(item))}</pre></details><div class="gestion-actions"><button class="btn btn-primary" onclick="comandasHistoryAction('${esc(item.id)}','send')">Reenviar WhatsApp</button><button class="btn btn-back" onclick="comandasHistoryAction('${esc(item.id)}','duplicate')">Duplicar</button><button class="btn btn-back" onclick="comandasHistoryAction('${esc(item.id)}','model')">Guardar modelo</button>${item.status==='pending'?`<button class="btn btn-back" onclick="comandasHistoryAction('${esc(item.id)}','received')">Marcar recibida</button><button class="btn btn-back" onclick="comandasHistoryAction('${esc(item.id)}','annul')">Anular</button>`:''}</div></div>`).join(''):'<div class="card"><p class="gestion-help">Todavía no hay comandas guardadas en este dispositivo.</p></div>';
}
function comandasStoreModel(source){
  const name=prompt('Nombre del modelo frecuente:',source.name||'Reposición depósito');if(!name?.trim())return;
  const models=comandasModelsData();models.unshift({id:comandasId(),name:name.trim().slice(0,100),to:source.to,note:source.note,lines:comandasClone(source.lines)});
  if(comandasWrite(COMANDAS_MODELS_KEY,models)){comandasRenderModels();comandasNotice('Modelo guardado en este dispositivo.');}
}
function comandasModelFromDraft(){comandasDraftField();const lines=comandasValidated();if(lines)comandasStoreModel({...comandasDraft,lines});}
function comandasUseModel(id){const model=comandasModelsData().find(x=>x.id===id);if(!model)return;
  if(comandasDraft.lines.length&&!confirm('¿Reemplazar la comanda en curso por este modelo?'))return;
  comandasDraft={...comandasEmpty(),to:model.to,note:model.note,lines:comandasClone(model.lines).map(x=>({...x,id:comandasId()}))};comandasExpandedId=null;comandasPersistDraft();comandasTab('draft');comandasNotice('Modelo cargado. Podés ajustar las cantidades.');
}
function comandasDeleteModel(id){if(!confirm('¿Eliminar este modelo? Las comandas del historial se conservan.'))return;
  if(comandasWrite(COMANDAS_MODELS_KEY,comandasModelsData().filter(x=>x.id!==id)))comandasRenderModels();
}
function comandasRenderModels(){const box=document.getElementById('comandasModels');if(!box)return;
  const rows=comandasModelsData();box.innerHTML=rows.length?rows.map(x=>`<div class="card comandas-history-item"><div class="comandas-line-head"><strong>${esc(x.name)}</strong><span>${(x.lines||[]).length} ítems</span></div><details><summary>Ver modelo</summary><pre>${esc(comandasMessage({...x,createdAt:new Date().toISOString()}))}</pre></details><div class="gestion-actions"><button class="btn btn-primary" onclick="comandasUseModel('${esc(x.id)}')">Usar modelo</button><button class="btn btn-back" onclick="comandasDeleteModel('${esc(x.id)}')">Eliminar modelo</button></div></div>`).join(''):'<div class="card"><p class="gestion-help">Guardá una comanda habitual como modelo para volver a cargarla con un toque.</p></div>';
}
