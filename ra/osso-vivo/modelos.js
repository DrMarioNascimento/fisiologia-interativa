import * as THREE from 'three';
import {estado,fluxoCanalicular,suave,CORES} from './fisica.js?v=osso-20261004';
const V=(x,y,z)=>new THREE.Vector3(x,y,z);
export const NIVEIS=[
 {nome:'O osso',titulo:'Um órgão vivo, por dentro',texto:'O fêmur reúne cortical resistente, trabéculas, medula e superfícies articulares. A janela expõe o interior; não é uma fratura. A carga se distribui pela arquitetura, e a adaptação depende da atividade de suas células.'},
 {nome:'As trabéculas',titulo:'Uma rede que distribui carga',texto:'Lâminas e hastes ósseas formam uma rede contínua. Os espaços abrigam medula e vasos. A comparação muda a espessura ilustrativa da rede ao longo do ciclo; não prevê densidade óssea nem risco de fratura.'},
 {nome:'O osteócito',titulo:'A célula percebe a carga',texto:'O osteócito ocupa uma lacuna e estende processos pelos canalículos. O fluido se move no espaço ao redor desses processos. Essa rede participa da mecanotransdução: transforma estímulos mecânicos em sinais que regulam outras células.'},
 {nome:'O osteoclasto',titulo:'Retirar para renovar',texto:'O osteoclasto multinucleado adere à superfície por uma zona de selamento. Na borda pregueada, prótons favorecem a dissolução mineral e enzimas degradam matriz orgânica. A escavação produz uma lacuna de reabsorção.'},
 {nome:'O osteoblasto',titulo:'Construir e depois mineralizar',texto:'Osteoblastos depositam osteoide, matriz orgânica rica em colágeno. A mineralização vem depois da deposição. Parte dessas células pode ficar incorporada como osteócitos; outras tornam-se células de revestimento ou desaparecem.'}
];
export function criar(textura){
 const tex=textura('osso'),stria=textura('lamela');
 const mat=(cor,opts={})=>new THREE.MeshPhysicalMaterial({color:cor,roughness:.64,metalness:0,bumpMap:tex,bumpScale:.03,clearcoat:.12,clearcoatRoughness:.8,...opts});
 const M={osso:mat('#ddc9a3',{map:tex}),corte:mat('#ad8968',{map:stria}),medula:mat('#9b4c59',{roughness:.8}),cartilagem:mat('#b6c8bc'),vaso:mat('#985561'),cell:mat(CORES.osteocito,{transparent:true,opacity:.86,depthWrite:false}),canal:mat('#c9b698',{transparent:true,opacity:.25,depthWrite:false}),process:mat('#5caa9f'),nucleo:mat('#5c506e'),clasto:mat('#bf746f',{transparent:true,opacity:.80,depthWrite:false}),blasto:mat('#85bca0',{transparent:true,opacity:.82,depthWrite:false}),osteoide:mat('#ba9274'),mineral:mat('#dfd4b5'),fluido:mat('#83cde5',{emissive:'#5eb8d3',emissiveIntensity:.28}),proton:mat('#f5bc93',{emissive:'#ef9976',emissiveIntensity:.22})};
 const sphere=new THREE.SphereGeometry(1,28,20),small=new THREE.SphereGeometry(1,10,8);
 const organic=(geo,amp=.055)=>{const a=geo.attributes.position;for(let i=0;i<a.count;i++){const x=a.getX(i),y=a.getY(i),z=a.getZ(i),q=1+amp*Math.sin(x*4.2+y*3.5)*Math.cos(z*4.8-x);a.setXYZ(i,x*q,y*q,z*q);}geo.computeVertexNormals();return geo;};
 function ell(g,pos,size,m,rough=true){const o=new THREE.Mesh(rough?organic(sphere.clone()):sphere,m);o.position.set(...pos);o.scale.set(...size);g.add(o);return o;}
 function tube(g,points,r,m,end=r,n=24){const curve=new THREE.CatmullRomCurve3(points.map(p=>V(...p))),geo=new THREE.TubeGeometry(curve,n,1,10,false),a=geo.attributes.position;
  for(let i=0;i<=n;i++){const u=i/n,p=curve.getPointAt(u),radius=(r+(end-r)*u)*(1+.09*Math.sin(u*17));for(let j=0;j<=10;j++){const k=i*11+j;a.setXYZ(k,p.x+(a.getX(k)-p.x)*radius,p.y+(a.getY(k)-p.y)*radius,p.z+(a.getZ(k)-p.z)*radius);}}geo.computeVertexNormals();const mesh=new THREE.Mesh(geo,m);g.add(mesh);return {mesh,curve};}
 const group=()=>{const g=new THREE.Group();g.userData={labels:[],trabeculae:[],particles:[],surfaces:[],cells:[],collagen:[],crystals:[]};return g;};
 const label=(g,text,p)=>g.userData.labels.push({text,pos:V(...p)});
 function particle(g,curve,index,material,r=.032){const m=new THREE.Mesh(small,material);m.scale.setScalar(r);g.add(m);g.userData.particles.push({m,curve,index});return m;}
 function trabecular(g,extent=[2.4,2.3,1.35],count=4){
  const nodes=[];for(let y=0;y<count;y++)for(let x=0;x<count;x++)for(let z=0;z<3;z++){const k=nodes.length,p=V((x/(count-1)-.5)*extent[0]+.31*Math.sin(k*5.4),(y/(count-1)-.5)*extent[1]+.29*Math.cos(k*3.1),(z/2-.5)*extent[2]+.24*Math.sin(k*1.9));p.multiplyScalar(.82+.18*Math.cos(k*1.618));nodes.push(p);}
  for(let i=0;i<nodes.length;i++)for(let j=i+1;j<nodes.length;j++){
   const a=nodes[i],b=nodes[j],d=a.distanceTo(b);if(d>.98||d<.30)continue;
   const mid=a.clone().lerp(b,.5).add(V(.09*Math.sin(i+j),.07*Math.cos(i*3+j),.10*Math.sin(i-j)));
   const geo=tube(g,[a.toArray(),mid.toArray(),b.toArray()],.070+.025*(.5+.5*Math.sin(i*2+j)),M.osso,.065,16);
   const base=geo.mesh.geometry.attributes.position.array.slice(),centers=[];for(let k=0;k<geo.mesh.geometry.attributes.position.count;k++)centers.push(geo.curve.getPointAt(Math.floor(k/11)/16));
   g.userData.trabeculae.push({mesh:geo.mesh,base,centers});
  }
  for(const p of nodes)ell(g,p.toArray(),[.09,.075,.087],M.osso);
  // Corrugated plates between struts, with an irregular outline rather than cubes.
  for(let k=0;k<Math.min(5,Math.floor((nodes.length-4)/7));k++){const a=nodes[k*7],b=nodes[k*7+3],c=nodes[k*7+4];const geom=new THREE.BufferGeometry(),p=[];
   for(let i=0;i<=12;i++){const u=i/12,edge=a.clone().lerp(b,u),tip=c.clone().lerp(edge,u*.35);p.push(edge.x,edge.y,edge.z,tip.x,tip.y,tip.z+.04*Math.sin(u*7));}
   const ix=[];for(let i=0;i<12;i++){const n=i*2;ix.push(n,n+1,n+2,n+1,n+3,n+2);}geom.setAttribute('position',new THREE.Float32BufferAttribute(p,3));geom.setIndex(ix);geom.computeVertexNormals();const material=M.osso.clone();material.side=THREE.DoubleSide;g.add(new THREE.Mesh(geom,material));}
 }
 const bone=group();
 // Curved shaft with an anterior teaching window, inner cortex and real cut edges.
 function shaft(radiusScale,material,inner=false){const p=[],uv=[],idx=[],ny=100,na=64;const radius=u=>.38+.16*Math.pow(Math.abs(2*u-1),4)+.36*Math.exp(-(((u-.025)/.085)**2))+.12*Math.exp(-(((u-.96)/.12)**2));
  for(let i=0;i<=ny;i++){const u=i/ny,y=-3+5.5*u,r=radius(u)*radiusScale;for(let j=0;j<=na;j++){const a=j/na*Math.PI*2,x=.075*Math.sin(u*Math.PI)+r*Math.sin(a),z=.10*Math.sin(u*Math.PI)+r*.83*Math.cos(a);p.push(x,y,z);uv.push(j/na,u);}}
  const window=(i,j)=>{const y=-3+5.5*(i+.5)/ny,a=(j+.5)/na*Math.PI*2;return y>-1.75&&y<1.25&&(a<.72||a>Math.PI*2-.72);};
  for(let i=0;i<ny;i++)for(let j=0;j<na;j++){if(window(i,j))continue;const n=i*(na+1)+j;idx.push(n,n+1,n+na+1,n+1,n+na+2,n+na+1);}
  const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(p,3));geo.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));geo.setIndex(idx);geo.computeVertexNormals();const m=new THREE.Mesh(geo,material);bone.add(m);
  if(!inner)for(const sign of [-1,1]){const points=[];for(let y=-1.75;y<=1.26;y+=.06){const u=(y+3)/5.5,r=radius(u);points.push([.075*Math.sin(u*Math.PI)+sign*r*Math.sin(.72),y,.10*Math.sin(u*Math.PI)+r*.83*Math.cos(.72)]);}tube(bone,points,.035,M.corte,.035,45);}
 }
 const cortical=M.osso.clone();cortical.side=THREE.DoubleSide;shaft(1,cortical);const inner=M.corte.clone();inner.side=THREE.DoubleSide;shaft(.74,inner,true);
 ell(bone,[.02,-.25,-.04],[.28,2.42,.24],M.medula);
 tube(bone,[[.2,-2,.2],[.2,-.8,.16],[.19,.7,.12],[.25,1.8,.03]],.034,M.vaso,.024,40);
 const neck=tube(bone,[[.04,2.04,.02],[-.35,2.50,.03],[-.79,2.87,.04]],.37,M.osso,.38,36);ell(bone,[-1.08,3.05,.04],[.66,.65,.62],M.osso);
 const cap=new THREE.Mesh(new THREE.SphereGeometry(1,40,28,0,Math.PI*2,0,Math.PI*.58),M.cartilagem);cap.position.set(-1.08,3.05,.04);cap.scale.set(.673,.663,.633);cap.rotation.z=.6;bone.add(cap);
 ell(bone,[.44,2.23,-.04],[.46,.69,.40],M.osso);ell(bone,[-.32,1.76,-.20],[.21,.32,.21],M.osso);
 for(const x of [-.43,.43]){ell(bone,[x,-3.09,-.05],[.56,.62,.68],M.osso);ell(bone,[x,-3.32,.18],[.49,.36,.58],M.cartilagem);}
 const spongy=group();trabecular(spongy,[.65,.94,.50],3);spongy.position.set(.06,1.38,.01);spongy.scale.setScalar(.64);bone.add(spongy);
 label(bone,'Cabeça e cartilagem',[-1.28,3.45,.42]);label(bone,'Cortical',[.42,.85,.34]);label(bone,'Janela · medula',[.12,-.75,.31]);label(bone,'Côndilos',[.68,-3.35,.37]);
 const trab=group();trabecular(trab);
 tube(trab,[[-1.5,-1.2,-.28],[-.7,-.55,-.55],[.06,.4,-.38],[1.36,1.32,-.53]],.047,M.vaso,.04,40);
 for(let k=0;k<18;k++){const a=k*2.4;ell(trab,[Math.sin(a)*1.03,Math.cos(a*1.2)*.83,Math.sin(a*1.7)*.44],[.12,.10,.13],M.medula);}
 label(trab,'Trabéculas · lâminas',[.3,.83,.47]);label(trab,'Medula nos espaços',[-.83,-.72,.47]);label(trab,'Vaso medular',[1.04,.92,-.40]);
 const cyte=group();
 const matrix=ell(cyte,[0,0,-.80],[2.7,1.74,.65],M.osso);matrix.material=matrix.material.clone();matrix.material.transparent=true;matrix.material.opacity=.30;matrix.material.depthWrite=false;
 const centers=[V(0,0,.05),V(-1.87,.73,-.23),V(1.92,-.63,-.20)];
 centers.forEach((p,k)=>{
  ell(cyte,p.toArray(),k?[.31,.20,.16]:[.55,.32,.25],M.canal);
  ell(cyte,p.toArray(),k?[.22,.13,.12]:[.39,.21,.19],M.cell);
  ell(cyte,[p.x-.05,p.y,p.z+.07],k?[.1,.07,.08]:[.19,.12,.10],M.nucleo);
  for(let i=0;i<(k?9:20);i++){const a=i*2.39996,dist=k?.65:1.22+.55*(.5+.5*Math.sin(i*3)),dest=p.clone().add(V(Math.cos(a)*dist,Math.sin(a)*dist*.68,.30*Math.sin(i*1.8))),mid=p.clone().lerp(dest,.5).add(V(.09*Math.sin(i),.07*Math.cos(i),.06));
   const origin=p.clone().add(V(Math.cos(a)*.25,Math.sin(a)*.14,0));const path=[origin.toArray(),mid.toArray(),dest.toArray()];tube(cyte,path,.062,M.canal,.050,22);tube(cyte,path,.017,M.process,.008,22);
   particle(cyte,new THREE.CatmullRomCurve3(path.map(q=>V(...q))),i+k*20,M.fluido,.012);
  }
 });
 for(const p of centers.slice(1)){const path=[centers[0].toArray(),V(p.x*.5,p.y*.5+.13,.08).toArray(),p.toArray()];tube(cyte,path,.04,M.canal,.04,24);tube(cyte,path,.018,M.process,.018,24);}
 label(cyte,'Osteócito',[.25,.15,.26]);label(cyte,'Lacuna',[-.42,.20,.26]);label(cyte,'Processo no canalículo',[1.15,.54,.10]);label(cyte,'Fluido pericelular',[-1.07,-.63,.13]);label(cyte,'Rede de comunicação',[1.84,-.55,.09]);
 // These are cut pieces of living matrix, not presentation tables or supports.
 function piece(g){const nu=96,nv=32,p=[],uv=[],ix=[];
  for(let i=0;i<=nu;i++)for(let j=0;j<=nv;j++){const x=(i/nu-.5)*5.7,z=(j/nv-.5)*3.0*Math.sqrt(Math.max(.12,1-(x/3.1)**2));p.push(x,0,z);uv.push(i/nu,j/nv);}
  for(let i=0;i<nu;i++)for(let j=0;j<nv;j++){const n=i*(nv+1)+j;ix.push(n,n+1,n+nv+1,n+1,n+nv+2,n+nv+1);}const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(p,3));geo.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));geo.setIndex(ix);const m=new THREE.Mesh(geo,M.osso);g.add(m);g.userData.surfaces.push({mesh:m,base:p.slice()});
  // Open walls and bottom follow the real teaching cut, leaving the pit hollow.
  const perimeter=[];for(let i=0;i<=nu;i++)perimeter.push(i*(nv+1));for(let j=1;j<=nv;j++)perimeter.push(nu*(nv+1)+j);for(let i=nu-1;i>=0;i--)perimeter.push(i*(nv+1)+nv);for(let j=nv-1;j>=0;j--)perimeter.push(j);const wp=[],wi=[];
  perimeter.forEach(k=>wp.push(p[k*3],0,p[k*3+2],p[k*3],-.90,p[k*3+2]));for(let i=0;i<perimeter.length-1;i++){const n=i*2;wi.push(n,n+1,n+2,n+1,n+3,n+2);}const walls=new THREE.BufferGeometry();walls.setAttribute('position',new THREE.Float32BufferAttribute(wp,3));walls.setIndex(wi);const cut=M.corte.clone();cut.side=THREE.DoubleSide;const w=new THREE.Mesh(walls,cut);g.add(w);g.userData.surfaces.push({mesh:w,base:wp.slice(),wall:true});
  const bottom=new THREE.Mesh(new THREE.CircleGeometry(1,64),M.corte);bottom.rotation.x=Math.PI/2;bottom.scale.set(2.85,1.23,1);bottom.position.y=-.9;g.add(bottom);
 }
 const clast=group();piece(clast);const giant=new THREE.Group();clast.add(giant);clast.userData.cells.push({g:giant,type:'clast'});
 ell(giant,[-.72,.59,0],[1.12,.59,.81],M.clasto);
 for(let i=0;i<5;i++){const a=i*2.4;ell(giant,[-.72+.65*Math.cos(a),.54+.12*Math.sin(a*1.7),.43*Math.sin(a)],[.19,.15,.17],M.nucleo);}
 const seal=[];for(let i=0;i<=60;i++){const a=i*Math.PI*2/60;seal.push([-.72+.96*Math.cos(a),.10,.67*Math.sin(a)]);}const sealMesh=tube(giant,seal,.037,M.clasto,.037,60).mesh;clast.userData.seal={mesh:sealMesh,base:sealMesh.geometry.attributes.position.array.slice()};
 for(let i=0;i<34;i++){const a=i*2.4,r=.58*Math.sqrt((i+.5)/34),x=-.72+r*Math.cos(a),z=r*Math.sin(a);tube(giant,[[x,.20,z],[x+.02,.11,z+.025],[x-.02,.03,z+.035]],.032,M.clasto,.020,8);particle(clast,new THREE.CatmullRomCurve3([V(x,.08,z),V(x+.05,-.22,z+.03),V(x-.04,-.38,z)]),i,M.proton,.028);}
 label(clast,'Osteoclasto multinucleado',[-.65,1.12,.28]);label(clast,'Zona de selamento',[.22,.12,.70]);label(clast,'Borda pregueada',[-.62,.10,.64]);label(clast,'Lacuna de reabsorção',[-1.42,-.20,.77]);label(clast,'Matriz mineralizada',[1.60,.08,.93]);
 const blast=group();piece(blast);
 for(let i=0;i<12;i++){const x=-1.68+(i%6)*.59,z=-.33+Math.floor(i/6)*.65,g=new THREE.Group();blast.add(g);blast.userData.cells.push({g,type:'blast',x,z});ell(g,[0,.27,0],[.27,.29,.23],M.blasto);ell(g,[.015,.33,.10],[.105,.10,.09],M.nucleo);
  for(let k=0;k<4;k++)tube(g,[[-.17,.17+k*.034,-.10],[0,.18+k*.034,-.14],[.16,.19+k*.034,-.09]],.010,M.process,.008,10);
 }
 for(let k=0;k<23;k++){const x=-1.88+k*.17,pts=[];for(let j=0;j<=18;j++){const z=-.76+j*1.52/18;pts.push([x+.025*Math.sin(j*.6+k),-.12,z]);}const o=tube(blast,pts,.018,M.osteoide,.018,18);blast.userData.collagen.push({mesh:o.mesh,x});}
 for(let i=0;i<110;i++){const x=-1.82+(i%22)*.17,z=-.65+Math.floor(i/22)*.31,m=new THREE.Mesh(small,M.mineral);m.scale.set(.027,.018,.036);m.position.set(x,-.10,z);blast.add(m);blast.userData.crystals.push({m,index:i,x,z});}
 label(blast,'Osteoblastos',[-.88,.67,.41]);label(blast,'Osteoide · colágeno',[.10,-.02,.84]);label(blast,'Mineralização posterior',[1.31,-.10,.69]);label(blast,'Osso preexistente',[2.07,-.35,.71]);
 const modelos=[bone,trab,cyte,clast,blast];
 function atualizar(nivel,t,cenario){const a=estado(t,cenario),g=modelos[nivel];
  if(nivel===1)for(const b of g.userData.trabeculae){const array=b.mesh.geometry.attributes.position,thickness=Math.sqrt(a.mineral);for(let i=0;i<array.count;i++){const p=b.centers[i];array.setXYZ(i,p.x+(b.base[i*3]-p.x)*thickness,p.y+(b.base[i*3+1]-p.y)*thickness,p.z+(b.base[i*3+2]-p.z)*thickness);}array.needsUpdate=true;}
  if(nivel===2)for(const {m,curve,index}of g.userData.particles){const u=fluxoCanalicular(t,index,a.carga),p=curve.getPointAt(u);m.position.copy(p).add(V(.002*Math.sin(t*77+index),.002*Math.cos(t*61+index),.031));m.material.opacity=.8;m.visible=a.carga>.05;}
  const height=(x,z)=>.11*Math.cos(x*.8)-.08*z*z-3.0*(a.retirada-a.depositada)*Math.exp(-((x+.72)**2/1.20+z*z/.65));
  if(nivel>=3){for(const {mesh,base,wall}of g.userData.surfaces){const p=mesh.geometry.attributes.position;for(let i=0;i<p.count;i++)p.setY(i,wall&&i%2?-.90:height(base[i*3],base[i*3+2]));p.needsUpdate=true;mesh.geometry.computeVertexNormals();}
   for(const cell of g.userData.cells){if(cell.type==='clast'){cell.g.position.y=height(-.72,0);cell.g.scale.y=.95+.05*Math.sin(t*60)*a.osteoclasto;}else cell.g.position.set(cell.x,height(cell.x,cell.z),cell.z);}
   for(const {m,curve,index}of g.userData.particles){const u=((t*24+index*.381966)%1+1)%1;m.position.copy(curve.getPointAt(u));m.position.y+=height(-.72,0);m.scale.setScalar(.028*Math.sin(Math.PI*u));m.visible=a.osteoclasto>.01;}
   if(g.userData.seal){const {mesh,base}=g.userData.seal,p=mesh.geometry.attributes.position;for(let i=0;i<p.count;i++){const x=base[i*3],z=base[i*3+2];p.setY(i,base[i*3+1]+height(x,z)-height(-.72,0));}p.needsUpdate=true;mesh.geometry.computeVertexNormals();}
   for(const {mesh,x}of g.userData.collagen){mesh.position.y=height(x,0)+.13;mesh.visible=a.depositada>.001;mesh.scale.y=.7+.3*suave(a.depositada/.18);}
   for(const {m,index,x,z}of g.userData.crystals){m.position.y=height(x,z)+.025;m.visible=(index+.5)/g.userData.crystals.length<a.mineralizada/.22;}
   if(nivel===3){g.userData.labels[0].pos.y=1.12+height(-.72,0);g.userData.labels[3].pos.y=height(-1.42,.77);}
  }return a;
 }
 atualizar(3,0,'habitual');atualizar(4,0,'habitual');
 return {modelos,atualizar};
}
