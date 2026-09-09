/* The electrical timeline also drives the visible motor-unit response.
   The conduction delay and deformation are illustrative, not a calibrated muscle model. */
window.createMotorFiberResponse = function(root) {
  const ns='http://www.w3.org/2000/svg';
  const stage=root.querySelector('.units-stage'), svg=stage.querySelector('svg');
  const el=(tag,attrs,parent)=>{const n=document.createElementNS(ns,tag);for(const [k,v] of Object.entries(attrs))n.setAttribute(k,v);if(parent)parent.append(n);return n;};
  const defs=svg.querySelector('defs');
  const image=el('image',{id:'rum-fiber-texture',href:stage.querySelector('img').src,width:1530,height:1028},defs);
  image.setAttribute('preserveAspectRatio','none');
  const style=document.createElement('style');
  style.textContent='#rum-sim .units-stage .pulse{display:none!important}.fiber-response,.motor-signal{pointer-events:none}.fiber-response{filter:drop-shadow(0 0 3px #fff8)}';
  stage.append(style);
  const responseLayer=el('g',{'class':'fiber-responses'},svg);
  const signalLayer=el('g',{'class':'motor-signals'},svg);
  const reducedMotion=window.matchMedia('(prefers-reduced-motion: reduce)');
  const delay=.36, twitchDuration=.52;
  const definitions=[
    {type:'I',cls:'p-i',color:'#4cb8f5',soma:[173,193],fibers:[[718,197,43,49],[633,260,46,52],[566,345,43,49],[770,409,43,52]]},
    {type:'IIa',cls:'p-iia',color:'#ffc64d',soma:[158,488],fibers:[[867,451,44,52],[518,441,41,49],[707,479,41,48],[620,576,44,49],[814,640,41,47]]},
    {type:'IIx',cls:'p-iix',color:'#ff7469',soma:[193,790],fibers:[[548,665,43,48],[687,697,44,48],[1097,622,37,44],[896,798,44,47],[803,868,41,44]]},
  ];
  const groups=definitions.map((definition,index)=>{
    const paths=[...svg.querySelectorAll('.'+definition.cls+' animateMotion')].map(m=>{
      let d=m.getAttribute('path');
      // The old orange terminal ended on the blue terminal; extend it to its orange fiber.
      if(definition.type==='IIa'&&m.parentNode.classList.contains('branch-1'))d+=' C755 403 807 424 837 444';
      const p=el('path',{d,fill:'none',stroke:'none'},defs);
      return {p,length:p.getTotalLength(),main:m.parentNode.classList.contains('pulse-main')};
    });
    const reaction=el('g',{'class':'fiber-response','data-motor-type':definition.type,opacity:0},responseLayer);
    const fibers=definition.fibers.map(([x,y,rx,ry],fi)=>{
      const clip=el('clipPath',{id:'rum-fiber-clip-'+index+'-'+fi,clipPathUnits:'userSpaceOnUse'},defs);
      el('ellipse',{cx:x,cy:y,rx,ry},clip);
      const patch=el('g',{},reaction);
      el('use',{href:'#rum-fiber-texture','clip-path':'url(#'+clip.id+')'},patch);
      const glow=el('ellipse',{cx:x,cy:y,rx,ry,fill:definition.color,'fill-opacity':.28,stroke:definition.color,'stroke-width':5},patch);
      return {patch,glow,x,y};
    });
    const soma=el('ellipse',{cx:definition.soma[0],cy:definition.soma[1],rx:30,ry:34,fill:definition.color,opacity:0},responseLayer);
    const signals=el('g',{'data-signal-type':definition.type},signalLayer);
    const particles=[];
    return {...definition,paths,reaction,fibers,soma,signals,particles};
  });
  // SMIL no longer has an independent clock. Pause, speed, step and reset use state.t.
  svg.querySelectorAll('animateMotion,animate').forEach(a=>a.remove());
  const note=document.createElement('p');
  note.className='fiber-response-note';
  note.style.cssText='font-size:.85rem;line-height:1.45;color:var(--muted-foreground);margin:8px 0 0';
  note.textContent='O impulso chega e as fibras respondem. Brilho e deformação são esquemáticos; o trajeto foi desacelerado para visualização.';
  stage.after(note);
  function lowerBound(events,value){let lo=0,hi=events.length;while(lo<hi){const mid=(lo+hi)>>1;if(events[mid]<value)lo=mid+1;else hi=mid;}return lo;}
  function render(time,lanes,active,peripheral) {
    for(const group of groups){
      const lane=lanes.find(l=>l.type===group.type);
      const enabled=active.some(n=>n.type===group.type);
      const events=lane?lane.events:[];
      let response=0,somaLevel=0,used=0;
      if(enabled){
        for(let i=lowerBound(events,time-delay-twitchDuration);i<events.length&&events[i]<=time+1e-9;i++){
          const age=time-events[i];
          somaLevel=Math.max(somaLevel,Math.max(0,1-age/.08));
          if(age>=delay&&age<delay+twitchDuration){
            const u=(age-delay)/twitchDuration;
            response+=Math.pow(Math.sin(Math.PI*u),2);
          }
          if(age>=0&&age<delay&&!reducedMotion.matches){
            const progress=age/delay;
            for(const route of group.paths){
              if(route.main?progress>=.3:progress<.3)continue;
              const fraction=route.main?progress/.3:(progress-.3)/.7;
              const point=route.p.getPointAtLength(route.length*fraction);
              let particle=group.particles[used];
              if(!particle){particle=el('circle',{r:route.main?12:9,fill:group.color,stroke:'#fff','stroke-width':3},group.signals);group.particles.push(particle);}
              particle.setAttribute('r',route.main?12:9);
              particle.setAttribute('cx',point.x);particle.setAttribute('cy',point.y);particle.setAttribute('opacity',.9);
              used++;
            }
          }
        }
      }
      // A bounded, gradual sum preserves differences between isolated and repeated responses.
      const level=(response/(.25+response))*Math.max(0,Math.min(1,peripheral));
      group.reaction.dataset.activation=level.toFixed(4);
      group.reaction.setAttribute('opacity',level>0?1:0);
      group.soma.setAttribute('opacity',reducedMotion.matches?0:(somaLevel*.45).toFixed(3));
      for(const fiber of group.fibers){
        const stretch=reducedMotion.matches?0:level*.055;
        fiber.patch.setAttribute('transform',`translate(${fiber.x} ${fiber.y}) scale(${1+stretch} ${1-stretch}) translate(${-fiber.x} ${-fiber.y})`);
        fiber.glow.setAttribute('opacity',level.toFixed(4));
      }
      for(let i=used;i<group.particles.length;i++)group.particles[i].setAttribute('opacity',0);
    }
  }
  return {render,delay};
};
