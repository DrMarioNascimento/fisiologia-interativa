import * as THREE from 'three';
import {CORES} from './fisica.js?v=jun-20261003';
const V=(x=0,y=0,z=0)=>new THREE.Vector3(x,y,z);
export const NIVEIS=[
 {nome:'O encontro',titulo:'Uma conexão, duas células',texto:'O axônio motor termina em ramos sobre uma fibra muscular. A mielina termina antes dos botões; células de Schwann terminais acompanham a arborização. O nervo não se funde à fibra: existe uma fenda entre as membranas.'},
 {nome:'O terminal',titulo:'O impulso prepara a liberação',texto:'O corte revela vesículas e mitocôndrias. A chegada do impulso abre canais de cálcio do terminal. A entrada de cálcio favorece a fusão das vesículas e a liberação de acetilcolina nas zonas ativas.'},
 {nome:'A fenda',titulo:'Uma resposta local precisa alcançar o limiar',texto:'A acetilcolina alcança receptores nicotínicos nas cristas das pregas musculares. O potencial de placa é graduado. Os canais de sódio dependentes de voltagem, concentrados nas regiões profundas, permitem iniciar o potencial de ação muscular. A acetilcolinesterase encerra o sinal.'},
 {nome:'A tríade',titulo:'O sinal elétrico chega ao reservatório',texto:'Um túbulo T fica entre duas cisternas terminais do retículo sarcoplasmático. No músculo esquelético, o sensor DHPR transmite a mudança de voltagem ao RyR1. O retículo libera cálcio no sarcoplasma; depois, a SERCA promove sua recaptura.'},
 {nome:'A contração',titulo:'O cálcio permite a interação dos filamentos',texto:'O cálcio liga-se à troponina C e desloca a tropomiosina, permitindo as pontes entre actina e miosina. A ativação cresce depois do sinal elétrico e diminui após a recaptura do cálcio. Os filamentos mantêm seus comprimentos; a banda A não encurta.'}
];
export function criar(textura){
 const bump=textura('tecido'),bands=textura('estrias');
 const mat=(cor,extra={})=>new THREE.MeshPhysicalMaterial({color:cor,roughness:.54,metalness:0,sheen:.3,sheenRoughness:.7,bumpMap:bump,bumpScale:.035,...extra});
 const M={nerve:mat('#ceb5a0'),muscle:mat('#c98583',{map:bands,bumpScale:.018}),membrane:mat('#dba6a0',{side:THREE.DoubleSide}),inside:mat('#a96c70'),glia:mat('#8dadaa',{transparent:true,opacity:.23,depthWrite:false,side:THREE.DoubleSide}),nucleus:mat('#53658b'),vesicle:mat('#ddc292',{bumpScale:.014}),mito:mat('#b57058'),crista:mat('#e5b194'),ach:mat(CORES.ach),ca:mat(CORES.ca,{emissive:CORES.ca,emissiveIntensity:.12}),sodium:mat(CORES.vm),receptor:mat('#ba9c69'),ryr:mat('#9883bb'),reticulum:mat('#b4aaa7'),t:mat('#8ab3ac'),pulse:mat(CORES.vm,{emissive:CORES.vm,emissiveIntensity:.7})};
 const sphere=new THREE.SphereGeometry(1,20,14),small=new THREE.SphereGeometry(1,10,8);
 function ell(g,pos,size,material,rough=false){
  const geo=rough?sphere.clone():sphere;
  if(rough){const a=geo.attributes.position;for(let i=0;i<a.count;i++){const x=a.getX(i),y=a.getY(i),z=a.getZ(i),r=1+.035*Math.sin(x*8+y*5)*Math.cos(z*9-y*3);a.setXYZ(i,x*r,y*r,z*r);}geo.computeVertexNormals();}
  const mesh=new THREE.Mesh(geo,material);mesh.position.copy(V(...pos));mesh.scale.set(...size);g.add(mesh);return mesh;
 }
 function tube(g,points,r,material,end=r,segments=44){
  const c=new THREE.CatmullRomCurve3(points.map(p=>V(...p))),geo=new THREE.TubeGeometry(c,segments,1,12,false),a=geo.attributes.position;
  for(let i=0;i<=segments;i++){const u=i/segments,p=c.getPointAt(u),radius=(r+(end-r)*u)*(1+.035*Math.sin(u*19));for(let j=0;j<=12;j++){const k=i*13+j;a.setXYZ(k,p.x+(a.getX(k)-p.x)*radius,p.y+(a.getY(k)-p.y)*radius,p.z+(a.getZ(k)-p.z)*radius);}}
  geo.computeVertexNormals();const mesh=new THREE.Mesh(geo,material);g.add(mesh);return {mesh,curve:c};
 }
 function label(g,text,pos){g.userData.labels.push({text,pos:V(...pos)});}
 function group(){const g=new THREE.Group();g.userData={labels:[],particles:[],pulses:[],receptors:[]};return g;}
 function mito(g,pos,scale=.45){
  const organ=new THREE.Group();organ.position.copy(V(...pos));organ.scale.setScalar(scale);organ.rotation.set(.2,.35,-.3);g.add(organ);
  const cut=new THREE.Mesh(new THREE.SphereGeometry(1,36,22,Math.PI,Math.PI),M.mito);
  cut.scale.set(1,.45,.42);organ.add(cut);
  ell(organ,[0,0,-.1],[.95,.4,.13],M.inside,true);
  for(let k=0;k<9;k++){const x=-.7+k*.17;tube(organ,[[x-.06,-.28,.22],[x+.09,0,.3],[x-.06,.25,.22]],.025,M.crista,.023,12);}
 }
 function dots(g,type,n,path){for(let i=0;i<n;i++){const m=new THREE.Mesh(small,type==='ach'?M.ach:type==='na'?M.sodium:M.ca);m.scale.setScalar(type==='ach'?.043:.035);g.add(m);g.userData.particles.push({m,type,index:i,n,path});}}
 function receptor(g,x,y,z,type='ach'){
  const protein=new THREE.Group();protein.position.set(x,y,z);g.add(protein);
  for(let k=0;k<(type==='ach'?5:4);k++){const a=k*Math.PI*2/(type==='ach'?5:4),r=.095;tube(protein,[[Math.cos(a)*r,-.14,Math.sin(a)*r],[Math.cos(a)*r*.8,.05,Math.sin(a)*r*.8],[Math.cos(a)*r*1.35,.19,Math.sin(a)*r*1.35]],.042,type==='ach'?M.receptor:type==='ca'?M.ca:M.sodium,.05,12);}
  g.userData.receptors.push({protein,type});return protein;
 }
 function sheet(g,offset=0,folded=false,material=M.membrane){
  const nu=92,nv=18,positions=[],uv=[],index=[];
  const surface=(x,z)=>offset+(folded?-.62*Math.pow((1+Math.cos(x*5.7))*.5,7):.11*Math.cos(x*1.1))+.075*Math.cos(z*2);
  for(let i=0;i<=nu;i++)for(let j=0;j<=nv;j++){const u=i/nu,v=j/nv,x=(u-.5)*5,z=(v-.5)*2.4*(.8+.2*Math.sin(u*Math.PI));positions.push(x,surface(x,z),z);uv.push(u,v);}
  for(let i=0;i<nu;i++)for(let j=0;j<nv;j++){const a=i*(nv+1)+j,b=a+nv+1;index.push(a,a+1,b,a+1,b+1,b);}
  const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));geo.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));geo.setIndex(index);geo.computeVertexNormals();g.add(new THREE.Mesh(geo,material));
  // A bicamada acompanha o corte biológico; não é uma base ou pedestal.
  for(let i=0;i<83;i++){const x=-2.45+i*4.9/82,z=1.2*(.8+.2*Math.sin((x/5+.5)*Math.PI));for(const s of [-1,1]){
   const y=surface(x,z)+s*.035;const h=new THREE.Mesh(small,M.membrane);h.position.set(x,y,z);h.scale.setScalar(.026);g.add(h);
   tube(g,[[x,y,z],[x+.012,y-s*.022,z+.008],[x-.006,y-s*.033,z+.015]],.006,M.reticulum,.004,5);
  }}return surface;
 }
 const encounter=group();
 const fiber=new THREE.Mesh(new THREE.CapsuleGeometry(.87,5.9,12,60),M.muscle);fiber.rotation.z=Math.PI/2;fiber.position.y=-.94;encounter.add(fiber);
 for(let i=0;i<4;i++)ell(encounter,[-2.4+i*1.5,-.96,.83],[.22,.085,.095],M.nucleus,true);
 const main=tube(encounter,[[-3,2.45,-.25],[-2.1,1.5,-.1],[-.8,1.03,0]],.16,M.nerve,.13);
 for(let i=0;i<4;i++){
  const x=-1.3+i*.9,z=(i%2?.43:-.28);
  const pts=[[-.8,1.03,0],[x*.6,.66,z*.45],[x,.22,z],[x+.24,.04,z+.15]];
  tube(encounter,pts,.13,M.nerve,.105);ell(encounter,[x+.19,.07,z+.14],[.38,.2,.25],M.nerve,true);
  ell(encounter,[x+.16,.24,z+.12],[.42,.15,.32],M.glia,true);ell(encounter,[x+.24,.3,z+.16],[.13,.08,.075],M.nucleus);
 }
 for(let i=0;i<4;i++){const u=.09+i*.19,p=main.curve.getPoint(u);const sheath=ell(encounter,[p.x,p.y,p.z],[.24,.38,.24],M.glia,true);sheath.rotation.z=.6;ell(encounter,[p.x+.2,p.y+.05,p.z+.02],[.075,.13,.06],M.nucleus);}
 const nervePulse=ell(encounter,[-3,2.45,-.25],[.19,.19,.19],M.pulse);encounter.userData.pulses.push({m:nervePulse,curve:main.curve});
 label(encounter,'Axônio motor',[-2.3,1.75,0]);label(encounter,'Schwann terminal',[1.5,.44,.55]);label(encounter,'Fibra muscular',[1.5,-1.35,.8]);label(encounter,'Placa motora',[-.5,.12,.5]);
 const terminal=group();
 // A janela ocupa a face anterior: o corte revela o terminal já na vista inicial.
 const shellGeo=new THREE.SphereGeometry(1,64,36,Math.PI,Math.PI);
 const shell=new THREE.Mesh(shellGeo,M.membrane);shell.scale.set(2.25,1.25,1.28);shell.position.y=.6;terminal.add(shell);
 const rim=[];for(let i=0;i<=64;i++){const a=i*Math.PI*2/64;rim.push([Math.cos(a)*2.25,.6+Math.sin(a)*1.25,0]);}tube(terminal,rim,.04,M.nerve,.04,96);
 tube(terminal,[[-3.05,1.4,-.4],[-2.35,1.22,-.1],[-1.8,.95,0]],.3,M.nerve,.35);
 ell(terminal,[.2,1.4,-.6],[1.9,.25,.85],M.glia,true);ell(terminal,[.9,1.55,-.4],[.29,.16,.2],M.nucleus,true);
 sheet(terminal,-1.05,true,M.inside);
 for(let i=0;i<64;i++){const a=i*2.3999,r=.28+1.48*Math.sqrt((i+.5)/64);ell(terminal,[Math.cos(a)*r,-.3+(i%5)*.19,Math.sin(a)*r*.53],[.12,.12,.12],M.vesicle);}
 mito(terminal,[-.85,.77,.25],.54);mito(terminal,[.86,.8,.09],.43);
 for(let i=0;i<6;i++){const x=-1.55+i*.62,y=.6-1.25*Math.sqrt(1-(x/2.25)**2);receptor(terminal,x,y,.01,'ca');}
 dots(terminal,'ach',25,u=>V(-1.5+(u*17%1)*3,-.5-u*.6,.58+.18*Math.sin(u*25)));
 dots(terminal,'preca',16,u=>V(-1.5+3*(u*13%1),-.55+u*.53,.28));
 label(terminal,'Vesículas de ACh',[-.5,.45,.75]);label(terminal,'Mitocôndria',[-.95,1,.38]);label(terminal,'Ca²⁺ do terminal',[1.25,-.43,.4]);label(terminal,'Zona ativa',[0,-.57,.74]);label(terminal,'Membrana muscular',[1,-1.4,1.15]);
 const cleft=group();
 const surface=sheet(cleft,-.62,true);sheet(cleft,1.07,false,M.nerve);
 const cristas=[-3*Math.PI/5.7,-Math.PI/5.7,Math.PI/5.7,3*Math.PI/5.7];
 for(const x of cristas)receptor(cleft,x,surface(x,.58)+.1,.58);
 for(let i=-2;i<=2;i++){const x=i*2*Math.PI/5.7;receptor(cleft,x,surface(x,.05)+.04,.05,'na');}
 for(let i=0;i<8;i++){const x=-2+i*.55;ell(cleft,[x,1.2,.42],[.12,.12,.12],M.vesicle);ell(cleft,[x,.3,-.3],[.09,.08,.07],M.reticulum,true);}
 dots(cleft,'ach',38,u=>V(-2.1+4.2*(u*11.7%1),1.02-u*1.5,.42+.15*Math.sin(u*31)));
 dots(cleft,'na',23,u=>{const x=cristas[Math.floor((u*4)%4)];return V(x,surface(x,.58)+.38-u*.7,.58);});
 label(cleft,'Membrana do terminal',[-1.2,1.18,.9]);label(cleft,'Acetilcolina',[1.6,.52,.6]);label(cleft,'Receptor nicotínico',[.42,-.45,.7]);label(cleft,'Pregas do sarcolema',[-1.3,-1.05,1]);label(cleft,'Acetilcolinesterase',[1.55,.31,-.25]);
 const triad=group();
 const tCurve=tube(triad,[[-3,.65,0],[-1.7,.52,.01],[0,.51,-.02],[1.6,.53,.01],[3,.72,0]],.23,M.t,.25);
 tube(triad,[[-1.6,.57,0],[-1.6,1.7,-.05],[-1.65,2,-.35]],.23,M.t,.22);
 for(const s of [-1,1]){
  const cisterna=tube(triad,[[-2.7,.35,s*.75],[-1.3,.38,s*.71],[.15,.36,s*.76],[1.5,.39,s*.73],[2.7,.36,s*.79]],.36,M.reticulum,.32);
  const cp=cisterna.mesh.geometry.attributes.position;
  for(let k=0;k<cp.count;k++){const x=cp.getX(k),ripple=1+.08*Math.sin(x*4.3)+.025*Math.cos(x*9);cp.setY(k,.36+(cp.getY(k)-.36)*.74*ripple);cp.setZ(k,s*.75+(cp.getZ(k)-s*.75)*1.18*ripple);}cisterna.mesh.geometry.computeVertexNormals();
  ell(triad,[-2.7,.35,s*.75],[.3,.26,.4],M.reticulum,true);ell(triad,[2.7,.36,s*.79],[.27,.24,.37],M.reticulum,true);
  for(let i=0;i<11;i++){const x=-2.5+i*.49;tube(triad,[[x,.29,s*.92],[x+.11,-.26,s*1.2],[x-.04,-.75,s*.75]],.05,M.reticulum,.035,18);}
  for(let i=0;i<6;i++){const x=-2.15+i*.84;tube(triad,[[x,.5,s*.2],[x,.46,s*.35],[x,.43,s*.47]],.063,M.ryr,.077,14);ell(triad,[x,.43,s*.47],[.15,.15,.12],M.ryr,true);}
 }
 for(const z of [-.6,.6]){const m=new THREE.Mesh(new THREE.CylinderGeometry(.33,.33,5.9,36),M.muscle);m.rotation.z=Math.PI/2;m.position.set(0,-1.08,z);triad.add(m);}
 dots(triad,'ca',48,u=>V(-2.4+4.8*(u*9.3%1),.15-u*1.17,Math.sin(u*21)*.62));
 const tPulse=ell(triad,[-3,.65,0],[.26,.26,.26],M.pulse);triad.userData.pulses.push({m:tPulse,curve:tCurve.curve});
 label(triad,'Túbulo T',[-1.65,1.6,.1]);label(triad,'Cisterna terminal',[1.4,.72,.85]);label(triad,'DHPR → RyR1',[-.8,.52,.4]);label(triad,'Ca²⁺ liberado',[1.4,-.29,.4]);label(triad,'Miofibrilas',[.6,-1.32,.8]);
 const sarcomere=group();let approved=null,loading=null;
 async function prepararSarcomero(canvasFactory){
  if(approved)return approved;if(loading)return loading;
  loading=import('../musculo-sarcomero/modelos.js?v=musculo-anatomico-20261003').then(({criar:original})=>{
   const all=original(canvasFactory);approved={model:all.modelos[4],aplicar:all.aplicarComprimento};sarcomere.add(approved.model);
   // Geometrias descartadas pertencem aos quatro modelos não utilizados. Materiais
   // e texturas compartilhados permanecem vivos para o sarcômero aprovado.
   const used=new Set();approved.model.traverse(o=>{if(o.geometry)used.add(o.geometry);});
   for(const m of all.modelos.slice(0,4))m.traverse(o=>{if(o.geometry&&!used.has(o.geometry))o.geometry.dispose();});
   label(sarcomere,'Disco Z',[-1.2,.45,0]);label(sarcomere,'Actina',[-.57,.17,.32]);label(sarcomere,'Miosina',[.35,-.27,.22]);label(sarcomere,'Troponina',[.58,.28,.2]);
   return approved;
  }).catch(e=>{loading=null;throw e;});return loading;
 }
 const modelos=[encounter,terminal,cleft,triad,sarcomere];
 function atualizar(indice,a,t,sim){
  const g=modelos[indice];
  for(const {m,type,index,n,path}of g.userData.particles){const u=(index/n+t*.008)%1;
   const level=type==='ach'?a.ach:type==='preca'?a.preca:type==='na'?a.ach*sim.p.receptores:a.ca;
   m.visible=level>.045&&index/n<Math.min(1,level);if(m.visible)m.position.copy(path(u));
  }
  for(const {m,curve}of g.userData.pulses){let age=Infinity;for(const s of (indice===0?sim.estimulos:sim.disparos))if(t>=s&&t-s<age)age=t-s;m.visible=age<5;if(m.visible)m.position.copy(curve.getPoint(Math.min(1,age/5)));}
  const totalReceptors=g.userData.receptors.filter(r=>r.type==='ach').length;let receptorIndex=0;
  for(const {protein,type}of g.userData.receptors){
   // Densidade visual simbólica; o cálculo usa a fração contínua do controle.
   protein.visible=type!=='ach'||(++receptorIndex-.5)/totalReceptors<=sim.p.receptores;
   protein.scale.x=1+(type==='ach'?a.ach*sim.p.receptores:type==='ca'?a.preca:a.vm>-65?1:0)*.12;protein.scale.z=protein.scale.x;
  }
  if(indice===4&&approved)approved.aplicar(approved.model,2.4-.22*a.ativacao);
 }
 return {modelos,prepararSarcomero,atualizar};
}
