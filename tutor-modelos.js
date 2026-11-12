(function () {
  'use strict';
  const modelos = {
    tegumentar: {
      titulo: 'Pressão e perfusão da pele',
      intro: 'Compare o efeito de uma pressão externa sobre a perfusão local em uma condição ilustrativa.',
      controles: [
        { rotulo: 'Pressão externa', opcoes: ['Baixa', 'Elevada'] },
        { rotulo: 'Duração', opcoes: ['Breve', 'Prolongada'] }
      ],
      resultado: (pressao, tempo) => pressao === 'Baixa'
        ? 'Neste modelo, a pressão externa é baixa. A perfusão depende também da pressão interna dos vasos e das condições do tecido.'
        : tempo === 'Breve'
          ? 'A pressão elevada pode reduzir transitoriamente o fluxo em vasos comprimidos. A resposta real depende do tecido e da pressão local.'
          : 'A pressão elevada mantida pode comprometer a perfusão e deformar os tecidos. A vulnerabilidade também depende de cisalhamento, umidade e fatores individuais.'
    },
    termorregulacao: {
      titulo: 'Calor produzido e evaporação',
      intro: 'Compare o efeito da intensidade da atividade e da umidade sobre as demandas térmicas.',
      controles: [
        { rotulo: 'Atividade', opcoes: ['Repouso', 'Exercício'] },
        { rotulo: 'Umidade do ar', opcoes: ['Menor', 'Maior'] }
      ],
      resultado: (atividade, umidade) => {
        const producao = atividade === 'Exercício'
          ? 'O exercício eleva a produção metabólica de calor.'
          : 'Em repouso, a produção metabólica de calor é menor que durante exercício.';
        const perda = umidade === 'Maior'
          ? ' Maior umidade pode limitar a evaporação do suor.'
          : ' Menor umidade pode favorecer a evaporação, dependendo também da ventilação e da roupa.';
        return producao + perda + ' A temperatura corporal resulta do balanço entre produção, ganhos e perdas de calor.';
      }
    }
  };

  const query = new URLSearchParams(location.search);
  const eixo = query.get('eixo');
  const modelo = modelos[eixo];
  const voltar = document.getElementById('voltar');
  voltar.href = 'tutor-fisio.html?eixo=' + encodeURIComponent(eixo || '');
  if (!modelo) {
    document.getElementById('titulo').textContent = 'Modelo não encontrado';
    document.querySelector('.card').hidden = true;
    return;
  }

  document.title = modelo.titulo + ' · Fisiologia Interativa';
  document.getElementById('titulo').textContent = modelo.titulo;
  document.getElementById('intro').textContent = modelo.intro;
  const controles = document.getElementById('controles');
  const resultado = document.getElementById('resultado');
  const seletores = modelo.controles.map(config => {
    const label = document.createElement('label');
    label.textContent = config.rotulo;
    const select = document.createElement('select');
    config.opcoes.forEach(valor => select.add(new Option(valor, valor)));
    label.append(select);
    controles.append(label);
    return select;
  });
  function atualizar() {
    resultado.textContent = modelo.resultado(...seletores.map(select => select.value));
  }
  seletores.forEach(select => select.addEventListener('change', atualizar));
  atualizar();
})();
