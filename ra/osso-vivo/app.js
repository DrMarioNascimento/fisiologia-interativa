import * as THREE from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {GLTFExporter} from 'three/addons/exporters/GLTFExporter.js';
import {RoomEnvironment} from 'three/addons/environments/RoomEnvironment.js';
import {prepararParaRA} from '../cores-para-ra.js';
import {criar,NIVEIS} from './modelos.js?v=osso-anatomia-20261004';
import {estado,avancar,CENARIOS,CORES} from './fisica.js?v=osso-anatomia-20261004';
const $=id=>document.getElementById(id),fmt=(v,n=1)=>v.toLocaleString('pt-BR',{minimumFractionDigits:n,maximumFractionDigits:n});
const stage=$('stage'),renderer=new THREE.WebGLRenderer({canvas:$('scene'),antialias:true,alpha:true,powerPreference:'high-performance'});
renderer.setPixelRatio(Math.min(devicePixelRatio,1.7));renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.04;
const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(37,1,.01,100);
const pmrem=new THREE.PMREMGenerator(renderer),environment=pmrem.fromScene(new RoomEnvironment(),.04);scene.environment=environment.texture;scene.environmentIntensity=.65;pmrem.dispose();
const hemisphere=new THREE.HemisphereLight(0xe4f6ff,0x263044,.85);scene.add(hemisphere);
const lights=[];
for(const [color,intensity,pos]of [[0xffe9d8,1.7,[4,6,5]],[0x8cc6df,.75,[-4,2,4]],[0xabc6d7,1.25,[0,3,-5]]]){const l=new THREE.DirectionalLight(color,intensity);l.position.set(...pos);scene.add(l);lights.push(l);}
const controls=new OrbitControls(camera,renderer.domElement);controls.enableDamping=true;controls.dampingFactor=.07;controls.minDistance=.6;controls.maxDistance=22;
function canvasFactory(w,h,draw,{repeatX=1,repeatY=1}={}){const c=document.createElement('canvas');c.width=w;c.height=h;draw(c.getContext('2d'),w,h);const tex=new THREE.CanvasTexture(c);tex.colorSpace=THREE.SRGBColorSpace;tex.wrapS=tex.wrapT=THREE.RepeatWrapping;tex.repeat.set(repeatX,repeatY);return tex;}
function textura(tipo){return canvasFactory(512,512,(ctx,w,h)=>{
 const image=ctx.createImageData(w,h);let seed=72917;
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){seed=(Math.imul(seed,1664525)+1013904223)>>>0;const n=(seed/4294967296-.5)*24;const bands=tipo==='lamela'?14*Math.sin(y*.13+3*Math.sin(x*.016))+5*Math.cos(y*.27):tipo==='colageno'?28*Math.cos(x*.22)+5*Math.sin(y*.09):tipo==='celula'?13*Math.sin(x*.06)*Math.sin(y*.11)+8*Math.cos(x*.14+y*.1):24*Math.sin(x*.027+y*.018)*Math.cos(y*.043)+7*Math.sin(x*.19-y*.12);const c=Math.max(0,Math.min(255,211+n*.5+bands*.55)),i=(y*w+x)*4;image.data[i]=c;image.data[i+1]=c;image.data[i+2]=c;image.data[i+3]=255;}ctx.putImageData(image,0,0);if(tipo==='osso'){for(let k=0;k<900;k++){seed=(Math.imul(seed,1664525)+1013904223)>>>0;const x=seed%w;seed=(Math.imul(seed,1664525)+1013904223)>>>0;const y=seed%h,r=1+(seed%30)/12;ctx.fillStyle='rgba(79,66,53,.13)';ctx.beginPath();ctx.ellipse(x,y,r,r*.55,k,0,Math.PI*2);ctx.fill();}}
 });}

const anatomy=criar(textura);anatomy.modelos.forEach((m,i)=>{m.visible=i===0;scene.add(m);});
// A câmera cobre partes reunidas e desmontadas sem saltar durante a animação.
const bounds=anatomy.modelos.map((m,i)=>{const box=new THREE.Box3();for(const separation of [0,1])for(const time of [0,.025,.30,1]){anatomy.atualizar(i,time,'exercicio',separation,true);box.union(new THREE.Box3().setFromObject(m));}anatomy.atualizar(i,0,'habitual');return box;});
const traces=Object.fromEntries(Object.keys(CENARIOS).map(key=>[key,Array.from({length:201},(_,i)=>estado(i/200,key))]));
let nivel=0,instante=0,cenario='habitual',running=false,speed=1,separacao=Number($('separation').value)/100,mostrarCarga=$('showLoad').checked,labels=$('toggleLabels').checked,frame=0,uiElapsed=0,exportId=0,readyId=-1,arUrl=null,arTimer=null,disposed=false;
let labelNodes=[];
function enquadrar(box=bounds[nivel]){
 const size=box.getSize(new THREE.Vector3()),center=box.getCenter(new THREE.Vector3());
 const direction=new THREE.Vector3(nivel===2?.46:.20,nivel>=3?.70:nivel===2?.33:.12,1).normalize(),right=new THREE.Vector3().crossVectors(camera.up,direction).normalize(),up=new THREE.Vector3().crossVectors(direction,right),tan=Math.tan(camera.fov*Math.PI/360);let dist=0;
 for(const x of [box.min.x,box.max.x])for(const y of [box.min.y,box.max.y])for(const z of [box.min.z,box.max.z]){const p=new THREE.Vector3(x,y,z).sub(center),depth=p.dot(direction);dist=Math.max(dist,Math.abs(p.dot(right))/(tan*camera.aspect)+depth,Math.abs(p.dot(up))/tan+depth);}
 dist=Math.max(2,dist*1.14);controls.target.copy(center);camera.position.copy(center).add(direction.multiplyScalar(dist));camera.near=Math.max(.01,dist/1000);camera.far=Math.max(100,dist*5);camera.updateProjectionMatrix();controls.update();
}
function criarLegendas(){
 $('labels').replaceChildren();labelNodes=anatomy.modelos[nivel].userData.labels.map(l=>{const el=document.createElement('span');el.textContent=l.text;el.style.borderLeftColor=[CORES.carga,CORES.carga,CORES.osteocito,CORES.reabsorcao,CORES.formacao][nivel];$('labels').append(el);return {...l,source:l,el};});
}
function posicionarLegendas(){
 const w=stage.clientWidth,h=stage.clientHeight,placed=[];
 for(const l of labelNodes){const world=anatomy.modelos[nivel].localToWorld(l.pos.clone()),p=world.project(camera);l.el.hidden=!labels||l.source.visible===false||p.z>1||p.z<-1||Math.abs(p.x)>1.05||Math.abs(p.y)>1.05;if(l.el.hidden)continue;
  const x=(p.x*.5+.5)*w,y=(-p.y*.5+.5)*h,ew=l.el.offsetWidth,eh=l.el.offsetHeight,left=Math.min(w-ew-8,Math.max(8,x+12));let top=Math.min(h-eh-36,Math.max(52,y-10));
  for(let n=0;n<placed.length;n++){const collision=placed.find(r=>left<r.x+r.w+4&&left+ew>r.x-4&&top<r.y+r.h+4&&top+eh>r.y-4);if(!collision)break;top=Math.min(h-eh-36,collision.y+collision.h+5);}
  l.el.style.left=left+'px';l.el.style.top=top+'px';placed.push({x:left,y:top,w:ew,h:eh});
 }
}

function definirRunning(value){running=value;$('play').textContent=value?'Pausar':'Iniciar';$('play').setAttribute('aria-pressed',String(value));if(value){++exportId;clearTimeout(arTimer);$('launchAR').disabled=true;$('raStatus').textContent='Pause para preparar o estado atual em RA.';}else prepararRA();}
function atualizar(leituras=true){
 const a=anatomy.atualizar(nivel,instante,cenario,separacao,mostrarCarga);$('phaseLabel').textContent=a.fase;$('loadLabel').hidden=nivel>2||!mostrarCarga;$('loadLabel').textContent='Carga relativa '+fmt(a.carga,2)+'× · deformação ampliada';$('focusDetail').disabled=nivel===4&&a.depositada<=.001;$('focusDetail').title=$('focusDetail').disabled?'Avance o ciclo até a formação do osteoide.':'Aproximar a estrutura destacada; Recentrar volta ao conjunto.';if(!leituras)return;
 $('instant').value=instante*100;$('instantValue').textContent=fmt(instante*100,1)+'%';
 for(const [id,key]of [['removedValue','retirada'],['formedValue','depositada'],['mineralValue','mineralizada'],['totalValue','mineral']])$(id).textContent=fmt(a[key]*100,1)+'%';
 $('balance').textContent='Osteoide ainda não mineralizado: '+fmt(a.osteoide*100,1)+'%. Total mineralizado = 100% − matriz retirada + parte nova mineralizada.';
 $('sclerostin').textContent=CENARIOS[cenario].esclerostina;
 document.querySelectorAll('.cycle-steps span').forEach((el,i)=>el.classList.toggle('active',i===(instante<.08?0:instante<.3?1:instante<.4?2:instante<.85?3:4)));
 drawGraphs();
}
function selecionar(i){
 nivel=Math.max(0,Math.min(4,i));const d=NIVEIS[nivel];$('stepLabel').textContent=String(nivel+1).padStart(2,'0')+' · '+d.nome;$('infoTitle').textContent=d.titulo;$('infoText').textContent=d.texto;$('infoEyebrow').textContent='Nível '+(nivel+1)+' · escala ampliada';$('raPiece').textContent=$('stepLabel').textContent;
 document.querySelectorAll('[data-step],[data-ra-step]').forEach(b=>{const active=Number(b.dataset.step??b.dataset.raStep)===nivel;b.classList.toggle('active',active);b.setAttribute('aria-pressed',String(active));});
 $('showLoad').disabled=nivel>2;anatomy.modelos.forEach((m,j)=>m.visible=j===nivel);atualizar();enquadrar();criarLegendas();prepararRA();
}
function chart(id){const el=$(id),w=Math.max(230,el.clientWidth),h=240,dpr=Math.min(devicePixelRatio,2);if(el.width!==Math.round(w*dpr)||el.height!==h*dpr){el.width=Math.round(w*dpr);el.height=h*dpr;}const c=el.getContext('2d');c.setTransform(dpr,0,0,dpr,0,0);c.clearRect(0,0,w,h);return {c,w,h};}
function drawGraphs(){
 if($('panel-graphs').hidden)return;
 for(const first of [true,false]){const {c,w,h}=chart(first?'electrical':'mechanical'),lo=first?0:75,hi=first?24:105,left=42,right=15,x=u=>left+u*(w-left-right),y=v=>24+(hi-v)/(hi-lo)*(h-55);
 c.font='10px Inter,Arial';c.fillStyle='#a6bdcf';c.strokeStyle='#345365';c.lineWidth=1;
 for(let k=0;k<=4;k++){const value=lo+(hi-lo)*k/4,py=y(value);c.beginPath();c.moveTo(left,py);c.lineTo(w-right,py);c.stroke();c.fillText(fmt(value,0),3,py+3);}c.fillText('% da região inicial',3,13);
 for(const u of [0,.5,1]){c.textAlign=u===0?'left':u===1?'right':'center';c.fillText(fmt(u*100,0)+'% ciclo',x(u),h-10);}c.textAlign='left';
 if(!first){c.setLineDash([4,4]);c.strokeStyle='#a6bdcf';c.beginPath();c.moveTo(left,y(100));c.lineTo(w-right,y(100));c.stroke();c.setLineDash([]);}
 const curves=first?[['retirada',CORES.reabsorcao,cenario],['depositada',CORES.formacao,cenario],['mineralizada',CORES.mineral,cenario]]:[['mineral',CORES.carga,'habitual'],['mineral',CORES.formacao,'exercicio'],['mineral',CORES.reabsorcao,'imobilizacao']];
 for(const [key,color,caseKey]of curves){c.strokeStyle=color;c.lineWidth=first||caseKey===cenario?2.2:1.3;c.beginPath();traces[caseKey].forEach((a,i)=>{const px=x(a.u),py=y(a[key]*100);i?c.lineTo(px,py):c.moveTo(px,py);});c.stroke();}
 c.lineWidth=1.2;c.strokeStyle='#f5e3b8';c.beginPath();c.moveTo(x(instante),19);c.lineTo(x(instante),h-30);c.stroke();
 }
}
document.addEventListener('studychange',()=>{drawGraphs();if(!$('panel-ra').hidden)prepararRA();});
function resize(){const w=stage.clientWidth,h=stage.clientHeight;if(w&&h){renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();enquadrar();drawGraphs();}}
const observer=new ResizeObserver(resize);observer.observe(stage);
function clonarPeca(source){
 // Só a anatomia e suas transformações vão ao GLB. As listas de animação têm
 // referências às malhas e não devem duplicar geometrias/texturas nos extras.
 const clone=source.isMesh?new THREE.Mesh(source.geometry,source.material):new THREE.Group();
 clone.position.copy(source.position);clone.quaternion.copy(source.quaternion);clone.scale.copy(source.scale);clone.visible=source.visible;clone.name=source.name;clone.renderOrder=source.renderOrder;
 for(const child of source.children)clone.add(clonarPeca(child));return clone;
}
function prepararRA(){
 const id=++exportId;clearTimeout(arTimer);$('launchAR').disabled=true;
 if(running||$('panel-ra').hidden)return;$('raStatus').textContent='Preparando o estado atual…';
 arTimer=setTimeout(async()=>{try{
  anatomy.atualizar(nivel,instante,cenario,separacao,mostrarCarga);const clone=clonarPeca(anatomy.modelos[nivel]);clone.visible=true;
  const box=new THREE.Box3().setFromObject(clone),size=box.getSize(new THREE.Vector3());clone.scale.setScalar(.65/Math.max(size.x,size.y,size.z));clone.updateMatrixWorld(true);
  const fitted=new THREE.Box3().setFromObject(clone),center=fitted.getCenter(new THREE.Vector3());clone.position.set(-center.x,-fitted.min.y,-center.z);prepararParaRA(clone);
  const wrap=new THREE.Group();wrap.add(clone);const buffer=await new GLTFExporter().parseAsync(wrap,{binary:true,onlyVisible:true});
  if(id!==exportId||running||disposed)return;if(arUrl)URL.revokeObjectURL(arUrl);arUrl=URL.createObjectURL(new Blob([buffer],{type:'model/gltf-binary'}));readyId=id;$('arViewer').alt='Peça selecionada: '+NIVEIS[nivel].nome;$('arViewer').src=arUrl;
 }catch(e){if(id!==exportId)return;console.error(e);$('raStatus').textContent='Não foi possível preparar a RA. A experiência 3D continua disponível.';}},250);
}
$('arViewer').addEventListener('load',()=>{if(readyId!==exportId||running)return;$('launchAR').disabled=!$('arViewer').canActivateAR;$('launchAR').textContent='Abrir '+NIVEIS[nivel].nome+' em RA';$('raStatus').textContent=$('arViewer').canActivateAR?'Estado pronto para RA · ampliação de aproximadamente 65 cm.':'Modelo 3D pronto. Para RA, use Safari no iPhone/iPad ou Chrome no Android compatível.';});
$('arViewer').addEventListener('error',()=>{$('launchAR').disabled=true;$('raStatus').textContent='A prévia de RA não carregou. O modelo 3D continua disponível.';});
$('launchAR').onclick=()=>{$('arViewer').activateAR().catch(()=>{$('raStatus').textContent='A câmera não abriu. Confira a compatibilidade e a permissão no aparelho.';});};

$('play').onclick=()=>{if(!running&&instante>=1)instante=0;definirRunning(!running);atualizar();};
$('reset').onclick=()=>{definirRunning(false);instante=0;atualizar();prepararRA();};
$('instant').oninput=()=>{definirRunning(false);instante=Number($('instant').value)/100;atualizar();prepararRA();};
$('speed').oninput=()=>{speed=Number($('speed').value);$('speedValue').textContent=fmt(speed,speed%1?2:0)+'×';};
$('separation').oninput=()=>{separacao=Number($('separation').value)/100;$('separationValue').textContent=fmt(separacao*100,0)+'%';atualizar();prepararRA();};
$('showLoad').onchange=()=>{mostrarCarga=$('showLoad').checked;atualizar();prepararRA();};
$('quick').onclick=e=>{const b=e.target.closest('[data-case]');if(!b)return;definirRunning(false);cenario=b.dataset.case;instante=0;document.querySelectorAll('[data-case]').forEach(el=>{el.classList.toggle('on',el===b);el.setAttribute('aria-pressed',String(el===b));});atualizar();prepararRA();};
document.querySelectorAll('[data-step]').forEach(b=>b.onclick=()=>selecionar(Number(b.dataset.step)));
$('raChoices').innerHTML=NIVEIS.map((d,i)=>'<button class="button" data-ra-step="'+i+'">'+String(i+1).padStart(2,'0')+' · '+d.nome+'</button>').join('');
document.querySelectorAll('[data-ra-step]').forEach(b=>b.onclick=()=>selecionar(Number(b.dataset.raStep)));
$('resetView').onclick=()=>enquadrar();$('focusDetail').onclick=()=>enquadrar(new THREE.Box3().setFromObject(anatomy.detalhes[nivel]));$('toggleLabels').onchange=()=>{labels=$('toggleLabels').checked;posicionarLegendas();};
$('fullscreen').onclick=async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else await stage.requestFullscreen();}catch{$('fullscreen').textContent='Ampliar indisponível';}};
$('exitFullscreen').onclick=()=>document.exitFullscreen();document.addEventListener('fullscreenchange',()=>{$('fullscreen').textContent=document.fullscreenElement?'Reduzir':'Ampliar';resize();});
document.addEventListener('visibilitychange',()=>{if(document.hidden&&running)definirRunning(false);});
addEventListener('pagehide',()=>{disposed=true;++exportId;clearTimeout(arTimer);observer.disconnect();renderer.setAnimationLoop(null);if(arUrl)URL.revokeObjectURL(arUrl);controls.dispose();renderer.dispose();environment.dispose();});
const initial=Number.parseInt(new URLSearchParams(location.search).get('nivel'),10);resize();selecionar(Number.isFinite(initial)?initial-1:0);
renderer.setAnimationLoop(t=>{const dt=Math.min(.06,Math.max(0,(t-frame)/1000));frame=t;if(running&&!document.hidden){const next=avancar(instante,dt*speed/40,$('loop').checked);instante=next.t;uiElapsed+=dt;const ui=uiElapsed>=.05||next.fim;atualizar(ui);if(ui)uiElapsed=0;if(next.fim)definirRunning(false);}controls.update();posicionarLegendas();renderer.render(scene,camera);});
