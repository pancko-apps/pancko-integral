/* Editor manual de recetas: persistencia local y fila CSV explícita. */
'use strict';
let manualRecipeEditingKey='';
function manualField(id){return document.getElementById(id);}
function manualRecipeFeedback(message,error=false){
 const el=manualField('manualRecipeFeedback');if(el){el.textContent=message;el.style.color=error?'#ff9a9a':'';}
}
function openManualRecipeScreen(){
 newManualRecipe();renderManualRecipeList();renderSharedRecipeStatus();showScreen('recipeScreen');
}
function addManualColorantRow(color='',pulses=''){
 const box=manualField('manualColorantRows');if(!box)return;
 const row=document.createElement('div');row.className='recipe-ink-row';
 const select=document.createElement('select');select.setAttribute('aria-label','Colorante');
 select.innerHTML='<option value="">Elegir colorante</option>'+tintColorantList().map(c=>`<option value="${esc(c)}">${esc(c)}</option>`).join('');select.value=color;
 const input=document.createElement('input');input.type='text';input.inputMode='decimal';input.placeholder='Ej.: 3,5';input.setAttribute('aria-label','Pulsos');input.value=pulses;
 const remove=document.createElement('button');remove.type='button';remove.className='btn btn-back';remove.textContent='×';remove.setAttribute('aria-label','Quitar colorante');remove.onclick=()=>{row.remove();syncManualColorantRows();};
 for(const el of [select,input])el.addEventListener('input',syncManualColorantRows);
 row.append(select,input,remove);box.append(row);syncManualColorantRows();
}
function setManualColorantRows(formula=''){
 const box=manualField('manualColorantRows');if(!box)return;
 box.replaceChildren();const parsed=parseTintFormula(formula);
 parsed.forEach(x=>addManualColorantRow(x.colorante,String(x.pulsos1)));
 if(!parsed.length)addManualColorantRow();syncManualColorantRows();
}
function syncManualColorantRows(){
 const box=manualField('manualColorantRows');if(!box)return manualField('manualRecipePulses')?.value||'';
 const parts=[...box.querySelectorAll('.recipe-ink-row')].map(row=>{
  const color=row.querySelector('select').value,amount=row.querySelector('input').value.trim();
  return color||amount?`${color}=${amount}`:'';
 }).filter(Boolean);
 const formula=parts.join(' | ');manualField('manualRecipePulses').value=formula;return formula;
}
function renderManualPatternOptions(preferred=''){
 const family=manualField('manualRecipeFamily')?.value,select=manualField('manualRecipePattern');if(!select)return;
 const current=preferred||select.value;
 const options=Object.entries(SPECIAL_PRODUCTS).filter(([,v])=>v.family===family);
 select.innerHTML=options.map(([cod,v])=>{
  const name=products.find(p=>String(p.COD)===cod)?.ARTIC||family;
  return `<option value="${esc(cod)}">${esc(cod)} · ${esc(name)} · ${v.content} ${v.unit}</option>`;
 }).join('');
 if(options.some(([cod])=>cod===current))select.value=current;
}
function renderManualRecipeFields(){
 const normal=manualField('manualRecipeType')?.value==='NORMAL';
 manualField('manualSpecialFields').hidden=normal;manualField('manualSpecialFields').style.display=normal?'none':'';
 manualField('manualNormalBaseField').hidden=!normal;manualField('manualNormalBaseField').style.display=normal?'':'none';
 if(!normal)renderManualPatternOptions();else renderManualNormalPatterns();
}
function renderManualNormalPatterns(preferred=''){
 const select=manualField('manualNormalPattern');if(!select)return;
 const base=normKey(manualField('manualRecipeBase').value),current=preferred||select.value;
 const options=[['1L','Patrón 1 L · factor 1']];
 for(const p of products.filter(p=>!specialProductInfo(p)&&isTintableProduct(p)&&compatibleBasesForProduct(p).includes(base))){
  const factor=effectiveFactorForProduct(p,base,'especial');
  if(Number.isFinite(factor)&&factor>0)options.push([String(p.COD)+'|especial',`${p.COD} · ${p.ARTIC} · factor ${Number(factor.toFixed(6))}`]);
  if(productAllowsPatternFactor(p)){
   const patron=effectiveFactorForProduct(p,base,'patron');
   if(Number.isFinite(patron)&&patron>0)options.push([String(p.COD)+'|patron',`${p.COD} · ${p.ARTIC} · patrón factor ${Number(patron.toFixed(6))}`]);
  }
 }
 select.innerHTML=options.map(([value,label])=>`<option value="${esc(value)}">${esc(label)}</option>`).join('');
 if(options.some(([value])=>value===current))select.value=current;
 renderManualNormalFactor();
}
function manualNormalFactor(){
 const value=manualField('manualNormalPattern').value,base=normKey(manualField('manualRecipeBase').value);
 if(value==='1L')return 1;
 const [cod,mode]=value.split('|'),p=products.find(x=>String(x.COD)===cod);
 if(!p||specialProductInfo(p)||!compatibleBasesForProduct(p).includes(base))return NaN;
 return effectiveFactorForProduct(p,base,mode==='patron'?'patron':'especial');
}
function renderManualNormalFactor(){const hint=manualField('manualNormalFactorHint');if(hint)hint.textContent='La app dividirá los pulsos ingresados por el factor '+manualNormalFactor()+' y guardará el patrón NORMAL de 1 L. Revisá la vista previa antes de guardar.';}
function previewManualRecipe(){
 const box=manualField('manualRecipePreview'),special=manualField('manualRecipeType').value==='SPECIAL';
 const raw=syncManualColorantRows(),parsed=parseTintFormula(raw),factor=special?1:manualNormalFactor();
 const count=raw.split(/\s*\|\s*/).filter(Boolean).length;
 if(!parsed.length||parsed.length!==count||parsed.some(x=>x.pulsos1<=0)||!Number.isFinite(factor)||factor<=0||new Set(parsed.map(x=>x.colorante)).size!==parsed.length){box.textContent='Revisá colorantes, pulsos y factor del envase.';return;}
 const pattern=special?manualField('manualRecipePattern').value:'1 L de base '+manualField('manualRecipeBase').value;
 box.textContent='Patrón que se guardará · '+pattern+' · '+parsed.map(x=>x.colorante+'='+Number((x.pulsos1/factor).toFixed(8))).join(' | ');
}
function prepareManualRecipeFromLab(){
 if(!selectedLabCalc?.ok||!selectedLabProduct){showToast('Primero elegí una preparación o abrí un registro guardado.');return;}
 newManualRecipe();const r=selectedLabCalc.rec,p=selectedLabProduct,special=specialProductInfo(p);
 manualField('manualRecipeType').value=special?'SPECIAL':'NORMAL';
 if(special){manualField('manualRecipeFamily').value=special.family;renderManualRecipeFields();renderManualPatternOptions(String(p.COD));}
 else{
  manualField('manualRecipeBase').value=selectedLabCalc.base_formula;renderManualRecipeFields();
  const mode=selectedLabCalc.factor_mode==='patron'?'patron':'especial';renderManualNormalPatterns(String(p.COD)+'|'+mode);
  if(manualField('manualNormalPattern').value==='1L'&&Number(selectedLabCalc.factor)!==1){manualRecipeFeedback('No se pudo seleccionar ese envase como patrón. Elegí el producto y verificá el factor antes de guardar.',true);}
 }
 manualField('manualRecipeDescription').value=r.descripcion||'';
 manualField('manualRecipePulses').value=(selectedLabManualLines.length?selectedLabManualLines:selectedLabCalc.lines).map(x=>`${x.colorante}=${fmtRecipePulse(x.pulsos,r)}`).join(' | ');
 setManualColorantRows(manualField('manualRecipePulses').value);
 manualRecipeFeedback('Asigná un código nuevo. Estos pulsos corresponden al envase de la preparación; confirmá el factor y guardá la receta.');
 previewManualRecipe();
 renderSharedRecipeStatus();showScreen('recipeScreen');manualField('manualRecipeCode').focus({preventScroll:true});
}
function newManualRecipe(){
 manualRecipeEditingKey='';
 for(const id of ['manualRecipeCode','manualRecipeDescription','manualRecipePulses','manualRecipeNotes','manualRecipeCSV'])manualField(id).value='';
 manualField('manualRecipeType').value='NORMAL';manualField('manualRecipeActive').checked=true;
 if(selectedLabProduct&&specialProductInfo(selectedLabProduct))manualField('manualRecipeFamily').value=specialProductInfo(selectedLabProduct).family;
 renderManualRecipeFields();
 if(selectedLabProduct&&specialProductInfo(selectedLabProduct))renderManualPatternOptions(String(selectedLabProduct.COD));
 setManualColorantRows();
 manualRecipeFeedback('Nueva receta. Verificá el COD patrón antes de guardar.');
 manualField('manualRecipeCode').focus({preventScroll:true});
}
function renderManualRecipeList(){
 const el=manualField('specialRecipeList');if(!el)return;
 const q=normKey(manualField('specialRecipeSearch')?.value),includeSpecial=!!manualField('manualIncludeSpecial')?.checked;
 const rows=tintRecipes.filter(r=>r.source==='pancko_shared'||r.source==='pancko_manual'||(includeSpecial&&isSpecialRecipe(r)))
  .filter(r=>!q||normKey([r.codigo_formula,r.descripcion,r.familia_especial,r.articulo_patron_cod].join(' ')).includes(q))
  .sort((a,b)=>String(a.familia_especial).localeCompare(String(b.familia_especial))||String(a.codigo_formula).localeCompare(String(b.codigo_formula))).slice(0,100);
 el.innerHTML=rows.length?rows.map(r=>`<button type="button" class="btn btn-back" style="display:block;width:100%;text-align:left;margin:3px 0" data-key="${esc(manualRecipeKey(r))}" onclick="editManualRecipe(this.dataset.key)">${esc(r.codigo_formula||r.idcolor)} · ${esc(r.descripcion)} · ${isSpecialRecipe(r)?'SPECIAL '+esc(specialFamilyLabel(r.familia_especial))+' · Patrón '+esc(r.articulo_patron_cod):'NORMAL · Base '+esc(r.base)}${normKey(r.activo)==='NO'?' · INACTIVA':''}</button>`).join(''):'<span class="muted">Sin fórmulas propias cargadas.</span>';
}
function editManualRecipe(key){
 const r=tintRecipes.find(x=>manualRecipeKey(x)===key);if(!r)return;
 manualRecipeEditingKey=key;manualField('manualRecipeType').value=isSpecialRecipe(r)?'SPECIAL':'NORMAL';
 if(isSpecialRecipe(r))manualField('manualRecipeFamily').value=r.familia_especial;else manualField('manualRecipeBase').value=r.base;
 renderManualRecipeFields();if(isSpecialRecipe(r))renderManualPatternOptions(String(r.articulo_patron_cod));else renderManualNormalPatterns('1L');
 manualField('manualRecipeCode').value=r.codigo_formula||r.idcolor||'';
 manualField('manualRecipeDescription').value=r.descripcion||'';
 manualField('manualRecipePulses').value=isSpecialRecipe(r)?r.formula_pulsos||'':r.formula_1l||'';
 setManualColorantRows(manualField('manualRecipePulses').value);
 manualField('manualRecipeNotes').value=r.observaciones||'';
 manualField('manualRecipeActive').checked=normKey(r.activo)==='SI';
 manualField('manualRecipeCSV').value=specialRecipeCSVRow(r);
 manualRecipeFeedback('Editando receta. El código, base, familia y patrón identifican la fila central; para cambiarlos, creá otra fórmula.');
 manualField('manualRecipeCode').focus({preventScroll:true});
}
function persistManualRecipe(row,editingKey=''){
 const key=manualRecipeKey(row);
 if(key!==editingKey&&tintRecipes.some(r=>manualRecipeKey(r)===key))return {ok:false,error:'Ya existe esa combinación de código y patrón/base. Elegí su fila para editarla.'};
 const manual=manualSpecialRows().filter(r=>manualRecipeKey(r)!==editingKey&&manualRecipeKey(r)!==key);
 manual.push(row);
 try{
  localStorage.setItem(SPECIAL_MANUAL_KEY,JSON.stringify(manual));
  if(editingKey&&editingKey!==key){const hidden=hiddenSpecialKeys();hidden.add(editingKey);localStorage.setItem(SPECIAL_HIDDEN_KEY,JSON.stringify([...hidden]));}
 }catch(e){return {ok:false,error:'No se pudo guardar en este navegador: '+e.message};}
 tintRecipes=tintRecipes.filter(r=>manualRecipeKey(r)!==editingKey&&manualRecipeKey(r)!==key).concat(row);
 buildTintIndex();renderManualRecipeList();renderTintStatus();
 return {ok:true,key,row};
}
function saveManualRecipe(){
 const type=manualField('manualRecipeType').value,code=manualField('manualRecipeCode').value.trim(),desc=manualField('manualRecipeDescription').value.trim();
 const pulses=syncManualColorantRows().trim(),notes=manualField('manualRecipeNotes').value.trim();
 if(!/^[A-Za-z0-9][A-Za-z0-9._-]{0,63}$/.test(code)||!desc||/[\r\n]/.test(desc)){manualRecipeFeedback('Código o descripción inválidos. Usá letras, números, punto, guion o guion bajo.',true);return;}
 const parts=pulses.split(/\s*\|\s*|\s*;\s*/).filter(Boolean),parsed=parseTintFormula(pulses);
 if(!parts.length||parsed.length!==parts.length||new Set(parsed.map(x=>x.colorante)).size!==parsed.length||parsed.some(x=>!tintColorantList().includes(x.colorante)||x.pulsos1<=0)){
  manualRecipeFeedback('Pulsos inválidos. Usá, por ejemplo, C=3 | KX=0.5 y colorantes conocidos.',true);return;
 }
 let row={base:'',id_formula:code,idcolor:code,descripcion:desc,formula_1l:'',tipo_receta:type,
  familia_especial:'',articulo_patron_cod:'',articulo_patron_descripcion:'',contenido_patron:'',unidad_patron:'',
  codigo_formula:code,formula_pulsos:'',source:'pancko_manual',activo:'SI',observaciones:notes};
 if(type==='SPECIAL'){
  const pattern=manualField('manualRecipePattern').value,info=SPECIAL_PRODUCTS[pattern];
  row={...row,base:'SPECIAL:'+manualField('manualRecipeFamily').value,familia_especial:manualField('manualRecipeFamily').value,
   articulo_patron_cod:pattern,articulo_patron_descripcion:products.find(p=>String(p.COD)===pattern)?.ARTIC||'',
   contenido_patron:String(info?.content||''),unidad_patron:info?.unit||'',formula_pulsos:pulses,activo:manualField('manualRecipeActive').checked?'SI':'NO'};
  const error=specialRecipeError(row);if(error){manualRecipeFeedback(error,true);return;}
 }else{
  const factor=manualNormalFactor();if(!Number.isFinite(factor)||factor<=0){manualRecipeFeedback('Elegí un envase con factor válido.',true);return;}
  row.base=manualField('manualRecipeBase').value;
  row.formula_1l=parsed.map(x=>`${x.colorante}=${Number((x.pulsos1/factor).toFixed(8))}`).join(' | ');
 }
 const oldKey=manualRecipeEditingKey;
 if(oldKey&&oldKey!==manualRecipeKey(row)){manualRecipeFeedback('Para cambiar código, base, familia o patrón, creá una fórmula nueva. La anterior permanece en el central.',true);return;}
 const result=persistManualRecipe(row,oldKey);
 if(!result.ok){manualRecipeFeedback(result.error,true);return;}
 manualRecipeEditingKey=result.key;manualField('manualRecipeCSV').value=specialRecipeCSVRow(row);
 try{queueSharedRecipe(row,oldKey);}catch(e){manualRecipeFeedback('Guardada localmente, pero no se pudo crear la cola central: '+e.message,true);return;}
 manualRecipeFeedback(typeof panckoAppToken==='function'&&!panckoAppToken()?'Guardada sólo en este dispositivo. Configurá la Clave operativa en Sincronización para compartirla.':'Guardada en este dispositivo. Queda pendiente hasta que el central confirme la sincronización.');
 syncSharedRecipes();
 renderLabColorOptions(false);renderLabFormula();
}
async function copyManualRecipeRow(){
 const text=manualField('manualRecipeCSV').value;
 if(!text){manualRecipeFeedback('Guardá o elegí una receta antes de copiar.',true);return;}
 try{await navigator.clipboard.writeText(text);manualRecipeFeedback('Fila CSV copiada como respaldo opcional. El estado compartido aparece arriba.');}
 catch(e){manualField('manualRecipeCSV').focus({preventScroll:true});manualField('manualRecipeCSV').select();manualRecipeFeedback('Seleccioná y copiá la fila CSV manualmente.');}
}
renderManualRecipeFields();renderManualRecipeList();
