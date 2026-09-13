(function () {
  function comOrigem(href, origem) {
    if (!href || href.indexOf("origem=") !== -1) return href;
    return href + (href.indexOf("?") >= 0 ? "&" : "?") + "origem=" + origem;
  }
  function eixoDaBusca(ids) {
    return new URLSearchParams(location.search).get("eixo");
  }
  function gravarEixo(id) {
    const url = new URL(location.href);
    url.searchParams.set("eixo", id);
    history.replaceState(null, "", url);
  }

  if (typeof axes !== "undefined" && typeof renderCards === "function") {
    const ids = axes.map(function (item) { return item.id; });
    const pedido = eixoDaBusca(ids);
    if (ids.indexOf(pedido) !== -1) active = pedido;
    const cardsAntigo = renderCards;
    renderCards = function () {
      cardsAntigo();
      document.querySelectorAll(".escape-card a.btn-primary").forEach(function (link) {
        link.setAttribute("href", comOrigem(link.getAttribute("href"), "site"));
      });
    };
    const eixosAntigo = renderAxes;
    renderAxes = function () {
      eixosAntigo();
      document.querySelectorAll(".axis").forEach(function (botao) {
        botao.addEventListener("click", function () {
          const id = botao.getAttribute("data-id");
          if (id) gravarEixo(id);
        });
      });
    };
    if (document.querySelector("#axes") && document.querySelector("#cards")) {
      renderAxes();
      renderCards();
    }
  }
})();
