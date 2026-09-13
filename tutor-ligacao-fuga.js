(function () {
  function comOrigem(href, origem) {
    if (!href || href.indexOf("origem=") !== -1) return href;
    return href + (href.indexOf("?") >= 0 ? "&" : "?") + "origem=" + origem;
  }
  function idsDisponiveis() {
    if (typeof axes !== "undefined") return axes.map(function (item) { return item.id; });
    if (typeof axisOrder !== "undefined") return axisOrder.slice();
    return [];
  }
  function gravarEixo(id) {
    const url = new URL(location.href);
    url.searchParams.set("eixo", id);
    history.replaceState(null, "", url);
  }

  const ids = idsDisponiveis();
  if (!ids.length || typeof renderCards !== "function") return;

  const pedido = new URLSearchParams(location.search).get("eixo");
  if (ids.indexOf(pedido) !== -1) active = pedido;

  const cardsAntigo = renderCards;
  renderCards = function () {
    cardsAntigo();
    document.querySelectorAll(".escape-card a.btn-primary").forEach(function (link) {
      link.setAttribute("href", comOrigem(link.getAttribute("href"), "site"));
    });
  };

  if (typeof renderAxes === "function") {
    const eixosAntigo = renderAxes;
    renderAxes = function () {
      eixosAntigo();
      document.querySelectorAll(".axis").forEach(function (botao) {
        botao.addEventListener("click", function () {
          const id = botao.getAttribute("data-id") || botao.getAttribute("data-axis");
          if (id) gravarEixo(id);
        });
      });
    };
  }

  if (document.querySelector("#axes") && document.querySelector("#cards")) {
    if (typeof renderAxes === "function") renderAxes();
    renderCards();
  }
})();
