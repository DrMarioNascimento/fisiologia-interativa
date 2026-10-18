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
 const period=s.periods[i],ovDay=period-14,ovulatory=s.ov[i],base=cycleAt(rem,period),scale=s.scale*(stageId==='reprodutiva'?1:1+.18*Math.sin(n*2.1));
 const e2=s.floor+Math.max(0,base.e2-18)*scale*(ovulatory?1:.6);
 const inhibin=2+s.inhibin*(38+45*gauss(rem,Math.max(5,ovDay-4),5));
 return {e2,p4:ovulatory?base.p4:.35,fsh:base.fsh*s.fsh,lh:base.lh*s.lh,inhibin,cycle:n,cycleDay:rem,period,ovDay,ovulatory,reserve:s.reserve,phase:rem<5?'Menstruação de referência':rem<ovDay-1?'Fase folicular de referência':rem<ovDay+1?'Janela ovulatória de referência':ovulatory?'Fase lútea de referência':'Intervalo anovulatório de referência'};
}
export function createState(stageId){const r=referenceAt(stageId,0);return {t:0,e2:r.e2,p4:r.p4,fsh:r.fsh,lh:r.lh,inhibin:r.inhibin,endo:2+8*r.e2/(r.e2+80),progSignal:r.p4,estrogenSignal:r.e2,priming:0,secretorySignal:0,shedding:0,ovarianTime:0,follicle:0,lastOvulation:-100,lastCycle:0,highDays:0,ovulatedCycle:-1,ovulations:0};}
export function validateForcing(forcing){for(const [k,v]of Object.entries(forcing)){const d=HORMONES[k];if(!d||!Number.isFinite(v)||v<d.min||v>d.max)throw new RangeError('Intervenção hormonal inválida');}}
export function advance(state,stageId,days,forcing={}){
 if(!Number.isFinite(days)||days<0||days>365)throw new RangeError('Intervalo inválido');validateForcing(forcing);stageById(stageId);const q={...state};let remaining=days;
 for(const [k,v]of Object.entries(forcing))q[k]=v;
 while(remaining>1e-9){const dt=Math.min(.05,remaining),r=referenceAt(stageId,q.ovarianTime),cycle=r.cycle;
  if((cycle??-1)!==q.lastCycle){q.follicle=0;q.lastCycle=cycle??-1;}
  q.highDays=q.e2>=180&&q.p4<1.5?q.highDays+dt:0;
  const fshGain=2*(q.fsh/Math.max(r.fsh,.1))/(1+q.fsh/Math.max(r.fsh,.1));
  const st=stageById(stageId),basalLH=r.cycle===null?r.lh:5*st.lh;
  const lhGain=2*q.lh/(Math.max(basalLH,.1)+q.lh);
  // Crescimento folicular depende de FSH; LH fornece substrato androgênico para aromatização.
  const lutealAge=q.t-q.lastOvulation,hasLuteum=st.reserve>0&&lutealAge<15;
  const follicleTarget=st.reserve&&!hasLuteum?clamp(r.cycleDay/Math.max(1,r.ovDay-1),0,1)*clamp(fshGain,0,1):0;
  q.follicle+=(follicleTarget-q.follicle)*(1-Math.exp(-dt/.8));
  const ready=r.ovulatory&&q.follicle>=.8&&!hasLuteum;
  if(ready&&q.lh>=18&&q.fsh>=1&&q.ovulatedCycle!==cycle){q.ovulatedCycle=cycle;q.lastOvulation=q.t;q.ovulations++;}
  const substrate=(q.lh/(q.lh+1))/(basalLH/(basalLH+1));
  const ovarianE2=Math.max(0,r.e2-st.floor)*clamp(fshGain,0,1.5)*clamp(substrate,0,1.5);
  // O corpo lúteo acompanha o instante real da ovulação, e não um dia fixo do calendário.
  const age=q.t-q.lastOvulation,lutealScale=stageId==='peri-inicial'?.9:stageId==='peri-tardia'?.75:1;
  const ovarianP4=st.reserve&&age<15?13*gauss(age,6,2.6)*clamp(lhGain,0,1.5)*lutealScale:0;
  const centralPriming=clamp((q.estrogenSignal-20)/40,0,1);
  const eFeedback=(1+r.e2/90)/(1+q.e2/90),pFeedback=(1+r.p4/6*centralPriming)/(1+q.p4/6*centralPriming),iFeedback=(1+r.inhibin/35)/(1+q.inhibin/35);
  const surge=ready&&q.highDays>=1.5&&q.p4<1.5?48*clamp((q.highDays-1.5)/.5,0,1)*st.lh:0;
  const targets={e2:st.floor+ovarianE2,p4:st.reserve?(.35+ovarianP4):.2,inhibin:st.reserve?r.inhibin*clamp(fshGain,0,1.5):1,fsh:clamp(r.fsh*eFeedback*pFeedback*iFeedback,.05,150),lh:clamp(basalLH*eFeedback**.7*pFeedback+surge,.05,100)};
  const tau={e2:.6,p4:.4,inhibin:1,fsh:2,lh:.3};
  for(const k of Object.keys(targets))q[k]=Object.hasOwn(forcing,k)?forcing[k]:q[k]+(targets[k]-q[k])*(1-Math.exp(-dt/tau[k]));
  // Memória tecidual: preparo estrogênico, diferenciação e retirada são estados distintos.
  const estrogenDrive=clamp((q.e2-20)/60,0,1);
  q.priming+=(estrogenDrive-q.priming)*(1-Math.exp(-dt/(estrogenDrive>q.priming?4:20)));
  const progesteroneDrive=q.p4/(q.p4+2);
  const secretoryTarget=q.priming>.35?progesteroneDrive*q.priming:0;
  q.secretorySignal+=(secretoryTarget-q.secretorySignal)*(1-Math.exp(-dt/(q.p4>=1.3?2:4)));
  if(q.shedding<=0&&q.secretorySignal>.25&&q.progSignal>2.5&&q.p4<1.3&&q.endo>3.2)q.shedding=3;
  const withdrawal=q.shedding>0;
  q.progSignal+=(q.p4-q.progSignal)*(1-Math.exp(-dt/2));q.estrogenSignal+=(q.e2-q.estrogenSignal)*(1-Math.exp(-dt/10));
  const endoTarget=withdrawal?2:2+(10*q.e2/(q.e2+80))*(1-.45*progesteroneDrive*q.priming);
  q.endo+=(endoTarget-q.endo)*(1-Math.exp(-dt/(withdrawal?.8:6)));q.endo=clamp(q.endo,1,14);
  if(withdrawal){q.shedding=Math.max(0,q.shedding-dt);q.secretorySignal*=Math.exp(-dt/.8);}
  q.ovarianTime+=dt*(hasLuteum?1:clamp(fshGain,0,1.4));q.t+=dt;remaining-=dt;
 }
 return q;
}
export function effects(state,stageId){const r=referenceAt(stageId,state.ovarianTime);return {ovulation:state.ovulatedCycle===r.cycle&&r.cycle!==null,secretory:state.secretorySignal>.3&&state.shedding<=0,withdrawal:state.shedding>0,unopposed:state.estrogenSignal>60&&state.secretorySignal<.2,lowEstrogen:state.estrogenSignal<30,boneTrend:state.estrogenSignal<30?'Maior estímulo à reabsorção com baixa exposição estrogênica':state.estrogenSignal<60?'Menor exposição estrogênica: tendência qualitativa intermediária':'Exposição estrogênica preservada: menor estímulo relativo à reabsorção',months:stageById(stageId).months===null?null:stageById(stageId).months+state.t/30.44};}
export const format=(v,d=1)=>v.toLocaleString('pt-BR',{maximumFractionDigits:d});
