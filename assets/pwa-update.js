/* Pancko Gestión v0.12.6 · Recarga de archivos sin borrar almacenamiento local. */
'use strict';
const PANCKO_INSTALLED_VERSION='Pancko Gestión v0.12.6';
let pwaPublishedVersion='',pwaCheckedAt='',pwaUpdateBusy=false;
async function pwaRegistration(){return 'serviceWorker' in navigator?navigator.serviceWorker.getRegistration('./'):null;}
async function pwaRenderUpdate(note=''){const box=document.getElementById('pwaUpdateInfo');if(!box)return;let status='No disponible';
 try{if('serviceWorker' in navigator){const r=await pwaRegistration();status=r?.waiting?'Actualización en espera':r?.active?'Activo'+(navigator.serviceWorker.controller?' · controlando esta ventana':' · activando'):'Sin registro activo';}}
 catch{status='No se pudo consultar el service worker';}
 box.textContent='Instalada: '+PANCKO_INSTALLED_VERSION+' · Publicada: '+(pwaPublishedVersion||'sin consultar')+' · Última comprobación: '+(pwaCheckedAt?new Date(pwaCheckedAt).toLocaleString('es-AR'):'—')+' · Service worker: '+status+(note?' · '+note:'');
}
async function pwaCheckUpdate(){if(pwaUpdateBusy)return false;pwaUpdateBusy=true;try{
 const url=new URL('./data/version.json',location.href);url.searchParams.set('pk_fresh',Date.now().toString());const res=await fetch(url.href,{cache:'no-store',headers:{'Cache-Control':'no-cache'}});if(!res.ok)throw new Error('No se pudo leer version.json ('+res.status+').');
 const data=await res.json();if(typeof data.app!=='string'||!/^Pancko Gestión v\d+\.\d+\.\d+$/.test(data.app))throw new Error('La versión publicada no tiene el formato esperado.');
 pwaPublishedVersion=data.app;pwaCheckedAt=new Date().toISOString();await pwaRenderUpdate(data.app===PANCKO_INSTALLED_VERSION?'La versión coincide. Podés recargar igual.':'Actualización disponible.');return true;
 }catch(e){await pwaRenderUpdate('Comprobación demorada: '+e.message);return false;}finally{pwaUpdateBusy=false;}}
async function pwaForceUpdate(){if(pwaUpdateBusy)return;if(!navigator.onLine){await pwaRenderUpdate('Necesitás conexión para renovar los archivos. Tus datos siguen disponibles.');return;}
 if(!confirm('Se cerrará y recargará Pancko. Sólo se limpian archivos cacheados de esta app; tus datos locales se conservan. ¿Continuar?'))return;
 if(!await pwaCheckUpdate())return;
 pwaUpdateBusy=true;try{
  if(!('caches' in window))throw new Error('Este navegador no permite limpiar Cache Storage desde Pancko.');
  const reg=await pwaRegistration();if(reg)try{await reg.update();}catch{}
  const names=await caches.keys();await Promise.all(names.filter(n=>n.startsWith('pancko-gestion-')||n.startsWith('pancko-integral-')).map(n=>caches.delete(n)));
  if(reg&&!await reg.unregister())throw new Error('No se pudo renovar el registro offline. Cerrá todas las ventanas y volvé a intentar.');
  const url=new URL(location.href);url.searchParams.set('pk_refresh',Date.now().toString());location.replace(url.href);
 }catch(e){await pwaRenderUpdate('No se completó la recarga: '+e.message);}finally{pwaUpdateBusy=false;}
}
pwaRenderUpdate();
