import {estado,limitar,suave} from './fisica.js?v=osso-anatomia-20261004';

// Coordenadas visuais ampliadas; não são deformações medidas nem volumes clínicos.
export function quadro(t,cenario,separacao=0,cargaVisivel=true){
 const a=estado(t,cenario),pulso=.5+.5*Math.sin(a.u*20*Math.PI);
 const intensidade=a.carga/1.55;
 return {...a,separacao:limitar(separacao),forca:cargaVisivel?intensidade*(.35+.65*pulso):0,
  deformacao:cargaVisivel?.025*intensidade*pulso:0,
  transporteReabsorcao:a.u>=.08&&a.u<.30?a.osteoclasto:0,
  transporteFormacao:a.u>=.40&&a.u<.85?a.osteoblasto:0};
}
export function superficie(x,z,a){
 const relevo=.025*Math.sin(x*5.3+z*3)*Math.cos(z*7.1-x*2)+.013*Math.sin(x*17-z*13);
 const escavacao=Math.exp(-((x+.7)**2/1.05+z*z/.48));
 return relevo-3.7*(a.retirada-a.depositada)*escavacao;
}
// As rotas fecham com fade, sem saltos visíveis na origem e no destino.
export function percurso(t,index,atividade,velocidade=16){
 const u=((limitar(t)*velocidade+index*.61803398875)%1+1)%1;
 return {u,escala:suave(u/.09)*(1-suave((u-.88)/.12))*limitar(atividade)};
}
export function maturacaoLocal(t,indice){
 const deposito=.40+.40*limitar(indice);
 return {colageno:suave((limitar(t)-deposito)/.045),mineral:suave((limitar(t)-deposito-.035)/.12)};
}
