let pedido = [];

function adicionarItem(nome, preco) {
  pedido.push({ nome, preco });
  showToast(`${nome} adicionado ao pedido!`);
  atualizarResumo();
}

function atualizarResumo() {
  const lista = document.getElementById("lista-pedido");
  const totalEl = document.getElementById("total");
  lista.innerHTML = "";

  let total = 0;
  pedido.forEach((item, index) => {
    total += item.preco;
    const li = document.createElement("li");
    li.innerHTML = `
      ${item.nome} - R$ ${item.preco.toFixed(2)}
      <button class="btn-remover" data-index="${index}" aria-label="Remover ${item.nome}">Remover</button>
    `;
    lista.appendChild(li);
  });

  totalEl.innerText = `Total: R$ ${total.toFixed(2)}`;

  lista.querySelectorAll('.btn-remover').forEach(btn => {
    btn.onclick = () => {
      const idx = Number(btn.getAttribute('data-index'));
      removerItem(idx);
    };
  });
}

function removerItem(index) {
  if (index >= 0 && index < pedido.length) {
    pedido.splice(index, 1);
    atualizarResumo();
  }
}

function finalizarPedido() {
  if (pedido.length === 0) {
    showToast("Adicione itens ao pedido antes de finalizar.");
    return;
  }

  const modal = document.getElementById("modal-confirmacao");
  modal.classList.add("show");

  const btnConfirmar = document.getElementById("btn-confirmar");
  const btnCancelar = document.getElementById("btn-cancelar");

  // Remove event listeners antigos para evitar acúmulo
  btnConfirmar.replaceWith(btnConfirmar.cloneNode(true));
  btnCancelar.replaceWith(btnCancelar.cloneNode(true));

  const novoConfirmar = document.getElementById("btn-confirmar");
  const novoCancelar = document.getElementById("btn-cancelar");

  novoCancelar.onclick = () => {
    modal.classList.remove("show");
  };

  novoConfirmar.onclick = () => {
    enviarPedidoWhatsApp();
    modal.classList.remove("show");
  };
}

function enviarPedidoWhatsApp() {
  const tipo = document.getElementById("tipo").value;
  const enderecoInput = document.getElementById("endereco");
  const endereco = enderecoInput ? enderecoInput.value.trim() : "";
  const pagamentoSelect = document.getElementById("pagamento");
  const pagamento = pagamentoSelect ? pagamentoSelect.value : "";

  let mensagem = "*Pedido Fulanos Hamburgueria*%0A";

  pedido.forEach(item => {
    mensagem += `• ${item.nome} - R$ ${item.preco.toFixed(2)}%0A`;
  });

  const total = pedido.reduce((soma, item) => soma + item.preco, 0);
  mensagem += `%0ATotal: R$ ${total.toFixed(2)}%0A`;

  if (tipo === "entrega") {
    if (!endereco) {
      alert("Por favor, preencha o endereço para entrega.");
      return;
    }
    mensagem += `Tipo de pedido: *ENTREGA*%0A📍 Endereço: ${encodeURIComponent(endereco)}%0A`;
  } else {
    mensagem += "Tipo de pedido: *RETIRADA*%0A";
  }

  let pagamentoTexto = "";
  switch (pagamento) {
    case "dinheiro":
      pagamentoTexto = "Dinheiro";
      break;
    case "cartao":
      pagamentoTexto = "Cartão";
      break;
    case "pix":
      pagamentoTexto = "PIX";
      break;
    default:
      pagamentoTexto = "Não especificado";
  }
  mensagem += `Forma de pagamento: *${pagamentoTexto}*%0A`;

  const numero = "5512997481692";
  const link = `https://wa.me/${numero}?text=${mensagem}`;

  showToast("Redirecionando para o WhatsApp...");
  
  // Abre o WhatsApp na mesma aba, funciona melhor no celular
  window.location.href = link;

  limparPedido();
}

function limparPedido() {
  pedido = [];
  atualizarResumo();
}

function showToast(msg) {
  const toast = document.getElementById("toast");
  toast.textContent = msg;
  toast.classList.add("show");

  if (toast.hideTimeout) clearTimeout(toast.hideTimeout);

  toast.hideTimeout = setTimeout(() => {
    toast.classList.remove("show");
  }, 2500);
}

// Mostrar campo de endereço ao escolher ENTREGA
document.getElementById("tipo").addEventListener("change", function () {
  const campoEndereco = document.getElementById("campo-endereco");
  campoEndereco.style.display = this.value === "entrega" ? "block" : "none";
});
