export const defaults = Object.freeze({days:1,bed:23,wake:7,fragmentation:0,phase:0,stress:0,stressHour:14,inflammation:0,intensity:0,duration:45,exerciseHour:16,energy:100,protein:100,resistance:0,adrenal:100,central:100,hypothalamus:100,autonomy:0,acthAutonomy:0,exogenous:0,withdrawalDay:0,car:100});
export const scenarios = {
 basal:{label:'Ritmo diário em repouso',values:{}},
 acute:{label:'Estresse diário de uma hora',values:{stress:80}},
 exercise:{label:'Exercício intenso',values:{intensity:80,duration:60}},
 prolonged:{label:'Exercício prolongado e pouca energia',values:{intensity:65,duration:150,energy:65}},
 sleep:{label:'Restrição de sono por 7 dias',values:{days:7,bed:2,wake:7,fragmentation:40}},
 night:{label:'Transição de horários e fase para turno noturno',values:{days:7,bed:8,wake:16,phase:9}},
 inflammatory:{label:'Introdução de estímulo inflamatório persistente',values:{days:7,inflammation:70}},
 primary:{label:'Redução da função adrenal a partir do dia 1',values:{adrenal:15}},
 secondary:{label:'Redução da função hipofisária a partir do dia 1',values:{central:15}},
 hypothalamic:{label:'Redução da função hipotalâmica a partir do dia 1',values:{hypothalamus:15}},
 pituitary:{label:'Introdução de produção autônoma de ACTH',values:{days:28,acthAutonomy:160}},
 adrenal:{label:'Introdução de produção adrenal autônoma',values:{days:28,autonomy:170}},
 medication:{label:'Sinal exógeno persistente, sem farmacocinética',values:{days:28,exogenous:180}},
 withdrawal:{label:'Retirada de sinal exógeno no dia 15',values:{days:28,exogenous:180,withdrawalDay:15}}
};
export const mod=(n,d)=>((n%d)+d)%d;
export const sleepHours=p=>mod(p.wake-p.bed,24);
export const sleeping=(hour,p)=>mod(hour-p.bed,24)<sleepHours(p);
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
const approach=(n,target,tau)=>n+(target-n)*(1-Math.exp(-1/tau));
const initial=()=>({crh:55,acth:55,cortisol:55,sym:15,cat:15,debt:0,pressure:40,phase:0,capacity:1,trophic:1});
export function circadianDrive(hour,phase=0){
 const x=mod(hour-phase-23,24);
 return x<8?25+90*(1-Math.cos(Math.PI*x/8))/2:25+90*(1+Math.cos(Math.PI*(x-8)/16))/2;
}
function advance(s,p,t,reference=null){
 const h=mod(t/60,24),asleep=sleeping(h,p),wakeAgo=mod(h-p.wake,24);
 s.phase=approach(s.phase,p.phase,3*1440);
 const circadian=circadianDrive(h,s.phase);
 // Pulses are an imposed secretion pattern, not an emergent HPA oscillator.
 const pulse=1+.45*Math.cos(2*Math.PI*t/90);
 const awakening=sleepHours(p)>0&&!asleep&&wakeAgo<2?22*p.car/100*Math.exp(-(((wakeAgo-.3)/.18)**2)):0;
 const exerciseAge=mod(h-p.exerciseHour,24)*60;
 const exercise=exerciseAge<p.duration?p.intensity/100:0;
 const stress=mod(h-p.stressHour,24)<1?p.stress/100:0;
 const debtTarget=Math.max(0,8-sleepHours(p))+p.fragmentation/40;
 s.debt=approach(s.debt,debtTarget,2*1440);
 s.pressure=approach(s.pressure,asleep?10+p.fragmentation*.3:100,asleep?240:960);
 const prolonged=exercise?Math.min(1.5,exerciseAge/90):0;
 const exerciseDrive=exercise*(.25+exercise+prolonged);
 const exogenous=p.withdrawalDay>0&&t>=(p.withdrawalDay-1)*1440?0:p.exogenous;
 const feedback=1/(1+(s.cortisol+exogenous)/100);
 const evening=(1+Math.cos(2*Math.PI*(h-s.phase-20)/24))/2;
 const drive=circadian+90*stress+65*exerciseDrive+p.inflammation*.65+s.debt*3*evening;
 s.crh=approach(s.crh,clamp(drive*2*feedback*p.hypothalamus/100,0,500),12);
 s.acth=approach(s.acth,clamp(s.crh*2*feedback*p.central/100+p.acthAutonomy,0,500),18);
 // Compare with the same circadian reference; normal nightly ACTH valleys are not atrophy.
 const ratio=reference?s.acth/Math.max(1,reference.acth):1;
 s.trophic=approach(s.trophic,clamp(ratio,0,1),1440);
 s.capacity=approach(s.capacity,s.trophic,7*1440);
 const secretion=(s.acth*pulse+awakening)*p.adrenal/100*s.capacity+p.autonomy;
 s.cortisol=approach(s.cortisol,clamp(secretion,0,600),35);
 s.sym=approach(s.sym,clamp((asleep?8:18)+75*exercise+60*stress+p.inflammation*.15,0,180),3);
 s.cat=approach(s.cat,s.sym,7);
 return {t,h,asleep,exercise:exercise>0,stress:stress>0,crh:s.crh,acth:s.acth,cortisol:s.cortisol,sym:s.sym,cat:s.cat,effective:s.cortisol+exogenous,exogenous,debt:s.debt,pressure:s.pressure,phase:s.phase,capacity:s.capacity,circadian,awakening};
}
export function simulate(input={}){
 const p={...defaults,...input};
 if(![1,7,28].includes(p.days))throw new Error('Duração inválida');
 for(const value of Object.values(p))if(!Number.isFinite(value))throw new Error('Parâmetro inválido');
 const ranges={bed:[0,23],wake:[0,23],fragmentation:[0,100],phase:[-12,12],stress:[0,100],stressHour:[0,23],inflammation:[0,100],intensity:[0,100],duration:[0,240],exerciseHour:[0,23],energy:[40,140],protein:[40,140],resistance:[0,100],adrenal:[0,150],central:[0,150],hypothalamus:[0,150],autonomy:[0,200],acthAutonomy:[0,200],exogenous:[0,250],withdrawalDay:[0,28],car:[0,100]};
 for(const [key,[min,max]] of Object.entries(ranges))p[key]=clamp(p[key],min,max);
 p.withdrawalDay=Math.floor(p.withdrawalDay);
 const b=initial(),base={...defaults,days:p.days},rows=[];
 for(let t=-14*1440;t<0;t++)advance(b,base,t);
 const s={...b};
 for(let t=0;t<=p.days*1440;t++){
 const ref=advance(b,base,t),current=advance(s,p,t,ref);
 if(t%10===0)rows.push({...current,baseline:ref.cortisol});
 }
 return rows;
}
export function muscleAssessment(row,p){
 const factors=[];
 if(p.energy<100)factors.push('oferta energética declarada reduzida');
 if(p.protein<100)factors.push('oferta proteica declarada reduzida');
 if(p.intensity>0&&p.duration>0&&p.resistance>0)factors.push('sessão com componente resistido programada');
 if(row.exogenous>0)factors.push('sinal glicocorticoide exógeno presente');
 const context=factors.length?`Fatores de contexto: ${factors.join('; ')}. `:'';
 return `${row.t<1440?'Janela aguda: um pico não demonstra perda muscular. ':''}${context}O modelo não calcula síntese, proteólise, massa ou força; não classifica catabolismo nem prevê adaptação muscular.`;
}
