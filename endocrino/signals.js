// Grandeza visual relativa ao basal, sem alterar as equações fisiológicas.
export function signalStyle(value,baseline){
 const ratio=Math.max(0,Number.isFinite(value)?value/Math.max(baseline,1e-6):0);
 return {ratio,width:Math.min(9,Math.max(1,3*Math.sqrt(ratio))),duration:Math.min(4,Math.max(.25,1/Math.max(ratio,.001))),active:ratio>=.05};
}
export function signalSVG(value,baseline,{inhibitory=false,paused=false}={}){
 const s=signalStyle(value,baseline);
 return `<svg class="signal-arrow ${inhibitory?'inhibitory':'stimulatory'}" viewBox="0 0 42 74" aria-hidden="true" style="opacity:${s.active?1:.3}"><path class="signal-track" d="M21 5V55"/><path class="signal-flow" d="M21 5V55" style="stroke-width:${s.width};animation-duration:${s.duration}s;animation-delay:-${(Date.now()/1000)%s.duration}s;animation-play-state:${s.active&&!paused?'running':'paused'}"/>${inhibitory?'<path class="signal-end" d="M9 59H33"/>':'<path class="signal-tip" d="M10 53L21 69L32 53Z"/>'}</svg>`;
}
