/* Public, prebuilt assets: native viewers cannot fetch this page's blob URLs. */
export function nativePlatform(nav=navigator){
 if(/iPad|iPhone|iPod/.test(nav.userAgent)||(nav.platform==='MacIntel'&&nav.maxTouchPoints>1))return 'ios';
 return /Android/i.test(nav.userAgent)?'android':'web';
}
export function arLinks(base){
 const glb=new URL('./celula-mobile-v2.glb',base).href,usdz=new URL('./celula-ios-v2.usdz',base).href;
 const fallback=new URL('../?ar_fallback=1',base).href;
 const android='intent://arvr.google.com/scene-viewer/1.0?'+new URLSearchParams({file:glb,mode:'ar_preferred',title:'Célula viva',resizable:'true'})+'#Intent;scheme=https;package=com.google.android.googlequicksearchbox;action=android.intent.action.VIEW;S.browser_fallback_url='+encodeURIComponent(fallback)+';end;';
 return {glb,usdz,android};
}
export function configureAR(){
 const prepare=document.getElementById('prepare-ar'),launch=document.getElementById('launch-ar'),viewer=document.getElementById('cell-ar'),status=document.getElementById('ar-state');
 const platform=nativePlatform(),links=arLinks(location.href);
 viewer.setAttribute('ios-src',links.usdz);
 launch.disabled=platform==='web';
 status.textContent=platform==='ios'?'Toque para colocar a célula no ambiente com a câmera do iPhone ou iPad.':platform==='android'?'Toque para abrir a célula no ambiente. Requer um Android compatível com RA.':'Explore em 3D aqui. Para colocar a célula no ambiente, abra esta página no iPhone ou Android.';
 function nativeOpen(){
  let doc=document;
  try{if(window.top.document)doc=window.top.document;}catch{}
  const link=doc.createElement('a');link.href=platform==='ios'?links.usdz:links.android;
  if(platform==='ios'){link.rel='ar';const img=doc.createElement('img');img.alt='Célula viva';link.append(img);}
  link.style.display='none';doc.body.append(link);link.click();setTimeout(()=>link.remove(),4000);
 }
 // Synchronous gesture: no conversion, fetch or await between tap and native viewer.
 launch.onclick=()=>{
  if(platform!=='web')nativeOpen();
  else viewer.activateAR().catch(()=>{status.textContent='Este navegador não abriu a RA. Use um celular compatível.';});
 };
 prepare.onclick=()=>{viewer.hidden=false;viewer.src=links.glb;status.textContent='Carregando a prévia da peça usada em RA…';};
 viewer.addEventListener('load',()=>{
  if(platform==='web')launch.disabled=!viewer.canActivateAR;
  status.textContent='Prévia pronta. A RA usa o modelo completo; o corte do núcleo é um recurso da exploração nesta página.';
 });
 viewer.addEventListener('error',()=>{status.textContent='A prévia da RA não carregou. Você ainda pode tentar o botão de abertura no celular.';});
}
