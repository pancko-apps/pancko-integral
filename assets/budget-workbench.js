/* Pancko Gestión v0.12.10 · Comprobante de presupuesto. No cambia reglas del laboratorio. */
'use strict';
function budgetClone(value){return JSON.parse(JSON.stringify(value));}
function budgetBasePrice(item){return Number.isFinite(item.base_price_snapshot)?item.base_price_snapshot:num(item.PR_CON_IVA)-num(item.tintData?.tintCost);}
function budgetProductForItem(item){
 if(item.product_snapshot)return {...item.product_snapshot,PR_CON_IVA:budgetBasePrice(item)};
 if(item.usa_tinto)return {...item,ARTIC:item.base_ARTIC||item.ARTIC,PR_CON_IVA:budgetBasePrice(item)};
 const live=products.find(p=>String(p.COD)===String(item.COD));
 if(live)return {...live,ARTIC:item.base_ARTIC||live.ARTIC,PR_CON_IVA:budgetBasePrice(item)};
 if(item.tintData)return {...item,ARTIC:item.base_ARTIC||item.ARTIC,usa_tinto:'SI',base_tinto:item.tintData.base_formula,base_fisica_tinto:item.tintData.base_fisica,factor_tinto:item.tintData.factor,PR_CON_IVA:budgetBasePrice(item),legacy_snapshot_only:true};
 return {...item,PR_CON_IVA:budgetBasePrice(item)};
}
function budgetTintEntryRule(p){
 if(!isTintableProduct(p))return 'plain';
 const physical=normKey(p.base_fisica_tinto),base=normKey(p.base_tinto);
 if([physical,base].some(b=>['TINT','DEEP','ACCENT'].includes(b)))return 'required';
 if([physical,base].some(b=>['PASTEL','BLANCO','BLANCA'].includes(b)))return 'optional';
 // La descripción es respaldo sólo si no hay una base identificada en el maestro.
 if(!physical&&!base){const name=normKey(p.ARTIC);if(/\b(TINT|DEEP|ACCENT)\b/.test(name))return 'required';if(/\b(PASTEL|BLANCO|BLANCA)\b/.test(name))return 'optional';}
 return 'unknown';
}
function budgetProductMeta(p,field){
 const aliases={brand:['marca','fabricante','brand'],line:['linea','linea_producto','familia'],size:['presentacion','envase','contenido']}[field];
 return Object.entries(p).filter(([k])=>aliases.includes(normalizeHeader(k))).map(([,v])=>String(v||'')).filter(Boolean).join(' ');
}
function budgetProductMatches(query,filters={}){
 const terms=normKey(query).split(/\s+/).filter(Boolean);
 return products.filter(p=>{
  const text=normKey([p.COD,p.ARTIC,budgetProductMeta(p,'brand'),budgetProductMeta(p,'line'),budgetProductMeta(p,'size')].join(' '));
  return terms.every(t=>text.includes(t))&&['brand','line','size'].every(f=>!filters[f]||normKey(budgetProductMeta(p,f)).includes(normKey(filters[f])));
 }).sort(cartQuickProductSort);
}
function budgetHideSuggestions(){const box=document.getElementById('cartQuickProductSuggest');box.hidden=true;box.innerHTML='';document.getElementById('cartQuickProductInput').setAttribute('aria-expanded','false');}
function budgetQuickHint(){
 const q=document.getElementById('cartQuickProductInput').value.trim(),box=document.getElementById('cartQuickProductSuggest');
 if(!q){budgetHideSuggestions();document.getElementById('budgetQuickStatus').textContent='Ingresá un código o varias palabras. Enter agrega o abre el selector.';return;}
 const matches=budgetProductMatches(q),start=normKey(q);
 matches.sort((a,b)=>Number(normKey(b.COD).startsWith(start))-Number(normKey(a.COD).startsWith(start)));
 if(!matches.length){budgetHideSuggestions();document.getElementById('budgetQuickStatus').textContent='No se encontraron artículos para “'+q+'”. Probá con otro código o menos palabras.';return;}
 box.innerHTML=matches.slice(0,8).map(p=>`<button class="budget-suggestion" type="button" role="option" data-code="${esc(p.COD)}" onclick="selectCartQuickProduct(this.dataset.code)"><strong>${esc(p.COD)}</strong><span>${esc(p.ARTIC)}</span><small>${$m(num(p.PR_CON_IVA))}</small></button>`).join('')+(matches.length>8?`<button type="button" class="budget-suggestion-more" onclick="budgetOpenPicker()">Ver los ${matches.length} resultados →</button>`:'');
 box.hidden=false;document.getElementById('cartQuickProductInput').setAttribute('aria-expanded','true');
 document.getElementById('budgetQuickStatus').textContent=matches.length+' coincidencia'+(matches.length===1?'':'s')+' · Enter agrega el código exacto o abre el selector.';
}
function budgetQuickAdd(){
 const q=document.getElementById('cartQuickProductInput').value.trim();if(!q){budgetOpenPicker();return;}
 const exact=products.find(p=>normKey(p.COD)===normKey(q));
 if(exact){selectCartQuickProduct(exact.COD);return;}
 const matches=budgetProductMatches(q);
 if(matches.length===1){selectCartQuickProduct(matches[0].COD);return;}
 if(matches.length){budgetHideSuggestions();budgetOpenPicker(q);return;}
 document.getElementById('budgetQuickStatus').textContent='No se encontraron artículos para “'+q+'”. Probá con otro código o menos palabras.';
}
function budgetAppendProducts(codes,batch=false){
 const selected=[...new Set(codes.map(String))].map(cod=>products.find(p=>String(p.COD)===cod)).filter(Boolean);
 if(!selected.length)return;
 touchCurrentBudgetForEdit();const now=new Date().toISOString();
 const added=selected.map(p=>({...budgetClone(p),uid:'u_'+crypto.randomUUID(),qty:1,extraDiscount:0,base_ARTIC:p.ARTIC,product_snapshot:budgetClone(p),base_price_snapshot:num(p.PR_CON_IVA),added_at:now}));
 cart.push(...added);save();budgetClosePicker();budgetHideSuggestions();
 const input=document.getElementById('cartQuickProductInput');input.value='';input.dataset.cod='';input.dataset.cleared='0';
 renderCart();
 if(batch&&added.length>1){
  const pending=selected.filter(p=>['required','unknown'].includes(budgetTintEntryRule(p))).length;
  document.getElementById('budgetQuickStatus').textContent=added.length+' artículos agregados en líneas separadas.'+(pending?' '+pending+' fórmulas/bases pendientes para revisar desde la grilla.':'');
  input.focus();return;
 }
 const rule=budgetTintEntryRule(selected[0]);document.getElementById('budgetQuickStatus').textContent='Agregado: '+selected[0].ARTIC+(rule==='unknown'?' · Revisá la base antes de aplicar una fórmula.':'');
 if(rule==='required'||rule==='unknown')openTintEditModal(added[0].uid);else input.focus();
}
selectCartQuickProduct=function(cod){budgetAppendProducts([cod]);};
document.addEventListener('pointerdown',event=>{if(!event.target.closest('#cartQuickProductSuggest')&&!event.target.closest('#cartQuickProductInput'))budgetHideSuggestions();});
// El selector pertenece sólo a Presupuestos y conserva el borrador al cerrarse.
function budgetInitPicker(){
 const modal=document.createElement('div');modal.id='budgetProductPicker';modal.className='budget-picker';modal.hidden=true;modal.setAttribute('role','dialog');modal.setAttribute('aria-modal','true');modal.setAttribute('aria-labelledby','budgetPickerTitle');
 modal.innerHTML=`<div class="budget-picker-card"><div class="budget-picker-heading"><div><h2 id="budgetPickerTitle">Buscar artículos</h2><p>Tocá la descripción para agregar uno; marcá las casillas para cargar varios.</p></div><button type="button" class="btn btn-back" onclick="budgetClosePicker()">Cerrar</button></div><div class="field"><label for="budgetPickerQuery">Código o descripción</label><input id="budgetPickerQuery" type="search" autocomplete="off" placeholder="Ej.: 1700/" oninput="budgetRenderPicker()"></div><div class="budget-picker-filters">${[['brand','Marca / fabricante'],['line','Línea'],['size','Presentación']].map(([id,label])=>`<div class="field"><label for="budgetPicker_${id}">${label}</label><input id="budgetPicker_${id}" type="search" oninput="budgetRenderPicker()"></div>`).join('')}</div><p id="budgetPickerCount" role="status" aria-live="polite"></p><div class="budget-picker-actions"><button id="budgetPickerAddSelected" type="button" class="btn btn-primary" onclick="budgetAddSelected()" disabled>Agregar seleccionados (0)</button></div><div id="budgetPickerResults" class="budget-picker-results"></div></div>`;
 modal.addEventListener('click',e=>{if(e.target===modal)budgetClosePicker();});document.body.appendChild(modal);
 document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!modal.hidden){e.preventDefault();e.stopImmediatePropagation();budgetClosePicker();}},true);
}
let budgetPickerLimit=80;
const budgetPickerSelected=new Set();
function budgetOpenPicker(query=document.getElementById('cartQuickProductInput').value.trim()){
 budgetHideSuggestions();const modal=document.getElementById('budgetProductPicker');modal.hidden=false;budgetPickerLimit=80;budgetPickerSelected.clear();document.getElementById('budgetPickerQuery').value=query;
 for(const id of ['brand','line','size']){const input=document.getElementById('budgetPicker_'+id),available=products.some(p=>budgetProductMeta(p,id));input.value='';input.disabled=!available;input.placeholder=available?'Filtrar…':'Sin dato en este catálogo';}
 budgetRenderPicker();document.getElementById('budgetPickerQuery').focus();
}
function budgetClosePicker(){const modal=document.getElementById('budgetProductPicker');if(modal)modal.hidden=true;budgetPickerSelected.clear();document.getElementById('cartQuickProductInput')?.focus();}
function budgetUpdateSelectionCount(){const button=document.getElementById('budgetPickerAddSelected');button.disabled=!budgetPickerSelected.size;button.textContent='Agregar seleccionados ('+budgetPickerSelected.size+')';}
function budgetToggleSelection(code,checked){if(!products.some(p=>String(p.COD)===String(code)))return;checked?budgetPickerSelected.add(String(code)):budgetPickerSelected.delete(String(code));budgetUpdateSelectionCount();}
function budgetAddSelected(){if(!budgetPickerSelected.size)return;budgetAppendProducts([...budgetPickerSelected],budgetPickerSelected.size>1);}
function budgetRenderPicker(more=false){
 if(!more)budgetPickerLimit=80;
 const filters=Object.fromEntries(['brand','line','size'].map(id=>[id,document.getElementById('budgetPicker_'+id).value.trim()]));
 const matches=budgetProductMatches(document.getElementById('budgetPickerQuery').value,filters);
 document.getElementById('budgetPickerCount').textContent=matches.length+' coincidencias'+(matches.length>budgetPickerLimit?' · mostrando '+budgetPickerLimit:'')+' · '+budgetPickerSelected.size+' seleccionados';budgetUpdateSelectionCount();
 document.getElementById('budgetPickerResults').innerHTML=matches.length?`<table class="budget-picker-table"><thead><tr><th>Elegir</th><th>Código</th><th>Descripción</th><th>Precio lista</th><th>Base / tinto</th></tr></thead><tbody>${matches.slice(0,budgetPickerLimit).map(p=>`<tr><td><input type="checkbox" aria-label="Seleccionar ${esc(p.COD)}" data-code="${esc(p.COD)}" onchange="budgetToggleSelection(this.dataset.code,this.checked)" ${budgetPickerSelected.has(String(p.COD))?'checked':''}></td><td>${esc(p.COD)}</td><td><button type="button" data-code="${esc(p.COD)}" onclick="selectCartQuickProduct(this.dataset.code)">${esc(p.ARTIC)}</button></td><td>${$m(num(p.PR_CON_IVA))}</td><td>${esc(isTintableProduct(p)?(p.base_fisica_tinto||p.base_tinto||'Revisar base'):'—')}</td></tr>`).join('')}</tbody></table>${matches.length>budgetPickerLimit?'<button class="btn btn-back" onclick="budgetPickerLimit+=80;budgetRenderPicker(true)">Ver más resultados</button>':''}`:'<p>No hay artículos para estos filtros.</p>';
}
const BUDGET_CONDITION_KEY='pk_budget_condition_v1',BUDGET_GENERAL_KEY='pk_budget_general_pct_v1';
function budgetDraftPct(){const v=Number(localStorage.getItem(BUDGET_GENERAL_KEY));return Number.isFinite(v)?clampPct(v):0;}
function budgetSetDraftTerms(condition,pct){
 const name=String(condition||'Lista').trim().slice(0,80)||'Lista',value=clampPct(pct);
 localStorage.setItem(BUDGET_CONDITION_KEY,name);localStorage.setItem(BUDGET_GENERAL_KEY,String(value));
 document.getElementById('budgetConditionInput').value=name;
 document.getElementById('budgetGeneralDiscount').value=String(value).replace('.',',');
 document.getElementById('budgetGeneralHelp').textContent='La condición se imprime; este porcentaje define el total.';
}
function budgetInitTerms(){
 if(localStorage.getItem(BUDGET_CONDITION_KEY)===null||localStorage.getItem(BUDGET_GENERAL_KEY)===null){
  const key=localStorage.getItem('pk_price_mode')||discounts[0].key,match=discounts.find(d=>d.key===key);
  budgetSetDraftTerms(match?.label||(key==='manual'?'Manual':'Lista'),key==='manual'?getCustomDiscount():(match?.percent||0));
 }else budgetSetDraftTerms(localStorage.getItem(BUDGET_CONDITION_KEY),budgetDraftPct());
 document.getElementById('budgetConditionOptions').innerHTML=[...new Set([...discounts.map(d=>d.label),'Transferencia'])].map(label=>`<option value="${esc(label)}"></option>`).join('');
}
getMode=function(){return {key:'manual',label:localStorage.getItem(BUDGET_CONDITION_KEY)||'Lista',percent:budgetDraftPct()};};
renderModeOptions=function(){const list=document.getElementById('budgetConditionOptions');if(list)list.innerHTML=[...new Set([...discounts.map(d=>d.label),'Transferencia'])].map(label=>`<option value="${esc(label)}"></option>`).join('');};
function budgetSetCondition(){
 touchCurrentBudgetForEdit();const value=document.getElementById('budgetConditionInput').value.slice(0,80);
 localStorage.setItem(BUDGET_CONDITION_KEY,value);document.getElementById('budgetDocumentNumber').textContent=currentBudgetCode||'Sin guardar';
}
function budgetValidPercent(value){
 const text=String(value).trim();if(!/^(?:100(?:[.,]0{1,2})?|\d{1,2}(?:[.,]\d{1,2})?)$/.test(text))return null;
 return Number(text.replace(',','.'));
}
function budgetSetGeneralDiscount(){
 const raw=document.getElementById('budgetGeneralDiscount').value,value=budgetValidPercent(raw),hint=document.getElementById('budgetGeneralHelp');
 if(value===null){hint.textContent='Ingresá un porcentaje válido entre 0 y 100 (hasta dos decimales).';hint.classList.add('invalid');return;}
 touchCurrentBudgetForEdit();localStorage.setItem(BUDGET_GENERAL_KEY,String(value));hint.textContent='La condición se imprime; este porcentaje define el total.';hint.classList.remove('invalid');
 document.getElementById('budgetDocumentNumber').textContent=currentBudgetCode||'Sin guardar';budgetRenderTotals();
}
function budgetCommitGeneralDiscount(){
 const field=document.getElementById('budgetGeneralDiscount');if(budgetValidPercent(field.value)===null){field.value=String(budgetDraftPct()).replace('.',',');document.getElementById('budgetGeneralHelp').textContent='Porcentaje inválido: se mantuvo el descuento anterior.';return;}
 field.value=String(budgetDraftPct()).replace('.',',');
}
function budgetRenderTotals(){
 const totals=document.getElementById('cartTotals');if(!cart.length){totals.style.display='none';totals.innerHTML='';return;}
 const mode=getMode(),lineDiscount=budgetSpecialDiscountTotal(cart);
 totals.style.display='block';
 totals.innerHTML=`<div class="cart-summary">${lineDiscount?`<div class="cart-summary-row"><span>Importe de lista</span><strong>${$m(budgetListTotal(cart))}</strong></div>`:''}<div class="cart-summary-row"><span>Subtotal</span><strong>${$m(budgetAfterSpecialTotal(cart))}</strong></div>${lineDiscount?`<div class="cart-summary-row budget-saving"><span>Ahorro por descuentos de línea (informativo)</span><span>${$m(lineDiscount)}</span></div>`:''}<div class="cart-summary-row"><span>Descuento general ${mode.percent}%</span><strong>−${$m(budgetGeneralDiscountTotal(cart,mode.percent))}</strong></div><div class="cart-summary-row total"><span>TOTAL</span><strong>${$m(budgetFinalTotal(cart,mode.percent))}</strong></div></div>`;
}
renderCart=function(){
 hideClientAutocomplete();const saved=budgetHistory.find(h=>String(h.id)===String(currentBudgetCode));
 document.getElementById('budgetDocumentNumber').textContent=currentBudgetCode||'Sin guardar';
 document.getElementById('budgetDocumentDate').textContent=saved?.fecha||new Date().toLocaleDateString('es-AR');
 document.getElementById('budgetLineCount').textContent=cart.length+' líneas · '+cart.reduce((sum,i)=>sum+itemQty(i),0)+' unidades';
 document.getElementById('cartItems').innerHTML=cart.length?`<div class="budget-grid-wrap"><table class="budget-grid"><thead><tr><th>Código</th><th>Descripción</th><th>Fórmula</th><th>Cantidad</th><th>Precio</th><th>% Dto.</th><th>Imp. Dto.</th><th title="Importe de línea con su descuento propio, antes del descuento general">Importe</th><th><span class="budget-sr-only">Quitar</span></th></tr></thead><tbody>${cart.map(item=>{
  const p=budgetProductForItem(item),t=item.tintData,key=item.uid||item.COD,canTint=isTintableProduct(p)||!!t;
  const rule=canTint?budgetTintEntryRule(p):'plain';
  const formula=t?cleanLabColorCode(t.color_original||t.color)+(t.manualModified?' · mod.':''):rule==='required'?'Agregar fórmula · pendiente':rule==='unknown'?'Revisar base / fórmula':'Agregar fórmula';
  const description=item.base_ARTIC||(t?String(item.ARTIC).replace(/\s*\([^()]*\)\s*$/,''):item.ARTIC);
  return `<tr><td data-label="Código" class="budget-code">${esc(item.COD)}</td><td data-label="Descripción" class="budget-description"><strong>${esc(description)}</strong></td><td data-label="Fórmula" class="budget-formula">${canTint?`<button type="button" data-key="${esc(key)}" onclick="openTintEditModal(this.dataset.key)">${esc(formula)}</button>${t?.descripcion?`<small>${esc(t.descripcion)}</small>`:''}`:'—'}</td><td data-label="Cantidad"><input aria-label="Cantidad de ${esc(description)}" type="number" min="1" step="1" inputmode="numeric" value="${itemQty(item)}" data-key="${esc(key)}" onchange="updateQty(this.dataset.key,this.value)"></td><td data-label="Precio" class="budget-money">${$m(itemListUnit(item))}</td><td data-label="% Dto."><input aria-label="Descuento de ${esc(description)}" type="number" min="0" max="100" step="0.1" inputmode="decimal" value="${itemExtraPct(item)}" data-key="${esc(key)}" onchange="updateItemExtraDiscount(this.dataset.key,this.value)"></td><td data-label="Imp. Dto." class="budget-money">${$m(itemSpecialDiscountTotal(item))}</td><td data-label="Importe" class="budget-money budget-line-total">${$m(itemAfterSpecialTotal(item))}</td><td class="budget-remove"><button type="button" class="btn btn-back" aria-label="Quitar ${esc(description)}" data-key="${esc(key)}" onclick="removeItem(this.dataset.key)">×</button></td></tr>`;
 }).join('')}</tbody></table></div>`:'<div class="budget-empty"><strong>Presupuesto en carga</strong><p>Elegí el cliente y agregá el primer artículo por código o descripción.</p></div>';
 budgetRenderTotals();
};
// Reusar las fórmulas históricas cuando el color es el mismo; nuevas selecciones usan los validadores existentes.
let budgetTintPreviewKey='';
function budgetTintSelectionKey(item,value){return (item.uid||item.COD)+'|'+normKey(value);}
function budgetResolveTint(item,value){
 const p=budgetProductForItem(item),saved=item.tintData;
 if(!isTintableProduct(p))return {ok:false,msg:'Este artículo no tiene compatibilidad tintométrica registrada.'};
 const allowed=compatibleBasesForProduct(p),explicit=/\[(PASTEL|TINT|DEEP|ACCENT)\]/i.exec(value);
 if(explicit&&!allowed.includes(normKey(explicit[1])))return {ok:false,msg:'Fórmula incompatible: la base '+explicit[1]+' no corresponde a este artículo ('+allowed.join(' / ')+').'};
 const color=cleanLabColorCode(extractColorId(value));
 if(!color)return {ok:false,msg:'Ingresá un color para agregar o editar la fórmula.'};
 const same=saved&&normKey(cleanLabColorCode(saved.color_original||saved.color))===normKey(color)&&(!explicit||normKey(explicit[1])===normKey(saved.base_formula));
 let calc;
 if(same){
  const lines=saved.formula_original?.length?saved.formula_original:saved.formula;
  if(!Array.isArray(lines)||!lines.length)return {ok:false,msg:'La fórmula histórica está incompleta. Revisá el presupuesto antes de modificarla.'};
  calc={ok:true,rec:{idcolor:color,descripcion:saved.descripcion||'',id_formula:saved.id_formula||''},base_formula:saved.base_formula,base_fisica:saved.base_fisica,factor:Number(saved.factor),factor_mode:saved.factor_mode||'especial',lines:budgetClone(lines),tintCost:lines.reduce((sum,x)=>sum+num(x.subtotal),0)};
 }else{
  if(p.legacy_snapshot_only)return {ok:false,msg:'El artículo ya no está en el catálogo y sólo conserva su fórmula histórica. Podés ajustar esa fórmula; para otro color, revisá el artículo con su ficha completa.'};
  calc=calcTintForProduct(p,color,{factorMode:saved?.factor_mode||'especial'});
  // Una opción de la lista identifica también su base: nunca sustituirla por otra.
  if(explicit&&calc.ok&&normKey(calc.base_formula)!==normKey(explicit[1])){
   const base=normKey(explicit[1]),rec=findTintRecipe(base,color),factorMode=saved?.factor_mode||'especial';
   if(!rec)return {ok:false,msg:'No existe esa fórmula para la base seleccionada.'};
   const factor=effectiveFactorForProduct(p,base,factorMode);
   const lines=parseTintFormula(rec.formula_1l).map(x=>{const pulsosRaw=x.pulsos1*factor,pulsos=roundPulse(pulsosRaw),precioPulso=num(colorantPrices[x.colorante]);return {...x,pulsosRaw,pulsos,precioPulso,subtotal:pulsos*precioPulso};});
   calc={ok:true,rec,lines,factor,factor_mode:factorMode,base_formula:base,base_fisica:normKey(p.base_fisica_tinto||p.base_tinto||base),tintCost:lines.reduce((sum,l)=>sum+l.subtotal,0)};
  }
 }
 if(!calc.ok)return calc;
 if(!allowed.includes(normKey(calc.base_formula)))return {ok:false,msg:'Fórmula incompatible con la base del artículo. No se aplicó ningún cambio.'};
 if(!Number.isFinite(calc.factor)||calc.factor<=0)return {ok:false,msg:'El artículo no tiene un factor/envase válido para esta fórmula. Revisá su ficha antes de aplicarla.'};
 if(!same&&Math.abs(calc.factor-effectiveFactorForProduct(p,calc.base_formula,calc.factor_mode))>0.000001)return {ok:false,msg:'El factor de la fórmula no coincide con el artículo.'};
 return calc;
}
openTintEditModal=function(key){
 const item=getCartItemByKey(key);if(!item)return;const p=budgetProductForItem(item);
 if(!isTintableProduct(p)){alert('Este artículo no tiene tintométrico.');return;}
 editingTintKey=key;editingTintCalc=null;budgetTintPreviewKey='';
 document.getElementById('tintEditProductInfo').innerHTML=`<b>${esc(item.base_ARTIC||p.ARTIC||item.ARTIC)}</b><br>Código: ${esc(item.COD)} · Base: ${esc(p.base_fisica_tinto||p.base_tinto||'sin determinar')}<br>Precio base de esta línea: ${$m(budgetBasePrice(item))}`;
 const input=document.getElementById('tintEditColorInput');input.value=item.tintData?`${cleanLabColorCode(item.tintData.color_original||item.tintData.color)} — ${item.tintData.descripcion||''}`:'';input.dataset.cleared='1';
 renderTintEditOptions();previewTintEdit(false);renderTintManualRows(item.tintData?.formula||[]);
 document.getElementById('tintEditModal').classList.add('open');
};
renderTintEditOptions=function(){
 const item=getCartItemByKey(editingTintKey);if(!item)return;const p=budgetProductForItem(item),q=normKey(document.getElementById('tintEditColorInput').value),allowed=compatibleBasesForProduct(p);
 document.getElementById('tintEditColorList').innerHTML=tintRecipes.filter(r=>allowed.includes(normKey(r.base))&&(!q||normKey(r.idcolor||r.codigo_formula).includes(q)||normKey(r.descripcion).includes(q))).slice(0,90).map(r=>`<option value="${esc(tintRecipeLabel(r))}"></option>`).join('');
};
previewTintEdit=function(refreshManual=true){
 const item=getCartItemByKey(editingTintKey);if(!item)return;const value=document.getElementById('tintEditColorInput').value.trim(),box=document.getElementById('tintEditPreview');
 const calc=budgetResolveTint(item,value);editingTintCalc=null;budgetTintPreviewKey='';
 if(!calc.ok){box.innerHTML=`<span class="${value?'tinto-bad':'muted'}">${esc(calc.msg)}</span>`;if(refreshManual)renderTintManualRows([]);return;}
 editingTintCalc=calc;budgetTintPreviewKey=budgetTintSelectionKey(item,value);
 if(refreshManual)renderTintManualRows(calc.lines);
 box.innerHTML=`<div class="tinto-ok"><b>Compatible:</b> ${esc(calc.rec.idcolor)} · ${esc(calc.rec.descripcion)}</div><div class="muted">Base fórmula: ${esc(calc.base_formula)} · Base física: ${esc(calc.base_fisica)} · Factor: ${fmtFactorLabel(calc.factor)}</div><div>Total con fórmula original: <b>${$m(budgetBasePrice(item)+calc.tintCost)}</b></div>`;
};
updateTintManualTotal=function(){const item=getCartItemByKey(editingTintKey);if(!item)return;const cost=getCurrentTintManualLines().reduce((sum,l)=>sum+l.subtotal,0);document.getElementById('tintManualTotal').innerHTML=`Tintas: <b>${$m(cost)}</b> · Total lista de esta línea: <b>${$m(budgetBasePrice(item)+cost)}</b>`;};
restoreTintOriginalFormula=function(){const item=getCartItemByKey(editingTintKey);if(!item)return;const calc=budgetResolveTint(item,document.getElementById('tintEditColorInput').value.trim());if(!calc.ok){alert(calc.msg);return;}renderTintManualRows(calc.lines);previewTintEdit(false);};
saveTintEdit=function(){
 const item=getCartItemByKey(editingTintKey);if(!item)return;const value=document.getElementById('tintEditColorInput').value.trim(),calc=budgetResolveTint(item,value);
 if(!calc.ok){alert(calc.msg);return;}
 if(budgetTintPreviewKey!==budgetTintSelectionKey(item,value)){previewTintEdit();alert('La selección de fórmula cambió. Revisá las tintas calculadas y volvé a guardar.');return;}
 if(Array.from(document.querySelectorAll('#tintManualRows [data-tint-pulses]')).some(input=>{const n=Number(input.value.replace(',','.'));return !Number.isFinite(n)||n<0;})){alert('Revisá los pulsos: usá números válidos, mayores o iguales a cero.');return;}
 const manual=getCurrentTintManualLines();if(!manual.length){alert('La fórmula no puede quedar sin tintas.');return;}
 if(manual.some(l=>!Number.isFinite(l.pulsos)||l.pulsos<=0||!Number.isFinite(l.subtotal)||l.subtotal<0)){alert('Revisá los importes y pulsos de la fórmula.');return;}
 const p=budgetProductForItem(item),basePrice=budgetBasePrice(item),tintCost=manual.reduce((sum,l)=>sum+l.subtotal,0),modified=!formulasAreEqual(manual,calc.lines),now=new Date().toISOString();
 touchCurrentBudgetForEdit();item.product_snapshot=budgetClone(item.product_snapshot||p);item.base_price_snapshot=basePrice;
 item.base_ARTIC=item.base_ARTIC||p.ARTIC||item.ARTIC;item.ARTIC=`${item.base_ARTIC} (${colorLabelWithMod(calc.rec.idcolor,modified)})`;item.PR_CON_IVA=basePrice+tintCost;item.PR_SIN_IVA=item.PR_CON_IVA/1.21;
 item.tintData={...item.tintData,color:calc.rec.idcolor,descripcion:calc.rec.descripcion||'',manualModified:modified,base_formula:calc.base_formula,base_fisica:calc.base_fisica,factor:calc.factor,factor_mode:calc.factor_mode||'especial',id_formula:calc.rec.id_formula||'',color_original:calc.rec.idcolor,tintCost,formula_original:budgetClone(calc.lines),formula:budgetClone(manual),created_at:item.tintData?.created_at||now,updated_at:now};
 save();closeTintEditModal();renderCart();document.getElementById('cartQuickProductInput').focus();
};
function budgetUseHistory(id){
 const entry=budgetHistory.find(h=>String(h.id)===String(id));if(!entry||!Array.isArray(entry.cart))return;
 if(cart.length&&!confirm('¿Reemplazar el presupuesto en carga por una copia del guardado? El historial original se conserva.'))return;
 cart=budgetClone(entry.cart).map(i=>({...i,uid:'u_'+crypto.randomUUID()}));resetCurrentBudgetCode();
 document.getElementById('clientName').value=entry.cliente||entry.clientData?.nombre||'';budgetClientId=String(entry.clientData?.id||'');persistDraftClient();
 budgetSetDraftTerms(entry.modo||'Lista',entry.modePercent||0);
 document.getElementById('budgetPrintOptions').value=entry.printOptions||'full';localStorage.setItem('pk_budget_print_options',entry.printOptions||'full');
 save();showScreen('cartScreen');renderCart();showToast('Copia cargada con los precios y fórmulas guardados.');
}
const budgetPreviousHistoryDetail=openHistoryDetail;
openHistoryDetail=function(id){budgetPreviousHistoryDetail(id);const box=document.getElementById('histDetailContainer'),button=document.createElement('button');button.type='button';button.className='btn btn-primary';button.textContent='Usar como nuevo presupuesto';button.onclick=()=>budgetUseHistory(id);box.appendChild(button);};
clearCart=function(){
 if(!confirm('¿Limpiar presupuesto actual y volver a Consumidor final? Se borrará sólo el borrador en carga.'))return;
 cart=[];resetCurrentBudgetCode();quickClientReturn=false;
 const client=document.getElementById('clientName');client.value='CONSUMIDOR FINAL';
 budgetClientId=String(clients.find(c=>norm(c.cliente)==='consumidor final')?.id||'');persistDraftClient();hideClientAutocomplete();
 budgetSetDraftTerms('Lista',0);
 document.getElementById('budgetPrintOptions').value='full';localStorage.setItem('pk_budget_print_options','full');
 const input=document.getElementById('cartQuickProductInput');input.value='';input.dataset.cod='';input.dataset.cleared='0';budgetHideSuggestions();budgetClosePicker();
 closeTintEditModal();closeItemEditModal();budgetTintPreviewKey='';document.getElementById('tintEditColorInput').value='';document.getElementById('tintEditPreview').innerHTML='';document.getElementById('tintManualRows').innerHTML='';
 save();renderCart();document.getElementById('budgetQuickStatus').textContent='Presupuesto nuevo · Consumidor final · descuento general 0%.';
};
budgetInitTerms();
budgetInitPicker();
// Sólo el borrador obtiene IDs faltantes; el historial permanece intacto.
{let changed=false;const ids=new Set();for(const item of cart){if(!item.uid||ids.has(item.uid)){item.uid='u_'+crypto.randomUUID();changed=true;}ids.add(item.uid);}if(changed)save();}
renderCart();
