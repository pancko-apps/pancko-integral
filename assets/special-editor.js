/* Editor manual de recetas: persistencia local y fila CSV explícita. */
'use strict';
let manualRecipeEditingKey='';
function manualField(id){return document.getElementById(id);}
function manualRecipeFeedback(message,error=false){
 const el=manualField('manualRecipeFeedback');if(el){el.textContent=message;el.style.color=error?'#ff9a9a':'';}
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
 if(!normal)renderManualPatternOptions();
}
function newManualRecipe(){
 manualRecipeEditingKey='';
 for(const id of ['manualRecipeCode','manualRecipeDescription','manualRecipePulses','manualRecipeNotes','manualRecipeCSV'])manualField(id).value='';
 manualField('manualRecipeType').value='SPECIAL';manualField('manualRecipeActive').checked=true;
 if(selectedLabProduct&&specialProductInfo(selectedLabProduct))manualField('manualRecipeFamily').value=specialProductInfo(selectedLabProduct).family;
 renderManualRecipeFields();
 if(selectedLabProduct&&specialProductInfo(selectedLabProduct))renderManualPatternOptions(String(selectedLabProduct.COD));
 manualRecipeFeedback('Nueva receta. Verificá el COD patrón antes de guardar.');
 manualField('manualRecipeCode').focus({preventScroll:true});
}
function renderManualRecipeList(){
 const el=manualField('specialRecipeList');if(!el)return;
 const q=normKey(manualField('specialRecipeSearch')?.value),rows=tintRecipes.filter(isSpecialRecipe)
  .filter(r=>!q||normKey([r.codigo_formula,r.descripcion,r.familia_especial,r.articulo_patron_cod].join(' ')).includes(q))
  .sort((a,b)=>String(a.familia_especial).localeCompare(String(b.familia_especial))||String(a.codigo_formula).localeCompare(String(b.codigo_formula))).slice(0,100);
 el.innerHTML=rows.length?rows.map(r=>`<button type="button" class="btn btn-back" style="display:block;width:100%;text-align:left;margin:3px 0" data-key="${esc(manualRecipeKey(r))}" onclick="editManualRecipe(this.dataset.key)">${esc(r.codigo_formula)} · ${esc(r.descripcion)} · SPECIAL ${esc(specialFamilyLabel(r.familia_especial))} · Patrón ${esc(r.articulo_patron_cod)}${normKey(r.activo)==='NO'?' · INACTIVA':''}</button>`).join(''):'<span class="muted">Sin fórmulas SPECIAL cargadas.</span>';
}
function editManualRecipe(key){
 const r=tintRecipes.find(x=>manualRecipeKey(x)===key);if(!r)return;
 manualRecipeEditingKey=key;manualField('manualRecipeType').value='SPECIAL';manualField('manualRecipeFamily').value=r.familia_especial;
 renderManualRecipeFields();renderManualPatternOptions(String(r.articulo_patron_cod));
 manualField('manualRecipeCode').value=r.codigo_formula||r.idcolor||'';
 manualField('manualRecipeDescription').value=r.descripcion||'';
 manualField('manualRecipePulses').value=r.formula_pulsos||'';
 manualField('manualRecipeNotes').value=r.observaciones||'';
 manualField('manualRecipeActive').checked=normKey(r.activo)==='SI';
 manualField('manualRecipeCSV').value=specialRecipeCSVRow(r);
 manualRecipeFeedback('Editando receta. Al publicar, reemplazá su fila anterior en el CSV si cambiaste código, familia o patrón.');
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
 const pulses=manualField('manualRecipePulses').value.trim(),notes=manualField('manualRecipeNotes').value.trim();
 if(!code||!desc||/[\r\n|\[\]]/.test(code)||/[\r\n]/.test(desc)){manualRecipeFeedback('Código o descripción inválidos.',true);return;}
 const parts=pulses.split(/\s*\|\s*|\s*;\s*/).filter(Boolean),parsed=parseTintFormula(pulses);
 if(!parts.length||parsed.length!==parts.length||parsed.some(x=>!tintColorantList().includes(x.colorante)||x.pulsos1<=0)){
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
  row.base=manualField('manualRecipeBase').value;row.formula_1l=pulses;
 }
 const result=persistManualRecipe(row,manualRecipeEditingKey);
 if(!result.ok){manualRecipeFeedback(result.error,true);return;}
 manualRecipeEditingKey=result.key;manualField('manualRecipeCSV').value=specialRecipeCSVRow(row);
 manualRecipeFeedback('Guardada offline en este navegador. Copiá la fila CSV y publicala para compartirla con otros dispositivos.');
 renderLabColorOptions(false);renderLabFormula();
}
async function copyManualRecipeRow(){
 const text=manualField('manualRecipeCSV').value;
 if(!text){manualRecipeFeedback('Guardá o elegí una receta antes de copiar.',true);return;}
 try{await navigator.clipboard.writeText(text);manualRecipeFeedback('Fila copiada. Agregala al final del CSV publicado o reemplazá la fila anterior si fue una edición.');}
 catch(e){manualField('manualRecipeCSV').focus({preventScroll:true});manualField('manualRecipeCSV').select();manualRecipeFeedback('Seleccioná y copiá la fila CSV manualmente.');}
}
renderManualRecipeFields();renderManualRecipeList();
