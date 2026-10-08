/* Pancko Gestión · SPECIAL manual. Los COD y contenidos son la única fuente para familia/envase. */
'use strict';
const SPECIAL_PRODUCTS = Object.freeze({
 '89450983':{family:'PERLADO',content:0.91,unit:'L'},'89450984':{family:'PERLADO',content:3.62,unit:'L'},
 '89459003':{family:'ALUMINIO',content:0.91,unit:'L'},'89459004':{family:'ALUMINIO',content:3.62,unit:'L'},
 '44519053':{family:'FERROXIN',content:0.940,unit:'L'},'44519054':{family:'FERROXIN',content:3.760,unit:'L'},
 '89395004':{family:'GRESS_PLATA',content:4,unit:'KG'},'89395007':{family:'GRESS_PLATA',content:20,unit:'KG'},
 '89396004':{family:'GRESS_GRAFITO',content:4,unit:'KG'},'89396007':{family:'GRESS_GRAFITO',content:20,unit:'KG'},
 '80371003':{family:'OLD_OLDEST',content:1,unit:'L'},'80371004':{family:'OLD_OLDEST',content:4,unit:'L'},
 '86921004':{family:'MICROCEMENTO_PASTA',content:5,unit:'KG'},'86921007':{family:'MICROCEMENTO_PASTA',content:25,unit:'KG'}
});
const SPECIAL_FAMILIES = ['PERLADO','ALUMINIO','FERROXIN','GRESS_PLATA','GRESS_GRAFITO','OLD_OLDEST','MICROCEMENTO_PASTA'];
const SPECIAL_MANUAL_KEY='pk_special_recipes_manual_v1';
const SPECIAL_HIDDEN_KEY='pk_special_recipes_hidden_v1';
let specialRecipeLoadRejected=0;
function specialProductInfo(product){return product && SPECIAL_PRODUCTS[String(product.COD||'').trim()] || null;}
function isSpecialRecipe(recipe){return normKey(recipe?.tipo_receta)==='SPECIAL';}
function specialRecipeKey(recipe){return [normKey(recipe?.familia_especial),String(recipe?.articulo_patron_cod||''),normKey(recipe?.codigo_formula||recipe?.idcolor)].join('|');}
function manualRecipeKey(recipe){return isSpecialRecipe(recipe)?'SPECIAL|'+specialRecipeKey(recipe):'NORMAL|'+normKey(recipe.base)+'|'+normKey(recipe.idcolor||recipe.codigo_formula);}
function specialRecipeError(row){
 const family=normKey(row.familia_especial),pattern=String(row.articulo_patron_cod||'').trim(),info=SPECIAL_PRODUCTS[pattern];
 if(!SPECIAL_FAMILIES.includes(family)||!info||info.family!==family)return 'La familia y el COD patrón no coinciden.';
 if(!String(row.codigo_formula||row.idcolor||'').trim()||!String(row.descripcion||'').trim())return 'Falta código o descripción.';
 if(!(Number(String(row.contenido_patron||'').replace(',','.'))>0)||Math.abs(Number(String(row.contenido_patron).replace(',','.'))-info.content)>0.00001||normKey(row.unidad_patron)!==info.unit)return 'Contenido/unidad distintos del COD patrón.';
 const raw=String(row.formula_pulsos||''),parts=raw.split(/\s*\|\s*|\s*;\s*/).filter(Boolean),parsed=parseTintFormula(raw);
 if(!parts.length||parts.length!==parsed.length||parsed.some(x=>!tintColorantList().includes(x.colorante)||!Number.isFinite(x.pulsos1)||x.pulsos1<=0))return 'Pulsos inválidos o colorante desconocido.';
 if(!['SI','NO'].includes(normKey(row.activo)))return 'Activo debe ser SI o NO.';
 return '';
}
function normalizeTintRecipes(rows){
 const seen=new Set(),out=[];
 for(const source of rows){
  const r={...source};
  if(isSpecialRecipe(r)){
   r.tipo_receta='SPECIAL';r.familia_especial=normKey(r.familia_especial);r.articulo_patron_cod=String(r.articulo_patron_cod||'').trim();
   r.codigo_formula=String(r.codigo_formula||r.idcolor||'').trim();r.idcolor=r.codigo_formula;
   r.base='SPECIAL:'+r.familia_especial;r.formula_pulsos=String(r.formula_pulsos||'').trim();
   if(specialRecipeError(r))continue;
   const key=specialRecipeKey(r);if(seen.has(key))continue;seen.add(key);
  }else{
   if(!r.base||!(r.idcolor||r.codigo_formula)||!r.formula_1l)continue;
   r.tipo_receta='NORMAL';
  }
  out.push(r);
 }
 return out;
}
function manualSpecialRows(){try{const rows=JSON.parse(localStorage.getItem(SPECIAL_MANUAL_KEY)||'[]');return Array.isArray(rows)?rows:[];}catch(e){return [];}}
function hiddenSpecialKeys(){try{return new Set(JSON.parse(localStorage.getItem(SPECIAL_HIDDEN_KEY)||'[]'));}catch(e){return new Set();}}
function mergeManualSpecialRecipes(rows){
 const hidden=hiddenSpecialKeys(),manual=normalizeTintRecipes(manualSpecialRows()),keys=new Set(manual.map(manualRecipeKey));
 return rows.filter(r=>!hidden.has(manualRecipeKey(r))&&!keys.has(manualRecipeKey(r))).concat(manual);
}
function recipeCompatibleWithProduct(r,p){
 const target=specialProductInfo(p);
 if(target)return isSpecialRecipe(r)&&normKey(r.familia_especial)===target.family&&normKey(r.activo)==='SI'&&!specialRecipeError(r);
 return !isSpecialRecipe(r)&&compatibleBasesForProduct(p).includes(normKey(r.base));
}
function findSpecialRecipeForProduct(p,color){
 const target=specialProductInfo(p);if(!target)return null;
 const code=normKey(extractColorId(color));if(!code)return null;
 const matches=tintRecipes.filter(r=>recipeCompatibleWithProduct(r,p)&&normKey(r.codigo_formula||r.idcolor)===code);
 const exact=matches.find(r=>String(r.articulo_patron_cod)===String(p.COD));
 const rec=exact||matches.sort((a,b)=>SPECIAL_PRODUCTS[a.articulo_patron_cod].content-SPECIAL_PRODUCTS[b.articulo_patron_cod].content)[0];
 if(!rec)return null;
 const pattern=SPECIAL_PRODUCTS[rec.articulo_patron_cod];
 return {rec,base_formula:'SPECIAL:'+target.family,base_fisica:target.family,factor:target.content/pattern.content,factor_mode:'patron_special',pattern_cod:rec.articulo_patron_cod};
}
function specialFamilyLabel(family){return String(family||'').replaceAll('_',' ');}
function specialTintSnapshot(recipe){return isSpecialRecipe(recipe)?{
 tipo_receta:'SPECIAL',familia_especial:recipe.familia_especial,articulo_patron_cod:recipe.articulo_patron_cod,
 articulo_patron_descripcion:recipe.articulo_patron_descripcion,contenido_patron:recipe.contenido_patron,
 unidad_patron:recipe.unidad_patron,formula_pulsos:recipe.formula_pulsos,source:recipe.source
}:{tipo_receta:'NORMAL'};}
function specialRecipeCSVRow(r){
 const cols=['base','id_formula','idcolor','descripcion','formula_1l','tipo_receta','familia_especial','articulo_patron_cod','articulo_patron_descripcion','contenido_patron','unidad_patron','codigo_formula','formula_pulsos','source','activo','observaciones'];
 return cols.map(k=>'"'+String(r[k]??'').replaceAll('"','""')+'"').join(',');
}
