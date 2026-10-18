import {defaults,scenarios,simulate,sleepHours,muscleAssessment} from './cortisol-model.js';
import {lessons} from './cortisol-content.js';
const $=id=>document.getElementById(id),fmt=n=>n.toLocaleString('pt-BR',{maximumFractionDigits:1});
let params={...defaults},rows=[],cursor=0,timer=null;
const groups=[
 ['Sono e relógio biológico',[
 ['bed','Dormir às',0,23,1,'h'],['wake','Acordar às',0,23,1,'h'],['fragmentation','Fragmentação do sono',0,100,5,'%'],['phase','Deslocamento de fase desejado',-12,12,1,'h'],['light','Exposição à luz noturna',0,100,5,'%']]],
 ['Exercício e recuperação',[
 ['exerciseHour','Início do exercício',0,23,1,'h'],['intensity','Intensidade relativa',0,100,5,'%'],['duration','Duração por dia',0,240,15,'min'],['fitness','Condicionamento',0,100,5,'%'],['resistance','Estímulo resistido',0,100,5,'%']]],
 ['Estímulos e substratos',[
 ['stress','Estresse diário (1 hora)',0,100,5,'%'],['stressHour','Início do estresse',0,23,1,'h'],['inflammation','Estímulo inflamatório',0,100,5,'%'],['energy','Disponibilidade energética',40,140,5,'%'],['protein','Oferta proteica relativa',40,140,5,'%']]],
 ['Mecanismos do eixo · avançado',[
 ['central','Capacidade central',0,150,5,'%'],['adrenal','Capacidade adrenal inicial',0,150,5,'%'],['acthAutonomy','ACTH autônomo',0,200,10,'u.r.'],['autonomy','Cortisol adrenal autônomo',0,200,10,'u.r.'],['exogenous','Sinal glicocorticoide exógeno',0,250,10,'u.r.']]]
];
$('scenario').innerHTML=Object.entries(scenarios).map(([id,s])=>`<option value="${id}">${s.label}</option>`).join('')+'<option value="custom" disabled>Experimento personalizado</option>';
$('controls').innerHTML=groups.map(([name,controls])=>{
 const advanced=name.includes('avançado');
 const fields=controls.map(([id,label,min,max,step,unit])=>`<div class="control"><label for="${id}">${label}<output id="${id}-value"></output></label><input id="${id}" type="range" min="${min}" max="${max}" step="${step}" value="${params[id]}" data-unit="${unit}"></div>`).join('');
 return advanced?`<details id="advanced-controls" class="advanced-controls"><summary>Mecanismos do eixo · controles avançados</summary><fieldset><legend>Capacidades e sinais autônomos</legend>${fields}</fieldset><p class="control-help">Sinais relativos, não doses. Exógeno contribui para feedback, não para a curva de cortisol endógeno.</p></details>`:`<fieldset><legend>${name}</legend>${fields}</fieldset>`;
}).join('');
$('lessons').innerHTML=lessons.map(([title,summary,body],i)=>`<details id="lesson-${i+1}"><summary><span class="num">0${i+1}</span>${title}<small>${summary}</small></summary><div class="lesson-body">${body}</div></details>`).join('');
function syncControls(){
 for(const [,controls] of groups)for(const [id,,,,,unit] of controls){$(id).value=params[id];$(`${id}-value`).textContent=`${params[id]} ${unit}`;}
 $('days').value=params.days;
}
function pause(){clearInterval(timer);timer=null;$('play').textContent='Iniciar';}
function rebuild(){pause();rows=simulate(params);cursor=0;$('cursor').max=rows.length-1;syncControls();render();}
for(const [,controls] of groups)for(const [id] of controls){
 $(id).addEventListener('input',()=>{$(`${id}-value`).textContent=`${$(id).value} ${$(id).dataset.unit}`;});
 $(id).addEventListener('change',()=>{params[id]=Number($(id).value);$('scenario').value='custom';rebuild();});
}
$('scenario').onchange=()=>{params={...defaults,...scenarios[$('scenario').value].values};$('advanced-controls').open=groups[3][1].some(([id])=>params[id]!==defaults[id]);rebuild();};
$('days').onchange=()=>{params.days=Number($('days').value);rebuild();};
$('reset').onclick=()=>{params={...defaults};$('scenario').value='basal';$('advanced-controls').open=false;rebuild();};
function move(amount){cursor=Math.min(rows.length-1,cursor+amount);if(cursor===rows.length-1)pause();render();}
$('step').onclick=()=>{pause();move(6);};
$('day-step').onclick=()=>{pause();move(144);};
$('play').onclick=()=>{if(timer){pause();return;}if(cursor===rows.length-1)cursor=0;$('play').textContent='Pausar';timer=setInterval(()=>move(Number($('speed').value)*3),500);render();};
$('cursor').oninput=()=>{pause();cursor=Number($('cursor').value);render();};
$('chart-window').onchange=draw;
$('expand').onclick=()=>document.querySelectorAll('#lessons details').forEach(el=>{el.open=true;});
$('collapse').onclick=()=>document.querySelectorAll('#lessons details').forEach(el=>{el.open=false;});
const time=t=>`${Math.floor(t/1440)+1}d ${String(Math.floor(t/60)%24).padStart(2,'0')}:${String(t%60).padStart(2,'0')}`;
function render(){
 const r=rows[cursor];$('cursor').value=cursor;$('clock').textContent=`${time(r.t)} · ${r.asleep?'sono':'vigília'}`;
 $('step').disabled=$('day-step').disabled=cursor===rows.length-1;
 $('map-cortisol').textContent=fmt(r.cortisol);$('map-cat').textContent=fmt(r.cat);$('map-sym').textContent=fmt(r.sym);
 $('metrics').innerHTML=[['Cortisol endógeno',r.cortisol],['ACTH',r.acth],['Índice simpático',r.sym],['Sinal efetivo + exógeno',r.effective]].map(([label,n])=>`<div class="metric"><span>${label}</span><strong>${fmt(n)}</strong><small>u.r.</small></div>`).join('');
 const delta=r.cortisol-r.baseline;
 $('interpretation').textContent=`Cortisol ${Math.abs(delta)<.1?'igual ao':delta>0?'acima do':'abaixo do'} basal de referência${Math.abs(delta)<.1?'':` em ${fmt(Math.abs(delta))} u.r.`}. ${r.exercise?'Exercício em curso. ':''}${r.stress?'Estresse programado ativo. ':''}${params.exogenous?'O sinal exógeno pode suprimir ACTH mesmo com cortisol endógeno baixo.':'Feedback depende do sinal glicocorticoide e da capacidade do eixo.'}`;
 $('muscle').textContent=muscleAssessment(r,params);
 $('recovery').textContent=`Sono programado: ${sleepHours(params)} h. Restrição acumulada: ${fmt(r.debt)} (índice). Pressão de sono: ${fmt(r.pressure)} u.r. Fase deslocada: ${fmt(r.phase)} h. Capacidade adrenal adaptativa: ${fmt(r.capacity*100)}%.`;
 $('status').textContent=`${cursor===rows.length-1?'Janela concluída. ':''}${sleepHours(params)===0?'Atenção: horários iguais representam ausência de sono neste modelo. ':''}Parâmetros aplicados desde o início. Dados relativos; coeficientes pedagógicos não calibrados clinicamente.`;
 $('rows').innerHTML=rows.slice(Math.max(0,cursor-11),cursor+1).map(x=>`<tr><td>${time(x.t)}</td>${['crh','acth','cortisol','baseline','sym','cat'].map(k=>`<td>${fmt(x[k])}</td>`).join('')}</tr>`).join('');
 draw();
}
function draw(){
 if(!rows.length)return;
 const canvas=$('chart'),ctx=canvas.getContext('2d'),width=canvas.clientWidth,height=270,dpr=window.devicePixelRatio||1;
 canvas.width=width*dpr;canvas.height=height*dpr;ctx.scale(dpr,dpr);ctx.clearRect(0,0,width,height);
 const end=rows[cursor].t,start=$('chart-window').value==='day'?Math.max(0,end-1440):0;
 const extent=Math.max(start+1440,end),left=42,right=16,top=18,bottom=36,w=width-left-right,h=height-top-bottom;
 const visible=rows.filter(r=>r.t>=start&&r.t<=end);
 const ymax=Math.max(160,Math.ceil(Math.max(...visible.flatMap(r=>[r.cortisol,r.acth,r.sym,r.baseline]))/50)*50);
 const x=t=>left+(t-start)/(extent-start)*w,y=n=>top+h-n/ymax*h;
 for(const r of visible){const dx=Math.max(1,x(r.t+10)-x(r.t));if(r.asleep){ctx.fillStyle='#eef0f5';ctx.fillRect(x(r.t),top,dx,h);}if(r.exercise){ctx.fillStyle='#d5a657';ctx.fillRect(x(r.t),top+h-5,dx,5);}if(r.stress){ctx.fillStyle='#9575b7';ctx.fillRect(x(r.t),top,dx,5);}}
 ctx.font='11px system-ui';ctx.fillStyle='#52655f';ctx.textAlign='right';ctx.setLineDash([]);
 for(let i=0;i<=4;i++){const n=ymax*i/4;ctx.strokeStyle='#dbe3dc';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(left,y(n));ctx.lineTo(width-right,y(n));ctx.stroke();ctx.fillText(String(Math.round(n)),left-7,y(n)+4);}
 ctx.textAlign='center';for(let i=0;i<=4;i++){const t=start+(extent-start)*i/4;ctx.fillText(params.days>1&&$('chart-window').value==='all'?`${fmt(t/1440)} d`:`${Math.floor(t/60)%24}h`,x(t),height-12);}
 for(const [key,color,dash] of [['baseline','#7c8985',[5,5]],['sym','#946019',[]],['acth','#73519c',[]],['cortisol','#08766c',[]]]){
 ctx.beginPath();ctx.strokeStyle=color;ctx.lineWidth=key==='cortisol'?2.5:1.7;ctx.setLineDash(dash);visible.forEach((r,i)=>i?ctx.lineTo(x(r.t),y(r[key])):ctx.moveTo(x(r.t),y(r[key])));ctx.stroke();
 if(visible.length===1){ctx.beginPath();ctx.arc(x(visible[0].t),y(visible[0][key]),3,0,Math.PI*2);ctx.fillStyle=color;ctx.fill();}
 }
 ctx.setLineDash([]);
 canvas.setAttribute('aria-label',`Gráfico até ${time(end)}. Cortisol ${fmt(rows[cursor].cortisol)}, ACTH ${fmt(rows[cursor].acth)}, simpático ${fmt(rows[cursor].sym)} unidades relativas. Valores na tabela.`);
}
$('export').onclick=()=>{
 const headers=['t','crh','acth','cortisol','baseline','sym','cat','effective','burden','debt','pressure','phase','capacity'];
 const metadata=Object.entries(params).map(([k,v])=>`# ${k};${v}`);
 const csv=['# Modelo didático;unidades relativas;sem validade clínica',...metadata,headers.join(';'),...rows.slice(0,cursor+1).map(r=>headers.map(k=>r[k].toFixed(3)).join(';'))].join('\n');
 const url=URL.createObjectURL(new Blob(['\uFEFF'+csv],{type:'text/csv;charset=utf-8'}));const a=document.createElement('a');a.href=url;a.download='cortisol-experimento.csv';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
};
new ResizeObserver(draw).observe($('chart'));
document.addEventListener('visibilitychange',()=>{if(document.hidden)pause();});
rebuild();
