export const defaults = Object.freeze({days:1,bed:23,wake:7,fragmentation:0,phase:0,light:0,stress:0,stressHour:14,inflammation:0,intensity:0,duration:45,exerciseHour:16,fitness:50,energy:100,protein:100,resistance:0,adrenal:100,central:100,autonomy:0,acthAutonomy:0,exogenous:0});
export const scenarios = {
 basal:{label:'Ritmo diário em repouso',values:{}},
 acute:{label:'Estresse agudo',values:{stress:80}},
 exercise:{label:'Exercício intenso',values:{intensity:80,duration:60}},
 prolonged:{label:'Exercício prolongado e pouca energia',values:{intensity:65,duration:150,energy:65}},
 sleep:{label:'Restrição de sono por 7 dias',values:{days:7,bed:2,wake:7,fragmentation:40}},
 night:{label:'Mudança para turno noturno',values:{days:7,bed:8,wake:16,phase:9,light:70}},
 inflammatory:{label:'Estímulo inflamatório persistente',values:{days:7,inflammation:70}},
 primary:{label:'Insuficiência adrenal primária',values:{adrenal:15}},
 secondary:{label:'Insuficiência adrenal central',values:{central:15}},
 pituitary:{label:'Produção autônoma de ACTH',values:{days:28,acthAutonomy:160}},
 adrenal:{label:'Produção adrenal autônoma',values:{days:28,autonomy:170}},
 medication:{label:'Glicocorticoide exógeno persistente',values:{days:28,exogenous:180}}
};
export const mod=(n,d)=>((n%d)+d)%d;
export const sleepHours=p=>mod(p.wake-p.bed,24);
export const sleeping=(hour,p)=>mod(hour-p.bed,24)<sleepHours(p);
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
const approach=(n,target,tau)=>n+(target-n)*(1-Math.exp(-1/tau));
const initial=()=>({crh:55,acth:55,cortisol:55,sym:15,cat:15,burden:0,debt:0,pressure:40,phase:0,capacity:1});
function advance(s,p,t){
 const h=mod(t/60,24),asleep=sleeping(h,p),wakeAgo=mod(h-p.wake,24);
 s.phase=approach(s.phase,p.phase+p.light/100,3*1440);
 const circadian=65+40*Math.cos(2*Math.PI*(h-8-s.phase)/24);
 const pulse=1+.09*Math.sin(2*Math.PI*t/90);
 const awakening=asleep?0:22*Math.exp(-(((wakeAgo-.5)/.35)**2));
 const exerciseAge=mod(h-p.exerciseHour,24)*60;
 const exercise=exerciseAge<p.duration?p.intensity/100:0;
 const stress=mod(h-p.stressHour,24)<1?p.stress/100:0;
 const debtTarget=Math.max(0,8-sleepHours(p))+p.fragmentation/40;
 s.debt=approach(s.debt,debtTarget,2*1440);
 s.pressure=approach(s.pressure,asleep?10+p.fragmentation*.3:100,asleep?240:960);
 const prolonged=exercise?Math.min(1.5,exerciseAge/90):0;
 const exerciseDrive=exercise*(.25+exercise+prolonged)*(1.1-p.fitness/250)*(1+Math.max(0,100-p.energy)/100);
 const effective=s.cortisol+p.exogenous;
 const feedback=1/(1+effective/100);
 const drive=circadian*pulse+awakening+90*stress+65*exerciseDrive+p.inflammation*.65+s.debt*2;
 s.crh=approach(s.crh,clamp(drive*2*feedback*p.central/100,0,500),12);
 s.acth=approach(s.acth,clamp(s.crh*2*feedback*p.central/100+p.acthAutonomy,0,500),18);
 s.capacity=approach(s.capacity,clamp(s.acth/55,.15,1),7*1440);
 s.cortisol=approach(s.cortisol,clamp(s.acth*p.adrenal/100*s.capacity+p.autonomy,0,600),65);
 s.sym=approach(s.sym,clamp((asleep?8:18)+75*exercise+60*stress+p.inflammation*.15,0,180),3);
 s.cat=approach(s.cat,s.sym,7);
 s.burden=approach(s.burden,Math.max(0,effective-120)/100,3*1440);
 return {t,h,asleep,exercise:exercise>0,stress:stress>0,crh:s.crh,acth:s.acth,cortisol:s.cortisol,sym:s.sym,cat:s.cat,effective:s.cortisol+p.exogenous,burden:s.burden,debt:s.debt,pressure:s.pressure,phase:s.phase,capacity:s.capacity,circadian};
}
export function simulate(input={}){
 const p={...defaults,...input};
 if(![1,7,28].includes(p.days))throw new Error('Duração inválida');
 for(const value of Object.values(p))if(!Number.isFinite(value))throw new Error('Parâmetro inválido');
 const ranges={bed:[0,23],wake:[0,23],fragmentation:[0,100],phase:[-12,12],light:[0,100],stress:[0,100],stressHour:[0,23],inflammation:[0,100],intensity:[0,100],duration:[0,240],exerciseHour:[0,23],fitness:[0,100],energy:[40,140],protein:[40,140],resistance:[0,100],adrenal:[0,150],central:[0,150],autonomy:[0,200],acthAutonomy:[0,200],exogenous:[0,250]};
 for(const [key,[min,max]] of Object.entries(ranges))p[key]=clamp(p[key],min,max);
 const s=initial(),b=initial(),base={...defaults,days:p.days},rows=[];
 // Equal basal warm-up keeps scenario onset separate from established chronic disease.
 for(let t=-4320;t<0;t++){advance(s,base,t);advance(b,base,t);}
 for(let t=0;t<=p.days*1440;t++){
 const current=advance(s,p,t),ref=advance(b,base,t);
 if(t%10===0)rows.push({...current,baseline:ref.cortisol});
 }
 return rows;
}
export function muscleAssessment(row,p){
 const nutrition=Math.max(0,100-p.energy)/100+Math.max(0,100-p.protein)/100;
 const load=row.burden+nutrition;
 if(row.t<1440)return 'Janela aguda: não inferir perda de massa muscular.';
 if(load>.55)return 'Contexto favorece catabolismo: exposição persistente e/ou oferta nutricional insuficiente.';
 if(p.resistance>30&&p.energy>=100&&p.protein>=100)return 'Contexto favorável à adaptação ao treino resistido; ganho não é quantificado.';
 return 'Sem sinal forte de catabolismo persistente neste modelo; não equivale a avaliação clínica.';
}
