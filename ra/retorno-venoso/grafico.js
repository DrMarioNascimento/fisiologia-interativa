import {CM,CORPO,PIH,projetarPostura,mmHgParaCmH2O} from './fisica.js';
// Projeta a malha aprovada de perfil: +Z é anterior, sem modificar o corpo 3D.
export function criarGraficoPostura(geo){
 geo.computeBoundingBox();const bb=geo.boundingBox,cz=(bb.min.z+bb.max.z)/2,cy=(bb.min.y+bb.max.y)/2;
 const scale=640/(bb.max.y-bb.min.y),bitmap=document.createElement('canvas');
 bitmap.width=Math.ceil((bb.max.z-bb.min.z)*scale)+40;bitmap.height=680;
 const c=bitmap.getContext('2d'),P=geo.attributes.position,I=geo.index;c.fillStyle='#425f73';
 for(let i=0;i<(I?.count??P.count);i+=3){c.beginPath();for(let j=0;j<3;j++){const k=I?I.getX(i+j):i+j,x=bitmap.width/2+(P.getZ(k)-cz)*scale,y=340-(P.getY(k)-cy)*scale;j?c.lineTo(x,y):c.moveTo(x,y)}c.closePath();c.fill()}
 return function desenhar(canvas,grau,p,tornozelo,corDaPressao){
  const W=Math.max(220,Math.round(canvas.clientWidth)),narrow=W<460,H=narrow?500:430,dpr=Math.min(devicePixelRatio||1,2);
  canvas.width=Math.round(W*dpr);canvas.height=Math.round(H*dpr);canvas.style.height=H+'px';
  const ctx=canvas.getContext('2d');ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,W,H);
  const a=(90-grau)*Math.PI/180,bw=bitmap.width/scale,bh=bitmap.height/scale;
  const extentX=Math.abs(Math.cos(a))*bw+Math.abs(Math.sin(a))*bh,extentY=Math.abs(Math.sin(a))*bw+Math.abs(Math.cos(a))*bh;
  const S=Math.min((W-48)/extentX,176/extentY),ox=W/2,oy=132;
  ctx.save();ctx.translate(ox,oy);ctx.rotate(-a);ctx.drawImage(bitmap,-bw*S/2,-bh*S/2,bw*S,bh*S);ctx.restore();
  ctx.font='12px Inter, sans-serif';ctx.fillStyle='#b6cad9';ctx.textAlign='center';
  ctx.fillText((grau<20?'Decúbito':grau>70?'Ortostatismo':'Inclinado')+' · '+grau.toFixed(0)+'°',W/2,22);
  const rows=[{nome:'Jugular',h:CORPO.jugular,v:p.jugular,colabada:p.jugularColabada},{nome:'Coração (ref.)',h:CORPO.coracao,v:p.coracao},{nome:'Coxa',h:CORPO.coxa,v:p.coxa},{nome:'Tornozelo',h:CORPO.tornozelo,v:tornozelo}];
  rows.forEach((r,i)=>{
   const q=projetarPostura(-cz,r.h*CM-cy,grau),x=ox+q.x*S,y=oy-q.y*S,color=corDaPressao(Math.max(0,r.v)).getStyle();
   ctx.beginPath();ctx.arc(x,y,8,0,Math.PI*2);ctx.fillStyle=color;ctx.fill();ctx.strokeStyle='#cce3f6';ctx.lineWidth=1;ctx.stroke();
   ctx.font='bold 10px Inter, sans-serif';ctx.fillStyle='#fff';ctx.textAlign='center';ctx.fillText(String(i+1),x,y+3.5);
   const lineY=249+i*(narrow?54:38);ctx.textAlign='left';ctx.font='12px Inter, sans-serif';ctx.fillStyle='#dce9f3';ctx.fillText((i+1)+'. '+r.nome,16,lineY);
   const value=r.colabada?'Colabada':r.v.toFixed(1).replace('.',',')+' mmHg · '+mmHgParaCmH2O(r.v).toFixed(1).replace('.',',')+' cmH₂O';
   ctx.font='12px Inter, sans-serif';ctx.textAlign=narrow?'left':'right';ctx.fillText(value,narrow?16:W-16,lineY+(narrow?18:0));
   const barY=lineY+(narrow?25:9),barW=W-32;ctx.fillStyle='#203645';ctx.fillRect(16,barY,barW,7);ctx.fillStyle=color;ctx.fillRect(16,barY,Math.max(0,Math.min(100,r.v))/100*barW,7);
  });
  const pih=projetarPostura(-cz,PIH*CM-cy,grau);ctx.beginPath();ctx.arc(ox+pih.x*S,oy-pih.y*S,3,0,Math.PI*2);ctx.fillStyle='#8cdcca';ctx.fill();
  ctx.textAlign='left';ctx.font='11px Inter, sans-serif';ctx.fillStyle='#aec6d5';ctx.fillText('Barras: pressão venosa (0–100 mmHg)',16,H-34);
  ctx.fillStyle='#8cdcca';ctx.fillText('Ponto verde: referência no diafragma',16,H-16);
 };
}
