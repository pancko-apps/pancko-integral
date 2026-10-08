// Pancko Gestión - Apps Script v0.12.18 (Cuenta corriente central e imputaciones)
// Merged: registros_colores + presupuestos

const VERSION = '0.12.31';
const SHEET_ID = '1NyWlnMHJFNPl9KUOC1Vd1NeR3PLQiPBrKYvpMnrNl3Q';

const PANCKO_TABS = {
  COLORS: 'registros_colores',
  BUDGETS: 'presupuestos'
};

function doPost(e){
  try{
    let payload = JSON.parse((e && e.postData && e.postData.contents) || '{}');
    const action = payload.action || '';
    if(action !== 'ping'){appAuth_(payload);const credential=payload.token;payload=stripCredentials_(payload);payload.token=credential;}
    if(action === 'auth_check')return json_({ok:true,authenticated:true,version:VERSION});

    if(action === 'articles_meta') return json_(articlesMeta_());
    if(action === 'list_articles') return json_(listArticles_());
    if(action === 'save_articles') return json_(withLock_(()=>saveArticles_(payload)));
    if(action === 'save_color') {
      return json_(withLock_(()=>saveColor_(stripCredentials_(payload.data || payload))));
    }

    if(action === 'list_colors') {
      return json_(listColors_());
    }

    if(action === 'save_budget') {
      return json_(withLock_(()=>saveBudget_(payload)));
    }

    if(action === 'list_budgets') {
      return json_(listBudgets_());
    }

    if(action === 'delete_budget') {
      return json_(withLock_(()=>deleteBudget_(payload)));
    }
    if(action === 'cash_get') return json_(cashGet_(payload));
    if(action === 'cash_apply') return json_(withLock_(()=>cashApply_(payload)));
    if(action === 'cc_get') return json_(withLock_(()=>ccGet_(payload)));
    if(action === 'cc_apply') return json_(withLock_(()=>ccApply_(payload)));
    if(action === 'recipes_get') return json_(recipesGet_());
    if(action === 'recipe_apply') return json_(withLock_(()=>recipeApply_(payload)));

    return json_({ok:false,error:'Acción POST no reconocida', action});
  }catch(err){
    return json_({ok:false,error:String(err)});
  }
}

function doGet(e){
  try{
    const action = String((e && e.parameter && e.parameter.action) || 'ping');

    if(action === 'ping'){
      return json_({ok:true,service:'pancko-integral-gas',version:VERSION,time:new Date().toISOString()});
    }

    appAuth_((e && e.parameter) || {});
    if(action === 'auth_check')return json_({ok:true,authenticated:true,version:VERSION});
    if(action === 'articles_meta') return json_(articlesMeta_());
    if(action === 'articles' || action === 'list_articles') return json_(listArticles_());
    if(action === 'colors' || action === 'list_colors'){
      return json_(listColors_());
    }

    if(action === 'budgets' || action === 'list_budgets'){
      return json_(listBudgets_());
    }

    return json_({ok:false,error:'Acción GET no reconocida', action});
  }catch(err){
    return json_({ok:false,error:String(err)});
  }
}

function json_(obj){
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

function ss_(){
  return SpreadsheetApp.openById(SHEET_ID);
}

function getOrCreateSheet_(name, headers){
  const ss = ss_();
  let sh = ss.getSheetByName(name);
  if(!sh) sh = ss.insertSheet(name);

  if(sh.getLastRow() === 0){
    if(sh.getMaxColumns()<headers.length)sh.insertColumnsAfter(sh.getMaxColumns(),headers.length-sh.getMaxColumns());
    sh.getRange(1,1,1,headers.length).setValues([headers]);
    sh.setFrozenRows(1);
    sh.getRange(1,1,1,headers.length).setFontWeight('bold');
    return sh;
  }

  ensureHeaders_(sh, headers);
  return sh;
}

function ensureHeaders_(sh, required){
  const current=headers_(sh);
  const missing=required.filter(h=>!current.includes(h));
  if(missing.length)throw new Error('La hoja '+sh.getName()+' necesita revisión de encabezados: '+missing.join(', ')+'. No se modificó su estructura.');
}

function headers_(sh){
  const lastCol = sh.getLastColumn();
  return sh.getRange(1,1,1,lastCol).getValues()[0].map(String);
}

function rowObject_(headers, row){
  const o = {};
  headers.forEach((h,i) => o[h] = row[i]);
  return o;
}

function valuesByHeaders_(headers, obj){
  return headers.map(h => obj[h] !== undefined ? obj[h] : '');
}

/* ═══════════════════════════════
   COLORES / LABORATORIO
═══════════════════════════════ */

const COLOR_HEADERS = [
  'id','fecha','timestamp','cliente','cliente_id','clienteData_json','nota',
  'COD','ARTIC','color','color_original','descripcion',
  'base_formula','base_fisica','factor','manualModified',
  'formula_json','formula_original_json',
  'usuario','origen','created_at','updated_at'
];

function saveColor_(r){
  if(!r) throw new Error('Registro vacío');

  const sh = getOrCreateSheet_(PANCKO_TABS.COLORS, COLOR_HEADERS);
  const headers = headers_(sh);

  const id = String(r.id || ('lab_' + Date.now())).trim();
  if(!id) throw new Error('Falta id');

  if(!Array.isArray(r.formula)||!r.formula.length)throw new Error('Registro sin fórmula');

  const now = new Date().toISOString();
  const rowObj = {
    id,
    fecha: r.fecha || '',
    timestamp: r.timestamp || now,
    cliente: r.cliente || '',
    cliente_id: r.cliente_id || (r.clienteData && r.clienteData.id) || '',
    clienteData_json: JSON.stringify(r.clienteData || null),
    nota: r.nota || '',
    COD: r.COD || r.cod_producto || '',
    ARTIC: r.ARTIC || r.producto || '',
    color: r.color || '',
    color_original: r.color_original || '',
    descripcion: r.descripcion || r.descripcion_color || '',
    base_formula: r.base_formula || '',
    base_fisica: r.base_fisica || '',
    factor: num_(r.factor || 1),
    manualModified: r.manualModified ? true : false,
    formula_json: JSON.stringify(r.formula || []),
    formula_original_json: JSON.stringify(r.formula_original || []),
    usuario: r.usuario || 'mjs',
    origen: r.origen || 'pancko-integral',
    created_at: r.created_at || now,
    updated_at: now
  };

  replaceDataRows_(sh,headers,headers.indexOf('id'),id,[valuesByHeaders_(headers,rowObj)]);
  saveSnapshot_('color',id,r);

  return {ok:true,id};
}

function listColors_(){
  const sh = ss_().getSheetByName(PANCKO_TABS.COLORS);
  if(!sh || sh.getLastRow()<2)return {ok:true,colors:[]};
  const last = sh.getLastRow();
  if(last < 2) return {ok:true,colors:[]};

  const headers = headers_(sh);
  const rows = sh.getRange(2,1,last-1,headers.length).getValues();

  const colors = rows
    .filter(row => row.some(v => v !== ''))
    .map(row => {
      const o = rowObject_(headers, row);
      return {
        id: o.id || '',
        fecha: o.fecha || '',
        timestamp: o.timestamp || o.created_at || '',
        cliente: o.cliente || '',
        cliente_id: o.cliente_id || '',
        clienteData: parseJson_(o.clienteData_json, null),
        nota: o.nota || '',
        COD: o.COD || '',
        ARTIC: o.ARTIC || '',
        color: o.color || '',
        color_original: o.color_original || '',
        descripcion: o.descripcion || '',
        base_formula: o.base_formula || '',
        base_fisica: o.base_fisica || '',
        factor: num_(o.factor || 1),
        manualModified: String(o.manualModified).toLowerCase() === 'true' || o.manualModified === true,
        formula: parseJson_(o.formula_json, []),
        formula_original: parseJson_(o.formula_original_json, []),
        usuario: o.usuario || '',
        origen: o.origen || 'sheet',
        created_at: o.created_at || '',
        updated_at: o.updated_at || ''
      };
    });

  const snapshots=readSnapshots_('color');
  colors.forEach((r,i)=>{if(snapshots[r.id])colors[i]={...r,...snapshots[r.id],id:r.id};});
  return {ok:true,colors};
}

/* ═══════════════════════════════
   PRESUPUESTOS
═══════════════════════════════ */

const BUDGET_HEADERS = [
  'id_presupuesto','fecha','timestamp','cliente','cliente_id','cliente_cuit','cliente_telefono','cliente_direccion',
  'modo','descuento_general_pct','items','unidades',
  'subtotal_lista','descuento_especial_total','subtotal','descuento_general_total','total',
  'linea','uid','cod_producto','producto','producto_base','cantidad',
  'precio_lista_unitario','precio_lista_linea','descuento_especial_pct','descuento_especial_importe',
  'subtotal_linea','descuento_general_importe','total_linea',
  'tiene_tintometrico','color_codigo','color_descripcion','base_formula','base_fisica','factor_tinto','costo_tintas','formula_json',
  'vendedor','origen','local_nombre','created_at'
];

function saveBudget_(payload){
  validateBudget_(payload);
  const sh = getOrCreateSheet_(PANCKO_TABS.BUDGETS, BUDGET_HEADERS);
  const headers = headers_(sh);

  const id = String(payload.id_presupuesto || '').trim();
  if(!id) throw new Error('Falta id_presupuesto');

  const lineas = Array.isArray(payload.lineas) ? payload.lineas : [];
  if(!lineas.length) throw new Error('Presupuesto sin líneas');

  const createdAt = new Date().toISOString();

  const rows = lineas.map(l => {
    const rowObj = {
      id_presupuesto: id,
      fecha: payload.fecha || '',
      timestamp: payload.timestamp || '',
      cliente: payload.cliente || '',
      cliente_id: payload.cliente_id || '',
      cliente_cuit: payload.cliente_cuit || '',
      cliente_telefono: payload.cliente_telefono || '',
      cliente_direccion: payload.cliente_direccion || '',
      modo: payload.modo || '',
      descuento_general_pct: num_(payload.descuento_general_pct),
      items: num_(payload.items),
      unidades: num_(payload.unidades),
      subtotal_lista: num_(payload.subtotal_lista),
      descuento_especial_total: num_(payload.descuento_especial_total),
      subtotal: num_(payload.subtotal),
      descuento_general_total: num_(payload.descuento_general_total),
      total: num_(payload.total),
      linea: num_(l.linea),
      uid: l.uid || '',
      cod_producto: l.cod_producto || '',
      producto: l.producto || '',
      producto_base: l.producto_base || '',
      cantidad: num_(l.cantidad),
      precio_lista_unitario: num_(l.precio_lista_unitario),
      precio_lista_linea: num_(l.precio_lista_linea),
      descuento_especial_pct: num_(l.descuento_especial_pct),
      descuento_especial_importe: num_(l.descuento_especial_importe),
      subtotal_linea: num_(l.subtotal_linea),
      descuento_general_importe: num_(l.descuento_general_importe),
      total_linea: num_(l.total_linea),
      tiene_tintometrico: l.tiene_tintometrico ? true : false,
      color_codigo: l.color_codigo || '',
      color_descripcion: l.color_descripcion || '',
      base_formula: l.base_formula || '',
      base_fisica: l.base_fisica || '',
      factor_tinto: l.factor_tinto || '',
      costo_tintas: num_(l.costo_tintas),
      formula_json: l.formula_json || '',
      vendedor: payload.vendedor || '',
      origen: payload.origen || '',
      local_nombre: payload.local_nombre || '',
      created_at: createdAt
    };
    return valuesByHeaders_(headers, rowObj);
  });

  replaceDataRows_(sh,headers,headers.indexOf('id_presupuesto'),id,rows);
  if(payload.snapshot)saveSnapshot_('budget',id,payload.snapshot);

  return {ok:true,id,lineas:rows.length};
}




function deleteBudget_(payload){
  const id=String(payload.id_presupuesto || payload.id || '').trim();
  if(!id)throw new Error('Falta id_presupuesto');
  const sh=ss_().getSheetByName(PANCKO_TABS.BUDGETS);
  if(!sh || sh.getLastRow()<2)return {ok:true,id,deleted:0};
  const column=headers_(sh).indexOf('id_presupuesto');
  if(column<0)throw new Error('Falta encabezado id_presupuesto.');
  const deleted=removeRowsByIdCount_(sh,id,column+1);
  return {ok:true,id,deleted};
}

function removeRowsByIdCount_(sh, id, idColumn){
  const last = sh.getLastRow();
  if(last < 2) return 0;

  const ids = sh.getRange(2,idColumn,last-1,1).getValues().flat();
  let deleted = 0;

  for(let i = ids.length - 1; i >= 0; i--){
    if(String(ids[i]) === String(id)){
      sh.deleteRow(i + 2);
      deleted++;
    }
  }

  return deleted;
}


function listBudgets_(){
  const sh = ss_().getSheetByName(PANCKO_TABS.BUDGETS);
  if(!sh || sh.getLastRow()<2)return {ok:true,budgets:[]};
  const last = sh.getLastRow();
  if(last < 2) return {ok:true,budgets:[]};

  const headers = headers_(sh);
  const rows = sh.getRange(2,1,last-1,headers.length).getValues();
  const groups = {};

  rows.forEach(row => {
    if(!row.some(v => v !== '')) return;
    const o = rowObject_(headers, row);
    const id = String(o.id_presupuesto || '').trim();
    if(!id) return;

    if(!groups[id]){
      groups[id] = {
        id,
        id_presupuesto: id,
        fecha: o.fecha || '',
        timestamp: o.timestamp || '',
        updatedAt: o.created_at || o.timestamp || '',
        cliente: o.cliente || '',
        cliente_id: o.cliente_id || '',
        cliente_cuit: o.cliente_cuit || '',
        cliente_telefono: o.cliente_telefono || '',
        cliente_direccion: o.cliente_direccion || '',
        clientData: {
          id: o.cliente_id || '',
          nombre: o.cliente || '',
          cuit: o.cliente_cuit || '',
          telefono: o.cliente_telefono || '',
          direccion: o.cliente_direccion || ''
        },
        modo: o.modo || '',
        modePercent: num_(o.descuento_general_pct),
        descuento_general_pct: num_(o.descuento_general_pct),
        items: num_(o.items),
        unidades: num_(o.unidades),
        subtotalLista: num_(o.subtotal_lista),
        descuentoEspecial: num_(o.descuento_especial_total),
        subtotal: num_(o.subtotal),
        descuentoGeneral: num_(o.descuento_general_total),
        total: num_(o.total),
        config: { nombre: o.local_nombre || '' },
        created_at: o.created_at || '',
        cart: []
      };
    }

    const formula = parseJson_(o.formula_json, []);
    const hasTint = String(o.tiene_tintometrico).toLowerCase() === 'true' || o.tiene_tintometrico === true;

    groups[id].cart.push({
      uid: o.uid || ('cloud_' + id + '_' + o.linea),
      COD: o.cod_producto || '',
      ARTIC: o.producto || '',
      base_ARTIC: o.producto_base || o.producto || '',
      qty: num_(o.cantidad) || 1,
      PR_CON_IVA: num_(o.precio_lista_unitario),
      extraDiscount: num_(o.descuento_especial_pct),
      tintData: hasTint ? {
        color: o.color_codigo || '',
        color_original: o.color_codigo || '',
        descripcion: o.color_descripcion || '',
        base_formula: o.base_formula || '',
        base_fisica: o.base_fisica || '',
        factor: num_(o.factor_tinto || 1),
        tintCost: num_(o.costo_tintas),
        formula
      } : null
    });
  });

  const budgets = Object.values(groups).sort((a,b)=> String(b.timestamp || b.fecha || '').localeCompare(String(a.timestamp || a.fecha || '')));
  const snapshots=readSnapshots_('budget');
  budgets.forEach((b,i)=>{if(snapshots[b.id])budgets[i]={...b,...snapshots[b.id],id:b.id,id_presupuesto:b.id,snapshot_version:1};});
  return {ok:true,budgets};
}


function removeRowsById_(sh, id, idColumn){
  const last = sh.getLastRow();
  if(last < 2) return;

  const ids = sh.getRange(2,idColumn,last-1,1).getValues().flat();
  for(let i = ids.length - 1; i >= 0; i--){
    if(String(ids[i]) === String(id)){
      sh.deleteRow(i + 2);
    }
  }
}

function paintBudgetRows_(sh, startRow, count, id){
  const colors = ['#ffffff','#eef6ff'];
  const idx = Math.abs(hash_(id)) % colors.length;
  const bg = colors[idx];

  sh.getRange(startRow,1,count,sh.getLastColumn()).setBackground(bg);
  sh.getRange(startRow,1,count,sh.getLastColumn()).setBorder(true,true,true,true,false,false,'#d9e2ef',SpreadsheetApp.BorderStyle.SOLID);
}

function hash_(s){
  s = String(s || '');
  let h = 0;
  for(let i=0;i<s.length;i++){
    h = ((h<<5)-h) + s.charCodeAt(i);
    h |= 0;
  }
  return h;
}

function num_(v){
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

function parseJson_(v, fallback){
  try{
    if(v === '' || v == null) return fallback;
    return JSON.parse(String(v));
  }catch(e){
    return fallback;
  }
}

/* v0.11.2: nuevas tablas separadas; no migra ni agrega columnas a hojas históricas. */
const SNAPSHOT_HEADERS=['tipo','id','revision','parte','total_partes','json','created_at'];
const ARTICLE_HEADERS=['version','COD','articulo_json'];
const ARTICLE_VERSION_HEADERS=['version','upload_id','hash','cantidad','created_at','estado'];
function withLock_(fn){const lock=LockService.getScriptLock();if(!lock.tryLock(30000))throw new Error('Hay otra operación en curso. Reintentá.');try{return fn();}finally{lock.releaseLock();}}
function validateBudget_(payload){
 if(!String(payload.id_presupuesto || '').trim())throw new Error('Falta id_presupuesto');
 if(!Array.isArray(payload.lineas)||!payload.lineas.length)throw new Error('Presupuesto sin líneas');
 payload.lineas.forEach((l,i)=>{if(!l.cod_producto||!Number.isFinite(Number(l.cantidad))||Number(l.cantidad)<=0||!Number.isFinite(Number(l.precio_lista_unitario))||Number(l.precio_lista_unitario)<0)throw new Error('Línea inválida '+(i+1));});
 if(payload.snapshot && (String(payload.snapshot.id)!==String(payload.id_presupuesto)||!Array.isArray(payload.snapshot.cart)||payload.snapshot.cart.length!==payload.lineas.length))throw new Error('Snapshot no corresponde al presupuesto.');
}
function replaceDataRows_(sh,heads,idIndex,id,newRows){
 if(idIndex<0)throw new Error('No existe encabezado de ID.');
 const count=Math.max(0,sh.getLastRow()-1);
 const previous=count?sh.getRange(2,1,count,heads.length).getValues():[];
 const kept=previous.filter(row=>String(row[idIndex])!==String(id));
 const next=kept.concat(newRows);
 const height=Math.max(previous.length,next.length);
 if(!height)return;
 while(next.length<height)next.push(heads.map(()=>''));
 ensureRows_(sh,height+1);
 // Una sola escritura validada. No hay delete previo ni reemplazo de encabezados.
 sh.getRange(2,1,height,heads.length).setValues(next);
}
function ensureRows_(sh,n){if(sh.getMaxRows()<n)sh.insertRowsAfter(sh.getMaxRows(),n-sh.getMaxRows());}
function hashText_(text){return Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256,text,Utilities.Charset.UTF_8).map(b=>('0'+((b+256)%256).toString(16)).slice(-2)).join('');}
function saveSnapshot_(type,id,value){
  value=stripCredentials_(value);
 const text=JSON.stringify(value);if(text.length>1000000)throw new Error('Snapshot demasiado grande.');
 const current=readSnapshots_(type)[String(id)];if(current && JSON.stringify(current)===text)return;
 const sh=getOrCreateSheet_('pancko_snapshots',SNAPSHOT_HEADERS),heads=headers_(sh);
 const last=sh.getLastRow();const existing=last>1?sh.getRange(2,1,last-1,heads.length).getValues():[];
 const revision=hashText_(text+'|'+last+'|'+new Date().toISOString());
 const chunks=[];for(let i=0;i<text.length;i+=20000)chunks.push(text.slice(i,i+20000));
 const now=new Date().toISOString();const rows=chunks.map((json,i)=>valuesByHeaders_(heads,{tipo:type,id,revision,parte:i,total_partes:chunks.length,json:JSON.stringify(json),created_at:now}));
 ensureRows_(sh,last+rows.length);sh.getRange(last+1,1,rows.length,heads.length).setValues(rows);
}
function readSnapshots_(type){
 const sh=ss_().getSheetByName('pancko_snapshots');if(!sh||sh.getLastRow()<2)return {};
 const heads=headers_(sh),rows=sh.getRange(2,1,sh.getLastRow()-1,heads.length).getValues(),groups={};
 rows.forEach(row=>{const r=rowObject_(heads,row);if(r.tipo!==type)return;const k=String(r.id)+'|'+r.revision;if(!groups[k])groups[k]={id:String(r.id),total:Number(r.total_partes),parts:[],date:String(r.created_at)};try{groups[k].parts[Number(r.parte)]=JSON.parse(String(r.json));}catch(e){}});
 const out={};Object.values(groups).sort((a,b)=>a.date.localeCompare(b.date)).forEach(g=>{if(g.parts.length!==g.total||Array.from({length:g.total},(_,i)=>g.parts[i]).some(p=>typeof p!=='string'))return;try{out[g.id]=JSON.parse(g.parts.join(''));}catch(e){}});return out;
}
// Metadatos nuevos separados: no se cambian encabezados históricos.
const ARTICLE_METADATA_HEADERS=['version','nombre_lista','publicada_el'];
const ARTICLE_READABLE_HEADERS=['COD','ARTIC','PR_CON_IVA','usa_tinto','tipo_tinto','base_tinto','base_fisica_tinto','factor_envase_tinto','ajuste_formula_tinto','factor_tinto','litros_reales','kilos_reales','unidad_detectada','confianza_tinto','regla_tinto','observacion_tinto','Artículo','Descripción','P. C.F.'];
function articleMetadata_(version){
  if(!version)return {};
  const sh=ss_().getSheetByName('articulos_metadatos');if(!sh||sh.getLastRow()<2)return {};
  const heads=headers_(sh);if(!ARTICLE_METADATA_HEADERS.every(h=>heads.includes(h)))return {};
  const rows=sh.getRange(2,1,sh.getLastRow()-1,heads.length).getValues();
  for(let i=rows.length-1;i>=0;i--){const r=rowObject_(heads,rows[i]);if(String(r.version)===String(version))return {list_name:String(r.nombre_lista||''),published_at:String(r.publicada_el||'')};}
  return {};
}
function committedArticleVersions_(){
  const sh=ss_().getSheetByName('articulos_versiones');if(!sh||sh.getLastRow()<2)return [];
  const heads=headers_(sh);return sh.getRange(2,1,sh.getLastRow()-1,heads.length).getValues().map(row=>rowObject_(heads,row)).filter(r=>r.estado==='vigente');
}
function articlesMeta_(){
  const versions=committedArticleVersions_(),v=versions[versions.length-1],extra=articleMetadata_(v?.version);
  return {ok:true,service:'pancko-articulos',version:v?v.version:'',count:v?Number(v.cantidad):0,updated_at:v?v.created_at:'',list_name:extra.list_name||'',catalog_metadata_supported:true,publication_mode:'prices',publish_configured:Boolean(PropertiesService.getScriptProperties().getProperty('PANCKO_APP_TOKEN'))};
}
function listArticles_(){
  const meta=articlesMeta_();if(!meta.version)return {...meta,articles:[]};
  const sh=ss_().getSheetByName('articulos_maestro');if(!sh||sh.getLastRow()<2)throw new Error('Falta maestro para la versión vigente.');
  const heads=headers_(sh),articles=sh.getRange(2,1,sh.getLastRow()-1,heads.length).getValues().map(row=>rowObject_(heads,row)).filter(r=>String(r.version)===String(meta.version)).map(r=>JSON.parse(String(r.articulo_json)));
  if(articles.length!==meta.count)throw new Error('Maestro incompleto; no se entrega una lista parcial.');
  return {...meta,articles};
}
function validateArticles_(rows){
  if(!Array.isArray(rows)||!rows.length||rows.length>15000)throw new Error('Lista vacía o mayor a 15.000 artículos.');
  const seen=new Set();return rows.map((r,i)=>{const p={...r,COD:String(r.COD??'').trim(),ARTIC:String(r.ARTIC??'').trim()};
    if(!p.COD||(/^[=+@-]/.test(p.COD)||/[\u0000-\u001f'"\\<>`]/.test(p.COD))||!p.ARTIC||p.PR_CON_IVA===''||p.PR_CON_IVA==null||!Number.isFinite(Number(p.PR_CON_IVA))||Number(p.PR_CON_IVA)<0)throw new Error('Artículo inválido en fila '+(i+2));
    if(seen.has(p.COD))throw new Error('COD duplicado: '+p.COD);if(JSON.stringify(p).length>15000)throw new Error('Artículo demasiado extenso: '+p.COD);seen.add(p.COD);p.PR_CON_IVA=Number(p.PR_CON_IVA);return p;
  });
}
function articleListName_(value,required){
  const name=String(value||'').trim();if((required&&!name)||name.length>100||/[\u0000-\u001f\u007f]/.test(name))throw new Error('Nombre de lista inválido: usá entre 1 y 100 caracteres.');return name;
}
// Texto literal en celdas visibles. Las descripciones nunca se ejecutan como fórmulas.
function articleSheetValue_(value){if(value==null)return '';if(typeof value==='number'||typeof value==='boolean')return value;const s=typeof value==='object'?JSON.stringify(value):String(value);return /^[=+@-]/.test(s)?"'"+s:s;}
function writeArticleMetadata_(version,name,now){
  const sh=getOrCreateSheet_('articulos_metadatos',ARTICLE_METADATA_HEADERS),heads=headers_(sh),row=valuesByHeaders_(heads,{version,nombre_lista:articleSheetValue_(name),publicada_el:now});
  replaceDataRows_(sh,heads,heads.indexOf('version'),version,[row]);
}
function updateReadableArticles_(catalog){
  const ss=ss_();let sh=ss.getSheetByName('lista_precios_actual');
  if(sh&&sh.getLastRow()>0){const old=headers_(sh);if(!ARTICLE_READABLE_HEADERS.every((h,i)=>old[i]===h))throw new Error('lista_precios_actual ya contiene otra estructura. Revisala antes de regenerar; no se sobrescribió.');}
  if(!sh)sh=ss.insertSheet('lista_precios_actual');
  const reserved=new Set([...ARTICLE_READABLE_HEADERS,'nombre_lista','version','updated_at']);
  const extra=[...new Set(catalog.articles.flatMap(p=>Object.keys(p)))].filter(k=>!reserved.has(k)).sort();
  const heads=[...ARTICLE_READABLE_HEADERS,...extra,'nombre_lista','version','updated_at'];
  const width=Math.max(heads.length,sh.getLastColumn()),height=Math.max(catalog.articles.length+1,sh.getLastRow());
  if(sh.getMaxColumns()<width)sh.insertColumnsAfter(sh.getMaxColumns(),width-sh.getMaxColumns());ensureRows_(sh,height);
  const rows=[heads.map(articleSheetValue_),...catalog.articles.map(p=>heads.map(h=>articleSheetValue_(h==='nombre_lista'?catalog.list_name||'':h==='version'?catalog.version:h==='updated_at'?catalog.updated_at:p[h])))];
  rows.forEach(row=>{while(row.length<width)row.push('');});while(rows.length<height)rows.push(Array(width).fill(''));
  const previousFilter=sh.getFilter();if(previousFilter)previousFilter.remove();
  sh.getRange(1,1,height,width).setNumberFormat('@');
  // Encabezados, datos y vaciado del excedente en una escritura; no hay clear previo.
  sh.getRange(1,1,height,width).setValues(rows);
  sh.setFrozenRows(1);sh.getRange(1,1,1,heads.length).setFontWeight('bold').setBackground('#e8eef6');
  if(catalog.articles.length)sh.getRange(2,3,catalog.articles.length,1).setNumberFormat('#,##0.00');
  sh.getRange(1,1,catalog.articles.length+1,heads.length).createFilter();
  return {mirror_ok:true,mirror_version:catalog.version};
}
function refreshReadableResult_(catalog){
  try{return updateReadableArticles_(catalog);}catch(e){return {mirror_ok:false,mirror_warning:String(e.message||e)};}
}
function saveArticles_(payload){
  appAuth_(payload);
  const incoming=validateArticles_(payload.articles),uploadId=String(payload.upload_id||''),name=articleListName_(payload.list_name,Number(payload.catalog_metadata_version)>=1);
  if(!/^art_[a-zA-Z0-9_-]{8,100}$/.test(uploadId))throw new Error('upload_id no válido.');
  const hash=hashText_(JSON.stringify(incoming)),versions=committedArticleVersions_(),old=versions.find(v=>String(v.upload_id)===uploadId);
  if(old){
    if(old.hash!==hash)throw new Error('ID de publicación reutilizado con otros datos.');
    const saved=articleMetadata_(old.version);
    if(Number(payload.catalog_metadata_version)>=1&&String(saved.list_name||'')!==name)throw new Error('ID de publicación reutilizado con otro nombre.');
    const current=listArticles_();
    // Un reintento antiguo nunca revierte la vista de una publicación más reciente.
    return {ok:true,version:old.version,count:Number(old.cantidad),updated_at:old.created_at,list_name:saved.list_name||'',replayed:true,central:{version:current.version,count:current.count,updated_at:current.updated_at,list_name:current.list_name},...refreshReadableResult_(current)};
  }
  const current=listArticles_();if(String(payload.expected_version||'')!==String(current.version||''))throw new Error('La versión central cambió. Cancelá y volvé a revisar la publicación.');
  const result=current.articles.map(p=>({...p})),byCod=new Map(result.map(p=>[String(p.COD),p]));
  incoming.forEach(row=>{const p=byCod.get(row.COD);if(p){p.ARTIC=row.ARTIC;p.PR_CON_IVA=row.PR_CON_IVA;}else{result.push(row);byCod.set(row.COD,row);}});
  validateArticles_(result);const version=uploadId,now=new Date().toISOString();
  // Resolver estructuras antes de escribir el maestro. Las hojas históricas conservan sus columnas.
  const sh=getOrCreateSheet_('articulos_maestro',ARTICLE_HEADERS),heads=headers_(sh),vs=getOrCreateSheet_('articulos_versiones',ARTICLE_VERSION_HEADERS);
  getOrCreateSheet_('articulos_metadatos',ARTICLE_METADATA_HEADERS);
  const rows=result.map(p=>valuesByHeaders_(heads,{version,COD:p.COD,articulo_json:JSON.stringify(p)}));
  replaceDataRows_(sh,heads,heads.indexOf('version'),version,rows);
  writeArticleMetadata_(version,name,now);
  // Commit sólo con artículos y metadatos completos. Las lecturas ignoran cargas huérfanas.
  vs.appendRow(valuesByHeaders_(headers_(vs),{version,upload_id:uploadId,hash,cantidad:result.length,created_at:now,estado:'vigente'}));
  const catalog={version,count:result.length,updated_at:now,list_name:name,articles:result};
  return {ok:true,version,count:result.length,updated_at:now,list_name:name,...refreshReadableResult_(catalog)};
}
// Recuperación manual de la vista, sin republicar ni cambiar la versión técnica.
// También sirve para generar la vista de una publicación anterior a v0.11.2.
function reconstruirListaPreciosActual(){return withLock_(()=>{const current=listArticles_();if(!current.version)return {ok:false,error:'No hay lista central publicada.'};return {ok:true,...updateReadableArticles_(current)};});}

// Ejecutar manualmente en el editor si se desean preparar las hojas económicas vacías.
// No crea deudas, remitos ni recibos. No se invoca desde una lectura o al abrir la app.
function prepararPanckoGestion(){return withLock_(()=>{
 const models={
 articulos_maestro:ARTICLE_HEADERS,articulos_versiones:ARTICLE_VERSION_HEADERS,pancko_snapshots:SNAPSHOT_HEADERS,
 remitos:['id','fecha','cliente_id','presupuesto_id','estado','total','snapshot_json'],
 remito_lineas:['id','remito_id','linea','COD','cantidad','precio','snapshot_json'],
 cc_movimientos:['id','cliente_id','fecha','tipo','importe','origen_tipo','origen_id','referencia','anulado'],
 recibos:['id','cliente_id','fecha','importe','medio','referencia','estado'],
 recibo_aplicaciones:['id','recibo_id','movimiento_id','importe'],
 cheques:['id','cliente_id','emisor','banco','numero','importe','fecha_emision','fecha_cobro','estado','nota','recibo_id','remito_id']};
 const created=[],existing=[];Object.keys(models).forEach(name=>{const old=ss_().getSheetByName(name);if(old && old.getLastRow()>0){existing.push(name);return;}getOrCreateSheet_(name,models[name]);created.push(name);});return {ok:true,creadas:created,existentes_preservadas:existing};
});}

/* Caja diaria: un snapshot autoritativo por fecha. Las operaciones se aplican bajo ScriptLock.
   Las hojas anteriores no se leen ni modifican aquí. */
const CASH_HEADERS_=['fecha','revision','estado','saldo_inicial_cents','saldo_final_cents','actualizado_en','snapshot_json'];
const CASH_EVENT_HEADERS_=['op_id','fecha','revision','tipo','movimiento_id','dispositivo','fecha_servidor','detalle_json'];
const CASH_IDS_=['large','medium','small','change','coins'];
function cashSheetText_(s){return /^[=+@-]/.test(s)?"'"+s:s;}
function cashAuth_(p){appAuth_(p);}
function cashDate_(s){
 if(typeof s!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(s)||isNaN(Date.parse(s+'T12:00:00Z'))||new Date(s+'T12:00:00Z').toISOString().slice(0,10)!==s)throw new Error('Fecha de caja inválida.');
 return s;
}
function cashMoneyInt_(n){if(!Number.isSafeInteger(n))throw new Error('Importe de caja inválido.');return n;}
function cashConflict_(day,msg){return {ok:false,conflict:true,error:msg,revision:day?.central_revision||0,day:day||null};}
function cashFind_(date){
 const sh=ss_().getSheetByName('caja_diaria');if(!sh||sh.getLastRow()<2)return {sh,row:0,day:null};
 const heads=headers_(sh);if(!CASH_HEADERS_.every(h=>heads.includes(h)))throw new Error('Encabezados de caja_diaria incompletos; no se alteró la hoja.');
 const col=heads.indexOf('fecha')+1,found=sh.getRange(2,col,sh.getLastRow()-1,1).getDisplayValues();
 const ix=found.findIndex(r=>r[0]===date);if(ix<0)return {sh,row:0,day:null};
 const row=ix+2,data=rowObject_(heads,sh.getRange(row,1,1,heads.length).getValues()[0]);
 const day=JSON.parse(String(data.snapshot_json));if(day.date!==date||day.central_revision!==Number(data.revision))throw new Error('La caja central tiene datos inconsistentes; revisá la Sheet antes de seguir.');
 return {sh,row,day};
}
function cashLatestCloseBefore_(date){
 const sh=ss_().getSheetByName('caja_diaria');if(!sh||sh.getLastRow()<2)return null;
 const h=headers_(sh),dateCol=h.indexOf('fecha')+1,stateCol=h.indexOf('estado')+1;
 if(!dateCol||!stateCol)throw new Error('Encabezados de caja_diaria incompletos.');
 const dates=sh.getRange(2,dateCol,sh.getLastRow()-1,1).getDisplayValues(),states=sh.getRange(2,stateCol,sh.getLastRow()-1,1).getDisplayValues();
 let latest='';for(let i=0;i<dates.length;i++){const candidate=dates[i][0];if(candidate<date&&candidate>latest&&states[i][0]==='closed')latest=candidate;}
 return latest?cashFind_(latest).day:null;
}
function cashGet_(p){cashAuth_(p);const date=cashDate_(p.date),d=cashFind_(date).day;return {ok:true,date,revision:d?.central_revision||0,day:d,...(p.include_previous?{previous:cashLatestCloseBefore_(date)}:{})};}
function cashCounts_(c){
 if(!c||!c.counts||typeof c.has_count!=='boolean')throw new Error('Conteo de caja inválido.');
 const total=CASH_IDS_.reduce((a,k)=>{const n=cashMoneyInt_(c.counts[k]);if(n<0)throw new Error('Conteo negativo.');return cashMoneyInt_(a+n);},0);
 if(cashMoneyInt_(c.withdrawal_cents)<0||c.remaining_override_cents!==null&&(cashMoneyInt_(c.remaining_override_cents)<0))throw new Error('Retiro o queda inválido.');
 if(c.has_count&&c.withdrawal_cents>total)throw new Error('Retiro superior al efectivo contado.');return total;
}
function cashCheck_(d){
 if(!d||d.id!=='cash_'+cashDate_(d.date)||!['open','closed'].includes(d.state)||!Array.isArray(d.movements)||!Array.isArray(d.audit)||!Array.isArray(d.closing_history)||!Array.isArray(d.deleted_ids)||!Array.isArray(d.applied_ops))throw new Error('Snapshot de Caja inválido.');
 if(cashMoneyInt_(d.opening_cents)<0)throw new Error('Saldo inicial inválido.');
 const seen={};let income=0,expenses=0;
 d.movements.forEach(m=>{if(!/^mov_[\w-]+$/.test(String(m.id))||seen[m.id]||d.deleted_ids.includes(m.id)||typeof m.detail!=='string'||!m.detail.trim()||m.detail.length>300||!Number.isFinite(Date.parse(m.created_at))||!Number.isFinite(Date.parse(m.updated_at)))throw new Error('Movimiento de Caja inválido.');seen[m.id]=true;const value=cashMoneyInt_(m.amount_cents);if(!m.voided_at){if(value>=0)income=cashMoneyInt_(income+value);else expenses=cashMoneyInt_(expenses-value);}});
 const theoretical=cashMoneyInt_(d.opening_cents+income-expenses);cashCounts_(d.close_draft);
 d.totals={income_cents:income,expenses_cents:expenses,theoretical_cents:theoretical};
 if(d.state==='closed'){
  const c=d.closing,total=cashCounts_(c);
  if(!c?.has_count||c.total_counted_cents!==total||c.opening_cents!==d.opening_cents||c.income_cents!==income||c.expenses_cents!==expenses||c.theoretical_cents!==theoretical||c.difference_cents!==total-theoretical||c.remaining_cents!==(c.remaining_override_cents??total-c.withdrawal_cents)||JSON.stringify(c.movement_snapshot)!==JSON.stringify(d.movements))throw new Error('Cierre no coincide con movimientos centrales.');
 }else if(d.closing)throw new Error('Caja abierta con cierre activo.');
 if(JSON.stringify(d).length>45000)throw new Error('Caja central próxima al límite de celda. Exportá el respaldo y contactá soporte.');
 return d;
}
function cashApply_(p){
 cashAuth_(p);const date=cashDate_(p.date),op=String(p.op_id||''),kind=String(p.kind||''),device=String(p.device||'Sin identificar').trim().slice(0,80);
 if(!/^[\w-]{12,100}$/.test(op)||!device||!['create','add','edit','void','delete','opening','draft','close','reopen'].includes(kind))throw new Error('Operación de caja inválida.');
 const found=cashFind_(date);let d=found.day;
 if(d?.applied_ops?.includes(op))return {ok:true,duplicate:true,revision:d.central_revision,day:d};
 const data=p.data||{},now=new Date().toISOString(),before=d?d.central_revision:0;
 if(kind==='create'){
  if(d)return cashConflict_(d,'Ya existe una caja central para esta fecha. Revisá ambos dispositivos antes de importar.');
  d=JSON.parse(JSON.stringify(data.day||null));if(d?.date!==date)throw new Error('La caja a crear no corresponde a la fecha.');
  d.deleted_ids=d.deleted_ids||[];d.applied_ops=d.applied_ops||[];d.central_revision=0;cashCheck_(d);
 }else{
  if(!d)return cashConflict_(null,'La caja central aún no existe. Sincronizá primero la apertura.');
  if(kind==='add'){
   if(d.state!=='open')return cashConflict_(d,'Caja central cerrada: no se agregó el movimiento.');
   const m=data.movement;if(!m||d.deleted_ids.includes(m.id))return cashConflict_(d,'Ese movimiento fue eliminado en la caja central.');
   const existing=d.movements.find(x=>x.id===m.id);
   if(existing){if(JSON.stringify(existing)===JSON.stringify(m))return {ok:true,duplicate:true,revision:d.central_revision,day:d};return cashConflict_(d,'El ID de movimiento ya existe con otros datos.');}
   d.movements.push(m);
  }else if(['edit','void','delete'].includes(kind)){
   if(d.state!=='open')return cashConflict_(d,'Caja central cerrada: operación de movimiento rechazada.');
   const index=d.movements.findIndex(x=>x.id===data.id),m=d.movements[index];
   if(!m||JSON.stringify(m)!==JSON.stringify(data.before))return cashConflict_(d,'El movimiento cambió en otro dispositivo. Actualizá y revisá antes de editar.');
   if(kind==='delete'){d.movements.splice(index,1);d.deleted_ids.push(data.id);}
   else {if(!data.after||data.after.id!==data.id)throw new Error('Movimiento editado inválido.');d.movements[index]=data.after;}
  }else if(kind==='opening'){
   if(d.state!=='open'||d.opening_cents!==data.before)return cashConflict_(d,'El saldo inicial cambió o la caja está cerrada.');
   d.opening_cents=cashMoneyInt_(data.after);d.opening_count_source=data.opening_count_source||null;
  }else if(kind==='draft'){
   if(d.state!=='open')return cashConflict_(d,'Caja cerrada: el conteo parcial no se puede enviar.');
   if(JSON.stringify(d.close_draft)!==JSON.stringify(data.before))return cashConflict_(d,'El conteo fue editado en otro dispositivo. Revisá antes de reemplazarlo.');
   d.close_draft=data.after;
  }else if(kind==='close'){
   if(d.state!=='open'||JSON.stringify(d.movements)!==JSON.stringify(data.closing?.movement_snapshot)||d.opening_cents!==data.closing?.opening_cents||JSON.stringify(d.close_draft)!==JSON.stringify(data.before_draft))return cashConflict_(d,'La caja central cambió. Actualizá y revisá antes de cerrar.');
   d.close_draft=data.closing_draft;d.closing=data.closing;d.state='closed';d.closed_at=d.closing.closed_at;d.closed_by=device;d.closing.closed_by=device;
  }else if(kind==='reopen'){
   if(d.state!=='closed'||d.closing?.closed_at!==data.closed_at)return cashConflict_(d,'El cierre central cambió. Actualizá antes de reabrir.');
   d.closing_history.push(d.closing);d.closing=null;d.state='open';d.closed_at=null;d.closed_by=null;
  }
 }
 // Auditoría compacta en snapshot y hoja de eventos. La hoja de eventos es secundaria.
 if(kind!=='create'&&kind!=='draft')d.audit.push({at:now,action:{add:'Movimiento agregado',edit:'Movimiento editado',void:'Movimiento anulado',delete:'Movimiento eliminado definitivamente',opening:'Cambio de saldo inicial',close:'Cierre de caja',reopen:'Reapertura'}[kind],subject_id:data.id||data.movement?.id||d.id,before:kind==='delete'?data.before:null,after:null,updated_by:device});
 d.updated_at=now;d.updated_by=device;if(kind==='create')d.created_by=device;
 d.central_revision=before+1;d.applied_ops.push(op);cashCheck_(d);
 let sh=found.sh;if(!sh)sh=getOrCreateSheet_('caja_diaria',CASH_HEADERS_);
 const heads=headers_(sh),record={fecha:date,revision:d.central_revision,estado:d.state,saldo_inicial_cents:d.opening_cents,saldo_final_cents:d.closing?.remaining_cents??'',actualizado_en:now,snapshot_json:JSON.stringify(d)};
 const targetRow=found.row||sh.getLastRow()+1;
 sh.getRange(targetRow,heads.indexOf('fecha')+1).setNumberFormat('@');
 sh.getRange(targetRow,1,1,heads.length).setValues([valuesByHeaders_(heads,record)]);
 // Si falla esta hoja auxiliar, el snapshot principal y el op_id conservan idempotencia.
 if(kind!=='draft')try{const ev=getOrCreateSheet_('caja_eventos',CASH_EVENT_HEADERS_),eh=headers_(ev);ev.appendRow(valuesByHeaders_(eh,{op_id:op,fecha:date,revision:d.central_revision,tipo:kind,movimiento_id:data.id||data.movement?.id||'',dispositivo:cashSheetText_(device),fecha_servidor:now,detalle_json:JSON.stringify({kind,subject:data.id||data.movement?.id||null})}));}catch(err){console.warn('Caja evento auxiliar:',err);}
 return {ok:true,revision:d.central_revision,day:d};
}

// Cuenta corriente: cada fila es una entidad versionada. Eventos son auditoría auxiliar.
const CC_MOV_HEADERS_=['id','cliente_id','cliente_nombre_snapshot','fecha','tipo','importe_cents','estado','revision','actualizado_en','snapshot_json','op_ids_json'];
const CC_CLIENT_HEADERS_=['id','nombre','documento','revision','actualizado_en','snapshot_json','op_ids_json'];
const CC_EVENT_HEADERS_=['op_id','entidad','id','revision','accion','dispositivo','fecha_servidor'];
function ccAuth_(p){appAuth_(p);}
function ccId_(id,prefix){if(typeof id!=='string'||!new RegExp('^'+prefix+'_[\\w-]{5,110}$').test(id))throw new Error('ID de Cuenta corriente inválido.');return id;}
function ccClientId_(id){if(typeof id!=='string'||!id||id.length>120||/^[=+@-]/.test(id))throw new Error('ID de cliente inválido.');return id;}
function ccText_(s,max){if(typeof s!=='string'||s.length>max)throw new Error('Campo de Cuenta corriente inválido.');return s;}
function ccClientCheck_(c){
 if(!c||typeof c!=='object'||Array.isArray(c))throw new Error('Cliente inválido.');
 ccClientId_(c.id);ccText_(c.cliente,250);if(!c.cliente.trim())throw new Error('Falta nombre de cliente.');
 for(const k of ['cuit','telefono','direccion','localidad','nota'])if(c[k]!=null)ccText_(c[k],k==='nota'?500:250);
 for(const k of ['merge_sources','separate_from_ids'])if(c[k]!==undefined){if(!Array.isArray(c[k])||c[k].length>100)throw new Error('Referencias de cliente inválidas.');c[k].forEach(ccClientId_);}
 if(JSON.stringify(c).length>12000)throw new Error('Cliente demasiado grande.');return c;
}
function ccMoveCheck_(m){
 if(!m||typeof m!=='object'||Array.isArray(m))throw new Error('Movimiento inválido.');
 ccId_(m.id,'cc');ccClientId_(m.client_id);cashDate_(m.date);
 if(!['charge','payment','positive','negative'].includes(m.type)||!Number.isSafeInteger(m.amount_cents)||m.amount_cents<=0)throw new Error('Importe o tipo de movimiento inválido.');
 if(!Number.isFinite(Date.parse(m.created_at))||!Number.isFinite(Date.parse(m.updated_at))||m.voided_at!==null&&(!m.voided_at||!Number.isFinite(Date.parse(m.voided_at))))throw new Error('Fechas del movimiento inválidas.');
 for(const k of ['detail','note','document_type','document_number','payment_method','device'])ccText_(m[k],500);
 if(m.client_name_snapshot!==undefined)ccText_(m.client_name_snapshot,250);
 if(m.applications!==undefined){
  if(m.type!=='payment'||!Array.isArray(m.applications)||!m.applications.length||m.applications.length>30)throw new Error('Imputaciones de pago inválidas.');
  const seen=new Set();let total=0;
  for(const a of m.applications){if(!a||typeof a!=='object'||Array.isArray(a))throw new Error('Imputación inválida.');ccId_(a.charge_id,'cc');ccClientId_(a.client_id);
   if(seen.has(a.charge_id)||!Number.isSafeInteger(a.amount_cents)||a.amount_cents<=0||!Number.isSafeInteger(a.before_cents)||a.before_cents<a.amount_cents||!Number.isSafeInteger(a.after_cents)||a.after_cents!==a.before_cents-a.amount_cents)throw new Error('Importe o saldo de imputación inválido.');
   seen.add(a.charge_id);total+=a.amount_cents;
  }
  if(!Number.isSafeInteger(total)||total>m.amount_cents)throw new Error('Las imputaciones superan el importe del pago.');
 }
 if(JSON.stringify(m).length>12000)throw new Error('Movimiento demasiado grande.');return m;
}
function ccTable_(name,headers,create){
 const sh=create?getOrCreateSheet_(name,headers):ss_().getSheetByName(name);
 if(sh&&sh.getLastRow()>0)ensureHeaders_(sh,headers);
 return sh;
}
function ccRows_(name,headers){
 const sh=ccTable_(name,headers,false);if(!sh||sh.getLastRow()<2)return [];
 const h=headers_(sh),rows=sh.getRange(2,1,sh.getLastRow()-1,h.length).getValues();
 return rows.map((r,i)=>({row:i+2,value:rowObject_(h,r)}));
}
function ccLookup_(name,headers,id){
 const sh=ccTable_(name,headers,false);if(!sh||sh.getLastRow()<2)return {sh,row:0,obj:null,ops:[]};
 const h=headers_(sh),col=h.indexOf('id')+1,ids=sh.getRange(2,col,sh.getLastRow()-1,1).getDisplayValues();
 const ix=ids.findIndex(x=>x[0]===id);if(ix<0)return {sh,row:0,obj:null,ops:[]};
 const row=ix+2,v=rowObject_(h,sh.getRange(row,1,1,h.length).getValues()[0]);
 const obj=JSON.parse(String(v.snapshot_json)),ops=JSON.parse(String(v.op_ids_json||'[]'));
 if(obj.id!==id||obj.cc_revision!==Number(v.revision)||!Array.isArray(ops))throw new Error('Fila de CC inconsistente: '+id);
 return {sh,row,obj,ops};
}
function ccGet_(p){
 ccAuth_(p);
 const cr=ccRows_('cc_clientes_extra',CC_CLIENT_HEADERS_),mr=ccRows_('cc_movimientos',CC_MOV_HEADERS_);
 const clients=cr.map(x=>JSON.parse(String(x.value.snapshot_json))),movements=mr.map(x=>JSON.parse(String(x.value.snapshot_json)));
 const ids=new Set();cr.forEach((r,i)=>{const c=ccClientCheck_(clients[i]);if(ids.has(c.id)||c.id!==String(r.value.id)||c.cc_revision!==Number(r.value.revision))throw new Error('Cliente central duplicado o inconsistente: '+c.id);ids.add(c.id);});
 const mids=new Set();mr.forEach((r,i)=>{const m=ccMoveCheck_(movements[i]);if(mids.has(m.id)||m.id!==String(r.value.id)||m.cc_revision!==Number(r.value.revision)||!ids.has(m.client_id))throw new Error('Movimiento central duplicado o inconsistente: '+m.id);mids.add(m.id);});
 const aliases=ccAliases_(clients);return {ok:true,capabilities:{payment_allocation:true},clients:clients.filter(c=>!aliases[c.id]).map(c=>({...c,merge_sources:Object.keys(aliases).filter(id=>ccResolveAlias_(id,aliases)===c.id)})),movements:movements.map(m=>ccCanonical_(m,aliases)),server_time:new Date().toISOString()};
}
function ccConflict_(kind,id,existing,message){return {ok:false,conflict:true,entity:kind,id,error:message,central:existing||null};}
function ccComparable_(x){const o=JSON.parse(JSON.stringify(x));delete o.cc_revision;delete o.client_name_snapshot;return JSON.stringify(o);}
function ccName_(name){return String(name||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').trim().toLowerCase().replace(/\s+/g,' ');}
function ccApply_(p){
 ccAuth_(p);
 if(p.kind==='client_merge')return ccClientMerge_(p);
 const aliases=ccAliases_(ccRows_('cc_clientes_extra',CC_CLIENT_HEADERS_).map(x=>JSON.parse(String(x.value.snapshot_json))));
 const kind=String(p.kind||''),op=String(p.op_id||''),device=ccText_(String(p.device||'Sin identificar').trim(),80);
 if(!['client_create','client_update','movement_create','movement_edit','movement_void'].includes(kind)||!/^ccop_[\w-]{12,110}$/.test(op)||!device)throw new Error('Operación de CC inválida.');
 const isClient=kind.startsWith('client_'),headers=isClient?CC_CLIENT_HEADERS_:CC_MOV_HEADERS_,name=isClient?'cc_clientes_extra':'cc_movimientos';
 const id=isClient?ccClientId_(p.id):ccId_(p.id,'cc');
 const found=ccLookup_(name,headers,id),old=found.obj;
 if(found.ops.includes(op))return {ok:true,duplicate:true,entity:isClient?'client':'movement',item:isClient?old:ccCanonical_(old,aliases)};
 const after=JSON.parse(JSON.stringify(p.after||null));
 if(isClient&&aliases[id])return {ok:true,duplicate:true,entity:'client',item:ccLookup_('cc_clientes_extra',CC_CLIENT_HEADERS_,aliases[id]).obj};
 if(!isClient&&after)after.client_id=ccResolveAlias_(after.client_id,aliases);
 if(isClient)ccClientCheck_(after);else ccMoveCheck_(after);
 if(after.id!==id)throw new Error('La operación no corresponde al ID.');
 if(kind.endsWith('create')){
  if(old){if(ccComparable_(isClient?old:ccCanonical_(old,aliases))===ccComparable_(after))return {ok:true,duplicate:true,entity:isClient?'client':'movement',item:isClient?old:ccCanonical_(old,aliases)};return ccConflict_(name,id,old,'Ya existe ese ID con otros datos. Revisá antes de sincronizar.');}
  if(!isClient&&!ccLookup_('cc_clientes_extra',CC_CLIENT_HEADERS_,after.client_id).obj)throw new Error('Primero sincronizá el cliente del movimiento.');
 }else{
  if(!old||Number(p.before_revision)!==old.cc_revision)return ccConflict_(name,id,old,'El registro cambió en otro dispositivo. Actualizá y revisá antes de editar.');
  if(!isClient){if(old.voided_at||ccResolveAlias_(old.client_id,aliases)!==after.client_id||old.created_at!==after.created_at||old.id!==after.id)throw new Error('No se puede editar un anulado ni cambiar la identidad del movimiento.');
   if(kind==='movement_edit'&&after.voided_at!==null||kind==='movement_void'&&!after.voided_at)throw new Error('Anulación o edición incoherente.');
  }
 }
 if(isClient){
  if(old){after.merge_sources=old.merge_sources||[];after.client_merges=old.client_merges||[];after.separate_from_ids=[...new Set([...(old.separate_from_ids||[]),...(after.separate_from_ids||[])])];}
  const exact=ccRows_(name,headers).map(x=>JSON.parse(String(x.value.snapshot_json))).find(c=>c.id!==id&&!aliases[c.id]&&!(after.separate_from_ids||[]).includes(c.id)&&!(c.separate_from_ids||[]).includes(id)&&((c.cuit&&after.cuit&&String(c.cuit).trim()===String(after.cuit).trim())||ccName_(c.cliente)===ccName_(after.cliente)));
  if(exact)return ccConflict_(name,id,exact,'Ya existe ese cliente central con otro ID. Revisá la ficha antes de subirla.');
 }
 if(!isClient){const linked=ccLookup_('cc_clientes_extra',CC_CLIENT_HEADERS_,after.client_id).obj;if(!linked)throw new Error('Cliente central inexistente.');after.client_name_snapshot=old?.client_name_snapshot||linked.cliente;
  const allocationConflict=ccAllocationCheck_(after,old,aliases);if(allocationConflict)return allocationConflict;
 }
 after.cc_revision=(old?.cc_revision||0)+1;
 const now=new Date().toISOString(),ops=[...found.ops,op];
 if(JSON.stringify(ops).length>12000)throw new Error('Demasiadas operaciones para esta ficha. Requiere mantenimiento.');
 let sh=found.sh;if(!sh)sh=ccTable_(name,headers,true);
 const h=headers_(sh),record=isClient?{id,nombre:cashSheetText_(after.cliente),documento:cashSheetText_(String(after.cuit||'')),revision:after.cc_revision,actualizado_en:now,snapshot_json:JSON.stringify(after),op_ids_json:JSON.stringify(ops)}:{id,cliente_id:after.client_id,cliente_nombre_snapshot:cashSheetText_(after.client_name_snapshot),fecha:after.date,tipo:after.type,importe_cents:after.amount_cents,estado:after.voided_at?'anulado':'activo',revision:after.cc_revision,actualizado_en:now,snapshot_json:JSON.stringify(after),op_ids_json:JSON.stringify(ops)};
 const row=found.row||sh.getLastRow()+1;sh.getRange(row,h.indexOf('id')+1).setNumberFormat('@');sh.getRange(row,1,1,h.length).setValues([valuesByHeaders_(h,record)]);
 try{const ev=ccTable_('cc_eventos',CC_EVENT_HEADERS_,true),eh=headers_(ev);ev.appendRow(valuesByHeaders_(eh,{op_id:op,entidad:isClient?'cliente':'movimiento',id,revision:after.cc_revision,accion:kind,dispositivo:cashSheetText_(device),fecha_servidor:now}));}catch(e){console.warn('CC evento auxiliar:',e);}
 return {ok:true,entity:isClient?'client':'movement',item:after};
}

// Unión explícita: una escritura en la ficha destino publica el alias y el evento durable.
function ccAliases_(clients){const aliases=Object.create(null);for(const c of clients)for(const from of c.merge_sources||[]){ccClientId_(from);if(from===c.id||aliases[from]&&aliases[from]!==c.id)throw new Error('Referencia de unión inconsistente.');aliases[from]=c.id;}for(const id of Object.keys(aliases))ccResolveAlias_(id,aliases);return aliases;}
function ccResolveAlias_(id,aliases){const seen=new Set();while(aliases[id]){if(seen.has(id))throw new Error('Ciclo de unión de clientes.');seen.add(id);id=aliases[id];}return id;}
function ccCanonical_(m,aliases){if(!m)return m;const copy=JSON.parse(JSON.stringify(m));copy.client_id=ccResolveAlias_(copy.client_id,aliases);for(const a of copy.applications||[])a.client_id=ccResolveAlias_(a.client_id,aliases);return copy;}
// Todas las lecturas y escrituras de imputaciones suceden dentro del ScriptLock de cc_apply.
function ccAllocationCheck_(after,old,aliases){
 if(!after.applications?.length&&after.type!=='charge')return null;
 const moves=ccRows_('cc_movimientos',CC_MOV_HEADERS_).map(r=>ccCanonical_(JSON.parse(String(r.value.snapshot_json)),aliases));
 const byId=new Map(moves.map(m=>[m.id,m]));
 const used=new Map();for(const payment of moves){if(payment.id===after.id||payment.type!=='payment'||payment.voided_at)continue;for(const a of payment.applications||[])used.set(a.charge_id,(used.get(a.charge_id)||0)+a.amount_cents);}
 if(after.type==='charge'){
  const applied=used.get(after.id)||0;if(applied&&(after.voided_at||after.amount_cents<applied))return {...ccConflict_('cc_movimientos',after.id,old,'Este cargo tiene pagos aplicados. Revisá o anulá las imputaciones antes de reducirlo o anularlo.'),allocation_conflict:true};
  return null;
 }
 if(after.voided_at||!after.applications?.length)return null;
 for(const a of after.applications){a.client_id=ccResolveAlias_(a.client_id,aliases);const charge=byId.get(a.charge_id),available=charge?.amount_cents-(used.get(a.charge_id)||0);
  if(!charge||charge.type!=='charge'||charge.voided_at||charge.client_id!==after.client_id||a.client_id!==after.client_id||available<a.amount_cents||a.before_cents!==available||a.after_cents!==available-a.amount_cents){
   return {...ccConflict_('cc_movimientos',after.id,old,'Cambió el saldo pendiente de un cargo. Actualizá la ficha y revisá la imputación antes de sincronizar.'),allocation_conflict:true};
  }
 }
 return null;
}
function ccClientMerge_(p){
 const from=ccClientId_(p.from_client_id),to=ccClientId_(p.to_client_id),op=String(p.op_id||''),device=ccText_(String(p.device||'Sin identificar'),80);
 if(from===to||!/^ccop_[\w-]{12,110}$/.test(op))throw new Error('Unión inválida.');
 const target=ccLookup_('cc_clientes_extra',CC_CLIENT_HEADERS_,to),source=ccLookup_('cc_clientes_extra',CC_CLIENT_HEADERS_,from);
 if(!target.obj)throw new Error('Primero recibir la ficha central destino.');
 if(target.ops.includes(op))return {ok:true,duplicate:true,entity:'client',item:target.obj};
 const all=ccRows_('cc_clientes_extra',CC_CLIENT_HEADERS_).map(x=>JSON.parse(String(x.value.snapshot_json))),aliases=ccAliases_(all);
 if(aliases[to]||aliases[from]&&ccResolveAlias_(from,aliases)!==to)return ccConflict_('cc_clientes_extra',to,target.obj,'Una ficha ya pertenece a otra unión. Actualizá y revisá.');
 if(target.obj.cc_revision!==p.before_revision||(source.obj?.cc_revision||0)!==(p.source_revision||0))return ccConflict_('cc_clientes_extra',to,target.obj,'Cambió una ficha antes de confirmar la unión. Actualizá y revisá.');
 const after=JSON.parse(JSON.stringify(target.obj)),now=new Date().toISOString();
 after.merge_sources=[...new Set([...(after.merge_sources||[]),from])];
 after.client_merges=[...(after.client_merges||[]),{action:'client_merge',op_id:op,from_client_id:from,to_client_id:to,nombre:String(p.nombre||source.obj?.cliente||''),documento:String(p.documento||source.obj?.cuit||''),dispositivo:device,fecha:now}];
 after.cc_revision++;ccClientCheck_(after);
 const ops=[...target.ops,op];if(JSON.stringify(ops).length>12000)throw new Error('Registro de operaciones requiere mantenimiento.');
 const h=headers_(target.sh),oldRow=target.sh.getRange(target.row,1,1,h.length).getValues()[0],record=rowObject_(h,oldRow);
 Object.assign(record,{revision:after.cc_revision,actualizado_en:now,snapshot_json:JSON.stringify(after),op_ids_json:JSON.stringify(ops)});
 target.sh.getRange(target.row,1,1,h.length).setValues([valuesByHeaders_(h,record)]);
 try{const ev=ccTable_('cc_eventos',CC_EVENT_HEADERS_,true);ev.appendRow(valuesByHeaders_(headers_(ev),{op_id:op,entidad:'cliente',id:from+' → '+to,revision:after.cc_revision,accion:'client_merge',dispositivo:cashSheetText_(device),fecha_servidor:now}));}catch(e){console.warn('Evento auxiliar de unión:',e);}
 return {ok:true,entity:'client',item:after};
}

// Todas las acciones privadas, incluso llamadas directas a /exec, exigen la clave única.
function appAuth_(p){
 const key=PropertiesService.getScriptProperties().getProperty('PANCKO_APP_TOKEN');
 if(!key||key.length<32)throw new Error('PANCKO_APP_TOKEN no configurado (mínimo 32 caracteres).');
 if(typeof p.token!=='string'||p.token!==key)throw new Error('AUTH_REQUIRED: Clave operativa Pancko inválida o ausente.');
}
function stripCredentials_(value){
 if(Array.isArray(value))return value.map(stripCredentials_);
 if(value&&typeof value==='object'){const out={};Object.keys(value).forEach(k=>{if(!/^(token|.*_token|authorization|x-pancko-token|secret|password)$/i.test(k))out[k]=stripCredentials_(value[k]);});return out;}
 return value;
}

// Recetas propias: entidad separada del historial de laboratorio y del CSV patrón.
const RECIPE_HEADERS_=['clave','revision','actualizado_en','op_ids_json','receta_json'];
const RECIPE_SPECIAL_={
 '89450983':['PERLADO',0.91,'L'],'89450984':['PERLADO',3.62,'L'],
 '89459003':['ALUMINIO',0.91,'L'],'89459004':['ALUMINIO',3.62,'L'],
 '44519053':['FERROXIN',0.940,'L'],'44519054':['FERROXIN',3.760,'L'],
 '89395004':['GRESS_PLATA',4,'KG'],'89395007':['GRESS_PLATA',20,'KG'],
 '89396004':['GRESS_GRAFITO',4,'KG'],'89396007':['GRESS_GRAFITO',20,'KG'],
 '80371003':['OLD_OLDEST',1,'L'],'80371004':['OLD_OLDEST',4,'L'],
 '86921004':['MICROCEMENTO_PASTA',5,'KG'],'86921007':['MICROCEMENTO_PASTA',25,'KG']
};
function recipeValidated_(input){
 if(!input||typeof input!=='object'||Array.isArray(input))throw new Error('Receta inválida.');
 const code=String(input.codigo_formula||input.idcolor||'').trim().toUpperCase(),desc=String(input.descripcion||'').trim();
 if(!/^[A-Z0-9][A-Z0-9._-]{0,63}$/.test(code)||!desc||desc.length>180)throw new Error('Código o descripción inválidos.');
 const type=String(input.tipo_receta||'NORMAL').toUpperCase(),base=String(input.base||'').toUpperCase();
 const pattern=String(input.articulo_patron_cod||''),family=String(input.familia_especial||'').toUpperCase();
 const info=RECIPE_SPECIAL_[pattern],normal=type==='NORMAL';
 if(normal?!['PASTEL','TINT','DEEP','ACCENT'].includes(base):type!=='SPECIAL'||!info||info[0]!==family||base!=='SPECIAL:'+family||Number(input.contenido_patron)!==info[1]||String(input.unidad_patron).toUpperCase()!==info[2])throw new Error('Base, familia o COD patrón no compatibles.');
 const formula=String(normal?input.formula_1l:input.formula_pulsos||'').trim(),parts=formula.split(/\s*[|;]\s*/).filter(Boolean);
 const validColors=['AXX','B','C','D','E','F','I','KX','L','M','R','SS','T','V'],seen={};
 if(!parts.length||parts.length>14||parts.some(part=>{const m=part.match(/^([A-Z]+)=([0-9]+(?:[.,][0-9]{1,8})?)$/i);if(!m)return true;const color=m[1].toUpperCase(),n=Number(m[2].replace(',','.'));if(!validColors.includes(color)||seen[color]||!(n>0&&n<=100000))return true;seen[color]=true;return false;}))throw new Error('Pulsos o colorantes inválidos.');
 return {base:normal?base:'SPECIAL:'+family,id_formula:code,idcolor:code,codigo_formula:code,descripcion:desc,formula_1l:normal?formula:'',tipo_receta:type,
  familia_especial:normal?'':family,articulo_patron_cod:normal?'':pattern,articulo_patron_descripcion:normal?'':String(input.articulo_patron_descripcion||'').slice(0,180),
  contenido_patron:normal?'':String(info[1]),unidad_patron:normal?'':info[2],formula_pulsos:normal?'':formula,source:'pancko_shared',activo:input.activo==='NO'?'NO':'SI',observaciones:String(input.observaciones||'').slice(0,300)};
}
function recipeKey_(row){return row.tipo_receta==='SPECIAL'?['SPECIAL',row.familia_especial,row.articulo_patron_cod,row.codigo_formula].join('|'):['NORMAL',row.base,row.codigo_formula].join('|');}
function recipesGet_(){
 const sh=ss_().getSheetByName('recetas_personales');if(!sh||sh.getLastRow()<2)return {ok:true,recipes:[],version:VERSION};
 const headers=headers_(sh);for(const h of RECIPE_HEADERS_)if(!headers.includes(h))throw new Error('Encabezados de recetas_personales incompletos: '+h);
 const data=sh.getRange(2,1,sh.getLastRow()-1,headers.length).getValues();
 return {ok:true,version:VERSION,recipes:data.map(c=>rowObject_(headers,c)).filter(o=>o.clave).map(o=>({key:String(o.clave),revision:Number(o.revision),updated_at:String(o.actualizado_en),row:JSON.parse(String(o.receta_json))}))};
}
function recipeApply_(payload){
 const row=recipeValidated_(payload.row),key=recipeKey_(row),op=String(payload.op_id||'');
 if(key!==payload.key||!/^recipe_[\w-]{12,100}$/.test(op)||!Number.isSafeInteger(payload.revision)||payload.revision<0)throw new Error('Clave, operación o revisión inválida.');
 const sh=getOrCreateSheet_('recetas_personales',RECIPE_HEADERS_),headers=headers_(sh),all=sh.getLastRow()>1?sh.getRange(2,1,sh.getLastRow()-1,headers.length).getValues():[];
 const ix=all.findIndex(c=>String(c[headers.indexOf('clave')])===key),existing=ix>=0?rowObject_(headers,all[ix]):null;
 const ops=existing?JSON.parse(String(existing.op_ids_json||'[]')):[];
 if(ops.includes(op))return {ok:true,duplicate:true,op_id:op,key,revision:Number(existing.revision),row:JSON.parse(String(existing.receta_json))};
 const current=existing?Number(existing.revision):0;
 if(current!==payload.revision)return {ok:false,conflict:true,error:'La receta cambió en otro dispositivo. Exportá tu versión local y revisá antes de reemplazar.',key,revision:current};
 const revision=current+1,now=new Date().toISOString(),record={clave:key,revision,actualizado_en:now,op_ids_json:JSON.stringify([...ops,op]),receta_json:JSON.stringify(row)};
 sh.getRange(ix>=0?ix+2:sh.getLastRow()+1,1,1,headers.length).setValues([valuesByHeaders_(headers,record)]);
 return {ok:true,op_id:op,key,revision,row,updated_at:now};
}
