// Referências didáticas: alturas anatômicas a partir do solo, em centímetros.
export const CM=.02;
export const CORPO={altura:170*CM,solo:0,tornozelo:12,joelho:48,coxa:75,quadril:92,diafragma:118,coracao:128,ombro:142,jugular:150,olhos:160};
export const PIH=CORPO.diafragma;
export const PA_POR_MMHG=133.322387415,PA_POR_CMH2O=98.0665;
export const MMHG_POR_CM=1060*9.80665*.01/PA_POR_MMHG;
export const mmHgParaCmH2O=p=>p*PA_POR_MMHG/PA_POR_CMH2O;
export const pressaoVenosa=(altura,grau,{base=10}={})=>base+(PIH-altura)*MMHG_POR_CM*Math.sin(grau*Math.PI/180);
const clamp=(x,a,b)=>Math.min(b,Math.max(a,x));
// O efeito distal da bomba se reduz suavemente entre joelho e coxa.
// É uma aproximação regional; não representa ejeção ou débito cardíaco.
export function efeitoDistal(altura){const t=clamp((altura-CORPO.joelho)/(CORPO.coxa-CORPO.joelho),0,1);return 1-t*t*(3-2*t)}
export function pressaoLocal(altura,grau,atividade=0,{base=10}={}){
 const repouso=pressaoVenosa(altura,grau,{base});
 return repouso-(repouso-Math.min(repouso,25))*clamp(atividade,0,1)*efeitoDistal(altura);
}
export function aberturaValvula(fase,ativo){
 if(!ativo)return 1; // Fluxo basal anterógrado: válvulas em posição neutra.
 const t=((fase%1)+1)%1,aperto=t<.5?Math.sin(t*2*Math.PI)**2:0;
 return clamp((aperto-.04)/.22,0,1);
}
export const pulsoCardiaco=t=>Math.max(0,Math.sin(t*2*Math.PI*1.1))**6; // 66 bpm de referência.
// Coordenadas da postura: 0° = deitado (cabeça à esquerda), 90° = em pé.
export function projetarPostura(x,y,grau){const a=(90-grau)*Math.PI/180,c=Math.cos(a),s=Math.sin(a);return {x:x*c-y*s,y:x*s+y*c}}
