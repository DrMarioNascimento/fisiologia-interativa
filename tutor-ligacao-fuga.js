(function () {
  function comOrigem(href, origem) {
    if (!href || href.indexOf("origem=") !== -1) return href;
    return href + (href.indexOf("?") >= 0 ? "&" : "?") + "origem=" + origem;
  }
  function cursoAtual() {
    if (location.pathname.endsWith("/tutor-fisio.html") || new URLSearchParams(location.search).get("percurso") === "fisioterapia") {
      return "fisio";
    }
    return "ef";
  }
  function urlOperacao() {
    return "https://drmarionascimento.github.io/fisiologia-em-fuga/#/escape/" + cursoAtual() + "/protocolo-eferente?origem=site";
  }
  function idsDisponiveis() {
    if (typeof axes !== "undefined" && Array.isArray(axes)) return axes.map(function (item) { return item.id; });
    if (typeof axisOrder !== "undefined") return axisOrder.slice();
    return [];
  }
  function gravarEixo(id) {
    const url = new URL(location.href);
    url.searchParams.set("eixo", id);
    history.replaceState(null, "", url);
  }
  function garantirEstilo() {
    if (document.getElementById("operacao-secreta-style")) return;
    const style = document.createElement("style");
    style.id = "operacao-secreta-style";
    style.textContent = [
      ".escape-card .actions{width:100%;align-items:center;}",
      ".btn-secret{margin-left:auto;color:#fff;border:1px solid #7a1b1b;background:linear-gradient(180deg,#e35b5b 0%,#c62828 48%,#8e1616 100%);box-shadow:inset 0 1px 0 rgba(255,255,255,.35),inset 0 -5px 9px rgba(80,0,0,.28),0 10px 22px rgba(140,20,20,.28);}",
      ".btn-secret:hover{filter:brightness(1.06);}",
      ".operacao-modal{position:fixed;inset:0;z-index:80;display:grid;place-items:center;padding:16px;background:rgba(8,16,18,.72);}",
      ".operacao-modal[hidden]{display:none!important;}",
      ".operacao-dialog{width:min(100%,420px);padding:22px 20px;border-radius:22px;border:1px solid #f3d27a;background:linear-gradient(165deg,#1a3a34,#10242c);color:#f7fbfb;box-shadow:0 8px 0 #07161c,0 24px 50px rgba(0,0,0,.45);}",
      ".operacao-dialog h2{margin:0 0 10px;font-size:1.15rem;}",
      ".operacao-dialog p{margin:0 0 16px;color:#d7e4e4;}",
      ".operacao-dialog .actions{justify-content:flex-end;}"
    ].join("");
    document.head.appendChild(style);
  }
  function garantirModal() {
    if (document.getElementById("operacaoModal")) return;
    const modal = document.createElement("div");
    modal.id = "operacaoModal";
    modal.className = "operacao-modal";
    modal.hidden = true;
    modal.innerHTML = '<div class="operacao-dialog" role="dialog" aria-modal="true" aria-labelledby="operacaoTitulo"><h2 id="operacaoTitulo">Operação Secreta</h2><p>Só entre aqui se você estudou o conteúdo e quer encarar um desafio!</p><p><b>Estudou o conteúdo?</b></p><div class="actions"><button class="btn btn-ghost" type="button" data-operacao="nao">Não</button><a class="btn btn-secret" data-operacao="sim" href="#">Sim, entrar no escape</a></div></div>';
    document.body.appendChild(modal);
    modal.addEventListener("click", function (event) {
      if (event.target === modal || event.target.getAttribute("data-operacao") === "nao") {
        event.preventDefault();
        modal.hidden = true;
      }
    });
  }
  function abrirModal() {
    garantirModal();
    const modal = document.getElementById("operacaoModal");
    modal.querySelector('[data-operacao="sim"]').setAttribute("href", urlOperacao());
    modal.hidden = false;
  }
  function marcarBotoes() {
    document.querySelectorAll(".escape-card .actions").forEach(function (bar) {
      if (bar.querySelector("[data-operacao-secreta]")) return;
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "btn btn-secret";
      btn.setAttribute("data-operacao-secreta", "1");
      btn.textContent = "Operação Secreta";
      btn.addEventListener("click", abrirModal);
      bar.appendChild(btn);
    });
  }

  garantirEstilo();
  garantirModal();

  const ids = idsDisponiveis();
  if (typeof renderCards === "function") {
    const cardsAntigo = renderCards;
    renderCards = function () {
      cardsAntigo();
      document.querySelectorAll(".escape-card a.btn-primary").forEach(function (link) {
        link.setAttribute("href", comOrigem(link.getAttribute("href"), "site"));
      });
      marcarBotoes();
    };
  }

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

  if (ids.length && typeof renderAxes === "function") {
    const pedido = new URLSearchParams(location.search).get("eixo");
    if (ids.indexOf(pedido) !== -1) active = pedido;
  }

  if (document.querySelector("#axes") && document.querySelector("#cards") && typeof renderCards === "function") {
    if (typeof renderAxes === "function") renderAxes();
    renderCards();
  } else {
    marcarBotoes();
  }
})();
