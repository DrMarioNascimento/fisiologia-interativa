/* Superfície de tecido para os ciclos portáteis do Starling.
   ---------------------------------------------------------------------------
   POR QUE EXISTE. Os cinco ciclos saíam com cor chapada: nenhuma malha tinha
   textura, e sob a luz do aparelho parede, núcleo e fibra liam como plástico.
   Aqui cada família de tecido ganha três mapas procedurais — cor, relevo
   (normal) e aspereza — gerados no navegador, sem imagem externa.

   ONDE ISTO É USADO. Só na cópia que vai para GLB/USDZ (compilar-ciclos.js).
   A bancada na tela continua com os materiais aprovados de modelos.js, que
   têm hash conferido em tests/starling-migracao.test.mjs.

   TRÊS REGRAS QUE O USDZ IMPÕE:
   1. a repetição tem de estar no UV, não no material — o conversor
      (celula/tools/usdz.py) não lê KHR_texture_transform;
   2. a aspereza vai no canal G e o metal no B do MESMO mapa — por isso
      metalnessMap e roughnessMap são a mesma textura (metalness = 0);
   3. a cor do mapa é quase branca: no glTF e no USDZ ela MULTIPLICA a cor do
      material, que é a cor didática e não muda.

   DETERMINISMO. Nada de Math.random: a mesma semente gera os mesmos bytes,
   e o ciclo pode ser reconstruído e comparado.
   --------------------------------------------------------------------------- */
import * as T from 'three';

const LADO = 256;

/* Cor de material (sRGB) → família de tecido. As cores são as de modelos.js;
   glicocálix, albumina, água, gel e setas ficam lisos de propósito: são
   moléculas ou esquemas, não superfície de célula. */
const FAMILIA = {
  bc4456: 'vaso', '8566a7': 'vaso', d87588: 'vaso', '5fb7a0': 'vaso',
  dba0ab: 'endotelio', c3b4dd: 'basal', '744471': 'nucleo',
  af8eae: 'citoplasma', b897b9: 'citoplasma', aaa0ad: 'colageno', b62649: 'hemacia',
};

/* Lado de um ladrilho da textura, em metros no ambiente de RA. */
/* Medido nas fotos: com ladrilhos de 1–3 cm o desenho caía abaixo do pixel
   a meio metro e a superfície voltava a parecer lisa. */
const LADRILHO = {
  vaso: .06, endotelio: .05, basal: .04, nucleo: .03,
  citoplasma: .03, colageno: .02, hemacia: .04,
};

function gerador(semente) {
  let s = semente >>> 0;
  return () => ((s = (Math.imul(s, 1664525) + 1013904223) >>> 0) / 4294967296);
}

/* Ruído de valor periódico: o ladrilho fecha nas bordas. */
function ruido(periodo, semente) {
  const r = gerador(semente), grade = Float32Array.from({ length: periodo * periodo }, r);
  const suave = t => t * t * (3 - 2 * t);
  return (u, v) => {
    const x = u * periodo, y = v * periodo, x0 = Math.floor(x), y0 = Math.floor(y);
    const fx = suave(x - x0), fy = suave(y - y0);
    const g = (i, j) => grade[((j % periodo + periodo) % periodo) * periodo + ((i % periodo + periodo) % periodo)];
    const a = g(x0, y0) + (g(x0 + 1, y0) - g(x0, y0)) * fx;
    const b = g(x0, y0 + 1) + (g(x0 + 1, y0 + 1) - g(x0, y0 + 1)) * fx;
    return a + (b - a) * fy;
  };
}

function fbm(periodo, oitavas, semente) {
  const camadas = Array.from({ length: oitavas }, (_, k) => ruido(periodo << k, semente + 977 * k));
  return (u, v) => {
    let soma = 0, peso = .5, total = 0;
    for (const n of camadas) { soma += n(u, v) * peso; total += peso; peso *= .5; }
    return soma / total;
  };
}

/* Distância ao ponto mais próximo (Worley), periódica, com estiramento em u. */
function celulas(quantidade, semente, estiraU = 1) {
  const r = gerador(semente), pts = Array.from({ length: quantidade }, () => [r(), r()]);
  return (u, v) => {
    let d1 = 9, d2 = 9;
    for (const [px, py] of pts) {
      let dx = Math.abs(u - px), dy = Math.abs(v - py);
      dx = Math.min(dx, 1 - dx) / estiraU; dy = Math.min(dy, 1 - dy);
      const d = Math.hypot(dx, dy);
      if (d < d1) { d2 = d1; d1 = d; } else if (d < d2) d2 = d;
    }
    return [d1, d2];
  };
}

/* Cada família devolve altura (0–1), tom (≈0,75–1) e aspereza (≈0,8–1). */
const RECEITAS = {
  vaso() {
    const mancha = fbm(4, 4, 11), ruga = fbm(8, 3, 23);
    return (u, v) => {
      const r = ruga(u * .25, v); // rugas alongadas no sentido do vaso (u)
      return { h: .55 * r + .45 * mancha(u, v), tom: .7 + .3 * mancha(u, v) - .06 * r, as: .84 + .16 * r };
    };
  },
  endotelio() {
    /* Membrana com cavéolas: pequenas fossetas na face da célula, sobre uma
       ondulação larga. Sem bordas de célula desenhadas — a bancada conta seis
       núcleos por capilar e a textura não pode prometer outra contagem. */
    const onda = fbm(3, 3, 31), fosseta = celulas(90, 37);
    return (u, v) => {
      const [d] = fosseta(u, v), pit = Math.max(0, 1 - d / .028);
      return { h: .7 * onda(u, v) - .55 * pit * pit, tom: .76 + .24 * onda(u, v) - .14 * pit, as: .84 + .16 * onda(u, v) };
    };
  },
  basal() {
    // Feltro de fibras finas (lâmina densa), em várias direções.
    const a = fbm(16, 3, 41), b = fbm(16, 3, 43);
    return (u, v) => {
      const f = Math.abs(a(u, v) - b(u + .5, v + .5));
      const fio = Math.max(0, 1 - f / .06);
      return { h: .6 * fio + .4 * a(u, v), tom: .88 + .12 * fio, as: .9 + .1 * a(u, v) };
    };
  },
  nucleo() {
    /* Cromatina: grumos de heterocromatina mais escuros sobre fundo granular. */
    const grao = fbm(16, 3, 51), grumo = celulas(28, 53);
    return (u, v) => {
      /* cúpula suave, não cone: o cone do Worley facetava o núcleo como cristal */
      const [d1] = grumo(u, v), t = Math.min(1, Math.max(0, (.13 - d1) / .1));
      const massa = t * t * (3 - 2 * t);
      return { h: .6 * massa + .4 * grao(u, v), tom: .62 + .3 * (1 - massa) + .12 * grao(u, v), as: .8 + .2 * grao(u, v) };
    };
  },
  citoplasma() {
    // Citoplasma com grânulos finos e mancha suave.
    const grao = celulas(140, 61), mancha = fbm(4, 3, 67);
    return (u, v) => {
      const [d] = grao(u, v), g = Math.max(0, 1 - d / .022);
      return { h: .5 * g * g + .5 * mancha(u, v), tom: .74 + .22 * mancha(u, v) + .06 * g, as: .84 + .16 * mancha(u, v) };
    };
  },
  colageno() {
    /* Feixe de fibrilas paralelas: estrias ao longo do comprimento (u), com
       leve ondulação. O tubo leva u no comprimento e v na volta. */
    /* larguras irregulares: ruído quase só em v, esticado ao longo de u */
    const fibrila = fbm(24, 2, 71), desvio = fbm(4, 2, 73);
    return (u, v) => {
      const estria = fibrila(u * .08, v + .04 * desvio(u, v));
      return { h: estria, tom: .72 + .28 * estria, as: .86 + .14 * estria };
    };
  },
  hemacia() {
    // A membrana da hemácia é lisa: só uma variação larga de tom e brilho.
    const mancha = fbm(3, 3, 81);
    return (u, v) => ({ h: mancha(u, v), tom: .92 + .08 * mancha(u, v), as: .8 + .2 * mancha(u, v) });
  },
};

/* Força do relevo por família: o relevo é para ler o tecido, não para
   competir com a forma. */
const RELEVO = { vaso: 3.4, endotelio: 3.2, basal: 2.4, nucleo: 3.6, citoplasma: 2.8, colageno: 3, hemacia: .9 };

function tela() {
  const c = document.createElement('canvas'); c.width = c.height = LADO;
  return [c, c.getContext('2d'), new ImageData(LADO, LADO)];
}

function mapa(canvas, cor) {
  const t = new T.CanvasTexture(canvas);
  t.colorSpace = cor ? T.SRGBColorSpace : T.NoColorSpace;
  t.wrapS = t.wrapT = T.RepeatWrapping;
  t.anisotropy = 4;
  t.userData.mimeType = 'image/jpeg'; // JPEG: um terço do PNG, e o USDZ aceita
  return t;
}

const cache = new Map();
export function mapasDe(familia) {
  if (cache.has(familia)) return cache.get(familia);
  const f = RECEITAS[familia](), H = new Float32Array(LADO * LADO);
  const [cC, xC, iC] = tela(), [cN, xN, iN] = tela(), [cR, xR, iR] = tela();
  for (let y = 0; y < LADO; y++) for (let x = 0; x < LADO; x++) {
    const { h, tom, as } = f(x / LADO, y / LADO), k = y * LADO + x, p = k * 4;
    H[k] = h;
    iC.data[p] = iC.data[p + 1] = iC.data[p + 2] = Math.round(255 * Math.min(1, tom)); iC.data[p + 3] = 255;
    // G = aspereza, B = metal (zero); R e A sem uso
    iR.data[p] = 255; iR.data[p + 1] = Math.round(255 * Math.min(1, as)); iR.data[p + 2] = 0; iR.data[p + 3] = 255;
  }
  const forca = RELEVO[familia], at = (x, y) => H[((y + LADO) % LADO) * LADO + ((x + LADO) % LADO)];
  for (let y = 0; y < LADO; y++) for (let x = 0; x < LADO; x++) {
    const dx = (at(x + 1, y) - at(x - 1, y)) * forca, dy = (at(x, y + 1) - at(x, y - 1)) * forca;
    const l = Math.hypot(dx, dy, 1), p = (y * LADO + x) * 4;
    iN.data[p] = Math.round(128 - dx / l * 127); iN.data[p + 1] = Math.round(128 + dy / l * 127);
    iN.data[p + 2] = Math.round(128 + 127 / l); iN.data[p + 3] = 255;
  }
  xC.putImageData(iC, 0, 0); xN.putImageData(iN, 0, 0); xR.putImageData(iR, 0, 0);
  const m = { map: mapa(cC, true), normalMap: mapa(cN, false), roughnessMap: mapa(cR, false) };
  cache.set(familia, m);
  return m;
}

/* Marca os materiais ORIGINAIS pela cor, antes da cópia de compilar(). A
   marca viaja no userData, que Material.copy preserva. */
export function marcarTecidos(raizes) {
  for (const raiz of raizes) raiz.traverse(o => {
    if (!o.isMesh || Array.isArray(o.material)) return;
    const familia = FAMILIA[o.material.color.getHexString()];
    if (familia) o.material.userData.tecido = familia;
  });
}

/* Quantos metros cabem numa unidade de u e de v, medidos na própria malha
   (jacobiano do UV, ponderado pela área). Funciona também nas geometrias
   fundidas, onde o tipo original se perdeu. */
function metrosPorUV(geo, matriz) {
  const pos = geo.attributes.position, uv = geo.attributes.uv, idx = geo.index;
  const n = idx ? idx.count : pos.count, P = [new T.Vector3(), new T.Vector3(), new T.Vector3()];
  const e1 = new T.Vector3(), e2 = new T.Vector3(), du = new T.Vector3(), dv = new T.Vector3();
  let su = 0, sv = 0, peso = 0;
  for (let t = 0; t < n; t += 3) {
    const ids = [0, 1, 2].map(k => idx ? idx.getX(t + k) : t + k);
    ids.forEach((id, k) => P[k].fromBufferAttribute(pos, id).applyMatrix4(matriz));
    const [a, b, c] = ids;
    const d1x = uv.getX(b) - uv.getX(a), d1y = uv.getY(b) - uv.getY(a);
    const d2x = uv.getX(c) - uv.getX(a), d2y = uv.getY(c) - uv.getY(a);
    const det = d1x * d2y - d2x * d1y;
    if (Math.abs(det) < 1e-12) continue;
    e1.subVectors(P[1], P[0]); e2.subVectors(P[2], P[0]);
    du.copy(e1).multiplyScalar(d2y).addScaledVector(e2, -d1y).divideScalar(det);
    dv.copy(e2).multiplyScalar(d1x).addScaledVector(e1, -d2x).divideScalar(det);
    const area = e1.clone().cross(e2).length();
    su += du.length() * area; sv += dv.length() * area; peso += area;
  }
  return peso ? [su / peso, sv / peso] : [0, 0];
}

/* Núcleos e corpos celulares são esferas ACHATADAS, e o polo do UV esférico
   cai justo na face larga, a que se vê: o desenho convergia num redemoinho
   (visto no nível 4). Projeção plana pelo eixo mais fino, em metros: sem
   polo e sem costura; só a borda estreita estica. */
function planar(geo, matriz, L) {
  const pos = geo.attributes.position, uv = geo.attributes.uv, p = new T.Vector3();
  const caixa = new T.Box3();
  for (let i = 0; i < pos.count; i++) caixa.expandByPoint(p.fromBufferAttribute(pos, i).applyMatrix4(matriz));
  const tam = caixa.getSize(new T.Vector3()).toArray();
  const fino = tam.indexOf(Math.min(...tam)), [a, b] = [0, 1, 2].filter(k => k !== fino);
  for (let i = 0; i < pos.count; i++) {
    const q = p.fromBufferAttribute(pos, i).applyMatrix4(matriz).toArray();
    uv.setXY(i, q[a] / L, q[b] / L);
  }
}

/* Aplica os mapas na cópia exportada. A repetição é inteira nos dois eixos:
   tubo e esfera fecham o UV na volta, e ladrilho fracionário abriria costura. */
export function texturizar(raiz) {
  raiz.updateMatrixWorld(true);
  const conta = { malhas: 0, familias: {} };
  raiz.traverse(o => {
    if (!o.isMesh || Array.isArray(o.material)) return;
    const familia = o.material.userData.tecido;
    if (!familia) return;
    delete o.material.userData.tecido;
    const geo = o.geometry;
    if (!geo.attributes.uv) return;
    const L = LADRILHO[familia], uv = geo.attributes.uv;
    if (geo.type === 'SphereGeometry') planar(geo, o.matrixWorld, L);
    else {
      const [mu, mv] = metrosPorUV(geo, o.matrixWorld);
      const ru = Math.max(1, Math.round(mu / L)), rv = Math.max(1, Math.round(mv / L));
      for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * ru, uv.getY(i) * rv);
    }
    uv.needsUpdate = true;
    const m = mapasDe(familia);
    Object.assign(o.material, { map: m.map, normalMap: m.normalMap, roughnessMap: m.roughnessMap, metalnessMap: m.roughnessMap, metalness: 0 });
    o.material.roughness = Math.min(1, o.material.roughness + .12); // o mapa escurece a aspereza média
    o.material.needsUpdate = true;
    conta.malhas++; conta.familias[familia] = (conta.familias[familia] || 0) + 1;
  });
  return conta;
}
