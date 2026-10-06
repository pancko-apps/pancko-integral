const assert=require('assert'),fs=require('fs'),vm=require('vm'),path=require('path');
const source=fs.readFileSync(path.join(__dirname,'../assets/budget-workbench.js'),'utf8');
const start=source.indexOf('function budgetClearTintForItem('),end=source.indexOf('function budgetApplyFormula(',start);
assert(start>0&&end>start);
const item={COD:'89450983',ARTIC:'HIDROESMALTE PERLADO (TPER001)',base_ARTIC:'HIDROESMALTE PERLADO',
 base_price_snapshot:68156,PR_CON_IVA:76105,PR_SIN_IVA:76105/1.21,qty:2,extraDiscount:5,
 product_snapshot:{COD:'89450983',ARTIC:'HIDROESMALTE PERLADO'},tintData:{color:'TPER001',tintCost:7949,formula:[{colorante:'B',pulsos:110}]}};
let changed=0,saved=0,rendered=0,closed=0;
const ctx=vm.createContext({item,document:{getElementById(id){if(id==='tintEditColorInput')return {value:''};throw Error(id)}},
 budgetBasePrice:i=>i.base_price_snapshot,touchCurrentBudgetForEdit:()=>changed++,save:()=>saved++,renderCart:()=>rendered++,
 getCartItemByKey:()=>item,budgetHideFormulaSuggestions:()=>{},budgetFormulaError:()=>{},closeTintEditModal:()=>closed++,
 budgetResolveTint:()=>{throw Error('No debe recalcular una fórmula vacía')},editingTintKey:'key'});
vm.runInContext(source.slice(start,end),ctx);
const input={dataset:{key:'key'},value:''};vm.runInContext('budgetFormulaChanged(input)',Object.assign(ctx,{input}));
assert.equal(item.PR_CON_IVA,68156);assert.equal(item.PR_SIN_IVA,68156/1.21);assert.equal(item.ARTIC,'HIDROESMALTE PERLADO');assert(!('tintData' in item));
assert.equal(item.qty,2);assert.equal(item.extraDiscount,5);assert.equal(changed,1);assert.equal(saved,1);assert.equal(rendered,1);
vm.runInContext('budgetFormulaChanged(input)',ctx);assert.equal(changed,1,'vaciar por segunda vez no modifica la línea');
const modalStart=source.indexOf('saveTintEdit=function(){');
const modal=source.slice(modalStart,source.indexOf('function budgetUseHistory(',modalStart));
vm.runInContext(modal,ctx);vm.runInContext('saveTintEdit()',ctx);assert.equal(closed,1);
assert(source.includes('onchange="budgetFormulaChanged(this)"'));
console.log('OK: borrar Fórmula restaura precio base y descripción; cantidad/descuento intactos; modal vacío cierra.');
