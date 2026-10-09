const fs=require('fs'),vm=require('vm'),assert=require('assert'),path=require('path');
const html=fs.readFileSync(path.resolve(__dirname,'../index.html'),'utf8');
const from=html.indexOf('function ccClientIdIssues()'),to=html.indexOf('function ccOpenForm(kind)',from);
assert(from>0&&to>from);
const elements=new Map(['ccScreen','ccMetrics','ccClientList','ccDetail','ccSearch','ccFilter','ccListStatus','ccNotice'].map(id=>[id,{innerHTML:'',textContent:'',value:id==='ccSearch'?'muni':id==='ccFilter'?'all':''}]));
const ctx=vm.createContext({
 document:{getElementById:id=>elements.get(id)||null},
 clients:[{id:'dup',cliente:'Uno'},{id:'dup',cliente:'Dos'},{id:'muni',cliente:'Municipalidad',telefono:'',localidad:''}],
 ccBook:{movements:[]},ccError:'',ccMessage:'',ccSelectedId:'muni',
 ccNotice:m=>{elements.get('ccNotice').textContent=m},
 ccNumbers:id=>({charges:53703719,payments:0,balance:53703719,last:null}),ccMoney:n=>'$ '+(n/100).toFixed(2),
 ccNormalize:s=>String(s||'').toLowerCase(),ccMoves:()=>[],
 cashDateLabel:x=>x,esc:s=>String(s),CC_TYPES:{charge:'Cargo'}
});
vm.runInContext('function ccClient(){return clients.find(c=>c.id===ccSelectedId)}',ctx);
vm.runInContext(html.slice(from,to),ctx);
vm.runInContext('ccRender()',ctx);
assert.match(elements.get('ccClientList').innerHTML,/Municipalidad/);
assert.match(elements.get('ccDetail').innerHTML,/Municipalidad/);
assert.doesNotMatch(elements.get('ccDetail').innerHTML,/bloquead/i);
assert.equal(vm.runInContext('ccClientIdSafe("muni")',ctx),true);
assert.equal(vm.runInContext('ccClientIdSafe("dup")',ctx),false);
vm.runInContext('ccSelectedId="dup";ccRenderDetail()',ctx);
assert.match(elements.get('ccDetail').innerHTML,/ID faltante o duplicado/);
console.log('OK CC: duplicados ajenos no bloquean la ficha única; ID ambiguo permanece protegido.');
