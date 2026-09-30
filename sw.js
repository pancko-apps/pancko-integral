/* Pancko Gestión v0.11.0 · Shell coherente y API sin caché. */
const CACHE_NAME='pancko-gestion-v0.11.0';
const APP_ASSETS=['./','./index.html','./assets/gestion.js','./assets/gestion.css','./manifest.webmanifest','./assets/icon-192.png','./assets/icon-512.png','./data/version.json','./data/articulos.csv','./data/clientes.csv','./data/recetas.csv'];
self.addEventListener('install',event=>{event.waitUntil(caches.open(CACHE_NAME).then(cache=>cache.addAll(APP_ASSETS))); // espera cierre de ventanas: no mezcla una página vieja con código nuevo.
});
self.addEventListener('activate',event=>{event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>(k.startsWith('pancko-integral-')||k.startsWith('pancko-gestion-'))&&k!==CACHE_NAME).map(k=>caches.delete(k)))));});
self.addEventListener('fetch',event=>{
 const request=event.request,url=new URL(request.url);
 // Worker/Apps Script nunca se guardan ni se responden desde Cache Storage.
 if(request.method!=='GET'||url.origin!==self.location.origin)return;
 const scope=new URL('./',self.location.href).pathname;
 if(!url.pathname.startsWith(scope))return;
 if(request.mode==='navigate'){
  event.respondWith(caches.open(CACHE_NAME).then(async cache=>(await cache.match('./index.html'))||fetch(request)));
  return;
 }
 const asset=APP_ASSETS.find(a=>new URL(a,self.location.href).pathname===url.pathname);
 if(!asset)return;
 event.respondWith(caches.open(CACHE_NAME).then(async cache=>(await cache.match(asset))||fetch(request)));
});
