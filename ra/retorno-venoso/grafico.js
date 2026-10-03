import {CM,CORPO,PIH,projetarPostura,mmHgParaCmH2O} from './fisica.js';
// A silhueta do gráfico é projetada da própria malha aprovada, sem alterar o 3D.
export function criarGraficoPostura(geo){
 geo.computeBoundingBox();const bb=geo.boundingBox,cx=(bb.min.x+bb.max.x)/2,cy=(bb.min.y+bb.max.y)/2;
 const bitmap=document.createElement('canvas');bitmap.width=260;bitmap.height=680;
 const c=bitmap.getContext('2d'),scale=640/(bb.max.y-bb.min.y),P=geo.attributes.position,I=geo.index;
 c.fillStyle='#425f73';
 for(let i=0;i<(I?.count??P.count);i+=3){c.beginPath();for(let j=0;j<3;j++){const k=I?I.getX(i+j):i+j,x=130+(P.getX(k)-cx)*scale,y=340-(P.getY(k)-cy)*scale;j?c.lineTo(x,y):c.moveTo(x,y)}c.closePath();c.fill()}
 return function desenhar(canvas,grau,p,tornozelo,corDaPressao){
  const ctx=canvas.getContext('2d'),W=canvas.width,H=canvas.height;ctx.clearRect(0,0,W,H);
  const a=(90-grau)*Math.PI/180,bw=bitmap.width/scale,bh=bitmap.height/scale;
  const extentX=Math.abs(Math.cos(a))*bw+Math.abs(Math.sin(a))*bh,extentY=Math.abs(Math.sin(a))*bw+Math.abs(Math.cos(a))*bh;
  const S=Math.min((W-100)/extentX,202/extentY),ox=W/2,oy=139;
  ctx.save();ctx.translate(ox,oy);ctx.rotate(-a);ctx.drawImage(bitmap,-bw*S/2,-bh*S/2,bw*S,bh*S);ctx.restore();
  ctx.font='12px Inter, sans-serif';ctx.fillStyle='#b6cad9';ctx.textAlign='center';
  ctx.fillText((grau<20?'Decúbito':grau>70?'Ortostatismo':'Inclinado')+' · '+grau.toFixed(0)+'°',W/2,20);
  const rows=[{nome:'Jugular',h:CORPO.jugular,v:p.jugular,colabada:p.jugularColabada},{nome:'Coração (ref.)',h:CORPO.coracao,v:p.coracao},{nome:'Coxa',h:CORPO.coxa,v:p.coxa},{nome:'Tornozelo',h:CORPO.tornozelo,v:tornozelo}];
  rows.forEach((r,i)=>{
   const q=projetarPostura(0,r.h*CM-cy,grau),x=ox+q.x*S,y=oy-q.y*S,color=corDaPressao(Math.max(0,r.v)).getStyle();
   ctx.beginPath();ctx.arc(x,y,9,0,Math.PI*2);ctx.fillStyle=color;ctx.fill();ctx.strokeStyle='#cce3f6';ctx.lineWidth=1;ctx.stroke();
   ctx.font='bold 10px Inter, sans-serif';ctx.fillStyle='#fff';ctx.textAlign='center';ctx.fillText(String(i+1),x,y+3.5);
   const lineY=277+i*35;ctx.textAlign='left';ctx.font='12px Inter, sans-serif';ctx.fillStyle='#dce9f3';ctx.fillText((i+1)+'. '+r.nome,16,lineY);
   ctx.fillStyle='#203645';ctx.fillRect(118,lineY-11,W-338,12);
   ctx.fillStyle=color;ctx.fillRect(118,lineY-11,Math.max(0,Math.min(100,r.v))/100*(W-338),12);
   ctx.fillStyle='#dce9f3';ctx.fillText(r.colabada?'Colabada':r.v.toFixed(1).replace('.',',')+' mmHg',W-205,lineY);
   if(!r.colabada){ctx.font='10px Inter, sans-serif';ctx.fillStyle='#aec6d5';ctx.fillText(mmHgParaCmH2O(r.v).toFixed(1).replace('.',',')+' cmH₂O',W-108,lineY);}
  });
  const pih=projetarPostura(0,PIH*CM-cy,grau);ctx.beginPath();ctx.arc(ox+pih.x*S,oy-pih.y*S,3,0,Math.PI*2);ctx.fillStyle='#8cdcca';ctx.fill();
  ctx.textAlign='left';ctx.font='10px Inter, sans-serif';ctx.fillStyle='#aec6d5';ctx.fillText('Barras: pressão venosa · escala de 0 a 100 mmHg',16,H-27);
  ctx.fillStyle='#8cdcca';ctx.fillText('Ponto verde: diafragma · referência hidrostática',16,H-11);
 };
}
