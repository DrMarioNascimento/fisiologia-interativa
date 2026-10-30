"""Movimento no iPhone: troca as deformações por esqueleto (skinning) no USDZ.

Por que existe: o AR Quick Look do iPhone reproduz trilhas de transformação
(translate/orient/scale) e animação de esqueleto, mas NÃO reproduz as
deformações gravadas como UsdSkelBlendShape. A Célula viva só usa
transformações e se move; o Coração (externo e interno) só usava blend
shapes e ficava parado. O mesmo acontecia, total ou parcialmente, no Retorno
venoso (válvulas), na Pleura (ciclo respiratório), no Osso vivo e no Starling.

O que faz, em cada USDZ que ainda tenha blend shapes:
  1. Calcula, instante a instante, a posição de cada vértice exatamente como
     o blend shape a descreve (os mesmos instantes e pesos do arquivo).
  2. Espalha "articulações" sobre a peça (mais onde ela se move) e dá a cada
     vértice o peso das 4 articulações mais próximas (pesos suaves).
  3. Resolve, por mínimos quadrados, o deslocamento de cada articulação em
     cada instante, de modo que o skinning reproduza a deformação original.
  4. Remove os blend shapes, grava o esqueleto (SkelRoot por peça) e confere
     o resultado com o próprio UsdSkel (não com a nossa conta), comparando com
     as posições originais. Se o erro passar do limite, aumenta as
     articulações e tenta de novo.

O GLB (Android e prévia na página) não muda: ali os morph targets funcionam.
Uso: python ra/scripts/esqueleto-ios.py [arquivos.usdz ...]  (sem argumentos:
todos os ciclos de ra/*/ciclos e da célula).
"""
import sys, json, struct, zipfile, tempfile, shutil
from pathlib import Path
import numpy as np
from pxr import Usd, UsdGeom, UsdSkel, Sdf, Gf, Vt

RA = Path(__file__).resolve().parents[1]
INFLUENCIAS = 4
# Teto de articulações por peça. A Vista Interna (até 64) se moveu no iPhone e a
# Externa (128) não: o Quick Look não toca esqueletos grandes. Manter <= 64.
MAX_ARTICULACOES = 64
LIMITE_MAX_REL = 0.12       # erro máximo <= 12 % da excursão da peça
LIMITE_P99_REL = 0.05       # e 99 % dos vértices <= 5 %


def pontos_por_instante(stage, anim, meshes):
    """Posições originais (blend shape) de cada malha em cada instante."""
    nomes = list(anim.GetBlendShapesAttr().Get() or [])
    attr = anim.GetBlendShapeWeightsAttr()
    tempos = list(attr.GetTimeSamples()) or [Usd.TimeCode.Default()]
    resultado = []
    for mesh in meshes:
        b = UsdSkel.BindingAPI(mesh.GetPrim())
        alvo = list(b.GetBlendShapesAttr().Get() or [])
        caminhos = b.GetBlendShapeTargetsRel().GetTargets()
        P0 = np.array(mesh.GetPointsAttr().Get(), dtype=np.float64)
        formas = []
        for nome, caminho in zip(alvo, caminhos):
            bs = UsdSkel.BlendShape(stage.GetPrimAtPath(caminho))
            off = np.array(bs.GetOffsetsAttr().Get(), dtype=np.float64)
            idx = bs.GetPointIndicesAttr().Get()
            O = np.zeros_like(P0)
            if idx is None or len(idx) == 0:
                O[:] = off
            else:
                O[np.array(idx)] = off
            formas.append((nomes.index(nome) if nome in nomes else None, O))
        quadros = []
        for t in tempos:
            w = np.array(attr.Get(t), dtype=np.float64)
            P = P0.copy()
            for k, O in formas:
                if k is not None and k < len(w):
                    P += w[k] * O
            quadros.append(P)
        resultado.append((P0, np.stack(quadros)))
    return tempos, resultado


def _pesos_convexos(D, T, cand):
    """Pesos >= 0 que somam 1, por vértice, entre as articulações candidatas."""
    B = T[cand]
    K = cand.shape[1]; V = len(D)
    G = np.einsum('vkm,vlm->vkl', B, B) + 1e-12 * np.eye(K)
    h = np.einsum('vkm,vm->vk', B, D)
    A = np.zeros((V, K + 1, K + 1)); A[:, :K, :K] = G; A[:, :K, K] = 1; A[:, K, :K] = 1
    rhs = np.concatenate([h, np.ones((V, 1))], 1)
    w = np.linalg.solve(A, rhs[..., None])[..., 0][:, :K]
    passo = 0.5 / np.maximum(np.einsum('vkk->vk', G).max(1, keepdims=True), 1e-12)
    for _ in range(8):
        w = np.maximum(w, 0); s = w.sum(1, keepdims=True); w = np.where(s > 0, w / np.maximum(s, 1e-12), 1.0 / K)
        g = np.einsum('vkl,vl->vk', G, w) - h
        w = w - passo * g
    w = np.maximum(w, 0); s = w.sum(1, keepdims=True)
    return np.where(s > 0, w / np.maximum(s, 1e-12), 1.0 / K)


def ajustar(P0s, Fs, J, rng):
    """Decomposição em articulações (SSDR simplificado, só translação).

    A forma média do ciclo vira a pose de repouso; cada vértice segue a
    combinação convexa de até 4 trajetórias de articulação. As articulações
    são agrupadas pela TRAJETÓRIA dos vértices (e um pouco pela posição),
    para que estruturas vizinhas que se movem diferente não se misturem.
    """
    F = np.concatenate(Fs, axis=1)            # (T, V, 3)
    Tn, V, _ = F.shape
    Pm = F.mean(0)
    D = (F - Pm[None]).transpose(1, 0, 2).reshape(V, Tn * 3)
    excursao = float(np.linalg.norm(F - Pm[None], axis=2).max()) if V else 0.0
    J = max(1, min(J, V))
    escala = np.linalg.norm(D, axis=1).max() + 1e-12
    tamanho = np.linalg.norm(Pm.max(0) - Pm.min(0)) + 1e-12
    feat = np.concatenate([D / escala, (Pm - Pm.mean(0)) / tamanho], 1)
    n = min(V, 8000)
    sub = feat[rng.choice(V, n, replace=False)] if V > n else feat
    C = [sub[0]]; d = ((sub - C[0]) ** 2).sum(1)
    for _ in range(1, J):
        C.append(sub[int(d.argmax())]); d = np.minimum(d, ((sub - C[-1]) ** 2).sum(1))
    C = np.array(C)
    for _ in range(12):
        lab = ((sub[:, None] - C[None]) ** 2).sum(2).argmin(1)
        for j in range(J):
            s = sub[lab == j]
            if len(s):
                C[j] = s.mean(0)
    K = min(INFLUENCIAS, J)
    cand = np.argsort(((feat[:, None] - C[None]) ** 2).sum(2), 1)[:, :K].astype(np.int32)
    lab = cand[:, 0]
    T = np.stack([D[lab == j].mean(0) if (lab == j).any() else np.zeros(Tn * 3) for j in range(J)])
    for _ in range(6):
        w = _pesos_convexos(D, T, cand)
        W = np.zeros((V, J)); np.put_along_axis(W, cand, w, 1)
        T = np.linalg.solve(W.T @ W + 1e-9 * np.eye(J), W.T @ D)
    w = _pesos_convexos(D, T, cand)
    W = np.zeros((V, J)); np.put_along_axis(W, cand, w, 1)
    erro_v = np.linalg.norm((W @ T - D).reshape(V, Tn, 3), axis=2).max(1)
    # Centro de cada articulação: média ponderada dos vértices que ela move.
    massa = W.sum(0)
    centros = (W.T @ Pm) / np.maximum(massa, 1e-12)[:, None]
    centros[massa < 1e-9] = Pm.mean(0)
    desloc = T.reshape(J, Tn, 3).transpose(1, 0, 2)
    if K < INFLUENCIAS:
        cand = np.concatenate([cand, np.zeros((V, INFLUENCIAS - K), np.int32)], 1)
        w = np.concatenate([w, np.zeros((V, INFLUENCIAS - K))], 1)
    return Pm, centros, cand, w, desloc, erro_v, excursao


def converter_no(stage, anim_prim, rng, relatorio):
    no = anim_prim.GetParent()
    anim = UsdSkel.Animation(anim_prim)
    skel_prim = no.GetChild('Skeleton')
    meshes = []
    for c in no.GetChildren():
        if c.IsA(UsdGeom.Mesh):
            rel = UsdSkel.BindingAPI(c).GetAnimationSourceRel().GetTargets()
            if anim_prim.GetPath() in rel:
                meshes.append(UsdGeom.Mesh(c))
    tempos, dados = pontos_por_instante(stage, anim, meshes)
    P0s = [d[0] for d in dados]; Fs = [d[1] for d in dados]
    V = sum(len(p) for p in P0s)
    J = 32
    while True:
        # Semente fixa por peça: peças gêmeas (frente e avesso) saem idênticas.
        Pm, C, idx, w, desloc, erro_v, exc = ajustar(P0s, Fs, J, np.random.default_rng(20261030))
        erro = float(erro_v.max()); p99 = float(np.percentile(erro_v, 99))
        ok = erro <= max(1e-9, LIMITE_MAX_REL * exc) and p99 <= LIMITE_P99_REL * exc
        if ok or J >= MAX_ARTICULACOES or J >= V:
            break
        J = min(J * 2, MAX_ARTICULACOES, V)
    J = len(C)
    # Esqueleto: raiz parada + J articulações filhas, só com translação.
    juntas = ['root'] + [f'root/j{j}' for j in range(J)]
    skel = UsdSkel.Skeleton(skel_prim)
    skel.GetJointsAttr().Set(Vt.TokenArray(juntas))
    bind = [Gf.Matrix4d(1)] + [Gf.Matrix4d(1).SetTranslate(Gf.Vec3d(*map(float, c))) for c in C]
    skel.GetBindTransformsAttr().Set(Vt.Matrix4dArray(bind))
    skel.GetRestTransformsAttr().Set(Vt.Matrix4dArray(bind))

    # Animação: troca pesos de blend shape por translações das articulações.
    for nome in ('blendShapes', 'blendShapeWeights'):
        a = anim_prim.GetAttribute(nome)
        if a:
            anim_prim.RemoveProperty(nome)
    anim.GetJointsAttr().Set(Vt.TokenArray(juntas))
    anim.GetRotationsAttr().Set(Vt.QuatfArray([Gf.Quatf(1)] * len(juntas)))
    anim.GetScalesAttr().Set(Vt.Vec3hArray([Gf.Vec3h(1, 1, 1)] * len(juntas)))
    tr = anim.GetTranslationsAttr()
    tr.Clear()
    for t, d in zip(tempos, desloc):
        vals = np.vstack([np.zeros((1, 3)), C + d]).astype(np.float32)
        tr.Set(Vt.Vec3fArray.FromNumpy(vals), t)

    # Malhas: pesos por vértice e fim dos blend shapes.
    ini = 0
    for mesh, P0, F in zip(meshes, P0s, Fs):
        n = len(P0)
        m_idx = idx[ini:ini + n] + 1; m_w = w[ini:ini + n]; base = Pm[ini:ini + n]; ini += n
        prim = mesh.GetPrim()
        b = UsdSkel.BindingAPI(prim)
        for c in list(prim.GetChildren()):
            if c.IsA(UsdSkel.BlendShape):
                stage.RemovePrim(c.GetPath())
        for nome in ('skel:blendShapes', 'skel:blendShapeTargets'):
            if prim.GetProperty(nome):
                prim.RemoveProperty(nome)
        pv = UsdGeom.PrimvarsAPI(prim)
        for nome in ('skel:jointIndices', 'skel:jointWeights'):
            if pv.HasPrimvar(nome):
                pv.RemovePrimvar(nome)
        b.CreateJointIndicesPrimvar(False, INFLUENCIAS).Set(Vt.IntArray.FromNumpy(m_idx.reshape(-1).astype(np.int32)))
        b.CreateJointWeightsPrimvar(False, INFLUENCIAS).Set(Vt.FloatArray.FromNumpy(m_w.reshape(-1).astype(np.float32)))
        b.CreateGeomBindTransformAttr(Gf.Matrix4d(1))
        mesh.GetPointsAttr().Set(Vt.Vec3fArray.FromNumpy(base.astype(np.float32)))
        lo = F.min((0, 1)); hi = F.max((0, 1))
        mesh.GetExtentAttr().Set(Vt.Vec3fArray([Gf.Vec3f(*map(float, lo)), Gf.Vec3f(*map(float, hi))]))

    no.SetTypeName('SkelRoot')
    relatorio.append({'peca': no.GetName(), 'vertices': V, 'articulacoes': J,
                      'excursao': round(exc, 6), 'erroMaxRel': round(erro / max(exc, 1e-12), 4), 'erroP99Rel': round(p99 / max(exc, 1e-12), 4),
                      '_meshes': [str(m.GetPath()) for m in meshes], '_alvos': Fs, '_tempos': tempos})


def conferir(stage, relatorio):
    """Confere com o UsdSkel (o mesmo esquema que o iPhone lê) o skinning gravado."""
    cache = UsdSkel.Cache()
    piores = []
    for r in relatorio:
        no = stage.GetPrimAtPath(Sdf.Path(r['_meshes'][0])).GetParent()
        raiz = UsdSkel.Root(no)
        cache.Populate(raiz, Usd.PrimDefaultPredicate)
        binds = cache.ComputeSkelBindings(raiz, Usd.PrimDefaultPredicate)
        pior = 0.0
        for bnd in binds:
            sq = cache.GetSkelQuery(bnd.GetSkeleton())
            for sk in bnd.GetSkinningTargets():
                caminho = str(sk.GetPrim().GetPath())
                k = r['_meshes'].index(caminho)
                for ti, t in enumerate(r['_tempos']):
                    xf = sq.ComputeSkinningTransforms(t)
                    pts = Vt.Vec3fArray(UsdGeom.Mesh(sk.GetPrim()).GetPointsAttr().Get())
                    sk.ComputeSkinnedPoints(xf, pts, t)
                    pior = max(pior, float(np.linalg.norm(np.array(pts) - r['_alvos'][k][ti], axis=1).max()))
        if not binds:
            raise RuntimeError('sem vínculo de esqueleto em ' + str(no.GetPath()))
        r['erroConferido'] = round(pior, 6); r['erroConferidoRel'] = round(pior / max(r['excursao'], 1e-12), 4)
        piores.append(r['erroConferidoRel'])
    return max(piores) if piores else 0.0


def empacotar(pasta, destino):
    arquivos = [pasta / 'celula.usdc'] + sorted((pasta / 'textures').iterdir()) if (pasta / 'textures').exists() else [pasta / 'celula.usdc']
    with zipfile.ZipFile(destino, 'w', compression=zipfile.ZIP_STORED) as z:
        for f in arquivos:
            nome = f.relative_to(pasta).as_posix(); info = zipfile.ZipInfo(nome)
            pad = (-(z.fp.tell() + 30 + len(nome.encode()) + 4)) % 64
            info.extra = struct.pack('<HH', 0x1986, pad) + b'\0' * pad
            z.writestr(info, f.read_bytes())


def processar(usdz: Path):
    with zipfile.ZipFile(usdz) as z:
        nomes = z.namelist()
        if not any(n.endswith('.usdc') for n in nomes):
            return None
        tmp = Path(tempfile.mkdtemp(prefix='esqueleto-'))
        z.extractall(tmp)
    try:
        principal = next(n for n in nomes if n.endswith('.usdc'))
        if principal != 'celula.usdc':
            (tmp / principal).rename(tmp / 'celula.usdc')
        stage = Usd.Stage.Open(str(tmp / 'celula.usdc'))
        anims = [p for p in stage.Traverse() if p.IsA(UsdSkel.Animation) and p.GetAttribute('blendShapeWeights') and p.GetAttribute('blendShapeWeights').GetNumTimeSamples() > 0]
        if not anims:
            return None
        rng = np.random.default_rng(20261030)
        relatorio = []
        for a in anims:
            converter_no(stage, a, rng, relatorio)
        raiz = stage.GetDefaultPrim()
        if raiz.GetTypeName() == 'SkelRoot':
            raiz.SetTypeName('Xform')  # SkelRoot não pode conter SkelRoot
        pior = conferir(stage, relatorio)
        # Sem nenhum blend shape restante.
        assert not any(p.IsA(UsdSkel.BlendShape) for p in stage.Traverse())
        stage.GetRootLayer().Save()
        empacotar(tmp, usdz)
        chk = Usd.Stage.Open(str(usdz)); assert chk
        for r in relatorio:
            for k in ('_meshes', '_alvos', '_tempos'):
                r.pop(k)
        val = usdz.with_suffix('.validation.json')
        rep = json.loads(val.read_text()) if val.exists() else {}
        rep['deformation'] = 'UsdSkel joints (skinning)'
        rep['iphone'] = {'motivo': 'AR Quick Look não reproduz UsdSkelBlendShape; o movimento foi passado para articulações.',
                         'pecas': len(relatorio), 'erroConferidoMaxRel': round(pior, 4), 'porPeca': relatorio}
        val.write_text(json.dumps(rep, indent=2, ensure_ascii=False))
        return len(relatorio), pior, sum(r['articulacoes'] for r in relatorio)
    finally:
        shutil.rmtree(tmp, ignore_errors=True)


if __name__ == '__main__':
    alvos = [Path(a) for a in sys.argv[1:]] or sorted(list(RA.glob('*/ciclos/*.usdz')) + list(RA.glob('celula/**/*.usdz')))
    for f in alvos:
        r = processar(f)
        if r:
            print(f'{f.relative_to(RA) if f.is_relative_to(RA) else f}: {r[0]} peças, {r[2]} articulações, pior erro conferido {r[1]*100:.1f} % da excursão')
