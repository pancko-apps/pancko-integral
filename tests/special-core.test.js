const fs=require('fs'),vm=require('vm'),assert=require('assert'),path=require('path');
const root=process.argv[2]||path.resolve(__dirname,'..'),html=fs.readFileSync(root+'/index.html','utf8');
const from=html.indexOf('function esc(s){'),to=html.indexOf('function renderTintColorOptions(){');
assert(from>0&&to>from);
const ctx=vm.createContext({console,localStorage:{getItem:()=>null,setItem:()=>{}},document:{},window:{}});
vm.runInContext('let tintRecipes=[];let tintRecipeIndex=new Map();let colorantPrices={C:2,KX:3};function tintColorantList(){return ["AXX","B","C","D","E","F","I","KX","L","M","R","SS","T","V"]}',ctx);
vm.runInContext(fs.readFileSync(root+'/assets/special-recipes.js','utf8'),ctx);
vm.runInContext(html.slice(from,to),ctx);
const products=vm.runInContext('SPECIAL_PRODUCTS',ctx);
const catalog=fs.readFileSync(root+'/data/articulos.csv','utf8').split(/\r?\n/).slice(1).map(x=>x.split(';'));
for(const cod of Object.keys(products))assert(catalog.some(row=>row[0]===cod),`COD ausente en artículos: ${cod}`);
const header=fs.readFileSync(root+'/data/articulos.csv','utf8').split(/\r?\n/)[0].replace(/^\uFEFF/,'').split(';');
for(const family of ['TEXTURA','AGRESTE','PROFESIONAL','CREMAR']){
 const cells=catalog.find(row=>row[1].toUpperCase().includes(family)&&row[3]==='SI');
 assert(cells,`Sin muestra real de ${family}`);
 const p=Object.fromEntries(header.map((key,i)=>[key,cells[i]]));
 const factor=vm.runInContext('effectiveFactorForProduct('+JSON.stringify(p)+','+JSON.stringify(p.base_tinto)+')',ctx);
 assert(Number.isFinite(factor)&&factor>0,`Factor inválido de ${family}`);
}
const rows=[];
for(const [cod,meta] of Object.entries(products)){
 const p={COD:cod,usa_tinto:'NO',ARTIC:cod};assert(vm.runInContext('isTintableProduct('+JSON.stringify(p)+')',ctx));
 const canon=Object.entries(products).find(([,m])=>m.family===meta.family)[0],pat=products[canon];
 const r={tipo_receta:'SPECIAL',familia_especial:meta.family,articulo_patron_cod:canon,articulo_patron_descripcion:'Test',contenido_patron:String(pat.content),unidad_patron:pat.unit,codigo_formula:'S'+meta.family,idcolor:'S'+meta.family,descripcion:'Fórmula test',formula_pulsos:'C=3 | KX=0.5',activo:'SI'};
 rows.push(r);
}
rows.push({base:'PASTEL',idcolor:'8300',id_formula:'8300',descripcion:'Normal',formula_1l:'C=3'});
vm.runInContext('tintRecipes=normalizeTintRecipes('+JSON.stringify(rows)+');buildTintIndex()',ctx);
assert.equal(vm.runInContext('tintRecipes.length',ctx),8);
for(const [cod,meta] of Object.entries(products)){
 const p={COD:cod,usa_tinto:'NO',ARTIC:cod};
 const calc=vm.runInContext('calcTintForProduct('+JSON.stringify(p)+','+JSON.stringify('S'+meta.family)+')',ctx);
 assert(calc.ok,calc.msg);assert.equal(calc.rec.familia_especial,meta.family);
 const pattern=products[calc.rec.articulo_patron_cod];assert(Math.abs(calc.factor-meta.content/pattern.content)<1e-9);
 assert.equal(calc.lines[0].pulsos,Math.round(3*calc.factor*1000000)/1000000);
 assert.equal(calc.tintCost,calc.lines.reduce((s,l)=>s+l.subtotal,0));
 assert(!vm.runInContext('calcTintForProduct('+JSON.stringify(p)+',"8300")',ctx).ok);
 const other=meta.family==='GRESS_PLATA'?'SGRESS_GRAFITO':'SGRESS_PLATA';assert(!vm.runInContext('calcTintForProduct('+JSON.stringify(p)+','+JSON.stringify(other)+')',ctx).ok);
}
const normal={COD:'N',usa_tinto:'SI',tipo_tinto:'COMUN',base_tinto:'PASTEL',base_fisica_tinto:'BLANCO',factor_tinto:'4'};
const nc=vm.runInContext('calcTintForProduct('+JSON.stringify(normal)+',"8300")',ctx);
assert(nc.ok);assert.equal(nc.factor,4);assert.equal(nc.lines[0].pulsos,12);
assert(!vm.runInContext('calcTintForProduct('+JSON.stringify(normal)+',"SPERLADO")',ctx).ok);
const tiny={...rows.find(r=>r.familia_especial==='ALUMINIO'),codigo_formula:'F001',idcolor:'F001',formula_pulsos:'KX=0.03'};
vm.runInContext('tintRecipes=normalizeTintRecipes('+JSON.stringify([tiny])+');buildTintIndex()',ctx);
const tinyCalc=vm.runInContext('calcTintForProduct({COD:"89459003"},"F001")',ctx);
assert(tinyCalc.ok);assert.equal(tinyCalc.lines[0].pulsos,0.03);assert.equal(tinyCalc.lines[0].subtotal,0.09);
assert.equal(vm.runInContext('fmtRecipePulse(0.03,tintRecipes[0])',ctx),'0.03');
assert.equal(vm.runInContext('pulseParts(0.03,tintRecipes[0]).pls',ctx),0.03);
assert.equal(vm.runInContext('roundPulse(0.03)',ctx),0);
const types=[['TEXTURA',25,'TINT',5],['AGRESTE',30,'DEEP',6],['RUSTICO',25,'PASTEL',2.4],['BASE_REVESTIMIENTO',25,'ACCENT',20]];
for(const [tipo,kg,base,expect] of types){const p={COD:'X',usa_tinto:'SI',tipo_tinto:tipo,kilos_reales:kg,base_tinto:base};assert.equal(vm.runInContext('factorForSpecial('+JSON.stringify(p)+','+JSON.stringify(base)+')',ctx),expect)}
const bad={...rows[0],familia_especial:'GRESS_PLATA'};assert(vm.runInContext('normalizeTintRecipes('+JSON.stringify([bad])+').length',ctx)===0);
console.log('OK: 14 COD, siete familias, patrón real, segregación NORMAL/SPECIAL, precisión decimal, costos y fila inválida.');
