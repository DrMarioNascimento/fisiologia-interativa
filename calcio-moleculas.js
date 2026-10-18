/* Mesmos desenhos na animação e na legenda; sprites em alta resolução. */
(() => {
  const definitions = {
    D3: { color: '#ffe066', dark: '#9b650c', shape: 'ellipse' },
    '25': { color: '#ffc7a8', dark: '#a25134', shape: 'hexagon' },
    C: { color: '#7bf1b0', dark: '#16764e', shape: 'capsule' },
    'Ca²⁺': { color: '#8cddff', dark: '#256a96', shape: 'sphere' },
    P: { color: '#cbb3ff', dark: '#624098', shape: 'crystal' }
  };
  const sprites = new Map();
  function sprite(label) {
    label = label === 'Ca' ? 'Ca²⁺' : label;
    if (sprites.has(label)) return sprites.get(label);
    const def = definitions[label];
    if (!def) throw new Error('Molécula desconhecida: ' + label);
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = 192;
    const c = canvas.getContext('2d');
    c.scale(4, 4);
    c.translate(24, 23);
    const polygon = points => {
      c.beginPath();
      points.forEach(([x,y],i) => i ? c.lineTo(x,y) : c.moveTo(x,y));
      c.closePath();
    };
    const outline = () => {
      c.beginPath();
      if (def.shape === 'sphere') c.arc(0,0,18,0,Math.PI*2);
      if (def.shape === 'ellipse') c.ellipse(0,0,21,15,0,0,Math.PI*2);
      if (def.shape === 'capsule') c.roundRect(-21,-13,42,26,13);
      if (def.shape === 'hexagon') polygon([[-20,0],[-10,-17],[10,-17],[20,0],[10,17],[-10,17]]);
      if (def.shape === 'crystal') polygon([[0,-21],[19,0],[0,21],[-19,0]]);
    };
    // Ombreado externo curto mantém o contorno visível dentro do vaso.
    c.save();
    c.shadowColor = '#00000099'; c.shadowBlur = 2; c.shadowOffsetY = 2;
    outline(); c.fillStyle = def.dark; c.fill();
    c.restore();
    if (def.shape === 'hexagon' || def.shape === 'crystal') {
      const bevel = c.createLinearGradient(-15,-18,15,20);
      bevel.addColorStop(0,'#fff2e7'); bevel.addColorStop(.3,def.color);
      bevel.addColorStop(.7,def.dark); bevel.addColorStop(1,'#251b38');
      outline(); c.fillStyle = bevel; c.fill();
      if (def.shape === 'hexagon') {
        c.save(); c.translate(0,-2); c.scale(.8,.8); outline();
        const face = c.createLinearGradient(0,-17,0,17);
        face.addColorStop(0,'#ffdfca'); face.addColorStop(.65,def.color); face.addColorStop(1,'#e8a281');
        c.fillStyle = face; c.fill(); c.strokeStyle = '#ffe7d6'; c.lineWidth = .6; c.stroke(); c.restore();
      } else {
        polygon([[0,-21],[-19,0],[-8,7],[-8,-6],[0,-10]]); c.fillStyle='#eadfff'; c.fill();
        polygon([[0,-21],[19,0],[8,7],[8,-6],[0,-10]]); c.fillStyle='#b298e5'; c.fill();
        polygon([[-19,0],[0,21],[0,10],[-8,7]]); c.fillStyle='#9873d0'; c.fill();
        polygon([[19,0],[0,21],[0,10],[8,7]]); c.fillStyle='#624098'; c.fill();
        polygon([[0,-10],[8,-6],[8,7],[0,10],[-8,7],[-8,-6]]); c.fillStyle='#dfceff'; c.fill();
      }
    } else {
      const light = def.shape==='sphere' ? c.createRadialGradient(-7,-8,1,0,1,20) : c.createLinearGradient(-4,-16,5,16);
      light.addColorStop(0,'#eafaff'); light.addColorStop(.22,def.color);
      light.addColorStop(.62,def.color); light.addColorStop(.88,def.dark); light.addColorStop(1,'#153245');
      outline(); c.fillStyle=light; c.fill();
      // Luz superior discreta, fora do centro reservado ao texto.
      c.beginPath(); c.ellipse(-7,-10,5,1.8,-.35,0,Math.PI*2);
      c.fillStyle='#ffffffb3'; c.fill();
    }
    c.fillStyle='#10212c'; c.font='bold '+(label==='Ca²⁺'?12:14)+'px Arial';
    c.textAlign='center'; c.textBaseline='middle'; c.fillText(label,0,-.2);
    sprites.set(label,canvas);
    return canvas;
  }
  window.drawCalciumMolecule = (context,x,y,r,label) => {
    context.drawImage(sprite(label),x-r*1.28,y-r*1.28,r*2.56,r*2.56);
  };
  const legend = {d3:'D3',calcidiol:'25',calcitriol:'C',calcium:'Ca²⁺',phosphate:'P'};
  for (const [className,label] of Object.entries(legend)) {
    const node = document.querySelector('.molecule-symbol.'+className);
    if (!node) continue;
    const img = document.createElement('img');
    img.className='molecule-volume'; img.src=sprite(label).toDataURL(); img.alt=label;
    img.width=40; img.height=40; node.replaceWith(img);
  }
})();
