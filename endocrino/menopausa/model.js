// Modelo educacional mecanístico reduzido. Parâmetros ilustrativos, não ajuste clínico.
import {cycleAt} from '../ciclo/model.js';
export const STAGES=[
 {id:'reprodutiva',name:'Fase reprodutiva',short:'Referência',reserve:1,floor:18,scale:1,fsh:1,lh:1,inhibin:1,periods:[28],ov:[true],months:null,description:'Ciclos ovulatórios ilustrativos. Estradiol folicular, pico de LH e progesterona lútea.'},
 {id:'peri-inicial',name:'Perimenopausa inicial',short:'Transição inicial',reserve:.4,floor:18,scale:1.15,fsh:2.1,lh:1.25,inhibin:.42,periods:[24,33,27,38,26],ov:[true,true,false,true,true],months:null,description:'Intervalos mais variáveis e menor inibina B. O estradiol pode permanecer preservado ou atingir picos altos.'},
 {id:'peri-tardia',name:'Perimenopausa tardia',short:'Transição tardia',reserve:.09,floor:12,scale:.85,fsh:4.6,lh:2.2,inhibin:.1,periods:[75,42,96,34,65],ov:[false,true,false,true,false],months:null,description:'Trajetória com intervalos longos, grandes oscilações e episódios anovulatórios. A variabilidade é parte da fisiologia.'},
 {id:'menopausa',name:'Menopausa — marco',short:'Confirmação retrospectiva',reserve:0,floor:18,scale:0,fsh:62,lh:30,inhibin:0,periods:[],ov:[],months:12,description:'Última menstruação reconhecida retrospectivamente após 12 meses sem menstruar, sem outra causa. O exemplo representa o estado ao completar esse intervalo.'},
 {id:'pos',name:'Pós-menopausa',short:'Após a última menstruação',reserve:0,floor:12,scale:0,fsh:72,lh:34,inhibin:0,periods:[],ov:[],months:60,description:'Baixa produção ovariana de estradiol, progesterona e inibina. FSH e LH permanecem elevados; há produção estrogênica periférica residual.'}
];
export const HORMONES={e2:{name:'Estradiol (E2)',unit:'pg/mL',min:0,max:400,step:1,color:'#f0a7aa'},p4:{name:'Progesterona (P4)',unit:'ng/mL',min:0,max:25,step:.1,color:'#bca8eb'},fsh:{name:'FSH',unit:'mUI/mL',min:0,max:150,step:1,color:'#ffb764'},lh:{name:'LH',unit:'mUI/mL',min:0,max:100,step:1,color:'#64d8d0'}};
const clamp=(x,a,b)=>Math.min(b,Math.max(a,x));
const gauss=(x,m,s)=>Math.exp(-((x-m)**2)/(2*s*s));
export function stageById(id){const s=STAGES.find(s=>s.id===id);if(!s)throw new RangeError('Etapa desconhecida');return s;}
export function referenceAt(stageId,t){
 const s=stageById(stageId);if(!Number.isFinite(t)||t<0)throw new RangeError('Tempo inválido');
 if(!s.periods.length)return {e2:s.floor,p4:.2,fsh:s.fsh,lh:s.lh,inhibin:1,cycle:null,cycleDay:null,period:null,ovDay:null,ovulatory:false,phase:'Sem ciclos ovarianos',reserve:s.reserve};
 const block=s.periods.reduce((a,b)=>a+b,0);let n=Math.floor(t/block)*s.periods.length,rem=t%block,i=0;
 while(rem>=s.periods[i]&&i<s.periods.length-1){rem-=s.periods[i];i++;n++;}
 const period=s.periods[i],ovDay=period-14,ovulatory=s.ov[i],base=cycleAt(rem,period),scale=s.scale*(1+.18*Math.sin(n*2.1));
 const e2=s.floor+Math.max(0,base.e2-18)*scale*(ovulatory?1:.6);
 const inhibin=2+s.inhibin*(38+45*gauss(rem,Math.max(5,ovDay-4),5));
 return {e2,p4:ovulatory?base.p4:.35,fsh:base.fsh*s.fsh,lh:base.lh*s.lh,inhibin,cycle:n,cycleDay:rem,period,ovDay,ovulatory,reserve:s.reserve,phase:rem<5?'Menstruação de referência':rem<ovDay-1?'Fase folicular de referência':rem<ovDay+1?'Janela ovulatória de referência':ovulatory?'Fase lútea de referência':'Intervalo anovulatório de referência'};
}
export function createState(stageId){const r=referenceAt(stageId,0);return {t:0,e2:r.e2,p4:r.p4,fsh:r.fsh,lh:r.lh,inhibin:r.inhibin,endo:2+8*r.e2/(r.e2+80),progSignal:r.p4,estrogenSignal:r.e2,highDays:0,ovulatedCycle:-1,ovulations:0};}
export function validateForcing(forcing){for(const [k,v]of Object.entries(forcing)){const d=HORMONES[k];if(!d||!Number.isFinite(v)||v<d.min||v>d.max)throw new RangeError('Intervenção hormonal inválida');}}
export function advance(state,stageId,days,forcing={}){
 if(!Number.isFinite(days)||days<0||days>365)throw new RangeError('Intervalo inválido');validateForcing(forcing);stageById(stageId);const q={...state};let remaining=days;
 for(const [k,v]of Object.entries(forcing))q[k]=v;
 while(remaining>1e-9){const dt=Math.min(.05,remaining),r=referenceAt(stageId,q.t),cycle=r.cycle;
  q.highDays=q.e2>=180&&q.p4<1.5?q.highDays+dt:0;
  const inWindow=r.ovulatory&&r.cycleDay>=r.ovDay-1.5&&r.cycleDay<=r.ovDay+1.5;
  if(inWindow&&q.lh>=18&&q.fsh>=1&&q.ovulatedCycle!==cycle){q.ovulatedCycle=cycle;q.ovulations++;}
  const fshGain=2*(q.fsh/Math.max(r.fsh,.1))/(1+q.fsh/Math.max(r.fsh,.1));
  const lhGain=2*(q.lh/Math.max(r.lh,.1))/(1+q.lh/Math.max(r.lh,.1));
  const st=stageById(stageId),ovarianE2=Math.max(0,r.e2-st.floor)*clamp(fshGain,0,1.5);
  const ovarianP4=r.ovulatory&&q.ovulatedCycle===cycle?Math.max(0,r.p4-.35)*clamp(lhGain,.0,1.5):0;
  const eFeedback=(1+r.e2/90)/(1+q.e2/90),pFeedback=(1+r.p4/6)/(1+q.p4/6),iFeedback=(1+r.inhibin/35)/(1+q.inhibin/35);
  const surge=inWindow&&q.highDays>=.7&&q.p4<1.5?48*gauss(r.cycleDay,r.ovDay-.3,.75)*st.lh:0;
  const basalLH=r.cycle===null?r.lh:5*st.lh;
  const targets={e2:st.floor+ovarianE2,p4:st.reserve?(.35+ovarianP4):.2,inhibin:st.reserve?r.inhibin*clamp(fshGain,0,1.5):1,fsh:clamp(r.fsh*eFeedback*pFeedback*iFeedback,.05,150),lh:clamp(basalLH*eFeedback**.7*pFeedback+surge,.05,100)};
  const tau={e2:.6,p4:.4,inhibin:1,fsh:2,lh:.3};
  for(const k of Object.keys(targets))q[k]=Object.hasOwn(forcing,k)?forcing[k]:q[k]+(targets[k]-q[k])*(1-Math.exp(-dt/tau[k]));
  const withdrawal=q.progSignal>2.5&&q.p4<1.3;
  q.progSignal+=(q.p4-q.progSignal)*(1-Math.exp(-dt/2));q.estrogenSignal+=(q.e2-q.estrogenSignal)*(1-Math.exp(-dt/10));
  const endoTarget=withdrawal?2:2+10*q.e2/(q.e2+80);
  q.endo+=(endoTarget-q.endo)*(1-Math.exp(-dt/(withdrawal?.8:6)));q.endo=clamp(q.endo,1,14);
  q.t+=dt;remaining-=dt;
 }
 return q;
}
export function effects(state,stageId){const r=referenceAt(stageId,state.t);return {ovulation:state.ovulatedCycle===r.cycle&&r.cycle!==null,secretory:state.p4>3&&state.e2>25,withdrawal:state.progSignal>2.5&&state.p4<1.3,unopposed:state.e2>60&&state.p4<1,lowEstrogen:state.estrogenSignal<30,boneSignal:(1.4-.8*state.estrogenSignal/(state.estrogenSignal+40))/.92,months:stageById(stageId).months===null?null:stageById(stageId).months+state.t/30.44};}
export const format=(v,d=1)=>v.toLocaleString('pt-BR',{maximumFractionDigits:d});
