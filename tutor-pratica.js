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
  window.renderTutorCardsQuestoes = function (curso, eixo, modulos, root) {
    if (modulos.length) return;
    const linhas = [
      ...(curso === 'fisioterapia' && eixo === 'osteoarticular' ? [] : (window.tutorPraticaBanco[eixo] || [])),
      ...(window.tutorPraticaPorCurso[curso]?.[eixo] || [])
    ];
    if (!linhas.length) return;

    const fragment = document.createDocumentFragment();
    for (let inicio = 0; inicio < linhas.length; inicio += 5) {
      const grupo = linhas.slice(inicio, inicio + 5);
      const card = element('article', '');
      card.className = 'card';
      const meta = element('span', eixo === 'snp' ? 'Sistema nervoso periférico' : eixo === 'snc' ? 'Sistema nervoso central' : eixo.replaceAll('_', ' '));
      meta.className = 'meta';
      const heading = element('h2', 'Questões ' + (inicio + 1) + ' a ' + (inicio + grupo.length));
      const action = button('Responder questões', true);
      action.setAttribute('aria-expanded', 'false');
      const panel = element('div', '');
      panel.className = 'panel';
      action.addEventListener('click', () => {
        const aberto = card.classList.toggle('is-open');
        action.setAttribute('aria-expanded', String(aberto));
      });
      grupo.forEach(([tema, pergunta, correta, primeira, segunda, explicacao], numero) => {
        const box = element('div', '');
        box.className = 'q';
        const titulo = element('b', (inicio + numero + 1) + '. ' + pergunta);
        const opcoes = element('div', '');
        opcoes.className = 'opts';
        const retorno = element('p', '');
        retorno.className = 'feedback';
        retorno.setAttribute('role', 'status');
        const ordem = [primeira, segunda];
        ordem.splice([1, 0, 2, 1, 2, 0][(inicio + numero) % 6], 0, correta);
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
        box.append(titulo, opcoes, retorno);
        panel.append(box);
      });
      card.append(meta, heading, action, panel);
      fragment.append(card);
    }
    root.prepend(fragment);
  };

})();
