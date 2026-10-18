import { BASELINE_STATE, DEFAULT_PARAMS, plasmaOsm, waterFlows } from './model.js?v=20261018-audit2';


                   
         
         
         
        
            
        
         
         
          
              
                
                 
          
        
         
           
             
           
          
         
        
          
              
         
          
        
         
          
           
            
         
                  
              
                 
          

                                        

                                                   

                      
               
               
              
              
               
                  
                                     
 

export const LAB_DEFS                        = {
  trh: { label: 'TRH (hipotálamo)', short: 'TRH', unit: '× basal', low: 0.5, high: 2, decimals: 2, kind: 'relativo' },
  tsh: { label: 'TSH', short: 'TSH', unit: 'mUI/L', low: 0.4, high: 4.5, decimals: 2, kind: 'lab' },
  ft4: { label: 'T4 livre', short: 'T4L', unit: 'ng/dL', low: 0.8, high: 1.8, decimals: 2, kind: 'lab' },
  t3: { label: 'T3 total', short: 'T3', unit: 'ng/dL', low: 80, high: 180, decimals: 0, kind: 'lab' },
  goiter: { label: 'Volume da tireoide', short: 'Vol.', unit: 'mL', low: 6, high: 18, decimals: 1, kind: 'efeito' },
  hr: { label: 'Frequência cardíaca', short: 'FC', unit: 'bpm', low: 60, high: 100, decimals: 0, kind: 'efeito' },
  bmr: { label: 'Taxa metabólica basal', short: 'TMB', unit: '%', low: 85, high: 115, decimals: 0, kind: 'efeito' },

  crh: { label: 'CRH (hipotálamo)', short: 'CRH', unit: '× basal', low: 0.5, high: 2, decimals: 2, kind: 'relativo' },
  acth: { label: 'ACTH', short: 'ACTH', unit: 'pg/mL', low: 10, high: 60, decimals: 0, kind: 'lab' },
  cortisol: { label: 'Cortisol sérico (endógeno)', short: 'Cortisol', unit: 'µg/dL', low: 5, high: 23, decimals: 1, kind: 'lab' },
  gcActivity: { label: 'Atividade glicocorticoide total', short: 'Efeito GC', unit: '%', low: 50, high: 180, decimals: 0, kind: 'efeito' },
  adrenalMass: { label: 'Massa do córtex adrenal', short: 'Adrenal', unit: '%', low: 70, high: 140, decimals: 0, kind: 'efeito' },

  gnrh: { label: 'GnRH (hipotálamo)', short: 'GnRH', unit: '× basal', low: 0.5, high: 2, decimals: 2, kind: 'relativo' },
  lh: { label: 'LH', short: 'LH', unit: 'UI/L', low: 1.7, high: 8.6, decimals: 1, kind: 'lab' },
  fsh: { label: 'FSH', short: 'FSH', unit: 'UI/L', low: 1.5, high: 12.4, decimals: 1, kind: 'lab' },
  testo: { label: 'Testosterona total', short: 'Testo', unit: 'ng/dL', low: 300, high: 1000, decimals: 0, kind: 'lab' },
  inhibin: { label: 'Inibina B', short: 'Inibina', unit: 'pg/mL', low: 80, high: 300, decimals: 0, kind: 'lab' },
  gnrhR: { label: 'Receptores de GnRH', short: 'GnRH-R', unit: '%', low: 60, high: 140, decimals: 0, kind: 'efeito' },

  ghrh: { label: 'GHRH (hipotálamo)', short: 'GHRH', unit: '× basal', low: 0.5, high: 2, decimals: 2, kind: 'relativo' },
  sst: { label: 'Somatostatina', short: 'SST', unit: '× basal', low: 0.5, high: 2, decimals: 2, kind: 'relativo' },
  gh: { label: 'GH basal', short: 'GH', unit: 'ng/mL', low: 0.1, high: 3, decimals: 2, kind: 'lab' },
  igf1: { label: 'IGF-1', short: 'IGF-1', unit: 'ng/mL', low: 115, high: 350, decimals: 0, kind: 'lab' },

  dopamine: { label: 'Dopamina portal', short: 'DA', unit: '× basal', low: 0.5, high: 2, decimals: 2, kind: 'relativo' },
  prl: { label: 'Prolactina', short: 'PRL', unit: 'ng/mL', low: 4, high: 23, decimals: 1, kind: 'lab' },

  posm: { label: 'Osmolalidade plasmática', short: 'Posm', unit: 'mOsm/kg', low: 275, high: 295, decimals: 0, kind: 'lab' },
  na: { label: 'Sódio sérico', short: 'Na⁺', unit: 'mEq/L', low: 135, high: 145, decimals: 0, kind: 'lab' },
  adh: { label: 'ADH (vasopressina)', short: 'ADH', unit: 'pg/mL', low: 0.5, high: 5, decimals: 1, kind: 'lab' },
  uosm: { label: 'Osmolalidade urinária', short: 'Uosm', unit: 'mOsm/kg', low: 300, high: 900, decimals: 0, kind: 'lab' },
  urine: { label: 'Diurese', short: 'Diurese', unit: 'L/dia', low: 0.8, high: 2.5, decimals: 1, kind: 'efeito' },
  intake: { label: 'Ingestão hídrica', short: 'Ingestão', unit: 'L/dia', low: 1, high: 3, decimals: 1, kind: 'efeito' },
  tbw: { label: 'Água corporal total', short: 'ACT', unit: 'L', low: 39, high: 45, decimals: 1, kind: 'efeito' },
  waterBalance: { label: 'Balanço hídrico (inclui perdas insensíveis)', short: 'Balanço', unit: 'L/dia', decimals: 2, kind: 'efeito' },
  oxytocin: { label: 'Ocitocina (atividade relativa)', short: 'OT', unit: '× basal', decimals: 2, kind: 'relativo' },
  contraction: { label: 'Contração uterina', short: 'Útero', unit: '%', decimals: 0, kind: 'efeito' },
  milk: { label: 'Potencial de ejeção (ativação mioepitelial)', short: 'Ejeção', unit: '%', decimals: 0, kind: 'efeito' },
}

export function computeLabs(s          , p        )       {
  const { urine, intake, balance } = waterFlows(s, p)
  const posm = plasmaOsm(s)
  return {
    trh: s.trh,
    tsh: s.tsh * 2,
    ft4: s.t4 * 1.25,
    t3: s.t3 * 120,
    goiter: s.goiter * 12,
    hr: 72 * Math.max(s.t3, 0.02) ** 0.35,
    bmr: 100 * Math.max(s.t3, 0.02) ** 0.5,

    crh: s.crh,
    acth: s.acth * 25,
    cortisol: s.cortisolEndo * 12,
    gcActivity: (s.cortisolEndo + p.exoGlucocorticoid) * 100,
    adrenalMass: s.adrenalMass * 100,

    gnrh: s.gnrh,
    lh: s.lh * 5,
    fsh: s.fsh * 5,
    testo: (s.testoEndo + p.exoTestosterone) * 550,
    inhibin: s.inhibin * 180,
    gnrhR: s.gnrhR * 100,

    ghrh: s.ghrh,
    sst: s.sst,
    gh: s.gh * 1,
    igf1: s.igf1 * 200,

    dopamine: s.dopamine,
    prl: s.prl * 12,

    posm,
    // Illustrative relation Posm ≈ 2 × Na + 10: glucose/urea held constant.
    na: (posm - 10) / 2,
    adh: s.adh,
    uosm: s.uosm,
    urine,
    intake,
    tbw: s.tbw,
    waterBalance: balance,
    oxytocin: s.oxytocin,
    contraction: s.contraction * 100,
    // Relative target activation, not milk volume. It follows circulating OT,
    // including the decay after suckling stops; milk availability is not modeled.
    milk: Math.min(1, Math.max(0, s.oxytocin - 1) / 5) * 100,
  }
}

export const BASELINE_LABS = computeLabs(BASELINE_STATE, DEFAULT_PARAMS)

export function labStatus(id       , value        )            {
  const def = LAB_DEFS[id]
  if (def.low !== undefined && value < def.low) return 'baixo'
  if (def.high !== undefined && value > def.high) return 'alto'
  return 'normal'
}

export function formatLab(id       , value        ) {
  const { decimals } = LAB_DEFS[id]
  return value.toLocaleString('pt-BR', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })
}

