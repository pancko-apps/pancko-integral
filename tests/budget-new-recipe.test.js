const assert=require('assert'),fs=require('fs'),vm=require('vm'),path=require('path');
const root=path.resolve(__dirname,'..'),source=fs.readFileSync(root+'/assets/budget-workbench.js','utf8');
const begin=source.indexOf('function budgetShowNewRecipeForm(){'),end=source.indexOf('renderTintEditOptions=function(){',begin);
assert(begin>0&&end>begin);
const fields=new Map();for(const id of ['budgetNewRecipePanel','budgetNewRecipeBaseField','budgetNewRecipeProduct','budgetNewRecipePulsesLabel','budgetNewRecipeBase','budgetNewRecipeCode','budgetNewRecipeDescription','budgetNewRecipePulses','budgetNewRecipeNotes','budgetNewRecipeFeedback','tintEditColorInput'])fields.set(id,{value:'',hidden:true,innerHTML:'',textContent:'',focus(){}});
let item={COD:'89450983',ARTIC:'HIDROESMALTE PERLADO 0.91 LTS'},saved=[],preview=0,options=0;
const ctx=vm.createContext({editingTintKey:'abc',document:{getElementById:id=>fields.get(id)},
 getCartItemByKey:()=>item,budgetProductForItem:()=>item,specialProductInfo:p=>p.COD==='89450983'?{family:'PERLADO',content:.91,unit:'L'}:null,
 compatibleBasesForProduct:()=>['PASTEL'],specialFamilyLabel:x=>x,esc:x=>x,parseTintFormula:s=>s.split('|').map(x=>x.trim()).filter(Boolean).map(x=>{const m=x.match(/^([A-Z]+)=([0-9.]+)$/);return m?{colorante:m[1],pulsos1:Number(m[2])}:null}).filter(Boolean),
 tintColorantList:()=>['C','KX'],specialRecipeError:()=>'',persistManualRecipe:r=>{saved.push(r);return {ok:true}},
 renderTintEditOptions:()=>options++,previewTintEdit:()=>preview++,showToast:()=>{}});
vm.runInContext(source.slice(begin,end),ctx);
vm.runInContext('budgetShowNewRecipeForm()',ctx);
assert(!fields.get('budgetNewRecipePanel').hidden);assert(fields.get('budgetNewRecipeBaseField').hidden);
fields.get('budgetNewRecipeCode').value='TPER001';fields.get('budgetNewRecipeDescription').value='Perlado prueba';fields.get('budgetNewRecipePulses').value='C=3 | KX=0.5';
vm.runInContext('budgetSaveNewRecipe()',ctx);
assert.equal(saved.length,1);assert.equal(saved[0].tipo_receta,'SPECIAL');assert.equal(saved[0].articulo_patron_cod,'89450983');assert.equal(saved[0].contenido_patron,'0.91');
assert.equal(saved[0].formula_pulsos,'C=3 | KX=0.5');assert.equal(fields.get('tintEditColorInput').value,'TPER001');assert(fields.get('budgetNewRecipePanel').hidden);assert.equal(preview,1);
item={COD:'NORMAL',ARTIC:'PINTURA PASTEL 4 L'};vm.runInContext('budgetShowNewRecipeForm()',ctx);assert(!fields.get('budgetNewRecipeBaseField').hidden);
fields.get('budgetNewRecipeBase').value='PASTEL';fields.get('budgetNewRecipeCode').value='N001';fields.get('budgetNewRecipeDescription').value='Normal prueba';fields.get('budgetNewRecipePulses').value='C=1';
vm.runInContext('budgetSaveNewRecipe()',ctx);assert.equal(saved[1].tipo_receta,'NORMAL');assert.equal(saved[1].base,'PASTEL');assert.equal(saved[1].formula_1l,'C=1');
console.log('OK: la paleta crea SPECIAL para el COD elegido y NORMAL por 1 L; muestra vista previa antes de aplicar.');
