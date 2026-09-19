/* Dados da página inicial — Fisioterapia (usada em fisioterapia/index.html; caminhos relativos a essa pasta). */
window.FI_DADOS = {
 "curso": "fi",
 "cursoNome": "Fisioterapia",
 "tutor": "../tutor-fisio.html",
 "unidades": [
  {
   "id": "celular",
   "num": "01",
   "nome": "Fisiologia celular, transporte de substâncias e potenciais de ação",
   "curto": "Celular",
   "desc": "Membrana plasmática, gradientes eletroquímicos, transporte ativo e geração de sinais elétricos.",
   "cel": "célula com canais e bomba Na⁺/K⁺",
   "mapas": [
    {
     "t": "Organização funcional e membranas",
     "src": "../assets/maps/organizacao-funcional-membranas.webp"
    }
   ],
   "sims": [
    {
     "t": "Osmose e equilíbrio hidroeletrolítico",
     "cat": "Fisiologia celular",
     "obj": "Comparar tonicidade, osmolaridade e distribuição de água entre LIC e LEC.",
     "href": "../osmose-equilibrio-hidroeletrolitico.html?percurso=fisioterapia"
    },
    {
     "t": "Homeostase integrada tricompartimentada",
     "cat": "Fisiologia celular",
     "obj": "Relacionar plasma, líquido intersticial e LIC em um modelo integrado de transporte e distribuição de água.",
     "href": "../homeostase-integrada-tricompartimental.html?percurso=fisioterapia"
    },
    {
     "t": "Potencial de ação na membrana",
     "cat": "Fisiologia celular",
     "obj": "Acompanhar em sete etapas as mudanças de permeabilidade, os fluxos de Na⁺ e K⁺ e a variação do potencial de membrana.",
     "href": "../potencial-acao-membrana.html?percurso=fisioterapia"
    },
    {
     "t": "Potencial de ação do neurônio",
     "cat": "Fisiologia celular",
     "obj": "Visualizar o impulso nervoso, a membrana ampliada e a abertura sequencial dos canais dependentes de voltagem.",
     "href": "../neuronio-interativo.html?percurso=fisioterapia"
    },
    {
     "t": "Transporte ativo secundário — SGLT",
     "cat": "Transporte",
     "obj": "Relacionar o gradiente de Na⁺, a Na⁺/K⁺ ATPase e o cotransporte de glicose através da membrana.",
     "href": "../transporte-ativo-secundario-sglt.html?percurso=fisioterapia"
    },
    {
     "t": "Potencial de ação cardíaco",
     "cat": "Fisiologia celular",
     "obj": "Reconhecer as fases do potencial de ação do cardiomiócito e relacioná-las aos fluxos iônicos e ao período refratário.",
     "href": "../potencial-acao-cardiaco.html?percurso=fisioterapia"
    }
   ],
   "sala": {
    "nome": "A Célula Sitiada",
    "img": "../assets/salas/celular.webp",
    "grande": "../assets/salas/grande/celular.webp",
    "href": "https://drmarionascimento.github.io/fisiologia-em-fuga/#/escape/fisio/celular?origem=site"
   }
  },
  {
   "id": "muscular",
   "num": "02",
   "nome": "Excitabilidade e Sistema Muscular",
   "curto": "Muscular",
   "desc": "Da excitabilidade e condução à placa motora, ao sarcômero, à força, ao controle motor e aos tipos de contração.",
   "cel": "fibra muscular esquelética",
   "mapas": [
    {
     "t": "Excitabilidade e sistema muscular",
     "src": "../assets/maps/excitabilidade-sistema-muscular.webp"
    }
   ],
   "sims": [
    {
     "t": "Contração muscular esquelética",
     "cat": "Músculo",
     "obj": "Acompanhar do potencial de ação ao relaxamento: ACh, placa motora, Ca²⁺, pontes cruzadas, ATP e sarcômero.",
     "href": "../contracao-muscular-esqueletica.html?percurso=fisioterapia"
    },
    {
     "t": "Acoplamento excitação–contração",
     "cat": "Placa motora",
     "obj": "Conectar a chegada do impulso nervoso à liberação de Ca²⁺ e à exposição dos sítios de ligação da actina.",
     "href": "../acoplamento-excitacao-contracao.html?percurso=fisioterapia"
    },
    {
     "t": "Contração muscular e sarcômero",
     "cat": "Músculo",
     "obj": "Relacionar a organização do músculo aos filamentos com as etapas de Ca²⁺, pontes cruzadas e retorno.",
     "href": "../contracao-muscular-sarcomero.html?percurso=fisioterapia"
    },
    {
     "t": "Contrações musculares interativas",
     "cat": "Músculo",
     "obj": "Comparar contrações estática, dinâmica e isocinética, relacionando carga, movimento e produção de força.",
     "href": "../contracoes-musculares-interativas.html?percurso=fisioterapia"
    },
    {
     "t": "Hill × Isocinético",
     "cat": "Músculo",
     "obj": "Integrar força, velocidade, ativação neural, torque e potência em diferentes condições de contração.",
     "href": "../modelos-hill-isocinetico.html?percurso=fisioterapia"
    },
    {
     "t": "Recrutamento de unidades motoras",
     "cat": "Músculo",
     "obj": "Relacionar recrutamento progressivo, frequência de disparo e tipos de fibras ao desenvolvimento da força muscular.",
     "href": "../recrutamento-unidades-motoras.html?percurso=fisioterapia"
    },
    {
     "t": "Da intenção ao movimento",
     "cat": "Músculo",
     "obj": "Integrar drive motivacional e atenção, giro do cíngulo, relé talâmico, vias motoras, recrutamento, frequência de disparo e acoplamento excitação–contração.",
     "href": "../da-intencao-ao-movimento.html?percurso=fisioterapia",
     "deep": "módulo de aprofundamento",
     "leitura": "../assets/leituras/da-intencao-ao-movimento-guia-visual.pdf?v=20260821"
    }
   ],
   "sala": {
    "nome": "O Músculo em Silêncio",
    "img": "../assets/salas/muscular.webp",
    "grande": "../assets/salas/grande/muscular.webp",
    "href": "https://drmarionascimento.github.io/fisiologia-em-fuga/#/escape/fisio/muscular?origem=site"
   }
  },
  {
   "id": "cardiovascular",
   "num": "03",
   "nome": "Sistema cardiovascular",
   "curto": "Cardiovascular",
   "desc": "Sangue, circulação, hemodinâmica, microcirculação, controle da pressão arterial e adaptações cardiovasculares.",
   "cel": "cardiomiócito",
   "mapas": [
    {
     "t": "Sangue",
     "src": "../assets/maps/cardiovascular-01-sangue.webp"
    },
    {
     "t": "Circulação e hemodinâmica",
     "src": "../assets/maps/cardiovascular-02-circulacao-hemodinamica.webp"
    },
    {
     "t": "Regulação e adaptações",
     "src": "../assets/maps/cardiovascular-03-regulacao-adaptacoes.webp"
    }
   ],
   "sims": [
    {
     "t": "Pressão arterial, DC e RPT",
     "cat": "Cardiovascular",
     "obj": "Relacionar pressão arterial, débito cardíaco, resistência periférica total, PAM e pressão de pulso.",
     "href": "../hemodinamica-pa-dc-rpt.html?percurso=fisioterapia"
    },
    {
     "t": "Retorno venoso",
     "cat": "Cardiovascular",
     "obj": "Compreender como pressão atrial direita, volume, tônus, complacência, resistência e bombas periféricas determinam o retorno venoso.",
     "href": "../retorno-venoso.html?percurso=fisioterapia"
    },
    {
     "t": "Loop cardíaco funcional",
     "cat": "Cardiovascular",
     "obj": "Relacionar volumes diastólico e sistólico finais, volume sistólico, fração de ejeção e débito cardíaco.",
     "href": "../loop-cardiaco-funcional.html?percurso=fisioterapia"
    },
    {
     "t": "Lei de Poiseuille",
     "cat": "Cardiovascular",
     "obj": "Relacionar fluxo, gradiente de pressão, raio, viscosidade e comprimento do vaso.",
     "href": "../lei-de-poiseuille.html?percurso=fisioterapia"
    },
    {
     "t": "Sangue",
     "cat": "Cardiovascular",
     "obj": "Integrar hematopoiese, transporte de oxigênio, viscosidade, débito cardíaco e respostas fisiológicas em cenários clínicos e de exercício.",
     "href": "../sangue.html?percurso=fisioterapia",
     "deep": "módulo de aprofundamento",
     "leitura": "../assets/leituras/Sangue_Guia_Visual_Prof_Mario_Nascimento.pdf?v=20260823"
    }
   ],
   "sala": {
    "nome": "O Desafio da Mudança Postural",
    "img": "../assets/salas/cardiovascular.webp",
    "grande": "../assets/salas/grande/cardiovascular.webp",
    "href": "https://drmarionascimento.github.io/fisiologia-em-fuga/#/escape/fisio/cardiovascular?origem=site"
   }
  },
  {
   "id": "respiratorio",
   "num": "04",
   "nome": "Sistema respiratório",
   "curto": "Respiratório",
   "desc": "Estrutura e mecânica ventilatória, trocas gasosas, controle da ventilação e biofeedback respiratório.",
   "cel": "alvéolo e pneumócitos",
   "mapas": [
    {
     "t": "Estrutura, mecânica e ventilação",
     "src": "../assets/maps/respiratorio-01-estrutura-mecanica-ventilacao.webp"
    },
    {
     "t": "Trocas gasosas e controle",
     "src": "../assets/maps/respiratorio-02-trocas-gasosas-controle.webp"
    },
    {
     "t": "Biofeedback respiratório",
     "src": "../assets/maps/respiratorio-03-biofeedback.webp"
    }
   ],
   "sims": [
    {
     "t": "Mecânica ventilatória",
     "cat": "Respiratório",
     "obj": "Visualizar as relações entre pressão pleural, pressão alveolar, volume, complacência, resistência e ventilação minuto.",
     "href": "../ventilacao-pulmonar.html?percurso=fisioterapia"
    },
    {
     "t": "Biofeedback respiratório — PC",
     "cat": "Respiratório",
     "obj": "Guiar ciclos respiratórios no computador com tempos ajustáveis de inspiração, expiração e pausa, favorecendo percepção e autorregulação.",
     "href": "../biofeedback-respiratorio.html?percurso=fisioterapia"
    },
    {
     "t": "Biofeedback respiratório — Smartphone",
     "cat": "Respiratório",
     "obj": "Guiar ciclos respiratórios em uma interface adaptada ao smartphone, com tempos ajustáveis de inspiração, expiração e pausa.",
     "href": "../biofeedback-respiratorio-smartphone.html?percurso=fisioterapia"
    },
    {
     "t": "Curva de dissociação da hemoglobina",
     "cat": "Respiratório",
     "obj": "Relacionar PO₂, saturação da hemoglobina e deslocamentos da curva provocados por pH, temperatura e 2,3-BPG.",
     "href": "../curva-dissociacao-hemoglobina.html?percurso=fisioterapia"
    },
    {
     "t": "Ventilação Pulmonar Neonatal",
     "cat": "Respiratório",
     "obj": "Relacionar idade gestacional ao nascimento, idade pós-natal, massa corporal e maturidade pulmonar à mecânica ventilatória neonatal.",
     "href": "../ventilacao-pulmonar-neonatal.html?percurso=fisioterapia",
     "deep": "módulo de aprofundamento",
     "leitura": "../assets/leituras/Ventilacao_Pulmonar_Neonatal_Guia_Visual_Prof_Mario_Nascimento.pdf?v=20260902-2"
    }
   ],
   "sala": {
    "nome": "O Fôlego Perdido",
    "img": "../assets/salas/respiratorio.webp",
    "grande": "../assets/salas/grande/respiratorio.webp",
    "href": "https://drmarionascimento.github.io/fisiologia-em-fuga/#/escape/fisio/respiratorio?origem=site"
   }
  },
  {
   "id": "integracao",
   "num": "05",
   "nome": "Integração cardiorrespiratória",
   "curto": "Integração",
   "desc": "Respostas integradas do coração, pulmões, circulação e metabolismo em diferentes estados fisiológicos.",
   "cel": "capilar com hemácias",
   "mapas": [
    {
     "t": "Integração cardiorrespiratória",
     "src": "../assets/maps/integracao-cardiorrespiratoria.webp"
    }
   ],
   "sims": [
    {
     "t": "Cardiopulmonar integrado",
     "cat": "Integração",
     "obj": "Relacionar retorno venoso, débito cardíaco, consumo de oxigênio, pressões e saturações em diferentes estados fisiológicos.",
     "href": "../cardiopulmonar-integrado.html?percurso=fisioterapia"
    },
    {
     "t": "Fick integrado",
     "cat": "Integração",
     "obj": "Conectar débito cardíaco, conteúdos arterial e venoso de oxigênio, extração tecidual e consumo de O₂.",
     "href": "../fick-integrado-cardiorrespiratorio.html?percurso=fisioterapia"
    },
    {
     "t": "Consumo de O₂ e diferença a–vO₂",
     "cat": "Integração",
     "obj": "Integrar consumo de oxigênio, débito cardíaco, diferença arteriovenosa e valor relativo por massa corporal.",
     "href": "../consumo-o2-debito-cardiaco-diferenca-av.html?percurso=fisioterapia"
    },
    {
     "t": "UTI fisiológica",
     "cat": "Integração",
     "obj": "Plantão de 6 horas: regular água, eletrólitos, circulação, ventilação, ácido-base e rim num único paciente. O monitor mostra o estado; o aluno decide.",
     "href": "uti-fisiologica.html?percurso=fisioterapia",
     "deep": "desafio de fechamento"
    }
   ],
   "sala": {
    "nome": "A Marcha do Oxigênio",
    "img": "../assets/salas/sala-base.webp",
    "grande": "../assets/salas/grande/sala-base.webp",
    "href": "https://drmarionascimento.github.io/fisiologia-em-fuga/#/escape/fisio/integracao?origem=site"
   }
  }
 ],
 "operacao": {
  "nome": "Operação Secreta",
  "sub": "Protocolo Eferente · todas as unidades",
  "img": "../assets/salas/sala-base.webp",
  "grande": "../assets/salas/grande/sala-base.webp",
  "href": "https://drmarionascimento.github.io/fisiologia-em-fuga/#/escape/fisio/protocolo-eferente?origem=site"
 },
 "desafio": {
  "unidade": "integracao",
  "nome": "UTI fisiológica",
  "sub": "desafio de fechamento · integração",
  "img": "../assets/salas/uti-fisiologica.webp",
  "grande": "../assets/salas/grande/uti-fisiologica.webp",
  "href": "uti-fisiologica.html?percurso=fisioterapia"
 }
};
