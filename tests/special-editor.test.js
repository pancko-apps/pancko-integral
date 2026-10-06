const fs=require('fs'),vm=require('vm'),assert=require('assert'),path=require('path');
const root=path.resolve(__dirname,'..'),html=fs.readFileSync(root+'/index.html','utf8');
const from=html.indexOf('function esc(s){'),to=html.indexOf('function renderTintColorOptions(){');
const memory=new Map(),fields=new Map();
for(const id of ['manualRecipeFeedback','manualRecipePattern','manualRecipeFamily','manualRecipeType','manualSpecialFields','manualNormalBaseField','manualRecipeBase','manualRecipeCode','manualRecipeDescription','manualRecipePulses','manualRecipeNotes','manualRecipeCSV','manualRecipeActive','specialRecipeSearch','specialRecipeList'])fields.set(id,{value:'',innerHTML:'',textContent:'',style:{},checked:false,focus(){},select(){}});
const doc={getElementById(id){return fields.get(id)||null}};
const ctx=vm.createContext({console,document:doc,window:{},navigator:{},localStorage:{getItem:k=>memory.get(k)||null,setItem:(k,v)=>memory.set(k,v)}});
vm.runInContext('let tintRecipes=[];let tintRecipeIndex=new Map();let colorantPrices={};let products=[{COD:"89450983",ARTIC:"PERLADO 0.91"},{COD:"89396004",ARTIC:"GRESS GRAFITO 4"}];let selectedLabProduct=null;function tintColorantList(){return ["AXX","B","C","D","E","F","I","KX","L","M","R","SS","T","V"]};function renderTintStatus(){};function renderLabColorOptions(){};function renderLabFormula(){}',ctx);
vm.runInContext(fs.readFileSync(root+'/assets/special-recipes.js','utf8'),ctx);
vm.runInContext(html.slice(from,to),ctx);
fields.get('manualRecipeType').value='SPECIAL';fields.get('manualRecipeFamily').value='PERLADO';
vm.runInContext(fs.readFileSync(root+'/assets/special-editor.js','utf8'),ctx);
const set=(id,value)=>fields.get(id).value=value;
set('manualRecipePattern','89450983');set('manualRecipeCode','TPER001');set('manualRecipeDescription','Perlado de prueba');set('manualRecipePulses','C=3 | KX=0.5');fields.get('manualRecipeActive').checked=true;
vm.runInContext('saveManualRecipe()',ctx);
let rows=JSON.parse(memory.get('pk_special_recipes_manual_v1'));assert.equal(rows.length,1);assert.equal(rows[0].familia_especial,'PERLADO');assert(fields.get('manualRecipeCSV').value.includes('"89450983"'));
// Corregir asignación de familia y patrón sin dejar la fila anterior activa.
set('manualRecipeFamily','GRESS_GRAFITO');set('manualRecipePattern','89396004');vm.runInContext('saveManualRecipe()',ctx);
rows=JSON.parse(memory.get('pk_special_recipes_manual_v1'));assert.equal(rows.length,1);assert.equal(rows[0].familia_especial,'GRESS_GRAFITO');
assert.equal(JSON.parse(memory.get('pk_special_recipes_hidden_v1')).length,1);
assert.equal(vm.runInContext('mergeManualSpecialRecipes([]).length',ctx),1);
// Alta NORMAL sigue siendo compatible con las cinco columnas históricas.
vm.runInContext('newManualRecipe()',ctx);set('manualRecipeType','NORMAL');set('manualRecipeBase','PASTEL');set('manualRecipeCode','NTEST');set('manualRecipeDescription','Normal de prueba');set('manualRecipePulses','C=2');vm.runInContext('saveManualRecipe()',ctx);
rows=JSON.parse(memory.get('pk_special_recipes_manual_v1'));assert.equal(rows.length,2);assert(rows.some(r=>r.tipo_receta==='NORMAL'&&r.formula_1l==='C=2'));
console.log('OK: alta, corrección de familia, persistencia local, CSV manual y receta NORMAL.');
