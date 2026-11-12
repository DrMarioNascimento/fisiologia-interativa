(function () {
  'use strict';

  const unidades = new Map();

  function element(tag, text) {
    const node = document.createElement(tag);
    node.textContent = text;
    return node;
  }

  function button(label, primary = false) {
    const node = element('button', label);
    node.type = 'button';
    node.className = 'btn ' + (primary ? 'btn-primary' : 'btn-ghost');
    return node;
  }

  window.renderTutorPratica = function (curso, eixo, modulos) {
    const root = document.getElementById('pratica-unidade');
    if (!root) return;
    const chave = curso + ':' + eixo;
    const assinatura = modulos.map(modulo => modulo.href + ':' + (modulo.qs || []).length).join('|');
    const salva = unidades.get(chave);
    if (salva?.assinatura === assinatura) {
      if (root.firstElementChild !== salva.details) root.replaceChildren(salva.details);
      return;
    }
    const linhas = [
      ...(curso === 'fisioterapia' && eixo === 'osteoarticular' ? [] : (window.tutorPraticaBanco[eixo] || [])),
      ...(window.tutorPraticaPorCurso[curso]?.[eixo] || [])
    ];
    const banco = linhas.map(([tema, q, correta, primeira, segunda, why], index) => {
      const opts = [primeira, segunda];
      const a = [1, 0, 2, 1, 2, 0][index % 6];
      opts.splice(a, 0, correta);
      return { tema, q, opts, a, why };
    });
    for (const modulo of modulos) {
      for (const item of modulo.qs || []) banco.push({ ...item, tema: modulo.title });
    }

    const details = element('details', '');
    details.className = 'card';
    const title = element('summary', 'Praticar esta unidade · ' + banco.length + ' questões');
    const panel = element('div', '');
    details.append(title, panel);
    root.replaceChildren(details);
    unidades.set(chave, { assinatura, details });

    const review = button('Refazer questões erradas');
    const controls = element('div', '');
    controls.className = 'actions';
    controls.append(review);
    const content = element('div', '');
    panel.append(controls, content);

    const erros = new Set();
    let fila = banco;
    let index = 0;
    function render() {
      review.disabled = !erros.size;
      const item = fila[index];
      if (!item) {
        content.replaceChildren(element('p', erros.size
          ? 'Prática concluída. Você pode refazer as questões erradas.'
          : 'Prática concluída.'));
        return;
      }
      const posicao = element('p', (index + 1) + ' de ' + fila.length);
      const pergunta = element('h2', item.q);
      pergunta.tabIndex = -1;
      const opcoes = element('div', '');
      opcoes.className = 'opts';
      const retorno = element('p', '');
      retorno.className = 'feedback show';
      retorno.setAttribute('role', 'status');
      const next = button('Próxima questão', true);
      next.disabled = true;
      let respondida = false;
      item.opts.forEach((opcao, resposta) => {
        const escolha = button(opcao);
        escolha.addEventListener('click', () => {
          if (respondida) return;
          respondida = true;
          const correto = resposta === item.a;
          if (correto) erros.delete(item);
          else erros.add(item);
          escolha.classList.add(correto ? 'ok' : 'bad');
          retorno.textContent = (correto ? 'Certo. ' : 'Resposta correta: ' + item.opts[item.a] + '. ') + item.why;
          for (const outra of opcoes.children) outra.setAttribute('aria-disabled', 'true');
          next.disabled = false;
          review.disabled = !erros.size;
        });
        opcoes.append(escolha);
      });
      next.addEventListener('click', () => {
        index += 1;
        render();
        content.querySelector('h2, p')?.focus();
      });
      posicao.tabIndex = -1;
      content.replaceChildren(posicao, pergunta, opcoes, retorno, next);
    }
    review.addEventListener('click', () => {
      fila = [...erros];
      index = 0;
      render();
      content.querySelector('h2')?.focus();
    });
    render();
  };

  const recursos = {
    linfatico: {
      titulo: 'Microcirculação e líquidos intersticiais',
      descricao: 'Relacione filtração capilar, interstício e retorno de líquidos.',
      href: 'homeostase-integrada-tricompartimental.html',
      passos: ['Observe plasma, interstício e célula.', 'Compare as forças que influenciam as trocas capilares.', 'Relacione o líquido intersticial ao retorno linfático.'],
      mapa: ['Capilares sanguíneos → líquido intersticial', 'Interstício → capilares e vasos linfáticos', 'Vasos linfáticos → ductos → circulação venosa'],
      temas: /microcircula|compartimento|formaç|edema/i
    },
    urinario: {
      titulo: 'Osmose e líquidos corporais',
      descricao: 'Compare tonicidade e movimento de água entre os compartimentos.',
      href: 'osmose-equilibrio-hidroeletrolitico.html',
      passos: ['Comece na condição isotônica.', 'Altere a solução extracelular.', 'Observe o movimento de água e explique o volume celular.'],
      mapa: ['Água corporal → líquido intracelular e extracelular', 'Tonicidade → movimento de água', 'Sede e ADH → regulação da água corporal'],
      temas: /compartimento|osmolaridade|tonicidade|água/i
    },
    digestorio: {
      titulo: 'Transporte intestinal de glicose',
      descricao: 'Explore o cotransporte de sódio e glicose no epitélio intestinal.',
      href: 'transporte-ativo-secundario-sglt.html',
      passos: ['Identifique o gradiente de sódio.', 'Observe o transporte de glicose.', 'Relacione a bomba ao funcionamento do cotransporte.'],
      mapa: ['Digestão → nutrientes absorvíveis', 'SGLT1 → entrada de sódio e glicose', 'Enterócito → circulação porta'],
      temas: /digestão e absorção|absorção e transporte/i
    },
    reprodutor: {
      titulo: 'Ciclo menstrual e controle hormonal',
      descricao: 'Acompanhe os hormônios e as mudanças ovarianas ao longo do ciclo.',
      href: 'endocrino/ciclo/index.html?modo=ciclo',
      passos: ['Observe as fases do ciclo.', 'Compare estradiol, LH e progesterona.', 'Relacione o pico de LH à ovulação.'],
      mapa: ['Hipotálamo → GnRH', 'Hipófise → FSH e LH', 'Ovário → estradiol e progesterona → feedback'],
      temas: /ciclo ovariano/i
    },
    snp: {
      titulo: 'Neurônio e propagação do sinal',
      descricao: 'Explore como um impulso se propaga ao longo de um neurônio.',
      href: 'neuronio-interativo.html',
      passos: ['Identifique as partes do neurônio.', 'Acompanhe a propagação do sinal.', 'Relacione o impulso às vias aferentes e eferentes.'],
      mapa: ['Receptor → via aferente → sistema nervoso central', 'Sistema nervoso central → via eferente → órgão efetor', 'Informações sensoriais e respostas autonômicas interagem'],
      temas: /organização e vias|receptores e transdução/i
    },
    snc: {
      titulo: 'Da intenção ao movimento',
      descricao: 'Acompanhe a passagem do comando motor até a ação muscular.',
      href: 'da-intencao-ao-movimento.html',
      passos: ['Observe a origem do comando motor.', 'Acompanhe o sinal até o músculo.', 'Relacione a execução ao ajuste do movimento.'],
      mapa: ['Informação sensorial → planejamento motor', 'Comando descendente → músculo → movimento', 'Feedback → cerebelo e redes motoras → ajuste'],
      temas: /controle motor/i
    },
    osteoarticular: {
      titulo: 'Homeostase do cálcio',
      descricao: 'Relacione o osso, o rim e o intestino à regulação do cálcio.',
      href: 'homeostase-do-calcio.html',
      passos: ['Observe os compartimentos de cálcio.', 'Altere o estímulo hormonal disponível.', 'Compare as respostas do osso, rim e intestino.'],
      mapa: ['Cálcio ionizado → paratireoides → PTH', 'PTH → osso e rim; calcitriol → intestino', 'Formação e reabsorção → balanço da matriz óssea'],
      temas: /cálcio|regulação mineral/i
    },
    tegumentar: {
      titulo: 'Pressão e perfusão da pele',
      descricao: 'Compare a influência da pressão externa e da sua duração sobre o tecido.',
      href: 'tutor-modelos.html?eixo=tegumentar',
      passos: ['Comece com pressão baixa.', 'Aumente a pressão externa.', 'Compare uma exposição breve e outra prolongada.'],
      mapa: ['Epiderme → barreira cutânea', 'Derme → vasos, nervos e tecido conjuntivo', 'Lesão → inflamação → formação de tecido → remodelação'],
      temas: /vascularização|imobilidade/i
    },
    termorregulacao: {
      titulo: 'Calor produzido e evaporação',
      descricao: 'Compare atividade e umidade para interpretar o balanço de calor.',
      href: 'tutor-modelos.html?eixo=termorregulacao',
      passos: ['Comece em repouso.', 'Compare com exercício.', 'Altere a umidade e observe a perda por evaporação.'],
      mapa: ['Termorreceptores → hipotálamo', 'Calor → vasodilatação e sudorese', 'Frio → vasoconstrição e tremores'],
      temas: /balanço térmico|exercício e ambiente/i
    }
  };

  function abrirMapaRecurso(recurso) {
    const anterior = document.activeElement;
    const modal = element('div', '');
    modal.className = 'modal';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.setAttribute('aria-label', 'Mapa mental: ' + recurso.titulo);
    const conteudo = element('div', '');
    conteudo.className = 'modal-card';
    const cabecalho = element('div', '');
    cabecalho.className = 'modal-head';
    const titulo = element('h2', 'Mapa mental · ' + recurso.titulo);
    const fechar = button('Fechar');
    cabecalho.append(titulo, fechar);
    const corpo = element('div', '');
    corpo.className = 'modal-body';
    const lista = element('ul', '');
    recurso.mapa.forEach(linha => lista.append(element('li', linha)));
    corpo.append(lista);
    conteudo.append(cabecalho, corpo);
    modal.append(conteudo);
    document.body.append(modal);
    document.body.classList.add('modal-open');
    function encerrar() {
      document.removeEventListener('keydown', teclado);
      modal.remove();
      document.body.classList.remove('modal-open');
      anterior?.focus();
    }
    function teclado(event) {
      if (event.key === 'Escape') encerrar();
    }
    fechar.addEventListener('click', encerrar);
    modal.addEventListener('click', event => { if (event.target === modal) encerrar(); });
    document.addEventListener('keydown', teclado);
    fechar.focus();
  }

  window.renderTutorCardsQuestoes = function (curso, eixo, modulos, root) {
    if (modulos.length) return;
    const recurso = recursos[eixo];
    if (!recurso) return;
    const linhas = [
      ...(curso === 'fisioterapia' && eixo === 'osteoarticular' ? [] : (window.tutorPraticaBanco[eixo] || [])),
      ...(window.tutorPraticaPorCurso[curso]?.[eixo] || [])
    ];
    const relacionadas = linhas.filter(item => recurso.temas.test(item[0])).slice(0, 5);
    const card = element('article', '');
    card.className = 'card';
    const meta = element('span', eixo === 'snp' ? 'Sistema nervoso periférico' : eixo === 'snc' ? 'Sistema nervoso central' : eixo);
    meta.className = 'meta';
    const titulo = element('h2', recurso.titulo);
    const descricao = element('p', recurso.descricao);
    const passos = element('ol', '');
    passos.className = 'steps';
    recurso.passos.forEach(passo => passos.append(element('li', passo)));
    const actions = element('div', '');
    actions.className = 'actions';
    const mapa = button('Ver mapa');
    mapa.addEventListener('click', () => abrirMapaRecurso(recurso));
    const link = element('a', 'Abrir simulador');
    link.className = 'btn btn-ghost';
    const url = new URL(recurso.href, location.href);
    if (curso === 'fisioterapia' && !recurso.href.startsWith('tutor-modelos.html')) url.searchParams.set('percurso', 'fisioterapia');
    link.href = url.href;
    const action = button('Questões do simulador', true);
    action.setAttribute('aria-expanded', 'false');
    const panel = element('div', '');
    panel.className = 'panel';
    action.addEventListener('click', () => {
      const aberto = card.classList.toggle('is-open');
      action.setAttribute('aria-expanded', String(aberto));
    });
    relacionadas.forEach(([tema, pergunta, correta, primeira, segunda, explicacao], numero) => {
      const box = element('div', '');
      box.className = 'q';
      const tituloQuestao = element('b', (numero + 1) + '. ' + pergunta);
      const opcoes = element('div', '');
      opcoes.className = 'opts';
      const retorno = element('p', '');
      retorno.className = 'feedback';
      retorno.setAttribute('role', 'status');
      const ordem = [primeira, segunda];
      ordem.splice([1, 0, 2, 1, 2][numero], 0, correta);
      ordem.forEach(texto => {
        const escolha = button(texto);
        escolha.addEventListener('click', () => {
          const certo = texto === correta;
          for (const outra of opcoes.children) outra.classList.remove('ok', 'bad');
          escolha.classList.add(certo ? 'ok' : 'bad');
          retorno.textContent = (certo ? 'Certo. ' : 'Ainda não. ') + explicacao;
          retorno.classList.add('show');
        });
        opcoes.append(escolha);
      });
      box.append(tituloQuestao, opcoes, retorno);
      panel.append(box);
    });
    actions.append(mapa, link, action);
    card.append(meta, titulo, descricao, passos, actions, panel);
    root.prepend(card);
  };

})();
